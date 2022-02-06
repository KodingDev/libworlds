import BlockchainManager from "../blockchain/BlockchainManager";
import fetch from "cross-fetch";

export class GaslessTransferContract {
  private readonly manager: BlockchainManager;

  constructor(manager: BlockchainManager) {
    this.manager = manager;
  }

  async send(toAddress: string, amount: number) {
    const amountToSend = this.manager.getTokenDecimalAmount(amount);
    const executeData = await this.manager.signPolygonForwarderRequest("transferWithFee", [toAddress, amountToSend]);
    const executeResult = await fetch("https://forwarding.nftworlds.com/execute", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(executeData)
    });

    if (executeResult.status !== 200) {
      throw new Error(`Failed to execute transaction: ${await executeResult.text()}`);
    }

    return await executeResult.text();
  }
}