import React from "react";
import "./bodysearchbox.css";

class BodySearchbox extends React.Component {
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
			<div className="hero-section__search-container">
				{console.log(this.state)}
				<p className="search-container__heading">
					Study From Best Rated Courses!
				</p>
				<p className="search-container__sub-heading">
					Search for courses using keywords, domain, platform
				</p>
				<input
					className="form-control mr-sm-2"
					type="text"
					onChange={this.handleSearchChange}
					placeholder="Search"
				/>
				<p className="search-container__add-course">
					Completed A Course? Add it{" "}
					<span className="add-course__text-link" onClick={this.addCourse}>
						here
					</span>
				</p>
			</div>
		);
	}
}

export default BodySearchbox;
