require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const Users = require("./models/Users");
const Courses = require("./models/Courses");
const Bugs = require("./models/Bugs");
const Aids = require("./models/Aids");
const jwt = require("jsonwebtoken");
const PORT = process.env.PORT || 8080;
// const sendMail = require("./mailScript");

const app = express();
app.use(bodyParser.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URL, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useFindAndModify: false,
});

//JWT Verification
const verifyToken = async (req, res, next) => {
	const { authorization } = req.headers;
	if (!authorization)
		return res.status(401).json({ error: "You Must be Logged In to Continue" });
	const token = authorization.replace("Bearer ", "");
	jwt.verify(token, process.env.TOKEN_SECRET, async (err, payload) => {
		if (err)
			return res
				.status(401)
				.json({ error: "You Must be Logged In to Continue" });
		const { id } = payload;
		console.log(id, "Hello1");
		const fetchedUser = await Users.findById(id);
		try {
			req.user = fetchedUser;
			console.log(req.user.id, "Hello2");
			next();
		} catch (err) {
			res.status(400).json({ error: "Unable to Verify User." });
		}
	});
};

// Get list of all courses in Admin Pannel
app.get("/admin/allcourses", verifyToken, async (req, res) => {
	const courses = await Courses.find({});
	try {
		if (req.user.googleId === "RApgwKTGONMRo7D2VY9LZvUEggE2")
			return res.status(200).json({ message: courses });
		else return res.status(400).json({ error: "Unauthorized Route" });
	} catch (err) {
		res.status(400).json({ error: err });
	}
});

// Get list of all Users in Admin Pannel
app.get("/admin/allusers", verifyToken, async (req, res) => {
	const users = await Users.find({});
	try {
		if (req.user.googleId === "RApgwKTGONMRo7D2VY9LZvUEggE2")
			return res.status(200).json({ message: users });
		else return res.status(400).json({ error: "Unauthorized Route" });
	} catch (err) {
		res.status(400).json({ error: err });
	}
});

// Get List of all the Bugs
app.get("/admin/allbugs", verifyToken, async (req, res) => {
	const bugs = await Bugs.find({});
	try {
		if (req.user.googleId === "RApgwKTGONMRo7D2VY9LZvUEggE2")
			return res.status(200).json({ message: bugs });
		else return res.status(400).json({ error: "Unauthorized Route" });
	} catch (err) {
		res.status(400).json({ error: err });
	}
});

// Get list of all the Finanacial Aids
app.get("/admin/allaids", verifyToken, async (req, res) => {
	const aids = await Aids.find({});
	try {
		if (req.user.googleId === "RApgwKTGONMRo7D2VY9LZvUEggE2")
			return res.status(200).json({ message: aids });
		else return res.status(400).json({ error: "Unauthorized Route" });
	} catch (err) {
		res.status(400).json({ error: err });
	}
});

// Search courses from database
app.get("/course/:query", async (req, res) => {
	const courses = await Courses.fuzzySearch(req.params.query);
	try {
		res.json(courses);
	} catch (err) {
		res.json(err);
	}
});

//Add A User(Google Method)
app.post("/user", async (req, res) => {
	const { email, googleId } = req.body;
	const isUserThere = await Users.findOne({ email });
	try {
		if (isUserThere) {
			const token = jwt.sign({ id: isUserThere.id }, process.env.TOKEN_SECRET);
			if (isUserThere.googleId === "RApgwKTGONMRo7D2VY9LZvUEggE2")
				return res.status(200).json({ message: "admin", token });
			else {
				return res.status(200).json({ message: "Welcome Back!", token });
			}
		}
		const newUser = new Users({ email, googleId });
		const savedUser = await newUser.save();
		try {
			const token = jwt.sign({ id: savedUser.id }, process.env.TOKEN_SECRET);
			res.status(200).json({ message: "User Created Successfully!", token });
		} catch (err) {
			res
				.status(400)
				.json({ error: "Error While Making Request. Please Try Again" });
		}
	} catch (err) {
		console.log(err);
		res
			.status(400)
			.json({ error: "Error While Making Request. Please Try Again" });
	}
});

//Add A Course && sendmail
app.post("/course", verifyToken, async (req, res) => {
	let { name, link, platform, domain, subDomain } = req.body;
	if (!name || !link || !platform || !domain || !subDomain)
		return res
			.status(400)
			.json({ error: "Please Fill All the Required Details" });

	const urlPattern = /[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/;

	if (!link.match(urlPattern))
		return res
			.status(400)
			.json({ error: "Invalid Course Link. Please Use the correct format." });

	name = name.toLowerCase();
	platform = platform.toLowerCase();
	domain = domain.toLowerCase();
	subDomain = subDomain.toLowerCase();
	const submittedBy = req.user.id;

	try {
		const course = new Courses({
			name,
			link,
			platform,
			domain,
			subDomain,
			submittedBy,
		});
		const savedCourse = await course.save();
		// sendMail(savedCourse.id);
		res.status(200).json({
			message:
				"Course details are sent for verification. Thanks for your Contibution.",
		});
	} catch (err) {
		res
			.status(400)
			.json({ error: "Unable to Add The Course. Please Try Again." });
	}
});

//Get List of domains
app.get("/courses/domains", async (req, res) => {
	const domains = await Courses.find({}).select("domain");
	try {
		res.status(200).json({ message: domains });
	} catch (err) {
		res
			.status(400)
			.json({ error: "Error Getting Domains. Please try again later" });
	}
});

//Get List of Subdomains
app.get("/courses/subdomains/:domain", async (req, res) => {
	const subDomains = await Courses.find({ domain: req.params.domain }).select(
		"subDomain"
	);
	try {
		res.status(200).json({ message: subDomains });
	} catch (err) {
		res
			.status(400)
			.json({ error: "Error Getting Domains. Please try again later" });
	}
});

// Update The Rating of User and Course
app.patch("/update", verifyToken, async (req, res) => {
	const { newCourseRating, userRating, courseId } = req.body;
	const updatedUser = await Users.findByIdAndUpdate(
		{ _id: req.user.id },
		{
			$push: {
				ratedCourses: {
					courseId: courseId,
					rating: userRating,
				},
			},
		}
	).exec((err, post) => {
		if (err) res.status(400).json({ error: "Unable to Rate Course" });
		else {
			Courses.updateOne(
				{ id: courseId },
				{
					$set: {
						rating: newCourseRating,
					},
				}
			)
				.then(() =>
					res.status(200).json({ message: "Course Rated Successfully" })
				)
				.catch((err) =>
					res.status(400).json({ error: "Unable to rate Course" })
				);
			res.status(200).json({ message: "Course Rated Successfully" });
		}
	});
});

// Update Reward Domain
app.patch("/chosereward", verifyToken, async (req, res) => {
	try {
		chosenReward = await Users.updateOne(
			{ _id: req.user.id },
			{
				$set: {
					rewardDomain: req.body.rewardDomain,
				},
			}
		);
		res.status(200).json({ message: "Domain Selected Successfully!" });
	} catch (err) {
		res
			.status(400)
			.json({ error: "Unable to Select Domain. Please try again!" });
	}
});

// Add A Bug
app.post("/bug", async (req, res) => {
	const { email, bug } = req.body;
	if (!email || !bug)
		return res.status(400).json({ error: "All Fields are Required" });
	const newBug = new Bugs(email, bug);
	const savedBug = await newBug.save();
	try {
		return res.status(200).json({
			message: "Thanks for submitting. We will reach out to you via EMail!",
		});
	} catch (err) {
		return res
			.status(200)
			.json({ error: "Error Reporting Bug. Please try again later." });
	}
});

// Submit Financial Aid Application
app.post("/aid", verifyToken, async (req, res) => {
	const { courseLink, description } = req.body;
	const email = req.user.email;
	if (!email || !courseLink || !description)
		return res.status(400).json({ error: "All Fields are Required" });
	const newAid = new Bugs(email, courseLink, description);
	const savedAid = await newAid.save();
	try {
		return res.status(200).json({
			message: "We will review your Application and reach out to you shortly!",
		});
	} catch (err) {
		return res
			.status(200)
			.json({ error: "Error Submittin Application. Please try again later." });
	}
});

app.listen(PORT);

// if (process.env.NODE_ENV === "production") {
// 	app.use(express.static("client/build"));
// 	const path = require("path");
// 	app.get("*", (req, res) => {
// 		res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
// 	});
// }

// "heroku-postbuild": "NPM_CONFIG_PRODUCTION=false npm install --prefix client && npm run build --prefix client",
