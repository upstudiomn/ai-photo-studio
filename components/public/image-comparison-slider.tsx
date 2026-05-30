"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowLeftRight } from "lucide-react";

type ImageComparisonSliderProps = {
  beforeImage: string;
  afterImage: string;
  beforeAlt?: string;
  afterAlt?: string;
};

export function ImageComparisonSlider({
  beforeImage,
  afterImage,
  beforeAlt = "Before image comparison",
  afterAlt = "After image comparison",
}: ImageComparisonSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    handleMove(e.clientX);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    if (e.touches[0]) {
      handleMove(e.touches[0].clientX);
    }
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      handleMove(e.clientX);
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      if (e.touches[0]) {
        handleMove(e.touches[0].clientX);
      }
    };

    const onMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
      window.addEventListener("touchmove", onTouchMove, { passive: true });
      window.addEventListener("touchend", onMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onMouseUp);
    };
  }, [isDragging]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      setSliderPosition((prev) => Math.max(0, prev - 5));
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      setSliderPosition((prev) => Math.min(100, prev + 5));
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      className="relative w-full max-w-[440px] aspect-[4/5] mx-auto overflow-hidden rounded-[20px] border border-[var(--line)] bg-[var(--muted-surface)] cursor-ew-resize select-none shadow-[0_8px_30px_rgba(79,111,82,0.05)]"
    >
      {/* Floating indicators always visible at z-20 (never clipped) */}
      <div className="absolute left-4 top-4 z-20 pointer-events-none rounded-full bg-[var(--primary)]/90 backdrop-blur-md px-3.5 py-1.5 text-[10px] font-extrabold text-white tracking-widest uppercase shadow-[0_4px_12px_rgba(111,143,114,0.3)] border border-white/20">
        After (AI)
      </div>
      <div className="absolute right-4 top-4 z-20 pointer-events-none rounded-full bg-black/60 backdrop-blur-md px-3.5 py-1.5 text-[10px] font-extrabold text-white tracking-widest uppercase shadow-[0_4px_12px_rgba(0,0,0,0.15)] border border-white/10">
        Before
      </div>

      {/* Before Image (underneath) */}
      <div className="absolute inset-0">
        <Image
          src={beforeImage}
          alt={beforeAlt}
          fill
          sizes="(max-width: 768px) 100vw, 440px"
          priority
          className="object-cover grayscale pointer-events-none"
        />
      </div>

      {/* After Image (clipped from right using bulletproof inset) */}
      <div
        className="absolute inset-0 z-10 overflow-hidden"
        style={{
          clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
        }}
      >
        <Image
          src={afterImage}
          alt={afterAlt}
          fill
          sizes="(max-width: 768px) 100vw, 440px"
          priority
          className="object-cover saturate-125 pointer-events-none"
        />
      </div>

      {/* Divider Bar & Pulsing Handle */}
      <div
        role="slider"
        tabIndex={0}
        aria-valuenow={Math.round(sliderPosition)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Image comparison slider"
        onKeyDown={handleKeyDown}
        className="absolute top-0 bottom-0 z-30 w-1 bg-white cursor-ew-resize -translate-x-1/2 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
        style={{ left: `${sliderPosition}%` }}
      >
        {/* Hover/Pulsing Indicator */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-12 rounded-full bg-white shadow-xl border border-[var(--line)] flex items-center justify-center handle-pulse text-[var(--primary-dark)] hover:scale-105 active:scale-95 transition-transform duration-200">
          <ArrowLeftRight size={18} className="stroke-[2.5]" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
