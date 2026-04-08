
"use client";

import React from "react";

interface CircularProgressProps {
  current: number;
  total: number;
  size?: number;
}

export function CircularProgress({ current, total, size = 64 }: CircularProgressProps) {
  const percentage = (current / total) * 100;
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth="4"
          fill="transparent"
          className="text-secondary"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#8BC34A"
          strokeWidth="4"
          fill="transparent"
          strokeDasharray={circumference}
          style={{ strokeDashoffset: offset }}
          strokeLinecap="round"
          className="circular-progress"
        />
      </svg>
      <div className="absolute flex flex-col items-center leading-none">
        <span className="text-xs font-bold">{current}/{total}</span>
      </div>
    </div>
  );
}
