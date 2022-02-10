import { ethers } from "ethers";
import config from "../config.json";
import BlockchainManager, { chains, getProvider } from "./blockchain/BlockchainManager";

// Example
const main = async () => {
  const provider = getProvider("matic");
  const wallet = new ethers.Wallet(config.privateKey, provider);

  const blockchainManager = new BlockchainManager(wallet, chains.matic);
  const wrld = await blockchainManager.getWrappedWRLDContract();
  const gaslessTransfer = await blockchainManager.getWrappedGaslessTransferContract();

  console.log(`Current balance: ${await wrld.getBalanceString(wallet.address)}`);

  console.log("[TRANSFER] Beginning transfer");
  const result = await gaslessTransfer.send("0xc986ad0ff7A752456a8E671b423868518fe8B833", 2);
  console.log(`[TRANSFER] Result: ${result}`);

  console.log(`Balance after transfer: ${await wrld.getBalanceString(wallet.address)}`);
};

main().catch(console.error);