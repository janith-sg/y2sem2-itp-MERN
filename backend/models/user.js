const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
    InvoiceId: {
        type: Number,
        required: true,
    },
    PetOwnerName: {
        type: String,
        required: true,
    },
    gmail: {
        type: String,
        required: true,
        match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"]
    },
    PetName: {
        type: String,
        required: true,
    },
    serviceDetails: {
        type: String,
        required: true,
    },
    totalAmount: {
        type: Number,
        required: true,
    },
    inventoryTotal: {
        type: Number,
    },
    appointmentTotal: {
        type: Number,
    },
    discounts: {
        type: Number,
    },
    netAmount: {
        type: Number,
        required: true,
    },
    paymentMethod: { 
        type: String, 
        enum: ["Cash", "Card", "Online"],
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);