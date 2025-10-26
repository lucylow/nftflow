import { ethers } from "ethers";
import { Wallet } from "ethers";

// Minimal ABI for AutonomousController
const CONTROLLER_ABI = [
  "function agentProposePrice(uint256 listingId, uint256 newPrice, string calldata reasonCID)",
  "function agentRecommend(uint256 listingId, uint256 score, string calldata reasoning)",
  "function agentSetCollateral(address user, uint256 newCollateral, string calldata reasonCID)",
  "function agentExecute(bytes calldata encodedCall, string calldata reasonCID)",
];

// NFTFlow interface
export const nftflowIface = new ethers.Interface([
  "function rentNFT(address nftContract, uint256 tokenId, uint256 duration) payable",
  "function setPricePerSecond(uint256 listingId, uint256 price)",
  "function setCollateral(address user, uint256 amount)",
]);

let provider: ethers.JsonRpcProvider | null = null;
let signer: Wallet | null = null;
let controller: ethers.Contract | null = null;

export const initializeBlockchain = () => {
  const rpc = process.env.SOMNIA_RPC || "http://localhost:8545";
  provider = new ethers.JsonRpcProvider(rpc);
  
  const privateKey = process.env.PRIVATE_KEY;
  if (privateKey) {
    signer = new ethers.Wallet(privateKey, provider);
  } else {
    console.warn("⚠️ No PRIVATE_KEY in env - agent actions will not be signed");
  }

  const controllerAddress = process.env.AUTONOMOUS_CONTROLLER || "";
  if (controllerAddress && provider) {
    controller = new ethers.Contract(controllerAddress, CONTROLLER_ABI, signer || provider);
  }

  console.log("🔗 Blockchain initialized:");
  console.log(`   RPC: ${rpc}`);
  console.log(`   Controller: ${controllerAddress || "Not set"}`);
  console.log(`   Signer: ${signer?.address || "Not set"}`);
};

export const getController = () => {
  if (!controller) {
    throw new Error("Controller not initialized");
  }
  return controller;
};

export const getSigner = () => {
  if (!signer) {
    throw new Error("Signer not initialized");
  }
  return signer;
};

// Initialize on module load
initializeBlockchain();

