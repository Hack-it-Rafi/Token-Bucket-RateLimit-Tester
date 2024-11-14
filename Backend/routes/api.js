const express = require("express");
const router = express.Router();
const apiController = require("../controllers/apiController");
const rateLimiter = require("../middlewares/ratelimiter");

router.get("/data", rateLimiter, apiController.getData);

module.exports = router;
