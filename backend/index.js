const express = require("express");
const dbConnection = require("./config/db");
const employeeRoutes = require("./routes/employees");
const petRoutes = require("./routes/pets");
const appointmentRoutes = require("./routes/appointments"); // NEW
const sessionRoutes = require("./routes/sessions"); // NEW
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors({ origin: true, credentials: true }));

// DB connection
dbConnection();

// Body parser with increased limit for base64 images
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));

// Serve uploads folder statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Test route
app.get("/", (req, res) => res.send("Hello server is running.."));

// Routes
app.use("/api/employees", employeeRoutes);
app.use("/api/pets", petRoutes);
app.use("/api/appointments", appointmentRoutes); // NEW
app.use("/api/sessions", sessionRoutes); // NEW

// Start server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));