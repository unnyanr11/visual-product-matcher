/**
 * FeatureMatch component - Shows which visual features matched between images
 */
import { Check, X } from 'lucide-react';

interface FeatureMatchProps {
  matchingFeatures: string[];
  totalFeatures: number;
  className?: string;
}

export default function FeatureMatch({ matchingFeatures, totalFeatures, className = '' }: FeatureMatchProps) {
  const matchPercentage = Math.round((matchingFeatures.length / totalFeatures) * 100);

  return (
    <div className={`bg-gray-50 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-900">Feature Matching</h4>
        <span className="text-xs font-semibold text-green-600">{matchPercentage}% match</span>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-gray-600">
          <span>Matching features:</span>
          <span>{matchingFeatures.length}/{totalFeatures}</span>
        </div>
        
        {matchingFeatures.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {matchingFeatures.map((feature, index) => (
              <div key={index} className="flex items-center space-x-1 px-2 py-1 bg-green-100 rounded-full">
                <Check className="h-3 w-3 text-green-600" />
                <span className="text-xs text-green-800">{feature}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center space-x-2 text-gray-500">
            <X className="h-4 w-4" />
            <span className="text-xs">No specific features matched</span>
          </div>
        )}
      </div>
    </div>
  );
}
