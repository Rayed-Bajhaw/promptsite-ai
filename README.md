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

## 🏗 Architecture

sequenceDiagram
    participant User
    participant Browser
    participant NextAPI as Next.js API
    participant GroqAPI as Groq API
    participant FileSystem as File System
    participant PageServer as Page Server

    User->>Browser: Enter prompt & click generate
    Browser->>NextAPI: POST /api/generate-site {prompt}
    
    rect rgb(200, 220, 255)
    Note over NextAPI,GroqAPI: AI Generation Phase
    NextAPI->>GroqAPI: POST chat.completions.create<br/>(system prompt, user prompt)
    GroqAPI-->>NextAPI: Return generated HTML
    end
    
    rect rgb(220, 255, 220)
    Note over NextAPI,FileSystem: Persistence Phase
    NextAPI->>FileSystem: Create generated-sites/site-{id}/<br/>write index.html
    FileSystem-->>NextAPI: File saved
    end
    
    NextAPI-->>Browser: { success, id, url }
    Browser->>Browser: Display site link
    
    User->>Browser: Click view generated site link
    Browser->>PageServer: GET /site/[id]
    
    rect rgb(255, 240, 220)
    Note over PageServer,FileSystem: Page Rendering Phase
    PageServer->>FileSystem: Read generated-sites/site-{id}/index.html
    FileSystem-->>PageServer: Return HTML content
    PageServer->>PageServer: Parse HTML, extract styles<br/>sanitize body with DOMPurify
    end
    
    PageServer-->>Browser: Render page with<br/>sanitized content
    Browser->>User: Display generated website
