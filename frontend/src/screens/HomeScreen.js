import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { extractIngredientsFromPhoto, generateRecipe } from '../services/api';

export default function HomeScreen({ onRecipeGenerated }) {
  const [ingredientsInput, setIngredientsInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const onGenerate = async () => {
    if (!ingredientsInput.trim()) {
      Alert.alert('Missing ingredients', 'Please enter at least one ingredient.');
      return;
    }

    setIsLoading(true);
    try {
      const ingredients = ingredientsInput
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);

      const recipe = await generateRecipe(ingredients);
      onRecipeGenerated(recipe);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const onTakePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.status !== 'granted') {
      Alert.alert('Permission needed', 'Camera permission is required to take a photo.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      base64: true,
      quality: 0.5
    });

    if (result.canceled || !result.assets?.[0]?.base64) {
      return;
    }

    setIsLoading(true);
    try {
      const payload = await extractIngredientsFromPhoto(result.assets[0].base64);
      setIngredientsInput(payload.ingredients.join(', '));
    } catch (error) {
      Alert.alert('Photo parsing failed', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>AI Cooking Assistant</Text>
      <Text style={styles.subHeading}>Type ingredients or snap a quick photo.</Text>

      <TextInput
        multiline
        numberOfLines={4}
        value={ingredientsInput}
        onChangeText={setIngredientsInput}
        placeholder="e.g. chicken, rice, tomato, onion"
        style={styles.input}
      />

      <Pressable style={styles.secondaryButton} onPress={onTakePhoto}>
        <Text style={styles.secondaryButtonText}>📷 Take Ingredient Photo</Text>
      </Pressable>

      <Pressable style={styles.primaryButton} onPress={onGenerate} disabled={isLoading}>
        {isLoading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.primaryButtonText}>Generate Recipe</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24
  },
  heading: {
    fontSize: 30,
    fontWeight: '700',
    color: '#1E1E1E'
  },
  subHeading: {
    fontSize: 15,
    color: '#666',
    marginTop: 8,
    marginBottom: 20
  },
  input: {
    minHeight: 120,
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 14,
    textAlignVertical: 'top',
    borderColor: '#E2E2E2',
    borderWidth: 1,
    fontSize: 15
  },
  secondaryButton: {
    marginTop: 14,
    backgroundColor: '#EFEFEF',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center'
  },
  secondaryButtonText: {
    color: '#333',
    fontWeight: '600'
  },
  primaryButton: {
    marginTop: 14,
    backgroundColor: '#FF6B35',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center'
  },
  primaryButtonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16
  }
});
