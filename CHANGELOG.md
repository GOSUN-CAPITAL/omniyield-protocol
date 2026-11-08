# OmniYield Protocol · 更新日志 (CHANGELOG)

本文档记录 OmniYield 全链流动性资管协议的所有重要版本迭代、架构演进与修复记录。

---

## [v2.5.0] - 2026-11-08 · 官方黑客松成功终审提交、NEAR Builders 榜首建档、洛书主权定稿 LOGO 与全景国际化升级

### 🌟 核心突破与官方生态里程碑 (NEAR Official Milestones)
- **NEAR HACKATHON 官方终审成功提交 (`nearhackathon.com/#apply`)**：
  - **完成最终报名与立项收录**：成功收到官方 **`✓ SUBMISSION RECEIVED: You're on the radar!`** 确认回执，官方正式进入评审周期（评奖揭晓至 2026-11-18）。
  - **精准对齐四大核心赛道**：
    1. **Unstoppable DeFi (`defi`)**：Morpho 风格双队列资本路由 + RHEA 借贷超额利差 + 16 链免桥清算；
    2. **Privacy & Private AI (`privacy`)**：NEAR AI Cloud 硬件级机密计算（Intel TDX / NVIDIA TEE）无状态隐私推理；
    3. **Real-World Money (`realworld`)**：Ondo USDY 美债基准与 PAXG 黄金全天候宏观对冲 + NEP-366 零 Gas 摩擦；
    4. **Agent Economy (`agents`)**：自然语言意图编译 + `/agent.md` 与 `/llms.txt` 机器可读协议清单。
  - **Twitter / X 官方社区演示公开发布**：带官方 `@NEARProtocol` 与 `#NEARHackathon` 标签的 Demo 推文正式上线。
- **NEAR Builders 官方生态目录榜首建档 (`nearbuilders.org/projects`)**：
  - 项目在 NEAR Builders 全量项目索引中**荣登最新榜首（ALL ENTRIES #1）**，官方标识与标签全面激活。
- **东方“河图洛书·主权金库”极简超级符号正式定稿**：
  - **几何与哲学内核**：汲取洛书九宫格“戴九履一、左三右七、五居中央”与“纵横皆为十五”的数学绝对守恒哲理，暗合代币差额守恒（Token Diffs）与达里奥全天候四维风险平价（Risk Parity）。
  - **色彩与生态对齐**：外围采用 **NEAR 官方翡翠绿（`#00EC97`）**，中央核心采用 **OmniYield 主权黄金（`#F59E0B`）**，兼具东方数理深度与世界级现代科技金融质感。
  - **完整品牌资产库**：在 `brand_assets/logo_candidates/` 中建立 5 套候选库与矢量源文件归档，并部署为全局官方标识。
- **全站视觉体系与国际化 (i18n) 深度精修**：
  - **羊脂暖米白（Warm Beige / 太阳模式）自适应**：修复 Enterprise 企业级嵌入页面中的深黑底块与破裂图标问题，右侧 420px 嵌入式组件与全站主题实现动态丝滑联动。
  - **USDC 官方矢量 Logo 链路修复**：确保全端与嵌入组件内的 USDC 官方标识圆润清晰呈现。
  - **代码与策略选择器 100% 英文地道化**：消除 EN 英文模式下的任何中文残留，达到华尔街级双语标准。
- **README 升级为机器与评委友好型复现指南**：
  - 依照官方 `HACKATHON.md` 对 Codex / Claude Code 机器筛选器的要求，在 GitHub 首页置顶 **"Do X ➔ See Y" 快速复现矩阵**，确保自动化评分脚本与人类评委均能秒级复现。

---

## [v2.4.0] - 2026-11-08 · 对标 NEAR 官方规范升级：NEAR AI Cloud 多轮记忆与机密计算、NEAR Intents 撮合规范与 NEP-366 无感代付

### 🌟 核心突破与官方生态标准对齐 (Official NEAR Ecosystem Alignment)
- **NEAR AI Cloud 原生接入与深度升维 (`docs.near.ai`)**：
  - **导入官方最新 API 凭证**：配置官方 NEAR AI Cloud 高性能计算密钥，打通 `https://cloud-api.near.ai/v1` 生产端点。
  - **多轮对话上下文记忆 (Multi-Turn History)**：在 `NearAICopilot.tsx` 与 `/api/ai/chat` 间实现上下文回溯通道，完整支持 OpenAI-compatible 规范，Copilot 具备跨轮次意图理解能力。
  - **官方模型矩阵智能级联容错 (Model Cascading)**：首选 `z-ai/glm-5.3-flash`（低延迟/高精度金融语义），智能降级至 `deepseek-ai/DeepSeek-V4.1-Flash-1017` 与 `google/gemini-2.5-flash`，彻底消除单点网络抖动。
  - **硬件级机密计算背书 (Confidential Computing TEE)**：在 AI 智能助手控制面板新增 **`NEAR AI TEE 🛡️`** 认证标识，突出硬件级安全隔离推理（Intel TDX / NVIDIA TEE），提升机构合规可信度。
- **NEAR Intents 意图清算规范全面对齐 (`docs.near-intents.org`)**：
  - **三位一体 AI 提示词规范化**：将 Expression Layer 意图签名、1Click RFQ 离链竞价、Verifier 代币差额守恒（Token Diffs）定律以及 Anti-MEV 防夹机制深度融入系统提示词。
  - **兑换端履约凭证升维 (`ExchangeView.tsx`)**：在原子结算成功卡片中，加入直连官方规范文档 `docs.near-intents.org` 与 NearBlocks 浏览器双重验证链接。
  - **客服智能体知识库更新**：权威解析 16 链免桥意图直达的数学守恒机制，消除用户对传统跨链桥丢币的顾虑。
- **NEAR 开发者标准协议深度合规 (`docs.near.org`)**：
  - **NEP-366 元交易代付规范 (Meta Transactions)**：在 `/api/transact` 中正式规范化 `NEP-366 Gas Sponsored via Relayer` 回执，明确全链入金与金库份额铸造对终端用户实现 100% 零 Gas 摩擦（$0.00 Gasless）。
  - **白皮书技术架构图与合规陈述升级 (`docs/WHITEPAPER.md`)**：
    - Tier 2 核心结缔层扩充：正式标明 **NEP-366 元交易中继**、**NEAR Chain Signatures (`v1.signer` 阈值 MPC 网络)** 以及 **Nightshade 2.0 无状态验证 (Stateless Validation)** 机制。
    - 规范性引用更新：正式纳入 **NEP-145**（存储质押管理规范）与 **NEP-366**，与 ERC-4626 形成跨链双重对标。

---

## [v2.3.0] - 2026-11-08 · “自营+TO B”战略定位确立、NEAR自营中枢+多链加盟拓扑与白皮书v2.2.0发布

### 🌟 核心突破与对外材料升维 (Institutional Deck & Whitepaper v2.2.0)
- **确立“自营旗舰 + TO B 赋能”双引擎商业模型**：
  - **自营旗舰**：自主运营官方双金库（$NUSD$ 核心借贷金库 11.84% 与 $OmniUSDC$ 全天候 RWA 平价金库 16.40%），直面高端资管、家族办公室与 DAO 国库，配备 NEAR AI Copilot 实时财富操盘；
  - **TO B 赋能**：通过 `@omniyield/earn-sdk`、极简 HTML Script 与 Headless API 赋能全球 Web3 钱包（Phantom、MetaMask、OKX）与金融科技新银行，合作伙伴零运维享受每年 0.35% 年化 TVL 抽成。
- **确立“NEAR 链自营中枢 + 多链加盟扩张”网络拓扑**：
  - **NEAR 自营清算中枢**：主权账本、份额发行、防通胀虚拟偏移、风控限额管理全局沉淀在 NEAR 极速低成本底座；
  - **多链加盟体系**：Solana、Arbitrum、Base 等异构链作为“分销加盟商”与“策略插座加盟商”，通过 NEAR 门限签名与意图网络实现无桥无滑点极速清算。
- **技术白皮书全面升维至 v2.2.0 (`docs/WHITEPAPER.md`)**：
  - 核心定义升级：将 OmniYield 定位为**面向 Web3 钱包与金融科技的“全链企业级嵌入式收益堆栈”（Enterprise-Grade Embedded Earn Stack）**。
  - 完整确立 OmniYield 4 层解耦架构（分发加盟层、主权金库结缔层、多策展风控层、底层策略插座层）。
  - 详尽阐释 **Multi-Curator 加盟子金库机制**：债务上限硬隔离不变性证明、策展人链上业绩分成公式、4 权分立治理矩阵与 24h 时间锁防护。
  - 全链复式记账法（Double-Entry Accounting）与无桥意图清算证明。
- **机构融资商业 Pitch Deck 归档发布 (`docs/INSTITUTIONAL_PITCH_DECK.md`)**：
  - **核心叙事与投资亮点**：聚焦 \$170B+ 闲置稳定币与 \$5B+ 爆发式增长的 Embedded Earn 蓝海赛道。
  - **B2B2C 商业模式与单车经济模型**：为分发商提供零代码集成与每年 **0.35% TVL 返佣现金流**测算表（$10M TVL 获 \$35K/年，$100M TVL 获 \$350K/年）。
  - **全球竞品多维对比矩阵**：确立 OmniYield 在链抽象无桥结算、Gas 纯代付、双金库矩阵与 AI 意图 Copilot 上的绝对代际护城河。
  - **财务测算与阶段估值模型**：推导 TVL 从 \$10M 跃升至 \$1B 阶段协议年度性能费、分发商分成与国库回购规模。
  - **融资条款与资金用途规划**：明确 Seed / Strategic 轮 \$2.5M 融资方案及 MPC 优化、顶级审计、生态激励分布。

---

## [v2.2.0] - 2026-11-08 · 多策展人与加盟白标子金库架构 (Multi-Curator & Franchise Sub-Vaults)

### 🌟 核心突破与智能合约升级 (Smart Contract & Institutional Cockpit)
- **多策展人与独立风控注册中心 (Multi-Curator Registry)**：
  - 在 NEAR 智能合约 (`omniflow_vault.wasm`) 引入 `CuratorConfig` 与 `register_curator` / `update_curator_limits` / `get_curators` 接口。
  - 支持外部独立投研机构（如 Steakhouse Financial、Bitwise RWA、Autonomous AI Agents）成为持牌风控策展人，分配硬性风险总仓位额度（Allocation Cap）与底层生息市场白名单，享受独立的业绩分成比例（Fee Share Bps）。
- **机构级加盟白标子金库注册中心 (Whitelabel Sub-Vault Registry)**：
  - 合约新增 `WhitelabelSubVault` 结构与 `create_sub_vault` / `set_sub_vault_pause` / `reallocate_sub_vault` / `get_all_sub_vaults` 方法。
  - 支持 B2B 合作伙伴与分销机构拥有完全隔离的加盟子金库（例如 `Steakhouse USD Core Alpha` 与 `Bitwise All-Weather RWA Institutional`）。
  - **核心不变性与风险隔离 (Strict Risk Invariant)**：各子金库独立设定债务上限 (`max_debt_ceiling`) 与市场白名单，调仓严格限制在子金库资产边界内，杜绝交叉感染。
- **机构后台全维可视化与应急控制台 (Section 1.6 Cockpit View)**：
  - 在 `VaultCockpitBackside.tsx` 深度呈现 Section 1.6 **`机构多策展人与白标子金库注册中心`**。
  - 动态展示各子金库在管资产、债务上限、分销伙伴标识、管理与业绩费率。
  - 集成一键应急熔断（Emergency Pause / Freeze）与状态控制开关。
- **全链账户跨链状态与主权账本永久固化 (Cross-Chain Balance Solidification)**：
  - 深度加固双金库主权账本 `vaultLedger.ts`：支持 Solana 地址前缀模糊与精确双重映射，杜绝大小写或截断引发的不一致。
  - 消除 `NearAICopilot.tsx` 中并发调用导致的余额覆盖竞态问题。
  - 确保从 Solana Phantom、EVM MetaMask 存入 5 USDC 铸造 NUSD 后，钱包 USDC 真实扣减（20 -> 15），NUSD 份额（5.0000）与持仓市值（$5.24）在全站（顶部导航、账户抽屉、投资组合、兑换面板）绝对同构且刷新永久留存。

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

