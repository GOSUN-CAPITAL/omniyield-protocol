const fs = require('fs');
const path = require('path');
const https = require('https');

const LOGO_DIR = path.resolve(__dirname, '../LOGO');
const PUBLIC_LOGOS_DIR = path.resolve(__dirname, '../frontend/public/logos');

const CATEGORIES = {
  brand: ['omniyield.svg', 'omnisafe.svg', 'nusd.svg'],
  crypto: ['btc.svg', 'eth.svg', 'near.svg', 'sol.svg', 'usdc.svg', 'usdy.svg', 'usdy.png', 'paxg.svg', 'rhea.svg'],
  equities: [
    'aapl.svg', 'nvda.svg', 'msft.svg', 'googl.svg', 'goog.svg',
    'amzn.svg', 'meta.svg', 'tsla.svg', 'coin.svg', 'qqq.svg',
    'spy.svg', 'spx.svg'
  ],
  wallets: [
    'mynearwallet.svg', 'meteor.svg', 'here.svg', 'metamask.svg',
    'phantom.svg', 'okx.svg', 'trust.svg', 'coinbase_wallet.svg',
    'bitget.svg', 'ledger.svg', 'walletconnect.svg'
  ]
};

// 1. Ensure subdirectories exist
for (const cat of Object.keys(CATEGORIES)) {
  fs.mkdirSync(path.join(LOGO_DIR, cat), { recursive: true });
  fs.mkdirSync(path.join(PUBLIC_LOGOS_DIR, cat), { recursive: true });
}

// 2. Move / copy existing assets into categorized folders
for (const [cat, files] of Object.entries(CATEGORIES)) {
  if (cat === 'wallets') continue; // will handle separately
  for (const f of files) {
    const srcLogo = path.join(LOGO_DIR, f);
    const destLogo = path.join(LOGO_DIR, cat, f);
    if (fs.existsSync(srcLogo)) {
      fs.copyFileSync(srcLogo, destLogo);
      console.log(`Copied ${f} to LOGO/${cat}/`);
    }

    const srcPub = path.join(PUBLIC_LOGOS_DIR, f);
    const destPub = path.join(PUBLIC_LOGOS_DIR, cat, f);
    if (fs.existsSync(srcPub)) {
      fs.copyFileSync(srcPub, destPub);
      console.log(`Copied ${f} to frontend/public/logos/${cat}/`);
    }
  }
}

console.log('Categories created and existing assets distributed.');

