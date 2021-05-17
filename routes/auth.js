const express = require("express");
const bcrypt = require("bcrypt");
const Joi = require("joi");
const auth = require("../middleware/auth");
const { User } = require("../models/user");

const router = express.Router();

router.post("/", async (req, res) => {
	const { error } = validate(req.body);
	if (error) {
		const errors = error.details.map((e) => e.message);
		return res.status(400).send(errors);
	}

	let user = await User.findOne({ username: req.body.username });
	if (!user) return res.status(400).send("Invalid Username or Password");

	const validPassword = await bcrypt.compare(
		req.body.password,
		user.password
	);
	if (!validPassword)
		return res.status(400).send("Invalid Username or Password");
	const token = user.generateAuthToken();
	res.send(token);
});

router.put("/", [auth], async (req, res) => {
	const { newPassword, currentPassword } = req.body;
	const { _id, username } = req.user;
	const { error } = validate({
		username: username,
		password: newPassword,
	});
	if (error) return res.status(400).send(error.details[0].message);
	const user = await User.findById(_id);
	const validPassword = await bcrypt.compare(currentPassword, user.password);
	if (!validPassword) return res.status(400).send("Invalid Password");
	const salt = await bcrypt.genSalt(10);
	user.password = await bcrypt.hash(newPassword, salt);
	await user.save();
	res.send("Ok");
});

function validate(authRequest) {
	const schema = Joi.object({
		username: Joi.string().min(3).max(255).email().required(),
		password: Joi.string().min(5).max(255).required(),
	});

	return schema.validate(authRequest);
}

module.exports = router;
