/**
 * Slider component for range selection
 * Custom implementation since we cannot install new packages
 */
import { useState } from 'react';

interface SliderProps {
  value: number[];
  onValueChange: (value: number[]) => void;
  min: number;
  max: number;
  step: number;
  className?: string;
}

export function Slider({ value, onValueChange, min, max, step, className = '' }: SliderProps) {
  const [isDragging, setIsDragging] = useState(false);

  /**
   * Calculate percentage for slider position
   */
  const getPercentage = (val: number) => {
    return ((val - min) / (max - min)) * 100;
  };

  /**
   * Handle slider change
   */
  const handleChange = (newValue: number, index: number) => {
    const newValues = [...value];
    newValues[index] = Math.max(min, Math.min(max, newValue));
    
    // Ensure values are in correct order for range sliders
    if (newValues.length > 1) {
      if (index === 0) {
        newValues[0] = Math.min(newValues[0], newValues[1] - step);
      } else {
        newValues[1] = Math.max(newValues[1], newValues[0] + step);
      }
    }
    
    onValueChange(newValues);
  };

  /**
   * Handle mouse/touch events for drag interaction
   */
  const handlePointerDown = (index: number) => (e: React.PointerEvent) => {
    setIsDragging(true);
    const slider = e.currentTarget.parentElement;
    if (!slider) return;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const rect = slider.getBoundingClientRect();
      const percentage = Math.max(0, Math.min(1, (moveEvent.clientX - rect.left) / rect.width));
      const newValue = min + percentage * (max - min);
      const steppedValue = Math.round(newValue / step) * step;
      handleChange(steppedValue, index);
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
    };

    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
  };

  return (
    <div className={`relative h-6 ${className}`}>
      {/* Track */}
      <div className="absolute top-1/2 left-0 right-0 h-2 bg-gray-200 rounded-full transform -translate-y-1/2" />
      
      {/* Active Range */}
      {value.length > 1 && (
        <div 
          className="absolute top-1/2 h-2 bg-indigo-600 rounded-full transform -translate-y-1/2"
          style={{
            left: `${getPercentage(value[0])}%`,
            right: `${100 - getPercentage(value[1])}%`
          }}
        />
      )}

      {/* Thumbs */}
      {value.map((val, index) => (
        <div
          key={index}
          className={`absolute top-1/2 w-6 h-6 bg-white border-2 border-indigo-600 rounded-full transform -translate-y-1/2 -translate-x-1/2 cursor-pointer shadow-sm hover:shadow-md transition-shadow ${
            isDragging ? 'shadow-lg scale-110' : ''
          }`}
          style={{ left: `${getPercentage(val)}%` }}
          onPointerDown={handlePointerDown(index)}
        />
      ))}
    </div>
  );
}
