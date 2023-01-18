const express = require("express");
const connectEnsureLogin = require("connect-ensure-login");
const voterController = require("../controllers/voterController");

const router = express.Router();
router.post(
  "/:id/voters",
  connectEnsureLogin.ensureLoggedIn(),
  voterController.addVoters
);
router.get(
  "/:id/voters",
  connectEnsureLogin.ensureLoggedIn(),
  voterController.getVoters
);
router.get(
  "/:id/vote",
  connectEnsureLogin.ensureLoggedIn("/voterLogin"),
  voterController.vote
);

module.exports = router;
