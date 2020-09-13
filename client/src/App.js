import React from "react";
import { Route, Switch } from "react-router-dom";
import Navbar from "./Components/Navbar/Navbar";
import "./App.css";
import PageNotFound from "./Pages/PageNotFound/PageNotFound";
import { signInWithGoogle, auth } from "./firebase/firebase";

class App extends React.Component {
	constructor() {
		super();
		this.state = {
			currentUser: null,
		};
	}

	componentDidMount() {
		console.log(this.state);
	}

	handleLogin = () => {
		signInWithGoogle();
		auth.onAuthStateChanged((user) => {
			if (user) {
				const { email, uid } = user;
				this.setState(
					{
						currentUser: [email, uid],
					},
					() => console.log(this.state)
				);
			} else {
				this.setState({
					currentUser: null,
				});
			}
		});
	};

	render() {
		return (
			<div className="App">
				<Navbar login={() => this.handleLogin()} />
				<Switch>
					<Route component={PageNotFound} path="*" />
				</Switch>
			</div>
		);
	}
}
export default App;
