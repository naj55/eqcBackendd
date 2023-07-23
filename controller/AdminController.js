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
const Admin = require("../model/Admin");
const Application = require("../model/application");

//admin create and login
exports.createOnce = async (req, res) => {
  const name = "EqcAdmin";
  const password = "AdminSecret";
  const email = "eqcAdmin@aol.edu.sa";
  const hash = await bcrypt.hash(password, salt);
  const admin = new Admin({
    name: name,
    email: email,
    password: hash,
  });
  admin
    .save()
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      res.status(401).json(err);
    });
};

//admin login
exports.adminlogin = async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  Admin.findOne({ email: email })
    .select("+password")
    .then(async (result) => {
      const hashedPass = result.password;
      const compare = await bcrypt.compare(password, hashedPass);
      console.log(compare);
      if (compare) {
        const token = jwt.sign({ result }, process.env.secret, {
          expiresIn: "1h",
        });
        console.log(token);
        console.log("hiiiii");
        res.json({ token: token });
      } ///end if
    })
    .catch((err) => {
      res.status(401).json(err);
    });
};

//admin company CRUD controller
//admin company add Company
exports.postAddCompany = (req, res) => {
  companyNameInput = req.body.companyName;
  emailInput = req.body.email;
  phoneInput = req.body.phone;
  addressInput = req.body.address;
  companyBusinessInput = req.body.companyBusiness;
  companySizeInput = req.body.companySize;
  companyAddedInput = req.body.companyAdded;

  const newCompany = new Company({
    companyName: companyNameInput,
    email: emailInput,
    phone: phoneInput,
    address: addressInput,
    companyBusiness: companyBusinessInput,
    companySize: companySizeInput,
    companyAdded: companyAddedInput,
  });
  newCompany
    .save()
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      res.status(401).json(err);
    });
};

//admin company List Company
exports.listCompanies = (req, res) => {
  Company.find()
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      res.status(401).json(err);
    });
};

//admin company delete Company
exports.removeCompany = (req, res) => {
  const Cid = req.params.Cid;
  Company.findByIdAndDelete(Cid)
    .then(() => {
      res.status(200).json("company deleted");
    })
    .catch((err) => {
      res.status(401).json(err);
    });
};

//admin company update Company
exports.editCompany = (req, res) => {
  const Cid = req.params.Cid;
  companyNameInput = req.body.companyName;
  emailInput = req.body.email;
  phoneInput = req.body.phone;
  addressInput = req.body.address;
  companyBusinessInput = req.body.companyBusiness;
  companySizeInput = req.body.companySize;
  companyAddedInput = req.body.companyAdded;

  Company.findById(Cid)
    .then((foundedCompany) => {
      foundedCompany.companyName = companyNameInput;
      foundedCompany.email = emailInput;
      foundedCompany.phone = phoneInput;
      foundedCompany.address = addressInput;
      foundedCompany.companyBusiness = companyBusinessInput;
      foundedCompany.companySize = companySizeInput;
      foundedCompany.companyAdded = companyAddedInput;

      foundedCompany
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

//admin HR CRUD controller
//admin HR add hr
exports.postAddHr = async (req, res) => {
  NameInput = req.body.name;
  emailInput = req.body.email;
  phoneInput = req.body.phone;
  passwordInput = req.body.password;
  const hash = await bcrypt.hash(passwordInput, salt);
  companyInput = req.body.company;

  const newHr = new Hr({
    name: NameInput,
    email: emailInput,
    phone: phoneInput,
    password: hash,
    company: companyInput,
  });
  newHr
    .save()
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      res.status(401).json(err);
    });
};

//admin Hr List
exports.listHr = (req, res) => {
  Hr.find()
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      res.status(401).json(err);
    });
};

//admin HR delete Hr
exports.removeHr = (req, res) => {
  const Hid = req.params.Hid;
  Hr.findByIdAndDelete(Hid)
    .then(() => {
      res.status(200).json("Hr has been deleted");
    })
    .catch((err) => {
      res.status(401).json(err);
    });
};

//admin Hr update Hr
exports.editHr = (req, res) => {
  const Hid = req.params.Hid;
  NameInput = req.body.name;
  emailInput = req.body.email;
  phoneInput = req.body.phone;
  passwordInput = req.body.password;
  companyInput = req.body.company;

  Hr.findById(Hid)
    .then((foundedHid) => {
      foundedHid.name = NameInput;
      foundedHid.email = emailInput;
      foundedHid.phone = phoneInput;
      foundedHid.password = passwordInput;
      foundedHid.company = companyInput;

      foundedHid
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

//admin jobs CRUD controller
//admin jobs add job
exports.postAddJob = (req, res) => {
  NameInput = req.body.jobname;
  sdateInput = req.body.sdate;
  edateInput = req.body.edate;
  departmentInput = req.body.department;
  skillsInput = req.body.skills;
  notesInput = req.body.notes;
  jobRequirmentInput = req.body.jobRequirment;
  companyInput = req.body.company;
  HrInput = req.body.Hr;

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

//admin job List job
exports.listJobs = (req, res) => {
  Job.find()
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      res.status(401).json(err);
    });
};
//admin available list Jobs
exports.availablelistJobs = (req, res) => {
  const today = new Date();
  const availableJobs = [];
  Job.find()
    .then((result) => {
      for (r of result) {
        if (today < r.edate) {
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

//admin Graduated CRUD controller
//admin Graduated add Graduated
exports.postAddGraduated = (req, res) => {
  NameInput = req.body.name;
  emailInput = req.body.email;
  NIdInput = req.body.NId;
  phoneInput = req.body.phone;
  passwordInput = req.body.password;
  majorInput = req.body.major;

  const newGraduated = new Graduated({
    name: NameInput,
    email: emailInput,
    phone: phoneInput,
    NId: NIdInput,
    password: passwordInput,
    major: majorInput,
  });
  newGraduated
    .save()
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      res.status(401).json(err);
    });
};

//admin Graduated List
//populate CV "MUST TO DO LATER"//////////////////////////////////////////////////////////////
exports.listGraduated = (req, res) => {
  Graduated.find()
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      res.status(401).json(err);
    });
};

//admin Graduated delete job
exports.removeGraduated = (req, res) => {
  const Gid = req.params.Gid;
  Graduated.findByIdAndDelete(Gid)
    .then(() => {
      res.status(200).json("Graduated has been deleted");
    })
    .catch((err) => {
      res.status(401).json(err);
    });
};

//admin Graduated update Graduated
exports.editGraduated = (req, res) => {
  const Gid = req.params.Gid;
  NameInput = req.body.name;
  emailInput = req.body.email;
  NIdInput = req.body.NId;
  phoneInput = req.body.phone;
  passwordInput = req.body.password;
  majorInput = req.body.major;

  Graduated.findById(Gid)
    .then((foundedGraduated) => {
      foundedGraduated.name = NameInput;
      foundedGraduated.email = emailInput;
      foundedGraduated.NId = NIdInput;
      foundedGraduated.phone = phoneInput;
      foundedGraduated.password = passwordInput;
      foundedGraduated.major = majorInput;

      foundedGraduated
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

//change state of graduated to candidate
exports.StateCandidate = (req, res) => {
  const Gid = req.params.Gid;
  console.log("Gidddddddd");
  console.log(Gid);
  Application.findOne({ Graduated: Gid })
    .then((foundedApp) => {
      console.log(foundedApp);
      foundedApp.status = "candidate";
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
