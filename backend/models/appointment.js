const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  appointmentId: {
    type: String,
    required: true,
    unique: true
  },
  petName: {
    type: String,
    required: true
  },
  petType: {
    type: String,
    required: true
  },
  petBreed: {
    type: String,
    required: true
  },
  petAge: {
    type: String,
    required: true
  },
  petId: {
    type: String,
    required: false
  },
  petOwnerName: {
    type: String,
    required: true
  },
  ownerId: {
    type: String,
    required: true
  },
  ownerEmail: {
    type: String,
    required: true
  },
  ownerPhone: {
    type: String,
    required: true
  },
  appointmentDate: {
    type: Date,
    required: true
  },
  appointmentTime: {
    type: String,
    required: true
  },
  serviceType: {
    type: String,
    required: true,
    enum: [
      'Laboratory and Diagnostic Services',
      'Surgical Services',
      'Grooming and Hygiene',
      'Diagnosis and Treatment',
      'General Health Checkups',
      'Other',
      'Regular Checkup',
      'Vaccination',
      'Dental Cleaning',
      'Surgery',
      'Emergency Visit',
      'Grooming',
      'Consultation',
      'Follow-up Visit',
      'Laboratory Tests',
      'X-Ray'
    ]
  },
  veterinarian: {
    type: String,
    required: true
  },
  symptoms: {
    type: String,
    default: ""
  },
  notes: {
    type: String,
    default: ""
  },
  status: {
    type: String,
    enum: ['Scheduled', 'In-Progress', 'Completed', 'Cancelled'],
    default: 'Scheduled'
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
appointmentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Generate appointment ID before saving if not provided
appointmentSchema.pre('save', async function(next) {
  if (!this.appointmentId) {
    const count = await this.constructor.countDocuments();
    this.appointmentId = `APT-${String(count + 1).padStart(3, '0')}`;
  }
  next();
});

module.exports = mongoose.model("Appointment", appointmentSchema);