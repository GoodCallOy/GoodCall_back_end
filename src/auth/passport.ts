import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Import the User model
import User from "../models/user";
// Serialize and Deserialize User
passport.serializeUser((user: any, done) => {
  const sessionUser = {
    id: user._id.toString(),
    role: user.role,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    agentId: user.agentId ? user.agentId.toString() : null,
  };
  console.log('✅ user serialized:', sessionUser);
  done(null, sessionUser); // <-- store this in the session
});

passport.deserializeUser((sessionUser: any, done) => {
  console.log('🔄 user deserialized:', sessionUser);
  done(null, sessionUser);
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
            role: "caller",
            agentId: null
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