const nodemailer = require("nodemailer");
require("dotenv").config();

const sendMail = (courseId) => {
	let transporter = nodemailer.createTransport({
		host: "smtp.gmail.com",
		port: 25,
		secure: false,
		auth: {
			user: process.env.EMAIL,
			pass: process.env.PASSWORD,
		},
	});
	let mainOptions = {
		from: process.env.EMAIL,
		to: process.env.RECIPIENT,
		subject: "New Course Added",
		text: "New Course Added. Here is the Course ID: " + courseId,
	};
	transporter.sendMail(mainOptions, (err, data) => {
		if (err) console.log(err);
		else console.log("Success");
	});
};

module.exports = sendMail;
