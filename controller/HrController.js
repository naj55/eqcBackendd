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

//Hr jobs add job
exports.postAddJob = (req, res) => {
  const D = res.locals.decoder;
  const HId = res.locals.decoder.result._id;

  NameInput = req.body.jobname;
  sdateInput = req.body.sdate;
  edateInput = req.body.edate;
  departmentInput = req.body.department;
  skillsInput = req.body.skills;
  notesInput = req.body.notes;
  jobRequirmentInput = req.body.jobRequirment;
  companyInput = req.body.company;
  HrInput = HId;

  const newJob = new Job({
    jobname: NameInput,
    sdate: sdateInput,
    edate: edateInput,
    department: departmentInput,
    skills: skillsInput,
    notes: notesInput,
    jobRequirment: jobRequirmentInput,
    company: companyInput,
    Hr: HrInput,
  });
  newJob
    .save()
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      res.status(401).json(err);
    });
};

//hr job List job
exports.listJobs = (req, res) => {
  const HId = res.locals.decoder.result._id;
  Job.findOne({ Hr: HId })
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      res.status(401).json(err);
    });
};

//hr active job List job
exports.listJobs = (req, res) => {
  const HId = res.locals.decoder.result._id;
  Job.findOne({ Hr: HId })
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      res.status(401).json(err);
    });
};

//admin job delete job
exports.removeJob = (req, res) => {
  const Jid = req.params.Jid;
  Job.findByIdAndDelete(Jid)
    .then(() => {
      res.status(200).json("job has been deleted");
    })
    .catch((err) => {
      res.status(401).json(err);
    });
};

//admin job update job
exports.editJob = (req, res) => {
  const Jid = req.params.Jid;
  NameInput = req.body.jobname;
  sdateInput = req.body.sdate;
  edateInput = req.body.edate;
  departmentInput = req.body.department;
  skillsInput = req.body.skills;
  notesInput = req.body.notes;
  jobRequirmentInput = req.body.jobRequirment;
  companyInput = req.body.company;
  HrInput = req.body.Hr;

  Job.findById(Jid)
    .then((foundedJob) => {
      foundedJob.jobname = NameInput;
      foundedJob.sdate = sdateInput;
      foundedJob.edate = edateInput;
      foundedJob.department = departmentInput;
      foundedJob.skills = skillsInput;
      foundedJob.notes = notesInput;
      foundedJob.jobRequirment = jobRequirmentInput;
      foundedJob.company = companyInput;
      foundedJob.Hr = HrInput;

      foundedJob
        .save()
        .then((result) => {
          res.status(200).json(result);
        })
        .catch((err) => {
          res.status(401).json(err);
        });
    })
    .catch((err) => {
      res.status(401).json(err);
    });
};

exports.Hrlogin = async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  Hr.findOne({ email: email })
    .select("+password")
    .then(async (result) => {
      const hashedPass = result.password;
      const compare = await bcrypt.compare(password, hashedPass);
      console.log(compare);
      if (compare) {
        const token = jwt.sign({ result }, process.env.secret, {
          expiresIn: "1h",
        });
        res.json({ token: token });
      } ///end if
    })
    .catch((err) => {
      res.status(401).json(err);
    });
};
//view listApplication of graduated
exports.listApplication = (req, res) => {
  Application.find({ status: "candidate" })
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      res.status(401).json(err);
    });
};

//change state of graduated to candidate
exports.StateRejected = (req, res) => {
  const Gid = req.params.Gid;
  Application.findOne({ Graduated: Gid })
    .then((foundedApp) => {
      console.log(foundedApp);
      foundedApp.status = "rejected";
      foundedApp.save().then((result) => {
        console.log("the result is");
        console.log(result);
        res.status(200).json(result);
      });
    })
    .catch((err) => {
      res.status(401).json(err);
    });
};

//change state of graduated to candidate
exports.StateAccept = (req, res) => {
  const Gid = req.params.Gid;
  Application.findOne({ Graduated: Gid })
    .then((foundedApp) => {
      console.log(foundedApp);
      foundedApp.status = "accept";
      foundedApp.save().then((result) => {
        console.log("the result is");
        console.log(result);
        res.status(200).json(result);
      });
    })
    .catch((err) => {
      res.status(401).json(err);
    });
};

//view graduated cv
exports.ViewCv = (req, res) => {
  const GId = req.params.Gid;
  console.log(GId);
  Section.find({ graduated: GId })
    .then((result) => {
      console.log(result);
      res.status(200).json(result);
    })
    .catch((err) => {
      res.status(401).json(err);
    });
};
