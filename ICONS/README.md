# 🎛️ OmniYield Protocol 官方系统与治理矢量图标库 (ICONS)

本目录（`ICONS/`）存放 OmniYield 机构安全舱治理全舱、角色切换栏及 5 大核心治理域所使用的**100% 官方标准矢量贝塞尔曲线（SVG）图标**。
彻底替代原生操作系统中模糊、带位图边框的点阵 Emoji，保障全站任何高分辨率视网膜屏幕（Retina）下极致锐利清晰，对标世界一流 DeFi 协议。

---

## 📂 目录结构与分类

```text
ICONS/
├── 🏛️ roles/                     # 机构治理 4 大核心角色矢量图标
│   ├── dao.svg                  # 👑 DAO 治理主权委员会（高贵金冠）
│   ├── curator.svg              # 📊 策展人 Curator（数据分析柱状图）
│   ├── guardian.svg             # 🚨 守护者 Guardian（防爆熔断警报器）
│   └── allocator.svg            # 🤖 调仓员 AI Allocator（现代科技机器人核心）
│
├── 🏦 vaults/                    # 域 1：金库治理与热插拔策略插座
│   ├── vault_bank.svg           # 域 1 核心主标：金库与策略插座中枢
│   ├── dao_sovereign.svg        # 1.1 DAO 治理主权决策
│   ├── curator_shield.svg       # 1.2 策展人风险控制配额盾牌
│   ├── balance_scale.svg        # 1.3 调仓员参数配平天平
│   ├── emergency_siren.svg      # 1.4 守护者一键熔断警报
│   ├── treasury_vault.svg       # 1.5 协议费率与国库金库
│   ├── socket_nusd.svg          # 1.6 NUSD 生息策略插座 #1
│   └── socket_allweather.svg    # 1.7 全天候 Bridgewater 策略插座 #2
│
├── 🌐 exchange/                  # 域 2：跨链交换与意图清算模块
│   ├── exchange_hub.svg         # 域 2 核心主标：16 链清算与意图路由中枢
│   ├── intent_mesh.svg          # 2.1 🌐 意图路由网络 (全球网格连接标)
│   ├── solver_zap.svg           # 2.2 ⚡ 认证求解器与做市商 (极速闪电算力标)
│   └── swap_commission.svg      # 2.4 💸 跨链手续费分润 (动态资金流标)
│
├── 📊 markets/                   # 域 3：市场与预言机喂价模块
│   ├── asset_listing.svg        # 3.1 📈 资产上架与权重 (上升折线图谱标)
│   ├── oracle_crystal.svg       # 3.2 🔮 预言机多源喂价 (Pyth/Chainlink 水晶球标)
│   └── liquidity_depth.svg      # 3.4 💧 深度与做市流动性池 (水滴流动池标)
│
├── 💼 portfolio/                 # 域 4：投资组合与机构托管模块
│   ├── portfolio_briefcase.svg  # 域 4 核心主标：机构资产公文包标
│   ├── portfolio_aum.svg        # 4.1 📊 机构资管规模 AUM (分析仪表盘标)
│   ├── custody_reserve.svg      # 4.2 🏦 多签国库储备金 (瑞士银行金库标)
│   ├── vault_isolation.svg      # 4.3 🔐 冷温热仓分级隔离 (物理挂锁与钥匙标)
│   └── audit_proof.svg          # 4.4 📜 实时审计凭证与报表 (加密羊皮纸合约标)
│
└── 🧠 ai/                        # 域 5：NEAR AI 智能体配置与分身矩阵
    ├── api_key.svg              # 5.1 🔑 API Key Hub (高精加密密钥金标)
    ├── dynamic_polling.svg      # 5.2 🔄 Dynamic Polling (双向动态循环巡检标)
    ├── skills_marketplace.svg   # 5.3 🧩 Skills Marketplace (技能插件拼图标)
    ├── persona_studio.svg       # 5.4 🎭 Persona Studio (AI 风格调教面具标)
    ├── self_learning.svg        # 5.5 🧠 Self-Learning (神经网络大脑演化标)
    ├── persona_conservative.svg # 🛡️ 保守型管家分身标
    ├── persona_balanced.svg     # ⚖️ 全天候平衡师分身标
    └── persona_hunter.svg       # 🚀 激进利差猎手分身标
```

---

## 💻 前端标准调用规范 (`GovernanceIcon.tsx`)

项目中提供了统一的 React 渲染组件 [`frontend/src/components/GovernanceIcon.tsx`](../frontend/src/components/GovernanceIcon.tsx)：

```tsx
import GovernanceIcon from "@/components/GovernanceIcon";

// 示例：渲染 5.1 API Key Hub 金标
<GovernanceIcon name="api_key" className="w-3.5 h-3.5" />

// 示例：渲染 5.3 技能插件拼图标
<GovernanceIcon name="skills_marketplace" className="w-3.5 h-3.5" />

// 示例：渲染 5.5 自主学习大脑
<GovernanceIcon name="self_learning" className="w-4 h-4" />
```

---

## 🔄 双向同步与自定义扩展

1. **自动镜像映射**：所有存放在 `ICONS/` 中的矢量图均同步镜像至前端公共目录 `frontend/public/icons/`；
2. **极速替换**：直接将新的 SVG 文件放入对应子目录下，刷新浏览器页面即可无缝呈现最新视觉！
