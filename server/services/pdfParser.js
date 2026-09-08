const fs = require("fs");
const pdfParse = require("pdf-parse");

const parsePDF = async (filePath) => {
  try {
    const buffer = fs.readFileSync(filePath);

    const data = await pdfParse(buffer);

    return data.text;
  } catch (error) {
    console.error("PDF Parsing Error:", error);
    throw error;
  }
};

module.exports = parsePDF;