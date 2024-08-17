const mongoose = require("mongoose");
const schema = mongoose.Schema;
const uniqueValidatore = require("mongoose-unique-validator");
const { v4: uuidv4 } = require("uuid");

const GraduatedSchema = new schema(
  {
    name: { type: String, require: true },
    email: { type: String, unique: true },
    phone: { type: String, required: true, unique: true },
    NId: { type: String, required: true, unique: true },
    address: { type: String, require: true },
    graduated: {
      type: mongoose.Schema.Types.String,
    },
    isDeleted: { type: Boolean, require: true },
  },

  {
    timestamps: true,
  }
);

const Graduated = mongoose.model("Graduated", GraduatedSchema);
module.exports = Graduated;
