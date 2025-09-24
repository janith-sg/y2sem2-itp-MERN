const Session = require("../models/session");

// Allowed doctors and enforced mapping
const ALLOWED_DOCTORS = [
  "Dr. Mahesh Thilakarathna",
  "Dr. Sarathchandra Paranavitharana"
];

const DOCTOR_SLOT_MAP = {
  "Dr. Mahesh Thilakarathna": "Morning",
  "Dr. Sarathchandra Paranavitharana": "Evening"
};

// Helper to normalize date to midnight (local)
function normalizeDateToDayStart(dateStr) {
  const d = new Date(dateStr);
  d.setHours(0,0,0,0);
  return d;
}

// 1. GET all sessions
const getAllSessions = async (req, res, next) => {
  try {
    const sessions = await Session.find().sort({ sessionDate: 1, sessionType: 1 });
    if (!sessions || sessions.length === 0) {
      return res.status(200).json({ sessions: [] });
    }
    return res.status(200).json({ sessions });
  } catch (err) {
    console.error("getAllSessions error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// 2. ADD session
const addSession = async (req, res, next) => {
  try {
    const { doctorName, sessionType, sessionDate, isAvailable = true, specialNotice = "" } = req.body;

    if (!doctorName || !sessionType || !sessionDate) {
      return res.status(400).json({ message: "doctorName, sessionType and sessionDate are required" });
    }

    if (!ALLOWED_DOCTORS.includes(doctorName)) {
      return res.status(400).json({ message: "Invalid doctor selected" });
    }

    if (!["Morning", "Evening"].includes(sessionType)) {
      return res.status(400).json({ message: "Invalid sessionType; only 'Morning' or 'Evening' allowed" });
    }

    const expected = DOCTOR_SLOT_MAP[doctorName];
    if (expected !== sessionType) {
      return res.status(400).json({ message: `${doctorName} can only be assigned to the ${expected} session` });
    }

    const sessionDayStart = normalizeDateToDayStart(sessionDate);
    const today = new Date();
    today.setHours(0,0,0,0);
    if (sessionDayStart < today) {
      return res.status(400).json({ message: "Session date must be today or a future date" });
    }

    const nextDay = new Date(sessionDayStart);
    nextDay.setDate(nextDay.getDate() + 1);

    const existing = await Session.findOne({
      doctorName,
      sessionType,
      sessionDate: { $gte: sessionDayStart, $lt: nextDay }
    });

    if (existing) {
      return res.status(400).json({ message: "A session for this doctor, type and date already exists" });
    }

    const session = new Session({
      doctorName,
      sessionType,
      sessionDate: sessionDayStart,
      isAvailable,
      specialNotice
    });

    await session.save();
    return res.status(201).json({ session });
  } catch (err) {
    console.error("addSession error:", err);
    if (err.code === 11000) {
      return res.status(400).json({ message: "Duplicate session (doctor+date+type) detected" });
    }
    return res.status(500).json({ message: "Server error" });
  }
};

// 3. GET by ID
const getSessionById = async (req, res, next) => {
  try {
    const id = req.params.id?.trim();
    if (!id) return res.status(400).json({ message: "Session id missing" });

    const session = await Session.findById(id);
    if (!session) return res.status(404).json({ message: "Session not found" });

    return res.status(200).json({ session });
  } catch (err) {
    console.error("getSessionById error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// 4. UPDATE session
const updateSession = async (req, res, next) => {
  try {
    const id = req.params.id?.trim();
    if (!id) return res.status(400).json({ message: "Session id missing" });

    const { doctorName, sessionType, sessionDate, isAvailable, specialNotice, status } = req.body;

    const session = await Session.findById(id);
    if (!session) return res.status(404).json({ message: "Session not found" });

    if (["Completed", "Cancelled"].includes(session.status)) {
      return res.status(400).json({ message: "Cannot edit a completed or cancelled session" });
    }

    if (doctorName && !ALLOWED_DOCTORS.includes(doctorName)) {
      return res.status(400).json({ message: "Invalid doctor selected" });
    }

    if (sessionType && !["Morning","Evening"].includes(sessionType)) {
      return res.status(400).json({ message: "Invalid sessionType" });
    }

    const effectiveDoctor = doctorName || session.doctorName;
    const effectiveType = sessionType || session.sessionType;

    const expected = DOCTOR_SLOT_MAP[effectiveDoctor];
    if (expected !== effectiveType) {
      return res.status(400).json({ message: `${effectiveDoctor} must be ${expected} session` });
    }

    let newSessionDate = session.sessionDate;
    if (sessionDate) {
      const dayStart = normalizeDateToDayStart(sessionDate);
      const today = new Date(); today.setHours(0,0,0,0);
      if (dayStart < today) return res.status(400).json({ message: "Session date must be today or future" });

      const nextDay = new Date(dayStart); nextDay.setDate(nextDay.getDate() + 1);
      const conflict = await Session.findOne({
        _id: { $ne: session._id },
        doctorName: effectiveDoctor,
        sessionType: effectiveType,
        sessionDate: { $gte: dayStart, $lt: nextDay }
      });
      if (conflict) return res.status(400).json({ message: "Another session exists for this doctor/date/type" });

      newSessionDate = dayStart;
    }

    session.doctorName = effectiveDoctor;
    session.sessionType = effectiveType;
    session.sessionDate = newSessionDate;
    if (typeof isAvailable === "boolean") session.isAvailable = isAvailable;
    if (typeof specialNotice === "string") session.specialNotice = specialNotice;
    if (typeof status === "string") session.status = status;

    await session.save();
    return res.status(200).json({ session });

  } catch (err) {
    console.error("updateSession error:", err);
    if (err.code === 11000) return res.status(400).json({ message: "Duplicate session (doctor+date+type)" });
    return res.status(500).json({ message: "Server error" });
  }
};

// 5. DELETE session
const deleteSession = async (req, res, next) => {
  try {
    const id = req.params.id?.trim();
    if (!id) return res.status(400).json({ message: "Session id missing" });

    const deleted = await Session.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Session not found" });

    return res.status(200).json({ message: "Session deleted successfully" });
  } catch (err) {
    console.error("deleteSession error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.getAllSessions = getAllSessions;
exports.addSession = addSession;
exports.getSessionById = getSessionById;
exports.updateSession = updateSession;
exports.deleteSession = deleteSession;