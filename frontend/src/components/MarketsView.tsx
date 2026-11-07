"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  LayoutGrid,
  List as ListIcon,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  Zap,
  ArrowRight,
} from "lucide-react";
import {
  MARKETS_DATA,
  MarketAsset,
  MarketCategory,
} from "../config/marketsData";
import SparklineChart from "./SparklineChart";
import MarketDetailView from "./MarketDetailView";
import AssetLogoIcon from "./AssetLogoIcon";

interface MarketsViewProps {
  connectedAccount: string;
  usdcBalance: number;
  nearBalance: string;
  onTradeSuccess?: () => void;
  lang?: "en" | "zh";
  theme?: "dark" | "beige";
}

type SortOption = "featured" | "market-cap" | "top-gainers" | "highest-yield";

export default function MarketsView({
  connectedAccount,
  usdcBalance,
  nearBalance,
  onTradeSuccess,
  lang = "en",
  theme = "dark",
}: MarketsViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<MarketCategory>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<SortOption>("featured");
  const [selectedAsset, setSelectedAsset] = useState<MarketAsset | null>(null);

  // Category Pills definition
  const categories: { id: MarketCategory; label: { en: string; zh: string } }[] = [
    { id: "all", label: { en: "All assets", zh: "全部资产" } },
    { id: "equities", label: { en: "Equities", zh: "美股资产" } },
    { id: "etfs", label: { en: "ETFs", zh: "指数基金" } },
    { id: "crypto", label: { en: "Crypto", zh: "加密货币" } },
    { id: "fixed-income", label: { en: "Fixed Income", zh: "固定收益" } },
    { id: "commodities", label: { en: "Commodities", zh: "大宗黄金" } },
    { id: "vaults", label: { en: "Vault Strategies", zh: "金库策略" } },
  ];

  // Filter and Sort assets
  const filteredAssets = useMemo(() => {
    let result = [...MARKETS_DATA];

    // Filter by category
    if (activeCategory !== "all") {
      result = result.filter((a) => a.category === activeCategory);
    }

    // Filter by search query
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.symbol.toLowerCase().includes(q) ||
          a.provider.toLowerCase().includes(q)
      );
    }

    // Sort
    if (sortBy === "top-gainers") {
      result.sort((a, b) => b.change24h - a.change24h);
    } else if (sortBy === "market-cap") {
      result.sort((a, b) => b.priceUsd - a.priceUsd);
    } else if (sortBy === "highest-yield") {
      result.sort((a, b) => {
        const aVal = a.apy ? parseFloat(a.apy) : 0;
        const bVal = b.apy ? parseFloat(b.apy) : 0;
        return bVal - aVal;
      });
    }

    return result;
  }, [activeCategory, searchQuery, sortBy]);

  // If an asset is selected, render the dedicated near.com style full-page detail view!
  if (selectedAsset) {
    return (
      <div className="max-w-7xl mx-auto py-4 sm:py-6 px-4">
        <MarketDetailView
          asset={selectedAsset}
          onBack={() => setSelectedAsset(null)}
          connectedAccount={connectedAccount}
          usdcBalance={usdcBalance}
          nearBalance={nearBalance}
          onTradeSuccess={onTradeSuccess}
          lang={lang}
          theme={theme}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-4 sm:py-6 px-4">
      {/* =========================================================================
          1. HEADER (Mirrors near.com/crypto and near.com/stocks)
      ========================================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800/80">
        <div>
          <div className="flex items-center space-x-3">
            <h1
              className={`text-2xl sm:text-3xl font-black tracking-tight ${
                theme === "beige" ? "text-slate-900" : "text-white"
              }`}
            >
              {lang === "zh" ? "资本市场大厅 (Markets)" : "Markets"}
            </h1>
            <span className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 font-mono text-xs font-bold border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>{lang === "zh" ? "美股与 Web3 交易中" : "Market Open"}</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {lang === "zh"
              ? "探索 NEAR 链上代币化美股（Ondo RWA）、纳指 ETF、主流加密资产与 OmniYield 金库收益"
              : "Explore tokenized US equities, ETFs, crypto and OmniYield vault yields on NEAR Protocol"}
          </p>
        </div>

        {/* Quick Summary Badges */}
        <div className="flex items-center space-x-2 text-xs font-mono">
          <div className="px-3 py-1.5 rounded-xl well-inset">
            <span className="text-slate-400 mr-1.5">Assets:</span>
            <strong className={theme === "beige" ? "text-slate-900" : "text-white"}>
              {filteredAssets.length}
            </strong>
          </div>
          <div className="px-3 py-1.5 rounded-xl well-inset">
            <span className="text-slate-400 mr-1.5">24h Vol:</span>
            <strong className="text-emerald-500">$128.5B</strong>
          </div>
        </div>
      </div>

      {/* =========================================================================
          2. FILTER & CONTROLS TOOLBAR (Search + Category Pills + View Mode + Sort)
      ========================================================================= */}
      <div className="space-y-3 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            <input
              type="text"
              placeholder={
                lang === "zh"
                  ? "搜索资产名称或代码 (如 NVDA, BTC, NUSD)..."
                  : "Search name or symbol (e.g. NVDA, BTC, QQQ)..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl well-inset text-xs font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500 transition text-slate-900 dark:text-white placeholder-slate-400"
            />
          </div>

          {/* Right Tools: View Mode Toggle & Sort Dropdown */}
          <div className="flex items-center space-x-2 self-end lg:self-auto flex-shrink-0">
            {/* View Mode Switcher: Grid vs List */}
            <div className="flex items-center p-1 rounded-xl well-inset">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  viewMode === "grid"
                    ? "item-selected font-bold"
                    : "text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
                title="Grid View (3 Columns)"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  viewMode === "list"
                    ? "item-selected font-bold"
                    : "text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
                title="List View (Table)"
              >
                <ListIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Sort Selector */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-3 py-2 rounded-xl well-inset text-xs font-mono font-bold focus:outline-none transition cursor-pointer appearance-none pr-8 text-slate-900 dark:text-white"
              >
                <option value="featured">
                  {lang === "zh" ? "精选推荐 (Featured)" : "Featured"}
                </option>
                <option value="market-cap">
                  {lang === "zh" ? "市值最高 (Largest Market Cap)" : "Largest market cap"}
                </option>
                <option value="top-gainers">
                  {lang === "zh" ? "今日涨幅榜 (Top Gainers)" : "Top gainers"}
                </option>
                <option value="highest-yield">
                  {lang === "zh" ? "最高收益率 (Highest Yield)" : "Highest yield"}
                </option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex-shrink-0 cursor-pointer ${
                activeCategory === cat.id
                  ? "item-selected font-extrabold"
                  : "well-inset text-slate-600 dark:text-slate-400 hover:border-slate-400"
              }`}
            >
              {lang === "zh" ? cat.label.zh : cat.label.en}
            </button>
          ))}
        </div>
      </div>

      {/* =========================================================================
          3. MAIN CONTENT: GRID VIEW (3 COLUMNS) OR LIST VIEW (TABLE)
      ========================================================================= */}
      {viewMode === "grid" ? (
        /* ==================== GRID VIEW (near.com 3 Columns) ==================== */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAssets.map((asset) => {
            const isPositive = asset.change24h >= 0;
            return (
              <div
                key={asset.id}
                onClick={() => setSelectedAsset(asset)}
                className="card-surface p-5 rounded-3xl border transition-all duration-200 hover:-translate-y-1 group cursor-pointer flex flex-col justify-between overflow-hidden"
              >
                {/* Card Top: Logo + Name + Symbol + APY Pill (Properly contained without overflow) */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center p-2 shadow-sm flex-shrink-0">
                      <AssetLogoIcon symbol={asset.symbol} className="w-6 h-6 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3
                        className={`font-black text-sm truncate ${
                          theme === "beige" ? "text-slate-900" : "text-white"
                        }`}
                        title={asset.name}
                      >
                        {asset.name}
                      </h3>
                      <div className="flex items-center space-x-1.5 text-xs text-slate-400 font-mono mt-0.5">
                        <span className="font-bold text-slate-500">{asset.symbol}</span>
                        <span>•</span>
                        <span className="text-[10px] text-slate-400 truncate">
                          {asset.categoryLabel[lang === "zh" ? "zh" : "en"]}
                        </span>
                      </div>
                    </div>
                  </div>

                  {asset.apy && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 font-mono font-bold border border-emerald-500/30 flex-shrink-0 whitespace-nowrap">
                      {asset.apy}
                    </span>
                  )}
                </div>

                {/* Price & 24h Change (Large Display) */}
                <div className="my-4">
                  <div
                    className={`text-2xl font-black font-mono tracking-tight ${
                      theme === "beige" ? "text-slate-900" : "text-white"
                    }`}
                  >
                    ${asset.priceUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <span
                      className={`inline-flex items-center space-x-0.5 text-xs font-mono font-bold px-1.5 py-0.2 rounded ${
                        isPositive
                          ? "text-emerald-500 bg-emerald-500/10"
                          : "text-rose-500 bg-rose-500/10"
                      }`}
                    >
                      {isPositive ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      <span>
                        {isPositive ? "+" : ""}
                        {asset.change24h}%
                      </span>
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono truncate">
                      {asset.category === "vaults" ? "TVL" : "MCap"}: {asset.marketCap}
                    </span>
                  </div>
                </div>

                {/* Bottom: Smooth Gradient Sparkline Chart */}
                <div className="h-20 w-full -mx-1">
                  <SparklineChart
                    data={asset.sparkline}
                    isPositive={isPositive}
                    width={280}
                    height={80}
                    strokeWidth={2.2}
                    showGradient={true}
                    className="w-full h-full"
                  />
                </div>

                {/* Hover CTA Indicator */}
                <div className={`pt-2 border-t mt-2 flex items-center justify-between text-[11px] font-mono opacity-0 group-hover:opacity-100 transition-opacity ${
                  theme === "beige" ? "border-slate-200 text-slate-600" : "border-slate-800/60 text-slate-400"
                }`}>
                  <span className="text-emerald-500 font-bold flex items-center space-x-1">
                    <Zap className="w-3 h-3" />
                    <span>{lang === "zh" ? "点击查看详情 / 即时交易" : "Click to Trade"}</span>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-500 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ==================== LIST VIEW (Dense Financial Table) ==================== */
        <div className="card-surface rounded-3xl border overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead
                className={`border-b text-slate-400 uppercase text-[10px] tracking-wider ${
                  theme === "beige" ? "bg-slate-50 border-slate-200" : "bg-slate-900 border-slate-800"
                }`}
              >
                <tr>
                  <th className="py-3.5 px-4 font-bold">#</th>
                  <th className="py-3.5 px-4 font-bold">{lang === "zh" ? "资产名称" : "Asset"}</th>
                  <th className="py-3.5 px-4 font-bold">{lang === "zh" ? "现价" : "Price"}</th>
                  <th className="py-3.5 px-4 font-bold">{lang === "zh" ? "24h 涨跌" : "24h Change"}</th>
                  <th className="py-3.5 px-4 font-bold">{lang === "zh" ? "24h 区间" : "24h High / Low"}</th>
                  <th className="py-3.5 px-4 font-bold">{lang === "zh" ? "市值 / TVL" : "Market Cap"}</th>
                  <th className="py-3.5 px-4 font-bold">{lang === "zh" ? "24h 成交额" : "24h Volume"}</th>
                  <th className="py-3.5 px-4 font-bold">{lang === "zh" ? "走势" : "Trend"}</th>
                  <th className="py-3.5 px-4 font-bold text-right">{lang === "zh" ? "操作" : "Action"}</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${theme === "beige" ? "divide-slate-200" : "divide-slate-800/60"}`}>
                {filteredAssets.map((asset, idx) => {
                  const isPositive = asset.change24h >= 0;
                  return (
                    <tr
                      key={asset.id}
                      onClick={() => setSelectedAsset(asset)}
                      className={`transition cursor-pointer ${
                        theme === "beige"
                          ? "hover:bg-slate-50"
                          : "hover:bg-slate-900/60"
                      }`}
                    >
                      <td className="py-3 px-4 text-slate-400 font-bold">{idx + 1}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-7 h-7 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center p-1.5 shadow-sm flex-shrink-0">
                            <AssetLogoIcon symbol={asset.symbol} className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <span
                              className={`font-bold text-xs block ${
                                theme === "beige" ? "text-slate-900" : "text-white"
                              }`}
                            >
                              {asset.name}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {asset.symbol} • {asset.provider}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td
                        className={`py-3 px-4 font-bold text-xs ${
                          theme === "beige" ? "text-slate-900" : "text-white"
                        }`}
                      >
                        ${asset.priceUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center space-x-0.5 font-bold px-1.5 py-0.5 rounded ${
                            isPositive
                              ? "text-emerald-500 bg-emerald-500/10"
                              : "text-rose-500 bg-rose-500/10"
                          }`}
                        >
                          {isPositive ? "+" : ""}
                          {asset.change24h}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-[11px]">
                        ${asset.high24h.toLocaleString()} / ${asset.low24h.toLocaleString()}
                      </td>
                      <td className={`py-3 px-4 font-bold ${theme === "beige" ? "text-slate-700" : "text-slate-300"}`}>
                        {asset.marketCap}
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        {asset.volume24h}
                      </td>
                      <td className="py-3 px-4 w-28">
                        <div className="h-9 w-24">
                          <SparklineChart
                            data={asset.sparkline}
                            isPositive={isPositive}
                            width={100}
                            height={36}
                            strokeWidth={1.8}
                            showGradient={true}
                            className="w-full h-full"
                          />
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAsset(asset);
                          }}
                          className="px-3 py-1 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition cursor-pointer"
                        >
                          {lang === "zh" ? "交易" : "Trade"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
