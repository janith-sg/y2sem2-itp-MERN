const mongoose = require("mongoose");
const Record = require("../models/recordModel");
const Prescription = require("../models/prescriptionModel");
const Vaccination  = require("../models/vaccinationModel");
const LabResult    = require("../models/labResultModel");
const PDFDocument  = require("pdfkit");
const { cascadeDeleteByRecordId } = require("../utils/cascadeDeleteByRecordId");

const isValidObjectId = (v) => mongoose.Types.ObjectId.isValid(v);

async function findRecordEither(idOrNum) {
  if (isValidObjectId(idOrNum)) return Record.findById(idOrNum);
  const n = Number(idOrNum);
  if (Number.isFinite(n)) return Record.findOne({ RecordId: n });
  return null;
}

// Get all records
const getAllRecords = async (_req, res) => {
  try {
    const records = await Record.find();
    return res.status(200).json({ records });
  } catch (err) {
    console.error("GET ALL RECORDS ERROR:", err);
    return res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// Add a new record (RecordId is auto-assigned by model hook)
const addRecords = async (req, res) => {
  console.log("POST /records body:", JSON.stringify(req.body, null, 2));

  const { PetId, VetId, VisitDate, Diagnosis, Treatment, Notes } = req.body;

  try {
    const rec = new Record({ PetId, VetId, VisitDate, Diagnosis, Treatment, Notes });
    const saved = await rec.save(); // RecordId assigned in pre-validate hook
    return res.status(201).json({ records: saved });
  } catch (err) {
    console.error("ADD RECORD ERROR:", err);
    const message = err.code === 11000 ? "Duplicate RecordId" : err.message;
    return res.status(400).json({ message: "Unable to add record", error: message });
  }
};

// Get record by Mongo _id
const getbyID = async (req, res) => {
  const id = req.params.id;
  try {
    const records = await Record.findById(id);
    if (!records) return res.status(404).json({ message: "Record Not Found" });
    return res.status(200).json({ records });
  } catch (err) {
    console.error("GET RECORD BY ID ERROR:", err);
    return res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// Update a record (do not allow changing RecordId)
const updateRecords = async (req, res) => {
  const id = req.params.id;
  console.log("PUT /records/:id body:", JSON.stringify(req.body, null, 2));

  const { PetId, VetId, VisitDate, Diagnosis, Treatment, Notes } = req.body;

  const updatePayload = {
    ...(PetId !== undefined && { PetId }),
    ...(VetId !== undefined && { VetId }),
    ...(VisitDate !== undefined && { VisitDate }),
    ...(Diagnosis !== undefined && { Diagnosis }),
    ...(Treatment !== undefined && { Treatment }),
    ...(Notes !== undefined && { Notes }),
  };

  try {
    const records = await Record.findByIdAndUpdate(id, updatePayload, {
      new: true,
      runValidators: true,
    });

    if (!records) return res.status(404).json({ message: "Unable To Update Record" });
    return res.status(200).json({ records });
  } catch (err) {
    console.error("UPDATE RECORD ERROR:", err);
    return res.status(400).json({ message: "Update failed", error: err.message });
  }
};

// Delete a record + cascade children by RecordId (NO transaction)
const deleteRecords = async (req, res) => {
  const param = req.params.id;

  try {
    const rec = await findRecordEither(param); // accepts _id or RecordId
    if (!rec) return res.status(404).json({ message: "Unable To Delete Record" });

    const stats = await cascadeDeleteByRecordId(rec.RecordId); // children first
    const deleted = await Record.findByIdAndDelete(rec._id);   // parent last
    if (!deleted) {
      return res.status(404).json({ message: "Record already deleted", cascade: stats });
    }

    return res.status(200).json({
      records: deleted,
      cascade: stats,
      message: "Record and all linked items deleted",
    });
  } catch (err) {
    console.error("DELETE RECORD (cascade, no-txn) ERROR:", err);
    return res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// GET /records/:id/report.pdf  (id can be _id or numeric RecordId)
const downloadRecordReportPdf = async (req, res) => {
  try {
    const rec = await findRecordEither(req.params.id);
    if (!rec) return res.status(404).json({ message: "Record not found" });

    const rid = rec.RecordId;
    const [rx, vac, lab] = await Promise.all([
      Prescription.find({ RecordId: rid }).lean(),
      Vaccination.find({ RecordId: rid }).lean(),
      LabResult.find({ RecordId: rid }).lean(),
    ]);

    // helper: build absolute link for files
    const toAbsUrl = (req, u) => {
      if (!u) return null;
      if (/^https?:\/\//i.test(u)) return u;
      const base = `${req.protocol}://${req.get("host")}`;
      if (u.startsWith("/")) return base + u;
      return `${base}/${u}`;
    };

    const fileName = `MedicalRecord_${rid}.pdf`;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

    const doc = new PDFDocument({ size: "A4", margin: 48 });
    doc.pipe(res);

    // Header
    doc
      .fontSize(18).text("Veterinary Medical Report", { align: "center" })
      .moveDown(0.3)
      .fontSize(10).fillColor("#666").text(`Generated: ${new Date().toLocaleString()}`, { align: "center" })
      .fillColor("#000")
      .moveDown(1);

    // Record summary
    const fmt = (d) => (d ? new Date(d).toLocaleString() : "—");
    const kv = (k, v) => doc.font("Helvetica-Bold").text(`${k}: `, { continued: true }).font("Helvetica").text(v);

    doc.fontSize(14).text(`Record #${rid}`, { underline: true }).moveDown(0.5);
    kv("Visit Date", fmt(rec.VisitDate));
    kv("Pet ID", String(rec.PetId ?? "—"));
    kv("Vet ID", String(rec.VetId ?? "—"));
    kv("Diagnosis", rec.Diagnosis || "—");
    kv("Treatment", rec.Treatment || "—");
    if (rec.Notes) kv("Notes", rec.Notes);
    doc.moveDown(0.8);

    // Prescriptions
    doc.fontSize(13).text("Prescriptions", { underline: true }).moveDown(0.3);
    if (!rx.length) {
      doc.fontSize(11).text("— None —").moveDown(0.6);
    } else {
      rx.forEach((p, i) => {
        doc.fontSize(11).text(`${i + 1}. ${p.Name} — ${p.Dose}, ${p.Duration}${p.Notes ? ` (Notes: ${p.Notes})` : ""}`);
      });
      doc.moveDown(0.8);
    }

    // Vaccinations
    doc.fontSize(13).text("Vaccinations", { underline: true }).moveDown(0.3);
    if (!vac.length) {
      doc.fontSize(11).text("— None —").moveDown(0.6);
    } else {
      vac.forEach((v, i) => {
        doc.fontSize(11).text(
          `${i + 1}. ${v.VaccineName} — Given: ${fmt(v.DateGiven)}${v.NextDueDate ? `, Next due: ${fmt(v.NextDueDate)}` : ""}${v.Notes ? ` (Notes: ${v.Notes})` : ""}`
        );
      });
      doc.moveDown(0.8);
    }

    // Lab Results (with clickable link)
    doc.fontSize(13).text("Lab Results", { underline: true }).moveDown(0.3);
    if (!lab.length) {
      doc.fontSize(11).text("— None —").moveDown(0.6);
    } else {
      lab.forEach((l, i) => {
        const fileUrl = toAbsUrl(req, l.FileUrl);
        // First part of the line
        doc.fontSize(11).text(
          `${i + 1}. ${l.Type} — Date: ${fmt(l.Date)}${l.Notes ? ` (Notes: ${l.Notes})` : ""}`,
          { continued: !!fileUrl }
        );

        // Append clickable link if available
        if (fileUrl) {
          doc
            .fillColor("blue")
            .text("  [Open file]", { link: fileUrl, underline: true })
            .fillColor("#000");
        } else {
          doc.text(""); // end line
        }
      });
      doc.moveDown(0.8);
    }

    // Footer
    doc.moveDown(1).fontSize(10).fillColor("#666")
       .text("This report was generated by the Vet Clinic system.", { align: "center" });

    doc.end();
  } catch (err) {
    console.error("PDF build error:", err);
    return res.status(500).json({ message: "Failed to generate PDF", error: err.message });
  }
};

module.exports = {
  getAllRecords,
  addRecords,
  getbyID,
  updateRecords,
  deleteRecords,
  downloadRecordReportPdf,
};
