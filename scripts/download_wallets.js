const fs = require('fs');
const path = require('path');
const https = require('https');

const LOGO_WALLET_DIR = path.resolve(__dirname, '../LOGO/wallets');
const PUBLIC_WALLET_DIR = path.resolve(__dirname, '../frontend/public/logos/wallets');

fs.mkdirSync(LOGO_WALLET_DIR, { recursive: true });
fs.mkdirSync(PUBLIC_WALLET_DIR, { recursive: true });

function downloadFile(url, fileName) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        let redirectUrl = res.headers.location;
        if (!redirectUrl.startsWith('http')) {
          const u = new URL(url);
          redirectUrl = `${u.protocol}//${u.host}${redirectUrl}`;
        }
        return downloadFile(redirectUrl, fileName).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      const destLogo = path.join(LOGO_WALLET_DIR, fileName);
      const destPub = path.join(PUBLIC_WALLET_DIR, fileName);
      const fileStream = fs.createWriteStream(destLogo);
      res.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        fs.copyFileSync(destLogo, destPub);
        console.log(`Successfully downloaded: ${fileName}`);
        resolve();
      });
    }).on('error', reject);
  });
}

async function main() {
  const tasks = [
    {
      name: 'mynearwallet.png',
      url: 'https://unpkg.com/@near-wallet-selector/my-near-wallet@10.1.4/assets/my-near-wallet-icon.png'
    },
    {
      name: 'meteor.png',
      url: 'https://unpkg.com/@near-wallet-selector/meteor-wallet@10.1.4/assets/meteor-wallet-icon.png'
    },
    {
      name: 'here.png',
      url: 'https://unpkg.com/@near-wallet-selector/here-wallet@10.1.4/assets/here-wallet-icon.png'
    },
    {
      name: 'metamask.svg',
      url: 'https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg'
    },
    {
      name: 'walletconnect.svg',
      url: 'https://cdn.simpleicons.org/walletconnect/3B99FC'
    },
    {
      name: 'coinbase.svg',
      url: 'https://cdn.simpleicons.org/coinbase/0052FF'
    }
  ];

  for (const t of tasks) {
    try {
      await downloadFile(t.url, t.name);
    } catch (err) {
      console.error(`Failed ${t.name}:`, err.message);
    }
  }
}

main();

