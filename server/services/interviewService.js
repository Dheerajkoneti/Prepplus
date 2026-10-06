import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY
);

const model =
  genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
  });

export const generateQuestion =
  async (
    role,
    difficulty,
    previousQuestions
  ) => {

    const prompt = `
Generate ONE interview question.

Role: ${role}

Difficulty: ${difficulty}

Avoid:
${previousQuestions.join(",")}

Return only question.
`;

    const result =
      await model.generateContent(
        prompt
      );

    return result.response
      .text()
      .trim();
  };