// backend/services/coachService.js
import { SchemaType } from '@google/generative-ai';
import { genAI } from '../api/geminiClient.js'; 
import process from 'process';
import { fileURLToPath } from 'url';

export async function generateCoachingCue(meetingGoals, recentTranscript) {
  const responseSchema = {
    type: SchemaType.OBJECT,
    properties: {
      cue: {
        type: SchemaType.STRING,
        description: "Jednozdaniowa podpowiedź dla sprzedawcy.",
      },
      needsIntervention: {
        type: SchemaType.BOOLEAN,
        description: "True jeśli sprzedawca potrzebuje podpowiedzi, w przeciwnym razie false."
      }
    },
    required: ["cue", "needsIntervention"],
  };

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      temperature: 0.2, 
      responseMimeType: "application/json",
      responseSchema: responseSchema,
    },
    systemInstruction: `Jesteś asystentem biznesowym w czasie rzeczywistym.
      Cel spotkania: "${meetingGoals}".
      Zasady:
      1. Przeanalizuj fragment transkrypcji z ostatnich 30 sekund.
      2. Jeśli klient wyraża wahanie lub to idealny moment na Cel, ustaw needsIntervention na true i napisz krótką podpowiedź (cue).
      3. Jeśli rozmowa toczy się dobrze, ustaw needsIntervention na false i zostaw cue puste.`
  });

  try {
    const prompt = `Transkrypcja:\n"${recentTranscript}"`;
    const result = await model.generateContent(prompt);
    
    const parsedData = JSON.parse(result.response.text());

    if (parsedData.needsIntervention && parsedData.cue && parsedData.cue.trim() !== "") {
      return parsedData.cue;
    }
    return null;
  } catch (error) {
    console.error("Błąd generowania cue:", error);
    return null;
  }
}

// --- TEST ---
async function runTest() {
  console.log("Generuję CUE...\n");
  const cel = "Przekonanie klienta do zakupu wyższego pakietu.";
  const transkrypcja = "Klient: Trochę obawiam się o wycieki danych w chmurze.";
  const cue = await generateCoachingCue(cel, transkrypcja);
  
  if (cue) console.log(`💡 "${cue}"`);
  else console.log("Brak podpowiedzi.");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) runTest();