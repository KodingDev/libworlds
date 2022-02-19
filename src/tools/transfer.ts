import { HdWallet } from "../blockchain/HdWallet";
import BlockchainManager, { chains, getProvider } from "../blockchain/BlockchainManager";
import config from "../../config.json";

const main = async () => {
  const provider = getProvider("matic");

  console.log("[SYSTEM] Generating wallets...");
  const hdWallet = new HdWallet();
  await hdWallet.loadMnemonic(config.mnemonic);
  await hdWallet.createAccounts(config.count);

  let total = 0;
  const target = await hdWallet.getAccount(0).then(account => account.address);

  for (let i = 1; i <= config.count; i++) {
    const account = await hdWallet.getAccount(i);
    const wallet = account.toWallet(provider);
    console.log(`[${i}] ${wallet.address}`);

    const blockchainManager = new BlockchainManager(wallet, chains.matic);
    const wrld = await blockchainManager.getWrappedWRLDContract();
    const gaslessTransfer = await blockchainManager.getWrappedGaslessTransferContract();

    const balanceStr = await wrld.getBalanceString(wallet.address);
    const balance = parseInt(balanceStr, 10);

    console.log(`[${i}] $WRLD Balance: ${balanceStr}`);
    if (balance < 2) {
      console.log(`[${i}] Insufficient balance, skipping...`);
      continue;
    }

    console.log(`[${i}] Transferring ${balanceStr} to ${target}`);
    total += balance;
    await gaslessTransfer.send(target, balance);
  }

  console.log(`[SYSTEM] Done! Sent ${total} $WRLD to ${target}`);
};

main().catch(console.error);