# How to use the Grant Assistant (v1)

Open the app URL in any browser. No install, no login (You will have to set up a new project in Railway to be able to get a URL).

---

## The two things you need to understand

**Fixed fields** — facts about the company that don't change. Team size, patents, funding history, technology overview. You write these once. The AI uses them as ground truth every time it generates anything.

**Adaptive fields** — narrative content that gets repositioned for each funder. Problem statement, mission, funding use. You write a base version once. For each grant, the AI rewrites them to match that funder's language and priorities.

> The AI will not invent facts. If something isn't in the fixed fields, it won't appear in the output. This is intentional — it's what prevents the AI from making things up.

---

## Step 1 — Keep the field library updated

This is the most important thing. Go to **Field library** in the left sidebar.

**Fixed fields to keep current:**
- Organization name, year founded, team size
- Technology overview — update whenever your tech meaningfully advances
- IP & patents — add new filings as they happen
- Prior funding — update after every round or grant award
- Revenue & traction — update when you sign new LOIs, pilots, or contracts

**Adaptive fields — your base templates:**
- Problem statement — include specific statistics you can stand behind
- Mission statement — keep this sharp and concise
- Funding use — be specific about what money goes to

To edit any field: click **Edit** on the field card, update the content, save. The update is live for everyone immediately.

To add a new field: click **+ Add field** in the top right. Choose Fixed or Adaptive, assign a category, write the content.

---

## Step 2 — Start a new grant workspace

Click **+ New grant workspace** in the left sidebar. Name it after the funder (e.g. "NSF SBIR Phase II").

Go to the **Setup** tab:
- Paste the full RFP or grant description into the text box — the more detail the better
- Set the due date
- Set the status (Draft, In progress, Submitted, etc.)

---

## Step 3 — Generate adaptive fields

Still in the Setup tab, click **Generate all adaptive fields**.

The AI reads your fixed fields and the RFP you pasted, then rewrites each adaptive field to match that funder's priorities. You'll see the text appear live as it's written. This takes about 20–30 seconds total.

To regenerate a single field (e.g. after editing the RFP): go to the **Adaptive fields** tab and click **Regenerate** on that field.

---

## Step 4 — Review and edit

Go to the **Adaptive fields** tab. Read every field carefully before using it.

Things to check:
- Are there any numbers or statistics you don't recognise? Delete them — the AI shouldn't be adding these, but always verify.
- Does the emphasis match what this funder cares about?
- Is the length appropriate?

You can edit directly in the text box. Changes save automatically.

**Word limits:** if the grant has a word limit for a specific field, type it into the word limit box on that field card. The count displays live as you edit, turning red if you're over.

---

## Step 5 — Copy and paste

**Adaptive fields tab** — hit Copy on each generated field to copy it.

**Fixed fields tab** — your standard answers (team size, patents, etc.) are listed here ready to copy. These are not AI-generated — they're pulled directly from the library.

**Notes tab** — use this for anything specific to this grant: reviewer contacts, submission checklist, strategy notes, login credentials for the submission portal.

---

## Tracking status

Each grant workspace has a status you can update as the application progresses:

| Status | When to use |
|---|---|
| Draft | Just created, not started yet |
| In progress | Actively working on it |
| Submitted | Application sent |
| Awarded | We got it |
| Rejected | Didn't get it |

Update this as things move — it's visible in the sidebar so everyone can see where each application stands.

---

## Tips

- **The AI is a first draft, not a final draft.** Always read the output. It's fast and usually good, but you are the expert on the company.
- **The richer the fixed fields, the better the output.** Vague fields produce vague output. Specific fields (exact patent numbers, exact dollar amounts, exact dates) produce specific output.
- **One workspace per funder, per submission cycle.** Don't reuse workspaces across years — create a new one so the history is preserved.

