const mongoose = require("mongoose");
const schema = mongoose.Schema;
const uniqueValidatore = require("mongoose-unique-validator");
const { v4: uuidv4 } = require("uuid");

const GraduatedSchema = new schema(
  {
    name: { type: String },
    email: { type: String, unique: true },
    phone: { type: String },
    NId: { type: String },
    address: { type: String },
    graduated: {
      type: mongoose.Schema.Types.String,
    },
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
