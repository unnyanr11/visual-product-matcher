import { useState } from "react";
import { Slider } from "../components/ui/slider";

interface FilterPanelProps {
  onFilterChange: (filters: any) => void;
  className?: string;
  showHeader?: boolean;
}

export default function FilterPanel({
  onFilterChange,
  className = "",
  showHeader = true,
}: FilterPanelProps) {
  const [filters, setFilters] = useState({
    similarity: [0, 100], // default range
  });

  // Update filters and notify parent
  const updateFilters = (newFilters: any) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    onFilterChange(updated);
  };

  // Reset filters
  const resetFilters = () => {
    const reset = { similarity: [0, 100] };
    setFilters(reset);
    onFilterChange(reset);
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm p-6 ${className}`}>
      {showHeader && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
      )}

      <div className="space-y-6">
        {/* Similarity Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Similarity Score Range: {filters.similarity[0]}% – {filters.similarity[1]}%
          </label>
          <Slider
            value={filters.similarity}
            onValueChange={(value) => updateFilters({ similarity: value })}
            min={0}
            max={100}
            step={5}
            className="w-full"
          />
        </div>

        {/* Reset Filters */}
        <button
          onClick={resetFilters}
          className="w-full py-2 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
}
