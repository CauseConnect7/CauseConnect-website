require("dotenv").config();
const express = require("express");
const cors = require("cors");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const User = require("./models/User");
const organizationRoutes = require("./routes/organizationRoutes");
const authRoutes = require("./routes/authRoutes");
const partnerSearchRoutes = require("./routes/partnerSearchRoutes");
const connectDB = require("./config/db");

// 环境变量配置
const config = {
  port: process.env.PORT || 3001,
  jwtSecret: process.env.JWT_SECRET,
  google: {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:
      process.env.GOOGLE_CALLBACK_URL ||
      "http://localhost:3001/api/auth/google/callback",
  },
  frontendURL: process.env.FRONTEND_URL || "http://localhost:3002",
  mongoUri:
    process.env.MONGO_URI ||
    "mongodb+srv://Cluster13662:PawanGupta666@cluster13662.s1t3w.mongodb.net/?retryWrites=true&w=majority&appName=Cluster13662",
};

// 验证必需的环境变量
if (
  !config.jwtSecret ||
  !config.google.clientID ||
  !config.google.clientSecret
) {
  console.error("缺少必需的环境变量");
  process.exit(1);
}

const app = express();

// 中间件配置
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3002"],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

// 连接 MongoDB
connectDB();

// Passport Google OAuth 配置
passport.use(
  new GoogleStrategy(
    {
      clientID: config.google.clientID,
      clientSecret: config.google.clientSecret,
      callbackURL: config.google.callbackURL,
    },
    async function (accessToken, refreshToken, profile, cb) {
      try {
        // 查找或创建用户
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          user = await User.create({
            googleId: profile.id,
            fullName: profile.displayName,
            email: profile.emails[0].value,
          });
        }

        return cb(null, user);
      } catch (error) {
        return cb(error, null);
      }
    }
  )
);

// JWT 验证中间件
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      code: 1,
      message: "未提供认证令牌",
    });
  }

  jwt.verify(token, config.jwtSecret, (err, user) => {
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

// 注册路由
app.use("/api/auth", authRoutes);
app.use("/api/profile", organizationRoutes);
app.use("/api/partner-search", partnerSearchRoutes);

// 添加 Google OAuth 重定向路由
app.get("/auth/google", (req, res) => {
  res.redirect("/api/auth/google");
});

// 基础路由
app.get("/", (req, res) => {
  res.json({ message: "API 服务器运行正常" });
});

// 404 处理
app.use((req, res) => {
  res.status(404).json({
    code: 1,
    message: "请求的资源不存在",
  });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error("服务器错误:", err);
  res.status(500).json({
    code: 1,
    message: "服务器内部错误",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// 启动服务器
app.listen(config.port, () => {
  console.log(`🚀 服务器运行在端口 ${config.port}`);
});

// 处理未捕获的异常
process.on("unhandledRejection", (err) => {
  console.error("未处理的 Promise 拒绝:", err);
});

process.on("uncaughtException", (err) => {
  console.error("未捕获的异常:", err);
  process.exit(1);
});

app.get("/api/test", (req, res) => {
  res.json({ message: "API is working!" });
});

console.log(
  "Registered routes:",
  app._router.stack.map((r) => r.route && r.route.path).filter(Boolean)
);
