import React from "react";

class Addcourse extends React.Component {
	constructor() {
		super();
		this.state = {
			inList: true,
			domains: [],
			subDomains: [],
			domain: "",
			subdomain: "",
			name: "",
			link: "",
			platform: "",
		};
	}

	componentDidMount() {
		fetch("http://localhost:9090/courses/domains")
			.then((response) => response.json())
			.then((data) => {
				return this.setState({
					domains: data.message,
				});
			});
	}

	handleChange = (event) => {
		const { name, value } = event.target;

		if (name === "domain") {
			if (value !== "notInList") {
				this.setState(
					{
						domain: value,
					},
					() => {
						fetch(
							`http://localhost:9090/courses/subdomains/:{this.state.domain}`
						)
							.then((response) => response.json())
							.then((data) => {
								return this.setState({
									subDomains: data.message,
								});
							});
					}
				);
			} else {
				this.setState({
					inList: false,
				});
			}
		}
		this.setState({
			[name]: value,
		});
	};

	handleSubmit = () => {
		fetch("http://localhost:8080/course", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				authorization: window.localStorage.getItem("token"),
			},
			body: JSON.stringify(this.state),
		})
			.then((response) => response.json())
			.then((data) => console.log(data));
	};

	render() {
		let onlyUnique = (value, index, self) => {
			return self.indexOf(value) === index;
		};
		let allDomains = this.state.domains.map((i, j) => {
			return i.domain;
		});

		let allSubDomains = this.state.subDomains.map((i, j) => {
			return i.subDomain;
		});

		let filteredDomains = allDomains.filter(onlyUnique);

		let filteredSubDomains = allSubDomains.filter(onlyUnique);

		return (
			<div>
				<h1>Please add a new Course</h1>
				<label htmlFor="exampleInputEmail1">Course Name</label>
				<input
					type="text"
					className="form-control"
					aria-describedby="emailHelp"
					placeholder="Enter Course Name"
					name="name"
					value={this.state.name}
					onChange={this.handleChange}
				/>
				<label htmlFor="exampleInputEmail1">Course Link</label>
				<input
					type="text"
					className="form-control"
					aria-describedby="emailHelp"
					placeholder="Enter Course Link"
					name="link"
					value={this.state.link}
					onChange={this.handleChange}
				/>
				<label htmlFor="exampleInputEmail1">Course Platform</label>
				<input
					type="text"
					className="form-control"
					aria-describedby="emailHelp"
					placeholder="Enter Course Platform"
					name="platform"
					value={this.state.platform}
					onChange={this.handleChange}
				/>
				{filteredDomains.map((i, j) => {
					return (
						<div>
							<input
								type="radio"
								name="domain"
								value={i}
								key={j}
								onChange={this.handleChange}
							/>
							{i}
						</div>
					);
				})}

				{this.state.inList ? (
					<input
						type="text"
						className="form-control"
						aria-describedby="emailHelp"
						placeholder="Enter Course Platform"
						name="domain"
						value={this.state.domain}
						onChange={this.handleChange}
					/>
				) : (
					<div>
						<input
							type="radio"
							name="domain"
							value="notInList"
							onChange={this.handleChange}
						/>
						Domain Not In List
					</div>
				)}
				{filteredSubDomains.map((i, j) => {
					return (
						<div>
							<input
								type="radio"
								name="subDomain"
								value={i}
								key={j}
								onChange={this.handleChange}
							/>
							{i}
						</div>
					);
				})}
				<button onClick={this.handleSubmit}>Submit</button>
			</div>
		);
	}
}

export default Addcourse;
