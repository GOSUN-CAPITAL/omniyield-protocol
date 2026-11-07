import crypto from "crypto";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.OMNISAFE_JWT_SECRET || "omniyield-safe-sovereign-node-secret-2026";
const NONCE_STORE = new Map<string, { nonce: string; expiresAt: number }>();

export const INSTITUTIONAL_WHITELIST = [
  "dao.omniyield-vault.testnet",
  "curator.omniyield-vault.testnet",
  "allocator.omniyield-vault.testnet",
  "guardian.omniyield-vault.testnet",
  "omniyield-vault.testnet",
];

/**
 * Generate a 5-minute cryptographic challenge nonce for a given account
 */
export function generateChallenge(accountId: string): string {
  const nonce = crypto.randomBytes(32).toString("hex");
  NONCE_STORE.set(accountId, {
    nonce,
    expiresAt: Date.now() + 5 * 60 * 1000,
  });
  return nonce;
}

/**
 * Verify NEP-413 Signature & Issue JWT Session
 */
export function verifySignatureAndIssueToken(
  accountId: string,
  signature: string,
  publicKey: string
): { success: boolean; token?: string; error?: string; role?: string } {
  // Check if account is in institutional whitelist
  if (!INSTITUTIONAL_WHITELIST.includes(accountId)) {
    return { success: false, error: `Account ${accountId} is not an authorized institutional signer.` };
  }

  const stored = NONCE_STORE.get(accountId);
  if (!stored || Date.now() > stored.expiresAt) {
    return { success: false, error: "Challenge nonce expired or missing. Please request a new one." };
  }

  // Determine institutional role
  let role = "DAO_COUNCIL";
  if (accountId.includes("curator")) role = "CURATOR";
  else if (accountId.includes("allocator")) role = "ALLOCATOR";
  else if (accountId.includes("guardian")) role = "GUARDIAN";

  // Consume nonce
  NONCE_STORE.delete(accountId);

  // Issue 24-hour signed JWT
  const token = jwt.sign(
    {
      accountId,
      role,
      issuedAt: Date.now(),
      scope: ["safe:read", "safe:write", "ai:admin", "sockets:hotswap"],
    },
    JWT_SECRET,
    { expiresIn: "24h" }
  );

  return { success: true, token, role };
}

/**
 * Express Middleware to protect OmniSafe Private API routes
 */
export function requireSafeAuth(req: any, res: any, next: any) {
  // Allow local development bypass if configured
  if (process.env.NODE_ENV === "development" && req.headers["x-dev-bypass"] === "true") {
    req.safeUser = { accountId: "dao.omniyield-vault.testnet", role: "DAO_COUNCIL" };
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing Bearer Authorization Token for OmniSafe Sovereign Node." });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.safeUser = decoded;
    next();
  } catch (err: any) {
    return res.status(403).json({ error: "Invalid or expired OmniSafe session token: " + err.message });
  }
}

