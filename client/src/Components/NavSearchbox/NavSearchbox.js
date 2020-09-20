import React from "react";

class NavSearchbox extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			searches: [],
		};
	}

	handleSearchChange = (event) => {
		const controller = new AbortController();
		const signal = controller.signal;

		// controller.abort();

		if (event.target.value.length < 1) {
			return this.setState({
				searches: [],
			});
		}
		if (event.target.value.length < 3 && event.target.value.length > 0) {
			return this.setState({
				searches: [{ name: "Please Enter More than 2 Letters" }],
			});
		}
		fetch(
			`https://courses-imdb-backend.herokuapp.com/course/${event.target.value}`,
			{
				method: "GET",
				signal: signal,
			}
		)
			.then((response) => response.json())
			.then((data) => {
				this.setState({ searches: data });
			})
			.catch((err) => console.log(err.response));
	};

	render() {
		return (
			<ul className="navbar-nav mr-auto">
				<li className="nav-item active">
					<input
						className="form-control mr-sm-2"
						type="text"
						onChange={this.handleSearchChange}
						placeholder="Search"
					/>
				</li>
			</ul>
		);
	}
}

export default NavSearchbox;
