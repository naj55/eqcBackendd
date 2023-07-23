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

//Hr Login
router.post("/hrlogin", HrController.Hrlogin);
//Hr Job CRUD router
router.post("/addJob", checkToken, HrController.postAddJob);
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

router.get("/viewCv/:Gid", checkToken, HrController.ViewCv);
router.get("/listApplication", checkToken, HrController.listApplication);
router.patch("/StateRejected/:Gid", checkToken, HrController.StateRejected);
router.patch("/StateAccept/:Gid", checkToken, HrController.StateAccept);

module.exports = router;
