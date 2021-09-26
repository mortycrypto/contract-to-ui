import "./App.css";
import { Container, Spinner, Toast, ToastContainer } from "react-bootstrap";
import ContractToUI from "./components/ContractToUI";
import { useAddressContext } from "./contexts/AddressContext";
import Header from "./components/Header";
import { useMsgContext } from "./contexts/MsgContext";

// Ejemplo: 0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82 BSC (Cake token).

function App() {
	const { searching } = useAddressContext();
	const { msg, setMsg } = useMsgContext();

	return (
		<div className='App'>
			<Container>
				<Header />
				<ToastContainer position={"top-end"}>
					<Toast
						show={msg.show}
						bg={msg.type}
						delay={5000}
						autohide
						onClose={() => setMsg({ ...msg, ...{ text: "", show: false } })}
					>
						<Toast.Body>{msg.text}</Toast.Body>
					</Toast>
				</ToastContainer>
				{searching && <Spinner animation='grow' variant='light' />}
				<ContractToUI />
			</Container>
		</div>
	);
}

export default App;
