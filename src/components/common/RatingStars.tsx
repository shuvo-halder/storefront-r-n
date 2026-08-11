import React from 'react';
import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating: number;
  count?: number;
  size?: number;
  showNumber?: boolean;
}

export const RatingStars: React.FC<RatingStarsProps> = ({ 
  rating, 
  count, 
  size = 14, 
  showNumber = true 
}) => {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.4;

  return (
    <div className="flex items-center gap-1.5 text-xs">
      <div className="flex items-center text-amber-400">
        {[...Array(5)].map((_, i) => {
          const isFilled = i < fullStars;
          const isHalf = i === fullStars && hasHalf;

          return (
            <Star
              key={i}
              size={size}
              className={`${
                isFilled
                  ? 'fill-amber-400 text-amber-400'
                  : isHalf
                  ? 'fill-amber-400/50 text-amber-400'
                  : 'text-slate-200 fill-slate-100'
              }`}
            />
          );
        })}
      </div>
      {showNumber && (
        <span className="font-semibold text-slate-700 ml-0.5">
          {rating.toFixed(1)}
        </span>
      )}
      {count !== undefined && (
        <span className="text-slate-400">({count})</span>
      )}
    </div>
  );
};
