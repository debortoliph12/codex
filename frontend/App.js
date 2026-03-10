import React, { useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, View } from 'react-native';
import HomeScreen from './src/screens/HomeScreen';
import RecipeScreen from './src/screens/RecipeScreen';

export default function App() {
  const [recipe, setRecipe] = useState(null);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        {!recipe ? (
          <HomeScreen onRecipeGenerated={setRecipe} />
        ) : (
          <RecipeScreen recipe={recipe} onBack={() => setRecipe(null)} />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F7F7'
  },
  container: {
    flex: 1
  }
});
