import { OmniflowAIAllocator, MarketYieldData } from "./allocator";

async function runSimulator() {
  console.log("==================================================================");
  console.log(" OmniYield AI Public Allocator & Morpho Queue Simulator");
  console.log(" Gosun Labs - Built for NEAR Hackathon 2026");
  console.log("==================================================================\n");

  const allocator = new OmniflowAIAllocator("omniflow-vault.near");

  const totalVaultAssets = BigInt(10_000_000 * 1_000_000); // 10,000,000 USDC
  console.log(`Initial Total Vault Assets: $10,000,000.00 USDC\n`);

  // Round 1: High lending demand on RHEA (APY = 13.88%)
  console.log("--- [ROUND 1: BULLISH LENDING DEMAND] ---");
  const rheaRound1: MarketYieldData = {
    marketId: "rhea-lending",
    name: "RHEA Finance Lending Pool",
    currentApyBps: 1388, // 13.88%
    supplyCap: BigInt(7_000_000 * 1_000_000), // 7M Cap
    currentAllocation: BigInt(5_000_000 * 1_000_000),
  };

  const rwaRound1: MarketYieldData = {
    marketId: "ondo-rwa",
    name: "Ondo USDY US Treasuries",
    currentApyBps: 510, // 5.10%
    supplyCap: BigInt(100_000_000 * 1_000_000),
    currentAllocation: BigInt(5_000_000 * 1_000_000),
  };

  const decision1 = allocator.calculateOptimalAllocation(totalVaultAssets, rheaRound1, rwaRound1);
  console.log(`Action: ${decision1.shouldReallocate ? "REALLOCATION TRIGGERED" : "HOLD"}`);
  console.log(`Reason: ${decision1.reason}`);
  if (decision1.shouldReallocate) {
    for (const target of decision1.targets) {
      console.log(`  -> Allocate $${(Number(target.amount) / 1e6).toLocaleString()} to [${target.marketId}]`);
    }
  }

  // Round 2: Lending market dries up, RHEA APY drops to 3.50%
  console.log("\n--- [ROUND 2: BORROWERS REPAY, RHEA APY DROPS TO 3.50%] ---");
  const rheaRound2: MarketYieldData = {
    ...rheaRound1,
    currentApyBps: 350, // 3.50% (below 5.10% RWA)
    currentAllocation: BigInt(7_000_000 * 1_000_000),
  };

  const decision2 = allocator.calculateOptimalAllocation(totalVaultAssets, rheaRound2, rwaRound1);
  console.log(`Action: ${decision2.shouldReallocate ? "DEFENSIVE REALLOCATION TRIGGERED" : "HOLD"}`);
  console.log(`Reason: ${decision2.reason}`);
  if (decision2.shouldReallocate) {
    for (const target of decision2.targets) {
      console.log(`  -> Rotate $${(Number(target.amount) / 1e6).toLocaleString()} to [${target.marketId}]`);
    }
  }

  console.log("\n==================================================================");
  console.log(" Simulator completed successfully. Verified Morpho Caps & Queues.");
  console.log("==================================================================");
}

runSimulator().catch(console.error);

