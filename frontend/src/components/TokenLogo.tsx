"use client";

import React, { useState } from "react";

interface TokenLogoProps {
  symbol: string;
  size?: number; // width & height in px, e.g. 36
  networkId?: string; // e.g. 'base' | 'arb' | 'sol' | 'near' | 'eth'
  className?: string;
  showNetworkBadge?: boolean;
}

// Map token symbol to official SVG path
export function getTokenLogoPath(symbol: string): string {
  const s = symbol.trim().toUpperCase();

  switch (s) {
    case "USDC":
      return "/logos/usdc.svg";
    case "USDT":
      return "/logos/usdt.svg";
    case "ETH":
    case "WETH":
      return "/logos/eth.svg";
    case "BTC":
    case "CBBTC":
    case "WBTC":
      return "/logos/btc.svg";
    case "NEAR":
    case "WNEAR":
      return "/logos/near.svg";
    case "SOL":
    case "WSOL":
      return "/logos/sol.svg";
    case "NUSD":
      return "/logos/nusd.svg";
    case "OMNIUSDC":
    case "GOSUN":
      return "/logos/omniyield.svg";
    case "USDY":
      return "/logos/usdy.svg";
    case "PAXG":
      return "/logos/paxg.svg";
    case "QQQ":
      return "/logos/qqq.svg";
    case "SPY":
    case "SPX":
      return "/logos/spy.svg";
    case "AAPL":
      return "/logos/aapl.svg";
    case "NVDA":
      return "/logos/nvda.svg";
    case "MSFT":
      return "/logos/msft.svg";
    case "GOOGL":
    case "GOOG":
      return "/logos/googl.svg";
    case "AMZN":
      return "/logos/amzn.svg";
    case "META":
      return "/logos/meta.svg";
    case "TSLA":
      return "/logos/tsla.svg";
    case "COIN":
      return "/logos/coin.svg";
    case "RHEA":
      return "/logos/rhea.svg";
    default:
      return `/logos/${symbol.toLowerCase()}.svg`;
  }
}

// Map network identifier to official SVG path
export function getNetworkLogoPath(networkId: string): string {
  const n = networkId.trim().toLowerCase();
  switch (n) {
    case "base":
      return "/logos/base.svg";
    case "arb":
    case "arbitrum":
    case "arbitrum one":
      return "/logos/arb.svg";
    case "sol":
    case "solana":
      return "/logos/sol.svg";
    case "near":
    case "near protocol":
      return "/logos/near.svg";
    case "eth":
    case "ethereum":
    case "ethereum mainnet":
      return "/logos/eth.svg";
    case "btc":
    case "bitcoin":
      return "/logos/btc.svg";
    case "pol":
    case "polygon":
    case "polygon pos":
      return "/logos/pol.svg";
    case "op":
    case "optimism":
      return "/logos/op.svg";
    case "avax":
    case "avalanche":
    case "avalanche c-chain":
      return "/logos/avax.svg";
    case "bsc":
    case "bnb":
    case "binance":
    case "bnb chain":
      return "/logos/bsc.svg";
    case "sui":
      return "/logos/sui.svg";
    case "aptos":
    case "apt":
      return "/logos/aptos.svg";
    case "gnosis":
    case "gno":
    case "gnosis chain":
      return "/logos/gnosis.svg";
    case "stellar":
    case "xlm":
      return "/logos/stellar.svg";
    case "monad":
      return "/logos/monad.svg";
    case "xlayer":
    case "okx":
    case "okx x layer":
      return "/logos/xlayer.svg";
    case "hypercore":
    case "hyperliquid":
    case "hype":
      return "/logos/hypercore.svg";
    default:
      return `/logos/${n}.svg`;
  }
}

export interface NetworkLogoProps {
  networkId: string;
  name?: string;
  size?: number; // e.g. 32
  className?: string;
}

export function NetworkLogo({
  networkId,
  name,
  size = 32,
  className = "",
}: NetworkLogoProps) {
  const [failed, setFailed] = useState(false);
  const path = getNetworkLogoPath(networkId);

  return (
    <div
      className={`relative inline-flex items-center justify-center flex-shrink-0 select-none ${className}`}
      style={{ width: size, height: size }}
      title={name || networkId}
    >
      {!failed ? (
        <img
          src={path}
          alt={name || networkId}
          className="w-full h-full object-contain rounded-xl shadow-sm"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="w-full h-full rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-white font-bold text-[10px] shadow-sm uppercase">
          {networkId.slice(0, 3)}
        </div>
      )}
    </div>
  );
}

export default function TokenLogo({
  symbol,
  size = 36,
  networkId,
  className = "",
  showNetworkBadge = false,
}: TokenLogoProps) {
  const [useFallback, setUseFallback] = useState(false);
  const [badgeFallback, setBadgeFallback] = useState(false);

  const logoPath = getTokenLogoPath(symbol);
  const networkPath = networkId ? getNetworkLogoPath(networkId) : null;

  const badgeSize = Math.max(12, Math.round(size * 0.38));

  return (
    <div
      className={`relative inline-flex items-center justify-center flex-shrink-0 select-none ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Primary Token Official SVG Icon */}
      {!useFallback ? (
        <img
          src={logoPath}
          alt={symbol}
          className="w-full h-full object-contain rounded-full shadow-sm"
          onError={() => setUseFallback(true)}
        />
      ) : (
        /* Graceful Vector Fallback */
        <div
          className="w-full h-full rounded-full bg-gradient-to-tr from-slate-800 to-slate-700 border border-slate-600 flex items-center justify-center text-white font-bold text-xs shadow-sm"
        >
          {symbol.slice(0, 3).toUpperCase()}
        </div>
      )}

      {/* Optional Uniswap-Style Sub-Network Overlay Badge */}
      {(showNetworkBadge || networkId) && networkPath && !badgeFallback && (
        <div
          className="absolute -bottom-0.5 -right-0.5 rounded-full bg-white dark:bg-slate-900 p-0.5 shadow-md flex items-center justify-center border border-slate-200 dark:border-slate-800"
          style={{ width: badgeSize + 2, height: badgeSize + 2 }}
          title={`Network: ${networkId}`}
        >
          <img
            src={networkPath}
            alt={networkId || ""}
            className="w-full h-full object-contain rounded-full"
            onError={() => setBadgeFallback(true)}
          />
        </div>
      )}
    </div>
  );
}

