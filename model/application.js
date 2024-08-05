const mongoose = require("mongoose");
const schema = mongoose.Schema;
const uniqueValidatore = require("mongoose-unique-validator");

const ApplicationSchema = new schema(
  {
    // GraduatedId: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Graduated",
    // },
    Graduated: {
      type: mongoose.Schema.Types.String,
      ref: "Graduated",
    },
    Job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
    },
    status: { type: String, require: true },
  },
  {
    timestamps: true,
  }
);

const Application = mongoose.model("Application", ApplicationSchema);
module.exports = Application;
