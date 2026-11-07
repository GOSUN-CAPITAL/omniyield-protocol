const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const LOGO_DIR = path.join(ROOT, "LOGO");
const PUBLIC_LOGO_DIR = path.join(ROOT, "frontend", "public", "logos");

if (!fs.existsSync(LOGO_DIR)) fs.mkdirSync(LOGO_DIR, { recursive: true });
if (!fs.existsSync(PUBLIC_LOGO_DIR)) fs.mkdirSync(PUBLIC_LOGO_DIR, { recursive: true });

const logos = {
  "btc.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <circle cx="50" cy="50" r="48" fill="#F7931A" stroke="#E27602" stroke-width="1.5"/>
  <path fill="#FFFFFF" d="M68.7 42.4c1.1-7.2-4.4-11.1-11.9-13.7l2.4-9.8-6-1.5-2.4 9.5c-1.6-.4-3.2-.8-4.8-1.1l2.4-9.6-6-1.5-2.4 9.8c-1.3-.3-2.6-.6-3.8-.9l-.1-.3-8.3-2.1-1.6 6.4s4.5 1 4.4 1.1c2.4.6 2.9 2.2 2.8 3.5l-2.8 11.3c.2.1.4.1.6.2l-.6-.2-3.9 15.8c-.3.7-.9 1.8-2.6 1.3.1.1-4.4-1.1-4.4-1.1L10 68.3l7.8 2c1.5.4 2.9.8 4.3 1.1l-2.5 9.9 6 1.5 2.4-9.8c1.6.4 3.2.8 4.8 1.1l-2.4 9.7 6 1.5 2.5-9.9c10.3 1.9 18 1.2 21.2-8.1 2.6-7.5-.1-11.8-5.6-14.6 4-1 7-3.5 7.8-8.9zm-13.9 19.5c-1.9 7.5-14.5 3.4-18.6 2.4l3.3-13.3c4.1 1 17.3 3 15.3 10.9zm1.9-19.6c-1.7 6.9-12.2 3.4-15.6 2.6l3-12.1c3.4.9 14.4 2.5 12.6 9.5z"/>
</svg>`,

  "near.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <circle cx="50" cy="50" r="48" fill="#000000" stroke="#00E676" stroke-width="1.5"/>
  <path fill="#00E676" d="M69.8 28.5L52.4 54.3c-1.1 1.6-3.2 2.1-4.8 1.1l-10-6.6 21.9-32.3c.7-1 0-2.5-1.3-2.5H35.4c-1.6 0-3 1-3.6 2.5L19.4 51.2c-.4 1-.4 2.2.1 3.2l12.4 28.2c.7 1.5 2.1 2.5 3.7 2.5h22.8c1.6 0 3-1 3.6-2.5l12.4-34.7c.4-1.1.3-2.3-.2-3.3l-4.4-6.1z"/>
</svg>`,

  "usdc.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <circle cx="50" cy="50" r="48" fill="#2775CA"/>
  <path fill="#FFFFFF" d="M60.5 53.6c0-7.8-4.7-10.5-13.9-11.7-6.5-.9-7.8-2.6-7.8-5.6 0-3.3 2.5-5.3 6.9-5.3 4.2 0 6.7 1.6 7.6 4.9.2.6.8 1 1.4 1h3.3c.8 0 1.5-.7 1.4-1.5-.9-5.3-5.2-9-11.5-9.6V21c0-.6-.5-1.1-1.1-1.1h-3.6c-.6 0-1.1.5-1.1 1.1v4.7c-7.2.8-11.8 5.4-11.8 11.9 0 7.4 4.5 10.3 13.9 11.7 6.4.9 7.8 2.8 7.8 5.7 0 3.7-3.1 5.7-7.6 5.7-5.5 0-8.2-2.3-9.1-6-.2-.7-.8-1.1-1.5-1.1h-3.5c-.8 0-1.5.7-1.4 1.5 1.1 5.9 5.5 9.8 12.8 10.7V75c0 .6.5 1.1 1.1 1.1h3.6c.6 0 1.1-.5 1.1-1.1v-4.9c7.5-.9 12.3-5.5 12.3-12.5z"/>
  <circle cx="50" cy="50" r="41" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-dasharray="3 3" opacity="0.4"/>
</svg>`,

  "eth.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <circle cx="50" cy="50" r="48" fill="#627EEA"/>
  <path fill="#FFFFFF" fill-opacity="0.75" d="M50 17L32 46.8l18 10.6 18-10.6L50 17z"/>
  <path fill="#FFFFFF" d="M50 17v40.4l18-10.6L50 17z"/>
  <path fill="#FFFFFF" fill-opacity="0.75" d="M50 61.2L32 50.8 50 76.5l18-25.7-18 10.4z"/>
  <path fill="#FFFFFF" d="M50 61.2v15.3l18-25.7-18 10.4z"/>
  <path fill="#FFFFFF" fill-opacity="0.3" d="M32 46.8L50 57.4v-17L32 46.8z"/>
  <path fill="#FFFFFF" fill-opacity="0.5" d="M50 40.4v17l18-10.6-18-6.4z"/>
</svg>`,

  "sol.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <defs>
    <linearGradient id="solGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00FFA3"/>
      <stop offset="50%" stop-color="#03E1FF"/>
      <stop offset="100%" stop-color="#DC1FFF"/>
    </linearGradient>
  </defs>
  <circle cx="50" cy="50" r="48" fill="#0B0E14"/>
  <path fill="url(#solGrad)" d="M26 69.5h40c1.2 0 2.3-.7 2.8-1.7l5.2-9c.9-1.6-.2-3.6-2.1-3.6H31.9c-1.2 0-2.3.7-2.8 1.7l-5.2 9c-.9 1.6.2 3.6 2.1 3.6z"/>
  <path fill="url(#solGrad)" d="M26 31h40c1.2 0 2.3-.7 2.8-1.7l5.2-9c.9-1.6-.2-3.6-2.1-3.6H31.9c-1.2 0-2.3.7-2.8 1.7l-5.2 9c-.9 1.6.2 3.6 2.1 3.6z"/>
  <path fill="url(#solGrad)" d="M74 50.2H34c-1.2 0-2.3.7-2.8 1.7l-5.2 9c-.9 1.6.2 3.6 2.1 3.6h40c1.2 0 2.3-.7 2.8-1.7l5.2-9c.9-1.6-.2-3.6-2.1-3.6z"/>
</svg>`,

  "omniyield.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  <defs>
    <linearGradient id="oyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#10B981"/>
      <stop offset="50%" stop-color="#06B6D4"/>
      <stop offset="100%" stop-color="#3B82F6"/>
    </linearGradient>
  </defs>
  <rect width="128" height="128" rx="28" fill="#0B0F19"/>
  <circle cx="64" cy="64" r="48" fill="none" stroke="url(#oyGrad)" stroke-width="6"/>
  <path d="M42 86V42L72 78V42" stroke="url(#oyGrad)" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  <path d="M86 42V86" stroke="url(#oyGrad)" stroke-width="8" stroke-linecap="round" fill="none"/>
  <circle cx="86" cy="32" r="5" fill="#10B981"/>
</svg>`,

  "omnisafe.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <defs>
    <linearGradient id="safeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F59E0B"/>
      <stop offset="100%" stop-color="#D97706"/>
    </linearGradient>
  </defs>
  <circle cx="50" cy="50" r="48" fill="#0F172A" stroke="url(#safeGrad)" stroke-width="2"/>
  <path d="M50 20L30 30v22c0 14 8.5 24.5 20 28 11.5-3.5 20-14 20-28V30L50 20z" fill="none" stroke="url(#safeGrad)" stroke-width="4.5" stroke-linejoin="round"/>
  <path d="M42 50l6 6 12-13" stroke="#F59E0B" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
</svg>`,

  "paxg.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <circle cx="50" cy="50" r="48" fill="#D97706" stroke="#FBBF24" stroke-width="2"/>
  <circle cx="50" cy="50" r="42" fill="#B45309"/>
  <text x="50" y="62" fill="#FFF" font-size="34" font-weight="900" font-family="sans-serif" text-anchor="middle">Au</text>
  <circle cx="50" cy="24" r="4" fill="#FDE68A"/>
</svg>`,

  "usdy.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <circle cx="50" cy="50" r="48" fill="#047857" stroke="#10B981" stroke-width="2"/>
  <text x="50" y="64" fill="#FFF" font-size="38" font-weight="900" font-family="sans-serif" text-anchor="middle">$Y</text>
</svg>`,

  "qqq.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <circle cx="50" cy="50" r="48" fill="#581C87" stroke="#9333EA" stroke-width="2"/>
  <text x="50" y="64" fill="#FFF" font-size="32" font-weight="900" font-family="sans-serif" text-anchor="middle">QQQ</text>
</svg>`,

  "rhea.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <circle cx="50" cy="50" r="48" fill="#1E293B" stroke="#06B6D4" stroke-width="2"/>
  <path d="M35 30h30c7 0 12 5 12 12s-5 12-12 12H48v16H35V30zm13 14h16c2 0 4-1 4-3s-2-3-4-3H48v6z" fill="#06B6D4"/>
  <path d="M60 54l14 16H60l-12-16h12z" fill="#38BDF8"/>
</svg>`,
};

for (const [filename, content] of Object.entries(logos)) {
  fs.writeFileSync(path.join(LOGO_DIR, filename), content, "utf-8");
  fs.writeFileSync(path.join(PUBLIC_LOGO_DIR, filename), content, "utf-8");
  console.log(`✔ Generated logo: ${filename} in LOGO/ and frontend/public/logos/`);
}

const readme = `# 🎨 OmniYield Protocol 官方 LOGO 与资产图标资产库

本目录（\`LOGO/\`）存放项目前后台所使用的核心矢量高清品牌与代币 LOGO 文件。

---

## 📁 图标文件清单

| 文件名 | 用途说明 | 格式 | 预览/链接 |
| :--- | :--- | :--- | :--- |
| **\`btc.svg\`** | **比特币官方经典 LOGO（倾斜 14° 金色 ₿）**，用于前后台翻转按钮与 BTC 行情标识 | SVG 矢量 | [\`btc.svg\`](./btc.svg) |
| **\`nusd.svg\`** | **OmniYield NUSD 核心金库凭证代币 LOGO** | SVG 矢量 | [\`nusd.svg\`](./nusd.svg) |
| **\`omniyield.svg\`** | **OmniYield Protocol 官方主品牌 LOGO** | SVG 矢量 | [\`omniyield.svg\`](./omniyield.svg) |
| **\`omnisafe.svg\`** | **OmniSafe 机构多签治理安全舱官方 LOGO** | SVG 矢量 | [\`omnisafe.svg\`](./omnisafe.svg) |
| **\`near.svg\`** | **NEAR Protocol 官方代币 LOGO** | SVG 矢量 | [\`near.svg\`](./near.svg) |
| **\`usdc.svg\`** | **Circle Native USDC 官方美元稳定币 LOGO** | SVG 矢量 | [\`usdc.svg\`](./usdc.svg) |
| **\`eth.svg\`** | **以太坊 Ethereum 官方钻石 LOGO** | SVG 矢量 | [\`eth.svg\`](./eth.svg) |
| **\`sol.svg\`** | **Solana 官方三段渐变 LOGO** | SVG 矢量 | [\`sol.svg\`](./sol.svg) |
| **\`usdy.svg\`** | **Ondo Finance USDY 美债生息代币 LOGO** | SVG 矢量 | [\`usdy.svg\`](./usdy.svg) |
| **\`paxg.svg\`** | **PAX Gold 伦敦合格交割实物黄金代币 LOGO** | SVG 矢量 | [\`paxg.svg\`](./paxg.svg) |
| **\`qqq.svg\`** | **Invesco 纳斯达克 100 ETF (QQQ) 资产 LOGO** | SVG 矢量 | [\`qqq.svg\`](./qqq.svg) |
| **\`rhea.svg\`** | **Rhea Finance 借贷协议与利率插座 LOGO** | SVG 矢量 | [\`rhea.svg\`](./rhea.svg) |

---

## 💡 如何自定义/替换 BTC 或其他 LOGO？

如果您找到了专属定制的 BTC LOGO 文件（例如专属定制的 3D 质感金币、专属发光版或品牌联名版）：
1. **替换方式**：直接将您的图片文件命名为 **\`btc.svg\`**（或 **\`btc.png\`**），覆盖放到本 **\`LOGO/\`** 文件夹中；
2. 系统会自动将其映射并同步至前端 **\`frontend/public/logos/btc.svg\`**；
3. 刷新浏览器 [http://localhost:3000](http://localhost:3000)，边栏底部的翻转按钮与资产列表将立即无缝呈现您的定制新 LOGO！
`;

fs.writeFileSync(path.join(LOGO_DIR, "README.md"), readme, "utf-8");
console.log("✔ Created LOGO/README.md documentation.");

