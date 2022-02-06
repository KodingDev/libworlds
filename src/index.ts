import { ethers } from "ethers";
import config from "../config.json";
import { provider } from "./blockchain/wallet";
import BlockchainManager, { chains } from "./blockchain/BlockchainManager";

const main = async () => {
  const wallet = new ethers.Wallet(config.privateKey, provider);
  const blockchainManager = new BlockchainManager(wallet, chains.matic);
  const gaslessTransfer = await blockchainManager.getWrappedGaslessTransferContract();

  console.log("Beginning transfer");
  const result = await gaslessTransfer.send("0x426c8DCD3Bdcc64135Af3584B4AeF8D5dF4cCe3f", 2);
  console.log(`Transfer result: ${result}`);
};

main().catch(console.error);