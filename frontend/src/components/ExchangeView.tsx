"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowDown,
  Sliders,
  ExternalLink,
  CheckCircle2,
  Clock,
  Zap,
  ChevronDown,
  RotateCw,
  ShieldCheck,
} from "lucide-react";
import {
  MULTI_CHAIN_ASSETS,
  MultiChainAsset,
  TokenNetwork,
} from "../config/intentsTokens";
import SelectAssetModal from "./SelectAssetModal";
import TokenLogo from "./TokenLogo";

interface ExchangeViewProps {
  connectedAccount: string;
  usdcBalance: number;
  nearBalance: string;
  nusdBalance: string;
  omniUsdcBalance: string;
  onRefreshBalances?: () => void;
  lang?: "en" | "zh";
  theme?: "dark" | "beige";
}

export default function ExchangeView({
  connectedAccount,
  usdcBalance,
  nearBalance,
  nusdBalance,
  omniUsdcBalance,
  onRefreshBalances,
  lang = "en",
  theme = "dark",
}: ExchangeViewProps) {
  // Asset & Network selection state (Default: Sell Base USDC -> Receive OmniYield NUSD)
  const [sellAsset, setSellAsset] = useState<MultiChainAsset>(MULTI_CHAIN_ASSETS.USDC);
  const [sellNetwork, setSellNetwork] = useState<TokenNetwork>(
    MULTI_CHAIN_ASSETS.USDC.networks.find((n) => n.id === "base") ||
      MULTI_CHAIN_ASSETS.USDC.networks[0]
  );

  const [receiveAsset, setReceiveAsset] = useState<MultiChainAsset>(MULTI_CHAIN_ASSETS.NUSD);
  const [receiveNetwork, setReceiveNetwork] = useState<TokenNetwork>(
    MULTI_CHAIN_ASSETS.NUSD.networks[0]
  );

  const [sellAmount, setSellAmount] = useState<string>("");
  const [receiveAmount, setReceiveAmount] = useState<string>("");
  const [slippage, setSlippage] = useState<number>(0.5);
  const [isSlippageOpen, setIsSlippageOpen] = useState(false);

  // Quote & Solver state
  const [isQuoting, setIsQuoting] = useState(false);
  const [quoteDetails, setQuoteDetails] = useState<{
    source: string;
    amountOut: number;
    timeEstimateSec: number;
    routeType: string;
  } | null>(null);

  // Modal state
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [modalTarget, setModalTarget] = useState<"sell" | "receive">("sell");

  // Execution state
  const [isSwapping, setIsSwapping] = useState(false);
  const [swapResult, setSwapResult] = useState<{
    txHash: string;
    nearblocksUrl: string;
    soldAmount: string;
    soldAsset: string;
    soldChain: string;
    receivedAmount: string;
    receivedAsset: string;
    receivedChain: string;
  } | null>(null);

  // Dynamic balance resolution
  const getSelectedBalance = (asset: MultiChainAsset, network: TokenNetwork): number => {
    if (asset.symbol === "USDC") {
      if (network.id === "near") return usdcBalance;
      if (network.id === "base") return 2450.0;
      if (network.id === "sol") return 1820.0;
      if (network.id === "arb") return 3500.0;
      return 1000.0;
    }
    if (asset.symbol === "NUSD") return parseFloat(nusdBalance) || 0;
    if (asset.symbol === "OmniUSDC") return parseFloat(omniUsdcBalance) || 0;
    if (asset.symbol === "NEAR") return parseFloat(nearBalance) || 0;
    if (asset.symbol === "ETH") return 2.85;
    if (asset.symbol === "BTC") return 0.15;
    if (asset.symbol === "SOL") return 14.5;
    return 100.0;
  };

  const sellNum = parseFloat(sellAmount) || 0;

  // Fetch Live Quote from /api/intents/quote when sellAmount or pair changes
  useEffect(() => {
    if (!sellNum || sellNum <= 0) {
      setReceiveAmount("");
      setQuoteDetails(null);
      return;
    }

    let isMounted = true;
    setIsQuoting(true);

    const timer = setTimeout(async () => {
      try {
        const res = await fetch("/api/intents/quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            originAssetId: sellNetwork.defuseAssetId,
            destAssetId: receiveNetwork.defuseAssetId,
            originSymbol: sellAsset.symbol,
            originChain: sellNetwork.id,
            destSymbol: receiveAsset.symbol,
            destChain: receiveNetwork.id,
            amount: sellNum,
            slippageTolerance: Math.round(slippage * 100),
            userAccount: connectedAccount || "dao.omniyield-vault.testnet",
          }),
        });

        if (res.ok && isMounted) {
          const data = await res.json();
          if (data?.amountOut) {
            const outNum = data.amountOut;
            setReceiveAmount(
              outNum < 0.001 ? outNum.toFixed(6) : outNum.toFixed(4)
            );
            setQuoteDetails({
              source: data.source,
              amountOut: outNum,
              timeEstimateSec: data.timeEstimateSec || 2,
              routeType: data.routeType || "Solver Relay",
            });
          }
        }
      } catch (err) {
        console.warn("Quote fetch error:", err);
      } finally {
        if (isMounted) setIsQuoting(false);
      }
    }, 250);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [sellAmount, sellAsset.symbol, sellNetwork.id, receiveAsset.symbol, receiveNetwork.id, slippage]);

  // Flip Pair
  const handleFlipPair = () => {
    const tempAsset = sellAsset;
    const tempNet = sellNetwork;
    setSellAsset(receiveAsset);
    setSellNetwork(receiveNetwork);
    setReceiveAsset(tempAsset);
    setReceiveNetwork(tempNet);
    setSellAmount("");
    setReceiveAmount("");
    setSwapResult(null);
  };

  // Open asset modal for target
  const handleOpenAssetModal = (target: "sell" | "receive") => {
    setModalTarget(target);
    setIsAssetModalOpen(true);
  };

  // Modal selection callback
  const handleAssetSelected = (symbol: string, network: TokenNetwork) => {
    const selected = MULTI_CHAIN_ASSETS[symbol];
    if (!selected) return;

    if (modalTarget === "sell") {
      setSellAsset(selected);
      setSellNetwork(network);
    } else {
      setReceiveAsset(selected);
      setReceiveNetwork(network);
    }
    setSwapResult(null);
  };

  // Execute Swap via NEAR Intents
  const handleExecuteSwap = async () => {
    if (sellNum <= 0) return;
    setIsSwapping(true);
    setSwapResult(null);

    try {
      const res = await fetch("/api/transact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId: connectedAccount || "dao.omniyield-vault.testnet",
          action: "deposit",
          amount: (sellNum * sellAsset.priceUsd).toFixed(2),
          originChain: sellNetwork.name,
          destChain: receiveNetwork.name,
          vault: receiveAsset.targetVault || "usdc",
        }),
      });

      const data = await res.json();
      const txHash = data.nearTxHash || "confirmed";
      const explorerUrl = data.nearblocksUrl || `https://testnet.nearblocks.io/txns/${txHash}`;

      setSwapResult({
        txHash,
        nearblocksUrl: explorerUrl,
        soldAmount: sellNum.toString(),
        soldAsset: sellAsset.symbol,
        soldChain: sellNetwork.name,
        receivedAmount: receiveAmount || (sellNum * (sellAsset.priceUsd / receiveAsset.priceUsd)).toFixed(4),
        receivedAsset: receiveAsset.symbol,
        receivedChain: receiveNetwork.name,
      });

      if (onRefreshBalances) {
        onRefreshBalances();
      }
    } catch (err: any) {
      alert(`Swap error: ${err.message}`);
    } finally {
      setIsSwapping(false);
    }
  };

  const exchangeRate = (sellAsset.priceUsd / receiveAsset.priceUsd).toFixed(4);

  return (
    <div className="max-w-2xl mx-auto py-4 sm:py-6 px-4">
      {/* Top Header: Trezu Style Title & Settings */}
      <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-800/80">
        <div>
          <div className="flex items-center space-x-2">
            <h1
              className={`text-2xl sm:text-3xl font-black tracking-tight ${
                theme === "beige" ? "text-slate-900" : "text-white"
              }`}
            >
              {lang === "zh" ? "交换 (Exchange)" : "Exchange"}
            </h1>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500 font-mono font-bold border border-amber-500/30">
              16-Chain Intents
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {lang === "zh"
              ? "在 16 条主流公链与 OmniYield 金库份额之间安全、即时地交换代币"
              : "Exchange your tokens securely and efficiently across 16 blockchains"}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Pending pill */}
          <div
            className={`px-3 py-1 rounded-xl text-xs font-mono ${
              theme === "beige"
                ? "bg-slate-200/80 text-slate-700"
                : "bg-slate-900 border border-slate-800 text-slate-300"
            }`}
          >
            {lang === "zh" ? "待决 0" : "Pending 0"}
          </div>

          {/* Slippage Settings */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsSlippageOpen(!isSlippageOpen)}
              className={`p-2 rounded-xl transition cursor-pointer ${
                theme === "beige"
                  ? "bg-slate-200/80 hover:bg-slate-300/80 text-slate-700"
                  : "bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white"
              }`}
              title="Slippage Settings"
            >
              <Sliders className="w-4 h-4" />
            </button>

            {isSlippageOpen && (
              <div
                className={`absolute right-0 mt-2 w-56 rounded-2xl p-3 shadow-2xl z-30 text-xs space-y-2 border ${
                  theme === "beige"
                    ? "bg-[#faf6f0] border-[#dfd2be] text-slate-900"
                    : "bg-slate-950 border-slate-800 text-white"
                }`}
              >
                <div className="font-bold flex items-center justify-between">
                  <span>{lang === "zh" ? "滑点容忍度" : "Slippage Tolerance"}</span>
                  <span className="text-amber-500 font-mono">{slippage}%</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 pt-1">
                  {[0.1, 0.5, 1.0].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => {
                        setSlippage(val);
                        setIsSlippageOpen(false);
                      }}
                      className={`py-1 rounded-lg font-mono text-center transition cursor-pointer ${
                        slippage === val
                          ? "item-selected font-bold"
                          : "well-inset text-slate-600 dark:text-slate-400 hover:border-slate-400"
                      }`}
                    >
                      {val}%
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Trezu Exchange Card */}
      <div className="card-surface rounded-3xl p-5 sm:p-7 shadow-xl border transition-all">
        <div className="space-y-4">
          {/* 1. SELL BOX (Trezu pattern) */}
          <div className="well-inset p-4 rounded-2xl border transition">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5 font-medium">
              <span>{lang === "zh" ? "支付 (Sell)" : "Sell"}</span>
              <div className="flex items-center space-x-1.5">
                <span>
                  {lang === "zh" ? "余额:" : "Balance:"}{" "}
                  <strong className={theme === "beige" ? "text-slate-900 font-mono" : "text-white font-mono"}>
                    {getSelectedBalance(sellAsset, sellNetwork)} {sellAsset.symbol}
                  </strong>
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setSellAmount(getSelectedBalance(sellAsset, sellNetwork).toString())
                  }
                  className="px-1.5 py-0.5 rounded btn-secondary text-[10px] font-bold font-mono transition cursor-pointer"
                >
                  MAX
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <input
                type="number"
                min="0"
                step="any"
                placeholder="0"
                value={sellAmount}
                onChange={(e) => {
                  setSellAmount(e.target.value);
                  setSwapResult(null);
                }}
                className={`bg-transparent text-3xl sm:text-4xl font-extrabold focus:outline-none flex-1 min-w-0 font-mono ${
                  theme === "beige" ? "text-slate-900 placeholder-slate-400" : "text-white placeholder-slate-600"
                }`}
              />

              {/* Trezu Token Button: Icon + Symbol + Subtitle + Network badge */}
              <button
                type="button"
                onClick={() => handleOpenAssetModal("sell")}
                className={`flex items-center space-x-3 px-3.5 py-2 rounded-2xl border transition group cursor-pointer flex-shrink-0 ${
                  theme === "beige"
                    ? "bg-slate-100/90 hover:bg-slate-200 border-slate-300 text-slate-900 shadow-sm"
                    : "bg-slate-800/90 hover:bg-slate-800 border-slate-700 text-white shadow-md"
                }`}
              >
                {/* Token Icon with Corner Network Badge */}
                <TokenLogo
                  symbol={sellAsset.symbol}
                  networkId={sellNetwork.id}
                  size={30}
                  showNetworkBadge={true}
                />

                <div className="text-left min-w-0">
                  <span className="block font-extrabold text-xs leading-none">
                    {sellAsset.symbol}
                  </span>
                  <span className="block text-[10px] text-amber-500 font-mono leading-tight mt-0.5 truncate max-w-[95px]">
                    on {sellNetwork.name}
                  </span>
                </div>

                <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-amber-500 transition-colors flex-shrink-0" />
              </button>
            </div>

            {sellNum > 0 && (
              <div className="text-[11px] text-slate-500 font-mono mt-1">
                ≈ ${(sellNum * sellAsset.priceUsd).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
              </div>
            )}
          </div>

          {/* 2. CENTER FLIP BUTTON */}
          <div className="flex justify-center -my-2 relative z-10">
            <button
              type="button"
              onClick={handleFlipPair}
              className="w-9 h-9 rounded-2xl btn-secondary shadow-md flex items-center justify-center transition-transform hover:rotate-180 duration-300 cursor-pointer"
              title="Flip Pair"
            >
              <ArrowDown className="w-4 h-4" />
            </button>
          </div>

          {/* 3. RECEIVE BOX (Trezu pattern) */}
          <div className="well-inset p-4 rounded-2xl border transition">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5 font-medium">
              <span>{lang === "zh" ? "获得 (Receive)" : "Receive"}</span>
              <div className="flex items-center space-x-1.5">
                <span>
                  {lang === "zh" ? "余额:" : "Balance:"}{" "}
                  <strong className={theme === "beige" ? "text-slate-900 font-mono" : "text-white font-mono"}>
                    {getSelectedBalance(receiveAsset, receiveNetwork)} {receiveAsset.symbol}
                  </strong>
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center space-x-2 flex-1 min-w-0">
                <input
                  type="text"
                  readOnly
                  placeholder="0"
                  value={receiveAmount}
                  className={`bg-transparent text-3xl sm:text-4xl font-extrabold focus:outline-none flex-1 min-w-0 font-mono text-emerald-600 dark:text-emerald-400 ${
                    theme === "beige" ? "placeholder-slate-400" : "placeholder-slate-600"
                  }`}
                />
                {isQuoting && (
                  <RotateCw className="w-4 h-4 text-emerald-600 animate-spin flex-shrink-0" />
                )}
              </div>

              {/* Receive Asset Selector Button */}
              <button
                type="button"
                onClick={() => handleOpenAssetModal("receive")}
                className={`flex items-center space-x-3 px-3.5 py-2 rounded-2xl border transition group cursor-pointer flex-shrink-0 ${
                  theme === "beige"
                    ? "bg-white hover:bg-slate-50 border-slate-300 text-slate-900 shadow-sm"
                    : "bg-slate-800/90 hover:bg-slate-800 border-slate-700 text-white shadow-md"
                }`}
              >
                <TokenLogo
                  symbol={receiveAsset.symbol}
                  networkId={receiveNetwork.id}
                  size={30}
                  showNetworkBadge={true}
                />

                <div className="text-left min-w-0">
                  <span className="block font-extrabold text-xs leading-none">
                    {receiveAsset.symbol}
                  </span>
                  <span className="block text-[10px] text-emerald-600 dark:text-emerald-400 font-mono leading-tight mt-0.5 truncate max-w-[95px]">
                    on {receiveNetwork.name}
                  </span>
                </div>

                <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 transition-colors flex-shrink-0" />
              </button>
            </div>

            {parseFloat(receiveAmount) > 0 && (
              <div className="text-[11px] text-slate-500 font-mono mt-1">
                ≈ ${(parseFloat(receiveAmount) * receiveAsset.priceUsd).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
              </div>
            )}
          </div>

          {/* 4. INTENTS ROUTE DETAILS */}
          <div className="well-inset p-3.5 rounded-2xl border text-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 font-mono">
              <span>{lang === "zh" ? "参考兑换率:" : "Exchange Rate:"}</span>
              <span className={theme === "beige" ? "text-slate-800 font-bold" : "text-white font-bold"}>
                1 {sellAsset.symbol} ≈ {exchangeRate} {receiveAsset.symbol}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="flex items-center space-x-1">
                <Zap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>{lang === "zh" ? "清算网络:" : "Route Engine:"}</span>
              </span>
              <span className="text-emerald-700 dark:text-emerald-400 font-mono text-[11px] font-bold">
                {quoteDetails?.routeType || "Defuse Intent Solver"} ({sellNetwork.name} ➔ {receiveNetwork.name})
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>{lang === "zh" ? "清算最终确认时延:" : "Solver Finality:"}</span>
              </span>
              <span className="text-emerald-700 dark:text-emerald-400 font-mono text-[11px] font-bold">
                ~{quoteDetails?.timeEstimateSec || Math.max(sellNetwork.finalitySec, receiveNetwork.finalitySec)}s (Sub-Block Instant)
              </span>
            </div>
          </div>

          {/* 5. CTA BUTTON */}
          <div>
            {sellNum <= 0 ? (
              <button
                type="button"
                disabled
                className="w-full py-4 rounded-2xl well-inset text-slate-400 font-bold text-sm tracking-wide cursor-not-allowed opacity-60"
              >
                {lang === "zh" ? "请输入兑换金额" : "Enter an amount to exchange"}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleExecuteSwap}
                disabled={isSwapping}
                className="btn-primary w-full py-4 rounded-2xl font-bold text-sm tracking-wide shadow-md transition disabled:opacity-50 flex items-center justify-center space-x-2 cursor-pointer"
              >
                {isSwapping ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-slate-950 border-t-transparent animate-spin"></span>
                    <span>{lang === "zh" ? "正在执行 NEAR Intents 意图撮合..." : "Executing via NEAR Intents..."}</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-current" />
                    <span>
                      {lang === "zh"
                        ? `立即将 ${sellNum} ${sellAsset.symbol} (${sellNetwork.name}) 兑换为 ~${receiveAmount} ${receiveAsset.symbol} (${receiveNetwork.name})`
                        : `Exchange ${sellAmount} ${sellAsset.symbol} (${sellNetwork.name}) for ${receiveAsset.symbol} (${receiveNetwork.name})`}
                    </span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* 6. SWAP CONFIRMATION PROOF */}
          {swapResult && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 text-xs space-y-2">
              <div className="flex items-center justify-between font-bold">
                <span className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{lang === "zh" ? "跨链意图撮合成功！" : "Intent Exchange Confirmed!"}</span>
                </span>
                <a
                  href={swapResult.nearblocksUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center space-x-1 underline hover:text-white"
                >
                  <span>NearBlocks</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
              <p className="leading-relaxed text-slate-300">
                {lang === "zh"
                  ? `已成功将 ${swapResult.soldAmount} ${swapResult.soldAsset} (${swapResult.soldChain}) 经由 NEAR Intents 清算为 ~${swapResult.receivedAmount} ${swapResult.receivedAsset} (${swapResult.receivedChain})！`
                  : `Successfully settled ${swapResult.soldAmount} ${swapResult.soldAsset} on ${swapResult.soldChain} into ~${swapResult.receivedAmount} ${swapResult.receivedAsset} on ${swapResult.receivedChain} via solver network.`}
              </p>
            </div>
          )}

          {/* 7. TREZU EXACT FOOTER: Powered by near intents */}
          <div className="pt-3 flex items-center justify-center space-x-2 text-xs text-slate-400 font-mono">
            <span>Powered by</span>
            <span className="font-extrabold text-white flex items-center space-x-1">
              <span className="w-3.5 h-3.5 rounded-full bg-black text-cyan-400 border border-cyan-400/50 flex items-center justify-center text-[9px] font-black">
                N
              </span>
              <span className="tracking-tight text-emerald-400 font-sans">near</span>
              <span className={theme === "beige" ? "text-slate-900 font-sans font-bold" : "text-white font-sans font-bold"}>
                Intents
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Two-Level Select Asset Modal */}
      <SelectAssetModal
        isOpen={isAssetModalOpen}
        onClose={() => setIsAssetModalOpen(false)}
        onSelect={handleAssetSelected}
        selectedTokenSymbol={modalTarget === "sell" ? sellAsset.symbol : receiveAsset.symbol}
        selectedNetworkId={modalTarget === "sell" ? sellNetwork.id : receiveNetwork.id}
        title={modalTarget === "sell" ? (lang === "zh" ? "选择支付资产" : "Select Pay Asset") : (lang === "zh" ? "选择接收资产" : "Select Receive Asset")}
        lang={lang}
        theme={theme}
      />
    </div>
  );
}
