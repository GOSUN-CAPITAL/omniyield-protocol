"use client";

import React, { useId } from "react";

interface SparklineChartProps {
  data: number[];
  isPositive?: boolean;
  width?: number;
  height?: number;
  strokeWidth?: number;
  className?: string;
  showGradient?: boolean;
}

export default function SparklineChart({
  data,
  isPositive = true,
  width = 240,
  height = 70,
  strokeWidth = 2,
  className = "w-full h-full",
  showGradient = true,
}: SparklineChartProps) {
  const gradientId = useId();

  if (!data || data.length < 2) {
    return <div className={`h-[70px] ${className}`} />;
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  // Margin padding so the stroke doesn't get cut off at the edges
  const paddingX = 4;
  const paddingTop = 6;
  const paddingBottom = 4;
  const innerWidth = width - paddingX * 2;
  const innerHeight = height - paddingTop - paddingBottom;

  // Map data to coordinates
  const points = data.map((val, idx) => {
    const x = paddingX + (idx / (data.length - 1)) * innerWidth;
    const y = paddingTop + innerHeight - ((val - min) / range) * innerHeight;
    return { x, y };
  });

  // Build smooth Bezier curve path
  let pathD = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? 0 : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    pathD += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }

  // Build closed area path down to height
  const areaD = `${pathD} L ${points[points.length - 1].x.toFixed(1)} ${height} L ${points[0].x.toFixed(1)} ${height} Z`;

  // Color tokens
  const strokeColor = isPositive ? "#10B981" : "#F43F5E"; // Emerald vs Rose (near.com style)
  const stopColor = isPositive ? "#10B981" : "#F43F5E";

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stopColor} stopOpacity={0.28} />
          <stop offset="85%" stopColor={stopColor} stopOpacity={0.04} />
          <stop offset="100%" stopColor={stopColor} stopOpacity={0.0} />
        </linearGradient>
      </defs>

      {/* Gradient Fill Area */}
      {showGradient && (
        <path d={areaD} fill={`url(#${gradientId})`} />
      )}

      {/* Smooth Sparkline Stroke */}
      <path
        d={pathD}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

