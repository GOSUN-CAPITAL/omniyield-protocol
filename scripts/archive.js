/**
 * OmniYield Protocol - Automatic Codebase Archiver & Manifest Generator
 * Creates a clean, portable timestamped snapshot excluding regenerable build artifacts.
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { execSync } = require("child_process");

const ROOT_DIR = path.resolve(__dirname, "..");
const ARCHIVES_DIR = path.join(ROOT_DIR, "archives");
const TEMP_SNAPSHOT_DIR = path.join(ARCHIVES_DIR, "temp_snapshot");

// Ensure archives dir exists
if (!fs.existsSync(ARCHIVES_DIR)) {
  fs.mkdirSync(ARCHIVES_DIR, { recursive: true });
}

// Format timestamp: YYYYMMDD_HHMMSS
const now = new Date();
const pad = (n) => String(n).padStart(2, "0");
const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
const archiveName = `OmniYield_Release_${timestamp}.zip`;
const archivePath = path.join(ARCHIVES_DIR, archiveName);

console.log("=====================================================================");
console.log("  📦 OmniYield Protocol - 代码库全量智能归档程序");
console.log(`  生成归档文件名: ${archiveName}`);
console.log("=====================================================================");

// Directories & files to include
const INCLUDES = [
  "contracts",
  "credentials",
  "docs",
  "frontend",
  "omniyield-safe-node",
  "scripts",
  "services",
  "LOGO",
  "ICONS",
  "docker-compose.yml",
  "README.md",
  ".gitignore",
  "start.bat",
  "start.ps1",
  "start.sh",
  "stop.bat",
  "stop.ps1",
  "archive.bat",
  "archive.ps1",
];

// Patterns to exclude
const EXCLUDE_PATTERNS = [
  /node_modules/,
  /[\\/]\.next/,
  /[\\/]dist/,
  /[\\/]target/,
  /[\\/]\.git/,
  /[\\/]archives/,
  /[\\/]temp_snapshot/,
  /\.DS_Store/,
  /Thumbs\.db/,
  /\.log$/,
];

function shouldExclude(relPath) {
  return EXCLUDE_PATTERNS.some((pattern) => pattern.test(relPath));
}

function copyRecursive(src, dest, baseRel = "") {
  const stats = fs.statSync(src);
  if (stats.isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    const entries = fs.readdirSync(src);
    for (const entry of entries) {
      const srcEntry = path.join(src, entry);
      const destEntry = path.join(dest, entry);
      const relEntry = path.join(baseRel, entry);
      if (!shouldExclude(relEntry)) {
        copyRecursive(srcEntry, destEntry, relEntry);
      }
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

// 1. Stage files to temp directory
console.log("\n[1/3] 正在收集核心代码与配置文件（剔除 node_modules 与编译临时文件）...");
if (fs.existsSync(TEMP_SNAPSHOT_DIR)) {
  fs.rmSync(TEMP_SNAPSHOT_DIR, { recursive: true, force: true });
}
fs.mkdirSync(TEMP_SNAPSHOT_DIR, { recursive: true });

let fileCount = 0;
for (const item of INCLUDES) {
  const srcPath = path.join(ROOT_DIR, item);
  const destPath = path.join(TEMP_SNAPSHOT_DIR, item);
  if (fs.existsSync(srcPath)) {
    copyRecursive(srcPath, destPath, item);
  }
}

// 2. Compress using PowerShell Compress-Archive
console.log("\n[2/3] 正在打包压缩至 ZIP 归档文件...");
try {
  const psCmd = `powershell -NoProfile -Command "Compress-Archive -Path '${TEMP_SNAPSHOT_DIR}\\*' -DestinationPath '${archivePath}' -Force"`;
  execSync(psCmd, { stdio: "inherit" });
} catch (err) {
  console.error("压缩失败:", err.message);
  process.exit(1);
}

// Clean temp directory
fs.rmSync(TEMP_SNAPSHOT_DIR, { recursive: true, force: true });

// 3. Compute SHA256 and size
console.log("\n[3/3] 计算归档数字指纹与生成归档清单 (ARCHIVE_MANIFEST.md)...");
const zipBuffer = fs.readFileSync(archivePath);
const sha256 = crypto.createHash("sha256").update(zipBuffer).digest("hex");
const sizeMb = (zipBuffer.length / (1024 * 1024)).toFixed(2);

const manifestContent = `# 📦 OmniYield Protocol 归档记录清单 (Archive Manifest)

- **归档时间 (Timestamp)**: ${new Date().toISOString()} (${now.toLocaleString("zh-CN")})
- **归档文件 (Archive File)**: \`${archiveName}\`
- **压缩包大小 (Archive Size)**: **${sizeMb} MB**
- **SHA-256 校验哈希**: \`${sha256}\`
- **归档版本**: \`v1.0.0-hackathon-final-release\`

---

## 🏛️ 系统架构核心要素 (Architecture Stack)

### 1. 母港双金库矩阵 (Dual-Vault Matrix)
- **NUSD 核心金库 (GOSUN OmniYield USDC)**:
  - 收益率: **11.84% APY**
  - 底层驱动: 70% RHEA 原生超额质押借贷 + 30% Ondo USDY 美国国债
  - 特征: 纯美元本位、零无常损失、链上超额抵押保障
- **OmniUSDC 全天候金库 (GOSUN All-Weather RWA)**:
  - 收益率: **16.40% APY**
  - 底层驱动: 桥水宏观四支柱风险平价模型 (25% QQQ 科技股 + 40% Ondo 美债 + 15% PAXG 实物黄金 + 20% DeFi 借贷)
  - 特征: 全周期穿越牛熊、抗通胀、夏普比率 2.84

### 2. 双层部署与主权治理 (Sovereignty & Security)
- **前端开源层 (Frontend Layer)**:
  - 域名: \`app.omniyield.finance\` (本地: \`http://localhost:3000\`)
  - 框架: Next.js 14, TailwindCSS, Lucide, NEAR Wallet Selector
  - 特性: 散户/VIP 分层权限自适应、金色 VIP 外框高亮、实时预言机卡片
- **后端主权治理层 (OmniSafe Sovereign Node)**:
  - 域名: \`safe.omniyield.finance\` (本地: \`http://localhost:4000\`)
  - 治理母港: SputnikDAO (\`dao.omniyield-vault.testnet\`) 多签保险库
  - 策略引擎: 黑盒动态资产再平衡套接字 (Socket #1 & #2)
  - 自治 AI 守护神: 7x24 小时 VPS 轮询、宏观利差信号捕捉

### 3. Google Gemini 实时行情与权威预言机
- **实时预言机接入源**:
  - 加密资产: CoinGecko API + Coinbase Pro Spot 实时聚合 (BTC ~$77k, ETH, NEAR, SOL, PAXG, USDY)
  - 宏观美股: Yahoo Finance / TradingView Global Feed (纳斯达克 100 ETF QQQ ~$681~$690, SPX 7,580, DXY 101.6)
- **AI 模型**: Google AI Studio \`gemini-flash-lite-latest\` (已配置免费模式密钥，支持秒级自然语言意图直签解析)

---

## 🚀 一键启动与停止指引 (One-Click Operations)

1. **一键启动 (Windows 双击运行)**:
   - 双击 \`start.bat\` (或右键以 PowerShell 运行 \`start.ps1\`)
   - 自动检测 Node.js、自动释放占用端口、自动构建并打开浏览器 \`http://localhost:3000\`
2. **一键停止**:
   - 双击 \`stop.bat\` (或运行 \`stop.ps1\`)，安全释放 3000 与 4000 端口
3. **再次归档**:
   - 双击 \`archive.bat\`，生成全新时间戳备份包
`;

fs.writeFileSync(path.join(ARCHIVES_DIR, "ARCHIVE_MANIFEST.md"), manifestContent, "utf-8");

console.log("\n=====================================================================");
console.log("  🎉 归档打包成功！");
console.log(`  • 归档文件:  ${archivePath}`);
console.log(`  • 文件大小:  ${sizeMb} MB`);
console.log(`  • SHA256:    ${sha256}`);
console.log(`  • 归档清单:  ${path.join(ARCHIVES_DIR, "ARCHIVE_MANIFEST.md")}`);
console.log("=====================================================================\n");

