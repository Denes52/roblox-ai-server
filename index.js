// index.js
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
          { role: 'system', content: 'Ты AI, возвращай чистый JSON с action и params на основе сообщения.' },
          { role: 'user', content: message }
        ]
      })
    });
    const body = await aiRes.json();
    const jsonText = body.choices[0].message.content;
    const parsed = JSON.parse(jsonText);
    return res.json(parsed);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'AI error' });
  }
});

app.get('/healthz', (req, res) => res.send('OK'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Running on port ${PORT}`));
