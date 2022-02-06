import { ethers } from "ethers";

const url = "https://polygon-mainnet.g.alchemy.com/v2/mmmzo_uwLk9un9rJNrM0n1-ZOPUpVRKl";
export const provider = new ethers.providers.JsonRpcProvider(url);