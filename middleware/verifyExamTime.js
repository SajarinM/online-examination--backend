const { Exam } = require("../models/exam");

module.exports = async function (req, res, next) {
	const exam = await Exam.findById(req.params.examId);
	req.exam = exam;
	if (req.user.type === "student") {
		const { startingTime, dueTime } = exam;
		if (new Date(startingTime) > new Date())
			return res.status(400).send("The exam is not started yet");
		if (new Date() > new Date(dueTime))
			return res.status(400).send("The exam is over");
	}
	next();
};
