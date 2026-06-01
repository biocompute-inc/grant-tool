# Grant Assistant

A shared web tool for writing and managing grant applications. One URL, one database, the whole team — no install required.

**Live app:** *(paste your Railway URL here)*
**Repo:** github.com/biocompute-inc/grant-tool

\---

## What it does

Grant applications used to take way too long. This tool gets them to \~2 days.

The core idea: keep all company knowledge in one place (the field library), then use AI to rewrite the narrative parts of each application to match each funder's specific priorities. The AI output is only as good as the information in the library — so keeping the library updated is the most important thing the team can do.

\---

## For the team (no technical knowledge needed)

Open the URL above in any browser. That's it. No install, no login.

See [**docs/how-to-use.md**](docs/how-to-use.md) for a full walkthrough.

**The one thing you must do:** keep the Field Library updated. Every time something changes — new hire, new patent, new funding round, new customer — update the relevant fixed field. The AI reads these fields every time it generates content, so stale data means weaker output.

\---

## For whoever maintains this

The app runs on Railway. All credentials and account access details are in [**HANDOVER.md**](HANDOVER.md) — read that first.

See [**docs/runbook.md**](docs/runbook.md) for what to do when things break.

\---

## Files in this repo

```
server.js          — backend: API routes, database, OpenAI integration
public/index.html  — frontend: the full UI (React, no build step)
railway.toml       — Railway deployment config
package.json       — Node.js dependencies
docs/
  how-to-use.md    — user guide for the team
  runbook.md       — troubleshooting and maintenance
HANDOVER.md        — accounts, decisions, known issues, next steps
```

\---

## Tech at a glance

|Layer|What|
|-|-|
|Frontend|React (loaded via CDN, no build step needed)|
|Backend|Node.js + Express|
|Database|JSON file on Railway persistent volume (`/data/db.json`)|
|AI|OpenAI API — GPT-4o mini by default|
|Hosting|Railway|



