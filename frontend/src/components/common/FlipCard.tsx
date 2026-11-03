import type { ReactNode } from 'react';

interface FlipCardProps {
  front: ReactNode;
  back: ReactNode;
  className?: string;
  compact?: boolean;
}

export default function FlipCard({ front, back, className = '', compact = false }: FlipCardProps) {
  return (
    <div className={`group h-full [perspective:1200px] ${className}`}>
      <div className={`relative h-full transition-transform duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)] group-focus-within:[transform:rotateY(180deg)] ${
        compact ? 'min-h-[13rem] md:min-h-[18rem]' : 'min-h-[29rem] md:min-h-[22rem]'
      }`}>
        <div className="absolute inset-0 [backface-visibility:hidden]">{front}</div>
        <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]">{back}</div>
      </div>
    </div>
  );
}
