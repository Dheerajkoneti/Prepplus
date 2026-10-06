import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  AnimatePresence,
  motion,
} from "framer-motion";

import API from "../../services/api";

import {
  FiSearch,
  FiPlus,
  FiBookOpen,
  FiVideo,
  FiFileText,
  FiLink,
  FiBookmark,
  FiExternalLink,
  FiFilter,
  FiGrid,
  FiList,
  FiTrendingUp,
  FiX,
  FiArrowLeft,
  FiRefreshCw,
  FiEye,
  FiAward,
  FiUploadCloud,
  FiCode,
  FiDatabase,
  FiCpu,
  FiGlobe,
  FiLayers,
  FiCheckCircle,
  FiAlertCircle,
  FiClock,
  FiUser,
  FiCopy,
  FiCheck,
  FiStar,
  FiChevronLeft,
  FiChevronRight,
  FiPlayCircle,
  FiZap,
  FiShield,
  FiBarChart2,
  FiTrash2,
} from "react-icons/fi";

import logoImage from "../../assets/images/Gemini_Generated_Image_70rl6i70rl6i70rl.png";

/* =========================================================
   HELPERS
========================================================= */

const safeArray = (value) => {
  return Array.isArray(value) ? value : [];
};

const getResourceId = (resource) => {
  return (
    resource?._id ||
    resource?.id ||
    resource?.resourceId ||
    resource?.slug ||
    ""
  );
};

const getResourceTitle = (resource) => {
  return (
    resource?.title ||
    resource?.name ||
    resource?.resourceName ||
    "Untitled Resource"
  );
};

const getResourceDescription = (resource) => {
  return (
    resource?.description ||
    resource?.summary ||
    resource?.excerpt ||
    "Explore this learning resource on PrepPulse."
  );
};

const getResourceCategory = (resource) => {
  return (
    resource?.category ||
    resource?.resourceCategory ||
    "Other"
  );
};

const getResourceType = (resource) => {
  return (
    resource?.type ||
    resource?.resourceType ||
    "Link"
  );
};

const getResourceDifficulty = (resource) => {
  return (
    resource?.difficulty ||
    resource?.level ||
    "All Levels"
  );
};

const getResourceUrl = (resource) => {
  return (
    resource?.url ||
    resource?.link ||
    resource?.resourceUrl ||
    resource?.fileUrl ||
    resource?.youtubeUrl ||
    ""
  );
};

const getResourceImage = (resource) => {
  return (
    resource?.thumbnail ||
    resource?.thumbnailUrl ||
    resource?.image ||
    resource?.imageUrl ||
    ""
  );
};

const getResourceDate = (resource) => {
  return (
    resource?.publishedAt ||
    resource?.createdAt ||
    resource?.updatedAt ||
    null
  );
};

const getResourceViews = (resource) => {
  return Number(
    resource?.views ||
      resource?.viewCount ||
      0
  );
};

const getResourceSaves = (resource) => {
  return Number(
    resource?.saves ||
      resource?.saveCount ||
      0
  );
};

const getResourceRating = (resource) => {
  return Number(
    resource?.rating?.average ||
      resource?.rating ||
      0
  );
};

const getResourceEstimatedTime = (resource) => {
  return Number(
    resource?.estimatedTime ||
      resource?.duration ||
      0
  );
};

const getResourceTags = (resource) => {
  return safeArray(resource?.tags);
};

const formatDate = (date) => {
  if (!date) return "Recently added";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "Recently added";
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatNumber = (value) => {
  const number = Number(value || 0);

  if (number >= 1000000) {
    return `${(number / 1000000).toFixed(1)}M`;
  }

  if (number >= 1000) {
    return `${(number / 1000).toFixed(1)}K`;
  }

  return String(number);
};

const getTypeIcon = (type) => {
  const value = String(type || "").toLowerCase();

  if (
    value.includes("video") ||
    value.includes("youtube")
  ) {
    return <FiVideo />;
  }

  if (
    value.includes("pdf") ||
    value.includes("document") ||
    value.includes("doc")
  ) {
    return <FiFileText />;
  }

  if (
    value.includes("code") ||
    value.includes("github") ||
    value.includes("practice")
  ) {
    return <FiCode />;
  }

  if (
    value.includes("article") ||
    value.includes("blog")
  ) {
    return <FiBookOpen />;
  }

  return <FiLink />;
};

const getTypeColor = (type) => {
  const value = String(type || "").toLowerCase();

  if (
    value.includes("video") ||
    value.includes("youtube")
  ) {
    return "#f87171";
  }

  if (
    value.includes("pdf") ||
    value.includes("document")
  ) {
    return "#fbbf24";
  }

  if (
    value.includes("code") ||
    value.includes("github") ||
    value.includes("practice")
  ) {
    return "#c084fc";
  }

  if (
    value.includes("article") ||
    value.includes("blog")
  ) {
    return "#38bdf8";
  }

  return "#34d399";
};

const getCategoryIcon = (category) => {
  const value = String(category || "").toLowerCase();

  if (
    value.includes("java") ||
    value.includes("program")
  ) {
    return <FiCode />;
  }

  if (
    value.includes("database") ||
    value.includes("sql")
  ) {
    return <FiDatabase />;
  }

  if (
    value.includes("ai") ||
    value.includes("machine") ||
    value.includes("ml")
  ) {
    return <FiCpu />;
  }

  if (
    value.includes("web") ||
    value.includes("frontend") ||
    value.includes("backend")
  ) {
    return <FiGlobe />;
  }

  return <FiLayers />;
};

const getRoleFromToken = () => {
  try {
    const token = localStorage.getItem("token");

    if (!token) return "";

    const payload = token.split(".")[1];

    if (!payload) return "";

    const normalized = payload
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const decoded = JSON.parse(
      atob(normalized)
    );

    return String(
      decoded?.role ||
        decoded?.userRole ||
        ""
    ).toLowerCase();
  } catch {
    return "";
  }
};

const getAuthorName = (resource) => {
  if (resource?.authorName) {
    return resource.authorName;
  }

  if (
    resource?.createdBy &&
    typeof resource.createdBy === "object"
  ) {
    return (
      resource.createdBy.name ||
      resource.createdBy.email ||
      "PrepPulse"
    );
  }

  return "PrepPulse";
};

/* =========================================================
   RESOURCE CARD
========================================================= */


function ResourceCard({
  resource,
  saved,
  viewMode,
  onSave,
  onOpen,
  onDetails,
  onDelete,
  isAdmin,
}) {
  const title = getResourceTitle(resource);

  const description =
    getResourceDescription(resource);

  const type =
    getResourceType(resource);

  const category =
    getResourceCategory(resource);

  const difficulty =
    getResourceDifficulty(resource);

  const image =
    getResourceImage(resource);

  const views =
    getResourceViews(resource);

  const saves =
    getResourceSaves(resource);

  const rating =
    getResourceRating(resource);

  const time =
    getResourceEstimatedTime(resource);

  const tags =
    getResourceTags(resource);

  const color =
    getTypeColor(type);

  /*
  |--------------------------------------------------------------------------
  | LIST VIEW
  |--------------------------------------------------------------------------
  */

  if (viewMode === "list") {
    return (
      <motion.article
        layout
        initial={{
          opacity: 0,
          y: 15,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        exit={{
          opacity: 0,
          y: -10,
        }}
        className="resource-list-card"
      >
        <div
          className="resource-list-icon"
          style={{
            color,
            background: `${color}12`,
            borderColor: `${color}25`,
          }}
        >
          {getTypeIcon(type)}
        </div>

        <div className="resource-list-main">
          <div className="resource-card-top">
            <span
              className="type-badge"
              style={{
                color,
                borderColor: `${color}30`,
                background: `${color}0d`,
              }}
            >
              {getTypeIcon(type)}
              {type}
            </span>

            <span className="date-text">
              {formatDate(
                getResourceDate(resource)
              )}
            </span>
          </div>

          <h3>{title}</h3>

          <p>{description}</p>

          <div className="resource-meta-row">
            <span>
              {getCategoryIcon(category)}
              {category}
            </span>

            <span>
              <FiAward />
              {difficulty}
            </span>

            {time > 0 && (
              <span>
                <FiClock />
                {time} min
              </span>
            )}

            <span>
              <FiEye />
              {formatNumber(views)}
            </span>

            {rating > 0 && (
              <span>
                <FiStar />
                {rating.toFixed(1)}
              </span>
            )}
          </div>

          {tags.length > 0 && (
            <div className="tag-row">
              {tags
                .slice(0, 4)
                .map((tag) => (
                  <span key={tag}>
                    #{tag}
                  </span>
                ))}
            </div>
          )}
        </div>

        <div className="resource-list-actions">
          {/* SAVE */}
          <button
            className={`icon-action ${
              saved ? "saved" : ""
            }`}
            onClick={() =>
              onSave(
                getResourceId(resource)
              )
            }
            title={
              saved
                ? "Remove bookmark"
                : "Save resource"
            }
          >
            <FiBookmark />
          </button>

          {/* DETAILS */}
          <button
            className="secondary-action"
            onClick={() =>
              onDetails(resource)
            }
          >
            Details
          </button>

          {/* OPEN */}
          <button
            className="primary-action"
            onClick={() =>
              onOpen(resource)
            }
          >
            Open
            <FiExternalLink />
          </button>

          {/* DELETE - ADMIN ONLY */}
          {isAdmin && (
            <button
              className="delete-action"
              onClick={() =>
                onDelete(resource)
              }
              title="Delete resource"
            >
              <FiTrash2 />
              Delete
            </button>
          )}
        </div>
      </motion.article>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | GRID VIEW
  |--------------------------------------------------------------------------
  */

  return (
    <motion.article
      layout
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      exit={{
        opacity: 0,
        y: -15,
      }}
      whileHover={{
        y: -7,
      }}
      className="resource-card"
    >
      <div className="resource-cover">
        {image ? (
          <img
            src={image}
            alt={title}
            onError={(event) => {
              event.currentTarget.style.display =
                "none";
            }}
          />
        ) : (
          <div
            className="resource-cover-placeholder"
            style={{
              background: `radial-gradient(circle at 30% 20%, ${color}35, transparent 45%), linear-gradient(135deg, ${color}15, rgba(10,15,30,.95))`,
            }}
          >
            <div
              className="cover-icon"
              style={{
                color,
                borderColor: `${color}35`,
                background: `${color}12`,
              }}
            >
              {getTypeIcon(type)}
            </div>

            <span>{type}</span>
          </div>
        )}

        <div className="cover-overlay" />

        <div className="cover-top">
          <span
            className="type-badge"
            style={{
              color,
              borderColor: `${color}35`,
              background:
                "rgba(5,8,20,.72)",
            }}
          >
            {getTypeIcon(type)}
            {type}
          </span>

          <button
            className={`cover-save ${
              saved ? "saved" : ""
            }`}
            onClick={() =>
              onSave(
                getResourceId(resource)
              )
            }
            title={
              saved
                ? "Remove bookmark"
                : "Save resource"
            }
          >
            <FiBookmark />
          </button>
        </div>

        <div className="cover-bottom">
          <span>
            {getCategoryIcon(category)}
            {category}
          </span>

          <span>
            <FiAward />
            {difficulty}
          </span>
        </div>
      </div>

      <div className="resource-card-content">
        <div className="resource-card-date">
          {formatDate(
            getResourceDate(resource)
          )}
        </div>

        <h3>{title}</h3>

        <p>{description}</p>

        {tags.length > 0 && (
          <div className="tag-row">
            {tags
              .slice(0, 3)
              .map((tag) => (
                <span key={tag}>
                  #{tag}
                </span>
              ))}
          </div>
        )}

        <div className="resource-stats-row">
          <span>
            <FiEye />
            {formatNumber(views)}
          </span>

          <span>
            <FiBookmark />
            {formatNumber(saves)}
          </span>

          {rating > 0 && (
            <span>
              <FiStar />
              {rating.toFixed(1)}
            </span>
          )}

          {time > 0 && (
            <span>
              <FiClock />
              {time}m
            </span>
          )}
        </div>

        <div className="card-actions">
          {/* DETAILS */}
          <button
            className="secondary-action"
            onClick={() =>
              onDetails(resource)
            }
          >
            View Details
          </button>

          {/* OPEN */}
          <button
            className="primary-action"
            onClick={() =>
              onOpen(resource)
            }
          >
            Open
            <FiExternalLink />
          </button>

          {/* DELETE - ADMIN ONLY */}
          {isAdmin && (
            <button
              className="delete-action"
              onClick={() =>
                onDelete(resource)
              }
              title="Delete resource"
            >
              <FiTrash2 />
              Delete
            </button>
          )}
        </div>
      </div>
    </motion.article>
  );
}
function ResourceSkeleton({
  index = 0,
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      transition={{
        delay: index * 0.05,
      }}
      className="resource-card skeleton-card"
    >
      <div className="skeleton-cover" />

      <div className="skeleton-content">
        <div className="skeleton-line small" />
        <div className="skeleton-line title" />
        <div className="skeleton-line" />
        <div className="skeleton-line medium" />

        <div className="skeleton-row">
          <div />
          <div />
          <div />
        </div>

        <div className="skeleton-buttons">
          <div />
          <div />
        </div>
      </div>
    </motion.div>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

function ResourceHub() {
  const navigate = useNavigate();

  const token =
    localStorage.getItem("token");

  const userName =
    localStorage.getItem("name") ||
    "Learner";

  const storedRole = String(
    localStorage.getItem("role") ||
      localStorage.getItem("userRole") ||
      ""
  ).toLowerCase();

  const tokenRole =
    getRoleFromToken();

  const userRole =
    storedRole || tokenRole;

  const isAdmin = [
    "admin",
    "administrator",
    "superadmin",
  ].includes(userRole);

  /* =========================================================
     STATE
  ========================================================= */

  const [resources, setResources] =
    useState([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isRefreshing, setIsRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [activeCategory, setActiveCategory] =
    useState("All");

  const [activeDifficulty, setActiveDifficulty] =
    useState("All");

  const [activeType, setActiveType] =
    useState("All");

  const [sortBy, setSortBy] =
    useState("latest");

  const [viewMode, setViewMode] =
    useState("grid");

  const [showFilters, setShowFilters] =
    useState(false);

  const [selectedResource, setSelectedResource] =
    useState(null);

  const [showAddModal, setShowAddModal] =
    useState(false);

  const [isCreating, setIsCreating] =
    useState(false);

  const [createError, setCreateError] =
    useState("");

  const [createSuccess, setCreateSuccess] =
    useState("");

  const [copied, setCopied] =
    useState(false);

  const [page, setPage] =
    useState(1);

  const [savedResources, setSavedResources] =
    useState(() => {
      try {
        return JSON.parse(
          localStorage.getItem(
            "preppulse:saved-resources"
          ) || "[]"
        );
      } catch {
        return [];
      }
    });

  const [form, setForm] =
    useState({
      title: "",
      description: "",
      category: "Programming",
      type: "Course",
      difficulty: "Beginner",
      url: "",
      thumbnail: "",
      tags: "",
      estimatedTime: "",
      authorName: "",
    });

  const PAGE_SIZE = 9;

  /* =========================================================
     FETCH
  ========================================================= */

  const fetchResources = useCallback(
    async (showRefresh = false) => {
      if (!token) {
        navigate("/login", {
          replace: true,
        });

        return;
      }

      try {
        setError("");

        if (showRefresh) {
          setIsRefreshing(true);
        } else {
          setIsLoading(true);
        }

        const response =
          await API.get("/resources", {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          });

        const data =
          response?.data || {};

        const incoming =
          data?.resources ||
          data?.data ||
          data?.results ||
          data;

        setResources(
          Array.isArray(incoming)
            ? incoming
            : []
        );

        setPage(1);
      } catch (err) {
        console.error(
          "Resource Hub Error:",
          err
        );

        if (
          err?.response?.status === 401
        ) {
          localStorage.removeItem(
            "token"
          );

          navigate("/login", {
            replace: true,
          });

          return;
        }

        setError(
          err?.response?.data?.message ||
            "Unable to load learning resources."
        );
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [navigate, token]
  );

  useEffect(() => {
    fetchResources(false);
  }, [fetchResources]);

  /* =========================================================
     LOCAL SAVES
  ========================================================= */

  useEffect(() => {
    localStorage.setItem(
      "preppulse:saved-resources",
      JSON.stringify(savedResources)
    );
  }, [savedResources]);

  const isSaved = (id) => {
    return savedResources.includes(id);
  };

  const toggleSave = async (id) => {
    if (!id) return;

    const currentlySaved =
      savedResources.includes(id);

    setSavedResources((previous) => {
      if (previous.includes(id)) {
        return previous.filter(
          (item) => item !== id
        );
      }

      return [
        ...previous,
        id,
      ];
    });

    /*
      Try syncing with the backend.

      If your resource routes expose:
      POST   /resources/:id/save
      DELETE /resources/:id/save

      the action will persist server-side.

      LocalStorage remains the fallback so
      the UI still works if those routes
      aren't currently registered.
    */

    try {
      if (currentlySaved) {
        await API.delete(
          `/resources/${id}/save`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );
      } else {
        await API.post(
          `/resources/${id}/save`,
          {},
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );
      }
    } catch (err) {
      console.warn(
        "Server save sync unavailable. Using local bookmark state.",
        err
      );
    }
  };

  /* =========================================================
     FILTER OPTIONS
  ========================================================= */

  const categories = useMemo(() => {
    const values = resources
      .map(getResourceCategory)
      .filter(Boolean);

    return [
      "All",
      ...Array.from(
        new Set(values)
      ).sort(),
    ];
  }, [resources]);

  const difficulties = useMemo(() => {
    const values = resources
      .map(getResourceDifficulty)
      .filter(Boolean);

    return [
      "All",
      ...Array.from(
        new Set(values)
      ).sort(),
    ];
  }, [resources]);

  const types = useMemo(() => {
    const values = resources
      .map(getResourceType)
      .filter(Boolean);

    return [
      "All",
      ...Array.from(
        new Set(values)
      ).sort(),
    ];
  }, [resources]);

  /* =========================================================
     FILTERED RESOURCES
  ========================================================= */

  const filteredResources =
    useMemo(() => {
      let result = [
        ...resources,
      ];

      const query =
        search
          .trim()
          .toLowerCase();

      if (query) {
        result = result.filter(
          (resource) => {
            const searchable = [
              getResourceTitle(
                resource
              ),
              getResourceDescription(
                resource
              ),
              getResourceCategory(
                resource
              ),
              getResourceType(
                resource
              ),
              getResourceDifficulty(
                resource
              ),
              getAuthorName(resource),
              ...getResourceTags(
                resource
              ),
            ]
              .join(" ")
              .toLowerCase();

            return searchable.includes(
              query
            );
          }
        );
      }

      if (
        activeCategory !== "All"
      ) {
        result = result.filter(
          (resource) =>
            String(
              getResourceCategory(
                resource
              )
            ).toLowerCase() ===
            activeCategory.toLowerCase()
        );
      }

      if (
        activeDifficulty !== "All"
      ) {
        result = result.filter(
          (resource) =>
            String(
              getResourceDifficulty(
                resource
              )
            ).toLowerCase() ===
            activeDifficulty.toLowerCase()
        );
      }

      if (
        activeType !== "All"
      ) {
        result = result.filter(
          (resource) =>
            String(
              getResourceType(
                resource
              )
            ).toLowerCase() ===
            activeType.toLowerCase()
        );
      }

      if (sortBy === "latest") {
        result.sort(
          (a, b) =>
            new Date(
              getResourceDate(b) || 0
            ) -
            new Date(
              getResourceDate(a) || 0
            )
        );
      }

      if (sortBy === "oldest") {
        result.sort(
          (a, b) =>
            new Date(
              getResourceDate(a) || 0
            ) -
            new Date(
              getResourceDate(b) || 0
            )
        );
      }

      if (sortBy === "popular") {
        result.sort(
          (a, b) =>
            getResourceViews(b) -
            getResourceViews(a)
        );
      }

      if (sortBy === "rating") {
        result.sort(
          (a, b) =>
            getResourceRating(b) -
            getResourceRating(a)
        );
      }

      if (sortBy === "saved") {
        result.sort(
          (a, b) =>
            Number(
              isSaved(
                getResourceId(b)
              )
            ) -
            Number(
              isSaved(
                getResourceId(a)
              )
            )
        );
      }

      if (sortBy === "title") {
        result.sort(
          (a, b) =>
            getResourceTitle(
              a
            ).localeCompare(
              getResourceTitle(
                b
              )
            )
        );
      }

      return result;
    }, [
      resources,
      search,
      activeCategory,
      activeDifficulty,
      activeType,
      sortBy,
      savedResources,
    ]);

  /* =========================================================
     PAGINATION
  ========================================================= */

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        filteredResources.length /
          PAGE_SIZE
      )
    );

  const paginatedResources =
    useMemo(() => {
      const start =
        (page - 1) *
        PAGE_SIZE;

      return filteredResources.slice(
        start,
        start + PAGE_SIZE
      );
    }, [
      filteredResources,
      page,
    ]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  /* =========================================================
     STATS
  ========================================================= */

  const stats = useMemo(() => {
    const saved = resources.filter(
      (resource) =>
        isSaved(
          getResourceId(resource)
        )
    ).length;

    const videos =
      resources.filter((resource) =>
        String(
          getResourceType(resource)
        )
          .toLowerCase()
          .includes("video")
      ).length;

    const pdfs =
      resources.filter((resource) =>
        String(
          getResourceType(resource)
        )
          .toLowerCase()
          .includes("pdf")
      ).length;

    const totalViews =
      resources.reduce(
        (sum, resource) =>
          sum +
          getResourceViews(
            resource
          ),
        0
      );

    return {
      total: resources.length,
      saved,
      videos,
      pdfs,
      totalViews,
    };
  }, [
    resources,
    savedResources,
  ]);

  /* =========================================================
     RESOURCE ACTIONS
  ========================================================= */

  const openResource = async (
    resource
  ) => {
    const url =
      getResourceUrl(resource);

    const id =
      getResourceId(resource);

    if (!url) {
      setSelectedResource(
        resource
      );

      return;
    }

    /*
      Try to increment server view count.
    */
    try {
      if (id) {
        await API.post(
          `/resources/${id}/view`,
          {},
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );
      }
    } catch {
      // Optional backend endpoint.
    }

    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const copyResourceUrl =
    async (resource) => {
      const url =
        getResourceUrl(resource);

      if (!url) return;

      try {
        await navigator.clipboard.writeText(
          url
        );

        setCopied(true);

        setTimeout(() => {
          setCopied(false);
        }, 1800);
      } catch {
        setCopied(false);
      }
    };

  /* =========================================================
     DELETE RESOURCE - ADMIN ONLY
  ========================================================= */

  const handleDeleteResource = async (
    resource
  ) => {
    if (!isAdmin) {
      setError(
        "Only administrators can delete resources."
      );

      return;
    }

    if (!resource) {
      return;
    }

    const id =
      getResourceId(resource);

    const title =
      getResourceTitle(resource);

    if (!id) {
      setError(
        "Unable to delete this resource because its ID is missing."
      );

      return;
    }

    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${title}"?\n\nThis action cannot be undone.`
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await API.delete(
        `/resources/${id}`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      setResources((previous) =>
        previous.filter(
          (item) =>
            getResourceId(item) !== id
        )
      );

      setSavedResources((previous) =>
        previous.filter(
          (item) => item !== id
        )
      );

      setSelectedResource(null);
    } catch (err) {
      console.error(
        "Delete Resource Error:",
        err
      );

      if (
        err?.response?.status === 401
      ) {
        localStorage.removeItem(
          "token"
        );

        navigate("/login", {
          replace: true,
        });

        return;
      }

      if (
        err?.response?.status === 403
      ) {
        setError(
          "Only administrators can delete resources."
        );

        return;
      }

      setError(
        err?.response?.data?.message ||
          "Failed to delete resource."
      );
    }
  };


  /* =========================================================
     FORM
  ========================================================= */

  const handleFormChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      category: "Programming",
      type: "Course",
      difficulty: "Beginner",
      url: "",
      thumbnail: "",
      tags: "",
      estimatedTime: "",
      authorName: "",
    });

    setCreateError("");
    setCreateSuccess("");
  };

  const handleCreateResource =
    async (event) => {
      event.preventDefault();

      if (!isAdmin) {
        setCreateError(
          "Only administrators can publish resources."
        );

        return;
      }

      setCreateError("");
      setCreateSuccess("");

      if (!form.title.trim()) {
        setCreateError(
          "Resource title is required."
        );
        return;
      }

      if (
        !form.description.trim()
      ) {
        setCreateError(
          "Resource description is required."
        );
        return;
      }

      if (!form.url.trim()) {
        setCreateError(
          "Resource URL is required."
        );
        return;
      }

      try {
        new URL(
          form.url.trim()
        );
      } catch {
        setCreateError(
          "Please enter a valid HTTP/HTTPS URL."
        );
        return;
      }

      try {
        setIsCreating(true);

        const response =
          await API.post(
            "/resources/admin",
            {
              title:
                form.title.trim(),

              description:
                form.description.trim(),

              category:
                form.category,

              type:
                form.type,

              difficulty:
                form.difficulty,

              url:
                form.url.trim(),

              thumbnail:
                form.thumbnail.trim(),

              tags:
                form.tags
                  .split(",")
                  .map((tag) =>
                    tag.trim()
                  )
                  .filter(Boolean),

              estimatedTime:
                Number(
                  form.estimatedTime
                ) || 0,

              authorName:
                form.authorName.trim() ||
                "PrepPulse Admin",
            },
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        if (
          response?.data?.success
        ) {
          setCreateSuccess(
            "Resource published successfully."
          );

          resetForm();

          await fetchResources(
            true
          );

          setTimeout(() => {
            setShowAddModal(
              false
            );

            setCreateSuccess("");
          }, 1200);
        } else {
          setCreateError(
            response?.data?.message ||
              "Failed to publish resource."
          );
        }
      } catch (err) {
        console.error(
          "Create Resource Error:",
          err
        );

        setCreateError(
          err?.response?.data
            ?.message ||
            "Failed to publish resource."
        );
      } finally {
        setIsCreating(false);
      }
    };

  /* =========================================================
     CLEAR FILTERS
  ========================================================= */

  const clearFilters = () => {
    setSearch("");
    setActiveCategory("All");
    setActiveDifficulty("All");
    setActiveType("All");
    setSortBy("latest");
    setPage(1);
  };

  const hasActiveFilters =
    search.trim() ||
    activeCategory !== "All" ||
    activeDifficulty !== "All" ||
    activeType !== "All" ||
    sortBy !== "latest";

  /* =========================================================
     LOADING SCREEN
  ========================================================= */

  if (isLoading) {
    return (
      <div className="resource-page">
        <style>{styles}</style>

        <div className="loading-screen">
          <div className="loading-orb orb-one" />
          <div className="loading-orb orb-two" />

          <motion.div
            initial={{
              opacity: 0,
              scale: 0.8,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            className="loading-content"
          >
            <img
              src={logoImage}
              alt="PrepPulse"
            />

            <div className="loading-spinner">
              <span />
              <span />
              <span />
            </div>

            <h2>
              Loading Resource Hub
            </h2>

            <p>
              Preparing your learning
              workspace...
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  /* =========================================================
     MAIN UI
  ========================================================= */

  return (
    <div className="resource-page">
      <style>{styles}</style>

      {/* BACKGROUND */}
      <div className="ambient-background">
        <div className="ambient-orb orb-one" />
        <div className="ambient-orb orb-two" />
        <div className="ambient-orb orb-three" />
        <div className="grid-overlay" />
      </div>

      <main className="resource-container">

        {/* =====================================================
            TOP BAR
        ===================================================== */}

        <motion.header
          initial={{
            opacity: 0,
            y: -15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="topbar"
        >
          <button
            className="back-button"
            onClick={() =>
              navigate("/dashboard")
            }
          >
            <FiArrowLeft />
            <span>Dashboard</span>
          </button>

          <div className="topbar-right">

            {isAdmin && (
              <div className="admin-status">
                <FiShield />
                ADMIN MODE
              </div>
            )}

            <div className="live-status">
              <span />
              LIVE
            </div>

            <button
              className="refresh-button"
              onClick={() =>
                fetchResources(true)
              }
              disabled={
                isRefreshing
              }
            >
              <FiRefreshCw
                className={
                  isRefreshing
                    ? "spin"
                    : ""
                }
              />
            </button>
          </div>
        </motion.header>

        {/* =====================================================
            HERO
        ===================================================== */}

        <motion.section
          initial={{
            opacity: 0,
            y: 25,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.5,
          }}
          className="hero-section"
        >
          <div className="hero-glow hero-glow-one" />
          <div className="hero-glow hero-glow-two" />

          <div className="hero-content">
            <div className="eyebrow">
              <span className="eyebrow-icon">
                <FiZap />
              </span>

              PREPPULSE LEARNING CENTER
            </div>

            <h1>
              Learn.
              <span>
                Practice.
              </span>
              Grow.
            </h1>

            <p>
              Discover curated learning
              resources for coding,
              academics, interviews,
              certifications and
              placement preparation.
            </p>

            <div className="hero-user">
              <div className="user-avatar">
                <FiUser />
              </div>

              <div>
                <span>
                  Welcome back
                </span>

                <strong>
                  {userName}
                </strong>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />

            <motion.div
              animate={{
                y: [
                  -5,
                  5,
                  -5,
                ],
                rotate: [
                  -2,
                  2,
                  -2,
                ],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="hero-icon-card"
            >
              <FiBookOpen />

              <div>
                <strong>
                  Resource Hub
                </strong>

                <span>
                  {stats.total} resources
                </span>
              </div>
            </motion.div>

            <div className="floating-card floating-card-one">
              <FiVideo />
              <span>
                Video Learning
              </span>
            </div>

            <div className="floating-card floating-card-two">
              <FiCode />
              <span>
                Coding Practice
              </span>
            </div>
          </div>

          {isAdmin && (
            <button
              className="hero-add-button"
              onClick={() => {
                resetForm();
                setShowAddModal(true);
              }}
            >
              <FiPlus />
              Add Resource
            </button>
          )}
        </motion.section>

        {/* =====================================================
            STAT CARDS
        ===================================================== */}

        <section className="stats-grid">

          {[
            {
              label: "Resources",
              value: stats.total,
              icon: <FiLayers />,
              color: "#a78bfa",
            },
            {
              label: "Saved",
              value: stats.saved,
              icon: <FiBookmark />,
              color: "#f472b6",
            },
            {
              label: "Videos",
              value: stats.videos,
              icon: <FiVideo />,
              color: "#fb7185",
            },
            {
              label: "PDFs",
              value: stats.pdfs,
              icon: <FiFileText />,
              color: "#fbbf24",
            },
          ].map(
            (item, index) => (
              <motion.div
                key={item.label}
                initial={{
                  opacity: 0,
                  y: 15,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay:
                    index * 0.06,
                }}
                className="stat-card"
              >
                <div
                  className="stat-icon"
                  style={{
                    color:
                      item.color,
                    background:
                      `${item.color}10`,
                    borderColor:
                      `${item.color}25`,
                  }}
                >
                  {item.icon}
                </div>

                <div>
                  <strong>
                    {formatNumber(
                      item.value
                    )}
                  </strong>

                  <span>
                    {item.label}
                  </span>
                </div>
              </motion.div>
            )
          )}
        </section>

        {/* =====================================================
            ERROR
        ===================================================== */}

        {error && (
          <motion.div
            initial={{
              opacity: 0,
              y: -10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="error-banner"
          >
            <FiAlertCircle />

            <div>
              <strong>
                Unable to load resources
              </strong>

              <span>
                {error}
              </span>
            </div>

            <button
              onClick={() =>
                fetchResources(true)
              }
            >
              Retry
            </button>
          </motion.div>
        )}

        {/* =====================================================
            SEARCH BAR
        ===================================================== */}

        <section className="control-panel">

          <div className="search-wrapper">
            <FiSearch />

            <input
              value={search}
              onChange={(event) => {
                setSearch(
                  event.target.value
                );
                setPage(1);
              }}
              placeholder="Search resources, Java, Python, SQL, AI, Spring Boot..."
            />

            {search && (
              <button
                className="clear-search"
                onClick={() =>
                  setSearch("")
                }
              >
                <FiX />
              </button>
            )}
          </div>

          <button
            className={`filter-button ${
              showFilters
                ? "active"
                : ""
            }`}
            onClick={() =>
              setShowFilters(
                (previous) =>
                  !previous
              )
            }
          >
            <FiFilter />
            Filters

            {hasActiveFilters && (
              <span className="filter-dot" />
            )}
          </button>

          <div className="view-toggle">
            <button
              className={
                viewMode === "grid"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setViewMode("grid")
              }
            >
              <FiGrid />
            </button>

            <button
              className={
                viewMode === "list"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setViewMode("list")
              }
            >
              <FiList />
            </button>
          </div>
        </section>

        {/* =====================================================
            FILTER PANEL
        ===================================================== */}

        <AnimatePresence>
          {showFilters && (
            <motion.section
              initial={{
                opacity: 0,
                height: 0,
              }}
              animate={{
                opacity: 1,
                height: "auto",
              }}
              exit={{
                opacity: 0,
                height: 0,
              }}
              className="filter-panel"
            >
              <div className="filter-group">
                <label>
                  Category
                </label>

                <select
                  value={
                    activeCategory
                  }
                  onChange={(event) => {
                    setActiveCategory(
                      event.target.value
                    );
                    setPage(1);
                  }}
                >
                  {categories.map(
                    (category) => (
                      <option
                        key={category}
                        value={
                          category
                        }
                      >
                        {category}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="filter-group">
                <label>
                  Difficulty
                </label>

                <select
                  value={
                    activeDifficulty
                  }
                  onChange={(event) => {
                    setActiveDifficulty(
                      event.target.value
                    );
                    setPage(1);
                  }}
                >
                  {difficulties.map(
                    (difficulty) => (
                      <option
                        key={
                          difficulty
                        }
                        value={
                          difficulty
                        }
                      >
                        {difficulty}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="filter-group">
                <label>
                  Resource Type
                </label>

                <select
                  value={activeType}
                  onChange={(event) => {
                    setActiveType(
                      event.target.value
                    );
                    setPage(1);
                  }}
                >
                  {types.map(
                    (type) => (
                      <option
                        key={type}
                        value={type}
                      >
                        {type}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="filter-group">
                <label>
                  Sort By
                </label>

                <select
                  value={sortBy}
                  onChange={(event) => {
                    setSortBy(
                      event.target.value
                    );
                    setPage(1);
                  }}
                >
                  <option value="latest">
                    Latest
                  </option>

                  <option value="popular">
                    Most Viewed
                  </option>

                  <option value="rating">
                    Highest Rated
                  </option>

                  <option value="saved">
                    Saved First
                  </option>

                  <option value="title">
                    Title A-Z
                  </option>

                  <option value="oldest">
                    Oldest
                  </option>
                </select>
              </div>

              <button
                className="clear-filter-button"
                onClick={
                  clearFilters
                }
              >
                Reset
              </button>
            </motion.section>
          )}
        </AnimatePresence>

        {/* =====================================================
            CATEGORY CHIPS
        ===================================================== */}

        <div className="category-scroll">
          {categories.map(
            (category) => {
              const active =
                activeCategory ===
                category;

              return (
                <button
                  key={category}
                  className={
                    active
                      ? "category-chip active"
                      : "category-chip"
                  }
                  onClick={() => {
                    setActiveCategory(
                      category
                    );
                    setPage(1);
                  }}
                >
                  {getCategoryIcon(
                    category
                  )}

                  {category}
                </button>
              );
            }
          )}
        </div>

        {/* =====================================================
            RESULTS HEADER
        ===================================================== */}

        <section className="results-header">
          <div>
            <div className="section-eyebrow">
              <FiTrendingUp />
              RESOURCE LIBRARY
            </div>

            <h2>
              Explore Resources
            </h2>

            <p>
              Showing{" "}
              <strong>
                {
                  filteredResources.length
                }
              </strong>{" "}
              of{" "}
              <strong>
                {resources.length}
              </strong>{" "}
              resources
            </p>
          </div>

          <div className="results-live">
            <span />
            Live Library
          </div>
        </section>

        {/* =====================================================
            RESOURCE GRID
        ===================================================== */}

        {paginatedResources.length >
        0 ? (
          <motion.div
            layout
            className={
              viewMode === "grid"
                ? "resource-grid"
                : "resource-list"
            }
          >
            <AnimatePresence
              mode="popLayout"
            >
              {paginatedResources.map(
                (resource) => (
                  <ResourceCard
                    key={getResourceId(
                        resource
                    )}
                    resource={resource}
                    saved={isSaved(
                        getResourceId(
                        resource
                        )
                    )}
                    viewMode={
                        viewMode
                    }
                    onSave={
                        toggleSave
                    }
                    onOpen={
                        openResource
                    }
                    onDetails={
                        setSelectedResource
                    }
                    onDelete={
                        handleDeleteResource
                    }
                    isAdmin={
                        isAdmin
                    }
                    />
                )
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.97,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            className="empty-state"
          >
            <div className="empty-icon">
              <FiBookOpen />
            </div>

            <h3>
              No resources found
            </h3>

            <p>
              Try another search
              term or remove some
              filters.
            </p>

            {hasActiveFilters && (
              <button
                className="primary-action"
                onClick={
                  clearFilters
                }
              >
                Clear Filters
              </button>
            )}

            {isAdmin &&
              !hasActiveFilters &&
              resources.length === 0 && (
                <button
                  className="primary-action"
                  onClick={() => {
                    resetForm();
                    setShowAddModal(
                      true
                    );
                  }}
                >
                  <FiPlus />
                  Add First Resource
                </button>
              )}
          </motion.div>
        )}

        {/* =====================================================
            PAGINATION
        ===================================================== */}

        {filteredResources.length >
          PAGE_SIZE && (
          <div className="pagination">
            <button
              disabled={page === 1}
              onClick={() =>
                setPage(
                  (previous) =>
                    Math.max(
                      1,
                      previous - 1
                    )
                )
              }
            >
              <FiChevronLeft />
            </button>

            {Array.from(
              {
                length: totalPages,
              },
              (_, index) =>
                index + 1
            ).map(
              (pageNumber) => (
                <button
                  key={pageNumber}
                  className={
                    page ===
                    pageNumber
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setPage(
                      pageNumber
                    )
                  }
                >
                  {pageNumber}
                </button>
              )
            )}

            <button
              disabled={
                page === totalPages
              }
              onClick={() =>
                setPage(
                  (previous) =>
                    Math.min(
                      totalPages,
                      previous + 1
                    )
                )
              }
            >
              <FiChevronRight />
            </button>
          </div>
        )}

        {/* =====================================================
            FOOTER
        ===================================================== */}

        <footer className="resource-footer">
          <div>
            <FiAward />
            <span>
              Keep learning. Keep
              building. Keep growing.
            </span>
          </div>

          <span>
            PrepPulse Resource Hub
          </span>
        </footer>
      </main>

      {/* =======================================================
          RESOURCE DETAIL MODAL
      ======================================================= */}

      <AnimatePresence>
        {selectedResource && (
          <div
            className="modal-backdrop"
            onClick={() =>
              setSelectedResource(
                null
              )
            }
          >
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.94,
                y: 20,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.96,
              }}
              className="detail-modal"
              onClick={(event) =>
                event.stopPropagation()
              }
            >
              <div className="detail-cover">
                {getResourceImage(
                  selectedResource
                ) ? (
                  <img
                    src={getResourceImage(
                      selectedResource
                    )}
                    alt={getResourceTitle(
                      selectedResource
                    )}
                  />
                ) : (
                  <div className="detail-cover-placeholder">
                    {getTypeIcon(
                      getResourceType(
                        selectedResource
                      )
                    )}
                  </div>
                )}

                <div className="detail-cover-overlay" />

                <button
                  className="modal-close"
                  onClick={() =>
                    setSelectedResource(
                      null
                    )
                  }
                >
                  <FiX />
                </button>

                <div className="detail-cover-title">
                  <span>
                    {getResourceType(
                      selectedResource
                    )}
                  </span>

                  <h2>
                    {getResourceTitle(
                      selectedResource
                    )}
                  </h2>
                </div>
              </div>

              <div className="detail-body">

                <div className="detail-badges">
                  <span>
                    {getCategoryIcon(
                      getResourceCategory(
                        selectedResource
                      )
                    )}

                    {
                      getResourceCategory(
                        selectedResource
                      )
                    }
                  </span>

                  <span>
                    <FiAward />
                    {
                      getResourceDifficulty(
                        selectedResource
                      )
                    }
                  </span>

                  <span>
                    <FiClock />
                    {getResourceEstimatedTime(
                      selectedResource
                    ) || 0}
                    min
                  </span>
                </div>

                <p className="detail-description">
                  {getResourceDescription(
                    selectedResource
                  )}
                </p>

                <div className="detail-metrics">
                  <div>
                    <FiEye />
                    <strong>
                      {formatNumber(
                        getResourceViews(
                          selectedResource
                        )
                      )}
                    </strong>
                    <span>
                      Views
                    </span>
                  </div>

                  <div>
                    <FiBookmark />
                    <strong>
                      {formatNumber(
                        getResourceSaves(
                          selectedResource
                        )
                      )}
                    </strong>
                    <span>
                      Saves
                    </span>
                  </div>

                  <div>
                    <FiStar />
                    <strong>
                      {getResourceRating(
                        selectedResource
                      ) > 0
                        ? getResourceRating(
                            selectedResource
                          ).toFixed(1)
                        : "—"}
                    </strong>
                    <span>
                      Rating
                    </span>
                  </div>
                </div>

                {getResourceTags(
                  selectedResource
                ).length >
                  0 && (
                  <div className="detail-tags">
                    {getResourceTags(
                      selectedResource
                    ).map(
                      (tag) => (
                        <span
                          key={tag}
                        >
                          #{tag}
                        </span>
                      )
                    )}
                  </div>
                )}

                <div className="detail-author">
                  <div className="author-avatar">
                    <FiUser />
                  </div>

                  <div>
                    <span>
                      Published by
                    </span>

                    <strong>
                      {getAuthorName(
                        selectedResource
                      )}
                    </strong>
                  </div>

                  <span className="author-date">
                    {formatDate(
                      getResourceDate(
                        selectedResource
                      )
                    )}
                  </span>
                </div>

                <div className="detail-actions">

                  <button
                    className="primary-action large"
                    onClick={() =>
                      openResource(
                        selectedResource
                      )
                    }
                  >
                    <FiExternalLink />
                    Open Resource
                  </button>

                  <button
                    className={`secondary-action large ${
                      isSaved(
                        getResourceId(
                          selectedResource
                        )
                      )
                        ? "saved-action"
                        : ""
                    }`}
                    onClick={() =>
                      toggleSave(
                        getResourceId(
                          selectedResource
                        )
                      )
                    }
                  >
                    <FiBookmark />
                    {isSaved(
                      getResourceId(
                        selectedResource
                      )
                    )
                      ? "Saved"
                      : "Save"}
                  </button>

                  <button
                    className="secondary-action icon-only large"
                    onClick={() =>
                      copyResourceUrl(
                        selectedResource
                      )
                    }
                  >
                    {copied ? (
                      <FiCheck />
                    ) : (
                      <FiCopy />
                    )}

                    <span>
                      {copied
                        ? "Copied"
                        : "Copy"}
                    </span>
                  </button>

                  {isAdmin && (
                    <button
                      className="delete-action large"
                      onClick={() =>
                        handleDeleteResource(
                          selectedResource
                        )
                      }
                      title="Delete resource"
                    >
                      <FiTrash2 />
                      Delete Resource
                    </button>
                  )}

                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =======================================================
          ADMIN ADD RESOURCE MODAL
      ======================================================= */}

      <AnimatePresence>
        {showAddModal &&
          isAdmin && (
            <div
              className="modal-backdrop admin-backdrop"
              onClick={() => {
                if (!isCreating) {
                  setShowAddModal(
                    false
                  );
                }
              }}
            >
              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.94,
                  y: 25,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.96,
                }}
                className="admin-modal"
                onClick={(event) =>
                  event.stopPropagation()
                }
              >
                <div className="admin-modal-header">
                  <div>
                    <div className="admin-label">
                      <FiShield />
                      ADMIN PUBLISHING
                    </div>

                    <h2>
                      Add New Resource
                    </h2>

                    <p>
                      Publish a high-quality
                      learning resource directly
                      to the Resource Hub.
                    </p>
                  </div>

                  <button
                    className="modal-close static"
                    disabled={
                      isCreating
                    }
                    onClick={() =>
                      setShowAddModal(
                        false
                      )
                    }
                  >
                    <FiX />
                  </button>
                </div>

                {createSuccess && (
                  <div className="success-message">
                    <FiCheckCircle />
                    {createSuccess}
                  </div>
                )}

                {createError && (
                  <div className="form-error">
                    <FiAlertCircle />
                    {createError}
                  </div>
                )}

                <form
                  onSubmit={
                    handleCreateResource
                  }
                  className="resource-form"
                >
                  <div className="form-section-title">
                    <span>
                      01
                    </span>
                    Basic Information
                  </div>

                  <div className="form-group">
                    <label>
                      Resource Title *
                    </label>

                    <input
                      name="title"
                      value={
                        form.title
                      }
                      onChange={
                        handleFormChange
                      }
                      placeholder="Java Spring Boot Complete Guide"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      Description *
                    </label>

                    <textarea
                      name="description"
                      value={
                        form.description
                      }
                      onChange={
                        handleFormChange
                      }
                      placeholder="Explain what students will learn..."
                      required
                    />
                  </div>

                  <div className="form-grid">
                    <div className="form-group">
                      <label>
                        Category
                      </label>

                      <select
                        name="category"
                        value={
                          form.category
                        }
                        onChange={
                          handleFormChange
                        }
                      >
                        <option>
                          Programming
                        </option>

                        <option>
                          Java
                        </option>

                        <option>
                          Python
                        </option>

                        <option>
                          Web Development
                        </option>

                        <option>
                          Database
                        </option>

                        <option>
                          Data Structures
                        </option>

                        <option>
                          AI & ML
                        </option>

                        <option>
                          Cloud
                        </option>

                        <option>
                          DevOps
                        </option>

                        <option>
                          Aptitude
                        </option>

                        <option>
                          Interview
                        </option>

                        <option>
                          Placement
                        </option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>
                        Resource Type
                      </label>

                      <select
                        name="type"
                        value={
                          form.type
                        }
                        onChange={
                          handleFormChange
                        }
                      >
                        <option>
                          Course
                        </option>

                        <option>
                          Video
                        </option>

                        <option>
                          YouTube
                        </option>

                        <option>
                          PDF
                        </option>

                        <option>
                          Article
                        </option>

                        <option>
                          Documentation
                        </option>

                        <option>
                          GitHub
                        </option>

                        <option>
                          Practice
                        </option>

                        <option>
                          Website
                        </option>
                      </select>
                    </div>
                  </div>

                  <div className="form-grid">
                    <div className="form-group">
                      <label>
                        Difficulty
                      </label>

                      <select
                        name="difficulty"
                        value={
                          form.difficulty
                        }
                        onChange={
                          handleFormChange
                        }
                      >
                        <option>
                          Beginner
                        </option>

                        <option>
                          Intermediate
                        </option>

                        <option>
                          Advanced
                        </option>

                        <option>
                          All Levels
                        </option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>
                        Estimated Time
                      </label>

                      <input
                        type="number"
                        min="0"
                        name="estimatedTime"
                        value={
                          form.estimatedTime
                        }
                        onChange={
                          handleFormChange
                        }
                        placeholder="Minutes"
                      />
                    </div>
                  </div>

                  <div className="form-section-title second">
                    <span>
                      02
                    </span>
                    Resource Details
                  </div>

                  <div className="form-group">
                    <label>
                      Resource URL *
                    </label>

                    <div className="input-with-icon">
                      <FiLink />

                      <input
                        type="url"
                        name="url"
                        value={
                          form.url
                        }
                        onChange={
                          handleFormChange
                        }
                        placeholder="https://..."
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>
                      Thumbnail URL
                    </label>

                    <div className="input-with-icon">
                      <FiGlobe />

                      <input
                        type="url"
                        name="thumbnail"
                        value={
                          form.thumbnail
                        }
                        onChange={
                          handleFormChange
                        }
                        placeholder="https://image-url..."
                      />
                    </div>
                  </div>

                  {form.thumbnail && (
                    <div className="thumbnail-preview">
                      <img
                        src={
                          form.thumbnail
                        }
                        alt="Preview"
                        onError={(event) => {
                          event.currentTarget.style.display =
                            "none";
                        }}
                      />

                      <span>
                        Thumbnail Preview
                      </span>
                    </div>
                  )}

                  <div className="form-group">
                    <label>
                      Tags
                    </label>

                    <input
                      name="tags"
                      value={
                        form.tags
                      }
                      onChange={
                        handleFormChange
                      }
                      placeholder="java, spring boot, backend, api"
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      Author / Source
                    </label>

                    <input
                      name="authorName"
                      value={
                        form.authorName
                      }
                      onChange={
                        handleFormChange
                      }
                      placeholder="Spring Team"
                    />
                  </div>

                  <div className="publish-info">
                    <FiCheckCircle />

                    <span>
                      Admin resources are
                      published directly to
                      students.
                    </span>
                  </div>

                  <div className="form-actions">
                    <button
                      type="button"
                      className="secondary-action large"
                      disabled={
                        isCreating
                      }
                      onClick={() =>
                        setShowAddModal(
                          false
                        )
                      }
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="primary-action large publish-button"
                      disabled={
                        isCreating
                      }
                    >
                      {isCreating ? (
                        <>
                          <FiRefreshCw className="spin" />
                          Publishing...
                        </>
                      ) : (
                        <>
                          <FiUploadCloud />
                          Publish Resource
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
      </AnimatePresence>
    </div>
  );
}

/* =========================================================
   COMPLETE STYLES
========================================================= */

const styles = `
* {
  box-sizing: border-box;
}

html,
body,
#root {
  min-height: 100%;
}

body {
  margin: 0;
  background: #030712;
  color: #f8fafc;
  font-family:
    Inter,
    ui-sans-serif,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
}

button,
input,
textarea,
select {
  font: inherit;
}

button {
  cursor: pointer;
}

button:disabled {
  cursor: not-allowed;
  opacity: .55;
}

/* =========================================================
   PAGE
========================================================= */

.resource-page {
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
  background:
    radial-gradient(
      circle at 15% 0%,
      rgba(124, 58, 237, .18),
      transparent 28%
    ),
    radial-gradient(
      circle at 90% 8%,
      rgba(6, 182, 212, .12),
      transparent 25%
    ),
    radial-gradient(
      circle at 70% 90%,
      rgba(236, 72, 153, .10),
      transparent 28%
    ),
    #030712;
}

.ambient-background {
  position: fixed;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 0;
}

.ambient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(90px);
  opacity: .16;
  animation: floatOrb 12s ease-in-out infinite;
}

.orb-one {
  width: 400px;
  height: 400px;
  left: -160px;
  top: 20%;
  background: #7c3aed;
}

.orb-two {
  width: 350px;
  height: 350px;
  right: -120px;
  top: 35%;
  background: #0891b2;
  animation-delay: -4s;
}

.orb-three {
  width: 300px;
  height: 300px;
  left: 45%;
  bottom: -160px;
  background: #db2777;
  animation-delay: -8s;
}

.grid-overlay {
  position: absolute;
  inset: 0;
  opacity: .035;
  background-image:
    linear-gradient(
      rgba(255,255,255,.5) 1px,
      transparent 1px
    ),
    linear-gradient(
      90deg,
      rgba(255,255,255,.5) 1px,
      transparent 1px
    );
  background-size: 60px 60px;
}

.resource-container {
  position: relative;
  z-index: 2;
  width: min(1480px, 100%);
  margin: 0 auto;
  padding: 24px clamp(16px, 4vw, 42px) 60px;
}

/* =========================================================
   TOP BAR
========================================================= */

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  margin-bottom: 22px;
}

.back-button,
.refresh-button,
.filter-button,
.view-toggle,
.secondary-action,
.icon-action {
  border: 1px solid rgba(255,255,255,.08);
  background: rgba(255,255,255,.035);
  color: #cbd5e1;
  transition:
    .2s ease;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 12px;
}

.back-button:hover,
.refresh-button:hover,
.filter-button:hover,
.secondary-action:hover,
.icon-action:hover {
  color: white;
  background: rgba(124,58,237,.13);
  border-color: rgba(167,139,250,.28);
  transform: translateY(-1px);
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.admin-status,
.live-status {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  height: 38px;
  padding: 0 12px;
  border-radius: 12px;
  font-size: .65rem;
  font-weight: 850;
  letter-spacing: .5px;
}

.admin-status {
  color: #f9a8d4;
  background: rgba(236,72,153,.07);
  border: 1px solid rgba(236,72,153,.18);
}

.live-status {
  color: #6ee7b7;
  background: rgba(16,185,129,.06);
  border: 1px solid rgba(16,185,129,.15);
}

.live-status span {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #34d399;
  box-shadow: 0 0 14px rgba(52,211,153,.8);
  animation: pulseDot 1.8s infinite;
}

.refresh-button {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  display: grid;
  place-items: center;
}

.spin {
  animation: spin 1s linear infinite;
}

/* =========================================================
   HERO
========================================================= */

.hero-section {
  position: relative;
  min-height: 390px;
  padding: clamp(28px, 5vw, 55px);
  border-radius: 30px;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,.08);
  background:
    linear-gradient(
      135deg,
      rgba(76,29,149,.34),
      rgba(8,15,31,.92) 50%,
      rgba(14,116,144,.13)
    );
  box-shadow:
    0 35px 100px rgba(0,0,0,.28),
    inset 0 1px 0 rgba(255,255,255,.05);
  margin-bottom: 18px;
}

.hero-glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(30px);
  pointer-events: none;
}

.hero-glow-one {
  width: 360px;
  height: 360px;
  right: -120px;
  top: -170px;
  background: rgba(168,85,247,.18);
}

.hero-glow-two {
  width: 300px;
  height: 300px;
  left: 35%;
  bottom: -230px;
  background: rgba(34,211,238,.08);
}

.hero-content {
  position: relative;
  z-index: 3;
  max-width: 760px;
}

.eyebrow,
.section-eyebrow {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #c084fc;
  font-size: .64rem;
  font-weight: 850;
  letter-spacing: 1px;
}

.eyebrow {
  margin-bottom: 17px;
}

.eyebrow-icon {
  width: 27px;
  height: 27px;
  display: grid;
  place-items: center;
  border-radius: 9px;
  background: rgba(168,85,247,.12);
  border: 1px solid rgba(168,85,247,.22);
}

.hero-section h1 {
  margin: 0;
  max-width: 700px;
  font-size: clamp(2.7rem, 7vw, 5.7rem);
  line-height: .92;
  letter-spacing: -4px;
  font-weight: 950;
}

.hero-section h1 span {
  display: block;
  background:
    linear-gradient(
      90deg,
      #a78bfa,
      #22d3ee,
      #f472b6
    );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-content > p {
  max-width: 670px;
  margin: 24px 0 0;
  color: #94a3b8;
  font-size: .9rem;
  line-height: 1.8;
}

.hero-user {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 25px;
}

.user-avatar {
  width: 37px;
  height: 37px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  color: #c084fc;
  background: rgba(168,85,247,.10);
  border: 1px solid rgba(168,85,247,.18);
}

.hero-user div:last-child {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.hero-user span {
  color: #64748b;
  font-size: .62rem;
}

.hero-user strong {
  color: #e2e8f0;
  font-size: .74rem;
}

.hero-visual {
  position: absolute;
  right: 7%;
  top: 50%;
  width: 330px;
  height: 330px;
  transform: translateY(-50%);
  display: grid;
  place-items: center;
}

.orbit {
  position: absolute;
  border: 1px solid rgba(167,139,250,.12);
  border-radius: 50%;
}

.orbit-one {
  width: 290px;
  height: 290px;
}

.orbit-two {
  width: 220px;
  height: 220px;
}

.hero-icon-card {
  width: 180px;
  min-height: 110px;
  padding: 20px;
  border-radius: 22px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  text-align: center;
  background:
    linear-gradient(
      145deg,
      rgba(30,41,59,.8),
      rgba(15,23,42,.55)
    );
  border: 1px solid rgba(255,255,255,.1);
  backdrop-filter: blur(20px);
  box-shadow:
    0 30px 80px rgba(0,0,0,.35),
    0 0 60px rgba(124,58,237,.12);
}

.hero-icon-card > svg {
  color: #a78bfa;
  font-size: 32px;
}

.hero-icon-card div {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.hero-icon-card strong {
  font-size: .78rem;
}

.hero-icon-card span {
  color: #64748b;
  font-size: .62rem;
}

.floating-card {
  position: absolute;
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 9px 12px;
  border-radius: 12px;
  background: rgba(15,23,42,.75);
  border: 1px solid rgba(255,255,255,.08);
  backdrop-filter: blur(14px);
  font-size: .62rem;
  color: #cbd5e1;
  box-shadow: 0 20px 50px rgba(0,0,0,.25);
}

.floating-card svg {
  color: #22d3ee;
}

.floating-card-one {
  top: 28px;
  right: -8px;
  animation: floatCard 5s ease-in-out infinite;
}

.floating-card-two {
  left: 5px;
  bottom: 40px;
  animation: floatCard 5s ease-in-out infinite -2s;
}

.hero-add-button {
  position: absolute;
  right: 32px;
  bottom: 30px;
  z-index: 5;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 17px;
  border: 0;
  border-radius: 13px;
  color: white;
  font-size: .7rem;
  font-weight: 850;
  background:
    linear-gradient(
      135deg,
      #7c3aed,
      #2563eb,
      #db2777
    );
  box-shadow:
    0 15px 40px rgba(124,58,237,.28);
  transition: .2s ease;
}

.hero-add-button:hover {
  transform: translateY(-3px);
  box-shadow:
    0 22px 50px rgba(124,58,237,.38);
}

/* =========================================================
   STATS
========================================================= */

.stats-grid {
  display: grid;
  grid-template-columns:
    repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 18px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 13px;
  padding: 17px;
  min-height: 78px;
  border-radius: 17px;
  background:
    linear-gradient(
      145deg,
      rgba(15,23,42,.72),
      rgba(8,13,26,.58)
    );
  border: 1px solid rgba(255,255,255,.065);
  backdrop-filter: blur(18px);
  box-shadow:
    0 20px 50px rgba(0,0,0,.18);
}

.stat-icon {
  width: 43px;
  height: 43px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  border-radius: 13px;
  border: 1px solid;
  font-size: 19px;
}

.stat-card > div:last-child {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-card strong {
  font-size: 1.25rem;
  font-weight: 900;
}

.stat-card span {
  color: #64748b;
  font-size: .64rem;
}

/* =========================================================
   ERROR
========================================================= */

.error-banner {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 13px 15px;
  margin-bottom: 18px;
  border-radius: 15px;
  background: rgba(239,68,68,.07);
  border: 1px solid rgba(239,68,68,.16);
  color: #fca5a5;
}

.error-banner > svg {
  flex-shrink: 0;
}

.error-banner div {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.error-banner strong {
  font-size: .7rem;
}

.error-banner span {
  color: #94a3b8;
  font-size: .63rem;
}

.error-banner button {
  margin-left: auto;
  border: 0;
  background: transparent;
  color: #c084fc;
  font-weight: 800;
}

/* =========================================================
   CONTROLS
========================================================= */

.control-panel {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 11px;
  border-radius: 18px;
  background:
    rgba(8,13,26,.75);
  border: 1px solid rgba(255,255,255,.07);
  backdrop-filter: blur(20px);
  margin-bottom: 10px;
}

.search-wrapper {
  position: relative;
  flex: 1;
}

.search-wrapper > svg {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #64748b;
}

.search-wrapper input {
  width: 100%;
  height: 44px;
  padding: 0 42px;
  border-radius: 12px;
  outline: none;
  color: white;
  background: rgba(255,255,255,.025);
  border: 1px solid rgba(255,255,255,.07);
  font-size: .72rem;
  transition: .2s ease;
}

.search-wrapper input::placeholder {
  color: #475569;
}

.search-wrapper input:focus {
  border-color: rgba(167,139,250,.4);
  box-shadow:
    0 0 25px rgba(124,58,237,.08);
}

.clear-search {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  border: 0;
  border-radius: 8px;
  background: rgba(255,255,255,.06);
  color: #94a3b8;
}

.filter-button {
  position: relative;
  height: 42px;
  padding: 0 14px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: .68rem;
}

.filter-button.active {
  color: #c084fc;
  border-color: rgba(167,139,250,.3);
  background: rgba(124,58,237,.12);
}

.filter-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #f472b6;
  box-shadow: 0 0 10px rgba(244,114,182,.8);
}

.view-toggle {
  display: flex;
  padding: 3px;
  border-radius: 12px;
}

.view-toggle button {
  width: 37px;
  height: 35px;
  display: grid;
  place-items: center;
  border: 0;
  border-radius: 9px;
  background: transparent;
  color: #64748b;
}

.view-toggle button.active {
  color: #c084fc;
  background: rgba(124,58,237,.14);
}

/* =========================================================
   FILTER PANEL
========================================================= */

.filter-panel {
  display: grid;
  grid-template-columns:
    repeat(4, minmax(0, 1fr))
    auto;
  gap: 10px;
  padding: 15px;
  margin-bottom: 10px;
  border-radius: 17px;
  overflow: hidden;
  background: rgba(8,13,26,.78);
  border: 1px solid rgba(255,255,255,.065);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-group label {
  color: #64748b;
  font-size: .58rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: .5px;
}

.filter-group select {
  width: 100%;
  height: 40px;
  padding: 0 11px;
  color: #cbd5e1;
  border-radius: 10px;
  outline: none;
  border: 1px solid rgba(255,255,255,.07);
  background: #0b1220;
  font-size: .68rem;
}

.clear-filter-button {
  align-self: end;
  height: 40px;
  padding: 0 14px;
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,.08);
  background: rgba(255,255,255,.035);
  color: #94a3b8;
  font-size: .66rem;
}

/* =========================================================
   CATEGORY
========================================================= */

.category-scroll {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 3px 1px 8px;
  margin-bottom: 17px;
  scrollbar-width: none;
}

.category-scroll::-webkit-scrollbar {
  display: none;
}

.category-chip {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 9px 13px;
  border-radius: 999px;
  color: #94a3b8;
  background: rgba(255,255,255,.025);
  border: 1px solid rgba(255,255,255,.065);
  font-size: .64rem;
  font-weight: 700;
  transition: .2s ease;
}

.category-chip:hover {
  transform: translateY(-2px);
  color: white;
}

.category-chip.active {
  color: #c084fc;
  border-color: rgba(167,139,250,.3);
  background: rgba(124,58,237,.14);
}

/* =========================================================
   RESULTS HEADER
========================================================= */

.results-header {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 15px;
  margin-bottom: 13px;
}

.results-header h2 {
  margin: 6px 0 4px;
  font-size: 1.15rem;
  font-weight: 900;
  letter-spacing: -.4px;
}

.results-header p {
  margin: 0;
  color: #64748b;
  font-size: .65rem;
}

.results-header strong {
  color: #cbd5e1;
}

.results-live {
  display: flex;
  align-items: center;
  gap: 7px;
  color: #64748b;
  font-size: .62rem;
}

.results-live span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #34d399;
  box-shadow: 0 0 10px rgba(52,211,153,.7);
}

/* =========================================================
   RESOURCE GRID
========================================================= */

.resource-grid {
  display: grid;
  grid-template-columns:
    repeat(3, minmax(0, 1fr));
  gap: 15px;
}

.resource-card {
  position: relative;
  overflow: hidden;
  border-radius: 20px;
  background:
    linear-gradient(
      145deg,
      rgba(15,23,42,.82),
      rgba(7,12,24,.76)
    );
  border: 1px solid rgba(255,255,255,.07);
  box-shadow:
    0 22px 65px rgba(0,0,0,.2),
    inset 0 1px 0 rgba(255,255,255,.025);
  transition:
    border-color .25s ease,
    box-shadow .25s ease;
}

.resource-card:hover {
  border-color: rgba(167,139,250,.24);
  box-shadow:
    0 30px 80px rgba(0,0,0,.34),
    0 0 40px rgba(124,58,237,.08);
}

.resource-cover {
  position: relative;
  height: 190px;
  overflow: hidden;
  background: #0b1220;
}

.resource-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform .5s ease;
}

.resource-card:hover .resource-cover img {
  transform: scale(1.06);
}

.cover-overlay {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(
      to bottom,
      rgba(2,6,23,.25),
      transparent 35%,
      rgba(2,6,23,.85)
    );
}

.resource-cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.cover-icon {
  width: 58px;
  height: 58px;
  display: grid;
  place-items: center;
  border-radius: 18px;
  border: 1px solid;
  font-size: 24px;
}

.resource-cover-placeholder span {
  color: #64748b;
  font-size: .65rem;
}

.cover-top {
  position: absolute;
  left: 13px;
  right: 13px;
  top: 13px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.type-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 9px;
  border: 1px solid;
  border-radius: 8px;
  font-size: .57rem;
  font-weight: 850;
}

.cover-save {
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,.1);
  color: #94a3b8;
  background: rgba(5,8,20,.65);
  backdrop-filter: blur(10px);
  transition: .2s ease;
}

.cover-save:hover,
.cover-save.saved {
  color: #f472b6;
  border-color: rgba(244,114,182,.28);
  background: rgba(244,114,182,.09);
}

.cover-bottom {
  position: absolute;
  left: 13px;
  right: 13px;
  bottom: 12px;
  display: flex;
  justify-content: space-between;
  gap: 8px;
}

.cover-bottom span {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #cbd5e1;
  font-size: .58rem;
  font-weight: 700;
}

.resource-card-content {
  padding: 17px;
}

.resource-card-date {
  color: #64748b;
  font-size: .58rem;
  margin-bottom: 7px;
}

.resource-card-content h3 {
  margin: 0;
  font-size: .92rem;
  line-height: 1.35;
  font-weight: 850;
  color: #f1f5f9;
}

.resource-card-content > p {
  margin: 8px 0 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  color: #64748b;
  font-size: .67rem;
  line-height: 1.7;
}

.tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 12px;
}

.tag-row span {
  padding: 4px 7px;
  border-radius: 6px;
  color: #94a3b8;
  background: rgba(255,255,255,.035);
  border: 1px solid rgba(255,255,255,.05);
  font-size: .52rem;
}

.resource-stats-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 15px;
  color: #64748b;
  font-size: .58rem;
}

.resource-stats-row span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.card-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 7px;
  margin-top: 15px;
}

.primary-action,
.secondary-action {
  min-height: 38px;
  padding: 0 12px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  font-size: .62rem;
  font-weight: 800;
  transition: .2s ease;
}

.primary-action {
  border: 0;
  color: white;
  background:
    linear-gradient(
      135deg,
      #7c3aed,
      #2563eb,
      #db2777
    );
  box-shadow:
    0 10px 25px rgba(124,58,237,.2);
}

.primary-action:hover {
  transform: translateY(-2px);
  box-shadow:
    0 15px 35px rgba(124,58,237,.3);
}

.secondary-action {
  color: #94a3b8;
}

.secondary-action.large {
  min-height: 44px;
}

.secondary-action.saved-action {
  color: #f472b6;
  border-color: rgba(244,114,182,.25);
  background: rgba(244,114,182,.08);
}

.secondary-action.icon-only {
  min-width: 100px;
}

/* =========================================================
   LIST
========================================================= */

.resource-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.resource-list-card {
  display: grid;
  grid-template-columns: 54px 1fr auto;
  gap: 15px;
  align-items: center;
  padding: 15px;
  border-radius: 17px;
  background:
    rgba(8,13,26,.75);
  border: 1px solid rgba(255,255,255,.065);
  transition: .2s ease;
}

.resource-list-card:hover {
  border-color: rgba(167,139,250,.2);
  transform: translateX(3px);
}

.resource-list-icon {
  width: 54px;
  height: 54px;
  display: grid;
  place-items: center;
  border: 1px solid;
  border-radius: 15px;
  font-size: 21px;
}

.resource-list-main h3 {
  margin: 6px 0 4px;
  font-size: .85rem;
}

.resource-list-main p {
  margin: 0;
  max-width: 780px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  color: #64748b;
  font-size: .64rem;
  line-height: 1.6;
}

.resource-card-top {
  display: flex;
  align-items: center;
  gap: 8px;
}

.date-text {
  color: #475569;
  font-size: .57rem;
}

.resource-meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 8px;
  color: #64748b;
  font-size: .56rem;
}

.resource-meta-row span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.resource-list-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.icon-action {
  width: 35px;
  height: 35px;
  display: grid;
  place-items: center;
  border-radius: 9px;
}

.icon-action.saved {
  color: #f472b6;
}

.resource-list-actions .secondary-action {
  padding: 0 11px;
}

.resource-list-actions .primary-action {
  min-height: 35px;
}

/* =========================================================
   EMPTY
========================================================= */

.empty-state {
  min-height: 390px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 30px;
  border-radius: 24px;
  border: 1px solid rgba(255,255,255,.06);
  background:
    radial-gradient(
      circle at center,
      rgba(124,58,237,.08),
      transparent 45%
    ),
    rgba(8,13,26,.6);
}

.empty-icon {
  width: 72px;
  height: 72px;
  display: grid;
  place-items: center;
  border-radius: 22px;
  color: #a78bfa;
  background: rgba(124,58,237,.1);
  border: 1px solid rgba(167,139,250,.18);
  font-size: 28px;
}

.empty-state h3 {
  margin: 18px 0 6px;
  font-size: 1rem;
}

.empty-state p {
  max-width: 360px;
  margin: 0 0 17px;
  color: #64748b;
  font-size: .67rem;
  line-height: 1.7;
}

/* =========================================================
   PAGINATION
========================================================= */

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 5px;
  margin-top: 22px;
}

.pagination button {
  min-width: 34px;
  height: 34px;
  padding: 0 9px;
  display: grid;
  place-items: center;
  border-radius: 9px;
  color: #64748b;
  background: rgba(255,255,255,.03);
  border: 1px solid rgba(255,255,255,.06);
}

.pagination button.active {
  color: white;
  border-color: transparent;
  background:
    linear-gradient(
      135deg,
      #7c3aed,
      #2563eb
    );
}

.pagination button:disabled {
  opacity: .3;
}

/* =========================================================
   FOOTER
========================================================= */

.resource-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 42px;
  padding-top: 20px;
  border-top: 1px solid rgba(255,255,255,.05);
  color: #475569;
  font-size: .58rem;
}

.resource-footer div {
  display: flex;
  align-items: center;
  gap: 7px;
}

.resource-footer svg {
  color: #a78bfa;
}

/* =========================================================
   MODALS
========================================================= */

.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 5000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(0,0,0,.76);
  backdrop-filter: blur(15px);
  overflow-y: auto;
}

.admin-backdrop {
  z-index: 6000;
}

.detail-modal,
.admin-modal {
  width: min(680px, 100%);
  max-height: 92vh;
  overflow-y: auto;
  border-radius: 26px;
  border: 1px solid rgba(255,255,255,.1);
  background:
    linear-gradient(
      145deg,
      rgba(15,23,42,.97),
      rgba(5,10,22,.98)
    );
  box-shadow:
    0 50px 140px rgba(0,0,0,.55),
    0 0 70px rgba(124,58,237,.08);
}

.detail-cover {
  position: relative;
  height: 250px;
  overflow: hidden;
}

.detail-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.detail-cover-placeholder {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  color: #a78bfa;
  font-size: 60px;
  background:
    radial-gradient(
      circle at center,
      rgba(124,58,237,.25),
      transparent 45%
    ),
    #080d1b;
}

.detail-cover-overlay {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(
      to bottom,
      rgba(0,0,0,.1),
      rgba(3,7,18,.95)
    );
}

.modal-close {
  position: absolute;
  right: 15px;
  top: 15px;
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  border-radius: 11px;
  color: #cbd5e1;
  border: 1px solid rgba(255,255,255,.1);
  background: rgba(5,8,20,.65);
  backdrop-filter: blur(12px);
}

.modal-close:hover {
  color: white;
  background: rgba(124,58,237,.2);
}

.modal-close.static {
  position: static;
  flex-shrink: 0;
}

.detail-cover-title {
  position: absolute;
  left: 25px;
  right: 60px;
  bottom: 22px;
  z-index: 2;
}

.detail-cover-title span {
  color: #c084fc;
  font-size: .58rem;
  font-weight: 850;
  text-transform: uppercase;
}

.detail-cover-title h2 {
  margin: 6px 0 0;
  font-size: 1.55rem;
  line-height: 1.2;
  font-weight: 900;
}

.detail-body {
  padding: 23px;
}

.detail-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}

.detail-badges span {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 7px 9px;
  border-radius: 9px;
  color: #94a3b8;
  background: rgba(255,255,255,.035);
  border: 1px solid rgba(255,255,255,.06);
  font-size: .59rem;
}

.detail-description {
  color: #94a3b8;
  line-height: 1.75;
  font-size: .7rem;
  margin: 17px 0;
}

.detail-metrics {
  display: grid;
  grid-template-columns:
    repeat(3, 1fr);
  gap: 8px;
}

.detail-metrics div {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  border-radius: 12px;
  background: rgba(255,255,255,.025);
  border: 1px solid rgba(255,255,255,.05);
}

.detail-metrics svg {
  color: #a78bfa;
  margin-bottom: 4px;
}

.detail-metrics strong {
  font-size: .82rem;
}

.detail-metrics span {
  color: #475569;
  font-size: .56rem;
}

.detail-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 14px;
}

.detail-tags span {
  color: #a78bfa;
  background: rgba(124,58,237,.08);
  border: 1px solid rgba(167,139,250,.13);
  border-radius: 7px;
  padding: 5px 8px;
  font-size: .55rem;
}

.detail-author {
  display: flex;
  align-items: center;
  gap: 9px;
  margin-top: 18px;
  padding: 12px;
  border-radius: 13px;
  background: rgba(255,255,255,.025);
  border: 1px solid rgba(255,255,255,.05);
}

.author-avatar {
  width: 35px;
  height: 35px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  color: #c084fc;
  background: rgba(124,58,237,.1);
}

.detail-author div:nth-child(2) {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.detail-author span {
  color: #475569;
  font-size: .55rem;
}

.detail-author strong {
  color: #cbd5e1;
  font-size: .63rem;
}

.author-date {
  margin-left: auto;
}

/* =========================================================
   DELETE ACTION
========================================================= */

.delete-action {
  min-height: 38px;
  padding: 0 12px;
  border: 1px solid rgba(248,113,113,.22);
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  color: #f87171;
  background: rgba(248,113,113,.07);
  font-size: .62rem;
  font-weight: 800;
  transition: .2s ease;
  cursor: pointer;
}

.delete-action:hover {
  color: #ffffff;
  background: rgba(239,68,68,.85);
  border-color: rgba(248,113,113,.5);
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(239,68,68,.18);
}

.delete-action.large {
  min-height: 44px;
  padding: 0 16px;
}

.delete-action:active {
  transform: translateY(0);
}

.delete-action:disabled {
  opacity: .5;
  cursor: not-allowed;
  transform: none;
}

.detail-actions {
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr;
  gap: 7px;
  margin-top: 18px;
}

/* =========================================================
   ADMIN MODAL
========================================================= */

.admin-modal {
  width: min(760px, 100%);
  padding: 26px;
}

.admin-modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
}

.admin-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 9px;
  border-radius: 999px;
  color: #f9a8d4;
  background: rgba(236,72,153,.08);
  border: 1px solid rgba(236,72,153,.18);
  font-size: .58rem;
  font-weight: 850;
}

.admin-modal h2 {
  margin: 11px 0 5px;
  font-size: 1.5rem;
}

.admin-modal-header p {
  margin: 0;
  color: #64748b;
  font-size: .66rem;
}

.success-message,
.form-error {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 17px;
  padding: 11px 13px;
  border-radius: 11px;
  font-size: .63rem;
}

.success-message {
  color: #6ee7b7;
  background: rgba(16,185,129,.07);
  border: 1px solid rgba(16,185,129,.18);
}

.form-error {
  color: #fca5a5;
  background: rgba(239,68,68,.07);
  border: 1px solid rgba(239,68,68,.18);
}

.resource-form {
  margin-top: 22px;
}

.form-section-title {
  display: flex;
  align-items: center;
  gap: 9px;
  margin-bottom: 13px;
  color: #cbd5e1;
  font-size: .7rem;
  font-weight: 850;
}

.form-section-title span {
  width: 26px;
  height: 26px;
  display: grid;
  place-items: center;
  border-radius: 8px;
  color: #c084fc;
  background: rgba(124,58,237,.1);
  border: 1px solid rgba(167,139,250,.15);
  font-size: .57rem;
}

.form-section-title.second {
  margin-top: 23px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 13px;
}

.form-group label {
  color: #94a3b8;
  font-size: .61rem;
  font-weight: 750;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  color: #f8fafc;
  background: rgba(255,255,255,.03);
  border: 1px solid rgba(255,255,255,.08);
  outline: none;
  border-radius: 11px;
  transition: .2s ease;
}

.form-group input,
.form-group select {
  height: 43px;
  padding: 0 12px;
}

.form-group textarea {
  min-height: 90px;
  padding: 11px 12px;
  resize: vertical;
  line-height: 1.6;
}

.form-group select {
  background: #0b1220;
}

.form-group input::placeholder,
.form-group textarea::placeholder {
  color: #475569;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  border-color: rgba(167,139,250,.45);
  box-shadow:
    0 0 20px rgba(124,58,237,.08);
}

.form-grid {
  display: grid;
  grid-template-columns:
    1fr 1fr;
  gap: 12px;
}

.input-with-icon {
  position: relative;
}

.input-with-icon > svg {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #64748b;
}

.input-with-icon input {
  padding-left: 36px;
}

.thumbnail-preview {
  position: relative;
  height: 130px;
  overflow: hidden;
  margin: -2px 0 13px;
  border-radius: 13px;
  border: 1px solid rgba(255,255,255,.07);
  background: #080d1b;
}

.thumbnail-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumbnail-preview span {
  position: absolute;
  left: 10px;
  bottom: 9px;
  padding: 5px 8px;
  border-radius: 7px;
  color: white;
  background: rgba(0,0,0,.55);
  font-size: .53rem;
}

.publish-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  padding: 11px;
  border-radius: 10px;
  color: #6ee7b7;
  background: rgba(16,185,129,.05);
  border: 1px solid rgba(16,185,129,.12);
  font-size: .59rem;
}

.form-actions {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 9px;
  margin-top: 20px;
}

.publish-button {
  min-height: 45px;
}

/* =========================================================
   LOADING
========================================================= */

.loading-screen {
  min-height: 100vh;
  position: relative;
  display: grid;
  place-items: center;
  overflow: hidden;
  background: #030712;
}

.loading-content {
  position: relative;
  z-index: 2;
  text-align: center;
}

.loading-content img {
  width: 72px;
  height: 72px;
  object-fit: cover;
  border-radius: 20px;
  box-shadow:
    0 0 60px rgba(124,58,237,.3);
}

.loading-content h2 {
  margin: 17px 0 5px;
  font-size: 1rem;
}

.loading-content p {
  margin: 0;
  color: #64748b;
  font-size: .66rem;
}

.loading-spinner {
  display: flex;
  justify-content: center;
  gap: 5px;
  margin: 19px 0 0;
}

.loading-spinner span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #a78bfa;
  animation: loadingBounce 1s infinite;
}

.loading-spinner span:nth-child(2) {
  animation-delay: .15s;
}

.loading-spinner span:nth-child(3) {
  animation-delay: .3s;
}

/* =========================================================
   SKELETON
========================================================= */

.skeleton-card {
  overflow: hidden;
}

.skeleton-cover {
  height: 190px;
  background:
    linear-gradient(
      90deg,
      rgba(255,255,255,.025),
      rgba(255,255,255,.07),
      rgba(255,255,255,.025)
    );
  background-size: 300% 100%;
  animation: skeleton 1.6s infinite;
}

.skeleton-content {
  padding: 17px;
}

.skeleton-line {
  height: 9px;
  width: 100%;
  margin-top: 9px;
  border-radius: 999px;
  background: rgba(255,255,255,.055);
}

.skeleton-line.small {
  width: 28%;
}

.skeleton-line.title {
  width: 75%;
  height: 14px;
}

.skeleton-line.medium {
  width: 65%;
}

.skeleton-row {
  display: flex;
  gap: 8px;
  margin-top: 15px;
}

.skeleton-row div {
  width: 45px;
  height: 8px;
  border-radius: 999px;
  background: rgba(255,255,255,.04);
}

.skeleton-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 7px;
  margin-top: 16px;
}

.skeleton-buttons div {
  height: 36px;
  border-radius: 9px;
  background: rgba(255,255,255,.04);
}

/* =========================================================
   ANIMATIONS
========================================================= */

@keyframes floatOrb {
  0%,
  100% {
    transform: translate3d(0,0,0);
  }

  50% {
    transform: translate3d(25px,-25px,0);
  }
}

@keyframes floatCard {
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-8px);
  }
}

@keyframes pulseDot {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }

  50% {
    transform: scale(1.5);
    opacity: .6;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes loadingBounce {
  0%,
  80%,
  100% {
    transform: translateY(0);
    opacity: .4;
  }

  40% {
    transform: translateY(-6px);
    opacity: 1;
  }
}

@keyframes skeleton {
  0% {
    background-position: 100% 0;
  }

  100% {
    background-position: -100% 0;
  }
}

/* =========================================================
   RESPONSIVE
========================================================= */

@media (max-width: 1150px) {
  .hero-visual {
    right: 2%;
    opacity: .65;
  }

  .resource-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }

  .filter-panel {
    grid-template-columns:
      repeat(2, 1fr);
  }
}

@media (max-width: 900px) {
  .hero-section {
    min-height: 430px;
  }

  .hero-visual {
    right: -70px;
    opacity: .25;
  }

  .stats-grid {
    grid-template-columns:
      repeat(2, 1fr);
  }

  .resource-list-card {
    grid-template-columns:
      50px 1fr;
  }

  .resource-list-actions {
    grid-column: 2;
  }
}

@media (max-width: 700px) {
  .resource-container {
    padding: 16px 12px 40px;
  }

  .topbar {
    margin-bottom: 15px;
  }

  .topbar-right .admin-status {
    display: none;
  }

  .back-button span {
    display: none;
  }

  .hero-section {
    min-height: 450px;
    padding: 25px 21px;
    border-radius: 23px;
  }

  .hero-section h1 {
    font-size: 3.1rem;
    letter-spacing: -2.5px;
  }

  .hero-visual {
    transform:
      translateY(-50%)
      scale(.75);
    right: -90px;
    opacity: .17;
  }

  .hero-add-button {
    left: 21px;
    right: auto;
    bottom: 22px;
  }

  .stats-grid {
    grid-template-columns:
      repeat(2, 1fr);
  }

  .stat-card {
    padding: 13px;
  }

  .stat-icon {
    width: 38px;
    height: 38px;
  }

  .control-panel {
    flex-wrap: wrap;
  }

  .search-wrapper {
    flex-basis: 100%;
  }

  .filter-button {
    flex: 1;
    justify-content: center;
  }

  .view-toggle {
    margin-left: auto;
  }

  .filter-panel {
    grid-template-columns: 1fr;
  }

  .resource-grid {
    grid-template-columns: 1fr;
  }

  .resource-list-card {
    grid-template-columns:
      45px 1fr;
  }

  .resource-list-icon {
    width: 45px;
    height: 45px;
  }

  .resource-list-actions {
    grid-column: 1 / -1;
  }

  .resource-list-actions
  .primary-action,
  .resource-list-actions
  .resource-list-actions
  .delete-action,
  .secondary-action {
    flex: 1;
  }

  .results-header {
    align-items: flex-start;
  }

  .results-live {
    display: none;
  }

  .detail-modal {
    border-radius: 20px;
  }

  .detail-cover {
    height: 205px;
  }

  .detail-cover-title h2 {
    font-size: 1.2rem;
  }

  .detail-actions {
    grid-template-columns: 1fr 1fr;
  }

  .detail-actions
  .primary-action {
    grid-column: 1 / -1;
  }

  .form-grid {
    grid-template-columns: 1fr;
    gap: 0;
  }

  .admin-modal {
    padding: 19px;
    border-radius: 21px;
  }

  .form-actions {
    grid-template-columns: 1fr;
  }

  .resource-footer {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
}

@media (max-width: 450px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .hero-section h1 {
    font-size: 2.7rem;
  }

  .hero-content > p {
    font-size: .78rem;
  }

  .resource-cover {
    height: 180px;
  }

  .detail-metrics {
    grid-template-columns:
      1fr 1fr 1fr;
  }

  .detail-metrics div {
    padding: 9px;
  }

  .author-date {
    display: none;
  }
}
`;

export default ResourceHub;
