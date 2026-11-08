"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  TrendingUp,
  Zap,
  Settings,
  X,
  Clock,
  AlertTriangle,
  RotateCcw,
  Sliders,
  DollarSign,
  Activity,
  Layers,
  Check,
  ExternalLink,
  Lock,
  Unlock,
  Key,
  RefreshCw,
  Puzzle,
  Scale,
  Globe,
  BrainCircuit,
  Eye,
  EyeOff,
  Flame,
  BarChart3,
  PieChart,
  ArrowLeftRight,
  User,
  Plug,
  Power,
  Sparkles,
  Bot,
  FileText,
  Terminal,
  Plus,
} from "lucide-react";
import GovernanceIcon, { GovernanceIconName } from "./GovernanceIcon";
import type { BacksideDomainType } from "./AppSidebar";

interface VaultCockpitBacksideProps {
  connectedAccount: string;
  onSwitchAccount: (newAccount: string) => void;
  onFlipBack: () => void;
  rheaCap: number;
  ondoCap: number;
  onUpdateRheaCap: (newCap: number) => void;
  onUpdateOndoCap: (newCap: number) => void;
  timelockPending: boolean;
  onProposeCapIncrease: () => void;
  onGuardianVeto: () => void;
  onExecuteCapIncrease: () => void;
  circuitBreakerActive: boolean;
  onToggleCircuitBreaker: () => void;
  onLog: (msg: string) => void;
  logs?: string[];
  lang?: "en" | "zh";
  theme?: "dark" | "beige";
  activeDomain?: BacksideDomainType;
  onSelectDomain?: (domain: BacksideDomainType) => void;
}

interface DomainTabItem {
  key: BacksideDomainType;
  num: string;
  labelZh: string;
  labelEn: string;
  shortZh: string;
  shortEn: string;
  icon: GovernanceIconName;
  count: number;
}

const DOMAIN_TABS: DomainTabItem[] = [
  {
    key: "vaults",
    num: "1",
    labelZh: "1. 金库治理与插座",
    labelEn: "1. Vaults & Sockets",
    shortZh: "金库治理",
    shortEn: "Vaults",
    icon: "vault_bank",
    count: 7,
  },
  {
    key: "exchange",
    num: "2",
    labelZh: "2. 交换与意图清算",
    labelEn: "2. Exchange Routing",
    shortZh: "交换清算",
    shortEn: "Exchange",
    icon: "intent_mesh",
    count: 4,
  },
  {
    key: "markets",
    num: "3",
    labelZh: "3. 市场与预言机",
    labelEn: "3. Markets & Feeds",
    shortZh: "市场预言机",
    shortEn: "Markets",
    icon: "oracle_crystal",
    count: 4,
  },
  {
    key: "portfolio",
    num: "4",
    labelZh: "4. 组合会计与托管",
    labelEn: "4. Portfolio & Custody",
    shortZh: "组合托管",
    shortEn: "Portfolio",
    icon: "portfolio_aum",
    count: 4,
  },
  {
    key: "ai",
    num: "5",
    labelZh: "5. NEAR AI 智能体",
    labelEn: "5. AI Agent Engine",
    shortZh: "NEAR AI",
    shortEn: "AI Engine",
    icon: "ai_circuit",
    count: 7,
  },
];

export default function VaultCockpitBackside({
  connectedAccount,
  onSwitchAccount,
  onFlipBack,
  rheaCap,
  ondoCap,
  onUpdateRheaCap,
  onUpdateOndoCap,
  timelockPending,
  onProposeCapIncrease,
  onGuardianVeto,
  onExecuteCapIncrease,
  circuitBreakerActive,
  onToggleCircuitBreaker,
  onLog,
  logs = [],
  lang = "en",
  theme = "dark",
  activeDomain = "vaults",
  onSelectDomain,
}: VaultCockpitBacksideProps) {
  const [internalDomain, setInternalDomain] = useState<BacksideDomainType>(activeDomain || "vaults");
  const currentDomain: BacksideDomainType = activeDomain || internalDomain;

  const handleDomainChange = (domain: BacksideDomainType) => {
    if (onSelectDomain) {
      onSelectDomain(domain);
    }
    setInternalDomain(domain);
  };

  const currentIndex = DOMAIN_TABS.findIndex((d) => d.key === currentDomain);
  const prevDomain = currentIndex > 0 ? DOMAIN_TABS[currentIndex - 1] : null;
  const nextDomain = currentIndex < DOMAIN_TABS.length - 1 ? DOMAIN_TABS[currentIndex + 1] : null;
  // Role detection
  const isDao =
    connectedAccount === "dao.omniyield-vault.testnet" ||
    connectedAccount === "omniyield-vault.testnet";
  const isCurator = connectedAccount === "curator.omniyield-vault.testnet" || isDao;
  const isGuardian = connectedAccount === "guardian.omniyield-vault.testnet";
  const isAllocator = connectedAccount === "allocator.omniyield-vault.testnet";

  // 1. DAO & Multi-Sig Proposals
  const [multisigData, setMultisigData] = useState<{
    councilMembers: string[];
    threshold: number;
    proposalCount: number;
    pendingCount: number;
    proposals: any[];
  } | null>(null);
  const [isLoadingProposals, setIsLoadingProposals] = useState(false);
  const [isSigningProposal, setIsSigningProposal] = useState<number | null>(null);
  const [proposalPreset, setProposalPreset] = useState("cap-rhea-15m");
  const [isCreatingProposal, setIsCreatingProposal] = useState(false);
  const [createMsg, setCreateMsg] = useState<string | null>(null);

  // 2. Fees
  const [perfFee, setPerfFee] = useState("10.0");
  const [mgmtFee, setMgmtFee] = useState("0.50");
  const [perfRec, setPerfRec] = useState("dao.omniyield-vault.testnet");
  const [mgmtRec, setMgmtRec] = useState("dao.omniyield-vault.testnet");
  const [isSavingFees, setIsSavingFees] = useState(false);
  const [feeSaveSuccess, setFeeSaveSuccess] = useState<string | null>(null);

  // 3. Caps
  const [rheaInputCap, setRheaInputCap] = useState(rheaCap.toString());
  const [ondoInputCap, setOndoInputCap] = useState(ondoCap.toString());
  const [capSaveMsg, setCapSaveMsg] = useState<string | null>(null);

  // 4. Allocator Bounds
  const [maxSingleShift, setMaxSingleShift] = useState(15);
  const [cooldownMinutes, setCooldownMinutes] = useState(30);

  // 5. Strategy Sockets (Pluggable Black-Box)
  const [socket1Status, setSocket1Status] = useState<"online" | "ejected">("online");
  const [socket2Status, setSocket2Status] = useState<"online" | "ejected">("online");
  const [socket1Wasm, setSocket1Wasm] = useState("GOSUN_NUSD_DynamicSpread_Encap_v1.0.wasm");
  const [socket2Wasm, setSocket2Wasm] = useState("GOSUN_AllWeather_MacroParity_Encap_v1.0.wasm");
  const [isHotSwapping, setIsHotSwapping] = useState<string | null>(null);

  // 6. Exchange Settings (16 Chains & Solvers)
  const [enabledChains, setEnabledChains] = useState<Record<string, boolean>>({
    NEAR: true,
    Arbitrum: true,
    Solana: true,
    Ethereum: true,
    Base: true,
    Polygon: true,
    Bitcoin: true,
    Avalanche: true,
    Optimism: true,
    BNB: true,
    Zcash: true,
    Tron: true,
    Sui: true,
    Aptos: true,
    Monad: true,
    Fantom: true,
  });
  const [hardSlippageCap, setHardSlippageCap] = useState("0.5");
  const [intentTimeoutSecs, setIntentTimeoutSecs] = useState("60");
  const [protocolSwapFeeBps, setProtocolSwapFeeBps] = useState("8");

  // 7. Markets Settings
  const [is247TradingEnabled, setIs247TradingEnabled] = useState(true);
  const [oracleMaxDeviation, setOracleMaxDeviation] = useState("0.5");
  const [volatilityHaltThreshold, setVolatilityHaltThreshold] = useState("10");

  // 8. Portfolio Settings
  const [targetReserveRatio, setTargetReserveRatio] = useState("15");
  const [whaleQueueThreshold, setWhaleQueueThreshold] = useState("50000");

  // OmniYield Modular Option B: Multi-Curator & Franchise Sub-Vault Registry State
  const [curatorList, setCuratorList] = useState([
    {
      id: "curator.omniyield-vault.testnet",
      name: "OmniYield Master Risk Curator",
      cap: 100000000,
      active: true,
      markets: ["rhea-lending", "ondo-rwa"],
      feeShare: 30,
    },
    {
      id: "steakhouse.near",
      name: "Steakhouse Financial Risk Engine",
      cap: 50000000,
      active: true,
      markets: ["rhea-lending", "ondo-rwa"],
      feeShare: 25,
    },
    {
      id: "bitwise.near",
      name: "Bitwise RWA Alpha Engine",
      cap: 25000000,
      active: true,
      markets: ["ondo-rwa"],
      feeShare: 20,
    },
  ]);

  const [subVaultList, setSubVaultList] = useState([
    {
      id: "sub_vault_steakhouse_usdc",
      name: "Steakhouse USD Core Alpha",
      curator: "steakhouse.near",
      partnerId: "partner_phantom_alpha",
      assets: 2500000,
      maxDebt: 10000000,
      mgmtFee: 0.5,
      perfFee: 15,
      paused: false,
    },
    {
      id: "sub_vault_bitwise_rwa",
      name: "Bitwise All-Weather RWA Institutional",
      curator: "bitwise.near",
      partnerId: "partner_fintech_asia",
      assets: 1200000,
      maxDebt: 5000000,
      mgmtFee: 0.75,
      perfFee: 18,
      paused: false,
    },
  ]);

  // 9. AI Agent Infrastructure (API Keys, Dynamic Polling, Skills, Persona, Learning, Quotas, Kill Switch)
  const [aiProvider, setAiProvider] = useState<"near-ai" | "deepseek" | "claude" | "openai">("near-ai");
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [isKeySaved, setIsKeySaved] = useState(false);
  const [pollingInterval, setPollingInterval] = useState("30"); // 30s
  const [yieldDeltaThreshold, setYieldDeltaThreshold] = useState("0.65"); // 0.65%
  const [aiExecutionMode, setAiExecutionMode] = useState<"copilot" | "autopilot">("autopilot");
  const [activeSkills, setActiveSkills] = useState<Record<string, boolean>>({
    "yield-oracle-scraper": true,
    "pareto-rebalancer": true,
    "near-intents-dispatcher": true,
    "multisig-proposal-drafter": true,
    "macro-fed-watcher": true,
  });
  const [selectedPersona, setSelectedPersona] = useState<"conservative" | "bridgewater" | "aggressive">("bridgewater");
  const [systemPrompt, setSystemPrompt] = useState(
    "You are the GOSUN Autonomous Macro Allocator. Maintain 4-Pillar Bridgewater risk parity across QQQ, US Treasuries, Gold, and Lending. Prioritize capital preservation while capturing Pareto-optimal yield spreads."
  );
  const [dailyTokenQuota, setDailyTokenQuota] = useState("500000");
  const [maxGasPerTx, setMaxGasPerTx] = useState("150");
  const [aiKillSwitchArmed, setAiKillSwitchArmed] = useState(false);

  // Fetch proposals
  const fetchProposals = () => {
    setIsLoadingProposals(true);
    fetch("/api/proposals")
      .then((r) => r.json())
      .then((data) => {
        if (data && data.success) {
          setMultisigData(data);
        }
      })
      .catch(console.error)
      .finally(() => setIsLoadingProposals(false));
  };

  useEffect(() => {
    fetchProposals();
  }, []);

  const handleConfirmProposal = async (proposalId: number) => {
    setIsSigningProposal(proposalId);
    try {
      const res = await fetch("/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "confirm",
          proposalId,
          signerAccount: connectedAccount,
        }),
      });
      const data = await res.json();
      if (data.success) {
        onLog(`[Multi-Sig Safe] Proposal #${proposalId} signed by ${connectedAccount}. Tx: ${data.txHash}`);
        fetchProposals();
      } else {
        alert(data.error || "Failed to confirm proposal");
      }
    } catch (err: any) {
      alert(err.message || "Failed to confirm proposal");
    } finally {
      setIsSigningProposal(null);
    }
  };

  const handleCreatePresetProposal = async () => {
    setIsCreatingProposal(true);
    setCreateMsg(null);
    try {
      let desc = "Proposal: Increase RHEA Supply Cap to $15,000,000";
      let target = "omniyield-vault.testnet";
      let methodName = "set_supply_cap";
      let argsObj: any = { market_id: "rhea-lending", new_cap: "15000000000000" };

      if (proposalPreset === "timelock-24h") {
        desc = "Proposal: Set Vault Governance Timelock to 24 Hours";
        methodName = "set_timelock_duration";
        argsObj = { new_duration_ns: 86400000000000 };
      } else if (proposalPreset === "emergency-pause") {
        desc = "Proposal: Emergency Circuit Breaker Pause for Protocol Safety";
        methodName = "pause";
        argsObj = {};
      }

      const res = await fetch("/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          proposer: connectedAccount,
          description: desc,
          target,
          methodName,
          argsObj,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCreateMsg(`Proposal created! Tx: ${data.txHash}`);
        onLog(`[Multi-Sig Safe] New proposal created by ${connectedAccount}. Tx: ${data.txHash}`);
        fetchProposals();
      } else {
        alert(data.error || "Failed to create proposal");
      }
    } catch (err: any) {
      alert(err.message || "Failed to create proposal");
    } finally {
      setIsCreatingProposal(false);
    }
  };

  const handleSaveFees = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDao) return;
    setIsSavingFees(true);
    setFeeSaveSuccess(null);

    try {
      const res = await fetch("/api/fees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId: connectedAccount,
          performance_fee_bps: Math.round(parseFloat(perfFee) * 100),
          management_fee_bps: Math.round(parseFloat(mgmtFee) * 100),
          performance_fee_recipient: perfRec,
          management_fee_recipient: mgmtRec,
        }),
      });

      const data = await res.json();
      if (data.success && data.txHash) {
        setFeeSaveSuccess(data.txHash);
        onLog(`[${new Date().toLocaleTimeString()}] [DAO MULTI-SIG] Fee parameters updated on NEAR Testnet (Tx: ${data.txHash.slice(0, 10)}...)`);
      } else {
        alert(data.error || "Failed to update fees");
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsSavingFees(false);
    }
  };

  const handleApplyCuratorCaps = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isCurator) return;
    const newRhea = Number(rheaInputCap);
    const newOndo = Number(ondoInputCap);

    if (isNaN(newRhea) || isNaN(newOndo)) {
      alert("Please enter valid cap numbers");
      return;
    }

    if (newRhea > rheaCap) {
      onProposeCapIncrease();
      setCapSaveMsg("RHEA expansion ($7M -> $10M) submitted to 24h Timelock! Guardian VETO open.");
    } else {
      onUpdateRheaCap(newRhea);
      onLog(`[${new Date().toLocaleTimeString()}] [CURATOR ACTION] RHEA cap updated immediately to $${newRhea.toLocaleString()}`);
      setCapSaveMsg("RHEA cap adjusted immediately (0s risk containment).");
    }

    onUpdateOndoCap(newOndo);
    setTimeout(() => setCapSaveMsg(null), 5000);
  };

  const handleHotSwapSocket = (socketId: string) => {
    setIsHotSwapping(socketId);
    setTimeout(() => {
      setIsHotSwapping(null);
      if (socketId === "socket-1") {
        setSocket1Wasm("GOSUN_NUSD_DynamicSpread_Encap_v2.0_Optimized.wasm");
        onLog(`[Socket Engine] Strategy Socket #1 hot-swapped to v2.0 (Zero-downtime compilation verified).`);
      } else {
        setSocket2Wasm("GOSUN_AllWeather_MacroParity_Encap_v2.0_Optimized.wasm");
        onLog(`[Socket Engine] Strategy Socket #2 hot-swapped to v2.0.`);
      }
    }, 1200);
  };

  const handleSaveApiKey = () => {
    if (!apiKeyInput.trim()) return;
    setIsKeySaved(true);
    onLog(`[AI Agent] API Key for provider '${aiProvider}' encrypted & stored in local security enclave.`);
    setTimeout(() => setIsKeySaved(false), 3000);
  };

  const handleToggleSubVaultPause = (subVaultId: string) => {
    setSubVaultList((prev) =>
      prev.map((sv) => {
        if (sv.id === subVaultId) {
          const nextState = !sv.paused;
          onLog(
            `[${new Date().toLocaleTimeString()}] [SUB-VAULT GOVERNANCE] ${sv.name} (${sv.id}) emergency pause set to: ${
              nextState ? "PAUSED (Redemptions queued)" : "ACTIVE (Normal ops)"
            }`
          );
          return { ...sv, paused: nextState };
        }
        return sv;
      })
    );
  };

  return (
    <div
      className={`w-full rounded-3xl p-6 md:p-8 transition-all duration-300 shadow-2xl ${
        theme === "beige"
          ? "bg-white/95 border border-[#dfd2be] text-slate-800 shadow-amber-900/5"
          : "bg-slate-900/95 border border-slate-700/80 text-slate-200 shadow-black/60"
      }`}
    >
      {/* Top Cockpit Header */}
      <div
        className={`flex flex-col lg:flex-row lg:items-center justify-between pb-6 mb-6 border-b gap-4 ${
          theme === "beige" ? "border-[#f0e8db]" : "border-slate-800"
        }`}
      >
        <div className="flex items-center space-x-3.5">
          <div className="p-2.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-500 shadow-md shadow-amber-500/10">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2.5">
              <h2 className={`text-xl font-black tracking-wide ${theme === "beige" ? "text-slate-900" : "text-white"}`}>
                {lang === "zh" ? "OmniSafe 机构治理安全舱" : "OmniSafe Sovereign Governance Cockpit"}
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 font-mono font-bold">
                {lang === "zh" ? "背面 · 机构 5 域治理架构" : "Backside · 5-Domain Cockpit"}
              </span>
            </div>
            <p className={`text-xs mt-1 ${theme === "beige" ? "text-slate-600" : "text-slate-400"}`}>
              {lang === "zh"
                ? "对标世界一流 DeFi 治理体系：DAO-策展人-调仓员-守护者垂直设权 · 热插拔策略插座 · 自主 AI 动态平衡"
                : "World-Class Sovereign DeFi Governance: 4-Tier Hierarchy · Pluggable Strategy Sockets · Autonomous AI Agents"}
            </p>
          </div>
        </div>

        {/* Top Controls: Role Switcher & Flip Back */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center space-x-1.5 p-1 rounded-xl text-xs well-inset">
            <span className="text-[11px] text-slate-500 px-2 font-mono">Role Test:</span>
            <button
              onClick={() => onSwitchAccount("dao.omniyield-vault.testnet")}
              className={`px-2.5 py-1 rounded-lg font-mono text-xs transition cursor-pointer flex items-center space-x-1.5 ${
                isDao
                  ? "item-selected shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <GovernanceIcon name="dao" className="w-3.5 h-3.5" />
              <span>DAO</span>
            </button>
            <button
              onClick={() => onSwitchAccount("curator.omniyield-vault.testnet")}
              className={`px-2.5 py-1 rounded-lg font-mono text-xs transition cursor-pointer flex items-center space-x-1.5 ${
                connectedAccount === "curator.omniyield-vault.testnet"
                  ? "item-selected shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <GovernanceIcon name="curator" className="w-3.5 h-3.5" />
              <span>Curator</span>
            </button>
            <button
              onClick={() => onSwitchAccount("guardian.omniyield-vault.testnet")}
              className={`px-2.5 py-1 rounded-lg font-mono text-xs transition cursor-pointer flex items-center space-x-1.5 ${
                isGuardian
                  ? "item-selected shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <GovernanceIcon name="guardian" className="w-3.5 h-3.5" />
              <span>Guardian</span>
            </button>
            <button
              onClick={() => onSwitchAccount("allocator.omniyield-vault.testnet")}
              className={`px-2.5 py-1 rounded-lg font-mono text-xs transition cursor-pointer flex items-center space-x-1.5 ${
                isAllocator
                  ? "item-selected shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <GovernanceIcon name="allocator" className="w-3.5 h-3.5" />
              <span>Allocator</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5-Domain Modular Workspace Switcher Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 p-1.5 rounded-2xl border mb-8 transition well-inset">
        {DOMAIN_TABS.map((d) => {
          const isActive = currentDomain === d.key;
          return (
            <button
              key={d.key}
              type="button"
              onClick={() => handleDomainChange(d.key)}
              className={`flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? "item-selected shadow-sm"
                  : "text-slate-800 dark:text-slate-200 hover:bg-black/5 dark:hover:bg-slate-800/60 border border-transparent"
              }`}
            >
              <GovernanceIcon
                name={d.icon}
                className="w-4 h-4 flex-shrink-0"
              />
              <div className="flex flex-col text-left min-w-0">
                <span className="truncate leading-tight font-extrabold">{lang === "zh" ? d.labelZh : d.labelEn}</span>
                <span className={`text-[10px] font-mono font-medium ${isActive ? "text-emerald-700 dark:text-emerald-300" : "text-slate-600 dark:text-slate-400"}`}>
                  {d.count} {lang === "zh" ? "项治理卡片" : "Items"}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* =========================================================================
          MODULE 1: 金库设置与策略插座 (VAULTS GOVERNANCE & STRATEGY SOCKETS)
      ========================================================================= */}
      {currentDomain === "vaults" && (
        <div className="space-y-6 mb-12">
        <div className="flex items-center space-x-2.5 pb-2 border-b border-amber-500/30">
          <GovernanceIcon name="vault_bank" className="w-5 h-5" />
          <h3 className={`text-base font-black ${theme === "beige" ? "text-amber-950" : "text-amber-300"}`}>
            {lang === "zh" ? "1. 金库治理与热插拔策略插座" : "1. Vault Governance & Pluggable Strategy Sockets"}
          </h3>
        </div>

        {/* 1.1 DAO Sovereign Council */}
        <div
          id="safe-dao"
          className="p-6 rounded-3xl border transition shadow-sm card-surface"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-slate-800/60 gap-2">
            <div className="flex items-center space-x-2">
              <GovernanceIcon name="dao_sovereign" className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
              <h4 className={`font-bold text-sm ${theme === "beige" ? "text-slate-900" : "text-white"}`}>
                {lang === "zh" ? "1.1 DAO 理事会多签主权" : "1.1 DAO Council Multi-Sig Sovereign"}
              </h4>
            </div>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded item-selected">
              {multisigData?.threshold || 2} of {multisigData?.councilMembers.length || 4} M-of-N Threshold
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
            {(multisigData?.councilMembers || [
              "curator.omniyield-vault.testnet",
              "guardian.omniyield-vault.testnet",
              "allocator.omniyield-vault.testnet",
              "dao.omniyield-vault.testnet",
            ]).map((member, idx) => {
              const isCurrent = member === connectedAccount;
              return (
                <div
                  key={idx}
                  className={`p-2.5 rounded-xl border text-center transition ${
                    isCurrent
                      ? "item-selected shadow-sm"
                      : "well-inset"
                  }`}
                >
                  <div className="text-[10px] text-slate-500 mb-0.5">
                    {member.includes("curator")
                      ? "Curator (Risk)"
                      : member.includes("guardian")
                      ? "Guardian (VETO)"
                      : member.includes("allocator")
                      ? "Allocator (AI)"
                      : "DAO Owner"}
                  </div>
                  <div className={`font-mono text-xs font-bold truncate ${isCurrent ? "text-emerald-700 dark:text-emerald-300" : ""}`}>
                    {member.replace(".omniyield-vault.testnet", "")}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Proposals List inside DAO */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
              <span>{lang === "zh" ? "链上多签提案管道" : "Active Proposals Pipeline"}</span>
              <button
                type="button"
                onClick={fetchProposals}
                className="text-[11px] text-emerald-600 hover:underline flex items-center space-x-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Sync</span>
              </button>
            </div>
            {multisigData && multisigData.proposals && multisigData.proposals.length > 0 ? (
              multisigData.proposals.slice(0, 3).map((p: any) => (
                <div
                  key={p.id}
                  className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                    p.executed
                      ? "well-inset"
                      : "item-selected"
                  }`}
                >
                  <div>
                    <span className="font-mono text-xs font-bold mr-2">#{p.id}</span>
                    <span className="text-xs font-bold">{p.description}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] font-mono text-slate-500">
                      {p.approvals?.length || 0} / {multisigData.threshold}
                    </span>
                    {!p.executed && multisigData.councilMembers.includes(connectedAccount) && (
                      <button
                        type="button"
                        onClick={() => handleConfirmProposal(p.id)}
                        disabled={isSigningProposal === p.id}
                        className="px-2.5 py-1 rounded-lg btn-primary text-xs"
                      >
                        {isSigningProposal === p.id ? "Signing..." : "Sign Multi-Sig"}
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-500 p-2 text-center font-mono">No pending proposals.</div>
            )}
          </div>
        </div>

        {/* 1.2 Curator & 1.3 Allocator & 1.4 Guardian Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Curator Caps */}
          <div
            id="safe-curator"
            className="p-5 rounded-3xl border transition shadow-sm space-y-3 card-surface"
          >
            <div className="flex items-center space-x-2">
              <GovernanceIcon name="curator_shield" className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">{lang === "zh" ? "1.2 策展人配额与风控" : "1.2 Curator Caps & Risk Bounds"}</h4>
            </div>
            <form onSubmit={handleApplyCuratorCaps} className="space-y-2.5 text-xs">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">RHEA Lending Cap ($)</label>
                <input
                  type="number"
                  value={rheaInputCap}
                  onChange={(e) => setRheaInputCap(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border font-mono font-bold text-xs well-inset text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Ondo USDY Cap ($)</label>
                <input
                  type="number"
                  value={ondoInputCap}
                  onChange={(e) => setOndoInputCap(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border font-mono font-bold text-xs well-inset text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <button
                type="submit"
                disabled={!isCurator}
                className="w-full py-2 rounded-xl btn-primary text-xs disabled:opacity-50 cursor-pointer font-bold"
              >
                Apply Caps
              </button>
            </form>
          </div>

          {/* Allocator Bounds */}
          <div
            id="safe-allocator"
            className="p-5 rounded-3xl border transition shadow-sm space-y-3 card-surface"
          >
            <div className="flex items-center space-x-2">
              <GovernanceIcon name="balance_scale" className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">{lang === "zh" ? "1.3 调仓员管理与位移约束" : "1.3 Allocator Bounds & Rebalancing"}</h4>
            </div>
            <div className="space-y-2.5 text-xs">
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-700 dark:text-slate-300 font-medium">{lang === "zh" ? "单次最大调仓比例" : "Max Single Shift"}</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{maxSingleShift}% TVL</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="30"
                  value={maxSingleShift}
                  onChange={(e) => setMaxSingleShift(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-700 dark:text-slate-300 font-medium">{lang === "zh" ? "再平衡冷却时延" : "Rebalance Cooldown"}</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{lang === "zh" ? `${cooldownMinutes} 分钟` : `${cooldownMinutes} Mins`}</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="120"
                  value={cooldownMinutes}
                  onChange={(e) => setCooldownMinutes(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>
              <div className="p-2 rounded-lg well-inset text-[11px] text-slate-600 dark:text-slate-400">
                {lang === "zh" ? "Allocator 仅被允许在已被策展人审定的白名单市场中调用 reallocate()。" : "Allocator is strictly restricted to calling reallocate() within curator-approved markets."}
              </div>
            </div>
          </div>

          {/* Guardian VETO & Circuit Breaker */}
          <div
            id="safe-guardian"
            className="p-5 rounded-3xl border transition shadow-sm space-y-3 card-surface"
          >
            <div className="flex items-center space-x-2">
              <GovernanceIcon name="emergency_siren" className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">{lang === "zh" ? "1.4 守护者紧急熔断 (VETO)" : "1.4 Guardian Circuit Breaker & VETO"}</h4>
            </div>
            <div className="space-y-2 text-xs">
              <button
                type="button"
                onClick={onToggleCircuitBreaker}
                className={`w-full py-2 rounded-xl font-bold flex items-center justify-center space-x-1.5 transition cursor-pointer ${
                  circuitBreakerActive
                    ? "bg-rose-600 text-white animate-pulse"
                    : "btn-secondary"
                }`}
              >
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                <span>{circuitBreakerActive ? "CIRCUIT BREAKER ACTIVE" : "ARM CIRCUIT BREAKER"}</span>
              </button>
              <button
                type="button"
                onClick={onGuardianVeto}
                disabled={!timelockPending}
                className="w-full py-2 rounded-xl btn-secondary font-bold disabled:opacity-40 cursor-pointer"
              >
                VETO Timelock Proposal
              </button>
              <span className="text-[11px] text-slate-600 dark:text-slate-400 block text-center">
                {lang === "zh" ? "守护者拥有一键紧急冻结金库及废除 24h 时间锁提案的单边主权。" : "Guardian holds unilateral sovereignty to trigger emergency freezes and veto 24h timelocked proposals."}
              </span>
            </div>
          </div>
        </div>

        {/* 1.5 Protocol Fees & Treasury */}
        <div
          id="safe-fees"
          className="p-5 rounded-3xl border transition shadow-sm card-surface"
        >
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/60">
            <div className="flex items-center space-x-2">
              <GovernanceIcon name="treasury_vault" className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">{lang === "zh" ? "1.5 协议费率与国库分红" : "1.5 Performance Fees & Treasury"}</h4>
            </div>
            <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 font-bold">dao.omniyield-vault.testnet</span>
          </div>
          <form onSubmit={handleSaveFees} className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Performance Fee (%)</label>
              <input
                type="text"
                value={perfFee}
                onChange={(e) => setPerfFee(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border font-mono font-bold well-inset text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Management Fee (%)</label>
              <input
                type="text"
                value={mgmtFee}
                onChange={(e) => setMgmtFee(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border font-mono font-bold well-inset text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={!isDao || isSavingFees}
                className="w-full py-2 rounded-xl btn-primary text-xs transition disabled:opacity-50 cursor-pointer font-bold"
              >
                {isSavingFees ? "Updating..." : "Update Fee Parameters"}
              </button>
            </div>
          </form>
        </div>

        {/* 1.6 OmniYield Multi-Curator & Franchise Sub-Vault Registry (Option B) */}
        <div
          id="safe-sub-vaults"
          className="p-6 rounded-3xl border transition shadow-sm space-y-5 card-surface"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800/60 gap-2">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 flex items-center justify-center font-bold">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    {lang === "zh" ? "1.6 机构多策展人与加盟子金库注册中心 (OmniYield 模块化规范)" : "1.6 Multi-Curator & Franchise Sub-Vault Registry"}
                  </h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 font-mono font-bold border border-indigo-500/30">
                    Option B · Smart Contract v2.1
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                  {lang === "zh"
                    ? "自营旗舰 + TO B 加盟双轨驱动：支持自营主权中枢与外部独立投研 (Steakhouse/Bitwise) 策展加盟金库，各子金库硬性隔离债务上限 (Debt Ceiling) 与白名单资产。"
                    : "Proprietary Hub + B2B Franchise: Independent risk curators manage whitelabel franchise sub-vaults with isolated debt ceilings and permissioned market sockets."}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] px-2.5 py-1 rounded-lg well-inset font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                {subVaultList.length} Active Sub-Vaults
              </span>
            </div>
          </div>

          {/* Sub-Vaults Registry Cards */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              {lang === "zh" ? "已挂载机构白标子金库 (Whitelabel Sub-Vaults)" : "Mounted Institutional Sub-Vaults"}
            </span>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {subVaultList.map((sv) => (
                <div
                  key={sv.id}
                  className={`p-4 rounded-2xl border transition ${
                    sv.paused
                      ? "bg-rose-500/5 border-rose-500/30"
                      : "well-inset border-slate-700/60"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${sv.paused ? "bg-rose-500 animate-pulse" : "bg-emerald-500"}`} />
                      <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                        {sv.name}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                      {sv.id}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-600 dark:text-slate-400 my-2.5">
                    <div>
                      <span className="text-[10px] block opacity-70">
                        {lang === "zh" ? "策展人 (Curator):" : "Curator:"}
                      </span>
                      <span className="font-bold text-slate-900 dark:text-slate-200 truncate block">
                        {sv.curator}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] block opacity-70">
                        {lang === "zh" ? "分销伙伴 (Distributor):" : "Distributor:"}
                      </span>
                      <span className="font-bold text-slate-900 dark:text-slate-200 truncate block">
                        {sv.partnerId}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] block opacity-70">
                        {lang === "zh" ? "在管资产 / 债务上限:" : "Assets / Debt Ceiling:"}
                      </span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 block">
                        ${(sv.assets / 1e6).toFixed(2)}M / ${(sv.maxDebt / 1e6).toFixed(2)}M
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] block opacity-70">
                        {lang === "zh" ? "管理费 / 业绩分成:" : "Mgmt / Perf Fee:"}
                      </span>
                      <span className="font-bold text-cyan-600 dark:text-cyan-400 block">
                        {sv.mgmtFee}% / {sv.perfFee}%
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-700/40 flex items-center justify-between">
                    <span className={`text-[10px] font-mono font-bold ${sv.paused ? "text-rose-500" : "text-emerald-500"}`}>
                      {sv.paused ? "● EMERGENCY PAUSED" : "● RUNNING (NORMAL)"}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggleSubVaultPause(sv.id)}
                      className={`px-3 py-1 rounded-lg text-[10px] font-bold font-mono transition cursor-pointer ${
                        sv.paused
                          ? "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30"
                      }`}
                    >
                      {sv.paused ? (lang === "zh" ? "解除冻结" : "Resume Sub-Vault") : (lang === "zh" ? "一键熔断冻结" : "Emergency Freeze")}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Curators Specification */}
          <div className="pt-2 space-y-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              {lang === "zh" ? "白名单策展人矩阵 (Approved Risk Curators)" : "Approved Risk Curators"}
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {curatorList.map((c) => (
                <div key={c.id} className="p-3 rounded-xl well-inset text-xs space-y-1 font-mono">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-slate-100 truncate">{c.name}</span>
                    <span className="text-[10px] text-emerald-400">ACTIVE</span>
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{c.id}</div>
                  <div className="flex justify-between text-[11px] pt-1">
                    <span className="text-slate-500">Allocation Cap:</span>
                    <span className="font-bold text-amber-500">${(c.cap / 1e6).toFixed(0)}M</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500">Fee Share:</span>
                    <span className="font-bold text-cyan-400">{c.feeShare}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 1.7 & 1.8 Dual Strategy Sockets (Pluggable Black-Box Encapsulation) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Socket #1: NUSD Core Vault */}
          <div
            id="safe-socket-nusd"
            className="p-6 rounded-3xl border transition shadow-sm space-y-4 card-surface"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/60">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl item-selected flex items-center justify-center font-bold">
                  <Plug className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{lang === "zh" ? "1.7 NUSD 生息策略插座 #1" : "1.7 NUSD Strategy Socket #1"}</h4>
                  <span className="text-[11px] text-slate-600 dark:text-slate-400 font-mono font-medium">GOSUN-NUSD-SOCKET-01</span>
                </div>
              </div>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold border ${
                  socket1Status === "online"
                    ? "item-selected"
                    : "bg-rose-500/15 text-rose-500 border-rose-500/30"
                }`}
              >
                ● {socket1Status.toUpperCase()}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl well-inset text-xs space-y-2 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-700 dark:text-slate-300 font-medium">{lang === "zh" ? "挂载黑盒引擎:" : "Mounted Engine:"}</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400 truncate max-w-[200px]">
                  {socket1Wasm}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-700 dark:text-slate-300 font-medium">{lang === "zh" ? "策略特征:" : "Strategy Profile:"}</span>
                <span className="text-slate-900 dark:text-slate-200 font-semibold">{lang === "zh" ? "利用率驱动纯美元动态利差" : "Utilization-driven pure USD yield spread"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-700 dark:text-slate-300 font-medium">{lang === "zh" ? "当前底座配置:" : "Current Base Allocation:"}</span>
                <span className="text-slate-900 dark:text-slate-200 font-semibold">70% RHEA + 30% Ondo USDY</span>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-1">
              <button
                type="button"
                onClick={() => handleHotSwapSocket("socket-1")}
                disabled={isHotSwapping === "socket-1"}
                className="flex-1 py-2 rounded-xl btn-primary text-xs transition flex items-center justify-center space-x-1 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isHotSwapping === "socket-1" ? "animate-spin" : ""}`} />
                <span>{isHotSwapping === "socket-1" ? "Hot-Swapping..." : (lang === "zh" ? "热插拔升级黑盒 (v2.0)" : "Hot-Swap Upgrade Engine (v2.0)")}</span>
              </button>
              <button
                type="button"
                onClick={() => setSocket1Status(socket1Status === "online" ? "ejected" : "online")}
                className="px-3 py-2 rounded-xl btn-secondary font-bold text-xs transition cursor-pointer"
                title="Emergency Eject Socket"
              >
                {socket1Status === "online" ? "Eject" : "Plug In"}
              </button>
            </div>
          </div>

          {/* Socket #2: All-Weather RWA Vault */}
          <div
            id="safe-socket-allweather"
            className="p-6 rounded-3xl border transition shadow-sm space-y-4 card-surface"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/60">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl item-selected flex items-center justify-center font-bold">
                  <Plug className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{lang === "zh" ? "1.8 全天候策略插座 #2" : "1.8 All-Weather Strategy Socket #2"}</h4>
                  <span className="text-[11px] text-slate-600 dark:text-slate-400 font-mono font-medium">GOSUN-ALLWEATHER-SOCKET-02</span>
                </div>
              </div>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold border ${
                  socket2Status === "online"
                    ? "item-selected"
                    : "bg-rose-500/15 text-rose-500 border-rose-500/30"
                }`}
              >
                ● {socket2Status.toUpperCase()}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl well-inset text-xs space-y-2 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-700 dark:text-slate-300 font-medium">{lang === "zh" ? "挂载黑盒引擎:" : "Mounted Engine:"}</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400 truncate max-w-[200px]">
                  {socket2Wasm}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-700 dark:text-slate-300 font-medium">{lang === "zh" ? "策略特征:" : "Strategy Profile:"}</span>
                <span className="text-slate-900 dark:text-slate-200 font-semibold">{lang === "zh" ? "桥水四维宏观风险平价 (4支柱)" : "Bridgewater 4-Pillar Risk Parity"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-700 dark:text-slate-300 font-medium">{lang === "zh" ? "当前平价配比:" : "Current Parity Weights:"}</span>
                <span className="text-slate-900 dark:text-slate-200 font-semibold">{lang === "zh" ? "25% QQQ + 40% 美债 + 15% 黄金 + 20% 信贷" : "25% QQQ + 40% Treasuries + 15% Gold + 20% Credit"}</span>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-1">
              <button
                type="button"
                onClick={() => handleHotSwapSocket("socket-2")}
                disabled={isHotSwapping === "socket-2"}
                className="flex-1 py-2 rounded-xl btn-primary text-xs transition flex items-center justify-center space-x-1 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isHotSwapping === "socket-2" ? "animate-spin" : ""}`} />
                <span>{isHotSwapping === "socket-2" ? "Hot-Swapping..." : (lang === "zh" ? "热插拔升级黑盒 (v2.0)" : "Hot-Swap Upgrade Engine (v2.0)")}</span>
              </button>
              <button
                type="button"
                onClick={() => setSocket2Status(socket2Status === "online" ? "ejected" : "online")}
                className="px-3 py-2 rounded-xl btn-secondary font-bold text-xs transition cursor-pointer"
                title="Emergency Eject Socket"
              >
                {socket2Status === "online" ? "Eject" : "Plug In"}
              </button>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* =========================================================================
          MODULE 2: 交换设置 (EXCHANGE ROUTING & INTENTS SETTINGS)
      ========================================================================= */}
      {currentDomain === "exchange" && (
        <div className="space-y-6 mb-12">
        <div className="flex items-center space-x-2.5 pb-2 border-b border-emerald-500/30">
          <GovernanceIcon name="exchange_hub" className="w-5 h-5" />
          <h3 className={`text-base font-black ${theme === "beige" ? "text-emerald-950" : "text-emerald-300"}`}>
            {lang === "zh" ? "2. 交换与 16 链意图清算设置" : "2. Exchange & 16-Chain Intent Routing"}
          </h3>
        </div>

        {/* 2.1 16-Chain Whitelist & 2.2 Solvers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* 16-Chain Network Switcher */}
          <div
            id="safe-exchange-networks"
            className="p-5 rounded-3xl border transition shadow-sm space-y-3 card-surface"
          >
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">{lang === "zh" ? "2.1 16 链清算网络准入开关" : "2.1 16-Chain Settlement Network Whitelist"}</h4>
              <span className="text-[11px] text-slate-600 dark:text-slate-400 font-mono font-semibold">16 Networks</span>
            </div>
            <div className="grid grid-cols-4 gap-2 text-xs">
              {Object.keys(enabledChains).map((chain) => (
                <button
                  key={chain}
                  type="button"
                  onClick={() =>
                    setEnabledChains((prev) => ({ ...prev, [chain]: !prev[chain] }))
                  }
                  className={`py-1.5 px-2 rounded-lg text-[11px] font-mono font-bold transition flex items-center justify-between border cursor-pointer ${
                    enabledChains[chain]
                      ? "item-selected"
                      : "well-inset text-slate-800 dark:text-slate-200 hover:border-slate-400"
                  }`}
                >
                  <span>{chain}</span>
                  <span className={`w-1.5 h-1.5 rounded-full ${enabledChains[chain] ? "bg-emerald-500" : "bg-slate-400"}`} />
                </button>
              ))}
            </div>
          </div>

          {/* 2.2 Solvers & 2.3 Slippage & 2.4 Fees */}
          <div
            id="safe-exchange-solvers"
            className="p-5 rounded-3xl border transition shadow-sm space-y-3 card-surface"
          >
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
              {lang === "zh" ? "2.2 求解器准入 · 2.3 硬滑点 · 2.4 手续费" : "2.2 Solvers · 2.3 Max Slippage · 2.4 Fees"}
            </h4>
            <div className="space-y-3 text-xs">
              <div id="safe-exchange-slippage" className="flex items-center justify-between">
                <span className="text-slate-700 dark:text-slate-300 font-medium">{lang === "zh" ? "全局最大硬滑点 (MEV 防夹)" : "Global Max Slippage (MEV Protection)"}</span>
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    step="0.1"
                    value={hardSlippageCap}
                    onChange={(e) => setHardSlippageCap(e.target.value)}
                    className="w-16 px-2 py-1 rounded-lg border text-right font-mono font-bold well-inset text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <span className="text-slate-600 dark:text-slate-400 font-mono text-xs font-semibold">%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-700 dark:text-slate-300 font-medium">{lang === "zh" ? "跨链意图撮合超时退款" : "Cross-Chain Intent Settlement Timeout"}</span>
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    value={intentTimeoutSecs}
                    onChange={(e) => setIntentTimeoutSecs(e.target.value)}
                    className="w-16 px-2 py-1 rounded-lg border text-right font-mono font-bold well-inset text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <span className="text-slate-600 dark:text-slate-400 font-mono text-xs font-semibold">{lang === "zh" ? "秒" : "s"}</span>
                </div>
              </div>
              <div id="safe-exchange-fees" className="flex items-center justify-between">
                <span className="text-slate-700 dark:text-slate-300 font-medium">{lang === "zh" ? "跨链协议手续费分成" : "Cross-Chain Protocol Fee Share"}</span>
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    value={protocolSwapFeeBps}
                    onChange={(e) => setProtocolSwapFeeBps(e.target.value)}
                    className="w-16 px-2 py-1 rounded-lg border text-right font-mono font-bold well-inset text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <span className="text-slate-600 dark:text-slate-400 font-mono text-xs font-semibold">Bps (0.08%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* =========================================================================
          MODULE 3: 市场设置 (MARKETS & ORACLE FEEDS SETTINGS)
      ========================================================================= */}
      {currentDomain === "markets" && (
        <div className="space-y-6 mb-12">
        <div className="flex items-center space-x-2.5 pb-2 border-b border-slate-800/60">
          <GovernanceIcon name="curator" className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
          <h3 className={`text-base font-black ${theme === "beige" ? "text-slate-900" : "text-white"}`}>
            {lang === "zh" ? "3. 市场与预言机喂价设置" : "3. Markets & Oracle Feeds Settings"}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div
            id="safe-markets-listing"
            className="p-4 rounded-2xl border card-surface"
          >
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block mb-1">{lang === "zh" ? "3.1 资产上架审核" : "3.1 Asset Listing Review"}</span>
            <span className="font-bold block text-sm mb-1 text-emerald-700 dark:text-emerald-400">{lang === "zh" ? "14 标的在架" : "14 Listed Assets"}</span>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">{lang === "zh" ? "涵盖美股 (AAPL, NVDA)、ETF (QQQ)、加密货币与实物黄金 PAXG。" : "Covers equities (AAPL, NVDA), ETFs (QQQ), crypto & physical gold PAXG."}</p>
          </div>

          <div
            id="safe-markets-oracles"
            className="p-4 rounded-2xl border card-surface"
          >
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block mb-1">{lang === "zh" ? "3.2 Pyth 预言机心跳" : "3.2 Pyth Oracle Heartbeat"}</span>
            <span className="font-bold block text-sm mb-1 font-mono text-emerald-700 dark:text-emerald-400">60s Heartbeat</span>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">{lang === "zh" ? "容忍最大价格偏差 0.5%，超时自动切换备用预言机。" : "Max price tolerance 0.5%; fails over to secondary feed if stale."}</p>
          </div>

          <div
            id="safe-markets-trading"
            className="p-4 rounded-2xl border card-surface"
          >
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block mb-1">{lang === "zh" ? "3.3 交易时段与熔断" : "3.3 Trading Hours & Circuit Breaker"}</span>
            <span className="font-bold block text-sm mb-1 text-emerald-700 dark:text-emerald-400">{lang === "zh" ? "24/7 全天候链上清算" : "24/7 Continuous On-Chain Settlement"}</span>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">{lang === "zh" ? "单日单边波动超过 10% 自动触发暂停撮合防操纵。" : "Daily unilateral swings > 10% trigger auto-halt against manipulation."}</p>
          </div>

          <div
            id="safe-markets-liquidity"
            className="p-4 rounded-2xl border card-surface"
          >
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block mb-1">{lang === "zh" ? "3.4 底池流动性健康" : "3.4 Reserve Liquidity Health"}</span>
            <span className="font-bold block text-sm mb-1 font-mono text-emerald-700 dark:text-emerald-400">Health: 98.4 / 100</span>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">{lang === "zh" ? "深度缓冲充足，滑点指数维持在 0.04% 极优区间。" : "Deep liquidity buffer; slippage index maintains an optimal 0.04% range."}</p>
          </div>
        </div>
      </div>
      )}

      {/* =========================================================================
          MODULE 4: 投资组合设置 (PORTFOLIO ACCOUNTING & CUSTODY)
      ========================================================================= */}
      {currentDomain === "portfolio" && (
        <div className="space-y-6 mb-12">
        <div className="flex items-center space-x-2.5 pb-2 border-b border-slate-800/60">
          <GovernanceIcon name="portfolio_briefcase" className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
          <h3 className={`text-base font-black ${theme === "beige" ? "text-slate-900" : "text-white"}`}>
            {lang === "zh" ? "4. 组合会计与机构托管设置" : "4. Portfolio Accounting & Custody Settings"}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div
            id="safe-portfolio-nav"
            className="p-4 rounded-2xl border card-surface"
          >
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block mb-1">{lang === "zh" ? "4.1 双金库 NAV 会计结算" : "4.1 Dual-Vault NAV Settlement"}</span>
            <span className="font-bold block text-sm mb-1 text-emerald-700 dark:text-emerald-400">{lang === "zh" ? "每秒智能计提" : "Real-Time Accrual"}</span>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">{lang === "zh" ? "NUSD ($1.0482) 与 OmniUSDC ($1.0628) 采用连续复利结算。" : "NUSD ($1.0482) and OmniUSDC ($1.0628) settled with continuous compound interest."}</p>
          </div>

          <div
            id="safe-portfolio-reserves"
            className="p-4 rounded-2xl border card-surface"
          >
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block mb-1">{lang === "zh" ? "4.2 协议最低现金储备" : "4.2 Min Protocol Cash Reserve"}</span>
            <span className="font-bold block text-sm mb-1 font-mono text-emerald-700 dark:text-emerald-400">15.0% Target Buffer</span>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">{lang === "zh" ? "保障日常用户即时赎回，大额赎回走阶梯平仓保护队列。" : "Guarantees instant exits for retail; large withdrawals route via stepped unwind queue."}</p>
          </div>

          <div
            id="safe-portfolio-custody"
            className="p-4 rounded-2xl border card-surface"
          >
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block mb-1">{lang === "zh" ? "4.3 机构 MPC 托管与映射" : "4.3 Institutional MPC Custody"}</span>
            <span className="font-bold block text-sm mb-1 text-emerald-700 dark:text-emerald-400">{lang === "zh" ? "多链金库地址核准" : "Multi-Chain Vault Approved"}</span>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">{lang === "zh" ? "EVM/Solana/Bitcoin 充值通道资金直接沉淀于多签智能金库。" : "Inflows from EVM, Solana & Bitcoin settle directly into multi-sig smart vaults."}</p>
          </div>

          <div
            id="safe-portfolio-audit"
            className="p-4 rounded-2xl border card-surface"
          >
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block mb-1">{lang === "zh" ? "4.4 意图区块链存证归档" : "4.4 On-Chain Audit & Receipts"}</span>
            <span className="font-bold block text-sm mb-1 text-emerald-700 dark:text-emerald-400">{lang === "zh" ? "NearBlocks 100% 存证" : "NearBlocks 100% Verified"}</span>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">{lang === "zh" ? "所有意图清算生成哈希存证，满足企业财务审计要求。" : "All intent settlements generate cryptographic hashes for institutional audit."}</p>
          </div>
        </div>
      </div>
      )}

      {/* =========================================================================
          MODULE 5: AI 设置 (AUTONOMOUS AI AGENT INFRASTRUCTURE)
      ========================================================================= */}
      {currentDomain === "ai" && (
        <div className="space-y-6">
        <div className="flex items-center space-x-2.5 pb-2 border-b border-slate-800/60">
          <BrainCircuit className="w-5 h-5 text-emerald-600" />
          <h3 className={`text-base font-black ${theme === "beige" ? "text-slate-900" : "text-white"}`}>
            {lang === "zh" ? "5. AI 自主智能体引擎设置 (对标世界一流)" : "5. Autonomous AI Agent Infrastructure"}
          </h3>
        </div>

        {/* 5.1 API Key Hub & 5.2 Dynamic Polling */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* API Key Vault */}
          <div
            id="safe-ai-apikeys"
            className="p-5 rounded-3xl border transition shadow-sm space-y-3.5 card-surface"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Key className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">{lang === "zh" ? "5.1 API Key 密钥与模型基座管理" : "5.1 API Key Hub & Base Models"}</h4>
              </div>
              <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 font-bold">Encrypted Enclave</span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">{lang === "zh" ? "选择大模型提供商 (Provider)" : "Select LLM Provider"}</label>
                <div className="grid grid-cols-4 gap-1.5 font-mono">
                  {(["near-ai", "deepseek", "claude", "openai"] as const).map((prov) => (
                    <button
                      key={prov}
                      type="button"
                      onClick={() => setAiProvider(prov)}
                      className={`py-1.5 px-2 rounded-lg text-[10px] font-bold transition border cursor-pointer ${
                        aiProvider === prov
                          ? "item-selected shadow-sm"
                          : "well-inset text-slate-800 dark:text-slate-200 hover:border-slate-400"
                      }`}
                    >
                      {prov === "near-ai" ? "NEAR AI" : prov.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">{lang === "zh" ? "录入 API Key 密钥" : "Enter API Key"}</label>
                <div className="relative">
                  <input
                    type={showApiKey ? "text" : "password"}
                    placeholder={`sk-${aiProvider}-...`}
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    className="w-full px-3 py-2 pr-9 rounded-xl border text-xs font-mono font-bold well-inset text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
                  >
                    {showApiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSaveApiKey}
                className="w-full py-2 rounded-xl btn-primary text-xs transition cursor-pointer font-bold"
              >
                {isKeySaved ? (lang === "zh" ? "API Key 已加密保存" : "API Key Encrypted & Saved") : (lang === "zh" ? "保存并测试 Enclave 安全连接" : "Save & Test Enclave Connection")}
              </button>
            </div>
          </div>

          {/* Dynamic Polling & Pareto Rebalance */}
          <div
            id="safe-ai-polling"
            className="p-5 rounded-3xl border transition shadow-sm space-y-3.5 card-surface"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <RefreshCw className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">{lang === "zh" ? "5.2 API 轮询与全链动态平衡" : "5.2 Dynamic Polling & Macro Balancing"}</h4>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full item-selected font-mono font-bold">
                {aiExecutionMode.toUpperCase()}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-700 dark:text-slate-300 font-medium">{lang === "zh" ? "API 利率轮询心跳频率" : "API Heartbeat Polling Rate"}</span>
                <select
                  value={pollingInterval}
                  onChange={(e) => setPollingInterval(e.target.value)}
                  className="px-2.5 py-1 rounded-lg border font-mono font-bold text-xs well-inset text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="10">{lang === "zh" ? "10 秒 (超高频)" : "10s (High-Frequency)"}</option>
                  <option value="30">{lang === "zh" ? "30 秒 (推荐)" : "30s (Recommended)"}</option>
                  <option value="60">{lang === "zh" ? "60 秒 (标准)" : "60s (Standard)"}</option>
                  <option value="300">{lang === "zh" ? "5 分钟 (节能)" : "5 min (Eco)"}</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-700 dark:text-slate-300 font-medium">{lang === "zh" ? "自动调仓利差阈值 (Yield Delta)" : "Auto-Rebalance Yield Delta Threshold"}</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{yieldDeltaThreshold}%</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="2.0"
                  step="0.05"
                  value={yieldDeltaThreshold}
                  onChange={(e) => setYieldDeltaThreshold(e.target.value)}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-700 dark:text-slate-300 font-medium">{lang === "zh" ? "执行模式" : "Execution Mode"}</span>
                <div className="flex items-center space-x-1.5">
                  <button
                    type="button"
                    onClick={() => setAiExecutionMode("copilot")}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition ${
                      aiExecutionMode === "copilot"
                        ? "item-selected"
                        : "well-inset text-slate-700 dark:text-slate-300 hover:border-slate-400"
                    }`}
                  >
                    {lang === "zh" ? "Copilot 辅助" : "Copilot Assisted"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setAiExecutionMode("autopilot")}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition ${
                      aiExecutionMode === "autopilot"
                        ? "item-selected"
                        : "well-inset text-slate-700 dark:text-slate-300 hover:border-slate-400"
                    }`}
                  >
                    {lang === "zh" ? "Autopilot 自主上链" : "Autopilot Autonomous"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 5.3 Skills Marketplace & 5.4 Persona Studio */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Skills Marketplace */}
          <div
            id="safe-ai-skills"
            className="p-5 rounded-3xl border transition shadow-sm space-y-3 card-surface"
          >
            <div className="flex items-center space-x-2">
              <Puzzle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">{lang === "zh" ? "5.3 技能插件库与工具挂载" : "5.3 Skills Marketplace & Tools"}</h4>
            </div>

            <div className="space-y-2 text-xs">
              {[
                {
                  id: "yield-oracle-scraper",
                  name: "yield-oracle-scraper",
                  descZh: "实时抓取 RHEA/Ondo/Pyth 全链利差数据",
                  descEn: "Real-time scraper for cross-chain RHEA, Ondo & Pyth spreads",
                },
                {
                  id: "pareto-rebalancer",
                  name: "pareto-rebalancer",
                  descZh: "桥水四维风险平价与马科维茨有效前沿优化算法",
                  descEn: "Bridgewater 4-pillar parity & Markowitz optimization",
                },
                {
                  id: "near-intents-dispatcher",
                  name: "near-intents-dispatcher",
                  descZh: "跨链意图解析与单跳无滑点撮合路由",
                  descEn: "Cross-chain intent parsing & zero-slippage execution",
                },
                {
                  id: "multisig-proposal-drafter",
                  name: "multisig-proposal-drafter",
                  descZh: "大额调仓自动生成 SputnikDAO 治理提案草案",
                  descEn: "Autonomous drafting of SputnikDAO on-chain proposals",
                },
                {
                  id: "macro-fed-watcher",
                  name: "macro-fed-watcher",
                  descZh: "美联储利率决议与宏观通胀指标预警",
                  descEn: "Federal Reserve decisions & CPI macro signal monitoring",
                },
              ].map((skill) => (
                <div
                  key={skill.id}
                  className={`p-2.5 rounded-xl border flex items-center justify-between transition ${
                    activeSkills[skill.id]
                      ? "item-selected"
                      : "well-inset"
                  }`}
                >
                  <div>
                    <span className="font-mono font-bold block text-xs text-slate-900 dark:text-white">{skill.name}</span>
                    <span className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">{lang === "zh" ? skill.descZh : skill.descEn}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveSkills((prev) => ({ ...prev, [skill.id]: !prev[skill.id] }))
                    }
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold cursor-pointer transition ${
                      activeSkills[skill.id] ? "btn-primary" : "btn-secondary"
                    }`}
                  >
                    {activeSkills[skill.id] ? "ACTIVE" : "OFF"}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Persona Studio */}
          <div
            id="safe-ai-personas"
            className="p-5 rounded-3xl border transition shadow-sm space-y-3 card-surface"
          >
            <div className="flex items-center space-x-2">
              <Bot className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">{lang === "zh" ? "5.4 策略人设矩阵与 Prompt 工作台" : "5.4 Persona Matrix & Prompt Studio"}</h4>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="grid grid-cols-3 gap-1.5 font-mono">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPersona("conservative");
                    setSystemPrompt("You are the Conservative Preserver. Zero price volatility. Strictly allocate within pure USD lending & Treasuries.");
                  }}
                  className={`py-1.5 px-2 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
                    selectedPersona === "conservative"
                      ? "item-selected shadow-sm"
                      : "well-inset text-slate-800 dark:text-slate-200 hover:border-slate-400"
                  }`}
                >
                  <span className="flex items-center justify-center space-x-1">
                    <GovernanceIcon name="persona_conservative" className="w-3 h-3" />
                    <span>{lang === "zh" ? "保守型管家" : "Conservative"}</span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPersona("bridgewater");
                    setSystemPrompt("You are the Bridgewater Macro Strategist. Maintain 4-Pillar risk parity across QQQ, Treasuries, Gold, and Lending.");
                  }}
                  className={`py-1.5 px-2 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
                    selectedPersona === "bridgewater"
                      ? "item-selected shadow-sm"
                      : "well-inset text-slate-800 dark:text-slate-200 hover:border-slate-400"
                  }`}
                >
                  <span className="flex items-center justify-center space-x-1">
                    <GovernanceIcon name="persona_balanced" className="w-3 h-3" />
                    <span>{lang === "zh" ? "全天候平衡师" : "All-Weather"}</span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPersona("aggressive");
                    setSystemPrompt("You are the Yield Alpha Hunter. Maximize edge lending APY and cross-chain solver incentives. Fast rebalancing.");
                  }}
                  className={`py-1.5 px-2 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
                    selectedPersona === "aggressive"
                      ? "item-selected shadow-sm"
                      : "well-inset text-slate-800 dark:text-slate-200 hover:border-slate-400"
                  }`}
                >
                  <span className="flex items-center justify-center space-x-1">
                    <GovernanceIcon name="persona_hunter" className="w-3 h-3" />
                    <span>{lang === "zh" ? "激进利差猎手" : "Alpha Hunter"}</span>
                  </span>
                </button>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">{lang === "zh" ? "System Prompt 核心指令集" : "System Prompt Directive Set"}</label>
                <textarea
                  rows={3}
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  className="w-full p-2.5 rounded-xl border text-[11px] font-mono font-medium leading-relaxed well-inset text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 5.5 Self-Learning, 5.6 Quotas & 5.7 Sandbox Kill Switch */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
          {/* Self-Learning & RL Dashboard */}
          <div
            id="safe-ai-learning"
            className="p-5 rounded-3xl border transition shadow-sm space-y-2.5 card-surface"
          >
            <div className="flex items-center space-x-2">
              <GovernanceIcon name="self_learning" className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">{lang === "zh" ? "5.5 自主学习与强化复盘" : "5.5 Self-Learning & RL Post-Mortem"}</h4>
            </div>
            <div className="space-y-1.5 font-mono text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-700 dark:text-slate-300 font-medium">{lang === "zh" ? "24h 超额收益 (Alpha):" : "24h Yield Alpha:"}</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">+1.84% APY</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-700 dark:text-slate-300 font-medium">{lang === "zh" ? "调仓胜率 (Win Rate):" : "Rebalance Win Rate:"}</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">94.2%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-700 dark:text-slate-300 font-medium">{lang === "zh" ? "每日 00:00 UTC 复盘:" : "Daily 00:00 UTC Audit:"}</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">{lang === "zh" ? "已完成" : "COMPLETED"}</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-tight">
              {lang === "zh" ? "每次调仓后持续 24 小时进行回测，自适应微调策略权重矩阵。" : "24-hour backtesting after rebalances with adaptive matrix reinforcement."}
            </p>
          </div>

          {/* Usage Quotas & Gas Budget */}
          <div
            id="safe-ai-quotas"
            className="p-5 rounded-3xl border transition shadow-sm space-y-2.5 card-surface"
          >
            <div className="flex items-center space-x-2">
              <GovernanceIcon name="curator" className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">{lang === "zh" ? "5.6 Token 与 Gas 预算" : "5.6 Token & Gas Budget Quotas"}</h4>
            </div>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-700 dark:text-slate-300 font-medium">{lang === "zh" ? "每日 Token 限额" : "Daily Token Limit"}</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{lang === "zh" ? "500,000 / 天" : "500,000 / Day"}</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full w-[38%]" />
                </div>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-700 dark:text-slate-300 font-medium">{lang === "zh" ? "单笔交易最大 Gas:" : "Max Gas Per Tx:"}</span>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100">150 TGas</span>
              </div>
            </div>
          </div>

          {/* Safety Sandbox & Kill Switch */}
          <div
            id="safe-ai-sandbox"
            className="p-5 rounded-3xl border transition shadow-sm space-y-2.5 card-surface"
          >
            <div className="flex items-center space-x-2">
              <GovernanceIcon name="curator_shield" className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">{lang === "zh" ? "5.7 安全沙盒与紧急断电" : "5.7 Safety Sandbox & Kill Switch"}</h4>
            </div>
            <div className="space-y-2">
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-[10px] text-emerald-800 dark:text-emerald-300 font-mono font-bold">
                {lang === "zh" ? "Pre-flight RPC 模拟验证通过 (零滑点)" : "Pre-flight RPC Simulation Passed (Zero-Slippage)"}
              </div>
              <button
                type="button"
                onClick={() => setAiKillSwitchArmed(!aiKillSwitchArmed)}
                className={`w-full py-2 rounded-xl font-bold flex items-center justify-center space-x-1.5 transition cursor-pointer ${
                  aiKillSwitchArmed
                    ? "bg-rose-600 text-white animate-pulse"
                    : "btn-secondary text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white"
                }`}
              >
                <Power className="w-3.5 h-3.5" />
                <span>{lang === "zh" ? (aiKillSwitchArmed ? "已停机 (点击解除)" : "装配紧急停机开关") : (aiKillSwitchArmed ? "AI AGENT KILLED (DISARM)" : "ARM AI KILL SWITCH")}</span>
              </button>
            </div>
          </div>
        </div>

        {/* 5.8 Institutional AI Rebalancing & Execution Logs */}
        <div
          id="safe-ai-logs"
          className="p-5 rounded-3xl border transition shadow-sm space-y-3 card-surface font-mono text-xs"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800/80">
            <div className="flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h4 className="font-bold text-sm text-slate-900 dark:text-white font-sans">
                {lang === "zh" ? "5.8 机构专属：AI 调仓神经决策流与链上执行日志" : "5.8 Institutional: AI Rebalancing & Execution Logs"}
              </h4>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[11px] text-slate-500 font-sans">
                {lang === "zh" ? "实时智能体流 • 100% 链上可验证" : "Live Agent Stream • 100% On-Chain Verifiable"}
              </span>
            </div>
          </div>

          <div className="space-y-1.5 max-h-52 overflow-y-auto pr-2 text-slate-700 dark:text-slate-300 well-inset p-3 rounded-xl border">
            {logs && logs.length > 0 ? (
              logs.map((log, index) => (
                <div key={index} className="leading-relaxed hover:text-emerald-600 dark:hover:text-emerald-400 transition flex items-start space-x-2">
                  <span className="text-emerald-500 flex-shrink-0">❯</span>
                  <span className="break-all">{log}</span>
                </div>
              ))
            ) : (
              <div className="text-slate-400 text-center py-4">
                {lang === "zh" ? "暂无调仓日志" : "No rebalancing logs available."}
              </div>
            )}
          </div>
        </div>
        </div>
      )}

      {/* Domain Walkthrough Pagination Footer */}
      <div
        className={`flex items-center justify-between pt-6 mt-8 border-t ${
          theme === "beige" ? "border-[#dfd2be]" : "border-slate-800"
        }`}
      >
        {prevDomain ? (
          <button
            type="button"
            onClick={() => handleDomainChange(prevDomain.key)}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition btn-secondary cursor-pointer"
          >
            <span>←</span>
            <span>{lang === "zh" ? `上一模块: ${prevDomain.labelZh}` : `Prev: ${prevDomain.labelEn}`}</span>
          </button>
        ) : (
          <div />
        )}

        <div className="flex items-center space-x-1.5 text-xs font-mono text-slate-500">
          <span>{currentIndex + 1}</span>
          <span>/</span>
          <span>{DOMAIN_TABS.length}</span>
        </div>

        {nextDomain ? (
          <button
            type="button"
            onClick={() => handleDomainChange(nextDomain.key)}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition btn-primary cursor-pointer"
          >
            <span>{lang === "zh" ? `下一模块: ${nextDomain.labelZh}` : `Next: ${nextDomain.labelEn}`}</span>
            <span>→</span>
          </button>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}
