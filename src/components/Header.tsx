import "../App.css";
import { useAccountContext } from "../contexts/AccountContext";
import logo from "../logo.svg";
import SearchBar from "./SearchBar";

const Header = () => {
	const { account } = useAccountContext();
	return (
		<header className='App-header'>
			<img src={logo} className='App-logo' alt='logo' />
			<p>Contract to UI</p>
			<p>Current Account: {account}</p>
			<SearchBar />
		</header>
	);
};

export default Header;
