import React from "react";
import { auth } from "../../firebase/firebase";

const Navbar = (props) => {
	return (
		<nav className="navbar navbar-expand-lg navbar-light bg-light">
			<a className="navbar-brand" href="#">
				Navbar
			</a>
			<button
				className="navbar-toggler"
				type="button"
				data-toggle="collapse"
				data-target="#navbarColor03"
				aria-controls="navbarColor03"
				aria-expanded="false"
				aria-label="Toggle navigation"
			>
				<span className="navbar-toggler-icon"></span>
			</button>

			<div className="collapse navbar-collapse" id="navbarColor03">
				<ul className="navbar-nav mr-auto">
					<li className="nav-item active">
						<form className="form-inline my-2 my-lg-0">
							<input
								className="form-control mr-sm-2"
								type="text"
								placeholder="Search"
							/>
						</form>
					</li>
				</ul>
				<button type="button" className="btn btn-outline-success">
					Add A Course
				</button>
				<button
					type="button"
					className="btn btn-primary"
					onClick={() => props.login()}
				>
					Login
				</button>
				<button
					type="button"
					className="btn btn-primary"
					onClick={() => auth.signOut()}
				>
					Logout
				</button>
			</div>
		</nav>
	);
};
export default Navbar;
