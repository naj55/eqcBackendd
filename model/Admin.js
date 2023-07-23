const mongoose = require("mongoose");
const schema = mongoose.Schema;
const uniqueValidatore = require("mongoose-unique-validator");

const AdminSchema = new schema(
  {
    name: { type: String, require: true, unique: true },
    email: { type: String, unique: true },
    password: {
      type: String,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

const Admin = mongoose.model("Admin", AdminSchema);
module.exports = Admin;
