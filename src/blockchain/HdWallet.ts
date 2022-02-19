import { ethers } from "ethers";
import KeyringController from "eth-keyring-controller";

export class HdWallet {
  private readonly keyringController;
  private readonly password: string;

  constructor(password?: string) {
    this.keyringController = new KeyringController({
      encryptor: {
        encrypt: (text: string) => text,
        decrypt: (text: string) => text
      }
    });
    this.password = password || "";
  }

  public async loadMnemonic(mnemonic: string) {
    await this.keyringController.createNewVaultAndRestore(this.password, mnemonic);
  }

  public async createAccounts(amount: number) {
    for (let i = 0; i < amount; i++) {
      await this.keyringController.addNewAccount(this.keyring);
    }
  }

  public async getAccount(index: number) {
    const address = (await this.keyringController.getAccounts())[index];
    const privateKey = await this.keyringController.exportAccount(address);
    return new HdAccount(address, privateKey);
  }

  private get keyring() {
    return this.keyringController.getKeyringsByType(
      "HD Key Tree"
    )[0];
  }

}

export class HdAccount {
  private readonly privateKey: string;
  readonly address: string;

  constructor(address: string, privateKey: string) {
    this.address = address;
    this.privateKey = privateKey;
  }

  public toWallet(provider?: ethers.providers.Provider) {
    return new ethers.Wallet(this.privateKey, provider);
  }
}