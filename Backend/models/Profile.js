const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    // 基本资料信息（您已经实现的部分）
    orgType: {
      type: String,
    },
    orgName: {
      type: String,
    },
    location: {
      type: String,
    },
    homepage: {
      type: String,
    },
    coreValues: {
      type: String,
    },
    fieldOfInterest: {
      type: String,
    },

    // 伙伴搜索相关信息（新增部分）
    partnerSearch: {
      location: {
        type: String,
      },
      organizationType: {
        type: String,
      },
      partnershipGoal: {
        type: String,
      },
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// 使用环境变量中指定的集合名称，默认为'profile'
const collectionName = process.env.MONGODB_COLLECTION_PROFILE || "profile";

module.exports = mongoose.model("Profile", profileSchema, collectionName);
