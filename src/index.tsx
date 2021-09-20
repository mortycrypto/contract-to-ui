import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
// Importing the Bootstrap CSS
import "bootstrap/dist/css/bootstrap.min.css";

import RPCProviderContext from "./contexts/RPCProviderContext";
import AddressContext from "./contexts/AddressContext";

ReactDOM.render(
	<React.StrictMode>
		<RPCProviderContext.Provider>
			<AddressContext.Provider>
				<App />
			</AddressContext.Provider>
		</RPCProviderContext.Provider>
	</React.StrictMode>,
	document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
