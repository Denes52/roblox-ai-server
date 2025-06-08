require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const app = express();
app.use(express.json());

app.post('/ai', async (req, res) => {
  const { message } = req.body;
  try {
    const aiRes = await fetch('https://api.deepinfra.com/v1/openai/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'meta-llama/Meta-Llama-3-70B-Instruct',
        messages: [
          {
            role: 'system',
            content: `
content: `
Ты — ИИ помощник в Roblox. Игрок пишет что угодно. Твоя задача — понять суть команды и вернуть СТРОГО JSON следующего вида:

{
  "action": "build_platform", // строго по шаблону
  "params": { "x": 0, "y": 10, "z": 0 }
}

Допустимые значения action:
- "build_platform"
- "follow_player"
- "say"

Если игрок просит "следовать", всегда используй "follow_player". Если говорит "построй", всегда "build_platform". Никаких синонимов, только точные названия действий.
`

          },
          { role: 'user', content: message }
        ]
      })
    });
    const body = await aiRes.json();
    const jsonText = body.choices[0].message.content.trim();
    const parsed = JSON.parse(jsonText);
    return res.json(parsed);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'AI error', details: err.message });
  }
});

app.get('/healthz', (req, res) => res.send('OK'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Running on port ${PORT}`));
