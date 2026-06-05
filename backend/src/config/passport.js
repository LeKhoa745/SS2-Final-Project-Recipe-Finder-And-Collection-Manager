import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { UserModel } from '../models/user.model.js';

passport.use(
  new GoogleStrategy(
    {
      clientID:     process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:  process.env.GOOGLE_CALLBACK_URL,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email  = profile.emails[0].value;
        const avatar = profile.photos[0]?.value || null;

        // Check if user exists
        let user = await UserModel.findByGoogleIdOrEmail(profile.id, email);

        if (user) {
          // Update google_id if user registered with email before
          if (!user.google_id) {
            await UserModel.updateGoogleInfo(user.id, profile.id, avatar);
            user = await UserModel.findById(user.id);
          }
          return done(null, user);
        }

        // Create new user
        user = await UserModel.create({
          name: profile.displayName,
          email,
          googleId: profile.id,
          avatar
        });

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

export default passport;
