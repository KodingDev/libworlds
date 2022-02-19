import { BigNumber, ethers } from "ethers";

export class WRLDContract {
  private readonly contract: ethers.Contract;

  constructor(contract: ethers.Contract) {
    this.contract = contract;
  }

  async getBalance(address: string): Promise<BigNumber> {
    return this.contract.balanceOf(address);
  }

  // noinspection JSUnusedGlobalSymbols
  async getBalanceString(address: string) {
    return ethers.utils.formatEther(await this.getBalance(address));
  }
}