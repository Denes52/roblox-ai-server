require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const app = express();
app.use(express.json());

const systemPrompt = `
Ты — ИИ‑помощник в Roblox. Игрок пишет что угодно. Твоя задача — понять суть команды и вернуть СТРОГО JSON по одному из шаблонов ниже.

Примеры допустимых JSON:

{"action": "place_block", "position": [10, 5, 3], "color": "red", "near": "игрок", "side": "слева"}
{"action": "build_stair", "material": "Wood", "height": 5, "near": "игрок", "side": "справа"}
{"action": "build_bridge", "material": "Wood", "length": 10, "near": "игрок", "side": "спереди"}
{"action": "say", "text": "привет"}
{"action": "follow_player"}
{"action": "move", "direction": "вперед", "distance": 10, "speed": 5}
{"action": "raise_hand", "angle": 90, "direction": "вверх"}
{"action": "pickup", "near": "стол"}
{"action": "stop"}

… (добавьте сюда остальные шаблоны при необходимости) …

Возвращай ТОЛЬКО JSON. Если команда не распознана, верни:
{"action": "unknown"}

`;

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
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ]
      })
    });

    const body = await aiRes.json();
    const jsonText = body.choices[0].message.content.trim();

    let parsed;
    try {
      parsed = JSON.parse(jsonText);
      if (!parsed.action) throw new Error();
    } catch (e) {
      parsed = { action: "unknown" };
    }

    res.json(parsed);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'AI error', details: err.message });
  }
});

app.get('/healthz', (req, res) => res.send('OK'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Running on port ${PORT}`));
