const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: function () {
      return !this.googleId; // 仅当不是 Google 登录时必填
    },
  },
  googleId: {
    type: String,
    sparse: true, // 允许为空，但如果有值必须唯一
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// 使用环境变量中指定的集合名称，默认为'auth'
const collectionName = process.env.MONGODB_COLLECTION_AUTH || "auth";

module.exports = mongoose.model("User", userSchema, collectionName);
