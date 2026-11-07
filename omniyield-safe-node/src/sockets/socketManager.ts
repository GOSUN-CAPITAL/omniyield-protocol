export interface StrategySocketInfo {
  socketId: string;
  vaultId: "usdc" | "all-weather";
  name: string;
  status: "online" | "ejected" | "compiling" | "paused";
  wasmContainer: string;
  version: string;
  checksumSha256: string;
  lastHotSwapTime: string;
  allocatedTvlUsd: number;
  currentApy: string;
  allocationWeights: Record<string, number>;
  circuitBreakerThresholdBps: number;
}

// In-Memory Sovereign Strategy Registry
const SOCKETS_REGISTRY: Record<string, StrategySocketInfo> = {
  "socket-1": {
    socketId: "socket-1",
    vaultId: "usdc",
    name: "GOSUN NUSD Dynamic Spread Engine",
    status: "online",
    wasmContainer: "GOSUN_NUSD_DynamicSpread_Encap_v1.0.wasm",
    version: "v1.0.4",
    checksumSha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    lastHotSwapTime: "2026-11-02 05:12:00 UTC",
    allocatedTvlUsd: 18420000,
    currentApy: "11.84%",
    allocationWeights: {
      "rhea-lending": 0.70,
      "ondo-usdy": 0.30,
    },
    circuitBreakerThresholdBps: 200, // 2% max price deviation
  },
  "socket-2": {
    socketId: "socket-2",
    vaultId: "all-weather",
    name: "GOSUN All-Weather Macro Risk Parity Engine",
    status: "online",
    wasmContainer: "GOSUN_AllWeather_MacroParity_Encap_v1.0.wasm",
    version: "v1.0.8",
    checksumSha256: "7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
    lastHotSwapTime: "2026-11-02 05:15:00 UTC",
    allocatedTvlUsd: 8600000,
    currentApy: "16.40%",
    allocationWeights: {
      "qqq-equities": 0.25,
      "us-treasuries": 0.40,
      "gold-paxg": 0.15,
      "private-credit": 0.20,
    },
    circuitBreakerThresholdBps: 300, // 3% max risk parity drift
  },
};

export function getAllSockets(): StrategySocketInfo[] {
  return Object.values(SOCKETS_REGISTRY);
}

export function getSocket(socketId: string): StrategySocketInfo | null {
  return SOCKETS_REGISTRY[socketId] || null;
}

export function hotSwapSocket(
  socketId: string,
  newWasmName: string,
  newVersion: string
): { success: boolean; socket?: StrategySocketInfo; message: string } {
  const socket = SOCKETS_REGISTRY[socketId];
  if (!socket) {
    return { success: false, message: `Socket '${socketId}' not found.` };
  }

  // Perform zero-downtime hot-swap simulation
  socket.status = "compiling";
  socket.wasmContainer = newWasmName;
  socket.version = newVersion;
  socket.lastHotSwapTime = new Date().toISOString().replace("T", " ").slice(0, 19) + " UTC";
  socket.status = "online";

  return {
    success: true,
    socket,
    message: `Strategy socket '${socketId}' hot-swapped to ${newVersion} (${newWasmName}) with zero downtime.`,
  };
}

export function toggleSocketStatus(
  socketId: string
): { success: boolean; newStatus: "online" | "ejected"; message: string } {
  const socket = SOCKETS_REGISTRY[socketId];
  if (!socket) {
    return { success: false, newStatus: "ejected", message: `Socket '${socketId}' not found.` };
  }

  socket.status = socket.status === "online" ? "ejected" : "online";
  return {
    success: true,
    newStatus: socket.status as any,
    message: `Socket '${socketId}' is now ${socket.status.toUpperCase()}.`,
  };
}

