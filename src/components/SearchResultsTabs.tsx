import { useState } from 'react';
import { Globe, ShoppingBag, Zap, AlertCircle } from 'lucide-react';
import { GeneralSearchResult, EcommerceSearchResult } from '../types/search';

interface SearchResultsTabsProps {
  generalResults: GeneralSearchResult[];
  ecommerceResults: EcommerceSearchResult[];
  className?: string;
}

export default function SearchResultsTabs({ 
  generalResults, 
  ecommerceResults, 
  className = '' 
}: SearchResultsTabsProps) {
  const [activeTab, setActiveTab] = useState<'general' | 'ecommerce'>('general');

  return (
    <div className={`bg-white rounded-xl shadow-sm ${className}`}>
      {/* Tabs Header */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('general')}
            className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'general'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Globe className="h-4 w-4" />
            <span>General Search ({generalResults.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('ecommerce')}
            className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'ecommerce'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <ShoppingBag className="h-4 w-4" />
            <span>E-commerce ({ecommerceResults.length})</span>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'general' && (
          <GeneralResultsList results={generalResults} />
        )}
        
        {activeTab === 'ecommerce' && (
          <EcommerceResultsList results={ecommerceResults} />
        )}
      </div>
    </div>
  );
}

//Get matching color based on percentage
function getMatchingColor(percentage: number): string {
  if (percentage >= 90) return 'text-green-600 bg-green-50 border-green-200';
  if (percentage >= 80) return 'text-blue-600 bg-blue-50 border-blue-200';
  if (percentage >= 70) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
  if (percentage >= 50) return 'text-orange-600 bg-orange-50 border-orange-200';
  return 'text-red-600 bg-red-50 border-red-200';
}

// General search results list component with actual matching percentages
function GeneralResultsList({ results }: { results: GeneralSearchResult[] }) {
  if (results.length === 0) {
    return (
      <div className="text-center py-8">
        <Globe className="mx-auto h-12 w-12 text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No General Results</h3>
        
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {results.map((result, index) => {
        const matchingPercentage = result.matchingPercentage || 0;
        const matchingColor = getMatchingColor(matchingPercentage);
        const hasComparison = result.matchingPercentage !== undefined;
        
        return (
          <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <a 
                  href={result.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block"
                >
                  <h4 className="text-lg font-medium text-indigo-600 hover:text-indigo-700 mb-2">
                    {result.title}
                  </h4>
                </a>
              </div>
              {hasComparison ? (
                <div className={`ml-4 px-3 py-1 rounded-full text-xs font-semibold border ${matchingColor} flex items-center space-x-1`}>
                  <Zap className="h-3 w-3" />
                  <span>{matchingPercentage}% Match</span>
                </div>
              ) : (
                <div className="ml-4 px-3 py-1 rounded-full text-xs font-semibold border border-gray-300 text-gray-500 bg-gray-50 flex items-center space-x-1">
                  <AlertCircle className="h-3 w-3" />
                  <span>No Image</span>
                </div>
              )}
            </div>
            
            <p className="text-sm text-gray-600 mb-2">{result.description}</p>
            
            
            {result.matchingFeatures && result.matchingFeatures.length > 0 && (
              <div className="mt-3">
                <p className="text-xs text-gray-500 mb-1">Matching Features:</p>
                <div className="flex flex-wrap gap-1">
                  {result.matchingFeatures.slice(0, 3).map((feature, idx) => (
                    <span key={idx} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      {feature}
                    </span>
                  ))}
                  {result.matchingFeatures.length > 3 && (
                    <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                      +{result.matchingFeatures.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}
            
            <div className="mt-2">
              <span className="text-xs text-gray-400">{new URL(result.url).hostname}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

//E-commerce results list component with actual matching percentages
function EcommerceResultsList({ results }: { results: EcommerceSearchResult[] }) {
  if (results.length === 0) {
    return (
      <div className="text-center py-8">
        <ShoppingBag className="mx-auto h-12 w-12 text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No E-commerce Results</h3>
        <p className="text-gray-500">
          Integrate with e-commerce APIs like Amazon, Google Shopping, or Shopify to display products.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {results.map((result, index) => {
        const matchingPercentage = result.matchingPercentage || 0;
        const matchingColor = getMatchingColor(matchingPercentage);
        const hasComparison = result.matchingPercentage !== undefined && result.matchingPercentage > 0;
        
        return (
          <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1 min-w-0">
                <a 
                  href={result.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block"
                >
                  <h4 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">
                    {result.title}
                  </h4>
                </a>
              </div>
              {hasComparison ? (
                <div className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold border ${matchingColor} flex items-center space-x-1 flex-shrink-0`}>
                  <Zap className="h-3 w-3" />
                  <span>{matchingPercentage}%</span>
                </div>
              ) : (
                <div className="ml-2 px-2 py-1 rounded-full text-xs font-semibold border border-gray-300 text-gray-500 bg-gray-50 flex items-center space-x-1 flex-shrink-0">
                  <AlertCircle className="h-3 w-3" />
                  <span>No Match</span>
                </div>
              )}
            </div>
            
            <div className="flex space-x-4">
              <img 
                src={result.image} 
                alt={result.title}
                className="w-20 h-20 object-cover rounded-lg"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://pub-cdn.sider.ai/u/U0Z6HZJGK2R/web-coder/68ed93c44a1e06be3425cd92/resource/f51f6e8e-fec7-4585-ba8b-fb49569cff15.jpg';
                }}
              />
              <div className="flex-1">
                <p className="text-lg font-semibold text-indigo-600 mb-1">{result.price}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">{result.source}</span>
                  {result.rating && (
                    <div className="flex items-center space-x-1">
                      <span className="text-sm text-yellow-600">★ {result.rating}</span>
                      {result.reviews && (
                        <span className="text-xs text-gray-500">({result.reviews})</span>
                      )}
                    </div>
                  )}
                </div>
                
                {result.matchingFeatures && result.matchingFeatures.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-1">Features:</p>
                    <div className="flex flex-wrap gap-1">
                      {result.matchingFeatures.slice(0, 2).map((feature, idx) => (
                        <span key={idx} className="inline-block bg-green-100 text-green-800 text-xs px-1 py-0.5 rounded">
                          {feature}
                        </span>
                      ))}
                      {result.matchingFeatures.length > 2 && (
                        <span className="inline-block bg-gray-100 text-gray-600 text-xs px-1 py-0.5 rounded">
                          +{result.matchingFeatures.length - 2}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
