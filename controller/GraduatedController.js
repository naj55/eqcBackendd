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
exports.GraduatedInfo = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  const decoded = jwt.decode(token);
  const GId = decoded.appid;

  const name = req.body.name;
  const email = req.body.email;
  const phone = req.body.phone;
  const NId = req.body.NId;
  const address = req.body.address;

  const NewGraduated = new Graduated({
    name: name,
    email: email,
    phone: phone,
    NId: NId,
    address: address,
    graduated: GId,
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
      if (compare) {
        const token = jwt.sign({ result }, process.env.secret, {
          expiresIn: "1d",
        });
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
  Job.find({ status: "accepted" })
    .populate("company")
    .then((result) => {
      for (r of result) {
        if (today <= r.edate) {
          availableJobs.push(r);
        }
      }
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
  const token = req.headers["authorization"]?.split(" ")[1];
  const decoded = jwt.decode(token);
  const GId = decoded.appid;
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
  const token = req.headers["authorization"]?.split(" ")[1];
  const decoded = jwt.decode(token);
  const GId = decoded.appid;
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
  const token = req.headers["authorization"]?.split(" ")[1];
  const decoded = jwt.decode(token);
  const GId = decoded.appid;
  const qualification = req.body.qualification;
  const from = req.body.from;
  const major = req.body.major;
  const gpa = req.body.gpa;
  const sartDate = req.body.sartDate;
  const endDate = req.body.endDate;

  const education = new Section({
    title: "Education",
    qualification: qualification,
    major: major,
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
  const token = req.headers["authorization"]?.split(" ")[1];
  const decoded = jwt.decode(token);
  const GId = decoded.appid;
  const preJob = req.body.jobTitle;
  const from = req.body.employer;
  const sartDate = req.body.startDate;
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
  const token = req.headers["authorization"]?.split(" ")[1];
  const decoded = jwt.decode(token);
  const GId = decoded.appid;

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
  const token = req.headers["authorization"]?.split(" ")[1];
  const decoded = jwt.decode(token);
  const GId = decoded.appid;

  const language = req.body.language;
  const level = req.body.level;
  const skills = req.body.description;

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
  const token = req.headers["authorization"]?.split(" ")[1];
  const decoded = jwt.decode(token);
  const GId = decoded.appid;

  const from = req.body.organization;
  const hours = req.body.hours;

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
  const token = req.headers["authorization"]?.split(" ")[1];
  const decoded = jwt.decode(token);
  const GId = decoded.appid;
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
  const token = req.headers["authorization"]?.split(" ")[1];
  const decoded = jwt.decode(token);
  const Gemail = decoded.unique_name;
  Graduated.findOne({ email: Gemail })
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      res.status(401).json(err);
    });
};

exports.getEducation = (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  const decoded = jwt.decode(token);
  const GId = decoded.appid;
  Section.find({ graduated: GId, title: "Education" })
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      res.status(401).json(err);
    });
};

exports.getExperience = (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  const decoded = jwt.decode(token);
  const GId = decoded.appid;
  Section.find({ graduated: GId, title: "Experience" })
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      res.status(401).json(err);
    });
};

exports.getSkills = (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  const decoded = jwt.decode(token);
  const GId = decoded.appid;
  Section.find({ graduated: GId, title: "Skills" })
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      res.status(401).json(err);
    });
};

exports.getVolunteering = (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  const decoded = jwt.decode(token);
  const GId = decoded.appid;
  Section.find({ graduated: GId, title: "volunteering" })
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      res.status(401).json(err);
    });
};
exports.getCourse = (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  const decoded = jwt.decode(token);
  const GId = decoded.appid;
  Section.find({ graduated: GId, title: "Course" })
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      res.status(401).json(err);
    });
};

exports.getApplication = (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  const decoded = jwt.decode(token);
  const GId = decoded.appid;
  Application.find({ graduated: GId })
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      res.status(401).json(err);
    });
};

exports.authenticateToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.sendStatus(401);
  res.json({ token: token });
};
