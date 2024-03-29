const jwt = require("jsonwebtoken");
const { jwtPrivateKey } = require("../config");

module.exports = function (req, res, next) {
	const token = req.header("x-auth-token");
	if (!token) return res.status(401).send("Access Denied");

	try {
		const decoded = jwt.verify(token, jwtPrivateKey);
		req.user = decoded;
		req.isTeacher = req.user.type === "teacher";
		next();
	} catch (error) {
		res.status(400).send("Invalid Token");
	}
};
