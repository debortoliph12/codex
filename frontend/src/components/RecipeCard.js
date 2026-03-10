import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

/**
 * Presentational card component for recipe details.
 */
export default function RecipeCard({ recipe }) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{recipe.title}</Text>

        <View style={styles.metaRow}>
          <Text style={styles.meta}>⏱ {recipe.cookingTime}</Text>
          <Text style={styles.meta}>🔥 {recipe.calories}</Text>
        </View>

        <Text style={styles.sectionTitle}>Ingredients</Text>
        {recipe.ingredients.map((ingredient, index) => (
          <Text key={`${ingredient}-${index}`} style={styles.listItem}>
            • {ingredient}
          </Text>
        ))}

        <Text style={styles.sectionTitle}>Instructions</Text>
        {recipe.instructions.map((step, index) => (
          <Text key={`${step}-${index}`} style={styles.listItem}>
            {index + 1}. {step}
          </Text>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 24
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#222'
  },
  metaRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 10,
    marginBottom: 18
  },
  meta: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500'
  },
  sectionTitle: {
    marginTop: 8,
    marginBottom: 6,
    fontSize: 18,
    fontWeight: '600',
    color: '#333'
  },
  listItem: {
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
    marginBottom: 4
  }
});
