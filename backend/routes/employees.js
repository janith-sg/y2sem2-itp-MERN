const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const Employees = require("../models/employee");

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/\s+/g, "-");
    cb(null, Date.now() + "-" + base + ext);
  },
});

// Only allow images
const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif/;
  const extOk = allowed.test(path.extname(file.originalname).toLowerCase());
  const mimeOk = allowed.test(file.mimetype);
  if (extOk && mimeOk) cb(null, true);
  else cb(new Error("Only image files are allowed"), false);
};

// Multer upload instance
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// ---------------- POST: Add Employee ----------------
router.post("/", upload.single("image"), async (req, res) => {
  try {
    console.log("=== CREATE EMPLOYEE ROUTE ===");
    console.log("Request body:", req.body);
    console.log("Request file:", req.file);
    
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    let pets = [];
    if (req.body.pets) {
      try {
        pets = JSON.parse(req.body.pets);
        console.log("Parsed pets:", pets);
      } catch (e) {
        console.log("Invalid pets format:", e.message);
        return res.status(400).json({ msg: "Invalid pets format" });
      }
    }

    // Prepare employee data
    const employeeData = {
      employeeID: req.body.employeeID,
      name: req.body.name,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      address: req.body.address,
      nic: req.body.nic,
      mobile: req.body.mobile,
      city: req.body.city,
      image: imageUrl,
      pets: pets,
    };

    console.log("Creating employee with data:", employeeData);

    const newEmployee = await Employees.create(employeeData);
    console.log("Employee created successfully:", newEmployee.employeeID);
    
    res.json({ 
      msg: "Employee added successfully",
      employee: newEmployee
    });
  } catch (err) {
    console.error("Error creating employee:", err);
    res.status(400).json({ 
      msg: "Employee adding failed",
      error: err.message 
    });
  }
});

// ---------------- GET: All Employees ----------------
router.get("/", (req, res) => {
  Employees.find()
    .then((employees) => res.json(employees))
    .catch(() => res.status(400).json({ msg: "No employees found" }));
});

// ---------------- GET: All Users (same as employees, different endpoint) ----------------
router.get("/users", (req, res) => {
  Employees.find()
    .then((employees) => res.json(employees))
    .catch(() => res.status(400).json({ msg: "No users found" }));
});

// ---------------- GET: Employee by ID ----------------
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    let employee;

    // First try to find by employeeID (U-01, U-02, etc.)
    employee = await Employees.findOne({ employeeID: id });

    // If not found, try to find by MongoDB ObjectId
    if (!employee) {
      employee = await Employees.findById(id);
    }

    if (!employee) {
      return res.status(404).json({ msg: "Cannot find this employee" });
    }

    res.json(employee);
  } catch (error) {
    console.error("Error fetching employee:", error);
    res.status(400).json({ msg: "Error fetching employee", error: error.message });
  }
});

// ---------------- PUT: Update Employee ----------------
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    console.log("=== UPDATE EMPLOYEE ROUTE ===");
    console.log("Request params ID:", req.params.id);
    console.log("Request body:", req.body);
    
    const { id } = req.params;
    let employee;

    // First try to find by employeeID (U-01, U-02, etc.)
    employee = await Employees.findOne({ employeeID: id });
    console.log("Found by employeeID:", employee ? "Yes" : "No");

    // If not found, try to find by MongoDB ObjectId
    if (!employee) {
      console.log("Trying to find by MongoDB ObjectId...");
      employee = await Employees.findById(id);
      console.log("Found by ObjectId:", employee ? "Yes" : "No");
    }

    if (!employee) {
      console.log("Employee not found!");
      return res.status(404).json({ msg: "Employee not found" });
    }

    console.log("Found employee:", employee.employeeID, employee.name);

    // Prepare update data - only include fields that are provided
    const updateData = {};
    
    if (req.body.employeeID) updateData.employeeID = req.body.employeeID;
    if (req.body.name) updateData.name = req.body.name;
    if (req.body.firstName) updateData.firstName = req.body.firstName;
    if (req.body.lastName) updateData.lastName = req.body.lastName;
    if (req.body.email) updateData.email = req.body.email;
    if (req.body.address) updateData.address = req.body.address;
    if (req.body.nic) updateData.nic = req.body.nic;
    if (req.body.mobile) updateData.mobile = req.body.mobile;
    if (req.body.city) updateData.city = req.body.city;
    if (req.body.role) updateData.role = req.body.role;

    if (req.body.pets) {
      try {
        updateData.pets = JSON.parse(req.body.pets);
      } catch (e) {
        console.log("Invalid pets format:", e.message);
        return res.status(400).json({ msg: "Invalid pets format" });
      }
    }

    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
      console.log("New image uploaded:", updateData.image);
    }

    console.log("Update data:", updateData);

    // Use the MongoDB ObjectId (_id) for the update
    const updatedEmployee = await Employees.findByIdAndUpdate(employee._id, updateData, { new: true });
    console.log("Update successful!");
    
    res.json({ 
      msg: "Update Successfully", 
      employee: updatedEmployee 
    });
  } catch (err) {
    console.error("Update error:", err);
    res.status(400).json({ 
      msg: "Update failed", 
      error: err.message 
    });
  }
});

// ---------------- DELETE: Remove Employee ----------------
router.delete("/:id", async (req, res) => {
  try {
    console.log("=== DELETE EMPLOYEE ROUTE ===");
    console.log("Request params ID:", req.params.id);
    
    const { id } = req.params;
    let employee;

    // First try to find by employeeID (U-01, U-02, etc.)
    employee = await Employees.findOne({ employeeID: id });
    console.log("Found by employeeID:", employee ? "Yes" : "No");

    // If not found, try to find by MongoDB ObjectId
    if (!employee) {
      console.log("Trying to find by MongoDB ObjectId...");
      employee = await Employees.findById(id);
      console.log("Found by ObjectId:", employee ? "Yes" : "No");
    }

    if (!employee) {
      console.log("Employee not found!");
      return res.status(404).json({ msg: "Employee not found" });
    }

    console.log("Found employee to delete:", employee.employeeID, employee.name);

    // Use the MongoDB ObjectId (_id) for the deletion
    await Employees.findByIdAndDelete(employee._id);
    console.log("Delete successful!");
    
    res.json({ 
      msg: "Deleted successfully",
      deletedEmployee: {
        employeeID: employee.employeeID,
        name: employee.name
      }
    });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(400).json({ 
      msg: "Cannot delete employee",
      error: err.message 
    });
  }
});

module.exports = router;
