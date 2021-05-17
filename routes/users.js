const express = require("express");
const bcrypt = require("bcrypt");
const auth = require("../middleware/auth");
const { User, validate } = require("../models/user");
const { Request } = require("../models/request");

const router = express.Router();

router.post("/", async (req, res) => {
	// // Validation
	const { error } = validate(req.body);
	if (error) return res.status(400).send(error.details[0].message);

	// User already registered
	let user = await User.findOne({ username: req.body.username });
	if (user)
		return res.status(400).send("User Already Registered, Please Login...");

	// Create new user
	user = new User.discriminators[req.body.type](req.body);
	const salt = await bcrypt.genSalt(10);
	user.password = await bcrypt.hash(user.password, salt);
	await user.save();

	// Return Token
	const token = user.generateAuthToken();
	res.header("x-auth-token", token)
		.header("access-control-expose-headers", "x-auth-token")
		.send({
			_id: user._id,
			username: user.username,
			name: user.name,
			type: user.type,
		});
});

router.get("/", [auth], async (req, res) => {
	const { _id, type } = req.user;
	const user = await User.discriminators[type].findById(_id);
	const friends = await User.find({
		_id: { $in: user.friends },
	}).select("name username");
	res.send(friends);
});

router.post("/unenroll", [auth], async (req, res) => {
	const { _id, type, isTeacher } = req.user;
	const friendType = isTeacher ? "student" : "teacher";
	const user = await User.discriminators[type].findById(_id);
	if (!user.friends.includes(req.body.friendId))
		return res.status(400).send(`User is not in ${friends} list`);
	const friend = await User.discriminators[friendType].findById(
		req.body.friendId
	);
	user.friends = user.friends.filter((e) => {
		return e != friend._id;
	});
	friend.friends = friend.friends.filter((e) => e != user._id);
	await user.save();
	await friend.save();
	await Request.findOneAndUpdate(
		{
			teacherUsername: isTeacher ? user.username : friend.username,
			studentUsername: isTeacher ? friend.username : user.username,
			status: "accepted",
		},
		{ $set: { status: "pending" } }
	);
	res.send("Ok");
});

module.exports = router;
