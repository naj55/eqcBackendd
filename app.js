const express = require("express");
const cors = require("cors");
const app = express();
const mongoose = require("mongoose");
require("dotenv").config();
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const salt = Number(process.env.salt);
const jwt = require("jsonwebtoken");
const colors = require("colors"); // تأكد من تثبيت مكتبة colors إذا لم تكن مثبتة

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// //connect to DB
const connectDB = async () => {
  try {
    // خيارات الاتصال بقاعدة البيانات
    const conn = await mongoose.connect(process.env.db_url);
    console.log(`✅ MongoDB Connected: ${conn.connection.name}`.green.bold);
  } catch (err) {
    console.error(`❌ Error: ${err.message}`.red.bold);
    // إنهاء العملية مع فشل
    process.exit(1);
  }
};
//test the server
connectDB();
app.get("/", (req, res) => {
  res.send("hello world from najla server");
});

const AdminRouter = require("./router/AdminRouter");
app.use("/admin", AdminRouter);

const HrRouter = require("./router/HrRouter");
app.use("/hr", HrRouter);

const GraduatedRoute = require("./router/GraduatedRoute");
app.use("/graduated", GraduatedRoute);

//server
app.listen(8000, () => {
  console.log(`💡 server is running on port 8000`.white.bold);
  console.log("🧿 http://localhost:8000".blue.bold);
  console.log("🚀 Ready to go!".yellow.bold);
});
