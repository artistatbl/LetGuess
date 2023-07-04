const Joi = require("joi");
const path = require('path');
const fs = require('fs');
const users = require("../model/user.model");
emailvalidator = require("email-validator");


const create = (req, res) => {
	const schema = Joi.object({
		"username": Joi.string().required(),
		"email": Joi.string().required(),
		"password": Joi.string().pattern(/^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])/).required()
	});

	const { error } = schema.validate(req.body);
	if (error) return res.status(400).send(error.details[0].message);

	let user = Object.assign({}, req.body);
	// validating the users Email and password before the addmin creates a user
	if (!emailvalidator.validate(user['email']) || user['password'].length <= 7) {
		return res.status(400).send('Email or Password greather than 5 characters');
	}
	if (!emailvalidator.validate(user['email']) || user['password'].length > 12) {
		return res.status(400).send('Email or Password no longer than 12 characters');
	}

	users.addNewUser(user, function (err, id) {
		if (err) {
			console.log(err);
			return res.sendStatus(500)
		}
		return res.status(201).send({ user_id: id });

	})

}

const getUserInfo = (req, res) => {
	const { username } = req.params;
   
	users.findByUsername(username, (err, user) => {
	  if (err) {
	    console.log(err);
	    return res.sendStatus(500);
	  }
   
	  if (!user) {
	    return res.status(404).json({ error: "User not found" });
	  }
   
	  return res.json(user);
	});
   };
   


module.exports = {
	create: create,
	getUserInfo: getUserInfo,
}