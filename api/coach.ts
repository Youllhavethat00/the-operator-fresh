// =====================================================
// THE OPERATOR — AI COACH API ROUTE
// =====================================================
// Lives on Vercel as a serverless function.
// Receives user input, calls Claude API, returns structured
// JSON the frontend can drop straight into the daily planner.
//
// Why server-side: the ANTHROPIC_API_KEY never touches the
// browser, which means it can't be stolen and run up your bill.
// =====================================================

interface CoachRequest {
  userInput: string;
  context?: {
    operatingPrinciples?: string[];
    recentGoals?: string[];
    yesterdayReflection?: string;
  };
}

interface CoachResponse {
  intention: string;
  sacrifice: string;
  comfortRefused: string;
  suggestedTasks: Array<{
    title: string;
    priority: '80' | '60' | '20';
  }>;
}

const SYSTEM_PROMPT = `You are the AI coach inside "The Operator" — a planner for high-performing operators built on the 80/60/20 framework.

YOUR JOB:
Take a user's brief description of what they're trying to accomplish today, and turn it into a structured daily commitment they can act on immediately.

THE 80/60/20 FRAMEWORK:
- 80% tasks: revenue-generating, growth-driving, needle-moving work. The most leveraged thing they could be doing.
- 60% tasks: maintenance, ops, the work behind the work. Important but not exceptional.
- 20% tasks: admin, low-leverage tasks that still need to happen. Email, errands, paperwork.

WHAT YOU GENERATE (always all 4 fields):
1. INTENTION: One sharp sentence stating what the user is committing to today. Action-oriented. Starts with a verb. Under 15 words.
2. SACRIFICE: One thing they'll give up today to make the intention possible. Specific. Names what they're saying NO to. Under 12 words.
3. COMFORT_REFUSED: One specific comfortable choice they'll resist today. Concrete behavior, not abstract. Under 12 words.
4. SUGGESTED_TASKS: 3-5 tasks that ladder up to the intention. Each tagged 80, 60, or 20. Tasks should be specific actions, not vague aspirations.

TONE:
- Direct. No filler. No "you've got this!" cheerleading.
- Talk like a peer who respects the user's time.
- Match their energy — if they wrote one sentence, you respond tight.
- Never use "elevate," "imagine," "embrace," "journey," "unlock," or other coach-speak.

OUTPUT FORMAT:
Respond with ONLY a valid JSON object matching this exact shape — no preamble, no explanation, no markdown code fences:
{
  "intention": "string",
  "sacrifice": "string",
  "comfortRefused": "string",
  "suggestedTasks": [
    { "title": "string", "priority": "80" | "60" | "20" }
  ]
}`;

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'AI coach is not configured. Try again later.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const body = (await req.json()) as CoachRequest;

    if (!body.userInput || typeof body.userInput !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Tell the coach what you want to accomplish today.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (body.userInput.length > 1000) {
      return new Response(
        JSON.stringify({ error: 'Keep it short — one or two sentences works best.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    let contextBlock = '';
    if (body.context) {
      const lines: string[] = [];
      if (body.context.operatingPrinciples?.length) {
        lines.push(`Their operating principles:\n- ${body.context.operatingPrinciples.join('\n- ')}`);
      }
      if (body.context.recentGoals?.length) {
        lines.push(`Their active goals:\n- ${body.context.recentGoals.join('\n- ')}`);
      }
      if (body.context.yesterdayReflection) {
        lines.push(`Yesterday's reflection: ${body.context.yesterdayReflection}`);
      }
      if (lines.length) {
        contextBlock = `\n\nCONTEXT ABOUT THIS USER:\n${lines.join('\n\n')}`;
      }
    }

    const userPrompt = `${contextBlock}\n\nUSER'S INPUT FOR TODAY:\n"${body.userInput}"\n\nGenerate their daily commitment now. JSON only.`;

    const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 800,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });

    if (!claudeRes.ok) {
      const errText = await claudeRes.text();
      console.error('Claude API error:', claudeRes.status, errText);
      return new Response(
        JSON.stringify({ error: 'Coach is having trouble right now. Try again in a minute.' }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const claudeData = await claudeRes.json();
    const rawText = claudeData?.content?.[0]?.text;

    if (!rawText) {
      return new Response(
        JSON.stringify({ error: 'Coach returned an empty response. Try again.' }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const cleanedText = rawText.replace(/^```json\s*|\s*```$/g, '').trim();
    let parsed: CoachResponse;
    try {
      parsed = JSON.parse(cleanedText);
    } catch (e) {
      console.error('Failed to parse Claude JSON:', cleanedText);
      return new Response(
        JSON.stringify({ error: 'Coach response was malformed. Try again.' }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (
      !parsed.intention ||
      !parsed.sacrifice ||
      !parsed.comfortRefused ||
      !Array.isArray(parsed.suggestedTasks)
    ) {
      return new Response(
        JSON.stringify({ error: 'Coach response was incomplete. Try again.' }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(JSON.stringify(parsed), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('Coach handler error:', err);
    return new Response(
      JSON.stringify({ error: 'Something went wrong. Try again in a minute.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export const config = {
  runtime: 'edge',
};
