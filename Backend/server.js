const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());

// Server ports
const HTTP_PORT = 8888;

// Start Server
app.listen(HTTP_PORT, () => {
	console.log("Server is up and running: " + HTTP_PORT);
});

// Logging
app.use(morgan("tiny"));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Root endpoint
app.get("/", (req, res, next) => {
	res.json({ status: "Alive" });
});

// Other API endpoints: Link goes here...
require("./app/routes/user.routes")(app);

app.use(function (req, res) {
	res.sendStatus(404);
});
