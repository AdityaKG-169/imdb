import React from "react";
import { auth, signInWithGoogle } from "../../firebase/firebase";
import NavSearchbox from "../NavSearchbox/NavSearchbox";

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
				<NavSearchbox />
				<button type="button" className="btn btn-outline-success">
					Add A Course
				</button>
				{props.user ? (
					<button
						type="button"
						className="btn btn-primary"
						onClick={() => auth.signOut()}
					>
						Logout
					</button>
				) : (
					<button
						type="button"
						className="btn btn-primary"
						onClick={() => signInWithGoogle()}
					>
						Login
					</button>
				)}
			</div>
		</nav>
	);
};
export default Navbar;
