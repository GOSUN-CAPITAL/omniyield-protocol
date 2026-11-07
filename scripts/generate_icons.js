const fs = require('fs');
const path = require('path');

const ROOT_ICONS = path.resolve(__dirname, '../ICONS');
const PUBLIC_ICONS = path.resolve(__dirname, '../frontend/public/icons');

const DIRS = [
  path.join(ROOT_ICONS, 'roles'),
  path.join(ROOT_ICONS, 'governance'),
  path.join(PUBLIC_ICONS, 'roles'),
  path.join(PUBLIC_ICONS, 'governance'),
];

for (const d of DIRS) {
  fs.mkdirSync(d, { recursive: true });
}

const ICONS = {
  // 1. Roles
  'roles/dao.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.203a4 4 0 0 1-3.86 2.928H8.713a4 4 0 0 1-3.86-2.928L2.019 6.019a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z" fill="#F59E0B" fill-opacity="0.25" stroke="#F59E0B"/>
  <circle cx="12" cy="14" r="1.5" fill="#F59E0B" stroke="none"/>
  <circle cx="7" cy="13" r="1" fill="#F59E0B" stroke="none"/>
  <circle cx="17" cy="13" r="1" fill="#F59E0B" stroke="none"/>
</svg>`,

  'roles/curator.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M3 3v16a2 2 0 0 0 2 2h16" stroke="#06B6D4"/>
  <rect x="7" y="10" width="3" height="7" rx="1" fill="#06B6D4" fill-opacity="0.3" stroke="#06B6D4"/>
  <rect x="12" y="6" width="3" height="11" rx="1" fill="#06B6D4" fill-opacity="0.5" stroke="#06B6D4"/>
  <rect x="17" y="12" width="3" height="5" rx="1" fill="#06B6D4" fill-opacity="0.3" stroke="#06B6D4"/>
  <circle cx="13.5" cy="4.5" r="1.5" fill="#22D3EE" stroke="none"/>
</svg>`,

  'roles/guardian.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M7 18h10M4 21h16M7 18l1.2-8.4A4 4 0 0 1 12 6a4 4 0 0 1 3.8 3.6L17 18" stroke="#EF4444" fill="#EF4444" fill-opacity="0.2"/>
  <path d="M12 2v2M4.93 4.93l1.41 1.41M19.07 4.93l-1.41 1.41" stroke="#F87171"/>
  <circle cx="12" cy="12" r="1.5" fill="#EF4444" stroke="none"/>
</svg>`,

  'roles/allocator.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <rect x="4" y="8" width="16" height="12" rx="3" stroke="#F59E0B" fill="#F59E0B" fill-opacity="0.2"/>
  <path d="M12 2v4M2 14h2M20 14h2" stroke="#F59E0B"/>
  <circle cx="9" cy="13" r="1.5" fill="#F59E0B" stroke="none"/>
  <circle cx="15" cy="13" r="1.5" fill="#F59E0B" stroke="none"/>
  <path d="M9 17h6" stroke="#F59E0B"/>
</svg>`,

  // 2. Governance Menu Items
  'governance/dao_sovereign.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.203a4 4 0 0 1-3.86 2.928H8.713a4 4 0 0 1-3.86-2.928L2.019 6.019a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z" fill="#F59E0B" fill-opacity="0.3" stroke="#F59E0B"/>
</svg>`,

  'governance/curator_shield.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="#0EA5E9" fill-opacity="0.2" stroke="#0EA5E9"/>
  <path d="M12 8v5M12 16h.01" stroke="#38BDF8"/>
</svg>`,

  'governance/balance_scale.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M12 3v17M5 20h14" stroke="#F59E0B"/>
  <path d="M4 7l4 7H0l4-7z" fill="#F59E0B" fill-opacity="0.3" stroke="#F59E0B" transform="translate(1,0)"/>
  <path d="M16 7l4 7h-8l4-7z" fill="#F59E0B" fill-opacity="0.3" stroke="#F59E0B" transform="translate(3,0)"/>
  <path d="M5 7h14" stroke="#F59E0B"/>
</svg>`,

  'governance/emergency_siren.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M7 18h10M4 21h16M7 18l1.2-8.4A4 4 0 0 1 12 6a4 4 0 0 1 3.8 3.6L17 18" stroke="#EF4444" fill="#EF4444" fill-opacity="0.25"/>
  <path d="M12 2v2M4.93 4.93l1.41 1.41M19.07 4.93l-1.41 1.41" stroke="#F87171"/>
</svg>`,

  'governance/treasury_vault.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="12" r="9" fill="#10B981" fill-opacity="0.2" stroke="#10B981"/>
  <path d="M12 7v10M15 9.5a2.5 2.5 0 0 0-5 0c0 2.5 5 2.5 5 5a2.5 2.5 0 0 1-5 0" stroke="#10B981"/>
</svg>`,

  'governance/socket_nusd.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M18 8V5a2 2 0 0 0-2-2h-8a2 2 0 0 0-2 2v3M9 2v3M15 2v3" stroke="#10B981"/>
  <rect x="4" y="8" width="16" height="8" rx="2" fill="#10B981" fill-opacity="0.25" stroke="#10B981"/>
  <path d="M12 16v5a1 1 0 0 1-1 1H8" stroke="#10B981"/>
  <circle cx="12" cy="12" r="1.5" fill="#34D399" stroke="none"/>
</svg>`,

  'governance/socket_allweather.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M18 8V5a2 2 0 0 0-2-2h-8a2 2 0 0 0-2 2v3M9 2v3M15 2v3" stroke="#06B6D4"/>
  <rect x="4" y="8" width="16" height="8" rx="2" fill="#06B6D4" fill-opacity="0.25" stroke="#06B6D4"/>
  <path d="M12 16v5a1 1 0 0 0 1 1h3" stroke="#06B6D4"/>
  <circle cx="12" cy="12" r="1.5" fill="#22D3EE" stroke="none"/>
</svg>`
};

for (const [relPath, content] of Object.entries(ICONS)) {
  const p1 = path.join(ROOT_ICONS, relPath);
  const p2 = path.join(PUBLIC_ICONS, relPath);
  fs.writeFileSync(p1, content.trim(), 'utf8');
  fs.writeFileSync(p2, content.trim(), 'utf8');
  console.log(`Created: ${relPath}`);
}

console.log('All 11 official governance & role vector icons generated!');

