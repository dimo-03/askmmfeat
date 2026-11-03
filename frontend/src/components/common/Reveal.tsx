import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';

export type RevealAnimation =
  | 'fade-in'
  | 'fade-in-down'
  | 'fade-in-up'
  | 'fade-in-left'
  | 'fade-in-right'
  | 'zoom-in'
  | 'zoom-in-down'
  | 'zoom-in-up'
  | 'zoom-in-left'
  | 'zoom-in-right'
  | 'bounce-in'
  | 'bounce-in-down'
  | 'bounce-in-up'
  | 'bounce-in-left'
  | 'bounce-in-right'
  | 'slide-in-down'
  | 'slide-in-up'
  | 'slide-in-left'
  | 'slide-in-right'
  | 'rotate-in'
  | 'rotate-in-down-left'
  | 'rotate-in-down-right'
  | 'rotate-in-up-left'
  | 'rotate-in-up-right'
  | 'roll-in'
  | 'light-speed-in'
  | 'flip-in-x';

interface RevealProps {
  children: ReactNode;
  animation?: RevealAnimation;
  delay?: number;
  duration?: number;
  className?: string;
}

export default function Reveal({
  children,
  animation = 'fade-in-up',
  delay = 0,
  duration = 0.8,
  className = '',
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (!('IntersectionObserver' in window)) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const style = {
    animationDelay: `${delay}ms`,
    '--anim-duration': `${duration}s`,
  } as CSSProperties;

  return (
    <div
      ref={ref}
      style={style}
      className={`${visible ? `anim anim-${animation}` : 'reveal-pending'} ${className}`}
    >
      {children}
    </div>
  );
}
