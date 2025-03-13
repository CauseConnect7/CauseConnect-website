const express = require("express");
const router = express.Router();
const Profile = require("../models/Profile");
const authenticateToken = require("../middleware/authenticateToken");
// const OpenAI = require("openai");
const mongoose = require("mongoose");
const axios = require("axios"); // 添加 axios 用于 API 请求
require("dotenv").config();

// Define Organization model (only once)
const Organization =
  mongoose.models.organizations ||
  mongoose.model(
    "organizations",
    new mongoose.Schema({}, { strict: false }),
    "organizations"
  );

// 外部 API 基础 URL
const EXTERNAL_API_URL = "https://causeconnect-api.onrender.com";

// Configure OpenAI
// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// Save partner search information
router.post("/search", authenticateToken, async (req, res) => {
  try {
    const { location, organizationType, partnershipGoal } = req.body;
    const userId = req.user.userId;

    let profile = await Profile.findOne({ userId });

    if (profile) {
      profile.partnerSearch = {
        location,
        organizationType,
        partnershipGoal,
      };
      profile.updatedAt = Date.now();
      await profile.save();
    } else {
      profile = await Profile.create({
        userId,
        partnerSearch: {
          location,
          organizationType,
          partnershipGoal,
        },
      });
    }

    res.status(200).json({
      code: 0,
      message: "Partner search information saved",
      data: profile,
    });
  } catch (error) {
    console.error("Error saving partner search information:", error);
    res.status(500).json({
      code: 1,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// 注释掉之前的匹配函数
// async function generateIdealOrganization(searchParams) {
//   try {
//     const systemPrompt = process.env.PROMPT_GEN_ORG_SYSTEM.replace(
//       "{org_type_looking_for}",
//       searchParams.organizationType
//     );

//     const userPrompt = process.env.PROMPT_GEN_ORG_USER.replace(
//       "{org_type_looking_for}",
//       searchParams.organizationType
//     ).replace("{partnership_description}", searchParams.partnershipGoal);

//     const response = await openai.chat.completions.create({
//       model: "gpt-4o-mini",
//       messages: [
//         { role: "system", content: systemPrompt },
//         { role: "user", content: userPrompt },
//       ],
//     });

//     return response.choices[0].message.content;
//   } catch (error) {
//     console.error("Error generating ideal organization:", error);
//     throw error;
//   }
// }

// // Generate tags
// async function generateTags(description) {
//   try {
//     const totalTags = 30;
//     const steps = 6;
//     const tagsPerStep = 5;

//     const systemPrompt = process.env.PROMPT_TAGS_SYSTEM.replace(
//       "{total_tags}",
//       totalTags
//     )
//       .replace("{steps}", steps)
//       .replace("{tags_per_step}", tagsPerStep);

//     const userPrompt = process.env.PROMPT_TAGS_USER.replace(
//       "{total_tags}",
//       totalTags
//     ).replace("{description}", description);

//     const response = await openai.chat.completions.create({
//       model: "gpt-4o-mini",
//       messages: [
//         { role: "system", content: systemPrompt },
//         { role: "user", content: userPrompt },
//       ],
//     });

//     return response.choices[0].message.content
//       .split(",")
//       .map((tag) => tag.trim());
//   } catch (error) {
//     console.error("Error generating tags:", error);
//     throw error;
//   }
// }

// // Generate embedding
// async function generateEmbedding(text) {
//   try {
//     const response = await openai.embeddings.create({
//       model: "text-embedding-ada-002",
//       input: text,
//     });
//     return response.data[0].embedding;
//   } catch (error) {
//     console.error("Error generating embedding:", error);
//     throw error;
//   }
// }

// // Calculate cosine similarity
// function cosineSimilarity(vecA, vecB) {
//   const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
//   const normA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
//   const normB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
//   return dotProduct / (normA * normB);
// }

// // Evaluate match with GPT
// async function evaluateMatch(userOrg, matchOrg) {
//   try {
//     const prompt = process.env.MATCH_EVALUATION_PROMPT.replace(
//       "{user_type}",
//       userOrg.type
//     )
//       .replace("{user_description}", userOrg.description)
//       .replace("{user_target_audience}", userOrg.targetAudience)
//       .replace("{user_looking_type}", userOrg.lookingForType)
//       .replace("{user_partnership_desc}", userOrg.partnershipDesc)
//       .replace("{match_name}", matchOrg.name)
//       .replace("{match_description}", matchOrg.description)
//       .replace("{match_linkedin_desc}", matchOrg.linkedinDesc || "")
//       .replace("{match_tagline}", matchOrg.tagline || "")
//       .replace("{match_type}", matchOrg.type)
//       .replace("{match_industry}", matchOrg.industry)
//       .replace("{match_specialties}", matchOrg.specialties || "")
//       .replace("{match_tags}", matchOrg.tags || "");

//     const response = await openai.chat.completions.create({
//       model: "gpt-4o-mini",
//       messages: [
//         { role: "system", content: process.env.MATCH_EVALUATION_SYSTEM_PROMPT },
//         { role: "user", content: prompt },
//       ],
//       temperature: 0.3,
//     });

//     return response.choices[0].message.content.trim().toLowerCase() === "true";
//   } catch (error) {
//     console.error("Error evaluating match:", error);
//     return false;
//   }
// }

// 新的匹配函数 - 使用外部 API
async function findMatchesUsingExternalAPI(userProfile) {
  try {
    // 准备发送到外部 API 的数据
    const requestData = {
      Name: userProfile.orgName || "Unknown Organization",
      Type: userProfile.orgType || "Non Profit",
      Description: userProfile.mission_statement || "",
      "Target Audience": userProfile.target_audience || "",
      "Organization looking 1": userProfile.preferredOrgType || "Non Profit",
      "Organization looking 2":
        userProfile.partnerDescription ||
        userProfile.partnerSearch?.partnershipGoal ||
        "",
    };

    console.log("Sending data to external API:", requestData);

    // 调用外部 API
    const response = await axios.post(
      `${EXTERNAL_API_URL}/test/complete-matching-process`,
      requestData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // 返回匹配结果
    return response.data;
  } catch (error) {
    console.error("Error calling external matching API:", error);
    throw error;
  }
}

// Execute partner search
router.post("/find-partners", authenticateToken, async (req, res) => {
  try {
    console.log(
      "Starting partner search with new algorithm, parameters:",
      req.body
    );
    const { location, organizationType, partnershipGoal } = req.body;
    const userId = req.user.userId;

    // 获取用户完整的 profile 信息
    const userProfile = await Profile.findOne({ userId });
    if (!userProfile) {
      return res.status(404).json({
        code: 1,
        message: "User profile not found",
      });
    }

    // 确保 profile 中包含必要的搜索信息
    if (!userProfile.partnerSearch) {
      userProfile.partnerSearch = {
        location,
        organizationType,
        partnershipGoal,
      };
    }

    // 使用新的外部 API 匹配方法
    const matchResults = await findMatchesUsingExternalAPI(userProfile);
    console.log("External API match results:", matchResults);

    // 处理匹配结果
    let formattedResults = [];
    if (
      matchResults &&
      matchResults.matches &&
      Array.isArray(matchResults.matches)
    ) {
      formattedResults = matchResults.matches.map((match) => ({
        ...match,
        _id: match.id || mongoose.Types.ObjectId().toString(), // 确保每个结果有唯一 ID
        matchCategory: "✅ Good Match", // 简化匹配类别
        matchScore: 80, // 默认匹配分数
        Name: match.name || match.Name || "Unknown Organization",
        Description: match.description || match.Description || "",
        City: match.location || match.city || location || "",
        State: match.state || "",
        Organization_Type: match.type || match.Type || organizationType,
      }));
    }

    res.status(200).json({
      code: 0,
      message:
        formattedResults.length > 0
          ? "Matching complete"
          : "No suitable matches found",
      data: formattedResults,
      debug: {
        searchCriteria: {
          location,
          organizationType,
          partnershipGoal,
        },
        apiResponse: matchResults,
      },
    });
  } catch (error) {
    console.error("Error in partner search:", error);
    res.status(500).json({
      code: 1,
      message: "Error during search process",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
      debug: {
        errorName: error.name,
        errorMessage: error.message,
        errorStack: error.stack,
      },
    });
  }
});

module.exports = router;
