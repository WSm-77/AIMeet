// backend/services/notesService.js
import { SchemaType } from '@google/generative-ai';
import { genAI } from '../api/geminiClient.js'; 
import process from 'process';
import { fileURLToPath } from 'url';

export async function generateMeetingNotes(transcript) {
  // Wymuszamy na AI zwrócenie pięknego obiektu z podziałem na sekcje
  const responseSchema = {
    type: SchemaType.OBJECT,
    properties: {
      summary: {
        type: SchemaType.STRING,
        description: "Krótkie podsumowanie rozmowy (1-2 akapity).",
      },
      actionItems: {
        type: SchemaType.ARRAY,
        items: { type: SchemaType.STRING },
        description: "Lista zadań do wykonania po spotkaniu (np. 'Wysłać umowę do piątku'). Zostaw puste, jeśli brak.",
      },
      keyDecisions: {
        type: SchemaType.ARRAY,
        items: { type: SchemaType.STRING },
        description: "Kluczowe decyzje podjęte podczas spotkania. Zostaw puste, jeśli brak.",
      }
    },
    required: ["summary", "actionItems", "keyDecisions"],
  };

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      temperature: 0.3, // Lekko wyższa temperatura, by tekst był bardziej naturalny
      responseMimeType: "application/json",
      responseSchema: responseSchema,
    },
    systemInstruction: `Jesteś profesjonalnym sekretarzem biznesowym. 
      Twoim zadaniem jest stworzenie czytelnych notatek na podstawie transkrypcji ze spotkania.
      Zignoruj niepotrzebne wtrącenia (np. "yyy", "aha") i skup się na konkretach.`
  });

  try {
    const prompt = `Oto transkrypcja ze spotkania:\n"${transcript}"`;
    const result = await model.generateContent(prompt);
    
    // Zwracamy gotowy, zorganizowany obiekt JSON
    return JSON.parse(result.response.text());
  } catch (error) {
    console.error("Błąd generowania notatek:", error);
    return null;
  }
}

// ==========================================
// --- KOD TESTOWY ---
// ==========================================
async function runTest() {
  console.log("Generuję NOTATKI...\n");
  
  const transkrypcja = `
    Sprzedawca: Dzień dobry! Cieszę się, że się zdzwaniamy. Jak tam Wasz obecny system HR?
    Klient: Dzień dobry. No, działa dość wolno. Chcielibyśmy przejść na coś w chmurze, ale martwimy się budżetem. Mamy na to max 5000 zł miesięcznie.
    Sprzedawca: Rozumiem. Nasz pakiet Pro kosztuje 4500 zł i w pełni pokrywa Wasze potrzeby. Co więcej, możemy pomóc w migracji danych.
    Klient: Brzmi dobrze. Zróbmy tak: podeślijcie mi umowę, a ja skonsultuję to z prezesem do czwartku.
    Sprzedawca: Super, wyślę projekt umowy zaraz po spotkaniu.
  `;
  
  const notes = await generateMeetingNotes(transkrypcja);
  
  if (notes) {
    console.log("📝 PODSUMOWANIE:");
    console.log(notes.summary);
    
    console.log("\n📌 DO ZROBIENIA (Action Items):");
    notes.actionItems.forEach(item => console.log(`- ${item}`));
    
    console.log("\n✅ DECYZJE:");
    notes.keyDecisions.forEach(item => console.log(`- ${item}`));
  } else {
    console.log("Błąd podczas generowania notatek.");
  }
}

// Sprawdzamy, czy plik odpalono bezpośrednio z terminala
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runTest();
}