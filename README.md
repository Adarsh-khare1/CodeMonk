# 🚀 CodeMonk — Full-Stack Competitive Programming & AI Coaching Platform

![CodeMonk Banner](https://img.shields.io/badge/CODEMONK-ENTERPRISE-38BDF8?style=for-the-badge&logo=codeforces&logoColor=white)
![Build Status](https://img.shields.io/badge/BUILD-PASSED-00F2A9?style=for-the-badge&logo=nextdotjs&logoColor=white)
![AI Integrations](https://img.shields.io/badge/AI_COACH-GEMINI_PRO-A855F7?style=for-the-badge&logo=google&logoColor=white)

**CodeMonk** is a state-of-the-art competitive programming and algorithm practice suite built with **Next.js 14 (App Router)**, **Node.js (Express)**, **MongoDB (Mongoose)**, **Judge0 / JDoodle Execution Engines**, and **Google Gemini 1.5 Flash**. CodeMonk features real-time multi-language evaluation, automated AI-driven reviews and optimization advice, interview roadmaps, timed contests, and custom streak metrics.

---

## 🌟 Key Features

### 💻 **Full-Featured Code Sandbox & Workspace**
* **Multi-Language Support**: Write, compile, and run code in **C++ (GCC)**, **Java**, **Python 3**, **JavaScript (Node)**, and **C**.
* **Dual Compilation Engine**: 
  * **JDoodle REST API**: Used for cloud executions and instant runtime assessments.
  * **Self-Hosted Judge0 Engine**: Local compilation pipeline packaged as a multi-container Docker Compose service.
* **Test Suite Verification**: Runs user code against public test cases and hidden test cases, returning metrics for execution time, memory usage, and detailed compiler diagnostics.

### 🧠 **Gemini AI Coding Coach**
* **Automated Code Review**: Instantly reviews correctness, time complexity ($O(N)$ vs $O(N^2)$), space complexity, edge-cases, and code style.
* **One-Click Optimization**: Generates optimized refactored solutions to show clean code best practices.
* **Interactive AI Chat**: Ask questions, request progressive hints, or request runtime bug explanations.
* **4-Week Target Interview Roadmaps**: Dynamically generates algorithm study schedules matching top tech companies (Google, Meta, Stripe, Amazon, Netflix, etc.).

### 📅 **Challenge Streaks & Achievements**
* **Daily Challenge Rotation**: Auto-rotating daily coding problems determined by standard date-keys (`YYYY-MM-DD`).
* **Milestone Badge Ledger**: Unlockable achievement badges based on user performance:
  * *First Blood* (First solved problem)
  * *On Fire* (3-day active solving streak)
  * *Streak Legend* (15+ days active solving streak)
  * *Array Expert* & *Tree Master* (Topic mastery badges)

### 🏆 **Timed Contests & Global Standings**
* **Contest Creator Console**: Admins can set up active or future coding contests from a registry of 1000+ problems.
* **GitHub-Style Contribution Heatmap**: Visual submission calendar directly on user profiles.
* **Real-Time Global Leaderboard**: Ranks users based on problem solving frequency, points, and streak counts.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend Client** | Next.js 14 (App Router), TypeScript, TailwindCSS, Recharts, Framer Motion, Monaco Editor |
| **Backend API** | Node.js (ESM), Express.js, MongoDB (Mongoose), JWT, Bcryptjs, Cookie Parser |
| **AI Processing** | Google Generative AI SDK (Gemini Flash & Flash-Lite models) |
| **Code Sandbox** | JDoodle REST client, Judge0 CE Docker Container API |

---

## ⚡ Setup & Local Run Guide

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/Adarsh-khare1/CodeMonk.git
cd CodeMonk

# Install root dependencies
npm install

# Install client and server packages
cd server && npm install
cd ../client && npm install
```

### 2. Configure Environment Variables (`server/.env`)
Create a `server/.env` file with these keys:
```env
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/codemonk
JWT_SECRET=your_jwt_secret_key_here

# AI Coach API Key
GEMINI_API_KEY=your_google_gemini_api_key_here

# Code Execution (Judge0)
JUDGE0_API_URL=http://localhost:2358
```

### 3. Run Self-Hosted Judge0 Engine (Optional)
If you want to run compilation locally using Docker, boot the Judge0 containers:
```bash
docker compose -f docker-compose.judge0.yml up -d
```

### 4. Run Database Seeding
Populate the database with pre-configured programming challenges:
```bash
cd server
npm run seed
```

### 5. Run Programmatic Sanity Verification
Verify your MongoDB connection, user registration, JWT generation, and Gemini AI feedback loops before boot:
```bash
# From server directory
node scripts/sanity-test.js
```

### 6. Launch Development Servers
From the root directory:
```bash
npm run dev
```
* **Frontend Portal**: `http://localhost:3000`
* **Backend API**: `http://localhost:5000`

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
