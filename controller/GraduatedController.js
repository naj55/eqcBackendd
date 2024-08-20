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
  console.log("here");

  const token = req.headers["authorization"]?.split(" ")[1];
  const decoded = jwt.decode(token);
  const GId = decoded.appid;

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
      console.log(err);

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

  Graduated.findOne({ graduated: GId })
    .then((result) => {
      const IdG = result._id;
      const newApplication = new Application({
        GraduatedId: IdG,
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

exports.skillsSection = async (req, res) => {
  try {
    // استخراج التوكن وفك تشفيره لاستخراج المعرف
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Authorization token missing" });
    }

    const decoded = jwt.decode(token);
    const GId = decoded.appid;

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
  const GId = decoded.appid;

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
  const GId = decoded.appid;

  const aboutMe = req.body.aboutMe;
  console.log(aboutMe);

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
  const GId = decoded.appid;

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
  const GId = decoded.appid;
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
  // const Gemail = decoded.unique_name;
  const GId = decoded.appid;
  Graduated.findOne({ graduated: GId })
    .then((result) => {
      console.log(result);

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

exports.getSkills = async (req, res) => {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];
    const decoded = jwt.decode(token);
    const GId = decoded.appid;

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

exports.getLanguage = (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  const decoded = jwt.decode(token);
  const GId = decoded.appid;
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
  const GId = decoded.appid;
  Section.find({ graduated: GId, title: "About Me" })
    .then((result) => {
      res.status(200).json(result);
      console.log(result);
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
