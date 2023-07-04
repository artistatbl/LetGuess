const user = require("../model/user.model");

const isAuthenticated = function (req, res, next) {
	let token = req.get('X-Authorization');

	user.getIdFromToken(token, (err, id) => {
		console.log("here", err, id)
		if (err || id === null || !id) {
			console.log(err, id)
			return res.sendStatus(401);
		}
		req.userId = id;
		next();
	});
};

module.exports = {
	isAuthenticated: isAuthenticated

}