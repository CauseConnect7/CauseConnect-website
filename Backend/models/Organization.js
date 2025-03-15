const mongoose = require("mongoose");

const organizationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    // 从 ProfileTypePage 获取的组织类型
    orgType: {
      type: String,
      enum: ["nonprofit", "for-profit"], // 允许 "for-profit" 格式
      required: false, // 允许后续更新
    },
    // 从 ProfileDetailsPage 获取的详细信息
    name: {
      type: String,
      required: true,
    },
    // 行业分类和具体行业
    industryCategory: {
      type: String,
      required: false, // 允许从industry推断
    },
    industry: {
      type: String,
      required: true,
    },
    // 位置信息
    location: {
      state: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
    },
    mission_statement: {
      type: String,
      required: false,
    },
    core_values: [
      {
        type: String,
        required: false,
      },
    ],
    target_audience: {
      type: String,
      required: false,
    },
    website: {
      type: String,
      required: false,
    },
    // 从 Partner Search 页面获取的匹配信息
    partnerDescription: {
      type: String,
      required: false,
    },
    // 搜索偏好
    searchPreferences: {
      location: {
        type: String,
        required: false,
      },
      preferredOrgType: {
        type: String,
        required: false,
      },
    },
  },
  {
    timestamps: true,
  }
);

// 使用环境变量中指定的集合名称，默认为'profile'
const collectionName = process.env.MONGODB_COLLECTION_PROFILE || "profile";

const Organization = mongoose.model(
  "Organization",
  organizationSchema,
  collectionName
);

module.exports = Organization;
