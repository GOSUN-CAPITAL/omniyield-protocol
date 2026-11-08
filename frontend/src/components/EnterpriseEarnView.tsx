"use client";

import React, { useState } from "react";
import {
  Code2,
  Copy,
  Check,
  Building2,
  ShieldCheck,
  Zap,
  Globe,
  TrendingUp,
  Layers,
  ArrowRight,
  ExternalLink,
  Sliders,
  DollarSign,
  Sparkles,
  Terminal,
  Cpu,
  RefreshCw,
  Wallet,
} from "lucide-react";

interface EnterpriseEarnViewProps {
  connectedAccount?: string;
  lang?: "en" | "zh";
  theme?: "dark" | "beige";
}

export default function EnterpriseEarnView({
  connectedAccount = "",
  lang = "zh",
  theme = "dark",
}: EnterpriseEarnViewProps) {
  // Widget Customizer State
  const [partnerId, setPartnerId] = useState("partner_phantom_alpha");
  const [selectedChain, setSelectedChain] = useState<"solana" | "arbitrum" | "base" | "all">("solana");
  const [selectedVault, setSelectedVault] = useState<"all-weather" | "usdc">("all-weather");
  const [widgetTheme, setWidgetTheme] = useState<"dark" | "beige">(theme === "beige" ? "beige" : "dark");
  const [accentColor, setAccentColor] = useState<"emerald" | "cyan" | "purple" | "amber">("emerald");

  // Keep widgetTheme synchronized when user toggles global site theme
  React.useEffect(() => {
    setWidgetTheme(theme === "beige" ? "beige" : "dark");
  }, [theme]);

  // Code Tab State
  const [activeCodeTab, setActiveCodeTab] = useState<"react" | "html" | "api" | "telegram">("react");
  const [copiedCode, setCopiedCode] = useState(false);

  // Revenue Simulator Slider ($50k to $10M)
  const [partnerTvl, setPartnerTvl] = useState<number>(1000000); // 1M default

  // Widget Interactive Preview State
  const [testDepositAmount, setTestDepositAmount] = useState<string>("500");
  const [simulatedTxSuccess, setSimulatedTxSuccess] = useState(false);

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const getAccentClass = () => {
    switch (accentColor) {
      case "cyan":
        return "text-cyan-400 border-cyan-500/40 bg-cyan-500/10";
      case "purple":
        return "text-purple-400 border-purple-500/40 bg-purple-500/10";
      case "amber":
        return "text-amber-400 border-amber-500/40 bg-amber-500/10";
      default:
        return "text-emerald-400 border-emerald-500/40 bg-emerald-500/10";
    }
  };

  const getBtnAccent = () => {
    switch (accentColor) {
      case "cyan":
        return "bg-cyan-500 hover:bg-cyan-400 text-slate-950";
      case "purple":
        return "bg-purple-500 hover:bg-purple-400 text-white";
      case "amber":
        return "bg-amber-500 hover:bg-amber-400 text-slate-950";
      default:
        return "bg-emerald-500 hover:bg-emerald-400 text-slate-950";
    }
  };

  // Generate code snippet based on active configuration
  const getCodeSnippet = () => {
    if (activeCodeTab === "react") {
      return `// 1. 安装 OmniYield 企业级嵌入式 SDK
npm install @omniyield/earn-sdk

// 2. 在您的 Web3 钱包、新银行或 DeFi DApp 中引入组件
import React from "react";
import { OmniYieldEarnWidget } from "@omniyield/earn-sdk";

export function PartnerEarnPage() {
  return (
    <div className="w-full max-w-md mx-auto p-4">
      <OmniYieldEarnWidget
        partnerId="${partnerId}"
        chain="${selectedChain}"
        defaultVault="${selectedVault}"
        theme="${widgetTheme}"
        accentColor="${accentColor}"
        onDepositConfirmed={(receipt) => {
          console.log("Customer earned yield:", receipt.sharesMinted);
        }}
      />
    </div>
  );
}`;
    }

    if (activeCodeTab === "html") {
      return `<!-- OmniYield 零依赖极速 Web 嵌入代码 (支持 Webflow / 任意前端) -->
<div id="omniyield-earn-container" 
     data-partner-id="${partnerId}"
     data-chain="${selectedChain}"
     data-vault="${selectedVault}"
     data-theme="${widgetTheme}"
     style="width: 100%; max-width: 440px; margin: 0 auto;">
</div>

<script src="https://cdn.omniyield.3691618.xyz/sdk/v2/earn-embed.min.js" async></script>`;
    }

    if (activeCodeTab === "api") {
      return `// Headless REST API 集成（适用于后端与量化交易柜台）
curl -X POST https://omniyield.3691618.xyz/api/transact \\
  -H "Content-Type: application/json" \\
  -H "X-Partner-ID: ${partnerId}" \\
  -d '{
    "accountId": "0x9a920a096070b8fb8fde145197bcef40b0a3258a",
    "action": "deposit",
    "amount": 1000,
    "originChain": "${selectedChain === "solana" ? "Solana" : "Arbitrum"}",
    "vault": "${selectedVault}",
    "destChain": "NEAR"
  }'

// 返回值: 包含亚秒级 NEAR 意图清算哈希与分发商分润流水存证`;
    }

    return `// Telegram WebApp (TON / Mini-App 一键嵌入)
const tgUrl = "https://omniyield.3691618.xyz/embed" + 
  "?partner=${partnerId}" +
  "&chain=${selectedChain}" +
  "&theme=${widgetTheme}" +
  "&vault=${selectedVault}";

// 在 Telegram Bot 中直接打开 WebApp:
bot.onText(/\\/earn/, (msg) => {
  bot.sendMessage(msg.chat.id, "开启全链高收益金库:", {
    reply_markup: {
      inline_keyboard: [[
        { text: "🚀 启动嵌入式理财", web_app: { url: tgUrl } }
      ]]
    }
  });
});`;
  };

  // Calculator outputs
  const estimatedGrossApy = selectedVault === "all-weather" ? 16.4 : 11.84;
  const partnerAnnualFee = (partnerTvl * 0.0035).toLocaleString("en-US", { maximumFractionDigits: 0 });
  const clientAnnualReturn = (partnerTvl * (estimatedGrossApy / 100)).toLocaleString("en-US", { maximumFractionDigits: 0 });

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-10">
      {/* =========================================================================
          HERO BANNER: Enterprise Earn Stack Positioning
      ========================================================================= */}
      <div className={`relative rounded-3xl overflow-hidden border p-6 sm:p-10 shadow-2xl transition-colors duration-300 ${
        theme === "beige"
          ? "bg-white border-[#ded3c4] shadow-sm"
          : "bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950/40 border-emerald-500/30"
      }`}>
        {theme !== "beige" && (
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        )}
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-mono font-bold border ${
            theme === "beige"
              ? "bg-emerald-50 border-emerald-300 text-emerald-800"
              : "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
          }`}>
            <Sparkles className="w-3.5 h-3.5" />
            <span>{lang === "zh" ? "面向金融机构与 Web3 平台的嵌入式收益基础设施" : "Enterprise Embedded Earn Stack (B2B2C)"}</span>
          </div>

          <h1 className={`text-3xl sm:text-4xl font-black tracking-tight ${
            theme === "beige" ? "text-slate-900" : "text-white"
          }`}>
            {lang === "zh" ? "三行代码，让您的产品即刻拥有全链收益能力" : "Embed Chain-Abstracted On-Chain Earn in Minutes"}
          </h1>

          <p className={`text-sm sm:text-base leading-relaxed ${
            theme === "beige" ? "text-slate-600" : "text-slate-300"
          }`}>
            {lang === "zh"
              ? "基于 OmniYield 全链企业级堆栈架构，OmniYield 为加密钱包、新银行、交易所与 Telegram 小程序提供标准化无托管理财中间件。底层基于 NEAR 链抽象与多链意图，支持自营与 TO B 双轨驱动，零托管风险、多链聚合、前端体验永不中断。"
              : "Powered by the OmniYield Enterprise Earn Stack (OEES™), OmniYield enables fintechs, exchanges, and wallets to offer high-yield on-chain vaults to their users. Combining NEAR Chain Abstraction with multi-chain franchise expansion, it provides non-custodial custody, unified accounting, and sub-second intent settlements."}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className={`p-3 rounded-xl border space-y-1 ${
              theme === "beige" ? "bg-stone-50 border-[#ded3c4]" : "bg-slate-900/80 border-slate-800"
            }`}>
              <span className={`text-[11px] block font-medium ${theme === "beige" ? "text-slate-500" : "text-slate-400"}`}>
                {lang === "zh" ? "稳定币主导资金" : "Stablecoin Base"}
              </span>
              <span className={`text-base sm:text-lg font-black font-mono ${theme === "beige" ? "text-slate-900" : "text-white"}`}>
                70%+ USDC
              </span>
            </div>
            <div className={`p-3 rounded-xl border space-y-1 ${
              theme === "beige" ? "bg-stone-50 border-[#ded3c4]" : "bg-slate-900/80 border-slate-800"
            }`}>
              <span className={`text-[11px] block font-medium ${theme === "beige" ? "text-slate-500" : "text-slate-400"}`}>
                {lang === "zh" ? "多链账户抽象" : "Chains Supported"}
              </span>
              <span className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">
                EVM + Solana
              </span>
            </div>
            <div className={`p-3 rounded-xl border space-y-1 ${
              theme === "beige" ? "bg-stone-50 border-[#ded3c4]" : "bg-slate-900/80 border-slate-800"
            }`}>
              <span className={`text-[11px] block font-medium ${theme === "beige" ? "text-slate-500" : "text-slate-400"}`}>
                {lang === "zh" ? "分发商分润" : "Partner Rebate"}
              </span>
              <span className="text-base sm:text-lg font-black text-cyan-600 dark:text-cyan-400 font-mono">
                0.35% TVL/Yr
              </span>
            </div>
            <div className={`p-3 rounded-xl border space-y-1 ${
              theme === "beige" ? "bg-stone-50 border-[#ded3c4]" : "bg-slate-900/80 border-slate-800"
            }`}>
              <span className={`text-[11px] block font-medium ${theme === "beige" ? "text-slate-500" : "text-slate-400"}`}>
                {lang === "zh" ? "清算与安全" : "Settlement"}
              </span>
              <span className="text-base sm:text-lg font-black text-amber-600 dark:text-amber-400 font-mono">
                NEAR Intents
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          INTERACTIVE WIDGET PLAYGROUND (Live Customization + Preview)
      ========================================================================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {lang === "zh" ? "嵌入式组件在线调试工坊 (Live SDK Playground)" : "Live Earn Widget Playground"}
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {lang === "zh" ? "实时模拟客户端嵌入效果" : "Real-time embed simulator"}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT 5 COLS: Controls & Parameters */}
          <div className="lg:col-span-5 rounded-2xl border p-5 space-y-4 card-surface">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>{lang === "zh" ? "配置嵌入参数 (Widget Config)" : "Widget Configuration"}</span>
            </h3>

            {/* Partner ID Input */}
            <div className="space-y-1">
              <label className={`text-xs font-semibold block ${theme === "beige" ? "text-slate-600" : "text-slate-400"}`}>
                {lang === "zh" ? "分发商专属合作标识 (Partner ID)" : "Distributor Partner ID"}
              </label>
              <input
                type="text"
                value={partnerId}
                onChange={(e) => setPartnerId(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl text-sm font-mono border focus:outline-none ${
                  theme === "beige"
                    ? "bg-white border-[#ded3c4] text-emerald-700 focus:border-emerald-600"
                    : "bg-slate-900 border-slate-800 text-emerald-400 focus:border-emerald-500"
                }`}
                placeholder="partner_id_here"
              />
              <span className={`text-[10px] block ${theme === "beige" ? "text-slate-500" : "text-slate-500"}`}>
                {lang === "zh" ? "用于链上溯源与分发商自动分润结算 (Rebate Key)" : "Tracks on-chain TVL and settles distributor yield revenue"}
              </span>
            </div>

            {/* Target Chain Selector */}
            <div className="space-y-1">
              <label className={`text-xs font-semibold block ${theme === "beige" ? "text-slate-600" : "text-slate-400"}`}>
                {lang === "zh" ? "接入目标公链 (Target Chain)" : "Target Blockchain"}
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(["solana", "arbitrum", "base", "all"] as const).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setSelectedChain(c)}
                    className={`py-2 text-xs font-bold rounded-xl border transition cursor-pointer capitalize ${
                      selectedChain === c
                        ? theme === "beige"
                          ? "bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs"
                          : "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                        : theme === "beige"
                        ? "bg-white border-[#ded3c4] text-slate-600 hover:text-slate-900"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Default Vault Selector */}
            <div className="space-y-1">
              <label className={`text-xs font-semibold block ${theme === "beige" ? "text-slate-600" : "text-slate-400"}`}>
                {lang === "zh" ? "预设金库策略 (Default Strategy)" : "Default Vault Strategy"}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedVault("all-weather")}
                  className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                    selectedVault === "all-weather"
                      ? theme === "beige"
                        ? "bg-cyan-50 border-cyan-500 text-cyan-800 shadow-xs"
                        : "bg-cyan-500/15 border-cyan-500 text-cyan-400"
                      : theme === "beige"
                      ? "bg-white border-[#ded3c4] text-slate-600 hover:text-slate-900"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  <span className="block text-xs font-bold">OmniUSDC 全天候</span>
                  <span className={`block text-[11px] font-mono font-black ${
                    theme === "beige" ? "text-cyan-700" : "text-cyan-400"
                  }`}>16.40% APY</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedVault("usdc")}
                  className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                    selectedVault === "usdc"
                      ? theme === "beige"
                        ? "bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs"
                        : "bg-emerald-500/15 border-emerald-500 text-emerald-400"
                      : theme === "beige"
                      ? "bg-white border-[#ded3c4] text-slate-600 hover:text-slate-900"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  <span className="block text-xs font-bold">NUSD 核心借贷</span>
                  <span className={`block text-[11px] font-mono font-black ${
                    theme === "beige" ? "text-emerald-700" : "text-emerald-400"
                  }`}>11.84% APY</span>
                </button>
              </div>
            </div>

            {/* Accent Color & Theme */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className={`text-xs font-semibold block mb-1 ${theme === "beige" ? "text-slate-600" : "text-slate-400"}`}>
                  {lang === "zh" ? "主题外观" : "Theme"}
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setWidgetTheme("dark")}
                    className={`py-1.5 text-xs font-semibold rounded-lg border transition ${
                      widgetTheme === "dark"
                        ? "bg-slate-800 border-emerald-500 text-white"
                        : theme === "beige"
                        ? "bg-white border-[#ded3c4] text-slate-500 hover:text-slate-900"
                        : "bg-slate-950 border-slate-800 text-slate-500"
                    }`}
                  >
                    Dark
                  </button>
                  <button
                    type="button"
                    onClick={() => setWidgetTheme("beige")}
                    className={`py-1.5 text-xs font-semibold rounded-lg border transition ${
                      widgetTheme === "beige"
                        ? "bg-amber-100 border-amber-600 text-slate-900 font-bold"
                        : theme === "beige"
                        ? "bg-white border-[#ded3c4] text-slate-500 hover:text-slate-900"
                        : "bg-slate-950 border-slate-800 text-slate-500"
                    }`}
                  >
                    Beige
                  </button>
                </div>
              </div>

              <div>
                <label className={`text-xs font-semibold block mb-1 ${theme === "beige" ? "text-slate-600" : "text-slate-400"}`}>
                  {lang === "zh" ? "品牌色调" : "Accent Color"}
                </label>
                <div className="flex items-center space-x-2 pt-0.5">
                  {(["emerald", "cyan", "purple", "amber"] as const).map((clr) => (
                    <button
                      key={clr}
                      type="button"
                      onClick={() => setAccentColor(clr)}
                      className={`w-7 h-7 rounded-full border-2 transition ${
                        accentColor === clr ? "scale-110 border-white ring-2 ring-emerald-500" : "opacity-60 hover:opacity-100 border-transparent"
                      } ${
                        clr === "emerald"
                          ? "bg-emerald-500"
                          : clr === "cyan"
                          ? "bg-cyan-500"
                          : clr === "purple"
                          ? "bg-purple-500"
                          : "bg-amber-500"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT 7 COLS: Live Rendered Embedded Widget Simulator */}
          <div className={`lg:col-span-7 flex flex-col items-center justify-center p-6 sm:p-8 rounded-2xl border border-dashed relative ${
            theme === "beige" ? "bg-white border-[#ded3c4]" : "bg-slate-950/60 border-slate-800"
          }`}>
            <div className={`absolute top-3 left-3 text-[10px] font-mono flex items-center space-x-1 ${
              theme === "beige" ? "text-slate-500" : "text-slate-500"
            }`}>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>LIVE EMBEDDED WIDGET (420px)</span>
            </div>

            {/* The Actual Rendered Embedded Widget */}
            <div
              className={`w-full max-w-[420px] rounded-2xl border p-5 shadow-2xl transition-all ${
                widgetTheme === "beige"
                  ? "bg-[#FAF7F0] border-[#E5DECF] text-slate-900 shadow-sm"
                  : "bg-[#0F172A] border-slate-800 text-slate-100 shadow-emerald-950/30"
              }`}
            >
              {/* Partner White-label Header */}
              <div className={`flex items-center justify-between border-b pb-3 ${
                widgetTheme === "beige" ? "border-slate-200" : "border-slate-800/80"
              }`}>
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center font-bold text-emerald-500 text-xs">
                    {partnerId.slice(8, 10).toUpperCase() || "PA"}
                  </div>
                  <div>
                    <span className="text-xs font-bold block">{partnerId}</span>
                    <span className={`text-[10px] block font-mono ${
                      widgetTheme === "beige" ? "text-slate-500" : "text-slate-400"
                    }`}>
                      {selectedChain.toUpperCase()} Earn Portal
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-[10px] block ${
                    widgetTheme === "beige" ? "text-slate-500" : "text-slate-400"
                  }`}>Target APY</span>
                  <span className="text-xs font-mono font-black text-emerald-500">
                    +{selectedVault === "all-weather" ? "16.40%" : "11.84%"}
                  </span>
                </div>
              </div>

              {/* Deposit Card Inside Widget */}
              <div className="py-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className={`font-medium ${widgetTheme === "beige" ? "text-slate-600" : "text-slate-400"}`}>
                    Deposit Amount
                  </span>
                  <span className={`font-mono ${widgetTheme === "beige" ? "text-slate-600" : "text-slate-400"}`}>
                    Available: <b className="text-emerald-500 font-bold">1,500 USDC</b>
                  </span>
                </div>

                <div className={`flex items-center rounded-xl border p-2.5 ${
                  widgetTheme === "beige" ? "bg-white border-slate-200" : "bg-slate-900 border-slate-800"
                }`}>
                  <input
                    type="number"
                    value={testDepositAmount}
                    onChange={(e) => setTestDepositAmount(e.target.value)}
                    className={`bg-transparent flex-1 text-lg font-mono font-bold focus:outline-none ${
                      widgetTheme === "beige" ? "text-slate-900" : "text-white"
                    }`}
                    placeholder="0.00"
                  />
                  <div className={`flex items-center space-x-1.5 font-bold text-xs px-2 py-1 rounded-lg ${
                    widgetTheme === "beige" ? "bg-slate-100 text-slate-800" : "bg-slate-800 text-slate-200"
                  }`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/logos/usdc.svg" alt="USDC" className="w-4 h-4 rounded-full" />
                    <span>USDC</span>
                  </div>
                </div>

                {/* Output estimate */}
                <div className={`p-2.5 rounded-xl border text-xs space-y-1 ${
                  widgetTheme === "beige" ? "bg-white/80 border-slate-200" : "bg-slate-900/60 border-slate-800/60"
                }`}>
                  <div className={`flex items-center justify-between text-[11px] ${
                    widgetTheme === "beige" ? "text-slate-600" : "text-slate-400"
                  }`}>
                    <span>Expected Shares:</span>
                    <span className={`font-mono font-bold ${
                      widgetTheme === "beige" ? "text-slate-900" : "text-slate-200"
                    }`}>
                      ~{(Number(testDepositAmount || 0) / 1.0482).toFixed(2)}{" "}
                      {selectedVault === "all-weather" ? "OmniUSDC" : "NUSD"}
                    </span>
                  </div>
                  <div className={`flex items-center justify-between text-[11px] ${
                    widgetTheme === "beige" ? "text-slate-600" : "text-slate-400"
                  }`}>
                    <span>Settlement:</span>
                    <span className="text-emerald-500 font-bold flex items-center space-x-1">
                      <Zap className="w-3 h-3" />
                      <span>NEAR Intent (0 Gas for User)</span>
                    </span>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  type="button"
                  onClick={() => {
                    setSimulatedTxSuccess(true);
                    setTimeout(() => setSimulatedTxSuccess(false), 3000);
                  }}
                  className={`w-full py-3 rounded-xl font-bold text-xs transition cursor-pointer shadow-lg flex items-center justify-center space-x-2 ${getBtnAccent()}`}
                >
                  {simulatedTxSuccess ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Earn Active · On-Chain Finalized!</span>
                    </>
                  ) : (
                    <>
                      <Wallet className="w-4 h-4" />
                      <span>1-Click Deposit via {selectedChain === "solana" ? "Phantom" : "MetaMask"}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Watermark Branding */}
              <div className={`border-t pt-2 flex items-center justify-between text-[10px] font-mono ${
                widgetTheme === "beige" ? "border-slate-200 text-slate-500" : "border-slate-800/80 text-slate-500"
              }`}>
                <span>Infrastructure: OmniYield Meta-Vault</span>
                <span>Non-Custodial</span>
              </div>
            </div>

            <p className="mt-4 text-xs text-slate-500 text-center max-w-sm">
              {lang === "zh"
                ? "这是您的终端客户将在您的钱包或 App 内看到的真实界面。所有资产直接进入链上金库，您的机构自动按月获得 TVL 分润。"
                : "This is the exact UI your users will interact with. All deposits route into the non-custodial meta-vault, with your platform earning fee share."}
            </p>
          </div>
        </div>
      </div>

      {/* =========================================================================
          CODE GENERATOR & INTEGRATION TABS (One-Click Copy)
      ========================================================================= */}
      <div className="rounded-2xl border card-surface p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Code2 className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {lang === "zh" ? "多端接入代码生成器 (Integration Code)" : "Integration Code Snippets"}
            </h3>
          </div>

          {/* Code Tab Switcher */}
          <div className={`flex items-center space-x-1.5 p-1 rounded-xl border ${
            theme === "beige" ? "bg-stone-50 border-[#ded3c4]" : "bg-slate-900 border-slate-800"
          }`}>
            <button
              type="button"
              onClick={() => setActiveCodeTab("react")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeCodeTab === "react"
                  ? "bg-emerald-500 text-slate-950 font-bold"
                  : theme === "beige"
                  ? "text-slate-600 hover:text-slate-900"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              React / Next.js
            </button>
            <button
              type="button"
              onClick={() => setActiveCodeTab("html")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeCodeTab === "html"
                  ? "bg-emerald-500 text-slate-950 font-bold"
                  : theme === "beige"
                  ? "text-slate-600 hover:text-slate-900"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              HTML Script
            </button>
            <button
              type="button"
              onClick={() => setActiveCodeTab("api")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeCodeTab === "api"
                  ? "bg-emerald-500 text-slate-950 font-bold"
                  : theme === "beige"
                  ? "text-slate-600 hover:text-slate-900"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Headless API
            </button>
            <button
              type="button"
              onClick={() => setActiveCodeTab("telegram")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeCodeTab === "telegram"
                  ? "bg-emerald-500 text-slate-950 font-bold"
                  : theme === "beige"
                  ? "text-slate-600 hover:text-slate-900"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Telegram Mini-App
            </button>
          </div>
        </div>

        {/* Code Display Area */}
        <div className={`relative rounded-xl border p-4 font-mono text-xs overflow-x-auto ${
          theme === "beige"
            ? "bg-[#FAF7F0] border-[#ded3c4] text-slate-800"
            : "bg-slate-950 border-slate-800 text-slate-200"
        }`}>
          <button
            type="button"
            onClick={() => handleCopyCode(getCodeSnippet())}
            className={`absolute top-3 right-3 px-3 py-1.5 rounded-lg text-xs font-sans border transition flex items-center space-x-1.5 cursor-pointer shadow-md ${
              theme === "beige"
                ? "bg-white border-[#ded3c4] text-slate-700 hover:bg-stone-50"
                : "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
            }`}
          >
            {copiedCode ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-500 font-bold">{lang === "zh" ? "已复制" : "Copied"}</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>{lang === "zh" ? "复制代码" : "Copy Code"}</span>
              </>
            )}
          </button>
          <pre className="pr-20 leading-relaxed">{getCodeSnippet()}</pre>
        </div>
      </div>

      {/* =========================================================================
          PARTNER REVENUE SIMULATOR (B2B 商业分成测算器)
      ========================================================================= */}
      <div className="rounded-2xl border card-surface p-6 sm:p-8 space-y-6">
        <div className="flex items-center space-x-2">
          <DollarSign className="w-5 h-5 text-emerald-400" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {lang === "zh" ? "合作伙伴商业分成与留存收益测算器" : "Distributor Revenue & Retention Calculator"}
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <span className={`text-sm font-semibold ${theme === "beige" ? "text-slate-700" : "text-slate-300"}`}>
                {lang === "zh" ? "预估您平台带来的用户理财规模 (Projected Partner TVL):" : "Projected User TVL:"}
              </span>
              <span className="text-xl font-mono font-black text-emerald-600 dark:text-emerald-400">
                ${partnerTvl.toLocaleString()}
              </span>
            </div>

            <input
              type="range"
              min={100000}
              max={10000000}
              step={100000}
              value={partnerTvl}
              onChange={(e) => setPartnerTvl(Number(e.target.value))}
              className={`w-full h-2 rounded-lg accent-emerald-500 cursor-pointer ${
                theme === "beige" ? "bg-stone-200" : "bg-slate-800"
              }`}
            />

            <div className="flex justify-between text-[11px] text-slate-500 font-mono">
              <span>$100K (Early Stage)</span>
              <span>$2.5M</span>
              <span>$5M</span>
              <span>$10M+ (Enterprise Scale)</span>
            </div>

            <p className={`text-xs leading-relaxed ${theme === "beige" ? "text-slate-600" : "text-slate-400"}`}>
              {lang === "zh"
                ? "根据 OmniYield 企业级收益模型，分发加盟商（Distributor）无需分担任何清算与智能合约风险，即可享受 0.35% 的持续性年化 TVL 抽成，按块实时结清至您的链上金库。"
                : "Under OmniYield's B2B franchise economics, distributors earn a 0.35% recurring annual fee based on client TVL with zero balance-sheet risk or capital outlay, settled in real-time."}
            </p>
          </div>

          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
            <div className={`p-4 rounded-xl border space-y-1 ${
              theme === "beige"
                ? "bg-white border-emerald-300 shadow-xs"
                : "bg-slate-900/90 border-emerald-500/30"
            }`}>
              <span className={`text-xs font-medium block ${theme === "beige" ? "text-slate-600" : "text-slate-400"}`}>
                {lang === "zh" ? "分发商预计年化分成收入 (Your Annual Rebate)" : "Your Projected Annual Fee Share"}
              </span>
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                +${partnerAnnualFee} <span className="text-xs font-normal text-slate-400">/ yr</span>
              </span>
            </div>

            <div className={`p-4 rounded-xl border space-y-1 ${
              theme === "beige"
                ? "bg-white border-cyan-300 shadow-xs"
                : "bg-slate-900/90 border-cyan-500/30"
            }`}>
              <span className={`text-xs font-medium block ${theme === "beige" ? "text-slate-600" : "text-slate-400"}`}>
                {lang === "zh" ? "为您的终端用户带来的年收益总额" : "Annual Yield Delivered to Clients"}
              </span>
              <span className="text-2xl font-black text-cyan-600 dark:text-cyan-400 font-mono">
                +${clientAnnualReturn} <span className="text-xs font-normal text-slate-400">/ yr</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

