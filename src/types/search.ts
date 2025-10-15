export interface GeneralSearchResult {
  title: string;
  url: string;
  description: string;
  matchingPercentage?: number;
  matchingFeatures?: string[];
  comparisonConfidence?: number;
}

export interface EcommerceSearchResult {
  title: string;
  url: string;
  price: string;
  image: string;
  source: string;
  rating?: number;
  reviews?: number;
  matchingPercentage?: number;
  matchingFeatures?: string[];
  comparisonConfidence?: number;
}
