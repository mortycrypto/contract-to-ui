import { ethers } from "ethers";
import { Network } from "./config";

export class RPCConnection {
    private url: string;

    private constructor(network: Network) {
        this.url = network;
    }

    private connect(): ethers.providers.JsonRpcProvider {
        return new ethers.providers.JsonRpcProvider(this.url);
    }

    public static new(network: Network): ethers.providers.JsonRpcProvider {
        return (new RPCConnection(network)).connect();
    }
}