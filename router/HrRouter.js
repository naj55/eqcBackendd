const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
require("dotenv").config();
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const salt = Number(process.env.salt);
const jwt = require("jsonwebtoken");

//Hr Controller
const HrController = require("../controller/HrController");

//middeleware
const checkToken = require("../middleware/checkToken");
const checkHrAuthrization = require("../middleware/checkHrAuthrization");
const authMiddleware = require("../middleware/authMiddleware");

//Hr Login
router.post("/hrlogin", HrController.Hrlogin);
router.post(
  "/verifyOtpAndChangePassword",
  HrController.verifyOtpAndChangePassword
);

//Hr Job CRUD router
http: router.post("/addJob", checkToken, HrController.postAddJob);
router.get("/listJob", checkToken, HrController.listJobs);
router.delete(
  "/removeJob/:Jid",
  checkToken,
  checkHrAuthrization,
  HrController.removeJob
);
router.patch(
  "/editJob/:Jid",
  checkToken,
  checkHrAuthrization,
  HrController.editJob
);
router.get("/ViewJob/:id", checkToken, HrController.ViewJob);
router.get("/viewCv/:Gid", checkToken, HrController.ViewCv);
router.get("/listApplication/:jid", checkToken, HrController.listApplication);
router.get("/listJobApplication", checkToken, HrController.listJobApplication);
router.get("/listCandidate", checkToken, HrController.listCandidate);
router.patch("/StateRejected/:Aid", HrController.StateRejected);
router.patch("/StateAccept/:Aid", HrController.StateAccept);
router.patch("/StateCandidate/:Aid", HrController.StateCandidate);
router.post("/hrForgetPassLink", HrController.hrForgetPassLink);
router.post("/hrResetPassword", HrController.hrResetPassword);
module.exports = router;
