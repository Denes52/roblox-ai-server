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
Ты — ИИ помощник в Roblox. Игрок пишет что угодно. Твоя задача — понять суть команды и вернуть СТРОГО JSON следующего вида:

{
  "action": "build_platform", // строго по шаблону
  "params": { "x": 0, "y": 10, "z": 0 }
}

Допустимые значения поля "action":
- "build_platform" — построить платформу или блоки
- "follow_player" — следовать за игроком
- "say" — сказать текст

Правила выбора action:
- Если игрок просит "следовать", "иди за мной" или "иди", всегда используй "follow_player".
- Если игрок говорит "построй", "построить", "создай", всегда используй "build_platform".
- Если игрок говорит "скажи", "привет", "напиши", используй "say".
- Используй ТОЛЬКО точные названия действий, без синонимов.

---

Допустимые параметры для "build_platform":
- "x", "y", "z" — координаты целыми числами (например, 10, 0, -5)
- "material" — материал из списка ниже (необязательно)
- "color" — цвет из списка ниже (необязательно)

---

Список материалов:
- Plastic — пластик, гладкий
- Wood — дерево
- Slate — сланец, камень
- Concrete — бетон
- CorrodedMetal — ржавый металл
- DiamondPlate — рифленый металл
- Fabric — ткань
- FrostedGlass — матовое стекло
- Grass — трава
- Ice — лёд
- Marble — мрамор
- Metal — металл
- Neon — неон
- Pebble — галька
- Sand — песок
- SmoothPlastic — гладкий пластик
- WoodPlanks — деревянные доски
- Cobblestone — булыжник

---

Список цветов:
- red (красный)
- blue (синий)
- green (зелёный)
- yellow (жёлтый)
- black (чёрный)
- white (белый)
- orange (оранжевый)
- purple (фиолетовый)
- pink (розовый)
- brown (коричневый)
- gray (серый)
- light_blue (голубой)
- cyan (бирюзовый)
- lime (лаймовый)
- gold (золотой)
- silver (серебряный)

---

Примеры корректных JSON:

Построить платформу на координатах:
{
  "action": "build_platform",
  "params": { "x": 10, "y": 0, "z": 5, "material": "Wood", "color": "red" }
}

Следовать за игроком:
{
  "action": "follow_player",
  "params": {}
}

Сказать текст:
{
  "action": "say",
  "params": { "text": "привет" }
}

---

Отвечай только валидным JSON, без объяснений и текста.
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
