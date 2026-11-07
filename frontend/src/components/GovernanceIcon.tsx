"use client";

import React from "react";
import {
  Crown,
  ShieldCheck,
  ShieldAlert,
  Scale,
  Landmark,
  Plug,
  Layers,
  ArrowLeftRight,
  Zap,
  Percent,
  FileText,
  Activity,
  BarChart3,
  PieChart,
  Lock,
  Shield,
  FileCheck,
  Briefcase,
  BrainCircuit,
  Key,
  RefreshCw,
  Puzzle,
  UserCheck,
  Sparkles,
} from "lucide-react";

export type GovernanceIconName =
  | "dao"
  | "curator"
  | "guardian"
  | "allocator"
  | "vault_bank"
  | "dao_sovereign"
  | "curator_shield"
  | "balance_scale"
  | "emergency_siren"
  | "treasury_vault"
  | "socket_nusd"
  | "socket_allweather"
  | "intent_mesh"
  | "solver_zap"
  | "swap_commission"
  | "exchange_hub"
  | "asset_listing"
  | "oracle_crystal"
  | "liquidity_depth"
  | "portfolio_aum"
  | "custody_reserve"
  | "vault_isolation"
  | "audit_proof"
  | "portfolio_briefcase"
  | "ai_circuit"
  | "api_key"
  | "dynamic_polling"
  | "skills_marketplace"
  | "persona_studio"
  | "self_learning"
  | "persona_conservative"
  | "persona_balanced"
  | "persona_hunter";

interface GovernanceIconProps {
  name: GovernanceIconName | string;
  className?: string;
  alt?: string;
}

export default function GovernanceIcon({
  name,
  className = "w-4 h-4",
}: GovernanceIconProps) {
  switch (name) {
    // Roles
    case "dao":
    case "dao_sovereign":
      return <Crown className={className} />;
    case "curator":
    case "curator_shield":
      return <ShieldCheck className={className} />;
    case "guardian":
    case "emergency_siren":
      return <ShieldAlert className={className} />;
    case "allocator":
    case "balance_scale":
    case "persona_balanced":
      return <Scale className={className} />;

    // Domain 1: Vaults
    case "vault_bank":
    case "treasury_vault":
      return <Landmark className={className} />;
    case "socket_nusd":
      return <Plug className={className} />;
    case "socket_allweather":
      return <Layers className={className} />;

    // Domain 2: Exchange
    case "intent_mesh":
    case "exchange_hub":
      return <ArrowLeftRight className={className} />;
    case "solver_zap":
      return <Zap className={className} />;
    case "swap_commission":
      return <Percent className={className} />;

    // Domain 3: Markets
    case "asset_listing":
      return <FileText className={className} />;
    case "oracle_crystal":
      return <Activity className={className} />;
    case "liquidity_depth":
      return <BarChart3 className={className} />;

    // Domain 4: Portfolio
    case "portfolio_aum":
      return <PieChart className={className} />;
    case "custody_reserve":
      return <Lock className={className} />;
    case "vault_isolation":
      return <Shield className={className} />;
    case "audit_proof":
      return <FileCheck className={className} />;
    case "portfolio_briefcase":
      return <Briefcase className={className} />;

    // Domain 5: AI Engine
    case "ai_circuit":
      return <BrainCircuit className={className} />;
    case "api_key":
      return <Key className={className} />;
    case "dynamic_polling":
      return <RefreshCw className={className} />;
    case "skills_marketplace":
      return <Puzzle className={className} />;
    case "persona_studio":
      return <UserCheck className={className} />;
    case "self_learning":
      return <Sparkles className={className} />;
    case "persona_conservative":
      return <Shield className={className} />;
    case "persona_hunter":
      return <Zap className={className} />;

    default:
      return <ShieldCheck className={className} />;
  }
}
