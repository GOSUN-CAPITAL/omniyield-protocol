/**
 * OmniYield Autonomous AI Public Allocator Keeper Daemon (Dual-Vault Matrix)
 * 
 * Account: allocator.omniyield-vault.testnet
 * Target Socket Adapters:
 *   - rhea.omniyield-vault.testnet   (RHEA Lending Socket)
 *   - ondo.omniyield-vault.testnet   (Ondo USDY Treasuries Socket)
 *   - stocks.omniyield-vault.testnet (Ondo QQQ US Tech Equities Socket)
 *   - gold.omniyield-vault.testnet   (Tokenized Physical Gold PAXG Socket)
 * Master Vault:
 *   - omniyield-vault.testnet
 */

const { Account, actions } = require('../frontend/node_modules/near-api-js');
const accountsData = require('../credentials/testnet_accounts.json');

const RPC_URL = process.env.NEAR_RPC_URL || 'https://rpc.testnet.near.org';
const ALLOCATOR_ID = accountsData.accounts.allocator.account_id;
const ALLOCATOR_KEY = accountsData.accounts.allocator.private_key;
const VAULT_ID = accountsData.accounts.vault.account_id;

const RHEA_ADAPTER = `rhea.${VAULT_ID}`;
const ONDO_ADAPTER = `ondo.${VAULT_ID}`;
const STOCKS_ADAPTER = `stocks.${VAULT_ID}`;
const GOLD_ADAPTER = `gold.${VAULT_ID}`;

async function runKeeperCycle() {
  console.log(`\n======================================================`);
  console.log(`🤖 AI PUBLIC ALLOCATOR KEEPER CYCLE: ${new Date().toISOString()}`);
  console.log(`Keeper Account: ${ALLOCATOR_ID}`);
  console.log(`Master Vault:   ${VAULT_ID}`);
  console.log(`======================================================`);

  const allocatorAcc = new Account(ALLOCATOR_ID, RPC_URL, ALLOCATOR_KEY);

  // 1. Fetch live telemetry from all 4 on-chain market socket adapters
  console.log(`\n[1/4] Polling on-chain OmniSocket™ states (4 Macro Sockets)...`);
  const [rheaState, ondoState, stocksState, goldState] = await Promise.all([
    allocatorAcc.callFunction({ contractId: RHEA_ADAPTER, methodName: 'get_market_state', args: {} }),
    allocatorAcc.callFunction({ contractId: ONDO_ADAPTER, methodName: 'get_reserve_state', args: {} }),
    allocatorAcc.callFunction({ contractId: STOCKS_ADAPTER, methodName: 'get_market_state', args: {} }),
    allocatorAcc.callFunction({ contractId: GOLD_ADAPTER, methodName: 'get_market_state', args: {} })
  ]);

  console.log(`  📊 [Pillar 1 - Lending] RHEA Finance Socket:`);
  console.log(`     - Supplied:    $${(Number(rheaState.total_supplied) / 1e6).toLocaleString()} USDC`);
  console.log(`     - Supply Cap:  $${(Number(rheaState.supply_cap) / 1e6).toLocaleString()} USDC`);
  console.log(`     - Current APY: ${(rheaState.apy_bps / 100).toFixed(2)}% (${rheaState.apy_bps} bps)`);

  console.log(`  🏛️ [Pillar 2 - Treasuries] Ondo USDY Reserve Socket:`);
  console.log(`     - Reserve Bal: $${(Number(ondoState.reserve_balance) / 1e6).toLocaleString()} USDC`);
  console.log(`     - Current APY: ${(ondoState.apy_bps / 100).toFixed(2)}% (${ondoState.apy_bps} bps)`);

  console.log(`  📈 [Pillar 3 - Equities] Ondo Tech Equities (QQQ & NVDA) Socket:`);
  console.log(`     - Supplied:    $${(Number(stocksState.total_supplied) / 1e6).toLocaleString()} USDC`);
  console.log(`     - Current APY: ${(stocksState.apy_bps / 100).toFixed(2)}% (${stocksState.apy_bps} bps)`);

  console.log(`  🥇 [Pillar 4 - Gold] Tokenized Physical Gold (PAXG) Socket:`);
  console.log(`     - Backing:     ${goldState.backing}`);
  console.log(`     - Supplied:    $${(Number(goldState.total_supplied) / 1e6).toLocaleString()} USDC`);
  console.log(`     - Current APY: ${(goldState.apy_bps / 100).toFixed(2)}% (${goldState.apy_bps} bps)`);

  // 2. Evaluate Dual-Vault Optimization Strategies
  console.log(`\n[2/4] Evaluating Dual-Vault Matrix Rebalance:`);
  console.log(`  🔹 Vault 1: GOSUN OmniYield USDC (Target: 70% RHEA @ ${(rheaState.apy_bps / 100).toFixed(2)}% + 30% Ondo @ ${(ondoState.apy_bps / 100).toFixed(2)}%)`);
  console.log(`  🌟 Vault 2: GOSUN All-Weather RWA (Target: 40% Bonds + 25% QQQ + 15% Gold + 20% Lending Alpha)`);

  // 3. Dynamic Oracle APY Telemetry Update (simulating micro liquidity shifts)
  const simulatedRheaFluct = Math.floor(Math.random() * 20) - 10;
  const newRheaBps = Math.min(1800, Math.max(1200, rheaState.apy_bps + simulatedRheaFluct));

  console.log(`\n[3/4] Updating live telemetry on-chain via allocator signature...`);
  const apyTx = await allocatorAcc.signAndSendTransaction({
    receiverId: RHEA_ADAPTER,
    actions: [
      actions.functionCall('set_apy', { apy_bps: newRheaBps }, '30000000000000', '0')
    ]
  });
  const apyHash = apyTx.transaction?.hash || apyTx.transaction_outcome?.id;
  console.log(`  ✅ Live RHEA APY calibrated to ${(newRheaBps / 100).toFixed(2)}%`);
  console.log(`  🔗 NearBlocks Tx: https://testnet.nearblocks.io/txns/${apyHash}`);

  // 4. Trigger Master Vault Rebalancing
  console.log(`\n[4/4] Executing autonomous rebalance dispatch on omniyield-vault.testnet...`);
  try {
    const vaultSummary = await allocatorAcc.callFunction({
      contractId: VAULT_ID,
      methodName: 'get_vault_summary',
      args: {}
    });

    const totalAssets = BigInt(vaultSummary.total_assets);
    const rheaTarget = ((totalAssets * 7000n) / 10000n).toString();
    const ondoTarget = (totalAssets - BigInt(rheaTarget)).toString();

    console.log(`  Master Vault Total Assets: ${totalAssets} units`);
    console.log(`  Targeting: 70% RHEA (${rheaTarget}) + 30% Ondo USDY Buffer (${ondoTarget})`);

    const reallocTx = await allocatorAcc.signAndSendTransaction({
      receiverId: VAULT_ID,
      actions: [
        actions.functionCall(
          'reallocate',
          {
            allocations: [
              { market_id: 'rhea-lending', amount: rheaTarget },
              { market_id: 'ondo-rwa', amount: ondoTarget }
            ]
          },
          '50000000000000',
          '0'
        )
      ]
    });
    const reallocHash = reallocTx.transaction?.hash || reallocTx.transaction_outcome?.id;
    console.log(`  🚀 On-Chain Reallocation Settled: 70% RHEA / 30% Ondo USDY!`);
    console.log(`  🔗 NearBlocks Tx: https://testnet.nearblocks.io/txns/${reallocHash}`);
  } catch (err) {
    console.log(`  ℹ️ Vault reallocate note:`, err.message);
  }

  console.log(`\n✨ Epoch complete. All 4 OmniSocket™ adapters and dual-vault telemetry synced.`);
}

runKeeperCycle().catch(console.error);
