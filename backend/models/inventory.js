const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema({
  itemId: {
    type: String,
    required: true,
    unique: true
  },
  itemName: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Pet Food',
      'Medications',
      'Vitamins & Supplements',
      'Toys & Accessories',
      'Grooming Supplies',
      'Medical Equipment',
      'Cleaning Supplies',
      'Emergency Supplies'
    ]
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'LKR'
  },
  stockQuantity: {
    type: Number,
    required: true,
    min: 0
  },
  minStockLevel: {
    type: Number,
    default: 10
  },
  supplier: {
    type: String,
    required: true
  },
  supplierContact: {
    type: String,
    required: false
  },
  batchNumber: {
    type: String,
    required: false
  },
  expiryDate: {
    type: Date,
    required: false
  },
  manufacturingDate: {
    type: Date,
    required: false
  },
  brand: {
    type: String,
    required: false
  },
  weight: {
    type: String,
    required: false
  },
  dimensions: {
    type: String,
    required: false
  },
  imageUrl: {
    type: String,
    required: false
  },
  status: {
    type: String,
    enum: ['Available', 'Out of Stock', 'Low Stock', 'Discontinued'],
    default: 'Available'
  },
  tags: [{
    type: String
  }],
  notes: {
    type: String,
    default: ""
  },
  addedBy: {
    type: String,
    required: true
  },
  lastUpdatedBy: {
    type: String,
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update the updatedAt field before saving
inventorySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Generate item ID before saving if not provided
inventorySchema.pre('save', async function(next) {
  if (!this.itemId) {
    const count = await this.constructor.countDocuments();
    this.itemId = `INV-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

// Update stock status based on quantity
inventorySchema.pre('save', function(next) {
  if (this.stockQuantity === 0) {
    this.status = 'Out of Stock';
  } else if (this.stockQuantity <= this.minStockLevel) {
    this.status = 'Low Stock';
  } else {
    this.status = 'Available';
  }
  next();
});

module.exports = mongoose.model("Inventory", inventorySchema);