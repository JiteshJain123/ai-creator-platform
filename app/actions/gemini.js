"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import pkg from "@google/generative-ai/package.json";
console.log(
  `[VERSION CHECK] The running version of @google/generative-ai is: ${pkg.version}`
);
// --- START OF DEBUGGING SETUP ---

const apiKey = process.env.GEMINI_API_KEY;

// DEBUG LOG 1: Check if the environment variable is being read at all.
// Look for this message in your terminal where "npm run dev" is running.
console.log(
  `[GEMINI_DEBUG] Is GEMINI_API_KEY loaded? ${apiKey ? "Yes" : "NO, IT IS MISSING OR UNDEFINED!"}`
);

// IMPORTANT: Immediately throw an error if the API key is not configured.
// This prevents the 404 error and tells us the real problem.
if (!apiKey) {
  throw new Error(
    "Gemini API key is not found. Please set the GEMINI_API_KEY environment variable."
  );
}

// Initialize the AI client
const genAI = new GoogleGenerativeAI(apiKey);

// Use the latest stable model.
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// --- END OF DEBUGGING SETUP ---

export async function generateBlogContent(title, category = "", tags = []) {
  try {
    if (!title || title.trim().length === 0) {
      throw new Error("Title is required to generate content");
    }

    const prompt = `
Write a comprehensive blog post with the title: "${title}"
${category ? `Category: ${category}` : ""}
${tags.length > 0 ? `Tags: ${tags.join(", ")}` : ""}

Requirements:
- Engaging, informative content that matches the title
- Use proper HTML formatting (<h2>, <h3>, <p>, <ul>, <li>, <strong>, <em>)
- Include 3-5 main sections with subheadings
- Conversational yet professional tone
- 800-1200 words
- Include examples, actionable advice
Start directly with the introduction paragraph.
`;

    console.log("[GEMINI_DEBUG] Generating blog content for title:", title);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text();

    if (!content || content.trim().length < 100) {
      throw new Error("Generated content is too short or empty");
    }

    return {
      success: true,
      content: content.trim(),
    };
  } catch (error) {
    console.error("--- Gemini AI Error in generateBlogContent ---");
    console.error(error); // Log the full error object
    console.error("-------------------------------------------------");
    return {
      success: false,
      error: `Failed to generate content: ${error.message}`,
    };
  }
}

export async function improveContent(
  currentContent,
  improvementType = "enhance"
) {
  try {
    if (!currentContent || currentContent.trim().length === 0) {
      throw new Error("Content is required for improvement");
    }

    let prompt = "";
    // Switch statement for prompt... (same as your original code)
    switch (improvementType) {
      case "expand":
        prompt = `
Expand this blog content with more details, examples, and insights:
${currentContent}

Requirements:
- Keep existing structure
- Add more depth to each section
- Include practical examples
- Maintain tone and HTML format
`;
        break;
      case "simplify":
        prompt = `
Simplify this blog content to make it concise and readable:
${currentContent}

Requirements:
- Keep main points clear
- Remove unnecessary complexity
- Maintain HTML formatting
`;
        break;
      default: // enhance
        prompt = `
Improve this blog content by making it more engaging and well-structured:
${currentContent}

Requirements:
- Better flow and readability
- Add engaging transitions
- Include improved examples
- Maintain original HTML
`;
    }

    console.log(
      `[GEMINI_DEBUG] Improving content with type: ${improvementType}`
    );
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const improvedContent = response.text();

    return {
      success: true,
      content: improvedContent.trim(),
    };
  } catch (error) {
    console.error(
      `--- Gemini AI Error in improveContent (type: ${improvementType}) ---`
    );
    console.error(error); // Log the full error object
    console.error("---------------------------------------------------------");
    return {
      success: false,
      error: `Failed to improve content: ${error.message}`,
    };
  }
}
