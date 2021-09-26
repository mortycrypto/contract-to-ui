import React, { createContext, useContext, useEffect, useState } from "react";
import { useMsgContext, TypeMsg } from "./MsgContext";

interface IAccountContext {
	account: string;
	setAccount: React.Dispatch<React.SetStateAction<string>>;
}

export const AccountContext = createContext({} as IAccountContext);
export const useAccountContext = () => useContext(AccountContext);

const Provider = ({ children }) => {
	const { setMsg } = useMsgContext();
	const [account, setAccount] = useState("");

	useEffect(() => {
		console.log(window["ethereum"]);
		if (!window["ethereum"]) return;

		let disposed = false;

		(async () => {
			if (disposed) return;
			await connectAccount();

			window["ethereum"].on("accountsChanged", async function (accounts) {
				await connectAccount();
			});
		})();

		return () => {
			disposed = true;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const connectAccount = async () => {
		try {
			const accounts: string[] = await window["ethereum"].request({ method: "eth_requestAccounts" });
			setAccount(accounts[0]);
		} catch (error: any) {
			console.log(error);
			setMsg({
				text: error["message"] || error,
				type: TypeMsg.Error,
				show: true,
			});
		}
	};

	return <AccountContext.Provider value={{ account, setAccount }}>{children}</AccountContext.Provider>;
};

const obj = {
	Provider,
	Consumer: AccountContext.Consumer,
};

export default obj;
