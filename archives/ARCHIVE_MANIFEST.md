# 📦 OmniYield Protocol 归档记录清单 (Archive Manifest)

- **归档时间 (Timestamp)**: 2026-11-07T13:48:31.176Z (2026/11/7 08:48:26)
- **归档文件 (Archive File)**: `OmniYield_Release_20261107_084826.zip`
- **压缩包大小 (Archive Size)**: **0.78 MB**
- **SHA-256 校验哈希**: `02cac1d9d91e192a5e800993751b517b2fbdf654aeeda97dcdae1b736412b972`
- **归档版本**: `v1.0.0-hackathon-final-release`

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
  - 域名: `app.omniyield.finance` (本地: `http://localhost:3000`)
  - 框架: Next.js 14, TailwindCSS, Lucide, NEAR Wallet Selector
  - 特性: 散户/VIP 分层权限自适应、金色 VIP 外框高亮、实时预言机卡片
- **后端主权治理层 (OmniSafe Sovereign Node)**:
  - 域名: `safe.omniyield.finance` (本地: `http://localhost:4000`)
  - 治理母港: SputnikDAO (`dao.omniyield-vault.testnet`) 多签保险库
  - 策略引擎: 黑盒动态资产再平衡套接字 (Socket #1 & #2)
  - 自治 AI 守护神: 7x24 小时 VPS 轮询、宏观利差信号捕捉

### 3. Google Gemini 实时行情与权威预言机
- **实时预言机接入源**:
  - 加密资产: CoinGecko API + Coinbase Pro Spot 实时聚合 (BTC ~$77k, ETH, NEAR, SOL, PAXG, USDY)
  - 宏观美股: Yahoo Finance / TradingView Global Feed (纳斯达克 100 ETF QQQ ~$681~$690, SPX 7,580, DXY 101.6)
- **AI 模型**: Google AI Studio `gemini-flash-lite-latest` (已配置免费模式密钥，支持秒级自然语言意图直签解析)

---

## 🚀 一键启动与停止指引 (One-Click Operations)

1. **一键启动 (Windows 双击运行)**:
   - 双击 `start.bat` (或右键以 PowerShell 运行 `start.ps1`)
   - 自动检测 Node.js、自动释放占用端口、自动构建并打开浏览器 `http://localhost:3000`
2. **一键停止**:
   - 双击 `stop.bat` (或运行 `stop.ps1`)，安全释放 3000 与 4000 端口
3. **再次归档**:
   - 双击 `archive.bat`，生成全新时间戳备份包
