const express = require("express");
const router = express.Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const authenticateToken = require("../middleware/authenticateToken");

// API 路由信息
router.get("/", (req, res) => {
  res.json({
    code: 0,
    message: "认证服务可用",
    endpoints: {
      register: "POST /api/auth/register",
      login: "POST /api/auth/login",
      googleAuth: "GET /api/auth/google",
      getCurrentUser: "GET /api/auth/me",
    },
  });
});

// 处理错误的 GET 请求
router.get("/register", (req, res) => {
  res.status(405).json({
    code: 1,
    message: "注册请求必须使用 POST 方法",
    allowedMethods: ["POST"],
  });
});

router.get("/login", (req, res) => {
  res.status(405).json({
    code: 1,
    message: "登录请求必须使用 POST 方法",
    allowedMethods: ["POST"],
  });
});

// 注册路由 - 只接受 POST
router.post("/register", async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // 验证请求体
    if (!fullName || !email || !password) {
      return res.status(400).json({
        code: 1,
        message: "所有字段都是必需的",
        requiredFields: ["fullName", "email", "password"],
      });
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        code: 1,
        message: "邮箱格式不正确",
      });
    }

    // 检查用户是否已存在
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        code: 1,
        message: "该邮箱已被注册",
      });
    }

    // 密码强度验证
    if (password.length < 6) {
      return res.status(400).json({
        code: 1,
        message: "密码长度必须至少为6个字符",
      });
    }

    // 创建新用户
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      code: 0,
      message: "注册成功",
      data: {
        userId: newUser._id,
        email: newUser.email,
        fullName: newUser.fullName,
      },
    });
  } catch (error) {
    console.error("注册错误:", error);
    res.status(500).json({
      code: 1,
      message: "服务器错误",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// 登录路由 - 只接受 POST
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 验证请求体
    if (!email || !password) {
      return res.status(400).json({
        code: 1,
        message: "邮箱和密码都是必需的",
        requiredFields: ["email", "password"],
      });
    }

    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        code: 1,
        message: "邮箱或密码错误",
      });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      code: 0,
      message: "登录成功",
      data: {
        token,
        user: {
          userId: user._id,
          email: user.email,
          fullName: user.fullName,
        },
      },
    });
  } catch (error) {
    console.error("登录错误:", error);
    res.status(500).json({
      code: 1,
      message: "服务器错误",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Google OAuth 路由
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    try {
      const token = jwt.sign(
        { userId: req.user._id, email: req.user.email },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );
      res.redirect(`${process.env.FRONTEND_URL}?token=${token}`);
    } catch (error) {
      console.error("Google 认证回调错误:", error);
      res.redirect(`${process.env.FRONTEND_URL}?error=auth_failed`);
    }
  }
);

// 获取当前用户信息路由
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        code: 1,
        message: "用户未找到",
      });
    }

    res.json({
      code: 0,
      data: {
        userId: user._id,
        email: user.email,
        fullName: user.fullName,
      },
    });
  } catch (error) {
    console.error("获取用户信息错误:", error);
    res.status(500).json({
      code: 1,
      message: "服务器错误",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

module.exports = router;
