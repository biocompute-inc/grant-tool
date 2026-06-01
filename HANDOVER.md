# Handover Document — Grant Assistant

*Written by the original builder. Last updated April 2026.*

Read this before touching anything.

\---

## Accounts you need access to

|Service|What for|Who owns it|
|-|-|-|
|Railway|Hosting — the app runs here|*(create a new account)*|
|OpenAI|AI API — costs money per use|*(create new key)*|
|GitHub|Code lives here|*(add you as collaborator or transfer repo)*|

\---

## Why this tool exists

Grant applications were taking way too long. The root problem was that company knowledge was scattered — across documents, emails, and people's heads. Every application meant hunting down the latest version of everything before writing could even start.

The obvious fix was a central repository, but repositories die without a reason to use them. The incentive layer is the AI positioning assistant. teammates come back to the tool because it gives them strong first drafts, and every time they come back they also keep the data fresh. The database stays updated as a byproduct of a tool people actually want to use.

\---

## How the tool works (non-technical)

Two types of content live in the field library:

* **Fixed fields** — company facts that don't change (team, patents, funding). Written once, used everywhere.
* **Adaptive fields** — narrative content (problem statement, mission, funding use). The AI rewrites these per grant based on the funder's RFP.

Each grant gets a workspace. You paste the RFP, hit Generate, and the AI reads the fixed fields + RFP and produces tailored first drafts for each adaptive field. The team reviews, edits, and copies into the application form.

\---

## How the tool works (technical)

* **Backend:** `server.js` — Node.js + Express. Handles all API routes and the OpenAI streaming integration.
* **Frontend:** `public/index.html` — React loaded via CDN, no build step required. The entire UI is in this one file.
* **Database:** JSON file stored at `/data/db.json` on Railway's persistent volume. Uses `node-json-db` for atomic reads/writes.
* **AI:** OpenAI Chat Completions API with streaming. The prompt is built in `buildPrompt()` in `server.js`. It's designed to prevent hallucination — the model is explicitly told to use only the facts provided and omit rather than infer anything missing.
* **Deployment:** Railway. Any push to the main branch on GitHub triggers an automatic redeploy.

\---

## Decisions made and why

**Why a JSON file instead of a proper database?**
Simplicity. The data volume is small (a few dozen fields, a few dozen grants), concurrency is low (small team), and a JSON file on a persistent volume requires zero setup. If the team grows significantly or multiple people are editing simultaneously and hitting conflicts, migrate to SQLite or Postgres.

**Why OpenAI instead of Anthropic/Claude?**
Switched to OpenAI because it was found to do better when it comes to writing. You could change it in `server.js` — see the `buildPrompt` function and the streaming routes.

**Why no login/auth?**
It's a small internal team sharing one URL. Auth adds friction without adding much value at this scale. If the team grows, or if there's a reason to attribute edits to specific people, add auth - Clerk or Auth0 are both easy to integrate with this stack.

**Why Railway instead of Vercel/Netlify?**
This app has a persistent server and a file-based database — it needs to run as a long-lived process, which Vercel/Netlify's serverless model doesn't support well. Railway runs it as a proper server.

\---

## Known issues and limitations

* **No automated database backup.** The database is a single JSON file. If the Railway volume is corrupted or accidentally deleted, data is gone. Download `db.json` from the Railway volume browser periodically and keep a copy somewhere safe.
* **No auth.** Anyone with the URL can edit everything. Fine for a small trusted team, worth revisiting if the team grows.
* **No due date notifications.** There's a notes field on each grant workspace to track deadlines, but there's no automated reminder system. This was scoped for a future version — Slack or email notifications via a daily scheduled job would be the right approach.
* **Per-workspace adaptive fields** — currently, adaptive fields are defined globally in the field library and apply to every grant workspace. Different grants often need different adaptive fields entirely. The fix is to allow teams to add grant-specific adaptive fields directly inside a workspace, without going back to the library. The library should remain the default starting point, but workspaces should be able to extend or override it locally.
* **The AI prompt is in English only.** If you ever apply to non-English-language funders, the prompt would need updating.

\---

## What was planned but not built

* **Due date notifications** — email or Slack alerts when a grant deadline is approaching
* **Per-workspace adaptive fields** - Fields you can add locally in each grant workspace
* **Field-level version history** — see what a field said before the last edit

\---

## If something breaks

See [**docs/runbook.md**](docs/runbook.md) for step-by-step troubleshooting.

For anything not covered there, the codebase is straightforward — `server.js` is well-commented and `public/index.html` has clear section headers. The most useful thing to do is paste the error message from Railway's deployment logs into Claude or ChatGPT with the relevant section of the code.

