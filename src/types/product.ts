/**
 * Product type definitions for the Visual Product Matcher
 */
export interface Product {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
  similarity: number;
  tags: string[];
}
