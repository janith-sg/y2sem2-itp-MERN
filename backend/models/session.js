const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const sessionSchema = new Schema({
  doctorName: { type: String, required: true },
  sessionType: { type: String, enum: ["Morning", "Evening"], required: true },
  sessionDate: { type: Date, required: true },
  isAvailable: { type: Boolean, default: true },
  specialNotice: { type: String, default: "", maxlength: 200 },
  status: { type: String, enum: ["Upcoming", "Ongoing", "Completed", "Cancelled"], default: "Upcoming" }
}, { timestamps: true });

// Date must be today or in the future
sessionSchema.pre('save', function(next) {
  const today = new Date(); today.setHours(0,0,0,0);
  const sessionDate = new Date(this.sessionDate); sessionDate.setHours(0,0,0,0);
  if (sessionDate < today) {
    return next(new Error("Session date must be today or in the future"));
  }
  next();
});

// unique index: doctor + date + type
sessionSchema.index({ doctorName: 1, sessionDate: 1, sessionType: 1 }, { unique: true });

module.exports = mongoose.model("Session", sessionSchema);