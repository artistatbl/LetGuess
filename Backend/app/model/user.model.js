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

module.exports = {
	authenticateUser: authenticateUser,
	addNewUser: addNewUser,
	findByUsername: findByUsername,
};
