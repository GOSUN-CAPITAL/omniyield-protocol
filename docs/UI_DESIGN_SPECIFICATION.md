# 🏛️ OmniYield Protocol 世界一流 UI/UX 设计系统规范 (Design System Specification)

> **版本**：v3.0 Sovereign Standard (2026 Milestone 迭代归档版)  
> **生效范围**：OmniYield 全站前台（Investor View）、股票代币行情（Markets View）与机构安全舱后台（OmniSafe Cockpit）  
> **对标基准**：Uniswap v4、Morpho Blue、Chamber (dHEDGE)、Raydium、Apple HIG、Bloomberg Terminal、Robinhood

---

## 📌 目录
1. [核心设计哲学与语言决策 (Design Philosophy & i18n Rule)](#1-核心设计哲学与语言决策)
2. [色彩系统规范 (Color Palette System)](#2-色彩系统规范)
3. [字体排印与数字精度规范 (Typography & Numeric Precision)](#3-字体排印与数字精度规范)
4. [图标与视觉资产规范 (Icon & Asset System)](#4-图标与视觉资产规范)
5. [空间布局与双栏吸顶架构规范 (Spatial Layout & Dual-Column Architecture)](#5-空间布局与双栏吸顶架构规范)
6. [两层金融分权架构规范 (Two-Faced Financial Separation Architecture)](#6-两层金融分权架构规范)
7. [Chamber 5 维公开金库数据账本规范 (Chamber 5-Tab Public Ledger Standards)](#7-chamber-5-维公开金库数据账本规范)
8. [世界一流金融图表标准规范 (TradingView Bezier Curve & Interaction Scrubber Standards)](#8-世界一流金融图表标准规范)
9. [组件设计标准 (Component Library Standards)](#9-组件设计标准)
10. [工程落地审查清单与自迭代自检 (Engineering Review Checklist)](#10-工程落地审查清单与自迭代自检)

---

## 1. 核心设计哲学与语言决策

### 1.1 针对“中英混杂”的核心仲裁结论
> ⚠️ **强制规范：坚决杜绝“半生不熟”的永久中英混杂！必须实现 100% 纯正的语言环境完全隔离。**

- **为什么反对中英夹杂？**
  - 在世界级顶级金融与 DeFi 机构（如 Uniswap、Morpho、Aave）评审中，中英硬编码混杂（如在英文模式下出现中文字符，或中文模式下生硬夹杂无必要英文单词）会产生强烈的“半成品 / 本地化不彻底”的不信任感。
- **世界一流的黄金标准**：
  1. **英文模式 (`EN`)**：**100% 华尔街 / 硅谷原生机构级金融英语**。严禁出现任何中文字符或全角标点符号。
  2. **中文模式 (`简`)**：**专业、严肃、典雅的顶级金融与 Web3 中文术语**。仅保留行业全球公认的标准缩写（如 `DAO`、`APY`、`AUM`、`VETO`、`NAV`、`RPC`、`MPC`、`USDC`），其余描述均纯正中文呈现，无需生硬强译公认首字母。
  3. **动态响应**：全站所有标题、说明、按钮、气泡、日志根据右上角切换按钮（`EN` / `简`）实现 1:1 纯正渲染，零硬编码。

---

## 2. 色彩系统规范 (3-Tier Surface Hierarchy & Single Accent Discipline)

对标 Uniswap v4、Morpho Blue、Stripe 与 Apple HIG，彻底终结“调色板混杂”与“杂乱彩虹色”，实施严谨的 **3层空间底色阶梯** 与 **单主色调控制律**：

### 2.1 三层空间底色规范 (3-Tier Surface Hierarchy - 对标 Morpho 纯白悬浮标准)

| 空间层次 (Spatial Tier) | 暖金白昼版 (`Warm Beige`) | 极客暗黑版 (`Cyber Dark`) | CSS 核心工具类 | 语义与适用场景 |
| :--- | :--- | :--- | :--- | :--- |
| **Tier 1: 画布底色 (Canvas)** | `#F8F5EE` (温润米白羊脂玉) | `#0B0F17` (深邃黑曜石) | `.canvas-bg` | 整个视窗 body、导航栏顶栏、侧边栏底层底色 |
| **Tier 2: 业务卡片 (Card Surface)** | `#FFFFFF` (100% 纯净高光白) | `#131B2A` (暗夜蓝岩石) | `.card-surface` | 所有业务卡片（指标大卡、交换板、图表卡、治理 21 模块卡） |
| **Tier 3: 卡片内容器/输入框 (Well)** | `#FFFFFF` (通透高光纯白 + 细线) | `#0D121D` (内嵌微坑黑) | `.well-inset` | 表单输入框、数字看板小方格、收益预测框、未激活链选择按钮 |

> 💡 **卡片与内嵌通透标准 (Morpho Standard)**：
> - **杜绝泥黄补丁**：坚决禁止在卡片内部大面积填充发暗的驼黄色/泥巴块（如淘汰 `#F2ECE1`）。卡片内部与 Morpho 完全一致，采用 **100% 纯白底色 + 极细淡金边框（`border-[#E4DCD0]`）**，营造通透、干净、世界级的轻盈金融视觉。
> - **微阴影阶梯**：白昼卡片统一使用 `shadow-[0_1px_3px_rgba(0,0,0,0.03),0_8px_24px_-4px_rgba(0,0,0,0.03)]`。暗黑卡片统一使用 `border-[#1F293D]` 与 `shadow-[0_4px_20px_rgba(0,0,0,0.4)]`。

---

### 2.2 统一选中态规范 (Unified Selected / Active State)

无论在前台 Tab、链选择器、图表周期（1D/1W/1M/3M/1Y/All）、后台角色切换、侧边栏子项激活，**彻底统一切换选中颜色**，杜绝多重混杂：

| 模式 | 选中背景 (Active Background) | 选中边框 (Active Border) | 选中文字 (Active Text) | CSS 核心工具类 |
| :--- | :--- | :--- | :--- | :--- |
| **暖金白昼** | `#E6F4F1` (清爽薄荷奶油) | `#0D766E` (深度翡翠绿 1.5px) | `#0D766E` (字重加粗 `font-bold`) | `.item-selected` |
| **极客暗黑** | `rgba(16, 185, 129, 0.15)` | `rgba(16, 185, 129, 0.5)` | `#10B981` (翠绿高光 `font-bold`) | `.item-selected` |

---

### 2.3 按钮层级与色彩纪律规范 (Button Hierarchy & Color Discipline)

严禁在同一界面混用青色、紫色、黄色、绿色按钮。所有按钮严格分为两级：

1. **主操作按钮 (`btn-primary` / `main-action-btn`)**：
   - **白昼模式 (羊脂暖金焦糖 - Caramel Amber Ochre)**：实心暖金焦糖色 `#B87B28`，纯白高光字 `#FFFFFF`，边框 `#B87B28`，暖金微光 `shadow-[0_4px_14px_rgba(184,123,40,0.25)]`，悬停 `#A36B1F`。彻底消灭任何黑色冷硬色块，与米黄底纸形成最尊贵典雅的深浅同相呼应。
   - **暗黑模式 (高光翡翠绿 - Cyber Emerald)**：高光翡翠绿 `#10B981`，文字 `#0B0F17`，悬停 `#059669`。
   - 适用：`Sign & Deposit`、`Withdraw Cash`、`Apply Caps`、`Update Fee Parameters`、`Hot-Swap Upgrade`、`Save Key` 等核心确认操作。
2. **次级操作按钮 (`btn-secondary`)**：
   - 白昼模式：背景 `#FFFFFF`，边框 `#E4DCD0`，文字 `#6B543D`，悬停背景 `#F8F5EE`，文字 `#453423`。
   - 暗黑模式：背景 `#131B2A`，边框 `#334155`，文字 `#CBD5E1`，悬停 `#1E293B`。
   - 适用：`Front` 翻转、`Sync`、`Eject`、`Prev`、`MAX` 等辅助控制操作。

---

### 2.4 图标纯净度与色彩继承纪律 (Icon Discipline)

- **淘汰硬编码杂色**：所有图标组件（`GovernanceIcon.tsx`）彻底淘汰彩色硬编码 SVG/PNG 贴纸，全面改用 native Lucide 矢量曲线。
- **色彩继承律**：所有图标一律继承父级文本色彩（`currentColor`），默认状态随文本置灰（`text-slate-500`），选中态自动切换为翠绿（`text-emerald-700` / `#10B981`）。
- **侧边栏严谨排印**：彻底消除侧边栏子项 5.7 标红、1.7 标蓝的不一致性，全站 21 个子节点一律使用相同字阶与垂直指引虚线。

---

## 3. 字体排印、字号阶梯与双模式对比度规范 (Typography & Contrast System)

对标 Apple Human Interface Guidelines、Stripe 与 Bloomberg Terminal，严格执行 **WCAG AAA 级最高可读性对比度标准**（大字 >7:1，常规正文 >10:1，极细辅助字 >4.5:1）。在白昼模式下全面采用**羊脂同系深浅阶梯（Mutton-Fat Earth Gradient）**，彻底告别冰冷生硬的冷板岩黑与冷灰，保证温润雅致且坚挺清晰。

### 3.1 双模式 5 级字体色彩阶梯表 (WCAG AAA Contrast Standard)

| 文本层级 (Text Level) | 语义与适用场景 | 暖金白昼模式 (`Warm Beige` · 羊脂同系深浅) | 极客暗黑模式 (`Cyber Dark`) | 对比度认证 (WCAG) | 推荐 CSS / Tailwind 类 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Level 1: 核心大标 / 核心金额** | 页面大标题、金库 TVL、NAV 大字看板、关键统计大数字 | `#453423` (深栗暖茶色 / Roasted Chestnut) | `#FFFFFF` (纯净白曜石) | > 12.5:1 (超极值) | `text-slate-900 dark:text-white font-black` |
| **Level 2: 模块与卡片标题** | 5 大治理域标题、21 个治理卡片主标、弹窗标题、表单分组标 | `#56432F` (中深茶栗 / Warm Chestnut) | `#F1F5F9` (Slate 100 亮灰白) | > 9.8:1 (AAA 级) | `text-slate-900 dark:text-white font-bold` |
| **Level 3: 表单标签与参数正文** | 字段标签（如 RHEA Lending Cap）、参数输入框正文、选项文字 | `#6B543D` (暖岩焦灰 / Raw Umber) | `#94A3B8` (Slate 400 柔和亮灰) | > 7.0:1 (AAA 级) | `text-slate-700 dark:text-slate-300 font-medium` |
| **Level 4: 辅助说明与脚注角标** | 冷却时间、次级说明、卡片下方法律与算法免责声明、项目计数 | `#8C7359` (细砂暖驼 / Sand Gray) | `#64748B` (Slate 500 次级灰) | > 4.5:1 (AA+ 级) | `text-slate-600 dark:text-slate-400` |
| **Level 5: 翠绿高光与选中指示** | 激活项文字、收益年化（+16.4% APY）、正向状态徽章（ONLINE） | `#0D766E` (深翡翠 Deep Teal) | `#10B981` (翠绿高光 Emerald) | > 7.2:1 (AAA 级) | `text-emerald-700 dark:text-emerald-400 font-bold` |

---

### 3.2 字体家族与排印铁律 (Font Families & Discipline)
- **金融数字与代码 (Monospace)**：`JetBrains Mono`, `SF Mono`, `Menlo`, `Consolas`, monospace。
  - **强制铁律**：全站所有资产金额、代币数量、APY 百分比、交易哈希（Tx Hash）、合约地址、表单数字输入框必须强制使用等宽字体（`font-mono`），杜绝数字变动引发的布局抖动。
- **西文排印 (Sans-Serif)**：`Inter`, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `Roboto`。
- **中文排印 (Chinese Sans)**：`PingFang SC`, `Hiragino Sans GB`, `Microsoft YaHei`（微软雅黑）。

---

### 3.3 规范字阶梯与字重匹配表 (Typography Scale & Weight)

| 字阶角色 | Tailwind 类名 | 字号 (px/rem) | 字重 (Weight) | 适用场景 |
| :--- | :--- | :--- | :--- | :--- |
| **Display 0** | `text-4xl md:text-5xl` | 36px ~ 48px | `font-black` (900) | 核心 TVL、净值 NAV、累计收益大看板 |
| **H1 Title** | `text-xl md:text-2xl` | 20px ~ 24px | `font-black` (900) | 机构安全舱大标题、前台页面主标题 |
| **H2 Section**| `text-base md:text-lg` | 16px ~ 18px | `font-extrabold` (800) | 5 大治理域主分组（1. Vaults、2. Exchange...） |
| **H3 Card** | `text-sm md:text-base` | 14px ~ 16px | `font-bold` (700) | 21 个治理卡片标题（1.1 DAO、2.1 Whitelist...） |
| **Body Bold** | `text-xs md:text-sm` | 12px ~ 14px | `font-semibold` (600) | 关键字段名、表单输入框内字符、链名称 |
| **Body Normal**| `text-xs` | 12px | `font-medium` (500) | 一般参数正文、列表正文说明 |
| **Caption** | `text-[10px]` ~ `text-[11px]` | 10px ~ 11px | `font-medium` (500) | 脚注、子计数徽章、辅助提示文案 |

---

## 4. 图标与视觉资产规范

> 🚫 **铁律：彻底禁止任何操作系统自带的原生点阵 Emoji（如 👑、📊、🚨、🤖、⚙️ 等）进入生产环境界面！**

### 4.1 双图库架构标准
1. **`LOGO/`（资产与品牌图库）**：
   - 专管：项目品牌（OmniYield, OmniSafe）、加密代币（BTC, ETH, NEAR, USDC）、美股代币（AAPL, NVDA, MSFT, QQQ, SPY）、登录钱包（MetaMask, MyNearWallet, OKX, Phantom）。
2. **`ICONS/`（治理与功能图库）**：
   - 专管：治理 4 核心角色（DAO, Curator, Guardian, Allocator）、5 大治理域 21 个功能节点。
   - 格式强制：纯净矢量 SVG（贝塞尔曲线），支持主题 currentColor 或自适应发光。

---

## 5. 空间布局与双栏吸顶架构规范 (Spatial Layout & Dual-Column Architecture)

### 5.1 根级滚动上下文与 Sticky 视口吸顶铁律 (Root Scroll Context & Sticky Isolation Standard)
- **踩坑血泪经验**：在 CSS 规范中，**`position: sticky` 依赖于其最近的具有滚动盒（Scroll Box）属性的祖先容器**。若任意祖先元素被无意施加了 `overflow: auto`、`overflow: scroll` 或 `overflow: hidden`，但其高度又是弹性非定高的（如 `min-h-screen`），将形成伪滚动容器，切断 sticky 元素对窗口真实滚动的感知，导致吸顶彻底失效并跟随全页被卷走！
- **强制工程标准**：
  1. 主工作台外层（`page.tsx`）声明 `<div className="flex-1 min-w-0 flex flex-col min-h-screen">`，**严禁添加 `overflow-y-auto`**！
  2. 保证浏览器全局视窗（Window Viewport）作为全页面唯一且统一的滚动上下文。
  3. 双栏父级 Grid 容器必须声明 `items-start`（`<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12 items-start">`），确保右栏高度由自身内容决定，不被拉伸至与左栏等高。
  4. 右侧交易卡声明 `sticky top-24 self-start`。当用户向下滚动页面时，右栏稳稳锁定在视口右上（距顶栏 96px 黄金安全带），左侧长列表顺畅上下翻滚。

### 5.2 3D 透视上下文隔离原则 (Perspective Isolation)
- **CSS 规范铁律**：`perspective`、`transform-style: preserve-3d` 与 `backface-visibility` 会强制重置子元素的包含块，导致视窗级 `position: sticky` 完全失效。
- **工程约束**：正面视图（`!isFlipped`）严禁在父级挂载静态 3D 透视类，仅在用户触发翻转动画时动态启用 3D 转换上下文，确保正常浏览时视窗级 sticky 100% 稳固生效。

---

## 6. 两层金融分权架构规范 (Two-Faced Financial Separation Architecture)

对标全球顶尖量化对冲基金（Bridgewater Associates、Jane Street）与 Web3 资管协议（Morpho、Chamber）：

```
┌────────────────────────────────────────────────────────────────────────┐
│  【正面 Front Face】面向个人投资者与大户 (2C High-Trust & Simplicity)    │
│  - 纯净、通透、高公信力的金融账本                                     │
│  - 3 联排核心宏观指标卡 (Value Managed / Net APY / Liquidity Buffer)   │
│  - 3 联排个人持仓看板 (Your Balance / Realized PNL / Your Shares)      │
│  - TradingView 级贝塞尔平滑业绩曲线                                   │
│  - 底层资产四维穿透矩阵                                                │
│  - Chamber 5 维公开数据账本 (Depositors/Activity/Deposits/Withdrawals) │
│  - 彻底剔除复杂晦涩的 AI 调仓控制台日志                                │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │  3D 翻转 (Flip Key)
┌──────────────────────────────────▼─────────────────────────────────────┐
│  【背面 Back Face】面向机构治理与风险操盘 (2B Professional Sovereign)   │
│  - 机构专业驾驶舱：DAO 多签主权、策展人 Cap 扩容、守护者熔断断路器     │
│  - ★ 5.8 机构专属：AI 调仓神经决策流与链上执行日志终端                │
│  - 承载核心 Alpha 策略壁垒、四维宏观因子打分、Pre-flight RPC 模拟日志  │
└────────────────────────────────────────────────────────────────────────┘
```

- **核心价值**：
  1. **保护商业壁垒**：AI 调仓算法与动态权重求解属于协议核心机密，置于背面机构舱内进行多签审计与安全隔离，不向外界公开展露全部决策神经链；
  2. **消除认知负担**：散户无需理解复杂 Solver 撮合与滑点，正面保留纯正、极简、高确定性的链上公开账本。

---

## 7. Chamber 5 维公开金库数据账本规范 (Chamber 5-Tab Public Ledger Standards)

在金库左侧栏下方统一集成 [`VaultLedgerTabs.tsx`](file:///f:/gosun-workspace/gosun-near1/frontend/src/components/VaultLedgerTabs.tsx)，提供 5 个完整维度的公开链上账本：

### 7.1 五大标签定义与数据标准
1. **`Depositors` (储户分布榜)**：
   - 统计总独立储户数（如 `128 Unique Depositors`）；
   - 字段：`持仓份额 (Shares)`、`折算美元估值 (Value USD)`（支持表头升降序排序点击）、`储户地址 (Address)`（带所属链徽章 NEAR/Arb/Base/Solana 与区块浏览器外链）。
2. **`Activity` (全网动态)**：
   - 呈现宏观再平衡、跨链存入、复利收益结算、缓冲金注入等动作；
   - 字段：`操作类型 (Tx Type)`、`流出资产 (Outgoing)`、`流入资产 (Incoming)`、`发生时间 (Time)`。
3. **`Deposits` (存入明细)**：
   - 呈现近期入金笔数与明细：获得份额、入金 USD 价值、存入者地址、入金来源链、发生时间。
4. **`Withdrawals` (提取明细)**：
   - 呈现提款流水，突出**流动性退场通道**（如 `优先队列 1: Ondo 美债缓冲 (即刻T+0)` / `RHEA 借贷池流动性`），证明资金进出无阻滞。
5. **`Stats` (高阶量化金融面板 - 4×3 紧凑网格)**：
   - 包含：金库合约地址、管理者地址、当前净值 (NAV)、历史最高净值 (ATH)、总流通份额、管理者自有跟投资金 (Stake 8.3%)、索提诺比率 (Sortino 3.82)、下行波动率 (0.38%)、全网排名 (#1 RWA)、已赚协议费 ($0.00)、合约底层逻辑哈希、T+0 缓冲储备深度 (40%)。

---

## 8. 世界一流金融图表标准规范 (TradingView Bezier Curve & Interaction Scrubber Standards)

金库业绩图 [`PerformanceChart.tsx`](file:///f:/gosun-workspace/gosun-near1/frontend/src/components/PerformanceChart.tsx) 与股票代币图 [`MarketDetailView.tsx`](file:///f:/gosun-workspace/gosun-near1/frontend/src/components/MarketDetailView.tsx) 严格遵循统一的技术与视觉规范：

### 8.1 三阶贝塞尔波浪曲线算法 (Cubic Bezier Spline)
- **严禁使用折线拼接 (`M...L...`)**：折角生硬，缺乏专业金融流动感。
- **标准贝塞尔控制点公式**：
  ```typescript
  let pathD = `M ${coords[0].x.toFixed(1)} ${coords[0].y.toFixed(1)}`;
  for (let i = 0; i < coords.length - 1; i++) {
    const p0 = coords[i === 0 ? 0 : i - 1];
    const p1 = coords[i];
    const p2 = coords[i + 1];
    const p3 = coords[i + 2] || p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    pathD += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  ```

### 8.2 悬停游标与无点化铁律 (Interactive Scrubber & Zero-Point Purity)
- **彻底去除静态圆点**：走势曲线上平时绝对不允许出现静态实心大波点。
- **实时悬停游标 (Scrubber)**：
  - 容器监听 `onMouseMove`，按鼠标 X 坐标比例实时映射到最近数据索引；
  - 呈现一条垂直虚线对准游标：`border-l border-dashed border-slate-300 dark:border-slate-700`；
  - 呈现一个单点磁吸发光圆圈：`w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm bg-emerald-500`。
  - 鼠标移开时，游标自动平滑回弹至最新有效时点。

### 8.3 巨幕式主标头排版 (Hero Price Header)
- 主数值：`text-4xl sm:text-5xl font-black font-sans tracking-tight text-[#171d26] dark:text-white`；
- 呼吸灯胶囊：`px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-sans text-xs font-semibold`，内含 `w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse`；
- 涨跌副标：`▲ +$0.0628 (+6.28%) Nov 02, 2026` 绿色等宽字体。

### 8.4 视觉纯净度与杂质杜绝铁律 (Visual Purity Discipline)
- **严禁残存第三方图标碎片**：彻底禁止在图表区域内放置类似“三个黑柱子”（TradingView 残余 SVG 碎片等）突兀色块，必须保持画布的通透纯净。
- **色彩 100% 统一**：
  - 曲线主色：`#10B981` (Emerald Green)
  - 渐变填充：`stopColor="#10B981"`，从 `stopOpacity=0.28` 渐变至 `0.00`
  - 底部事件条：翡翠微光胶囊 `bg-emerald-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-medium`。

---

## 9. 组件设计标准

1. **按钮点击反馈**：必须具备 `transition` 与 `active:scale-[0.98]` 微触感，鼠标指针统一使用 `cursor-pointer`。
2. **状态指示灯**：
   - 正常运行：`w-2 h-2 rounded-full bg-emerald-500`（带呼吸光环 `animate-pulse`）；
   - 待审/报警：`w-2 h-2 rounded-full bg-rose-500`（带涟漪光环 `animate-ping`）。
3. **输入框与表单**：
   - 暖金模式：`bg-white border-[#dfd2be] text-slate-900 focus:border-amber-500`；
   - 暗黑模式：`bg-slate-900 border-slate-700 text-white focus:border-cyan-400`。

---

## 10. 工程落地审查清单与自迭代自检

每次提交前端代码或新增功能模块时，必须逐项执行自检：
- [ ] **检查 1 (滚动吸顶)**：右侧交易操作面板是否声明 `sticky top-24 self-start`？其上级是否没有任何阻断性的 `overflow-y-auto`？
- [ ] **检查 2 (正反分离)**：正面是否纯净展示 Chamber 5 维数据账本？复杂 AI 调仓与执行日志是否完整收敛在背面 5.8 模块？
- [ ] **检查 3 (图表纯净)**：走势图是否采用三阶贝塞尔平滑算法（`pathD` 无生硬折角）？曲线上是否彻底清除了密集静态波点？是否存在任何多余的黑柱子水印？
- [ ] **检查 4 (色彩统一)**：金融曲线与股票行情图的主色调是否 100% 统一为高光翡翠绿（`#10B981`）？渐变面积色是否均匀通透？
- [ ] **检查 5 (语言纯度)**：`EN` 模式下是否 100% 无中文字符？`zh` 模式下是否专业自然、无生硬中英夹杂？
- [ ] **检查 6 (Emoji 禁令)**：全页面是否 100% 杜绝了系统原生 Emoji（👑/📊/🚨/🤖/⚙️/↩️等）？
- [ ] **检查 7 (字体等宽)**：所有资产数额、NAV 净值、APY 百分比、交易 Hash 是否强制应用 `font-mono`？
- [ ] **检查 8 (TypeScript 零错误)**：执行 `npx tsc --noEmit` 是否保持 0 错误（TypeScript 全类型安全）？
- [ ] **检查 9 (全量代码归档)**：优化完成后是否运行智能归档工具生成全量版本存证？
