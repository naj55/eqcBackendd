const mongoose = require("mongoose");
const schema = mongoose.Schema;
const uniqueValidatore = require("mongoose-unique-validator");

const HrSchema = new schema(
  {
    name: { type: String, require: true, unique: true },
    email: { type: String, unique: true },
    phone: { type: String, required: true, unique: true },
    password: {
      type: String,
      select: false,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
    },
    jobs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Hr = mongoose.model("Hr", HrSchema);
module.exports = Hr;
