import React from "react";
import BodySearchbox from "../../Components/BodySearchbox/BodySearchbox";
import "./homepage.css";

class Homepage extends React.Component {
	constructor() {
		super();
		this.state = {};
	}

	render() {
		return (
			<div className="homepage">
				<section className="homepage__hero-section">
					<BodySearchbox />
				</section>
			</div>
		);
	}
}

export default Homepage;
