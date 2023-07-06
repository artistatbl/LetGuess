const DiscordStrategy = require('passport-discord').Strategy;
const passport = require('passport');
const Discord = require('discord.js');
const client = new Discord.Client();

const { savePicture } = require('../model/user.model');

const discordAuth = {};

// Set up Discord authentication strategy
passport.use(
  new DiscordStrategy(
    {
      clientID: '1126130851407740960',
      clientSecret: 'NttHT9iKmglaiAXr4LnHz1ctVf_PEyvf',
      callbackURL: 'http://localhost:8888/auth/callback',
      scope: ['identify']
    },
    (accessToken, refreshToken, profile, done) => {
      // Use the user profile information for further processing or saving to database
      // You can access the user's Discord ID using `profile.id`
      return done(null, profile);
    }
  )
);

// Initialize passport middleware
discordAuth.initialize = () => {
  return passport.initialize();
};

// Authenticate the user using Discord authentication strategy
discordAuth.authenticate = () => {
  return passport.authenticate('discord');
};

// Handle the OAuth2 callback
discordAuth.callback = () => {
  return passport.authenticate('discord', { failureRedirect: '/login' });
};

// Function to save profile picture
discordAuth.savePicture = (req, res, next) => {
  const { username } = req.user;
  const avatarUrl = `https://cdn.discordapp.com/avatars/${req.user.id}/${req.user.id}.png`;

  // Save the profile picture using the saveProfilePicture function
  savePicture(username, avatarUrl, (err) => {
    if (err) {
      console.log('Error saving profile picture:', err);
      return res.status(500).json({ error: 'An error occurred while saving the profile picture' });
    }

    return res.status(201).json({ message: 'Profile picture saved successfully' });
  });
};

const getUserID = (discordToken) => {
	// Log in with the Discord token
	return client.login(discordToken)
	  .then(() => {
	    // Access the user ID from the client
	    const userId = client.user.id;
	    return userId;
	  })
	  .catch((error) => {
	    throw error;
	  });
   };
   

module.exports = discordAuth, getUserID;
