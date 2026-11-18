const dotenv = require("dotenv");
dotenv.config();

const mongoose = require("mongoose");

const Course = require("./models/Course");
const Topic = require("./models/Topic");
const Lesson = require("./models/Lesson");
const Question = require("./models/Question");

const Enrollment = require("./models/Enrollment");
const ExamAttempt = require("./models/ExamAttempt");
const Certificate = require("./models/Certificate");

const MONGO_URI = process.env.MONGO_URI;

/* =====================================================
   JAVA COURSE DATA
===================================================== */
const courseData = {
  title: "Java Fundamentals",
  slug: "java-fundamentals",
  language: "Java",
  description:
    "Master Java programming from fundamentals to object-oriented programming, collections, exception handling, and streams through structured lessons and assessments.",
  level: "Beginner",
  duration: 25,
  passingPercentage: 70,
  certificateEnabled: true,
  published: true,
};

/* =====================================================
   TOPICS
===================================================== */
const topicsData = [
  {
    title: "Java Basics",
    description:
      "Learn the fundamentals of Java, JVM architecture and writing your first Java program.",
    order: 1,
    estimatedMinutes: 90,
    lessons: [
      {
        title: "Introduction to Java",
        description: "Understand what Java is, its features and why it is widely used.",
        type: "article",
        content:
          "Java is a high-level, object-oriented and platform-independent programming language. It follows the principle of Write Once, Run Anywhere through the Java Virtual Machine.",
        duration: 20,
        order: 1,
      },
      {
        title: "JDK, JRE and JVM",
        description: "Understand the difference between JDK, JRE and JVM.",
        type: "article",
        content:
          "JVM executes Java bytecode. JRE contains the JVM and libraries required to run Java applications. JDK contains the JRE along with development tools such as the Java compiler.",
        duration: 30,
        order: 2,
      },
      {
        title: "First Java Program",
        description: "Write and understand your first Java program.",
        type: "coding",
        content:
          "Example: public class Main { public static void main(String[] args) { System.out.println(\"Hello World\"); } }",
        duration: 40,
        order: 3,
      },
    ],
    questions: [
      {
        question: "Which component executes Java bytecode?",
        options: ["JDK", "JRE", "JVM", "JAR"],
        correctAnswer: "JVM",
        explanation: "JVM executes Java bytecode and provides platform independence.",
        difficulty: "easy",
      },
      {
        question: "Which command is commonly used to compile a Java source file?",
        options: ["java", "javac", "javacompile", "compile"],
        correctAnswer: "javac",
        explanation: "javac is the Java compiler command.",
        difficulty: "easy",
      },
      {
        question: "Which keyword is used to define a class in Java?",
        options: ["class", "Class", "define", "object"],
        correctAnswer: "class",
        explanation: "The class keyword is used to declare a Java class.",
        difficulty: "easy",
      },
      {
        question: "Which method is the entry point of a standard Java application?",
        options: ["start()", "run()", "main()", "execute()"],
        correctAnswer: "main()",
        explanation: "The main method is the standard entry point of a Java application.",
        difficulty: "easy",
      },
      {
        question: "Java is primarily which type of programming language?",
        options: ["Object-oriented", "Assembly", "Markup", "Database"],
        correctAnswer: "Object-oriented",
        explanation: "Java is primarily an object-oriented programming language.",
        difficulty: "easy",
      },
    ],
  },

  {
    title: "Variables & Data Types",
    description: "Learn variables, primitive data types and type casting in Java.",
    order: 2,
    estimatedMinutes: 90,
    lessons: [
      {
        title: "Variables",
        description: "Learn how variables store data in Java.",
        type: "article",
        content:
          "A variable is a named memory location used to store data. Java requires variables to have a declared data type.",
        duration: 25,
        order: 1,
      },
      {
        title: "Primitive Data Types",
        description: "Learn Java's primitive data types.",
        type: "article",
        content:
          "Java provides eight primitive data types: byte, short, int, long, float, double, char and boolean.",
        duration: 30,
        order: 2,
      },
      {
        title: "Type Casting",
        description: "Understand implicit and explicit type conversion.",
        type: "coding",
        content:
          "Widening conversion happens automatically when converting a smaller type to a larger compatible type. Narrowing conversion requires explicit casting.",
        duration: 35,
        order: 3,
      },
    ],
    questions: [
      {
        question: "Which data type is used to store whole numbers commonly?",
        options: ["int", "float", "char", "boolean"],
        correctAnswer: "int",
        explanation: "int is commonly used for integer values.",
        difficulty: "easy",
      },
      {
        question: "Which data type stores true or false?",
        options: ["boolean", "bool", "bit", "logical"],
        correctAnswer: "boolean",
        explanation: "boolean stores either true or false.",
        difficulty: "easy",
      },
      {
        question: "Which data type stores a single character?",
        options: ["String", "char", "character", "text"],
        correctAnswer: "char",
        explanation: "char stores a single 16-bit Unicode character.",
        difficulty: "easy",
      },
      {
        question: "Which conversion is normally automatic in Java?",
        options: ["Widening", "Narrowing", "String conversion", "Object serialization"],
        correctAnswer: "Widening",
        explanation: "Widening conversion from a smaller compatible numeric type to a larger one can happen automatically.",
        difficulty: "medium",
      },
      {
        question: "Which keyword is used to declare a constant?",
        options: ["constant", "static", "final", "const"],
        correctAnswer: "final",
        explanation: "A variable declared final cannot be reassigned after initialization.",
        difficulty: "easy",
      },
    ],
  },

  {
    title: "OOP Concepts",
    description: "Understand classes, objects, inheritance and polymorphism in Java.",
    order: 3,
    estimatedMinutes: 120,
    lessons: [
      {
        title: "Classes & Objects",
        description: "Understand classes and objects with practical examples.",
        type: "article",
        content: "A class is a blueprint for objects. An object is an instance of a class.",
        duration: 35,
        order: 1,
      },
      {
        title: "Inheritance",
        description: "Learn how one class can inherit properties and behavior from another class.",
        type: "article",
        content:
          "Inheritance allows a child class to acquire accessible fields and methods from a parent class. Java commonly uses the extends keyword for class inheritance.",
        duration: 40,
        order: 2,
      },
      {
        title: "Polymorphism",
        description: "Understand compile-time and runtime polymorphism.",
        type: "article",
        content:
          "Polymorphism allows the same interface or method concept to represent different behaviors. Method overloading is compile-time polymorphism and method overriding supports runtime polymorphism.",
        duration: 45,
        order: 3,
      },
    ],
    questions: [
      {
        question: "What is a class in Java?",
        options: ["Blueprint for objects", "Database", "Compiler", "Package manager"],
        correctAnswer: "Blueprint for objects",
        explanation: "A class defines the structure and behavior that objects can have.",
        difficulty: "easy",
      },
      {
        question: "Which keyword is used for class inheritance?",
        options: ["inherits", "extends", "implements", "super"],
        correctAnswer: "extends",
        explanation: "The extends keyword is used when one class inherits from another class.",
        difficulty: "easy",
      },
      {
        question: "What is method overloading?",
        options: ["Same method name with different parameters", "Deleting a method", "Copying a class", "Calling a constructor"],
        correctAnswer: "Same method name with different parameters",
        explanation: "Method overloading allows multiple methods with the same name but different parameter lists.",
        difficulty: "medium",
      },
      {
        question: "Which concept allows a child class to provide its own implementation of a parent method?",
        options: ["Overloading", "Overriding", "Encapsulation", "Abstraction"],
        correctAnswer: "Overriding",
        explanation: "Method overriding allows a subclass to provide a specific implementation of an inherited method.",
        difficulty: "medium",
      },
      {
        question: "Which OOP concept hides internal implementation details?",
        options: ["Encapsulation", "Inheritance", "Compilation", "Iteration"],
        correctAnswer: "Encapsulation",
        explanation: "Encapsulation bundles data and behavior and controls access to internal state.",
        difficulty: "medium",
      },
    ],
  },

  {
    title: "Collections Framework",
    description: "Learn the most important Java collection classes including ArrayList, HashSet and HashMap.",
    order: 4,
    estimatedMinutes: 120,
    lessons: [
      {
        title: "ArrayList",
        description: "Learn how ArrayList stores ordered collections.",
        type: "article",
        content:
          "ArrayList is a resizable-array implementation of the List interface. It maintains insertion order and permits duplicate elements.",
        duration: 35,
        order: 1,
      },
      {
        title: "HashSet",
        description: "Learn how HashSet stores unique elements.",
        type: "article",
        content: "HashSet implements Set and does not allow duplicate elements.",
        duration: 35,
        order: 2,
      },
      {
        title: "HashMap",
        description: "Learn how to store key-value pairs using HashMap.",
        type: "coding",
        content: "HashMap stores data as key-value pairs. Keys must be unique, while values can be duplicated.",
        duration: 50,
        order: 3,
      },
    ],
    questions: [
      {
        question: "Which collection maintains insertion order and allows duplicates?",
        options: ["HashSet", "ArrayList", "HashMap", "TreeSet"],
        correctAnswer: "ArrayList",
        explanation: "ArrayList maintains insertion order and permits duplicate elements.",
        difficulty: "easy",
      },
      {
        question: "Which collection does not allow duplicate elements?",
        options: ["ArrayList", "HashSet", "LinkedList", "Vector"],
        correctAnswer: "HashSet",
        explanation: "HashSet is a Set implementation and does not permit duplicate elements.",
        difficulty: "easy",
      },
      {
        question: "Which collection stores key-value pairs?",
        options: ["ArrayList", "HashSet", "HashMap", "Stack"],
        correctAnswer: "HashMap",
        explanation: "HashMap stores data using key-value pairs.",
        difficulty: "easy",
      },
      {
        question: "Can a HashMap contain duplicate keys?",
        options: ["Yes", "No", "Only integers", "Only strings"],
        correctAnswer: "No",
        explanation: "HashMap keys are unique. Adding the same key replaces its existing value.",
        difficulty: "medium",
      },
      {
        question: "Which interface is implemented by ArrayList?",
        options: ["List", "Set", "Map", "Queue"],
        correctAnswer: "List",
        explanation: "ArrayList implements the List interface.",
        difficulty: "easy",
      },
    ],
  },

  {
    title: "Exception Handling",
    description: "Master error handling, try-catch-finally blocks, and custom exceptions.",
    order: 5,
    estimatedMinutes: 100,
    lessons: [
      {
        title: "Try-Catch Blocks",
        description: "Learn how to catch and handle runtime exceptions safely.",
        type: "article",
        content: "Exception handling allows a program to manage runtime errors gracefully without crashing using try, catch, and finally blocks.",
        duration: 25,
        order: 1,
      },
      {
        title: "Checked vs Unchecked Exceptions",
        description: "Understand the hierarchy between checked and unchecked exceptions.",
        type: "article",
        content: "Checked exceptions are verified at compile-time (e.g., IOException), while unchecked exceptions occur at runtime (e.g., NullPointerException).",
        duration: 30,
        order: 2,
      },
      {
        title: "Custom Exceptions",
        description: "Learn how to create and throw custom application-specific exceptions.",
        type: "coding",
        content: "You can create custom exception classes by extending Exception or RuntimeException.",
        duration: 35,
        order: 3,
      },
    ],
    questions: [
      {
        question: "Which block is always executed regardless of whether an exception occurred or not?",
        options: ["catch", "try", "finally", "throw"],
        correctAnswer: "finally",
        explanation: "The finally block is guaranteed to execute, making it ideal for clean-up tasks.",
        difficulty: "easy",
      },
      {
        question: "Which class is the superclass of all exceptions and errors in Java?",
        options: ["Throwable", "Exception", "RuntimeException", "Error"],
        correctAnswer: "Throwable",
        explanation: "Throwable is the base class for all exceptions and errors in the Java hierarchy.",
        difficulty: "medium",
      },
      {
        question: "What type of exception is NullPointerException?",
        options: ["Checked exception", "Unchecked exception", "Compile-time error", "IO exception"],
        correctAnswer: "Unchecked exception",
        explanation: "NullPointerException extends RuntimeException, making it an unchecked exception.",
        difficulty: "easy",
      },
      {
        question: "Which keyword is used to explicitly throw an exception?",
        options: ["throws", "throw", "catch", "try"],
        correctAnswer: "throw",
        explanation: "The throw keyword is used to trigger an exception manually.",
        difficulty: "easy",
      },
      {
        question: "What keyword is used in a method signature to declare that it might throw a checked exception?",
        options: ["throws", "throw", "raised", "handle"],
        correctAnswer: "throws",
        explanation: "The throws keyword informs callers that the method throws a checked exception.",
        difficulty: "easy",
      },
    ],
  },

  {
    title: "Java Streams & Lambdas",
    description: "Write clean, functional code using lambda expressions and the Java 8 Stream API.",
    order: 6,
    estimatedMinutes: 110,
    lessons: [
      {
        title: "Lambda Expressions",
        description: "Introduction to functional interfaces and lambda syntax.",
        type: "article",
        content: "Lambda expressions provide a concise way to represent anonymous methods implementing functional interfaces.",
        duration: 30,
        order: 1,
      },
      {
        title: "Stream API Operations",
        description: "Learn filtering, mapping, and reducing collections.",
        type: "coding",
        content: "The Stream API allows declarative data processing pipelines using intermediate operations like filter/map and terminal operations like collect/forEach.",
        duration: 45,
        order: 2,
      },
      {
        title: "Optional Class",
        description: "Avoid NullPointerExceptions using the Optional container class.",
        type: "article",
        content: "Optional is a container object used to represent the presence or absence of a nullable value safely.",
        duration: 35,
        order: 3,
      },
    ],
    questions: [
      {
        question: "What is a functional interface?",
        options: ["An interface with exactly one abstract method", "An interface with no methods", "An interface with only default methods", "An interface for database connections"],
        correctAnswer: "An interface with exactly one abstract method",
        explanation: "Functional interfaces serve as target types for lambda expressions and method references.",
        difficulty: "easy",
      },
      {
        question: "Which Stream operation is terminal?",
        options: ["filter()", "map()", "collect()", "peek()"],
        correctAnswer: "collect()",
        explanation: "collect() is a terminal operation that triggers pipeline evaluation and gathers results.",
        difficulty: "medium",
      },
      {
        question: "What is the primary purpose of the Optional class?",
        options: ["To speed up loops", "To explicitly handle null values and prevent NullPointerException", "To replace ArrayList", "To format strings"],
        correctAnswer: "To explicitly handle null values and prevent NullPointerException",
        explanation: "Optional helps prevent unexpected null pointer exceptions by modeling presence/absence explicitly.",
        difficulty: "easy",
      },
      {
        question: "Which symbol represents the lambda operator in Java?",
        options: ["->", "=>", "::", "->>"],
        correctAnswer: "->",
        explanation: "The token -> separates lambda parameters from its body.",
        difficulty: "easy",
      },
      {
        question: "Which intermediate operation filters elements based on a predicate?",
        options: ["map()", "filter()", "reduce()", "forEach()"],
        correctAnswer: "filter()",
        explanation: "filter() takes a Predicate and returns a stream containing elements matching the condition.",
        difficulty: "easy",
      },
    ],
  },
];

/* =====================================================
   FINAL EXAM QUESTIONS
===================================================== */
const finalQuestions = [
  {
    question: "Which component executes Java bytecode?",
    options: ["JDK", "JRE", "JVM", "Compiler"],
    correctAnswer: "JVM",
    explanation: "JVM executes Java bytecode.",
    difficulty: "easy",
  },
  {
    question: "Which command compiles Java source code?",
    options: ["java", "javac", "compile", "jvm"],
    correctAnswer: "javac",
    explanation: "javac compiles Java source code into bytecode.",
    difficulty: "easy",
  },
  {
    question: "Which keyword is used to inherit a class?",
    options: ["extends", "inherits", "implements", "super"],
    correctAnswer: "extends",
    explanation: "extends is used for class inheritance.",
    difficulty: "easy",
  },
  {
    question: "Which concept means one interface can have different implementations?",
    options: ["Polymorphism", "Encapsulation", "Compilation", "Iteration"],
    correctAnswer: "Polymorphism",
    explanation: "Polymorphism allows the same interface or method concept to represent different implementations.",
    difficulty: "medium",
  },
  {
    question: "Which keyword is used to create a constant variable?",
    options: ["constant", "final", "const", "static"],
    correctAnswer: "final",
    explanation: "final prevents reassignment of a variable after initialization.",
    difficulty: "easy",
  },
  {
    question: "Which collection allows duplicate elements?",
    options: ["HashSet", "ArrayList", "TreeSet", "HashMap"],
    correctAnswer: "ArrayList",
    explanation: "ArrayList allows duplicate elements.",
    difficulty: "easy",
  },
  {
    question: "Which collection stores key-value pairs?",
    options: ["List", "Set", "Map", "Queue"],
    correctAnswer: "Map",
    explanation: "Map represents key-value mappings and HashMap is a common implementation.",
    difficulty: "easy",
  },
  {
    question: "What does a class represent?",
    options: ["Blueprint for objects", "Only a variable", "Only a method", "Database table"],
    correctAnswer: "Blueprint for objects",
    explanation: "A class acts as a blueprint from which objects can be created.",
    difficulty: "easy",
  },
  {
    question: "Which OOP feature allows a subclass to provide a different implementation of a parent method?",
    options: ["Overloading", "Overriding", "Encapsulation", "Constructor"],
    correctAnswer: "Overriding",
    explanation: "Method overriding allows a subclass to redefine inherited behavior.",
    difficulty: "medium",
  },
  {
    question: "Which collection is designed to store unique elements?",
    options: ["ArrayList", "HashSet", "HashMap", "LinkedList"],
    correctAnswer: "HashSet",
    explanation: "HashSet does not allow duplicate elements.",
    difficulty: "easy",
  },
  {
    question: "Which block is guaranteed to execute in exception handling?",
    options: ["catch", "finally", "try", "throw"],
    correctAnswer: "finally",
    explanation: "The finally block runs regardless of whether an exception is thrown or caught.",
    difficulty: "easy",
  },
  {
    question: "What is a functional interface in Java?",
    options: ["An interface with exactly one abstract method", "An interface with multiple abstract methods", "A class with no methods", "An interface for database queries"],
    correctAnswer: "An interface with exactly one abstract method",
    explanation: "Functional interfaces enable the use of lambda expressions.",
    difficulty: "medium",
  },
];

/* =====================================================
   SEED FUNCTION
===================================================== */
const seedCourses = async () => {
  try {
    console.log("\n🌱 Starting PrepPulse course seeding...\n");

    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connected");

    const existingCourse = await Course.findOne({ slug: "java-fundamentals" });

    if (existingCourse) {
      console.log("🧹 Removing previous Java Fundamentals seed...");

      await Enrollment.deleteMany({ courseId: existingCourse._id });
      await ExamAttempt.deleteMany({ courseId: existingCourse._id });
      await Certificate.deleteMany({ courseId: existingCourse._id });
      await Question.deleteMany({ courseId: existingCourse._id });

      const oldTopics = await Topic.find({ courseId: existingCourse._id });
      const oldTopicIds = oldTopics.map((topic) => topic._id);

      await Lesson.deleteMany({ topicId: { $in: oldTopicIds } });
      await Topic.deleteMany({ courseId: existingCourse._id });
      await Course.deleteOne({ _id: existingCourse._id });

      console.log("✅ Previous seed removed");
    }

    const course = await Course.create(courseData);
    console.log(`✅ Course created: ${course.title}`);

    const topicIds = [];

    for (const topicData of topicsData) {
      const topic = await Topic.create({
        courseId: course._id,
        title: topicData.title,
        description: topicData.description,
        order: topicData.order,
        passingPercentage: 70,
        estimatedMinutes: topicData.estimatedMinutes,
      });

      console.log(`   📚 Topic created: ${topic.title}`);

      const lessonIds = [];

      for (const lessonData of topicData.lessons) {
        const lesson = await Lesson.create({
          topicId: topic._id,
          title: lessonData.title,
          description: lessonData.description,
          type: lessonData.type,
          content: lessonData.content,
          duration: lessonData.duration,
          order: lessonData.order,
        });

        lessonIds.push(lesson._id);
        console.log(`      📖 Lesson: ${lesson.title}`);
      }

      topic.lessons = lessonIds;

      const questionIds = [];

      for (const questionData of topicData.questions) {
        const question = await Question.create({
          courseId: course._id,
          topicId: topic._id,
          question: questionData.question,
          options: questionData.options,
          correctAnswer: questionData.correctAnswer,
          explanation: questionData.explanation,
          difficulty: questionData.difficulty,
          type: "topic",
        });

        questionIds.push(question._id);
      }

      topic.examQuestions = questionIds;
      await topic.save();
      topicIds.push(topic._id);

      console.log(`      📝 ${questionIds.length} topic questions created`);
    }

    course.topics = topicIds;

    const finalQuestionIds = [];

    for (const questionData of finalQuestions) {
      const question = await Question.create({
        courseId: course._id,
        topicId: null,
        question: questionData.question,
        options: questionData.options,
        correctAnswer: questionData.correctAnswer,
        explanation: questionData.explanation,
        difficulty: questionData.difficulty,
        type: "final",
      });

      finalQuestionIds.push(question._id);
    }

    course.finalExamQuestions = finalQuestionIds;
    await course.save();

    console.log("\n========================================");
    console.log("🎉 COURSE SEED COMPLETED");
    console.log("========================================");
    console.log(`📚 Course   : ${course.title}`);
    console.log(`💻 Language : ${course.language}`);
    console.log(`📖 Topics   : ${topicIds.length}`);
    console.log(`📝 Topic Questions : ${topicsData.length * 5}`);
    console.log(`🏆 Final Questions : ${finalQuestionIds.length}`);
    console.log(`📌 Published : ${course.published}`);
    console.log("========================================\n");

  } catch (error) {
    console.error("\n❌ SEED ERROR:");
    console.error(error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 MongoDB connection closed.");
  }
};

seedCourses();