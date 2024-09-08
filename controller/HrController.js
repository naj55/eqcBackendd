const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const salt = Number(process.env.salt);
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
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
  description = req.body.description;
  jobRequirmentInput = req.body.jobRequirment;
  c = res.locals.decoder.result.company;
  HrInput = HId;

  const newJob = new Job({
    jobname: NameInput,
    sdate: sdateInput,
    edate: edateInput,
    department: departmentInput,
    skills: skillsInput,
    notes: notesInput,
    description: description,
    jobRequirment: jobRequirmentInput,
    status: "wait",
    company: c,
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
  Job.find({ Hr: HId })
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      res.status(401).json(err);
    });
};

// //admin job delete job
// exports.removeJob = (req, res) => {
//   const Jid = req.params.Jid;
//   Job.findByIdAndDelete(Jid)
//     .then(() => {
//       Application.deleteMany({ Job: Jid })
//         .then(() => {
//           console.log("job is deleted");
//         })
//         .catch((err) => {
//           res.status(401).json(err);
//         });
//     })
//     .catch((err) => {
//       res.status(401).json(err);
//     });
// };

exports.removeJob = async (req, res) => {
  try {
    const Jid = req.params.Jid;
    const foundedjob = await Job.findOne({ _id: Jid });

    if (!foundedjob) {
      return res.status(404).json({ error: "job not found" });
    }

    foundedjob.isDeleted = true;

    // Use find instead of findMany
    const application = await Application.find({ Job: Jid });

    if (application.length === 0) {
      return res.status(404).json({ error: "application not found" });
    }

    // Set isDeleted for each job
    for (const one of application) {
      one.isDeleted = true;
      await one.save(); // Save each job individually
    }

    const savedjob = await foundedjob.save();

    return res
      .status(200)
      .json({ savedjob, deletedJobsCount: application.length });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
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
      if (!compare) {
        return res.status(404).json({ error: "كلمة المرور غير صحيحة" });
      }

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
// view listApplication of graduated
exports.listJobApplication = (req, res) => {
  const HId = res.locals.decoder.result._id;
  Job.find({ Hr: HId })
    .then((jobs) => {
      // Check if any jobs were found
      if (jobs.length === 0) {
        return res
          .status(404)
          .json({ message: "No jobs found for this HR ID." });
      }
      res.status(200).json(jobs);
    })
    .catch((error) => {
      console.error("Error fetching jobs:", error);
      res.status(500).json({ message: "Error fetching jobs", error });
    });
};

exports.listApplication = (req, res) => {
  const HId = res.locals.decoder.result._id;
  const Jid = req.params.jid;

  Job.find({ Hr: HId, _id: Jid })
    .then((jobs) => {
      // Check if any jobs were found
      if (jobs.length === 0) {
        return res
          .status(404)
          .json({ message: "No jobs found for this HR ID." });
      }

      // Extract job IDs
      const jid = jobs.map((job) => job._id);
      Application.find({ Job: { $in: jid }, status: "wait" })
        .populate("GraduatedId")
        .populate("Job")
        .then((applications) => {
          res.status(200).json(applications); // Send applications response
        })
        .catch((err) => {
          console.error("Error fetching applications:", err);
          res
            .status(500)
            .json({ message: "Error fetching applications", error: err });
        });
    })
    .catch((error) => {
      console.error("Error fetching jobs:", error);
      res.status(500).json({ message: "Error fetching jobs", error });
    });
};

exports.listCandidate = async (req, res) => {
  try {
    const HId = res.locals.decoder.result._id;

    const jobs = await Job.find({ Hr: HId });
    if (jobs.length === 0) {
      return res.status(404).json({ message: "No jobs found for this HR ID." });
    }

    const jobIds = jobs.map((job) => job._id);

    const applications = await Application.find({
      Job: { $in: jobIds },
      status: "candidate",
    })
      .populate("GraduatedId")
      .populate("Job");

    res.status(200).json(applications);
  } catch (error) {
    if (error.message.includes("jobs")) {
      return res.status(500).json({ message: "Error fetching jobs", error });
    } else {
      return res
        .status(500)
        .json({ message: "Error fetching applications", error });
    }
  }
};
//change state of graduated to candidate

exports.StateRejected = async (req, res) => {
  try {
    const Aid = req.params.Aid;
    const foundedApp = await Application.findOne({ _id: Aid });

    if (!foundedApp) {
      return res.status(404).json({ error: "Application not found" });
    }

    const GID = foundedApp.Graduated;
    foundedApp.status = "rejected";
    const savedApp = await foundedApp.save();

    const graduate = await Graduated.findOne({ graduated: GID });

    if (!graduate) {
      return res.status(404).json({ error: "Graduate not found" });
    }

    const Gemail = graduate.email;
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "aoleqc@gmail.com",
        pass: "exse plzx hdjy tsrj",
      },
    });

    const mailOptions = {
      from: "aoleqc@gmail.com",
      to: Gemail,
      subject: "Sending Email using Node.js",
      text: "نعتذر منك لم يتم قبول طلبك للتقديم على الوظيفه",
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });

    return res.status(200).json(savedApp);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

//change state of graduated to candidate

exports.StateAccept = async (req, res) => {
  try {
    const Aid = req.params.Aid;
    const foundedApp = await Application.findOne({ _id: Aid });

    if (!foundedApp) {
      return res.status(404).json({ error: "Application not found" });
    }

    const GID = foundedApp.Graduated;
    foundedApp.status = "accept";
    const savedApp = await foundedApp.save();

    const graduate = await Graduated.findOne({ graduated: GID });

    if (!graduate) {
      return res.status(404).json({ error: "Graduate not found" });
    }

    const Gemail = graduate.email;
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "aoleqc@gmail.com",
        pass: "exse plzx hdjy tsrj",
      },
    });

    const mailOptions = {
      from: "aoleqc@gmail.com",
      to: Gemail,
      subject: "Sending Email using Node.js",
      text: "لقد تم قبول طلبك للتقديم على الوظيفه",
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });

    return res.status(200).json(savedApp);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.StateCandidate = async (req, res) => {
  try {
    const Aid = req.params.Aid;
    const foundedApp = await Application.findOne({ _id: Aid });

    if (!foundedApp) {
      return res.status(404).json({ error: "Application not found" });
    }

    const GID = foundedApp.Graduated;
    foundedApp.status = "candidate";
    const savedApp = await foundedApp.save();

    const graduate = await Graduated.findOne({ graduated: GID });

    if (!graduate) {
      return res.status(404).json({ error: "Graduate not found" });
    }

    // const Gemail = graduate.email;
    // const transporter = nodemailer.createTransport({
    //   service: "gmail",
    //   auth: {
    //     user: "aoleqc@gmail.com",
    //     pass: "exse plzx hdjy tsrj",
    //   },
    // });

    // const mailOptions = {
    //   from: "aoleqc@gmail.com",
    //   to: Gemail,
    //   subject: "Sending Email using Node.js",
    //   text: "لقد تم ترشيحك طلبك للتقديم على الوظيفه",
    // };

    // transporter.sendMail(mailOptions, function (error, info) {
    //   if (error) {
    //     console.log(error);
    //   } else {
    //     console.log("Email sent: " + info.response);
    //   }
    // });

    return res.status(200).json(savedApp);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

//view graduated cv
exports.ViewCv = (req, res) => {
  const GId = req.params.Gid;
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
  const JId = req.params.id;
  Job.findById(JId)
    .populate("company")
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      res.status(401).json(err);
    });
};

// إرسال رمز إعادة تعيين كلمة المرور
exports.hrForgetPassLink = async (req, res) => {
  const email = req.body.email;

  try {
    const hr = await Hr.findOne({ email });
    if (!hr) {
      return res.status(404).send("HR not found.");
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString(); // Random 6-digit code
    hr.resetCode = resetCode;
    hr.resetCodeExpiration = Date.now() + 3600000; // 1 hour

    await hr.save();
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "aoleqc@gmail.com",
        pass: "exse plzx hdjy tsrj", // Consider using environment variables for sensitive information
      },
    });

    const mailOptions = {
      from: "aoleqc@gmail.com",
      to: email,
      subject: "Password Reset Code",
      text: `Your password reset code is: ${resetCode}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(500).send("Error sending email.");
      } else {
        return res.send("Password reset code sent to your email.");
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal server error.");
  }
};

exports.hrResetPassword = async (req, res) => {
  const email = req.body.email;
  const resetCode = req.body.resetCode;
  const newPassword = req.body.newPassword;

  try {
    const hr = await Hr.findOne({ email });
    if (!hr) {
      return res.status(404).send("الحساب غير موجود");
    }

    // Check if the reset code is valid and not expired
    if (hr.resetCode !== resetCode || hr.resetCodeExpiration < Date.now()) {
      return res
        .status(400)
        .json({ message: "رمز التحقق غير صالح او منتهي الصلاحية" });
    }

    // Update the password (add your password hashing logic here)
    const bcrypt = require("bcrypt");
    hr.password = await bcrypt.hash(newPassword, 10);
    hr.resetCode = undefined; // Clear the reset code
    hr.resetCodeExpiration = undefined; // Clear the expiration

    await hr.save();
    return res.json({ message: "كلمة المرور تم تغييرها بنجاح" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "خطأ في عملية تغيير كلمة المرور" });
  }
};
