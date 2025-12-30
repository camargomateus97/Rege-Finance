
import { GoogleGenAI, Type } from "@google/genai";
import { Transaction } from "../types";

// Always use process.env.API_KEY directly as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getDailyQuote = async (): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Gere um único provérbio, frase estoica ou versículo bíblico (com referência) curto e inspirador sobre sabedoria financeira, diligência, trabalho honesto ou prosperidade. Retorne apenas o texto da frase, sem introduções. Máximo 20 palavras.",
      config: {
        temperature: 0.8,
      }
    });
    return response.text?.trim().replace(/^"|"$/g, '') || "O planejamento cuidadoso leva à fartura. (Provérbios 21:5)";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "O planejamento cuidadoso leva à fartura. (Provérbios 21:5)";
  }
};

export const smartParseTransaction = async (input: string, base64Image: string | null = null): Promise<Partial<Transaction> | null> => {
  try {
    const prompt = base64Image 
      ? `Analise este recibo/nota. Extraia os dados e retorne em JSON. Contexto do usuário: "${input}"`
      : `Analise o texto: "${input}". Extraia os dados para uma transação financeira e retorne em JSON.`;

    const parts: any[] = [{ text: prompt }];
    if (base64Image) {
      parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Image.split(',')[1]
        }
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            amount: { type: Type.NUMBER },
            type: { type: Type.STRING, description: "income ou expense" },
            category: { type: Type.STRING, description: "food/transport/home/entertainment/health/shopping/income/kingdom/other" },
            date: { type: Type.STRING, description: "YYYY-MM-DD" }
          },
          required: ["title", "amount"]
        }
      }
    });

    const data = JSON.parse(response.text || '{}');
    return data;
  } catch (error) {
    console.error("Gemini Error:", error);
    return null;
  }
};

export const chatWithAssistant = async (history: any[], message: string, contextData: any): Promise<string> => {
  try {
    const prompt = `Você é o Assistente Rege, um guru financeiro pessoal. Contexto do usuário (últimas transações e saldo): ${JSON.stringify(contextData)}. Pergunta do usuário: "${message}". Responda de forma concisa e útil em Português Brasileiro.`;
    
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        systemInstruction: "Você é amigável, direto ao ponto e focado em ajudar o usuário a poupar e investir melhor, respeitando os princípios de sabedoria financeira."
      }
    });

    return response.text || "Desculpe, não consegui processar sua mensagem agora.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Houve um erro na comunicação com a IA.";
  }
};

export const getExpenseTips = async (category: string, total: number, examples: string[]): Promise<string> => {
  try {
    const prompt = `Rege Ai. Categoria de maior gasto: "${category}". Total gasto: R$${total}. Itens: ${examples.join(', ')}. Forneça 3 dicas CURTAS e PRÁTICAS para economizar especificamente nesta categoria.`;
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    return response.text || "Mantenha o foco nos seus objetivos financeiros!";
  } catch (error) {
    return "Analise seus gastos para encontrar oportunidades de economia.";
  }
};
