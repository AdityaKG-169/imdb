const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Users = new Schema({
	email: {
		type: String,
		required: true,
	},
	googleId: {
		type: String,
		required: true,
	},
	rewardDomain: {
		type: String,
		default: null,
	},
	ratedCourses: [
		{
			courseId: {
				type: String,
				required: true,
			},
			rating: {
				type: Number,
				required: true,
			},
		},
	],
	createdOn: {
		type: Date,
		default: Date.now,
	},
});

module.exports = mongoose.model("Users", Users);
