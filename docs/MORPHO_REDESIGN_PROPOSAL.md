# OmniYield x Morpho 全局视觉架构优化方案

> **设计基准**：严格对标 [Morpho Vaults](https://app.morpho.org) 官方生产环境界面规范（参考用户提供的最新截图），将顶部导航、左侧金库主视觉、右侧操作卡片进行重构，并将太阳/月亮切换与 180° 机构控制台翻转按钮收纳至 LOGO 下拉菜单底部的 `[ ⚙️ | 🌙 | ☀️ ]` 控制岛中。

---

## 1. 核心架构重构总览 (Architectural Blueprint)

```mermaid
flowchart TD
    subgraph Header["1. 顶部导航栏 (Morpho-Grade Minimalist Navbar)"]
        LogoMenu["OmniYield Logo ˇ (可展开全功能下拉卡片)"]
        NavTabs["Nav Tabs: [Vaults] | [Markets] | [Portfolio]"]
        WalletPill["Wallet: allocator.omniyield... [Connected]"]
    end

    subgraph LogoDropdown["2. LOGO 下拉菜单 (展开态 Floating Card)"]
        Links["生态与协议链接 (Whitepaper, Docs, Contracts, Explorer)"]
        BottomIsland["底部固定控制岛: [ ⚙️ 翻转控制台 | 🌙 月亮暗夜 | ☀️ 太阳米黄 ]"]
    end

    subgraph BodyLayout["3. 页面主布局 (双栏黄金分割: 左 7 列 + 右 5 列)"]
        subgraph LeftCol["左侧：Morpho 大气金库展示区"]
            TitleSec["大标题: GOSUN OmniYield USDC + 元数据胶囊"]
            DescSec["金库定位描述 (Burrow 借贷 + Ondo RWA 国债缓冲池)"]
            MetricsBar["横向极简核心指标栏: Total Deposits | Liquidity | Exposure | Net APY"]
            ChartsAlloc["历史收益曲线图 (Performance) + 动态市场借贷配额 (Allocations)"]
        end
        subgraph RightCol["右侧：悬浮存取款交互卡 (Morpho Box)"]
            TabSwitch["[ Deposit ] | [ Withdraw ] (加深米黄 #dfd2be 选中态)"]
            InputBox["金额输入框 (0.00 USDC / NUSD) + [MAX] 按钮"]
            ChainSelector["跨链意图来源: Arbitrum | Solana | Base | NEAR"]
            CTABtn["Morpho 经典高对比度墨晶黑按钮 (#171d26)"]
        end
    end

    LogoMenu -->|点击展开| LogoDropdown
    BottomIsland -->|点击 ⚙️ (机构钱包)| CockpitFlip["180° 3D 翻转至背面机构治理控制台"]
    BottomIsland -->|点击 🌙 / ☀️| ThemeSwitch["实时切换暗夜黑 / 典雅米黄主题"]
```

---

## 2. 详细改造方案

### 一、顶部导航与 LOGO 下拉菜单 (Top Header & Logo Dropdown)

参考 Morpho 截图，将原先堆叠在导航栏右侧的各种开关全部精简，让顶部栏回归极致克制：

1. **左侧 LOGO 与下拉触发器**：
   - 呈现：`[ (N) OmniYield  ˇ ]`（点击平滑弹出悬浮菜单卡片）。
   - 下拉菜单内容：
     - **Company / Ecosystem**：OmniYield.org、GitHub、NEAR Protocol、NearBlocks 浏览器。
     - **Protocol Resources**：白皮书 (Whitepaper)、技术文档 (Docs)、智能合约安全说明、Near Intents 求解器状态。
   - **底部固定控制岛 (Bottom Action Island)**：
     - 精准还原截图底部的胶囊栏：`[ ⚙️  |  🌙  |  ☀️ ]`。
     - **`⚙️` 齿轮按钮**：**180° 翻转至机构控制台 (Cockpit Flip)**。
       > **权限互锁**：当连接的是机构角色钱包（`dao.`, `curator.`, `allocator.`, `guardian.`, `omniyield-vault.`）时，齿轮高亮可用并附带角色提示；普通访客钱包点击提示“需要机构治理权限”，保证散户体验纯净无扰。
     - **`🌙` 月亮按钮**：一键切换至深空黑/赛博极光暗夜模式。
     - **`☀️` 太阳按钮**：一键切换至典雅温暖的 MORPHO 级米黄色模式。
2. **中间导航胶囊 (Nav Tabs - 严格对标 Morpho 三大核心项)**：
   - `[ Vaults ]`（金库，默认选中，加深米黄色底 `#dfd2be`）
   - `[ Markets ]`（借贷市场，展示 RHEA 借贷与 Ondo 国债池参数）
   - `[ Portfolio ]`（个人投资组合，展示用户存入的 NUSD 资产与历史累积收益）
   > **注：已移除顶部的自动调仓日志**。AI 调仓日志作为底层自治运维数据，**专属放置在 180° 背面的机构控制台（Allocator AI Keeper 驾驶舱）**及正面金库底部的“Activity（活动历史）”展开区，不再污染顶部一级导航，保持顶部导航与 Morpho 一致的纯净金融级体验。
3. **右侧钱包区**：
   - 显示连接的账户（带身份徽标与 Testnet 绿色在线圆点）。

---

### 二、左侧主视觉栏位改造 (Left Hero Section)

完全借鉴 Morpho 官方 Vault 页面的大气、开阔排版，打破传统的 4 个局促方块感：

1. **巨幅标题与元数据胶囊行 (Title & Badges)**：
   ```text
   GOSUN OmniYield USDC
   [omniyield-vault.testnet ↗]  [■ NEAR / Multi-Chain]  [● Curator: Steakhouse / Gosun]  [Ⓢ NUSD]
   ```
2. **定位简介 (Description)**：
   > *"OmniYield Meta-Vault autonomously optimizes compound yield by dynamically routing capital between Burrow isolated lending pools (70%) and Ondo US Treasury RWA reserves (30%)."*
3. **极简横向核心指标栏 (Horizontal Metrics Bar，无沉重边框)**：
   - **Total Deposits (总资产)**：`$12,450,800.00` （附说明：`12.45M USDC`）
   - **Liquidity Buffer (流动性储备)**：`$5,450,800.00` （附说明：`30% Ondo RWA 随时兑付`）
   - **Exposure (资产敞口)**：展示 Burrow `(B)` 与 Ondo `(O)` 徽标
   - **Net APY (核心净收益率)**：`11.84%`（醒目大字号，翡翠绿高光）
4. **指标下方顺畅连接**：
   - **Morpho-Grade 历史收益曲线 (Performance Chart)**：平滑的复合年化与净值曲线。
   - **市场动态配额 (Dynamic Allocations)**：Burrow 借贷 70% 上限与 Ondo 30% 缓冲池进度条。

---

### 三、右侧存取款悬浮卡片改造 (Right Floating Action Box)

严格对标 Morpho 右侧的紧凑悬浮交互卡：

1. **顶部切换选项卡**：
   - `[ Deposit ]` 与 `[ Withdraw ]`：选中项采用与主题无缝融合的**加深米黄色 (`#dfd2be`)**，未选中项为半透明纯文本。
2. **核心输入体验**：
   - 极简大字号输入框 `0.00`，右上角显示存入资产图标（USDC 或 NUSD）。
   - 右下角显示可用余额与一键 `[MAX]` / `[💧 Faucet]` 领水按钮。
3. **跨链网络选择 (Network Selection)**：
   - 扁平轻量胶囊：`Arbitrum` | `Solana` | `Base` | `NEAR`。
4. **金融结算明细 (Financial Parameters)**：
   - 预计获得份额：`~954.02 NUSD`（按最新净值 $1.0482 折算）
   - 燃气消耗：`0 Gas (NEAR Intents Solver Pre-funded)`
   - 提取优先级：`Priority 1: Ondo RWA Buffer (0 滑点即时)`
5. **主操作 CTA 按钮**：
   - 采用 Morpho 标志性的 **经典墨晶黑按钮 (`#171d26`，白字加粗)**，无论存入还是提取，彻底告别刺眼的天蓝和大绿底色！

---

### 四、180° 翻转控制台在整体结构中的运作

- 用户在 LOGO 下拉菜单点击 `[ ⚙️ 齿轮 ]` 后：
- **整个主体容器产生 3D Perspective 平滑 180° 翻转**：
  - **正面 (Front Face)**：Morpho 极简投资者金库大页面（上述左侧指标 + 右侧存取款）。
  - **背面 (Back Face)**：机构治理驾驶舱 (`VaultCockpitBackside`)，包含 DAO 多签参数配置、Curator 借贷上限动态调整、Guardian 熔断防线与 AI Allocator 执行流。
- 背面右上方保留一个“翻转回正面”快捷操作，下拉菜单的 `⚙️` 也会随状态变为激活高亮，浑然一体。

---

## 3. 设计对照清单 (Before vs After)

| 模块 | 原版设计 | **新版设计（对标 Morpho）** |
| :--- | :--- | :--- |
| **顶部工具栏** | 导航栏右侧堆叠翻转按钮、太阳/月亮切换按钮 | **全部收纳至 LOGO 下拉菜单底部的 `[ ⚙️ \| 🌙 \| ☀️ ]` 控制岛** |
| **180° 翻转入口** | 独立大卡片翻转按钮 | **LOGO 下拉菜单中的 `⚙️` 齿轮（机构角色授权点亮）** |
| **主题切换** | 导航栏裸露的切换胶囊 | **LOGO 下拉菜单中的 `🌙` 和 `☀️`** |
| **左侧布局** | 4 个独立小方框卡片横排 | **巨幅 Vault 标题 + 元数据行 + 横向极简数字指标排版 (无局促框线)** |
| **右侧存取款** | 原普通面板，带亮蓝/亮绿底色按钮 | **Morpho 风格悬浮卡片 + 加深米黄选中态 + 高对比度墨晶黑主按钮** |
| **整体美学气质** | 传统 DeFi Dashboard | **世界一流 Institutional Web3 极简纸质金融质感** |

---

## 4. 实施准备与确认

该方案代码结构清晰，已完成组件解耦与 CSS 变量预备：
- 组件新增：`frontend/src/components/MorphoLogoDropdown.tsx`
- 布局重构：`frontend/src/app/page.tsx`（重塑左 7 右 5 栅格与 Hero 排版）
- 样式增强：`frontend/src/app/globals.css`（支持 Morpho 下拉栏与横向指标排版）

