// src/workflows.ts
import { Workflow } from "./types";

export const IntelligentListing: Workflow = {
  id: "intelligent-listing",
  name: "Intelligent NFT Listing (with HITL Approval)",
  description:
    "Agent evaluates market, suggests metadata & price, then waits for human approval before listing on-chain.",
  humanApprovalRequired: true, // <--- triggers HITL behavior before final action
  steps: [
    {
      id: "gather_metadata",
      name: "Gather metadata & traits",
      action: "gather_metadata",
      agent: "DataAggregator",
      parameters: {}
    },
    {
      id: "market_analysis",
      name: "Market Analysis & Price Suggestion",
      action: "pricing_analysis",
      agent: "PricingAgent",
      parameters: {}
    },
    {
      id: "generate_listing_proposal",
      name: "Generate Listing Proposal",
      action: "generate_proposal",
      agent: "MatchmakerAgent",
      parameters: {}
    },
    {
      id: "finalize_onchain",
      name: "Finalize On-Chain Listing",
      action: "finalize_onchain",
      agent: "Orchestrator",
      parameters: {}
      // This is the final step — orchestrator will pause before executing if humanApprovalRequired === true
    }
  ]
};

export const AllWorkflows: Workflow[] = [IntelligentListing];

