const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // استخراج التوكن من الهيدر

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  jwt.verify(token, "YOUR_SECRET_KEY", (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Unauthorizedd" });
    }
    res.locals.decoder = decoded; // تعيين القيمة في locals
    next();
  });
};

module.exports = authMiddleware;
