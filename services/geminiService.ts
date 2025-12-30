
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { Transaction } from "../types";

// Always use process.env.API_KEY directly as per guidelines
const apiKey = process.env.API_KEY || "";
if (!apiKey) {
  console.error("❌ Erro Crítico: API Key do Gemini não encontrada! Verifique o arquivo .env.local e a variável GEMINI_API_KEY.");
}

const genAI = new GoogleGenerativeAI(apiKey);

export const getDailyQuote = async (): Promise<string> => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.8,
      }
    });

    const prompt = "Gere um único provérbio, frase estoica ou versículo bíblico (com referência) curto e inspirador sobre sabedoria financeira, diligência, trabalho honesto ou prosperidade. Retorne apenas o texto da frase, sem introduções. Máximo 20 palavras.";

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim().replace(/^"|"$/g, '') || "O planejamento cuidadoso leva à fartura. (Provérbios 21:5)";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "O planejamento cuidadoso leva à fartura. (Provérbios 21:5)";
  }
};

export const smartParseTransaction = async (input: string, base64Image: string | null = null): Promise<Partial<Transaction> | null> => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            title: { type: SchemaType.STRING },
            amount: { type: SchemaType.NUMBER },
            type: { type: SchemaType.STRING, description: "income ou expense" },
            category: { type: SchemaType.STRING, description: "food/transport/home/entertainment/health/shopping/income/kingdom/other" },
            date: { type: SchemaType.STRING, description: "YYYY-MM-DD" }
          },
          required: ["title", "amount"]
        }
      }
    });

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

    const result = await model.generateContent(parts);
    const response = await result.response;
    const text = response.text();
    const data = JSON.parse(text || '{}');
    return data;
  } catch (error) {
    console.error("Gemini Error:", error);
    return null;
  }
};

export const chatWithAssistant = async (history: any[], message: string, contextData: any): Promise<string> => {
  try {
    // Note: To use history properly, you'd use startChat. 
    // Adapting previous logic which was single-turn but took history arg.
    // Enhanced to actually include history in the prompt context if needed, 
    // but for now keeping it simple as a robust single turn with context.

    // We can also initiate a chat session if we want multi-turn. 
    // For now, let's stick to the prompt engineering approach to minimize risk of state issues,
    // but fix the connection.

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: "Você é o Assistente Rege, um guru financeiro pessoal. Você é amigável, direto ao ponto e focado em ajudar o usuário a poupar e investir melhor, respeitando os princípios de sabedoria financeira."
    });

    const prompt = `Contexto do usuário (últimas transações e saldo): ${JSON.stringify(contextData)}. Pergunta do usuário: "${message}". Responda de forma concisa e útil em Português Brasileiro.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text() || "Desculpe, não consegui processar sua mensagem agora.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Houve um erro na comunicação com a IA.";
  }
};

export const getExpenseTips = async (category: string, total: number, examples: string[]): Promise<string> => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Rege Ai. Categoria de maior gasto: "${category}". Total gasto: R$${total}. Itens: ${examples.join(', ')}. Forneça 3 dicas CURTAS e PRÁTICAS para economizar especificamente nesta categoria.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text() || "Mantenha o foco nos seus objetivos financeiros!";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Analise seus gastos para encontrar oportunidades de economia.";
  }
};
