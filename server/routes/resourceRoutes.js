const express = require("express");

const router = express.Router();

const {
  getResources,
  getResourceById,
  checkAdminAccess,

  createResource,
  createAdminResource,

  updateResource,
  deleteResource,

  incrementView,

  saveResource,
  unsaveResource,
  getSavedResources,

  rateResource,
  markHelpful,

  getResourceStats,
  getResourceMeta,

  getPendingResources,
  getAllResourcesForAdmin,
  getAdminResourceDashboard,

  approveResource,
  rejectResource,

  adminDeleteResource,
} = require("../controllers/resourceController");

const {
  protect,
} = require("../middleware/authMiddleware");

const {
  adminOnly,
} = require("../middleware/adminMiddleware");

/*
|--------------------------------------------------------------------------
| PUBLIC / STUDENT
|--------------------------------------------------------------------------
*/

router.get(
  "/",
  protect,
  getResources
);

router.get(
  "/meta",
  protect,
  getResourceMeta
);

router.get(
  "/stats/overview",
  protect,
  getResourceStats
);

router.get(
  "/saved/me",
  protect,
  getSavedResources
);

/*
|--------------------------------------------------------------------------
| ADMIN ACCESS CHECK
|--------------------------------------------------------------------------
*/

router.get(
  "/admin/check",
  protect,
  adminOnly,
  checkAdminAccess
);

/*
|--------------------------------------------------------------------------
| ADMIN DASHBOARD
|--------------------------------------------------------------------------
*/

router.get(
  "/admin/dashboard",
  protect,
  adminOnly,
  getAdminResourceDashboard
);

router.get(
  "/admin/all",
  protect,
  adminOnly,
  getAllResourcesForAdmin
);

/*
|--------------------------------------------------------------------------
| ADMIN CREATE
|--------------------------------------------------------------------------
*/

router.post(
  "/admin",
  protect,
  adminOnly,
  createAdminResource
);

/*
|--------------------------------------------------------------------------
| ADMIN MODERATION
|--------------------------------------------------------------------------
*/

router.get(
  "/moderation/pending",
  protect,
  adminOnly,
  getPendingResources
);

/*
|--------------------------------------------------------------------------
| STUDENT CREATE
|--------------------------------------------------------------------------
*/

router.post(
  "/",
  protect,
  createResource
);

/*
|--------------------------------------------------------------------------
| SINGLE RESOURCE
|--------------------------------------------------------------------------
*/

router.get(
  "/:id",
  protect,
  getResourceById
);

/*
|--------------------------------------------------------------------------
| UPDATE
|--------------------------------------------------------------------------
*/

router.put(
  "/:id",
  protect,
  updateResource
);

/*
|--------------------------------------------------------------------------
| DELETE
|--------------------------------------------------------------------------
*/

router.delete(
  "/:id",
  protect,
  deleteResource
);

/*
|--------------------------------------------------------------------------
| VIEW
|--------------------------------------------------------------------------
*/

router.post(
  "/:id/view",
  protect,
  incrementView
);

/*
|--------------------------------------------------------------------------
| SAVE
|--------------------------------------------------------------------------
*/

router.post(
  "/:id/save",
  protect,
  saveResource
);

router.delete(
  "/:id/save",
  protect,
  unsaveResource
);

/*
|--------------------------------------------------------------------------
| RATING
|--------------------------------------------------------------------------
*/

router.post(
  "/:id/rating",
  protect,
  rateResource
);

/*
|--------------------------------------------------------------------------
| HELPFUL
|--------------------------------------------------------------------------
*/

router.post(
  "/:id/helpful",
  protect,
  markHelpful
);

/*
|--------------------------------------------------------------------------
| ADMIN APPROVE
|--------------------------------------------------------------------------
*/

router.patch(
  "/:id/approve",
  protect,
  adminOnly,
  approveResource
);

/*
|--------------------------------------------------------------------------
| ADMIN REJECT
|--------------------------------------------------------------------------
*/

router.patch(
  "/:id/reject",
  protect,
  adminOnly,
  rejectResource
);

/*
|--------------------------------------------------------------------------
| ADMIN DELETE
|--------------------------------------------------------------------------
*/

router.delete(
  "/admin/:id",
  protect,
  adminOnly,
  adminDeleteResource
);

module.exports = router;