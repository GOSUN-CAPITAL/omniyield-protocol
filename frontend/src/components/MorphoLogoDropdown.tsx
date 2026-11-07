"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  ChevronDown,
  Settings,
  Moon,
  Sun,
  ExternalLink,
  ShieldCheck,
  BookOpen,
  FileText,
  Code,
  Activity,
  Layers,
  Sparkles,
  Lock,
  Globe,
} from "lucide-react";

interface MorphoLogoDropdownProps {
  isFlipped: boolean;
  onToggleFlip: () => void;
  theme: "dark" | "beige";
  onToggleTheme: (newTheme: "dark" | "beige") => void;
  connectedAccount: string;
  lang?: "en" | "zh";
  onToggleLang?: (newLang: "en" | "zh") => void;
}

export function MorphoLogoDropdown({
  isFlipped,
  onToggleFlip,
  theme,
  onToggleTheme,
  connectedAccount,
  lang = "en",
  onToggleLang,
}: MorphoLogoDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Check institutional access
  const isInstitutional =
    connectedAccount.startsWith("dao.") ||
    connectedAccount.startsWith("curator.") ||
    connectedAccount.startsWith("allocator.") ||
    connectedAccount.startsWith("guardian.") ||
    connectedAccount === "omniyield-vault.testnet";

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Brand Logo & Dropdown Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2.5 px-2.5 py-1.5 rounded-xl hover:bg-slate-800/40 transition group cursor-pointer"
        aria-expanded={isOpen}
      >
        <div className="w-8 h-8 rounded-xl overflow-hidden shadow-md shadow-emerald-500/20 flex items-center justify-center bg-slate-900 border border-emerald-500/30 group-hover:scale-105 transition-transform">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/nusd-logo.svg" alt="OmniYield" className="w-8 h-8" />
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="font-extrabold text-lg tracking-tight text-white group-hover:opacity-90">
            OmniYield
          </span>
          <ChevronDown
            className={`w-4 h-4 text-slate-400 group-hover:text-white transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {/* Floating Dropdown Card (Morpho Design) */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-72 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl z-50 overflow-hidden morpho-dropdown-panel animate-in fade-in zoom-in-95 duration-150">
          {/* Section 1: Company / Ecosystem */}
          <div className="p-3 border-b border-slate-800/80">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2.5 py-1">
              {lang === "zh" ? "协议与生态" : "Protocol & Ecosystem"}
            </div>
            <div className="space-y-0.5">
              <a
                href="https://testnet.nearblocks.io/address/omniyield-vault.testnet"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition group"
              >
                <div className="flex items-center space-x-2">
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                  <span>omniyield-vault.testnet</span>
                </div>
                <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-slate-300" />
              </a>

              <a
                href="https://github.com/near/intents"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition group"
              >
                <div className="flex items-center space-x-2">
                  <Layers className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{lang === "zh" ? "NEAR Intents 意图清算总线" : "NEAR Intents Solver Bus"}</span>
                </div>
                <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-slate-300" />
              </a>

              <a
                href="#allocations"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition"
              >
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>{lang === "zh" ? "动态供给队列" : "Dynamic Supply Queues"}</span>
                </div>
              </a>
            </div>
          </div>

          {/* Section 2: Resources & Governance */}
          <div className="p-3 border-b border-slate-800/80">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2.5 py-1">
              {lang === "zh" ? "治理与风控安全" : "Governance & Security"}
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center justify-between px-2.5 py-1.5 text-xs text-slate-300">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{lang === "zh" ? "四权分立治理矩阵" : "4-Role Governance Matrix"}</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 font-mono">
                  {lang === "zh" ? "链上执行" : "Enforced"}
                </span>
              </div>

              <div className="flex items-center justify-between px-2.5 py-1.5 text-xs text-slate-300">
                <div className="flex items-center space-x-2">
                  <Code className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{lang === "zh" ? "安全时间锁" : "Security Timelock"}</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                  {lang === "zh" ? "24 小时" : "24 Hours"}
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Bottom Control Island [ ⚙️ | 🌙 | ☀️ | 🌐 EN/中 ] */}
          <div className="p-2.5 bg-slate-950/80 flex items-center justify-between morpho-dropdown-footer">
            <span className="text-[11px] font-medium text-slate-400 pl-1.5">
              {lang === "zh" ? "偏好控制" : "Controls"}
            </span>

            {/* The 4-Item Control Island */}
            <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 morpho-control-island space-x-1">
              {/* ⚙️ Cockpit 180° Flip Gear */}
              <button
                type="button"
                onClick={() => {
                  if (isInstitutional) {
                    onToggleFlip();
                    setIsOpen(false);
                  } else {
                    alert(
                      lang === "zh"
                        ? "机构治理权限提示\n\n此 180° 翻转控制台专属机构角色权限。\n当前钱包未连接机构角色账号。\n\n请在右上方连接或切换至以下任意机构测试钱包：\n• dao.omniyield-vault.testnet (DAO 理事会多签主权)\n• curator.omniyield-vault.testnet (金库策展人风控核保)\n• allocator.omniyield-vault.testnet (AI 调仓管家执行)\n• guardian.omniyield-vault.testnet (安全卫士紧急熔断)"
                        : "Institutional Role Required\n\nThis 180° Flip Cockpit is strictly restricted to institutional roles.\nThe current wallet is not connected with an institutional role account.\n\nPlease switch accounts to one of the following:\n• dao.omniyield-vault.testnet (Multi-Sig DAO Governance)\n• curator.omniyield-vault.testnet (Vault Risk Curator)\n• allocator.omniyield-vault.testnet (AI Rebalancing Keeper)\n• guardian.omniyield-vault.testnet (Emergency Security Breaker)"
                    );
                  }
                }}
                className={`p-1.5 rounded-lg transition-all relative group cursor-pointer ${
                  isFlipped
                    ? "bg-cyan-500/20 text-cyan-400 shadow-sm"
                    : isInstitutional
                    ? "text-slate-300 hover:text-white hover:bg-slate-800"
                    : "text-slate-600 hover:text-slate-400 cursor-not-allowed opacity-60"
                }`}
                title={
                  isInstitutional
                    ? isFlipped
                      ? lang === "zh" ? "180° 翻回正面 (投资者视图)" : "Flip to Front (Investor View)"
                      : lang === "zh" ? "180° 翻转至机构控制台 (安全舱)" : "Flip to Cockpit (Institutional View)"
                    : lang === "zh" ? "需要机构钱包权限" : "Institutional Role Required"
                }
                aria-label="Institutional Cockpit Flip"
              >
                <Settings
                  className={`w-4 h-4 transition-transform duration-500 ${
                    isFlipped ? "rotate-90 text-cyan-400" : ""
                  }`}
                />
                {!isInstitutional && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-500/80"></span>
                )}
              </button>

              <span className="text-slate-700">|</span>

              {/* 🌙 Moon Mode */}
              <button
                type="button"
                onClick={() => onToggleTheme("dark")}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  theme === "dark"
                    ? "bg-slate-800 text-cyan-400 shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
                title={lang === "zh" ? "🌙 月亮模式：暗夜星空布局 (Dark Slate)" : "🌙 Moon Mode: Dark Slate"}
                aria-label="Moon Mode"
              >
                <Moon className="w-4 h-4" />
              </button>

              {/* ☀️ Sun Mode */}
              <button
                type="button"
                onClick={() => onToggleTheme("beige")}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  theme === "beige"
                    ? "bg-[#dfd2be] text-[#171d26] shadow-sm font-bold"
                    : "text-slate-400 hover:text-amber-400 hover:bg-slate-800/60"
                }`}
                title={lang === "zh" ? "☀️ 太阳模式：典雅米黄布局 (Warm Beige)" : "☀️ Sun Mode: Warm Beige"}
                aria-label="Sun Mode"
              >
                <Sun className="w-4 h-4" />
              </button>

              <span className="text-slate-700">|</span>

              {/* 🌐 Language Switcher (EN / 中) */}
              <button
                type="button"
                onClick={() => onToggleLang && onToggleLang(lang === "en" ? "zh" : "en")}
                className={`px-2 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center space-x-1 ${
                  lang === "zh"
                    ? "bg-slate-800 text-emerald-400 font-bold shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
                title={lang === "en" ? "Switch Language: 中文" : "Switch Language: English"}
                aria-label="Toggle Language"
              >
                <Globe className="w-3.5 h-3.5" />
                <span className="text-[11px] font-mono">{lang === "en" ? "EN" : "中"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MorphoLogoDropdown;

