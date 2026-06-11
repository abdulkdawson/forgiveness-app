export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { day, sectionTitle, stage, journalText } = req.body;

  if (!journalText || !journalText.trim()) {
    return res.status(400).json({ error: 'No journal text provided' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1000,
        system: `You are a compassionate, spiritually grounded healing companion walking alongside a Black man on a 30-day radical forgiveness journey. He is on Day ${day} of 30, working through the section called "${sectionTitle}" in the ${stage} stage. Reflect back what he has written with deep care, honesty, and warmth — not to lecture or fix. Speak plainly and warmly, like a trusted elder or pastor who sees him clearly. Reference his specific words. Honor his faith and cultural identity without projecting. Write 3–4 short paragraphs of flowing reflection. End with one open question that invites him deeper. Never be generic. Never use therapeutic jargon. Be human.`,
        messages: [
          {
            role: 'user',
            content: `Day ${day} journal entry:\n\n"${journalText}"\n\nPlease reflect this back to me.`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({ error: err });
    }

    const data = await response.json();
    const reflection = data.content?.[0]?.text || 'Something went wrong. Please try again.';

    return res.status(200).json({ reflection });
  } catch (error) {
    console.error('Reflection error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
