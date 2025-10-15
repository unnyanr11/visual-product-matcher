import { useState, useMemo } from "react";
import { Filter, ShoppingBag } from "lucide-react";
import ImageUpload from "../components/ImageUpload";
import AnalysisPanel from "../components/AnalysisPanel";
import FilterPanel from "../components/FilterPanel";
import { GeminiService } from "../services/geminiService";
import { GeneralSearchResult, EcommerceSearchResult } from "../types/search";
import SearchResultsTabs from "../components/SearchResultsTabs";

export default function Home() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [searchResults, setSearchResults] = useState<{
    general: GeneralSearchResult[];
    ecommerce: EcommerceSearchResult[];
  }>({ general: [], ecommerce: [] });

  const [filteredResults, setFilteredResults] = useState<{
    general: GeneralSearchResult[];
    ecommerce: EcommerceSearchResult[];
  }>({ general: [], ecommerce: [] });

  const [analysisData, setAnalysisData] = useState<any>(null);

  // Show More control
  const [visibleGeneral, setVisibleGeneral] = useState(10);
  const [visibleEcommerce, setVisibleEcommerce] = useState(10);

  // Handle image upload/reset
  const handleImageUpload = (imageData: string) => {
    setUploadedImage(imageData);
    setSearchResults({ general: [], ecommerce: [] });
    setFilteredResults({ general: [], ecommerce: [] });
    setAnalysisData(null);
  };

  const handleImageRemove = () => {
    setUploadedImage(null);
    setSearchResults({ general: [], ecommerce: [] });
    setFilteredResults({ general: [], ecommerce: [] });
    setAnalysisData(null);
  };

  // Run AI analysis & search
  const handleSearch = async (imageData: string) => {
    setIsLoading(true);
    setIsAnalyzing(true);

    try {
      let imageToAnalyze = imageData;
      if (/^https?:\/\//i.test(imageData)) {
        const response = await fetch(imageData, { mode: "cors" });
        const blob = await response.blob();
        const reader = new FileReader();
        imageToAnalyze = await new Promise<string>((resolve, reject) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      }

      const results = await GeminiService.analyzeImageAndSearch(imageToAnalyze);
      const sortedGeneral = [...results.generalResults].sort(
        (a, b) => (b.matchingPercentage ?? 0) - (a.matchingPercentage ?? 0)
      );
      const sortedEcommerce = [...results.ecommerceResults].sort(
        (a, b) => (b.matchingPercentage ?? 0) - (a.matchingPercentage ?? 0)
      );

      setSearchResults({ general: sortedGeneral, ecommerce: sortedEcommerce });
      setFilteredResults({ general: sortedGeneral, ecommerce: sortedEcommerce });
      setAnalysisData(results.analysis);
      setVisibleGeneral(10);
      setVisibleEcommerce(10);
    } catch (error) {
      console.error("Search failed:", error);
      setSearchResults({ general: [], ecommerce: [] });
      setFilteredResults({ general: [], ecommerce: [] });
      setAnalysisData(null);
    } finally {
      setIsLoading(false);
      setIsAnalyzing(false);
    }
  };

  // Filters
  const handleFilterChange = (filters: { similarity: number[] }) => {
    const [minSim, maxSim] = filters.similarity;
    const filterAndSort = (arr: any[]) =>
      arr
        .filter(
          (item) =>
            (item.matchingPercentage ?? 0) >= minSim &&
            (item.matchingPercentage ?? 0) <= maxSim
        )
        .sort(
          (a, b) => (b.matchingPercentage ?? 0) - (a.matchingPercentage ?? 0)
        );

    setFilteredResults({
      general: filterAndSort(searchResults.general),
      ecommerce: filterAndSort(searchResults.ecommerce),
    });
    setVisibleGeneral(10);
    setVisibleEcommerce(10);
  };

  // Local Filtering by Object Tag
  const handleObjectClick = (object: string) => {
    const lowerObj = object.toLowerCase();

    const filterByObject = (arr: any[]) =>
      arr.filter((item) =>
        [
          item.title?.toLowerCase(),
          item.description?.toLowerCase(),
          item.snippet?.toLowerCase(),
          (item.matchingFeatures || []).join(" ").toLowerCase(),
        ].some((field) => field?.includes(lowerObj))
      );

    setFilteredResults({
      general: filterByObject(searchResults.general),
      ecommerce: filterByObject(searchResults.ecommerce),
    });
    setVisibleGeneral(10);
    setVisibleEcommerce(10);
  };

  // Visible results
  const generalVisible = useMemo(
    () => filteredResults.general.slice(0, visibleGeneral),
    [filteredResults.general, visibleGeneral]
  );
  const ecommerceVisible = useMemo(
    () => filteredResults.ecommerce.slice(0, visibleEcommerce),
    [filteredResults.ecommerce, visibleEcommerce]
  );

  // Show More handlers
  const showMoreGeneral = () => setVisibleGeneral((prev) => prev + 10);
  const showMoreEcommerce = () => setVisibleEcommerce((prev) => prev + 10);

  // UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="h-8 w-8 text-indigo-600" />
              <h1 className="text-2xl font-bold text-gray-900">
                Visual Product Matcher
              </h1>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-1 space-y-6">
            <ImageUpload
              onImageUpload={handleImageUpload}
              onImageRemove={handleImageRemove}
              onSearch={handleSearch}
            />
            {uploadedImage && (
              <AnalysisPanel
                imageData={uploadedImage}
                isAnalyzing={isAnalyzing}
                onStartAnalysis={handleSearch}
              />
            )}
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2">
            {!uploadedImage ? (
              <div className="text-center py-16">
                <ShoppingBag className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Upload an Image to Search
                </h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  Upload or paste an image URL to find visually similar products
                  using Gemini AI.
                </p>
              </div>
            ) : isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Analyzing with Gemini AI...</p>
                  <p className="text-sm text-gray-500">
                    Processing your image and searching for visual matches
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* AI Analysis Results */}
                {analysisData && (
                  <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 overflow-visible">
                    <h3 className="text-sm font-medium text-blue-900 mb-3">
                      AI Analysis Results
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8 text-sm text-blue-900 whitespace-normal break-words">
                      {/* Objects */}
                      <div>
                        <span className="font-semibold text-blue-700">
                          Objects:{" "}
                        </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {analysisData.detectedObjects.length > 0 && (
  <button
    onClick={() => handleObjectClick(analysisData.detectedObjects[0])}
    className="bg-blue-100 hover:bg-blue-200 text-blue-800 text-xs px-2 py-0.5 rounded-full transition-colors cursor-pointer"
  >
    {analysisData.detectedObjects[0]}
  </button>
)}
                        </div>
                      </div>
                      {/* Style */}
                      <div>
                        <span className="font-semibold text-blue-700">
                          Style:{" "}
                        </span>
                        <span className="block">
                          {analysisData.styleDescription}
                        </span>
                      </div>
                      {/* Confidence */}
                      <div>
                        <span className="font-semibold text-blue-700">
                          Confidence:{" "}
                        </span>
                        <span className="block">
                          {(analysisData.confidence * 100).toFixed(1)}%
                        </span>
                      </div>
                      {/* Search Query */}
                      <div>
                        <span className="font-semibold text-blue-700">
                          Search Query:{" "}
                        </span>
                        <span className="block">{analysisData.searchQuery}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Filter Panel */}
                {showFilters && (
                  <div className="mb-6">
                    <FilterPanel
                      onFilterChange={handleFilterChange}
                      className="animate-in fade-in duration-300"
                    />
                  </div>
                )}

                {/* Results Tabs */}
                <SearchResultsTabs
                  generalResults={generalVisible}
                  ecommerceResults={ecommerceVisible}
                />

                {/* Show More Buttons */}
                {(filteredResults.general.length > visibleGeneral ||
                  filteredResults.ecommerce.length > visibleEcommerce) && (
                  <div className="flex justify-center gap-4 mt-8">
                    {filteredResults.general.length > visibleGeneral && (
                      <button
                        onClick={showMoreGeneral}
                        className="px-5 py-2 text-sm font-medium bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                      >
                        Show More General Results
                      </button>
                    )}
                    {filteredResults.ecommerce.length > visibleEcommerce && (
                      <button
                        onClick={showMoreEcommerce}
                        className="px-5 py-2 text-sm font-medium bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                      >
                        Show More E-commerce Results
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
