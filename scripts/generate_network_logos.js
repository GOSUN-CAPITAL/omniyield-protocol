const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const TARGET_DIRS = [
  path.join(ROOT_DIR, 'LOGO', 'networks'),
  path.join(ROOT_DIR, 'LOGO'),
  path.join(ROOT_DIR, 'frontend', 'public', 'logos', 'networks'),
  path.join(ROOT_DIR, 'frontend', 'public', 'logos')
];

TARGET_DIRS.forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const NETWORKS = {
  avax: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="48" fill="#E84142"/>
  <path d="M50 18 L20 70 L34 70 L50 42 L66 70 L80 70 Z M46 62 L50 55 L54 62 Z" fill="#FFFFFF"/>
</svg>`,

  bsc: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="48" fill="#F0B90B"/>
  <g fill="#0B0E11">
    <path d="M50 22 L62 34 L50 46 L38 34 Z"/>
    <path d="M34 38 L46 50 L34 62 L22 50 Z"/>
    <path d="M66 38 L78 50 L66 62 L54 50 Z"/>
    <path d="M50 54 L62 66 L50 78 L38 66 Z"/>
    <path d="M50 36 L58 44 L50 52 L42 44 Z" fill="#F0B90B"/>
  </g>
</svg>`,

  sui: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="48" fill="#4CA2FE"/>
  <path d="M50 18 C50 18 28 46 28 62 C28 74.1 37.9 84 50 84 C62.1 84 72 74.1 72 62 C72 46 50 18 50 18 Z M50 74 C43.4 74 38 68.6 38 62 C38 52 50 35 50 35 C50 35 62 52 62 62 C62 68.6 56.6 74 50 74 Z" fill="#FFFFFF"/>
</svg>`,

  aptos: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="48" fill="#111111"/>
  <g fill="#FFFFFF">
    <path d="M47 18 L53 18 L58 26 L42 26 Z"/>
    <path d="M39 31 L61 31 L66 39 L34 39 Z"/>
    <path d="M31 44 L69 44 L74 52 L26 52 Z"/>
    <path d="M23 57 L77 57 L82 65 L18 65 Z"/>
    <path d="M15 70 L85 70 L90 78 L10 78 Z"/>
    <polygon points="50,15 30,78 38,78 45,55 55,55 62,78 70,78" fill="#22C55E"/>
    <polygon points="50,28 46,47 54,47" fill="#111111"/>
  </g>
</svg>`,

  pol: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="48" fill="#8247E5"/>
  <path d="M32 37 L50 26 L68 37 L68 57 L50 68 L32 57 Z" fill="none" stroke="#FFFFFF" stroke-width="7" stroke-linejoin="round"/>
  <circle cx="50" cy="47" r="7" fill="#FFFFFF"/>
</svg>`,

  op: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="48" fill="#FF0420"/>
  <g fill="#FFFFFF" font-family="Arial, sans-serif" font-weight="900" font-size="34" letter-spacing="1">
    <text x="50" y="62" text-anchor="middle">OP</text>
  </g>
</svg>`,

  gnosis: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="48" fill="#00A389"/>
  <path d="M50 20 C33.4 20 20 33.4 20 50 C20 66.6 33.4 80 50 80 C66.6 80 80 66.6 80 50 C80 33.4 66.6 20 50 20 Z M50 28 C62.2 28 72 37.8 72 50 C72 62.2 62.2 72 50 72 C37.8 72 28 62.2 28 50 C28 37.8 37.8 28 50 28 Z M50 36 C42.3 36 36 42.3 36 50 C36 57.7 42.3 64 50 64 C57.7 64 64 57.7 64 50 C64 42.3 57.7 36 50 36 Z" fill="#FFFFFF"/>
</svg>`,

  stellar: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="48" fill="#0F172A"/>
  <path d="M50 18 L60 40 L84 50 L60 60 L50 82 L40 60 L16 50 L40 40 Z" fill="#FFFFFF"/>
  <circle cx="50" cy="50" r="6" fill="#38BDF8"/>
</svg>`,

  monad: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="48" fill="#836EF9"/>
  <g fill="#FFFFFF">
    <path d="M26 30 L50 18 L74 30 L74 60 L50 72 L26 60 Z" fill="none" stroke="#FFFFFF" stroke-width="6"/>
    <path d="M50 30 L64 37 L50 44 L36 37 Z"/>
    <path d="M36 42 L50 49 L50 65 L36 58 Z"/>
    <path d="M64 42 L64 58 L50 65 L50 49 Z"/>
  </g>
</svg>`,

  xlayer: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="48" fill="#000000"/>
  <g fill="#FFFFFF">
    <rect x="25" y="25" width="22" height="22" rx="3"/>
    <rect x="53" y="25" width="22" height="22" rx="3"/>
    <rect x="25" y="53" width="22" height="22" rx="3"/>
    <rect x="53" y="53" width="22" height="22" rx="3"/>
    <rect x="39" y="39" width="22" height="22" fill="#000000"/>
    <rect x="42" y="42" width="16" height="16" fill="#FFFFFF" rx="2"/>
  </g>
</svg>`,

  hypercore: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="48" fill="#0B1A17"/>
  <path d="M30 25 L42 25 L42 43 L58 43 L58 25 L70 25 L70 75 L58 75 L58 55 L42 55 L42 75 L30 75 Z" fill="#50D2C1"/>
  <circle cx="50" cy="49" r="3.5" fill="#FFFFFF"/>
</svg>`
};

let count = 0;
for (const [netId, svgContent] of Object.entries(NETWORKS)) {
  for (const dir of TARGET_DIRS) {
    const filePath = path.join(dir, `${netId}.svg`);
    fs.writeFileSync(filePath, svgContent.trim() + '\n', 'utf8');
    count++;
  }
}

console.log(`Successfully generated ${Object.keys(NETWORKS).length} network logos across ${TARGET_DIRS.length} directories (${count} files written).`);

