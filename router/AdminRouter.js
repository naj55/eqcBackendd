const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
require("dotenv").config();
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const salt = Number(process.env.salt);
const jwt = require("jsonwebtoken");

//Admin Controller
const AdminController = require("../controller/AdminController");
//middeleware
const checkToken = require("../middleware/checkToken");
const checkAuthrization = require("../middleware/checkAuthrization");

//admin company CRUD router
//router.post("/addtheCompany", AdminController.postAddCompany);
router.post(
  "/addCompany",
  checkToken,
  checkAuthrization,
  AdminController.postAddCompany
);
router.get(
  "/listCompanies",
  checkToken,
  checkAuthrization,
  AdminController.listCompanies
);

router.delete(
  "/removeCompany/:Cid",
  checkToken,
  checkAuthrization,
  AdminController.removeCompany
);

router.patch(
  "/editCompany/:Cid",
  checkToken,
  checkAuthrization,
  AdminController.editCompany
);

//admin Hr CRUD router
router.post("/addHr", checkToken, checkAuthrization, AdminController.postAddHr);
router.get("/listHr", checkToken, checkAuthrization, AdminController.listHr);
router.delete(
  "/removeHr/:Hid",
  checkToken,
  checkAuthrization,
  AdminController.removeHr
);
router.patch(
  "/editHr/:Hid",
  checkToken,
  checkAuthrization,
  AdminController.editHr
);
router.get(
  "/viewHr/:Hid",
  checkToken,
  checkAuthrization,
  AdminController.viewHr
);

//admin Job CRUD router
router.post(
  "/addJob",
  checkToken,
  checkAuthrization,
  AdminController.postAddJob
);
router.get("/listJob", checkToken, checkAuthrization, AdminController.listJobs);
router.get(
  "/availablelistJobs",
  checkToken,
  checkAuthrization,
  AdminController.availablelistJobs
);
router.delete(
  "/removeJob/:Jid",
  checkToken,
  checkAuthrization,
  AdminController.removeJob
);
router.patch(
  "/editJob/:Jid",
  checkToken,
  checkAuthrization,
  AdminController.editJob
);

//admin Graduated CRUD router removeGraduated
router.post(
  "/addGraduated",
  checkToken,
  checkAuthrization,
  AdminController.postAddGraduated
);
router.get(
  "/listGraduated",
  checkToken,
  checkAuthrization,
  AdminController.listGraduated
);
router.delete(
  "/removeGraduated/:Gid",
  checkToken,
  checkAuthrization,
  AdminController.removeGraduated
);
router.patch(
  "/editGraduated/:Gid",
  checkToken,
  checkAuthrization,
  AdminController.editGraduated
);
router.patch(
  "/StateCandidate/:Gid",
  checkToken,
  checkAuthrization,
  AdminController.StateCandidate
);
router.patch(
  "/StateRejected/:Gid",
  checkToken,
  checkAuthrization,
  AdminController.StateRejected
);
//admin creation and login
router.post("/createOnce", AdminController.createOnce);
router.post("/adminlogin", AdminController.adminlogin);
router.get("/ViewCompany/:Cid", AdminController.ViewCompany);

module.exports = router;
