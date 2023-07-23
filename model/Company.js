const mongoose = require("mongoose");
const schema = mongoose.Schema;
const uniqueValidatore = require("mongoose-unique-validator");

const CompanySchema = new schema(
  {
    companyName: { type: String, require: true, unique: true },
    email: { type: String, unique: true },
    phone: { type: Number, required: true, unique: true },
    address: { type: String, require: true },
    companyBusiness: String,
    companySize: String,
    companyAdded: String,
    Hrs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Hr",
      },
    ],
    jobs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "job",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Company = mongoose.model("Company", CompanySchema);
module.exports = Company;
