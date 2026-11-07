# OmniSocket™ 开发者接入规范与即插即用指南
> **The OmniSocket™ Specification: Modular Plug-and-Play Extensibility for OmniYield Protocol**  
> *Gosun Labs Engineering Standard v1.0.0*

---

## 1. 架构哲学：主板 + 插座 (The Motherboard & Socket Philosophy)

传统 DeFi 跨链协议最大的死穴是**“硬编码与团队瓶颈”**：主网支持哪些链、哪些借贷池，全靠核心团队手动开发维护。

**OmniYield 彻底重构了这一范式**，采用工业级 **“中央主板 + 即插即用插座（Motherboard & Sockets）”** 架构：

```
+─────────────────────────────────────────────────────────────────────────────────+
|               【中央流动性主板】(OmniYield Motherboard on NEAR)                 |
|  • 全局结算与 NUSD 份额记账 (ERC-4626)    • Morpho 双向流动性队列调度           |
|  • 隔离风控上限 (Supply Caps Engine)      • 插座注册管理中枢 (SocketRegistry)   |
+─────────────────────────────────────────────────────────────────────────────────+
                                    ▲
          ┌─────────────────────────┼─────────────────────────┐
          │ (插拔式接口标准)         │ (插拔式接口标准)         │ (插拔式接口标准)
          ▼                         ▼                         ▼
┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐
│   Chain Socket   │      │   Yield Socket   │      │ Community Socket │
│ (链级结算插座)   │      │ (底层生息插座)   │      │ (第三方社区插座) │
│ • Arbitrum, Base │      │ • RHEA Lending   │      │ • Monad, Sui,    │
│ • Solana, NEAR   │      │ • Ondo RWA 美债  │      │   Kamino, Aave   │
└──────────────────┘      └──────────────────┘      └──────────────────┘
```

* **中央主板（Motherboard）**：负责全局不可篡改的安全底座、NUSD 净值复利计算与 Morpho 风控队列。
* **即插即用插座（Sockets）**：任何第三方公链（Layer 1 / Layer 2）或任何借贷/生息协议，只需遵循本规范编写一个标准的适配合约，**即可无需许可地插上 OmniYield 主板，瞬间共享全链海量流动性！**

---

## 2. 两大标准化插座规范 (Standard Socket Specifications)

### 2.1 规范 A：链级结算插座 (`ChainSocket`)
适用于外部公链（如 Arbitrum, Solana, Base, 以及未来的 Monad, Sui）。用于打通资产从该公链存入与取款的意图通道。

#### 核心 Rust 接口定义：
```rust
pub trait ChainSocketTrait {
    /// 验证外部公链上的原生存入意图与资金锁定证明
    fn verify_inbound_intent(&self, raw_proof: &[u8]) -> bool;

    /// 当用户在外部公链提款时，调用链签名触发该链的原生清算释放
    fn dispatch_outbound_payout(&self, destination_address: &str, amount: u128) -> bool;
}
```

### 2.2 规范 B：底层生息市场插座 (`YieldSocket`)
适用于任何借贷协议、流动性质押或 RWA 美债发行方。

#### 核心 Rust 接口定义：
```rust
pub trait YieldSocketTrait {
    /// 向底层协议注入资金
    fn supply(&mut self, amount: u128) -> u128;

    /// 从底层协议赎回资金
    fn withdraw(&mut self, amount: u128) -> u128;

    /// 实时上报当前的年化利率 (APY 基点, 1388 = 13.88%)
    fn get_current_apy_bps(&self) -> u32;

    /// 查询底层协议当前最大的可用瞬时流动性
    fn get_available_liquidity(&self) -> u128;
}
```

---

## 3. 第三方开发者接入三步曲 (3-Step Integration)

第三方生态基金会（如 Monad Foundation）或 DeFi 团队接入只需 3 步：

```
【第 1 步：实现接口】 -> 继承 YieldSocketTrait 或 ChainSocketTrait 编写适配合约。
【第 2 步：部署测试】 -> 在 NEAR 测试网部署适配器合约（如 `monad-adapter.near`）。
【第 3 步：治理插拔】 -> 提交治理提案调用 `register_yield_socket()`，设定该市场的初始 Supply Cap，完成主板接入！
```

### 治理注册接口示例：
```rust
vault.register_yield_socket(
    "monad-lending".to_string(),               // 唯一插座 ID
    "Monad Ecosystem Lending Pool".to_string(),// 市场名称
    "monad-adapter.near".parse().unwrap(),      // 适配器地址
    U128(10_000_000 * 1_000_000),              // 初始风控 Cap (1000万 USDC)
    1550,                                      // 当前 APY (15.50%)
    3,                                         // 队列优先级
    "1.0.0".to_string(),                       // 插座版本
);
```

---

## 4. 为什么该标准具备无敌护城河？

1. **绝对解耦，杜绝单点故障**：
   如果某个接入的第三方插座发生协议风险，Curator 只需调用 `set_socket_status(socket_id, false)`，即可在 1 秒内暂停该插座并将其隔离，主板与其他插座资金绝对安全！
2. **真正的网络效应（Network Effect）**：
   每增加一个插座，全链的 TVL 选项和结算目的地就增加一个。OmniYield 不再依赖自身团队去扩展多链，而是成为了全 Web3 开发者共同维护的**“全球流动性总线（Global Liquidity Bus）”**！

