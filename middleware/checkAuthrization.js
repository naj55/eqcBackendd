const Admin = require("../model/Admin");
const jwt = require("jsonwebtoken");
require("dotenv").config();
/////////checkAuthrization for student
const checkAuthrization = (req, res, next) => {
  let decoder = res.locals.decoder;
  const email = "aoleqc@gmail.com";
  Admin.findOne({ email: email })
    .then((foundedUser) => {
      const id = foundedUser._id;
      useridlogedIn = decoder.result._id;
      if (id == useridlogedIn) {
        next();
        return;
      } else {
        res.json({ msg: "sorry you are not authorized" });
      }
    })
    .catch((err) => {
      res.status(401).json(err);
    });
};

module.exports = checkAuthrization;
