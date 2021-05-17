const Joi = require("joi");
const { Schema, model } = require("mongoose");

const requestSchema = new Schema({
	studentUsername: {type: String,required: true,minlength: 3,maxlength: 255,},
	teacherUsername: {type: String,required: true,minlength: 3,maxlength: 255,},
	status: {type: String,enum: ["pending", "accepted", "rejected"],default: "pending",},
});

const Request = model("Request", requestSchema);

function validateRequest(request, options) {
	schema = Joi.object({
		studentUsername: Joi.string()
			.min(3)
			.max(255)
			.email()
			.required()
			.label("Student Username"),
		teacherUsername: Joi.string()
			.min(3)
			.max(255)
			.email()
			.required()
			.label("Teacher Username"),
	});

	return schema.validate(request, options);
}

exports.Request = Request;
exports.validate = validateRequest;
