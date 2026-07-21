# 🚀 CodeMonk — Full-Stack Competitive Programming & AI Coaching Platform

CodeMonk is a modern, full-stack LeetCode alternative built with **Next.js 14**, **Node.js/Express**, **MongoDB**, **JDoodle / Judge0 Code Execution Engine**, and **Google Gemini AI**.

It offers real-time multi-language code execution, AI-driven code reviews and optimizations, daily coding challenges, milestone achievements, company-specific interview roadmaps, and an admin control dashboard.

---

## ✨ Key Features

### 💻 Code Workspace & Execution
- **Multi-Language Support**: Write and run code in **C++**, **JavaScript**, **Python**, **Java**, and **C**.
- **Dual Execution Engine**: Powered by **JDoodle API** (cloud deployment ready) with a fallback to local **Docker Judge0**.
- **Real-Time Evaluation**: Public & hidden test case evaluation with execution time, memory usage metrics, and detailed compiler output.

### 🧠 Gemini AI Coding Coach
- **Code Review**: Automated AI feedback analyzing correctness, time/space complexity, and edge cases.
- **Code Optimizer**: One-click AI optimization for cleaner, faster, and more readable code.
- **Interactive AI Chat**: Ask questions, request hints, and get real-time assistance on any problem.
- **Company Interview Roadmaps**: Generate 4-week targeted algorithm study plans for top tech companies (Google, Meta, Amazon, Apple, Stripe, etc.).

### 🌟 Daily Coding Challenge & Achievements
- **Problem of the Day**: Featured daily challenge with 24-hour local date rotation (`YYYY-MM-DD`) and completion badges.
- **Achievements & Badges System**: Unlockable milestone badges (*First Blood*, *On Fire*, *Streak Legend*, *Array Expert*, *Tree Master*, *Daily Challenger*, *Century Club*).

### 🏆 Contests & Leaderboards
- **Live & Ended Contests**: Participate in timed contests or practice past contest problems (upsolving mode).
- **Global Leaderboard**: Track user rankings, solved problem counts, and activity streaks.
- **Activity Heatmap**: GitHub-style submission activity calendar on user profiles.

### 🛡️ Admin & Role Management
- **Role Hierarchy**: Strict `user` $\rightarrow$ `admin` $\rightarrow$ `superadmin` role management.
- **Contest Creator**: Admins can create custom contests with problem selectors spanning 1000+ problems.
- **Superadmin Dashboard**: Manage user roles and permissions in real time.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, TailwindCSS, Lucide Icons, Recharts, Framer Motion
- **Backend**: Node.js, Express.js, MongoDB, Mongoose, JWT Authentication
- **AI Integration**: Google Generative AI (Gemini SDK)
- **Code Execution**: JDoodle API / Judge0 CE
- **Authentication**: JWT, bcryptjs, Google OAuth 2.0

---

## 📁 Repository Structure

```
codeMonk/
├── client/                 # Next.js 14 Frontend Application
│   ├── app/                # Next.js App Router Pages (dashboard, problems, contests, profile, roadmaps, admin)
│   ├── components/         # Reusable UI Components & Modals
│   ├── lib/                # Auth context, API client, hooks
│   └── types/              # TypeScript definitions
│
└── server/                 # Express.js Backend API
    ├── config/             # DB & server configurations
    ├── controllers/        # Auth, Problem, Submission, Contest, AI, User controllers
    ├── middleware/         # Auth & Role verification middleware
    ├── models/             # Mongoose schemas (User, Problem, Submission, Contest)
    ├── routes/             # API routes
    ├── scripts/            # Database seeders (seedLeetcode.js, seedSuperadmin.js)
    └── services/           # Judge service & Gemini service
```

---

## ⚙️ Environment Variables

### Backend (`server/.env`)
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
GEMINI_API_KEY=your_google_gemini_api_key

# Code Execution Credentials (JDoodle)
JDOODLE_CLIENT_ID=your_jdoodle_client_id
JDOODLE_CLIENT_SECRET=your_jdoodle_client_secret

# Optional: Local Judge0 endpoint
JUDGE0_API_URL=http://localhost:2358

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### Frontend (`client/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## 🚀 Local Development Setup

### 1. Clone the repository
```bash
git clone https://github.com/adarshkharecodes/codeMonk.git
cd codeMonk
```

### 2. Set up the Backend
```bash
cd server
npm install
# Create server/.env file and add environment variables
npm run seed:leetcode  # Seed 88+ realistic problems
npm run dev            # Starts backend on http://localhost:5000
```

### 3. Set up the Frontend
```bash
cd ../client
npm install
# Create client/.env.local file
npm run dev            # Starts frontend on http://localhost:3000
```

---

## 🌐 Cloud Deployment Guide

### Deploying Backend on Render

1. Go to [Render.com](https://render.com) and create a **New Web Service**.
2. Connect your GitHub repository (`codeMonk`).
3. Set the **Root Directory** to `server`.
4. Set the **Build Command** to:
   ```bash
   npm install
   ```
5. Set the **Start Command** to:
   ```bash
   npm start
   ```
6. In **Environment Variables**, add:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `GEMINI_API_KEY`
   - `JDOODLE_CLIENT_ID`
   - `JDOODLE_CLIENT_SECRET`
7. Click **Deploy**. Copy your deployed Render backend URL (e.g. `https://codemonk-api.onrender.com`).

---

### Deploying Frontend on Vercel

1. Go to [Vercel.com](https://vercel.com) and click **Add New Project**.
2. Import your GitHub repository (`codeMonk`).
3. Select **Root Directory** as `client`.
4. Framework Preset will automatically be detected as **Next.js**.
5. Under **Environment Variables**, add:
   - `NEXT_PUBLIC_API_URL` = `https://your-render-backend-url.onrender.com/api`
6. Click **Deploy**. Your CodeMonk web application is live! 🎉

---

## 📜 License

Distributed under the MIT License. Built with ❤️ by [Adarsh Khare](https://github.com/adarshkharecodes).
