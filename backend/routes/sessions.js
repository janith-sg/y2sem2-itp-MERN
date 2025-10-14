const express = require("express");
const router = express.Router();
const sessionController = require("../Controllers/sessionController");

router.get("/", sessionController.getAllSessions);
router.post("/", sessionController.addSession);
router.get("/:id", sessionController.getSessionById);
router.put("/:id", sessionController.updateSession);
router.delete("/:id", sessionController.deleteSession);

module.exports = router;