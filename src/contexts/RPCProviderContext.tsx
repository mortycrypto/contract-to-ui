import { createContext, useContext, useEffect, useState } from "react";
import { Network } from "../utils/config";
import { RPCConnection } from "../utils/RPCConnection";
import { ethers } from "ethers";

interface IRPCProviderContext {
	network: Network;
	setNetwork: React.Dispatch<React.SetStateAction<Network>>;
	networkString: string;
	setNetworkString: React.Dispatch<React.SetStateAction<string>>;
	provider: ethers.providers.JsonRpcProvider;
	setProvider: React.Dispatch<React.SetStateAction<ethers.providers.JsonRpcProvider>>;
	blockNumber: number;
	setBlockNumber: React.Dispatch<React.SetStateAction<number>>;
}

export const RPCProviderContext = createContext({} as IRPCProviderContext);
export const useRPCProvierContext = () => useContext(RPCProviderContext);

const Provider = ({ children }: any) => {
	const [network, setNetwork] = useState(Network.BSC);
	const [networkString, setNetworkString] = useState("BSC");
	const [provider, setProvider] = useState(RPCConnection.new(Network.BSC));
	const [blockNumber, setBlockNumber] = useState(0);

	useEffect(() => {
		setProvider(RPCConnection.new(network));
		let str = "";

		switch (network) {
			case Network.BSC:
				str = "BSC";
				break;
			case Network.POLYGON:
				str = "POLYGON";
				break;
			case Network.FTM:
				str = "FTM";
				break;
			default:
				break;
		}

		setNetworkString(str);
	}, [network]);

	useEffect(() => {
		(async () => {
			setBlockNumber(0);
			setBlockNumber(await provider.getBlockNumber());
		})();
	}, [provider]);

	const value = {
		network,
		setNetwork,
		networkString,
		setNetworkString,
		provider,
		setProvider,
		blockNumber,
		setBlockNumber,
	};

	return <RPCProviderContext.Provider value={value}>{children}</RPCProviderContext.Provider>;
};

const obj = {
	Provider,
	Consumer: RPCProviderContext.Consumer,
};

export default obj;
