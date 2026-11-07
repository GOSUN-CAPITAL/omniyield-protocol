import { NextResponse } from "next/server";
import { getAccountVaultBalances, resetAccountVaultBalances, syncAccountVaultBalances } from "../../../lib/vaultLedger";

const RPC_ENDPOINTS = [
  "https://test.rpc.fastnear.com",
  "https://rpc.testnet.near.org",
];

const CIRCLE_USDC = "3e2210e1184b45b64c8a434c0a7e7b23cc04ea7eb7a6c3c32520d03d4afcb8af";
const VAULT_CONTRACT = "omniyield-vault.testnet";

async function queryRpc(method: string, params: any) {
  let lastErr = null;
  for (const rpcUrl of RPC_ENDPOINTS) {
    try {
      const res = await fetch(rpcUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: "bal-query",
          method,
          params,
        }),
        cache: "no-store",
      });
      const data = await res.json();
      if (data.result) return data.result;
    } catch (e) {
      lastErr = e;
    }
  }
  return null;
}

const EVM_NETWORKS: Record<string, { name: string; rpc: string; usdc: string }> = {
  Arbitrum: {
    name: "Arbitrum Sepolia",
    rpc: "https://sepolia-rollup.arbitrum.io/rpc",
    usdc: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d",
  },
  Base: {
    name: "Base Sepolia",
    rpc: "https://sepolia.base.org",
    usdc: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
  },
  Ethereum: {
    name: "Ethereum Sepolia",
    rpc: "https://1rpc.io/sepolia",
    usdc: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
  },
};

async function queryEvmOnChainBalances(address: string, chainName = "Arbitrum") {
  const cleanAddr = address.toLowerCase().replace("0x", "").padStart(64, "0");
  const callData = `0x70a08231${cleanAddr}`;
  const net = EVM_NETWORKS[chainName] || EVM_NETWORKS.Arbitrum;

  let usdc = 0;
  let ethGas = "0.0000";

  // 1. Query ERC-20 USDC on target chain
  try {
    const res = await fetch(net.rpc, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "eth_call",
        params: [{ to: net.usdc, data: callData }, "latest"],
      }),
      cache: "no-store",
    }).then((r) => r.json());

    if (res?.result && res.result !== "0x") {
      const units = BigInt(res.result);
      usdc = Number(units) / 1_000_000;
    }
  } catch (err) {
    console.warn(`[EVM Balance] ${net.name} USDC query error:`, err);
  }

  // Fallback: If 0 on target, also check Base or Arbitrum to be helpful
  if (usdc === 0) {
    const fallbackKey = chainName === "Arbitrum" ? "Base" : "Arbitrum";
    const altNet = EVM_NETWORKS[fallbackKey];
    try {
      const altRes = await fetch(altNet.rpc, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "eth_call",
          params: [{ to: altNet.usdc, data: callData }, "latest"],
        }),
        cache: "no-store",
      }).then((r) => r.json());
      if (altRes?.result && altRes.result !== "0x") {
        const units = BigInt(altRes.result);
        const altUsdc = Number(units) / 1_000_000;
        if (altUsdc > 0) {
          usdc = altUsdc;
        }
      }
    } catch (_) {}
  }

  // 2. Query native ETH Gas balance
  try {
    const ethRes = await fetch(net.rpc, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 2,
        method: "eth_getBalance",
        params: [address, "latest"],
      }),
      cache: "no-store",
    }).then((r) => r.json());

    if (ethRes?.result && ethRes.result !== "0x") {
      const wei = BigInt(ethRes.result);
      ethGas = (Number(wei / BigInt("1000000000000000")) / 1000).toFixed(4);
    }
  } catch (_) {}

  return { usdc, ethGas };
}

function isSolanaAddress(acc: string): boolean {
  if (!acc || typeof acc !== "string") return false;
  if (acc.startsWith("0x") || acc.includes(".")) return false;
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(acc);
}

const SOLANA_RPCS = [
  "https://api.devnet.solana.com",
  "https://api.testnet.solana.com",
];

const SOLANA_USDC_MINTS = [
  "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU", // Circle Devnet USDC
  "CpMah17kQEL2wqyMKt3mZBdUMgN5kujUgqqM5v62mU81", // Alternative Testnet mint
];

async function querySolanaOnChainBalances(address: string) {
  let usdc = 0;
  let solGas = "0.0000";

  for (const rpc of SOLANA_RPCS) {
    try {
      // 1. SOL Gas Balance
      const solRes = await fetch(rpc, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "getBalance",
          params: [address],
        }),
        cache: "no-store",
      }).then((r) => r.json());

      if (solRes?.result?.value !== undefined) {
        const lamports = BigInt(solRes.result.value);
        solGas = (Number(lamports) / 1e9).toFixed(4);
      }

      // 2. Query Specific USDC SPL Mints
      for (const mint of SOLANA_USDC_MINTS) {
        try {
          const tokenRes = await fetch(rpc, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              jsonrpc: "2.0",
              id: 2,
              method: "getTokenAccountsByOwner",
              params: [
                address,
                { mint },
                { encoding: "jsonParsed" },
              ],
            }),
            cache: "no-store",
          }).then((r) => r.json());

          if (tokenRes?.result?.value && Array.isArray(tokenRes.result.value)) {
            for (const acc of tokenRes.result.value) {
              const uiAmt = acc?.account?.data?.parsed?.info?.tokenAmount?.uiAmount;
              if (typeof uiAmt === "number" && uiAmt > 0) {
                usdc = Math.max(usdc, uiAmt);
              }
            }
          }
        } catch (_) {}
      }

      // 3. Fallback: Any token accounts under SPL token program
      if (usdc === 0) {
        try {
          const allTokensRes = await fetch(rpc, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              jsonrpc: "2.0",
              id: 3,
              method: "getTokenAccountsByOwner",
              params: [
                address,
                { programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" },
                { encoding: "jsonParsed" },
              ],
            }),
            cache: "no-store",
          }).then((r) => r.json());

          if (allTokensRes?.result?.value && Array.isArray(allTokensRes.result.value)) {
            for (const acc of allTokensRes.result.value) {
              const uiAmt = acc?.account?.data?.parsed?.info?.tokenAmount?.uiAmount;
              if (typeof uiAmt === "number" && uiAmt > 0) {
                usdc = Math.max(usdc, uiAmt);
              }
            }
          }
        } catch (_) {}
      }

      if (usdc > 0 || parseFloat(solGas) > 0) break;
    } catch (err) {
      console.warn(`Solana query error on ${rpc}:`, err);
    }
  }

  return { usdc, solGas };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const accountId = searchParams.get("account");
  const chain = searchParams.get("chain") || "Arbitrum";

  if (!accountId) {
    return NextResponse.json({ error: "Missing account query parameter" }, { status: 400 });
  }

  // Handle EVM (MetaMask / Arbitrum / Base) Accounts
  if (accountId.startsWith("0x")) {
    if (searchParams.get("reset") === "true") {
      resetAccountVaultBalances(accountId, 0.00, 0.00);
    }
    const syncOmniUsdc = searchParams.get("syncOmniUsdc");
    const syncNusd = searchParams.get("syncNusd");
    if (syncOmniUsdc !== null || syncNusd !== null) {
      const parsedOmni = syncOmniUsdc !== null ? parseFloat(syncOmniUsdc) : undefined;
      const parsedNusd = syncNusd !== null ? parseFloat(syncNusd) : undefined;
      syncAccountVaultBalances(accountId, parsedNusd, parsedOmni);
    }

    // Direct Authoritative On-Chain RPC Query for EVM USDC & ETH
    const evmBal = await queryEvmOnChainBalances(accountId, chain);
    const partition = getAccountVaultBalances(accountId);

    return NextResponse.json({
      accountId,
      chain,
      nearBalance: evmBal.ethGas,
      usdcBalance: evmBal.usdc,
      nusdBalance: partition.nusd.toFixed(2),
      omniUsdcBalance: partition.omniUsdc.toFixed(2),
      onChainShares: (partition.nusd + partition.omniUsdc).toFixed(2),
      isEVM: true,
    });
  }

  // Handle Solana (Phantom / Solflare) Accounts
  if (isSolanaAddress(accountId)) {
    if (searchParams.get("reset") === "true") {
      resetAccountVaultBalances(accountId, 0.00, 0.00);
    }
    const syncOmniUsdc = searchParams.get("syncOmniUsdc");
    const syncNusd = searchParams.get("syncNusd");
    if (syncOmniUsdc !== null || syncNusd !== null) {
      const parsedOmni = syncOmniUsdc !== null ? parseFloat(syncOmniUsdc) : undefined;
      const parsedNusd = syncNusd !== null ? parseFloat(syncNusd) : undefined;
      syncAccountVaultBalances(accountId, parsedNusd, parsedOmni);
    }

    const solBal = await querySolanaOnChainBalances(accountId);
    const partition = getAccountVaultBalances(accountId);

    return NextResponse.json({
      accountId,
      chain: "Solana",
      nearBalance: solBal.solGas, // Native SOL gas
      usdcBalance: solBal.usdc,
      nusdBalance: partition.nusd.toFixed(2),
      omniUsdcBalance: partition.omniUsdc.toFixed(2),
      onChainShares: (partition.nusd + partition.omniUsdc).toFixed(2),
      isSolana: true,
    });
  }

  try {
    const argsBase64 = Buffer.from(JSON.stringify({ account_id: accountId })).toString("base64");

    // 1. Query NEAR balance
    const viewRes = await queryRpc("query", {
      request_type: "view_account",
      finality: "optimistic",
      account_id: accountId,
    });

    let nearBalance = "0.00";
    if (viewRes && viewRes.amount) {
      const yocto = BigInt(viewRes.amount);
      const nearVal = Number(yocto / BigInt("100000000000000000000")) / 10000;
      nearBalance = nearVal.toFixed(2);
    }

    // 2. Query Circle Native USDC balance
    const usdcRes = await queryRpc("query", {
      request_type: "call_function",
      finality: "optimistic",
      account_id: CIRCLE_USDC,
      method_name: "ft_balance_of",
      args_base64: argsBase64,
    });

    let usdcBalance = 0;
    if (usdcRes && usdcRes.result) {
      try {
        const decoded = Buffer.from(usdcRes.result).toString();
        const clean = JSON.parse(decoded);
        usdcBalance = Number(BigInt(clean)) / 1_000_000;
      } catch (e) {
        console.error("Error parsing USDC balance:", e);
      }
    }

    // 3. Query NUSD Vault balance
    const nusdRes = await queryRpc("query", {
      request_type: "call_function",
      finality: "optimistic",
      account_id: VAULT_CONTRACT,
      method_name: "ft_balance_of",
      args_base64: argsBase64,
    });

    let onChainShares = 0;
    let nusdBalance = "0.00";
    if (nusdRes && nusdRes.result) {
      try {
        const decoded = Buffer.from(nusdRes.result).toString();
        const clean = JSON.parse(decoded);
        onChainShares = Number(BigInt(clean)) / 1_000_000;
        nusdBalance = onChainShares.toFixed(2);
      } catch (e) {
        console.error("Error parsing NUSD balance:", e);
      }
    }

    // Dual-vault partition accounting
    if (searchParams.get("calibrate") === "true") {
      resetAccountVaultBalances(accountId, 9.00, 2.94);
    }
    const syncOmniUsdc = searchParams.get("syncOmniUsdc");
    const syncNusd = searchParams.get("syncNusd");
    if (syncOmniUsdc !== null || syncNusd !== null) {
      const parsedOmni = syncOmniUsdc !== null ? parseFloat(syncOmniUsdc) : undefined;
      const parsedNusd = syncNusd !== null ? parseFloat(syncNusd) : undefined;
      syncAccountVaultBalances(accountId, parsedNusd, parsedOmni);
    }
    let partition = getAccountVaultBalances(accountId);

    // If on-chain shares exist but both partitions are zero, reconcile to All-Weather OmniUSDC
    if (onChainShares > 0 && partition.omniUsdc === 0 && partition.nusd === 0) {
      partition = { nusd: 0.00, omniUsdc: onChainShares };
      resetAccountVaultBalances(accountId, 0.00, onChainShares);
    }

    return NextResponse.json({
      accountId,
      nearBalance,
      usdcBalance,
      nusdBalance: partition.nusd.toFixed(2),
      omniUsdcBalance: partition.omniUsdc.toFixed(2),
      onChainShares: onChainShares.toFixed(2),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to query balances" }, { status: 500 });
  }
}

