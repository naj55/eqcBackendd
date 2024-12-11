const jwt = require("jsonwebtoken");
require("dotenv").config();

const checkToken = (req, res, next) => {
  // console.log("checkToken");
  // Check for the token in both possible locations
  const header = req.headers.authorization || req.body.headers.Authorization;

  // console.log("header", header);

  if (!header) {
    return res.status(401).json("You must log in");
  }

  const token = header.split(" ")[1];

  try {
    const decoder = jwt.verify(token, process.env.secret);
    res.locals.decoder = decoder;
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ error: "Invalid token", details: err.message });
  }
};

module.exports = checkToken;
