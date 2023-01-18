const express = require("express");
const questionsController = require("../controllers/questionsController");
const router = express.Router();
router.post("/createQuestion", questionsController.createQuestion);
router.get("/:id", questionsController.renderQuesDetailsPAge);
module.exports = router;
