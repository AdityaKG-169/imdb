const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const Aids = new Schema({
	email: {
		type: String,
		required: true,
	},
	courseLink: {
		type: String,
		required: true,
	},
	description: {
		type: String,
		required: true,
	},
	supportUs: {
		type: String,
		required: true,
	},
});

module.exports = mongoose.model("Aids", Aids);
