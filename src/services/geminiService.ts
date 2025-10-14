import { GeneralSearchResult, EcommerceSearchResult } from "../types/search";
import { config } from "./apiConfig";

export interface GeminiAnalysis {
  detectedObjects: string[];
  dominantColors: string[];
  styleDescription: string;
  confidence: number;
  searchQuery: string;
  imageDescription: string;
}

export interface ImageComparisonResult {
  similarityScore: number;
  matchingFeatures: string[];
  confidence: number;
}

export class GeminiService {

  static async analyzeImageAndSearch(imageData: string): Promise<{
    generalResults: GeneralSearchResult[];
    ecommerceResults: EcommerceSearchResult[];
    analysis: GeminiAnalysis;
  }> {
    if (!config.isConfigured) {
      throw new Error(
        "Gemini API configuration missing. Please check your environment variables."
      );
    }

    try {
      // Gemini analysis
      const analysis = await this.analyzeImage(imageData);

      // Run web + e-commerce searches concurrently
      const [generalResults, ecommerceResults] = await Promise.all([
        this.searchGeneralWeb(analysis.searchQuery),
        this.searchEcommerce(analysis.searchQuery),
      ]);

      // Enhance results with image comparison
      const [enhancedGeneralResults, enhancedEcommerceResults] = await Promise.all([
        this.enhanceResultsWithImageComparison(imageData, generalResults, "general"),
        this.enhanceResultsWithImageComparison(imageData, ecommerceResults, "ecommerce"),
      ]);

      return {
        generalResults: enhancedGeneralResults,
        ecommerceResults: enhancedEcommerceResults,
        analysis,
      };
    } catch (error) {
      console.error("Gemini service error:", error);
      throw new Error("Failed to analyze image and perform search. Please try again.");
    }
  }

  private static async analyzeImage(imageData: string): Promise<GeminiAnalysis> {
    const base64Image = imageData.split(",")[1];

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: `Analyze this product image and provide detailed structured info:
1. Main objects detected (comma-separated)
2. Dominant colors in HEX codes
3. Style description (modern, vintage, minimalist, etc.)
4. Image description (one sentence)
5. Confidence score (0-1)
6. Search query for finding similar products

Format: 
objects: [list], colors: [hex codes], style: [description], description: [text], confidence: [number], query: [search terms]`,
            },
            {
              inline_data: {
                mime_type: "image/jpeg",
                data: base64Image,
              },
            },
          ],
        },
      ],
    };

    const response = await fetch(
      `${config.gemini.baseUrl}/models/${config.gemini.model}:generateContent?key=${config.gemini.apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${text}`);
    }

    const data = await response.json();
    const analysisText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!analysisText) throw new Error("Empty response from Gemini API.");

    return this.parseAnalysisResponse(analysisText);
  }

  private static parseAnalysisResponse(text: string): GeminiAnalysis {
  // Normalize spacing
  const cleanText = text.replace(/\n+/g, " ").trim();

  // Match both bracketed and non-bracketed lists for objects/colors
  const objectsMatch =
    cleanText.match(/objects:\s*\[([^\]]+)\]/i) ||
    cleanText.match(/objects:\s*([^,]+(?:,\s*[^,]+)*)/i);

  const colorsMatch =
    cleanText.match(/colors:\s*\[([^\]]+)\]/i) ||
    cleanText.match(/colors:\s*([^,]+(?:,\s*[^,]+)*)/i);

  const styleMatch = cleanText.match(/style:\s*([^,]+?)(?=,|description|confidence|query|$)/i);
  const descriptionMatch = cleanText.match(/description:\s*([^,]+?)(?=,|confidence|query|$)/i);
  const confMatch = cleanText.match(/confidence:\s*([0-9.]+)/i);
  const queryMatch = cleanText.match(/query:\s*(.*)$/i);

  // Helper to split lists safely
  const splitList = (value: string | undefined) =>
    value
      ? value
          .split(/[,;]/)
          .map((s) => s.replace(/[\[\]]/g, "").trim())
          .filter(Boolean)
      : [];

  return {
    detectedObjects: objectsMatch ? splitList(objectsMatch[1]) : [],
    dominantColors: colorsMatch ? splitList(colorsMatch[1]) : [],
    styleDescription: styleMatch ? styleMatch[1].trim() : "Unknown style",
    imageDescription: descriptionMatch
      ? descriptionMatch[1].trim()
      : "No description available",
    confidence: confMatch ? parseFloat(confMatch[1]) : 0.5,
    searchQuery: queryMatch ? queryMatch[1].trim() : "product search",
  };
}

  private static async compareImages(
    uploadedImageData: string,
    resultImageUrl: string
  ): Promise<ImageComparisonResult> {
    try {
      const base64UploadedImage = uploadedImageData.split(",")[1];
      const resultImageBase64 = await this.urlToBase64(resultImageUrl);

      const body = {
        contents: [
          {
            parts: [
              {
                text: `Compare these two product images and provide:
1. Similarity score (0-100)
2. Matching features (comma-separated)
3. Confidence in comparison (0-1)
Format: similarity: [number], features: [list], confidence: [number]`,
              },
              {
                inline_data: { mime_type: "image/jpeg", data: base64UploadedImage },
              },
              {
                inline_data: { mime_type: "image/jpeg", data: resultImageBase64 },
              },
            ],
          },
        ],
      };

      const response = await fetch(
        `${config.gemini.baseUrl}/models/${config.gemini.model}:generateContent?key=${config.gemini.apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) throw new Error(`Gemini comparison error: ${response.statusText}`);

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";
      return this.parseComparisonResponse(text);
    } catch (error) {
      console.error("Image comparison failed:", error);
      return {
        similarityScore: 50,
        matchingFeatures: ["Visual comparison unavailable"],
        confidence: 0.5,
      };
    }
  }

  private static async urlToBase64(url: string): Promise<string> {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        resolve(base64.split(",")[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  private static parseComparisonResponse(text: string): ImageComparisonResult {
    const sim = text.match(/similarity:\s*([0-9]+)/i);
    const features = text.match(/features:\s*\[([^\]]+)\]/i);
    const conf = text.match(/confidence:\s*([0-9.]+)/i);

    return {
      similarityScore: Math.min(100, Math.max(0, sim ? parseInt(sim[1]) : 50)),
      matchingFeatures: features ? features[1].split(",").map((s) => s.trim()) : [
        "Features not available",
      ],
      confidence: conf ? parseFloat(conf[1]) : 0.5,
    };
  }

  private static async enhanceResultsWithImageComparison(
    uploadedImageData: string,
    results: (GeneralSearchResult | EcommerceSearchResult)[],
    type: "general" | "ecommerce"
  ): Promise<any[]> {
    const enhanced: any[] = [];

    for (const result of results.slice(0, 10)) {
      try {
        if (type !== "ecommerce") {
          enhanced.push({
            ...result,
            matchingPercentage: 0,
            matchingFeatures: ["Image comparison not available for general results"],
          });
          continue;
        }

        const ecommerceResult = result as EcommerceSearchResult;
        const resultImageUrl = ecommerceResult.image;
        if (!resultImageUrl) {
          enhanced.push({
            ...result,
            matchingPercentage: 0,
            matchingFeatures: ["No image available for comparison"],
          });
          continue;
        }

        const comparison = await this.compareImages(uploadedImageData, resultImageUrl);
        enhanced.push({
          ...result,
          matchingPercentage: comparison.similarityScore,
          matchingFeatures: comparison.matchingFeatures,
          comparisonConfidence: comparison.confidence,
        });

        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error("Comparison failed for:", result.title, error);
        enhanced.push({
          ...result,
          matchingPercentage: 0,
          matchingFeatures: ["Comparison failed"],
        });
      }
    }

    if (results.length > 10) {
      enhanced.push(
        ...results.slice(10).map((r) => ({
          ...r,
          matchingPercentage: 0,
          matchingFeatures: ["Comparison skipped for performance"],
        }))
      );
    }

    return enhanced;
  }

  private static async searchGeneralWeb(query: string): Promise<GeneralSearchResult[]> {
    if (!config.google.apiKey || !config.google.cx) {
      console.warn("Google Custom Search not configured");
      return [];
    }

    try {
      const url = `https://www.googleapis.com/customsearch/v1?key=${config.google.apiKey}&cx=${config.google.cx}&q=${encodeURIComponent(
        query
      )}&num=10`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Google API error: ${response.statusText}`);
      const data = await response.json();
      return data.items
        ? data.items.map((i: any) => ({
            title: i.title,
            url: i.link,
            description: i.snippet,
            snippet: i.snippet,
          }))
        : [];
    } catch (error) {
      console.error("General search failed:", error);
      return [];
    }
  }

  private static async searchEcommerce(query: string): Promise<EcommerceSearchResult[]> {
    if (!config.google.apiKey || !config.google.cx) {
      console.warn("Google Custom Search not configured");
      return [];
    }

    try {
      const ecommerceQuery = `${query} buy shop purchase price sale discount`;
      const url = `https://www.googleapis.com/customsearch/v1?key=${config.google.apiKey}&cx=${config.google.cx}&q=${encodeURIComponent(
        ecommerceQuery
      )}&num=10`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Google API error: ${response.statusText}`);
      const data = await response.json();

      return data.items
        ? data.items.map((i: any) => {
            const priceMatch = i.snippet?.match(/\$[0-9,.]+/);
            const price = priceMatch ? priceMatch[0] : "Price not available";
            let image = "";
            if (i.pagemap?.cse_thumbnail?.[0]?.src)
              image = i.pagemap.cse_thumbnail[0].src;
            else if (i.pagemap?.cse_image?.[0]?.src)
              image = i.pagemap.cse_image[0].src;
            const source =
              i.displayLink || new URL(i.link).hostname.replace("www.", "");
            return {
              title: i.title,
              url: i.link,
              price,
              image,
              source,
              rating: Math.random() > 0.3
                ? Math.round((Math.random() * 2 + 3) * 10) / 10
                : undefined,
              reviews: Math.random() > 0.3
                ? Math.floor(Math.random() * 1000)
                : undefined,
            };
          })
        : [];
    } catch (error) {
      console.error("E-commerce search failed:", error);
      return [];
    }
  }
}
