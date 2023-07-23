const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
require("dotenv").config();
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const salt = Number(process.env.salt);
const jwt = require("jsonwebtoken");

//Hr Controller
const GraduatedController = require("../controller/GraduatedController");

//middeleware
const checkToken = require("../middleware/checkToken");

//Graduated SignUp
router.post("/GraduatedSignUp", GraduatedController.GraduatedSignUp);
//Graduated Login
router.post("/GraduatedLogin", GraduatedController.GraduatedLogin);
// //Hr Job CRUD router
router.get("/listJobs", checkToken, GraduatedController.listJobs);
router.patch("/applyJob/:Jid", checkToken, GraduatedController.applyJob);
router.get("/applyedJob", checkToken, GraduatedController.applyedJob);
//create cv
router.post("/education", checkToken, GraduatedController.educationSection);
router.post("/experience", checkToken, GraduatedController.experienceSection);
router.post("/course", checkToken, GraduatedController.courseSection);
router.post("/skills", checkToken, GraduatedController.skillsSection);
router.post(
  "/volunteering",
  checkToken,
  GraduatedController.volunteeringSection
);
router.post("/createCv", checkToken, GraduatedController.createCv);

module.exports = router;
