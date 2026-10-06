require("dotenv").config();

const mongoose = require("mongoose");

const Resource = require("./models/Resource");
const User = require("./models/User");

/*
|--------------------------------------------------------------------------
| DATABASE CONNECTION
|--------------------------------------------------------------------------
*/

const MONGO_URI =
  process.env.MONGO_URI ||
  process.env.MONGODB_URI ||
  process.env.DATABASE_URL;

if (!MONGO_URI) {
  console.error(
    "❌ MongoDB connection string was not found."
  );

  console.error(
    "Please add MONGO_URI to your .env file."
  );

  process.exit(1);
}

/*
|--------------------------------------------------------------------------
| STARTER RESOURCES
|--------------------------------------------------------------------------
*/

const resources = [
  {
    title: "Java Programming Complete Guide",

    description:
      "Complete Java programming guide covering syntax, OOP, classes, objects, inheritance, polymorphism, interfaces, exception handling and collections.",

    category: "Java",

    type: "Course",

    difficulty: "Beginner",

    url:
      "https://dev.java/learn/",

    thumbnail:
      "https://placehold.co/1200x650/111827/38bdf8?text=Java+Programming",

    tags: [
      "java",
      "programming",
      "oop",
      "backend",
      "beginner",
    ],

    estimatedTime: 180,

    authorName:
      "Java Developer Community",
  },

  {
    title: "Java Collections Framework",

    description:
      "Learn List, Set, Map, Queue, ArrayList, LinkedList, HashSet, TreeSet, HashMap, TreeMap and other important Java collections.",

    category: "Java",

    type: "Article",

    difficulty: "Intermediate",

    url:
      "https://docs.oracle.com/javase/tutorial/collections/",

    thumbnail:
      "https://placehold.co/1200x650/111827/a78bfa?text=Java+Collections",

    tags: [
      "java",
      "collections",
      "arraylist",
      "hashmap",
      "interview",
    ],

    estimatedTime: 90,

    authorName:
      "Oracle Java Documentation",
  },

  {
    title: "Python Official Tutorial",

    description:
      "Official Python tutorial covering Python basics, control flow, functions, data structures, modules, classes and exceptions.",

    category: "Python",

    type: "Course",

    difficulty: "Beginner",

    url:
      "https://docs.python.org/3/tutorial/",

    thumbnail:
      "https://placehold.co/1200x650/111827/fbbf24?text=Python",

    tags: [
      "python",
      "programming",
      "beginner",
      "development",
    ],

    estimatedTime: 180,

    authorName:
      "Python Software Foundation",
  },

  {
    title: "Data Structures and Algorithms",

    description:
      "Study core data structures and algorithms including arrays, linked lists, stacks, queues, trees, graphs, sorting and searching.",

    category: "DSA",

    type: "Course",

    difficulty: "Intermediate",

    url:
      "https://www.geeksforgeeks.org/learn-data-structures-and-algorithms-dsa-tutorial/",

    thumbnail:
      "https://placehold.co/1200x650/111827/34d399?text=DSA",

    tags: [
      "dsa",
      "algorithms",
      "data-structures",
      "coding",
      "placements",
    ],

    estimatedTime: 300,

    authorName:
      "GeeksforGeeks",
  },

  {
    title: "SQL Tutorial",

    description:
      "Learn SQL from fundamentals to advanced queries including SELECT, WHERE, GROUP BY, JOIN, subqueries, aggregate functions and database operations.",

    category: "SQL",

    type: "Course",

    difficulty: "Beginner",

    url:
      "https://www.w3schools.com/sql/",

    thumbnail:
      "https://placehold.co/1200x650/111827/f59e0b?text=SQL",

    tags: [
      "sql",
      "database",
      "mysql",
      "queries",
      "interview",
    ],

    estimatedTime: 150,

    authorName:
      "W3Schools",
  },

  {
    title: "SQL Joins Explained",

    description:
      "Understand INNER JOIN, LEFT JOIN, RIGHT JOIN, FULL JOIN and self joins with practical examples.",

    category: "SQL",

    type: "Article",

    difficulty: "Intermediate",

    url:
      "https://www.w3schools.com/sql/sql_join.asp",

    thumbnail:
      "https://placehold.co/1200x650/111827/f97316?text=SQL+Joins",

    tags: [
      "sql",
      "joins",
      "database",
      "interview",
    ],

    estimatedTime: 45,

    authorName:
      "W3Schools",
  },

  {
    title: "React Official Documentation",

    description:
      "Learn React components, JSX, state, props, hooks, events, conditional rendering and modern React development.",

    category: "React",

    type: "Website",

    difficulty: "Intermediate",

    url:
      "https://react.dev/learn",

    thumbnail:
      "https://placehold.co/1200x650/111827/61dafb?text=React",

    tags: [
      "react",
      "javascript",
      "frontend",
      "web-development",
    ],

    estimatedTime: 180,

    authorName:
      "React Team",
  },

  {
    title: "Node.js Official Learning",

    description:
      "Learn server-side JavaScript using Node.js including modules, HTTP servers, APIs, asynchronous programming and backend development.",

    category: "Node.js",

    type: "Website",

    difficulty: "Intermediate",

    url:
      "https://nodejs.org/en/learn",

    thumbnail:
      "https://placehold.co/1200x650/111827/22c55e?text=Node.js",

    tags: [
      "nodejs",
      "javascript",
      "backend",
      "express",
      "api",
    ],

    estimatedTime: 180,

    authorName:
      "Node.js",
  },

  {
    title: "MDN Web Development Guide",

    description:
      "Comprehensive web development resources covering HTML, CSS, JavaScript, accessibility, APIs and browser technologies.",

    category: "Web Development",

    type: "Website",

    difficulty: "Beginner",

    url:
      "https://developer.mozilla.org/en-US/docs/Learn",

    thumbnail:
      "https://placehold.co/1200x650/111827/38bdf8?text=Web+Development",

    tags: [
      "html",
      "css",
      "javascript",
      "web",
      "frontend",
    ],

    estimatedTime: 240,

    authorName:
      "MDN Web Docs",
  },

  {
    title: "Machine Learning Crash Course",

    description:
      "Practical introduction to machine learning concepts including regression, classification, data preparation, neural networks and evaluation.",

    category: "Machine Learning",

    type: "Course",

    difficulty: "Intermediate",

    url:
      "https://developers.google.com/machine-learning/crash-course",

    thumbnail:
      "https://placehold.co/1200x650/111827/a855f7?text=Machine+Learning",

    tags: [
      "machine-learning",
      "ai",
      "python",
      "tensorflow",
    ],

    estimatedTime: 240,

    authorName:
      "Google",
  },

  {
    title: "Deep Learning Fundamentals",

    description:
      "Explore neural networks, training, optimization, computer vision and deep learning concepts.",

    category: "Deep Learning",

    type: "Course",

    difficulty: "Advanced",

    url:
      "https://www.deeplearning.ai/courses/deep-learning-specialization/",

    thumbnail:
      "https://placehold.co/1200x650/111827/ec4899?text=Deep+Learning",

    tags: [
      "deep-learning",
      "neural-networks",
      "ai",
      "tensorflow",
      "pytorch",
    ],

    estimatedTime: 300,

    authorName:
      "DeepLearning.AI",
  },

  {
    title: "GitHub Skills",

    description:
      "Interactive GitHub learning experiences covering repositories, pull requests, GitHub Actions and collaboration workflows.",

    category: "DevOps",

    type: "GitHub",

    difficulty: "Beginner",

    url:
      "https://skills.github.com/",

    thumbnail:
      "https://placehold.co/1200x650/111827/ffffff?text=GitHub",

    tags: [
      "github",
      "git",
      "devops",
      "version-control",
    ],

    estimatedTime: 120,

    authorName:
      "GitHub",
  },

  {
    title: "Computer Networks Fundamentals",

    description:
      "Learn networking fundamentals including OSI model, TCP/IP, HTTP, DNS, routing, protocols and network security basics.",

    category: "Computer Networks",

    type: "Article",

    difficulty: "Intermediate",

    url:
      "https://www.geeksforgeeks.org/computer-network-tutorials/",

    thumbnail:
      "https://placehold.co/1200x650/111827/06b6d4?text=Computer+Networks",

    tags: [
      "networking",
      "tcp",
      "ip",
      "http",
      "osi",
    ],

    estimatedTime: 180,

    authorName:
      "GeeksforGeeks",
  },

  {
    title: "Operating Systems Concepts",

    description:
      "Study processes, threads, scheduling, memory management, deadlocks, file systems and operating system fundamentals.",

    category: "Operating Systems",

    type: "Article",

    difficulty: "Intermediate",

    url:
      "https://www.geeksforgeeks.org/operating-systems/",

    thumbnail:
      "https://placehold.co/1200x650/111827/8b5cf6?text=Operating+Systems",

    tags: [
      "operating-systems",
      "os",
      "process",
      "threads",
      "interview",
    ],

    estimatedTime: 180,

    authorName:
      "GeeksforGeeks",
  },

  {
    title: "Aptitude Preparation",

    description:
      "Practice quantitative aptitude topics including percentages, profit and loss, averages, ratios, time and work and speed-distance problems.",

    category: "Aptitude",

    type: "Practice",

    difficulty: "Beginner",

    url:
      "https://www.indiabix.com/aptitude/questions-and-answers/",

    thumbnail:
      "https://placehold.co/1200x650/111827/f59e0b?text=Aptitude",

    tags: [
      "aptitude",
      "placements",
      "quantitative",
      "practice",
    ],

    estimatedTime: 120,

    authorName:
      "IndiaBix",
  },

  {
    title: "Logical Reasoning Practice",

    description:
      "Practice logical reasoning topics including series, coding-decoding, blood relations, directions, analogy and classification.",

    category: "Reasoning",

    type: "Practice",

    difficulty: "Beginner",

    url:
      "https://www.indiabix.com/logical-reasoning/questions-and-answers/",

    thumbnail:
      "https://placehold.co/1200x650/111827/10b981?text=Reasoning",

    tags: [
      "reasoning",
      "aptitude",
      "placements",
      "practice",
    ],

    estimatedTime: 120,

    authorName:
      "IndiaBix",
  },

  {
    title: "Technical Interview Preparation",

    description:
      "Prepare for technical interviews covering programming, data structures, databases, operating systems, networking and software engineering.",

    category: "Interview Preparation",

    type: "Article",

    difficulty: "Intermediate",

    url:
      "https://www.geeksforgeeks.org/interview-preparation-for-software-developer/",

    thumbnail:
      "https://placehold.co/1200x650/111827/f472b6?text=Technical+Interview",

    tags: [
      "interview",
      "technical",
      "coding",
      "placements",
    ],

    estimatedTime: 180,

    authorName:
      "GeeksforGeeks",
  },

  {
    title: "Git Version Control Guide",

    description:
      "Learn Git fundamentals including repositories, commits, branches, merging, rebasing, remote repositories and collaboration.",

    category: "DevOps",

    type: "Article",

    difficulty: "Beginner",

    url:
      "https://git-scm.com/book/en/v2",

    thumbnail:
      "https://placehold.co/1200x650/111827/f97316?text=Git",

    tags: [
      "git",
      "github",
      "version-control",
      "devops",
    ],

    estimatedTime: 120,

    authorName:
      "Git",
  },

  {
    title: "REST API Design Guide",

    description:
      "Learn REST API concepts, HTTP methods, status codes, API design principles and backend communication.",

    category: "Web Development",

    type: "Article",

    difficulty: "Intermediate",

    url:
      "https://developer.mozilla.org/en-US/docs/Glossary/REST",

    thumbnail:
      "https://placehold.co/1200x650/111827/14b8a6?text=REST+API",

    tags: [
      "rest",
      "api",
      "backend",
      "http",
      "nodejs",
    ],

    estimatedTime: 60,

    authorName:
      "MDN Web Docs",
  },

  {
    title: "Placement Preparation Roadmap",

    description:
      "A structured roadmap for students preparing for campus placements covering aptitude, coding, technical subjects, projects and interviews.",

    category: "Placement Preparation",

    type: "Article",

    difficulty: "All Levels",

    url:
      "https://www.geeksforgeeks.org/complete-roadmap-to-placement-preparation/",

    thumbnail:
      "https://placehold.co/1200x650/111827/ec4899?text=Placement+Preparation",

    tags: [
      "placements",
      "campus",
      "coding",
      "aptitude",
      "interview",
    ],

    estimatedTime: 180,

    authorName:
      "GeeksforGeeks",
  },
];

/*
|--------------------------------------------------------------------------
| SEED DATABASE
|--------------------------------------------------------------------------
*/

async function seedResources() {
  try {
    console.log("");
    console.log(
      "🚀 Starting PrepPulse Resource Seeder..."
    );
    console.log("");

    await mongoose.connect(
      MONGO_URI
    );

    console.log(
      "✅ Connected to MongoDB"
    );

    /*
    |--------------------------------------------------------------------------
    | FIND USER
    |--------------------------------------------------------------------------
    */

    const user =
      await User.findOne();

    if (!user) {
      console.log("");
      console.log(
        "❌ No user found in MongoDB."
      );

      console.log(
        "Please register/login at PrepPulse first."
      );

      console.log("");

      await mongoose.disconnect();

      process.exit(1);
    }

    console.log(
      `👤 Using user: ${
        user.name ||
        user.email ||
        user._id
      }`
    );

    /*
    |--------------------------------------------------------------------------
    | INSERT RESOURCES
    |--------------------------------------------------------------------------
    */

    let inserted = 0;
    let skipped = 0;

    for (const item of resources) {
      const existing =
        await Resource.findOne({
          url: item.url,
        });

      if (existing) {
        skipped++;

        console.log(
          `⏭️ Already exists: ${item.title}`
        );

        continue;
      }

      await Resource.create({
        ...item,

        createdBy: user._id,

        /*
        IMPORTANT:
        These starter resources are trusted
        and therefore immediately visible.
        */

        status: "approved",

        views: 0,

        saves: 0,

        helpfulCount: 0,

        rating: {
          average: 0,
          count: 0,
        },

        savedBy: [],

        ratedBy: [],
      });

      inserted++;

      console.log(
        `✅ Added: ${item.title}`
      );
    }

    console.log("");
    console.log(
      "========================================"
    );
    console.log(
      "🎉 RESOURCE SEEDING COMPLETED"
    );
    console.log(
      "========================================"
    );

    console.log(
      `✅ Inserted: ${inserted}`
    );

    console.log(
      `⏭️ Skipped: ${skipped}`
    );

    console.log(
      `📚 Total starter resources: ${resources.length}`
    );

    console.log(
      "========================================"
    );

    console.log("");

    await mongoose.disconnect();

    process.exit(0);
  } catch (error) {
    console.error("");
    console.error(
      "❌ Resource Seeder Failed"
    );

    console.error(error);

    await mongoose.disconnect();

    process.exit(1);
  }
}

seedResources();