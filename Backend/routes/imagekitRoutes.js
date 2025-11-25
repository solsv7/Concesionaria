const express = require("express");
const router = express.Router();
const imagekitController = require("../controllers/imagekitController");

router.get("/auth", imagekitController.getAuth);

module.exports = router;
