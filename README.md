# V3 Classes Website & Coaching Management Platform

Official website and enquiry platform for **V3 Classes** (Khagaul, Bihar) — Premier coaching institute for Classes 5–12 (CBSE & Bihar Board), JEE (Main & Advanced), and NEET UG.

---

## 🚀 Features

- **Modern Responsive UI**: Interactive institute website with courses, results, faculty, testimonials, gallery, and contact sections.
- **Intelligent Assistant & Chatbot**: Interactive enquiry-focused chatbot with quick replies, automated FAQs, course guidance, and lead capture.
- **Backend API & Database**: Express.js REST API with Prisma ORM (PostgreSQL).
- **Admin Dashboard**: Portal for managing enquiries, courses, faculty, and website settings.
- **Cloudinary Integration**: Image uploads for gallery, courses, and faculty photos.

---

## 🛠️ Tech Stack

- **Frontend**: HTML5, Vanilla CSS3, JavaScript (ES6+), FontAwesome & Custom SVGs
- **Backend**: Node.js, Express.js
- **Database & ORM**: Prisma ORM with PostgreSQL
- **Authentication**: JWT, bcryptjs
- **Media**: Cloudinary
- **Hosting**: Vercel (frontend) + Render (backend)

---

## 💻 Local Development Setup

### 1. Prerequisites
- Node.js (v18 or higher)
- npm
- PostgreSQL (local instance, or use [Neon](https://neon.tech) free tier for remote)

### 2. Clone and Install
```bash
git clone <your-repo-url>
cd v3classes-website

# Install backend dependencies
cd server
npm install
```

### 3. Configure Environment Variables
```bash
# From the server/ directory:
cp .env.example .env
# Edit .env with your actual values
```

**Required `.env` variables for local development:**
```
DATABASE_URL=postgresql://user:password@localhost:5432/v3classes
JWT_SECRET=your-local-dev-secret-min-32-chars
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
FRONTEND_URL=http://localhost:8080
PORT=5000
NODE_ENV=development
ADMIN_NAME=Admin
ADMIN_EMAIL=admin@v3classes.in
ADMIN_PASSWORD=YourLocalPassword123
```

### 4. Setup Database
```bash
cd server

# Generate Prisma client
npx prisma generate

# Create database tables (creates migration)
npx prisma migrate dev --name init

# Seed the database with initial data
node prisma/seed.js
```

### 5. Run the Application
```bash
# From the project root:
node server.js
```

- **Frontend Website**: [http://localhost:8080](http://localhost:8080)
- **Backend API**: [http://localhost:5000/api](http://localhost:5000/api)
- **Admin Panel**: [http://localhost:8080/admin](http://localhost:8080/admin)

Or run backend only:
```bash
cd server
npm start
```

---

## 🌐 Production Deployment

### Architecture

```
┌─────────────────┐          ┌─────────────────┐          ┌─────────────────┐
│   Vercel         │  HTTPS   │   Render         │   SSL    │   Neon/Render   │
│   (Frontend)     │ ──────► │   (Backend API)   │ ──────► │   (PostgreSQL)   │
│   HTML/CSS/JS    │          │   Express.js      │          │   Database       │
└─────────────────┘          └─────────────────┘          └─────────────────┘
```

---

### Step A: Create a PostgreSQL Database

**Option 1: Neon (Recommended — free tier, serverless)**
1. Go to [neon.tech](https://neon.tech) and create a free account
2. Create a new project (e.g., `v3classes`)
3. Copy the connection string. It will look like:
   ```
   postgresql://user:password@ep-xyz.us-east-2.aws.neon.tech/v3classes?sslmode=require
   ```

**Option 2: Render PostgreSQL**
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New** → **PostgreSQL**
3. Fill in: Name: `v3classes-db`, Region: nearest to you
4. Click **Create Database**
5. Copy the **External Database URL** from the database info page

### Step B: Save Your Connection String
Keep your `DATABASE_URL` ready — you'll add it in Step G.

---

### Step C: Create a Render Web Service

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New** → **Web Service**
3. Connect your GitHub repository
4. Select the `v3classes-website` repository

### Step D: Set Root Directory
In the Render service settings:
- **Root Directory**: `server`

### Step E: Set Build Command
```
npm install && npx prisma generate && npx prisma migrate deploy
```

### Step F: Set Start Command
```
npm start
```

### Render Configuration Summary

| Setting | Value |
|---------|-------|
| **Runtime** | Node |
| **Root Directory** | `server` |
| **Build Command** | `npm install && npx prisma generate && npx prisma migrate deploy` |
| **Start Command** | `npm start` |
| **Health Check Path** | `/api/health` |
| **Plan** | Free (or Starter) |
| **Region** | Singapore (or nearest) |

---

### Step G: Add Environment Variables

In the Render dashboard, go to your web service → **Environment** tab.

Add **all** of the following:

| Variable | Value | Notes |
|----------|-------|-------|
| `NODE_ENV` | `production` | Required |
| `DATABASE_URL` | `postgresql://...` | From Step A |
| `JWT_SECRET` | *(random 32+ char string)* | Generate using: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `JWT_EXPIRES_IN` | `7d` | Token expiry |
| `CLOUDINARY_CLOUD_NAME` | *(your cloud name)* | From Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | *(your API key)* | From Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | *(your API secret)* | From Cloudinary dashboard |
| `FRONTEND_URL` | `https://your-site.vercel.app` | Set after Vercel deploy (Step L) |

Click **Save Changes**. Render will automatically redeploy.

---

### Step H: Run Prisma Migrations

Migrations run automatically during the build step (`npx prisma migrate deploy`).

If you need to run them manually, use the **Render Shell** tab:
```bash
npx prisma migrate deploy
```

---

### Step I: Run the Seed Command (Once)

After the first successful deployment, open the **Render Shell** tab and run:

```bash
ADMIN_NAME="Vikash Prakash" \
ADMIN_EMAIL="admin@v3classes.in" \
ADMIN_PASSWORD="YourStrongPassword123!" \
node prisma/seed.js
```

> ⚠️ **Important**: Run this only ONCE. The seed script is idempotent (safe to re-run), but you only need to do it once to populate initial data. Choose a strong admin password.

---

### Step J: Test the Health Check

Open your browser and visit:
```
https://your-backend.onrender.com/api/health
```

You should see:
```json
{ "status": "ok", "timestamp": "2026-08-27T..." }
```

---

### Step K: Configure Frontend API URL

Edit the file `api-config.js` in the project root:

```javascript
// Uncomment and set your Render backend URL:
window.V3_API_BASE = "https://your-backend.onrender.com/api";
```

Commit and push this change. Vercel will auto-deploy.

---

### Step L: Set FRONTEND_URL After Vercel Deploy

1. Deploy the frontend to Vercel (connect your GitHub repo)
2. Get your Vercel URL (e.g., `https://v3classes.vercel.app`)
3. Go back to Render → Environment Variables
4. Set `FRONTEND_URL` to your Vercel URL (e.g., `https://v3classes.vercel.app`)
5. If using a custom domain too, comma-separate: `https://v3classes.vercel.app,https://www.v3classes.in`
6. Render will auto-redeploy

---

### Step M: Final Testing

Test the complete application:

1. ✅ Visit your Vercel frontend URL
2. ✅ Submit an enquiry form — check it reaches the backend
3. ✅ Open the chatbot — verify it responds
4. ✅ Go to `/admin` — login with your admin credentials
5. ✅ Check the admin dashboard shows statistics
6. ✅ Try creating/editing a course, faculty member, or FAQ
7. ✅ Upload an image through the admin panel

---

## 🔒 Security Notes

> [!WARNING]
> **Rotate all secrets** that were previously committed to Git:
> 1. Generate a new `JWT_SECRET`
> 2. Rotate Cloudinary API keys if real values were ever committed
> 3. The admin password is no longer in source code — set via environment variables

---

## 📁 Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ Always | PostgreSQL connection string |
| `JWT_SECRET` | ✅ Always | Secret key for JWT signing (min 32 chars) |
| `JWT_EXPIRES_IN` | Optional | Token expiry (default: `7d`) |
| `CLOUDINARY_CLOUD_NAME` | ✅ Production | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | ✅ Production | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | ✅ Production | Cloudinary API secret |
| `FRONTEND_URL` | ✅ Production | Frontend URL(s) for CORS (comma-separated) |
| `PORT` | Optional | Server port (default: `5000`) |
| `NODE_ENV` | ✅ Production | Set to `production` on Render |
| `ADMIN_NAME` | Seed only | Admin name for initial seed |
| `ADMIN_EMAIL` | Seed only | Admin email for initial seed |
| `ADMIN_PASSWORD` | Seed only | Admin password for initial seed |

---

## 📄 License
All rights reserved © V3 Classes.
