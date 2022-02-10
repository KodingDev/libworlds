import { BigNumber, ethers } from "ethers";
import forwarderAbiPolygon from "../abi/Forwarder_Polygon.json";
import wrldAbiPolygon from "../abi/WRLD_Token_Polygon.json";
import { TypedDataSigner } from "@ethersproject/abstract-signer/src.ts";
import { WRLDContract } from "../contract/WRLD";
import { GaslessTransferContract } from "../contract/GaslessTransferContract";

export type ChainName = "matic" | string;

export const tokenContractAddresses: Record<ChainName, string> = {
  matic: "0xD5d86FC8d5C0Ea1aC1Ac5Dfab6E529c9967a45E9"
};

export const polygonForwarderContractAddresses: Record<ChainName, string> = {
  matic: "0x7fE3AEDfC76D7C6DD84b617081A9346DE81236DC"
};

interface Chain {
  id: ChainName;
  name: string;
  chainId: number;
  rpc: string;
}

export const chains: Record<ChainName, Chain> = {
  matic: {
    id: "matic",
    name: "Polygon Mainnet",
    chainId: 137,
    rpc: "https://polygon-mainnet.g.alchemy.com/v2/ZZhQH1Yt3EHggV-mBfVGZTrIy9o5XT9M"
  }
};

export const getProvider = (chain: ChainName): ethers.providers.Provider => {
  return new ethers.providers.JsonRpcProvider(chains[chain].rpc);
};

export default class BlockchainManager {
  private readonly signer: ethers.Signer;
  private chain: Chain;

  constructor(signer: ethers.Signer, chain: Chain) {
    this.signer = signer;
    this.chain = chain;
  }

  async getPolygonForwarderContract() {
    return new ethers.Contract(
      polygonForwarderContractAddresses[this.chain.id],
      forwarderAbiPolygon,
      this.signer
    );
  }

  async getWRLDContract() {
    return new ethers.Contract(
      tokenContractAddresses[this.chain.id],
      wrldAbiPolygon,
      this.signer
    );
  }

  async getWrappedWRLDContract() {
    return new WRLDContract(await this.getWRLDContract());
  }

  async getWrappedGaslessTransferContract() {
    return new GaslessTransferContract(this);
  }

  async signMessage(message: string) {
    return this.signer.signMessage(message);
  }

  // method: transferWithFee
  async signPolygonForwarderRequest(method, args) {
    const wrldContract = await this.getWRLDContract();
    const forwarderContract = await this.getPolygonForwarderContract();

    const fromAddress = await this.signer.getAddress();
    const gasEstimate = await wrldContract.estimateGas[method](...args);
    const forwarderNonce = await forwarderContract.getNonce(fromAddress);
    const callData = wrldContract.interface.encodeFunctionData(method, args);

    const forwardRequest = {
      from: fromAddress,
      to: wrldContract.address,
      value: BigNumber.from(0),
      gas: gasEstimate,
      nonce: forwarderNonce,
      data: callData
    };

    const domain = {
      chainId: this.chain.chainId,
      name: "WRLD_Forwarder_Polygon",
      verifyingContract: forwarderContract.address,
      version: "1.0.0"
    };

    const types = {
      ForwardRequest: [
        { name: "from", type: "address" },
        { name: "to", type: "address" },
        { name: "value", type: "uint256" },
        { name: "gas", type: "uint256" },
        { name: "nonce", type: "uint256" },
        { name: "data", type: "bytes" }
      ]
    };

    const signature = await (this.signer as unknown as TypedDataSigner)._signTypedData(domain, types, forwardRequest);

    const serializedForwardRequest = {
      ...forwardRequest,
      gas: forwardRequest.gas.toHexString(),
      nonce: forwardRequest.nonce.toHexString(),
      value: forwardRequest.value.toHexString()
    };

    return {
      serializedForwardRequest,
      signature
    };
  }

  keccak256(input) {
    const normalizedInput = ethers.utils.toUtf8Bytes(input);
    return ethers.utils.keccak256(normalizedInput);
  }

  getTokenDecimalAmount(amount) {
    return BigNumber.from(BigInt(amount * 1e18));
  }
}