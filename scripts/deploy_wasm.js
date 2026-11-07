const fs = require('fs');
const path = require('path');
const { Account, actions } = require('../frontend/node_modules/near-api-js');

async function deployAndConfigure() {
  const wasmPath = path.join(__dirname, '../contracts/target/wasm32-unknown-unknown/release/omniflow_vault.wasm');
  console.log('Reading WASM from:', wasmPath);
  const wasmBytes = fs.readFileSync(wasmPath);
  console.log(`WASM size: ${wasmBytes.length} bytes`);

  console.log('1. Deploying WASM to omniyield-vault.testnet...');
  const vaultAcc = new Account(
    'omniyield-vault.testnet',
    'https://test.rpc.fastnear.com',
    'ed25519:2rRuiR3sG6EoLgEuUmqrgnPg7jZXDR7UTEXwdG6FW4kCxqbuzvSVdnvAX5dYh7PA9WYbPYZLUdC2CDt7TGacEA91'
  );

  const deployRes = await vaultAcc.signAndSendTransaction({
    receiverId: 'omniyield-vault.testnet',
    actions: [
      actions.deployContract(wasmBytes)
    ]
  });
  const txHash = deployRes.transaction?.hash || deployRes.transaction_outcome?.id;
  console.log('Deploy Tx:', txHash);

  console.log('2. Verifying get_fee_config on-chain...');
  const feeRes = await vaultAcc.callFunction({
    contractId: 'omniyield-vault.testnet',
    methodName: 'get_fee_config',
    args: {}
  });
  console.log('Current on-chain Fee Config:', JSON.stringify(feeRes, null, 2));

  console.log('3. Verifying get_vault_summary on-chain...');
  const summaryRes = await vaultAcc.callFunction({
    contractId: 'omniyield-vault.testnet',
    methodName: 'get_vault_summary',
    args: {}
  });
  console.log('Current on-chain Vault Summary (preview):', {
    total_assets: summaryRes.total_assets,
    total_shares: summaryRes.total_shares,
    price_per_share: summaryRes.price_per_share,
    blended_apy_bps: summaryRes.blended_apy_bps,
  });
}

deployAndConfigure().catch(console.error);
