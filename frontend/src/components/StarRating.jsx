import { Star } from 'lucide-react';

const StarRating = ({ rating = 0, max = 5, size = 'sm', interactive = false, onChange }) => {
  const sizeMap = { sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-7 h-7' };
  const iconSize = sizeMap[size] || sizeMap.sm;

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => {
        const filled = i < Math.round(rating);
        return (
          <Star
            key={i}
            className={`${iconSize} ${filled ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
            onClick={() => interactive && onChange && onChange(i + 1)}
          />
        );
      })}
      {!interactive && (
        <span className="ml-1 text-sm text-gray-500 font-medium">{Number(rating).toFixed(1)}</span>
      )}
    </div>
  );
};

export default StarRating;
