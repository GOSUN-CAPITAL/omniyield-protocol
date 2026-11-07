const fs = require('fs');
const path = require('path');
const https = require('https');

function fetchBuffer(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        let redirect = res.headers.location;
        if (!redirect.startsWith('http')) {
          const u = new URL(url);
          redirect = `${u.protocol}//${u.host}${redirect}`;
        }
        return fetchBuffer(redirect).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject);
  });
}

async function saveIcon(name, url) {
  try {
    const buf = await fetchBuffer(url);
    const dest1 = path.resolve(__dirname, `../LOGO/wallets/${name}`);
    const dest2 = path.resolve(__dirname, `../frontend/public/logos/wallets/${name}`);
    fs.writeFileSync(dest1, buf);
    fs.writeFileSync(dest2, buf);
    console.log(`Saved ${name} (${buf.length} bytes)`);
  } catch (e) {
    console.log(`Error ${name}:`, e.message);
  }
}

async function main() {
  const sources = [
    // OKX official vector from simpleicons / official CDN
    { name: 'okx.svg', url: 'https://cdn.simpleicons.org/okx' },
    // Trust wallet
    { name: 'trust.svg', url: 'https://cdn.simpleicons.org/trustwallet/0500FF' },
    // Bitget
    { name: 'bitget.svg', url: 'https://cdn.simpleicons.org/bitget/00F0FF' },
    // Ledger
    { name: 'ledger.svg', url: 'https://raw.githubusercontent.com/LedgerHQ/ledger-live/develop/libs/ui/packages/react/src/assets/logos/ledger.svg' }
  ];

  for (const s of sources) {
    await saveIcon(s.name, s.url);
  }
}

main();
