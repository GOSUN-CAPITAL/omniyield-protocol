const fs = require('fs');
const path = require('path');

const ROOT_ICONS = path.resolve(__dirname, '../ICONS');
const PUBLIC_ICONS = path.resolve(__dirname, '../frontend/public/icons');

const CATEGORIES = ['exchange', 'markets', 'portfolio', 'ai', 'vaults'];

for (const c of CATEGORIES) {
  fs.mkdirSync(path.join(ROOT_ICONS, c), { recursive: true });
  fs.mkdirSync(path.join(PUBLIC_ICONS, c), { recursive: true });
}

const ICONS = {
  // === 1. Vaults & Headers ===
  'vaults/vault_bank.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M3 21h18M3 10h18M12 3l9 4.5V10H3V7.5L12 3z" fill="#10B981" fill-opacity="0.2" stroke="#10B981"/>
  <path d="M5 10v8M9 10v8M15 10v8M19 10v8" stroke="#10B981"/>
</svg>`,

  // === 2. Exchange & Intents (Domain 2) ===
  'exchange/intent_mesh.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="12" r="10" stroke="#06B6D4" fill="#06B6D4" fill-opacity="0.15"/>
  <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke="#22D3EE"/>
</svg>`,

  'exchange/solver_zap.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="#F59E0B" fill-opacity="0.3" stroke="#F59E0B"/>
</svg>`,

  'exchange/swap_commission.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <rect x="2" y="6" width="20" height="12" rx="2" fill="#10B981" fill-opacity="0.2" stroke="#10B981"/>
  <circle cx="12" cy="12" r="3" fill="#10B981" stroke="none"/>
  <path d="M6 12h.01M18 12h.01" stroke="#34D399" stroke-width="3"/>
</svg>`,

  'exchange/exchange_hub.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5" stroke="#06B6D4" stroke-width="2"/>
</svg>`,

  // === 3. Markets & Oracles (Domain 3) ===
  'markets/asset_listing.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" stroke="#10B981"/>
  <polyline points="16 7 22 7 22 13" stroke="#10B981" fill="#10B981" fill-opacity="0.2"/>
</svg>`,

  'markets/oracle_crystal.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="11" r="8" fill="#8B5CF6" fill-opacity="0.25" stroke="#8B5CF6"/>
  <path d="M7 21h10M9 19h6" stroke="#A78BFA"/>
  <circle cx="12" cy="10" r="2.5" fill="#C4B5FD" stroke="none"/>
</svg>`,

  'markets/liquidity_depth.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" fill="#0EA5E9" fill-opacity="0.25" stroke="#0EA5E9"/>
</svg>`,

  // === 4. Portfolio & Custody (Domain 4) ===
  'portfolio/portfolio_aum.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <line x1="18" y1="20" x2="18" y2="10" stroke="#06B6D4"/>
  <line x1="12" y1="20" x2="12" y2="4" stroke="#06B6D4"/>
  <line x1="6" y1="20" x2="6" y2="14" stroke="#06B6D4"/>
</svg>`,

  'portfolio/custody_reserve.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <rect x="3" y="4" width="18" height="16" rx="2" fill="#F59E0B" fill-opacity="0.2" stroke="#F59E0B"/>
  <circle cx="12" cy="12" r="3" stroke="#F59E0B"/>
  <path d="M12 9v6M9 12h6" stroke="#FBBF24"/>
</svg>`,

  'portfolio/vault_isolation.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <rect x="3" y="11" width="18" height="11" rx="2" fill="#3B82F6" fill-opacity="0.2" stroke="#3B82F6"/>
  <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="#60A5FA"/>
  <circle cx="12" cy="16" r="1.5" fill="#93C5FD" stroke="none"/>
</svg>`,

  'portfolio/audit_proof.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="#10B981" fill-opacity="0.2" stroke="#10B981"/>
  <polyline points="14 2 14 8 20 8" stroke="#10B981"/>
  <line x1="9" y1="13" x2="15" y2="13" stroke="#34D399"/>
  <line x1="9" y1="17" x2="13" y2="17" stroke="#34D399"/>
</svg>`,

  'portfolio/portfolio_briefcase.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <rect x="2" y="7" width="20" height="14" rx="2" fill="#06B6D4" fill-opacity="0.2" stroke="#06B6D4"/>
  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" stroke="#22D3EE"/>
</svg>`,

  // === 5. AI Copilot & Autonomous Agents (Domain 5) ===
  'ai/api_key.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M21 2l-2 2m-1.5 1.5L19 7l-2 2m-2-2l-3.5 3.5a5 5 0 1 1-7-7 5 5 0 0 1 7 7l5.5-5.5z" stroke="#F59E0B" fill="#F59E0B" fill-opacity="0.25"/>
  <circle cx="7.5" cy="7.5" r="1.5" fill="#FBBF24" stroke="none"/>
</svg>`,

  'ai/dynamic_polling.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <polyline points="23 4 23 10 17 10" stroke="#0EA5E9"/>
  <polyline points="1 20 1 14 7 14" stroke="#0EA5E9"/>
  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" stroke="#38BDF8"/>
</svg>`,

  'ai/skills_marketplace.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M19.439 7.85c-.049-.322.059-.648.289-.878l1.568-1.568a2.41 2.41 0 0 0 0-3.408 2.41 2.41 0 0 0-3.408 0l-1.568 1.568a.925.925 0 0 1-.878.289c-.322-.049-.648.059-.878.289L13 5.71a.925.925 0 0 1-.655.27H10.5a.5.5 0 0 0-.5.5v1.845a.925.925 0 0 1-.27.655l-1.428 1.428c-.23.23-.338.556-.289.878.049.322-.059.648-.289.878L6.156 13.43a2.41 2.41 0 0 0 0 3.408 2.41 2.41 0 0 0 3.408 0l1.568-1.568a.925.925 0 0 1 .878-.289c.322.049.648-.059.878-.289L13.46 13.27a.925.925 0 0 1 .655-.27H16.5a.5.5 0 0 0 .5-.5V10.655c0-.245.097-.48.27-.655l1.428-1.428c.23-.23.338-.556.289-.878z" fill="#10B981" fill-opacity="0.3" stroke="#10B981"/>
</svg>`,

  'ai/persona_studio.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M2 10s3-3 3-5 1-3 4-3 4 1 4 3 3 5 3 5l-2 7H4L2 10z" fill="#EC4899" fill-opacity="0.25" stroke="#EC4899"/>
  <path d="M14 10s2-2 2-3.5.7-2.1 2.8-2.1 2.8.7 2.8 2.1 2.1 3.5 2.1 3.5l-1.4 5H15.4L14 10z" fill="#F472B6" fill-opacity="0.2" stroke="#F472B6"/>
  <circle cx="6.5" cy="7.5" r="1" fill="#F472B6" stroke="none"/>
  <circle cx="9.5" cy="7.5" r="1" fill="#F472B6" stroke="none"/>
</svg>`,

  'ai/self_learning.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.04z" fill="#A855F7" fill-opacity="0.25" stroke="#A855F7"/>
  <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.04z" fill="#C084FC" fill-opacity="0.25" stroke="#C084FC"/>
</svg>`,

  'ai/persona_conservative.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="#10B981" fill-opacity="0.25" stroke="#10B981"/>
  <polyline points="9 12 11 14 15 10" stroke="#34D399"/>
</svg>`,

  'ai/persona_balanced.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="12" r="10" fill="#3B82F6" fill-opacity="0.2" stroke="#3B82F6"/>
  <path d="M12 2a10 10 0 0 1 0 20z" fill="#60A5FA"/>
  <circle cx="12" cy="7" r="1.5" fill="#FFFFFF"/>
  <circle cx="12" cy="17" r="1.5" fill="#1E3A8A"/>
</svg>`,

  'ai/persona_hunter.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" fill="#F59E0B" stroke="#F59E0B"/>
  <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" fill="#EF4444" fill-opacity="0.25" stroke="#EF4444"/>
  <path d="M9 12l2 2" stroke="#F87171"/>
</svg>`
};

for (const [relPath, content] of Object.entries(ICONS)) {
  const p1 = path.join(ROOT_ICONS, relPath);
  const p2 = path.join(PUBLIC_ICONS, relPath);
  fs.writeFileSync(p1, content.trim(), 'utf8');
  fs.writeFileSync(p2, content.trim(), 'utf8');
  console.log(`Created: ${relPath}`);
}

console.log('All remaining domain & module vector icons generated successfully!');

