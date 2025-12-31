
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { Transaction, ChatMessage } from "../types";

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

export const chatWithAssistant = async (history: ChatMessage[], message: string, contextData: any): Promise<string> => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: `Você é o Rege, um assistente financeiro pessoal, sábio e amigável.
      
      SEU OBJETIVO:
      Ajudar o usuário a organizar suas finanças, economizar dinheiro e investir com sabedoria.
      Seja direto, empático e use emojis ocasionalmente para manter o tom leve.
      
      DADOS DO USUÁRIO AGORA:
      ${JSON.stringify(contextData)}
      
      DIRETRIZES:
      1. Responda em Português do Brasil.
      2. Use formatação Markdown (negrito, listas) para facilitar a leitura.
      3. Se o usuário perguntar sobre saldo ou transações, use os dados fornecidos acima.
      4. Se não souber algo, admita e sugira como o usuário pode encontrar a informação.`
    });

    // Filtering history to exclude the very last message if it matches 'message' (which is the current user prompt)
    const historyForGemini = history
      .slice(0, history.length - 1)
      .filter(h => h.role === 'user' || h.role === 'ai')
      .map(msg => ({
        role: msg.role === 'ai' ? 'model' : 'user',
        parts: [{ text: msg.text }]
      }));

    const chatSession = model.startChat({
      history: historyForGemini,
      generationConfig: {
        maxOutputTokens: 1000,
      },
    });

    const result = await chatSession.sendMessage(message);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "Desculpe, estou tendo dificuldades para conectar com seu assistente financeiro no momento. Tente novamente em instantes.";
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
