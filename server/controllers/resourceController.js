const mongoose = require("mongoose");

const Resource = require("../models/Resource");

const {
  notifyNewResource,
  createNotification,
} = require("../services/notificationService");

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

const getUserId = (req) => {
  return req.user?._id || req.user?.id || null;
};

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

const isAdmin = (req) => {
  const role = String(
    req.user?.role || ""
  ).toLowerCase();

  return [
    "admin",
    "administrator",
    "superadmin",
  ].includes(role);
};

const normalizeArray = (value) => {
  if (Array.isArray(value)) {
    return value
      .map((item) =>
        String(item)
          .trim()
          .toLowerCase()
      )
      .filter(Boolean)
      .slice(0, 15);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) =>
        item
          .trim()
          .toLowerCase()
      )
      .filter(Boolean)
      .slice(0, 15);
  }

  return [];
};

const escapeRegex = (value = "") => {
  return String(value).replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
};

const isValidUrl = (value) => {
  try {
    const url = new URL(value);

    return (
      url.protocol === "http:" ||
      url.protocol === "https:"
    );
  } catch {
    return false;
  }
};

const cleanUrl = (url) => {
  return String(url || "").trim();
};

const parseNumber = (
  value,
  defaultValue = 0
) => {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : defaultValue;
};

const getValidationMessage = (
  error
) => {
  if (
    error?.name ===
    "ValidationError"
  ) {
    return Object.values(
      error.errors || {}
    )
      .map(
        (item) =>
          item.message
      )
      .join(", ");
  }

  return null;
};

const populateResource = (
  query
) => {
  return query.populate(
    "createdBy",
    "name email role"
  );
};

/*
|--------------------------------------------------------------------------
| GET RESOURCES
| GET /api/resources
|--------------------------------------------------------------------------
*/

exports.getResources = async (
  req,
  res
) => {
  try {
    const {
      search = "",
      category,
      type,
      difficulty,
      sort = "latest",
    } = req.query;

    const page = Math.max(
      parseNumber(req.query.page, 1),
      1
    );

    const limit = Math.min(
      Math.max(
        parseNumber(
          req.query.limit,
          12
        ),
        1
      ),
      100
    );

    const filter = {
      status: "approved",
    };

    /*
    SEARCH
    */

    if (search.trim()) {
      const regex = new RegExp(
        escapeRegex(
          search.trim()
        ),
        "i"
      );

      filter.$or = [
        {
          title: regex,
        },
        {
          description: regex,
        },
        {
          tags: regex,
        },
        {
          category: regex,
        },
      ];
    }

    /*
    CATEGORY
    */

    if (
      category &&
      category !== "All"
    ) {
      filter.category =
        category;
    }

    /*
    TYPE
    */

    if (
      type &&
      type !== "All"
    ) {
      filter.type = type;
    }

    /*
    DIFFICULTY
    */

    if (
      difficulty &&
      difficulty !== "All"
    ) {
      filter.difficulty =
        difficulty;
    }

    /*
    SORT
    */

    let sortQuery = {
      createdAt: -1,
    };

    switch (sort) {
      case "oldest":
        sortQuery = {
          createdAt: 1,
        };
        break;

      case "popular":
        sortQuery = {
          views: -1,
          createdAt: -1,
        };
        break;

      case "rating":
        sortQuery = {
          "rating.average": -1,
          "rating.count": -1,
        };
        break;

      case "saves":
        sortQuery = {
          saves: -1,
          createdAt: -1,
        };
        break;

      case "title":
        sortQuery = {
          title: 1,
        };
        break;

      default:
        sortQuery = {
          createdAt: -1,
        };
    }

    const skip =
      (page - 1) * limit;

    const [
      resources,
      total,
    ] = await Promise.all([
      populateResource(
        Resource.find(filter)
      )
        .sort(sortQuery)
        .skip(skip)
        .limit(limit)
        .lean(),

      Resource.countDocuments(
        filter
      ),
    ]);

    return res.status(200).json({
      success: true,
      resources,

      pagination: {
        page,
        limit,
        total,
        totalPages:
          Math.ceil(
            total / limit
          ),
        hasNextPage:
          page * limit <
          total,
      },
    });
  } catch (error) {
    console.error(
      "Get Resources Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load resources",
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET SINGLE RESOURCE
| GET /api/resources/:id
|--------------------------------------------------------------------------
*/

exports.getResourceById = async (
  req,
  res
) => {
  try {
    if (
      !isValidObjectId(
        req.params.id
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid resource ID",
      });
    }

    const resource =
      await populateResource(
        Resource.findOne({
          _id: req.params.id,
          status: "approved",
        })
      ).lean();

    if (!resource) {
      return res.status(404).json({
        success: false,
        message:
          "Resource not found",
      });
    }

    return res.status(200).json({
      success: true,
      resource,
    });
  } catch (error) {
    console.error(
      "Get Resource Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load resource",
    });
  }
};

/*
|--------------------------------------------------------------------------
| CREATE RESOURCE
| POST /api/resources
|--------------------------------------------------------------------------
|
| Student-created resources are pending.
|
*/

exports.createResource = async (
  req,
  res
) => {
  try {
    const userId =
      getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required",
      });
    }

    const {
      title,
      description,
      category,
      type,
      difficulty,
      url,
      thumbnail,
      tags,
      estimatedTime,
      authorName,
    } = req.body;

    if (
      !title ||
      !description ||
      !category ||
      !type ||
      !url
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Title, description, category, type and URL are required",
      });
    }

    const resourceUrl =
      cleanUrl(url);

    if (!isValidUrl(resourceUrl)) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide a valid HTTP or HTTPS URL",
      });
    }

    /*
    DUPLICATE URL
    */

    const duplicate =
      await Resource.findOne({
        url: resourceUrl,
      });

    if (duplicate) {
      return res.status(409).json({
        success: false,
        message:
          "A resource with this URL already exists",
      });
    }

    const resource =
      await Resource.create({
        title:
          String(title).trim(),

        description:
          String(
            description
          ).trim(),

        category:
          String(category).trim(),

        type:
          String(type).trim(),

        difficulty:
          difficulty ||
          "All Levels",

        url: resourceUrl,

        thumbnail:
          cleanUrl(
            thumbnail
          ),

        tags:
          normalizeArray(tags),

        estimatedTime:
          parseNumber(
            estimatedTime,
            0
          ),

        authorName:
          authorName ||
          req.user?.name ||
          "PrepPulse User",

        createdBy: userId,

        status: "pending",

        publishedAt: null,
      });

    /*
    NOTIFY THE USER
    */

    await createNotification({
      userId,

      type: "RESOURCE",

      title:
        "📚 Resource Submitted",

      message:
        `"${resource.title}" has been submitted and is waiting for admin approval.`,

      icon: "📚",

      link: "/resources",
    });

    return res.status(201).json({
      success: true,

      message:
        "Resource submitted successfully and is waiting for approval.",

      resource,
    });
  } catch (error) {
    console.error(
      "Create Resource Error:",
      error
    );

    const validationMessage =
      getValidationMessage(
        error
      );

    return res.status(500).json({
      success: false,
      message:
        validationMessage ||
        error?.message ||
        "Failed to create resource",
    });
  }
};

/*
|--------------------------------------------------------------------------
| CREATE ADMIN RESOURCE
| POST /api/resources/admin
|--------------------------------------------------------------------------
|
| THIS IS THE IMPORTANT FUNCTION
|
| Admin creates resource
|       ↓
| Resource published
|       ↓
| Notify ALL users
|
|--------------------------------------------------------------------------
*/

exports.createAdminResource =
  async (req, res) => {
    try {
      const userId =
        getUserId(req);

      if (!userId) {
        return res.status(401).json({
          success: false,
          message:
            "Authentication required",
        });
      }

      if (!isAdmin(req)) {
        return res.status(403).json({
          success: false,
          message:
            "Admin access required",
        });
      }

      const {
        title,
        description,
        category,
        type,
        difficulty,
        url,
        thumbnail,
        tags,
        estimatedTime,
        authorName,
      } = req.body;

      /*
      REQUIRED FIELDS
      */

      if (
        !title ||
        !description ||
        !category ||
        !type ||
        !url
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Title, description, category, type and URL are required",
        });
      }

      const resourceUrl =
        cleanUrl(url);

      /*
      URL VALIDATION
      */

      if (!isValidUrl(resourceUrl)) {
        return res.status(400).json({
          success: false,
          message:
            "Please provide a valid HTTP or HTTPS URL",
        });
      }

      /*
      DUPLICATE URL
      */

      const duplicate =
        await Resource.findOne({
          url: resourceUrl,
        });

      if (duplicate) {
        return res.status(409).json({
          success: false,
          message:
            "A resource with this URL already exists",
        });
      }

      /*
      CREATE RESOURCE
      */

      const resource =
        await Resource.create({
          title:
            String(title).trim(),

          description:
            String(
              description
            ).trim(),

          category:
            String(category).trim(),

          type:
            String(type).trim(),

          difficulty:
            difficulty ||
            "All Levels",

          url: resourceUrl,

          thumbnail:
            cleanUrl(
              thumbnail
            ),

          tags:
            normalizeArray(tags),

          estimatedTime:
            parseNumber(
              estimatedTime,
              0
            ),

          authorName:
            authorName ||
            req.user?.name ||
            "PrepPulse Admin",

          createdBy: userId,

          updatedBy: userId,

          status: "approved",

          publishedAt:
            new Date(),

          rejectionReason:
            "",
        });

      /*
      ======================================================
      🔔 NOTIFY ALL USERS
      ======================================================
      */

      try {
        const notificationResult =
          await notifyNewResource({
            title:
              resource.title,

            resourceType:
              resource.type ||
              "Learning Resource",
          });

        console.log(
          "Resource notification result:",
          notificationResult
        );
      } catch (notificationError) {
        /*
        Notification failure should NOT
        make resource creation fail.
        */

        console.error(
          "New Resource Notification Error:",
          notificationError
        );
      }

      return res.status(201).json({
        success: true,

        message:
          "Resource published successfully. All users have been notified.",

        resource,
      });
    } catch (error) {
      console.error(
        "Create Admin Resource Error:",
        error
      );

      const validationMessage =
        getValidationMessage(
          error
        );

      return res.status(500).json({
        success: false,
        message:
          validationMessage ||
          error?.message ||
          "Failed to create admin resource",
      });
    }
  };

/*
|--------------------------------------------------------------------------
| UPDATE RESOURCE
| PUT /api/resources/:id
|--------------------------------------------------------------------------
*/

exports.updateResource = async (
  req,
  res
) => {
  try {
    const userId =
      getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required",
      });
    }

    if (
      !isValidObjectId(
        req.params.id
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid resource ID",
      });
    }

    const resource =
      await Resource.findById(
        req.params.id
      );

    if (!resource) {
      return res.status(404).json({
        success: false,
        message:
          "Resource not found",
      });
    }

    const owner =
      String(
        resource.createdBy
      ) === String(userId);

    if (!owner && !isAdmin(req)) {
      return res.status(403).json({
        success: false,
        message:
          "You are not allowed to update this resource",
      });
    }

    const allowedFields = [
      "title",
      "description",
      "category",
      "type",
      "difficulty",
      "url",
      "thumbnail",
      "tags",
      "estimatedTime",
      "authorName",
    ];

    allowedFields.forEach(
      (field) => {
        if (
          req.body[field] !==
          undefined
        ) {
          if (
            field === "tags"
          ) {
            resource.tags =
              normalizeArray(
                req.body.tags
              );
          } else if (
            field === "url"
          ) {
            resource.url =
              cleanUrl(
                req.body.url
              );
          } else if (
            field ===
            "estimatedTime"
          ) {
            resource.estimatedTime =
              parseNumber(
                req.body
                  .estimatedTime,
                0
              );
          } else {
            resource[field] =
              req.body[field];
          }
        }
      }
    );

    if (
      resource.url &&
      !isValidUrl(
        resource.url
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid resource URL",
      });
    }

    /*
    DUPLICATE URL
    */

    if (
      resource.isModified(
        "url"
      )
    ) {
      const duplicate =
        await Resource.findOne({
          url: resource.url,
          _id: {
            $ne: resource._id,
          },
        });

      if (duplicate) {
        return res.status(409).json({
          success: false,
          message:
            "Another resource with this URL already exists",
        });
      }
    }

    resource.updatedBy =
      userId;

    await resource.save();

    /*
    NOTIFY OWNER IF ADMIN UPDATED
    */

    if (
      isAdmin(req) &&
      String(
        resource.createdBy
      ) !== String(userId)
    ) {
      await createNotification({
        userId:
          resource.createdBy,

        type: "RESOURCE",

        title:
          "📚 Resource Updated",

        message:
          `"${resource.title}" has been updated by the PrepPulse admin.`,

        icon: "📚",

        link: "/resources",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Resource updated successfully",
      resource,
    });
  } catch (error) {
    console.error(
      "Update Resource Error:",
      error
    );

    const validationMessage =
      getValidationMessage(
        error
      );

    return res.status(500).json({
      success: false,
      message:
        validationMessage ||
        "Failed to update resource",
    });
  }
};

/*
|--------------------------------------------------------------------------
| DELETE RESOURCE
| DELETE /api/resources/:id
|--------------------------------------------------------------------------
*/

exports.deleteResource = async (
  req,
  res
) => {
  try {
    const userId =
      getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required",
      });
    }

    if (
      !isValidObjectId(
        req.params.id
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid resource ID",
      });
    }

    const resource =
      await Resource.findById(
        req.params.id
      );

    if (!resource) {
      return res.status(404).json({
        success: false,
        message:
          "Resource not found",
      });
    }

    const owner =
      String(
        resource.createdBy
      ) === String(userId);

    if (!owner && !isAdmin(req)) {
      return res.status(403).json({
        success: false,
        message:
          "You are not allowed to delete this resource",
      });
    }

    const resourceTitle =
      resource.title;

    const resourceOwner =
      resource.createdBy;

    await resource.deleteOne();

    /*
    NOTIFY OWNER WHEN ADMIN DELETES
    */

    if (
      isAdmin(req) &&
      String(resourceOwner) !==
        String(userId)
    ) {
      await createNotification({
        userId:
          resourceOwner,

        type: "RESOURCE",

        title:
          "🗑️ Resource Removed",

        message:
          `"${resourceTitle}" has been removed by the PrepPulse admin.`,

        icon: "🗑️",

        link: "/resources",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Resource deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete Resource Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete resource",
    });
  }
};

/*
|--------------------------------------------------------------------------
| INCREMENT VIEW
| POST /api/resources/:id/view
|--------------------------------------------------------------------------
*/

exports.incrementView = async (
  req,
  res
) => {
  try {
    if (
      !isValidObjectId(
        req.params.id
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid resource ID",
      });
    }

    const resource =
      await Resource.findOneAndUpdate(
        {
          _id: req.params.id,
          status: "approved",
        },
        {
          $inc: {
            views: 1,
          },
        },
        {
          new: true,
        }
      ).lean();

    if (!resource) {
      return res.status(404).json({
        success: false,
        message:
          "Resource not found",
      });
    }

    return res.status(200).json({
      success: true,
      views:
        resource.views,
    });
  } catch (error) {
    console.error(
      "Increment View Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update views",
    });
  }
};

/*
|--------------------------------------------------------------------------
| SAVE RESOURCE
| POST /api/resources/:id/save
|--------------------------------------------------------------------------
*/

exports.saveResource = async (
  req,
  res
) => {
  try {
    const userId =
      getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required",
      });
    }

    if (
      !isValidObjectId(
        req.params.id
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid resource ID",
      });
    }

    const resource =
      await Resource.findOne({
        _id: req.params.id,
        status: "approved",
      });

    if (!resource) {
      return res.status(404).json({
        success: false,
        message:
          "Resource not found",
      });
    }

    const alreadySaved =
      resource.savedBy.some(
        (id) =>
          String(id) ===
          String(userId)
      );

    if (!alreadySaved) {
      resource.savedBy.push(
        userId
      );

      resource.saves =
        resource.savedBy.length;

      await resource.save();

      /*
      NOTIFY USER
      */

      await createNotification({
        userId,

        type: "RESOURCE",

        title:
          "🔖 Resource Saved",

        message:
          `"${resource.title}" has been saved to your resources.`,

        icon: "🔖",

        link: "/resources",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Resource saved successfully",
      saves:
        resource.saves,
    });
  } catch (error) {
    console.error(
      "Save Resource Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to save resource",
    });
  }
};

/*
|--------------------------------------------------------------------------
| UNSAVE RESOURCE
| DELETE /api/resources/:id/save
|--------------------------------------------------------------------------
*/

exports.unsaveResource = async (
  req,
  res
) => {
  try {
    const userId =
      getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required",
      });
    }

    const resource =
      await Resource.findOne({
        _id: req.params.id,
        status: "approved",
      });

    if (!resource) {
      return res.status(404).json({
        success: false,
        message:
          "Resource not found",
      });
    }

    resource.savedBy =
      resource.savedBy.filter(
        (id) =>
          String(id) !==
          String(userId)
      );

    resource.saves =
      resource.savedBy.length;

    await resource.save();

    return res.status(200).json({
      success: true,
      message:
        "Resource removed from saved resources",
      saves:
        resource.saves,
    });
  } catch (error) {
    console.error(
      "Unsave Resource Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to unsave resource",
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET SAVED RESOURCES
| GET /api/resources/saved/me
|--------------------------------------------------------------------------
*/

exports.getSavedResources =
  async (req, res) => {
    try {
      const userId =
        getUserId(req);

      if (!userId) {
        return res.status(401).json({
          success: false,
          message:
            "Authentication required",
        });
      }

      const resources =
        await populateResource(
          Resource.find({
            savedBy: userId,
            status: "approved",
          })
        )
          .sort({
            createdAt: -1,
          })
          .lean();

      return res.status(200).json({
        success: true,
        resources,
      });
    } catch (error) {
      console.error(
        "Get Saved Resources Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to load saved resources",
      });
    }
  };

/*
|--------------------------------------------------------------------------
| RATE RESOURCE
| POST /api/resources/:id/rating
|--------------------------------------------------------------------------
*/

exports.rateResource = async (
  req,
  res
) => {
  try {
    const userId =
      getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required",
      });
    }

    const rating =
      Number(req.body.rating);

    if (
      !Number.isFinite(
        rating
      ) ||
      rating < 1 ||
      rating > 5
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Rating must be between 1 and 5",
      });
    }

    const resource =
      await Resource.findOne({
        _id: req.params.id,
        status: "approved",
      });

    if (!resource) {
      return res.status(404).json({
        success: false,
        message:
          "Resource not found",
      });
    }

    const existingIndex =
      resource.ratedBy.findIndex(
        (item) =>
          String(
            item.user
          ) ===
          String(userId)
      );

    if (
      existingIndex >= 0
    ) {
      resource.ratedBy[
        existingIndex
      ].rating = rating;
    } else {
      resource.ratedBy.push({
        user: userId,
        rating,
      });
    }

    const ratings =
      resource.ratedBy.map(
        (item) =>
          Number(
            item.rating
          )
      );

    const total =
      ratings.reduce(
        (sum, value) =>
          sum + value,
        0
      );

    resource.rating = {
      average:
        ratings.length
          ? Number(
              (
                total /
                ratings.length
              ).toFixed(1)
            )
          : 0,

      count:
        ratings.length,
    };

    await resource.save();

    return res.status(200).json({
      success: true,
      message:
        "Resource rated successfully",
      rating:
        resource.rating,
    });
  } catch (error) {
    console.error(
      "Rate Resource Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to rate resource",
    });
  }
};

/*
|--------------------------------------------------------------------------
| MARK HELPFUL
| POST /api/resources/:id/helpful
|--------------------------------------------------------------------------
*/

exports.markHelpful = async (
  req,
  res
) => {
  try {
    const resource =
      await Resource.findOneAndUpdate(
        {
          _id: req.params.id,
          status: "approved",
        },
        {
          $inc: {
            helpfulCount: 1,
          },
        },
        {
          new: true,
        }
      );

    if (!resource) {
      return res.status(404).json({
        success: false,
        message:
          "Resource not found",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Resource marked as helpful",
      helpfulCount:
        resource.helpfulCount,
    });
  } catch (error) {
    console.error(
      "Mark Helpful Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to mark resource helpful",
    });
  }
};

/*
|--------------------------------------------------------------------------
| RESOURCE STATS
| GET /api/resources/stats/overview
|--------------------------------------------------------------------------
*/

exports.getResourceStats =
  async (req, res) => {
    try {
      const [
        total,
        videos,
        pdfs,
        courses,
        articles,
        github,
      ] = await Promise.all([
        Resource.countDocuments({
          status: "approved",
        }),

        Resource.countDocuments({
          status: "approved",
          type: "Video",
        }),

        Resource.countDocuments({
          status: "approved",
          type: "PDF",
        }),

        Resource.countDocuments({
          status: "approved",
          type: "Course",
        }),

        Resource.countDocuments({
          status: "approved",
          type: "Article",
        }),

        Resource.countDocuments({
          status: "approved",
          type: "GitHub",
        }),
      ]);

      return res.status(200).json({
        success: true,

        stats: {
          total,
          videos,
          pdfs,
          courses,
          articles,
          github,
        },
      });
    } catch (error) {
      console.error(
        "Resource Stats Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to load resource stats",
      });
    }
  };

/*
|--------------------------------------------------------------------------
| RESOURCE META
| GET /api/resources/meta
|--------------------------------------------------------------------------
*/

exports.getResourceMeta =
  async (req, res) => {
    try {
      const [
        categories,
        types,
        difficulties,
      ] = await Promise.all([
        Resource.distinct(
          "category",
          {
            status: "approved",
          }
        ),

        Resource.distinct(
          "type",
          {
            status: "approved",
          }
        ),

        Resource.distinct(
          "difficulty",
          {
            status: "approved",
          }
        ),
      ]);

      return res.status(200).json({
        success: true,

        categories:
          categories.sort(),

        types:
          types.sort(),

        difficulties:
          difficulties.sort(),
      });
    } catch (error) {
      console.error(
        "Resource Meta Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to load resource metadata",
      });
    }
  };

/*
|--------------------------------------------------------------------------
| CHECK ADMIN ACCESS
| GET /api/resources/admin/check
|--------------------------------------------------------------------------
*/

exports.checkAdminAccess =
  async (req, res) => {
    return res.status(200).json({
      success: true,
      isAdmin: isAdmin(req),
      role:
        req.user?.role ||
        null,
    });
  };

/*
|--------------------------------------------------------------------------
| GET ALL RESOURCES FOR ADMIN
| GET /api/resources/admin/all
|--------------------------------------------------------------------------
*/

exports.getAllResourcesForAdmin =
  async (req, res) => {
    try {
      if (!isAdmin(req)) {
        return res.status(403).json({
          success: false,
          message:
            "Admin access required",
        });
      }

      const {
        search = "",
        status,
        category,
        type,
        difficulty,
        sort = "latest",
      } = req.query;

      const page = Math.max(
        parseNumber(
          req.query.page,
          1
        ),
        1
      );

      const limit = Math.min(
        Math.max(
          parseNumber(
            req.query.limit,
            20
          ),
          1
        ),
        100
      );

      const filter = {};

      if (status) {
        filter.status = status;
      }

      if (category) {
        filter.category =
          category;
      }

      if (type) {
        filter.type = type;
      }

      if (difficulty) {
        filter.difficulty =
          difficulty;
      }

      if (search.trim()) {
        const regex = new RegExp(
          escapeRegex(
            search.trim()
          ),
          "i"
        );

        filter.$or = [
          {
            title: regex,
          },
          {
            description: regex,
          },
          {
            category: regex,
          },
          {
            tags: regex,
          },
        ];
      }

      let sortQuery = {
        createdAt: -1,
      };

      if (sort === "oldest") {
        sortQuery = {
          createdAt: 1,
        };
      }

      if (sort === "popular") {
        sortQuery = {
          views: -1,
          createdAt: -1,
        };
      }

      if (sort === "rating") {
        sortQuery = {
          "rating.average": -1,
        };
      }

      const skip =
        (page - 1) * limit;

      const [
        resources,
        total,
      ] = await Promise.all([
        populateResource(
          Resource.find(filter)
        )
          .sort(sortQuery)
          .skip(skip)
          .limit(limit)
          .lean(),

        Resource.countDocuments(
          filter
        ),
      ]);

      return res.status(200).json({
        success: true,
        resources,

        pagination: {
          page,
          limit,
          total,
          totalPages:
            Math.ceil(
              total / limit
            ),
        },
      });
    } catch (error) {
      console.error(
        "Admin Resources Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to load admin resources",
      });
    }
  };

/*
|--------------------------------------------------------------------------
| GET PENDING RESOURCES
| GET /api/resources/moderation/pending
|--------------------------------------------------------------------------
*/

exports.getPendingResources =
  async (req, res) => {
    try {
      if (!isAdmin(req)) {
        return res.status(403).json({
          success: false,
          message:
            "Admin access required",
        });
      }

      const resources =
        await populateResource(
          Resource.find({
            status: "pending",
          })
        )
          .sort({
            createdAt: -1,
          })
          .lean();

      return res.status(200).json({
        success: true,
        resources,
      });
    } catch (error) {
      console.error(
        "Pending Resources Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to load pending resources",
      });
    }
  };

/*
|--------------------------------------------------------------------------
| APPROVE RESOURCE
| PATCH /api/resources/:id/approve
|--------------------------------------------------------------------------
*/

exports.approveResource =
  async (req, res) => {
    try {
      const adminId =
        getUserId(req);

      if (!isAdmin(req)) {
        return res.status(403).json({
          success: false,
          message:
            "Admin access required",
        });
      }

      if (
        !isValidObjectId(
          req.params.id
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid resource ID",
        });
      }

      const resource =
        await Resource.findById(
          req.params.id
        );

      if (!resource) {
        return res.status(404).json({
          success: false,
          message:
            "Resource not found",
        });
      }

      resource.status =
        "approved";

      resource.publishedAt =
        new Date();

      resource.updatedBy =
        adminId;

      resource.rejectionReason =
        "";

      await resource.save();

      /*
      NOTIFY RESOURCE CREATOR
      */

      await createNotification({
        userId:
          resource.createdBy,

        type: "RESOURCE",

        title:
          "✅ Resource Approved",

        message:
          `"${resource.title}" has been approved and is now available in the Resource Library.`,

        icon: "✅",

        link: "/resources",
      });

      return res.status(200).json({
        success: true,

        message:
          "Resource approved successfully",

        resource,
      });
    } catch (error) {
      console.error(
        "Approve Resource Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to approve resource",
      });
    }
  };

/*
|--------------------------------------------------------------------------
| REJECT RESOURCE
| PATCH /api/resources/:id/reject
|--------------------------------------------------------------------------
*/

exports.rejectResource =
  async (req, res) => {
    try {
      const adminId =
        getUserId(req);

      if (!isAdmin(req)) {
        return res.status(403).json({
          success: false,
          message:
            "Admin access required",
        });
      }

      if (
        !isValidObjectId(
          req.params.id
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid resource ID",
        });
      }

      const resource =
        await Resource.findById(
          req.params.id
        );

      if (!resource) {
        return res.status(404).json({
          success: false,
          message:
            "Resource not found",
        });
      }

      const reason =
        String(
          req.body?.reason ||
            req.body
              ?.rejectionReason ||
            "The resource did not meet the approval requirements."
        ).trim();

      resource.status =
        "rejected";

      resource.rejectionReason =
        reason;

      resource.updatedBy =
        adminId;

      await resource.save();

      /*
      NOTIFY RESOURCE CREATOR
      */

      await createNotification({
        userId:
          resource.createdBy,

        type: "RESOURCE",

        title:
          "❌ Resource Rejected",

        message:
          `"${resource.title}" was rejected. Reason: ${reason}`,

        icon: "❌",

        link: "/resources",
      });

      return res.status(200).json({
        success: true,

        message:
          "Resource rejected successfully",

        resource,
      });
    } catch (error) {
      console.error(
        "Reject Resource Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to reject resource",
      });
    }
  };

/*
|--------------------------------------------------------------------------
| ADMIN DELETE RESOURCE
| DELETE /api/resources/admin/:id
|--------------------------------------------------------------------------
*/

exports.adminDeleteResource =
  async (req, res) => {
    try {
      const adminId =
        getUserId(req);

      if (!isAdmin(req)) {
        return res.status(403).json({
          success: false,
          message:
            "Admin access required",
        });
      }

      if (
        !isValidObjectId(
          req.params.id
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid resource ID",
        });
      }

      const resource =
        await Resource.findById(
          req.params.id
        );

      if (!resource) {
        return res.status(404).json({
          success: false,
          message:
            "Resource not found",
        });
      }

      const ownerId =
        resource.createdBy;

      const resourceTitle =
        resource.title;

      await resource.deleteOne();

      /*
      NOTIFY ORIGINAL CREATOR
      */

      if (
        String(ownerId) !==
        String(adminId)
      ) {
        await createNotification({
          userId: ownerId,

          type: "RESOURCE",

          title:
            "🗑️ Resource Removed",

          message:
            `"${resourceTitle}" has been removed by the PrepPulse admin.`,

          icon: "🗑️",

          link: "/resources",
        });
      }

      return res.status(200).json({
        success: true,
        message:
          "Resource permanently deleted",
      });
    } catch (error) {
      console.error(
        "Admin Delete Resource Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to delete resource",
      });
    }
  };

/*
|--------------------------------------------------------------------------
| ADMIN DASHBOARD
| GET /api/resources/admin/dashboard
|--------------------------------------------------------------------------
*/

exports.getAdminResourceDashboard =
  async (req, res) => {
    try {
      if (!isAdmin(req)) {
        return res.status(403).json({
          success: false,
          message:
            "Admin access required",
        });
      }

      const [
        total,
        approved,
        pending,
        rejected,
        viewsResult,
        savesResult,
      ] = await Promise.all([
        Resource.countDocuments(),

        Resource.countDocuments({
          status: "approved",
        }),

        Resource.countDocuments({
          status: "pending",
        }),

        Resource.countDocuments({
          status: "rejected",
        }),

        Resource.aggregate([
          {
            $group: {
              _id: null,
              totalViews: {
                $sum: "$views",
              },
            },
          },
        ]),

        Resource.aggregate([
          {
            $group: {
              _id: null,
              totalSaves: {
                $sum: "$saves",
              },
            },
          },
        ]),
      ]);

      return res.status(200).json({
        success: true,

        dashboard: {
          total,
          approved,
          pending,
          rejected,

          totalViews:
            viewsResult[0]
              ?.totalViews || 0,

          totalSaves:
            savesResult[0]
              ?.totalSaves || 0,
        },
      });
    } catch (error) {
      console.error(
        "Admin Resource Dashboard Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to load resource dashboard",
      });
    }
  };