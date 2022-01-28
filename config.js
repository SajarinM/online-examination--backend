// Set these environment variables on your server before starting the app
// caution : sometimes no need to set port as it will be set by the server

const jwtPrivateKey = process.env.jwtPrivateKey || "secret";
const dbUrl = process.env.dbUrl || "mongodb://localhost:27017/test";
const port = process.env.port || 3000;

module.exports = {
	jwtPrivateKey,
	dbUrl,
	port,
};
