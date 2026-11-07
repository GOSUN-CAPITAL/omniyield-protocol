const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const LOGO_DIR = path.join(ROOT, "LOGO");
const PUBLIC_LOGO_DIR = path.join(ROOT, "frontend", "public", "logos");

const STOCK_LOGOS = {
  "aapl.svg": "https://www.vectorlogo.zone/logos/apple/apple-icon.svg",
  "nvda.svg": "https://www.vectorlogo.zone/logos/nvidia/nvidia-icon.svg",
  "msft.svg": "https://www.vectorlogo.zone/logos/microsoft/microsoft-icon.svg",
  "googl.svg": "https://www.vectorlogo.zone/logos/google/google-icon.svg",
  "goog.svg": "https://www.vectorlogo.zone/logos/google/google-icon.svg",
  "amzn.svg": "https://www.vectorlogo.zone/logos/amazon/amazon-icon.svg",
  "meta.svg": "https://www.vectorlogo.zone/logos/meta/meta-icon.svg",
  "tsla.svg": "https://www.vectorlogo.zone/logos/tesla/tesla-icon.svg",
  "coin.svg": "https://www.vectorlogo.zone/logos/coinbase/coinbase-icon.svg",
};

async function downloadAll() {
  console.log("=====================================================================");
  console.log("  📈 Downloading Official US Equity Brand Vector Icons (vectorlogo.zone)");
  console.log("=====================================================================");

  for (const [filename, url] of Object.entries(STOCK_LOGOS)) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
      if (res.ok) {
        let svg = await res.text();
        // If SVG lacks viewBox or needs cleanup, ensure standard attributes
        if (!svg.includes("viewBox") && svg.includes('width="64"') && svg.includes('height="64"')) {
          svg = svg.replace('<svg ', '<svg viewBox="0 0 64 64" ');
        }
        fs.writeFileSync(path.join(LOGO_DIR, filename), svg, "utf-8");
        fs.writeFileSync(path.join(PUBLIC_LOGO_DIR, filename), svg, "utf-8");
        console.log(`  ✔ Saved ${filename} (${svg.length} bytes) to LOGO/ and frontend/public/logos/`);
      } else {
        console.error(`  ❌ Failed to fetch ${filename}: HTTP ${res.status}`);
      }
    } catch (e) {
      console.error(`  ❌ Error fetching ${filename}:`, e.message);
    }
  }

  // Also create S&P 500 (SPY / SPX) badge
  const spySvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <defs>
    <linearGradient id="spyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0B132B"/>
      <stop offset="100%" stop-color="#1C2541"/>
    </linearGradient>
    <linearGradient id="goldRim" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F59E0B"/>
      <stop offset="100%" stop-color="#D97706"/>
    </linearGradient>
  </defs>
  <circle cx="50" cy="50" r="48" fill="url(#spyGrad)" stroke="url(#goldRim)" stroke-width="2.5"/>
  <circle cx="50" cy="50" r="42" fill="none" stroke="#F59E0B" stroke-width="1" stroke-dasharray="3 3" opacity="0.4"/>
  <text x="50" y="48" fill="#FFFFFF" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="900" text-anchor="middle" letter-spacing="1">S&amp;P</text>
  <text x="50" y="68" fill="#F59E0B" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="900" text-anchor="middle" letter-spacing="1">500</text>
</svg>`;
  fs.writeFileSync(path.join(LOGO_DIR, "spy.svg"), spySvg, "utf-8");
  fs.writeFileSync(path.join(PUBLIC_LOGO_DIR, "spy.svg"), spySvg, "utf-8");
  fs.writeFileSync(path.join(LOGO_DIR, "spx.svg"), spySvg, "utf-8");
  fs.writeFileSync(path.join(PUBLIC_LOGO_DIR, "spx.svg"), spySvg, "utf-8");
  console.log("  ✔ Generated S&P 500 (spy.svg / spx.svg)");

  console.log("\nAll US Equity Stock & Index Logos Downloaded Successfully!");
}

downloadAll();

