const mongoose = require("mongoose");
const mongooseFuzzySearching = require("mongoose-fuzzy-searching");
const Schema = mongoose.Schema;

const Courses = new Schema({
	name: {
		type: String,
		required: true,
	},
	link: {
		type: String,
		required: true,
	},
	platform: {
		type: String,
		required: true,
	},
	domain: {
		type: String,
		required: true,
	},
	subDomain: {
		type: String,
		required: true,
	},
	rating: {
		type: Number,
		default: null,
	},
	image: {
		type: String,
		default: null,
	},
	verified: {
		type: Boolean,
		default: false,
	},
	submittedBy: {
		type: String,
		required: true,
	},
	createdOn: {
		type: Date,
		default: Date.now,
	},
});

Courses.plugin(mongooseFuzzySearching, {
	fields: ["name", "link", "platform", "domain", "subDomain"],
});

module.exports = mongoose.model("Courses", Courses);
