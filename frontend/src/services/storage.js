import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITES_KEY = '@ai_cooking_favorites';

export async function getFavorites() {
  const raw = await AsyncStorage.getItem(FAVORITES_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function saveFavorite(recipe) {
  const current = await getFavorites();

  // Prevent duplicate favorites by title.
  if (current.some((item) => item.title === recipe.title)) {
    return current;
  }

  const updated = [recipe, ...current];
  await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
  return updated;
}

export async function removeFavorite(title) {
  const current = await getFavorites();
  const updated = current.filter((item) => item.title !== title);
  await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
  return updated;
}
