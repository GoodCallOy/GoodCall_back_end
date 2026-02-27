# Set Up a New Backend with Google Login

This guide describes how to add Google OAuth login to a new Node/Express backend, based on this repo. Use it when creating a new project or porting auth to another app.

---

## 1. Dependencies

Install:

```bash
npm install express cors cookie-parser dotenv mongoose express-session connect-mongo passport passport-google-oauth20 jsonwebtoken
npm install -D typescript ts-node @types/express @types/cookie-parser @types/cors @types/express-session @types/jsonwebtoken @types/passport @types/passport-google-oauth20
```

- **passport** + **passport-google-oauth20**: Google OAuth
- **express-session** + **connect-mongo**: Session store in MongoDB
- **cookie-parser**: Read/write cookies (e.g. JWT)
- **jsonwebtoken**: Issue JWT after Google login (optional; can use session only)
- **mongoose**: User model and DB

---

## 2. Environment Variables

Create a `.env` file (and do not commit it). Minimum for Google login:

```env
# Server
NODE_ENV=development

# MongoDB (connection string with DB name)
MONGO2_URI=mongodb+srv://USER:PASSWORD@CLUSTER.mongodb.net/YOUR_DB?retryWrites=true&w=majority

# Session (random long string; e.g. openssl rand -hex 32)
SESSION_SECRET=your-session-secret-at-least-32-chars

# Google OAuth – from Google Cloud Console
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx

# JWT (if you issue a token after login; e.g. openssl rand -hex 32)
JWT_SECRET=your-jwt-secret-at-least-32-chars
```

**Google OAuth:**

1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create or select a project → **APIs & Services** → **Credentials**.
3. **Create Credentials** → **OAuth client ID**.
4. Application type: **Web application**.
5. **Authorized redirect URIs** must include your callback URL:
   - Local: `https://localhost:3030/api/v1/auth/google/callback` (or your port)
   - Production: `https://your-api-domain.com/api/v1/auth/google/callback`
6. Copy **Client ID** and **Client Secret** into `.env`.

---

## 3. Project Structure (auth-related)

```
src/
  auth/
    passport.ts          # Passport config + Google strategy
  controllers/
    authRoutes.ts        # login, callback, logout, /me
  models/
    user.ts              # User schema (googleId, name, email, avatar, role)
  routes/
    authRoutes.ts        # Mount auth controller routes
  types/
    IUser.ts             # User interface
  db/
    dbConnection.ts      # mongoose.connect
index.ts                 # express app, session, passport, CORS, mount /api/v1/auth
```

---

## 4. User Model

**`src/types/IUser.ts`**

```ts
import { Document } from "mongoose";

export default interface IUser extends Document {
  _id: string;
  googleId: string;
  name: string;
  email?: string;
  avatar: string;
  role?: string;
  linkedUserId?: string;
  access?: string;
}
```

**`src/models/user.ts`**

```ts
import mongoose, { Schema, Model } from "mongoose";
import IUser from "../types/IUser";

const UserSchema = new Schema({
  googleId: { type: String, required: true, unique: true },
  name:     { type: String, required: true },
  email:    { type: String, unique: true },
  avatar:   { type: String, required: true },
  role:     { type: String, enum: ['admin', 'manager', 'caller'], default: 'caller', required: true },
  linkedUserId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

const User: Model<IUser> = mongoose.model<IUser>("User", UserSchema);
export default User;
```

---

## 5. Passport + Google Strategy

**`src/auth/passport.ts`**

- Use **session** (serialize/deserialize user for `req.user`).
- **Google strategy**: `clientID`, `clientSecret`, `callbackURL` from env.
- **callbackURL** must match the redirect URI in Google Cloud (and your server base URL).
- In the strategy callback: find or create user by `googleId`, then `done(null, user)`.

Example pattern (adjust callback URL and User model to your app):

```ts
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
import User from "../models/user";

dotenv.config();

const CALLBACK_URL =
  process.env.NODE_ENV === 'production'
    ? "https://YOUR-API-DOMAIN/api/v1/auth/google/callback"
    : "https://localhost:3030/api/v1/auth/google/callback";

passport.serializeUser((user: any, done) => {
  done(null, {
    id: user._id.toString(),
    role: user.role,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    googleId: user.googleId,
  });
});

passport.deserializeUser((sessionUser: any, done) => {
  done(null, sessionUser);
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });
        if (!user) {
          user = await User.create({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails?.[0]?.value,
            avatar: profile.photos?.[0]?.value ?? '',
            role: 'caller',
          });
        }
        done(null, user);
      } catch (error) {
        done(error, null);
      }
    }
  )
);

export default passport;
```

---

## 6. Auth Routes (controller)

**`src/controllers/authRoutes.ts`**

- **GET `/google`** → `passport.authenticate('google', { scope: ['profile', 'email'] })` (redirects to Google).
- **GET `/google/callback`** → `passport.authenticate('google', { failureRedirect: LOGIN_URL })`, then on success:
  - Optionally sign a JWT and set it in an HTTP-only cookie.
  - Redirect to front end (e.g. `CLIENT_URL/#/post-login`).
- **GET `/logout`** → `req.logout()` + `req.session.destroy()` + clear `connect.sid` (and token cookie if used).
- **GET `/me`** → Read JWT from cookie (or session), verify, return current user (or 401).

Set **CLIENT_URL** per environment (e.g. `https://localhost:8080` in dev, your front end origin in prod). Cookie options: `httpOnly: true`, `secure` in production, `sameSite: 'none'` in production if cross-origin.

---

## 7. Auth Router

**`src/routes/authRoutes.ts`**

- `GET /google` → login
- `GET /google/callback` → getCallback
- `GET /me` → isAuthenticated
- `GET /logout` → logoutUser

Mount in app: `app.use("/api/v1/auth", authRoutes)`.

---

## 8. App Setup (index.ts)

**Order matters.** Do this in order:

1. **dotenv** – `dotenv.config()`
2. **DB** – `connectDB()` (Mongoose)
3. **express app** – `express()`
4. **trust proxy** – `app.set('trust proxy', 1)` if behind HTTPS (e.g. Render)
5. **cookie-parser** – `app.use(cookieParser())`
6. **Session** – `express-session` with:
   - `secret: process.env.SESSION_SECRET`
   - `resave: false`, `saveUninitialized: false`
   - `cookie: { secure, sameSite, httpOnly, maxAge }`
   - `store: MongoStore.create({ mongoUrl: process.env.MONGO2_URI, collectionName: 'sessions' })`
7. **CORS** – `cors({ origin: [front-end origins], credentials: true, methods, allowedHeaders })`
8. **Body parsing** – `app.use(express.json())`, `app.use(express.urlencoded({ extended: true }))`
9. **Passport** – `app.use(passport.initialize())`, `app.use(passport.session())`
10. **Routes** – `app.use("/api/v1/auth", authRoutes)` (and any other API routes)

**HTTPS in development (optional):**  
If the front end uses `https://localhost`, run the backend with HTTPS and set the callback URL to `https://localhost:PORT/api/v1/auth/google/callback`. Use `SSL_KEY_PATH` and `SSL_CERT_PATH` in `.env` and in the server listen logic (e.g. read key/cert and use `https.createServer(sslOptions, app).listen(port)`).

---

## 9. Front End Flow

1. **Login:** User opens `GET {apiBase}/api/v1/auth/google` (or a link that does that). Backend redirects to Google.
2. **Callback:** After Google consent, Google redirects to `GET {apiBase}/api/v1/auth/google/callback`. Backend creates/loads user, sets session (and optionally JWT cookie), then redirects to the client (e.g. `https://localhost:8080/#/post-login`).
3. **Authenticated requests:** Front end uses `credentials: 'include'` (or `withCredentials: true`) so cookies (session + optional JWT) are sent.
4. **Current user:** `GET {apiBase}/api/v1/auth/me` returns the current user or 401.
5. **Logout:** `GET {apiBase}/api/v1/auth/logout` (with credentials). Backend destroys session and clears cookies.

---

## 10. Checklist

- [ ] `.env` has `MONGO2_URI`, `SESSION_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and optionally `JWT_SECRET`.
- [ ] Google Cloud OAuth redirect URI matches backend callback URL exactly (scheme, host, port, path).
- [ ] CORS `origin` includes the front end URL (and credentials: true).
- [ ] Session store uses the same MongoDB (or a valid Mongo URL).
- [ ] In production, cookies use `secure: true` and `sameSite: 'none'` if front end and API are on different origins.
- [ ] Backend runs on the same scheme/host/port as in the callback URL (or behind a proxy that preserves it).

---

## 11. Reference: This Repo’s Auth Endpoints

| Method | Path                         | Purpose                |
|--------|------------------------------|------------------------|
| GET    | /api/v1/auth/google          | Start Google login     |
| GET    | /api/v1/auth/google/callback | Google OAuth callback  |
| GET    | /api/v1/auth/me              | Current user (JWT)     |
| GET    | /api/v1/auth/logout           | Log out                |
| GET    | /api/v1/auth/authTest         | Auth route test        |

Use this doc as the single source of instructions to set up a new backend with Google login from this repo.
