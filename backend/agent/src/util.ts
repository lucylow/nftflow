import { ethers } from "ethers";

/**
 * Helper to encode a call for proposeArbitrage usage.
 * @param target address
 * @param iface ethers.Interface of the target contract
 * @param functionName function name
 * @param params parameters array
 * @param value native value in wei (string or BigNumber)
 */
export function encodeCall(target: string, iface: ethers.Interface, functionName: string, params: any[], value = "0") {
  const data = iface.encodeFunctionData(functionName, params);
  return {
    target,
    value: ethers.BigInt(value).toString(),
    data
  };
}
