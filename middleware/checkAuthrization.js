// const Admin = require("../model/Admin");
// const jwt = require("jsonwebtoken");
// require("dotenv").config();
// /////////checkAuthrization for student
// const checkAuthrization = (req, res, next) => {
//   let decoder = res.locals.decoder;
//   const email = "eqc@aol.edu.sa";
//   Admin.findOne({ email: email })
//     .then((foundedUser) => {
//       const id = foundedUser._id;
//       useridlogedIn = decoder.result._id;
//       if (id == useridlogedIn) {
//         next();
//         return;
//       } else {
//         res.json({ msg: "sorry you are not authorized" });
//       }
//     })
//     .catch((err) => {
//       res.status(401).json(err);
//     });
// };

// module.exports = checkAuthrization;

const Admin = require("../model/Admin");

const checkAuthrization = async (req, res, next) => {
  const decoder = res.locals.decoder;

  try {
    // Check if user is an admin by role or specific email
    const admin = await Admin.findOne({ email: decoder.result.email });
    if (admin) {
      next();
    } else {
      return res.status(403).json({ msg: "Unauthorized access" });
    }
  } catch (error) {
    console.error("Auth Error:", error.message);
    return res.status(500).json({ msg: "Server error", error: error.message });
  }
};

module.exports = checkAuthrization;
