const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const dbConnection = require("./config/db");

// Import routes from both projects
const employeeRoutes = require("./routes/employees");
const petRoutes = require("./routes/pets");
const appointmentRoutes = require("./routes/appointments");
const inventoryRoutes = require("./routes/inventory");

// helani's routes
const recordRoutes = require("./routes/recordRoutes");
const prescriptionRoutes = require("./routes/prescriptionRoutes");
const vaccinationRoutes = require("./routes/vaccinationRoutes");
const labResultRoutes = require("./routes/labResultRoutes");
const uploadRoutes = require("./routes/uploadRoutes");

// Team-mate's routes
const sessionRoutes = require("./routes/sessions");
const userRoutes = require("./routes/users");

// Import utility functions
const { getNextSeq } = require("./utils/getNextSeq");
const { cascadeDeleteByRecordId } = require("./utils/cascadeDeleteByRecordId");

const app = express();
const PORT = process.env.PORT || 3000;

// ---------- Security / Infra ----------
app.set("trust proxy", true);

// ---------- CORS ----------
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
app.use(
  cors({
    origin: CLIENT_URL,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: false,
  })
);

// ---------- Parsers ----------
// Using both body-parser (from team-mate) and express built-in parsers
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

// ---------- Static assets ----------
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ---------- Routes ----------
// existing routes
app.use("/api/employees", employeeRoutes);
app.use("/api/pets", petRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/inventory", inventoryRoutes);

// helani's routes
app.use("/api/records", recordRoutes);
app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/vaccinations", vaccinationRoutes);
app.use("/api/labresults", labResultRoutes);
app.use("/api/uploads", uploadRoutes);

// other's routes
app.use("/api/sessions", sessionRoutes);
app.use("/api/users", userRoutes);

// ---------- Health / Root ----------
app.get("/", (_req, res) => {
  res.status(200).send("Vet Clinic API is running successfully!");
});

app.get("/health", (_req, res) => res.status(200).json({ ok: true }));

// ---------- Error handler ----------
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({ message: err.message || "Server Error" });
});

// ---------- Database Connection & Server Start ----------
(async () => {
  try {
    await dbConnection();
    
    console.log("Connected to MongoDB");
    console.log("DB name:", mongoose.connection.name);

    // 🆕 CRITICAL: Initialize medical records model indexes
    const Record = require("./models/recordModel");
    const Prescription = require("./models/prescriptionModel");
    const Vaccination = require("./models/vaccinationModel");
    const LabResult = require("./models/labResultModel");
    
    await Promise.all([
      Record.init(), 
      Prescription.init(), 
      Vaccination.init(), 
      LabResult.init()
    ]);
    console.log("Medical records model indexes initialized.");

    console.log("Server initialization completed");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error("Server startup error:", err);
    process.exit(1);
  }
})();

// ---------- Graceful shutdown ----------
process.on("SIGINT", async () => {
  try {
    await mongoose.connection.close();
    console.log("MongoDB connection closed.");
  } finally {
    process.exit(0);
  }
});

// Export utility functions for use in routes
module.exports = { getNextSeq, cascadeDeleteByRecordId };