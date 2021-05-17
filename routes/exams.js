const express = require("express");
const auth = require("../middleware/auth");
const verifyExamTime = require("../middleware/verifyExamTime");
const { User } = require("../models/user");
const { Exam } = require("../models/exam");
const { Result } = require("../models/result");

const router = express.Router();

// Create new exam
router.post("/", [auth], async (req, res) => {
	const exam = await (
		await new Exam({
			author: req.user._id,
			...req.body,
		}).save()
	).populate("author", "-password");
	res.send(exam);
});

// Get exams
router.get("/", [auth], async (req, res) => {
	const { _id, isTeacher } = req.user;
	let exams;
	if (isTeacher)
		exams = await Exam.find({ author: _id }).populate(
			"author",
			"-password"
		);
	else {
		const user = await User.findById(_id);
		exams = await Exam.find({ author: { $in: user.friends } })
			.populate("author", "-password")
			.select(`${req.isTeacher ? "" : "-questions -participants"}`);
	}
	res.send(exams);
});

// Edit a result
router.put("/results/:resultId", async (req, res) => {
	const { action } = req.body;
	let result = await Result.findById(req.params.resultId).populate("exam");
	switch (action) {
		case "calculate mark":
			const { marksObtained, answers, exam } = result;
			exam.questions.forEach((question, index) => {
				if (question.type === "optional") {
					if (answers[index] === question.answer)
						marksObtained.set(index, question.mark);
					else marksObtained.set(index, 0);
				}
			});
			break;

		case "edit mark":
			const { questionNo, mark } = req.body;
			result.marksObtained.set(questionNo, parseInt(mark));
			break;
	}
	result = await result.save();
	return res.send(result);
});

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

// Get data for starting exam, Saving results, Publishig results
router.post("/:examId", [auth, verifyExamTime], async (req, res) => {
	const { action, answers } = req.body;
	const { examId: exam } = req.params;
	const { _id: student } = req.user;

	switch (action) {
		case "start":
			const currentExam = req.exam;
			let result = await Result.findOne({
				student,
				exam,
			});
			if (!result) {
				result = new Result({
					student,
					exam,
					answers: Array(currentExam.questions.length).fill(""),
					marksObtained: Array(currentExam.questions.length).fill(0),
				});
				result = await result.save();
				currentExam.participants.push(student);
				await currentExam.save();
			}
			return res.send({
				questions: currentExam.questions.map((q) => {
					const question = { ...q };
					delete question.answer;
					return question;
				}),
				answers: result.answers,
			});

		case "save":
			await Result.findOneAndUpdate(
				{
					student,
					exam,
				},
				{ answers }
			);
			return res.send("Saved answers");

		case "publish":
			const editedExam = await Exam.findByIdAndUpdate(
				exam,
				{
					isResultPublished: true,
				},
				{ new: true }
			);
			return res.send(editedExam);
	}
});

// Edit exam
router.put("/:examId", [auth], async (req, res) => {
	const { examId } = req.params;
	const exam = await Exam.findByIdAndUpdate(examId, req.body, { new: true });
	res.send(exam);
});

// Delete exam
router.delete("/:examId", async (req, res) => {
	const { examId } = req.params;
	await Exam.findByIdAndDelete(examId);
	res.send("exam deleted successfully");
});

module.exports = router;
