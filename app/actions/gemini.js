"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("GEMINI_API_KEY environment variable is not set.");
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || "gemini-3.1-flash-lite-preview" });

// ── Generate full blog content ──────────────────────────────────────────────
export async function generateBlogContent(title, category = "", tags = []) {
  try {
    if (!title?.trim()) throw new Error("Title is required");

    const prompt = `Write a comprehensive blog post titled: "${title}"
${category ? `Category: ${category}` : ""}
${tags.length > 0 ? `Tags: ${tags.join(", ")}` : ""}

Requirements:
- Use proper HTML (<h2>, <h3>, <p>, <ul>, <li>, <strong>, <em>)
- 3-5 main sections with subheadings
- Conversational yet professional tone
- 800-1200 words
- Include examples and actionable advice
Start directly with the first paragraph.`;

    const result = await model.generateContent(prompt);
    const content = result.response.text();
    if (!content || content.trim().length < 100) throw new Error("Generated content too short");
    return { success: true, content: content.trim() };
  } catch (error) {
    return { success: false, error: `Failed to generate: ${error.message}` };
  }
}

// ── Improve existing content ────────────────────────────────────────────────
export async function improveContent(currentContent, improvementType = "enhance") {
  try {
    if (!currentContent?.trim()) throw new Error("Content is required");

    const prompts = {
      expand: `Expand this blog content with more details, examples, and insights. Keep the existing structure, add more depth, and maintain HTML formatting:\n\n${currentContent}`,
      simplify: `Simplify this blog content to make it concise and easy to read. Keep the main points, reduce complexity, and maintain HTML formatting:\n\n${currentContent}`,
      enhance: `Improve this blog content by making it more engaging and well-structured. Improve flow, add better transitions, and maintain the original HTML format:\n\n${currentContent}`,
    };

    const result = await model.generateContent(prompts[improvementType] || prompts.enhance);
    const content = result.response.text();
    return { success: true, content: content.trim() };
  } catch (error) {
    return { success: false, error: `Failed to improve content: ${error.message}` };
  }
}

// ── Suggest tags for a post ─────────────────────────────────────────────────
export async function suggestTags(title, content = "") {
  try {
    if (!title?.trim()) throw new Error("Title is required");

    const textPreview = content
      ? content.replace(/<[^>]+>/g, " ").substring(0, 500)
      : "";

    const prompt = `Suggest 6-8 relevant tags for a blog post.
Title: "${title}"
${textPreview ? `Content preview: "${textPreview}"` : ""}

Return ONLY a JSON array of lowercase tag strings. Example: ["javascript","web-development","react"]
No explanation, no markdown, just the JSON array.`;

    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();

    // Strip any markdown code fences if present
    text = text.replace(/^```[a-z]*\n?/i, "").replace(/\n?```$/i, "").trim();

    const tags = JSON.parse(text);
    if (!Array.isArray(tags)) throw new Error("Invalid tags format");

    return {
      success: true,
      tags: tags
        .map((t) => String(t).toLowerCase().trim().replace(/\s+/g, "-"))
        .filter((t) => t.length > 0 && t.length <= 30)
        .slice(0, 8),
    };
  } catch (error) {
    return { success: false, error: `Failed to suggest tags: ${error.message}` };
  }
}

// ── Generate title ideas ────────────────────────────────────────────────────
export async function generateTitleSuggestions(topic, category = "") {
  try {
    if (!topic?.trim()) throw new Error("Topic is required");

    const prompt = `Generate 5 compelling blog post titles for the topic: "${topic}"
${category ? `Category: ${category}` : ""}

Return ONLY a JSON array of title strings. Example: ["Title One","Title Two","Title Three"]
No explanation, no markdown, just the JSON array.`;

    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();
    text = text.replace(/^```[a-z]*\n?/i, "").replace(/\n?```$/i, "").trim();

    const titles = JSON.parse(text);
    if (!Array.isArray(titles)) throw new Error("Invalid titles format");

    return {
      success: true,
      titles: titles.map((t) => String(t).trim()).filter(Boolean).slice(0, 5),
    };
  } catch (error) {
    return { success: false, error: `Failed to generate titles: ${error.message}` };
  }
}
