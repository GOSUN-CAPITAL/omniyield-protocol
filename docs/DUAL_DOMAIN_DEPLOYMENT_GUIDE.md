# OmniYield Protocol：双域名分布式生产部署指南
## 前台开源 (Cloudflare Pages) + 后台主权闭源 (自有私有 VPS)

---

## 一、双域名架构全景概览

| 维度 | 前台开源门户 (`app.omniyield.finance`) | 背面私有安全舱 (`safe.omniyield.finance`) |
| :--- | :--- | :--- |
| **代码开源属性** | **GitHub 100% 公开开源**（MIT / GPL） | **团队私有仓库（100% 商业闭源）** |
| **托管基础设施** | **Cloudflare Pages**（全球 330+ Anycast 节点免费托管） | **团队自有私有 VPS**（Ubuntu Linux + Docker） |
| **网络穿透方式** | 官方 Cloudflare Pages Edge CDN | **Cloudflare Tunnel (`cloudflared`)**，VPS 零端口暴露 |
| **受众与角色** | 全球散户投资者、黑客松评委、开源社区 | 仅限 DAO 理事会、策展人、调仓员、守护者 4 类核心多签地址 |
| **核心承载资产** | `frontend/` 目录 | `omniyield-safe-node/` 目录 |
| **主要功能** | • 双金库充值与赎回（USDC / NUSD / OmniUSDC）<br>• 16 链跨链意图兑换（Exchange 1Click）<br>• 资本市场大厅（Markets 对标 near.com）<br>• 个人资产组合概览（Portfolio）<br>• NEAR AI 轻量端侧对话卡片<br>• 散户用户偏好设置 ⚙️ | • **OmniSafe 5 域治理架构控制中枢**<br>• **双金库黑盒量化策略插座（WASM 核心算法）**<br>• **大模型 API 密钥机密安全库（Key Enclave）**<br>• **7x24h 利率高频轮询与自主调仓守护进程**<br>• **强化学习（RL）每日 00:00 UTC 回测复盘数据库** |

---

## 二、前台开源工程部署指南 (Cloudflare Pages)

### 1. 仓库准备
将 `frontend/` 目录上传至独立的公共 GitHub 仓库（例如 `github.com/your-org/omniyield-interface`）。

### 2. Cloudflare Pages 一键绑定（2 分钟完成）
1. 登录 [Cloudflare 控制台](https://dash.cloudflare.com/) ➔ 进入 **Workers & Pages** ➔ 点击 **Create application** ➔ 选择 **Pages** ➔ **Connect to Git**。
2. 选中您的开源前端仓库 `omniyield-interface`。
3. **构建配置（Build Settings）**：
   - **Framework preset**：`Next.js`
   - **Build command**：`npm run build`
   - **Build output directory**：`.next`
4. **环境变量（Environment Variables）**：
   - `NEXT_PUBLIC_SAFE_URL` = `https://safe.omniyield.finance`（指向您 VPS 的后台域名）
   - `NEXT_PUBLIC_DEPLOY_MODE` = `dual_domain`
5. 点击 **Save and Deploy**，Cloudflare 将在 60 秒内完成全球 Anycast 边缘节点的部署！
6. 在 **Custom Domains** 中绑定您的主域名 `app.omniyield.finance`（自动签发全球免费 SSL 证书）。

---

## 三、后台闭源安全节点部署指南 (自有私有 VPS)

### 1. VPS 系统要求
- **操作系统**：Ubuntu 22.04 LTS / Debian 12 / CentOS 9
- **最低配置**：2 vCPU / 4 GB RAM / 40 GB SSD
- **依赖软件**：Docker 与 Docker Compose

```bash
# Ubuntu 一键安装 Docker 与 Docker Compose
sudo apt update && sudo apt install -y docker.io docker-compose
sudo systemctl enable --now docker
```

### 2. 部署 `omniyield-safe-node`
将本地 `omniyield-safe-node/` 目录通过 Git 私有仓库或 SCP 上传到 VPS 的 `/opt/omniyield-safe-node/`。

```bash
cd /opt/omniyield-safe-node

# 1. 复制并编辑环境变量
cp .env.example .env
nano .env
```

在 `.env` 中填入您的机密配置：
```ini
PORT=4000
NODE_ENV=production
OMNISAFE_JWT_SECRET=your_high_entropy_jwt_secret_key_here
FRONTEND_ORIGIN=https://app.omniyield.finance
NEAR_NETWORK=testnet
CLOUDFLARE_TUNNEL_TOKEN=eyJhIjoi...（在步骤 3 获取）
```

---

## 四、配置 Cloudflare Tunnel（零暴露 VPS 真实 IP）

通过 Cloudflare Tunnel，您的 VPS **不需要开放 80、443 端口，甚至不需要固定公网 IP**。

### 1. 创建 Tunnel
1. 登录 Cloudflare 控制台 ➔ 进入 **Zero Trust** ➔ **Networks** ➔ **Tunnels**。
2. 点击 **Add a tunnel** ➔ 选择 **Cloudflared** ➔ 命名为 `omniyield-safe-vps`。
3. 复制页面生成的 **Tunnel Token**（一串很长的 base64 字符串）。
4. 将该 Token 粘贴进 VPS 的 `.env` 中的 `CLOUDFLARE_TUNNEL_TOKEN`。

### 2. 配置域名路由 (Public Hostname)
在 Cloudflare Tunnel 的 **Public Hostnames** 页面添加一条规则：
- **Subdomain**：`safe`
- **Domain**：`omniyield.finance`
- **Service Type**：`HTTP`
- **URL**：`omniyield-safe:4000`（指向 docker-compose 中的容器名）

### 3. 一键拉起服务集群
在 VPS 上执行：
```bash
docker compose up -d --build
```

查看运行状态：
```bash
docker compose ps
docker compose logs -f
```

控制台将输出：
```text
=======================================================
🛡️  OmniSafe Sovereign Node running on port 4000
🌐  Target Domain: safe.omniyield.finance
🔐  NEAR NEP-413 Signature Challenge: ENABLED
🔌  Black-Box Strategy Sockets: LOADED (Socket #1 & #2)
🤖  Autonomous AI Agent Daemon: ACTIVE
=======================================================
```

现在访问 `https://safe.omniyield.finance/health`，即可看到：
```json
{"status":"ok","node":"omniyield-safe-sovereign-node","version":"1.0.0"}
```

---

## 五、NEP-413 密码学鉴权与访问流程

1. **散户访问前台**：
   - 访问 `https://app.omniyield.finance`，代码完全开源透明，直接连接官方 NEAR 节点。
   - 散户左下角仅显示 ⚙️ 齿轮。
2. **机构管理员激活后台**：
   - 当 `dao.omniyield-vault.testnet` 或 `curator...` 等核心钱包登录时，点击 ⚙️ 齿轮后展开金色 ₿ 图标。
   - 点击 ₿，浏览器直接安全打开 `https://safe.omniyield.finance`。
   - VPS 后台生成一次性随机数 Nonce，要求管理员使用 NEAR 钱包进行 NEP-413 消息签名确认。
   - 验签通过后签发 24 小时权限令牌（JWT），进入 OmniSafe 5 域治理驾驶舱。

---

## 六、日常运维与紧急断电操作

- **查看 AI 轮询日志**：
  ```bash
  curl -s https://safe.omniyield.finance/api/ai/logs | jq
  ```
- **热插拔升级黑盒策略插座 (Socket #1 -> v2.0)**：
  ```bash
  curl -X POST https://safe.omniyield.finance/api/sockets/hotswap \
    -H "Content-Type: application/json" \
    -d '{"socketId":"socket-1","newWasmName":"GOSUN_NUSD_DynamicSpread_Encap_v2.0_Optimized.wasm","newVersion":"v2.0.0"}'
  ```
- **硬件级紧急断电 (Kill Switch)**：
  ```bash
  curl -X POST https://safe.omniyield.finance/api/ai/killswitch
  ```

