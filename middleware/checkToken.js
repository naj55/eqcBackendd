const jwt = require("jsonwebtoken");
require("dotenv").config();

const checkToken = (req, res, next) => {
  const header = req.headers.authorization;
  const token = req.headers.authorization.split(" ")[1];
  if (!header) {
    res.json("you must logein");
  }
  try {
    const decoder = jwt.verify(token, process.env.secret);
    res.locals.decoder = decoder;
    next();
  } catch (err) {
    res.status(404).json(err);
  }
};

module.exports = checkToken;
