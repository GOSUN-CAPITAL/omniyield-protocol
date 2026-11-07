# NEAR Hackathon 2026 参赛与交付通关指南
> **Event:** NEAR HACKATHON: Build Beyond Boundaries ([nearhackathon.com](https://nearhackathon.com))  
> **Timeline:** 2026.11.01 00:00 UTC - 2026.11.14 23:59 UTC  
> **Prize Pool:** $250,000 in NEAR (Grand Prize: $55,000 | Track 1st: $10,000)

---

## 一、 参赛规则与交付要求梳理

* **免传统报名 (No signup)**：在 11 月 14 日 23:59 UTC 截止前，提交两个核心成果物：
  1. **公开 GitHub 仓库 (Public Repo)**：包含完整代码、测试用例与说明文档；
  2. **X (Twitter) 公开 Demo 演示帖子**：带视频/截图，标明项目在 NEAR Hackathon 期间构建，艾特 `@NEARProtocol` 并带 `#NEARHackathon` 标签；
  3. **官网表单最终提交**：在 [nearhackathon.com](https://nearhackathon.com) 填写并提交项目信息。

---

## 二、 双重评审应对秘籍 (How to Win)

### 1. 第一关：AI 自动化代码初筛 (Claude Code / Codex)
* **初筛机制**：官方通过自动化 AI Agent 抓取 GitHub 仓库，执行编译、单测运行和文档一致性比对。
* **我们的通关保证**：
  * 提供 `docker-compose.yml`，AI 可一键启动本地节点与测试；
  * 提供标准的 `cargo test` 单元测试套件，通过率为 100%；
  * 根目录 `README.md` 包含标准架构图与规范命令，让 AI 初筛程序拿到最高分。

### 2. 第二关：顶级风投评审 (a16z crypto / Dragonfly / NEAR Foundation)
* **评审偏好**：顶级 VC 重点考察叙事高度、真实商业闭环与生态互补性。
* **我们的杀手锏打法**：
  * **击中 a16z 审美**：引入其领投的 **Morpho (MetaMorpho)** 黄金金库架构，实现“全链版 MetaMorpho”；
  * **击中 NEAR 官方战略**：把 NEAR Intents 与链签名推向万亿资管，成为生态一哥 **RHEA Finance** 的超级引流泵；
  * **视觉与体验惊艳**：展示“Arbitrum 存入、Solana 秒取”的奇迹般跨链体验。

---

## 三、 2 分钟 Demo 演示视频镜头脚本 (Video Script)

| 时间轴 | 画面展示 (Screen) | 旁白讲解重点 (Voiceover) |
| :--- | :--- | :--- |
| **0:00 - 0:30** | 展示多链割裂痛点：钱包里有 Arbitrum 和 Base 稳定币，但想赚高息必须面对复杂的跨链桥、多次授权和缺乏 Gas 代币的困境。 | “DeFi 拥有 1,700 亿美元稳定币，但流动性被割裂在几十条公链上。用户为了寻找利差，频繁忍受高风险跨链桥与繁琐的 Gas 费用。” |
| **0:30 - 1:00** | 打开 **OmniYield** 酷炫界面。选择 Arbitrum 存入 1,000 USDC，点击“1-Click Deposit”。3 秒内交易完成，生成 **`NUSD`** 份额！ | “在 OmniYield，我们依托 NEAR 意图网络，把跨链理财变成 1-Click 操作。用户无需跨链桥、无需目标链 Gas，秒级铸造原生生息凭证 NUSD。” |
| **1:00 - 1:30** | 镜头切至右侧 **Morpho 动态分配面板**：展示资金以 70% 的严格 Cap 注入 RHEA（13.88% APY），溢出资金流入 Ondo 美债（5.10% APY）。下方实时显示 AI Allocator 的调仓日志。 | “底层借鉴了 Morpho 黄金金库架构：设立硬性 Supply Cap 隔离借贷风险，利用 Supply/Withdraw 队列优化收益与流动性，AI Public Allocator 全天候自动捕捉利差。” |
| **1:30 - 1:50** | 点击 **Instant Withdraw**：输入 1,000 NUSD，选择提款链为 **Solana**。一键确认，资金从流动性最高的美债队列秒级出金，Solana 钱包瞬间到账！ | “更革命性的是：存入链与取款链彻底解耦。你在 Arbitrum 存钱，想玩 Solana 生态时可直接在 Solana 原生链秒级提现，且完全不冲击底层借贷市场！” |
| **1:50 - 2:00** | 展示架构图与总结标语：*OmniYield: The Universal Yield & Liquidity Clearing Layer on NEAR.* | “OmniYield 由 Gosun Labs 打造，赋能现实世界资产与全链金融，打造无法阻挡的 DeFi 终极体验！” |

---

## 四、 X (Twitter) 官方宣发推文模板

```markdown
🚀 Exciting news! We're thrilled to unveil @OmniYield (NUSD), built natively at the @NEARProtocol Hackathon: Build Beyond Boundaries! 🌐✨

OmniYield is the world's first Morpho-inspired omni-chain yield optimizer powered by NEAR Chain Signatures & Intents:
🔹 1-Click Inflow from ANY chain (Arbitrum, Solana, Base)
🔹 Dual-core Real Yield: @RheaFinance Lending (13.88% APY) + @OndoFinance RWA Treasuries
🔹 Strict Morpho Supply Caps (70%) & Dual-Queue Liquidity Isolation
🔹 Instant withdrawals directly to any destination chain

Watch our 2-min demo below to experience the future of Chain Abstraction & Agentic DeFi! 👇

🔗 GitHub: https://github.com/gosun-network/omniflow-vault
💻 DApp: https://omniflow.network

#NEARHackathon #NEAR #DeFi #ChainAbstraction @NEARProtocol
```

