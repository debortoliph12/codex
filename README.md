# AI Cooking Assistant (Expo + Node/Express)

A simple MVP mobile cooking app where users enter ingredients and get an AI-generated recipe.

## Project Structure

- `frontend/` - React Native Expo app
  - `src/components/` - reusable UI pieces
  - `src/screens/` - app screens
  - `src/services/` - API and local storage helpers
- `backend/` - Node.js + Express API server

## Features

- Ingredient input on a clean home screen
- Generate Recipe button calling AI endpoint
- Recipe output card with:
  - title
  - ingredient list
  - step-by-step instructions
  - cooking time
  - calories
- Optional camera/photo ingredient extraction
- Save favorite recipes locally with AsyncStorage

## Prerequisites

- Node.js 18+
- npm
- Expo Go app on your phone (or emulator)
- OpenAI API key

## Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Add OPENAI_API_KEY to .env
npm run dev
```

Server runs on `http://localhost:3001`.

## Frontend Setup

```bash
cd frontend
npm install
npm start
```

Then use Expo QR code to open the app.

> If running on a physical phone, replace `localhost` in `frontend/src/services/api.js`
> with your machine's LAN IP address (for example `http://192.168.1.8:3001`).

## API Endpoints

- `POST /generate-recipe`
  - body: `{ "ingredients": ["chicken", "rice", "tomato"] }`
- `POST /extract-ingredients` (optional feature)
  - body: `{ "imageBase64": "..." }`

