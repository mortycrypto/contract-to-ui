import logo from "./logo.svg";
import "./App.css";
import SearchBar from "./components/SearchBar";
import { Container, Spinner } from "react-bootstrap";
import ContractToUI from "./components/ContractToUI";
import { useAddressContext } from "./contexts/AddressContext";

// Ejemplo: 0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82 BSC (Cake token).

function App() {
	const { searching } = useAddressContext();

	return (
		<Container>
			<div className='App'>
				<header className='App-header'>
					<img src={logo} className='App-logo' alt='logo' />
					<p>Contract to UI</p>
					<SearchBar />
					{searching && <Spinner animation='grow' variant='light' />}
					<ContractToUI />
				</header>
			</div>
		</Container>
	);
}

export default App;
