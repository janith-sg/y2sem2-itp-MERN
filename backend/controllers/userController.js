const User = require("../models/user");

// get all users
const getAllUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find();
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }

  if (!users) {
    return res.status(404).json({ message: "Users not found" });
  }
  return res.status(200).json({ users });
};

// add user
const addUsers = async (req, res, next) => {
  const {
    InvoiceId,
    PetOwnerName,
    gmail,
    PetName,
    serviceDetails,
    totalAmount,
    inventoryTotal,
    appointmentTotal,
    discounts,
    netAmount,
    paymentMethod,
    date,
  } = req.body;

  let user;
  try {
    user = new User({
      InvoiceId,
      PetOwnerName,
      gmail,
      PetName,
      serviceDetails,
      totalAmount,
      inventoryTotal,
      appointmentTotal,
      discounts,
      netAmount,
      paymentMethod,
      date,
    });
    await user.save();
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error during creation" });
  }

  if (!user) {
    return res.status(500).json({ message: "Unable to add user" });
  }
  return res.status(201).json({ user });
};

// get user by id
const getById = async (req, res, next) => {
  const id = req.params.id;
  let user;
  try {
    user = await User.findById(id);
  } catch (err) {
    console.log(err);
    return res.status(400).json({ message: "Invalid ID format" });
  }

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  return res.status(200).json({ user });
};

// update user
const updateUser = async (req, res, next) => {
  const id = req.params.id;
  const {
    InvoiceId,
    PetOwnerName,
    gmail,
    PetName,
    serviceDetails,
    totalAmount,
    inventoryTotal,
    appointmentTotal,
    discounts,
    netAmount,
    paymentMethod,
    date,
  } = req.body;

  let user;
  try {
    user = await User.findByIdAndUpdate(
      id,
      {
        InvoiceId,
        PetOwnerName,
        gmail,
        PetName,
        serviceDetails,
        totalAmount,
        inventoryTotal,
        appointmentTotal,
        discounts,
        netAmount,
        paymentMethod,
        date,
      },
      { new: true }
    );
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error during update" });
  }

  if (!user) {
    return res.status(404).json({ message: "Unable to update user details" });
  }
  return res.status(200).json({ user });
};

// delete user
const deleteUser = async (req, res, next) => {
  const id = req.params.id;
  let user;
  try {
    user = await User.findByIdAndDelete(id);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error during deletion" });
  }

  if (!user) {
    return res.status(404).json({ message: "Unable to delete user" });
  }
  return res.status(200).json({ message: "User deleted successfully" });
};

exports.getAllUsers = getAllUsers;
exports.addUsers = addUsers;
exports.getById = getById;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;