# Grant Assistant

A shared web app for your team to manage grant applications. One URL, one database, everyone sees the same data. Uses GPT-4o to rewrite adaptive fields tailored to each funder's priorities.

---

## Deploying to Railway (shared team access)

Railway hosts the app in the cloud so everyone on your team can access it from any browser, anywhere.

### What you'll need before starting
- A free **GitHub** account — github.com
- A **Railway** account — railway.app (sign up with your GitHub account)
- Your **OpenAI API key** — from platform.openai.com/api-keys

---

### Step 1 — Put the app on GitHub

GitHub is where the code lives. Railway reads it from there to run it.

1. Go to **github.com** and sign in
2. Click the **+** button (top right) → **New repository**
3. Name it `grant-assistant`, leave everything else as default, click **Create repository**
4. On the next page, click **uploading an existing file**
5. Drag ALL the files from the `grant-app` folder into the upload area
   - Make sure to include: `server.js`, `package.json`, `package-lock.json`, `railway.toml`, `.env.example`, the `public` folder and its contents
   - Do NOT upload the `node_modules` folder (it's large and Railway rebuilds it automatically)
6. Scroll down, click **Commit changes**

---

### Step 2 — Deploy on Railway

1. Go to **railway.app** and click **New Project**
2. Choose **Deploy from GitHub repo**
3. Select your `grant-assistant` repository
4. Railway will detect it's a Node.js app and start building — you'll see a live log. Wait for it to say "Build successful"

---

### Step 3 — Add your environment variables

This is how you give the app your OpenAI API key without putting it in the code.

1. In Railway, click on your project → click the service box
2. Click the **Variables** tab
3. Add these one by one using the **+ New Variable** button:

   | Variable name  | Value                        |
   |---------------|------------------------------|
   | OPENAI_API_KEY | sk-your-actual-key-here      |
   | OPENAI_MODEL   | gpt-4o                       |
   | DB_PATH        | /data/db                     |

4. Railway will automatically restart the app after you add variables

---

### Step 4 — Add a persistent volume (so your data is saved)

Without this step, your data resets every time Railway restarts the app.

1. In your Railway project, click **+ New** → **Volume**
2. Set the mount path to `/data`
3. Click **Add**
4. Railway restarts the app — your data will now persist forever

---

### Step 5 — Get your URL

1. In Railway, click your service → **Settings** tab → **Networking**
2. Click **Generate Domain**
3. You'll get a URL like `grant-assistant-production.up.railway.app`
4. Share this URL with your team — that's it, they just open it in a browser

---

## Costs

| Thing | Cost |
|---|---|
| GitHub | Free |
| Railway | Free tier gives $5/month credit — enough for light use. Paid from $5/month if you need more. |
| OpenAI API | Pay-as-you-go. ~$0.01–0.05 per grant generation. Typically under $5/month for normal use. |

---

## How to use the tool

**Field library** — Fill this in first. It's the single source of truth for your company.
- **Fixed fields** — facts that never change (org name, team size, patents, funding). Edit these and they update everywhere, for everyone, instantly.
- **Adaptive fields** — your base templates (problem statement, mission, funding use). The AI rewrites these per grant — your base text is the starting point, not the final output.

**Grant workspaces** — One per grant application.
1. Click **+ New grant workspace**, give it the funder's name
2. In the **Setup** tab, paste the RFP or grant brief, set a due date and status
3. Click **Generate all adaptive fields** — GPT-4o rewrites each adaptive field to match this funder's language and priorities
4. Review and edit in the **Adaptive fields** tab
5. Copy from the **Fixed fields** tab for standard answers
6. Use **Notes** for contacts, checklist items, strategy

---

## Changing the AI model

In Railway's Variables tab, change `OPENAI_MODEL` to:
- `gpt-4o` — best quality (default)
- `gpt-4o-mini` — faster and cheaper, good for drafts

---

## Your data

All data is stored in `/data/db.json` on Railway's persistent volume. It's plain JSON — you can download it anytime as a backup from Railway's volume browser.
