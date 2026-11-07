# OmniYield Protocol (`NUSD`) 文档中心 (Documentation Index)

欢迎查阅由 **Gosun Labs** 发起的 **OmniYield Protocol** 官方技术与商业文档库。本项目为 **NEAR Hackathon: Build Beyond Boundaries (2026.11.01 - 2026.11.14)** 官方参赛旗舰项目。

---

## 📚 文档目录索引

| 文档名称 | 语言 | 核心内容概述 |
| :--- | :--- | :--- |
| [**0. 官方白皮书 (WHITEPAPER.md)**](./WHITEPAPER.md) | 英文 (国际学术级) | **对标 Morpho / Uniswap 标准**：完整的学术摘要、ERC-4626 虚拟偏移数学推导、Morpho 双队列算法伪代码、AI Allocator 决策策略、威胁模型与权威学术引用。 |
| [**1. 完整商业与技术方案书 (MASTER_PROPOSAL_CN.md)**](./MASTER_PROPOSAL_CN.md) | 中文 | 涵盖项目一句话定位、行业三大痛点、Morpho 式双核动态收益矩阵、NEAR 链签名与意图底层原理、14 天冲刺计划与评委通关策略。 |
| [**2. OmniSocket™ 开发者接入规范 (SOCKET_STANDARD.md)**](./SOCKET_STANDARD.md) | 中文 | **“主板+插座”核心哲学**：规范定义 ChainSocket 与 YieldSocket 标准接口，指导第三方公链与 DeFi 协议 30 分钟无许可即插即用接入主板。 |
| [**2. 核心技术架构与规范 (ARCHITECTURE_SPEC.md)**](./ARCHITECTURE_SPEC.md) | 英文/中英双语 | 深入解析 NEAR Rust 智能合约、ERC-4626 与 NEP-141 双重兼容规范、Morpho 队列与 Supply Caps 状态机、AI Public Allocator 算法与预言机集成。 |
| [**3. 代币经济学与商业模型 (TOKENOMICS_AND_BUSINESS.md)**](./TOKENOMICS_AND_BUSINESS.md) | 中文 | 详述 `NUSD` 生息稳定币经济模型、三大真实收益（Real Yield）来源、协议管理费与绩效费造血机制、保险基金（Insurance Fund）飞轮。 |
| [**4. 黑客松参赛与交付指南 (HACKATHON_SUBMISSION_GUIDE.md)**](./HACKATHON_SUBMISSION_GUIDE.md) | 中文 | 整理赛事官方规则（$250,000 奖金池）、自动化初筛（Claude Code / Codex）与顶级 VC 评审应对策略、2 分钟 Demo 录屏脚本及 X 宣发文案。 |

---

## 🏛️ 项目概览简图

```
                     【全链用户入口 (Arbitrum / Solana / Base)】
                                        │
                                        ▼ (1-Click 意图签署, 零 Gas 困扰)
                     【NEAR 意图撮合中枢 (intents.near)】
                                        │
                                        ▼ (铸造 NUSD 份额凭证)
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    OmniYield Meta-Vault (NEP-141 / ERC-4626)                    │
│                                                                                 │
│   ┌────────────────────────────────┐     ┌──────────────────────────────────┐   │
│   │   市场 A: RHEA 高息借贷池      │     │   市场 B: Ondo 代币化美债        │   │
│   │   • 高收益端 (10% - 14% APY)   │     │   • 极稳底仓 (4.5% - 5.2% APY)   │   │
│   │   • Supply Queue 优先级 1      │     │   • Withdraw Queue 优先级 1      │   │
│   │   • 动态风控上限 (Cap: 70%)    │     │   • 秒级流动性缓冲池             │   │
│   └────────────────────────────────┘     └──────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## ⚡ 快速跳转链接
* 根目录说明文档：[README.md](../README.md)
* 智能合约工程：[`/contracts`](../contracts/)
* AI 策略与模拟器：[`/services`](../services/)
* Web3 金融终端前端：[`/frontend`](../frontend/)

