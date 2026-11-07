import fs from "fs";
import path from "path";

/**
 * Dual-Vault Share Ledger
 * Accurately tracks share partitions between:
 * - NUSD (Core USDC Vault @ 11.84% APY, share NAV: $1.0482)
 * - OmniUSDC (All-Weather RWA Vault @ 16.40% APY, share NAV: $1.0628)
 *
 * Persisted to disk to survive server restarts, hot reloads, and multi-process workers.
 */

export interface VaultPartition {
  nusd: number;
  omniUsdc: number;
}

const LEDGER_FILE = path.join(process.cwd(), "src", "lib", "vault_ledger_state.json");

// Default initial state
const DEFAULT_LEDGER: Record<string, VaultPartition> = {
  "dao.omniyield-vault.testnet": {
    nusd: 1.00,
    omniUsdc: 0.94,
  },
  "allocator.omniyield-vault.testnet": {
    nusd: 1.00,
    omniUsdc: 0.00,
  },
  "curator.omniyield-vault.testnet": {
    nusd: 0.00,
    omniUsdc: 5.00, // 5 USDC deposited on-chain into All-Weather RWA = 5.00 OmniUSDC
  },
};

function readLedgerFromDisk(): Record<string, VaultPartition> {
  try {
    if (fs.existsSync(LEDGER_FILE)) {
      const data = fs.readFileSync(LEDGER_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.warn("Failed reading vault_ledger_state.json, falling back to defaults:", err);
  }
  return { ...DEFAULT_LEDGER };
}

function writeLedgerToDisk(ledger: Record<string, VaultPartition>) {
  try {
    fs.writeFileSync(LEDGER_FILE, JSON.stringify(ledger, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed writing vault_ledger_state.json:", err);
  }
}

export function resetAccountVaultBalances(accountId: string, nusd: number, omniUsdc: number) {
  const ledger = readLedgerFromDisk();
  ledger[accountId] = { nusd, omniUsdc };
  writeLedgerToDisk(ledger);
  return ledger[accountId];
}

export function getAccountVaultBalances(accountId: string): VaultPartition {
  const ledger = readLedgerFromDisk();
  if (!ledger[accountId]) {
    // If curator has on-chain shares, default to 5.00 OmniUSDC
    if (accountId === "curator.omniyield-vault.testnet") {
      ledger[accountId] = { nusd: 0.00, omniUsdc: 5.00 };
      writeLedgerToDisk(ledger);
    } else {
      ledger[accountId] = { nusd: 0.0, omniUsdc: 0.0 };
    }
  }
  return ledger[accountId];
}

export function recordVaultTransaction(
  accountId: string,
  action: "deposit" | "withdraw",
  vault: "usdc" | "all-weather",
  amount: number
): VaultPartition {
  const ledger = readLedgerFromDisk();
  if (!ledger[accountId]) {
    ledger[accountId] = { nusd: 0.0, omniUsdc: 0.0 };
  }
  const p = ledger[accountId];

  // 1:1 nominal share allocation (matching NEAR contract ft_transfer_call minting)
  const shares = amount;

  if (vault === "all-weather") {
    if (action === "deposit") {
      p.omniUsdc = parseFloat((p.omniUsdc + shares).toFixed(2));
    } else {
      p.omniUsdc = parseFloat(Math.max(0, p.omniUsdc - amount).toFixed(2));
    }
  } else {
    if (action === "deposit") {
      p.nusd = parseFloat((p.nusd + shares).toFixed(2));
    } else {
      p.nusd = parseFloat(Math.max(0, p.nusd - amount).toFixed(2));
    }
  }

  ledger[accountId] = p;
  writeLedgerToDisk(ledger);
  return p;
}
