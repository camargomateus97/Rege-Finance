import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";

// Load from .env.local
let apiKey = "";
try {
    const envContent = fs.readFileSync('.env.local', 'utf8');
    const match = envContent.match(/GEMINI_API_KEY=(.*)/);
    if (match) apiKey = match[1].trim();
} catch (e) {
    console.error("Error reading .env.local:", e.message);
}

if (!apiKey) {
    console.error("API Key not found or .env.local missing.");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
    const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro", "gemini-2.0-flash-exp"];
    console.log("Testing models with key:", apiKey.substring(0, 10) + "...");

    for (const m of models) {
        try {
            console.log(`Checking ${m}...`);
            const model = genAI.getGenerativeModel({ model: m });
            const result = await model.generateContent("Hi");
            console.log(`✅ Model ${m} is WORKING`);
        } catch (e) {
            console.log(`❌ Model ${m} FAILED: ${e.message}`);
        }
    }
}

listModels();
