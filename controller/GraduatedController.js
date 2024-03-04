const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const salt = Number(process.env.salt);
const jwt = require("jsonwebtoken");

///MODELS
const Company = require("../model/Company");
const Hr = require("../model/Hr");
const Job = require("../model/Job1");
const Graduated = require("../model/GraduatedStudent");
const Application = require("../model/application");
const Section = require("../model/Section");

//GraduatedSignUp
exports.GraduatedSignUp = async (req, res) => {
  const name = req.body.name;
  const email = req.body.email;
  const phone = req.body.phone;
  const NId = req.body.NId;
  const password = req.body.password;
  const major = req.body.major;
  const address = req.body.address;
  const hash = await bcrypt.hash(password, salt);

  const NewGraduated = new Graduated({
    name: name,
    email: email,
    phone: phone,
    NId: NId,
    password: hash,
    major: major,
    address: address,
  });
  NewGraduated.save()
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      res.status(401).json(err);
    });
};

// GraduatedLogin
exports.GraduatedLogin = (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  Graduated.findOne({ email: email })
    .select("+password")
    .then(async (result) => {
      const hashedPass = result.password;
      const compare = await bcrypt.compare(password, hashedPass);
      console.log(compare);
      if (compare) {
        const token = jwt.sign({ result }, process.env.secret, {
          expiresIn: "1d",
        });
        console.log("the token is");
        console.log(token);
        res.json({ token: token });
      } ///end if
    })
    .catch((err) => {
      res.status(401).json(err);
    });
};
//job list
exports.listJobs = (req, res) => {
  const today = new Date();
  const availableJobs = [];
  Job.find()
    .populate("company")
    .then((result) => {
      console.log(result);
      for (r of result) {
        if (today <= r.edate) {
          availableJobs.push(r);
        }
      }
      console.log("e date is");
      console.log(availableJobs);
      res.status(200).json(availableJobs);
      return;
    })
    .catch((err) => {
      res.status(401).json(err);
    });
};

//applyJob
exports.applyJob = (req, res) => {
  const Jid = req.params.Jid;
  const GId = res.locals.decoder.result._id;
  console.log(GId);
  console.log(Jid);
  const newApplication = new Application({
    Graduated: GId,
    Job: Jid,
    status: "wait",
  });
  newApplication
    .save()
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      res.status(401).json(err);
    });
};
//list for all job that has been applyed
exports.applyedJob = async (req, res) => {
  const GId = res.locals.decoder.result._id;
  Application.find({ Graduated: GId })
    .populate({
      path: "Job",
      select: "jobname",
      populate: {
        path: "company",
        select: "companyName",
      },
    })
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      res.status(401).json(err);
    });
};
//create section in cv
exports.educationSection = (req, res) => {
  const GId = res.locals.decoder.result._id;
  const qualification = req.body.qualification;
  const from = req.body.from;
  const gpa = req.body.gpa;
  const sartDate = req.body.sartDate;
  const endDate = req.body.endDate;

  const education = new Section({
    title: "Education",
    qualification: qualification,
    from: from,
    gpa: gpa,
    sartDate: sartDate,
    endDate: endDate,
    graduated: GId,
  });
  education
    .save()
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      res.status(401).json(err);
    });
};
exports.experienceSection = (req, res) => {
  const GId = res.locals.decoder.result._id;
  const preJob = req.body.preJob;
  const from = req.body.from;
  const sartDate = req.body.sartDate;
  const endDate = req.body.endDate;

  const experience = new Section({
    title: "Experience",
    preJob: preJob,
    from: from,
    sartDate: sartDate,
    endDate: endDate,
    graduated: GId,
  });
  experience
    .save()
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      res.status(401).json(err);
    });
};

exports.courseSection = (req, res) => {
  const GId = res.locals.decoder.result._id;
  const course = req.body.course;
  const from = req.body.from;
  const sartDate = req.body.sartDate;
  const endDate = req.body.endDate;

  const newcourse = new Section({
    title: "Course",
    course: course,
    from: from,
    sartDate: sartDate,
    endDate: endDate,
    graduated: GId,
  });
  newcourse
    .save()
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      res.status(401).json(err);
    });
};

exports.skillsSection = (req, res) => {
  const GId = res.locals.decoder.result._id;
  const language = req.body.language;
  const level = req.body.level;
  const skills = req.body.skills;

  const newSkills = new Section({
    title: "Skills",
    language: language,
    level: level,
    skills: skills,
    graduated: GId,
  });
  newSkills
    .save()
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      res.status(401).json(err);
    });
};
exports.volunteeringSection = (req, res) => {
  const from = req.body.from;
  const hours = req.body.hours;
  const GId = res.locals.decoder.result._id;
  const volunteering = new Section({
    title: "volunteering",
    from: from,
    hours: hours,
    graduated: GId,
  });
  volunteering
    .save()
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      res.status(401).json(err);
    });
};
//Graduated profile
exports.profile = async (req, res) => {};
//Graduated cv
exports.createCv = (req, res) => {
  const GId = res.locals.decoder.result._id;
  Section.find({ graduated: GId })
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      res.status(401).json(err);
    });
};

//hr job List job
exports.ViewJob = (req, res) => {
  const JId = req.params.Jid;
  Job.findById(JId)
    .populate("company")
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      res.status(401).json(err);
    });
};

exports.ViewGraduate = (req, res) => {
  const Gid = res.locals.decoder.result._id;
  console.log(Gid);
  console.log("the graduated is ");
  Graduated.findById(Gid)
    .then((result) => {
      console.log(result);
      res.status(200).json(result);
    })
    .catch((err) => {
      res.status(401).json(err);
    });
};
