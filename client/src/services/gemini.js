import axios from "axios";

const API_KEY = "YOUR_GEMINI_API_KEY";

export const askGemini = async (prompt) => {
  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
      {
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      }
    );

    return (
      response.data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response received."
    );
  } catch (error) {
    console.error(error);
    return "Something went wrong.";
  }
};