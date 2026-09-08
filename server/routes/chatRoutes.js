const multer = require("multer");

const storage = multer.memoryStorage();

const upload = multer({
  storage,
});
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Chat = require("../models/Chat");

const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey:
    process.env.GOOGLE_API_KEY ||
    process.env.GEMINI_API_KEY,
});

/*
=====================================
SEND MESSAGE
=====================================
*/
router.post(
  "/",
  upload.single("file"),
  async (req, res) => {
    try {
      const { message, userId, chatId } =
        req.body || {};

      const file = req.file;

      console.log("BODY:", req.body);
      console.log("FILE:", file);

      if (!message) {
        return res.status(400).json({
          success: false,
          message: "Message is required",
        });
      }

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "User ID is required",
        });
      }

      let chat = null;

      if (chatId) {
        chat = await Chat.findById(chatId);
      }

      if (!chat) {
        chat = await Chat.create({
          userId: new mongoose.Types.ObjectId(userId),
          title:
            message.length > 30
              ? message.substring(0, 30) + "..."
              : message,
          messages: [],
        });
      }

      chat.messages.push({
        role: "user",
        content: message,
      });

      let prompt = `
You are PrepPulse AI.

You help students with:
- Java
- Python
- DBMS
- SQL
- Aptitude
- Interview Preparation
- Resume Building
- AI/ML
- Placement Training

Provide clear and beginner-friendly answers.

User Question:
${message}
`;

      if (file) {
        prompt += `

Uploaded File:
${file.originalname}
`;
      }

      const result =
        await ai.models.generateContent({
          model: "gemini-3.6-flash",
          contents: prompt,
        });

      const aiResponse = result.text;

      console.log("AI RESPONSE:");
      console.log(aiResponse);

      chat.messages.push({
        role: "assistant",
        content: aiResponse,
      });

      await chat.save();

      res.status(200).json({
        success: true,
        chatId: chat._id,
        response: aiResponse,
      });
    } catch (error) {
      console.error(
        "Chat Route Error:",
        error
      );

      res.status(500).json({
        success: false,
        message: "AI Error",
        error: error.message,
      });
    }
  }
);

/*
=====================================
GET ALL USER CHATS
=====================================
*/

router.get("/user/:userId", async (req, res) => {
try {
    const chats = await Chat.find({
    userId: req.params.userId,
    })
    .select("_id title updatedAt isPinned")
    .sort({
        isPinned: -1,
        updatedAt: -1,
        });

    res.status(200).json({
    success: true,
    chats,
    });
} catch (error) {
    res.status(500).json({
    success: false,
    message: error.message,
    });
}
});

/*
=====================================
GET SINGLE CHAT
=====================================
*/

router.get("/:chatId", async (req, res) => {
try {
    const chat = await Chat.findById(
    req.params.chatId
    );

    if (!chat) {
    return res.status(404).json({
        success: false,
        message: "Chat not found",
    });
    }

    res.status(200).json({
    success: true,
    chat,
    });
} catch (error) {
    res.status(500).json({
    success: false,
    message: error.message,
    });
}
});

/*
=====================================
DELETE CHAT
=====================================
*/

router.delete("/:chatId", async (req, res) => {
try {
    const chat =
    await Chat.findByIdAndDelete(
        req.params.chatId
    );

    if (!chat) {
    return res.status(404).json({
        success: false,
        message: "Chat not found",
    });
    }

    res.status(200).json({
    success: true,
    message: "Chat deleted successfully",
    });
} catch (error) {
    res.status(500).json({
    success: false,
    message: error.message,
    });
}
});

/*
=====================================
TEST GEMINI
=====================================
*/

router.get("/test", async (req, res) => {
try {
    const result =
    await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: "Say Hello",
    });

    res.json({
    success: true,
    response: result.text,
    });
} catch (error) {
    console.log(error);

    res.status(500).json({
    success: false,
    error: error.message,
    });
}
});

/*
=====================================
RENAME CHAT
=====================================
*/

router.put("/:chatId", async (req, res) => {
try {
    const { title } = req.body;

    if (!title || title.trim() === "") {
    return res.status(400).json({
        success: false,
        message: "Title is required",
    });
    }

    const chat = await Chat.findByIdAndUpdate(
    req.params.chatId,
    {
        title: title.trim(),
    },
    {
        new: true,
    }
    );

    if (!chat) {
    return res.status(404).json({
        success: false,
        message: "Chat not found",
    });
    }

    res.status(200).json({
    success: true,
    chat,
    });
} catch (error) {
    console.error(error);

    res.status(500).json({
    success: false,
    message: error.message,
    });
}
});
router.put("/:chatId/pin", async (req, res) => {
try {
    const chat = await Chat.findById(req.params.chatId);

    if (!chat) {
    return res.status(404).json({
        success: false,
        message: "Chat not found",
    });
    }

    chat.isPinned = !chat.isPinned;

    await chat.save();

    res.status(200).json({
    success: true,
    isPinned: chat.isPinned,
    message: chat.isPinned
        ? "Chat pinned"
        : "Chat unpinned",
    });
} catch (error) {
    res.status(500).json({
    success: false,
    message: error.message,
    });
}
});
module.exports = router;