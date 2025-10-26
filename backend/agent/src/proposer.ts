import { ethers } from "ethers";
import { Opportunity } from "./detector";

// Minimal ABI for ArbitrageRouter
const ARBITRAGE_ROUTER_ABI = [
  "function proposeArbitrage(address bondToken, uint256 bondAmount, address profitToken, uint256 minProfit, uint256 proposerShareBps, uint256 treasuryShareBps, address treasury, address[] calldata targets, uint256[] calldata values, bytes[] calldata datas) external payable returns (uint256 id)",
  "event ProposalCreated(uint256 indexed id, address indexed proposer, address profitToken, uint256 minProfit)"
];

export async function proposeOpportunity(
  provider: ethers.JsonRpcProvider,
  signer: ethers.Wallet,
  routerAddress: string,
  opp: Opportunity,
  env: any
) {
  const router = new ethers.Contract(routerAddress, ARBITRAGE_ROUTER_ABI, signer);

  // Build call sequence:
  // NOTE: real implementation must craft the precise calls needed to capture arbitrage.
  // Example: rent on source market (value = sourcePrice), then list/offer on target market;
  // for demo, we build placeholder calls to an example contract (addresses need to be real)
  // We'll assume NFTFlow has a 'rentNFT' function and 'listForRental' etc.

  // Example: call 1: rentNFT(nftContract, tokenId, duration) payable = sourcePrice
  // Example: call 2: (optional) call to target market to post a rental or transfer

  // For demo we create 2 dummy calls pointing to nftContract itself (placeholder)
  const callsTargets: string[] = [];
  const callsValues: string[] = [];
  const callsDatas: string[] = [];

  // placeholder interface for ERC721 transferFrom (not actual rental)
  const erc721Iface = new ethers.Interface(["function transferFrom(address,address,uint256)"]);

  // 1) pretend to "acquire" NFT by calling transferFrom (demo only; not usable on real marketplaces)
  const acquireCalldata = erc721Iface.encodeFunctionData("transferFrom", [
    signer.address,
    signer.address,
    opp.tokenId
  ]);
  callsTargets.push(opp.nftContract);
  callsValues.push("0");
  callsDatas.push(acquireCalldata);

  // In real flow you will:
  // - call NFTFlow.rentNFT(...) with value opp.sourcePriceWei (rental fee)
  // - call other marketplace functions as needed. Ensure proper approvals & trustless flow.

  // Proposal parameters
  const bondToken = (env.BOND_TOKEN_ADDRESS === "0x0" || !env.BOND_TOKEN_ADDRESS) ? ethers.ZeroAddress : env.BOND_TOKEN_ADDRESS;
  const bondAmount = env.BOND_AMOUNT || "0";
  const profitToken = (env.PROFIT_TOKEN_ADDRESS === "0x0" || !env.PROFIT_TOKEN_ADDRESS) ? ethers.ZeroAddress : env.PROFIT_TOKEN_ADDRESS;
  const minProfit = env.MIN_PROFIT_WEI || "0";
  const proposerShareBps = Number(env.PROPOSER_SHARE_BPS || "8000");
  const treasuryShareBps = Number(env.TREASURY_SHARE_BPS || "1500");
  const treasury = env.TREASURY_ADDRESS || ethers.ZeroAddress;

  // call proposeArbitrage - values must be arrays
  const bondValue = bondToken === ethers.ZeroAddress ? BigInt(bondAmount) : 0n;
  
  const tx = await router.proposeArbitrage(
    bondToken,
    bondAmount,
    profitToken,
    minProfit,
    proposerShareBps,
    treasuryShareBps,
    treasury,
    callsTargets,
    callsValues,
    callsDatas,
    { value: bondValue }
  );

  const receipt = await tx.wait();
  // parse ProposalCreated event to get id (or query contract)
  console.log("propose tx done:", receipt.transactionHash);
  return receipt;
}
