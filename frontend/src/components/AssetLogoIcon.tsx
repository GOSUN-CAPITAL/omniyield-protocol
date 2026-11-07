"use client";

import React from "react";

interface AssetLogoIconProps {
  symbol: string;
  className?: string;
}

export default function AssetLogoIcon({
  symbol,
  className = "w-6 h-6",
}: AssetLogoIconProps) {
  const sym = symbol.toUpperCase();

  switch (sym) {
    case "AAPL":
      return (
        <img
          src="/logos/aapl.svg"
          alt="Apple Inc."
          className={`${className} object-contain`}
        />
      );

    case "NVDA":
      return (
        <img
          src="/logos/nvda.svg"
          alt="NVIDIA Corporation"
          className={`${className} object-contain`}
        />
      );

    case "MSFT":
      return (
        <img
          src="/logos/msft.svg"
          alt="Microsoft Corporation"
          className={`${className} object-contain`}
        />
      );

    case "GOOGL":
    case "GOOG":
      return (
        <img
          src="/logos/googl.svg"
          alt="Alphabet Inc."
          className={`${className} object-contain`}
        />
      );

    case "AMZN":
      return (
        <img
          src="/logos/amzn.svg"
          alt="Amazon.com, Inc."
          className={`${className} object-contain`}
        />
      );

    case "META":
      return (
        <img
          src="/logos/meta.svg"
          alt="Meta Platforms, Inc."
          className={`${className} object-contain`}
        />
      );

    case "TSLA":
      return (
        <img
          src="/logos/tsla.svg"
          alt="Tesla, Inc."
          className={`${className} object-contain`}
        />
      );

    case "COIN":
      return (
        <img
          src="/logos/coin.svg"
          alt="Coinbase Global"
          className={`${className} object-contain`}
        />
      );

    case "SPY":
    case "SPX":
      return (
        <img
          src="/logos/spy.svg"
          alt="S&P 500 Index"
          className={`${className} object-contain`}
        />
      );

    case "QQQ":
      return (
        <img
          src="/logos/qqq.svg"
          alt="Nasdaq 100 QQQ"
          className={`${className} object-contain rounded-lg`}
        />
      );

    case "BTC":
      return (
        <img
          src="/logos/btc.svg"
          alt="Bitcoin"
          className={`${className} object-contain`}
        />
      );

    case "ETH":
      return (
        <img
          src="/logos/eth.svg"
          alt="Ethereum"
          className={`${className} object-contain`}
        />
      );

    case "NEAR":
      return (
        <img
          src="/logos/near.svg"
          alt="NEAR Protocol"
          className={`${className} object-contain`}
        />
      );

    case "SOL":
      return (
        <img
          src="/logos/sol.svg"
          alt="Solana"
          className={`${className} object-contain`}
        />
      );

    case "USDC":
      return (
        <img
          src="/logos/usdc.svg"
          alt="USD Coin"
          className={`${className} object-contain`}
        />
      );

    case "USDY":
      return (
        <img
          src="/logos/usdy.svg"
          alt="Ondo USDY"
          className={`${className} object-contain`}
        />
      );

    case "PAXG":
      return (
        <img
          src="/logos/paxg.svg"
          alt="PAX Gold"
          className={`${className} object-contain`}
        />
      );

    case "RHEA":
      return (
        <img
          src="/logos/rhea.svg"
          alt="Rhea Finance"
          className={`${className} object-contain`}
        />
      );

    case "NUSD":
      return (
        <img
          src="/logos/nusd.svg"
          alt="OmniYield NUSD"
          className={`${className} object-contain`}
        />
      );

    case "OMNIUSDC":
      return (
        <img
          src="/logos/nusd.svg"
          alt="OmniUSDC All-Weather"
          className={`${className} object-contain hue-rotate-180`}
        />
      );

    default:
      return (
        <div className={`rounded-xl bg-slate-800 flex items-center justify-center font-bold text-white text-xs ${className}`}>
          {sym.slice(0, 2)}
        </div>
      );
  }
}

