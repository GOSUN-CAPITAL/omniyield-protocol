import { NextResponse } from "next/server";
import { Account, actions } from "near-api-js";

const RPC_ENDPOINTS = [
  "https://test.rpc.fastnear.com",
  "https://rpc.testnet.near.org",
];

const VAULT_CONTRACT = "omniyield-vault.testnet";

const KNOWN_KEYS: Record<string, string> = {
  "dao.omniyield-vault.testnet":
    "ed25519:MHSQ1YCQQHGcQonTAQgH4TGSHw9ebZeY6w7JjXxDpkxmagrXeJmZWv4P6RPFqXbsW926Mfs1JkdjyBTkzUY4whA",
  "omniyield-vault.testnet":
    "ed25519:2rRuiR3sG6EoLgEuUmqrgnPg7jZXDR7UTEXwdG6FW4kCxqbuzvSVdnvAX5dYh7PA9WYbPYZLUdC2CDt7TGacEA91",
};

async function queryRpc(method: string, params: any) {
  let lastErr = null;
  for (const rpcUrl of RPC_ENDPOINTS) {
    try {
      const res = await fetch(rpcUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: "fees-query",
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

export async function GET() {
  try {
    const res = await queryRpc("query", {
      request_type: "call_function",
      finality: "optimistic",
      account_id: VAULT_CONTRACT,
      method_name: "get_fee_config",
      args_base64: Buffer.from("{}").toString("base64"),
    });

    if (res && res.result) {
      const decodedStr = Buffer.from(res.result).toString("utf-8");
      const config = JSON.parse(decodedStr);
      return NextResponse.json(config);
    }

    return NextResponse.json({
      performance_fee_bps: 1000,
      management_fee_bps: 50,
      performance_fee_recipient: "dao.omniyield-vault.testnet",
      management_fee_recipient: "dao.omniyield-vault.testnet",
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      accountId,
      performance_fee_bps,
      management_fee_bps,
      performance_fee_recipient,
      management_fee_recipient,
    } = body;

    const caller = accountId;
    if (caller !== "dao.omniyield-vault.testnet" && caller !== "omniyield-vault.testnet") {
      return NextResponse.json(
        {
          error: `Unauthorized: Account '${caller}' is not the vault Multi-Sig DAO owner. Only dao.omniyield-vault.testnet can configure fees.`,
        },
        { status: 403 }
      );
    }
    const privateKey = KNOWN_KEYS[caller];

    const txActions: any[] = [];

    if (typeof performance_fee_bps === "number") {
      txActions.push(
        actions.functionCall(
          "set_performance_fee",
          { fee_bps: performance_fee_bps },
          BigInt("30000000000000"),
          BigInt(0)
        )
      );
    }

    if (typeof management_fee_bps === "number") {
      txActions.push(
        actions.functionCall(
          "set_management_fee",
          { fee_bps: management_fee_bps },
          BigInt("30000000000000"),
          BigInt(0)
        )
      );
    }

    if (performance_fee_recipient !== undefined) {
      txActions.push(
        actions.functionCall(
          "set_performance_fee_recipient",
          { recipient: performance_fee_recipient || null },
          BigInt("30000000000000"),
          BigInt(0)
        )
      );
    }

    if (management_fee_recipient !== undefined) {
      txActions.push(
        actions.functionCall(
          "set_management_fee_recipient",
          { recipient: management_fee_recipient || null },
          BigInt("30000000000000"),
          BigInt(0)
        )
      );
    }

    if (txActions.length === 0) {
      return NextResponse.json({ error: "No fee fields to update" }, { status: 400 });
    }

    for (const rpcUrl of RPC_ENDPOINTS) {
      try {
        const acc = new Account(caller, rpcUrl, privateKey as any);
        const outcome = await acc.signAndSendTransaction({
          receiverId: VAULT_CONTRACT,
          actions: txActions,
        });

        const txHash = outcome.transaction?.hash || outcome.transaction_outcome?.id;
        return NextResponse.json({
          success: true,
          txHash,
          txUrl: `https://testnet.nearblocks.io/txns/${txHash}`,
        });
      } catch (err: any) {
        console.error("Fee update error on", rpcUrl, err);
      }
    }

    return NextResponse.json({ error: "Failed to broadcast fee update" }, { status: 500 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

