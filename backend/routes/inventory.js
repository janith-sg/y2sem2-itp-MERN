const express = require("express");
const router = express.Router();
const Inventory = require("../models/inventory");
const multer = require("multer");
const path = require("path");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/inventory/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// @route   GET /api/inventory
// @desc    Get all inventory items
// @access  Public
router.get("/", async (req, res) => {
  try {
    const { category, status, search, lowStock } = req.query;
    
    let filter = {};
    
    // Apply filters
    if (category) {
      filter.category = category;
    }
    
    if (status) {
      filter.status = status;
    }
    
    if (lowStock === 'true') {
      filter.$expr = { $lte: ['$stockQuantity', '$minStockLevel'] };
    }
    
    if (search) {
      filter.$or = [
        { itemName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { supplier: { $regex: search, $options: 'i' } }
      ];
    }
    
    const inventory = await Inventory.find(filter).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: inventory.length,
      data: inventory
    });
  } catch (error) {
    console.error("Error fetching inventory:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching inventory",
      error: error.message
    });
  }
});

// @route   GET /api/inventory/:id
// @desc    Get single inventory item
// @access  Public
router.get("/:id", async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found"
      });
    }
    
    res.status(200).json({
      success: true,
      data: item
    });
  } catch (error) {
    console.error("Error fetching inventory item:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching inventory item",
      error: error.message
    });
  }
});

// @route   POST /api/inventory
// @desc    Create new inventory item
// @access  Public
router.post("/", upload.single('image'), async (req, res) => {
  try {
    const {
      itemName,
      category,
      description,
      price,
      currency,
      stockQuantity,
      minStockLevel,
      supplier,
      supplierContact,
      batchNumber,
      expiryDate,
      manufacturingDate,
      brand,
      weight,
      dimensions,
      tags,
      notes,
      addedBy
    } = req.body;

    // Validate required fields
    if (!itemName || !category || !description || !price || !stockQuantity || !supplier || !addedBy) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields"
      });
    }

    // Check if item already exists
    const existingItem = await Inventory.findOne({ 
      itemName: { $regex: new RegExp(itemName, 'i') },
      brand: brand || { $exists: false }
    });

    if (existingItem) {
      return res.status(400).json({
        success: false,
        message: "Inventory item with this name already exists"
      });
    }

    // Prepare inventory data
    const inventoryData = {
      itemName,
      category,
      description,
      price: parseFloat(price),
      currency: currency || 'LKR',
      stockQuantity: parseInt(stockQuantity),
      minStockLevel: minStockLevel ? parseInt(minStockLevel) : 10,
      supplier,
      supplierContact,
      batchNumber,
      brand,
      weight,
      dimensions,
      notes,
      addedBy
    };

    // Handle dates
    if (expiryDate) {
      inventoryData.expiryDate = new Date(expiryDate);
    }
    
    if (manufacturingDate) {
      inventoryData.manufacturingDate = new Date(manufacturingDate);
    }

    // Handle tags
    if (tags) {
      inventoryData.tags = typeof tags === 'string' ? tags.split(',').map(tag => tag.trim()) : tags;
    }

    // Handle image upload
    if (req.file) {
      inventoryData.imageUrl = `/uploads/inventory/${req.file.filename}`;
    }

    // Create new inventory item
    const item = new Inventory(inventoryData);
    const savedItem = await item.save();

    res.status(201).json({
      success: true,
      message: "Inventory item created successfully",
      data: savedItem
    });
  } catch (error) {
    console.error("Error creating inventory item:", error);
    res.status(500).json({
      success: false,
      message: "Error creating inventory item",
      error: error.message
    });
  }
});

// @route   PUT /api/inventory/:id
// @desc    Update inventory item
// @access  Public
router.put("/:id", upload.single('image'), async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found"
      });
    }

    // Prepare update data
    const updateData = { ...req.body };

    // Handle numeric fields
    if (updateData.price) {
      updateData.price = parseFloat(updateData.price);
    }
    
    if (updateData.stockQuantity) {
      updateData.stockQuantity = parseInt(updateData.stockQuantity);
    }
    
    if (updateData.minStockLevel) {
      updateData.minStockLevel = parseInt(updateData.minStockLevel);
    }

    // Handle dates
    if (updateData.expiryDate) {
      updateData.expiryDate = new Date(updateData.expiryDate);
    }
    
    if (updateData.manufacturingDate) {
      updateData.manufacturingDate = new Date(updateData.manufacturingDate);
    }

    // Handle tags
    if (updateData.tags) {
      updateData.tags = typeof updateData.tags === 'string' ? updateData.tags.split(',').map(tag => tag.trim()) : updateData.tags;
    }

    // Handle image upload
    if (req.file) {
      updateData.imageUrl = `/uploads/inventory/${req.file.filename}`;
    }

    updateData.lastUpdatedBy = req.body.lastUpdatedBy || updateData.addedBy;
    updateData.updatedAt = Date.now();

    // Update inventory item
    const updatedItem = await Inventory.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Inventory item updated successfully",
      data: updatedItem
    });
  } catch (error) {
    console.error("Error updating inventory item:", error);
    res.status(500).json({
      success: false,
      message: "Error updating inventory item",
      error: error.message
    });
  }
});

// @route   DELETE /api/inventory/:id
// @desc    Delete inventory item
// @access  Public
router.delete("/:id", async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found"
      });
    }

    await Inventory.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Inventory item deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting inventory item:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting inventory item",
      error: error.message
    });
  }
});

// @route   PATCH /api/inventory/:id/stock
// @desc    Update stock quantity
// @access  Public
router.patch("/:id/stock", async (req, res) => {
  try {
    const { stockQuantity, operation } = req.body;
    
    if (!stockQuantity || !operation) {
      return res.status(400).json({
        success: false,
        message: "Stock quantity and operation are required"
      });
    }

    const item = await Inventory.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found"
      });
    }

    let newQuantity;
    
    switch (operation) {
      case 'add':
        newQuantity = item.stockQuantity + parseInt(stockQuantity);
        break;
      case 'subtract':
        newQuantity = Math.max(0, item.stockQuantity - parseInt(stockQuantity));
        break;
      case 'set':
        newQuantity = parseInt(stockQuantity);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: "Invalid operation. Use 'add', 'subtract', or 'set'"
        });
    }

    const updatedItem = await Inventory.findByIdAndUpdate(
      req.params.id,
      { 
        stockQuantity: newQuantity,
        lastUpdatedBy: req.body.updatedBy || 'System',
        updatedAt: Date.now()
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Stock quantity updated successfully",
      data: updatedItem
    });
  } catch (error) {
    console.error("Error updating stock:", error);
    res.status(500).json({
      success: false,
      message: "Error updating stock",
      error: error.message
    });
  }
});

// @route   GET /api/inventory/reports/low-stock
// @desc    Get low stock items
// @access  Public
router.get("/reports/low-stock", async (req, res) => {
  try {
    const lowStockItems = await Inventory.find({
      $expr: { $lte: ['$stockQuantity', '$minStockLevel'] }
    }).sort({ stockQuantity: 1 });
    
    res.status(200).json({
      success: true,
      count: lowStockItems.length,
      data: lowStockItems
    });
  } catch (error) {
    console.error("Error fetching low stock report:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching low stock report",
      error: error.message
    });
  }
});

// @route   GET /api/inventory/reports/expiring
// @desc    Get items expiring soon
// @access  Public
router.get("/reports/expiring", async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + parseInt(days));
    
    const expiringItems = await Inventory.find({
      expiryDate: { 
        $exists: true, 
        $lte: expiryDate,
        $gte: new Date()
      }
    }).sort({ expiryDate: 1 });
    
    res.status(200).json({
      success: true,
      count: expiringItems.length,
      data: expiringItems
    });
  } catch (error) {
    console.error("Error fetching expiring items report:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching expiring items report",
      error: error.message
    });
  }
});

module.exports = router;