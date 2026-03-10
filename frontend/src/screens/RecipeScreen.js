import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import RecipeCard from '../components/RecipeCard';
import { getFavorites, removeFavorite, saveFavorite } from '../services/storage';

export default function RecipeScreen({ recipe, onBack }) {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    getFavorites().then(setFavorites).catch(() => {
      Alert.alert('Storage error', 'Could not load favorite recipes.');
    });
  }, []);

  const isFavorite = useMemo(
    () => favorites.some((item) => item.title === recipe.title),
    [favorites, recipe.title]
  );

  const toggleFavorite = async () => {
    try {
      const updated = isFavorite
        ? await removeFavorite(recipe.title)
        : await saveFavorite(recipe);
      setFavorites(updated);
    } catch {
      Alert.alert('Storage error', 'Could not update favorites.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.actionsRow}>
        <Pressable style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </Pressable>
        <Pressable style={styles.favoriteButton} onPress={toggleFavorite}>
          <Text style={styles.favoriteButtonText}>
            {isFavorite ? '★ Saved' : '☆ Save'}
          </Text>
        </Pressable>
      </View>

      <RecipeCard recipe={recipe} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 18
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#EAEAEA',
    borderRadius: 10
  },
  backButtonText: {
    fontWeight: '600',
    color: '#333'
  },
  favoriteButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FFECCB',
    borderRadius: 10
  },
  favoriteButtonText: {
    fontWeight: '700',
    color: '#8C5A00'
  }
});
