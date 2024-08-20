const mongoose = require("mongoose");
const schema = mongoose.Schema;
const uniqueValidatore = require("mongoose-unique-validator");

const SectionSchema = new schema(
  {
    title: {
      type: String,
      require: true,
    },
    qualification: {
      type: String,
    },
    aboutMe: {
      type: String,
    },
    major: {
      type: String,
    },
    preJob: {
      type: String,
    },
    course: {
      type: String,
    },
    from: {
      type: String,
    },
    gpa: {
      type: String,
    },
    sartDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    hours: {
      type: String,
    },
    Describtion: {
      type: Number,
    },
    language: {
      type: String,
    },
    level: {
      type: String,
    },
    skills: {
      type: String,
    },
    graduated: {
      type: mongoose.Schema.Types.String,
      ref: "Graduated",
    },
  },
  {
    timestamps: true,
  }
);

const Section = mongoose.model("Section", SectionSchema);
module.exports = Section;
