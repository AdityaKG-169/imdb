import React from "react";
import { Route, Switch } from "react-router-dom";
import Navbar from "./Components/Navbar/Navbar";
import "./App.css";
import PageNotFound from "./Pages/PageNotFound/PageNotFound";
import { auth } from "./firebase/firebase";

class App extends React.Component {
	constructor() {
		super();
		this.state = {
			currentUser: null,
		};
	}

	isUserThere = false;

	componentDidMount() {
		const token = window.localStorage.getItem("token");
		auth.onAuthStateChanged((user) => {
			if (!user) this.setState({ currentUser: null });
			this.isUserThere = user ? true : false;
			if (this.isUserThere) {
				if (token) window.localStorage.removeItem("token");
				const { email, uid } = user;
				const googleId = uid;
				fetch("https://courses-imdb-backend.herokuapp.com/user", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ email, googleId }),
				})
					.then((response) => response.json())
					.then((data) => {
						this.setState(
							{
								currentUser: true,
							},
							() => {
								if (data.message) alert(data.message);
								if (data.error) {
									alert(data.error);
									return;
								}
								window.localStorage.setItem("token", data.token);
							}
						);
					});
			} else {
				if (token) {
					window.localStorage.removeItem("token");
				} else {
					return;
				}
			}
		});
	}

	componentWillUnmount() {
		this.isUserThere = false;
	}

	render() {
		return (
			<div className="App">
				<Navbar user={this.state.currentUser} />
				<Switch>
					<Route component={PageNotFound} path="*" />
				</Switch>
			</div>
		);
	}
}
export default App;
