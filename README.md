# 🚀 AI Website Generator — Fully Automated CI/CD + PR Review + Deployment

This project automatically generates complete websites from a user prompt using AI (Groq), then:

✅ Creates a new GitHub branch  
✅ Uploads generated HTML  
✅ Opens a Pull Request  
✅ Triggers CodeRabbit automated review  
✅ Deploys to Vercel automatically after merging  
✅ Hosts the final website at `/site/<id>`  

No manual coding required — everything is automated.

---

## ⭐ Features

### 🔹 AI-Powered Website Generation
- Uses Groq `llama-3.1-8b-instant` to generate clean, production-ready HTML.
- Supports custom prompts and multiple design layouts.
- Outputs fully responsive UI using inline CSS.

### 🔹 GitHub Automation
- Auto-creates branches (`site-<timestamp>`).
- Uploads files via GitHub Contents API.
- Auto-opens Pull Requests with metadata.
- CodeRabbit reviews PRs instantly.

### 🔹 Vercel Deployment Pipeline
- Vercel deploy hook automatically builds each merged PR.
- `/site/<id>` loads generated website directly from GitHub RAW file.
- Completely serverless — works even without file system writes.

### 🔹 Secure Rendering
- HTML sanitized at build time.
- SSR compatible.
- No unsafe script execution.

---
