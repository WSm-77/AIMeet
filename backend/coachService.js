// backend/coachService.js
import dotenv from 'dotenv';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import process from 'process';
import { fileURLToPath } from 'url';

// Wczytanie zmiennych z pliku .env do process.env
// Ścieżka domyślna szuka pliku .env w głównym katalogu, z którego odpalasz skrypt
dotenv.config();

// Pobranie klucza API ze zmiennych środowiskowych
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("BŁĄD: Brak klucza API! Upewnij się, że masz plik .env z GEMINI_API_KEY w głównym folderze.");
  process.exit(1);
}

// Inicjalizacja klienta Gemini
const genAI = new GoogleGenerativeAI(apiKey);

export async function generateCoachingCue(meetingGoals, recentTranscript) {
  // Wymuszamy na AI zwrócenie czystego obiektu JSON
  const responseSchema = {
    type: SchemaType.OBJECT,
    properties: {
      cue: {
        type: SchemaType.STRING,
        description: "Jednozdaniowa podpowiedź dla sprzedawcy, np. 'Zapytaj o budżet'. Zostaw puste, jeśli interwencja nie jest potrzebna.",
      },
      needsIntervention: {
        type: SchemaType.BOOLEAN,
        description: "True jeśli sprzedawca potrzebuje podpowiedzi, w przeciwnym razie false."
      }
    },
    required: ["cue", "needsIntervention"],
  };

  // ZMIANA TUTAJ: Używamy nowszego, dostępnego modelu Gemini 2.5 Flash
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash", 
    generationConfig: {
      temperature: 0.2, // Niska wartość = konkretne, rzeczowe podpowiedzi
      responseMimeType: "application/json",
      responseSchema: responseSchema,
    },
    systemInstruction: `
      Jesteś asystentem biznesowym w czasie rzeczywistym.
      Cel spotkania zdefiniowany przez użytkownika to: "${meetingGoals}".
      
      Zasady:
      1. Przeanalizuj fragment transkrypcji z ostatnich 30 sekund.
      2. Jeśli klient wyraża wahanie lub pojawia się idealny moment na realizację Celu, ustaw needsIntervention na true i napisz krótką podpowiedź (cue).
      3. Jeśli rozmowa toczy się dobrze, klient mówi o rzeczach neutralnych lub użytkownik radzi sobie świetnie, ustaw needsIntervention na false i zostaw cue puste.
    `
  });

  try {
    const prompt = `Transkrypcja z ostatnich 30 sekund:\n"${recentTranscript}"`;
    const result = await model.generateContent(prompt);
    
    // Parsowanie odpowiedzi
    const responseText = result.response.text();
    const parsedData = JSON.parse(responseText);

    // Zwróć podpowiedź tylko, gdy AI uzna to za konieczne
    if (parsedData.needsIntervention && parsedData.cue && parsedData.cue.trim() !== "") {
      return parsedData.cue;
    }

    return null;
  } catch (error) {
    console.error("Błąd generowania cue przez Gemini:", error);
    return null;
  }
}

// ==========================================
// --- KOD TESTOWY ---
// ==========================================
async function runTest() {
  console.log("Wysyłam zapytanie do Gemini...\n");
  
  const cel = "Przekonanie klienta do zakupu wyższego pakietu.";
  const transkrypcja = "Klient: Wersja podstawowa chyba nam wystarczy. Poza tym, trochę obawiam się o wycieki danych w chmurze, słyszałem o tym ostatnio w wiadomościach.";
  
  const cue = await generateCoachingCue(cel, transkrypcja);
  
  if (cue) {
    console.log(`✅ SUKCES! Wygenerowana podpowiedź na ekran:`);
    console.log(`💡 "${cue}"`);
  } else {
    console.log("✅ SUKCES! AI uznało, że rozmowa idzie dobrze i nie trzeba przeszkadzać.");
  }
}

// Sprawdzenie, czy plik jest uruchamiany bezpośrednio z terminala 

runTest();