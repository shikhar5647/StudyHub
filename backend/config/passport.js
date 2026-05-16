const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const bcrypt = require('bcryptjs');

function googleOAuthEnabled() {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

function configurePassport(passportInstance) {
  passportInstance.use(
    new LocalStrategy(
      { usernameField: 'email' },
      async (email, password, done) => {
        try {
          const user = await User.findOne({ email }).select('+password');
          if (!user) return done(null, false, { message: 'User not found' });
          if (!user.password) {
            return done(null, false, { message: 'Use Google sign-in for this account' });
          }

          const isMatch = await bcrypt.compare(password, user.password);
          if (!isMatch) return done(null, false, { message: 'Invalid credentials' });

          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  if (googleOAuthEnabled()) {
    const callbackURL =
      process.env.GOOGLE_CALLBACK_URL ||
      `http://localhost:${process.env.PORT || 5000}/api/auth/google/callback`;

    passportInstance.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL,
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const googleId = profile.id;
            const email = profile.emails?.[0]?.value?.toLowerCase();
            const emailVerified = Boolean(profile.emails?.[0]?.verified);
            const avatar = profile.photos?.[0]?.value;
            const name = profile.displayName || (email ? email.split('@')[0] : 'User');

            if (!email) {
              return done(new Error('Google account did not return an email address'));
            }

            let user = await User.findOne({ 'providers.google.id': googleId });

            if (!user) {
              user = await User.findOne({ email });
              if (user) {
                user.providers = user.providers || {};
                user.providers.google = { id: googleId, emailVerified };
                if (avatar) user.avatar = avatar;
                user.emailVerified = user.emailVerified || emailVerified;
                if (!user.name) user.name = name;
              } else {
                user = new User({
                  name,
                  email,
                  avatar: avatar || undefined,
                  emailVerified,
                  providers: { google: { id: googleId, emailVerified } },
                });
              }
            } else {
              if (avatar) user.avatar = avatar;
              if (!user.name) user.name = name;
            }

            user.lastLogin = new Date();
            await user.save();
            return done(null, user);
          } catch (err) {
            return done(err, null);
          }
        }
      )
    );
  }

  passportInstance.serializeUser((user, done) => {
    done(null, user._id.toString());
  });

  passportInstance.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
};

configurePassport.googleOAuthEnabled = googleOAuthEnabled;
module.exports = configurePassport;
