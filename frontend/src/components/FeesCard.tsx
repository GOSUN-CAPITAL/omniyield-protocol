"use client";

import React, { useState, useEffect } from "react";
import {
  DollarSign,
  HelpCircle,
  ExternalLink,
  Copy,
  Check,
  Settings,
  ShieldCheck,
  TrendingUp,
  X,
  Zap,
} from "lucide-react";

interface FeeConfig {
  performance_fee_bps: number;
  management_fee_bps: number;
  performance_fee_recipient: string | null;
  management_fee_recipient: string | null;
}

interface FeesCardProps {
  connectedAccount: string;
  onLog?: (msg: string) => void;
  lang?: "en" | "zh";
}

export default function FeesCard({ connectedAccount, onLog, lang = "en" }: FeesCardProps) {
  const [fees, setFees] = useState<FeeConfig>({
    performance_fee_bps: 1000,
    management_fee_bps: 50,
    performance_fee_recipient: "dao.omniyield-vault.testnet",
    management_fee_recipient: "dao.omniyield-vault.testnet",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Form states for modal
  const [formPerfFee, setFormPerfFee] = useState("10.0");
  const [formMgmtFee, setFormMgmtFee] = useState("0.50");
  const [formPerfRec, setFormPerfRec] = useState("dao.omniyield-vault.testnet");
  const [formMgmtRec, setFormMgmtRec] = useState("dao.omniyield-vault.testnet");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updateSuccessTx, setUpdateSuccessTx] = useState<string | null>(null);

  // Tooltip hover states
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const fetchFees = async () => {
    try {
      const res = await fetch("/api/fees");
      if (res.ok) {
        const data = await res.json();
        setFees(data);
        setFormPerfFee((data.performance_fee_bps / 100).toFixed(1));
        setFormMgmtFee((data.management_fee_bps / 100).toFixed(2));
        setFormPerfRec(data.performance_fee_recipient || "");
        setFormMgmtRec(data.management_fee_recipient || "");
      }
    } catch (e) {
      console.error("Failed to fetch fee config:", e);
    }
  };

  useEffect(() => {
    fetchFees();
  }, []);

  const handleCopy = (text: string, key: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSaveFees = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setUpdateSuccessTx(null);

    const perfBps = Math.round(parseFloat(formPerfFee) * 100);
    const mgmtBps = Math.round(parseFloat(formMgmtFee) * 100);

    try {
      const res = await fetch("/api/fees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId: connectedAccount.startsWith("0x") ? "dao.omniyield-vault.testnet" : connectedAccount,
          performance_fee_bps: perfBps,
          management_fee_bps: mgmtBps,
          performance_fee_recipient: formPerfRec || null,
          management_fee_recipient: formMgmtRec || null,
        }),
      });

      const data = await res.json();
      if (data.success && data.txHash) {
        setUpdateSuccessTx(data.txHash);
        if (onLog) {
          onLog(`[${new Date().toLocaleTimeString()}] ⚙️ Fee Configuration Updated on NEAR Testnet (Tx: ${data.txHash.slice(0, 10)}...)`);
        }
        await fetchFees();
      } else {
        alert(data.error || "Failed to update fees");
      }
    } catch (err: any) {
      alert("Error submitting fee configuration: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const perfPercent = (fees.performance_fee_bps / 100).toFixed(1);
  const mgmtPercent = (fees.management_fee_bps / 100).toFixed(2);

  // Strict Role-Based Access Control: Only the DAO Multi-Sig Owner has fee adjustment authority
  const isDaoOrOwner =
    connectedAccount === "dao.omniyield-vault.testnet" ||
    connectedAccount === "omniyield-vault.testnet";

  return (
    <div className="mb-10 rounded-2xl bg-slate-900/80 border border-slate-800 p-6 shadow-2xl backdrop-blur-sm">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-800/80 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white tracking-wide">
              {lang === "zh" ? "金库费率与协议营收" : "Fees & Protocol Revenue"}
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
              {lang === "zh" ? "DAO 链上治理" : "DAO Governed"}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {lang === "zh"
              ? "由 Multi-Sig DAO 与策展人在 NEAR 测试网上链治理的可配置营收架构"
              : "Configurable revenue architecture governed on-chain by the Multi-Sig DAO & Curator"}
          </p>
        </div>

        {isDaoOrOwner && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30 hover:border-emerald-500/60 transition flex items-center space-x-1.5 shadow-sm cursor-pointer"
              title="Admin multi-sig action: adjust fee rates or recipient addresses"
            >
              <Settings className="w-3.5 h-3.5 text-emerald-400" />
              <span>{lang === "zh" ? "⚙️ 配置费率 (DAO 管理员)" : "⚙️ Configure Fees (Admin)"}</span>
            </button>
          </div>
        )}
      </div>

      {/* Morpho Standard Fees Table matching user's reference */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/70 divide-y divide-slate-800/80">
        {/* Performance Fee */}
        <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-900/40 transition">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-slate-200">Performance fee</span>
            <div className="relative inline-block">
              <button
                onMouseEnter={() => setActiveTooltip("perf")}
                onMouseLeave={() => setActiveTooltip(null)}
                className="text-slate-500 hover:text-slate-300 transition"
                type="button"
                aria-label="Performance fee explanation"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
              {activeTooltip === "perf" && (
                <div className="absolute left-6 top-0 z-20 w-72 p-3 text-xs rounded-xl bg-slate-900 text-slate-300 border border-slate-700 shadow-2xl backdrop-blur-md">
                  Percentage of raw yield generated across underlying sub-markets (e.g. RHEA Lending & Ondo Treasuries) paid to the protocol before compounding into NUSD share value. If depositors earn zero yield, the protocol collects $0.
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-base font-bold font-mono text-emerald-400">{perfPercent}%</span>
            <span className="text-xs text-slate-500 font-mono">({fees.performance_fee_bps} bps)</span>
          </div>
        </div>

        {/* Management Fee */}
        <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-900/40 transition">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-slate-200">Management fee</span>
            <div className="relative inline-block">
              <button
                onMouseEnter={() => setActiveTooltip("mgmt")}
                onMouseLeave={() => setActiveTooltip(null)}
                className="text-slate-500 hover:text-slate-300 transition"
                type="button"
                aria-label="Management fee explanation"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
              {activeTooltip === "mgmt" && (
                <div className="absolute left-6 top-0 z-20 w-72 p-3 text-xs rounded-xl bg-slate-900 text-slate-300 border border-slate-700 shadow-2xl backdrop-blur-md">
                  Annualized management fee assessed on Total Vault Assets (TVL) under management, auto-minted as fee shares to the treasury. Currently set to {mgmtPercent}%.
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-base font-bold font-mono text-cyan-400">{mgmtPercent}%</span>
            <span className="text-xs text-slate-500 font-mono">({fees.management_fee_bps} bps)</span>
          </div>
        </div>

        {/* Performance Fee Recipient */}
        <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-900/40 transition">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-slate-200">Performance fee recipient</span>
            <div className="relative inline-block">
              <button
                onMouseEnter={() => setActiveTooltip("perfRec")}
                onMouseLeave={() => setActiveTooltip(null)}
                className="text-slate-500 hover:text-slate-300 transition"
                type="button"
                aria-label="Recipient explanation"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
              {activeTooltip === "perfRec" && (
                <div className="absolute left-6 top-0 z-20 w-72 p-3 text-xs rounded-xl bg-slate-900 text-slate-300 border border-slate-700 shadow-2xl backdrop-blur-md">
                  On-chain address receiving newly minted NUSD fee shares during yield accruals. Controlled by Multi-Sig DAO governance.
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {fees.performance_fee_recipient ? (
              <div className="flex items-center space-x-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                <a
                  href={`https://testnet.nearblocks.io/address/${fees.performance_fee_recipient}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-xs text-slate-200 hover:text-emerald-400 transition underline underline-offset-2 flex items-center space-x-1"
                >
                  <span>{fees.performance_fee_recipient}</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
                <button
                  onClick={() => handleCopy(fees.performance_fee_recipient!, "perfRec")}
                  className="text-slate-500 hover:text-slate-300 transition p-0.5"
                  title="Copy address"
                >
                  {copiedKey === "perfRec" ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            ) : (
              <span className="text-xs text-slate-500 font-mono">No address</span>
            )}
          </div>
        </div>

        {/* Management Fee Recipient */}
        <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-900/40 transition">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-slate-200">Management fee recipient</span>
            <div className="relative inline-block">
              <button
                onMouseEnter={() => setActiveTooltip("mgmtRec")}
                onMouseLeave={() => setActiveTooltip(null)}
                className="text-slate-500 hover:text-slate-300 transition"
                type="button"
                aria-label="Management fee recipient explanation"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
              {activeTooltip === "mgmtRec" && (
                <div className="absolute left-6 top-0 z-20 w-72 p-3 text-xs rounded-xl bg-slate-900 text-slate-300 border border-slate-700 shadow-2xl backdrop-blur-md">
                  Designated vault treasury account receiving annual management fees.
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {fees.management_fee_recipient ? (
              <div className="flex items-center space-x-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                <a
                  href={`https://testnet.nearblocks.io/address/${fees.management_fee_recipient}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-xs text-slate-200 hover:text-emerald-400 transition underline underline-offset-2 flex items-center space-x-1"
                >
                  <span>{fees.management_fee_recipient}</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
                <button
                  onClick={() => handleCopy(fees.management_fee_recipient!, "mgmtRec")}
                  className="text-slate-500 hover:text-slate-300 transition p-0.5"
                  title="Copy address"
                >
                  {copiedKey === "mgmtRec" ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            ) : (
              <span className="text-xs text-slate-500 font-mono">No address</span>
            )}
          </div>
        </div>
      </div>

      {/* Configure Fees Modal - strictly protected for DAO Multi-Sig Owner */}
      {isModalOpen && isDaoOrOwner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl">
            <button
              onClick={() => {
                setIsModalOpen(false);
                setUpdateSuccessTx(null);
              }}
              className="absolute right-4 top-4 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2.5 mb-5 pb-3 border-b border-slate-800">
              <Settings className="w-5 h-5 text-emerald-400" />
              <div>
                <h3 className="font-bold text-base text-white">Configure Vault Fees (Admin / DAO)</h3>
                <p className="text-xs text-slate-400">Updates live on-chain configuration via NEAR smart contract</p>
              </div>
            </div>

            {updateSuccessTx && (
              <div className="mb-4 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs space-y-1">
                <div className="font-bold flex items-center space-x-1.5">
                  <Zap className="w-4 h-4 text-emerald-400" />
                  <span>On-Chain Fee Parameters Updated!</span>
                </div>
                <a
                  href={`https://testnet.nearblocks.io/txns/${updateSuccessTx}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-[11px] text-cyan-400 hover:underline flex items-center space-x-1"
                >
                  <span>Tx: {updateSuccessTx}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}

            <form onSubmit={handleSaveFees} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Performance Fee (%):
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="50"
                    value={formPerfFee}
                    onChange={(e) => setFormPerfFee(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                    required
                  />
                  <span className="absolute right-3.5 top-2.5 text-xs text-slate-500 font-mono">
                    Max: 50.0%
                  </span>
                </div>
                <span className="text-[11px] text-slate-500">
                  Basis points: {Math.round(parseFloat(formPerfFee || "0") * 100)} bps
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Management Fee (%):
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    max="5"
                    value={formMgmtFee}
                    onChange={(e) => setFormMgmtFee(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-sm focus:outline-none focus:border-cyan-500"
                    required
                  />
                  <span className="absolute right-3.5 top-2.5 text-xs text-slate-500 font-mono">
                    Max: 5.0%
                  </span>
                </div>
                <span className="text-[11px] text-slate-500">
                  Basis points: {Math.round(parseFloat(formMgmtFee || "0") * 100)} bps
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Performance Fee Recipient:
                </label>
                <input
                  type="text"
                  value={formPerfRec}
                  onChange={(e) => setFormPerfRec(e.target.value)}
                  placeholder="dao.omniyield-vault.testnet"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Management Fee Recipient:
                </label>
                <input
                  type="text"
                  value={formMgmtRec}
                  onChange={(e) => setFormMgmtRec(e.target.value)}
                  placeholder="dao.omniyield-vault.testnet"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                <span className="text-[11px] text-slate-500 flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Authorized by Multi-Sig DAO</span>
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition disabled:opacity-50"
                  >
                    {isSubmitting ? "Broadcasting..." : "Save On-Chain"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

