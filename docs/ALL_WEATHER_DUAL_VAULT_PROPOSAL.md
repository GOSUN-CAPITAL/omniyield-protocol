# GOSUN OmniYield: 双金库矩阵与全天候 RWA 宏观对冲金库实施方案
*(Dual-Vault Architecture & All-Weather Macro RWA Vault Implementation Proposal)*

---

## Executive Summary (执行摘要)

为了让 **GOSUN OmniYield** 从“单一稳定币理财协议”跃升为 **“Web3 首个全天候链上全球资产管理协议 (The First Web3 On-Chain All-Weather Asset Manager)”**，本方案正式提出 **双金库矩阵（Dual-Vault Matrix）** 架构。

在前端导航栏的 **`Vaults`** 栏位下，用户与机构可自由、无缝切换两个定位鲜明、风险收益互补的旗舰金库：
1. **金库 A：`GOSUN OmniYield USDC`（纯稳定币固收理财）** —— 极低风险、保本兜底、高流动性（11.84% APY）。
2. **金库 B：`GOSUN All-Weather RWA`（达里奥全天候宏观对冲金库）** —— 跨周期宏观抗通胀、美股美债黄金 Crypto 四维平价对冲、高夏普比率（预期 16.40% 综合复合年化）。

---

## 一、 双金库矩阵深度对比 (Dual-Vault Matrix)

| 核心指标 | 金库 A：GOSUN OmniYield USDC (已上线) | 金库 B：GOSUN All-Weather RWA (全新旗舰) |
| :--- | :--- | :--- |
| **金库定位** | 纯美元稳定币固收收益增强 | 宏观全天候资产对冲与资本增值（桥水模式） |
| **目标客群** | 追求 100% 本金安全、随存随取的稳定币储蓄用户 | 追求抗通胀、想要一键配置全球美股/美债/黄金/加密资产的高净值与机构资金 |
| **预期年化 (APY)** | **11.84%** (动态复利) | **16.40%** (美股分红+美债息票+金价升值+Crypto利差) |
| **底层资产配置** | • 70% RHEA 借贷利差<br/>• 30% Ondo USDY 短期美债 | • 40% Ondo USDY 短期美债 (资本防守底仓)<br/>• 25% Ondo Tokenized Stocks (QQQ/标普成长)<br/>• 15% Tokenized Gold (PAXG 黄金抗通胀)<br/>• 20% Web3 借贷与套利 (RHEA Alpha) |
| **金库凭证代币** | `OmniUSDC` | `OmniAW` (Omni All-Weather Shares) |
| **最大历史回撤** | 0.00% (全纪元保本无负收益) | < 1.8% (四维资产负相关性对冲平滑) |
| **夏普比率 (Sharpe)**| 4.85 | **5.42** (极致风险收益比) |
| **支持充值资产** | USDC (多链通过 NEAR Intents 直存) | USDC, USDT, BTC, ETH (智能路由拆解配置) |

---

## 二、 金库 B（全天候金库）的底层运转与收益机制

### 1. 为什么叫“全天候（All-Weather）”？
基于桥水基金创始人瑞·达里奥（Ray Dalio）的经典经济四象限对冲逻辑：
* **经济平稳/繁荣时**：25% 美股科技资产（QQQ / NVDA）爆发，贡献资本利得；
* **经济衰退/降息时**：40% 美债（Ondo USDY）锁定现金流并享受债券升值红利；
* **极端通胀/地缘冲突时**：15% 链上黄金（PAXG）单边暴涨，平抑法币贬值；
* **加密牛市/活跃期**：20% Web3 借贷利差（RHEA）捕捉高达 15%+ 的链上流动性溢价。

### 2. 收益如何结算与复利？
* 所有的资产最终都折算为 `OmniAW` 份额净值（以美元计价）。
* **AI Allocator 智能管家** 每天监控各市场表现，按季度或根据波动率阈值执行 **全自动动态再平衡（Autonomous Rebalancing）**：
  * 美股涨幅超标时自动止盈，资金流向被低估的美债或黄金；
  * 加密借贷利率暴增时短暂加仓，平息后迅速回撤至美债储备。

---

## 三、 前端交互设计：在 `Vaults` 栏位下优雅切换

### 1. 顶栏导航与选择器交互
当用户点击顶部导航的 **`Vaults`** 时，页面呈现极简高雅的下拉选择浮层（或卡片上方的 Pill 切换按钮）：

```
[ Vaults ▼ ]   [ Markets ]   [ Portfolio ]            [ 🌙 | ☀️ | 🌐 EN/简 ]  [ Wallet ]
  │
  ├─ 🔹 GOSUN OmniYield USDC    (11.84% APY • $12.45M TVL • 纯稳定币固收)
  │
  └─ 🌟 GOSUN All-Weather RWA   (16.40% APY • $8.60M TVL  • 宏观四维对冲)
```

### 2. 切换金库时的全局动态响应（0 刷新，丝滑过渡）：
1. **标题与状态徽章**：
   * 切换至金库 B 时，标题切换为 **`GOSUN All-Weather RWA`**，徽章展示 `Macro Risk Parity`、`Bridgewater Standard`、`Ondo + Gold + RHEA`。
2. **核心指标栏**：
   * 综合 APY 切换为 **16.40%**；流动性安全垫切换为 **$3.44M (40% USDY)**；净值单位切换为 `1 OmniAW = $1.0628`。
3. **业绩曲线图 (Performance Chart)**：
   * 自动加载全天候金库的历史走势线（展示稳健斜率上升与极低波动的优异轨迹）。
4. **底层市场分配卡 (Dynamic Market Allocations)**：
   * 自动从“2 卡片（借贷+美债）”平滑拓展为 **“4 象限宏观卡片”**：
     * 卡片 1：Ondo USDY US Treasuries (40% • 5.10% APY)
     * 卡片 2：Ondo US Tech Equities QQQ (25% • 18.20% Growth APY)
     * 卡片 3：Tokenized Gold PAXG (15% • 12.50% APY)
     * 卡片 4：RHEA Finance Lending (20% • 13.88% APY)
5. **180° 翻转控制台 (Cockpit Backside)**：
   * 策展人（Curator）面板可分别调节全部 4 个子市场的上限和动态分配比例。

---

## 四、 智能合约与链上技术扩展方案

本设计能够以极快速度落地，原因在于我们已经部署好的 **OmniSocket™ 架构**：

```
omniyield-vault.testnet (Master Vault)
   ├── rhea.omniyield-vault.testnet  (已上线: 借贷适配器)
   ├── ondo.omniyield-vault.testnet  (已上线: 美债适配器)
   ├── stocks.omniyield-vault.testnet (新增: Ondo 美股 QQQ 适配器)
   └── gold.omniyield-vault.testnet   (新增: 黄金 PAXG 适配器)
```

1. **链上合约部署**：
   * 在 NEAR Testnet 增发两个子账号：
     * `stocks.omniyield-vault.testnet`（对接 Ondo 代币化美股）；
     * `gold.omniyield-vault.testnet`（对接链上黄金 PAXG）；
   * 复用现有成熟的 `SocketAdapter` Rust 核心，支持 `supply`、`redeem`、`get_market_state` 与纳秒级计息。
2. **AI Allocator 扩展**：
   * `scripts/keeper_allocator.js` 扩展对 4 个适配器的巡检和动态平衡。

---

## 五、 实施计划与里程碑 (Execution Roadmap)

* [ ] **阶段 1：用户确认与方案定稿**（当前节点）
  * 确认双金库名称、比例（40/25/15/20）及前端呈现方式。
* [ ] **阶段 2：编写并部署 2 个新适配器**
  * 创建 `contracts/adapters/stocks_adapter` 与 `gold_adapter` 并编译 WASM；
  * 在测试网创建 `stocks.` 与 `gold.` 子账号并完成部署初始化。
* [ ] **阶段 3：前端双金库状态机与切换器实现**
  * 在 `page.tsx` 与顶栏增加 `activeVault: "usdc" | "all-weather"` 状态机；
  * 为 All-Weather 金库量身定制 4 象限分配卡片与图表数据。
* [ ] **阶段 4：联调验证与 NearBlocks 存证**
  * 验证双金库互相切换、充提与 AI Allocator 4 象限调仓，产出完整验证哈希。

