const mongoose = require("mongoose");

const RESOURCE_CATEGORIES = [
  "Java",
  "Python",
  "C",
  "C++",
  "JavaScript",
  "React",
  "Node.js",
  "Web Development",
  "DSA",
  "SQL",
  "Database",
  "AI",
  "Machine Learning",
  "Deep Learning",
  "Cloud",
  "DevOps",
  "Computer Networks",
  "Operating Systems",
  "Software Engineering",
  "Aptitude",
  "Reasoning",
  "Interview Preparation",
  "Placement Preparation",
  "Other",
  "Programming",
];

const RESOURCE_TYPES = [
  "PDF",
  "Video",
  "Article",
  "Website",
  "GitHub",
  "Course",
  "Practice",
  "Interview",
  "Document",
  "Other",
];

const DIFFICULTIES = [
  "Beginner",
  "Intermediate",
  "Advanced",
  "All Levels",
];

const resourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Resource title is required"],
      trim: true,
      minlength: 3,
      maxlength: 180,
    },

    description: {
      type: String,
      required: [true, "Resource description is required"],
      trim: true,
      minlength: 10,
      maxlength: 2000,
    },

    category: {
      type: String,
      required: [true, "Resource category is required"],
      trim: true,
      enum: RESOURCE_CATEGORIES,
      index: true,
    },

    type: {
      type: String,
      required: [true, "Resource type is required"],
      trim: true,
      enum: RESOURCE_TYPES,
      index: true,
    },

    difficulty: {
      type: String,
      default: "All Levels",
      enum: DIFFICULTIES,
      index: true,
    },

    url: {
      type: String,
      required: [true, "Resource URL is required"],
      trim: true,
      maxlength: 2000,
    },

    thumbnail: {
      type: String,
      default: "",
      trim: true,
      maxlength: 2000,
    },

    tags: {
      type: [String],
      default: [],
      set: (tags) =>
        Array.isArray(tags)
          ? tags
              .map((tag) => String(tag).trim().toLowerCase())
              .filter(Boolean)
              .slice(0, 15)
          : [],
    },

    estimatedTime: {
      type: Number,
      default: 0,
      min: 0,
      max: 10000,
    },

    authorName: {
      type: String,
      trim: true,
      default: "PrepPulse Admin",
      maxlength: 100,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },

    publishedAt: {
      type: Date,
      default: null,
    },

    rejectionReason: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
    },

    views: {
      type: Number,
      default: 0,
      min: 0,
    },

    saves: {
      type: Number,
      default: 0,
      min: 0,
    },

    helpfulCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    rating: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },

      count: {
        type: Number,
        default: 0,
        min: 0,
      },
    },

    savedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    ratedBy: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },

        rating: {
          type: Number,
          min: 1,
          max: 5,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

/*
|--------------------------------------------------------------------------
| INDEXES
|--------------------------------------------------------------------------
*/

resourceSchema.index({
  title: "text",
  description: "text",
  tags: "text",
});

resourceSchema.index({
  category: 1,
  type: 1,
  difficulty: 1,
  status: 1,
});

resourceSchema.index({
  status: 1,
  createdAt: -1,
});

resourceSchema.index({
  publishedAt: -1,
});

resourceSchema.index({
  views: -1,
});

resourceSchema.index({
  "rating.average": -1,
});

/*
|--------------------------------------------------------------------------
| JSON TRANSFORM
|--------------------------------------------------------------------------
*/

resourceSchema.set("toJSON", {
  transform: function (doc, ret) {
    delete ret.__v;
    delete ret.ratedBy;

    return ret;
  },
});

module.exports = mongoose.model("Resource", resourceSchema);