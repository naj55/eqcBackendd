const mongoose = require("mongoose");
const schema = mongoose.Schema;
const uniqueValidatore = require("mongoose-unique-validator");
const { v4: uuidv4 } = require("uuid");

const GraduatedSchema = new schema(
  {
    name: { type: String },
    email: { type: String, unique: true },
    phone: { type: String, unique: true },
    NId: { type: String, unique: true },
    address: { type: String },
    major: { type: String },
    password: { type: String },
    major: { type: String },
    graduated: {
      type: mongoose.Schema.Types.String,
    },
    resetCode: String,
    resetCodeExpiration: Date,
    isDeleted: { type: Boolean, require: true, default: false },
    otp: {
      type: String,
    },
    otpExpires: {
      type: Date,
    },
  },

  {
    timestamps: true,
  }
);

const Graduated = mongoose.model("Graduated", GraduatedSchema);
module.exports = Graduated;
