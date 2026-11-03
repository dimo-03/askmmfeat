
import { useEffect, useRef, useState } from 'react';
import Reveal from '@/components/common/Reveal';
import handprints from '../../assets/handprints.png';
import impactgirl from '../../assets/impactgirl.png';

type AnimatedNumberProps = {
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  decimals?: number;
};

function AnimatedNumber({
  value,
  suffix = '',
  prefix = '',
  duration = 2200,
  decimals = 0,
}: AnimatedNumberProps) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const numberRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = numberRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;

    const startTime = performance.now();

    let frameId = 0;

    const animate = (currentTime: number) => {
      const progress = Math.min(
        (currentTime - startTime) / duration,
        1
      );

      // Smooth ease-out animation
      const easedProgress = 1 - Math.pow(1 - progress, 4);

      const currentValue = easedProgress * value;

      setCount(currentValue);

      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      } else {
        setCount(value);
      }
    };

    frameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frameId);
  }, [started, value, duration]);

  const formattedNumber = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(count);

  return (
    <span ref={numberRef} aria-label={`${prefix}${value}${suffix}`}>
      {prefix}{formattedNumber}{suffix}
    </span>
  );
}

const stats = [
  {
    value: 110000,
    suffix: '+',
    label: 'Children Indirectly Benefitted',
    color: 'text-lime-500',
    position: 'top',
  },
  {
    value: 3800,
    suffix: '+',
    label: 'Children Directly Benefitted',
    color: 'text-red-700',
    position: 'left-top',
  },
  {
    value: 99.5,
    suffix: '%',
    decimals: 1,
    label: 'SSC Pass Rate',
    color: 'text-red-700',
    position: 'right-top',
  },
  {
    value: 7,
    suffix: ' Schools',
    label: 'English-medium municipal schools, pre-school to Grade 10.',
    color: 'text-red-700',
    position: 'left-bottom',
  },
  {
    value: 2700,
    suffix: '+',
    label: 'Alumni',
    color: 'text-red-700',
    position: 'right-bottom',
  },
  {
    value: 7000,
    suffix: '+',
    label: 'Teachers and teacher educators developed.',
    color: 'text-lime-500',
    position: 'bottom',
  },
];

function ImpactItem({
  value,
  suffix,
  label,
  color,
  decimals = 0,
  className = '',
}: {
  value: number;
  suffix: string;
  label: string;
  color: string;
  decimals?: number;
  className?: string;
}) {
  return (
    <div className={`relative z-10 text-center ${className}`}>
      <h3
        className={`font-heading text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-[64px] ${color}`}
      >
        <AnimatedNumber
          value={value}
          suffix={suffix}
          decimals={decimals}
        />
      </h3>

      <p className="mx-auto mt-1 max-w-xs text-sm font-medium leading-relaxed text-gray-800 sm:text-base">
        {label}
      </p>
    </div>
  );
}

export default function ImpactStatsSection() {
  return (
    <section className="relative isolate overflow-hidden bg-[#fffefa] py-16 sm:py-20 lg:py-16">

      {/* Handprints Background */}
      <div
        className="absolute inset-0 -z-10 bg-cover bg-center bg-no-repeat opacity-70"
        style={{ backgroundImage: `url(${handprints})` }}
        aria-hidden="true"
      />

      {/* White Overlay */}
      <div className="absolute inset-0 -z-10 bg-white/40" />

      <div className="container-x relative mx-auto">

        {/* Heading */}
        <Reveal animation="fade-in-down">
          <div className="mb-10">
            <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/80 px-4 py-2 text-xs font-medium text-gray-700">
              <span className="h-2 w-2 rounded-full bg-lime-500" />
              Our Impact
            </span>

            <h2 className="mt-4 font-heading text-3xl font-extrabold leading-tight text-red-800 sm:text-4xl lg:text-[42px]">
              Changing Futures. Building Communities.
            </h2>

            <p className="mt-4 text-base text-gray-800">
              Real change. Real results.
            </p>
          </div>
        </Reveal>

        {/* Impact Layout */}
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-x-5 gap-y-9 sm:grid-cols-2 lg:grid-cols-3 lg:grid-rows-[auto_auto_auto_auto] lg:gap-x-8 lg:gap-y-3">

          {/* Top Center */}
          <div className="order-1 lg:col-start-2 lg:row-start-1">
            <ImpactItem
              {...stats[0]}
              className="animate-in fade-in duration-1000"
            />
          </div>

          {/* Left Top */}
          <div className="order-2 lg:col-start-1 lg:row-start-2 lg:pr-2">
            <ImpactItem
              {...stats[1]}
              className="lg:text-right"
            />
          </div>

          {/* Central Image */}
          <div className="order-3 flex items-center justify-center lg:col-start-2 lg:row-span-2 lg:row-start-2">
            <Reveal animation="zoom-in">
              <div className="relative flex items-center justify-center">
                <img
                  src={impactgirl}
                  alt="Students participating in educational activities"
                  className="w-full max-w-[320px] object-contain drop-shadow-md sm:max-w-[380px] lg:max-w-[410px]"
                />
              </div>
            </Reveal>
          </div>

          {/* Right Top */}
          <div className="order-4 lg:col-start-3 lg:row-start-2 lg:pl-2">
            <ImpactItem
              {...stats[2]}
              className="lg:text-left"
            />
          </div>

          {/* Left Bottom */}
          <div className="order-5 lg:col-start-1 lg:row-start-3 lg:pr-2">
            <ImpactItem
              {...stats[3]}
              className="lg:text-right"
            />
            <div className="mt-3 flex justify-center lg:justify-end">
              <span className="h-0.5 w-10 bg-red-300" />
            </div>
          </div>

          {/* Right Bottom */}
          <div className="order-6 lg:col-start-3 lg:row-start-3 lg:pl-2">
            <ImpactItem
              {...stats[4]}
              className="lg:text-left"
            />
            <div className="mt-2 flex justify-center gap-1 lg:justify-start">
              <span className="h-2.5 w-2.5 rounded-full bg-lime-300" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-300" />
              <span className="h-2.5 w-2.5 rounded-full bg-red-300" />
            </div>
          </div>

          {/* Bottom Center */}
          <div className="order-7 lg:col-start-2 lg:row-start-4">
            <ImpactItem {...stats[5]} />
          </div>

        </div>

        {/* Impact Story Button */}
        <Reveal animation="fade-in-up">
          <div className="mt-8 flex justify-center">
            <a
              href="/gallery"
              className="group inline-flex items-center gap-3 rounded-md bg-yellow-400 px-7 py-3.5 font-semibold text-gray-900 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:bg-yellow-300 hover:shadow-lg"
            >
              <span>♥</span>
              Full Impact Story
              <span className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1">
                ↗
              </span>
            </a>
          </div>
        </Reveal>

      </div>
    </section>
  );
}
