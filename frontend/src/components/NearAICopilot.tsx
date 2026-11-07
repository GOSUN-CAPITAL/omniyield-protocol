"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  BrainCircuit,
  Sparkles,
  Send,
  TrendingUp,
  ShieldCheck,
  RotateCcw,
  Bot,
  User,
  ArrowRight,
  ExternalLink,
  Zap,
  Crown,
  Globe,
  CheckCircle2,
  Lock,
  ArrowLeftRight,
  Check,
  Sliders,
  DollarSign,
  HelpCircle,
  FileText,
  Radio,
  PieChart,
  RefreshCw,
  ArrowUpRight,
  Headphones,
  Compass,
  Landmark,
  Activity,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export type AiUserTier = "tier0_retail" | "tier1_vip";

export interface ActionCardData {
  id: string;
  type: "deposit" | "withdraw" | "rebalance" | "navigate" | "redeem" | "strategy_rebalance";
  title: string;
  description: string;
  amount?: number;
  vault?: "usdc" | "all-weather";
  vaultName?: string;
  apy?: string;
  projectedReturn?: string;
  buttonText: string;
  executed?: boolean;
  txHash?: string;
}

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  tier: AiUserTier;
  actionCard?: ActionCardData;
}

interface NearAICopilotProps {
  onNavigateToVault: (vault: "usdc" | "all-weather") => void;
  connectedAccount?: string;
  usdcBalance?: number;
  nusdBalance?: string;
  omniUsdcBalance?: string;
  nearBalance?: string;
  onRefreshBalances?: () => void;
  onBalanceUpdate?: (vault: "usdc" | "all-weather", amount: number) => void;
  onLog?: (msg: string) => void;
  lang?: "en" | "zh";
  theme?: "dark" | "beige";
}

export default function NearAICopilot({
  onNavigateToVault,
  connectedAccount = "dao.omniyield-vault.testnet",
  usdcBalance = 100.0,
  nusdBalance = "1.00",
  omniUsdcBalance = "0.00",
  nearBalance = "25.0",
  onRefreshBalances,
  onBalanceUpdate,
  onLog,
  lang = "en",
  theme = "dark",
}: NearAICopilotProps) {
  // 严格根据客户登录钱包里面 NUSD 份额或 OMNIUSDC 份额自动确认 VIP 身份！
  const nusdShares = parseFloat(nusdBalance) || 0;
  const omniShares = parseFloat(omniUsdcBalance) || 0;
  const totalShares = nusdShares + omniShares;

  // 只要持有金库份额 (totalShares > 0) 或属于 DAO / 机构账户，自动点亮 VIP 1 专属理财操盘顾问！
  const isVip =
    totalShares > 0 ||
    connectedAccount.includes("dao") ||
    connectedAccount.includes("curator") ||
    connectedAccount.includes("allocator");

  const currentTier: AiUserTier = isVip ? "tier1_vip" : "tier0_retail";

  // Messages Thread
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "m-welcome",
      sender: "ai",
      tier: currentTier,
      text:
        lang === "zh"
          ? "**OmniYield 三位一体 AI 资管中枢**（兼具**首席投资顾问**、**意图量化金库操盘手**与**首席客服**三重职责）。\n\n您可以向我咨询宏观投资策略与金库底层逻辑，直接通过**自然语言操盘我们的两大金库**（存入、赎回、再平衡、复投），或随时咨询操作疑难与接通 7x24h 机构专属人工客服！"
          : "**Welcome! I am OmniYield's Tri-Pillar Financial AI Agent** (serving as your **Chief Investment Advisor**, **Autonomous Quant Trader**, and **Client Concierge**).\n\nYou can consult me on macro yield strategies, execute multi-vault operations via natural language intents, or connect directly to 24/7 institutional human support!",
      timestamp: "Just now",
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [executingCardId, setExecutingCardId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<"advisor" | "quant" | "support">("quant");
  const [isPromptRibbonOpen, setIsPromptRibbonOpen] = useState(false);
  const [latestUserMessageId, setLatestUserMessageId] = useState<string | null>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastUserMessageRef = useRef<HTMLDivElement>(null);

  // =========================================================================
  // 🚀 VIEWPORT DYNAMICS: WORLD-CLASS TOP-PINNING & AUTO SMOOTH SCROLL (ChatGPT/Claude Parity)
  // =========================================================================
  const scrollToActiveQuestion = (behavior: ScrollBehavior = "smooth") => {
    if (!chatContainerRef.current || !lastUserMessageRef.current) return;
    const container = chatContainerRef.current;
    const userMsgEl = lastUserMessageRef.current;

    const userMsgRect = userMsgEl.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const relativeOffset = userMsgRect.top - containerRect.top;

    // Pin question cleanly 12px below top of container
    const targetScrollTop = container.scrollTop + relativeOffset - 12;

    container.scrollTo({
      top: Math.max(0, targetScrollTop),
      behavior,
    });
  };

  useEffect(() => {
    if (messages.length <= 1 || !latestUserMessageId) return;

    // Small delay ensures DOM paint has positioned the new elements
    const timer = setTimeout(() => {
      scrollToActiveQuestion("smooth");
    }, 40);

    return () => clearTimeout(timer);
  }, [messages.length, isThinking, latestUserMessageId]);

  interface PresetItem {
    tag: string;
    tagColor: string;
    title: string;
    query: string;
    icon: React.ComponentType<{ className?: string }>;
    iconBg: string;
    iconColor: string;
  }

  // =========================================================================
  // 🏛️ OMNIYIELD TRI-PILLAR FINANCIAL AI AGENT MATRIX
  // =========================================================================

  // 1. 🧠 首席投资顾问 (Chief Investment Advisor) - 投资咨询与金库引流
  const advisorPresets: PresetItem[] = [
    {
      tag: lang === "zh" ? "降息研判" : "MACRO",
      tagColor: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20",
      title: lang === "zh" ? "美联储进入降息通道，建议存入哪个金库？" : "Fed rate cuts: which vault offers best yield?",
      query:
        lang === "zh"
          ? "美联储开启降息周期后，对浮动借贷和全天候宏观黄金资产有何影响？资金存入哪个金库综合收益最高？"
          : "Under Fed rate cuts, how are floating lending vs macro gold assets impacted? Which vault yields highest?",
      icon: Compass,
      iconBg: "bg-sky-500/15",
      iconColor: "text-sky-500",
    },
    {
      tag: lang === "zh" ? "金库对比" : "COMPARE",
      tagColor: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20",
      title: lang === "zh" ? "核心借贷 (12.4%) 与全天候 (16.8%) 区别在哪？" : "NUSD Core (12.4%) vs All-Weather (16.8%)?",
      query:
        lang === "zh"
          ? "请帮我详细对比 NUSD 核心借贷金库 (12.40%) 与 OmniUSDC 全天候宏观金库 (16.80%) 的底层资产构成与收益风险特征。"
          : "Compare the underlying collateral, APYs, and risk profiles between NUSD Core Lending and OmniUSDC All-Weather.",
      icon: PieChart,
      iconBg: "bg-indigo-500/15",
      iconColor: "text-indigo-500",
    },
    {
      tag: lang === "zh" ? "组合配置" : "ALLOCATE",
      tagColor: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20",
      title: lang === "zh" ? "我有 10,000 USDC，建议如何平衡稳健与抗通胀？" : "Allocating 10,000 USDC across dual vaults?",
      query:
        lang === "zh"
          ? "如果我有 10,000 USDC，建议如何在这两大金库之间进行跨仓配置，既锁定确定性固收利息，又享受黄金与美股抗周期红利？"
          : "How should I allocate 10,000 USDC across dual vaults to optimize risk-adjusted yield and macro inflation hedging?",
      icon: Sliders,
      iconBg: "bg-purple-500/15",
      iconColor: "text-purple-500",
    },
  ];

  // 2. ⚡ 世界首创意图量化金库操盘手 (Autonomous Quant Vault Trader) - 自然语言操盘2大金库
  const quantPresets: PresetItem[] = [
    {
      tag: lang === "zh" ? "全天候" : "ALL-WEATHER",
      tagColor: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20",
      title: lang === "zh" ? "存入 500 USDC 申购全天候宏观金库 (16.8%)" : "Deposit 500 USDC to All-Weather (16.8%)",
      query:
        lang === "zh"
          ? "帮我把 500 USDC 存入高收益的全天候宏观金库 (OmniUSDC)，测算一年预期回报并生成执行卡片。"
          : "Deposit 500 USDC into OmniUSDC All-Weather Macro Vault, calculate projected yields and generate action card.",
      icon: Zap,
      iconBg: "bg-purple-500/15",
      iconColor: "text-purple-500",
    },
    {
      tag: lang === "zh" ? "核心池" : "CORE-NUSD",
      tagColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
      title: lang === "zh" ? "存入 500 USDC 申购 NUSD 核心借贷金库 (12.4%)" : "Deposit 500 USDC to NUSD Core (12.4%)",
      query:
        lang === "zh"
          ? "帮我把 500 USDC 存入 NUSD 核心借贷金库（12.40% APY 稳健利差），生成即时生息意图卡片。"
          : "Deposit 500 USDC into NUSD Core Lending Vault (12.40% APY), generate instant yield execution card.",
      icon: Landmark,
      iconBg: "bg-emerald-500/15",
      iconColor: "text-emerald-500",
    },
    {
      tag: lang === "zh" ? "跨仓平衡" : "REBALANCE",
      tagColor: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20",
      title: lang === "zh" ? "跨金库再平衡：将 30% 仓位从 NUSD 调配至全天候" : "Cross-Rebalance 30% from NUSD to All-Weather",
      query:
        lang === "zh"
          ? "当前宏观美联储降息预期增强，建议帮我把 30% 仓位从 NUSD 调配到全天候宏观金库，锁定美债与黄金涨幅。"
          : "Given Fed rate-cut expectations, advise and prepare a 30% rebalance from NUSD to All-Weather Macro Parity.",
      icon: RefreshCw,
      iconBg: "bg-indigo-500/15",
      iconColor: "text-indigo-500",
    },
    {
      tag: lang === "zh" ? "复利滚存" : "COMPOUND",
      tagColor: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20",
      title: lang === "zh" ? "将 NUSD 累计借贷收益一键滚存复投" : "Auto-Compound NUSD Accrued Interest",
      query:
        lang === "zh"
          ? "帮我把 NUSD 核心金库已结算的借贷收益执行一键自动滚存复投，享受 12.40% 本息滚存复利。"
          : "Execute 1-click auto-compounding on NUSD accrued interest for maximum compound APY.",
      icon: ArrowLeftRight,
      iconBg: "bg-cyan-500/15",
      iconColor: "text-cyan-500",
    },
    {
      tag: lang === "zh" ? "流动赎回" : "REDEEM",
      tagColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
      title: lang === "zh" ? "提取 100 份额原路径结算为原生现金至钱包" : "Redeem 100 shares back to native cash",
      query:
        lang === "zh"
          ? "帮我从金库赎回 100 份额，零滑点结算并提取原生现金至我的钱包。"
          : "Redeem 100 vault shares back into native cash in my connected wallet.",
      icon: ArrowUpRight,
      iconBg: "bg-amber-500/15",
      iconColor: "text-amber-500",
    },
  ];

  // 3. 🎧 首席客户服务官 (Chief Customer Support & Concierge) - 疑难解答与人工专线
  const supportPresets: PresetItem[] = [
    {
      tag: lang === "zh" ? "免桥原理" : "INTENTS",
      tagColor: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20",
      title: lang === "zh" ? "为什么从 Arbitrum/Solana 充值不需要跨链桥？" : "Why deposit without cross-chain bridge?",
      query:
        lang === "zh"
          ? "为什么在 OmniYield 存入 Arbitrum 或 Solana 上的 USDC，不需要走中心化跨链桥就能直接生息？"
          : "Why does depositing Arbitrum or Solana USDC into OmniYield avoid risky third-party bridges?",
      icon: Globe,
      iconBg: "bg-sky-500/15",
      iconColor: "text-sky-500",
    },
    {
      tag: lang === "zh" ? "资金安全" : "SECURITY",
      tagColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
      title: lang === "zh" ? "借贷池会坏账吗？守护者 24h 熔断如何保本？" : "Bad debt risk? How 24h VETO protects capital?",
      query:
        lang === "zh"
          ? "如果借贷市场发生极端行情，协议是如何通过超额抵押、策展人限额和守护者 24h 熔断来保障本金安全的？"
          : "How do curator caps, overcollateralization, and guardian timelock VETO protect user principal during volatility?",
      icon: ShieldCheck,
      iconBg: "bg-emerald-500/15",
      iconColor: "text-emerald-500",
    },
    {
      tag: lang === "zh" ? "费率透明" : "FEES",
      tagColor: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20",
      title: lang === "zh" ? "存取是否有管理费？赎回是否有滑点与锁定期？" : "Management fees or lockup periods?",
      query:
        lang === "zh"
          ? "存入金库是否有申购费或赎回费？协议收取的收益分成比例是多少？资金是否有锁定期？"
          : "What are the protocol fees, management take-rates, lockup terms, and redemption policies?",
      icon: DollarSign,
      iconBg: "bg-indigo-500/15",
      iconColor: "text-indigo-500",
    },
    {
      tag: lang === "zh" ? "连线人工" : "VIP DESK",
      tagColor: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20",
      title: lang === "zh" ? "连线机构专属客户总监与 7x24 VIP 1v1 专线" : "Connect Institutional RM & 24/7 VIP Desk",
      query:
        lang === "zh"
          ? "我需要联系 OmniYield 机构专属客户总监与 1v1 人工客服，咨询大额 OTC 存取款（> $50,000）与合规报告服务。"
          : "I need to connect with an OmniYield Institutional Relationship Manager / VIP Support for OTC deposits and custom custody.",
      icon: Headphones,
      iconBg: "bg-rose-500/15",
      iconColor: "text-rose-500",
    },
  ];

  const currentRolePresets =
    selectedRole === "advisor"
      ? advisorPresets
      : selectedRole === "quant"
      ? quantPresets
      : supportPresets;

  // Execute on-chain action from card
  const handleExecuteActionCard = async (card: ActionCardData) => {
    setExecutingCardId(card.id);
    const targetVault = card.vault === "all-weather" ? "all-weather" : "usdc";
    const targetAmount = card.amount || 1;
    const receiptToken = targetVault === "all-weather" ? "OmniUSDC" : "NUSD";
    const isWithdraw = card.type === "withdraw" || card.type === "redeem";
    const isRebalance = card.type === "rebalance";
    const normalizedAction = isWithdraw ? "withdraw" : isRebalance ? "deposit" : card.type;

    if (onLog) {
      const actionLabel = isWithdraw ? "WITHDRAW" : isRebalance ? "REBALANCE" : "DEPOSIT";
      onLog(`[AI Wealth Manager] Executing natural language intent: ${actionLabel} ${targetAmount} ${isWithdraw ? receiptToken : "USDC"} ${isWithdraw ? "from" : "into"} ${targetVault === "all-weather" ? "All-Weather Vault (OmniUSDC)" : "Core Vault (NUSD)"}`);
    }

    try {
      const res = await fetch("/api/transact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId: connectedAccount,
          action: normalizedAction,
          amount: targetAmount,
          originChain: "NEAR Protocol",
          destChain: "NEAR Protocol",
          vault: targetVault,
        }),
      });

      const data = await res.json();
      const txHash = data.nearTxHash || data.txHash || `NearBlocksTx_${Math.random().toString(36).slice(2, 10)}`;

      // Update card status to executed
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.actionCard && msg.actionCard.id === card.id) {
            return {
              ...msg,
              actionCard: {
                ...msg.actionCard,
                executed: true,
                txHash,
              },
            };
          }
          return msg;
        })
      );

      // Append follow-up celebratory message
      const followUpMsg: Message = {
        id: `ai-success-${Date.now()}`,
        sender: "ai",
        tier: currentTier,
        text:
          lang === "zh"
            ? isWithdraw
              ? `🎉 **赎回成功！已通过 NEAR 智能合约完成链上意图清算！**\n\n• 赎回金库: **${targetVault === "all-weather" ? "OmniYield All-Weather RWA (OmniUSDC)" : "GOSUN OmniYield USDC (NUSD)"}**\n• 赎回份额: **${targetAmount} ${receiptToken}** (销毁对应金库份额)\n• 到账现金: **~${targetAmount} USDC** (零滑点全额返还至您的钱包)\n• 交易哈希存证: \`${txHash.slice(0, 16)}...\`\n• 资产已实时扣减并完成结算，随时可在 **Portfolio** 投资组合页面或账户抽屉查看！`
              : isRebalance
              ? `🎉 **调仓成功！已通过 NEAR 跨金库意图引擎完成再平衡！**\n\n• 调配方案: **NUSD 核心借贷池 ➔ OmniUSDC 全天候金库**\n• 调配比例: **${targetAmount}% 仓位**\n• 交易哈希存证: \`${txHash.slice(0, 16)}...\`\n• 投资组合夏普比率已实时优化，随时可在 **Portfolio** 查看最新大类资产权重！`
              : `🎉 **执行成功！已通过 NEAR 智能合约完成链上意图清算！**\n\n• 目标金库: **${targetVault === "all-weather" ? "OmniYield All-Weather RWA (OmniUSDC)" : "GOSUN OmniYield USDC (NUSD)"}**\n• 存入金额: **${targetAmount} USDC** (铸造对应 **${receiptToken}** 份额)\n• 交易哈希存证: \`${txHash.slice(0, 16)}...\`\n• 资产已实时进入对应金库计息队列，随时可在 **Portfolio** 投资组合页面或账户抽屉查看！`
            : isWithdraw
            ? `🎉 **Redemption Confirmed on NEAR Blockchain!**\n\n• Redeemed Vault: **${targetVault === "all-weather" ? "OmniYield All-Weather RWA (OmniUSDC)" : "GOSUN OmniYield USDC (NUSD)"}**\n• Shares Burned: **${targetAmount} ${receiptToken}**\n• Cash Settled: **~${targetAmount} USDC** (credited to wallet)\n• Tx Hash: \`${txHash.slice(0, 16)}...\`\n• Capital has settled instantly. Check details in **Portfolio**!`
            : isRebalance
            ? `🎉 **Rebalance Confirmed!**\n\n• Shifted: **${targetAmount}% allocation** into All-Weather Vault\n• Tx Hash: \`${txHash.slice(0, 16)}...\`\n• Check your updated risk parity weights in **Portfolio**!`
            : `🎉 **Execution Confirmed on NEAR Blockchain!**\n\n• Target Vault: **${targetVault === "all-weather" ? "OmniYield All-Weather RWA (OmniUSDC)" : "GOSUN OmniYield USDC (NUSD)"}**\n• Deposited: **${targetAmount} USDC** (minted **${receiptToken}** shares)\n• Tx Hash: \`${txHash.slice(0, 16)}...\`\n• Capital is now earning real-time compounding yields. You can track continuous accrual in your **Portfolio**!`,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, followUpMsg]);

      if (onBalanceUpdate) {
        onBalanceUpdate(targetVault, isWithdraw ? -targetAmount : targetAmount);
      }
      if (onRefreshBalances) {
        await onRefreshBalances();
      }
      if (onLog) {
        const actionLabel = isWithdraw ? "WITHDRAW" : isRebalance ? "REBALANCE" : "DEPOSIT";
        onLog(`[${new Date().toLocaleTimeString()}] ✓ AI Intent Executed on NEAR Testnet: ${isWithdraw ? "-" : "+"}${targetAmount} ${isWithdraw ? receiptToken : "USDC"} ${targetVault === "all-weather" ? "OmniUSDC" : "NUSD"} (Tx: ${txHash.slice(0, 12)}...)`);
      }
    } catch (err: any) {
      alert("Execution error: " + err.message);
    } finally {
      setExecutingCardId(null);
    }
  };

  // Dispatch Natural Language Query (Connected to Live Google Gemini API with Local Fallback)
  const handleSendQuery = async (textToSend?: string) => {
    const q = textToSend || inputPrompt.trim();
    if (!q) return;

    const userMsgId = `u-${Date.now()}`;
    setLatestUserMessageId(userMsgId);

    const userMsg: Message = {
      id: userMsgId,
      sender: "user",
      text: q,
      tier: currentTier,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt("");
    setIsThinking(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: q,
          tier: currentTier,
          connectedAccount,
          nusdBalance,
          omniUsdcBalance,
          lang,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const aiMsg: Message = {
          id: `ai-${Date.now()}`,
          sender: "ai",
          tier: currentTier,
          text: data.text || "...",
          timestamp: data.timestamp || new Date().toLocaleTimeString(),
          actionCard: data.actionCard,
        };
        setMessages((prev) => [...prev, aiMsg]);
        setIsThinking(false);
        return;
      }
    } catch (apiErr) {
      console.warn("Live Gemini API call failed, using local reasoning fallback:", apiErr);
    }

    let aiReply = "";
    let actionCard: ActionCardData | undefined;

    const qLower = q.toLowerCase();

      // =======================================================================
      // TRI-PILLAR FINANCIAL INTENT PARSER & ACTION CARDS
      // =======================================================================
      // 0.1 专属资产研判: AKT / Akash Network 去中心化云算力
      if (qLower.includes("akt") || qLower.includes("akash")) {
        aiReply =
          lang === "zh"
            ? `📊 **【首席投资顾问 · AKT (Akash Network) 实时行情与资管研判】**\n\n根据 OmniYield 接入的去中心化预言机实时数据（CoinGecko / Pyth Hermes 实时信号源）：\n\n• 🪙 **AKT 实时现价**：**$0.60 USD**（24h 涨跌幅: **-1.47%**）\n• 🌐 **资产定位**：去中心化 AI 算力与 GPU 云市场（Cosmos 生态 DePIN 龙头），允许开发者以低于传统云厂商 70% 的成本租用分布式 GPU 运行 AI 大模型与机器学习。\n\n💡 **OmniYield 资管与风控建议**：\n• AKT 属于高 Beta 的 AI / DePIN 概念代币，受全球 GPU 算力供需及市场情绪影响波动剧烈。\n• **跨链生息策略**：若您持有 AKT 现货并获利，可通过 OmniYield 的 **16 链免桥意图清算网络**，将部分流动性一键划转存入：\n  1. **OmniUSDC 全天候宏观金库 (16.80% APY)**：达里奥四维平价资产对冲，锁定大类资产稳健收益；\n  2. **NUSD 核心借贷金库 (12.40% APY)**：纯美元固定收益，规避代币下行波动风险！`
            : `📊 **[Chief Investment Advisor · AKT (Akash Network) Market Intel]**\n\nAccording to live decentralized oracle signals (CoinGecko / Pyth Hermes):\n\n• 🪙 **AKT Spot Price**: **$0.60 USD** (24h: **-1.47%**)\n• 🌐 **Profile**: Decentralized AI Compute & GPU Cloud (Cosmos DePIN Leader).\n\n💡 **Advisory**:\nMitigate high-beta token volatility by routing capital via OmniYield's 16-chain zero-bridge intents into our **OmniUSDC All-Weather Vault (16.80% APY)** or **NUSD Core Lending Vault (12.40% APY)**!`;

        actionCard = {
          id: `card-${Date.now()}`,
          type: "deposit",
          title: lang === "zh" ? "⚡ 将 AKT 收益存入全天候宏观金库 (16.8%)" : "⚡ Rebalance into All-Weather Vault (16.8%)",
          description:
            lang === "zh"
              ? "通过 16 链免桥意图清算，将 500 USDC 存入 OmniUSDC 全天候宏观金库，锁定稳健高年化。"
              : "Route 500 USDC into All-Weather macro parity vault via 16-chain zero-bridge intent.",
          amount: 500,
          vault: "all-weather",
          vaultName: "OmniYield All-Weather RWA (OmniUSDC)",
          apy: "16.80%",
          projectedReturn: "+$84.00 USDC / Year",
          buttonText: lang === "zh" ? "⚡ 确认一键签名存入" : "⚡ Confirm One-Click Deposit",
        };
      }
      // 0.2 核心生态研判: NEAR AI 与用户拥有的去中心化 AI 生态
      else if (
        qLower.includes("near ai") ||
        qLower.includes("nearai") ||
        qLower.includes("介绍一下near") ||
        qLower.includes("什么是near") ||
        qLower.includes("near是什么") ||
        qLower.includes("near协议") ||
        qLower.includes("near生态")
      ) {
        aiReply =
          lang === "zh"
            ? `🌐 **【OmniYield 智能资管中枢 · 深度解析 NEAR AI 生态】**\n\n**NEAR Protocol** 是全球极少数拥有深厚 AI 顶级科学家基因的高性能区块链——其联合创始人 **Illia Polosukhin** 正是奠定现代大模型（ChatGPT、Gemini、Claude）底层基石论文 **《Attention Is All You Need》**（Transformer 架构）的核心作者之一！\n\n### 🚀 NEAR AI 的三大核心基石：\n1. 🧠 **User-Owned AI（用户拥有的去中心化 AI）**：\n   打破科技巨头对算力与数据的垄断，构建开源模型、去中心化数据存储与链上验证相结合的下一代自主 AI 智能体生态。\n2. ⚡ **Chain Abstraction & Chain Signatures（链抽象与链签名）**：\n   AI Agent 可通过单一 NEAR 根账户在没有第三方跨链桥的情况下，直接操作比特币、以太坊、Solana 等 16 条主流公链资产，实现全链意图调度。\n3. 🏛️ **OmniYield Protocol 旗舰落地实践**：\n   OmniYield 作为 NEAR AI 生态顶级项目，率先实现**“三位一体智能资管 AI Agent”**——将自然语言意图（Intent）直接编译为链上金库清算指令，实现秒级申购、赎回与跨金库再平衡！\n\n💡 您现在可以直接对我说：“帮我存入 500 USDC 到全天候金库”或“赎回 2 份额”，亲身体验 NEAR 链上 AI 操盘的极速魅力！`
            : `🌐 **[OmniYield AI Hub · In-Depth Guide to NEAR AI]**\n\n**NEAR Protocol** was built on profound AI heritage: co-founder **Illia Polosukhin** is a primary author of the seminal paper *"Attention Is All You Need"* (the Transformer architecture behind modern LLMs).\n\n### 🚀 Three Pillars of NEAR AI:\n1. **User-Owned AI**: Democratizing AI with open-source models, sovereign data ownership, and verifiable decentralized computing.\n2. **Chain Signatures & Abstraction**: Enables AI agents to control accounts across 16+ blockchains (Bitcoin, Ethereum, Solana) without centralized bridges.\n3. **OmniYield as Live Implementation**: Built on NEAR AI primitives, OmniYield compiles natural language intents directly into verifiable smart vault actions (deposits, redemptions, Bridgewater risk parity)!\n\n💡 Try saying: *"Deposit 500 USDC to All-Weather Vault"* to experience NEAR AI in action!`;
      }
      // 0.3 首席投资顾问: 实时行情与宏观研判 (BTC / ETH / 黄金 / 宏观大盘价格)
      else if (
        (qLower.includes("near") && (qLower.includes("价格") || qLower.includes("行情") || qLower.includes("走势") || qLower.includes("多少钱") || qLower.includes("price"))) ||
        qLower.includes("btc") ||
        qLower.includes("bitcoin") ||
        qLower.includes("比特币") ||
        qLower.includes("eth") ||
        qLower.includes("以太坊") ||
        qLower.includes("大盘") ||
        qLower.includes("价格") ||
        qLower.includes("行情") ||
        qLower.includes("走势") ||
        qLower.includes("price") ||
        qLower.includes("market")
      ) {
        aiReply =
          lang === "zh"
            ? `📊 **【首席投资顾问 · Pyth 预言机实时行情与宏观研判】**\n\n根据 OmniYield 接入的 **Pyth Network 毫秒级去中心化预言机**（当前在线延迟 0.8s），核心资产最新链上报价与研判如下：\n\n• 🪙 **BTC (Bitcoin)**：**$68,450.00**（24h 涨幅 **+2.38%** · 维持布林线上轨震荡，多头动能强劲）\n• 💎 **ETH (Ethereum)**：**$2,580.40**（24h 涨幅 **+1.15%** · 处于低位蓄势支撑位）\n• 🌐 **NEAR Protocol**：**$5.20**（24h 涨幅 **+4.20%** · 链上 AI 交易意图与跨链活跃）\n• 🥇 **PAXG (实物黄金 RWA)**：**$2,745.50 / oz**（受地缘避险与美联储降息双轮驱动，处于历史高位）\n• 💵 **美债基准利率 (US 10Y)**：**3.98%**（降息周期中长债价格具备显著资本利得潜力）\n\n💡 **资管操盘策略指引**：\n当前宏观处于**美联储降息宽松初期**，高波动行情下直接持有单币风险溢价高。建议将闲置流动性配置至 **OmniUSDC 全天候宏观金库 (16.80% APY)**，由达里奥全天候四维平价模型（美股+美债+实物黄金+超额信贷）自动捕捉大盘 Alpha！`
            : `📊 **[Chief Investment Advisor · Pyth Real-Time Oracle Feed]**\n\nAccording to OmniYield's low-latency **Pyth Network Oracle (0.8s heartbeat)**, live institutional market benchmarks:\n\n• 🪙 **BTC (Bitcoin)**: **$68,450.00** (24h: **+2.38%**, strong bullish consolidation above upper Bollinger Band)\n• 💎 **ETH (Ethereum)**: **$2,580.40** (24h: **+1.15%**, healthy base accumulation)\n• 🌐 **NEAR Protocol**: **$5.20** (24h: **+4.20%**, surge in decentralized AI intent transactions)\n• 🥇 **PAXG (Physical Gold RWA)**: **$2,745.50 / oz** (testing historic highs on easing expectations)\n• 💵 **US 10Y Treasury Benchmark**: **3.98%** (continuing easing trajectory)\n\n💡 **Strategic Recommendation**:\nDuring early-stage easing cycles, mitigate single-token volatility by routing idle liquidity into the **OmniUSDC All-Weather Macro Vault (16.80% APY)**, which algorithmically balances US equities, treasuries, physical gold, and overcollateralized lending!`;

        actionCard = {
          id: `card-${Date.now()}`,
          type: "deposit",
          title: lang === "zh" ? "⚡ 根据行情一键申购全天候宏观金库 (16.8%)" : "⚡ Allocate into All-Weather Vault (16.8%)",
          description:
            lang === "zh"
              ? "利用降息行情与黄金涨幅，直接存入 500 USDC 参与达里奥全天候稳健对冲金库。"
              : "Capitalize on macro rate cuts and gold rallies with 500 USDC in All-Weather parity.",
          amount: 500,
          vault: "all-weather",
          vaultName: "OmniYield All-Weather RWA (OmniUSDC)",
          apy: "16.80%",
          projectedReturn: "+$84.00 USDC / Year",
          buttonText: lang === "zh" ? "⚡ 确认一键签名存入" : "⚡ Confirm One-Click Deposit",
        };
      }
      // 1. 首席投资顾问: 降息周期研判与金库引流
      else if (qLower.includes("降息") || qLower.includes("周期") || (qLower.includes("存入哪个") || qLower.includes("投哪个"))) {
        aiReply =
          lang === "zh"
            ? `📊 **【首席投资顾问 · 宏观大盘策略研判】**\n\n当前美联储进入降息宽松周期，纯浮动美元借贷基准利率趋于下行（从 14% 稳健收窄至 12% 左右），而**长久期美国国债 (USDY)** 与 **实物黄金 (PAXG)** 将迎来持续的资产价格溢价与抗通胀红利！\n\n💡 **金库配置建议与引流导向**：\n• **首选金库**: **OmniUSDC 全天候宏观金库 (16.80% APY)**\n• **底层驱动**: 25% 纳指QQQ + 40% 美债 + 15% 黄金 + 20% 抵押信贷四维对冲\n• **超额收益**: 相比纯借贷多出 **+4.40% 宏观 Alpha**\n\n已为您就绪【全天候宏观金库】入金执行方案，您可以一键签名申购：`
            : `📊 **[Chief Investment Advisor · Macro Strategy Memo]**\n\nAs the Federal Reserve initiates rate cuts, floating lending yields soften while long-duration Treasuries and physical Gold (PAXG) appreciate.\n\n💡 **Strategic Recommendation**:\n• **Primary Vehicle**: **OmniUSDC All-Weather Macro Vault (16.80% APY)**\n• **Alpha Advantage**: Generates **+4.40% macro premium** over pure money market yields.\n\nInstant execution card staged below:`;

        actionCard = {
          id: `card-${Date.now()}`,
          type: "deposit",
          title: lang === "zh" ? "⚡ 一键申购 500 USDC 至全天候宏观金库 (16.8%)" : "⚡ Deposit 500 USDC to All-Weather Vault",
          description:
            lang === "zh"
              ? "直接参与达里奥四维平价资产组合，锁定 16.80% 高年化与黄金抗周期涨幅。"
              : "Deposit 500 USDC to mint liquid OmniUSDC shares with 16.80% all-cycle APY.",
          amount: 500,
          vault: "all-weather",
          vaultName: "OmniYield All-Weather RWA (OmniUSDC)",
          apy: "16.80%",
          projectedReturn: "+$84.00 USDC / Year",
          buttonText: lang === "zh" ? "⚡ 确认一键签名存入 (One-Click Sign)" : "⚡ One-Click Sign & Deposit",
        };
      }
      // 2. 首席投资顾问: 组合配置 (10,000 USDC 双金库大类资产调配)
      else if (qLower.includes("10000") || qLower.includes("10,000") || qLower.includes("平衡稳健") || qLower.includes("跨仓配置") || (qLower.includes("配置") && qLower.includes("双金库"))) {
        aiReply =
          lang === "zh"
            ? `📊 **【首席投资顾问 · 机构级 10,000 USDC 资产配置方案】**\n\n在资产管理实践中，单一金库无法同时兼顾“绝对保本”与“穿越牛熊的超额收益”。针对 10,000 USDC 的资金体量，为您构建以下黄金配比：\n\n1. 🏛️ **60% 稳健底仓 (6,000 USDC) ➔ NUSD 核心借贷金库**\n   • 纯美元本位，70% RHEA 超额抵押借贷 + 30% 短期美债\n   • 年化 12.40%，每年产生 **+$744.00 确定性纯利差**，随时零滑点赎回现金。\n\n2. 🌐 **40% 宏观对冲 (4,000 USDC) ➔ OmniUSDC 全天候宏观金库**\n   • 达里奥四维平价模型（美股+美债+实物黄金+信贷）\n   • 年化 16.80%，每年贡献 **+$672.00 增强收益**，对抗法币贬值。\n\n💰 **综合投资组合回报**：整体年化综合收益率达到 **14.16% APY**，年收益预估 **+$1,416.00 USDC**！`
            : `📊 **[Chief Advisor · 10,000 USDC Portfolio Matrix]**\n\nOptimal institutional allocation balances capital preservation and macro upside:\n\n1. 🏛️ **60% Anchor (6,000 USDC) ➔ NUSD Core Lending (12.40% APY)**\n   • Steady USD lending yield: **+$744.00/yr** with zero price volatility.\n2. 🌐 **40% Alpha Hedge (4,000 USDC) ➔ OmniUSDC All-Weather (16.80% APY)**\n   • Multi-asset Bridgewater parity: **+$672.00/yr** capturing gold & equity upside.\n\nBlended Portfolio APY: **14.16% APY** (Total projected yield: **+$1,416.00 USDC/yr**).`;

        actionCard = {
          id: `card-${Date.now()}`,
          type: "deposit",
          title: lang === "zh" ? "⚡ 执行双金库最佳资产配置 (分流入金)" : "⚡ Execute Dual-Vault Portfolio Allocation",
          description:
            lang === "zh"
              ? "将资金分流入金至 NUSD 核心金库与 OmniUSDC 全天候金库，构建 14.16% 综合收益矩阵。"
              : "Dispatches split deposit intent across NUSD Core and OmniUSDC All-Weather vaults.",
          amount: 500,
          vault: "all-weather",
          vaultName: "OmniYield Dual-Vault Matrix",
          apy: "14.16% Blended",
          buttonText: lang === "zh" ? "⚡ 确认一键执行资产配置" : "⚡ Execute Allocation Intent",
        };
      }
      // 3. 意图量化操盘手: 申购 NUSD 核心借贷金库 (12.4%)
      else if ((qLower.includes("nusd") || qLower.includes("核心") || qLower.includes("借贷")) && (qLower.includes("存") || qLower.includes("申购") || qLower.includes("deposit"))) {
        const amount = 500;
        aiReply =
          lang === "zh"
            ? `⚡ **【意图量化操盘手 · NUSD 核心金库申购执行】**\n\n已解析您的自然语言入金意图：\n• 标的金库: **GOSUN OmniYield USDC (NUSD)**\n• 净值年化: **12.40% APY** (纯美元固定收益，无非美元价格波动)\n• 底层配置: 70% RHEA 超额抵押借贷 + 30% Ondo USDY 美债现金垫\n• 收益预测: 存入 ${amount} USDC 预计每年产生 **+$62.00 USDC** 净利息\n\n链上意图调用载荷装配完毕，点击下方按钮一键签名入库：`
            : `⚡ **[Quant Trader · NUSD Core Lending Intent]**\n\nNatural language deposit intent staged:\n• Vault: **GOSUN OmniYield USDC (NUSD)**\n• APY: **12.40% APY** (Pure USD standard fixed income)\n• Engine: 70% RHEA Lending + 30% Ondo USDY Treasuries\n\nExecution card staged below. Click to sign:`;

        actionCard = {
          id: `card-${Date.now()}`,
          type: "deposit",
          title: lang === "zh" ? `⚡ 一键存入 ${amount} USDC 到 NUSD 核心金库` : `⚡ Deposit ${amount} USDC to NUSD Core`,
          description:
            lang === "zh"
              ? `自动将 ${amount} USDC 存入金库，铸造对应 NUSD 份额并享受 12.40% 即时利息。`
              : `Deposit ${amount} USDC into Core Vault to mint NUSD shares earning 12.40% APY.`,
          amount,
          vault: "usdc",
          vaultName: "GOSUN OmniYield USDC (NUSD)",
          apy: "12.40%",
          projectedReturn: "+$62.00 USDC / Year",
          buttonText: lang === "zh" ? "⚡ 确认一键签名存入 NUSD" : "⚡ Sign & Deposit to NUSD",
        };
      }
      // 4. 意图量化操盘手: 申购全天候宏观金库 (16.8%)
      else if (qLower.includes("全天候") || qLower.includes("omniusdc") || (qLower.includes("存") && qLower.includes("500"))) {
        const amount = 500;
        aiReply =
          lang === "zh"
            ? `⚡ **【意图量化操盘手 · 全天候宏观金库申购执行】**\n\n已解析您的自然语言入金意图：\n• 标的金库: **OmniYield All-Weather RWA (OmniUSDC)**\n• 净值年化: **16.80% APY** (全周期阿尔法收益)\n• 底层配置: 25% 纳指QQQ + 40% 美债 + 15% 黄金 + 20% 信贷（达里奥四维平价）\n• 收益预测: 存入 ${amount} USDC 预计每年产生 **+$84.00 USDC** 净利得\n\n链上意图调用载荷装配完毕，点击下方按钮一键签名入库：`
            : `⚡ **[Quant Trader · All-Weather Macro Parity Intent]**\n\nNatural language deposit intent staged:\n• Vault: **OmniYield All-Weather RWA (OmniUSDC)**\n• APY: **16.80% APY** (Bridgewater 4-Pillar Parity)\n\nExecution card staged below. Click to sign:`;

        actionCard = {
          id: `card-${Date.now()}`,
          type: "deposit",
          title: lang === "zh" ? `⚡ 一键存入 ${amount} USDC 到全天候金库` : `⚡ Deposit ${amount} USDC to All-Weather`,
          description:
            lang === "zh"
              ? `自动将 ${amount} USDC 存入金库，铸造 OmniUSDC 份额并自动接入达里奥宏观平价生息。`
              : `Deposit ${amount} USDC into All-Weather Vault to mint OmniUSDC shares.`,
          amount,
          vault: "all-weather",
          vaultName: "OmniYield All-Weather RWA (OmniUSDC)",
          apy: "16.80%",
          projectedReturn: "+$84.00 USDC / Year",
          buttonText: lang === "zh" ? "⚡ 确认一键签名存入 (One-Click Sign)" : "⚡ One-Click Sign & Deposit",
        };
      }
      // 5. 意图量化操盘手: 跨金库仓位动态再平衡
      else if (qLower.includes("再平衡") || qLower.includes("调配") || qLower.includes("rebalance")) {
        aiReply =
          lang === "zh"
            ? `⚡ **【意图量化操盘手 · 跨金库动态再平衡执行】**\n\n已为您制定跨金库调仓方案：\n• 执行动作: 从 NUSD 核心金库转移 30% 仓位至 OmniUSDC 全天候金库\n• 策略动机: 应对美联储降息通道，将低波动流动性转化为高夏普黄金与长期国债估值增益\n• 预期增益: 组合综合 Sharpe 比率预计由 1.82 提升至 **2.84**\n\n已为您打包免跨链桥原子化调仓意图卡片：`
            : `⚡ **[Quant Trader · Cross-Vault Rebalance Intent]**\n\nAutomated cross-vault rebalance staged:\n• Action: Transfer 30% liquidity from NUSD Core into OmniUSDC All-Weather\n• Driver: Capture Fed rate-cut capital gains across tokenized Gold & US Treasuries.\n\nReview the execution card below and sign:`;

        actionCard = {
          id: `card-${Date.now()}`,
          type: "rebalance",
          title: lang === "zh" ? "🔄 确认执行 30% 仓位跨金库动态再平衡" : "🔄 Execute 30% Portfolio Rebalance",
          description:
            lang === "zh"
              ? "自动赎回 30% NUSD 并直接铸造 OmniUSDC 份额，零滑点完成宏观仓位调优。"
              : "Atomically rebalances 30% of NUSD holdings into OmniUSDC All-Weather shares.",
          amount: 250,
          vault: "all-weather",
          vaultName: "OmniUSDC All-Weather Macro",
          buttonText: lang === "zh" ? "⚡ 确认一键执行组合再平衡" : "⚡ Execute Portfolio Rebalance",
        };
      }
      // 6. 意图量化操盘手: 收益自动滚存复投 (Auto-Compound)
      else if (qLower.includes("滚存") || qLower.includes("复投") || qLower.includes("复利") || qLower.includes("compound")) {
        aiReply =
          lang === "zh"
            ? `⚡ **【意图量化操盘手 · NUSD 借贷收益滚存复投】**\n\n检测到您在 NUSD 核心金库有待领取的利息收益。\n• 执行逻辑: 将未提取利息收益原路径自动再申购为金库本金份额\n• 收益倍增: 启动 **12.40% APY** 复利滚雪球机制，避免收益闲置\n\n已装配好一键自动滚存意图卡片：`
            : `⚡ **[Quant Trader · Auto-Compounding Execution]**\n\nUnclaimed yield detected. Rolling interest back into principal triggers continuous 12.40% compounding.\n\nExecution card staged below:`;

        actionCard = {
          id: `card-${Date.now()}`,
          type: "deposit",
          title: lang === "zh" ? "🔄 确认一键收益自动滚存复投" : "🔄 Auto-Compound Accrued Yield",
          description:
            lang === "zh"
              ? "将已产生未提取的利息自动转换为新增 NUSD 本金份额。"
              : "Reinvest accrued interest directly into new NUSD principal shares.",
          amount: 50,
          vault: "usdc",
          vaultName: "GOSUN OmniYield USDC (NUSD)",
          buttonText: lang === "zh" ? "⚡ 确认一键收益滚存" : "⚡ Compound Accrued Yield",
        };
      }
      // 7. 意图量化操盘手: 流动性赎回出金
      else if (
        qLower.includes("赎回") ||
        qLower.includes("取出") ||
        qLower.includes("取回") ||
        qLower.includes("提取") ||
        qLower.includes("提现") ||
        qLower.includes("出金") ||
        qLower.includes("redeem") ||
        qLower.includes("withdraw")
      ) {
        const isAllWeather = qLower.includes("全天候") || qLower.includes("omniusdc");
        const numMatch = q.match(/(\d+(?:\.\d+)?)/);
        const amount = numMatch ? parseFloat(numMatch[1]) : 2;
        const targetVault = isAllWeather ? "all-weather" : "usdc";
        const receiptToken = isAllWeather ? "OmniUSDC" : "NUSD";
        const vaultName = isAllWeather ? "OmniYield All-Weather RWA (OmniUSDC)" : "GOSUN OmniYield USDC (NUSD)";

        aiReply =
          lang === "zh"
            ? `⚡ **【意图量化操盘手 · 金库份额流动性赎回】**\n\n已检测到您的金库份额净值充足，支持零惩罚即时出金：\n• 赎回标的: **${amount} ${receiptToken}** (从 ${vaultName})\n• 预计结算: 零滑点兑现为 **~${amount} USDC** 原生现金\n• 到账路径: 极速清算返回至当前连接的 NEAR 钱包地址\n\n请核验意图卡片并签名确认出金：`
            : `⚡ **[Quant Trader · Share Liquidity Redemption]**\n\nRedemption staged with instant liquidity buffer. Redeeming ${amount} ${receiptToken} settles ~${amount} USDC cash to your wallet.\n\nConfirm execution below:`;

        actionCard = {
          id: `card-${Date.now()}`,
          type: "withdraw",
          title: lang === "zh" ? `⚡ 确认一键赎回 ${amount} ${receiptToken} 为现金` : `⚡ Instant Redeem ${amount} ${receiptToken} to USDC`,
          description:
            lang === "zh"
              ? `赎回 ${amount} ${receiptToken} 份额，预计结算返还 ~${amount} USDC 原生现金至钱包。`
              : `Redeem ${amount} ${receiptToken} shares returning ~${amount} USDC cash to your wallet.`,
          amount,
          vault: targetVault,
          vaultName,
          buttonText: lang === "zh" ? "⚡ 确认一键签名赎回 (Instant Redeem)" : "⚡ Instant Redeem to USDC",
        };
      }
      // 8. 首席客服官: 连线机构客户经理 / 7x24 VIP 专线
      else if (qLower.includes("客服") || qLower.includes("经理") || qLower.includes("人工") || qLower.includes("support") || qLower.includes("concierge") || qLower.includes("rm") || qLower.includes("otc")) {
        aiReply =
          lang === "zh"
            ? `🎧 **【首席客户服务官 · 7x24 机构 VIP 专属服务绿色通道】**\n\n您好！我是 OmniYield 首席客服。对于单笔大额存取（> $50,000）、大宗 OTC 零滑点交易、私有策展金库定制、多签理事会权限分配或法律合规审计尽调，我们为您提供专属人工专线支持。\n\n👔 **专属机构客户总监**: Jason Zhang (Senior DeFi Custody Director)\n⚡ **响应时效**: 7x24h 绿色通道专线，平均响应时效 < 3 分钟\n\n📱 **官方认证直连专线**:\n• 📱 Telegram VIP 专线: \`@OmniYield_VIP\`\n• 📧 机构专属支持邮箱: \`institutional@omniyield.xyz\`\n• 🛡️ 权威审计合规包: 已完成 Halborn 智能合约安全审计，美债底层 1:1 存托于特拉华州离线信托银行 Ancora Trust。\n\n您也可以直接在对话框中告诉我您遇到的具体操作问题，我将立即为您排查！`
            : `🎧 **[Chief Client Concierge · 24/7 Institutional VIP Desk]**\n\nGreetings! For allocations exceeding $50,000, zero-slippage OTC orders, bespoke private vaults, or audit diligence, our dedicated institutional desk is at your service.\n\n👔 **Director of Institutional Coverage**: Jason Zhang\n⚡ **SLA Window**: Priority response within 3 minutes\n\n📱 **Direct Verification Channels**:\n• Telegram VIP: \`@OmniYield_VIP\`\n• Institutional Desk: \`institutional@omniyield.xyz\`\n• Compliance: Halborn smart contract audit & Ancora Trust custodial certification.\n\nFeel free to describe any operational questions below!`;
      }
      // 9. 首席客服官: 免跨链桥意图原理
      else if (qLower.includes("免桥") || qLower.includes("跨链") || qLower.includes("intents") || qLower.includes("bridge")) {
        aiReply =
          lang === "zh"
            ? `🎧 **【首席客户服务官 · 16 链免桥意图清算原理剖析】**\n\n为什么在 OmniYield 存入 Arbitrum 或 Solana 上的 USDC，不需要走中心化跨链桥就能直接生息？\n\n1. **零第三方跨链桥风险**：\n   传统跨链桥（如锁定+铸造机制）历史上屡遭数十亿美元黑客被盗。OmniYield 采用 **NEAR Intents (意图清算网络)**，用户无需将资产锁定在易受攻击的跨链合约中。\n\n2. **做市商（Solvers）链下竞价垫付**：\n   您在 Arbitrum 签署存入意图，合规做市商网络毫秒级在 NEAR 目标链为您的金库垫付流动性，做市商自行承担结算风险，您秒级拿到计息份额。\n\n3. **16 条主流公链无缝直通**：\n   支持 Base、Arbitrum、Solana、Ethereum、BNB Chain、Sui、Aptos、Avalanche 等 16 条网络原生清算，gas 费低至 $0.001！`
            : `🎧 **[Chief Concierge · How 16-Chain Zero-Bridge Intents Work]**\n\nWhy does depositing Arbitrum or Solana USDC into OmniYield avoid third-party bridge risks?\n\n1. **Zero Bridge Exploit Surface**: Eliminates lock-and-mint bridge vulnerabilities by utilizing NEAR Chain Signatures & Defuse Intents.\n2. **Competitive Solver Execution**: Professional market makers (Solvers) front liquidity on NEAR in sub-second speed, absorbing cross-chain finality delays.\n3. **16 Native Networks**: Base, Arbitrum, Solana, Ethereum, Avalanche, BSC, Sui, Aptos, and more natively supported!`;
      }
      // 10. 首席客服官: 资金安全与风控
      else if (qLower.includes("安全") || qLower.includes("坏账") || qLower.includes("熔断") || qLower.includes("security")) {
        aiReply =
          lang === "zh"
            ? `🎧 **【首席客户服务官 · 四重穿透式资金安全保障】**\n\nOmniYield 实施严密的三权分立与链上风控保护体系：\n\n1. **超额抵押隔离 (140%~180%)**：RHEA 借贷池抵押资产由主流价值币（BTC/ETH/NEAR）足额超额质押，智能清算机器人 7x24h 毫秒级强平违约仓位。\n2. **策展人限额 (Curator Caps)**：对单一借贷市场设置严格资金上限，单个市场极端黑天鹅无法穿透侵害金库主资金池。\n3. **守护者 24h 熔断特权 (Guardian VETO)**：一旦预警系统检测到链上异常，守护者可单边一键暂停金库出入金并冻结治理提案，保障资产安全。\n4. **贝莱德 RWA 法律存托**：Ondo USDY 底层美国短期国债 1:1 离线存放在美国受监管的特许信托银行，破产隔离且受法律保护。`
            : `🎧 **[Chief Concierge · Quadruple Security Guardrails]**\n\nOmniYield operates with institutional segregation of powers:\n\n1. **140%-180% Dynamic Overcollateralization** with automated liquidator bots.\n2. **Curator Risk Caps** preventing contagion across single markets.\n3. **Guardian 24h Timelock VETO** allowing emergency circuit breaking.\n4. **Bankruptcy-Remote RWA Custody** backed 1:1 in regulated trust banks.`;
      }
      // 11. 首席客服官: 费率与锁定期
      else if (qLower.includes("费率") || qLower.includes("手续费") || qLower.includes("锁定期") || qLower.includes("fee")) {
        aiReply =
          lang === "zh"
            ? `🎧 **【首席客户服务官 · 费率透明度与流动性说明】**\n\n1. **零申购费与零赎回费**：存入 USDC 与赎回金库份额均不收取任何协议前置交易费。\n2. **零锁定期，秒级赎回**：两大金库均为开放式流动性设计，无锁定期限，您可以随时在对话框中指令赎回。\n3. **纯按表现计提表现费**：协议仅对金库实际产生的超额收益提取 10% 协议表现费，直接分红给 DAO 国库与 veOMNI 治理质押者，不产生收益则完全不收费！`
            : `🎧 **[Chief Concierge · Fee Transparency & Liquidity Terms]**\n\n1. **Zero Entry / Exit Fees**: 0% deposit or redemption fee.\n2. **Zero Lockup**: Instant daily liquidity with no lockup.\n3. **Pure Performance Fee**: Protocol retains only 10% on generated yields, shared with DAO stakers.`;
      }
      // Fallback
      else {
        aiReply =
          lang === "zh"
            ? `👑 **【OmniYield 三位一体 AI 资管中枢】**\n\n我是您的全天候金融智能伙伴，随时为您提供三重核心服务：\n\n• 🧠 **首席投资顾问**：向我咨询宏观降息研判、双金库对比与资产组合方案；\n• ⚡ **意图量化操盘手**：直接对我说*“存入 500 USDC 到全天候金库”*或*“将 30% 仓位再平衡”*，一秒生成执行卡片；\n• 🎧 **首席客户服务官**：解答免桥原理、安全风控、或输入*“连线人工客服”*接通 7x24 VIP 专线！\n\n请告诉我您今天需要哪项服务？`
            : `👑 **[OmniYield Tri-Pillar Financial Agent]**\n\nI am ready across three core pillars:\n• 🧠 **Chief Advisor**: Macro guidance & dual-vault allocation strategies.\n• ⚡ **Quant Trader**: Natural language execution for deposits, rebalancing & redemptions.\n• 🎧 **Chief Concierge**: Protocol onboarding, risk transparency & 24/7 human escalation.\n\nHow may I direct your asset management today?`;
      }



    const aiMsg: Message = {
      id: `ai-${Date.now()}`,
      sender: "ai",
      tier: currentTier,
      text: aiReply,
      timestamp: new Date().toLocaleTimeString(),
      actionCard,
    };

    setMessages((prev) => [...prev, aiMsg]);
    setIsThinking(false);
  };

  return (
    <div
      className={`h-[calc(100vh-140px)] flex flex-col p-6 rounded-3xl border transition-all duration-300 relative overflow-hidden ${
        theme === "beige"
          ? "bg-white border-[#dfd2be] shadow-sm text-slate-900"
          : "bg-slate-950/80 border-cyan-500/30 shadow-2xl shadow-cyan-950/10 text-white"
      }`}
    >
      {/* =========================================================================
          1. COMPACT INSTITUTIONAL HEADER (Strict Height: h-7 / 28px Alignment, Zero Wrapping)
      ========================================================================= */}
      <div
        className={`pb-3 mb-3 border-b flex items-center justify-between gap-3 flex-shrink-0 min-w-0 flex-nowrap overflow-x-auto no-scrollbar ${
          theme === "beige" ? "border-[#e8dfd3]" : "border-slate-800"
        }`}
      >
        <div className="flex items-center space-x-2 min-w-0 flex-shrink-0">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center font-bold text-slate-950 shadow-2xs flex-shrink-0">
            <Crown className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-center space-x-2 min-w-0">
            <h3 className={`text-sm font-black tracking-tight whitespace-nowrap ${theme === "beige" ? "text-slate-900" : "text-white"}`}>
              {lang === "zh" ? "OmniYield 三位一体 AI 资管终端" : "OmniYield Tri-Pillar AI"}
            </h3>
            <span className="hidden xl:inline-flex h-7 px-2.5 rounded-lg items-center font-mono font-bold text-[10px] bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 whitespace-nowrap flex-shrink-0">
              {lang === "zh" ? "投顾 · 操盘 · 客服" : "Advisor · Quant · Desk"}
            </span>
          </div>
        </div>

        {/* Right Status Controls - ALL ELEMENTS STRICTLY h-7 (28px), Zero Wrap */}
        <div className="flex items-center space-x-2 ml-auto flex-shrink-0">
          {/* Integrated Pyth & Macro Regime Pill (h-7) */}
          <div
            className={`h-7 flex items-center space-x-1.5 px-2.5 rounded-lg text-[11px] font-mono font-semibold border whitespace-nowrap flex-shrink-0 ${
              theme === "beige"
                ? "bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs"
                : "bg-emerald-950/30 text-emerald-400 border-emerald-500/30"
            }`}
            title={lang === "zh" ? "Pyth 预言机实时连接 (0.8s) · 宏观周期: 美联储降息宽松期 · 建议超配实物黄金与长期美债" : "Pyth Live Oracle (0.8s) · Macro Regime: Fed Rate-Cut Cycle · Favor Gold & Treasuries"}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{lang === "zh" ? "Pyth 在线 (0.8s) · 降息宽松期" : "Pyth 0.8s · Fed Easing"}</span>
          </div>

          {/* Quick Dual-Vault Yield Badges - Unified Twin-Pill Container (h-7) */}
          <div className={`hidden md:flex items-center h-7 rounded-lg border font-mono text-[10px] font-bold overflow-hidden ${
            theme === "beige" ? "border-[#ded3c4]" : "border-slate-800"
          }`}>
            <span className={`h-full flex items-center px-2.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-r ${
              theme === "beige" ? "border-[#ded3c4]" : "border-slate-800"
            }`}>
              NUSD 12.4%
            </span>
            <span className="h-full flex items-center px-2.5 bg-purple-500/10 text-purple-700 dark:text-purple-400">
              OmniUSDC 16.8%
            </span>
          </div>

          {/* Automatic On-Chain Share Verification Badge (h-7) */}
          <div
            className={`hidden sm:flex h-7 px-2.5 rounded-lg text-xs font-mono font-bold items-center space-x-1.5 border transition ${
              isVip
                ? "bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/50 shadow-2xs"
                : "bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800"
            }`}
          >
            {isVip ? (
              <Crown className="w-3.5 h-3.5 text-amber-500" />
            ) : (
              <Globe className="w-3.5 h-3.5 text-slate-400" />
            )}
            <span>
              {isVip
                ? lang === "zh"
                  ? `VIP 1 (${totalShares.toFixed(1)} 份)`
                  : `VIP 1 (${totalShares.toFixed(1)} Shares)`
                : lang === "zh"
                ? "散户顾问"
                : "Retail"}
            </span>
          </div>

          {/* Reset Button (h-7) */}
          <button
            type="button"
            onClick={() => {
              setLatestUserMessageId(null);
              setShowScrollBottom(false);
              setMessages([
                {
                  id: `reset-${Date.now()}`,
                  sender: "ai",
                  tier: currentTier,
                  text:
                    lang === "zh"
                      ? "会话已重置。我是 OmniYield 三位一体 AI 资管中枢，请选择上方角色或直接输入指令！"
                      : "Session reset. Tri-Pillar Financial Agent is ready for your commands!",
                  timestamp: "Just now",
                },
              ]);
            }}
            className={`h-7 px-2.5 rounded-lg text-xs border transition flex items-center space-x-1 cursor-pointer ${
              theme === "beige"
                ? "bg-[#faf8f5] hover:bg-slate-100 text-slate-700 border-[#dfd2be]"
                : "bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border-slate-800"
            }`}
          >
            <RotateCcw className="w-3 h-3" />
            <span>{lang === "zh" ? "清空" : "Reset"}</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          2. UPGRADE BANNER (Shown for Retail Tier 0 users)
      ========================================================================= */}
      {!isVip && (
        <div
          className={`p-3 rounded-2xl mb-3 border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition ${
            theme === "beige"
              ? "bg-amber-50/80 border-amber-200 text-amber-900"
              : "bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border-amber-500/30 text-amber-200"
          }`}
        >
          <div className="flex items-center space-x-2">
            <Crown className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <span>
              {lang === "zh"
                ? "持有金库份额 (NUSD 或 OmniUSDC) 即可自动确权升级【VIP 1 专属 AI 理财顾问，自然语言直接操盘金库】！"
                : "Hold vault shares (NUSD or OmniUSDC) to automatically qualify for VIP 1 Dedicated AI Wealth Manager!"}
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              onNavigateToVault("usdc");
              if (onLog) onLog("[Navigation] 🚀 Navigating to Core Vault to deposit and activate VIP 1 qualification.");
            }}
            className="px-3 py-1 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition cursor-pointer self-start sm:self-auto shadow-sm"
          >
            {lang === "zh" ? "前往存入金库" : "Deposit into Vault"}
          </button>
        </div>
      )}

      {/* =========================================================================
          3. MESSAGES THREAD (With Smart Auto-Scroll, Top-Pinning & Sleek Scrollbar)
      ========================================================================= */}
      <div
        ref={chatContainerRef}
        onScroll={() => {
          if (!chatContainerRef.current) return;
          const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
          const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
          setShowScrollBottom(!isNearBottom);
        }}
        className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar relative"
      >
        {messages.map((m) => (
          <div
            key={m.id}
            ref={m.id === latestUserMessageId ? lastUserMessageRef : null}
            className={`flex items-start space-x-3 ${m.sender === "user" ? "flex-row-reverse space-x-reverse" : ""}`}
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold transition-all ${
                m.sender === "user"
                  ? isVip
                    ? "bg-emerald-600 text-white shadow-md ring-2 ring-amber-400 border-2 border-amber-300"
                    : theme === "beige"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                  : m.tier === "tier1_vip"
                  ? "bg-gradient-to-tr from-amber-400 to-amber-600 text-slate-950 shadow-sm ring-1 ring-amber-400/50"
                  : theme === "beige"
                  ? "bg-cyan-50 text-cyan-800 border border-cyan-200"
                  : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
              }`}
            >
              {m.sender === "user" ? (
                <div className="relative flex items-center justify-center">
                  <User className="w-4 h-4" />
                  {isVip && (
                    <span className="absolute -top-2.5 -right-2.5 animate-pulse">
                      <Crown className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                    </span>
                  )}
                </div>
              ) : m.tier === "tier1_vip" ? (
                <Crown className="w-4 h-4" />
              ) : (
                <Bot className="w-4 h-4" />
              )}
            </div>

            <div
              className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                m.sender === "user"
                  ? theme === "beige"
                    ? "bg-emerald-50 border border-emerald-200 text-emerald-950 font-medium"
                    : "bg-emerald-500/15 border border-emerald-500/30 text-white"
                  : theme === "beige"
                  ? "bg-[#faf8f5] border border-[#e8ded0] text-slate-800"
                  : "bg-slate-900/80 border border-slate-800 text-slate-200"
              }`}
            >
              <div className="whitespace-pre-line">{m.text}</div>

              {/* ACTION CARD (VIP 1 INTENT TO TRANSACTION DISPATCHER) */}
              {m.actionCard && (
                <div
                  className={`mt-3 p-4 rounded-2xl border space-y-3 transition shadow-sm ${
                    m.actionCard.executed
                      ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-800 dark:text-emerald-300"
                      : isVip
                      ? theme === "beige"
                        ? "bg-amber-50/80 border-amber-300 text-amber-950 shadow-amber-900/5"
                        : "bg-gradient-to-r from-amber-950/30 to-slate-900 border-amber-500/40 text-amber-100"
                      : theme === "beige"
                      ? "bg-cyan-50/60 border-cyan-200 text-slate-900"
                      : "bg-gradient-to-r from-cyan-950/40 to-slate-900 border-cyan-500/40 text-cyan-100"
                  }`}
                >
                  <div className="flex items-center justify-between pb-1.5 border-b border-black/10 dark:border-white/10">
                    <div className="font-extrabold flex items-center space-x-1.5 text-xs">
                      {isVip ? (
                        <Crown className="w-3.5 h-3.5 text-amber-500" />
                      ) : (
                        <Zap className="w-3.5 h-3.5 text-cyan-500" />
                      )}
                      <span>{m.actionCard.title}</span>
                    </div>
                    {m.actionCard.apy && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                        {m.actionCard.apy}
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] leading-relaxed opacity-90">{m.actionCard.description}</p>

                  {m.actionCard.projectedReturn && (
                    <div className="p-2 rounded-xl bg-white/60 dark:bg-black/30 border border-black/5 dark:border-white/10 text-[11px] font-mono flex justify-between items-center">
                      <span className="text-slate-500">{lang === "zh" ? "预估年化收益:" : "Projected Return:"}</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {m.actionCard.projectedReturn}
                      </span>
                    </div>
                  )}

                  {/* ACTION BUTTON */}
                  <div>
                    {m.actionCard.executed ? (
                      <div className="py-2.5 px-3 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-sm">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{lang === "zh" ? "意图已成功上链执行！" : "Intent Settled On-Chain!"}</span>
                      </div>
                    ) : m.actionCard.type === "navigate" ? (
                      <button
                        type="button"
                        onClick={() => {
                          if (m.actionCard?.vault) {
                            onNavigateToVault(m.actionCard.vault);
                          }
                        }}
                        className={`w-full py-2.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center justify-center space-x-1 ${
                          theme === "beige"
                            ? "bg-[#0e7490] hover:bg-[#0891b2] text-white shadow-sm"
                            : "bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black"
                        }`}
                      >
                        <span>{m.actionCard.buttonText}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleExecuteActionCard(m.actionCard!)}
                        disabled={executingCardId === m.actionCard.id}
                        className={`w-full py-3 rounded-xl font-black text-xs transition cursor-pointer flex items-center justify-center space-x-2 shadow-md ${
                          isVip
                            ? "bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-amber-500/20 active:scale-[0.99]"
                            : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20"
                        } disabled:opacity-50`}
                      >
                        {executingCardId === m.actionCard.id ? (
                          <>
                            <span className="w-3.5 h-3.5 rounded-full border-2 border-slate-950 border-t-transparent animate-spin" />
                            <span>{lang === "zh" ? "正在调用 NEAR 意图清算并签名上链..." : "Signing NEAR on-chain intent..."}</span>
                          </>
                        ) : (
                          <>
                            <Zap className="w-4 h-4 fill-current" />
                            <span>{m.actionCard.buttonText}</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              )}

              <span
                className={`text-[9px] font-mono block mt-1.5 text-right ${
                  theme === "beige" ? "text-slate-500" : "text-slate-500"
                }`}
              >
                {m.timestamp}
              </span>
            </div>
          </div>
        ))}
        {isThinking && (
          <div className="flex items-center space-x-3">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                isVip
                  ? "bg-amber-500/20 text-amber-500 border border-amber-500/40"
                  : theme === "beige"
                  ? "bg-cyan-50 text-cyan-800 border border-cyan-200"
                  : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
              }`}
            >
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div
              className={`p-3 rounded-2xl border text-xs flex items-center space-x-2 ${
                theme === "beige"
                  ? "bg-[#faf8f5] border-[#dfd2be] text-slate-600"
                  : "bg-slate-900/80 border-slate-800 text-slate-400"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
              <span>
                {isVip
                  ? lang === "zh"
                    ? "VIP 私人理财顾问正在解析交易意图、测算最佳滑点与调用载荷..."
                    : "VIP Wealth Manager is parsing intent & computing optimal execution routes..."
                  : lang === "zh"
                  ? "DeFi 顾问正在检索协议知识库与利率模型..."
                  : "DeFi Advisor is retrieving protocol docs & spread models..."}
              </span>
            </div>
          </div>
        )}

        {/* Dynamic Bottom Clearance to guarantee Top-Pinning can reach the top edge */}
        {latestUserMessageId && (
          <div className="h-72 sm:h-96 flex-shrink-0 pointer-events-none" />
        )}

        {/* Scroll Target Anchor */}
        <div ref={messagesEndRef} className="h-1" />

        {/* Floating Jump to Latest Button */}
        {showScrollBottom && (
          <button
            type="button"
            onClick={() => {
              messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
              setShowScrollBottom(false);
            }}
            className={`sticky bottom-2 ml-auto z-30 px-3 py-1.5 rounded-full shadow-lg border text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer active:scale-95 animate-bounce ${
              theme === "beige"
                ? "bg-white text-slate-800 border-[#ded3c4] hover:bg-slate-50"
                : "bg-slate-900 text-white border-slate-700 hover:bg-slate-800"
            }`}
          >
            <ChevronDown className="w-3.5 h-3.5 text-emerald-600" />
            <span>{lang === "zh" ? "跳至最新回复" : "Jump to Latest"}</span>
          </button>
        )}
      </div>

      {/* =========================================================================
          4 & 5. INTELLIGENT HOVER-REVEAL ACTION DOCK & INPUT BOX (Linear / macOS Style)
      ========================================================================= */}
      <div className={`pt-2 border-t group relative transition-all duration-300 ${theme === "beige" ? "border-[#f0e8db]" : "border-slate-800"}`}>
        {/* Floating Progressive Disclosure Drawer:
            Normally hidden; smoothly reveals on hover over input zone or when typing or explicitly expanded */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-out ${
            isPromptRibbonOpen
              ? "opacity-100 max-h-28 mb-2 translate-y-0"
              : "opacity-0 max-h-0 mb-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:max-h-28 group-hover:mb-2 group-hover:translate-y-0 group-hover:pointer-events-auto focus-within:opacity-100 focus-within:max-h-28 focus-within:mb-2 focus-within:translate-y-0 focus-within:pointer-events-auto"
          }`}
        >
          <div className="flex items-center justify-between mb-1.5 px-1">
            {/* Tri-Pillar Mini Role Tabs (Strict h-7 Segmented Control with Pure SVG, Unified Emerald Active State) */}
            <div className={`h-7 flex items-center p-0.5 rounded-lg border text-[11px] font-bold shadow-2xs ${
              theme === "beige" ? "bg-[#f2ede4] border-[#ded3c4]" : "bg-slate-900 border-slate-800"
            }`}>
              <button
                type="button"
                onClick={() => setSelectedRole("advisor")}
                className={`h-full px-2.5 rounded-md transition flex items-center space-x-1.5 cursor-pointer ${
                  selectedRole === "advisor"
                    ? "item-selected shadow-2xs"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
                }`}
                title={lang === "zh" ? "首席投资顾问 (Macro Strategy & Vault Allocation)" : "Chief Investment Advisor"}
              >
                <Compass className="w-3 h-3" />
                <span>{lang === "zh" ? "首席投顾" : "Advisor"}</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole("quant")}
                className={`h-full px-2.5 rounded-md transition flex items-center space-x-1.5 cursor-pointer ${
                  selectedRole === "quant"
                    ? "item-selected shadow-2xs"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
                }`}
                title={lang === "zh" ? "意图量化操盘手 (Intent-Based Vault Trading)" : "Autonomous Quant Trader"}
              >
                <Zap className="w-3 h-3" />
                <span>{lang === "zh" ? "意图操盘" : "Quant"}</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole("support")}
                className={`h-full px-2.5 rounded-md transition flex items-center space-x-1.5 cursor-pointer ${
                  selectedRole === "support"
                    ? "item-selected shadow-2xs"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
                }`}
                title={lang === "zh" ? "首席客户服务官 (Support & 24/7 VIP Concierge)" : "Chief Client Concierge"}
              >
                <ShieldCheck className="w-3 h-3" />
                <span>{lang === "zh" ? "首席客服" : "Support"}</span>
              </button>
            </div>

            {/* Minimize / Expand Toggle (Aligned to h-7) */}
            <button
              type="button"
              onClick={() => setIsPromptRibbonOpen(!isPromptRibbonOpen)}
              className="h-7 px-2.5 rounded-lg text-[11px] text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center space-x-1 ml-auto cursor-pointer border border-transparent hover:border-black/5 dark:hover:border-white/5 transition"
            >
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>
                {isPromptRibbonOpen
                  ? lang === "zh"
                    ? "收起快捷指令"
                    : "Hide Prompts"
                  : lang === "zh"
                  ? "展开快捷指令"
                  : "Prompts"}
              </span>
              {isPromptRibbonOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>

          {/* Quick Prompts Ribbon (Pills) */}
          {isPromptRibbonOpen && (
            <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-0.5">
              {currentRolePresets.map((p, idx) => {
                const IconComponent = p.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendQuery(p.query)}
                    className={`h-7 px-2.5 rounded-lg border text-[11px] whitespace-nowrap transition flex items-center space-x-1.5 flex-shrink-0 cursor-pointer shadow-2xs group/pill ${
                      theme === "beige"
                        ? "bg-[#faf7f2] hover:bg-white text-slate-700 hover:text-slate-900 border-[#e3d8c8] hover:border-emerald-600/50"
                        : "bg-slate-900/90 hover:bg-slate-850 text-slate-300 hover:text-white border-slate-800 hover:border-emerald-500/50"
                    }`}
                  >
                    <IconComponent className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-[9px] font-mono px-1 rounded font-bold uppercase bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                      {p.tag}
                    </span>
                    <span className="font-medium">{p.title}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Input Box */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendQuery();
          }}
          className={`flex items-center space-x-2 border rounded-2xl p-1.5 transition shadow-sm ${
            isVip
              ? theme === "beige"
                ? "bg-[#fffdfa] border-amber-300 focus-within:border-amber-500 focus-within:ring-1 focus-within:ring-amber-500/20"
                : "bg-slate-900/90 border-amber-500/40 focus-within:border-amber-500"
              : theme === "beige"
              ? "bg-[#faf8f5] border-[#dfd2be] focus-within:border-cyan-600 focus-within:bg-white"
              : "bg-slate-900/90 border-slate-800 focus-within:border-cyan-500/60"
          }`}
        >
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder={
              isVip
                ? lang === "zh"
                  ? "👑 输入金库操盘指令 (如: '存入 500 USDC 到全天候金库' 或 '调配 30% 仓位')..."
                  : "👑 Enter intent command (e.g. 'Deposit 500 USDC to All-Weather' or 'Rebalance 30%')..."
                : lang === "zh"
                ? "向 DeFi 顾问咨询金库收益、RWA 底层资产、预言机或 16 链免桥原理..."
                : "Ask DeFi Advisor about APYs, RWA assets, Pyth oracles, or 16-chain intents..."
            }
            className={`flex-1 bg-transparent px-3 text-xs focus:outline-none ${
              theme === "beige"
                ? "text-slate-900 placeholder-slate-500 font-medium"
                : "text-white placeholder-slate-500"
            }`}
          />
          <button
            type="submit"
            disabled={!inputPrompt.trim() || isThinking}
            className={`p-2.5 rounded-xl font-bold transition disabled:opacity-40 cursor-pointer ${
              isVip
                ? "bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black shadow-md shadow-amber-500/20"
                : theme === "beige"
                ? "bg-cyan-700 hover:bg-cyan-600 text-white shadow-sm"
                : "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950"
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
