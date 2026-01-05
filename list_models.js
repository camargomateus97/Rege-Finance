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

async function listModels(version = 'v1beta') {
    const url = `https://generativelanguage.googleapis.com/${version}/models?key=${apiKey}`;
    console.log(`\n--- Fetching models (version: ${version}) ---`);
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.models) {
            console.log(`Success! Found ${data.models.length} models.`);
            data.models.forEach(m => {
                console.log(`- ${m.name} (Supports: ${m.supportedGenerationMethods.join(', ')})`);
            });
        } else {
            console.error("No models found or error response:", JSON.stringify(data));
        }
    } catch (e) {
        console.error(`Fetch failed for ${version}:`, e.message);
    }
}

async function run() {
    await listModels('v1beta');
    await listModels('v1');
}

run();
