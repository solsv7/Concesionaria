const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

function signToken(payload, options = {}) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1h", ...options });
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

module.exports = { signToken, verifyToken };
