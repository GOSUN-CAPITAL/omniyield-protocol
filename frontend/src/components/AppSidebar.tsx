"use client";

import React, { useState, useEffect } from "react";
import {
  PieChart,
  BrainCircuit,
  BarChart3,
  ShieldCheck,
  ChevronsLeft,
  ChevronsRight,
  User,
  Copy,
  Check,
  Settings,
  Wallet,
  Clock,
  ShieldAlert,
  Cpu,
  RotateCcw,
  Sliders,
  DollarSign,
  ArrowLeftRight,
  Coins,
  Sparkles,
  Plug,
  ChevronDown,
  ChevronRight,
  Key,
  RefreshCw,
  Puzzle,
  Scale,
  Lock,
  Globe,
  Layers,
  Activity,
  FileText,
  Code2,
} from "lucide-react";
import GovernanceIcon from "./GovernanceIcon";

export type NavTabType = "vaults" | "exchange" | "markets" | "portfolio" | "ai-copilot" | "enterprise";
export type BacksideDomainType = "vaults" | "exchange" | "markets" | "portfolio" | "ai";

interface AppSidebarProps {
  activeNav: NavTabType;
  onSelectNav: (tab: NavTabType) => void;
  activeVault: "usdc" | "all-weather";
  onSelectVault: (vault: "usdc" | "all-weather") => void;
  isFlipped: boolean;
  onToggleFlip: () => void;
  connectedAccount: string;
  connectedWallet: string;
  nearBalance: string;
  usdcBalance: number;
  nusdBalance: string;
  omniUsdcBalance: string;
  pendingProposalCount: number;
  onOpenWalletModal: () => void;
  onOpenAccountDrawer: () => void;
  onOpenSettings?: () => void;
  lang?: "en" | "zh";
  theme?: "dark" | "beige";
  activeBacksideNav?: BacksideDomainType;
  onSelectBacksideNav?: (domain: BacksideDomainType) => void;
}

/**
 * Rhea Finance Style Dedicated DeFi Vault Door SVG Vector Icon
 */
function VaultDoorIcon({
  className = "w-5 h-5",
  strokeWidth = 2,
}: {
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="2.5" y="3" width="19" height="18" rx="3" ry="3" />
      <line x1="2.5" y1="7" x2="5" y2="7" />
      <line x1="2.5" y1="17" x2="5" y2="17" />
      <circle cx="12.5" cy="12" r="4.5" />
      <line x1="12.5" y1="7.5" x2="12.5" y2="9" />
      <line x1="12.5" y1="15" x2="12.5" y2="16.5" />
      <line x1="8" y1="12" x2="9.5" y2="12" />
      <line x1="15.5" y1="12" x2="17" y2="12" />
      <circle cx="12.5" cy="12" r="1.3" fill="currentColor" />
      <line x1="19.5" y1="10.5" x2="19.5" y2="13.5" strokeWidth={2.5} />
    </svg>
  );
}

/**
 * Bitcoin Coin Logo Component (₿)
 * Loads from /logos/btc.svg with graceful vector fallback.
 * Allows easy drop-in replacement by putting a new btc.svg in the LOGO/ directory.
 */
function BitcoinIcon({ className = "w-4 h-4" }: { className?: string }) {
  const [useFallback, setUseFallback] = useState(false);

  if (!useFallback) {
    return (
      <img
        src="/logos/btc.svg"
        alt="Bitcoin"
        className={`${className} object-contain`}
        onError={() => setUseFallback(true)}
      />
    );
  }

  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      aria-hidden="true"
    >
      <circle cx="50" cy="50" r="48" fill="#F7931A" stroke="#E27602" strokeWidth="1.5" />
      <path
        fill="#FFFFFF"
        d="M68.7 42.4c1.1-7.2-4.4-11.1-11.9-13.7l2.4-9.8-6-1.5-2.4 9.5c-1.6-.4-3.2-.8-4.8-1.1l2.4-9.6-6-1.5-2.4 9.8c-1.3-.3-2.6-.6-3.8-.9l-.1-.3-8.3-2.1-1.6 6.4s4.5 1 4.4 1.1c2.4.6 2.9 2.2 2.8 3.5l-2.8 11.3c.2.1.4.1.6.2l-.6-.2-3.9 15.8c-.3.7-.9 1.8-2.6 1.3.1.1-4.4-1.1-4.4-1.1L10 68.3l7.8 2c1.5.4 2.9.8 4.3 1.1l-2.5 9.9 6 1.5 2.4-9.8c1.6.4 3.2.8 4.8 1.1l-2.4 9.7 6 1.5 2.5-9.9c10.3 1.9 18 1.2 21.2-8.1 2.6-7.5-.1-11.8-5.6-14.6 4-1 7-3.5 7.8-8.9zm-13.9 19.5c-1.9 7.5-14.5 3.4-18.6 2.4l3.3-13.3c4.1 1 17.3 3 15.3 10.9zm1.9-19.6c-1.7 6.9-12.2 3.4-15.6 2.6l3-12.1c3.4.9 14.4 2.5 12.6 9.5z"
      />
    </svg>
  );
}

export default function AppSidebar({
  activeNav,
  onSelectNav,
  activeVault,
  onSelectVault,
  isFlipped,
  onToggleFlip,
  connectedAccount,
  connectedWallet,
  nearBalance,
  usdcBalance,
  nusdBalance,
  omniUsdcBalance,
  pendingProposalCount,
  onOpenWalletModal,
  onOpenAccountDrawer,
  onOpenSettings,
  lang = "en",
  theme = "dark",
  activeBacksideNav = "vaults",
  onSelectBacksideNav,
}: AppSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showBtcTrigger, setShowBtcTrigger] = useState(false);
  const [backsideOpenModule, setBacksideOpenModule] = useState<BacksideDomainType | null>(activeBacksideNav);

  // Keep accordion open for the active domain if activeBacksideNav changes externally
  useEffect(() => {
    if (activeBacksideNav) {
      setBacksideOpenModule(activeBacksideNav);
    }
  }, [activeBacksideNav]);

  const currentBacksideNav = activeBacksideNav || backsideOpenModule || "vaults";

  const handleDomainSelect = (domain: BacksideDomainType, defaultSectionId?: string) => {
    if (onSelectBacksideNav) {
      onSelectBacksideNav(domain);
    }
    // Toggle accordion or keep open
    setBacksideOpenModule(domain);
    if (defaultSectionId) {
      setTimeout(() => {
        scrollToBacksideSection(defaultSectionId);
      }, 50);
    }
  };

  const handleSubItemSelect = (domain: BacksideDomainType, sectionId: string) => {
    if (onSelectBacksideNav) {
      onSelectBacksideNav(domain);
    }
    setBacksideOpenModule(domain);
    setTimeout(() => {
      scrollToBacksideSection(sectionId);
    }, 50);
  };

  const INSTITUTIONAL_ROLES = [
    "dao.omniyield-vault.testnet",
    "curator.omniyield-vault.testnet",
    "allocator.omniyield-vault.testnet",
    "guardian.omniyield-vault.testnet",
    "omniyield-vault.testnet",
  ];
  const isInst = INSTITUTIONAL_ROLES.includes(connectedAccount);

  // 严格根据登录钱包内的 NUSD 份额或 OMNIUSDC 份额自动确认 VIP 身份！
  const nusdShares = parseFloat(nusdBalance) || 0;
  const omniShares = parseFloat(omniUsdcBalance) || 0;
  const isVip = nusdShares > 0 || omniShares > 0 || isInst;

  // Auto-collapse the revealed BTC trigger button after 6s of inactivity
  useEffect(() => {
    if (showBtcTrigger && !isFlipped) {
      const timer = setTimeout(() => {
        setShowBtcTrigger(false);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [showBtcTrigger, isFlipped]);

  const handleCopyAccount = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!connectedAccount) return;
    navigator.clipboard.writeText(connectedAccount);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isConnected = Boolean(connectedAccount);

  const scrollToBacksideSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const getUserRole = () => {
    if (!connectedAccount) return "";
    if (connectedAccount === "dao.omniyield-vault.testnet") return "DAO Council";
    if (connectedAccount === "curator.omniyield-vault.testnet") return "Curator";
    if (connectedAccount === "guardian.omniyield-vault.testnet") return "Guardian";
    if (connectedAccount === "allocator.omniyield-vault.testnet") return "AI Allocator";
    if (isVip) return "VIP 1 Investor";
    return "Investor Pro";
  };

  return (
    <aside
      className={`sticky top-0 h-screen z-40 flex flex-col justify-between border-r transition-all duration-300 select-none overflow-hidden ${
        collapsed ? "w-16" : "w-52"
      } ${
        theme === "beige"
          ? "bg-[#F8F5EE] border-[#E4DCD0] text-slate-900"
          : "bg-[#0B0F17] border-[#1F293D] text-slate-100"
      }`}
    >
      {/* =========================================================================
          TOP BRAND HEADER (Slim Rhea style)
      ========================================================================= */}
      <div
        className={`px-3.5 py-4 border-b flex-shrink-0 ${
          theme === "beige" ? "border-[#E4DCD0]" : "border-[#1F293D]"
        }`}
      >
        <div className="flex items-center justify-between">
          {!isFlipped ? (
            /* FRONT BRAND */
            <div
              onClick={() => onSelectNav("vaults")}
              className="flex items-center space-x-2.5 cursor-pointer group"
              title="OmniYield Protocol"
            >
              <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 p-1 shadow-sm group-hover:scale-105 transition-transform flex-shrink-0 flex items-center justify-center">
                <img src="/nusd-logo.svg" alt="OmniYield" className="w-5 h-5" />
              </div>
              {!collapsed && (
                <span
                  className={`font-black text-base tracking-tight transition-colors ${
                    theme === "beige"
                      ? "text-slate-900 group-hover:text-emerald-700"
                      : "text-white group-hover:text-emerald-400"
                  }`}
                >
                  OmniYield
                </span>
              )}
            </div>
          ) : (
            /* BACKSIDE BRAND */
            <div
              onClick={onToggleFlip}
              className="flex items-center space-x-2.5 cursor-pointer group"
              title={lang === "zh" ? "机构多签安全舱 (点击返回)" : "Institutional Safe"}
            >
              <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 p-1 shadow-sm group-hover:scale-105 transition-transform flex-shrink-0 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              </div>
              {!collapsed && (
                <span
                  className={`font-black text-base tracking-tight transition-colors ${
                    theme === "beige"
                      ? "text-slate-900 group-hover:text-emerald-700"
                      : "text-white group-hover:text-emerald-400"
                  }`}
                >
                  OmniSafe
                </span>
              )}
            </div>
          )}

          {/* Collapse Toggle Button (<< / >>) */}
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className={`p-1.5 rounded-lg transition cursor-pointer ${
              theme === "beige"
                ? "text-slate-600 hover:text-black hover:bg-black/5"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
            title={collapsed ? "Expand Sidebar (>>)" : "Collapse Sidebar (<<)"}
          >
            {collapsed ? (
              <ChevronsRight className="w-4 h-4 text-emerald-500" />
            ) : (
              <ChevronsLeft className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* =========================================================================
          MAIN NAVIGATION ITEMS:
          1. 金库 (Vaults)
          2. 交换 (Exchange)
          3. 市场 (Markets)
          4. 投资组合 (Portfolio)
          5. NEAR AI (ai-copilot)
      ========================================================================= */}
      <div className="flex-1 min-h-0 overflow-y-auto px-2.5 py-3 space-y-1">
        {!isFlipped ? (
          /* ==================== FRONT INVESTOR SIDEBAR ==================== */
          <>
            {/* 1. 金库 (Vaults) */}
            <button
              type="button"
              onClick={() => onSelectNav("vaults")}
              className={`w-full flex items-center rounded-xl px-3 py-2.5 transition cursor-pointer ${
                activeNav === "vaults"
                  ? theme === "beige"
                    ? "bg-emerald-600/15 border border-emerald-600/40 text-emerald-900 font-bold shadow-sm"
                    : "bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 font-bold shadow-sm shadow-emerald-500/10"
                  : theme === "beige"
                  ? "text-slate-700 hover:bg-black/5 hover:text-black border border-transparent"
                  : "text-slate-300 hover:bg-slate-900 hover:text-white border border-transparent"
              } ${collapsed ? "justify-center" : "space-x-3"}`}
              title={lang === "zh" ? "金库" : "Vaults"}
            >
              <VaultDoorIcon
                className={`w-5 h-5 flex-shrink-0 transition-colors ${
                  activeNav === "vaults"
                    ? theme === "beige"
                      ? "text-emerald-800"
                      : "text-emerald-400"
                    : theme === "beige"
                    ? "text-slate-700 group-hover:text-emerald-800"
                    : "text-slate-400 group-hover:text-emerald-400"
                }`}
                strokeWidth={2.2}
              />
              {!collapsed && (
                <span className="text-xs font-semibold">{lang === "zh" ? "金库" : "Vaults"}</span>
              )}
            </button>

            {/* Sub-vault switches when Vaults Hub is active */}
            {!collapsed && activeNav === "vaults" && (
              <div
                className={`ml-4 pl-2.5 border-l space-y-0.5 my-1 ${
                  theme === "beige" ? "border-slate-300" : "border-slate-800"
                }`}
              >
                <button
                  type="button"
                  onClick={() => onSelectVault("usdc")}
                  className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-medium transition flex items-center space-x-2 cursor-pointer ${
                    activeVault === "usdc"
                      ? theme === "beige"
                        ? "bg-emerald-600/20 text-emerald-950 font-bold"
                        : "bg-emerald-500/20 text-emerald-300 font-bold"
                      : theme === "beige"
                      ? "text-slate-600 hover:text-black"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span className="truncate">NUSD Core Vault</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectVault("all-weather")}
                  className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-medium transition flex items-center space-x-2 cursor-pointer ${
                    activeVault === "all-weather"
                      ? theme === "beige"
                        ? "bg-cyan-600/20 text-cyan-950 font-bold"
                        : "bg-cyan-500/20 text-cyan-300 font-bold"
                      : theme === "beige"
                      ? "text-slate-600 hover:text-black"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                  <span className="truncate">All-Weather RWA</span>
                </button>
              </div>
            )}

            {/* 2. 交换 (Exchange - Trezu NEAR Intents Swap) */}
            <button
              type="button"
              onClick={() => onSelectNav("exchange")}
              className={`w-full flex items-center rounded-xl px-3 py-2.5 transition cursor-pointer ${
                activeNav === "exchange"
                  ? theme === "beige"
                    ? "bg-emerald-600/15 border border-emerald-600/40 text-emerald-900 font-bold shadow-sm"
                    : "bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 font-bold shadow-sm shadow-emerald-500/10"
                  : theme === "beige"
                  ? "text-slate-700 hover:bg-black/5 hover:text-black border border-transparent"
                  : "text-slate-300 hover:bg-slate-900 hover:text-white border border-transparent"
              } ${collapsed ? "justify-center" : "space-x-3"}`}
              title={lang === "zh" ? "交换" : "Exchange"}
            >
              <ArrowLeftRight
                className={`w-5 h-5 flex-shrink-0 transition-colors ${
                  activeNav === "exchange"
                    ? theme === "beige"
                      ? "text-emerald-800"
                      : "text-emerald-400"
                    : theme === "beige"
                    ? "text-slate-700 group-hover:text-emerald-800"
                    : "text-slate-400 group-hover:text-emerald-400"
                }`}
              />
              {!collapsed && (
                <span className="text-xs font-semibold">{lang === "zh" ? "交换" : "Exchange"}</span>
              )}
            </button>

            {/* 3. 市场 (Markets) */}
            <button
              type="button"
              onClick={() => onSelectNav("markets")}
              className={`w-full flex items-center rounded-xl px-3 py-2.5 transition cursor-pointer ${
                activeNav === "markets"
                  ? theme === "beige"
                    ? "bg-emerald-600/15 border border-emerald-600/40 text-emerald-900 font-bold shadow-sm"
                    : "bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 font-bold shadow-sm shadow-emerald-500/10"
                  : theme === "beige"
                  ? "text-slate-700 hover:bg-black/5 hover:text-black border border-transparent"
                  : "text-slate-300 hover:bg-slate-900 hover:text-white border border-transparent"
              } ${collapsed ? "justify-center" : "space-x-3"}`}
              title={lang === "zh" ? "市场" : "Markets"}
            >
              <BarChart3
                className={`w-5 h-5 flex-shrink-0 transition-colors ${
                  activeNav === "markets"
                    ? theme === "beige"
                      ? "text-emerald-800"
                      : "text-emerald-400"
                    : theme === "beige"
                    ? "text-slate-700 group-hover:text-emerald-800"
                    : "text-slate-400 group-hover:text-emerald-400"
                }`}
              />
              {!collapsed && (
                <span className="text-xs font-semibold">{lang === "zh" ? "市场" : "Markets"}</span>
              )}
            </button>

            {/* 4. 投资组合 (Portfolio) */}
            <button
              type="button"
              onClick={() => onSelectNav("portfolio")}
              className={`w-full flex items-center rounded-xl px-3 py-2.5 transition cursor-pointer ${
                activeNav === "portfolio"
                  ? theme === "beige"
                    ? "bg-emerald-600/15 border border-emerald-600/40 text-emerald-900 font-bold shadow-sm"
                    : "bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 font-bold shadow-sm shadow-emerald-500/10"
                  : theme === "beige"
                  ? "text-slate-700 hover:bg-black/5 hover:text-black border border-transparent"
                  : "text-slate-300 hover:bg-slate-900 hover:text-white border border-transparent"
              } ${collapsed ? "justify-center" : "space-x-3"}`}
              title={lang === "zh" ? "投资组合" : "Portfolio"}
            >
              <PieChart
                className={`w-5 h-5 flex-shrink-0 transition-colors ${
                  activeNav === "portfolio"
                    ? theme === "beige"
                      ? "text-emerald-800"
                      : "text-emerald-400"
                    : theme === "beige"
                    ? "text-slate-700 group-hover:text-emerald-800"
                    : "text-slate-400 group-hover:text-emerald-400"
                }`}
              />
              {!collapsed && (
                <span className="text-xs font-semibold">{lang === "zh" ? "投资组合" : "Portfolio"}</span>
              )}
            </button>

            {/* 5. NEAR AI (Single line, uniform layout) */}
            <button
              type="button"
              onClick={() => onSelectNav("ai-copilot")}
              className={`w-full flex items-center rounded-xl px-3 py-2.5 transition cursor-pointer ${
                activeNav === "ai-copilot"
                  ? theme === "beige"
                    ? "bg-emerald-600/15 border border-emerald-600/40 text-emerald-900 font-bold shadow-sm"
                    : "bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 font-bold shadow-sm shadow-emerald-500/10"
                  : theme === "beige"
                  ? "text-slate-700 hover:bg-black/5 hover:text-black border border-transparent"
                  : "text-slate-300 hover:bg-slate-900 hover:text-white border border-transparent"
              } ${collapsed ? "justify-center" : "space-x-3"}`}
              title={lang === "zh" ? "NEAR AI" : "NEAR AI"}
            >
              <BrainCircuit
                className={`w-5 h-5 flex-shrink-0 transition-colors ${
                  activeNav === "ai-copilot"
                    ? theme === "beige"
                      ? "text-emerald-800"
                      : "text-emerald-400"
                    : theme === "beige"
                    ? "text-slate-700 group-hover:text-emerald-800"
                    : "text-slate-400 group-hover:text-emerald-400"
                }`}
              />
              {!collapsed && (
                <span className="text-xs font-semibold">NEAR AI</span>
              )}
            </button>

            {/* 6. 企业级接入 (Enterprise Earn B2B SDK) */}
            <button
              type="button"
              onClick={() => onSelectNav("enterprise")}
              className={`w-full flex items-center rounded-xl px-3 py-2.5 transition cursor-pointer ${
                activeNav === "enterprise"
                  ? theme === "beige"
                    ? "bg-emerald-600/15 border border-emerald-600/40 text-emerald-900 font-bold shadow-sm"
                    : "bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 font-bold shadow-sm shadow-emerald-500/10"
                  : theme === "beige"
                  ? "text-slate-700 hover:bg-black/5 hover:text-black border border-transparent"
                  : "text-slate-300 hover:bg-slate-900 hover:text-white border border-transparent"
              } ${collapsed ? "justify-center" : "space-x-3"}`}
              title={lang === "zh" ? "企业接入 (B2B SDK)" : "Enterprise Earn (SDK)"}
            >
              <Code2
                className={`w-5 h-5 flex-shrink-0 transition-colors ${
                  activeNav === "enterprise"
                    ? theme === "beige"
                      ? "text-emerald-800"
                      : "text-emerald-400"
                    : theme === "beige"
                    ? "text-slate-700 group-hover:text-emerald-800"
                    : "text-slate-400 group-hover:text-emerald-400"
                }`}
              />
              {!collapsed && (
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-semibold">{lang === "zh" ? "企业接入" : "Enterprise"}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono font-bold">
                    B2B
                  </span>
                </div>
              )}
            </button>
          </>
        ) : (
          /* ==================== BACKSIDE INSTITUTIONAL SIDEBAR (5 MODULES 1:1 WITH FRONT) ==================== */
          <div className="space-y-1.5 overflow-y-auto pr-0.5">
            {/* 1. 金库设置与策略插座 (Vaults & Strategy Sockets) */}
            <div className="space-y-0.5">
              <button
                type="button"
                onClick={() => handleDomainSelect("vaults", "safe-dao")}
                className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs transition cursor-pointer font-bold ${
                  currentBacksideNav === "vaults"
                    ? "item-selected shadow-sm"
                    : "text-slate-800 dark:text-slate-200 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 font-bold"
                } ${collapsed ? "justify-center" : ""}`}
                title={lang === "zh" ? "1. 金库治理与插座" : "1. Vaults & Sockets"}
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                  {!collapsed && (
                    <span className="truncate">{lang === "zh" ? "金库治理与插座" : "Vaults & Sockets"}</span>
                  )}
                </div>
                {!collapsed && (
                  <div className="flex items-center space-x-1.5 flex-shrink-0">
                    {pendingProposalCount > 0 ? (
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-mono font-bold animate-pulse">
                        ● {pendingProposalCount}
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-700 dark:text-slate-300 font-mono font-bold">
                        {lang === "zh" ? "7项" : "7 Items"}
                      </span>
                    )}
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${
                        backsideOpenModule === "vaults" ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                )}
              </button>

              {/* 1.x Sub-items */}
              {!collapsed && backsideOpenModule === "vaults" && (
                <div className="pl-4 pr-1 py-1 space-y-0.5 border-l-2 border-slate-300 dark:border-slate-800 ml-3.5 text-[11px]">
                  <button
                    type="button"
                    onClick={() => handleSubItemSelect("vaults", "safe-dao")}
                    className="w-full text-left py-1 px-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-slate-800 hover:text-black dark:text-slate-200 dark:hover:text-white font-semibold flex items-center space-x-1.5 transition cursor-pointer"
                  >
                    <GovernanceIcon name="dao_sovereign" className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                    <span className="truncate">{lang === "zh" ? "1.1 DAO 治理主权" : "1.1 DAO Sovereign"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSubItemSelect("vaults", "safe-curator")}
                    className="w-full text-left py-1 px-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-slate-800 hover:text-black dark:text-slate-200 dark:hover:text-white font-semibold flex items-center space-x-1.5 transition cursor-pointer"
                  >
                    <GovernanceIcon name="curator_shield" className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                    <span className="truncate">{lang === "zh" ? "1.2 策展人配额" : "1.2 Curator Caps"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSubItemSelect("vaults", "safe-allocator")}
                    className="w-full text-left py-1 px-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-slate-800 hover:text-black dark:text-slate-200 dark:hover:text-white font-semibold flex items-center space-x-1.5 transition cursor-pointer"
                  >
                    <GovernanceIcon name="balance_scale" className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                    <span className="truncate">{lang === "zh" ? "1.3 调仓员管理" : "1.3 Allocator Bounds"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSubItemSelect("vaults", "safe-guardian")}
                    className="w-full text-left py-1 px-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-slate-800 hover:text-black dark:text-slate-200 dark:hover:text-white font-semibold flex items-center space-x-1.5 transition cursor-pointer"
                  >
                    <GovernanceIcon name="emergency_siren" className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                    <span className="truncate">{lang === "zh" ? "1.4 守护者熔断" : "1.4 Guardian VETO"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSubItemSelect("vaults", "safe-fees")}
                    className="w-full text-left py-1 px-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-slate-800 hover:text-black dark:text-slate-200 dark:hover:text-white font-semibold flex items-center space-x-1.5 transition cursor-pointer"
                  >
                    <GovernanceIcon name="treasury_vault" className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                    <span className="truncate">{lang === "zh" ? "1.5 费率与国库" : "1.5 Fees & Treasury"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSubItemSelect("vaults", "safe-socket-nusd")}
                    className="w-full text-left py-1 px-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-slate-800 hover:text-black dark:text-slate-200 dark:hover:text-white font-semibold flex items-center space-x-1.5 transition cursor-pointer"
                  >
                    <GovernanceIcon name="socket_nusd" className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                    <span className="truncate">{lang === "zh" ? "1.6 NUSD 策略插座" : "1.6 NUSD Socket #1"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSubItemSelect("vaults", "safe-socket-allweather")}
                    className="w-full text-left py-1 px-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-slate-800 hover:text-black dark:text-slate-200 dark:hover:text-white font-semibold flex items-center space-x-1.5 transition cursor-pointer"
                  >
                    <GovernanceIcon name="socket_allweather" className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                    <span className="truncate">{lang === "zh" ? "1.7 全天候策略插座" : "1.7 All-Weather Socket"}</span>
                  </button>
                </div>
              )}
            </div>

            {/* 2. 交换设置 (Exchange Routing & Intents) */}
            <div className="space-y-0.5">
              <button
                type="button"
                onClick={() => handleDomainSelect("exchange", "safe-exchange-networks")}
                className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs transition cursor-pointer font-bold ${
                  currentBacksideNav === "exchange"
                    ? "item-selected shadow-sm"
                    : "text-slate-800 dark:text-slate-200 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 font-bold"
                } ${collapsed ? "justify-center" : ""}`}
                title={lang === "zh" ? "2. 交换与意图清算" : "2. Exchange Routing"}
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  <ArrowLeftRight className="w-4 h-4 flex-shrink-0" />
                  {!collapsed && (
                    <span className="truncate">{lang === "zh" ? "交换与意图清算" : "Exchange Routing"}</span>
                  )}
                </div>
                {!collapsed && (
                  <div className="flex items-center space-x-1.5 flex-shrink-0">
                    <span className="text-[11px] text-slate-700 dark:text-slate-300 font-mono font-bold">
                      {lang === "zh" ? "16链" : "16 Chains"}
                    </span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${
                        backsideOpenModule === "exchange" ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                )}
              </button>

              {/* 2.x Sub-items */}
              {!collapsed && backsideOpenModule === "exchange" && (
                <div className="pl-4 pr-1 py-1 space-y-0.5 border-l-2 border-slate-300 dark:border-slate-800 ml-3.5 text-[11px]">
                  <button
                    type="button"
                    onClick={() => handleSubItemSelect("exchange", "safe-exchange-networks")}
                    className="w-full text-left py-1 px-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-slate-800 hover:text-black dark:text-slate-200 dark:hover:text-white font-semibold flex items-center space-x-1.5 transition cursor-pointer"
                  >
                    <GovernanceIcon name="intent_mesh" className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                    <span className="truncate">{lang === "zh" ? "2.1 16 链清算网络" : "2.1 16-Chain Whitelist"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSubItemSelect("exchange", "safe-exchange-solvers")}
                    className="w-full text-left py-1 px-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-slate-800 hover:text-black dark:text-slate-200 dark:hover:text-white font-semibold flex items-center space-x-1.5 transition cursor-pointer"
                  >
                    <GovernanceIcon name="solver_zap" className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                    <span className="truncate">{lang === "zh" ? "2.2 认证求解器与做市" : "2.2 Solvers & MM"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSubItemSelect("exchange", "safe-exchange-slippage")}
                    className="w-full text-left py-1 px-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-slate-800 hover:text-black dark:text-slate-200 dark:hover:text-white font-semibold flex items-center space-x-1.5 transition cursor-pointer"
                  >
                    <GovernanceIcon name="curator_shield" className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                    <span className="truncate">{lang === "zh" ? "2.3 最大滑点与超时" : "2.3 Slippage Bounds"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSubItemSelect("exchange", "safe-exchange-fees")}
                    className="w-full text-left py-1 px-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-slate-800 hover:text-black dark:text-slate-200 dark:hover:text-white font-semibold flex items-center space-x-1.5 transition cursor-pointer"
                  >
                    <GovernanceIcon name="swap_commission" className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                    <span className="truncate">{lang === "zh" ? "2.4 跨链手续费分润" : "2.4 Swap Commission"}</span>
                  </button>
                </div>
              )}
            </div>

            {/* 3. 市场设置 (Markets & Feeds) */}
            <div className="space-y-0.5">
              <button
                type="button"
                onClick={() => handleDomainSelect("markets", "safe-markets-listing")}
                className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs transition cursor-pointer font-bold ${
                  currentBacksideNav === "markets"
                    ? "item-selected shadow-sm"
                    : "text-slate-800 dark:text-slate-200 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 font-bold"
                } ${collapsed ? "justify-center" : ""}`}
                title={lang === "zh" ? "3. 市场与预言机喂价" : "3. Markets & Feeds"}
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  <BarChart3 className="w-4 h-4 flex-shrink-0" />
                  {!collapsed && (
                    <span className="truncate">{lang === "zh" ? "市场与预言机喂价" : "Markets & Feeds"}</span>
                  )}
                </div>
                {!collapsed && (
                  <div className="flex items-center space-x-1.5 flex-shrink-0">
                    <span className="text-[11px] text-slate-700 dark:text-slate-300 font-mono font-bold">RWA</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${
                        backsideOpenModule === "markets" ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                )}
              </button>

              {/* 3.x Sub-items */}
              {!collapsed && backsideOpenModule === "markets" && (
                <div className="pl-4 pr-1 py-1 space-y-0.5 border-l-2 border-slate-300 dark:border-slate-800 ml-3.5 text-[11px]">
                  <button
                    type="button"
                    onClick={() => handleSubItemSelect("markets", "safe-markets-listing")}
                    className="w-full text-left py-1 px-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-slate-800 hover:text-black dark:text-slate-200 dark:hover:text-white font-semibold flex items-center space-x-1.5 transition cursor-pointer"
                  >
                    <GovernanceIcon name="asset_listing" className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                    <span className="truncate">{lang === "zh" ? "3.1 资产上架审核" : "3.1 Asset Listing"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSubItemSelect("markets", "safe-markets-oracles")}
                    className="w-full text-left py-1 px-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-slate-800 hover:text-black dark:text-slate-200 dark:hover:text-white font-semibold flex items-center space-x-1.5 transition cursor-pointer"
                  >
                    <GovernanceIcon name="oracle_crystal" className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                    <span className="truncate">{lang === "zh" ? "3.2 Pyth 预言机喂价" : "3.2 Oracle Feeds"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSubItemSelect("markets", "safe-markets-trading")}
                    className="w-full text-left py-1 px-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-slate-800 hover:text-black dark:text-slate-200 dark:hover:text-white font-semibold flex items-center space-x-1.5 transition cursor-pointer"
                  >
                    <GovernanceIcon name="emergency_siren" className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                    <span className="truncate">{lang === "zh" ? "3.3 交易时段与熔断" : "3.3 Trading Hours"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSubItemSelect("markets", "safe-markets-liquidity")}
                    className="w-full text-left py-1 px-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-slate-800 hover:text-black dark:text-slate-200 dark:hover:text-white font-semibold flex items-center space-x-1.5 transition cursor-pointer"
                  >
                    <GovernanceIcon name="liquidity_depth" className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                    <span className="truncate">{lang === "zh" ? "3.4 底池流动性监控" : "3.4 Liquidity Depth"}</span>
                  </button>
                </div>
              )}
            </div>

            {/* 4. 投资组合设置 (Portfolio & Custody) */}
            <div className="space-y-0.5">
              <button
                type="button"
                onClick={() => handleDomainSelect("portfolio", "safe-portfolio-nav")}
                className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs transition cursor-pointer font-bold ${
                  currentBacksideNav === "portfolio"
                    ? "item-selected shadow-sm"
                    : "text-slate-800 dark:text-slate-200 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 font-bold"
                } ${collapsed ? "justify-center" : ""}`}
                title={lang === "zh" ? "4. 组合会计与托管" : "4. Portfolio & Custody"}
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  <PieChart className="w-4 h-4 flex-shrink-0" />
                  {!collapsed && (
                    <span className="truncate">{lang === "zh" ? "组合会计与托管" : "Portfolio Custody"}</span>
                  )}
                </div>
                {!collapsed && (
                  <div className="flex items-center space-x-1.5 flex-shrink-0">
                    <span className="text-[11px] text-slate-700 dark:text-slate-300 font-mono font-bold">NAV</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${
                        backsideOpenModule === "portfolio" ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                )}
              </button>

              {/* 4.x Sub-items */}
              {!collapsed && backsideOpenModule === "portfolio" && (
                <div className="pl-4 pr-1 py-1 space-y-0.5 border-l-2 border-slate-300 dark:border-slate-800 ml-3.5 text-[11px]">
                  <button
                    type="button"
                    onClick={() => handleSubItemSelect("portfolio", "safe-portfolio-nav")}
                    className="w-full text-left py-1 px-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-slate-800 hover:text-black dark:text-slate-200 dark:hover:text-white font-semibold flex items-center space-x-1.5 transition cursor-pointer"
                  >
                    <GovernanceIcon name="portfolio_aum" className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                    <span className="truncate">{lang === "zh" ? "4.1 双金库 NAV 会计" : "4.1 NAV Settlement"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSubItemSelect("portfolio", "safe-portfolio-reserves")}
                    className="w-full text-left py-1 px-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-slate-800 hover:text-black dark:text-slate-200 dark:hover:text-white font-semibold flex items-center space-x-1.5 transition cursor-pointer"
                  >
                    <GovernanceIcon name="custody_reserve" className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                    <span className="truncate">{lang === "zh" ? "4.2 协议储备金率" : "4.2 Reserve Ratio"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSubItemSelect("portfolio", "safe-portfolio-custody")}
                    className="w-full text-left py-1 px-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-slate-800 hover:text-black dark:text-slate-200 dark:hover:text-white font-semibold flex items-center space-x-1.5 transition cursor-pointer"
                  >
                    <GovernanceIcon name="vault_isolation" className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                    <span className="truncate">{lang === "zh" ? "4.3 机构 MPC 托管" : "4.3 MPC Custody"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSubItemSelect("portfolio", "safe-portfolio-audit")}
                    className="w-full text-left py-1 px-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-slate-800 hover:text-black dark:text-slate-200 dark:hover:text-white font-semibold flex items-center space-x-1.5 transition cursor-pointer"
                  >
                    <GovernanceIcon name="audit_proof" className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                    <span className="truncate">{lang === "zh" ? "4.4 意图区块链存证" : "4.4 On-Chain Audit"}</span>
                  </button>
                </div>
              )}
            </div>

            {/* 5. AI设置 (AI Agent Engine) */}
            <div className="space-y-0.5">
              <button
                type="button"
                onClick={() => handleDomainSelect("ai", "safe-ai-apikeys")}
                className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs transition cursor-pointer font-bold ${
                  currentBacksideNav === "ai"
                    ? "item-selected shadow-sm"
                    : "text-slate-800 dark:text-slate-200 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 font-bold"
                } ${collapsed ? "justify-center" : ""}`}
                title={lang === "zh" ? "5. AI 自主智能体引擎" : "5. AI Agent Engine"}
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  <BrainCircuit className="w-4 h-4 flex-shrink-0" />
                  {!collapsed && (
                    <span className="truncate">{lang === "zh" ? "AI 自主智能体引擎" : "AI Agent Engine"}</span>
                  )}
                </div>
                {!collapsed && (
                  <div className="flex items-center space-x-1.5 flex-shrink-0">
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full item-selected font-mono font-bold">
                      Agent
                    </span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${
                        backsideOpenModule === "ai" ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                )}
              </button>

              {/* 5.x Sub-items */}
              {!collapsed && backsideOpenModule === "ai" && (
                <div className="pl-4 pr-1 py-1 space-y-0.5 border-l-2 border-slate-300 dark:border-slate-800 ml-3.5 text-[11px]">
                  <button
                    type="button"
                    onClick={() => handleSubItemSelect("ai", "safe-ai-apikeys")}
                    className="w-full text-left py-1 px-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-slate-800 hover:text-black dark:text-slate-200 dark:hover:text-white font-semibold flex items-center space-x-1.5 transition cursor-pointer"
                  >
                    <GovernanceIcon name="api_key" className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                    <span className="truncate">{lang === "zh" ? "5.1 API Key 密钥管理" : "5.1 API Key Hub"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSubItemSelect("ai", "safe-ai-polling")}
                    className="w-full text-left py-1 px-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-slate-800 hover:text-black dark:text-slate-200 dark:hover:text-white font-semibold flex items-center space-x-1.5 transition cursor-pointer"
                  >
                    <GovernanceIcon name="dynamic_polling" className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                    <span className="truncate">{lang === "zh" ? "5.2 动态平衡与轮询" : "5.2 Dynamic Polling"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSubItemSelect("ai", "safe-ai-skills")}
                    className="w-full text-left py-1 px-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-slate-800 hover:text-black dark:text-slate-200 dark:hover:text-white font-semibold flex items-center space-x-1.5 transition cursor-pointer"
                  >
                    <GovernanceIcon name="skills_marketplace" className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                    <span className="truncate">{lang === "zh" ? "5.3 技能插件库" : "5.3 Skills Marketplace"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSubItemSelect("ai", "safe-ai-personas")}
                    className="w-full text-left py-1 px-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-slate-800 hover:text-black dark:text-slate-200 dark:hover:text-white font-semibold flex items-center space-x-1.5 transition cursor-pointer"
                  >
                    <GovernanceIcon name="persona_studio" className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                    <span className="truncate">{lang === "zh" ? "5.4 角色人设与 Prompt" : "5.4 Persona Studio"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSubItemSelect("ai", "safe-ai-learning")}
                    className="w-full text-left py-1 px-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-slate-800 hover:text-black dark:text-slate-200 dark:hover:text-white font-semibold flex items-center space-x-1.5 transition cursor-pointer"
                  >
                    <GovernanceIcon name="self_learning" className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                    <span className="truncate">{lang === "zh" ? "5.5 自主学习与复盘" : "5.5 Self-Learning"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSubItemSelect("ai", "safe-ai-quotas")}
                    className="w-full text-left py-1 px-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-slate-800 hover:text-black dark:text-slate-200 dark:hover:text-white font-semibold flex items-center space-x-1.5 transition cursor-pointer"
                  >
                    <GovernanceIcon name="curator" className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                    <span className="truncate">{lang === "zh" ? "5.6 用量与 Gas 预算" : "5.6 Usage Quotas"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSubItemSelect("ai", "safe-ai-sandbox")}
                    className="w-full text-left py-1 px-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-slate-800 hover:text-black dark:text-slate-200 dark:hover:text-white font-semibold flex items-center space-x-1.5 transition cursor-pointer"
                  >
                    <GovernanceIcon name="curator_shield" className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                    <span className="truncate">{lang === "zh" ? "5.7 安全沙盒与断电" : "5.7 Safety Sandbox"}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          6. BOTTOM LOGIN SECTION:
          - User Info / LOGO
          - ⚙️ Settings Gear: Opens User Settings Modal
          - ₿ Bitcoin Icon: CLICK TO FLIP TO BACKSIDE / SAFE!
      ========================================================================= */}
      <div
        className={`p-2 border-t flex-shrink-0 ${
          theme === "beige" ? "border-[#dfd2be] bg-[#f0e6d9]" : "border-slate-800/80 bg-slate-950"
        }`}
      >
        {!isConnected ? (
          /* NOT LOGGED IN */
          <div
            className={`p-2 rounded-xl border transition flex items-center justify-between ${
              theme === "beige"
                ? "bg-white/90 border-[#dfd2be] text-slate-800"
                : "bg-slate-900/90 border-slate-800 text-slate-200"
            }`}
          >
            <button
              type="button"
              onClick={onOpenWalletModal}
              className="flex-1 flex items-center space-x-2 text-left cursor-pointer group"
              title={lang === "zh" ? "连接钱包" : "Connect Wallet"}
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                <Wallet className="w-3.5 h-3.5" />
              </div>
              {!collapsed && (
                <span className="font-bold text-xs truncate group-hover:text-emerald-500 transition-colors">
                  {lang === "zh" ? "连接钱包" : "Connect"}
                </span>
              )}
            </button>

            {/* Action Buttons: ⚙️ Settings */}
            <div className="flex items-center space-x-1 flex-shrink-0">
              {onOpenSettings && (
                <button
                  type="button"
                  onClick={onOpenSettings}
                  className={`p-1.5 rounded-lg transition cursor-pointer ${
                    theme === "beige"
                      ? "text-slate-500 hover:text-black hover:bg-black/5"
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                  title={lang === "zh" ? "用户设置 (偏好与网络)" : "User Settings"}
                >
                  <Settings className="w-3.5 h-3.5 hover:rotate-45 transition-transform" />
                </button>
              )}
            </div>
          </div>
        ) : (
          /* LOGGED IN: GOSUN LOGO + USER INFO + ⚙️ SETTINGS + ₿ BITCOIN FLIP */
          <div className="p-2 rounded-xl border transition flex items-center justify-between card-surface">
            {/* User Info (Click opens Account Drawer) */}
            <div
              onClick={onOpenAccountDrawer}
              className="flex items-center space-x-2 min-w-0 flex-1 cursor-pointer group"
              title={lang === "zh" ? "账户明细与余额" : "Account Balances"}
            >
              {/* Official GOSUN Emblem */}
              <div className="relative flex-shrink-0">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center p-[1px] bg-slate-300 dark:bg-slate-700 shadow-sm">
                  <div className="w-full h-full bg-slate-950 rounded-[5px] flex items-center justify-center font-black text-emerald-400 text-[11px]">
                    G
                  </div>
                </div>
                {isVip && (
                  <span
                    className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center p-0.5 shadow-md border border-white dark:border-slate-900 pointer-events-none"
                    title="VIP 1 Verified"
                  >
                    <GovernanceIcon name="dao" className="w-2.5 h-2.5 text-slate-950" />
                  </span>
                )}
              </div>

              {!collapsed && (
                <div className="min-w-0 flex-1 text-left">
                  <div className="flex items-center space-x-1">
                    <span
                      className={`font-bold text-xs truncate ${
                        theme === "beige" ? "text-slate-900" : "text-white"
                      }`}
                    >
                      {connectedAccount.length > 12
                        ? `${connectedAccount.slice(0, 5)}...${connectedAccount.slice(-4)}`
                        : connectedAccount}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyAccount}
                      className="text-slate-400 hover:text-white flex-shrink-0"
                      title="Copy Address"
                    >
                      {copied ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center space-x-1 text-[10px] font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span
                      className={`truncate ${
                        theme === "beige" ? "text-emerald-800" : "text-emerald-400"
                      }`}
                    >
                      {getUserRole()}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Right Buttons: ⚙️ Gear (User Settings) + ₿ Bitcoin (Institutional Flip) */}
            <div className="flex items-center space-x-1 flex-shrink-0">
              {isFlipped ? (
                /* 1. 已在背面治理安全舱: 显示 ₿ 比特币, 点击翻回前台 */
                <button
                  type="button"
                  onClick={onToggleFlip}
                  className="p-1.5 rounded-lg btn-secondary hover:scale-110 active:scale-95 transition-all cursor-pointer relative shadow-sm"
                  title={lang === "zh" ? "₿ 点击比特币翻回前台 (Investor View)" : "₿ Click Bitcoin to Flip to Front"}
                >
                  <BitcoinIcon className="w-5 h-5 shadow-sm" />
                </button>
              ) : !isInst ? (
                /* 2. 普通用户在前台: 只显示齿轮 ⚙️, 点击直接呼出用户设置 */
                onOpenSettings && (
                  <button
                    type="button"
                    onClick={onOpenSettings}
                    className={`p-1.5 rounded-lg transition cursor-pointer ${
                      theme === "beige"
                        ? "text-slate-600 hover:text-black hover:bg-black/5"
                        : "text-slate-400 hover:text-white hover:bg-slate-800"
                    }`}
                    title={lang === "zh" ? "用户设置 (偏好与网络)" : "User Settings"}
                  >
                    <Settings className="w-3.5 h-3.5 hover:rotate-45 transition-transform" />
                  </button>
                )
              ) : (
                /* 3. 机构用户在前台: 默认只显示齿轮 ⚙️, 点一下后展开显示 ₿, 再点一下 ₿ 翻转到背面 */
                <div className="flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (!showBtcTrigger) {
                        setShowBtcTrigger(true);
                      } else {
                        onOpenSettings?.();
                      }
                    }}
                    className={`p-1.5 rounded-lg transition cursor-pointer ${
                      showBtcTrigger
                        ? theme === "beige"
                          ? "bg-amber-100 text-amber-900 border border-amber-300 shadow-sm"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
                        : theme === "beige"
                        ? "text-slate-600 hover:text-black hover:bg-black/5"
                        : "text-slate-400 hover:text-white hover:bg-slate-800"
                    }`}
                    title={
                      !showBtcTrigger
                        ? (lang === "zh" ? "机构特权: 点击激活多签治理通道" : "Institutional: Click to reveal Safe trigger")
                        : (lang === "zh" ? "用户设置 (偏好与网络)" : "User Settings")
                    }
                  >
                    <Settings
                      className={`w-3.5 h-3.5 transition-transform duration-300 ${
                        showBtcTrigger ? "rotate-90 text-amber-500" : "hover:rotate-45"
                      }`}
                    />
                  </button>

                  {/* 点一下齿轮后展开的 ₿ 比特币图标: 再点一下即翻转至背面多签安全舱 (或跳转至 safe.omniyield.finance) */}
                  {showBtcTrigger && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowBtcTrigger(false);
                        const safeUrl = process.env.NEXT_PUBLIC_SAFE_URL;
                        if (safeUrl && safeUrl !== "" && safeUrl !== "local") {
                          window.open(safeUrl, "_blank", "noopener,noreferrer");
                        } else {
                          onToggleFlip();
                        }
                      }}
                      className="p-1 rounded-lg hover:scale-110 active:scale-95 transition-all cursor-pointer relative animate-in fade-in zoom-in-75 duration-200"
                      title={
                        lang === "zh"
                          ? "₿ 再次点击比特币，进入机构治理多签安全舱"
                          : "₿ Click Bitcoin to Launch Institutional Safe"
                      }
                    >
                      <BitcoinIcon className="w-5 h-5 shadow-sm hover:rotate-12 transition-transform" />
                      {pendingProposalCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
