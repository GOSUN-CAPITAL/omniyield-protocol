import { NextResponse, NextRequest } from "next/server";

const RPC_URL = process.env.NEAR_RPC_URL || "https://test.rpc.fastnear.com";

async function queryViewMethod(contractId: string, methodName: string, args: Record<string, any> = {}) {
  try {
    const argsBase64 = Buffer.from(JSON.stringify(args)).toString("base64");
    const res = await fetch(RPC_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "omniyield-market-query",
        method: "query",
        params: {
          request_type: "call_function",
          finality: "final",
          account_id: contractId,
          method_name: methodName,
          args_base64: argsBase64,
        },
      }),
      next: { revalidate: 5 }, // 5s ISR cache
    });

    const data = await res.json();
    if (data.result && data.result.result) {
      const decodedStr = Buffer.from(data.result.result).toString("utf-8");
      return JSON.parse(decodedStr);
    }
  } catch (err) {
    console.warn(`Failed to query ${contractId}.${methodName}:`, err);
  }
  return null;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const vault = searchParams.get("vault") || "usdc";

    // 1. Fetch live telemetry from on-chain socket adapters
    const [rheaState, ondoState, stocksState, goldState] = await Promise.all([
      queryViewMethod("rhea.omniyield-vault.testnet", "get_market_state"),
      queryViewMethod("ondo.omniyield-vault.testnet", "get_reserve_state"),
      queryViewMethod("stocks.omniyield-vault.testnet", "get_market_state"),
      queryViewMethod("gold.omniyield-vault.testnet", "get_market_state"),
    ]);

    const rhea = rheaState || {
      market_name: "RHEA Finance Lending Pool",
      engine: "Burrow Core Isolated",
      total_supplied: "7000000000000",
      supply_cap: "10000000000000",
      apy_bps: 1388,
      utilization_bps: 7000,
    };

    const ondo = ondoState || {
      reserve_name: "Ondo USDY Tokenized US Treasuries",
      asset: "USDC / USDY",
      reserve_balance: "5450800000000",
      capacity: "100000000000000",
      apy_bps: 510,
      instant_redemption_available: "5450800000000",
    };

    const stocks = stocksState || {
      basket_name: "Ondo Tokenized US Tech Equities (QQQ & NVDA)",
      benchmark: "Nasdaq 100 Index / S&P 500",
      total_supplied: "2150000000000",
      capacity: "50000000000000",
      apy_bps: 1820,
    };

    const gold = goldState || {
      asset_name: "Tokenized Physical Gold (PAXG / Tether Gold)",
      backing: "100% London Good Delivery Physical Gold Bars",
      total_supplied: "1290000000000",
      capacity: "30000000000000",
      apy_bps: 1250,
    };

    if (vault === "all-weather") {
      // All-Weather 4-Pillar Parity Vault
      const ondoUSD = 3440000;  // 40%
      const stocksUSD = 2150000; // 25%
      const goldUSD = 1290000;   // 15%
      const rheaUSD = 1720000;   // 20%
      const totalTVL = ondoUSD + stocksUSD + goldUSD + rheaUSD; // $8.60M

      return NextResponse.json({
        success: true,
        vault_id: "all-weather",
        vault_name: "GOSUN All-Weather RWA",
        receipt_token: "OmniUSDC",
        blended_apy_percent: "16.40",
        total_tvl_usd: totalTVL,
        liquidity_buffer_usd: ondoUSD,
        share_price: "1.0628",
        markets: [
          {
            id: "ondo-rwa",
            name: ondo.reserve_name,
            account_id: "ondo.omniyield-vault.testnet",
            allocated_usd: ondoUSD,
            allocation_percent: 40,
            supply_cap_usd: 100000000,
            apy_percent: (ondo.apy_bps / 100).toFixed(2),
            apy_bps: ondo.apy_bps,
            role: "Macro Pillar #1: Treasuries Safe Haven (Defensive Anchor)",
            engine: "Short-Term US Treasuries & Bank Deposits",
            explorer_url: "https://testnet.nearblocks.io/address/ondo.omniyield-vault.testnet",
          },
          {
            id: "stocks-qqq",
            name: stocks.basket_name,
            account_id: "stocks.omniyield-vault.testnet",
            allocated_usd: stocksUSD,
            allocation_percent: 25,
            supply_cap_usd: 50000000,
            apy_percent: (stocks.apy_bps / 100).toFixed(2),
            apy_bps: stocks.apy_bps,
            role: "Macro Pillar #2: US Tech Equities (Capital Growth)",
            engine: "Nasdaq 100 & Mega-Cap Tech Basket",
            explorer_url: "https://testnet.nearblocks.io/address/stocks.omniyield-vault.testnet",
          },
          {
            id: "gold-paxg",
            name: gold.asset_name,
            account_id: "gold.omniyield-vault.testnet",
            allocated_usd: goldUSD,
            allocation_percent: 15,
            supply_cap_usd: 30000000,
            apy_percent: (gold.apy_bps / 100).toFixed(2),
            apy_bps: gold.apy_bps,
            role: "Macro Pillar #3: Physical Gold (Inflation & Crisis Hedge)",
            engine: "Allocated Gold Bullion Reserve",
            explorer_url: "https://testnet.nearblocks.io/address/gold.omniyield-vault.testnet",
          },
          {
            id: "rhea-lending",
            name: rhea.market_name,
            account_id: "rhea.omniyield-vault.testnet",
            allocated_usd: rheaUSD,
            allocation_percent: 20,
            supply_cap_usd: 10000000,
            apy_percent: (rhea.apy_bps / 100).toFixed(2),
            apy_bps: rhea.apy_bps,
            role: "Macro Pillar #4: Web3 Lending Alpha (High Yield Carry)",
            engine: "Burrow Core Isolated Borrowing",
            explorer_url: "https://testnet.nearblocks.io/address/rhea.omniyield-vault.testnet",
          },
        ],
      });
    }

    // Default: Vault 1 (GOSUN OmniYield USDC)
    const rheaSuppliedUSD = Number(rhea.total_supplied) / 1e6;
    const rheaCapUSD = Number(rhea.supply_cap) / 1e6;
    const ondoBalanceUSD = Number(ondo.reserve_balance) / 1e6;
    const ondoCapUSD = Number(ondo.capacity) / 1e6;

    const totalTVL = rheaSuppliedUSD + ondoBalanceUSD;
    const rheaRatio = Math.round((rheaSuppliedUSD / totalTVL) * 100);
    const ondoRatio = 100 - rheaRatio;

    return NextResponse.json({
      success: true,
      vault_id: "usdc",
      vault_name: "GOSUN OmniYield USDC",
      receipt_token: "NUSD",
      blended_apy_percent: "11.84",
      total_tvl_usd: totalTVL,
      liquidity_buffer_usd: ondoBalanceUSD,
      share_price: "1.0482",
      markets: [
        {
          id: "rhea-lending",
          name: rhea.market_name,
          account_id: "rhea.omniyield-vault.testnet",
          allocated_usd: rheaSuppliedUSD,
          allocation_percent: rheaRatio,
          supply_cap_usd: rheaCapUSD,
          apy_percent: (rhea.apy_bps / 100).toFixed(2),
          apy_bps: rhea.apy_bps,
          utilization_percent: (rhea.utilization_bps / 100).toFixed(1),
          role: "Supply Queue #1",
          engine: rhea.engine,
          explorer_url: "https://testnet.nearblocks.io/address/rhea.omniyield-vault.testnet",
        },
        {
          id: "ondo-rwa",
          name: ondo.reserve_name,
          account_id: "ondo.omniyield-vault.testnet",
          allocated_usd: ondoBalanceUSD,
          allocation_percent: ondoRatio,
          supply_cap_usd: ondoCapUSD,
          apy_percent: (ondo.apy_bps / 100).toFixed(2),
          apy_bps: ondo.apy_bps,
          role: "Withdraw Queue #1",
          description: "Instant redemption liquidity buffer for all cross-chain withdrawals",
          explorer_url: "https://testnet.nearblocks.io/address/ondo.omniyield-vault.testnet",
        },
      ],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
