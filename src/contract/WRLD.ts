import { ethers } from "ethers";

export class WRLDContract {
  private readonly contract: ethers.Contract;

  constructor(contract: ethers.Contract) {
    this.contract = contract;
  }

  async getBalance(address: string) {
    return this.contract.balanceOf(address);
  }

  async getBalanceString(address: string) {
    return ethers.utils.formatEther(await this.getBalance(address));
  }
}