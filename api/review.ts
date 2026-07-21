import type { VercelRequest, VercelResponse } from '@vercel/node';

interface TaskInput {
  title: string;
  priority: '80' | '60' | '20';
  completed: boolean;
}

interface DailyPlanInput {
  date: string;
  intention?: string;
  sacrifice?: string;
  comfortRefused?: string;
  tasks?: TaskInput[];
}

const SYSTEM_PROMPT = `You are the AI accountability partner inside "The Operator" — a planner for high-performing operators built on the 80/60/20 framework.

YOUR JOB:
Look back across a user's daily commitments and task completion over a period (a week or a month) and tell them the truth about their own patterns — not a generic recap. Reference specifics from the data you're given: which days they followed through, which days they didn't, what they kept saying vs. what they kept skipping.

RULES:
- Never be generic or vague ("you had a productive week"). Cite specifics: recurring 80% tasks left incomplete, comfort refusals that were broken, sacrifices that were or weren't kept.
- If the data shows a real pattern (e.g. outreach tasks get skipped every time, or a specific comfort keeps winning), name it directly.
- If there isn't enough data to find a real pattern, say that plainly instead of inventing one.
- Do not lecture or use coach-speak ("elevate," "journey," "unlock," "leverage" as a verb, "embrace").
- Talk like a peer who has actually looked at the numbers, not a hype man.

WHAT YOU GENERATE (always all 4 fields):
1. SUMMARY: 2-3 sentences on what actually happened this period. Specific, not generic.
2. PATTERNS: 1-4 specific, named patterns you can point to in the data (empty array if there's genuinely not enough data yet — don't force it).
3. SUGGESTED_REFLECTION: One honest sentence, written in first person as if the user wrote it themselves, naming where they chose comfort over their standards (or an honest "nothing to call out" if the data doesn't support one).
4. SUGGESTED_ACTION: One first-person sentence naming either what should be cut going forward, or what sacrifice actually created momentum — whichever the data supports better.

OUTPUT FORMAT:
Respond with ONLY a valid JSON object — no preamble, no explanation, no markdown code fences:
{
  "summary": "string",
  "patterns": ["string"],
  "suggestedReflection": "string",
  "suggestedAction": "string"
}`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { period, dailyPlans, context } = req.body as {
    period?: 'week' | 'month';
    dailyPlans?: DailyPlanInput[];
    context?: { operatingPrinciples?: string[]; businessContext?: string };
  };

  if (!period || !Array.isArray(dailyPlans)) {
    return res.status(400).json({ error: 'period and dailyPlans are required' });
  }

  if (dailyPlans.length === 0) {
    return res.status(200).json({
      summary: `No days logged yet this ${period}. Nothing to review until there's data.`,
      patterns: [],
      suggestedReflection: '',
      suggestedAction: '',
    });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'AI review is not configured. Set ANTHROPIC_API_KEY in the Vercel project environment variables.' });
  }

  // Compact each day into a short line so token usage stays predictable regardless of history length.
  const dayLines = dailyPlans.map((plan) => {
    const tasks = plan.tasks || [];
    const done = tasks.filter((t) => t.completed);
    const missed = tasks.filter((t) => !t.completed);
    const missed80 = missed.filter((t) => t.priority === '80').map((t) => t.title);
    return [
      `${plan.date}:`,
      plan.intention ? `intention="${plan.intention}"` : 'intention=(none set)',
      plan.sacrifice ? `sacrifice="${plan.sacrifice}"` : '',
      plan.comfortRefused ? `comfortRefused="${plan.comfortRefused}"` : '',
      `tasks ${done.length}/${tasks.length} done`,
      missed80.length ? `missed 80% tasks: ${missed80.join('; ')}` : '',
    ].filter(Boolean).join(' | ');
  });

  const contextLines: string[] = [];
  if (context?.businessContext) contextLines.push(`Business context: ${context.businessContext}`);
  if (context?.operatingPrinciples?.length) contextLines.push(`Operating principles: ${context.operatingPrinciples.join('; ')}`);

  const userMessage = [
    ...contextLines,
    `Review period: this ${period}`,
    'Daily log:',
    ...dayLines,
  ].join('\n');

  try {
    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-5',
        max_tokens: 1024,
        thinking: { type: 'disabled' },
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userMessage }],
      }),
    });

    const anthropicData = await anthropicRes.json();

    if (!anthropicRes.ok) {
      return res.status(anthropicRes.status).json({ error: anthropicData.error?.message || 'Anthropic API error' });
    }

    const text = anthropicData.content[0].text;
    const cleaned = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '');
    const parsed = JSON.parse(cleaned);
    return res.status(200).json(parsed);

  } catch (err) {
    console.error('[api/review] error:', err);
    return res.status(500).json({ error: 'Something went wrong. Try again.' });
  }
}
