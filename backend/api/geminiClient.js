// backend/api/geminiClient.js
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import process from 'process';

// Wczytanie zmiennych z pliku .env
// Domyślnie szuka pliku w głównym katalogu uruchomienia skryptu
dotenv.config();

// Pobranie klucza API ze zmiennych środowiskowych
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("BŁĄD: Brak klucza API! Upewnij się, że masz plik .env z GEMINI_API_KEY w głównym folderze.");
  process.exit(1);
}

// Inicjalizacja klienta Gemini
const genAI = new GoogleGenerativeAI(apiKey);

// Eksportujemy gotową instancję, aby inne pliki mogły z niej korzystać
export { genAI };