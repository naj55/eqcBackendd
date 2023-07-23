//This is for only Delete and Edit
const Job = require("../model/Job1");
const jwt = require("jsonwebtoken");
require("dotenv").config();
/////////checkAuthrization for student
const checkHrAuthrization = (req, res, next) => {
  let decoder = res.locals.decoder;
  console.log(decoder);
  const Jid = req.params.Jid;
  Job.findById(Jid)
    .then((foundedJob) => {
      console.log(foundedJob);
      const id = foundedJob.Hr;
      useridlogedIn = decoder.result._id;
      if (id == useridlogedIn) {
        console.log("you are authorized");
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

module.exports = checkHrAuthrization;
