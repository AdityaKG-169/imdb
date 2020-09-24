require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const Users = require("./models/Users");
const Courses = require("./models/Courses");
const jwt = require("jsonwebtoken");
const PORT = process.env.PORT || 8080;
// const sendMail = require("./mailScript");s

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
		const { googleId } = payload;
		const fetchedUser = await Users.findOne(googleId);
		try {
			req.user = fetchedUser;
			next();
		} catch (err) {
			res.status(400).json({ error: "Unable to Verify User." });
		}
	});
};

app.get("/allcourses", async (req, res) => {
	const courses = await Courses.find({});
	try {
		res.json(courses);
	} catch (err) {
		res.json(err);
	}
});

app.get("/allusers", async (req, res) => {
	const users = await Users.find({});
	try {
		res.json(users);
	} catch (err) {
		res.json(err);
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
		const token = jwt.sign({ id: googleId }, process.env.TOKEN_SECRET);
		if (isUserThere)
			return res.status(200).json({ message: "Welcome Back!", token });
		const newUser = new Users({ email, googleId });
		const savedUser = await newUser.save();
		try {
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
			{ googleId: req.user.id },
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

app.listen(PORT);

// if (process.env.NODE_ENV === "production") {
// 	app.use(express.static("client/build"));
// 	const path = require("path");
// 	app.get("*", (req, res) => {
// 		res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
// 	});
// }

// "heroku-postbuild": "NPM_CONFIG_PRODUCTION=false npm install --prefix client && npm run build --prefix client",
