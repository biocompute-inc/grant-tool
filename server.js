import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { randomUUID } from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';
import { JsonDB, Config } from 'node-json-db';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(cors());
app.use(express.json());

// ─── Database ────────────────────────────────────────────────────────────────
// On Railway: set DB_PATH=/data/db in environment variables (Railway persistent volume).
// Locally: defaults to ./db.json in the project folder.
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'db');
const db = new JsonDB(new Config(DB_PATH, true, true, '/'));

async function seedIfEmpty() {
  try { await db.getData('/fields'); }
  catch {
    await db.push('/fields', [
      { id: randomUUID(), name: 'Organization name',  type: 'fixed',    category: 'Identity',   content: 'Your Company Name, Inc.' },
      { id: randomUUID(), name: 'Year founded',        type: 'fixed',    category: 'Identity',   content: '20XX' },
      { id: randomUUID(), name: 'Team size',           type: 'fixed',    category: 'Identity',   content: 'Describe your team size and key roles here.' },
      { id: randomUUID(), name: 'Technology overview', type: 'fixed',    category: 'Technology', content: 'Describe your core technology clearly and specifically.' },
      { id: randomUUID(), name: 'IP & patents',        type: 'fixed',    category: 'Technology', content: 'List any patents, provisional filings, or trade secrets.' },
      { id: randomUUID(), name: 'Prior funding',       type: 'fixed',    category: 'Financials', content: 'List all prior funding rounds, grants, and amounts with dates.' },
      { id: randomUUID(), name: 'Revenue & traction',  type: 'fixed',    category: 'Financials', content: 'List signed contracts, LOIs, pilots, or revenue figures.' },
      { id: randomUUID(), name: 'Problem statement',   type: 'adaptive', category: 'Narrative',  content: 'Describe the problem your company solves. Include specific statistics you own or can cite.' },
      { id: randomUUID(), name: 'Mission statement',   type: 'adaptive', category: 'Narrative',  content: 'State your company mission concisely.' },
      { id: randomUUID(), name: 'Funding use',         type: 'adaptive', category: 'Narrative',  content: 'Describe exactly what you will spend the grant money on, with specifics.' },
    ]);
  }
  try { await db.getData('/grants'); }
  catch { await db.push('/grants', []); }
}

await seedIfEmpty();

// ─── Anti-hallucination prompt builder ───────────────────────────────────────
function buildPrompt(fieldName, fieldBaseContent, grantName, grantDescription, fixedFields, wordLimit = null) {
  const fixedContext = fixedFields.map(f => `${f.name}:\n${f.content}`).join('\n\n');
  return `You are a professional grant writer helping a company tailor their grant application to a specific funder.

Your job is ONLY to reframe and reposition the provided content to match the funder's priorities. You must NOT invent, add, or imply any facts, statistics, claims, or details that are not explicitly stated in the company context below.

If the company context does not contain enough information to make a strong claim about something, omit that claim entirely rather than inferring or inventing it. It is better to write a shorter, accurate answer than a longer answer with any fabricated details.

COMPANY CONTEXT (treat as facts — do not alter or embellish)
------------------------------------------------------------
${fixedContext}

GRANT BEING APPLIED TO
------------------------------------------------------------
Grant name: ${grantName}
Grant description / RFP:
${grantDescription}

FIELD TO REWRITE
------------------------------------------------------------
Field name: ${fieldName}
Base content written by the team:
${fieldBaseContent}

INSTRUCTIONS
------------------------------------------------------------
Rewrite the field content above so it speaks directly to this funder's priorities and language.
- Match the tone and emphasis of the grant description
- Highlight whichever aspects of the company are most relevant to this funder
- Do NOT introduce any numbers, statistics, dates, or claims not present in the company context
- Do NOT overstate the maturity, traction, or capabilities of the technology
${wordLimit ? `- Write no more than ${wordLimit} words\n` : ''}- Return ONLY the rewritten field text — no labels, no headings, no preamble, no quotation marks`;
}

// ─── Fields API ──────────────────────────────────────────────────────────────
app.get('/api/fields', async (req, res) => {
  try { res.json(await db.getData('/fields')); }
  catch { res.json([]); }
});

app.post('/api/fields', async (req, res) => {
  const { name, type, content, category } = req.body;
  if (!name || !type || !content) return res.status(400).json({ error: 'name, type, content required' });
  const field = { id: randomUUID(), name, type, content: content.trim(), category: category?.trim() || 'General', createdAt: Date.now() };
  const fields = await db.getData('/fields');
  fields.push(field);
  await db.push('/fields', fields);
  res.json(field);
});

app.put('/api/fields/:id', async (req, res) => {
  const fields = await db.getData('/fields');
  const idx = fields.findIndex(f => f.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  fields[idx] = { ...fields[idx], ...req.body, id: fields[idx].id, createdAt: fields[idx].createdAt };
  await db.push('/fields', fields);
  res.json(fields[idx]);
});

app.delete('/api/fields/:id', async (req, res) => {
  const fields = await db.getData('/fields');
  const idx = fields.findIndex(f => f.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  fields.splice(idx, 1);
  await db.push('/fields', fields);
  const grants = await db.getData('/grants');
  for (const g of grants) { if (g.fieldOverrides) delete g.fieldOverrides[req.params.id]; }
  await db.push('/grants', grants);
  res.json({ ok: true });
});

// ─── Grants API ───────────────────────────────────────────────────────────────
app.get('/api/grants', async (req, res) => {
  try { res.json(await db.getData('/grants')); }
  catch { res.json([]); }
});

app.post('/api/grants', async (req, res) => {
  const { name, description, status, dueDate, notes } = req.body;
  if (!name) return res.status(400).json({ error: 'name required' });
  const grant = { id: randomUUID(), name, description: description || '', status: status || 'draft', dueDate: dueDate || '', notes: notes || '', fieldOverrides: {}, wordLimits: {}, createdAt: Date.now() };
  const grants = await db.getData('/grants');
  grants.push(grant);
  await db.push('/grants', grants);
  res.json(grant);
});

app.put('/api/grants/:id', async (req, res) => {
  const grants = await db.getData('/grants');
  const idx = grants.findIndex(g => g.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  grants[idx] = { ...grants[idx], ...req.body, id: grants[idx].id, createdAt: grants[idx].createdAt, fieldOverrides: grants[idx].fieldOverrides };
  await db.push('/grants', grants);
  res.json(grants[idx]);
});

app.delete('/api/grants/:id', async (req, res) => {
  const grants = await db.getData('/grants');
  const idx = grants.findIndex(g => g.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  grants.splice(idx, 1);
  await db.push('/grants', grants);
  res.json({ ok: true });
});

app.put('/api/grants/:id/overrides/:fieldId', async (req, res) => {
  const grants = await db.getData('/grants');
  const grant = grants.find(g => g.id === req.params.id);
  if (!grant) return res.status(404).json({ error: 'Not found' });
  if (!grant.fieldOverrides) grant.fieldOverrides = {};
  grant.fieldOverrides[req.params.fieldId] = req.body.content;
  await db.push('/grants', grants);
  res.json({ ok: true });
});

app.put('/api/grants/:id/wordlimits/:fieldId', async (req, res) => {
  const grants = await db.getData('/grants');
  const grant = grants.find(g => g.id === req.params.id);
  if (!grant) return res.status(404).json({ error: 'Not found' });
  if (!grant.wordLimits) grant.wordLimits = {};
  const limit = parseInt(req.body.limit);
  if (limit > 0) grant.wordLimits[req.params.fieldId] = limit;
  else delete grant.wordLimits[req.params.fieldId];
  await db.push('/grants', grants);
  res.json({ ok: true });
});
// ─── AI: generate one field (streaming) ──────────────────────────────────────
app.post('/api/grants/:id/generate/:fieldId', async (req, res) => {
  const grants = await db.getData('/grants');
  const grant = grants.find(g => g.id === req.params.id);
  const fields = await db.getData('/fields');
  const field = fields.find(f => f.id === req.params.fieldId);
  if (!grant || !field) return res.status(404).json({ error: 'Not found' });
  if (!grant.description?.trim()) return res.status(400).json({ error: 'Add a grant description first' });

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('X-Accel-Buffering', 'no');

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const wordLimit = grant.wordLimits?.[field.id] || null;
    const prompt = buildPrompt(field.name, field.content, grant.name, grant.description, fields.filter(f => f.type === 'fixed'), wordLimit);
    let fullText = '';

    const stream = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o',
      max_tokens: 1024,
      stream: true,
      messages: [{ role: 'user', content: prompt }],
    });

    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content || '';
      if (text) { fullText += text; res.write(`data: ${JSON.stringify({ delta: text })}\n\n`); }
    }

    if (!grant.fieldOverrides) grant.fieldOverrides = {};
    grant.fieldOverrides[field.id] = fullText.trim();
    await db.push('/grants', grants);

    res.write(`data: ${JSON.stringify({ done: true, content: fullText.trim() })}\n\n`);
    res.end();
  } catch (err) {
    console.error('OpenAI error:', err.message);
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
    res.end();
  }
});

// ─── AI: generate all adaptive fields (streaming) ────────────────────────────
app.post('/api/grants/:id/generate-all', async (req, res) => {
  const grants = await db.getData('/grants');
  const grant = grants.find(g => g.id === req.params.id);
  const fields = await db.getData('/fields');
  if (!grant) return res.status(404).json({ error: 'Not found' });
  if (!grant.description?.trim()) return res.status(400).json({ error: 'Add a grant description first' });

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('X-Accel-Buffering', 'no');

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const fixedFields = fields.filter(f => f.type === 'fixed');
  const adaptiveFields = fields.filter(f => f.type === 'adaptive');

  for (const field of adaptiveFields) {
    res.write(`data: ${JSON.stringify({ fieldId: field.id, status: 'start' })}\n\n`);
    try {
      let fullText = '';
      const wordLimit = grant.wordLimits?.[field.id] || null;
      const stream = await client.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4o',
        max_tokens: 1024,
        stream: true,
        messages: [{ role: 'user', content: buildPrompt(field.name, field.content, grant.name, grant.description, fixedFields, wordLimit) }],
      });
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content || '';
        if (text) { fullText += text; res.write(`data: ${JSON.stringify({ fieldId: field.id, delta: text })}\n\n`); }
      }
      if (!grant.fieldOverrides) grant.fieldOverrides = {};
      grant.fieldOverrides[field.id] = fullText.trim();
      await db.push('/grants', grants);
      res.write(`data: ${JSON.stringify({ fieldId: field.id, status: 'done', content: fullText.trim() })}\n\n`);
    } catch (err) {
      console.error(`Error on field ${field.name}:`, err.message);
      res.write(`data: ${JSON.stringify({ fieldId: field.id, status: 'error', error: err.message })}\n\n`);
    }
  }

  res.write(`data: ${JSON.stringify({ allDone: true })}\n\n`);
  res.end();
});

// ─── Frontend ─────────────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));
app.get('/{*path}', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Grant Assistant running at http://localhost:${PORT}`);
  console.log(`Model: ${process.env.OPENAI_MODEL || 'gpt-4o'}`);
});
