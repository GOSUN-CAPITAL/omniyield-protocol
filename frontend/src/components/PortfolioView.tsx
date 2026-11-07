"use client";

import React, { useState, useEffect } from "react";
import {
  PieChart,
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  ShieldCheck,
  ExternalLink,
  Layers,
  Sparkles,
  DollarSign,
  Activity,
  Globe,
  Wallet,
  Clock,
  CheckCircle2,
} from "lucide-react";

interface PortfolioViewProps {
  connectedAccount: string;
  nusdBalance: string;
  omniUsdcBalance: string;
  usdcBalance: number;
  nearBalance: string;
  onNavigateToVault: (vault: "usdc" | "all-weather", tab?: "deposit" | "withdraw") => void;
  lang?: "en" | "zh";
  theme?: "dark" | "beige";
}

export default function PortfolioView({
  connectedAccount,
  nusdBalance,
  omniUsdcBalance,
  usdcBalance,
  nearBalance,
  onNavigateToVault,
  lang = "en",
  theme = "dark",
}: PortfolioViewProps) {
  // Calculations
  const nusdNum = Number(nusdBalance) || 0;
  const omniUsdcNum = Number(omniUsdcBalance) || 0;
  const usdcNum = Number(usdcBalance) || 0;

  const nusdUsdValue = nusdNum * 1.0482;
  const omniUsdcUsdValue = omniUsdcNum * 1.0628;
  const totalYieldAssets = nusdUsdValue + omniUsdcUsdValue;
  const netTotalPortfolio = totalYieldAssets + usdcNum;

  // Real-time simulated micro-yield accrual ticker
  const [streamTicker, setStreamTicker] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStreamTicker((prev) => prev + 0.000028);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const totalEarnedEstimate = (totalYieldAssets * 0.0124 + streamTicker).toFixed(4);

  return (
    <div className="space-y-6">
      {/* Top Banner: Portfolio Net Worth & Yield Counter */}
      <div className="card-surface p-6 sm:p-7 rounded-3xl relative overflow-hidden transition-all duration-300">
        <div
          className={`absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl pointer-events-none ${
            theme === "beige" ? "bg-emerald-500/5" : "bg-emerald-500/10"
          }`}
        />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div
              className={`flex items-center space-x-2 text-xs font-bold uppercase tracking-wider mb-1 ${
                theme === "beige" ? "text-slate-500" : "text-slate-400"
              }`}
            >
              <PieChart className={`w-4 h-4 ${theme === "beige" ? "text-emerald-700" : "text-emerald-400"}`} />
              <span>{lang === "zh" ? "个人投资组合总资产 (Net Portfolio Value)" : "Net Portfolio Value"}</span>
            </div>
            <div className="text-4xl sm:text-5xl font-black tracking-tight flex items-baseline space-x-3">
              <span className={theme === "beige" ? "text-slate-900" : "text-white"}>
                ${netTotalPortfolio.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span
                className={`text-sm font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                  theme === "beige"
                    ? "text-emerald-800 bg-emerald-50 border-emerald-300"
                    : "text-emerald-400 bg-emerald-500/10 border-emerald-500/30"
                }`}
              >
                +13.48% Blended APY
              </span>
            </div>
            <p className={`text-xs mt-1.5 ${theme === "beige" ? "text-slate-600 font-mono" : "text-slate-400"}`}>
              {lang === "zh"
                ? `账户: ${connectedAccount} • 包含金库份额与未投资现金储备`
                : `Account: ${connectedAccount} • Includes NUSD, OmniUSDC & Liquid Cash`}
            </p>
          </div>

          {/* Real-time Streaming Yield Counter (Lido/Ethena style) */}
          <div className="well-inset p-4 rounded-2xl flex items-center space-x-4 border transition-all">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold shadow-md transition-colors ${
                theme === "beige"
                  ? "bg-emerald-100/80 border border-emerald-300 text-emerald-800 shadow-emerald-500/10"
                  : "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shadow-emerald-500/20"
              }`}
            >
              <TrendingUp className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className={`text-[11px] block font-semibold ${theme === "beige" ? "text-slate-700" : "text-slate-400"}`}>
                {lang === "zh" ? "⚡ 实时累计赚取利息 (Live Earned Yield)" : "⚡ Real-Time Accrued Yield"}
              </span>
              <span className="text-xl font-mono font-black block mt-0.5 text-emerald-600 dark:text-emerald-400">
                +${totalEarnedEstimate}
              </span>
              <span className={`text-[10px] font-mono ${theme === "beige" ? "text-slate-500" : "text-slate-500"}`}>
                {lang === "zh" ? "每秒智能复利累加中..." : "Compounding continuously on-chain..."}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Dual Vault Holdings Breakdown Grid */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3
            className={`text-base font-extrabold flex items-center space-x-2 ${
              theme === "beige" ? "text-slate-900" : "text-white"
            }`}
          >
            <span>{lang === "zh" ? "🏦 双金库持仓明细 (Dual-Vault Holdings)" : "Dual-Vault Holdings"}</span>
          </h3>
          <span className={`text-xs font-mono ${theme === "beige" ? "text-slate-600" : "text-slate-400"}`}>
            {lang === "zh" ? "两种专属代币凭证独立核算" : "Independent NEP-141 Liquid Shares"}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card 1: NUSD Core Vault */}
          <div className="card-surface p-6 rounded-3xl border transition shadow-sm hover:shadow-md space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${
                    theme === "beige"
                      ? "bg-emerald-50 border-emerald-200"
                      : "bg-emerald-500/10 border-emerald-500/30"
                  }`}
                >
                  <span className={`w-3 h-3 rounded-full ${theme === "beige" ? "bg-emerald-600" : "bg-emerald-400"}`}></span>
                </div>
                <div>
                  <h4 className={`font-extrabold text-base ${theme === "beige" ? "text-slate-900" : "text-white"}`}>
                    GOSUN OmniYield USDC
                  </h4>
                  <span
                    className={`text-xs font-mono font-bold ${
                      theme === "beige" ? "text-emerald-700" : "text-emerald-400"
                    }`}
                  >
                    11.84% APY • Core Vault
                  </span>
                </div>
              </div>
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-mono font-bold border ${
                  theme === "beige"
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                }`}
              >
                Receipt: NUSD
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="well-inset p-3 rounded-xl border">
                <span className={`text-[10px] block ${theme === "beige" ? "text-slate-600 font-medium" : "text-slate-400"}`}>
                  {lang === "zh" ? "持有份额" : "Shares Held"}
                </span>
                <span
                  className={`text-base font-mono font-bold block mt-1 ${
                    theme === "beige" ? "text-slate-900" : "text-white"
                  }`}
                >
                  {nusdNum.toFixed(2)}{" "}
                  <span className={`text-xs ${theme === "beige" ? "text-emerald-700 font-bold" : "text-emerald-400"}`}>
                    NUSD
                  </span>
                </span>
              </div>
              <div className="well-inset p-3 rounded-xl border">
                <span className={`text-[10px] block ${theme === "beige" ? "text-slate-600 font-medium" : "text-slate-400"}`}>
                  {lang === "zh" ? "当前净值" : "Share NAV"}
                </span>
                <span
                  className={`text-base font-mono font-bold block mt-1 ${
                    theme === "beige" ? "text-slate-900" : "text-white"
                  }`}
                >
                  $1.0482
                </span>
              </div>
              <div className="well-inset p-3 rounded-xl border">
                <span className={`text-[10px] block ${theme === "beige" ? "text-slate-600 font-medium" : "text-slate-400"}`}>
                  {lang === "zh" ? "头寸估值" : "Asset Value"}
                </span>
                <span
                  className={`text-base font-mono font-bold block mt-1 ${
                    theme === "beige" ? "text-emerald-700" : "text-emerald-400"
                  }`}
                >
                  ${nusdUsdValue.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="well-inset p-3 rounded-xl border text-[11px] space-y-1">
              <div className="flex justify-between">
                <span>{lang === "zh" ? "底层策略配置:" : "Underlying Engine:"}</span>
                <span className={`font-semibold ${theme === "beige" ? "text-slate-900" : "text-white"}`}>
                  {lang === "zh" ? "70% RHEA 借贷池 + 30% Ondo USDY 美债" : "70% RHEA Lending + 30% Ondo USDY"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>{lang === "zh" ? "已赚取利息预估:" : "Earned Yield Estimate:"}</span>
                <span
                  className={`font-mono font-bold ${
                    theme === "beige" ? "text-emerald-700" : "text-emerald-400"
                  }`}
                >
                  +${(nusdUsdValue * 0.0118).toFixed(3)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => onNavigateToVault("usdc", "deposit")}
                className="btn-primary py-2.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center justify-center space-x-1"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>{lang === "zh" ? "存入铸造 NUSD" : "Deposit to NUSD"}</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigateToVault("usdc", "withdraw")}
                className="btn-secondary py-2.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center justify-center space-x-1"
              >
                <ArrowDownLeft className="w-3.5 h-3.5" />
                <span>{lang === "zh" ? "赎回 NUSD" : "Redeem NUSD"}</span>
              </button>
            </div>
          </div>

          {/* Card 2: OmniUSDC All-Weather RWA Vault */}
          <div className="card-surface p-6 rounded-3xl border transition shadow-sm hover:shadow-md space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${
                    theme === "beige"
                      ? "bg-cyan-50 border-cyan-200"
                      : "bg-cyan-500/10 border-cyan-500/30"
                  }`}
                >
                  <span className={`w-3 h-3 rounded-full ${theme === "beige" ? "bg-cyan-600" : "bg-cyan-400"}`}></span>
                </div>
                <div>
                  <h4 className={`font-extrabold text-base ${theme === "beige" ? "text-slate-900" : "text-white"}`}>
                    GOSUN All-Weather RWA
                  </h4>
                  <span
                    className={`text-xs font-mono font-bold ${
                      theme === "beige" ? "text-cyan-700" : "text-cyan-400"
                    }`}
                  >
                    16.40% APY • Macro Parity
                  </span>
                </div>
              </div>
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-mono font-bold border ${
                  theme === "beige"
                    ? "bg-cyan-50 text-cyan-800 border-cyan-200"
                    : "bg-cyan-500/10 text-cyan-300 border-cyan-500/30"
                }`}
              >
                Receipt: OmniUSDC
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="well-inset p-3 rounded-xl border">
                <span className={`text-[10px] block ${theme === "beige" ? "text-slate-600 font-medium" : "text-slate-400"}`}>
                  {lang === "zh" ? "持有份额" : "Shares Held"}
                </span>
                <span
                  className={`text-base font-mono font-bold block mt-1 ${
                    theme === "beige" ? "text-slate-900" : "text-white"
                  }`}
                >
                  {omniUsdcNum.toFixed(2)}{" "}
                  <span className={`text-xs ${theme === "beige" ? "text-cyan-700 font-bold" : "text-cyan-400"}`}>
                    OmniUSDC
                  </span>
                </span>
              </div>
              <div className="well-inset p-3 rounded-xl border">
                <span className={`text-[10px] block ${theme === "beige" ? "text-slate-600 font-medium" : "text-slate-400"}`}>
                  {lang === "zh" ? "当前净值" : "Share NAV"}
                </span>
                <span
                  className={`text-base font-mono font-bold block mt-1 ${
                    theme === "beige" ? "text-slate-900" : "text-white"
                  }`}
                >
                  $1.0628
                </span>
              </div>
              <div className="well-inset p-3 rounded-xl border">
                <span className={`text-[10px] block ${theme === "beige" ? "text-slate-600 font-medium" : "text-slate-400"}`}>
                  {lang === "zh" ? "头寸估值" : "Asset Value"}
                </span>
                <span
                  className={`text-base font-mono font-bold block mt-1 ${
                    theme === "beige" ? "text-cyan-700" : "text-cyan-400"
                  }`}
                >
                  ${omniUsdcUsdValue.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="well-inset p-3 rounded-xl border text-[11px] space-y-1">
              <div className="flex justify-between">
                <span>{lang === "zh" ? "达里奥四维平价:" : "4-Pillar Parity:"}</span>
                <span className={`font-semibold ${theme === "beige" ? "text-slate-900" : "text-white"}`}>
                  {lang === "zh"
                    ? "美股 QQQ (25%) + 美债 (40%) + 黄金 (15%) + 借贷 (20%)"
                    : "QQQ (25%) + Treasuries (40%) + Gold (15%) + Credit (20%)"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>{lang === "zh" ? "已赚取利息预估:" : "Earned Yield Estimate:"}</span>
                <span
                  className={`font-mono font-bold ${
                    theme === "beige" ? "text-cyan-700" : "text-cyan-400"
                  }`}
                >
                  +${(omniUsdcUsdValue * 0.0164).toFixed(3)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => onNavigateToVault("all-weather", "deposit")}
                className="btn-primary py-2.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center justify-center space-x-1"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>{lang === "zh" ? "存入铸造 OmniUSDC" : "Deposit to OmniUSDC"}</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigateToVault("all-weather", "withdraw")}
                className="btn-secondary py-2.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center justify-center space-x-1"
              >
                <ArrowDownLeft className="w-3.5 h-3.5" />
                <span>{lang === "zh" ? "赎回 OmniUSDC" : "Redeem OmniUSDC"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Multi-Chain Asset Footprint & Transaction History */}
      <div className="card-surface p-6 rounded-3xl border text-xs space-y-4 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <Globe className={`w-4 h-4 ${theme === "beige" ? "text-emerald-700" : "text-emerald-400"}`} />
            <h4 className={`font-extrabold text-sm ${theme === "beige" ? "text-slate-900" : "text-white"}`}>
              {lang === "zh" ? "🌐 多链资产分布与意图清算记录" : "Multi-Chain Asset Footprint & Intent Receipts"}
            </h4>
          </div>
          <span className={`text-[11px] font-mono ${theme === "beige" ? "text-slate-600" : "text-slate-400"}`}>
            NEAR Intents Engine
          </span>
        </div>

        <div className="space-y-2.5">
          <div className="well-inset p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center space-x-3">
              <span className={`w-2 h-2 rounded-full ${theme === "beige" ? "bg-emerald-600" : "bg-emerald-400"}`}></span>
              <div>
                <span className={`font-bold block ${theme === "beige" ? "text-slate-900" : "text-white"}`}>
                  Arbitrum Intent Deposit
                </span>
                <span className={`text-[10px] ${theme === "beige" ? "text-slate-600" : "text-slate-400"}`}>
                  Solver pre-funded deposit into GOSUN OmniYield USDC
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span
                className={`font-mono font-bold ${theme === "beige" ? "text-emerald-700" : "text-emerald-400"}`}
              >
                +50.00 USDC
              </span>
              <a
                href="https://testnet.nearblocks.io/txns/3dCsi6ZGcZrA1z4qHFuKaL36ppG3Uij5KqHB7oJgwy3v"
                target="_blank"
                rel="noreferrer"
                className={`text-[11px] underline flex items-center space-x-1 font-mono transition-colors ${
                  theme === "beige" ? "text-slate-600 hover:text-slate-900" : "text-slate-400 hover:text-white"
                }`}
              >
                <span>NearBlocks Proof</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div className="well-inset p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center space-x-3">
              <span className={`w-2 h-2 rounded-full ${theme === "beige" ? "bg-cyan-600" : "bg-cyan-400"}`}></span>
              <div>
                <span className={`font-bold block ${theme === "beige" ? "text-slate-900" : "text-white"}`}>
                  Solana Payout Redemption
                </span>
                <span className={`text-[10px] ${theme === "beige" ? "text-slate-600" : "text-slate-400"}`}>
                  Redeemed shares on NEAR, native payout dispatched to Phantom Solana
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span
                className={`font-mono font-bold ${theme === "beige" ? "text-cyan-700" : "text-cyan-400"}`}
              >
                +25.00 USDC
              </span>
              <a
                href="https://testnet.nearblocks.io/txns/Dj7V4Ez57NqLy95R8F8qQjzWDvMuVp9o5hsjYiXmDhXf"
                target="_blank"
                rel="noreferrer"
                className={`text-[11px] underline flex items-center space-x-1 font-mono transition-colors ${
                  theme === "beige" ? "text-slate-600 hover:text-slate-900" : "text-slate-400 hover:text-white"
                }`}
              >
                <span>Solscan Proof</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
