const db = require("../../database");
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const express = require('express');
const app = express();


/**
 * 
 *  get all getHash from the database
 */


const getHash = function (password, salt) {
	return crypto.pbkdf2Sync(password, salt, 100000, 256, 'sha256').toString('hex');
};

const findByUsername = (username, done) => {
	const sql = "SELECT * FROM users WHERE username = ?";

	db.get(sql, [username], (err, row) => {
		if (err) {
			return done(err);
		}

		if (!row) {
			console.log(`User not found with Username: ${username}`);
			return done(null);
		}

		const user = {
			bio: row.bio,
			username: row.username,
			created: row.created_at,
			level: row.level,
		};

		return done(null, user);
	});
};

const addNewUser = (user, done) => {
	const salt = crypto.randomBytes(64);
	const hash = getHash(user.password, salt);

	const sql =
		'INSERT INTO users (username, email, password, salt) VALUES (?,?,?,?)';
	let values = [
		user.username,
		user.email,
		hash,
		salt.toString('hex'),
	];

	db.run(sql, values, function (err) {
		if (err) {
			console.log(err);
			return done(err);
		}

		// Send verification email
		// emailService.sendVerificationEmail(user.email, verificationToken); // Call the function to send the verification email

		return done(null, this.lastID);
	});
};

/*
 *   authenticate user
 */
const authenticateUser = (email, password, done) => {
	db.get(
		'SELECT user_id, password, salt FROM users WHERE email=?',
		[email],
		(err, row) => {
			if (!row) return done(404);
			if (err) return done(err);

			if (row.salt == null) {
				row.salt = '';
			}

			let salt = Buffer.from(row.salt, 'hex');

			if (row.password === getHash(password, salt)) {
				return done(null, row.user_id);
			} else {
				console.log("Failed password check");
				return done(404); // failed password check
			}
		}
	);
};

const getIdFromToken = function (token, done) {
	if (token === undefined || token === "")
		return done(true, 401);
	else {
		db.get(
			'SELECT user_id FROM users WHERE session_token=?',
			[token],
			function (err, row) {
				if (row) return done(null, row.user_id);
				console.log(err)
				return done(null);
			}
		)
	}
};


const getToken = function (id, done) {
	db.get(
		'SELECT username, session_token FROM users WHERE user_id=?',
		[id],
		function (err, row) {
			if (err) return done(err)
			if (row && row.session_token) {
				return done(null, row.session_token, row.username);
			} else {
				return done(null, null)
			}
		}
	)
}


const setToken = (id, done) => {
	let token = crypto.randomBytes(16).toString('hex');

	const sql = 'UPDATE users SET session_token=? WHERE user_id=?'

	db.run(sql, [token, id], (err) => {
		if (err) return done(err)
		db.get(
			'SELECT username FROM users WHERE user_id=?',
			[id],
			function (err, row) {
				if (err) return done(err)
				return done(null, token, row.username)
			}
		)
	})
}



const removeToken = (token, done) => {
	const sql = 'UPDATE users SET session_token=null WHERE session_token=?'

	db.run(sql, [token], (err) => {
		return done(err)
	})
}


const savePicture = (username, avatarUrl, done) => {
	const sql = "UPDATE users SET avatarUrl = ? WHERE username = ?";
	const values = [avatarUrl, username];

	db.run(sql, values, (error) => {
		if (error) {
			console.log("Error saving profile picture:", error);
			return done(error);
		}
		return done(null); // Invoke the callback without any arguments to indicate success
	});
};


module.exports = {
	authenticateUser: authenticateUser,
	addNewUser: addNewUser,
	findByUsername: findByUsername,
	savePicture: savePicture,
	getIdFromToken: getIdFromToken,
	getToken: getToken,
	setToken: setToken,
	removeToken: removeToken,
};
