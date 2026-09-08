// listAvailableModels.js
require("dotenv").config();

const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function test() {
  const models = [
    "gemini-2.5-flash",
    "gemini-2.5-pro",
    "gemini-2.0-flash",
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-pro"
  ];

  for (const modelName of models) {
    try {
      console.log(`\nTesting: ${modelName}`);

      const model = genAI.getGenerativeModel({
        model: modelName,
      });

      const result = await model.generateContent("hello");

      console.log("✅ WORKS");
      console.log(result.response.text());
      break;
    } catch (err) {
      console.log("❌ FAILED");
      console.log(err.status || err.message);
    }
  }
}

test();