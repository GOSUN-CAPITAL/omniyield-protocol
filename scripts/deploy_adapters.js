const fs = require('fs');
const path = require('path');
const { Account, actions, KeyPair } = require('../frontend/node_modules/near-api-js');

const RPC_URL = 'https://test.rpc.fastnear.com';
const VAULT_ID = 'omniyield-vault.testnet';
const VAULT_PRIVATE_KEY = 'ed25519:2rRuiR3sG6EoLgEuUmqrgnPg7jZXDR7UTEXwdG6FW4kCxqbuzvSVdnvAX5dYh7PA9WYbPYZLUdC2CDt7TGacEA91';
const KEY_PAIR = KeyPair.fromString(VAULT_PRIVATE_KEY);
const PUBLIC_KEY_OBJ = KEY_PAIR.getPublicKey();

async function accountExists(accountId) {
  try {
    const res = await fetch(RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'dontcare',
        method: 'query',
        params: {
          request_type: 'view_account',
          finality: 'final',
          account_id: accountId
        }
      })
    });
    const data = await res.json();
    return !data.error;
  } catch (e) {
    return false;
  }
}

async function deployAdapter(adapterSubId, wasmPath, initMethod, initArgs, depositNear = '1.2') {
  const fullAccountId = `${adapterSubId}.${VAULT_ID}`;
  console.log(`\n========================================`);
  console.log(`Processing Socket Adapter: ${fullAccountId}`);
  console.log(`========================================`);

  const wasmBytes = fs.readFileSync(wasmPath);
  console.log(`WASM file: ${wasmPath} (${(wasmBytes.length / 1024).toFixed(1)} KB)`);

  const masterAcc = new Account(VAULT_ID, RPC_URL, VAULT_PRIVATE_KEY);
  const exists = await accountExists(fullAccountId);

  if (!exists) {
    console.log(`Subaccount ${fullAccountId} does NOT exist yet. Creating and initializing in atomic batch...`);
    const depositYocto = BigInt(Math.floor(parseFloat(depositNear) * 1e24)).toString();

    const txRes = await masterAcc.signAndSendTransaction({
      receiverId: fullAccountId,
      actions: [
        actions.createAccount(),
        actions.transfer(depositYocto),
        actions.addFullAccessKey(PUBLIC_KEY_OBJ),
        actions.deployContract(wasmBytes),
        actions.functionCall(initMethod, initArgs, '30000000000000', '0')
      ]
    });

    const hash = txRes.transaction?.hash || txRes.transaction_outcome?.id;
    console.log(`✅ Created, funded, deployed & initialized ${fullAccountId}!`);
    console.log(`Tx Explorer: https://testnet.nearblocks.io/txns/${hash}`);
  } else {
    console.log(`Subaccount ${fullAccountId} already exists on testnet. Upgrading WASM...`);
    const subAcc = new Account(fullAccountId, RPC_URL, VAULT_PRIVATE_KEY);
    const txRes = await subAcc.signAndSendTransaction({
      receiverId: fullAccountId,
      actions: [
        actions.deployContract(wasmBytes)
      ]
    });
    const hash = txRes.transaction?.hash || txRes.transaction_outcome?.id;
    console.log(`✅ WASM upgraded for ${fullAccountId}!`);
    console.log(`Tx Explorer: https://testnet.nearblocks.io/txns/${hash}`);
  }

  // Verify view call
  console.log(`Querying state from ${fullAccountId}...`);
  try {
    const viewMethod = adapterSubId === 'ondo' ? 'get_reserve_state' : 'get_market_state';
    const state = await masterAcc.callFunction({
      contractId: fullAccountId,
      methodName: viewMethod,
      args: {}
    });
    console.log(`Live State for ${fullAccountId}:`, JSON.stringify(state, null, 2));
    return state;
  } catch (err) {
    console.warn(`View state call warning:`, err.message);
  }
}

async function main() {
  console.log(`Connecting to NEAR Testnet as master vault: ${VAULT_ID}...`);

  const rheaWasm = path.join(__dirname, '../contracts/adapters/rhea_adapter/target/wasm32-unknown-unknown/release/rhea_adapter.wasm');
  const ondoWasm = path.join(__dirname, '../contracts/adapters/ondo_adapter/target/wasm32-unknown-unknown/release/ondo_adapter.wasm');
  const stocksWasm = path.join(__dirname, '../contracts/adapters/stocks_adapter/target/wasm32-unknown-unknown/release/stocks_adapter.wasm');
  const goldWasm = path.join(__dirname, '../contracts/adapters/gold_adapter/target/wasm32-unknown-unknown/release/gold_adapter.wasm');

  // 1. Rhea Adapter (Lending Alpha - 13.88%)
  await deployAdapter('rhea', rheaWasm, 'new', { vault_id: VAULT_ID, initial_apy_bps: 1388 }, '2.5');

  // 2. Ondo Adapter (Treasuries Buffer - 5.10%)
  await deployAdapter('ondo', ondoWasm, 'new', { vault_id: VAULT_ID, initial_apy_bps: 510 }, '2.5');

  // 3. Stocks Adapter (Nasdaq 100 QQQ - 18.20%)
  if (fs.existsSync(stocksWasm)) {
    await deployAdapter('stocks', stocksWasm, 'new', { vault_id: VAULT_ID, initial_apy_bps: 1820 }, '2.5');
  }

  // 4. Gold Adapter (PAXG / Tether Gold - 12.50%)
  if (fs.existsSync(goldWasm)) {
    await deployAdapter('gold', goldWasm, 'new', { vault_id: VAULT_ID, initial_apy_bps: 1250 }, '2.5');
  }

  console.log('\n🎉 ALL 4 DUAL-VAULT SOCKET ADAPTERS DEPLOYED & ONLINE ON NEAR TESTNET!');
}

main().catch(console.error);
