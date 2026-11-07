"use client";

import React, { useState, useId, useMemo } from "react";
import { Zap, ShieldCheck } from "lucide-react";

interface DataPoint {
  date: string;
  price: number;
  apy: number;
  tvl: number;
  event?: string;
}

// 1. Timeframe Data Sets for All-Weather Vault
const DATA_AW_1D: DataPoint[] = [
  { date: "00:00", price: 1.0618, apy: 16.35, tvl: 8.58 },
  { date: "04:00", price: 1.0620, apy: 16.38, tvl: 8.58 },
  { date: "08:00", price: 1.0622, apy: 16.42, tvl: 8.59, event: "Ondo USDY Daily Yield Accrued" },
  { date: "12:00", price: 1.0624, apy: 16.39, tvl: 8.59 },
  { date: "16:00", price: 1.0626, apy: 16.40, tvl: 8.60, event: "US Equity Close & Rebalance" },
  { date: "20:00", price: 1.0627, apy: 16.40, tvl: 8.60 },
  { date: "Live", price: 1.0628, apy: 16.40, tvl: 8.60, event: "Current Active Epoch" },
];

const DATA_AW_1W: DataPoint[] = [
  { date: "Oct 27", price: 1.0542, apy: 16.20, tvl: 8.25 },
  { date: "Oct 28", price: 1.0558, apy: 16.32, tvl: 8.32, event: "Nasdaq 100 Tech Dividend Capture" },
  { date: "Oct 29", price: 1.0575, apy: 16.28, tvl: 8.40 },
  { date: "Oct 30", price: 1.0592, apy: 16.45, tvl: 8.48 },
  { date: "Oct 31", price: 1.0608, apy: 16.38, tvl: 8.52, event: "PAXG Physical Gold Inflation Surge" },
  { date: "Nov 01", price: 1.0620, apy: 16.40, tvl: 8.58 },
  { date: "Nov 02", price: 1.0628, apy: 16.40, tvl: 8.60, event: "Bridgewater Risk Parity Steady" },
];

const DATA_AW_1M: DataPoint[] = [
  { date: "Oct 02", price: 1.0000, apy: 14.10, tvl: 5.20 },
  { date: "Oct 06", price: 1.0084, apy: 15.30, tvl: 5.90, event: "Tech Equities (QQQ) Bull Surge" },
  { date: "Oct 10", price: 1.0175, apy: 16.80, tvl: 6.60, event: "Physical Gold Inflation Surge (+4.2%)" },
  { date: "Oct 14", price: 1.0268, apy: 17.20, tvl: 7.20 },
  { date: "Oct 18", price: 1.0360, apy: 16.50, tvl: 7.80, event: "Ondo USDY Dividend Coupon Inflow" },
  { date: "Oct 22", price: 1.0450, apy: 15.90, tvl: 8.10 },
  { date: "Oct 26", price: 1.0542, apy: 16.80, tvl: 8.30, event: "Macro Risk Parity 4-Pillar Balancing" },
  { date: "Oct 30", price: 1.0598, apy: 16.60, tvl: 8.50 },
  { date: "Nov 02", price: 1.0628, apy: 16.40, tvl: 8.60, event: "Active Bridgewater Parity Epoch" },
];

const DATA_AW_3M: DataPoint[] = [
  { date: "Aug 05", price: 0.9650, apy: 13.80, tvl: 3.20 },
  { date: "Aug 20", price: 0.9820, apy: 14.20, tvl: 4.10, event: "Genesis Macro Allocation" },
  { date: "Sep 05", price: 1.0000, apy: 14.90, tvl: 5.20 },
  { date: "Sep 20", price: 1.0240, apy: 15.80, tvl: 6.50 },
  { date: "Oct 05", price: 1.0410, apy: 16.40, tvl: 7.60, event: "Federal Reserve Rate Strategy Shift" },
  { date: "Oct 20", price: 1.0550, apy: 16.50, tvl: 8.20 },
  { date: "Nov 02", price: 1.0628, apy: 16.40, tvl: 8.60, event: "Sharpe Ratio 3.82 Peak" },
];

const DATA_AW_ALL: DataPoint[] = [
  { date: "Jun 01", price: 0.9100, apy: 12.50, tvl: 1.50 },
  { date: "Jul 01", price: 0.9420, apy: 13.40, tvl: 2.40 },
  { date: "Aug 01", price: 0.9750, apy: 14.10, tvl: 3.80 },
  { date: "Sep 01", price: 1.0050, apy: 15.20, tvl: 5.50 },
  { date: "Oct 01", price: 1.0420, apy: 16.10, tvl: 7.40 },
  { date: "Nov 02", price: 1.0628, apy: 16.40, tvl: 8.60, event: "All-Time High $1.0628" },
];

// 2. Timeframe Data Sets for USDC Vault
const DATA_USDC_1D: DataPoint[] = [
  { date: "00:00", price: 1.0478, apy: 11.80, tvl: 12.42 },
  { date: "06:00", price: 1.0479, apy: 11.82, tvl: 12.43 },
  { date: "12:00", price: 1.0480, apy: 11.85, tvl: 12.44, event: "RHEA Lending Compounding Epoch" },
  { date: "18:00", price: 1.0481, apy: 11.84, tvl: 12.44 },
  { date: "Live", price: 1.0482, apy: 11.84, tvl: 12.45, event: "Dynamic Supply Queue Active" },
];

const DATA_USDC_1W: DataPoint[] = [
  { date: "Oct 27", price: 1.0412, apy: 11.60, tvl: 12.10 },
  { date: "Oct 28", price: 1.0428, apy: 11.75, tvl: 12.20 },
  { date: "Oct 29", price: 1.0442, apy: 11.70, tvl: 12.28, event: "Ondo USDY Instant Buffer Refill" },
  { date: "Oct 30", price: 1.0456, apy: 11.82, tvl: 12.35 },
  { date: "Oct 31", price: 1.0468, apy: 11.84, tvl: 12.40 },
  { date: "Nov 01", price: 1.0478, apy: 11.84, tvl: 12.44 },
  { date: "Nov 02", price: 1.0482, apy: 11.84, tvl: 12.45, event: "0% Bad Debt Liquidation Margin" },
];

const DATA_USDC_1M: DataPoint[] = [
  { date: "Oct 02", price: 1.0000, apy: 9.20, tvl: 8.50 },
  { date: "Oct 06", price: 1.0062, apy: 10.45, tvl: 9.10 },
  { date: "Oct 10", price: 1.0125, apy: 12.80, tvl: 9.80, event: "RHEA Lending Borrow Surge" },
  { date: "Oct 14", price: 1.0191, apy: 13.88, tvl: 10.40 },
  { date: "Oct 18", price: 1.0258, apy: 13.50, tvl: 11.00 },
  { date: "Oct 22", price: 1.0326, apy: 11.20, tvl: 11.50, event: "Autonomous Supply Queue Rebalance" },
  { date: "Oct 26", price: 1.0398, apy: 11.84, tvl: 12.00 },
  { date: "Oct 30", price: 1.0452, apy: 12.10, tvl: 12.20 },
  { date: "Nov 02", price: 1.0482, apy: 11.84, tvl: 12.45, event: "Current Active Epoch" },
];

const DATA_USDC_3M: DataPoint[] = [
  { date: "Aug 05", price: 0.9700, apy: 8.80, tvl: 5.50 },
  { date: "Aug 20", price: 0.9850, apy: 9.50, tvl: 6.80 },
  { date: "Sep 05", price: 1.0000, apy: 10.20, tvl: 8.20, event: "Meta-Vault V1 Mainnet Deployment" },
  { date: "Sep 20", price: 1.0180, apy: 11.40, tvl: 9.80 },
  { date: "Oct 05", price: 1.0320, apy: 11.80, tvl: 11.20 },
  { date: "Oct 20", price: 1.0420, apy: 11.84, tvl: 12.10 },
  { date: "Nov 02", price: 1.0482, apy: 11.84, tvl: 12.45, event: "High Efficiency Compounding" },
];

const DATA_USDC_ALL: DataPoint[] = [
  { date: "Jun 01", price: 0.9200, apy: 8.20, tvl: 2.10 },
  { date: "Jul 01", price: 0.9500, apy: 8.90, tvl: 3.50 },
  { date: "Aug 01", price: 0.9800, apy: 9.80, tvl: 5.80 },
  { date: "Sep 01", price: 1.0100, apy: 10.50, tvl: 8.80 },
  { date: "Oct 01", price: 1.0380, apy: 11.60, tvl: 11.50 },
  { date: "Nov 02", price: 1.0482, apy: 11.84, tvl: 12.45, event: "All-Time High $1.0482" },
];

export type TimeframeType = "1D" | "1W" | "1M" | "3M" | "1Y" | "All";
export type MetricType = "price" | "apy" | "tvl";

interface PerformanceChartProps {
  lang?: "en" | "zh";
  vaultType?: "usdc" | "all-weather";
  theme?: "dark" | "beige";
}

export function PerformanceChart({
  lang = "en",
  vaultType = "all-weather",
  theme = "beige",
}: PerformanceChartProps) {
  const gradientId = useId();
  const [timeframe, setTimeframe] = useState<TimeframeType>("1M");
  const [metric, setMetric] = useState<MetricType>("price");
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const isZh = lang === "zh";

  // Select dataset based on vaultType and timeframe
  const points: DataPoint[] = useMemo(() => {
    if (vaultType === "all-weather") {
      switch (timeframe) {
        case "1D":
          return DATA_AW_1D;
        case "1W":
          return DATA_AW_1W;
        case "1M":
          return DATA_AW_1M;
        case "3M":
          return DATA_AW_3M;
        case "1Y":
        case "All":
          return DATA_AW_ALL;
        default:
          return DATA_AW_1M;
      }
    } else {
      switch (timeframe) {
        case "1D":
          return DATA_USDC_1D;
        case "1W":
          return DATA_USDC_1W;
        case "1M":
          return DATA_USDC_1M;
        case "3M":
          return DATA_USDC_3M;
        case "1Y":
        case "All":
          return DATA_USDC_ALL;
        default:
          return DATA_USDC_1M;
      }
    }
  }, [vaultType, timeframe]);

  // Current active data point (hovered or last point)
  const activePoint = hoverIndex !== null && points[hoverIndex] ? points[hoverIndex] : points[points.length - 1];
  const firstPoint = points[0];

  // Primary numerical value
  const currentValue = metric === "price" ? activePoint.price : metric === "apy" ? activePoint.apy : activePoint.tvl;
  const initialValue = metric === "price" ? firstPoint.price : metric === "apy" ? firstPoint.apy : firstPoint.tvl;
  const changeValue = currentValue - initialValue;
  const changePct = initialValue > 0 ? (changeValue / initialValue) * 100 : 0;
  const isPositive = changeValue >= 0;

  // Chart SVG bounds (identical to MarketDetailView SparklineChart)
  const svgWidth = 680;
  const svgHeight = 240;
  const paddingX = 4;
  const paddingTop = 12;
  const paddingBottom = 8;
  const innerWidth = svgWidth - paddingX * 2;
  const innerHeight = svgHeight - paddingTop - paddingBottom;

  const rawValues = points.map((p) => (metric === "price" ? p.price : metric === "apy" ? p.apy : p.tvl));
  const minVal = Math.min(...rawValues);
  const maxVal = Math.max(...rawValues);
  const range = maxVal - minVal || 1;

  // Coordinate mapping
  const coords = points.map((p, idx) => {
    const val = metric === "price" ? p.price : metric === "apy" ? p.apy : p.tvl;
    const x = paddingX + (idx / (points.length - 1)) * innerWidth;
    const y = paddingTop + innerHeight - ((val - minVal) / range) * innerHeight;
    return { x, y };
  });

  // Smooth Cubic Bezier Spline
  let pathD = `M ${coords[0].x.toFixed(1)} ${coords[0].y.toFixed(1)}`;
  for (let i = 0; i < coords.length - 1; i++) {
    const p0 = coords[i === 0 ? 0 : i - 1];
    const p1 = coords[i];
    const p2 = coords[i + 1];
    const p3 = coords[i + 2] || p2;

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    pathD += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }

  // Closed Area Path
  const areaD = `${pathD} L ${coords[coords.length - 1].x.toFixed(1)} ${svgHeight} L ${coords[0].x.toFixed(1)} ${svgHeight} Z`;

  // Color tokens unified with MarketDetailView (#10B981 Emerald Green)
  const strokeColor = "#10B981";
  const stopColor = "#10B981";

  // Active scrubber coordinate
  const activeCoordIndex = hoverIndex !== null ? hoverIndex : coords.length - 1;
  const activeCoord = coords[activeCoordIndex] || coords[coords.length - 1];

  // Mouse scrub handler
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clientX / rect.width));
    const targetIdx = Math.round(ratio * (points.length - 1));
    setHoverIndex(targetIdx);
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
  };

  return (
    <div className="card-surface rounded-2xl border p-6 shadow-xl backdrop-blur-sm overflow-hidden space-y-4">
      {/* 1. TOP HEADER: Hero Price & Market Open Live Pill (Mirrors MarketDetailView) */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800/80">
        <div>
          <div className="flex items-center space-x-3">
            <span
              className={`text-4xl sm:text-5xl font-black font-sans tracking-tight ${
                theme === "beige" ? "text-[#171d26]" : "text-white"
              }`}
            >
              {metric === "price" && `$${currentValue.toFixed(4)}`}
              {metric === "apy" && `${currentValue.toFixed(2)}%`}
              {metric === "tvl" && `$${currentValue.toFixed(2)}M`}
            </span>

            {/* ● Market Open Live Pill (Unified with MarketDetailView) */}
            <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-sans text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>
                {metric === "price"
                  ? isZh
                    ? "份额净值 (NAV)"
                    : "Live NAV Compounding"
                  : metric === "apy"
                  ? isZh
                    ? "综合净年化"
                    : "Net APY Optimized"
                  : isZh
                  ? "管理总规模"
                  : "Verified TVL"}
              </span>
            </span>
          </div>

          {/* Subtitle Under Price: ▲ $0.0628 (+6.28%) Nov 02, 2026 (Mirrors MarketDetailView) */}
          <div className="flex items-center space-x-2 mt-1.5 text-xs font-mono">
            <span className="flex items-center font-bold text-emerald-600 dark:text-emerald-400">
              <span>{isPositive ? "▲" : "▼"}</span>
              <span className="ml-1">
                {metric === "price" && `+$${changeValue.toFixed(4)} (+${changePct.toFixed(2)}%)`}
                {metric === "apy" && `+${changeValue.toFixed(2)}% (+${changePct.toFixed(1)}%)`}
                {metric === "tvl" && `+$${changeValue.toFixed(2)}M (+${changePct.toFixed(1)}%)`}
              </span>
            </span>
            <span className="text-slate-400">
              {activePoint.date} • {vaultType === "all-weather" ? "OmniUSDC" : "NUSD"}
            </span>
          </div>
        </div>

        {/* Dimension Metric Toggle Tabs (NAV / APY / TVL) */}
        <div className="flex rounded-xl well-inset p-1 border text-xs font-semibold self-start">
          <button
            type="button"
            onClick={() => setMetric("price")}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              metric === "price"
                ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            {isZh ? "份额净值 (NAV)" : "Share Price"}
          </button>
          <button
            type="button"
            onClick={() => setMetric("apy")}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              metric === "apy"
                ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            {isZh ? "综合年化 (APY)" : "Net APY"}
          </button>
          <button
            type="button"
            onClick={() => setMetric("tvl")}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              metric === "tvl"
                ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            {isZh ? "金库规模 (TVL)" : "Vault TVL"}
          </button>
        </div>
      </div>

      {/* 2. FULL-BLEED INTERACTIVE TRADINGVIEW STYLE AREA CHART (Mirrors MarketDetailView) */}
      <div
        className="w-full relative pt-2 select-none cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div className="h-60 sm:h-72 w-full relative">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            preserveAspectRatio="none"
            className="w-full h-full"
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
            <path d={areaD} fill={`url(#${gradientId})`} />

            {/* Smooth Sparkline Stroke - Pure Emerald Green */}
            <path
              d={pathD}
              fill="none"
              stroke={strokeColor}
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          {/* Scrubber vertical line indicator (Mirrors MarketDetailView) */}
          <div
            className="absolute top-0 bottom-2 w-px border-l border-dashed border-slate-300 dark:border-slate-700 pointer-events-none transition-all duration-75"
            style={{
              left: `${(activeCoord.x / svgWidth) * 100}%`,
            }}
          >
            <div
              className="w-2.5 h-2.5 rounded-full -ml-[4.5px] border-2 border-white shadow-sm bg-emerald-500 transition-all duration-75"
              style={{
                marginTop: `${(activeCoord.y / svgHeight) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Timeframe Selector Pills (Mirrors MarketDetailView: 1D 1W 1M 3M 1Y All) */}
        <div className="flex items-center space-x-2 pt-3 pb-3 border-b border-slate-200 dark:border-slate-800/80">
          {(["1D", "1W", "1M", "3M", "1Y", "All"] as const).map((tf) => (
            <button
              key={tf}
              type="button"
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                timeframe === tf
                  ? "bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                  : "text-slate-400 hover:text-slate-800 dark:hover:text-white"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* 3. BOTTOM EVENT TICKER PILL (Unified with Warm Beige / Dark Theme) */}
      <div className="p-3 rounded-xl border flex items-center justify-between text-xs transition bg-emerald-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-medium">
        <div className="flex items-center space-x-2">
          <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <span>
            {activePoint.event
              ? isZh
                ? `宏观事件: ${activePoint.event}`
                : `Macro Event: ${activePoint.event}`
              : isZh
              ? "宏观再平衡: 桥水四维风险平价动态稳态中 (低波动稳步增厚)"
              : "Autonomous Dynamic Yield Rebalancing Active"}
          </span>
        </div>
        <div className="flex items-center space-x-1.5 font-mono text-[11px] text-emerald-700 dark:text-emerald-400 font-bold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{activePoint.date}</span>
        </div>
      </div>
    </div>
  );
}
