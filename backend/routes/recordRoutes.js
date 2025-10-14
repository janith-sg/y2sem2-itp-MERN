const express = require("express");
const router = express.Router();

// ✅ Require FIRST, then use it
const recordController = require("../Controllers/recordController");

// Order matters: put the specific PDF route before the generic :id route
router.get("/", recordController.getAllRecords);
router.post("/", recordController.addRecords);
router.get("/:id/report.pdf", recordController.downloadRecordReportPdf); // specific first
router.get("/:id", recordController.getbyID);
router.put("/:id", recordController.updateRecords);
router.delete("/:id", recordController.deleteRecords);

module.exports = router;






/*
const express = require("express");
const router = express.Router();

//Insert model
const Record = require("../model/recordModel");
//insert controller
const recordController = require("../Controllers/recordController");

router.get("/", recordController.getAllRecords);
router.post("/", recordController.addRecords);
router.get("/:id", recordController.getbyID);
router.put("/:id", recordController.updateRecords);
router.delete("/:id", recordController.deleteRecords);


//export
module.exports = router;
*/
