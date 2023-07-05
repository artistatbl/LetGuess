const Joi = require("joi");
const path = require('path');
const fs = require('fs');
const users = require("../model/user.model");
emailvalidator = require("email-validator");
const Discord = require("discord.js");
const client = new Discord.Client();

client.on("ready", () => {
	console.log("Discord bot is ready");
});


const create = (req, res) => {
	const schema = Joi.object({
		"username": Joi.string().required(),
		"email": Joi.string().required(),
		"password": Joi.string().pattern(/^(?=.*\d)(?=b.*[!@#$%^&*])(?=.*[a-z])/).required()
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


const { Client, Intents } = require("discord.js");

const saveProfilePicture = (req, res) => {
  const { username, discordToken } = req.body;

  const intents = new Intents([
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_MESSAGES,
    // Add more intents as needed
  ]);

  const client = new Client({ intents });

  client.login(discordToken)
    .then(() => {
      return client.users.fetch(req.user.id);
    })
    .then((user) => {
      const avatarUrl = user.avatarURL({ format: "png", dynamic: true, size: 4096 });

      users.saveProfilePicture(username, avatarUrl, (err) => {
        if (err) {
          console.log("Error saving profile picture:", err);
          return res.status(500).json({ error: "An error occurred while saving the profile picture" });
        }

        return res.status(201).json({ message: "Profile picture saved successfully" });
      });
    })
    .catch((error) => {
      console.log("Error fetching Discord user:", error);
      return res.status(500).json({ error: "An error occurred while fetching the Discord user" });
    })
    .finally(() => {
      client.destroy();
    });
};



module.exports = {
	create: create,
	getUserInfo: getUserInfo,
	saveProfilePicture: saveProfilePicture,

}