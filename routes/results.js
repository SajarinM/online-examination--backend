const express = require("express");
const auth = require("../middleware/auth");
const verifyExamTime = require("../middleware/verifyExamTime");
const { Exam } = require("../models/exam");
const { Result } = require("../models/result");

const router = express.Router();



// Calculate marks of optional questions
router.put("/results/:examId", async (req, res) => {
	const exam = await Exam.findById(req.examId);
	let results = await Result.find({
		exam: exam._id,
	});
	exam.questions.forEach((question, index) => {
		if ((question.type = "optional"))
			results.forEach((result) => {
				result.marksObtained.set(index, question.mark);
			});
	});
	results = await results.save();
});

router.get("/results/:resultId");

// Get results
router.get("/results", [auth], async (req, res) => {
	const { _id: userId } = req.user;
	let results = [];
	if (req.isTeacher) {
		const exams = (await Exam.find({ author: userId })).map((e) => e._id);
		results = await Result.find({
			exam: { $in: exams },
		})
			.populate("student", "-type name")
			.populate("exam");
	} else {
		const exams = (
			await Exam.find({
				participants: userId,
				isResultPublished: true,
			})
		).map((e) => e._id);
		results = await Result.find({
			student: userId,
			exam: { $in: exams },
		})
			.populate("student", "-type name")
			.populate("exam");
	}
	res.send(results);
});
