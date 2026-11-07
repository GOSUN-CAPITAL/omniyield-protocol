use near_sdk::collections::LookupMap;
use near_sdk::json_types::Base64VecU8;
use near_sdk::{
    env, near, require, AccountId, Gas, NearToken, PanicOnDefault, Promise,
};
use std::collections::HashSet;

const DEFAULT_PROPOSAL_GAS: Gas = Gas::from_tgas(50);

#[near(serializers = [borsh, json])]
#[derive(Clone, Debug)]
pub struct Proposal {
    pub id: u64,
    pub proposer: AccountId,
    pub description: String,
    pub target: AccountId,
    pub method_name: String,
    pub args: Base64VecU8,
    pub deposit: NearToken,
    pub gas: Gas,
    pub approvals: Vec<AccountId>,
    pub executed: bool,
    pub created_at_ns: u64,
}

#[near(contract_state)]
#[derive(PanicOnDefault)]
pub struct OmniYieldMultiSig {
    pub members: HashSet<AccountId>,
    pub num_confirmations: u32,
    pub proposals: LookupMap<u64, Proposal>,
    pub proposal_count: u64,
}

#[near]
impl OmniYieldMultiSig {
    #[init]
    pub fn new(members: Vec<AccountId>, num_confirmations: u32) -> Self {
        require!(!env::state_exists(), "Already initialized");
        require!(
            num_confirmations > 0 && num_confirmations <= members.len() as u32,
            "Invalid confirmation threshold"
        );
        require!(members.len() >= 2, "Multi-sig must have at least 2 members");

        let mut member_set = HashSet::new();
        for m in members {
            member_set.insert(m);
        }

        Self {
            members: member_set,
            num_confirmations,
            proposals: LookupMap::new(b"p"),
            proposal_count: 0,
        }
    }

    /// Submit a new governance proposal to call a smart contract method
    pub fn add_proposal(
        &mut self,
        description: String,
        target: AccountId,
        method_name: String,
        args: Base64VecU8,
        deposit: Option<NearToken>,
        gas: Option<Gas>,
    ) -> u64 {
        let caller = env::predecessor_account_id();
        require!(self.members.contains(&caller), "Only multi-sig council member may propose");

        let proposal_id = self.proposal_count;
        self.proposal_count += 1;

        let proposal = Proposal {
            id: proposal_id,
            proposer: caller.clone(),
            description,
            target,
            method_name,
            args,
            deposit: deposit.unwrap_or(NearToken::from_yoctonear(0)),
            gas: gas.unwrap_or(DEFAULT_PROPOSAL_GAS),
            approvals: vec![caller], // Proposer automatically confirms
            executed: false,
            created_at_ns: env::block_timestamp(),
        };

        self.proposals.insert(&proposal_id, &proposal);
        proposal_id
    }

    /// Confirm an active proposal. Executes automatically once threshold is reached.
    pub fn confirm(&mut self, proposal_id: u64) -> Promise {
        let caller = env::predecessor_account_id();
        require!(self.members.contains(&caller), "Only council members may confirm");

        let mut proposal = self.proposals.get(&proposal_id).expect("Proposal not found");
        require!(!proposal.executed, "Proposal already executed");
        require!(
            !proposal.approvals.contains(&caller),
            "Caller already approved this proposal"
        );

        proposal.approvals.push(caller);

        let is_threshold_reached = proposal.approvals.len() >= self.num_confirmations as usize;
        if is_threshold_reached {
            proposal.executed = true;
            self.proposals.insert(&proposal_id, &proposal);

            // Execute the cross-contract call from this multi-sig contract
            Promise::new(proposal.target.clone()).function_call(
                proposal.method_name.clone(),
                proposal.args.0.clone(),
                proposal.deposit,
                proposal.gas,
            )
        } else {
            self.proposals.insert(&proposal_id, &proposal);
            env::panic_str("Approval recorded, threshold not yet reached")
        }
    }

    // =========================================================================
    // View Methods
    // =========================================================
    pub fn get_proposal(&self, proposal_id: u64) -> Option<Proposal> {
        self.proposals.get(&proposal_id)
    }

    pub fn get_proposals(&self, from_index: Option<u64>, limit: Option<u64>) -> Vec<Proposal> {
        let start = from_index.unwrap_or(0);
        let end = std::cmp::min(self.proposal_count, start + limit.unwrap_or(20));
        let mut list = Vec::new();

        for i in start..end {
            if let Some(p) = self.proposals.get(&i) {
                list.push(p);
            }
        }
        list
    }

    pub fn get_members(&self) -> Vec<AccountId> {
        self.members.iter().cloned().collect()
    }

    pub fn get_num_confirmations(&self) -> u32 {
        self.num_confirmations
    }

    pub fn get_proposal_count(&self) -> u64 {
        self.proposal_count
    }
}
