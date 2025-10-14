// utils/getNextSeq.js
const Counter = require("../models/counterModel");

/**
 * Atomically increments and returns the next sequence number for a named counter.
 * Safe under concurrency.
 */
async function getNextSeq(name) {
  const ret = await Counter.findOneAndUpdate(
    { _id: name },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return ret.seq;
}

module.exports = { getNextSeq };