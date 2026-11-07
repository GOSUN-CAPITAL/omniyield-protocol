/**
 * OmniYield AI Public Allocator & Morpho Reallocation Keeper
 *
 * Continuously evaluates the yield differential between RHEA Lending and Ondo US Treasuries,
 * dynamically optimizing capital allocation within the curator-approved Supply Caps.
 */

export interface MarketYieldData {
  marketId: string;
  name: string;
  currentApyBps: number; // e.g. 1388 = 13.88%
  supplyCap: bigint;
  currentAllocation: bigint;
}

export interface ReallocationTarget {
  marketId: string;
  amount: bigint;
}

export class OmniflowAIAllocator {
  private readonly vaultContractId: string;
  private readonly maxRheaCapRatio: number = 0.7; // Maximum 70% allocation to lending
  private readonly spreadThresholdBps: number = 100; // 1% minimum spread to trigger rebalance

  constructor(vaultContractId: string = "omniflow-vault.near") {
    this.vaultContractId = vaultContractId;
  }

  /**
   * Determine optimal capital allocation based on Morpho queue rules and APY spread
   */
  public calculateOptimalAllocation(
    totalVaultAssets: bigint,
    rheaData: MarketYieldData,
    rwaData: MarketYieldData
  ): { shouldReallocate: boolean; targets: ReallocationTarget[]; reason: string } {
    const rheaApy = rheaData.currentApyBps;
    const rwaApy = rwaData.currentApyBps;

    console.log(
      `[AI Allocator] Monitoring Yields: RHEA APY = ${(rheaApy / 100).toFixed(2)}% | RWA APY = ${(rwaApy / 100).toFixed(2)}%`
    );

    // Scenario A: RHEA Lending yields exceed RWA Treasuries
    if (rheaApy > rwaApy + this.spreadThresholdBps) {
      // Prioritize filling RHEA Lending up to its Supply Cap
      const desiredRheaAllocation = (totalVaultAssets * BigInt(70)) / BigInt(100);
      const cappedRheaAllocation =
        desiredRheaAllocation > rheaData.supplyCap ? rheaData.supplyCap : desiredRheaAllocation;
      const remainingForRwa = totalVaultAssets - cappedRheaAllocation;

      // Check if rebalance delta is material (> 2% of assets)
      const currentDelta =
        cappedRheaAllocation > rheaData.currentAllocation
          ? cappedRheaAllocation - rheaData.currentAllocation
          : rheaData.currentAllocation - cappedRheaAllocation;

      if (currentDelta > (totalVaultAssets * BigInt(2)) / BigInt(100)) {
        return {
          shouldReallocate: true,
          targets: [
            { marketId: "rhea-lending", amount: cappedRheaAllocation },
            { marketId: "ondo-rwa", amount: remainingForRwa },
          ],
          reason: `RHEA APY (${(rheaApy / 100).toFixed(2)}%) outperforming RWA (${(rwaApy / 100).toFixed(2)}%). Maximizing high-yield queue up to cap.`,
        };
      }
    }

    // Scenario B: RHEA Lending yields drop below or equal to RWA Treasuries
    if (rheaApy <= rwaApy) {
      // Defensive mode: Reallocate bulk of capital to risk-free Ondo Treasuries
      const safeRheaReserve = (totalVaultAssets * BigInt(10)) / BigInt(100); // 10% minimal active liquidity
      const heavyRwaAllocation = totalVaultAssets - safeRheaReserve;

      return {
        shouldReallocate: true,
        targets: [
          { marketId: "rhea-lending", amount: safeRheaReserve },
          { marketId: "ondo-rwa", amount: heavyRwaAllocation },
        ],
        reason: `RHEA APY (${(rheaApy / 100).toFixed(2)}%) dropped below RWA benchmark (${(rwaApy / 100).toFixed(2)}%). Rotating to safety buffer.`,
      };
    }

    return {
      shouldReallocate: false,
      targets: [],
      reason: "Current allocation is optimal. No action required.",
    };
  }
}

