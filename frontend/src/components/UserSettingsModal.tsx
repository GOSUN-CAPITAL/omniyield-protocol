"use client";

import React from "react";
import {
  X,
  Settings,
  Globe,
  Sun,
  Moon,
  Server,
  Zap,
  ExternalLink,
} from "lucide-react";

interface UserSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: "en" | "zh";
  onToggleLang: () => void;
  theme: "dark" | "beige";
  onToggleTheme: () => void;
  connectedAccount: string;
  onOpenAccountDrawer: () => void;
  onClaimFaucet: () => void;
}

export default function UserSettingsModal({
  isOpen,
  onClose,
  lang,
  onToggleLang,
  theme,
  onToggleTheme,
  connectedAccount,
  onOpenAccountDrawer,
  onClaimFaucet,
}: UserSettingsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/65 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <div
          className={`relative w-full max-w-md rounded-3xl p-6 shadow-2xl text-left border transition-all z-10 ${
            theme === "beige"
              ? "bg-[#faf6f0] border-[#dfd2be] text-[#171d26]"
              : "bg-slate-900 border-slate-800 text-slate-100 shadow-[0_0_50px_rgba(0,0,0,0.7)]"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className={`flex items-center justify-between pb-4 border-b ${
              theme === "beige" ? "border-slate-300" : "border-slate-800/80"
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h3
                  className={`font-extrabold text-base ${
                    theme === "beige" ? "text-slate-900" : "text-white"
                  }`}
                >
                  {lang === "zh" ? "用户与偏好设置" : "User & Protocol Settings"}
                </h3>
                <p className="text-xs text-slate-400">
                  {lang === "zh"
                    ? "界面语言、视觉主题及网络节点配置"
                    : "Appearance, Language & Network Settings"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className={`p-1.5 rounded-xl transition cursor-pointer ${
                theme === "beige"
                  ? "text-slate-600 hover:text-black hover:bg-slate-200"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Settings Options List */}
          <div className="my-5 space-y-3.5 text-xs">
            {/* 1. Language Toggle */}
            <div
              className={`flex items-center justify-between p-3.5 rounded-2xl border ${
                theme === "beige"
                  ? "bg-white/80 border-slate-300"
                  : "bg-slate-950/70 border-slate-800/80"
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Globe className="w-4 h-4 text-emerald-500" />
                <div>
                  <span
                    className={`font-bold block ${
                      theme === "beige" ? "text-slate-900" : "text-white"
                    }`}
                  >
                    {lang === "zh" ? "显示语言 (Language)" : "Display Language"}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {lang === "zh" ? "当前：简体中文" : "Current: English"}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={onToggleLang}
                className={`px-3 py-1.5 rounded-xl font-mono text-xs border transition cursor-pointer ${
                  theme === "beige"
                    ? "bg-slate-100 hover:bg-slate-200 text-slate-900 border-slate-300"
                    : "bg-slate-800 hover:bg-slate-700 text-white border-slate-700"
                }`}
              >
                {lang === "zh" ? "Switch to EN" : "切换为中文"}
              </button>
            </div>

            {/* 2. Visual Theme Toggle */}
            <div
              className={`flex items-center justify-between p-3.5 rounded-2xl border ${
                theme === "beige"
                  ? "bg-white/80 border-slate-300"
                  : "bg-slate-950/70 border-slate-800/80"
              }`}
            >
              <div className="flex items-center space-x-2.5">
                {theme === "dark" ? (
                  <Moon className="w-4 h-4 text-cyan-400" />
                ) : (
                  <Sun className="w-4 h-4 text-amber-500" />
                )}
                <div>
                  <span
                    className={`font-bold block ${
                      theme === "beige" ? "text-slate-900" : "text-white"
                    }`}
                  >
                    {lang === "zh" ? "色彩主题 (Theme)" : "Color Theme"}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {theme === "dark"
                      ? (lang === "zh" ? "沉浸暗黑模式 (Dark)" : "Dark Mode")
                      : (lang === "zh" ? "温暖米白模式 (Beige)" : "Warm Beige Mode")}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={onToggleTheme}
                className={`px-3 py-1.5 rounded-xl font-mono text-xs border transition cursor-pointer flex items-center space-x-1.5 ${
                  theme === "beige"
                    ? "bg-slate-100 hover:bg-slate-200 text-slate-900 border-slate-300"
                    : "bg-slate-800 hover:bg-slate-700 text-white border-slate-700"
                }`}
              >
                {theme === "dark" ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                    <span>{lang === "zh" ? "浅色米白" : "Beige Light"}</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{lang === "zh" ? "沉浸暗黑" : "Dark Noir"}</span>
                  </>
                )}
              </button>
            </div>

            {/* 3. RPC Network Node */}
            <div
              className={`flex items-center justify-between p-3.5 rounded-2xl border ${
                theme === "beige"
                  ? "bg-white/80 border-slate-300"
                  : "bg-slate-950/70 border-slate-800/80"
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Server className="w-4 h-4 text-indigo-400" />
                <div>
                  <span
                    className={`font-bold block ${
                      theme === "beige" ? "text-slate-900" : "text-white"
                    }`}
                  >
                    {lang === "zh" ? "NEAR 测试网 RPC 节点" : "NEAR Testnet Node"}
                  </span>
                  <span className="text-[11px] font-mono text-emerald-500">
                    test.rpc.fastnear.com (Active)
                  </span>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-500 font-mono font-bold">
                Healthy
              </span>
            </div>

            {/* 4. Gasless Intent Solver Routing */}
            <div
              className={`p-3.5 rounded-2xl border space-y-1.5 ${
                theme === "beige"
                  ? "bg-white/80 border-slate-300"
                  : "bg-slate-950/70 border-slate-800/80"
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`font-bold flex items-center space-x-1.5 ${
                    theme === "beige" ? "text-slate-900" : "text-white"
                  }`}
                >
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>
                    {lang === "zh"
                      ? "NEAR Intents 意图免 Gas 代付"
                      : "NEAR Intents Gasless Routing"}
                  </span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-500 font-bold">
                  Enabled
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {lang === "zh"
                  ? "由 solver-alpha.intents.near 节点为跨链存取款及闪兑自动代付 NEAR Gas 费用 (0 Gas 体验)。"
                  : "Solver automatically pre-funds all cross-chain deposit & swap transactions on NEAR."}
              </p>
            </div>

            {/* 5. Claim Faucet Quick Action */}
            <div
              className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                theme === "beige"
                  ? "bg-white/80 border-slate-300"
                  : "bg-slate-950/70 border-slate-800/80"
              }`}
            >
              <div>
                <span
                  className={`font-bold block ${
                    theme === "beige" ? "text-slate-900" : "text-white"
                  }`}
                >
                  {lang === "zh" ? "测试币水龙头 (USDC Faucet)" : "USDC Testnet Faucet"}
                </span>
                <span className="text-[11px] text-slate-400">
                  {lang === "zh" ? "每次充值 20 USDC (对标 Circle 官方配额)" : "Credit +20 USDC (Circle Standard)"}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    onClaimFaucet();
                    onClose();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition cursor-pointer"
                >
                  +20 USDC
                </button>
                <a
                  href="https://faucet.circle.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-bold transition flex items-center cursor-pointer"
                  title="Circle Official Faucet"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            className={`pt-3 border-t flex items-center justify-between text-xs font-mono text-slate-500 ${
              theme === "beige" ? "border-slate-300" : "border-slate-800/80"
            }`}
          >
            <span>OmniYield Protocol v1.0</span>
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                theme === "beige"
                  ? "bg-slate-200 hover:bg-slate-300 text-slate-800"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-300"
              }`}
            >
              {lang === "zh" ? "完成" : "Done"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
