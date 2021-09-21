import { createContext, useContext, useEffect, useState } from "react";

export enum TypeMsg {
	Error = "danger",
	Info = "primary",
}

export interface Msg {
	text: string;
	type: TypeMsg;
	show: boolean;
}

interface IMsgContext {
	msg: Msg;
	setMsg: React.Dispatch<React.SetStateAction<Msg>>;
}

export const MsgContext = createContext({} as IMsgContext);
export const useMsgContext = () => useContext(MsgContext);

const Provider = ({ children }) => {
	const [msg, setMsg]: [msg: Msg, setMsg: React.Dispatch<React.SetStateAction<Msg>>] = useState({
		text: "",
		type: TypeMsg.Info,
		show: false,
	} as Msg);

	const value = { msg, setMsg };

	return <MsgContext.Provider value={value}>{children}</MsgContext.Provider>;
};

const obj = {
	Provider,
	Consumer: MsgContext.Consumer,
};

export default obj;
