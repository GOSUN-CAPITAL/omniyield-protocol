import { NextResponse } from "next/server";
import { getAccountVaultBalances, resetAccountVaultBalances } from "../../../lib/vaultLedger";

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

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const accountId = searchParams.get("account");

  if (!accountId) {
    return NextResponse.json({ error: "Missing account query parameter" }, { status: 400 });
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
      resetAccountVaultBalances(accountId, 1.00, 0.94);
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

