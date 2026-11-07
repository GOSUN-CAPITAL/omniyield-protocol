# OmniYield Protocol (`NUSD`): 全链自适应稳定币收益与意图清算协议
> **NEAR Hackathon: Build Beyond Boundaries (2026.11.01 - 2026.11.14)**  
> **发起团队：** Gosun Labs  
> **核心资产：** `NUSD` (NEAR Yield Dollar)  
> **参赛赛道：** 主报 Track 1: *Unstoppable DeFi* | 兼报 Track 8: *Real-World Money* 与 Track 4: *Autonomous Business*  
> **核心目标：** 冲击赛道第一名 ($10,000) 与全场总冠军 Grand Prize ($55,000)

---

## 一、 项目执行摘要 (Executive Summary)

### 1.1 项目一句话定位
**OmniYield Protocol** 是由 **Gosun Labs** 发起、对标 **Morpho (MetaMorpho)** 黄金标准的**全链自适应模块化生息金库协议**。它依托 NEAR Protocol 的 **Chain Signatures（MPC 阈值链签名）** 与 **NEAR Intents（意图架构）**，发行原生生息稳定币 **`NUSD`**，实现：
> **“以 Morpho 式严密风控（Supply Queue & Caps）为底层骨架，以全链意图为入口，实现任意链 1 键存入 USDC/USDT，AI 机器人全网自动在 RHEA 高息借贷与代币化美债间动态寻租（8%~14% 年化），任意链秒级提取，内置智能防脱锚护盾。”**

### 1.2 商业与技术标杆对标
* **对标 Morpho (MetaMorpho)**：
  * **ERC-4626 / NEP 双重兼容**：对外是完全兼容的 NEAR 原生 NEP-141 标准代币 `NUSD`，对内是严谨的 ERC-4626 份额折算数学模型；
  * **市场隔离与 Supply Caps（供给上限）**：为底层市场设立硬性风险隔离上限，拒绝单点暴雷；
  * **Supply & Withdraw Queue（双向队列路由）**：存入优先吃满高收益队列，取款优先从高流动性美债队列秒级退出；
  * **Curator 与 Allocator 职责分离**：风控规则不可篡改，调度由 AI Allocator 自动化触发 `reallocate()`。
* **对标 Ethena / Sky (MakerDAO)**：
  * 发行具有自生息能力的全链通用美元凭证 **`NUSD`**，净值随底层复利持续增长。
* **超越传统 DeFi 的降维杀手锏**：
  * **打破单链孤岛**：传统 Morpho 局限在以太坊/Base 单链，OmniYield 借助 NEAR 链抽象让 Arbitrum、Solana、Base 用户无需跨链桥、无需准备目标链 Gas，秒级享有顶级风控与收益。

---

## 二、 行业痛点与万亿市场机遇 (Market Opportunity)

### 2.1 现状的三大“行业死结”
1. **流动性碎片化与 Gas 孤岛 (Liquidity Fragmentation)**：
   全网稳定币规模超 \$1,700 亿，但被割裂在各大公链。不同链借贷利率每天剧烈波动（3% ~ 20% 不等）。散户因跨链繁琐、缺乏目标链 Gas 代币而无法动态调仓，每年错失数以百亿计的理财利息。
2. **传统机枪池（Yearn）风控缺陷 vs Morpho 隔离优势**：
   传统机枪池将所有资金混杂在单一黑盒中，任何一个借贷端坏账都会拉垮整个金库；而 **Morpho 首创的独立市场与硬性 Cap 隔离**，是目前全行业公认最坚固的风控范式。
3. **借贷利用率过高导致的“提款卡死”通病**：
   传统借贷池在借款活跃时资金被借空，存款人无法及时提现；缺乏分层退出机制。
4. **脱锚风险与被动亏损 (De-peg Risk)**：
   在历史上的极端行情（如 UST 崩盘、硅谷银行事件导致 USDC 脱锚至 \$0.88），散户无法在睡梦中或拥堵网络下完成紧急逃生。

### 2.2 OmniYield 的破局解法
* **消灭跨链桥**：利用 NEAR MPC 链签名直接在各链原生调配资金，不发行任何中间跨链欠条；
* **链无关体验 (Chain-Agnostic UX)**：任意链存入、任意链取出，零 Gas 困境；
* **Morpho 式金库风控**：引入 Supply Caps 与双向队列，保证任何行情下本金安全与秒级流动性；
* **生态共生互补**：不重复造借贷轮子，而是作为 NEAR 生态旗舰 RHEA 的“全链资金抽水机”。

---

## 三、 核心机制：Morpho 驱动的双核动态收益矩阵 (Dual-Core Dynamic Engine)

OmniYield 遵循奥卡姆剃刀原则，摒弃高风险、高复杂度的衍生品对冲，聚焦于最真实、最优雅的**“双核动态收益再平衡架构”**：

```
+-----------------------------------------------------------------------------------------+
|                  OmniYield (Morpho-style Meta-Vault) 资产配置与风控架构                  |
+----------------------+--------------------+---------------------------------------------+
| 底层隔离市场 (Market)| 风控上限 (Supply Cap)| 市场定位与队列调度逻辑                      |
+----------------------+--------------------+---------------------------------------------+
| 市场 A: RHEA 借贷市场| 动态 Cap (例如 70%) | 【高息进攻端 - Supply Queue 优先级 1】      |
| (Burrow Core Engine) | (不超过借贷池安全度)| 当 APY 飙升 (如 13.88%)，资金优先填满该队列  |
+----------------------+--------------------+---------------------------------------------+
| 市场 B: 美债 RWA 市场| 无上限 / 兜底缓冲池 | 【极稳防守端 - Withdraw Queue 优先级 1】    |
| (Ondo USDY / Sky)    | (流动性缓冲蓄水池) | 4.5%~5.2% 无风险保底；用户提现优先从本队列秒提|
+----------------------+--------------------+---------------------------------------------+
| 综合自适应年化收益 (Blended Yield):                                        8.0% - 13.8%+ |
+-----------------------------------------------------------------------------------------+
```

### 3.1 借鉴 Morpho 的四大核心金库设计

#### ① 隔离风控上限 (Supply Caps Management)
* 避免将 100% 资金盲目推入单一借贷协议。系统为 RHEA 借贷市场设定动态 **Supply Cap（最高可配置 70%）**，其余资金必须沉淀在代币化美债（RWA）作为底层流动性储备；
* 即使 RHEA 发生极端借贷挤兑，由于 Cap 隔离和 RWA 底仓保护，金库永远保持极强的抗风险韧性。

#### ② 双向流动性队列 (Supply & Withdraw Queues)
* **存款流动路径 (Supply Queue)**：
  用户存入 USDC -> 优先供给高息的 RHEA 市场（直至触达当前 Cap 或利差逆转） -> 超额溢出部分沉淀至美债 RWA 市场；
* **提款流动路径 (Withdraw Queue —— 核心痛点突破)**：
  用户申请提款 -> **优先从流动性最充沛的美债 RWA 队列中释放资金** -> 避免强行从 RHEA 借贷池抽离导致借款人遭遇流动性冲击。**这保证了用户任何时刻都能“100% 秒级提现”！**

#### ③ 无许可公共分配器 (Morpho Public Allocator via AI)
* 借鉴 Morpho 的 Allocator 机制：核心合约开放 `reallocate()` 接口；
* 链下 AI Agent 作为去中心化 **Keeper**，实时监测链上利差（$APY_{RHEA}$ vs $APY_{RWA}$）。当满足重分配条件且未突破 Cap 时，触发原子交易完成金库头寸的动态搬移，全流程链上公开透明、代码可验证！

#### ④ 杀手级安全机制：De-peg Shield (智能防脱锚护盾)
* AI Agent 毫秒级监测 Curve/Uniswap 稳定币流动性倾斜度与 Chainlink 预言机偏差；
* 触发阈值（如偏离 \$0.985 且持续 3 个区块）：触发紧急意图，自动通过 Solver 毫秒级将风险稳定币换成最坚固的储备资产（如 USDT 或美债 RWA）。

---

## 四、 全系统技术架构 (Technical Architecture)

```mermaid
flowchart TD
    subgraph Users ["用户交互层 (Any Chain In / Out)"]
        ArbitrumUser["Arbitrum 钱包 (USDC)"]
        SolanaUser["Solana 钱包 (USDC)"]
        BaseUser["Base 钱包 (USDC)"]
    end

    subgraph IntentsLayer ["NEAR 意图与撮合网络 (Intents Layer)"]
        UserIntent["用户意图签名: 1-Click Deposit / Withdraw"]
        SolverNet["Decentralized Solvers (竞价跑腿 & 垫付 Gas)"]
        IntentsContract["intents.near (原子验证与清算)"]
    end

    subgraph CoreHub ["NEAR 协议核心总中枢 (NEAR Protocol)"]
        VaultContract["OmniYield Meta-Vault (Rust / ERC-4626 + NEP-141 NUSD)"]
        AIAgent["AI Public Allocator (实时比对 RHEA vs 美债利差)"]
        MPC["Chain Signatures Network (v1.signer)"]
    end

    subgraph DualCoreExecution ["双核底层收益承接地 (Dual-Core Real Yield)"]
        RHEA["【核心 A: 高息进攻】\nRHEA Finance 借贷池 (10% - 14% APY)\n[Supply Queue 优先级 1 | Cap 70%]"]
        RWA["【核心 B: 保底防守】\n代币化美债 RWA 池 (4.5% - 5.2% APY)\n[Withdraw Queue 优先级 1 | 兜底缓冲]"]
    end

    Users -->|1. 签署 Intent| UserIntent
    UserIntent --> SolverNet
    SolverNet -->|2. 提交最优执行报价| IntentsContract
    IntentsContract -->|3. 原子清算 & 铸造 NUSD 份额| VaultContract
    AIAgent -->|4. 动态计算利差, 触发 reallocate()| VaultContract
    VaultContract -->|5. 存款队列优先存入 (上限内)| RHEA
    VaultContract -->|5. 溢出与保底资产沉淀| RWA
    VaultContract -->|6. 取款队列优先释放| RWA
```

---

## 五、 端到端流程：任意链存入与任意链取款

### 5.1 存入流程 (1-Click Deposit)
1. **用户操作**：用户连接 Arbitrum 钱包，输入 1,000 USDC，点击“一键存入”并签署意图。
2. **Solver 竞价**：Solver 检测到意图，直接在 Arbitrum 上收取 1,000 USDC，并在 NEAR 上替用户提交清算指令并垫付手续费。
3. **NEAR 记账**：NEAR 上的 `OmniYield Vault` 根据当前净值铸造出对应的 **`NUSD`** 份额记录在用户统一身份名下，秒级开始计息。
4. **Morpho 队列分配**：资金依照 Supply Queue，优先充入 RHEA 借贷市场（Cap 限制内），享受 13.88% 高息；溢出部分进入美债 RWA 池。

### 5.2 取款流程 (Any-Chain Withdrawal)
1. **用户操作**：用户希望在 **Solana** 上拿到现金。用户在前端选择“取款到 Solana”，输入地址并销毁对应数量的 `NUSD`。
2. **Morpho 提款队列生效**：金库优先从流动性最好的美债 RWA 队列释放 USDC，零流动性滑点。
3. **Solver 快速垫付**：做市商（Solver）在 Solana 链上瞬间将本息对应的 USDC 打入用户的 Solana 钱包。
4. **NEAR 最终结算**：Solver 提交 Solana 原生转账交易证明，NEAR 合约核验后把金库中释放出的资金清算给 Solver。
5. **结果**：用户在 3 秒内完成跨链提款，完全无需走跨链桥！

---

## 六、 14 天黑客松作战路线图

| 阶段 | 时间窗口 | 核心交付物 | 评审重点 |
| :--- | :--- | :--- | :--- |
| **Phase 1: 合约底层** | Day 01 - 03 | NEAR Rust 智能合约、Morpho 双向队列与 Caps 状态机、NEP-141 NUSD 接口 | 编译 0 错误、wasm32 标准兼容 |
| **Phase 2: 意图与 AI** | Day 04 - 07 | 对接 `intents.near` 消息格式、编写 Python/TS AI Allocator 监控利差触发调仓 | 打造真正的 Agentic DeFi 闭环 |
| **Phase 3: 金融前端** | Day 08 - 10 | Next.js 14 暗黑金融终端、Morpho 风格 Caps 进度条、钱包 1-Click 意图存取界面 | 极具冲击力的高级视觉体验 |
| **Phase 4: 工程化加固** | Day 11 - 12 | 自动化测试用例、`docker-compose.yml` 一键本地启动、中英文架构级 README | 确保 Claude Code / Codex 一键秒跑通 |
| **Phase 5: 宣发与提交** | Day 13 - 14 | 2 分钟实操演示录屏、X (Twitter) 竞赛推文发布（艾特 @NEARProtocol）、官网表单提交 | 锁定 a16z / Dragonfly 顶级 VC 评审眼球 |

