/**
 * AnalysisPanel component - Displays AI analysis results for uploaded images
 * Shows feature matching, confidence scores, and detection results
 */
import { useState, useEffect } from 'react';
import { Zap, Target, Palette, Scan } from 'lucide-react';

interface AnalysisResult {
  dominantColors: string[];
  detectedObjects: string[];
  styleAnalysis: string;
  qualityScore: number;
}

interface AnalysisPanelProps {
  imageData: string | null;
  isAnalyzing: boolean;
  className?: string;
}

interface AnalysisPanelProps {
  imageData: string | null;
  isAnalyzing: boolean;
  onStartAnalysis?: (imageData: string) => void;
  className?: string;
}

export default function AnalysisPanel({ imageData, isAnalyzing, onStartAnalysis, className = '' }: AnalysisPanelProps) {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    if (imageData && !isAnalyzing) {
      // TODO: Replace with your actual AI service integration
      console.log('Image ready for AI analysis:', imageData);
      setAnalysis(null); // Clear any previous analysis
    } else {
      setAnalysis(null);
    }
  }, [imageData, isAnalyzing]);

  const handleStartAnalysis = () => {
    if (imageData && onStartAnalysis) {
      onStartAnalysis(imageData);
    }
  };

  if (!imageData) return null;

  return (
    <div className={`bg-white rounded-xl shadow-sm p-6 ${className}`}>
      <div className="flex items-center space-x-2 mb-4">
        <Zap className="h-5 w-5 text-indigo-600" />
        <h3 className="text-lg font-semibold text-gray-900">AI Analysis</h3>
      </div>

      {isAnalyzing ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Processing image...</p>
            <p className="text-xs text-gray-500">Analyzing with Gemini AI...</p>
          </div>
        </div>
      ) : (
        <div className="text-center py-6">
          <p className="text-sm text-gray-600 mb-4">Ready for AI analysis with Gemini</p>
          <button
            onClick={handleStartAnalysis}
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white text-sm font-medium rounded-lg shadow-sm hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 transition-colors"
          >
            <Zap className="h-4 w-4" />
            Start AI Analysis
          </button>
          <p className="text-xs text-gray-500 mt-3">Analyze image features and find similar products</p>
        </div>
      )}
    </div>
  );
}
