const API_BASE_URL = 'http://localhost:3001';

/**
 * Sends a list of ingredients to the backend and gets a structured recipe response.
 */
export async function generateRecipe(ingredients) {
  const response = await fetch(`${API_BASE_URL}/generate-recipe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ingredients })
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({}));
    throw new Error(errorPayload.error || 'Failed to generate recipe.');
  }

  return response.json();
}

/**
 * Optional helper: sends a base64 photo to extract ingredient names.
 */
export async function extractIngredientsFromPhoto(imageBase64) {
  const response = await fetch(`${API_BASE_URL}/extract-ingredients`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64 })
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({}));
    throw new Error(errorPayload.error || 'Failed to extract ingredients from photo.');
  }

  return response.json();
}
