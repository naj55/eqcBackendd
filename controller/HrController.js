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

exports.verifyOtpAndChangePassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    const hr = await Hr.findOne({ email });

    if (!hr) {
      return res.status(404).json({ message: "HR not found" });
    }

    // Convert otpExpires to a timestamp for comparison
    const otpExpiresTimestamp = new Date(hr.otpExpires).getTime();

    // Check if OTP is valid and not expired
    if (hr.otp !== otp || otpExpiresTimestamp < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Hash the new password
    const saltRounds = 10; // Define the salt rounds
    const hash = await bcrypt.hash(newPassword, saltRounds);

    // Update password and clear OTP
    hr.password = hash; // Set the new password
    hr.otp = undefined; // Clear OTP
    hr.otpExpires = undefined; // Clear OTP expiration

    await hr.save();
    res.status(200).json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("Error occurred:", err); // Log the error for debugging
    res
      .status(500)
      .json({ message: "An error occurred while changing the password" });
  }
};

//Hr jobs add job
exports.postAddJob = (req, res) => {
  const D = res.locals.decoder;
  const HId = res.locals.decoder.result._id;

  NameInput = req.body.jobname;
  jobTypeInput = req.body.jobType;
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
    jobType: jobTypeInput,
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

//hr job List job
exports.listJobs = (req, res) => {
  const HId = res.locals.decoder.result._id;
  Job.findOne({ Hr: HId, isDeleted: false })
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
  Job.find({ Hr: HId, isDeleted: false })
    .then((result) => {
      res.status(200).json(result);
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

    // Use find instead of findMany
    const application = await Application.find({ Job: Jid });

    if (application.length > 0) {
      for (const one of application) {
        one.isDeleted = true;
        await one.save(); // Save each job individually
      }
    }

    // Set isDeleted for each job

    foundedjob.isDeleted = true;
    const savedjob = await foundedjob.save();

    return res
      .status(200)
      .json({ savedjob, deletedJobsCount: application.length });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  } //end job fun
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
  Job.find({ Hr: HId, isDeleted: false })
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
  console.log("controllrt hr", HId);
  const Jid = req.params.Jid;

  Job.find({ Hr: HId, _id: Jid, isDeleted: false })
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
  return;
};

exports.listCandidate = async (req, res) => {
  try {
    // Ensure decoder middleware worked
    if (
      !res.locals.decoder ||
      !res.locals.decoder.result ||
      !res.locals.decoder.result._id
    ) {
      return res.status(400).json({ message: "Invalid or missing HR ID." });
    }

    const HId = res.locals.decoder.result._id;

    // Query jobs for the HR
    const jobs = await Job.find({ Hr: HId, isDeleted: false }).exec();

    if (jobs.length === 0) {
      return res.status(404).json({ message: "No jobs found for this HR ID." });
    }

    // Map job IDs for the query
    const jobIds = jobs.map((job) => job._id);

    // Query applications for these jobs with the "candidate" status
    const applications = await Application.find({
      Job: { $in: jobIds },
      status: "candidate",
    })
      .populate("GraduatedId")
      .populate("Job")
      .exec();

    return res.status(200).json(applications);
  } catch (error) {
    console.error("Error:", error.message);
    // Return appropriate error messages
    return res.status(500).json({
      message: "An error occurred while fetching data.",
      error: error.message,
    });
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

    const GID = foundedApp.GraduatedId;

    const graduate = await Graduated.findOne({ graduated: GID });

    if (!graduate) {
      return res.status(404).json({ error: "Graduate not found" });
    }

    const outlook = graduate.email;
    const transporter = nodemailer.createTransport({
      host: "smtp.office365.com",
      port: 587,
      secure: false,
      auth: {
        user: "eqc@aol.edu.sa",
        pass: "kcfjppbxpgdxpygq",
      },
    });

    const mailOptions = {
      from: "eqc@aol.edu.sa",
      to: outlook,
      subject: "رفض طلب التقديم على الوظيفة",
      html: `
        <!DOCTYPE html>
        <html lang="ar">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>رفض الطلب</title>
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
                    <p>نعتذر منك، لم يتم قبول طلبك للتقديم على الوظيفة.</p>
                    <p>يرجى التواصل معنا في حال وجود أي استفسارات.</p>
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

    foundedApp.status = "rejected";
    const savedApp = await foundedApp.save();
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

    const GID = foundedApp.GraduatedId;

    const graduate = await Graduated.findById(GID);

    if (!graduate) {
      return res.status(404).json({ error: "Graduate not found" });
    }

    const outlook = graduate.email;
    const transporter = nodemailer.createTransport({
      host: "smtp.office365.com",
      port: 587,
      secure: false,
      auth: {
        user: "eqc@aol.edu.sa",
        pass: "kcfjppbxpgdxpygq",
      },
    });

    const mailOptions = {
      from: "eqc@aol.edu.sa",
      to: outlook,
      subject: "قبول طلب التقديم على الوظيفة",
      html: `
        <!DOCTYPE html>
        <html lang="ar">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>قبول طلب التقديم على الوظيفة</title>
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
                    <p>تهانينا! لقد تم قبول طلبك للتقديم على الوظيفة بنجاح.</p>
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

    foundedApp.status = "accept";
    const savedApp = await foundedApp.save();

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

    const GID = foundedApp.GraduatedId;
    console.log("GID", GID);
    foundedApp.status = "candidate";

    const graduate = await Graduated.findById(GID);

    console.log("graduate", graduate);

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
      subject: "ترشيح طلب التقديم على الوظيفة",
      html: `
        <!DOCTYPE html>
        <html lang="ar">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>ترشيح طلب التقديم على الوظيفة</title>
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
                    <p>تهانينا! لقد تم ترشيحك  للتقديم على الوظيفة بنجاح.</p>
                      <p>سيتم التواصل معك قريباً</p>
                </div>
                <div class="footer">
                    <p>© 2024 مركز التأهيل الوظيفي. جميع الحقوق محفوظة.</p>
                </div>
            </div>
    
        </body>
        </html>
      `,
    };
    const savedApp = await foundedApp.save();
    console.log("saved app", savedApp);
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
      host: "smtp.office365.com",
      port: 587,
      secure: false,
      auth: {
        user: "eqc@aol.edu.sa",
        pass: "kcfjppbxpgdxpygq",
      },
    });

    const mailOptions = {
      from: "eqc@aol.edu.sa",
      to: email,
      subject: "كود إعادة تعيين كلمة المرور",
      html: `
        <!DOCTYPE html>
        <html lang="ar">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>إعادة تعيين كلمة المرور</title>
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
                    text-align: center;
                }
                .content p {
                    font-size: 18px;
                    color: #333;
                }
                .reset-code {
                    font-size: 22px;
                    font-weight: bold;
                    color: #162c51;
                    margin: 20px 0;
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
    
            <div class="container" dir="rtl">
                <div class="header">
                    <h1>طلب إعادة تعيين كلمة المرور</h1>
                </div>
                <div class="content">
                    <p>كود إعادة تعيين كلمة المرور الخاص بك هو:</p>
                    <div class="reset-code">${resetCode}</div>
                    <p>يرجى استخدام هذا الكود لإعادة تعيين كلمة المرور. الكود صالح لمدة 1 ساعة.</p>
                </div>
                <div class="footer">
                    <p>© 2024 مركز التأهيل الوظيفي. جميع الحقوق محفوظة.</p>
                </div>
            </div>
    
        </body>
        </html>
      `,
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
