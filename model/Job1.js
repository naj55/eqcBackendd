const mongoose = require("mongoose");
const schema = mongoose.Schema;
const JobSchema = new schema(
  {
    jobname: { type: String },
    sdate: {
      type: Date,
      default: Date.now,
    },
    edate: {
      type: Date,
      default: Date.now,
    },
    department: { type: String },
    description: { type: String },
    skills: { type: String },
    notes: { type: String },
    jobRequirment: { type: String },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
    },
    Hr: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hr",
    },
  },
  {
    timestamps: true,
  }
);

const Job = mongoose.model("Job", JobSchema);
module.exports = Job;
