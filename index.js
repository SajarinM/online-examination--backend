const express = require("express");
const mongoose = require("mongoose");
const { dbUrl, port } = require("./config");
const users = require("./routes/users");
const requests = require("./routes/requests");
const auth = require("./routes/auth");
const exams = require("./routes/exams");
const cors = require("cors");
const app = express();

// Database connection
mongoose
	.connect(dbUrl, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useFindAndModify: false,
		useCreateIndex: true,
	})
	.then(() => {
		console.log("Connected to mongodb database....");
	})
	.catch(() => {
		console.log("Cannot connect to database");
	});

// Routes Midddlewares
app.use(cors());
app.use(express.json()); // Middleware to parse json to native object and reverse
app.use("/api/users", users);
app.use("/api/requests", requests);
app.use("/api/auth", auth);
app.use("/api/exams", exams);

// Listening to port
app.listen(port, () => {
	console.log(`Listening on port ${port}......`);
});
