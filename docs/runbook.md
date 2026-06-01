# Runbook — Grant Assistant

What to do when things go wrong.

\---

## The app shows "Application failed to respond" or a blank page

This means the server crashed or isn't running.

1. Go to **railway.app** and log in
2. Click on the grant-assistant project
3. Click the service box → **Deployments** tab
4. Click the most recent deployment → read the logs to find the error
5. If it crashed on startup, the logs will show a specific error message — search this document for that error, or paste it into Claude/ChatGPT for help

**Most common causes:**

* An environment variable is missing or wrong (see below)
* A bad code change was pushed to GitHub

To redeploy without any code changes: in Railway, click **Redeploy** on the latest deployment.

\---

## The app loads but AI generation does nothing or shows an error

The OpenAI API key is likely invalid, expired, or out of credit.

1. Go to **platform.openai.com** → API keys
2. Check that the key is still active
3. Go to **platform.openai.com/settings/billing** — check that there's a payment method and the account isn't blocked
4. In Railway, go to Variables tab — make sure `OPENAI\_API\_KEY` matches the key exactly (no spaces, no extra characters)
5. If you need a new key: create one on OpenAI, update the Railway variable, click Deploy

\---

## Data is gone after a Railway restart

The persistent volume isn't attached correctly.

1. In Railway, click **+ New** → **Volume**
2. Set mount path to `/data`
3. Make sure the `DB\_PATH` environment variable is set to `/data/db`
4. Redeploy

If this happens and data was lost: there is no automatic backup. Going forward, periodically download `db.json` from Railway's volume browser as a manual backup.

\---

## A field update isn't showing for other team members

This shouldn't happen — updates are live. If it does:

1. Hard refresh the browser (Ctrl+Shift+R on Windows, Cmd+Shift+R on Mac)
2. If still not showing, check Railway logs for database write errors

\---

## Environment variables reference

These live in Railway → your service → Variables tab.

|Variable|What it is|Where to get it|
|-|-|-|
|`OPENAI\_API\_KEY`|OpenAI API key|platform.openai.com/api-keys|
|`OPENAI\_MODEL`|Which GPT model to use|Set to `gpt-4o` or `gpt-4o-mini`|
|`DB\_PATH`|Where the database file lives|Must be `/data/db` on Railway|
|`PORT`|Port the server runs on|Set automatically by Railway — don't touch|

\---

## Changing the AI model

In Railway Variables, change `OPENAI\_MODEL`:

* `gpt-4o` — best quality, slightly higher cost
* `gpt-4o-mini` — faster, cheaper, good for most use cases

Click Deploy after changing.

\---

## Making changes to the app

All changes go through GitHub. The workflow is:

1. Edit the file on GitHub directly (click the file → pencil icon) or clone the repo locally
2. Commit the change
3. Railway detects the commit and redeploys automatically — takes about 2 minutes

**Files you might need to edit:**

* `server.js` — backend logic, API routes, AI prompt
* `public/index.html` — the entire frontend UI

If a deployment breaks the app, you can roll back in Railway: Deployments tab → click a previous deployment → Redeploy.

\---

## Backing up the database

The database is a single JSON file at `/data/db.json` on the Railway volume.

To download it:

1. In Railway, click your service → **Volumes** tab
2. Browse to `/data/db.json` and download

Do this before making any significant changes. There is no automated backup.

\---

## Contacts and accounts

See [**HANDOVER.md**](../HANDOVER.md) for login details and account ownership.

