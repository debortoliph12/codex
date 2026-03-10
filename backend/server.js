import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import OpenAI from 'openai';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Health check for quick local verification.
 */
app.get('/health', (_, res) => {
  res.json({ ok: true });
});

/**
 * Main endpoint required by the MVP.
 * Expects: { ingredients: ["chicken", "rice"] }
 */
app.post('/generate-recipe', async (req, res) => {
  try {
    const ingredients = Array.isArray(req.body.ingredients)
      ? req.body.ingredients.filter(Boolean)
      : [];

    if (!ingredients.length) {
      return res.status(400).json({ error: 'Please provide an ingredients array.' });
    }

    const prompt = `You are a helpful cooking assistant. Build one recipe using these ingredients: ${ingredients.join(
      ', '
    )}.

Return ONLY valid JSON with this shape:
{
  "title": "Recipe name",
  "ingredients": ["item 1", "item 2"],
  "instructions": ["step 1", "step 2"],
  "cookingTime": "e.g. 30 minutes",
  "calories": "e.g. 450 kcal"
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      response_format: { type: 'json_object' }
    });

    const content = completion.choices[0]?.message?.content;
    const recipe = JSON.parse(content || '{}');

    if (!recipe.title || !Array.isArray(recipe.ingredients) || !Array.isArray(recipe.instructions)) {
      return res.status(502).json({ error: 'AI returned invalid recipe format.' });
    }

    return res.json(recipe);
  } catch (error) {
    return res.status(500).json({
      error: 'Recipe generation failed.',
      details: error.message
    });
  }
});

/**
 * Optional endpoint for photo-based ingredient extraction.
 * Expects: { imageBase64: "..." }
 */
app.post('/extract-ingredients', async (req, res) => {
  try {
    const { imageBase64 } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'imageBase64 is required.' });
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Identify visible food ingredients in this image and return ONLY JSON like {"ingredients": ["item1", "item2"]}. Keep names simple.'
            },
            {
              type: 'image_url',
              image_url: { url: `data:image/jpeg;base64,${imageBase64}` }
            }
          ]
        }
      ],
      response_format: { type: 'json_object' }
    });

    const content = completion.choices[0]?.message?.content;
    const payload = JSON.parse(content || '{}');

    if (!Array.isArray(payload.ingredients)) {
      return res.status(502).json({ error: 'AI returned invalid extraction format.' });
    }

    return res.json(payload);
  } catch (error) {
    return res.status(500).json({
      error: 'Ingredient extraction failed.',
      details: error.message
    });
  }
});

app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`);
});
