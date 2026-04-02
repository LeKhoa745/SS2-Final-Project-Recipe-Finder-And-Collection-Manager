import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import pool from './db.js';

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
        const [rows] = await pool.query(
          'SELECT * FROM users WHERE google_id = ? OR email = ?',
          [profile.id, email]
        );

        if (rows.length > 0) {
          // Update google_id if user registered with email before
          if (!rows[0].google_id) {
            await pool.query(
              'UPDATE users SET google_id = ?, avatar = ? WHERE id = ?',
              [profile.id, avatar, rows[0].id]
            );
          }
          return done(null, rows[0]);
        }

        // Create new user
        const [result] = await pool.query(
          'INSERT INTO users (name, email, google_id, avatar) VALUES (?, ?, ?, ?)',
          [profile.displayName, email, profile.id, avatar]
        );

        const [newUser] = await pool.query('SELECT * FROM users WHERE id = ?', [result.insertId]);
        return done(null, newUser[0]);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser(async (id, done) => {
  try {
    const { UserModel } = await import('../models/user.model.js');
    const user = await UserModel.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

export default passport;
