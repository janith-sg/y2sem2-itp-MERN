// Model/recordModel.js
const mongoose = require("mongoose");
const { getNextSeq } = require("../utils/getNextSeq");
const { cascadeDeleteByRecordId } = require("../utils/cascadeDeleteByRecordId");

const Schema = mongoose.Schema;

const recordSchema = new Schema(
  {
    // Human-friendly auto-increment numeric ID
    RecordId: { type: Number, required: true, unique: true, index: true, min: 1 },

    // Foreign-ish alphanumeric refs managed elsewhere
    // 🛑 MODIFICATION 1: Change PetId from Number to String (e.g., P-017)
    PetId: { type: String, required: true, trim: true },
    
    // 🛑 MODIFICATION 2: Change VetId from Number to String (e.g., V-301)
    VetId: { type: String, required: true, trim: true },

    VisitDate: { type: Date, required: true },

    Diagnosis: { type: String, required: true, trim: true },
    Treatment: { type: String, required: true, trim: true },

    Notes: { type: String, trim: true },
  },
  { timestamps: true }
);

/**
 * Auto-assign next RecordId if not provided on new docs.
 * Will NOT overwrite if RecordId is already set (e.g., during migrations/tests).
 */
recordSchema.pre("validate", async function (next) {
  try {
    if (this.isNew && (this.RecordId === undefined || this.RecordId === null)) {
      this.RecordId = await getNextSeq("record");
    }
    next();
  } catch (err) {
    next(err);
  }
});

/**
 * Optional safety net: always cascade even if deletion happens outside controllers.
 * This runs after a findOneAndDelete({ ... }) operation.
 * (Not in the same transaction as your controller unless you pass one explicitly.)
 */
recordSchema.post("findOneAndDelete", async function (doc) {
  try {
    if (doc && typeof doc.RecordId === "number") {
      await cascadeDeleteByRecordId(doc.RecordId);
    }
  } catch (e) {
    console.error("Cascade after Record deletion failed:", e);
  }
});

/**
 * Extra coverage: if someone calls doc.deleteOne() on a loaded document,
 * this post hook will also cascade.
 */
recordSchema.post("deleteOne", { document: true, query: false }, async function (doc) {
  try {
    // 'this' is the document in document middleware
    const recId = this?.RecordId;
    if (typeof recId === "number") {
      await cascadeDeleteByRecordId(recId);
    }
  } catch (e) {
    console.error("Cascade after Record document.deleteOne failed:", e);
  }
});

module.exports = mongoose.model("recordModel", recordSchema);