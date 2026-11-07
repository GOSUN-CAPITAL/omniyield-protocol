"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  TrendingUp,
  Zap,
  ArrowRightLeft,
  Lock,
  Layers,
  Terminal,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Wallet,
  Settings,
  X,
  Clock,
  AlertTriangle,
  RotateCcw,
  Sun,
  Moon,
  Globe,
  PieChart,
} from "lucide-react";
import { PerformanceChart } from "../components/PerformanceChart";
import { VaultLedgerTabs } from "../components/VaultLedgerTabs";
import { WalletModal, AccountDrawer } from "../components/WalletModal";
import VaultCockpitBackside from "../components/VaultCockpitBackside";
import MorphoLogoDropdown from "../components/MorphoLogoDropdown";
import AppSidebar, { NavTabType, BacksideDomainType } from "../components/AppSidebar";
import PortfolioView from "../components/PortfolioView";
import NearAICopilot from "../components/NearAICopilot";
import ExchangeView from "../components/ExchangeView";
import UserSettingsModal from "../components/UserSettingsModal";
import MarketsView from "../components/MarketsView";
import GovernanceIcon from "../components/GovernanceIcon";

const INSTITUTIONAL_ROLES = [
  "dao.omniyield-vault.testnet",
  "curator.omniyield-vault.testnet",
  "allocator.omniyield-vault.testnet",
  "guardian.omniyield-vault.testnet",
  "omniyield-vault.testnet",
];

const isInstitutional = (account: string) => INSTITUTIONAL_ROLES.includes(account);

function isSolanaAddress(acc: string): boolean {
  if (!acc || typeof acc !== "string") return false;
  if (acc.startsWith("0x") || acc.includes(".")) return false;
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(acc);
}

export default function Home() {
  const [navTab, setNavTab] = useState<"vaults" | "markets" | "portfolio">("vaults");
  const [activeVault, setActiveVault] = useState<"usdc" | "all-weather">("usdc");
  const [activeNav, setActiveNav] = useState<NavTabType>("vaults");
  const [activeBacksideNav, setActiveBacksideNav] = useState<BacksideDomainType>("vaults");
  const [isVaultMenuOpen, setIsVaultMenuOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"deposit" | "withdraw">("deposit");
  const [sourceChain, setSourceChain] = useState("Arbitrum");
  const [destChain, setDestChain] = useState("Solana");
  const [amount, setAmount] = useState("1000");
  const [isProcessing, setIsProcessing] = useState(false);
  const [txSuccess, setTxSuccess] = useState(false);
  const [timelockPending, setTimelockPending] = useState(false);
  const [circuitBreakerActive, setCircuitBreakerActive] = useState(false);
  const [rheaCap, setRheaCap] = useState(7000000);
  const [ondoCap, setOndoCap] = useState(100000000);
  const [isCapModalOpen, setIsCapModalOpen] = useState(false);
  const [capModalMarket, setCapModalMarket] = useState<"rhea-lending" | "ondo-rwa">("rhea-lending");
  const [capInputValue, setCapInputValue] = useState("10000000");
  const [isFlipped, setIsFlipped] = useState(false);
  const [pendingProposalCount, setPendingProposalCount] = useState(0);
  const [theme, setTheme] = useState<"dark" | "beige">("dark");
  const [lang, setLang] = useState<"en" | "zh">("en");

  const toggleTheme = (newTheme: "dark" | "beige") => {
    setTheme(newTheme);
    if (typeof window !== "undefined") {
      localStorage.setItem("omniyield_theme", newTheme);
    }
  };

  const toggleLang = (newLang: "en" | "zh") => {
    setLang(newLang);
    if (typeof window !== "undefined") {
      localStorage.setItem("omniyield_lang", newLang);
    }
  };

  // Web3 Wallet Connection & Balances State
  const [isConnected, setIsConnected] = useState(false);
  const [connectedAccount, setConnectedAccount] = useState("dao.omniyield-vault.testnet");
  const [connectedWallet, setConnectedWallet] = useState("NEAR Testnet");
  const [nearBalance, setNearBalance] = useState("3.99");
  const [usdcBalance, setUsdcBalance] = useState<number>(8);
  const [nusdBalance, setNusdBalance] = useState<string>("2.00");
  const [omniUsdcBalance, setOmniUsdcBalance] = useState<string>("0.00");
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isAccountDrawerOpen, setIsAccountDrawerOpen] = useState(false);
  const [lastTxHash, setLastTxHash] = useState<string | null>(null);
  const [lastTxUrl, setLastTxUrl] = useState<string | null>(null);
  const [crosschainProof, setCrosschainProof] = useState<{
    txHash?: string;
    explorerUrl?: string;
    chain?: string;
    payoutAmount?: string;
    action?: string;
  } | null>(null);
  const [recipientAddress, setRecipientAddress] = useState("");

  const refreshAllBalances = async (
    acc = connectedAccount,
    overrides?: { nusd?: string; omniUsdc?: string; usdc?: number },
    chainOverride?: string
  ) => {
    let evmEthGas: string | null = null;
    let evmOnChainUsdc: number | null = null;
    const activeChain = chainOverride || sourceChain;

    if (acc.startsWith("0x")) {
      if (typeof window !== "undefined" && (window as any).ethereum) {
        try {
          // 1. Real ETH Gas Balance from current provider
          const balanceHex = await (window as any).ethereum.request({
            method: "eth_getBalance",
            params: [acc, "latest"],
          });
          const wei = BigInt(balanceHex);
          evmEthGas = (Number(wei / BigInt("1000000000000000")) / 1000).toFixed(4);

          // 2. Query real on-chain ERC-20 USDC balance
          const cleanAddr = acc.toLowerCase().replace("0x", "").padStart(64, "0");
          const callData = `0x70a08231${cleanAddr}`;
          const targetUsdc = activeChain === "Base" 
            ? "0x036CbD53842c5426634e7929541eC2318f3dCF7e"
            : "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d";
          try {
            const usdcHex = await (window as any).ethereum.request({
              method: "eth_call",
              params: [{ to: targetUsdc, data: callData }, "latest"],
            });
            if (usdcHex && usdcHex !== "0x" && usdcHex !== "0x0") {
              const rawUsdc = BigInt(usdcHex);
              evmOnChainUsdc = Number(rawUsdc) / 1_000_000;
            }
          } catch (_) {}
        } catch (e) {
          console.error("EVM balance error:", e);
        }
      }
      if (evmEthGas) {
        setNearBalance(evmEthGas);
      }
    }

    try {
      // Sovereign client-side balance cache
      let localBalances: { nusd?: string; omniUsdc?: string; usdc?: number } = {};
      if (typeof window !== "undefined") {
        try {
          const raw = localStorage.getItem(`omniyield_balances_${acc}`);
          if (raw) localBalances = JSON.parse(raw);
        } catch (_) {}
      }

      // Only sync dual-vault partitions when explicitly provided by an active transaction override
      const syncOmni = overrides?.omniUsdc;
      const syncNusd = overrides?.nusd;

      let url = `/api/balances?account=${acc}&chain=${activeChain}`;
      if (syncOmni !== undefined) url += `&syncOmniUsdc=${syncOmni}`;
      if (syncNusd !== undefined) url += `&syncNusd=${syncNusd}`;

      const res = await fetch(url);
      const data = await res.json();
      if (data && !data.error) {
        if (data.nearBalance) {
          setNearBalance(data.nearBalance);
        }

        // Mode A: Authoritative On-Chain USDC Balance from RPC (EVM / Solana / NEAR)
        let finalUsdc = 0;
        const isCrossChainAccount = acc.startsWith("0x") || Boolean(data.isSolana);
        if (overrides?.usdc !== undefined) {
          finalUsdc = overrides.usdc;
        } else if (isCrossChainAccount) {
          // Priority 1: Direct On-Chain RPC query with vault commitment deduction from server endpoint
          if (typeof data.usdcBalance === "number") {
            finalUsdc = data.usdcBalance;
          } else if (typeof localBalances.usdc === "number") {
            finalUsdc = localBalances.usdc;
          } else {
            finalUsdc = 0;
          }
        } else {
          finalUsdc = typeof localBalances.usdc === "number" ? localBalances.usdc : (data.usdcBalance ?? 0);
        }
        setUsdcBalance(finalUsdc);

        // NUSD Balance (Mode A)
        let finalNusd = "0.00";
        if (overrides?.nusd !== undefined) {
          finalNusd = overrides.nusd;
        } else if (isCrossChainAccount) {
          finalNusd = data.nusdBalance || "0.00";
        } else {
          const serverNusd = parseFloat(data.nusdBalance || "0.00") || 0;
          const localNusd = localBalances.nusd !== undefined ? parseFloat(localBalances.nusd) : 0;
          finalNusd = Math.max(serverNusd, localNusd).toFixed(2);
        }
        setNusdBalance(finalNusd);

        // OmniUSDC Balance (Mode A)
        let finalOmni = "0.00";
        if (overrides?.omniUsdc !== undefined) {
          finalOmni = overrides.omniUsdc;
        } else if (isCrossChainAccount) {
          finalOmni = data.omniUsdcBalance || "0.00";
        } else {
          const serverOmni = parseFloat(data.omniUsdcBalance || "0.00") || 0;
          const localOmni = localBalances.omniUsdc !== undefined ? parseFloat(localBalances.omniUsdc) : 0;
          finalOmni = Math.max(serverOmni, localOmni).toFixed(2);
        }
        setOmniUsdcBalance(finalOmni);

        if (typeof window !== "undefined") {
          localStorage.setItem(
            `omniyield_balances_${acc}`,
            JSON.stringify({
              nusd: finalNusd,
              omniUsdc: finalOmni,
              usdc: finalUsdc,
              updatedAt: Date.now(),
            })
          );
        }
      }
    } catch (e) {
      console.error("Balance refresh error:", e);
    }
  };

  const handleClaimFaucet = () => {
    const newBal = usdcBalance + 20;
    setUsdcBalance(newBal);
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(`omniyield_balances_${connectedAccount}`);
        const parsed = raw ? JSON.parse(raw) : {};
        localStorage.setItem(
          `omniyield_balances_${connectedAccount}`,
          JSON.stringify({
            ...parsed,
            usdc: newBal,
            updatedAt: Date.now(),
          })
        );
      } catch (_) {}
    }
    setLogs((prev) => [
      `[${new Date().toLocaleTimeString()}] 💧 Circle Testnet Standard: +20.00 USDC credited to ${connectedAccount}! Available: $${newBal.toLocaleString()} USDC.`,
      ...prev,
    ]);
  };

  // Auto-detect return from MyNearWallet OAuth or saved session in localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlAccountId = params.get("account_id");
      if (urlAccountId) {
        setIsConnected(true);
        setConnectedAccount(urlAccountId);
        setConnectedWallet("MyNearWallet");
        localStorage.setItem("omniyield_wallet_account", urlAccountId);
        localStorage.setItem("omniyield_wallet_provider", "MyNearWallet");

        // Seed from local storage if available
        try {
          const raw = localStorage.getItem(`omniyield_balances_${urlAccountId}`);
          if (raw) {
            const b = JSON.parse(raw);
            if (b.omniUsdc) setOmniUsdcBalance(b.omniUsdc);
            if (b.nusd) setNusdBalance(b.nusd);
            if (typeof b.usdc === "number") setUsdcBalance(b.usdc);
          }
        } catch (_) {}

        refreshAllBalances(urlAccountId);
        window.history.replaceState({}, document.title, window.location.pathname);
        setLogs((prev) => [
          `[${new Date().toLocaleTimeString()}] 🔌 MyNearWallet Session Authorized: ${urlAccountId}.`,
          ...prev,
        ]);
      } else {
        const savedAccount = localStorage.getItem("omniyield_wallet_account");
        const savedProvider = localStorage.getItem("omniyield_wallet_provider");
        const initialAccount = savedAccount || "dao.omniyield-vault.testnet";
        setIsConnected(true);
        setConnectedAccount(initialAccount);
        setConnectedWallet(savedProvider || "NEAR Testnet");

        // Seed from local storage if available
        try {
          const raw = localStorage.getItem(`omniyield_balances_${initialAccount}`);
          if (raw) {
            const b = JSON.parse(raw);
            if (b.omniUsdc) setOmniUsdcBalance(b.omniUsdc);
            if (b.nusd) setNusdBalance(b.nusd);
            if (typeof b.usdc === "number") setUsdcBalance(b.usdc);
          }
        } catch (_) {}

        refreshAllBalances(initialAccount);
      }
      const savedTheme = localStorage.getItem("omniyield_theme");
      if (savedTheme === "beige" || savedTheme === "dark") {
        setTheme(savedTheme as "beige" | "dark");
      }
      const savedLang = localStorage.getItem("omniyield_lang");
      if (savedLang === "en" || savedLang === "zh") {
        setLang(savedLang as "en" | "zh");
      }
    }
  }, []);

  // Poll for Multi-Sig Proposals (Scheme 3: In-App Live Breathing Red Badge)
  useEffect(() => {
    const checkProposals = () => {
      fetch("/api/proposals")
        .then((r) => r.json())
        .then((data) => {
          if (data && typeof data.pendingCount === "number") {
            setPendingProposalCount(data.pendingCount);
          }
        })
        .catch(() => {});
    };
    checkProposals();
    const interval = setInterval(checkProposals, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleConnect = (account: string, walletName: string, balance?: string) => {
    setIsConnected(true);
    setConnectedAccount(account);
    setConnectedWallet(walletName);
    if (balance) {
      setNearBalance(balance);
    }
    // Auto-align source and destination chain based on wallet provider
    if (walletName === "Phantom" || isSolanaAddress(account)) {
      setSourceChain("Solana");
      setDestChain("Solana");
    } else if (walletName === "MetaMask" || account.startsWith("0x")) {
      setSourceChain("Arbitrum");
      setDestChain("Arbitrum");
    }
    // Cleanly isolate previous state when switching accounts
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem(`omniyield_balances_${account}`);
      if (raw) {
        try {
          const b = JSON.parse(raw);
          setNusdBalance(b.nusd || "0.00");
          setOmniUsdcBalance(b.omniUsdc || "0.00");
          setUsdcBalance(typeof b.usdc === "number" ? b.usdc : (account.startsWith("0x") ? 0 : 8));
        } catch (_) {}
      } else {
        setNusdBalance("0.00");
        setOmniUsdcBalance("0.00");
        setUsdcBalance(account.startsWith("0x") ? 0 : 8);
      }
    }
    refreshAllBalances(account);
    if (!isInstitutional(account)) {
      setIsFlipped(false);
    }
    if (typeof window !== "undefined") {
      localStorage.setItem("omniyield_wallet_account", account);
      localStorage.setItem("omniyield_wallet_provider", walletName);
    }
    setLogs((prev) => [
      `[${new Date().toLocaleTimeString()}] 🔌 Web3 Wallet Connected: ${account} via ${walletName}.`,
      ...prev,
    ]);
  };

  const handleResetAccountBalances = async () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(`omniyield_balances_${connectedAccount}`);
    }
    setNusdBalance("0.00");
    setOmniUsdcBalance("0.00");
    try {
      await fetch(`/api/balances?account=${connectedAccount}&reset=true`);
    } catch (_) {}
    await refreshAllBalances(connectedAccount, { nusd: "0.00", omniUsdc: "0.00" });
    setLogs((prev) => [
      `[${new Date().toLocaleTimeString()}] 🧹 Balances and local storage reset to 0 for ${connectedAccount}.`,
      ...prev,
    ]);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setIsFlipped(false);
    if (typeof window !== "undefined") {
      localStorage.removeItem("omniyield_wallet_account");
      localStorage.removeItem("omniyield_wallet_provider");
    }
    setLogs((prev) => [
      `[${new Date().toLocaleTimeString()}] 🔌 Wallet Disconnected.`,
      ...prev,
    ]);
  };

  const isUserVip =
    (parseFloat(nusdBalance) || 0) > 0 ||
    (parseFloat(omniUsdcBalance) || 0) > 0 ||
    isInstitutional(connectedAccount);

  const [logs, setLogs] = useState<string[]>([
    "[03:10:02] OmniYield Motherboard initialized on NEAR. Listening to OmniSocket™ Registry...",
    "[03:10:15] Sockets Active: 3 Chain Sockets (Arb, Sol, Base) + 4 Yield Sockets (RHEA, Ondo USDY, Ondo QQQ, Gold).",
    "[03:11:15] Dual-Vault Matrix Active: GOSUN OmniYield USDC (11.84%) & GOSUN All-Weather RWA (16.40%).",
    "[03:11:16] Autonomous Supply Queue priority active: Saturated RHEA up to 70% Cap ($7,000,000).",
    "[03:12:40] De-peg Shield: Curve/Uniswap pool imbalance within 0.02% safety tolerance.",
    "[03:13:00] Open Architecture: Monad & Sui Sockets ready for permissionless community plugging.",
    "[04:50:00] Protocol Security Matrix Active: Curator (Gosun Labs) + Guardian (Security Council Veto) + 24h Timelock.",
    "[05:31:26] 🚀 Contract deployed to NEAR Testnet: omniyield-vault.testnet (Tx: DR18F2u8...)",
    "[05:31:46] ✅ State Initialized: new() executed. Dual Queues, Sockets & 24h Timelock active.",
    "[07:20:02] 🏛️ Multi-Sig Contract Deployed to dao.omniyield-vault.testnet (Tx: DKsz7myS...)",
    "[07:21:51] 🗳️ Multi-Sig Council Initialized: 4 Core Council Entities with threshold confirmation.",
    "[07:24:42] ⚡ Multi-Sig Proposal #0 Executed On-Chain: Cross-contract timelock hardening confirmed.",
    "[22:30:10] 📈 All-Weather Sockets deployed: stocks.omniyield-vault.testnet & gold.omniyield-vault.testnet.",
  ]);

  const handleProposeCapIncrease = () => {
    setTimelockPending(true);
    setLogs((prev) => [
      `[${new Date().toLocaleTimeString()}] Curator Proposal: Proposed RHEA Lending cap increase $7,000,000 -> $10,000,000.`,
      `[${new Date().toLocaleTimeString()}] Security Timelock Enforced: 24h delay window opened. Guardian VETO available.`,
      ...prev,
    ]);
  };

  const handleApplyCapChange = (e: React.FormEvent) => {
    e.preventDefault();
    const newCap = Number(capInputValue);
    if (isNaN(newCap) || newCap < 0) {
      alert("Please enter a valid cap amount.");
      return;
    }

    const currentCap = capModalMarket === "rhea-lending" ? rheaCap : ondoCap;
    const marketName = capModalMarket === "rhea-lending" ? "RHEA Lending Pool" : "Ondo US Treasuries";

    if (newCap > currentCap) {
      setTimelockPending(true);
      if (capModalMarket === "rhea-lending") {
        setRheaCap(newCap);
      } else {
        setOndoCap(newCap);
      }
      setLogs((prev) => [
        `[${new Date().toLocaleTimeString()}] ⏳ CURATOR PROPOSAL: Proposed ${marketName} cap expansion: $${currentCap.toLocaleString()} ➔ $${newCap.toLocaleString()}.`,
        `[${new Date().toLocaleTimeString()}] 🛡️ 24h Timelock Enforced: Depositors free to exit unconditionally. Guardian VETO window open.`,
        ...prev,
      ]);
    } else {
      if (capModalMarket === "rhea-lending") {
        setRheaCap(newCap);
      } else {
        setOndoCap(newCap);
      }
      setLogs((prev) => [
        `[${new Date().toLocaleTimeString()}] ⚡ CURATOR INSTANT ACTION: ${marketName} supply cap reduced to $${newCap.toLocaleString()} (0s risk containment).`,
        ...prev,
      ]);
    }

    setIsCapModalOpen(false);
  };

  const handleGuardianVeto = () => {
    setTimelockPending(false);
    setLogs((prev) => [
      `[${new Date().toLocaleTimeString()}] 🚨 GUARDIAN VETO TRIGGERED: Cap increase rejected by security council. Cap reverted to $7,000,000.`,
      ...prev,
    ]);
  };

  const handleExecuteCapIncrease = () => {
    setTimelockPending(false);
    setRheaCap(10000000);
    setLogs((prev) => [
      `[${new Date().toLocaleTimeString()}] Timelock Elapsed: Proposed RHEA cap increase executed. New active cap: $10,000,000.`,
      ...prev,
    ]);
  };

  const handleToggleCircuitBreaker = () => {
    const nextState = !circuitBreakerActive;
    setCircuitBreakerActive(nextState);
    if (nextState) {
      setLogs((prev) => [
        `[${new Date().toLocaleTimeString()}] ⚠️ EMERGENCY CIRCUIT BREAKER ACTIVATED by Guardian. RHEA Lending market paused. Cap set to 0.`,
        ...prev,
      ]);
    } else {
      setLogs((prev) => [
        `[${new Date().toLocaleTimeString()}] Circuit Breaker cleared by Curator. RHEA Lending market resumed.`,
        ...prev,
      ]);
    }
  };

  const currentReceiptToken = activeVault === "all-weather" ? "OmniUSDC" : "NUSD";
  const currentSharePrice = activeVault === "all-weather" ? 1.0628 : 1.0482;
  const currentVaultBalance = activeVault === "all-weather" ? omniUsdcBalance : nusdBalance;

  const handleAction = async () => {
    const numAmount = Number(amount) || 0;
    if (numAmount <= 0) return;

    if (activeTab === "deposit") {
      if (numAmount > usdcBalance) {
        const chainName = connectedAccount.startsWith("0x") ? sourceChain : "NEAR Testnet";
        alert(`Insufficient USDC balance! You have ${usdcBalance.toLocaleString()} USDC on ${chainName}. Use the faucet button (+20 USDC) to top up!`);
        return;
      }
    } else {
      const numHoldings = Number(currentVaultBalance) || 0;
      if (numAmount > numHoldings) {
        alert(`Insufficient ${currentReceiptToken} holdings to withdraw! You have ${numHoldings.toFixed(2)} ${currentReceiptToken}.`);
        return;
      }
    }

    setIsProcessing(true);
    setTxSuccess(false);
    setLastTxHash(null);
    setLastTxUrl(null);

    try {
      let txResult: any = null;

      // 1. If connected with MetaMask, trigger real EIP-712 personal_sign
      if (connectedAccount.startsWith("0x") || connectedWallet === "MetaMask") {
        const ethereum = typeof window !== "undefined" ? (window as any).ethereum : null;
        if (!ethereum) {
          throw new Error("MetaMask is not detected in your browser!");
        }

        const intentMsg = `OmniYield Cross-Chain Liquidity Intent\n\n` +
          `Action: Deposit to NEAR Meta-Vault\n` +
          `Source Chain: ${sourceChain}\n` +
          `Deposit: ${numAmount} USDC\n` +
          `Target Vault: omniyield-vault.testnet (${activeVault === "all-weather" ? "All-Weather RWA" : "USDC Yield"})\n` +
          `Expected Output: ~${(numAmount / currentSharePrice).toFixed(2)} ${currentReceiptToken}\n` +
          `Settlement: NEAR Intents (Fast Finality)\n` +
          `Signer: ${connectedAccount}\n` +
          `Nonce: ${Date.now()}`;

        const signature = await ethereum.request({
          method: "personal_sign",
          params: [intentMsg, connectedAccount],
        });

        const res = await fetch("/api/transact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            accountId: connectedAccount,
            action: activeTab,
            amount: numAmount,
            originChain: sourceChain,
            destChain: destChain,
            recipientAddress: recipientAddress.trim(),
            vault: activeVault,
            intentSignature: signature,
          }),
        });
        const data = await res.json();
        if (!res.ok || data.error) {
          throw new Error(data.error || "Solver settlement failed");
        }
        txResult = {
          ...data,
          metaMaskSignature: signature,
        };
      } else if (connectedWallet === "Phantom" || isSolanaAddress(connectedAccount)) {
        const solana = typeof window !== "undefined" ? (window as any).solana : null;
        let solSignature = "";
        if (solana && solana.isPhantom) {
          try {
            const intentMsg = new TextEncoder().encode(
              `OmniYield Cross-Chain Liquidity Intent\n\n` +
              `Action: Deposit to NEAR Meta-Vault\n` +
              `Source Chain: Solana\n` +
              `Deposit: ${numAmount} USDC\n` +
              `Target Vault: omniyield-vault.testnet (${activeVault === "all-weather" ? "All-Weather RWA" : "USDC Yield"})\n` +
              `Expected Output: ~${(numAmount / currentSharePrice).toFixed(2)} ${currentReceiptToken}\n` +
              `Signer: ${connectedAccount}\n` +
              `Nonce: ${Date.now()}`
            );
            const signed = await solana.signMessage(intentMsg, "utf8");
            const sigBytes = signed.signature || signed;
            solSignature = Array.from(sigBytes).map((b: any) => b.toString(16).padStart(2, "0")).join("");
          } catch (solErr: any) {
            console.warn("Phantom sign rejected or bypassed:", solErr);
          }
        }

        const res = await fetch("/api/transact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            accountId: connectedAccount,
            action: activeTab,
            amount: numAmount,
            originChain: "Solana",
            destChain: destChain,
            recipientAddress: recipientAddress.trim(),
            vault: activeVault,
            intentSignature: solSignature,
          }),
        });
        const data = await res.json();
        if (!res.ok || data.error) {
          throw new Error(data.error || "Solver settlement failed");
        }
        txResult = {
          ...data,
          phantomSignature: solSignature,
        };
      }

      // 2. Direct On-Chain Signer via /api/transact
      if (!txResult || !(txResult.txHash || txResult.transaction?.hash)) {
        const res = await fetch("/api/transact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            accountId: connectedAccount,
            action: activeTab,
            amount: numAmount,
            originChain: sourceChain,
            destChain: destChain,
            recipientAddress: recipientAddress.trim(),
            vault: activeVault,
          }),
        });
        const data = await res.json();
        if (!res.ok || data.error) {
          throw new Error(data.error || "Transaction failed");
        }
        txResult = data;
      }

      if (txResult.originProof) {
        setCrosschainProof({
          txHash: txResult.originProof.txHash,
          explorerUrl: txResult.originProof.explorerUrl,
          chain: sourceChain,
          action: "deposit",
        });
      } else if (txResult.destProof) {
        setCrosschainProof({
          txHash: txResult.destProof.txHash,
          explorerUrl: txResult.destProof.explorerUrl,
          chain: destChain,
          payoutAmount: txResult.payoutAmountUsdc,
          action: "withdraw",
        });
      }

      const txHash = txResult.txHash || txResult.nearTxHash || txResult.transaction?.hash || txResult.transaction_outcome?.id || "confirmed";
      const txUrl = txResult.nearblocksUrl || `https://testnet.nearblocks.io/txns/${txHash}`;

      setLastTxHash(txHash);
      setLastTxUrl(txUrl);
      setTxSuccess(true);

      const actionDesc = txResult.metaMaskSignature
        ? `🦊 MetaMask Intent Signed & Settled: ${numAmount} USDC from ${sourceChain} -> Minted ${currentReceiptToken}`
        : txResult.phantomSignature
        ? `⚡ Phantom Intent Signed & Settled: ${numAmount} USDC from Solana -> Minted ${currentReceiptToken}`
        : activeTab === "deposit"
        ? `Deposited ${numAmount} USDC from ${sourceChain} -> Minted ${currentReceiptToken}`
        : `Withdrew ${numAmount} ${currentReceiptToken} -> Redeemed USDC to ${destChain}`;

      setLogs((prev) => [
        `[${new Date().toLocaleTimeString()}] 🚀 ON-CHAIN TRANSACTION CONFIRMED: ${actionDesc} on NEAR Testnet!`,
        ...(txResult.metaMaskSignature ? [`[${new Date().toLocaleTimeString()}] 🦊 MetaMask Sig: ${txResult.metaMaskSignature.slice(0, 24)}... (Verified Intent)`] : []),
        ...(txResult.phantomSignature ? [`[${new Date().toLocaleTimeString()}] ⚡ Phantom Sig: ${txResult.phantomSignature.slice(0, 24)}... (Verified Solana Intent)`] : []),
        `[${new Date().toLocaleTimeString()}] 🔗 NearBlocks Explorer: ${txUrl}`,
        `[${new Date().toLocaleTimeString()}] ⚡ ${activeVault === "all-weather" ? "All-Weather 4-Pillar Parity Sockets Active" : "70% RHEA Lending + 30% Ondo USDY Buffer"}`,
        ...prev,
      ]);

      let nextOmni = omniUsdcBalance;
      let nextNusd = nusdBalance;
      let nextUsdc = usdcBalance;

      if (activeVault === "all-weather") {
        if (activeTab === "deposit") {
          const expectedShares = (numAmount / currentSharePrice).toFixed(2);
          nextOmni = (Number(omniUsdcBalance) + Number(expectedShares)).toFixed(2);
          nextUsdc = Math.max(0, usdcBalance - numAmount);
        } else {
          nextOmni = Math.max(0, Number(omniUsdcBalance) - numAmount).toFixed(2);
          nextUsdc = usdcBalance + numAmount;
        }
        setOmniUsdcBalance(nextOmni);
        setUsdcBalance(nextUsdc);
      } else {
        if (activeTab === "deposit") {
          const expectedShares = (numAmount / currentSharePrice).toFixed(2);
          nextNusd = (Number(nusdBalance) + Number(expectedShares)).toFixed(2);
          nextUsdc = Math.max(0, usdcBalance - numAmount);
        } else {
          nextNusd = Math.max(0, Number(nusdBalance) - numAmount).toFixed(2);
          nextUsdc = usdcBalance + numAmount;
        }
        setNusdBalance(nextNusd);
        setUsdcBalance(nextUsdc);
      }

      if (typeof window !== "undefined") {
        localStorage.setItem(
          `omniyield_balances_${connectedAccount}`,
          JSON.stringify({
            nusd: nextNusd,
            omniUsdc: nextOmni,
            usdc: nextUsdc,
            updatedAt: Date.now(),
          })
        );
      }

      await refreshAllBalances(connectedAccount, {
        nusd: nextNusd,
        omniUsdc: nextOmni,
        usdc: nextUsdc,
      });
    } catch (err: any) {
      alert(`Transaction Error: ${err.message}`);
      setLogs((prev) => [
        `[${new Date().toLocaleTimeString()}] ❌ Transaction Failed: ${err.message}`,
        ...prev,
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-row ${theme === "beige" ? "theme-warm-beige" : "bg-slate-950 text-slate-100"} transition-colors duration-300`}>
      {/* 1. Rhea Finance / X / Gemini Style Left Sidebar */}
      <AppSidebar
        activeNav={activeNav}
        onSelectNav={(tab) => {
          setActiveNav(tab);
        }}
        activeVault={activeVault}
        onSelectVault={(v) => {
          setActiveVault(v);
          setActiveNav("vaults");
        }}
        isFlipped={isFlipped}
        onToggleFlip={() => setIsFlipped(!isFlipped)}
        connectedAccount={connectedAccount}
        connectedWallet={connectedWallet}
        nearBalance={nearBalance}
        usdcBalance={usdcBalance}
        nusdBalance={nusdBalance}
        omniUsdcBalance={omniUsdcBalance}
        pendingProposalCount={pendingProposalCount}
        onOpenWalletModal={() => setIsWalletModalOpen(true)}
        onOpenAccountDrawer={() => setIsAccountDrawerOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        lang={lang}
        theme={theme}
        activeBacksideNav={activeBacksideNav}
        onSelectBacksideNav={setActiveBacksideNav}
      />

      {/* 2. Main Workstation Area */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        {/* Top Lightweight Header Bar */}
        <header
          className={`border-b sticky top-0 z-30 shadow-sm backdrop-blur-md transition-colors ${
            theme === "beige"
              ? "bg-[#f8f5ee]/95 border-[#dfd2be] text-[#171d26]"
              : "border-slate-800/80 bg-slate-950/90 text-slate-100"
          }`}
        >
          <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
            {/* Left: View Breadcrumb */}
            <div className="flex items-center space-x-2 text-xs font-mono">
              <span className={theme === "beige" ? "text-slate-500 font-semibold" : "text-slate-400"}>OmniYield</span>
              <span className={theme === "beige" ? "text-slate-400" : "text-slate-600"}>/</span>
              <span
                className={`font-bold uppercase tracking-wider ${
                  theme === "beige" ? "text-emerald-700 font-black" : "text-emerald-400"
                }`}
              >
                {isFlipped
                  ? (lang === "zh" ? "机构治理多签安全舱" : "GOVERNANCE SAFE")
                  : activeNav === "exchange"
                  ? (lang === "zh" ? "链间闪兑" : "EXCHANGE")
                  : activeNav === "portfolio"
                  ? (lang === "zh" ? "我的投资组合" : "MY PORTFOLIO")
                  : activeNav === "ai-copilot"
                  ? "NEAR AI COPILOT"
                  : activeNav === "markets"
                  ? (lang === "zh" ? "市场行情" : "YIELD MARKETS")
                  : activeVault === "all-weather"
                  ? "ALL-WEATHER RWA"
                  : "NUSD CORE VAULT"}
              </span>
            </div>

            {/* Right: Actions, Multi-Sig Safe Button, Explorer & Theme - Standardized h-9 and rounded-xl */}
            <div className="flex items-center space-x-2.5 text-xs">
              {/* Multi-Sig Safe Toggle with Breathing Red Badge */}
              <button
                type="button"
                onClick={() => setIsFlipped(!isFlipped)}
                className={`h-9 flex items-center space-x-1.5 px-3 rounded-xl border transition font-mono cursor-pointer ${
                  pendingProposalCount > 0
                    ? "bg-rose-500/15 border-rose-500/50 text-rose-300 animate-pulse shadow-md shadow-rose-500/20"
                    : "btn-secondary text-xs"
                }`}
                title="Toggle Governance Safe Backside"
              >
                {pendingProposalCount > 0 ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                    <span className="font-bold text-rose-500">
                      {lang === "zh" ? `${pendingProposalCount} 笔多签待审` : `${pendingProposalCount} Pending`}
                    </span>
                  </>
                ) : isFlipped ? (
                  <>
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{lang === "zh" ? "翻回前台" : "Front"}</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{lang === "zh" ? "机构安全舱" : "Safe"}</span>
                  </>
                )}
              </button>

              <a
                href="https://testnet.nearblocks.io/address/omniyield-vault.testnet"
                target="_blank"
                rel="noreferrer"
                className={`h-9 hidden md:flex items-center space-x-1.5 px-3 rounded-xl border transition font-mono ${
                  theme === "beige"
                    ? "text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border-emerald-300 shadow-sm font-semibold"
                    : "text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30"
                }`}
              >
                <span className={`w-2 h-2 rounded-full animate-pulse ${theme === "beige" ? "bg-emerald-600" : "bg-emerald-400"}`}></span>
                <span>omniyield-vault.testnet</span>
                <ExternalLink className="w-3 h-3 ml-0.5" />
              </a>

              {/* Theme & Language Controls - Precisely calibrated to h-9 */}
              <div
                className={`h-9 flex items-center px-1.5 rounded-xl border space-x-1 shadow-sm transition-colors ${
                  theme === "beige" ? "bg-white border-[#dfd2be]" : "bg-slate-900 border-slate-800"
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleTheme("dark")}
                  className={`h-7 w-7 rounded-lg flex items-center justify-center transition cursor-pointer ${
                    theme === "dark"
                      ? "bg-slate-800 text-cyan-400 shadow-sm"
                      : theme === "beige"
                      ? "text-slate-400 hover:text-slate-700"
                      : "text-slate-400 hover:text-white"
                  }`}
                  title="Dark Theme"
                >
                  <Moon className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => toggleTheme("beige")}
                  className={`h-7 w-7 rounded-lg flex items-center justify-center transition cursor-pointer ${
                    theme === "beige"
                      ? "bg-[#ece3d3] text-[#171d26] shadow-sm font-bold"
                      : "text-slate-400 hover:text-amber-400"
                  }`}
                  title="Beige Theme"
                >
                  <Sun className="w-3.5 h-3.5" />
                </button>
                <span className={`text-xs select-none ${theme === "beige" ? "text-slate-300" : "text-slate-700"}`}>|</span>
                <button
                  type="button"
                  onClick={() => toggleLang(lang === "en" ? "zh" : "en")}
                  className={`h-7 px-2 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center space-x-1 ${
                    lang === "zh"
                      ? theme === "beige"
                        ? "bg-[#ece3d3] text-emerald-800 font-bold shadow-sm"
                        : "bg-slate-800 text-emerald-400 font-bold shadow-sm"
                      : theme === "beige"
                      ? "text-slate-500 hover:text-slate-800"
                      : "text-slate-400 hover:text-white"
                  }`}
                  title="Toggle Language"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-mono">{lang === "en" ? "EN" : "简"}</span>
                </button>
              </div>

              {/* Connected Wallet Pill - Standardized h-9 and inner ring */}
              {!isConnected ? (
                <button
                  type="button"
                  onClick={() => setIsWalletModalOpen(true)}
                  className="h-9 px-3.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-cyan-500 hover:opacity-95 text-black shadow-md shadow-emerald-500/20 transition flex items-center space-x-1.5 animate-pulse cursor-pointer"
                >
                  <Wallet className="w-3.5 h-3.5" />
                  <span>{lang === "zh" ? "连接钱包" : "Connect"}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsAccountDrawerOpen(true)}
                  className="h-9 px-3 rounded-xl text-xs font-semibold border transition flex items-center space-x-1.5 group cursor-pointer card-surface"
                  title={isUserVip ? "VIP 1 Client Verified" : "Account Balances"}
                >
                  <GovernanceIcon name="dao" className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="font-mono text-xs font-bold leading-none">
                    {connectedAccount.length > 16 ? `${connectedAccount.slice(0, 6)}...${connectedAccount.slice(-4)}` : connectedAccount}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-white" />
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Main Content Container */}
        <main className="max-w-7xl mx-auto px-6 pt-6 flex-1 w-full">
        {/* 3D Perspective Flip Container - perspective only active during flip transition to maintain sticky positioning */}
        <div className={isFlipped ? "perspective-1200" : ""}>
          <div className={isFlipped ? "transition-all duration-700 transform-style-3d rotate-y-180" : ""}>
            {/* FRONT FACE: Public Investor & Yield Experience */}
            <div className={isFlipped ? "hidden" : "block"}>
              {activeNav === "exchange" ? (
                <ExchangeView
                  connectedAccount={connectedAccount}
                  usdcBalance={usdcBalance}
                  nearBalance={nearBalance}
                  nusdBalance={nusdBalance}
                  omniUsdcBalance={omniUsdcBalance}
                  onRefreshBalances={() => refreshAllBalances(connectedAccount)}
                  lang={lang}
                  theme={theme}
                />
              ) : activeNav === "portfolio" ? (
                <PortfolioView
                  connectedAccount={connectedAccount}
                  nusdBalance={nusdBalance}
                  omniUsdcBalance={omniUsdcBalance}
                  usdcBalance={usdcBalance}
                  nearBalance={nearBalance}
                  onNavigateToVault={(vault, tab) => {
                    setActiveVault(vault);
                    if (tab) setActiveTab(tab);
                    setActiveNav("vaults");
                  }}
                  lang={lang}
                  theme={theme}
                />
              ) : activeNav === "ai-copilot" ? (
                <NearAICopilot
                  onNavigateToVault={(vault) => {
                    setActiveVault(vault);
                    setActiveNav("vaults");
                  }}
                  connectedAccount={connectedAccount}
                  usdcBalance={usdcBalance}
                  nusdBalance={nusdBalance}
                  omniUsdcBalance={omniUsdcBalance}
                  nearBalance={nearBalance}
                  onBalanceUpdate={(vault, amount) => {
                    let nextOmni = omniUsdcBalance;
                    let nextNusd = nusdBalance;
                    const nextUsdc = Math.max(0, usdcBalance - amount);

                    if (vault === "all-weather") {
                      nextOmni = (Number(omniUsdcBalance) + amount).toFixed(2);
                      setOmniUsdcBalance(nextOmni);
                    } else {
                      nextNusd = (Number(nusdBalance) + amount).toFixed(2);
                      setNusdBalance(nextNusd);
                    }
                    setUsdcBalance(nextUsdc);

                    if (typeof window !== "undefined") {
                      localStorage.setItem(
                        `omniyield_balances_${connectedAccount}`,
                        JSON.stringify({
                          nusd: nextNusd,
                          omniUsdc: nextOmni,
                          usdc: nextUsdc,
                          updatedAt: Date.now(),
                        })
                      );
                    }

                    refreshAllBalances(connectedAccount, {
                      nusd: nextNusd,
                      omniUsdc: nextOmni,
                      usdc: nextUsdc,
                    });
                  }}
                  onRefreshBalances={() => refreshAllBalances(connectedAccount)}
                  onLog={(msg) => setLogs((prev) => [msg, ...prev])}
                  lang={lang}
                  theme={theme}
                />
              ) : activeNav === "markets" ? (
                <MarketsView
                  connectedAccount={connectedAccount}
                  usdcBalance={usdcBalance}
                  nearBalance={nearBalance}
                  onTradeSuccess={() => refreshAllBalances(connectedAccount)}
                  lang={lang}
                  theme={theme}
                />
              ) : (
                <>
                  {/* Morpho Two-Column Master Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12 items-start">
              
              {/* LEFT COLUMN: Hero Section & Historical Performance (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                {/* Vault Title & Metadata Badges Row */}
                <div>
                  <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white mb-3">
                    {activeVault === "all-weather" ? "GOSUN All-Weather RWA" : "GOSUN OmniYield USDC"}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
                    <a
                      href="https://testnet.nearblocks.io/address/omniyield-vault.testnet"
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center space-x-1 px-2.5 py-1 rounded-md bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white transition font-mono"
                    >
                      <span>omniyield-vault.testnet</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>
                    <span className="px-2.5 py-1 rounded-md bg-slate-900/80 border border-slate-800 text-slate-300 flex items-center space-x-1.5">
                      <span className={`w-2 h-2 rounded-sm ${activeVault === "all-weather" ? "bg-cyan-400" : "bg-emerald-400"}`}></span>
                      <span>{activeVault === "all-weather" ? "Macro Risk Parity" : "ERC-4626 / NEP-141"}</span>
                    </span>
                    <span className="px-2.5 py-1 rounded-md bg-slate-900/80 border border-slate-800 text-slate-300 flex items-center space-x-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      <span>{activeVault === "all-weather" ? "Bridgewater Standard" : "Curator: Gosun Labs"}</span>
                    </span>
                    <span className="px-2.5 py-1 rounded-md bg-slate-900/80 border border-slate-800 text-slate-300 flex items-center space-x-1 font-mono">
                      <span className="font-bold text-emerald-400">$</span>
                      <span>{activeVault === "all-weather" ? "USDC / Equity / Gold" : "USDC"}</span>
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-3 leading-relaxed">
                    {activeVault === "all-weather"
                      ? (lang === "zh"
                          ? "基于桥水瑞·达里奥全天候宏观对冲模型。聚合代币化美股科技 (Nasdaq 100 QQQ)、短期美债 (Ondo USDY)、实物黄金 (PAXG) 与 Web3 借贷利差 (RHEA)，跨周期对冲平抑波动，追求高夏普比率资本增值。"
                          : "Ray Dalio Bridgewater Macro Risk Parity Vault. Tokenized US Equities (Nasdaq 100 QQQ), US Treasuries (Ondo USDY), Physical Gold (PAXG), and Web3 Lending (RHEA) dynamic multi-asset rebalancing.")
                      : (lang === "zh"
                          ? "OmniYield 智能元金库通过在 RHEA 隔离借贷池 (70%) 与 Ondo 美债 RWA 储备池 (30%) 之间动态路由资金，实现全自动复利收益最大化与 100% 稳定币本金保全。"
                          : "OmniYield Meta-Vault autonomously optimizes compound yield by dynamically routing capital between RHEA isolated lending pools (70%) and Ondo US Treasury RWA reserves (30%).")}
                  </p>
                </div>

                {/* Chamber 3-Card Macro Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Card 1: Value Managed */}
                  <div className="card-surface rounded-2xl p-5 border shadow-sm space-y-1">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                      {lang === "zh" ? "金库管理总规模 (AUM)" : "Value Managed"}
                    </span>
                    <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                      {activeVault === "all-weather" ? "$8.60M" : "$12.45M"}
                    </div>
                    <div className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold flex items-center pt-1">
                      <TrendingUp className="w-3.5 h-3.5 mr-1" />
                      <span>{lang === "zh" ? "+$120万 / 24小时" : "+$1.2M in 24h"}</span>
                    </div>
                  </div>

                  {/* Card 2: Net APY */}
                  <div className="card-surface rounded-2xl p-5 border shadow-sm space-y-1">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                      {lang === "zh" ? "综合净年化 (Net APY)" : "1M Return (APY)"}
                    </span>
                    <div className="text-2xl sm:text-3xl font-black text-emerald-700 dark:text-emerald-400 tracking-tight">
                      {activeVault === "all-weather" ? "16.40%" : "11.84%"}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 font-medium pt-1">
                      {activeVault === "all-weather"
                        ? (lang === "zh" ? "桥水宏观四维平价" : "Macro Risk Parity")
                        : (lang === "zh" ? "动态供给最优路由" : "Dynamic Queue Optimized")}
                    </div>
                  </div>

                  {/* Card 3: Instant Liquidity Buffer */}
                  <div className="card-surface rounded-2xl p-5 border shadow-sm space-y-1">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                      {lang === "zh" ? "极速提现缓冲 (Buffer)" : "Liquidity Buffer"}
                    </span>
                    <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                      {activeVault === "all-weather" ? "$3.44M" : "$5.45M"}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 font-medium pt-1">
                      {activeVault === "all-weather"
                        ? (lang === "zh" ? "40% Ondo 美债底仓" : "40% Ondo USDY Anchor")
                        : (lang === "zh" ? "30% Ondo 美债储备" : "30% Ondo RWA Reserve")}
                    </div>
                  </div>
                </div>

                {/* Chamber-Style Your Stats Card Group */}
                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
                      <Wallet className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      <span>{lang === "zh" ? "我的金库持仓明细 (Your Stats)" : "Your Stats"}</span>
                    </h3>
                    <span className="text-[11px] font-mono text-slate-500">
                      {isConnected ? `${connectedAccount.slice(0, 10)}...` : (lang === "zh" ? "未连接钱包" : "Not Connected")}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Your Balance */}
                    <div className="card-surface rounded-2xl p-4 border shadow-sm space-y-0.5">
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block">
                        {lang === "zh" ? "持仓总市值 (Balance)" : "Your Balance"}
                      </span>
                      <div className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                        ${(Number(activeVault === "all-weather" ? omniUsdcBalance : nusdBalance || 0) * currentSharePrice).toFixed(2)}
                      </div>
                      <span className="text-[11px] text-slate-500 block font-mono">
                        ~{Number(activeVault === "all-weather" ? omniUsdcBalance : nusdBalance || 0).toFixed(2)} {currentReceiptToken}
                      </span>
                    </div>

                    {/* PNL / Yield */}
                    <div className="card-surface rounded-2xl p-4 border shadow-sm space-y-0.5">
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block">
                        {lang === "zh" ? "实时复利年化 (PNL)" : "PNL (Net APY)"}
                      </span>
                      <div className="text-xl font-bold font-mono text-emerald-700 dark:text-emerald-400">
                        +{activeVault === "all-weather" ? "16.40%" : "11.84%"}
                      </div>
                      <span className="text-[11px] text-emerald-700 dark:text-emerald-400 block font-medium">
                        {lang === "zh" ? "自动每日复利增厚" : "Compounding Daily"}
                      </span>
                    </div>

                    {/* Your Shares */}
                    <div className="card-surface rounded-2xl p-4 border shadow-sm space-y-0.5">
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block">
                        {lang === "zh" ? "持有金库份额 (Shares)" : "Your Shares"}
                      </span>
                      <div className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                        {Number(activeVault === "all-weather" ? omniUsdcBalance : nusdBalance || 0).toFixed(4)}
                      </div>
                      <span className="text-[11px] text-slate-500 block font-mono">
                        NAV: ${currentSharePrice.toFixed(4)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Historical Performance Curve */}
                <PerformanceChart lang={lang} vaultType={activeVault} theme={theme} />

                {/* Underlying Allocation & Risk Parity Matrix Card */}
                <div className="card-surface rounded-2xl p-6 border shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800/80">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                      <Layers className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                      <span>{lang === "zh" ? "底层配置矩阵与风险平价穿透" : "Underlying Allocation & Risk Parity Matrix"}</span>
                    </h3>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-semibold font-mono border border-emerald-500/20">
                      {lang === "zh" ? "实时调仓已激活" : "Live Rebalancing Active"}
                    </span>
                  </div>

                  {activeVault === "all-weather" ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="well-inset p-3 rounded-xl border space-y-1">
                        <span className="text-slate-500 block font-medium">{lang === "zh" ? "短期美债 (Ondo USDY)" : "US Treasuries (USDY)"}</span>
                        <div className="text-lg font-bold font-mono text-slate-900 dark:text-white">40.0%</div>
                        <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">5.10% APY Anchor</span>
                      </div>
                      <div className="well-inset p-3 rounded-xl border space-y-1">
                        <span className="text-slate-500 block font-medium">{lang === "zh" ? "纳指科技 (Nasdaq QQQ)" : "US Tech Equity (QQQ)"}</span>
                        <div className="text-lg font-bold font-mono text-slate-900 dark:text-white">25.0%</div>
                        <span className="text-[11px] text-cyan-600 dark:text-cyan-400 font-semibold">Bull Beta Spread</span>
                      </div>
                      <div className="well-inset p-3 rounded-xl border space-y-1">
                        <span className="text-slate-500 block font-medium">{lang === "zh" ? "实物黄金 (PAXG Gold)" : "Physical Gold (PAXG)"}</span>
                        <div className="text-lg font-bold font-mono text-slate-900 dark:text-white">15.0%</div>
                        <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">Inflation Hedge</span>
                      </div>
                      <div className="well-inset p-3 rounded-xl border space-y-1">
                        <span className="text-slate-500 block font-medium">{lang === "zh" ? "浮动借贷 (RHEA Lending)" : "Web3 Lending (RHEA)"}</span>
                        <div className="text-lg font-bold font-mono text-slate-900 dark:text-white">20.0%</div>
                        <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">13.88% Utilization</span>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="well-inset p-4 rounded-xl border space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500 font-medium">{lang === "zh" ? "RHEA 隔离借贷资金池" : "RHEA Isolated Lending Pool"}</span>
                          <span className="text-emerald-700 dark:text-emerald-400 font-mono font-bold">13.88% APR</span>
                        </div>
                        <div className="text-xl font-bold font-mono text-slate-900 dark:text-white">70.0% Allocation</div>
                        <p className="text-[11px] text-slate-500 leading-tight">
                          {lang === "zh" ? "无坏账抵押清算机制，高借款需求驱动稳定借贷复利增厚。" : "Over-collateralized borrowing pool capturing premium Web3 borrowing demand."}
                        </p>
                      </div>
                      <div className="well-inset p-4 rounded-xl border space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500 font-medium">{lang === "zh" ? "Ondo 美债 RWA 现金底垫" : "Ondo US Treasury RWA Reserve"}</span>
                          <span className="text-emerald-700 dark:text-emerald-400 font-mono font-bold">5.10% APY</span>
                        </div>
                        <div className="text-xl font-bold font-mono text-slate-900 dark:text-white">30.0% Allocation</div>
                        <p className="text-[11px] text-slate-500 leading-tight">
                          {lang === "zh" ? "提供即刻零滑点 T+0 提现流动性，全天候保本并平抑波动。" : "Provides instant T+0 exit liquidity buffer and short-term US sovereign yield."}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Chamber 5-Tab Public Ledger: Depositors / Activity / Deposits / Withdrawals / Stats */}
                <VaultLedgerTabs
                  vaultType={activeVault}
                  lang={lang}
                  theme={theme}
                  currentSharePrice={currentSharePrice}
                  userShares={parseFloat(activeVault === "all-weather" ? omniUsdcBalance : nusdBalance) || 0}
                  connectedAccount={connectedAccount}
                />
              </div>

              {/* RIGHT COLUMN: Interactive Deposit / Withdraw Card - Chamber-Style Sticky Dock */}
              <div className="lg:col-span-5 card-surface rounded-2xl p-6 shadow-xl border sticky top-24 self-start">
                <div className="flex rounded-xl well-inset p-1 mb-6 border">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("deposit");
                      setTxSuccess(false);
                    }}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition cursor-pointer ${
                      activeTab === "deposit"
                        ? "item-selected shadow-md"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {lang === "zh" ? "一键存入" : "1-Click Deposit"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("withdraw");
                      setTxSuccess(false);
                    }}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition cursor-pointer ${
                      activeTab === "withdraw"
                        ? "item-selected shadow-md"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {lang === "zh" ? "极速取回" : "Instant Withdraw"}
                  </button>
                </div>

                {activeTab === "deposit" ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-400 block mb-2">
                        {lang === "zh" ? "跨链资产来源 (支持任意公链直接存入)" : "Source Blockchain (Deposit from Any Chain)"}
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {["Arbitrum", "Solana", "Base", "NEAR"].map((chain) => (
                          <button
                            key={chain}
                            type="button"
                            onClick={() => {
                              setSourceChain(chain);
                              refreshAllBalances(connectedAccount, undefined, chain);
                            }}
                            className={`py-2 text-xs font-semibold rounded-xl border transition cursor-pointer ${
                              sourceChain === chain
                                ? "item-selected shadow-sm"
                                : "well-inset text-slate-700 dark:text-slate-400 hover:border-slate-400"
                            }`}
                          >
                            {chain}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center text-xs font-semibold text-slate-400 mb-2">
                        <span>{lang === "zh" ? "存入金额" : "Deposit Amount"}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-slate-300">
                            {lang === "zh" ? "可用余额:" : "Balance:"}{" "}
                            <span className="text-emerald-400 font-mono font-bold">{usdcBalance.toLocaleString()}</span> USDC
                          </span>
                          <button
                            type="button"
                            onClick={() => refreshAllBalances()}
                            className="p-1 rounded text-slate-400 hover:text-white transition cursor-pointer"
                            title="Sync with on-chain blockchain RPC"
                          >
                            <ArrowRightLeft className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={handleClaimFaucet}
                            className="px-2 py-0.5 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold transition flex items-center cursor-pointer"
                            title="Claim 20 Test USDC from Faucet"
                          >
                            <Sparkles className="w-3 h-3 mr-1" />
                            <span>+20 USDC</span>
                          </button>
                          <a
                            href="https://faucet.circle.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2 py-0.5 rounded bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-[11px] font-bold transition flex items-center cursor-pointer"
                            title="Circle Official Testnet Faucet (faucet.circle.com)"
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            <span>{lang === "zh" ? "Circle 领水 ↗" : "Circle Faucet ↗"}</span>
                          </a>
                        </div>
                      </div>
                      <div className="flex items-center rounded-xl well-inset p-2 border focus-within:border-emerald-500 transition">
                        <input
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="bg-transparent flex-1 min-w-0 px-3 text-xl font-bold focus:outline-none"
                          placeholder="0.00"
                        />
                        <div className="flex items-center space-x-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => setAmount(usdcBalance.toString())}
                            className="px-2 py-1 rounded btn-secondary text-[11px] font-bold transition cursor-pointer"
                          >
                            MAX
                          </button>
                          <div className="flex items-center px-3 py-1 well-inset rounded-lg text-xs font-bold border">
                            USDC
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl p-4 well-inset border space-y-2 text-xs">
                      <div className="flex justify-between text-slate-400">
                        <span>{lang === "zh" ? "您将获得份额:" : "You will receive:"}</span>
                        <span className="font-bold font-mono">
                          ~{(Number(amount) / currentSharePrice).toFixed(2)} {currentReceiptToken}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>{lang === "zh" ? "极速免 Gas 路由:" : "Gasless Routing:"}</span>
                        <span className="text-emerald-500 font-medium">
                          {lang === "zh" ? "意图清算节点代付 (0 Gas)" : "Solver pre-funded (0 Gas)"}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>{lang === "zh" ? "底层配置矩阵:" : "Allocation Matrix:"}</span>
                        <span className="text-right truncate max-w-[240px]">
                          {activeVault === "all-weather"
                            ? (lang === "zh" ? "40%美债 + 25%美股 + 15%黄金 + 20%借贷" : "40% Bonds + 25% QQQ + 15% Gold + 20% RHEA")
                            : (lang === "zh" ? "70% RHEA 借贷 (13.88%) + 30% 美债 (5.10%)" : "70% RHEA (13.88%) + 30% Ondo USDY")}
                        </span>
                      </div>
                    </div>

                    {!isConnected ? (
                      <button
                        type="button"
                        onClick={() => setIsWalletModalOpen(true)}
                        className="btn-primary w-full py-4 rounded-xl text-base font-bold transition flex items-center justify-center space-x-2 cursor-pointer shadow-lg"
                      >
                        <Wallet className="w-5 h-5" />
                        <span>{lang === "zh" ? "连接钱包以存入" : "Connect Wallet to Deposit"}</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={handleAction}
                        className="btn-primary w-full py-4 rounded-xl text-base font-bold transition disabled:opacity-50 flex items-center justify-center space-x-2 cursor-pointer shadow-lg"
                      >
                        {isProcessing ? (
                          <span>{lang === "zh" ? "正在 NEAR 测试网执行意图清算..." : "Executing Intent on NEAR..."}</span>
                        ) : (
                          <>
                            <span>
                              {connectedWallet === "Phantom" || isSolanaAddress(connectedAccount) ? (
                                <span className="flex items-center justify-center space-x-1.5">
                                  <img src="/logos/wallets/phantom.svg" alt="Phantom" className="w-5 h-5 inline-block" />
                                  <span>{lang === "zh" ? `通过 Phantom 签名存入 (Solana)` : `Sign & Deposit via Phantom (Solana)`}</span>
                                </span>
                              ) : connectedWallet === "MetaMask" || connectedAccount.startsWith("0x") ? (
                                <span className="flex items-center justify-center space-x-1.5">
                                  <img src="/logos/wallets/metamask.svg" alt="MetaMask" className="w-5 h-5 inline-block" />
                                  <span>{lang === "zh" ? `通过 MetaMask 签名意图 (${sourceChain})` : `Sign Intent via MetaMask (${sourceChain})`}</span>
                                </span>
                              ) : (
                                lang === "zh" ? `签名并从 ${sourceChain} 存入` : `Sign & Deposit from ${sourceChain}`
                              )}
                            </span>
                            <ChevronRight className="w-5 h-5" />
                          </>
                        )}
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-2">
                        {lang === "zh" ? "目标接收公链 (跨链极速清算至任意链)" : "Destination Blockchain (Receive Native Cash Anywhere)"}
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {["Solana", "Base", "Arbitrum", "NEAR"].map((chain) => (
                          <button
                            key={chain}
                            type="button"
                            onClick={() => setDestChain(chain)}
                            className={`py-2 text-xs font-semibold rounded-xl border transition cursor-pointer ${
                              destChain === chain
                                ? "item-selected active-chain-selected"
                                : "well-inset text-slate-600 dark:text-slate-400 hover:border-slate-400"
                            }`}
                          >
                            {chain}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1.5">
                        {lang === "zh" ? `接收 ${destChain} 原生 USDC 的钱包地址:` : `Recipient ${destChain} Wallet Address:`}
                      </label>
                      <input
                        type="text"
                        value={recipientAddress}
                        onChange={(e) => setRecipientAddress(e.target.value)}
                        placeholder={
                          destChain === "Solana"
                            ? (lang === "zh" ? "输入 Phantom / Solflare 地址 (如 7XwP...)" : "Solana Address (e.g. 7XwP...)")
                            : destChain === "Arbitrum" || destChain === "Base"
                            ? (lang === "zh" ? "输入 EVM 地址 (如 0x71C...)" : "EVM Address (e.g. 0x71C...)")
                            : (lang === "zh" ? "输入 NEAR 账户 (如 user.testnet)" : "NEAR Account (e.g. user.testnet)")
                        }
                        className="w-full well-inset rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
                        <span>{lang === "zh" ? "赎回金库份额" : "Shares to Redeem"}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-slate-600 dark:text-slate-300">
                            {lang === "zh" ? "当前持有:" : "Holdings:"}{" "}
                            <span className="text-emerald-700 dark:text-emerald-400 font-mono font-bold">
                              {Number(currentVaultBalance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span> {currentReceiptToken}
                          </span>
                          <button
                            type="button"
                            onClick={() => setAmount(currentVaultBalance.toString())}
                            className="px-2 py-0.5 rounded btn-secondary text-[11px] font-bold transition cursor-pointer"
                          >
                            MAX
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center rounded-xl well-inset p-2 border focus-within:border-emerald-500 transition">
                        <input
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="bg-transparent flex-1 min-w-0 px-3 text-xl font-bold text-slate-900 dark:text-white focus:outline-none"
                          placeholder="0.00"
                        />
                        <div className="flex items-center space-x-1.5 shrink-0 px-3 py-1 well-inset rounded-lg text-xs font-bold border">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          <span>{currentReceiptToken}</span>
                        </div>
                      </div>
                    </div>

                    <div className="well-inset rounded-xl p-4 border space-y-2 text-xs">
                      <div className="flex justify-between text-slate-600 dark:text-slate-400">
                        <span>{lang === "zh" ? "您将获得现金:" : "You will receive:"}</span>
                        <span className="font-bold text-slate-900 dark:text-white font-mono">
                          ~{(Number(amount) * currentSharePrice).toFixed(2)} USDC
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-600 dark:text-slate-400">
                        <span>{lang === "zh" ? "赎回队列优先级:" : "Withdraw Queue:"}</span>
                        <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                          {lang === "zh" ? "优先级 1: Ondo 美债储备缓冲 (极速)" : "Priority 1: Ondo USDY Buffer (Instant)"}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-600 dark:text-slate-400">
                        <span>{lang === "zh" ? "借贷池冲击:" : "Lending Shock:"}</span>
                        <span className="text-emerald-700 dark:text-emerald-400">
                          {lang === "zh" ? "0% (RHEA 借贷池已保护)" : "0% (RHEA Lending Protected)"}
                        </span>
                      </div>
                    </div>

                    {!isConnected ? (
                      <button
                        type="button"
                        onClick={() => setIsWalletModalOpen(true)}
                        className="btn-primary w-full py-4 rounded-xl text-base font-bold shadow-sm transition flex items-center justify-center space-x-2 cursor-pointer"
                      >
                        <Wallet className="w-5 h-5" />
                        <span>{lang === "zh" ? "连接钱包以赎回" : "Connect Wallet to Withdraw"}</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={handleAction}
                        className="btn-primary w-full py-4 rounded-xl text-base font-bold shadow-sm transition disabled:opacity-50 flex items-center justify-center space-x-2 cursor-pointer"
                      >
                        {isProcessing ? (
                          <span>{lang === "zh" ? "正在由意图节点清算..." : "Dispatched via Solver..."}</span>
                        ) : (
                          <>
                            <span>{lang === "zh" ? `极速提现至 ${destChain}` : `Withdraw Cash to ${destChain}`}</span>
                            <ChevronRight className="w-5 h-5" />
                          </>
                        )}
                      </button>
                    )}
                  </div>
                )}

                {txSuccess && (
                  <div className="mt-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs space-y-2.5">
                    <div className="flex items-center space-x-2 font-bold text-emerald-400">
                      <Zap className="w-4 h-4 flex-shrink-0" />
                      <span>
                        {crosschainProof?.action === "withdraw"
                          ? (lang === "zh" ? "⚡ 跨链极速出金已由 Solver 节点代付清算！" : "⚡ Multi-Chain Payout Settled by Solver Network!")
                          : (lang === "zh" ? "🚀 多链入金意图已在 NEAR 主金库结算！" : "🚀 Multi-Chain Deposit Settled on NEAR Master Vault!")}
                      </span>
                    </div>

                    {/* NEAR Settlement Proof */}
                    {lastTxUrl && (
                      <div className="flex items-center justify-between bg-slate-950/60 p-2.5 rounded-lg border border-emerald-500/20">
                        <span className="font-mono text-[11px] text-slate-400">NEAR Settlement:</span>
                        <a
                          href={lastTxUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center space-x-1.5 text-emerald-400 hover:text-emerald-300 font-mono text-[11px] font-bold underline truncate max-w-[200px]"
                          title="View on NearBlocks Testnet Explorer"
                        >
                          <span className="truncate">{lastTxHash}</span>
                          <ExternalLink className="w-3 h-3 flex-shrink-0" />
                        </a>
                      </div>
                    )}

                    {/* Destination / Source Chain Proof */}
                    {crosschainProof && (
                      <div className="flex items-center justify-between bg-slate-950/60 p-2.5 rounded-lg border border-cyan-500/20">
                        <span className="font-mono text-[11px] text-cyan-400">
                          {crosschainProof.action === "withdraw" ? `${crosschainProof.chain} Payout Proof:` : `${crosschainProof.chain} Inflow Proof:`}
                        </span>
                        <a
                          href={crosschainProof.explorerUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center space-x-1.5 text-cyan-300 hover:text-cyan-200 font-mono text-[11px] font-bold underline truncate max-w-[200px]"
                          title="View on Target Chain Explorer"
                        >
                          <span className="truncate">{crosschainProof.txHash}</span>
                          <ExternalLink className="w-3 h-3 flex-shrink-0" />
                        </a>
                      </div>
                    )}

                    <div className="text-[11px] text-slate-400 flex items-center justify-between pt-0.5 border-t border-emerald-500/10">
                      <span>Solver: <span className="text-emerald-400 font-mono">solver-alpha.intents.near</span></span>
                      <span className="text-emerald-400 font-semibold font-mono">
                        {crosschainProof?.action === "withdraw" ? `Delivered: $${crosschainProof.payoutAmount || "1,048.20"} USDC` : "0 Gas Paid • 2.3s Finality"}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Dynamic Market Allocations Section */}
            <div id="allocations" className="mb-10 rounded-2xl bg-slate-900/80 border border-slate-800 p-6 shadow-2xl backdrop-blur-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-slate-800/80 gap-3">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                    <Layers className="w-5 h-5 text-emerald-400" />
                    <span>
                      {activeVault === "all-weather"
                        ? (lang === "zh" ? "全天候宏观四维资产配置矩阵 (Macro Parity)" : "All-Weather Macro 4-Pillar Parity Matrix")
                        : (lang === "zh" ? "动态市场资金配置与双队列路由" : "Dynamic Market Allocations")}
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    {activeVault === "all-weather"
                      ? (lang === "zh"
                          ? "Ray Dalio 达里奥全天候风险平价：美债防守 (40%) + 美股成长 (25%) + 黄金抗通胀 (15%) + Web3借贷利差 (20%)"
                          : "Ray Dalio Risk Parity: 40% Treasuries + 25% Equities QQQ + 15% Physical Gold + 20% Lending Alpha")
                      : (lang === "zh"
                          ? "四权分立治理隔离供给上限、动态充提双队列与 OmniSocket™ 链上插槽总线"
                          : "Decoupled risk governance with strict isolated Supply Caps, Dynamic Dual Queues & OmniSocket™ Bus")}
                  </p>
                </div>
                <div className="flex items-center space-x-2 self-start sm:self-auto">
                  <span className="text-xs px-3 py-1 rounded-full bg-slate-800 text-slate-300 font-mono border border-slate-700">
                    {activeVault === "all-weather" ? "Curator: Gosun Macro" : "Curator: Gosun Labs"}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setCapModalMarket("rhea-lending");
                      setCapInputValue(rheaCap.toString());
                      setIsCapModalOpen(true);
                    }}
                    className="px-3 py-1 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-mono text-xs border border-emerald-500/30 hover:border-emerald-500/60 transition flex items-center space-x-1.5 shadow-sm cursor-pointer"
                    title="Curator & Owner action: configure market supply caps"
                  >
                    <Settings className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{lang === "zh" ? "调节供给上限" : "Adjust Supply Caps"}</span>
                  </button>
                </div>
              </div>

              {/* Market Cards Grid: 2 cards for USDC Vault, 4 cards for All-Weather Vault */}
              {activeVault === "usdc" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Market A: RHEA Lending */}
                  <div className={`p-5 rounded-xl transition border ${
                    circuitBreakerActive 
                      ? "bg-rose-950/20 border-rose-500/40" 
                      : "bg-slate-950/70 border-slate-800 hover:border-slate-700"
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className={`w-3 h-3 rounded-full ${circuitBreakerActive ? "bg-rose-500 animate-ping" : "bg-emerald-400"}`}></span>
                        <span className="font-bold text-sm text-white">RHEA Finance Lending Pool</span>
                        <span className={`text-xs px-2 py-0.5 rounded font-semibold ${
                          circuitBreakerActive
                            ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                            : "bg-emerald-500/10 text-emerald-400"
                        }`}>
                          {circuitBreakerActive ? "PAUSED" : (lang === "zh" ? "供给队列 #1" : "Supply Queue #1")}
                        </span>
                      </div>
                      <span className={`font-extrabold text-sm ${circuitBreakerActive ? "text-rose-400 line-through" : "text-emerald-400"}`}>
                        {circuitBreakerActive ? "0.00% APY" : "13.88% APY"}
                      </span>
                    </div>

                    <div className="mb-3 flex items-center space-x-1.5 text-[11px] font-mono text-slate-400">
                      <span>Socket:</span>
                      <a
                        href="https://testnet.nearblocks.io/address/rhea.omniyield-vault.testnet"
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-400 hover:underline flex items-center space-x-0.5"
                      >
                        <span>rhea.omniyield-vault.testnet</span>
                        <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
                      </a>
                    </div>

                    <div className="flex justify-between items-center text-xs text-slate-400 mb-2 font-mono">
                      <span>{lang === "zh" ? "已分配:" : "Allocated:"} {circuitBreakerActive ? "$0 (0%)" : "$7,000,000 (70%)"}</span>
                      <span className="flex items-center space-x-1">
                        <span>{lang === "zh" ? "供给上限:" : "Supply Cap:"} {circuitBreakerActive ? "$0 (Frozen)" : `$${rheaCap.toLocaleString()} (${rheaCap === 7000000 ? "100% Capped" : "70% Utilized"})`}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setCapModalMarket("rhea-lending");
                            setCapInputValue(rheaCap.toString());
                            setIsCapModalOpen(true);
                          }}
                          className="ml-1 px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-[10px] font-mono border border-emerald-500/20 cursor-pointer"
                        >
                          Edit
                        </button>
                      </span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          circuitBreakerActive 
                            ? "w-0 bg-rose-500" 
                            : rheaCap === 10000000 
                              ? "w-[70%] bg-emerald-400" 
                              : "w-[100%] bg-emerald-400"
                        }`}
                      ></div>
                    </div>
                    <div className="mt-3 text-[11px] text-slate-400">
                      {circuitBreakerActive
                        ? "⚠️ Market paused by Guardian Security Council."
                        : (lang === "zh" ? `引擎: Burrow Core • 动态上限: $${rheaCap.toLocaleString()} • 动态供给队列生效中` : `Engine: Burrow Core • Dynamic Cap: $${rheaCap.toLocaleString()} • Dynamic Queue Active.`)}
                    </div>
                  </div>

                  {/* Market B: Ondo RWA */}
                  <div className="p-5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="w-3 h-3 rounded-full bg-cyan-400"></span>
                        <span className="font-bold text-sm text-white">Ondo USDY Tokenized US Treasuries</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-semibold">
                          {lang === "zh" ? "赎回队列 #1" : "Withdraw Queue #1"}
                        </span>
                      </div>
                      <span className="text-cyan-400 font-extrabold text-sm">5.10% APY</span>
                    </div>

                    <div className="mb-3 flex items-center space-x-1.5 text-[11px] font-mono text-slate-400">
                      <span>Socket:</span>
                      <a
                        href="https://testnet.nearblocks.io/address/ondo.omniyield-vault.testnet"
                        target="_blank"
                        rel="noreferrer"
                        className="text-cyan-400 hover:underline flex items-center space-x-0.5"
                      >
                        <span>ondo.omniyield-vault.testnet</span>
                        <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
                      </a>
                    </div>

                    <div className="flex justify-between items-center text-xs text-slate-400 mb-2 font-mono">
                      <span>{lang === "zh" ? "已分配:" : "Allocated:"} $5,450,800 (30%)</span>
                      <span className="flex items-center space-x-1">
                        <span>{lang === "zh" ? "储备容量:" : "Supply Cap:"} ${ondoCap.toLocaleString()} (Buffer Reserve)</span>
                        <button
                          type="button"
                          onClick={() => {
                            setCapModalMarket("ondo-rwa");
                            setCapInputValue(ondoCap.toString());
                            setIsCapModalOpen(true);
                          }}
                          className="ml-1 px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 text-[10px] font-mono border border-cyan-500/20 cursor-pointer"
                        >
                          Edit
                        </button>
                      </span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div className="w-[30%] h-full bg-cyan-400 rounded-full"></div>
                    </div>
                    <div className="mt-3 text-[11px] text-slate-400">
                      {lang === "zh"
                        ? "定位: 流动性安全垫 • 支持所有跨链提现优先极速无滑点赎回"
                        : "Role: Liquidity Buffer • Instant redemption queue for all cross-chain withdrawals."}
                    </div>
                  </div>
                </div>
              ) : (
                /* ALL-WEATHER 4-PILLAR MACRO PARITY GRID */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Pillar 1: Ondo USDY (40%) */}
                  <div className="p-5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="w-3 h-3 rounded-full bg-cyan-400"></span>
                        <span className="font-bold text-sm text-white">Ondo USDY US Treasuries</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-semibold">
                          {lang === "zh" ? "宏观柱 1: 40% 权重" : "Pillar #1: 40% Weight"}
                        </span>
                      </div>
                      <span className="text-cyan-400 font-extrabold text-sm">5.10% APY</span>
                    </div>

                    <div className="mb-3 flex items-center space-x-1.5 text-[11px] font-mono text-slate-400">
                      <span>Socket:</span>
                      <a
                        href="https://testnet.nearblocks.io/address/ondo.omniyield-vault.testnet"
                        target="_blank"
                        rel="noreferrer"
                        className="text-cyan-400 hover:underline flex items-center space-x-0.5"
                      >
                        <span>ondo.omniyield-vault.testnet</span>
                        <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
                      </a>
                    </div>

                    <div className="flex justify-between items-center text-xs text-slate-400 mb-2 font-mono">
                      <span>{lang === "zh" ? "已配置:" : "Allocated:"} $3,440,000 (40%)</span>
                      <span>{lang === "zh" ? "容量上限:" : "Cap:"} $100M</span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div className="w-[40%] h-full bg-cyan-400 rounded-full"></div>
                    </div>
                    <div className="mt-3 text-[11px] text-slate-400">
                      {lang === "zh" ? "角色: 资本防守底仓 • 锁定无风险主权息票收益与即时赎回流动性" : "Role: Defensive Anchor • Short-term sovereign yields & instant liquidity"}
                    </div>
                  </div>

                  {/* Pillar 2: Ondo US Tech Equities (25%) */}
                  <div className="p-5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="w-3 h-3 rounded-full bg-indigo-400"></span>
                        <span className="font-bold text-sm text-white">Ondo US Tech Equities (QQQ & NVDA)</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-semibold">
                          {lang === "zh" ? "宏观柱 2: 25% 权重" : "Pillar #2: 25% Weight"}
                        </span>
                      </div>
                      <span className="text-indigo-400 font-extrabold text-sm">18.20% Growth</span>
                    </div>

                    <div className="mb-3 flex items-center space-x-1.5 text-[11px] font-mono text-slate-400">
                      <span>Socket:</span>
                      <a
                        href="https://testnet.nearblocks.io/address/stocks.omniyield-vault.testnet"
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-400 hover:underline flex items-center space-x-0.5"
                      >
                        <span>stocks.omniyield-vault.testnet</span>
                        <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
                      </a>
                    </div>

                    <div className="flex justify-between items-center text-xs text-slate-400 mb-2 font-mono">
                      <span>{lang === "zh" ? "已配置:" : "Allocated:"} $2,150,000 (25%)</span>
                      <span>{lang === "zh" ? "容量上限:" : "Cap:"} $50M</span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div className="w-[25%] h-full bg-indigo-400 rounded-full"></div>
                    </div>
                    <div className="mt-3 text-[11px] text-slate-400">
                      {lang === "zh" ? "角色: 经济增长红利 • 纳斯达克 100 指数与全球科技巨头资本增值" : "Role: Capital Growth • Benchmark Nasdaq 100 Index & Mega-Cap Tech Basket"}
                    </div>
                  </div>

                  {/* Pillar 3: Tokenized Physical Gold PAXG (15%) */}
                  <div className="p-5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="w-3 h-3 rounded-full bg-amber-400"></span>
                        <span className="font-bold text-sm text-white">Tokenized Physical Gold (PAXG)</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-semibold">
                          {lang === "zh" ? "宏观柱 3: 15% 权重" : "Pillar #3: 15% Weight"}
                        </span>
                      </div>
                      <span className="text-amber-400 font-extrabold text-sm">12.50% APY</span>
                    </div>

                    <div className="mb-3 flex items-center space-x-1.5 text-[11px] font-mono text-slate-400">
                      <span>Socket:</span>
                      <a
                        href="https://testnet.nearblocks.io/address/gold.omniyield-vault.testnet"
                        target="_blank"
                        rel="noreferrer"
                        className="text-amber-400 hover:underline flex items-center space-x-0.5"
                      >
                        <span>gold.omniyield-vault.testnet</span>
                        <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
                      </a>
                    </div>

                    <div className="flex justify-between items-center text-xs text-slate-400 mb-2 font-mono">
                      <span>{lang === "zh" ? "已配置:" : "Allocated:"} $1,290,000 (15%)</span>
                      <span>{lang === "zh" ? "容量上限:" : "Cap:"} $30M</span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div className="w-[15%] h-full bg-amber-400 rounded-full"></div>
                    </div>
                    <div className="mt-3 text-[11px] text-slate-400">
                      {lang === "zh" ? "角色: 抗通胀与危机避险 • 100% 伦敦交割伦敦金库实物金条背书" : "Role: Crisis & Inflation Hedge • 100% London Good Delivery Physical Bullion"}
                    </div>
                  </div>

                  {/* Pillar 4: RHEA Lending Alpha (20%) */}
                  <div className="p-5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
                        <span className="font-bold text-sm text-white">RHEA Finance Lending Alpha</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold">
                          {lang === "zh" ? "宏观柱 4: 20% 权重" : "Pillar #4: 20% Weight"}
                        </span>
                      </div>
                      <span className="text-emerald-400 font-extrabold text-sm">13.88% APY</span>
                    </div>

                    <div className="mb-3 flex items-center space-x-1.5 text-[11px] font-mono text-slate-400">
                      <span>Socket:</span>
                      <a
                        href="https://testnet.nearblocks.io/address/rhea.omniyield-vault.testnet"
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-400 hover:underline flex items-center space-x-0.5"
                      >
                        <span>rhea.omniyield-vault.testnet</span>
                        <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
                      </a>
                    </div>

                    <div className="flex justify-between items-center text-xs text-slate-400 mb-2 font-mono">
                      <span>{lang === "zh" ? "已配置:" : "Allocated:"} $1,720,000 (20%)</span>
                      <span>{lang === "zh" ? "容量上限:" : "Cap:"} $10M</span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div className="w-[20%] h-full bg-emerald-400 rounded-full"></div>
                    </div>
                    <div className="mt-3 text-[11px] text-slate-400">
                      {lang === "zh" ? "角色: Web3 超额利差引擎 • 捕捉链上高波动与借贷流动性溢价" : "Role: Web3 Carry Alpha • Burrow Core isolated borrowing yield capture"}
                    </div>
                  </div>
                </div>
              )}

              {/* Queue Routing & OmniSocket Bus */}
              <div className="pt-4 border-t border-slate-800/80 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-slate-400 block mb-0.5 font-semibold">
                        {activeVault === "all-weather"
                          ? (lang === "zh" ? "宏观资产再平衡策略 (Autonomous Parity)" : "Autonomous Rebalancing Strategy")
                          : (lang === "zh" ? "资金存入路由 (动态进场队列)" : "Supply Queue (Inflow)")}
                      </span>
                      <span className="font-mono text-emerald-400 text-sm">
                        {activeVault === "all-weather"
                          ? "40% USDY + 25% QQQ + 15% PAXG + 20% RHEA"
                          : "1. RHEA Lending (13.88%) ➔ 2. Ondo RWA (5.10%)"}
                      </span>
                    </div>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono">
                      {activeVault === "all-weather" ? "Ray Dalio Parity" : "Yield Maximized"}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-slate-400 block mb-0.5 font-semibold">
                        {lang === "zh" ? "资金赎回路由 (极速退场队列)" : "Withdraw Queue (Outflow)"}
                      </span>
                      <span className="font-mono text-cyan-400 text-sm">
                        {lang === "zh" ? "1. Ondo USDY (缓冲) ➔ 2. RHEA Lending" : "1. Ondo USDY (Buffer) ➔ 2. RHEA Lending"}
                      </span>
                    </div>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-mono">
                      {lang === "zh" ? "流动性保障" : "Buffer Protected"}
                    </span>
                  </div>
                </div>

                {/* Plug-and-Play Sockets Bar */}
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                    <span className="font-bold text-white">OmniSocket™ Bus:</span>
                    <span className="text-emerald-400 font-mono">
                      {activeVault === "all-weather" ? "7 Active Sockets" : "5 Active Sockets"}
                    </span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-400">
                      {activeVault === "all-weather"
                        ? "Arbitrum / Solana / Base / Ondo USDY / Ondo QQQ / PAXG Gold / RHEA"
                        : "Arbitrum / Solana / Base / RHEA Lending / Ondo USDY"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => alert("OmniSocket™ SDK v1.0.0: Third-party chains (Monad, Sui, Aptos) can implement ChainSocketTrait and register via governance proposal.")}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition self-start sm:self-auto cursor-pointer"
                  >
                    + Plug New Socket
                  </button>
                </div>
              </div>
            </div>
                </>
              )}
            </div>

            {/* BACK FACE: Institutional Governance & Vault Cockpit */}
            <div className={`${isFlipped ? "block" : "hidden"} rotate-y-180 backface-hidden`}>
              <VaultCockpitBackside
                connectedAccount={connectedAccount}
                onSwitchAccount={(newAcc) => {
                  setConnectedAccount(newAcc);
                  refreshAllBalances(newAcc);
                }}
                onFlipBack={() => setIsFlipped(false)}
                rheaCap={rheaCap}
                ondoCap={ondoCap}
                onUpdateRheaCap={(cap) => setRheaCap(cap)}
                onUpdateOndoCap={(cap) => setOndoCap(cap)}
                timelockPending={timelockPending}
                onProposeCapIncrease={handleProposeCapIncrease}
                onGuardianVeto={handleGuardianVeto}
                onExecuteCapIncrease={handleExecuteCapIncrease}
                circuitBreakerActive={circuitBreakerActive}
                onToggleCircuitBreaker={handleToggleCircuitBreaker}
                onLog={(msg) => setLogs((prev) => [msg, ...prev])}
                logs={logs}
                lang={lang}
                theme={theme}
                activeDomain={activeBacksideNav}
                onSelectDomain={setActiveBacksideNav}
              />
            </div>
          </div>
        </div>
      </main>
    </div>

    {/* Web3 Wallet Modals */}
    <WalletModal
      isOpen={isWalletModalOpen}
      onClose={() => setIsWalletModalOpen(false)}
      onConnect={handleConnect}
      lang={lang}
      theme={theme}
    />

    <AccountDrawer
      account={connectedAccount}
      walletName={connectedWallet}
      nearBalance={nearBalance}
      usdcBalance={usdcBalance}
      nusdBalance={nusdBalance}
      omniUsdcBalance={omniUsdcBalance}
      activeVault={activeVault}
      isOpen={isAccountDrawerOpen}
      onClose={() => setIsAccountDrawerOpen(false)}
      onDisconnect={handleDisconnect}
      onSwitch={() => {
        setIsAccountDrawerOpen(false);
        setIsWalletModalOpen(true);
      }}
      onClaimFaucet={handleClaimFaucet}
      onResetBalances={handleResetAccountBalances}
      lang={lang}
      theme={theme}
    />

    {/* User Settings Modal */}
    <UserSettingsModal
      isOpen={isSettingsModalOpen}
      onClose={() => setIsSettingsModalOpen(false)}
      lang={lang}
      onToggleLang={() => toggleLang(lang === "zh" ? "en" : "zh")}
      theme={theme}
      onToggleTheme={() => toggleTheme(theme === "dark" ? "beige" : "dark")}
      connectedAccount={connectedAccount}
      onOpenAccountDrawer={() => {
        setIsSettingsModalOpen(false);
        setIsAccountDrawerOpen(true);
      }}
      onClaimFaucet={handleClaimFaucet}
    />

    {/* Modal: Adjust Market Supply Cap (Curator / DAO) */}
    {isCapModalOpen && (
      <div className="fixed inset-0 z-[100] overflow-y-auto">
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={() => setIsCapModalOpen(false)}
          aria-hidden="true"
        />
        <div className="flex min-h-full items-center justify-center p-4 text-center">
          <div
            className={`relative w-full max-w-lg rounded-2xl p-6 shadow-2xl text-left border transition-all z-10 ${
              theme === "beige"
                ? "bg-[#fdfbf7] border-[#d5c4a1] text-[#171d26]"
                : "bg-slate-900 border-slate-800 text-slate-100"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsCapModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white transition cursor-pointer p-1 rounded-lg"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2.5 mb-5 pb-3 border-b border-slate-800">
              <Settings className="w-5 h-5 text-emerald-400" />
              <div>
                <h3 className="font-bold text-base text-white">
                  {lang === "zh" ? "调整市场资金上限 (Supply Cap)" : "Adjust Market Supply Cap"}
                </h3>
                <p className="text-xs text-slate-400">
                  {lang === "zh"
                    ? "策展人与 DAO 链上非对称时间锁核保"
                    : "Curator & DAO Risk Underwriting via Asymmetric Timelock"}
                </p>
              </div>
            </div>

            {/* Informative Rule Box */}
            <div className="mb-4 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 space-y-1.5 leading-relaxed">
              <div className="flex items-center space-x-1.5 font-bold text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                <span>{lang === "zh" ? "核心非对称风控规则" : "Asymmetric Risk Delay Rules"}</span>
              </div>
              <div className="text-[11px] text-slate-400 space-y-1">
                <div>
                  • <strong className="text-emerald-300">{lang === "zh" ? "调低上限（收缩风险）" : "Lower Cap"}</strong>
                  {lang === "zh"
                    ? "：0 秒即时生效，用于防范坏账，阻断新资金流入。"
                    : ": 0s instant execution to protect depositors against bad debt."}
                </div>
                <div>
                  • <strong className="text-amber-300">{lang === "zh" ? "调高上限（扩大风险）" : "Raise Cap"}</strong>
                  {lang === "zh"
                    ? "：强制锁定 24 小时安全时间锁，储户享有完整退出期，Guardian 拥有瞬时否决权。"
                    : ": Enforces 24h Timelock, ensuring depositors an exit window while Guardian holds veto power."}
                </div>
              </div>
            </div>

            <form onSubmit={handleApplyCapChange} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {lang === "zh" ? "选择目标子市场:" : "Select Target Market:"}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCapModalMarket("rhea-lending");
                      setCapInputValue(rheaCap.toString());
                    }}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                      capModalMarket === "rhea-lending"
                        ? "bg-emerald-500/10 border-emerald-500 text-emerald-300"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <div className="font-bold text-xs">RHEA Lending</div>
                    <div className="text-[11px] font-mono text-slate-500">Cap: ${rheaCap.toLocaleString()}</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCapModalMarket("ondo-rwa");
                      setCapInputValue(ondoCap.toString());
                    }}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                      capModalMarket === "ondo-rwa"
                        ? "bg-cyan-500/10 border-cyan-500 text-cyan-300"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <div className="font-bold text-xs">Ondo US Treasuries</div>
                    <div className="text-[11px] font-mono text-slate-500">Cap: ${ondoCap.toLocaleString()}</div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {lang === "zh" ? "拟设定的资金上限:" : "Proposed Supply Cap:"}
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-sm font-mono text-slate-500">$</span>
                  <input
                    type="number"
                    step="500000"
                    min="0"
                    value={capInputValue}
                    onChange={(e) => setCapInputValue(e.target.value)}
                    className="w-full pl-8 pr-16 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                    required
                  />
                  <span className="absolute right-3.5 top-2.5 text-xs font-mono text-slate-500">USDC</span>
                </div>

                <div className="flex items-center space-x-1.5 mt-2">
                  <span className="text-[11px] text-slate-500">Presets:</span>
                  {[5000000, 7000000, 10000000, 15000000, 50000000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setCapInputValue(preset.toString())}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-mono cursor-pointer"
                    >
                      ${(preset / 1000000).toFixed(0)}M
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">
                  {lang === "zh" ? "执行模式:" : "Execution Mode:"}
                </span>
                {Number(capInputValue) > (capModalMarket === "rhea-lending" ? rheaCap : ondoCap) ? (
                  <span className="text-amber-400 flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{lang === "zh" ? "强制锁定 24h 时间锁 (扩容延迟)" : "24h Timelock Enforced"}</span>
                  </span>
                ) : (
                  <span className="text-emerald-400 flex items-center space-x-1">
                    <Zap className="w-3.5 h-3.5" />
                    <span>{lang === "zh" ? "0 秒即时生效 (风险收缩)" : "0s Instant (Risk Contraction)"}</span>
                  </span>
                )}
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                <span className="text-[11px] text-slate-500 font-mono">
                  Caller: curator.omniyield-vault.testnet
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsCapModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition cursor-pointer"
                  >
                    {lang === "zh" ? "取消" : "Cancel"}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition cursor-pointer"
                  >
                    {Number(capInputValue) > (capModalMarket === "rhea-lending" ? rheaCap : ondoCap)
                      ? (lang === "zh" ? "提交扩容提案 (24h时间锁)" : "Submit Cap Increase")
                      : (lang === "zh" ? "立即生效缩容配置" : "Apply Reduced Cap")}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    )}
  </div>
  );
}
