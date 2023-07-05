// controller/authController.js
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;

passport.use(new DiscordStrategy({
    clientID: '1126130851407740960',
    clientSecret: 'NttHT9iKmglaiAXr4LnHz1ctVf_PEyvf',
    callbackURL: 'http://localhost:8888/auth/callback',
    scope: ['identify']
}, (accessToken, refreshToken, profile, done) => {
    // Handle the authentication process and retrieve user information
    // You can access the avatar URL from the `profile.avatar` property
    const { id, username, discriminator, avatar } = profile;
    // Additional processing if needed
    // ...
    // Return the user information
    done(null, { id, username, discriminator, avatar });
}));

// Authentication Routes
// ...
// Route for initiating the Discord authentication flow
router.get('/auth/discord', passport.authenticate('discord'));

// Callback route after authentication
router.get('/auth/discord/callback', passport.authenticate('discord', { failureRedirect: '/login' }), (req, res) => {
    // Redirect or perform further actions
    res.redirect('/');
});
