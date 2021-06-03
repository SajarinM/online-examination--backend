const { Schema, model } = require("mongoose");

const resultSchema = new Schema({
	student: {type: Schema.Types.ObjectId,ref: "User",},
	exam: {type: Schema.Types.ObjectId,ref: "Exam",},
	startingTime: {type: Date,default: Date.now(),},
	answers: {type: [String],},
	marksObtained: {type: [Number],},
});

const Result = model("Result", resultSchema);

exports.Result = Result;
