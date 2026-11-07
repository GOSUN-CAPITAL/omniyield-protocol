import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import {
  generateChallenge,
  verifySignatureAndIssueToken,
  requireSafeAuth,
  INSTITUTIONAL_WHITELIST,
} from "./auth/nep413";
import {
  getAllSockets,
  getSocket,
  hotSwapSocket,
  toggleSocketStatus,
} from "./sockets/socketManager";
import {
  AI_DAEMON_STATE,
  startAiDaemon,
  logAiMessage,
} from "./ai-daemon/poller";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Enable CORS for front-end domains
const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "https://app.omniyield.finance",
  "https://omniyield.finance",
  "https://safe.omniyield.finance",
  process.env.FRONTEND_ORIGIN || "",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, Cloudflare Tunnel)
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive in testnet
    },
    credentials: true,
  })
);

app.use(express.json());

// ============================================================================
// 1. HEALTH & PUBLIC PING
// ============================================================================
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    node: "omniyield-safe-sovereign-node",
    version: "1.0.0",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// ============================================================================
// 2. NEP-413 CRYPTOGRAPHIC AUTH CHALLENGE
// ============================================================================
app.get("/api/auth/challenge", (req, res) => {
  const accountId = (req.query.accountId as string) || "dao.omniyield-vault.testnet";
  const nonce = generateChallenge(accountId);
  res.json({
    accountId,
    nonce,
    message: `Sign this message to authenticate into OmniSafe Sovereign Node: ${nonce}`,
    expiresIn: "300s",
  });
});

app.post("/api/auth/verify", (req, res) => {
  const { accountId, signature, publicKey } = req.body;
  if (!accountId) {
    return res.status(400).json({ error: "Missing accountId" });
  }

  const result = verifySignatureAndIssueToken(accountId, signature || "mock-sig", publicKey || "mock-pk");
  if (!result.success) {
    return res.status(401).json({ error: result.error });
  }

  res.json({
    success: true,
    token: result.token,
    role: result.role,
    accountId,
  });
});

// ============================================================================
// 3. DAO PROPOSALS & MULTI-SIG API (Mirrors SputnikDAO)
// ============================================================================
interface ProposalItem {
  id: number;
  proposer: string;
  description: string;
  status: string;
  votes: Record<string, string>;
  requiredVotes: number;
  createdAt: string;
  timelockExpiresAt: string;
}

let IN_MEMORY_PROPOSALS: ProposalItem[] = [
  {
    id: 1,
    proposer: "curator.omniyield-vault.testnet",
    description: "Expand RHEA Lending Allocation Cap to $15,000,000",
    status: "InVoting",
    votes: {
      "curator.omniyield-vault.testnet": "Approve",
      "dao.omniyield-vault.testnet": "Approve",
    },
    requiredVotes: 2,
    createdAt: "2026-11-02 04:30:00 UTC",
    timelockExpiresAt: "2026-11-03 04:30:00 UTC",
  },
  {
    id: 2,
    proposer: "allocator.omniyield-vault.testnet",
    description: "Rebalance NUSD Core Vault: 65% RHEA + 35% Ondo USDY",
    status: "Executed",
    votes: {
      "allocator.omniyield-vault.testnet": "Approve",
      "dao.omniyield-vault.testnet": "Approve",
    },
    requiredVotes: 2,
    createdAt: "2026-11-01 18:00:00 UTC",
    timelockExpiresAt: "Executed on NEAR Testnet",
  },
];

app.get("/api/proposals", (req, res) => {
  res.json({
    councilMembers: INSTITUTIONAL_WHITELIST.slice(0, 4),
    threshold: 2,
    proposalCount: IN_MEMORY_PROPOSALS.length,
    pendingCount: IN_MEMORY_PROPOSALS.filter((p) => p.status === "InVoting").length,
    proposals: IN_MEMORY_PROPOSALS,
  });
});

app.post("/api/proposals", (req, res) => {
  const { action, proposalId, signerAccount, description } = req.body;

  if (action === "confirm" && proposalId) {
    const prop = IN_MEMORY_PROPOSALS.find((p) => p.id === Number(proposalId));
    if (prop) {
      prop.votes[signerAccount || "dao.omniyield-vault.testnet"] = "Approve";
      if (Object.keys(prop.votes).length >= prop.requiredVotes) {
        prop.status = "Approved";
      }
      return res.json({
        success: true,
        proposal: prop,
        txHash: "7yV8tKq3W...nearblocks-proof",
      });
    }
  }

  if (action === "create") {
    const newId = IN_MEMORY_PROPOSALS.length + 1;
    const newProp = {
      id: newId,
      proposer: req.body.proposer || "dao.omniyield-vault.testnet",
      description: description || "Proposal: Adjust Vault Parameters",
      status: "InVoting",
      votes: { [req.body.proposer || "dao.omniyield-vault.testnet"]: "Approve" },
      requiredVotes: 2,
      createdAt: new Date().toISOString().replace("T", " ").slice(0, 19) + " UTC",
      timelockExpiresAt: "24h Timelock Active",
    };
    IN_MEMORY_PROPOSALS.unshift(newProp);
    return res.json({
      success: true,
      proposal: newProp,
      txHash: "9zX2mN1b...nearblocks-proof",
    });
  }

  res.status(400).json({ error: "Invalid proposal action." });
});

// ============================================================================
// 4. PROTOCOL FEES API
// ============================================================================
app.post("/api/fees", (req, res) => {
  const { performance_fee_bps, management_fee_bps, accountId } = req.body;
  res.json({
    success: true,
    txHash: "FeeUpdateTxHash_8f29d10c8b3a",
    updatedParameters: {
      performance_fee_bps: performance_fee_bps || 1000,
      management_fee_bps: management_fee_bps || 150,
      updatedBy: accountId || "dao.omniyield-vault.testnet",
      timestamp: new Date().toISOString(),
    },
  });
});

// ============================================================================
// 5. PLUGGABLE BLACK-BOX STRATEGY SOCKETS API
// ============================================================================
app.get("/api/sockets", (req, res) => {
  res.json({
    success: true,
    sockets: getAllSockets(),
  });
});

app.post("/api/sockets/hotswap", (req, res) => {
  const { socketId, newWasmName, newVersion } = req.body;
  const result = hotSwapSocket(
    socketId || "socket-1",
    newWasmName || "GOSUN_NUSD_DynamicSpread_Encap_v2.0_Optimized.wasm",
    newVersion || "v2.0.0"
  );
  logAiMessage(`[Socket Engine] ${result.message}`);
  res.json(result);
});

app.post("/api/sockets/toggle", (req, res) => {
  const { socketId } = req.body;
  const result = toggleSocketStatus(socketId || "socket-1");
  logAiMessage(`[Socket Engine] ${result.message}`);
  res.json(result);
});

// ============================================================================
// 6. AUTONOMOUS AI AGENT API
// ============================================================================
app.get("/api/ai/state", (req, res) => {
  res.json({
    success: true,
    state: AI_DAEMON_STATE,
  });
});

app.post("/api/ai/config", (req, res) => {
  const { executionMode, pollingIntervalSeconds, yieldDeltaThreshold } = req.body;
  if (executionMode) AI_DAEMON_STATE.executionMode = executionMode;
  if (pollingIntervalSeconds) AI_DAEMON_STATE.pollingIntervalSeconds = Number(pollingIntervalSeconds);
  if (yieldDeltaThreshold) AI_DAEMON_STATE.yieldDeltaThreshold = Number(yieldDeltaThreshold);

  logAiMessage(
    `[AI Config] Mode=${AI_DAEMON_STATE.executionMode}, Interval=${AI_DAEMON_STATE.pollingIntervalSeconds}s, DeltaThreshold=${AI_DAEMON_STATE.yieldDeltaThreshold}%.`
  );
  res.json({ success: true, state: AI_DAEMON_STATE });
});

app.post("/api/ai/killswitch", (req, res) => {
  AI_DAEMON_STATE.killSwitchArmed = !AI_DAEMON_STATE.killSwitchArmed;
  logAiMessage(
    `🚨 [SECURITY ENCLAVE] AI Kill Switch is now ${AI_DAEMON_STATE.killSwitchArmed ? "ARMED (ALL AUTONOMOUS AGENTS FROZEN)" : "DISARMED (NORMAL OPERATION)"}.`
  );
  res.json({
    success: true,
    killSwitchArmed: AI_DAEMON_STATE.killSwitchArmed,
  });
});

app.get("/api/ai/logs", (req, res) => {
  res.json({
    success: true,
    logs: AI_DAEMON_STATE.recentLogs,
  });
});

// ============================================================================
// START SERVER & AI DAEMON
// ============================================================================
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🛡️  OmniSafe Sovereign Node running on port ${PORT}`);
  console.log(`🌐  Target Domain: safe.omniyield.finance`);
  console.log(`🔐  NEAR NEP-413 Signature Challenge: ENABLED`);
  console.log(`🔌  Black-Box Strategy Sockets: LOADED (Socket #1 & #2)`);
  console.log(`🤖  Autonomous AI Agent Daemon: ACTIVE`);
  console.log(`=======================================================`);
  startAiDaemon();
});
