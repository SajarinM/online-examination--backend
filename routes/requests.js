const express = require("express");
const auth = require("../middleware/auth");
const { Request, validate } = require("../models/request");
const { User, Teacher, Student } = require("../models/user");

const router = express.Router();

router.post("/", async (req, res) => {
	// Validation
	const { error } = validate(req.body);
	if (error) return res.status(400).send(error.details[0].message);

	// Request already sent
	let request = await Request.findOne({
		studentUsername: req.body.studentUsername,
		teacherUsername: req.body.teacherUsername,
	});
	if (request)
		return res
			.status(400)
			.send(
				"Request Already Sent, Please Contact Your Teacher to approve..."
			);

	// Teacher does not exist
	let teacher = await User.findOne({
		username: req.body.teacherUsername,
		type: User.types.teacher,
	});
	if (!teacher) return res.status(400).send("Invalid Teacher Id");

	// Create new Request
	request = new Request(req.body);
	await request.save();

	res.send(request);
});

router.get("/", auth, async (req, res) => {
	const searchQuery = { ...req.query };
	const requestor = req.user.type;
	if (requestor === User.types.teacher)
		searchQuery["teacherUsername"] = req.user.username;
	if (requestor === User.types.student)
		searchQuery["studentUsername"] = req.user.username;

	const requests = await Request.find(searchQuery);
	res.send(requests);
});

router.put("/:id", auth, async (req, res) => {
	let request = await Request.findById(req.params.id);
	if (!request)
		return res
			.status(404)
			.send("The request with the given ID was not found.");
	if (request.status !== "pending")
		return res.status(400).send("This request is alreafy modified");

	request.status = req.body.status;
	request = await request.save();

	if (request.status === "rejected")
		return res.send({ message: "The request is rejected" });

	const { studentUsername, teacherUsername } = request;
	const student = await Student.findOne({ username: studentUsername });
	const teacher = await Teacher.findOne({ username: teacherUsername });
	student.friends.push(teacher._id);
	teacher.friends.push(student._id);
	await teacher.save();
	await student.save();
	res.send({ request, message: "The request is accepted" });
});

module.exports = router;
