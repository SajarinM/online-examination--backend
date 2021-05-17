const mongoose = require("mongoose");
const { User } = require("./models/user");

// mongoose
// 	.connect("mongodb://localhost/online-examination", {
// 		useNewUrlParser: true,
// 		useUnifiedTopology: true,
// 	})
// 	.then(() => {
// 		console.log("Connected to mongodb database....");
// 	})
// 	.catch((err) => {
// 		console.log("Cannot connect to database");
// 	});

// async function run() {
// 	let user = await User.findOne({ username: "sajarinm@gmail.com" });
// 	console.log(user._id.getTimestamp());
// }
// run();
