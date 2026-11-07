"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  ChevronDown,
  Info,
  Eye,
  HelpCircle,
  Zap,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Clock,
  ArrowUpDown,
} from "lucide-react";
import { MarketAsset } from "../config/marketsData";
import SparklineChart from "./SparklineChart";
import AssetLogoIcon from "./AssetLogoIcon";

interface MarketDetailViewProps {
  asset: MarketAsset;
  onBack: () => void;
  connectedAccount: string;
  usdcBalance: number;
  nearBalance: string;
  onTradeSuccess?: () => void;
  lang?: "en" | "zh";
  theme?: "dark" | "beige";
}

type TimeframeType = "1D" | "1W" | "1M" | "3M" | "1Y" | "All";

export default function MarketDetailView({
  asset,
  onBack,
  connectedAccount,
  usdcBalance,
  nearBalance,
  onTradeSuccess,
  lang = "en",
  theme = "dark",
}: MarketDetailViewProps) {
  const [timeframe, setTimeframe] = useState<TimeframeType>("1D");
  const [payToken, setPayToken] = useState<"USDC" | "NEAR">("USDC");
  const [payAmount, setPayAmount] = useState<string>("");
  const [isTrading, setIsTrading] = useState(false);
  const [tradeSuccess, setTradeSuccess] = useState<string | null>(null);

  // Scroll to top when opening asset detail
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [asset.id]);

  const isPositive = asset.change24h >= 0;
  const payNum = parseFloat(payAmount) || 0;
  const payTokenPrice = payToken === "USDC" ? 1.0 : 5.20;
  const totalPayUsd = payNum * payTokenPrice;
  const receiveNum = totalPayUsd > 0 && asset.priceUsd > 0 ? totalPayUsd / asset.priceUsd : 0;
  const formattedReceive =
    receiveNum > 0 ? (receiveNum < 0.01 ? receiveNum.toFixed(4) : receiveNum.toFixed(3)) : "";

  const availablePayBalance = payToken === "USDC" ? usdcBalance : (parseFloat(nearBalance) || 0);

  // Execute Instant Trade via NEAR Intents
  const handleExecuteTrade = async () => {
    if (payNum <= 0) return;
    setIsTrading(true);
    setTradeSuccess(null);

    try {
      const res = await fetch("/api/transact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId: connectedAccount || "dao.omniyield-vault.testnet",
          action: "deposit",
          amount: totalPayUsd.toFixed(2),
          originChain: "NEAR Protocol",
          destChain: "NEAR Protocol",
          vault: asset.category === "vaults" && asset.id === "all-weather-vault" ? "all-weather" : "usdc",
        }),
      });

      const data = await res.json();
      setTradeSuccess(
        lang === "zh"
          ? `已成功使用 ${payNum} ${payToken} 买入 ~${formattedReceive} ${asset.symbol}！`
          : `Successfully bought ~${formattedReceive} ${asset.symbol} with ${payNum} ${payToken} via NEAR Intents!`
      );
      if (onTradeSuccess) onTradeSuccess();
    } catch (err: any) {
      alert(`Trade error: ${err.message}`);
    } finally {
      setIsTrading(false);
    }
  };

  return (
    /* Clean, expansive White Canvas Container (Mirrors near.com 1:1) */
    <div
      className={`rounded-3xl p-6 sm:p-8 border shadow-sm transition-all ${
        theme === "beige"
          ? "bg-white border-[#dfd2be] text-[#171d26]"
          : "bg-slate-950/95 border-slate-800 text-slate-100"
      }`}
    >
      {/* Top Header: Breadcrumb & Utility Icons (Mirrors Image 2) */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center space-x-2 text-xs font-semibold">
          <button
            type="button"
            onClick={onBack}
            className={`flex items-center space-x-1.5 transition cursor-pointer ${
              theme === "beige"
                ? "text-slate-600 hover:text-black"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>
              {asset.category === "equities"
                ? "Stocks"
                : asset.category === "etfs"
                ? "ETFs"
                : asset.category === "crypto"
                ? "Crypto"
                : asset.category === "vaults"
                ? "Vaults"
                : "Markets"}
            </span>
          </button>
          <span className="text-slate-300 dark:text-slate-600">/</span>
          <span className="text-slate-900 dark:text-white font-bold">{asset.name}</span>
        </div>

        {/* Top Right Utility Icons (Mirrors near.com) */}
        <div className="flex items-center space-x-3 text-slate-400">
          <button
            type="button"
            className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-900 transition cursor-pointer"
            title="Info"
          >
            <Info className="w-4 h-4" />
          </button>
          <button
            type="button"
            className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-900 transition cursor-pointer"
            title="Watchlist"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            type="button"
            className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-900 transition cursor-pointer"
            title="Help"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main 2-Column Layout with Vertical Divider Line (Mirrors Image 2) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6 items-start">
        {/* =========================================================================
            LEFT COLUMN: Big Price, Market Open, TradingView Chart, Stats & Details (7-8 cols)
        ========================================================================= */}
        <div className="lg:col-span-8 space-y-6 lg:border-r lg:border-slate-100 dark:lg:border-slate-800/80 lg:pr-8">
          {/* Price & Market Open Live Pill (Mirrors Image 2) */}
          <div>
            <div className="flex items-center space-x-3">
              <span
                className={`text-4xl sm:text-5xl font-black font-sans tracking-tight ${
                  theme === "beige" ? "text-[#171d26]" : "text-white"
                }`}
              >
                ${asset.priceUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>

              {/* ● Market open Pill (Green Dot + Pill) */}
              <span className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-sans text-xs font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Market open</span>
              </span>
            </div>

            {/* Subtitle Under Price: ▼ $1.34 (0.39%) Nov 2, 3:00 AM (Mirrors Image 2) */}
            <div className="flex items-center space-x-2 mt-1.5 text-xs font-mono">
              <span
                className={`flex items-center font-bold ${
                  isPositive ? "text-emerald-500" : "text-[#E11D48]"
                }`}
              >
                <span>{isPositive ? "▲" : "▼"}</span>
                <span className="ml-1">
                  ${Math.abs(asset.changeAmount24h).toFixed(2)} ({Math.abs(asset.change24h)}%)
                </span>
              </span>
              <span className="text-slate-400">Nov 2, 3:00 AM</span>
            </div>
          </div>

          {/* Full-Bleed Interactive TradingView Style Area Chart (Mirrors Image 2) */}
          <div className="w-full relative pt-2">
            <div className="h-64 sm:h-72 w-full relative">
              <SparklineChart
                data={asset.sparkline}
                isPositive={isPositive}
                width={680}
                height={240}
                strokeWidth={2.5}
                showGradient={true}
                className="w-full h-full"
              />

              {/* Scrubber vertical line indicator (Mirrors Image 2) */}
              <div
                className="absolute top-0 bottom-4 w-px border-l border-dashed border-slate-300 dark:border-slate-700 pointer-events-none"
                style={{ left: "68%" }}
              >
                <div
                  className={`w-2.5 h-2.5 rounded-full -ml-[4.5px] mt-28 border-2 border-white shadow-sm ${
                    isPositive ? "bg-emerald-500" : "bg-[#E11D48]"
                  }`}
                />
              </div>
            </div>

            {/* Timeframe Selector Pills (Mirrors Image 2: 1D 1W 1M 3M 1Y All) */}
            <div className="flex items-center space-x-2 pt-3 pb-4 border-b border-slate-100 dark:border-slate-800/80">
              {(["1D", "1W", "1M", "3M", "1Y", "All"] as const).map((tf) => (
                <button
                  key={tf}
                  type="button"
                  onClick={() => setTimeframe(tf)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    timeframe === tf
                      ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                      : "text-slate-400 hover:text-slate-800 dark:hover:text-white"
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          {/* Key Metrics Row (Mirrors Image 2 & 3: Market cap, Volume, Avg. volume) */}
          <div className="grid grid-cols-3 gap-6 pt-2">
            <div>
              <span className="text-xs text-slate-400 block font-normal">Market cap</span>
              <span
                className={`text-base font-bold font-sans mt-0.5 block ${
                  theme === "beige" ? "text-[#171d26]" : "text-white"
                }`}
              >
                {asset.marketCap}
              </span>
            </div>

            <div>
              <span className="text-xs text-slate-400 block font-normal">Volume</span>
              <span
                className={`text-base font-bold font-sans mt-0.5 block ${
                  theme === "beige" ? "text-[#171d26]" : "text-white"
                }`}
              >
                {asset.volume24h}
              </span>
            </div>

            <div>
              <span className="text-xs text-slate-400 block font-normal">Avg. volume</span>
              <span
                className={`text-base font-bold font-sans mt-0.5 block ${
                  theme === "beige" ? "text-[#171d26]" : "text-white"
                }`}
              >
                {asset.avgVolume}
              </span>
            </div>
          </div>

          {/* Two Detailed Tables: Details & Dividends (Mirrors Image 3 1:1) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-100 dark:border-slate-800/80">
            {/* Details Table */}
            <div>
              <h4
                className={`font-bold text-sm mb-3 ${
                  theme === "beige" ? "text-[#171d26]" : "text-white"
                }`}
              >
                Details
              </h4>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-slate-800/50">
                  <span className="text-slate-400">Company</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {asset.details.company}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-slate-800/50">
                  <span className="text-slate-400">Instrument</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {asset.details.instrument}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-slate-800/50">
                  <span className="text-slate-400">Asset class</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {asset.details.assetClass}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-slate-800/50">
                  <span className="text-slate-400">Sector</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {asset.details.sector}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-slate-800/50">
                  <span className="text-slate-400">Region</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {asset.details.region}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-slate-800/50">
                  <span className="text-slate-400">Style</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {asset.details.style}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-400">ISIN / Contract</span>
                  <span className="font-mono text-slate-900 dark:text-white">
                    {asset.details.isinOrContract}
                  </span>
                </div>
              </div>
            </div>

            {/* Dividends / Yield Table */}
            <div>
              <h4
                className={`font-bold text-sm mb-3 ${
                  theme === "beige" ? "text-[#171d26]" : "text-white"
                }`}
              >
                {asset.category === "vaults" || asset.category === "fixed-income"
                  ? "Yield Metrics"
                  : "Dividends"}
              </h4>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-slate-800/50">
                  <span className="text-slate-400">
                    {asset.category === "vaults" || asset.category === "fixed-income"
                      ? "Current APY"
                      : "Dividend yield"}
                  </span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {asset.dividends.yieldPercent}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-slate-800/50">
                  <span className="text-slate-400">Distribution frequency</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {asset.dividends.distributionFrequency}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-slate-800/50">
                  <span className="text-slate-400">
                    {asset.category === "vaults" || asset.category === "fixed-income"
                      ? "Distribution Type"
                      : "Last dividend"}
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {asset.dividends.lastDividend}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-400">
                    {asset.category === "vaults" || asset.category === "fixed-income"
                      ? "Last Rebalance"
                      : "Last paid"}
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {asset.dividends.lastPaidDate}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            RIGHT COLUMN: Trade Panel (Mirrors Image 2 & 3 1:1) (4-5 cols)
        ========================================================================= */}
        <div className="lg:col-span-4 sticky top-6 space-y-4">
          <div
            className={`p-6 rounded-3xl border transition-all ${
              theme === "beige"
                ? "bg-white border-[#dfd2be] shadow-sm"
                : "bg-slate-900/90 border-slate-800"
            }`}
          >
            {/* Header: Trade Title + Market Toggle (Mirrors Image 2) */}
            <div className="flex items-center justify-between pb-3">
              <h3
                className={`font-black text-lg ${
                  theme === "beige" ? "text-[#171d26]" : "text-white"
                }`}
              >
                Trade
              </h3>
              <span className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                Market
              </span>
            </div>

            {/* Light Blue Notice Banner (Mirrors Image 2 & 3: Ondo assets notice) */}
            <div className="p-3 rounded-2xl bg-[#EBF5FB] border border-[#D4E6F1] text-[11px] text-[#2471A3] flex items-center space-x-2 my-2">
              <Info className="w-4 h-4 text-[#2980B9] flex-shrink-0" />
              <span className="leading-tight">
                {lang === "zh"
                  ? "该资产由 Ondo Finance 在 NEAR 协议原生发行并由合规托管行 1:1 股票储备抵押。"
                  : "Ondo assets are tokenized via Ondo Finance on NEAR with 100% custodian collateral."}
              </span>
            </div>

            <div className="space-y-3 pt-2">
              {/* 1. SELL BOX (Mirrors Image 2) */}
              <div
                className={`p-4 rounded-2xl border transition ${
                  theme === "beige"
                    ? "bg-[#faf8f5] border-[#e2d8cb]"
                    : "bg-slate-950/80 border-slate-800"
                }`}
              >
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1 font-medium">
                  <span>Sell</span>
                  <div className="flex items-center space-x-2">
                    {/* Token Dropdown Pill */}
                    <button
                      type="button"
                      onClick={() => setPayToken(payToken === "USDC" ? "NEAR" : "USDC")}
                      className={`px-2.5 py-1 rounded-xl border text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer ${
                        theme === "beige"
                          ? "bg-white border-slate-200 text-slate-900 shadow-sm"
                          : "bg-slate-800 border-slate-700 text-white"
                      }`}
                    >
                      <AssetLogoIcon symbol={payToken} className="w-3.5 h-3.5" />
                      <span>{payToken}</span>
                      <ChevronDown className="w-3 h-3 text-slate-400" />
                    </button>
                  </div>
                </div>

                <div className="flex items-baseline justify-between">
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="0"
                    value={payAmount}
                    onChange={(e) => {
                      setPayAmount(e.target.value);
                      setTradeSuccess(null);
                    }}
                    className={`bg-transparent text-3xl sm:text-4xl font-normal focus:outline-none flex-1 min-w-0 font-sans ${
                      theme === "beige" ? "text-[#171d26] placeholder-slate-400" : "text-white placeholder-slate-600"
                    }`}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 font-mono mt-1">
                  <span>${totalPayUsd > 0 ? totalPayUsd.toFixed(2) : "0.00"} ⇅</span>
                  <span>
                    {availablePayBalance.toFixed(2)} {payToken}
                  </span>
                </div>
              </div>

              {/* Center Circular Arrow Button (Mirrors Image 2) */}
              <div className="flex justify-center -my-2 relative z-10">
                <button
                  type="button"
                  onClick={() => {
                    setPayAmount("");
                    setTradeSuccess(null);
                  }}
                  className={`w-8 h-8 rounded-full border flex items-center justify-center text-slate-400 shadow-sm transition hover:rotate-180 cursor-pointer ${
                    theme === "beige" ? "bg-white border-slate-200 hover:text-black" : "bg-slate-800 border-slate-700 hover:text-white"
                  }`}
                >
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* 2. BUY BOX (Mirrors Image 2) */}
              <div
                className={`p-4 rounded-2xl border transition ${
                  theme === "beige"
                    ? "bg-[#faf8f5] border-[#e2d8cb]"
                    : "bg-slate-950/80 border-slate-800"
                }`}
              >
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1 font-medium">
                  <span>Buy</span>
                  {/* Target Asset Pill with Real Vector SVG Logo */}
                  <div
                    className={`px-2.5 py-1 rounded-xl border text-xs font-bold flex items-center space-x-1.5 ${
                      theme === "beige"
                        ? "bg-white border-slate-200 text-slate-900 shadow-sm"
                        : "bg-slate-800 border-slate-700 text-white"
                    }`}
                  >
                    <AssetLogoIcon symbol={asset.symbol} className="w-3.5 h-3.5 text-black dark:text-white" />
                    <span>{asset.symbol}</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </div>
                </div>

                <div className="flex items-baseline justify-between">
                  <input
                    type="text"
                    readOnly
                    placeholder="0"
                    value={formattedReceive}
                    className={`bg-transparent text-3xl sm:text-4xl font-normal focus:outline-none flex-1 min-w-0 font-sans ${
                      theme === "beige" ? "text-[#171d26] placeholder-slate-400" : "text-white placeholder-slate-600"
                    }`}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 font-mono mt-1">
                  <span>${receiveNum > 0 ? (receiveNum * asset.priceUsd).toFixed(2) : "0.00"}</span>
                  <span>0 {asset.symbol}</span>
                </div>
              </div>

              {/* 3. ACTION CTA BUTTON (Mirrors Image 2: "Please enter an amount") */}
              <div className="pt-2">
                {payNum <= 0 ? (
                  <button
                    type="button"
                    disabled
                    className="w-full py-3.5 rounded-2xl bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 font-bold text-xs tracking-wide cursor-not-allowed transition"
                  >
                    Please enter an amount
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleExecuteTrade}
                    disabled={isTrading}
                    className="w-full py-3.5 rounded-2xl bg-[#F5B853] hover:bg-[#EAA940] active:scale-[0.99] text-slate-950 font-black text-xs tracking-wide shadow-md shadow-amber-500/20 transition disabled:opacity-50 flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    {isTrading ? (
                      <>
                        <span className="w-3.5 h-3.5 rounded-full border-2 border-slate-950 border-t-transparent animate-spin"></span>
                        <span>Routing via NEAR Intents...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5 fill-current" />
                        <span>
                          {lang === "zh"
                            ? `立即买入 ~${formattedReceive} ${asset.symbol}`
                            : `Buy ~${formattedReceive} ${asset.symbol}`}
                        </span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* 4. SUCCESS NOTICE */}
              {tradeSuccess && (
                <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-300 text-xs flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>{tradeSuccess}</span>
                </div>
              )}

              {/* 5. FOOTER SETTLEMENT NOTE */}
              <div className="pt-1 text-[11px] text-slate-400 font-mono text-center flex items-center justify-center space-x-1.5">
                <Clock className="w-3 h-3 text-emerald-500" />
                <span>~2.2s Sub-Block Finality • 0 Gas Sponsored</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
