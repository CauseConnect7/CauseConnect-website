const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      code: 1,
      message: "未提供认证令牌",
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        code: 1,
        message: "无效的令牌",
      });
    }
    req.user = user;
    next();
  });
};

module.exports = authenticateToken;
