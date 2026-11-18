const Question = require("../models/Question");
const ExamAttempt = require("../models/ExamAttempt");


/**
 * Calculate an exam result and save
 * the attempt in MongoDB.
 */
const calculateExamResult = async ({
  userId,
  courseId,
  topicId = null,
  type,
  answers = [],
  passingPercentage = 70,
}) => {

  if (
    type !== "topic" &&
    type !== "final"
  ) {
    throw new Error(
      "Invalid exam type."
    );
  }

  if (!Array.isArray(answers)) {
    throw new Error(
      "Answers must be an array."
    );
  }

  const filter = {
    courseId,
    type,
  };

  if (type === "topic") {
    filter.topicId = topicId;
  }

  const questions =
    await Question.find(filter);

  if (!questions.length) {
    throw new Error(
      "No questions are available for this exam."
    );
  }

  const answerMap = new Map();

  answers.forEach((item) => {
    if (
      item &&
      item.questionId &&
      item.answer !== undefined &&
      item.answer !== null
    ) {
      answerMap.set(
        item.questionId.toString(),
        String(item.answer)
          .trim()
          .toLowerCase()
      );
    }
  });

  let correctAnswers = 0;

  questions.forEach((question) => {
    const submittedAnswer =
      answerMap.get(
        question._id.toString()
      );

    const correctAnswer =
      String(
        question.correctAnswer
      )
        .trim()
        .toLowerCase();

    if (
      submittedAnswer &&
      submittedAnswer === correctAnswer
    ) {
      correctAnswers++;
    }
  });

  const totalQuestions =
    questions.length;

  const score = Math.round(
    (correctAnswers / totalQuestions) *
      100
  );

  const passed =
    score >= passingPercentage;

  const attempt =
    await ExamAttempt.create({
      userId,
      courseId,
      topicId,
      type,
      answers,
      totalQuestions,
      correctAnswers,
      score,
      passed,
      submittedAt: new Date(),
    });

  return {
    attempt,

    totalQuestions,

    correctAnswers,

    score,

    passed,

    passingPercentage,
  };
};


module.exports = {
  calculateExamResult,
};