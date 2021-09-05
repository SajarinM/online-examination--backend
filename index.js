const express = require("express");
const mongoose = require("mongoose");
const config = require("config");
const users = require("./routes/users");
const requests = require("./routes/requests");
const auth = require("./routes/auth");
const exams = require("./routes/exams");
const cors = require("cors");
const app = express();

// Terminate if key is not set
if (!config.get("jwtPrivateKey")) {
	console.error("FATAL ERROR: jwtPrivateKey is not defined");
	process.exit(1);
}

// Database connection
mongoose
	.connect(config.get("db"), {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useFindAndModify: false,
		useCreateIndex: true,
	})
	.then(() => {
		console.log("Connected to mongodb database....");
	})
	.catch((err) => {
		console.log("Cannot connect to database");
	});

// Routes
app.use(cors());
app.use(express.json()); // Middleware to parse json to native object and reverse
app.use("/api/users", users);
app.use("/api/requests", requests);
app.use("/api/auth", auth);
app.use("/api/exams", exams);

// Listening to port
const PORT = process.env.PORT || config.get("port");
app.listen(PORT, () => {
	console.log(`Listening on port ${PORT}......`);
});
