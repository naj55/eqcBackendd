const express = require("express");
const app = express();
const mongoose = require("mongoose");
require("dotenv").config();
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const salt = Number(process.env.salt);
const jwt = require("jsonwebtoken");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//connect to DB
mongoose
  .connect(process.env.db_url)
  .then(() => {
    console.log("db working");
  })
  .catch(() => {
    console.log("db not working");
  });

//test the server
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
  console.log("Server is listening on port 8000");
});
