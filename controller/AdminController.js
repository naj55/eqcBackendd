const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const salt = Number(process.env.salt);
const jwt = require("jsonwebtoken");

const fs = require("fs");
const csv = require("csv-parser");
const xlsx = require("xlsx");

var nodemailer = require("nodemailer");

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
  const password = "AdminSecret$8";
  const email = "eqc@aol.edu.sa";
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

exports.adminForgetPassLink = async (req, res) => {
  const emailInput = req.body.email;
  Admin.findOne({ email: emailInput })
    .select("+password")
    .then(async (result) => {
      if (!result) {
        return res.status(404).json({ Status: "user not existed" });
      } ///end if
      const admin_secret = process.env.secret + result.password;
      const token = jwt.sign(
        { email: result.email, id: result._id },
        admin_secret,
        {
          expiresIn: "20m",
        }
      );

      const link = `http://localhost:5173/reset-password/${result._id}`;

      var transporter = nodemailer.createTransport({
        host: "smtp.office365.com",
        port: 587,
        secure: false,
        auth: {
          user: "eqc@aol.edu.sa",
          pass: "kcfjppbxpgdxpygq",
        },
      });

      var mailOptions = {
        from: "eqc@aol.edu.sa",
        to: "eqc@aol.edu.sa",
        subject: "Sending Email using Node.js",
        text: "link",
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log("Email sent: " + info.response);
        }
      });
      res.json({ token: token, id: result._id });
    })
    .catch((err) => {
      res.status(401).json(err);
    });

  //send email to the user
};

exports.getAdminResetPass = async (req, res) => {
  const { id, token } = req.params;

  const oldUser = await Admin.findOne({ _id: id }).select("+password");
  if (!oldUser) {
    return res.json({ status: "User Not Exists!!" });
  }
  const adminn_secret = process.env.secret + oldUser.password;
  try {
    const verify = jwt.verify(token, adminn_secret);
    res.status(200).json({ email: verify.email });
  } catch (error) {
    res.json("not verified");
  }
};

exports.postAdminResetPass = async (req, res) => {
  const { id, token } = req.params;
  const password = req.body.password;
  const oldUser = await Admin.findOne({ _id: id }).select("+password");
  if (!oldUser) {
    return res.json({ status: "User Not Exists!!" });
  }
  const adminn_secret = process.env.secret + oldUser.password;
  try {
    const verify = jwt.verify(token, adminn_secret);
    const hash = await bcrypt.hash(password, salt);
    Admin.findById(id)
      .select("+password")
      .then((foundedAdmin) => {
        foundedAdmin.password = hash;
        foundedAdmin
          .save()
          .then((result) => {
            res.status(200).json({ status: "password updated" });
          })
          .catch((err) => {
            res.status(401).json(err);
          });
      })
      .catch((err) => {
        res.status(401).json(err);
      });

    // res.status(200).json({ status: "password update" });
  } catch (error) {
    res.json({ status: "somthing went wrong" });
  }
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
    isDeleted: false,
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
  // Company.find({ isDeleted: false });
  Company.find()
    .populate("Hrs")
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      res.status(401).json(err);
    });
};

//admin company delete Company cascade
// exports.removeCompany0 = (req, res) => {
//   const Cid = req.params.Cid;

//   Company.findByIdAndDelete(Cid)
//     .then(() => {
//       Hr.deleteMany({ company: Cid })
//         .then((r) => {
//           Job.deleteMany({ company: Cid })
//             .then(() => {
//               console.log("job is deleted");
//             })
//             .catch((err) => {
//               res.status(401).json(err);
//             });
//         })
//         .catch((err) => {
//           res.status(401).json(err);
//         });
//       res.status(200).json("company deleted");
//     })
//     .catch((err) => {
//       res.status(401).json(err);
//     });
// };

exports.removeCompany = async (req, res) => {
  try {
    const Cid = req.params.Cid;
    const foundedCompany = await Hr.findOne({ _id: Hid });

    if (!foundedHr) {
      return res.status(404).json({ error: "HR not found" });
    }

    foundedHr.isDeleted = true;

    // Use find instead of findMany
    const HrJobs = await Job.find({ Hr: Hid });

    // if (HrJobs.length === 0) {
    //   return res.status(404).json({ error: "Jobs not found" });
    // }

    // Set isDeleted for each job
    for (const job of HrJobs) {
      job.isDeleted = true;
      await job.save(); // Save each job individually
    }

    const savedHr = await foundedHr.save();

    return res.status(200).json({ savedHr, deletedJobsCount: HrJobs.length });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
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

exports.editC = (req, res) => {
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

exports.postAddHr = async (req, res) => {
  console.log("this work");
  const NameInput = req.body.name;
  const emailInput = req.body.email;
  const phoneInput = req.body.phone;
  const companyInput = req.body.company;

  // Generate a 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  console.log("this work1");

  // Set up Nodemailer transport
  const transporter = nodemailer.createTransport({
    host: "smtp.office365.com",
    port: 587,
    secure: false,
    auth: {
      user: "eqc@aol.edu.sa",
      pass: "kcfjppbxpgdxpygq",
    },
  });
  // Send OTP email
  const mailOptions = {
    from: "eqc@aol.edu.sa",
    to: emailInput,
    subject: "Your OTP Code",
    html: `<!DOCTYPE html>
  <html lang="ar">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>OTP Code</title>
      <style>
          body {
              font-family: Arial, sans-serif;
              background-color: #f5f5f5;
              margin: 0;
              padding: 0;
              direction: rtl;
              text-align: right;
          }
          .container {
              width: 100%;
              padding: 20px;
              background-color: #ffffff;
              border-radius: 10px;
              max-width: 600px;
              margin: 20px auto;
              box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
          }
          .header {
              background-color: #8079c5;
              padding: 20px;
              border-radius: 10px 10px 0 0;
              text-align: center;
              color: #fff;
          }
          .header h1 {
              margin: 0;
              font-size: 24px;
          }
          .content {
              padding: 20px;
          }
          .content p {
              font-size: 18px;
              color: #333;
          }
          .otp {
              font-size: 22px;
              font-weight: bold;
              color: #8079c5;
              margin: 20px 0;
              text-align: center;
          }
          .activation-button {
              display: block;
              width: 100%;
              max-width: 200px;
              margin: 20px auto;
              padding: 10px;
              background-color: #8079c5;
              color: white;
              text-align: center;
              border-radius: 5px;
              text-decoration: none;
              font-size: 18px;
          }
          .footer {
              background-color: #f5f5f5;
              padding: 10px;
              text-align: center;
              border-radius: 0 0 10px 10px;
              color: #8079c5;
              font-size: 14px;
          }
      </style>
  </head>
  <body>
  
      <div class="container">
          <div class="header">
              <h1>مركز التأهيل الوظيفي</h1>
          </div>
          <div class="content">
              <p>مرحباً،</p>
              <p>شكراً لاستخدامك نظام مركز التأهيل الوظيفي. رمز OTP الخاص بك هو:</p>
              <div class="otp">{{otp}}</div>
              <p>يرجى استخدام هذا الرمز في غضون 3 ساعات. إذا لم تطلب رمز التحقق، يرجى تجاهل هذا البريد الإلكتروني.</p>
              <!-- زر تفعيل الحساب -->
              <p>لتفعيل الحساب الرجاء الزيارة:</p>
              <a href="http://localhost:5173/auth/hr/activate-account" class="activation-button">تفعيل الحساب</a>
          </div>
          <div class="footer">
              <p>© 2024 مركز التأهيل الوظيفي. جميع الحقوق محفوظة.</p>
          </div>
      </div>
  
  </body>
  </html>
  `,
  };

  try {
    await transporter.sendMail(mailOptions);

    // Create a new HR record with OTP and expiration
    const newHr = new Hr({
      name: NameInput,
      email: emailInput,
      phone: phoneInput,
      company: companyInput,
      isDeleted: false,
      otp: otp, // Store OTP temporarily if needed
      otpExpires: Date.now() + 3 * 60 * 60 * 1000, // OTP valid for 3 hours
    });
    await newHr.save();

    console.log("OTP sent to email:", emailInput);

    res.status(200).json({ message: "تم اضافة الموظف بنجاح" });
  } catch (err) {
    console.error(err); // طباعة الخطأ في وحدة التحكم
    if (err.code === "11000") {
      return res.status(400).json({ message: "ايميل المستخدم موجود بالفعل" });
    }
    res.status(500).json({ message: "خطاء في السيرفر", error: err });
  }
};

//admin Hr List
exports.listHr = (req, res) => {
  Hr.find({ isDeleted: false })
    .populate("company")
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      res.status(401).json(err);
    });
};

exports.removeHr = async (req, res) => {
  try {
    const Hid = req.params.Hid;
    const foundedHr = await Hr.findOne({ _id: Hid });

    if (!foundedHr) {
      return res.status(404).json({ error: "HR not found" });
    }

    foundedHr.isDeleted = true;

    // Use find instead of findMany
    const HrJobs = await Job.find({ Hr: Hid });

    // if (HrJobs.length === 0) {
    //   return res.status(404).json({ error: "Jobs not found" });
    // }

    // Set isDeleted for each job
    for (const job of HrJobs) {
      job.isDeleted = true;
      await job.save(); // Save each job individually
    }

    const savedHr = await foundedHr.save();

    return res.status(200).json({ savedHr, deletedJobsCount: HrJobs.length });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// //admin HR delete Hr
// exports.removeHrr = (req, res) => {
//   const Hid = req.params.Hid;
//   Hr.findByIdAndDelete(Hid)
//     .then(() => {
//       Job.deleteMany({ Hr: Hid })
//         .then(() => {
//           console.log("job is deleted");
//         })
//         .catch((err) => {
//           res.status(401).json(err);
//         });
//       res.status(200).json("Hr has been deleted");
//     })
//     .catch((err) => {
//       res.status(401).json(err);
//     });
// };

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

//view one hr
exports.viewHr = (req, res) => {
  const Hid = req.params.Hid;
  Hr.findById(Hid)
    .populate("company")
    .then((result) => {
      res.status(200).json(result);
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
    isDeleted: false,
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
  Job.find({ isDeleted: false })
    .populate("company")
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
  Job.find({ isDeleted: false })
    .then((result) => {
      for (r of result) {
        if (today < r.edate) {
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

//admin job update job
exports.editJob = (req, res) => {
  const Jid = req.params.Jid;
  NameInput = req.body.jobname1;
  sdateInput = req.body.sdate1;
  edateInput = req.body.edate1;
  departmentInput = req.body.department1;
  skillsInput = req.body.skills1;
  notesInput = req.body.notes1;
  jobRequirmentInput = req.body.jobRequirment1;
  ///companyInput = req.body.company;
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
      // foundedJob.company = companyInput;
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
    isDeleted: false,
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
  Graduated.find({ isDeleted: false })
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      res.status(401).json(err);
    });
};

// //admin Graduated delete job
// exports.removeGraduated = (req, res) => {
//   const Gid = req.params.Gid;
//   Graduated.findByIdAndDelete(Gid)
//     .then(() => {
//       res.status(200).json("Graduated has been deleted");
//     })
//     .catch((err) => {
//       res.status(401).json(err);
//     });
// };

exports.removeGraduated = async (req, res) => {
  try {
    const Gid = req.params.Gid;
    const foundedGraduated = await Graduated.findOne({ _id: Gid });

    if (!foundedGraduated) {
      return res.status(404).json({ error: "student not found" });
    }
    foundedGraduated.isDeleted = true;
    const savedApp = await foundedGraduated.save();
    return res.status(200).json(savedApp);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
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
  Application.findOne({ Graduated: Gid })
    .then((foundedApp) => {
      foundedApp.status = "candidate";
      foundedApp.save().then((result) => {
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
      foundedApp.status = "rejected";
      foundedApp.save().then((result) => {
        res.status(200).json(result);
      });
    })
    .catch((err) => {
      res.status(401).json(err);
    });
};

exports.ViewCompany = (req, res) => {
  const Cid = req.params.Cid;
  Company.findById(Cid)
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      res.status(401).json(err);
    });
};

exports.ViewGraduate = (req, res) => {
  const Gid = req.params.Gid;
  Graduated.findById(Gid)
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      res.status(401).json(err);
    });
};

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

exports.requestedJob = (req, res) => {
  Job.find({ status: "wait" })
    .populate("company")
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      res.status(401).json(err);
    });
};

exports.accebtedJob = (req, res) => {
  const JId = req.params.JId;
  Job.findById(JId)
    .then((result) => {
      const hrId = result.Hr;
      Hr.findById({ _id: hrId })
        .then((r) => {
          const HrEmail = r.email;
          result.status = "accepted";
          result.save().then((r) => {
            res.status(200).json(r);
          });
          var transporter = nodemailer.createTransport({
            host: "smtp.office365.com",
            port: 587,
            secure: false,
            auth: {
              user: "eqc@aol.edu.sa",
              pass: "kcfjppbxpgdxpygq",
            },
          });

          var mailOptions = {
            from: "eqc@aol.edu.sa",
            to: HrEmail,
            subject: "قبول الوظيفة وإضافتها للنظام",
            html: `
              <!DOCTYPE html>
              <html lang="ar">
              <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>قبول الوظيفة</title>
                  <style>
                      body {
                          font-family: Arial, sans-serif;
                          background-color: #f5f5f5;
                          margin: 0;
                          padding: 0;
                          direction: rtl;
                          text-align: right;
                      }
                      .container {
                          width: 100%;
                          padding: 20px;
                          background-color: #ffffff;
                          border-radius: 10px;
                          max-width: 600px;
                          margin: 20px auto;
                          box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
                      }
                      .header {
                          background-color: #8079c5;
                          padding: 20px;
                          border-radius: 10px 10px 0 0;
                          text-align: center;
                          color: #fff;
                      }
                      .header h1 {
                          margin: 0;
                          font-size: 24px;
                      }
                      .content {
                          padding: 20px;
                      }
                      .content p {
                          font-size: 18px;
                          color: #333;
                      }
                      .footer {
                          background-color: #f5f5f5;
                          padding: 10px;
                          text-align: center;
                          border-radius: 0 0 10px 10px;
                          color: #8079c5;
                          font-size: 14px;
                      }
                  </style>
              </head>
              <body>
          
                  <div class="container">
                      <div class="header">
                          <h1>مركز التأهيل الوظيفي</h1>
                      </div>
                      <div class="content">
                          <p>مرحباً،</p>
                          <p>تمت الموافقة على الوظيفة الجديدة وتمت إضافتها بنجاح إلى النظام.</p>
                          <p>يرجى مراجعة النظام للتأكد من التفاصيل.</p>
                      </div>
                      <div class="footer">
                          <p>© 2024 مركز التأهيل الوظيفي. جميع الحقوق محفوظة.</p>
                      </div>
                  </div>
          
              </body>
              </html>
            `,
          };

          transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
              console.log(error);
            } else {
              console.log("Email sent: " + info.response);
            }
          });
        })
        .catch((error) => {
          res.status(401).json(error);
        });
    })
    .catch((err) => {
      res.status(401).json(err);
    });
};

exports.rejectedJob = (req, res) => {
  const JId = req.params.JId;
  Job.findById(JId)
    .then((result) => {
      const hrId = result.Hr;
      Hr.findById(hrId)
        .then((r) => {
          const HrEmail = r.email;
          result.status = "rejected";
          result.save().then((r) => {
            res.status(200).json(r);
          });
          var transporter = nodemailer.createTransport({
            host: "smtp.office365.com",
            port: 587,
            secure: false,
            auth: {
              user: "eqc@aol.edu.sa",
              pass: "kcfjppbxpgdxpygq",
            },
          });
          var mailOptions = {
            from: "eqc@aol.edu.sa",
            to: HrEmail,
            subject: "إشعار رفض الوظيفة",
            html: `
  <!DOCTYPE html>
  <html lang="ar">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>إشعار رفض الوظيفة</title>
      <style>
          body {
              font-family: Arial, sans-serif;
              background-color: #f5f5f5;
              margin: 0;
              padding: 0;
              direction: rtl;
              text-align: right;
          }
          .container {
              width: 100%;
              padding: 20px;
              background-color: #ffffff;
              border-radius: 10px;
              max-width: 600px;
              margin: 20px auto;
              box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
          }
          .header {
              background-color: #162c51;
              padding: 20px;
              border-radius: 10px 10px 0 0;
              text-align: center;
              color: #fff;
          }
          .header h1 {
              margin: 0;
              font-size: 24px;
          }
          .content {
              padding: 20px;
          }
          .content p {
              font-size: 18px;
              color: #333;
              margin: 0 0 15px;
          }
          .content p:last-child {
              margin-bottom: 0;
          }
          .footer {
              background-color: #f5f5f5;
              padding: 10px;
              text-align: center;
              border-radius: 0 0 10px 10px;
              color: #162c51;
              font-size: 14px;
          }
      </style>
  </head>
  <body>

      <div class="container">
          <div class="header">
              <h1>مركز التأهيل الوظيفي</h1>
          </div>
          <div class="content">
              <p>نعتذر منك، لم يتم قبول الوظيفة.</p>
              <p>يرجى التواصل مع قسم الموارد البشرية للمزيد من التفاصيل.</p>
          </div>
          <div class="footer">
              <p>© 2024 مركز التأهيل الوظيفي. جميع الحقوق محفوظة.</p>
          </div>
      </div>

  </body>
  </html>
`,
          };

          transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
              console.log(error);
            } else {
              console.log("Email sent: " + info.response);
            }
          });
        })
        .catch((error) => {
          res.status(401).json(err);
        });
    })
    .catch((err) => {
      res.status(401).json(err);
    });
};

//admin clear job
exports.clearJob = (req, res) => {
  Job.findOneAndDelete({ company: null })
    .then(() => {
      res.status(200).json("job has been deleted");
    })
    .catch((err) => {
      res.status(401).json(err);
    });
};

exports.acceptedGraduated = (req, res) => {
  Application.find({ status: "accept" })
    .populate("GraduatedId")
    .populate({
      path: "Job",
      populate: {
        path: "company", // Assuming the Job schema has a reference to Company
        model: "Company", // Replace with the actual model name if different
      },
    })
    .then((acceptedGraduated) => {
      res.status(200).json(acceptedGraduated);
    })
    .catch((err) => {
      res.status(401).json(err);
    });
};

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

exports.importFromCSV = (req, res) => {
  const results = [];

  fs.createReadStream(req.file.path) // Assuming you're using multer to handle file uploads
    .pipe(csv())
    .on("data", (data) => results.push(data))
    .on("end", async () => {
      try {
        await Graduated.insertMany(results);
        res.status(200).json({ message: "تم رفع البيانات بنجاح" });
      } catch (error) {
        res.status(500).json({ message: "خطأ في رفع البيانات", error });
      }
    });
};

exports.importFromExcel = async (req, res) => {
  console.log("ola");
  const workbook = xlsx.readFile(req.file.path);
  const sheetName = workbook.SheetNames[0];
  const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
  console.log("ggng");
  const transporter = nodemailer.createTransport({
    host: "smtp.office365.com",
    port: 587,
    secure: false,
    auth: {
      user: "eqc@aol.edu.sa",
      pass: "kcfjppbxpgdxpygq",
    },
  });

  try {
    for (const row of data) {
      const email = row.email;
      console.log(email);
      const otp = Math.floor(100000 + Math.random() * 900000).toString(); // توليد OTP عشوائي

      const mailOptions = {
        from: "eqc@aol.edu.sa",
        to: email,
        subject: "رمز التحقق OTP الخاص بك",
        html: `
        <!DOCTYPE html>
        <html lang="ar">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>رمز التحقق OTP</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f8f9fa;
                    margin: 0;
                    padding: 0;
                    direction: rtl;
                    text-align: right;
                    color: #343a40;
                }
                .container {
                    width: 100%;
                    padding: 20px;
                    background-color: #ffffff;
                    border-radius: 10px;
                    max-width: 600px;
                    margin: 30px auto;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                }
                .header {
                    background-color: #162c51;
                    padding: 25px;
                    border-radius: 10px 10px 0 0;
                    text-align: center;
                    color: #ffffff;
                }
                .header h1 {
                    margin: 0;
                    font-size: 26px;
                    letter-spacing: 1px;
                }
                .content {
                    padding: 30px;
                    line-height: 1.8;
                }
                .content p {
                    font-size: 18px;
                    margin: 10px 0;
                }
                .otp {
                    font-size: 24px;
                    font-weight: bold;
                    color: #162c51;
                    margin: 20px 0;
                    text-align: center;
                    background-color: #f0f4fa;
                    padding: 10px;
                    border-radius: 5px;
                }
                .activation-button {
                    display: inline-block;
                    margin-top: 20px;
                    padding: 15px 25px;
                    background-color: #162c51;
                    color: #ffffff;
                    text-align: center;
                    border-radius: 5px;
                    text-decoration: none;
                    font-size: 18px;
                    transition: background-color 0.3s ease;
                }
                .activation-button:hover {
                    background-color: #2e59d9;
                }
                .footer {
                    background-color: #f8f9fa;
                    padding: 20px;
                    text-align: center;
                    border-radius: 0 0 10px 10px;
                    color: #6c757d;
                    font-size: 14px;
                }
            </style>
        </head>
        <body>
        
            <div class="container">
                <div class="header">
                    <h1>مركز التأهيل الوظيفي</h1>
                </div>
                <div class="content">
                    <p>مرحباً،</p>
                    <p>شكراً لك على استخدامك نظام مركز التأهيل الوظيفي. رمز التحقق OTP الخاص بك هو:</p>
                    <div class="otp">${otp}</div>
                    <p>يرجى استخدام هذا الرمز خلال 3 ساعات من استلامه لضمان حماية حسابك. إذا لم تطلب رمز التحقق، يُرجى تجاهل هذا البريد الإلكتروني.</p>
                    <p>لتفعيل حسابك، يرجى الضغط على الرابط أدناه:</p>
                    <a href="http://localhost:5173/auth/graduated/activate-account" class="activation-button">تفعيل الحساب</a>
                </div>
                <div class="footer">
                    <p>© 2024 مركز التأهيل الوظيفي. جميع الحقوق محفوظة.</p>
                </div>
            </div>
        
        </body>
        </html>
        `,
      };

      await transporter.sendMail(mailOptions);
      row.otp = otp;
      row.otpExpires = Date.now() + 3 * 60 * 60 * 1000; // تخزين وقت انتهاء صلاحية OTP
    }
    await Graduated.insertMany(data);

    res.status(200).json({ message: "تم رفع البيانات بنجاح" });
    console.log("ggg");
  } catch (error) {
    res.status(500).json({ message: "حدث خطأ", error });
  }
};
