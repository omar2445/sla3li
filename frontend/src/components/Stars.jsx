import { useState } from 'react';
import { Star } from 'lucide-react';

// Display-only when onRate is absent; interactive star picker when provided.
export default function Stars({ value = 0, count, size = 14, onRate }) {
  const [hover, setHover] = useState(0);
  const shown = hover || Math.round(value);

  return (
    <span className="inline-flex items-center gap-0.5" dir="ltr">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          size={size}
          className={`${i <= shown ? 'text-amber-400 fill-amber-400' : 'text-slate-300'} ${onRate ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
          onMouseEnter={onRate ? () => setHover(i) : undefined}
          onMouseLeave={onRate ? () => setHover(0) : undefined}
          onClick={onRate ? () => onRate(i) : undefined}
        />
      ))}
      {value > 0 && !onRate && <span className="text-xs text-slate-500 ml-1">{Number(value).toFixed(1)}{count !== undefined ? ` (${count})` : ''}</span>}
    </span>
  );
}
