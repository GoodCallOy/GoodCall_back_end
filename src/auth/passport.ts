import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import mongoose from "mongoose";

import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Import the User model
import User from "../models/user";
// Serialize and Deserialize User
passport.serializeUser((user: any, done) => {
  console.log('✅ user to serialize:', user);

  done(null, user._id.toString());
});

passport.deserializeUser(async (id, done) => {
  console.log('✅ user deserialize id:', id);

  try {
    const user = await User.findById(id).exec();
    console.log('✅ deserializeUser user:', user);
    if (user) {
      done(null, user); // Make sure the `user` here conforms to IUser
    } else {
      done(new Error("User not found"), null);
    }
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy
const CLIENT_URL =
  process.env.NODE_ENV === 'production'
    ? "https://goodcall-back-end.onrender.com/api/v1/auth/google/callback"
    : "https://localhost:3030/api/v1/auth/google/callback"

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL: CLIENT_URL,
    },
    async (accessToken, refreshToken, profile, done: (err: any, user: any | false | null) => void) => {
      try {
    
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          console.log("🟠 No user found, creating a new one...");
          
          user = new User({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails?.[0].value,
            avatar: profile.photos?.[0].value,
          });

          console.log('✅ saving user:', user);
          await user.save();
          console.log("✅ User saved to DB:", user);
        }
    
        done(null, user);
      } catch (error) {
        console.error("❌ Error in Google OAuth callback:", error);
        done(error, null);
      }
    }
    
  )
);

export default passport;