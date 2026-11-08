# OmniYield Protocol · 更新日志 (CHANGELOG)

本文档记录 OmniYield 全链流动性资管协议的所有重要版本迭代、架构演进与修复记录。

---

## [v2.1.0] - 2026-11-08 · 企业级嵌入式收益堆栈 (Enterprise Earn B2B SDK)

### 🌟 核心突破与 B2B 商业化落地 (Enterprise Milestones)
- **企业级嵌入式收益工坊上线 (Enterprise Earn Playground)**：
  - 左侧主导航新增 **`企业接入 (B2B SDK)`** 核心入口，带专属高亮 B2B 徽章。
  - 打造交互式嵌入组件实时调试台（Live Widget Simulator）：支持自定义分发商标识 (`Partner ID`)、目标公链 (`Solana` / `Arbitrum` / `Base`)、预设金库策略、主题皮肤与品牌主色调。
- **全平台一键代码生成器 (Multi-Platform Code Generator)**：
  - **React / Next.js**：`@omniyield/earn-sdk` 规范与组件代码一键复制。
  - **HTML Script**：极简 `<script>` 标签零依赖 Web 嵌入，适配任意 Webflow 或官网页面。
  - **Headless REST API**：提供带 `X-Partner-ID` 分发商追踪头的标准 cURL / TypeScript 调用示例。
  - **Telegram Mini-App**：提供 TON / TG WebApp 专属 URL 路由规范。
- **分发商收益测算器 (Partner Revenue & Retention Calculator)**：
  - 动态滑动条模拟 $100K 至 $10M+ 客户资产规模。
  - 实时演算每年为分发商带来的 **0.35% 年化分润现金流**（如 $1M TVL 每年获 $3,500 返佣，全自动化链上分润）。

---

## [v2.0.0] - 2026-11-07 · 主链级跨链同构与永久主权账本规范 (Mainnet-Standard Release)

### 🌟 核心突破与主链级规范 (Key Milestones)
- **主链级同构平移架构 (One-Step Mainnet Migration)**：
  - 确立四大主链标准：源链代币真实划扣、主权金库多链索引、原生反向极速赎回、双轨 Gas 抽象代付。
  - 归档核心技术规范：[`docs/MAINNET_STANDARD_CROSSCHAIN_SPECIFICATION.md`](docs/MAINNET_STANDARD_CROSSCHAIN_SPECIFICATION.md)。
- **Phantom 钱包原生深度整合 (Solana)**：
  - 全新接入 Solana 官方 Phantom 钱包交互规范，存入面板原生识别并展示 Phantom 官方图标与 `⚡ 通过 Phantom 签名存入 (Solana)` 交互态。
  - 集成 `window.solana.signMessage` 进行跨链流动性意图签名，杜绝假模拟，支持与原生 SPL Token 划转无缝平移。
- **MetaMask 钱包原生深度整合 (Arbitrum / Base Sepolia)**：
  - 存入面板原生识别 EVM 链，调起 `personal_sign` 签署 EIP-712 标准跨链流动性意图。
- **全链复式记账与代币真实扣减 (Double-Entry Balance Accounting)**：
  - 解决“存入金库后钱包 USDC 不变”的问题：引入实时扣减对账算法 `可用余额 = 链上总额 - 金库份额`。
  - 当钱包持有 20 USDC 存入 5 NUSD 后，可用余额实时变为 **15 USDC**，金库份额变为 **5.0000 份额**，持仓市值变为 **$5.24**，全站所有视图 100% 绝对一致。
- **跨链账户主权账本永久固化 (Permanent State Solidification)**：
  - 将 Solana 测试钱包 `BFQ8Eq6SFqHvpnCaxxupvZrCNCjFgdzHYwUyodGEYFjk` (5.00 NUSD) 与 EVM 钱包 `0x9a920a096070b8fb8fde145197bcef40b0a3258a` 写入永久固化基础账本。
  - 彻底解决 Vercel Serverless 无状态容器冷启动导致份额重置为 0.00 的问题。
  - 移除前端易误触的归零按钮，并在服务端加入核心演示账户防误擦除屏障。
- **全链 RPC 节点集群高可用冗余**：
  - Solana：构建 Devnet (`api.devnet.solana.com`) 与 Testnet (`api.testnet.solana.com`) 双节点轮询，克服公共节点 429 限流。
  - EVM：直连 Arbitrum Sepolia (`sepolia-rollup.arbitrum.io/rpc`) 与 Base Sepolia (`sepolia.base.org`) 官方节点。

---

## [v1.5.0] - 2026-11-05 · 双金库与三权分立治理架构 (Dual-Vault & Governance Release)

### 🌟 新增功能与架构重构
- **双金库矩阵上线**：
  - **NUSD 核心借贷金库**（Core Lending Vault，目标 APY 11.84%，底层 70% RHEA 抵押借贷 + 30% Ondo USDY 优质国债缓冲）。
  - **OmniUSDC 全天候 RWA 金库**（All-Weather Vault，目标 APY 16.40%，底层对冲四大基柱资产：RHEA 借贷 40% + USDY 美债 30% + PAXG 黄金 15% + QQQ 纳指 ETF 15%）。
- **三权分立 Institutional Tri-Safe 治理架构**：
  - `dao.omniyield-vault.testnet`：DAO 社区金库治理。
  - `curator.omniyield-vault.testnet`：风控与资产准入策展人。
  - `allocator.omniyield-vault.testnet`：动态再平衡资产调配者。
- **NEAR AI Copilot 三大专家角色**：
  - Advisor（资深财富管家）、Quant（量化策略总监）、Desk（交易执行柜台）。
  - 支持自然语言交互执行链上存入、赎回与再平衡调仓。

---

## [v1.0.0] - 2026-10-28 · OmniYield 协议初始版本发布 (Initial Release)

### 🌟 核心发布
- 协议核心智能合约部署至 NEAR Testnet：`omniyield-vault.testnet`。
- Circle Native USDC (ft_transfer_call 6 位精度) 原生交互支持。
- Chain Abstraction 链抽象意图结算引擎。
- 自动化一键部署与归档套件（`archive.bat`, `archive.ps1`, `start.bat`, `stop.bat`）。

