require("dotenv").config();

const API_KEY =
  process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.error(
    "❌ GEMINI_API_KEY is missing from .env"
  );
  process.exit(1);
}

async function listModels() {
  try {
    const url =
      `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

    const response =
      await fetch(url);

    const data =
      await response.json();

    console.log(
      "\n=============================="
    );

    console.log(
      "Gemini API Model Check"
    );

    console.log(
      "==============================\n"
    );

    if (!response.ok) {
      console.error(
        "❌ Gemini API request failed"
      );

      console.error(
        "Status:",
        response.status
      );

      console.error(
        JSON.stringify(
          data,
          null,
          2
        )
      );

      return;
    }

    if (
      !data.models ||
      !Array.isArray(data.models)
    ) {
      console.log(
        "No models returned."
      );

      console.log(
        JSON.stringify(
          data,
          null,
          2
        )
      );

      return;
    }

    console.log(
      `✅ ${data.models.length} models returned\n`
    );

    data.models.forEach(
      (model) => {
        console.log(
          "Model:",
          model.name
        );

        console.log(
          "Display Name:",
          model.displayName
        );

        console.log(
          "Methods:",
          model.supportedGenerationMethods
        );

        console.log(
          "------------------------------"
        );
      }
    );

  } catch (error) {
    console.error(
      "❌ Error:",
      error.message
    );
  }
}

listModels();