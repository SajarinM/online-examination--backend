const { Schema, model } = require("mongoose");

const examSchema = new Schema({
	author: { type: Schema.Types.ObjectId, ref: "User" },
	name: { type: String },
	startingTime: { type: Date },
	dueTime: { type: Date },
	questions: { type: [Object] },
	noOfQuestions: { type: Number },
	totalMarks: { type: Number },
	participants: { type: [Schema.Types.ObjectId], ref: "User", default: [] },
	isResultPublished: { type: Boolean, default: false },
});

examSchema.pre("save", function (next) {
	this.noOfQuestions = this.questions.length;
	this.totalMarks = this.questions.reduce((total, question) => {
		return total + parseInt(question.mark);
	}, 0);
	next();
});

examSchema.pre("findOneAndUpdate", function (next) {
	const exam = this._update;
	if (exam.questions) {
		exam.noOfQuestions = exam.questions.length;
		exam.totalMarks = exam.questions.reduce((total, question) => {
			return total + parseInt(question.mark);
		}, 0);
	}
	next();
});

const Exam = model("Exam", examSchema);

exports.Exam = Exam;
