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

## 📜 License

Distributed under the MIT License. Built with ❤️ by [Adarsh Khare](https://github.com/adarshkharecodes).
