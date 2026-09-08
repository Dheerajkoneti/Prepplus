const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY
);

const analyzeResume = async (resumeText) => {
  try {

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash"
    });

    const prompt = `
You are an ATS Resume Analyzer.

Return ONLY JSON.

{
 "score": 0,
 "skills": [],
 "missingSkills": [],
 "suggestions": [],
 "analysis": ""
}

Resume:
${resumeText}
`;

    const result = await model.generateContent(prompt);

    const response =
      result.response.text();

    const cleaned = response
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(cleaned);

  } catch (error) {

    console.log(error);

    return {
      score: 65,
      skills: [
        "Java",
        "HTML",
        "CSS",
        "SQL",
        "MongoDB"
      ],
      missingSkills: [
        "React",
        "Node.js",
        "Python"
      ],
      suggestions: [
        "Add React projects",
        "Add internship experience",
        "Improve ATS keywords"
      ],
      analysis:
        "Gemini unavailable. Showing sample analysis."
    };
  }
};

module.exports = {
  analyzeResume
};