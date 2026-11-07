"use client";

import React, { useState } from "react";
import {
  User,
  ExternalLink,
  ArrowUpDown,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  TrendingUp,
  ShieldCheck,
  Clock,
  Layers,
  Sparkles,
  Zap,
} from "lucide-react";

export type LedgerTabType = "depositors" | "activity" | "deposits" | "withdrawals" | "stats";

interface VaultLedgerTabsProps {
  vaultType: "usdc" | "all-weather";
  lang?: "en" | "zh";
  theme?: "dark" | "beige";
  currentSharePrice?: number;
}

export function VaultLedgerTabs({
  vaultType = "all-weather",
  lang = "en",
  theme = "beige",
  currentSharePrice = 1.0628,
}: VaultLedgerTabsProps) {
  const [activeTab, setActiveTab] = useState<LedgerTabType>("depositors");
  const [sortBy, setSortBy] = useState<"balance" | "value">("value");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  const isZh = lang === "zh";

  // 1. Depositors Data
  const depositorsList = [
    {
      address: "dao.omniyield-vault.testnet",
      label: isZh ? "DAO 协议国库 (Council Reserve)" : "DAO Treasury Reserve",
      shares: vaultType === "all-weather" ? 3150000 : 4200000,
      chain: "NEAR",
    },
    {
      address: "0x9f4d847fd978014b6fb94d0cc717b6adac444781",
      label: isZh ? "Arbitrum 机构流动性巨鲸" : "Arbitrum Whale LP",
      shares: vaultType === "all-weather" ? 1820000 : 2450000,
      chain: "Arbitrum",
    },
    {
      address: "curator.omniyield-vault.testnet",
      label: isZh ? "Gosun Labs 策展人创世金" : "Gosun Labs Curator Seed",
      shares: vaultType === "all-weather" ? 980000 : 1200000,
      chain: "NEAR",
    },
    {
      address: "0xd6807a5d4145bbb18288e2f45ca3adb2c788946c",
      label: isZh ? "Base 智能套利对冲基金" : "Base Smart Arbitrage Fund",
      shares: vaultType === "all-weather" ? 640000 : 850000,
      chain: "Base",
    },
    {
      address: "0x766aee920864bd5e4ab68de2c95552eed6b6a1a7",
      label: isZh ? "Solana 跨链做市商" : "Solana Cross-Chain MM",
      shares: vaultType === "all-weather" ? 420000 : 610000,
      chain: "Solana",
    },
    {
      address: "allocator.omniyield-vault.testnet",
      label: isZh ? "NEAR AI 动态路由缓冲池" : "AI Solver Buffer Pool",
      shares: vaultType === "all-weather" ? 250000 : 380000,
      chain: "NEAR",
    },
    {
      address: "0xfeecc6a989c759e0021dab9f27cb8cba0608b03e",
      label: isZh ? "高净值机构定投专户" : "Institutional Desk VIP",
      shares: vaultType === "all-weather" ? 185000 : 240000,
      chain: "Ethereum",
    },
  ];

  const sortedDepositors = [...depositorsList].sort((a, b) => {
    const valA = a.shares * currentSharePrice;
    const valB = b.shares * currentSharePrice;
    return sortOrder === "desc" ? valB - valA : valA - valB;
  });

  // 2. Activity Data
  const activityList = [
    {
      type: isZh ? "宏观再平衡" : "AI Rebalance",
      action: "rebalance",
      outgoing: vaultType === "all-weather" ? "-$350,000 Ondo USDY" : "-$250,000 USDC",
      incoming: vaultType === "all-weather" ? "+$350,000 Nasdaq QQQ" : "+$250,000 RHEA Supply",
      time: isZh ? "12 分钟前" : "12 mins ago",
      txHash: "9aBc...87F1",
    },
    {
      type: isZh ? "跨链存入" : "Cross-Chain Deposit",
      action: "deposit",
      outgoing: "-$50,000 USDC (Arbitrum)",
      incoming: `+${(50000 / currentSharePrice).toFixed(2)} ${vaultType === "all-weather" ? "OmniUSDC" : "NUSD"}`,
      time: isZh ? "42 分钟前" : "42 mins ago",
      txHash: "0x4b7...21c9",
    },
    {
      type: isZh ? "复利收益结算" : "Yield Compound",
      action: "harvest",
      outgoing: "$0 Principal Cost",
      incoming: "+$1,640.25 USDC Realized",
      time: isZh ? "3 小时前" : "3 hours ago",
      txHash: "F3b1...e90a",
    },
    {
      type: isZh ? "流动性缓冲补充" : "Buffer Refill",
      action: "buffer",
      outgoing: "-$120,000 Ondo USDY",
      incoming: "+$120,000 Liquid USDC",
      time: isZh ? "6 小时前" : "6 hours ago",
      txHash: "7cD2...11b4",
    },
    {
      type: isZh ? "原生存入" : "Native Deposit",
      action: "deposit",
      outgoing: "-$10,000 USDC (NEAR)",
      incoming: `+${(10000 / currentSharePrice).toFixed(2)} ${vaultType === "all-weather" ? "OmniUSDC" : "NUSD"}`,
      time: isZh ? "14 小时前" : "14 hours ago",
      txHash: "2eFa...88a3",
    },
    {
      type: isZh ? "即刻提款" : "Instant Withdrawal",
      action: "withdraw",
      outgoing: `-${(5000 / currentSharePrice).toFixed(2)} ${vaultType === "all-weather" ? "OmniUSDC" : "NUSD"}`,
      incoming: "+$5,000.00 USDC (Solana)",
      time: isZh ? "1 天前" : "1 day ago",
      txHash: "0x88f...ca23",
    },
  ];

  // 3. Deposits Data
  const depositsList = [
    {
      tokens: (50000 / currentSharePrice).toFixed(2),
      value: "$50,000",
      address: "0x9f4d847fd978014b6fb94d0cc717b6adac444781",
      chain: "Arbitrum",
      time: isZh ? "42 分钟前" : "42 mins ago",
      txHash: "0x4b7...21c9",
    },
    {
      tokens: (10000 / currentSharePrice).toFixed(2),
      value: "$10,000",
      address: "dao.omniyield-vault.testnet",
      chain: "NEAR",
      time: isZh ? "14 小时前" : "14 hours ago",
      txHash: "2eFa...88a3",
    },
    {
      tokens: (25000 / currentSharePrice).toFixed(2),
      value: "$25,000",
      address: "0xd6807a5d4145bbb18288e2f45ca3adb2c788946c",
      chain: "Base",
      time: isZh ? "1 天前" : "1 day ago",
      txHash: "0x91d...55e2",
    },
    {
      tokens: (15000 / currentSharePrice).toFixed(2),
      value: "$15,000",
      address: "0x766aee920864bd5e4ab68de2c95552eed6b6a1a7",
      chain: "Solana",
      time: isZh ? "2 天前" : "2 days ago",
      txHash: "3bCa...0981",
    },
    {
      tokens: (8000 / currentSharePrice).toFixed(2),
      value: "$8,000",
      address: "0xfeecc6a989c759e0021dab9f27cb8cba0608b03e",
      chain: "Ethereum",
      time: isZh ? "3 天前" : "3 days ago",
      txHash: "0xaa1...12ff",
    },
  ];

  // 4. Withdrawals Data
  const withdrawalsList = [
    {
      tokens: (5000 / currentSharePrice).toFixed(2),
      value: "$5,000.00",
      address: "0x88fa...ca23",
      chain: "Solana",
      route: isZh ? "优先队列 1: Ondo 美债缓冲 (即刻T+0)" : "Priority 1: Ondo USDY Buffer (Instant)",
      time: isZh ? "1 天前" : "1 day ago",
      txHash: "0x88f...ca23",
    },
    {
      tokens: (12000 / currentSharePrice).toFixed(2),
      value: "$12,000.00",
      address: "0xd680...946c",
      chain: "Base",
      route: isZh ? "优先队列 1: Ondo 美债缓冲 (即刻T+0)" : "Priority 1: Ondo USDY Buffer (Instant)",
      time: isZh ? "4 天前" : "4 days ago",
      txHash: "0x12b...9901",
    },
    {
      tokens: (2000 / currentSharePrice).toFixed(2),
      value: "$2,000.00",
      address: "user.near",
      chain: "NEAR",
      route: isZh ? "RHEA 借贷池流动性" : "RHEA Lending Pool Liquidity",
      time: isZh ? "6 天前" : "6 days ago",
      txHash: "44eF...1234",
    },
  ];

  // Helper for chain color badges
  const getChainBadge = (chain: string) => {
    switch (chain.toLowerCase()) {
      case "arbitrum":
        return "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20";
      case "solana":
        return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20";
      case "base":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
      case "near":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
      default:
        return "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20";
    }
  };

  return (
    <div className="card-surface rounded-2xl p-6 border shadow-sm space-y-5">
      {/* 1. Header Pill Tabs Bar (Chamber Style) */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800/80 pb-4">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800">
          {(
            [
              { id: "depositors", labelEn: "Depositors", labelZh: "储户分布" },
              { id: "activity", labelEn: "Activity", labelZh: "全网动态" },
              { id: "deposits", labelEn: "Deposits", labelZh: "存入流水" },
              { id: "withdrawals", labelEn: "Withdrawals", labelZh: "提取流水" },
              { id: "stats", labelEn: "Stats", labelZh: "高阶量化" },
            ] as const
          ).map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                {isZh ? tab.labelZh : tab.labelEn}
              </button>
            );
          })}
        </div>

        {/* Counter Summary */}
        <div className="text-xs font-mono text-slate-500 dark:text-slate-400 flex items-center space-x-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>
            {activeTab === "depositors" && (isZh ? "128 位独立储户" : "128 Unique Depositors")}
            {activeTab === "activity" && (isZh ? "43 笔链上调仓与流水" : "43 Total Records")}
            {activeTab === "deposits" && (isZh ? "14 笔存入明细" : "14 Recent Deposits")}
            {activeTab === "withdrawals" && (isZh ? "3 笔提取明细" : "3 Recent Withdrawals")}
            {activeTab === "stats" && (isZh ? "世界一流量化金融指标" : "Institutional Risk Metrics")}
          </span>
        </div>
      </div>

      {/* 2. TAB CONTENT: Depositors */}
      {activeTab === "depositors" && (
        <div className="space-y-3">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-200 dark:border-slate-800/80 font-semibold">
                  <th
                    className="pb-3 cursor-pointer hover:text-slate-700 dark:hover:text-white"
                    onClick={() => {
                      setSortBy("balance");
                      setSortOrder(sortOrder === "desc" ? "asc" : "desc");
                    }}
                  >
                    <div className="flex items-center space-x-1">
                      <span>{isZh ? "持仓份额" : "Depositor Balance"}</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th
                    className="pb-3 cursor-pointer hover:text-slate-700 dark:hover:text-white"
                    onClick={() => {
                      setSortBy("value");
                      setSortOrder(sortOrder === "desc" ? "asc" : "desc");
                    }}
                  >
                    <div className="flex items-center space-x-1">
                      <span>{isZh ? "美元估值" : "Depositor Value"}</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="pb-3 text-right">{isZh ? "储户地址 / 标签" : "Depositor Address"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                {sortedDepositors.map((dep, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                    <td className="py-3 text-slate-900 dark:text-white font-bold">
                      {dep.shares.toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">{vaultType === "all-weather" ? "OmniUSDC" : "NUSD"}</span>
                    </td>
                    <td className="py-3 text-emerald-700 dark:text-emerald-400 font-bold">
                      ${(dep.shares * currentSharePrice).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getChainBadge(dep.chain)}`}>
                          {dep.chain}
                        </span>
                        <a
                          href={`https://testnet.nearblocks.io/address/${dep.address}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center space-x-1 text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 transition"
                          title={dep.label}
                        >
                          <User className="w-3 h-3 text-slate-400" />
                          <span>
                            {dep.address.length > 20 ? `${dep.address.slice(0, 6)}...${dep.address.slice(-4)}` : dep.address}
                          </span>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. TAB CONTENT: Activity */}
      {activeTab === "activity" && (
        <div className="space-y-3">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-200 dark:border-slate-800/80 font-semibold">
                  <th className="pb-3">{isZh ? "操作类型" : "Tx Type"}</th>
                  <th className="pb-3">{isZh ? "流出资产" : "Outgoing"}</th>
                  <th className="pb-3">{isZh ? "流入资产" : "Incoming"}</th>
                  <th className="pb-3 text-right">{isZh ? "发生时间" : "Time"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                {activityList.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                    <td className="py-3">
                      <span className="font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                        {item.action === "rebalance" && <RefreshCw className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />}
                        {item.action === "deposit" && <ArrowDownLeft className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />}
                        {item.action === "withdraw" && <ArrowUpRight className="w-3 h-3 text-amber-600 dark:text-amber-400" />}
                        {item.action === "harvest" && <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />}
                        {item.action === "buffer" && <ShieldCheck className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />}
                        <span>{item.type}</span>
                      </span>
                    </td>
                    <td className="py-3 text-slate-600 dark:text-slate-400 font-medium">
                      {item.outgoing}
                    </td>
                    <td className="py-3 text-emerald-700 dark:text-emerald-400 font-bold">
                      {item.incoming}
                    </td>
                    <td className="py-3 text-right">
                      <a
                        href="https://testnet.nearblocks.io"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center space-x-1 text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
                      >
                        <span>{item.time}</span>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. TAB CONTENT: Deposits */}
      {activeTab === "deposits" && (
        <div className="space-y-3">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-200 dark:border-slate-800/80 font-semibold">
                  <th className="pb-3">{isZh ? "获得份额" : "Vault Tokens"}</th>
                  <th className="pb-3">{isZh ? "存入金额 (USD)" : "Value In USD"}</th>
                  <th className="pb-3">{isZh ? "储户地址" : "Depositor Address"}</th>
                  <th className="pb-3 text-right">{isZh ? "时间 / 存入链" : "Time"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                {depositsList.map((dep, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                    <td className="py-3 text-slate-900 dark:text-white font-bold">
                      {dep.tokens} <span className="text-[10px] text-slate-400 font-normal">{vaultType === "all-weather" ? "OmniUSDC" : "NUSD"}</span>
                    </td>
                    <td className="py-3 text-emerald-700 dark:text-emerald-400 font-bold">
                      {dep.value}
                    </td>
                    <td className="py-3 text-slate-600 dark:text-slate-300">
                      {dep.address.length > 20 ? `${dep.address.slice(0, 6)}...${dep.address.slice(-4)}` : dep.address}
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getChainBadge(dep.chain)}`}>
                          {dep.chain}
                        </span>
                        <a
                          href="https://testnet.nearblocks.io"
                          target="_blank"
                          rel="noreferrer"
                          className="text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center space-x-0.5"
                        >
                          <span>{dep.time}</span>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. TAB CONTENT: Withdrawals */}
      {activeTab === "withdrawals" && (
        <div className="space-y-3">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-200 dark:border-slate-800/80 font-semibold">
                  <th className="pb-3">{isZh ? "赎回份额" : "Vault Tokens"}</th>
                  <th className="pb-3">{isZh ? "出金价值 (USD)" : "Value In USD"}</th>
                  <th className="pb-3">{isZh ? "退场流动性通道" : "Exit Buffer Route"}</th>
                  <th className="pb-3 text-right">{isZh ? "时间 / 目标链" : "Time"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                {withdrawalsList.map((wd, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                    <td className="py-3 text-slate-900 dark:text-white font-bold">
                      {wd.tokens}
                    </td>
                    <td className="py-3 text-slate-900 dark:text-white font-bold">
                      {wd.value}
                    </td>
                    <td className="py-3">
                      <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold flex items-center space-x-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>{wd.route}</span>
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getChainBadge(wd.chain)}`}>
                          {wd.chain}
                        </span>
                        <a
                          href="https://testnet.nearblocks.io"
                          target="_blank"
                          rel="noreferrer"
                          className="text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center space-x-0.5"
                        >
                          <span>{wd.time}</span>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. TAB CONTENT: Stats (4x3 Chamber Grid) */}
      {activeTab === "stats" && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="well-inset p-3.5 rounded-xl border space-y-1">
            <span className="text-slate-500 block text-[11px] font-sans font-medium">{isZh ? "金库智能合约" : "Vault Address"}</span>
            <a
              href="https://testnet.nearblocks.io/address/omniyield-vault.testnet"
              target="_blank"
              rel="noreferrer"
              className="font-bold text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center space-x-1 truncate"
            >
              <span>omniyield-vault.testnet</span>
              <ExternalLink className="w-3 h-3 text-slate-400 flex-shrink-0" />
            </a>
          </div>

          <div className="well-inset p-3.5 rounded-xl border space-y-1">
            <span className="text-slate-500 block text-[11px] font-sans font-medium">{isZh ? "金库治理管理者" : "Manager Address"}</span>
            <a
              href="https://testnet.nearblocks.io/address/curator.omniyield-vault.testnet"
              target="_blank"
              rel="noreferrer"
              className="font-bold text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center space-x-1 truncate"
            >
              <span>curator...testnet</span>
              <ExternalLink className="w-3 h-3 text-slate-400 flex-shrink-0" />
            </a>
          </div>

          <div className="well-inset p-3.5 rounded-xl border space-y-1">
            <span className="text-slate-500 block text-[11px] font-sans font-medium">{isZh ? "当前份额净值 (NAV)" : "Vault Token Price"}</span>
            <div className="text-lg font-black text-emerald-700 dark:text-emerald-400">${currentSharePrice.toFixed(4)}</div>
          </div>

          <div className="well-inset p-3.5 rounded-xl border space-y-1">
            <span className="text-slate-500 block text-[11px] font-sans font-medium">{isZh ? "历史最高净值 (ATH)" : "All-Time High"}</span>
            <div className="text-lg font-black text-slate-900 dark:text-white">${currentSharePrice.toFixed(4)}</div>
          </div>

          <div className="well-inset p-3.5 rounded-xl border space-y-1">
            <span className="text-slate-500 block text-[11px] font-sans font-medium">{isZh ? "流通总份额" : "Total Shares"}</span>
            <div className="text-sm font-bold text-slate-900 dark:text-white">
              {vaultType === "all-weather" ? "8,091,832.84" : "11,874,120.50"}
            </div>
          </div>

          <div className="well-inset p-3.5 rounded-xl border space-y-1">
            <span className="text-slate-500 block text-[11px] font-sans font-medium">{isZh ? "管理者自有跟投资金" : "Manager Stake"}</span>
            <div className="text-sm font-bold text-slate-900 dark:text-white">$980,000.00 (8.3%)</div>
          </div>

          <div className="well-inset p-3.5 rounded-xl border space-y-1">
            <span className="text-slate-500 block text-[11px] font-sans font-medium">{isZh ? "索提诺比率 (Sortino)" : "Sortino Ratio"}</span>
            <div className="text-sm font-bold text-emerald-700 dark:text-emerald-400">3.82 (Top Tier)</div>
          </div>

          <div className="well-inset p-3.5 rounded-xl border space-y-1">
            <span className="text-slate-500 block text-[11px] font-sans font-medium">{isZh ? "下行波动率" : "Downside Volatility"}</span>
            <div className="text-sm font-bold text-slate-900 dark:text-white">0.38% (Low Risk)</div>
          </div>

          <div className="well-inset p-3.5 rounded-xl border space-y-1">
            <span className="text-slate-500 block text-[11px] font-sans font-medium">{isZh ? "全球全网排名" : "Leaderboard Rank"}</span>
            <div className="text-sm font-bold text-cyan-600 dark:text-cyan-400">#1 Real-World Asset</div>
          </div>

          <div className="well-inset p-3.5 rounded-xl border space-y-1">
            <span className="text-slate-500 block text-[11px] font-sans font-medium">{isZh ? "协议已赚提成费" : "Earned Fees"}</span>
            <div className="text-sm font-bold text-emerald-700 dark:text-emerald-400">$0.00 (0% Fee)</div>
          </div>

          <div className="well-inset p-3.5 rounded-xl border space-y-1">
            <span className="text-slate-500 block text-[11px] font-sans font-medium">{isZh ? "AI 调仓合约逻辑" : "Manager Logic"}</span>
            <a
              href="https://testnet.nearblocks.io/address/omniyield-vault.testnet"
              target="_blank"
              rel="noreferrer"
              className="text-sm font-bold text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center space-x-1"
            >
              <span>0x8B3...99c</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          </div>

          <div className="well-inset p-3.5 rounded-xl border space-y-1">
            <span className="text-slate-500 block text-[11px] font-sans font-medium">{isZh ? "T+0 缓冲储备深度" : "Liquidity Buffer"}</span>
            <div className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
              {vaultType === "all-weather" ? "40% Ondo USDY Anchor" : "30% Sovereign RWA"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

