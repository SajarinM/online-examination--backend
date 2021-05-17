const Joi = require("joi");
const { Schema, model } = require("mongoose");
const jwt = require("jsonwebtoken");
const config = require("config");

const userSchema = new Schema(
	{
		username: {type: String,required: true,minlength: 3,maxlength: 255,unique: true,},
		name: { type: String, required: true, minlenth: 1, maxlength: 50 },
		type: { type: String, enum: ["teacher", "student"] },
		friends: { type: [String], default: [] },
		password: {type: String,required: true,minlenth: 1,maxlength: 1024,},
	},
	{ discriminatorKey: "type" }
);

userSchema.methods.generateAuthToken = function () {
	return jwt.sign(
		{
			_id: this._id,
			username: this.username,
			name: this.name,
			type: this.type,
			isTeacher: this.type === "teacher",
		},
		config.get("jwtPrivateKey")
	);
};

const User = model("User", userSchema);
User.types = {
	teacher: "teacher",
	student: "student",
};

const teacherSchema = new Schema({}, { discriminatorKey: "user" });
const Teacher = User.discriminator("teacher", teacherSchema);

const studentSchema = new Schema({}, { discriminatorKey: "user" });

const Student = User.discriminator("student", studentSchema);

function validateUser(user, options) {
	const schema = Joi.object({
		username: Joi.string().min(3).max(255).email().required(),
		name: Joi.string().min(3).max(50).required(),
		type: Joi.string(),
		password: Joi.string().min(5).max(255).required(),
	});

	return schema.validate(user, options);
}

exports.User = User;
exports.Teacher = Teacher;
exports.Student = Student;
exports.validate = validateUser;
