"use client";

import React, { useState } from "react";
import {
  X,
  Search,
  ChevronRight,
  ArrowLeft,
  Check,
  Zap,
} from "lucide-react";
import TokenLogo, { NetworkLogo, getNetworkLogoPath } from "./TokenLogo";
import {
  MULTI_CHAIN_ASSETS,
  MultiChainAsset,
  TokenNetwork,
} from "../config/intentsTokens";

interface SelectAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (tokenSymbol: string, network: TokenNetwork) => void;
  selectedTokenSymbol?: string;
  selectedNetworkId?: string;
  title?: string;
  lang?: "en" | "zh";
  theme?: "dark" | "beige";
}

export default function SelectAssetModal({
  isOpen,
  onClose,
  onSelect,
  selectedTokenSymbol,
  selectedNetworkId,
  title = "Select Asset",
  lang = "en",
  theme = "dark",
}: SelectAssetModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAssetForNetworks, setSelectedAssetForNetworks] =
    useState<MultiChainAsset | null>(null);

  if (!isOpen) return null;

  // Filter assets based on search query
  const assetsList = Object.values(MULTI_CHAIN_ASSETS);
  const q = searchQuery.trim().toLowerCase();

  const filteredAssets = assetsList.filter((asset) => {
    if (!q) return true;
    if (asset.symbol.toLowerCase().includes(q)) return true;
    if (asset.name.toLowerCase().includes(q)) return true;
    return asset.networks.some(
      (n) => n.name.toLowerCase().includes(q) || n.id.toLowerCase().includes(q)
    );
  });

  // Filter networks if viewing networks of a specific asset
  const filteredNetworks = selectedAssetForNetworks
    ? selectedAssetForNetworks.networks.filter((n) => {
        if (!q) return true;
        return (
          n.name.toLowerCase().includes(q) ||
          n.id.toLowerCase().includes(q) ||
          n.badgeText.toLowerCase().includes(q) ||
          n.contractAddress.toLowerCase().includes(q)
        );
      })
    : [];

  const handleAssetClick = (asset: MultiChainAsset) => {
    if (asset.networks.length === 1) {
      onSelect(asset.symbol, asset.networks[0]);
      onClose();
    } else {
      setSelectedAssetForNetworks(asset);
      setSearchQuery("");
    }
  };

  const handleNetworkClick = (network: TokenNetwork) => {
    if (!selectedAssetForNetworks) return;
    onSelect(selectedAssetForNetworks.symbol, network);
    setSelectedAssetForNetworks(null);
    onClose();
  };

  const handleBackToAssets = () => {
    setSelectedAssetForNetworks(null);
    setSearchQuery("");
  };

  return (
    <div className="fixed inset-0 z-[130] overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={() => {
          setSelectedAssetForNetworks(null);
          onClose();
        }}
        aria-hidden="true"
      />

      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <div
          className={`relative w-full max-w-md rounded-3xl p-6 shadow-2xl text-left border transition-all z-10 flex flex-col max-h-[85vh] ${
            theme === "beige"
              ? "bg-[#faf6f0] border-[#dfd2be] text-[#171d26]"
              : "bg-slate-950 border-slate-800 text-slate-100 shadow-[0_0_50px_rgba(0,0,0,0.8)]"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className={`flex items-center justify-between pb-3.5 border-b flex-shrink-0 ${
              theme === "beige" ? "border-slate-300" : "border-slate-800/80"
            }`}
          >
            {selectedAssetForNetworks ? (
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleBackToAssets}
                  className={`p-1.5 rounded-lg transition cursor-pointer ${
                    theme === "beige"
                      ? "text-slate-600 hover:text-black hover:bg-slate-200"
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                  title="Back to Assets"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center space-x-2">
                  <TokenLogo symbol={selectedAssetForNetworks.symbol} size={26} />
                  <h3
                    className={`font-extrabold text-base flex items-center space-x-1.5 ${
                      theme === "beige" ? "text-slate-900" : "text-white"
                    }`}
                  >
                    <span>{selectedAssetForNetworks.symbol}</span>
                    <span className="text-xs text-slate-400 font-normal">
                      ({selectedAssetForNetworks.networks.length} {lang === "zh" ? "条网络" : "Networks"})
                    </span>
                  </h3>
                </div>
              </div>
            ) : (
              <div>
                <h3
                  className={`font-extrabold text-base ${
                    theme === "beige" ? "text-slate-900" : "text-white"
                  }`}
                >
                  {lang === "zh" ? "选择资产 (Select Asset)" : title}
                </h3>
                <p className="text-[11px] text-slate-400">
                  {lang === "zh" ? "直通 16 条主流公链原生跨链清算" : "Select an asset to exchange"}
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                setSelectedAssetForNetworks(null);
                onClose();
              }}
              className={`p-1.5 rounded-xl transition cursor-pointer ${
                theme === "beige"
                  ? "text-slate-600 hover:text-black hover:bg-slate-200"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Bar (Trezu 'Q Search by name') */}
          <div className="my-3 flex-shrink-0">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 absolute left-3.5 text-slate-500 pointer-events-none" />
              <input
                type="text"
                placeholder={
                  selectedAssetForNetworks
                    ? lang === "zh"
                      ? `搜索 ${selectedAssetForNetworks.symbol} 所在网络 (如 Base, Solana)...`
                      : `Search network (e.g. Base, Solana, Arbitrum)...`
                    : lang === "zh"
                    ? "按名称或代币符号搜索..."
                    : "Search by name or symbol..."
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 rounded-2xl border text-xs font-mono focus:outline-none transition ${
                  theme === "beige"
                    ? "bg-slate-100 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-amber-500"
                    : "bg-slate-900 border-slate-800 text-white placeholder-slate-500 focus:border-amber-500"
                }`}
              />
            </div>
          </div>

          {/* Body Content */}
          <div className="flex-1 min-h-0 overflow-y-auto space-y-1.5 pr-1">
            {!selectedAssetForNetworks ? (
              /* STEP 1: ASSET LIST (Trezu Exact: Icon + Symbol + 'X Networks' Subtitle) */
              filteredAssets.length > 0 ? (
                filteredAssets.map((asset) => {
                  const isSelected = selectedTokenSymbol === asset.symbol;
                  return (
                    <button
                      key={asset.symbol}
                      type="button"
                      onClick={() => handleAssetClick(asset)}
                      className={`w-full p-3 rounded-2xl border transition flex items-center justify-between text-left group cursor-pointer ${
                        isSelected
                          ? "bg-amber-500/15 border-amber-500/40 text-amber-500 shadow-sm"
                          : theme === "beige"
                          ? "bg-white/80 hover:bg-white border-[#dfd2be] text-slate-800"
                          : "bg-slate-900/60 hover:bg-slate-900 border-slate-800/80 text-white"
                      }`}
                    >
                      <div className="flex items-center space-x-3.5">
                        <TokenLogo symbol={asset.symbol} size={36} />
                        <div className="min-w-0">
                          <div className="flex items-center space-x-1.5">
                            <span
                              className={`font-extrabold text-sm ${
                                theme === "beige" ? "text-slate-900" : "text-white"
                              }`}
                            >
                              {asset.symbol}
                            </span>
                            {asset.isVaultReceipt && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-mono font-bold">
                                VAULT
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400 block font-normal leading-tight mt-0.5 truncate">
                            {asset.networks.length > 1
                              ? `${asset.networks.length} ${lang === "zh" ? "条网络" : "Networks"}`
                              : asset.name}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 text-right">
                        {asset.networks.length > 1 && (
                          <span className="text-xs text-amber-500 font-mono font-semibold">
                            {asset.networks.length} Chains
                          </span>
                        )}
                        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-500 transition-colors" />
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="py-8 text-center text-xs text-slate-500 font-mono">
                  No assets found matching "{searchQuery}"
                </div>
              )
            ) : (
              /* STEP 2: NETWORK PICKER FOR SELECTED ASSET (All 16 Networks for USDC) */
              filteredNetworks.length > 0 ? (
                filteredNetworks.map((net) => {
                  const isCurrentNetwork =
                    selectedTokenSymbol === selectedAssetForNetworks.symbol &&
                    selectedNetworkId === net.id;
                  return (
                    <button
                      key={net.id}
                      type="button"
                      onClick={() => handleNetworkClick(net)}
                      className={`w-full p-3 rounded-2xl border transition flex items-center justify-between text-left group cursor-pointer ${
                        isCurrentNetwork
                          ? "bg-amber-500/15 border-amber-500/50 text-white shadow-sm"
                          : theme === "beige"
                          ? "bg-white/80 hover:bg-white border-[#dfd2be] text-slate-800"
                          : "bg-slate-900/60 hover:bg-slate-900 border-slate-800/80 text-white"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <NetworkLogo networkId={net.id} name={net.name} size={32} />
                        <div className="min-w-0">
                          <div className="flex items-center space-x-2">
                            <span
                              className={`font-bold text-xs ${
                                theme === "beige" ? "text-slate-900" : "text-white"
                              }`}
                            >
                              {net.name}
                            </span>
                            {net.popular && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 font-mono font-bold">
                                Hot
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono block truncate max-w-[190px]">
                            {net.contractAddress === "native"
                              ? "Native Gas Asset"
                              : `${net.contractAddress.slice(0, 8)}...${net.contractAddress.slice(-6)}`}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <div className="text-right">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono font-bold block">
                            ~{net.finalitySec}s
                          </span>
                          <span className="text-[9px] text-slate-500 font-mono uppercase mt-0.5 block">
                            {net.chainType}
                          </span>
                        </div>
                        {isCurrentNetwork && <Check className="w-4 h-4 text-amber-400 flex-shrink-0" />}
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="py-8 text-center text-xs text-slate-500 font-mono">
                  No networks found matching "{searchQuery}"
                </div>
              )
            )}
          </div>

          {/* Footer Note */}
          <div
            className={`pt-3 border-t mt-2 flex items-center justify-between text-[11px] font-mono flex-shrink-0 ${
              theme === "beige" ? "border-slate-300 text-slate-600" : "border-slate-800/80 text-slate-400"
            }`}
          >
            <span className="flex items-center space-x-1">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>NEAR Intents Engine</span>
            </span>
            <span className="text-emerald-500 font-bold">0 Gas Sponsored</span>
          </div>
        </div>
      </div>
    </div>
  );
}
