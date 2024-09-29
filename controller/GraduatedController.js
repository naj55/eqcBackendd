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
  const GId = decoded.oid;

  const name = req.body.name;
  const email = req.body.email;
  const phone = req.body.phone;
  const NId = req.body.NId;
  const address = req.body.address;
  const major = req.body.major;

  const NewGraduated = new Graduated({
    name: name,
    email: email,
    phone: phone,
    NId: NId,
    address: address,
    graduated: GId,
    major: major,
  });
  NewGraduated.save()
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      res.status(401).json(err);
    });
};

exports.updateGraduated = async (req, res) => {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const decoded = jwt.decode(token);
    if (!decoded) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const GId = decoded.oid;

    const { name, email, phone, NId, address, major } = req.body;

    if (!name || !email || !phone || !NId || !address || !major) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const updatedGraduated = await Graduated.findOneAndUpdate(
      { graduated: GId },
      {
        name: name,
        email: email,
        phone: phone,
        NId: NId,
        address: address,
        major: major,
      },
      { new: true, runValidators: true }
    );

    if (!updatedGraduated) {
      return res.status(404).json({ error: "Graduated not found" });
    }

    res.status(200).json(updatedGraduated);
  } catch (error) {
    console.error("Error updating graduated:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.deleteGraduated = async (req, res) => {
  const id = req.params.id;

  const deletedGraduated = await Graduated.findByIdAndDelete(id);

  if (!deletedGraduated) {
    return res.status(404).json({ error: "Graduated not found" });
  }

  res.status(200).json(deletedGraduated);
};
exports.getAll = async (req, res) => {
  const graduated = await Graduated.find();
  res.status(200).json(graduated);
};
exports.verifyOtpAndChangePassword = async (req, res) => {
  const email = req.body.email;
  const otp = req.body.otp;
  const newPassword = req.body.newPassword;
  try {
    const graduated = await Graduated.findOne({ email: email });
    if (!graduated) {
      return res.status(404).json({ message: "الحساب غير موجود" });
    }

    // Check if OTP is valid and not expired
    if (graduated.otp !== otp || graduated.otpExpires < Date.now()) {
      return res.status(400).json({ message: "خطاء في الرمز السري" });
    }

    // Hash the new password
    const hash = await bcrypt.hash(newPassword, salt);

    // Update password and clear OTP
    graduated.password = hash; // Set the new password
    graduated.otp = undefined; // Clear OTP
    graduated.otpExpires = undefined; // Clear OTP expiration

    await graduated.save();
    res.status(200).json({ message: "تم تغيير كلمة المرور بنجاح" });
  } catch (err) {
    res.status(500).json(err);
  }
};

// GraduatedLogin
exports.GraduatedLogin = (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  console.log(password);
  console.log(email);
  Graduated.findOne({ email: email })
    .select("+password")
    .then(async (result) => {
      const hashedPass = result.password;
      const compare = await bcrypt.compare(password, hashedPass);
      if (!compare) {
        return res
          .status(401)
          .json({ message: "خطاء في البريد الالكتروني او كلمة المرور" });
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

exports.insertGraduated = (req, res) => {
  const data = req.body;

  const newGraduated = new Graduated(data);

  newGraduated
    .save()
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      res.status(401).json(err);
    });
};

exports.activeGraduatedLogin = (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1];

  const decoded = jwt.decode(token);
  const GId = decoded.oid;

  Graduated.findOne({ graduated: GId })
    .then((result) => {
      if (!result) {
        const newGraduated = new Graduated({
          graduated: GId,
          isDeleted: false,
        });

        return newGraduated
          .save()
          .then(() => {
            res.json({ isNew: true }); // Return a proper response
          })
          .catch((error) => {
            res
              .status(500)
              .json({ error: "Failed to save new graduated record." });
          });
      } else {
        res.json({ isNew: false }); // Return a proper response
      }
    })
    .catch((err) => {
      res.status(500).json({ error: "Failed to find graduated record." });
    });
};
//job list
exports.listJobs = (req, res) => {
  const today = new Date();
  const availableJobs = [];
  Job.find({ status: "accepted", isDeleted: false })
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
  const Jid = req.params.Jid; // Job ID
  const token = req.headers["authorization"]?.split(" ")[1]; // Authorization Token
  const decoded = jwt.decode(token);
  const GId = decoded.oid; // Graduated ID from Token

  Graduated.findOne({ graduated: GId })
    .then((result) => {
      const IdG = result._id; // Get Graduated ID from database
      // Check if the user has already applied to this job
      Application.findOne({ GraduatedId: IdG, Job: Jid })
        .then((applyedJob) => {
          if (!applyedJob) {
            // If not applied, create a new application
            const newApplication = new Application({
              GraduatedId: IdG,
              Graduated: GId,
              Job: Jid,
              status: "wait",
              isDeleted: false,
            });
            newApplication
              .save()
              .then((result) => {
                res.status(200).json(result); // Successful application
              })
              .catch((err) => {
                res.status(500).json(err); // Error saving application
              });
          } else {
            // If already applied, send a response
            res
              .status(400)
              .json({ message: "You have already applied to this job" });
          }
        })
        .catch((error) => {
          res.status(500).json(error); // Error checking previous applications
        });
    })
    .catch((err) => {
      res.status(500).json(err); // Error finding graduated user
    });
};

//list for all job that has been applyed
exports.applyedJob = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  const decoded = jwt.decode(token);
  const GId = decoded.oid;
  Application.find({ Graduated: GId, isDeleted: false })
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
  const GId = decoded.oid;
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
  const GId = decoded.oid;
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
  const GId = decoded.oid;

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

exports.skillsSection = async (req, res) => {
  try {
    // استخراج التوكن وفك تشفيره لاستخراج المعرف
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Authorization token missing" });
    }

    const decoded = jwt.decode(token);
    const GId = decoded.oid;

    // جلب المهارات من جسم الطلب (Body)
    const skillsArray = req.body;

    // التحقق من صحة المهارات والتأكد من تحويل كل عنصر إلى نص
    if (!Array.isArray(skillsArray) || skillsArray.length === 0) {
      return res
        .status(400)
        .json({ message: "Skills should be a non-empty array" });
    }

    // تصفية المهارات وتحويل كل عنصر إلى نص مع تجاهل العناصر غير الصالحة
    const filteredSkills = skillsArray
      .map((skill) => {
        if (skill && typeof skill === "string") {
          return skill; // إذا كانت المهارة نصًا، أعدها كما هي
        } else if (skill && typeof skill === "object" && skill.name) {
          return skill.name; // إذا كانت المهارة كائنًا يحتوي على حقل 'name'، أعد الاسم
        } else {
          return null; // إذا كانت المهارة غير صالحة، أعد null
        }
      })
      .filter((skill) => skill !== null); // إزالة العناصر غير الصالحة

    if (filteredSkills.length === 0) {
      return res.status(400).json({ message: "No valid skills found" });
    }

    // العثور على الخريج باستخدام المعرف المستخرج من التوكن
    const graduated = await Graduated.findOne({ graduated: GId });
    if (!graduated) {
      return res.status(404).json({ message: "Graduated not found" });
    }

    // استخدام map لحفظ كل مهارة بشكل مستقل في قاعدة البيانات
    const savedSkills = await Promise.all(
      filteredSkills.map(async (skill) => {
        const newSkill = new Section({
          title: "Skills",
          skills: skill, // حفظ كل مهارة بشكل منفصل كنص
          graduated: GId,
        });
        return newSkill.save();
      })
    );

    // إرسال الاستجابة بالنجاح مع النتائج المحفوظة
    res.status(200).json(savedSkills);
  } catch (err) {
    // إرسال استجابة بالخطأ في حالة حدوث مشكلة
    res
      .status(500)
      .json({ message: "Error saving skills", error: err.message });
  }
};

exports.languageSection = (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  const decoded = jwt.decode(token);
  const GId = decoded.oid;

  const language = req.body.language;
  const level = req.body.level;

  const newLanguage = new Section({
    title: "language",
    language: language,
    level: level,
    graduated: GId,
  });
  newLanguage
    .save()
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      res.status(401).json(err);
    });
};

exports.AboutMeSection = (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  const decoded = jwt.decode(token);
  const GId = decoded.oid;

  const aboutMe = req.body.aboutMe;

  const newAboutMe = new Section({
    title: "About Me",
    aboutMe: aboutMe,
    graduated: GId,
  });
  newAboutMe
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
  const GId = decoded.oid;

  const from = req.body.from;
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
  const GId = decoded.oid;
  Section.find({ graduated: GId })
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      res.status(401).json(err);
    });
};
exports.getCreateCv = (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  const decoded = jwt.decode(token);
  const GId = decoded.oid;
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
  // const Gemail = decoded.unique_name;
  const GId = decoded.oid;
  Graduated.findOne({ graduated: GId })
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      res.status(401).json(err);
    });
};
exports.ViewGraduateById = (req, res) => {
  const GId = req.params.Gid;

  Graduated.findOne({ graduated: GId })
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
  const GId = decoded.oid;
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
  const GId = decoded.oid;
  Section.find({ graduated: GId, title: "Experience" })
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      res.status(401).json(err);
    });
};

exports.getSkills = async (req, res) => {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];
    const decoded = jwt.decode(token);
    const GId = decoded.oid;

    // جلب بيانات الطالب باستخدام GId
    const graduated = await Graduated.findOne({ graduated: GId });

    if (!graduated) {
      return res.status(404).json({ message: "Graduated not found" });
    }

    // جلب المهارات من قاعدة البيانات باستخدام معرف الطالب
    const skills = await Section.find({
      graduated: graduated._id,
      title: "Skills",
    });

    // إرجاع النتيجة
    res.status(200).json(skills);
  } catch (err) {
    res.status(500).json({ message: "Error fetching skills", error: err });
  }
};

exports.getVolunteering = (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  const decoded = jwt.decode(token);
  const GId = decoded.oid;
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
  const GId = decoded.oid;
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
  const GId = decoded.oid;
  Application.find({ graduated: GId })
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      res.status(401).json(err);
    });
};

exports.getLanguage = (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  const decoded = jwt.decode(token);
  const GId = decoded.oid;
  Section.find({ graduated: GId, title: "language" })
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      res.status(401).json(err);
    });
};

exports.getAboutMe = (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  const decoded = jwt.decode(token);
  const GId = decoded.oid;
  Section.find({ graduated: GId, title: "About Me" })
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

exports.isHaveCv = (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  const decoded = jwt.decode(token);
  const GId = decoded.oid;
  Section.find({ graduated: GId, title: "Experience" })
    .then((result) => {
      res.status(200).json({
        isHaveCv: result.length > 0 ? true : false,
      });
    })
    .catch((err) => {
      res.status(401).json(err);
    });
};

// إرسال رمز إعادة تعيين كلمة المرور
exports.graduatedForgetPassLink = async (req, res) => {
  const email = req.body.email;

  try {
    const graduated = await Graduated.findOne({ email });
    if (!graduated) {
      return res.status(404).send("graduated not found.");
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString(); // Random 6-digit code
    graduated.resetCode = resetCode;
    graduated.resetCodeExpiration = Date.now() + 3600000; // 1 hour

    await graduated.save();
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

exports.graduatedResetPassword = async (req, res) => {
  const email = req.body.email;
  const resetCode = req.body.resetCode;
  const newPassword = req.body.newPassword;

  try {
    const graduated = await Graduated.findOne({ email });
    if (!hr) {
      return res.status(404).send("الحساب غير موجود");
    }

    // Check if the reset code is valid and not expired
    if (
      graduated.resetCode !== resetCode ||
      graduated.resetCodeExpiration < Date.now()
    ) {
      return res
        .status(400)
        .json({ message: "رمز التحقق غير صالح او منتهي الصلاحية" });
    }

    // Update the password (add your password hashing logic here)
    const bcrypt = require("bcrypt");
    graduated.password = await bcrypt.hash(newPassword, 10);
    graduated.resetCode = undefined; // Clear the reset code
    graduated.resetCodeExpiration = undefined; // Clear the expiration

    await graduated.save();
    return res.json({ message: "كلمة المرور تم تغييرها بنجاح" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "خطأ في عملية تغيير كلمة المرور" });
  }
};
