import { Star, Zap, AlertCircle } from 'lucide-react';
import { Product } from '../types/product';
import FeatureMatch from './FeatureMatch';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  //Get similarity color based on percentage
  const getSimilarityColor = (similarity: number) => {
    if (similarity >= 90) return 'text-green-600 bg-green-50 border-green-200';
    if (similarity >= 80) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (similarity >= 70) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (similarity >= 50) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const similarityColor = getSimilarityColor(product.similarity);
  const hasValidComparison = product.similarity > 0;

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden group">
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://pub-cdn.sider.ai/u/U0Z6HZJGK2R/web-coder/68ed93c44a1e06be3425cd92/resource/0652359b-09dc-4b30-95bf-e82d5a5cb695.jpg';
          }}
        />
        
        {/* AI Similarity Badge */}
        <div className="absolute top-3 left-3">
          {hasValidComparison ? (
            <div className={`px-2 py-1 rounded-full text-xs font-semibold border ${similarityColor} flex items-center space-x-1`}>
              <Zap className="h-3 w-3" />
              <span>{product.similarity}% Match</span>
            </div>
          ) : (
            <div className="px-2 py-1 rounded-full text-xs font-semibold border border-gray-300 text-gray-500 bg-gray-50 flex items-center space-x-1">
              <AlertCircle className="h-3 w-3" />
              <span>No Match</span>
            </div>
          )}
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900 line-clamp-1 flex-1">
            {product.name}
          </h3>
        </div>

        {/* Feature Matching */}
        {product.matchingFeatures && product.matchingFeatures.length > 0 && (
          <FeatureMatch 
            matchingFeatures={product.matchingFeatures}
            totalFeatures={8}
            className="mb-3"
          />
        )}

        {/* Product Info */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-bold text-gray-900">
              {product.name}
            </div>
            <div className="text-sm text-gray-500">
              {product.category}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
