# OmniYield Protocol - NEAR Testnet Credentials
**Generated & Verified On-Chain: 2026-11-01**
**Network**: NEAR Testnet (`testnet`)

---

## 📌 关于“私钥”与“助记词”的说明
- **只有私钥，没有助记词是完全正常的**：
  在 NEAR Protocol 中，通过 `near-cli`、SDK 或开发者命令行创建的子账户与合约账户，底层均直接采用 **Ed25519 非对称密码学密钥对（Keypair）**。
- **私钥是最高主权控制凭证**：
  在密码学中，助记词（12/24 词）的作用仅仅是作为种子（Seed）衍生出私钥；而 **私钥（Private Key）本身就是最终的链上签名根凭据**。
- **所有主流 NEAR 钱包 100% 兼容私钥导入**：
  包括 **HERE Wallet**、**MyNearWallet**、**Meteor Wallet**、**Sender** 等，均原生支持选择 `Import via Private Key` 导入并完全接管该账户。

---

## 🔐 5 大核心账户密钥清单

### 1. DAO / 所有者账户 (Owner - 🏛️ Multi-Sig 多签治理合约已激活)
- **账户 ID**: `dao.omniyield-vault.testnet`
- **角色定位**: 协议最高治理所有者、Sputnik Multi-Sig 多签治理合约、时间锁与跨合约治理执行中枢
- **多签状态**: 4 位理事会成员（`dao.`, `curator.`, `guardian.`, `allocator.`），2/2 阈值生效
- **公钥 (Public Key)**: `ed25519:E9Ksn2fgt5yrQ7qz2ajXMW2wFUR2f7drf1jM2UWDHnDE`
- **私钥 (Private Key)**: `ed25519:***REDACTED_FOR_SECURITY_LOCAL_BACKUP_AVAILABLE***`
- **区块浏览器**: [https://testnet.nearblocks.io/address/dao.omniyield-vault.testnet](https://testnet.nearblocks.io/address/dao.omniyield-vault.testnet)

---

### 2. 风险策划人账户 (Curator)
- **账户 ID**: `curator.omniyield-vault.testnet`
- **角色定位**: Steakhouse / Gosun Labs 风险策划实体，负责市场准入与风控额度配置
- **公钥 (Public Key)**: `ed25519:EcRq5sg1MXXqzMksYKF8pj4JdumwGQufavCn9Mx3xJXW`
- **私钥 (Private Key)**: `ed25519:***REDACTED_FOR_SECURITY_LOCAL_BACKUP_AVAILABLE***`
- **区块浏览器**: [https://testnet.nearblocks.io/address/curator.omniyield-vault.testnet](https://testnet.nearblocks.io/address/curator.omniyield-vault.testnet)

---

### 3. 安全守门人账户 (Guardian)
- **账户 ID**: `guardian.omniyield-vault.testnet`
- **角色定位**: 安全委员会独立守门人，拥有一票否决权（VETO）与紧急熔断权（Circuit Breaker）
- **公钥 (Public Key)**: `ed25519:HPpyXYirgZhu3qC9TtTDfqxTx5dd4Z7Fk6LoYqS6CUN9`
- **私钥 (Private Key)**: `ed25519:***REDACTED_FOR_SECURITY_LOCAL_BACKUP_AVAILABLE***`
- **区块浏览器**: [https://testnet.nearblocks.io/address/guardian.omniyield-vault.testnet](https://testnet.nearblocks.io/address/guardian.omniyield-vault.testnet)

---

### 4. AI 套利分配器账户 (Allocator)
- **账户 ID**: `allocator.omniyield-vault.testnet`
- **角色定位**: 自动化 AI 套利 Keeper，监控 RHEA 与 Ondo 国债利差并自主再平衡
- **公钥 (Public Key)**: `ed25519:Ecu449ALjgDCXRFpPrCzufUUXYokVNuQJogruJz5yLyH`
- **私钥 (Private Key)**: `ed25519:***REDACTED_FOR_SECURITY_LOCAL_BACKUP_AVAILABLE***`
- **区块浏览器**: [https://testnet.nearblocks.io/address/allocator.omniyield-vault.testnet](https://testnet.nearblocks.io/address/allocator.omniyield-vault.testnet)

---

### 5. 主金库合约账户 (Vault Contract - ⚠️ 开发期部署私钥)
- **账户 ID**: `omniyield-vault.testnet`
- **角色定位**: 协议主金库合约，托管资金池、NEP-141 份额铸造、双队列路由
- **公钥 (Public Key)**: `ed25519:CdKeDCDRS3DnTTkGvpRX8YAyYzpjxkdtvyihJnzGq8uR`
- **私钥 (Private Key)**: `ed25519:***REDACTED_FOR_SECURITY_LOCAL_BACKUP_AVAILABLE***`
- **区块浏览器**: [https://testnet.nearblocks.io/address/omniyield-vault.testnet](https://testnet.nearblocks.io/address/omniyield-vault.testnet)
- **⚠️ 生产级安全特别说明（私钥销毁 / 合约锁定规范）**：
  - **当前测试网开发阶段**：保留此 `FullAccess` 密钥仅用于黑客松开发联调与合约 WASM 在线升级修复（`near deploy --force`）。
  - **正式主网发布（Mainnet Launch）阶段**：根据 NEAR DeFi 顶级去中心化标准，主金库合约的 `FullAccess` 私钥必须**永久销毁（Lock Contract）**：
    ```bash
    # 生产环境销毁命令：删除底层完全访问密钥，使合约彻底代码自治、不可篡改
    near delete-key omniyield-vault.testnet ed25519:CdKeDCDRS3DnTTkGvpRX8YAyYzpjxkdtvyihJnzGq8uR
    ```
    一旦销毁，没有任何人能通过私钥控制或替换合约代码，彻底消除单点跑路（Rug-Pull）风险！

---

## 🛠️ 导入钱包快速指引

### 方式 A：HERE Wallet 手机端导入
1. 打开 HERE Wallet ➔ **设置 (Settings)** ➔ 连续点击 **版本号** 5 次开启 **开发者模式** ➔ 网络切换为 **Testnet**。
2. 账户列表点击 **添加账户 (Add Account)** ➔ **导入已有账户 (Import existing account)** ➔ **私钥导入 (Private Key)**。
3. 填入账户 ID（如 `dao.omniyield-vault.testnet`）并粘贴完整私钥（含 `ed25519:` 前缀）。

### 方式 B：MyNearWallet 官方网页端恢复
1. 浏览器访问：[https://testnet.mynearwallet.com/recover-account](https://testnet.mynearwallet.com/recover-account)
2. 选择 **Import Private Key**；
3. 输入账户 ID 与对应私钥，点击立即恢复。

