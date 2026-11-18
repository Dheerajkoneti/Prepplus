const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error(
        "MONGO_URI is not defined."
      );
    }

    console.log(
      "🔄 Connecting to MongoDB Atlas..."
    );

    const conn = await mongoose.connect(
      process.env.MONGO_URI,
      {
        family: 4,

        serverSelectionTimeoutMS: 15000,

        connectTimeoutMS: 15000,

        socketTimeoutMS: 45000,

        heartbeatFrequencyMS: 10000,
      }
    );

    console.log(
      `✅ MongoDB Connected: ${conn.connection.host}`
    );

    console.log(
      `📦 Database: ${conn.connection.name}`
    );

  } catch (error) {

    console.error(
      "❌ MongoDB Connection Failed"
    );

    console.error(
      "Error Name:",
      error.name
    );

    console.error(
      "Error Code:",
      error.code || "N/A"
    );

    console.error(
      "Error Message:",
      error.message
    );

    process.exit(1);
  }
};

module.exports = connectDB;