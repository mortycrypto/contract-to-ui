import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { Button, Card, Form, Row, Tab, Tabs } from "react-bootstrap";
import abi from "../abi.json";
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
	const { msg, setMsg } = useMsgContext();

	const { searching, address, validAddress, setSearching } = useAddressContext();
	const { account } = useAccountContext();

	useEffect(() => {
		if (!searching) return;
		let disposed = false;

		if (account && address && validAddress) {
			(async () => {
				if (disposed) return;
				const _provider = new ethers.providers.Web3Provider(window["ethereum"]);
				const signer = _provider.getSigner();
				const _contract = new ethers.Contract(address, abi, signer);

				setSearching(false);
				setContract(_contract);
			})();
		}

		return () => {
			disposed = true;
		};
	}, [account, searching, address, validAddress, setSearching]);

	useEffect(() => {
		let disposed = false;

		if (contract) {
			(async () => {
				if (disposed) return;

				const methods = abi.filter((m) => m["type"] !== "event");

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

		return () => {
			disposed = true;
		};
	}, [contract]);

	const handleOnChange = (method: string, index: number, value: string) => {
		const newObj: ContractInfo = { ...results };
		newObj[method].values[index] = value;
		setResults(newObj);
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
				setMsg({
					text: error["message"] || "",
					type: TypeMsg.Error,
					show: true,
				});
			}
		})();
	};

	const Method = ({ name, id: idx, buttonText }): JSX.Element => {
		if (!results) return <></>;

		const data = results[name];
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
	};

	return (
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
								return <Method name={m["name"]} id={idx} buttonText='WRITE CONTRACT' key={idx * 100} />;
							})}
					</Tab>
				</Tabs>
			)}
		</Row>
	);
};

export default ContractToUI;
