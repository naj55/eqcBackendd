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

  HrController.removeJob
);
router.patch(
  "/editJob/:Jid",
  checkToken,
  checkHrAuthrization,
  HrController.editJob
);
router.get(
  "/ViewJob/:id",
  checkToken,
  checkHrAuthrization,
  HrController.ViewJob
);
router.get(
  "/viewCv/:Gid",
  checkToken,
  checkHrAuthrization,
  HrController.ViewCv
);
router.get(
  "/listApplication/:jid",
  checkToken,
  checkHrAuthrization,
  HrController.listApplication
);
router.get(
  "/listJobApplication",
  checkToken,
  checkHrAuthrization,
  HrController.listJobApplication
);
router.get(
  "/listCandidate",
  checkToken,
  checkHrAuthrization,
  HrController.listCandidate
);
router.patch(
  "/StateRejected/:Aid",
  checkHrAuthrization,
  checkToken,
  HrController.StateRejected
);
router.patch(
  "/StateAccept/:Aid",
  checkToken,
  checkHrAuthrization,
  HrController.StateAccept
);
router.patch(
  "/StateCandidate/:Aid",
  checkToken,
  checkHrAuthrization,
  HrController.StateCandidate
);
router.post("/hrForgetPassLink", HrController.hrForgetPassLink);
router.post("/hrResetPassword", HrController.hrResetPassword);
module.exports = router;
