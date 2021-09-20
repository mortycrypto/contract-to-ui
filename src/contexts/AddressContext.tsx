import { createContext, useContext, useEffect, useState } from "react";

interface IAddressContext {
	address: string;
	setAddress: React.Dispatch<React.SetStateAction<string>>;
	validAddress: boolean;
	setValidAddress: React.Dispatch<React.SetStateAction<boolean>>;
	searching: boolean;
	setSearching: React.Dispatch<React.SetStateAction<boolean>>;
}

export const AddressContext = createContext({} as IAddressContext);
export const useAddressContext = () => useContext(AddressContext);

const Provider = ({ children }) => {
	const [address, setAddress] = useState("");
	const [validAddress, setValidAddress] = useState(false);
	const [searching, setSearching] = useState(false);

	useEffect(() => {
		if (address.length < 3) return;

		if (!address.startsWith("0x")) {
			setAddress("0x" + address);
			return;
		}

		setValidAddress(address.startsWith("0x") && address.length === 42);
	}, [address]);

	const value = { address, setAddress, validAddress, setValidAddress, searching, setSearching };

	return <AddressContext.Provider value={value}>{children}</AddressContext.Provider>;
};

const obj = {
	Provider,
	Consumer: AddressContext.Consumer,
};

export default obj;
