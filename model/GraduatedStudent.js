const mongoose = require("mongoose");
const schema = mongoose.Schema;
const uniqueValidatore = require("mongoose-unique-validator");

const GraduatedSchema = new schema(
  {
    name: { type: String, require: true },
    email: { type: String, unique: true },
    phone: { type: String, required: true, unique: true },
    NId: { type: String, required: true, unique: true },
    password: {
      type: String,
      select: false,
    },
    major: { type: String, require: true },
    address: { type: String, require: true },
  },
  {
    timestamps: true,
  }
);

const Graduated = mongoose.model("Graduated", GraduatedSchema);
module.exports = Graduated;
