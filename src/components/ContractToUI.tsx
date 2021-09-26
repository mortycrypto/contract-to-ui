import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { Button, Card, Form, FormControl, InputGroup, Row, Tab, Tabs } from "react-bootstrap";
import { useAccountContext } from "../contexts/AccountContext";
import { useAddressContext } from "../contexts/AddressContext";
import { useMsgContext, TypeMsg } from "../contexts/MsgContext";

interface Param {
	name: string;
	type: string;
}

interface ContractInfo {
	[method: string]: {
		type: string;
		params: Param[];
		values: string[];
		result: any | undefined;
	};
}

const ContractToUI = () => {
	const [contract, setContract]: [
		contract: ethers.Contract | undefined,
		setContract: React.Dispatch<React.SetStateAction<ethers.Contract | undefined>>
	] = useState();
	const [results, setResults]: [
		results: ContractInfo | undefined,
		setResults: React.Dispatch<React.SetStateAction<ContractInfo | undefined>>
	] = useState();
	const [abi, setAbi] = useState([] as any[]);
	const { setMsg } = useMsgContext();
	const { searching, address, validAddress, setSearching, setAddress } = useAddressContext();
	const { account } = useAccountContext();
	const [loadAnotherAbi, setLoadAnotherAbi] = useState(false);

	const showError = (msg: any) => {
		if (msg.show) return;

		const _msg = msg["message"] || msg;

		const _info = {
			show: true,
			text: JSON.stringify(_msg),
			type: TypeMsg.Error,
		};
		setMsg(_info);
	};

	useEffect(() => {
		if (!searching) return;
		let disposed = false;

		try {
			if (account && address && validAddress) {
				localStorage.setItem("contract-to-ui:address", address);
				(async () => {
					if (disposed) return;
					const _provider = new ethers.providers.Web3Provider(window["ethereum"]);
					const signer = _provider.getSigner();
					const _contract = new ethers.Contract(address, abi, signer);

					setSearching(false);
					setContract(_contract);
				})();
			}
		} catch (error: any) {
			showError(error);
		}

		return () => {
			disposed = true;
		};

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [account, searching, address, validAddress, setSearching, abi]);

	useEffect(() => {
		let disposed = false;

		try {
			if (contract) {
				if (abi.length > 0) localStorage.setItem("contract-to-ui:abi", JSON.stringify(abi));
				setLoadAnotherAbi(false);
				(async () => {
					if (disposed) return;

					const methods = abi.filter((m) => m["type"] !== "event" && m["inputs"]);

					const newObj: ContractInfo = {};

					methods.forEach((m) => {
						const method = m["name"] as string;

						newObj[method] = {
							type: m["stateMutability"] as string,
							params: m["inputs"].map(
								(i: object) =>
									({
										name: i["name"] as string,
										type: i["type"] as string,
									} as Param)
							),
							values: m["inputs"].map((_i: any) => "") as string[],
							result: undefined,
						};
					});

					for await (const m of methods) {
						const value = m["name"];
						if (newObj[value].params.length === 0 && newObj[value].type === "view") {
							newObj[value].result = (await contract[value]()).toString();
						}
					}

					setResults(newObj);
				})();
			}
		} catch (error: any) {
			showError(error);
		}

		return () => {
			disposed = true;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [contract]);

	useEffect(() => {
		try {
			const _abi = localStorage.getItem("contract-to-ui:abi") || "";
			const _address = localStorage.getItem("contract-to-ui:address") || "";

			if (_abi !== "") {
				setAbi(JSON.parse(_abi));
			} else {
				setLoadAnotherAbi(true);
			}

			if (_address !== "") setAddress(_address);
		} catch (error: any) {
			showError(error);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleOnChange = (method: string, index: number, value: string) => {
		try {
			const newObj: ContractInfo = { ...results };
			newObj[method].values[index] = value;
			setResults(newObj);
		} catch (error: any) {
			showError(error);
		}
	};

	const handleOnClick = async (name: string) => {
		if (!contract) return;
		(async () => {
			try {
				const newObj: ContractInfo = { ...results };
				const resp = await contract[name].apply(null, newObj[name].values);
				newObj[name].result = resp.toString();
				setResults(newObj);
				setMsg({
					text: resp.toString(),
					type: TypeMsg.Info,
					show: true,
				});
			} catch (error: any) {
				showError(error);
			}
		})();
	};

	const Method = ({ name, id: idx, buttonText }): JSX.Element => {
		if (!results) return <></>;

		try {
			const data = results[name];

			if (!data) throw new Error("Verifique el Abi cargado");
			return (
				<Row key={`${idx}:${name}:${buttonText}`}>
					<Card bg='dark'>
						<Card.Header>{name}</Card.Header>
						<Card.Body>
							{data.params.length > 0 && (
								<>
									{data.params.map((d, i) => (
										<Form.Control
											key={`${idx}:${name}:${Math.random()}`}
											type='text'
											name={`${d.type}-${d.name}`}
											placeholder={`${d.name} (${d.type})`}
											style={{ marginBottom: "15px" }}
											value={data.values[i]}
											onChange={(v) => handleOnChange(name, i, v.currentTarget.value)}
										/>
									))}
									<Button variant='primary' size='sm' onClick={() => handleOnClick(name)}>
										{buttonText}
									</Button>
								</>
							)}
							<hr />
							<Card.Text>Result: {data.result || ""}</Card.Text>
						</Card.Body>
					</Card>
				</Row>
			);
		} catch (error) {
			showError(error);
			return <></>;
		}
	};

	return (
		<>
			<Row style={{ marginBottom: "15px" }}>
				{!loadAnotherAbi ? (
					<Button variant={"success"} onClick={() => setLoadAnotherAbi(true)} size='sm'>
						LOAD ANOTHER ABI FILE
					</Button>
				) : (
					<InputGroup className='mb-3'>
						<FormControl
							placeholder='ABI (Json File)'
							aria-label='ABI (Json File)'
							type='file'
							onChange={(e) => {
								const fileReader = new FileReader();
								fileReader.readAsText(e.target["files"][0], "UTF-8");
								fileReader.onload = (e) => {
									const obj: object = JSON.parse((e.target?.result || "[]") as string);

									const _abi = obj ? obj["abi"] : obj;

									setAbi(_abi);
								};
							}}
							autoFocus={true}
						/>
					</InputGroup>
				)}
			</Row>
			<Row>
				{results && (
					<Tabs defaultActiveKey='readeables' id='tab' className='mb-3'>
						<Tab eventKey='readeables' title='Read'>
							{abi
								.filter((m) => m["type"] === "function" && m["stateMutability"] === "view")
								.map((m, idx) => (
									<Method name={m["name"]} id={idx} buttonText='READ CONTRACT' key={idx} />
								))}
						</Tab>
						<Tab eventKey='writeables' title='Write'>
							{abi
								.filter((m) => m["type"] === "function" && m["stateMutability"] !== "view")
								.map((m, idx) => {
									return (
										<Method name={m["name"]} id={idx} buttonText='WRITE CONTRACT' key={idx * 100} />
									);
								})}
						</Tab>
					</Tabs>
				)}
			</Row>
		</>
	);
};

export default ContractToUI;
