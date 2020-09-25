const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const Bugs = new Schema({
	email: {
		type: String,
		required: true,
	},
	bug: {
		type: String,
		required: true,
	},
});

module.exports = mongoose.model("Bugs", Bugs);
