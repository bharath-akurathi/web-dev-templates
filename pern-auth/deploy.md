### 1. The Deployment Strategy

* **Frontend:** **Vercel** (Perfect choice. Vercel is specifically designed for Vite/React applications).
* **Backend:** **Render** (Do *not* use Vercel for your Express backend. Vercel is a "serverless" platform, meaning your Express server would spin up and shut down on every single request, leading to slow "cold starts" and breaking your database connection pool. Render is a traditional host that will keep your Express server running continuously).
* **Database:** **Neon.tech** or **Supabase**. (Both offer fantastic, permanent free tiers for PostgreSQL. Render also offers a free Postgres database, but it gets deleted after 90 days. Neon is highly recommended as a pure, drop-in Postgres database).

---

### 2. CRITICAL Code Changes Before Deploying

Because your frontend will be hosted on Vercel (e.g., `my-app.vercel.app`) and your backend on Render (e.g., `my-api.onrender.com`), they are on **different domains**. This introduces a few strict browser security rules you must handle.

#### Change 1: Cross-Domain Cookies (Backend)

Currently, your `cookieOptions` use `sameSite: "Strict"`. This tells the browser *only* to send the cookie if the frontend and backend are on the exact same domain. Because you are using Vercel and Render, you must change this to `"none"`.

In `backend/routes/auth.js`, update your `cookieOptions`:

```javascript
const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // MUST be true in production
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // "none" allows cross-domain cookies
    maxAge: 30 * 24 * 60 * 60 * 1000, 
};

```

#### Change 2: SSL Database Connection (Backend)

Cloud PostgreSQL providers (like Neon, Supabase, or AWS) require encrypted connections. You need to configure the `pg` pool to use SSL in production.

In `backend/config/db.js`, update your pool configuration:

```javascript
import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  // ADD THIS: Require SSL in production, but not on localhost
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
});
// ... rest of the file

```

*(Note: Neon often provides a single `DATABASE_URL` connection string instead of separate host/user/password variables. If you use Neon, you can just change your pool to: `const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });`)*

#### Change 3: Dynamic API URLs (Frontend)

Right now, your React app is likely hardcoded to make requests to `http://localhost:5000` (or using the Vite proxy). In production, it needs to talk to your Render URL.

**1.** Inside your `frontend` folder, create a `.env` file (and add it to `.gitignore`):

```env
VITE_API_URL=http://localhost:5000/api

```

**2.** Update your Axios calls in React to use this variable. For example, in your components or a dedicated `axios.js` file:

```javascript
import axios from "axios";

// Create an axios instance so you don't have to type the URL everywhere
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true // Crucial for cookies
});

export default api;

```

*(Then, instead of `axios.post('http://localhost:5000/api/auth/login')`, you just do `api.post('/auth/login')`)*

---

### 3. Step-by-Step Deployment Order

Always deploy in this exact order: **Database -> Backend -> Frontend**.

#### Step 1: Deploy Database (Neon.tech)

1. Go to Neon.tech and create a free PostgreSQL project.
2. It will give you connection details (Host, Database Name, User, Password). Save these.
3. Use PG Admin (or Neon's built-in SQL editor) to run your `CREATE TABLE users ...` SQL script to set up your database schema.

#### Step 2: Deploy Backend (Render)

1. Push your code to GitHub.
2. Go to Render.com and click **New > Web Service**.
3. Connect your GitHub repository and select your `backend` folder as the Root Directory.
4. Set the Build Command to `npm install` and Start Command to `npm start` (make sure your `backend/package.json` has `"start": "node server.js"`).
5. **Add Environment Variables:**
* `NODE_ENV` = `production`
* `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT` = (Paste from Neon)
* `JWT_SECRET` = (Type a random long string)
* `CLIENT_URL` = (Leave blank for a moment, we will update this after Step 3)


6. Deploy! Render will give you a URL like `https://my-pern-api.onrender.com`.

#### Step 3: Deploy Frontend (Vercel)

1. Go to Vercel.com and click **Add New > Project**.
2. Connect your GitHub repository. Select your `frontend` folder as the Root Directory.
3. Vercel automatically detects Vite.
4. **Add Environment Variables:**
* `VITE_API_URL` = `https://my-pern-api.onrender.com/api` (The Render URL you just got).


5. Deploy! Vercel will give you a URL like `https://my-pern-app.vercel.app`.

#### Step 4: Tie them together

Go back to your **Render** dashboard, go to your Backend Environment Variables, and set:

* `CLIENT_URL` = `https://my-pern-app.vercel.app` (This tells your backend's CORS to accept requests from your new Vercel site).