const Joi = require("joi");
const path = require('path');
const fs = require('fs');
const users = require("../model/user.model");
const discordAuth = require ("../lib/disordauth");
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


const login = (req, res) => {
	// Validating the user logging in progress, email and password are required
	const schema = Joi.object({
		"email": Joi.string().required(),
		"password": Joi.string().required()
	});

	const { error } = schema.validate(req.body);
	if (error) return res.status(400).send(error.details[0].message);

	const email = req.body.email;
	const password = req.body.password;

	users.authenticateUser(email, password, (err, id) => {
		if (err === 404) {
			console.log(err);
			return res.status(400).send("Invalid email/password supplied");
		}

		if (err) return res.sendStatus(500);

		users.getToken(id, (err, token) => {
			if (err) return res.sendStatus(500);

			if (token) {
				return res.status(200).send({
					user_id: id,
					session_token: token,
				});
			} else {
				users.setToken(id, (err, token) => {
					if (err) return res.sendStatus(500);
					return res.status(200).send({
						user_id: id,
						session_token: token,
					});
				});
			}
		});
	});
};

const logout = (req, res) => {
	let token = req.get('X-Authorization');

	users.removeToken(token, (err) => {
		if (err) {
			return res.sendStatus(401);
		}
		return res.sendStatus(200);


	});

}

const saveProfilePicture = (req, res) => {
	const { username, discordToken } = req.body;
   
	console.log('Discord token:', discordToken);
	console.log('Request user:', req.user);
   
	discordAuth
	  .getUserID(discordToken)
	  .then((id) => {
	    console.log('User ID:', id);
   
	    // Use the userId to fetch the user's avatar
	    const avatarUrl = `https://cdn.discordapp.com/avatars/${id}/${id}.png`;
   
	    console.log('Avatar URL:', avatarUrl);
   
	    users.savePicture(username, avatarUrl, (err) => {
		 if (err) {
		   console.log('Error saving profile picture:', err);
		   return res.status(500).json({ error: 'An error occurred while saving the profile picture' });
		 }
		 return res.status(201).json({ message: 'Profile picture saved successfully' });
	    });
	  })
	  .catch((error) => {
	    console.log('Error fetching Discord user ID:', error);
	    return res.status(500).json({ error: 'An error occurred while fetching the Discord user ID' });
	  });
   };
   
   
   
   

module.exports = {
	create: create,
	getUserInfo: getUserInfo,
	login: login,
	logout: logout,
	saveProfilePicture: saveProfilePicture,

}