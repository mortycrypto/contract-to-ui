import React, { useEffect, useState } from "react";
import { FormControl, InputGroup, Col, Row, Toast, Button, ToastContainer } from "react-bootstrap";
import AddressContext, { useAddressContext } from "../contexts/AddressContext";
import RPCProviderContext, { useRPCProvierContext } from "../contexts/RPCProviderContext";

const SearchBar = () => {
	const [addr, setAddr] = useState("");
	const { setSearching, searching, validAddress, setAddress } = useAddressContext();
	const { provider } = useRPCProvierContext();

	const [isContract, setIsContract] = useState(true);

	const [showErrorMsg, toggleShowErrorMsg] = useState(false);

	useEffect(() => {
		if (!searching) return;
		toggleShowErrorMsg(!isContract && validAddress);
		setSearching(false);
	}, [searching, isContract, validAddress, setSearching]);

	const onClick = async (address: string) => {
		const valid: boolean = await validAddressFormat(address);
		setAddress(addr);
		setSearching(true);
		setIsContract(valid);
	};

	const validAddressFormat = async (address: string): Promise<boolean> => {
		return await _isContract(address);
	};

	const _isContract = async (address: string): Promise<boolean> => {
		const res = await provider.getCode(address);
		return res !== "0x" && res !== "0x0";
	};

	return (
		<RPCProviderContext.Consumer>
			{({ blockNumber, provider }) => {
				return (
					<AddressContext.Consumer>
						{({ address, setAddress, validAddress, searching }) => {
							return (
								<React.Fragment>
									<InputGroup className='mb-3'>
										<FormControl
											placeholder='Contract Address'
											aria-label='Contract'
											value={addr}
											onChange={(e) => setAddr(e.target.value)}
											autoFocus={true}
										/>
										<Button
											variant={"primary"}
											onClick={() => onClick(addr)}
											disabled={addr.length < 42}
										>
											{searching ? "PROCESSING..." : "PROCESS"}
										</Button>
									</InputGroup>
									<Row>
										<Col xs={6}>
											<ToastContainer position={"top-end"}>
												<Toast
													show={showErrorMsg}
													onClose={() => toggleShowErrorMsg(!showErrorMsg)}
													delay={6000}
													autohide
													bg={"danger"}
												>
													<Toast.Header>
														<small>An error has occurred. See details below</small>
													</Toast.Header>
													<Toast.Body>
														The Address doesn't correspond to a valid contract. Confirm that
														the address and network are correct.
													</Toast.Body>
												</Toast>
											</ToastContainer>
										</Col>
									</Row>
								</React.Fragment>
							);
						}}
					</AddressContext.Consumer>
				);
			}}
		</RPCProviderContext.Consumer>
	);
};

export default SearchBar;
