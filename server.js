require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const PORT = process.env.PORT;
const Users = require("./models/Users");
const Courses = require("./models/Courses");
const jwt = require("jsonwebtoken");
const sendMail = require("./mailScript");

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

// Search from database
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
		console.log(isUserThere);
		const token = jwt.sign({ id: googleId }, process.env.TOKEN_SECRET);
		if (isUserThere) return res.status(200).json({ token });
		const newUser = new Users({ email, googleId });
		const savedUser = await newUser.save();
		try {
			console.log(savedUser);
			res.status(200).json({ message: "User Created Successfully!", token });
		} catch (err) {
			console.log(err);
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

if (process.env.NODE_ENV === "production") {
	app.use(express.static("client/build"));
	const path = require("path");
	app.get("*", (req, res) => {
		res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
	});
}

mongoose.connection.on("open", () => console.log("Database Connected"));

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
