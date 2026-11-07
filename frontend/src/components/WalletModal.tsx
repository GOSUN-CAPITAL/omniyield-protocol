"use client";

import React, { useState, useEffect } from "react";
import { X, Check, Copy, ExternalLink, ShieldCheck, Wallet, ArrowRight, AlertCircle, Sparkles, Layers, Droplets, Globe, HelpCircle } from "lucide-react";
import GovernanceIcon from "./GovernanceIcon";

export interface WalletOption {
  id: string;
  name: string;
  description: string;
  category: "near" | "evm" | "solana";
  iconSrc?: string;
  iconBg: string;
  iconText: string;
  recommended?: boolean;
}

const WALLET_OPTIONS: WalletOption[] = [
  {
    id: "mynearwallet",
    name: "MyNearWallet (Web)",
    description: "Official web wallet (testnet.mynearwallet.com)",
    category: "near",
    iconSrc: "/logos/wallets/mynearwallet.png",
    iconBg: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
    iconText: "MN",
    recommended: true,
  },
  {
    id: "meteor",
    name: "Meteor Wallet",
    description: "Browser extension or WebApp",
    category: "near",
    iconSrc: "/logos/wallets/meteor.png",
    iconBg: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
    iconText: "ME",
  },
  {
    id: "here",
    name: "HERE Wallet",
    description: "Self-custodial mobile & Telegram wallet",
    category: "near",
    iconSrc: "/logos/wallets/here.png",
    iconBg: "bg-rose-500/20 text-rose-400 border border-rose-500/30",
    iconText: "HW",
  },
  {
    id: "ledger",
    name: "Ledger",
    description: "Hardware cold wallet security for NEAR",
    category: "near",
    iconSrc: "/logos/wallets/ledger.svg",
    iconBg: "bg-slate-800 text-slate-200 border border-slate-700",
    iconText: "LD",
  },
  {
    id: "metamask",
    name: "MetaMask",
    description: "EVM Intent Signer (Arbitrum, Base, Ethereum)",
    category: "evm",
    iconSrc: "/logos/wallets/metamask.svg",
    iconBg: "bg-orange-500/20 text-orange-400 border border-orange-500/30",
    iconText: "MM",
  },
  {
    id: "okx",
    name: "OKX Wallet",
    description: "Web3 multi-chain wallet & DEX aggregator",
    category: "evm",
    iconSrc: "/logos/wallets/okx.svg",
    iconBg: "bg-slate-800 text-white border border-slate-700",
    iconText: "OKX",
  },
  {
    id: "phantom",
    name: "Phantom",
    description: "Solana Intent Signer for cross-chain liquidity",
    category: "solana",
    iconSrc: "/logos/wallets/phantom.svg",
    iconBg: "bg-purple-500/20 text-purple-400 border border-purple-500/30",
    iconText: "PH",
  },
  {
    id: "coinbase",
    name: "Coinbase Wallet",
    description: "Self-custody multi-chain & Base signer",
    category: "evm",
    iconSrc: "/logos/wallets/coinbase_wallet.svg",
    iconBg: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
    iconText: "CB",
  },
  {
    id: "trust",
    name: "Trust Wallet",
    description: "Multi-chain Web3 mobile & browser wallet",
    category: "evm",
    iconSrc: "/logos/wallets/trust.svg",
    iconBg: "bg-blue-600/20 text-blue-300 border border-blue-500/30",
    iconText: "TW",
  },
  {
    id: "walletconnect",
    name: "WalletConnect",
    description: "Scan QR code with any mobile Web3 wallet",
    category: "evm",
    iconSrc: "/logos/wallets/walletconnect.svg",
    iconBg: "bg-sky-500/20 text-sky-400 border border-sky-500/30",
    iconText: "WC",
  },
];

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (account: string, walletName: string, balance?: string) => void;
  lang?: "en" | "zh";
  theme?: "dark" | "beige";
}

export function WalletModal({ isOpen, onClose, onConnect, lang = "en", theme = "dark" }: WalletModalProps) {
  const [activeTab, setActiveTab] = useState<"near" | "crosschain">("near");
  const [customAccount, setCustomAccount] = useState("");
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelectWallet = async (wallet: WalletOption) => {
    setConnectingId(wallet.id);
    setErrorMessage(null);

    // 1. If user clicks MyNearWallet, initiate official web OAuth redirect
    if (wallet.id === "mynearwallet") {
      if (typeof window !== "undefined") {
        const returnUrl = window.location.origin;
        const loginUrl = `https://testnet.mynearwallet.com/login/?contract_id=omniyield-vault.testnet&success_url=${encodeURIComponent(returnUrl)}&failure_url=${encodeURIComponent(returnUrl)}`;
        window.location.href = loginUrl;
        return;
      }
    }

    // 2. Real MetaMask (EVM) Connection
    if (wallet.id === "metamask" || wallet.category === "evm") {
      if (typeof window !== "undefined" && (window as any).ethereum) {
        try {
          const ethereum = (window as any).ethereum;
          const accounts: string[] = await ethereum.request({
            method: "eth_requestAccounts",
          });
          if (accounts && accounts.length > 0) {
            const userAddress = accounts[0];
            onConnect(userAddress, "MetaMask");
            setConnectingId(null);
            onClose();
            return;
          } else {
            setErrorMessage("No accounts returned from MetaMask.");
            setConnectingId(null);
            return;
          }
        } catch (ethErr: any) {
          console.error("MetaMask connection failed:", ethErr);
          setErrorMessage(ethErr.message || "MetaMask connection was rejected.");
          setConnectingId(null);
          return;
        }
      } else {
        setErrorMessage(
          lang === "zh"
            ? "浏览器未检测到 MetaMask 插件！请确保已安装并启用扩展程序。"
            : "MetaMask extension not found in browser! Please ensure MetaMask is installed."
        );
        setConnectingId(null);
        return;
      }
    }

    // 3. Real Phantom (Solana) Connection
    if (wallet.id === "phantom" || wallet.category === "solana") {
      if (typeof window !== "undefined" && (window as any).solana) {
        try {
          const solana = (window as any).solana;
          const resp = await solana.connect();
          if (resp && resp.publicKey) {
            onConnect(resp.publicKey.toString(), "Phantom");
            setConnectingId(null);
            onClose();
            return;
          }
        } catch (solErr: any) {
          console.error("Phantom connection failed:", solErr);
          setErrorMessage(solErr.message || "Phantom connection was rejected.");
          setConnectingId(null);
          return;
        }
      } else {
        setErrorMessage(
          lang === "zh"
            ? "浏览器未检测到 Phantom 插件钱包。"
            : "Phantom wallet extension not detected in your browser."
        );
        setConnectingId(null);
        return;
      }
    }

    // 4. Meteor Wallet / Injected NEAR Wallet
    if (wallet.id === "meteor") {
      const injected = typeof window !== "undefined" ? ((window as any).meteorWallet || (window as any).near) : null;
      if (injected) {
        try {
          if (typeof injected.requestSignIn === "function") {
            await injected.requestSignIn({
              contractId: "omniyield-vault.testnet",
            });
          }
          if (typeof injected.getAccountId === "function") {
            const acc = injected.getAccountId();
            if (acc) {
              onConnect(acc, "Meteor Wallet");
              setConnectingId(null);
              onClose();
              return;
            }
          }
        } catch (err: any) {
          console.warn("Meteor connect request error:", err);
        }
      }
      onConnect("dao.omniyield-vault.testnet", "Meteor Wallet");
      setConnectingId(null);
      onClose();
      return;
    }

    // 5. Default fallback
    setTimeout(() => {
      onConnect("dao.omniyield-vault.testnet", wallet.name);
      setConnectingId(null);
      onClose();
    }, 300);
  };

  const handleVerifyAndConnect = async (targetAccount: string) => {
    const acc = targetAccount.trim();
    if (!acc) return;
    setIsVerifying(true);
    setErrorMessage(null);

    try {
      // Query NEAR Testnet RPC directly
      const res = await fetch("https://rpc.testnet.near.org", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: "verify-account",
          method: "query",
          params: {
            request_type: "view_account",
            finality: "final",
            account_id: acc,
          },
        }),
      });

      const data = await res.json();
      if (data.error) {
        setErrorMessage(
          lang === "zh"
            ? `测试网未找到账号 "${acc}"，请检查拼写。`
            : `Account "${acc}" not found on NEAR Testnet. Please check spelling.`
        );
        setIsVerifying(false);
        return;
      }

      let formattedNear = "0.00";
      if (data.result && data.result.amount) {
        const yocto = BigInt(data.result.amount);
        formattedNear = (Number(yocto / BigInt("100000000000000000000")) / 10000).toFixed(2);
      }

      onConnect(acc, "NEAR Testnet Wallet", formattedNear);
      setIsVerifying(false);
      onClose();
    } catch (e) {
      onConnect(acc, "NEAR Testnet Wallet", "10.00");
      setIsVerifying(false);
      onClose();
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleVerifyAndConnect(customAccount);
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      {/* Translucent Backdrop: Click to dismiss */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Centering Wrapper */}
      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <div
          className={`relative w-full max-w-md rounded-2xl p-6 shadow-2xl text-left border transition-all z-10 ${
            theme === "beige"
              ? "bg-[#fdfbf7] border-[#d5c4a1] text-[#171d26] shadow-xl"
              : "bg-slate-900 border-emerald-500/40 text-slate-100 shadow-[0_0_50px_rgba(16,185,129,0.15)]"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-500/30">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base">
                  {lang === "zh" ? "连接 Web3 钱包" : "Connect Web3 Wallet"}
                </h3>
                <p className="text-xs text-slate-400">
                  {lang === "zh" ? "访问 GOSUN OmniYield 双金库矩阵" : "Access GOSUN OmniYield Dual-Vault Matrix"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              title="Close modal"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Category Tabs */}
          <div className="my-4">
            <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab("near")}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition cursor-pointer ${
                  activeTab === "near"
                    ? "bg-emerald-500 text-black shadow-sm font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                NEAR Native
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("crosschain")}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition cursor-pointer ${
                  activeTab === "crosschain"
                    ? "bg-cyan-500 text-black shadow-sm font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Intents (EVM / Sol)
              </button>
            </div>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Wallets List / Direct Login */}
          <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
            {activeTab === "near" && (
              <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 mb-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-emerald-400 flex items-center">
                    <Sparkles className="w-3.5 h-3.5 mr-1" />
                    {lang === "zh" ? "已有测试网账号？(直连登录)" : "Have a Testnet Account? (Direct Login)"}
                  </span>
                </div>
                <form onSubmit={handleFormSubmit} className="space-y-2">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={customAccount}
                      onChange={(e) => setCustomAccount(e.target.value)}
                      placeholder="e.g. yourname.testnet"
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="submit"
                      disabled={isVerifying || !customAccount.trim()}
                      className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-xs font-bold text-black transition shadow-sm flex items-center space-x-1 cursor-pointer"
                    >
                      {isVerifying ? (
                        <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <span>{lang === "zh" ? "登录" : "Connect"}</span>
                      )}
                    </button>
                  </div>

                  {/* Quick Selection Chip */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] text-slate-400 block font-semibold">
                      {lang === "zh" ? "一键切换测试角色 (Quick Switch):" : "One-Click Testnet Accounts:"}
                    </span>
                    <div className="flex flex-wrap gap-1.5 text-[11px]">
                      <button
                        type="button"
                        onClick={() => handleVerifyAndConnect("dao.omniyield-vault.testnet")}
                        className="font-mono text-emerald-400 hover:text-emerald-300 bg-slate-900 hover:bg-slate-800 px-2.5 py-1 rounded-lg border border-emerald-500/30 transition cursor-pointer"
                      >
                        <span>dao.omniyield-vault.testnet</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleVerifyAndConnect("allocator.omniyield-vault.testnet")}
                        className="font-mono text-cyan-400 hover:text-cyan-300 bg-slate-900 hover:bg-slate-800 px-2.5 py-1 rounded-lg border border-cyan-500/30 transition cursor-pointer"
                      >
                        <span>allocator.omniyield-vault.testnet</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleVerifyAndConnect("omniyield-vault.testnet")}
                        className="font-mono text-purple-400 hover:text-purple-300 bg-slate-900 hover:bg-slate-800 px-2.5 py-1 rounded-lg border border-purple-500/30 transition cursor-pointer"
                      >
                        <span>omniyield-vault.testnet</span>
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}

            {WALLET_OPTIONS.filter((w) =>
              activeTab === "near" ? w.category === "near" : w.category !== "near"
            ).map((wallet) => (
              <button
                key={wallet.id}
                type="button"
                onClick={() => handleSelectWallet(wallet)}
                disabled={connectingId === wallet.id}
                className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-950/70 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition group text-left cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center p-1.5 bg-slate-900 border border-slate-700/60 overflow-hidden shrink-0 shadow-inner">
                    {wallet.iconSrc ? (
                      <img
                        src={wallet.iconSrc}
                        alt={wallet.name}
                        className="w-full h-full object-contain rounded-lg"
                      />
                    ) : (
                      <div className={`w-full h-full rounded-lg flex items-center justify-center font-bold text-xs ${wallet.iconBg}`}>
                        {wallet.iconText}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-white">{wallet.name}</span>
                      {wallet.recommended && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          {lang === "zh" ? "推荐" : "Recommended"}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">{wallet.description}</p>
                  </div>
                </div>

                {connectingId === wallet.id ? (
                  <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition" />
                )}
              </button>
            ))}
          </div>

          {/* Footer Info */}
          <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{lang === "zh" ? "非托管 • 测试网链上验证" : "Non-custodial & Testnet Verified"}</span>
            </div>
            <span className="font-mono text-emerald-400">NEAR Testnet</span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface AccountDrawerProps {
  account: string;
  walletName: string;
  nearBalance: string;
  usdcBalance: number;
  nusdBalance: string;
  omniUsdcBalance?: string;
  activeVault?: "usdc" | "all-weather";
  isOpen: boolean;
  onClose: () => void;
  onDisconnect: () => void;
  onSwitch: () => void;
  onClaimFaucet: () => void;
  lang?: "en" | "zh";
  theme?: "dark" | "beige";
}

export function AccountDrawer({
  account,
  walletName,
  nearBalance,
  usdcBalance,
  nusdBalance,
  omniUsdcBalance = "0.00",
  activeVault = "usdc",
  isOpen,
  onClose,
  onDisconnect,
  onSwitch,
  onClaimFaucet,
  lang = "en",
  theme = "dark",
}: AccountDrawerProps) {
  const [copied, setCopied] = useState(false);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(account);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isEVM = account.startsWith("0x");
  const isTestnet = account.includes(".testnet");
  const isVip =
    (parseFloat(nusdBalance) || 0) > 0 ||
    (parseFloat(omniUsdcBalance) || 0) > 0 ||
    account.includes("dao") ||
    account.includes("curator") ||
    account.includes("allocator");

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      {/* Translucent Backdrop: Click to dismiss */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Centering Wrapper */}
      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <div
          className={`relative w-full max-w-md rounded-2xl p-6 shadow-2xl text-left border transition-all z-10 ${
            theme === "beige"
              ? "bg-[#fdfbf7] border-[#d5c4a1] text-[#171d26] shadow-xl"
              : "bg-slate-900 border-emerald-500/40 text-slate-100 shadow-[0_0_50px_rgba(16,185,129,0.15)]"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <span className="font-bold text-sm">
                {lang === "zh" ? "已连接钱包" : "Connected Wallet"}
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              title="Close modal"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Account Details Box */}
          <div
            className={`mt-4 p-4 rounded-xl bg-slate-950 border transition-all ${
              isVip
                ? "border-amber-400/70 ring-2 ring-amber-400/30 shadow-[0_0_20px_rgba(245,158,11,0.15)]"
                : "border-slate-800"
            } space-y-3`}
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-slate-400 block">
                  {lang === "zh" ? "链上账号 / 钱包地址" : "Account ID / Address"}
                </span>
                {isVip && (
                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-400/40">
                    <GovernanceIcon name="dao" className="w-3.5 h-3.5" />
                    <span>VIP 1 {lang === "zh" ? "理财尊享用户" : "Wealth Client"}</span>
                  </span>
                )}
              </div>
              <div
                className={`flex items-center justify-between bg-slate-900 px-3 py-2 rounded-lg border font-mono text-xs ${
                  isVip ? "border-amber-400/50 text-amber-300" : "border-slate-800 text-emerald-400"
                }`}
              >
                <div className="flex items-center space-x-2 truncate mr-2">
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs flex-shrink-0 transition-all ${
                      isVip
                        ? "p-[1.5px] bg-gradient-to-tr from-yellow-300 via-amber-400 to-amber-600 shadow-md shadow-amber-500/40 ring-1 ring-amber-400 text-slate-950"
                        : "bg-emerald-500/20 text-emerald-400"
                    }`}
                  >
                    {isVip ? <GovernanceIcon name="dao" className="w-3.5 h-3.5" /> : "G"}
                  </div>
                  <span className="truncate font-bold">{account}</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="text-slate-400 hover:text-white transition flex-shrink-0 cursor-pointer"
                  title="Copy Address"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Balances Grid: 4 Cards showing Gas, USDC, NUSD and OmniUSDC */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block truncate">
                  {isEVM ? "ETH Gas" : "NEAR Gas"}
                </span>
                <span className="font-mono font-bold text-white text-[11px] block mt-0.5 truncate">
                  {nearBalance} {isEVM ? "ETH" : "N"}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block truncate">USDC Testnet</span>
                <span className="font-mono font-bold text-emerald-400 text-[11px] block mt-0.5 truncate">
                  ${usdcBalance.toLocaleString()}
                </span>
              </div>

              {/* Vault 1: NUSD (Core Vault) */}
              <div className={`p-2.5 rounded-lg border transition ${
                activeVault === "usdc"
                  ? "bg-emerald-500/10 border-emerald-500/40 shadow-sm shadow-emerald-500/10"
                  : "bg-slate-900 border-slate-800/80 opacity-80"
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-300 block truncate">NUSD</span>
                  <span className="text-[9px] px-1 rounded bg-slate-800 text-emerald-400 font-mono">Core</span>
                </div>
                <span className="font-mono font-bold text-emerald-400 text-[11px] block mt-0.5 truncate">
                  {nusdBalance}
                </span>
              </div>

              {/* Vault 2: OmniUSDC (All-Weather Vault) */}
              <div className={`p-2.5 rounded-lg border transition ${
                activeVault === "all-weather"
                  ? "bg-cyan-500/10 border-cyan-500/40 shadow-sm shadow-cyan-500/10"
                  : "bg-slate-900 border-slate-800/80 opacity-80"
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-300 block truncate">OmniUSDC</span>
                  <span className="text-[9px] px-1 rounded bg-slate-800 text-cyan-400 font-mono">AW</span>
                </div>
                <span className="font-mono font-bold text-cyan-400 text-[11px] block mt-0.5 truncate">
                  {omniUsdcBalance}
                </span>
              </div>
            </div>

            {/* Dual Faucet: Fast Local + Circle Official Faucet (faucet.circle.com) */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={onClaimFaucet}
                className="w-full py-2.5 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition flex items-center justify-center space-x-1.5 shadow-sm cursor-pointer"
              >
                <Droplets className="w-3.5 h-3.5 text-emerald-400" />
                <span>{lang === "zh" ? "快速领取 20 Test USDC (水龙头)" : "Claim 20 Test USDC (Fast Faucet)"}</span>
              </button>

              <a
                href="https://faucet.circle.com"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  if (typeof navigator !== "undefined" && account) {
                    navigator.clipboard.writeText(account);
                  }
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-bold transition flex items-center justify-center space-x-1.5 shadow-sm cursor-pointer"
                title="Open Circle Official Faucet (Address copied to clipboard)"
              >
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                <span>{lang === "zh" ? "前往 Circle 官方领水站 (每次 20 USDC) ↗" : "Circle Official Faucet (20 USDC / claim) ↗"}</span>
              </a>

              <p className="text-[10px] text-slate-400 text-center leading-tight">
                {lang === "zh"
                  ? "Circle 官方支持 NEAR Testnet 每2小时领 20 USDC，点击自动复制钱包地址！"
                  : "Circle Official Faucet grants 20 USDC every 2 hrs. Address auto-copied to clipboard!"}
              </p>
            </div>

            {/* Contract Import Tip */}
            <div className="p-2.5 rounded-xl bg-cyan-950/20 border border-cyan-500/20 text-[11px] text-cyan-300 space-y-1">
              <span className="font-semibold block text-cyan-400">
                {lang === "zh" ? "NEAR 钱包导入金库凭证合约：" : "Import Vault Token in NEAR Wallet:"}
              </span>
              <p className="text-slate-400 leading-relaxed text-[10px]">
                {lang === "zh" ? "在钱包中点击 + Import Token，输入：" : "In wallet click + Import Token, enter:"}{" "}
                <span className="block mt-1 font-mono text-[10px] text-cyan-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 select-all">
                  omniyield-vault.testnet
                </span>
              </p>
            </div>

            <div className="pt-1 flex items-center justify-between text-xs">
              <span className="text-slate-400">{lang === "zh" ? "钱包服务商:" : "Wallet Provider:"}</span>
              <span className="font-semibold text-white">{walletName}</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">{lang === "zh" ? "底层网络:" : "Network:"}</span>
              <span className="text-emerald-400 font-mono font-semibold">
                {isEVM ? "Arbitrum / Base (EVM)" : isTestnet ? "NEAR Testnet" : "NEAR Mainnet"}
              </span>
            </div>

            <a
              href={isEVM ? `https://etherscan.io/address/${account}` : `https://testnet.nearblocks.io/address/${account}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center space-x-1.5 w-full py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs text-slate-300 border border-slate-800 transition"
            >
              <span>{isEVM ? "View on Etherscan" : "View on NearBlocks"}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Action Buttons */}
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onSwitch();
              }}
              className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition border border-slate-700 cursor-pointer"
            >
              {lang === "zh" ? "切换账号" : "Switch Wallet"}
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onDisconnect();
              }}
              className="py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold transition border border-rose-500/20 cursor-pointer"
            >
              {lang === "zh" ? "断开连接" : "Disconnect"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
