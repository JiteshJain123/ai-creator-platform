import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// --- Function to list all available models ---
async function listModels() {
  console.log("--- Checking for all available models... ---");
  try {
    const result = await genAI.getGenerativeModel({ model: "" }).listModels();
    const models = result.models;
    if (models.length > 0) {
      console.log("✅ Models available to your API key:");
      models.forEach(model => {
        // Check if the model supports the 'generateContent' method
        const supportedMethods = model.supportedGenerationMethods.join(', ');
        if (supportedMethods.includes('generateContent')) {
            console.log(`  - ${model.name} (Supports: ${supportedMethods})`);
        }
      });
    } else {
      console.log("No models found. This could be a permissions issue.");
    }
  } catch (error) {
    console.error("❌ FAILED to list models.");
    console.error(error.message);
  }
  console.log("------------------------------------------");
}

// --- Function to test content generation ---
async function runTest() {
  console.log("\n--- Testing content generation... ---");
  try {
    // Using the latest recommended model for general use
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    const prompt = "In one sentence, what is the color of the sky on a clear day?";
    console.log("Generating content with a test prompt...");

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log("\n✅ SUCCESS! The Gemini API is working.");
    console.log("Response:", text);
  } catch (error) {
    console.error("\n❌ FAILED to generate content.");
    console.error(error.message);
    console.log("\nTroubleshooting Tips:");
    console.log("1. Ensure you have ENABLED the 'Vertex AI API' in your Google Cloud project.");
    console.log("2. Double-check that your GEMINI_API_KEY in the .env file is correct.");
    console.log("3. If the model list above is empty, there is a problem with your project setup or API key permissions.");
  }
  console.log("-------------------------------------");
}

// --- Run both functions ---
async function main() {
  await listModels();
  await runTest();
}

main();

