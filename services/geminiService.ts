
import { GoogleGenAI } from "@google/genai";

// Fix: Adhere to Gemini API guidelines by initializing directly with the environment variable
// and assuming its availability.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateCertificateText(hardwareItems: string): Promise<string> {
  const prompt = `
    Generate a formal hardware loan agreement text in Spanish. 
    The text should be a single paragraph.
    It must state that the applicant acknowledges receiving the specified hardware in good working condition and is responsible for its care and return.
    Do not include placeholders for names, dates, or signatures; just generate the main body of the agreement.
    
    The hardware being loaned is: "${hardwareItems}".
    
    Start the text with "Por medio de la presente, se hace constar que..."
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    
    const text = response.text;
    if (!text) {
      throw new Error("El modelo no generó ningún texto.");
    }
    return text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Error al comunicarse con la API de Gemini.");
  }
}
