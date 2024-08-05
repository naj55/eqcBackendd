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
router.post("/GraduatedInfo", GraduatedController.GraduatedInfo);
//Graduated Login
router.post("/GraduatedLogin", GraduatedController.GraduatedLogin);
// //Hr Job CRUD router
router.get("/listJobs", GraduatedController.listJobs);
router.get("/applyJob/:Jid", GraduatedController.applyJob);
router.get("/applyedJob", GraduatedController.applyedJob);
//create cv
router.post("/education", GraduatedController.educationSection);
router.post("/experience", GraduatedController.experienceSection);
router.post("/course", GraduatedController.courseSection);
router.post("/skills", GraduatedController.skillsSection);
router.post(
  "/volunteering",

  GraduatedController.volunteeringSection
);
router.get("/ViewJob/:Jid", GraduatedController.ViewJob);
router.get("/createCv", GraduatedController.createCv);
router.get("/ViewGraduate", GraduatedController.ViewGraduate);

router.get("/getEducation", GraduatedController.getEducation);
router.get("/getExperience", GraduatedController.getExperience);
router.get("/getCourse", GraduatedController.getCourse);
router.get("/getSkills", GraduatedController.getSkills);
router.get("/getVolunteering", GraduatedController.getVolunteering);

router.get("/authenticateToken", GraduatedController.authenticateToken);

module.exports = router;
