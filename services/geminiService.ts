
import { GoogleGenAI, Type } from "@google/genai";

// Initialize the Google GenAI SDK with the API key from environment variables as per requirements
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const parseInvoiceText = async (text: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Parse the following informal billing text into a structured JSON format. 
    Input: "${text}"
    
    If products are mentioned with prices and quantities, list them. 
    If a customer name or phone is mentioned, extract it.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          customerName: { type: Type.STRING },
          phone: { type: Type.STRING },
          items: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                quantity: { type: Type.NUMBER },
                price: { type: Type.NUMBER }
              },
              required: ["name", "quantity", "price"]
            }
          }
        }
      }
    }
  });

  try {
    return JSON.parse(response.text);
  } catch (e) {
    console.error("Failed to parse AI response", e);
    return null;
  }
};

export const analyzeBusiness = async (invoices: any[], products: any[]) => {
  const data = JSON.stringify({ invoices, products });
  const response = await ai.models.generateContent({
    // Using gemini-3-pro-preview for complex business analysis reasoning tasks
    model: 'gemini-3-pro-preview',
    contents: `Analyze this business data and provide 3 short, actionable insights for a business owner. 
    Data: ${data}
    Return as a simple bulleted list of strings.`,
    config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
        }
    }
  });
  
  try {
    return JSON.parse(response.text);
  } catch {
    return ["Monitor your top selling items", "Follow up on unpaid invoices", "Stock up on fast-moving goods"];
  }
};
