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
Ты — ИИ помощник для Roblox. Игрок пишет в чат любые команды.  
Ты должен ПОНЯТЬ, что игрок хочет, и вернуть ТОЛЬКО корректный JSON действия:

Примеры:
{
  "action": "say",
  "text": "Привет, игрок!"
}
{
  "action": "build_platform",
  "x": 0,
  "y": 10,
  "z": 0,
  "color": "Bright red",
  "material": "Wood"
}

{
  "action": "build_stair",
  "material": "Wood",
  "height": "5",
  "near": "DenMsc",
  "side": "left"
}

{
  "action": "follow_player",
  "target": "DenMsc"
}

{
  "action": "jump",
  "repeat": "3",
  "interval": "2"
}

{
  "action": "raise_hand",
  "duration": "3"
}

❗ Возвращай ТОЛЬКО один JSON-объект. Без текста и комментариев.
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
