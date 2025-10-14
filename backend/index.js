const express = require("express");
const dbConnection = require("./config/db");
const employeeRoutes = require("./routes/employees"); // Employee routes
const petRoutes = require("./routes/pets"); // Pet routes
const appointmentRoutes = require("./routes/appointments"); // Appointment routes
const inventoryRoutes = require("./routes/inventory"); // Inventory routes
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors({ origin: true, credentials: true }));

// DB connection
dbConnection();

// Body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve uploads folder statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Test route
app.get("/", (req, res) => res.send("Hello server is running.."));

// Routes
app.use("/api/employees", employeeRoutes);
app.use("/api/pets", petRoutes);
app.use("/api/appointments", appointmentRoutes); // 👈 Register appointments CRUD
app.use("/api/inventory", inventoryRoutes); // 👈 Register inventory CRUD

// Start server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
