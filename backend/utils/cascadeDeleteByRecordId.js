// utils/cascadeDeleteByRecordId.js
const Prescription = require("../models/prescriptionModel");
const Vaccination = require("../models/vaccinationModel");
const LabResult = require("../models/labResultModel");

/**
 * Deletes all child docs linked to a given numeric RecordId.
 * Pass an optional `session` to run inside the same transaction.
 */
async function cascadeDeleteByRecordId(recordId, session) {
  const opts = session ? { session } : {};
  const [rx, vac, lab] = await Promise.all([
    Prescription.deleteMany({ RecordId: recordId }, opts),
    Vaccination.deleteMany({ RecordId: recordId }, opts),
    LabResult.deleteMany({ RecordId: recordId }, opts),
  ]);

  return {
    prescriptionsDeleted: rx.deletedCount || 0,
    vaccinationsDeleted: vac.deletedCount || 0,
    labResultsDeleted: lab.deletedCount || 0,
  };
}

module.exports = { cascadeDeleteByRecordId };