const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ message: "No token, unauthorized access" });
  }

  try {
    const actualToken = token.startsWith("Bearer ")
      ? token.split(" ")[1]
      : token;

    const decoded = jwt.verify(actualToken, process.env.JWT_SECRET);
    req.studentId = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = authMiddleware;