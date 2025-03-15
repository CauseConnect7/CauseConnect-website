const express = require("express");
const router = express.Router();
const Profile = require("../models/Profile");
const authenticateToken = require("../middleware/authenticateToken");
// const OpenAI = require("openai");
const mongoose = require("mongoose");
const { spawn } = require("child_process"); // 用于调用 Python 脚本
const axios = require("axios"); // 使用axios替代fetch
require("dotenv").config();

// Define Organization model (only once)
const Organization =
  mongoose.models.organizations ||
  mongoose.model(
    "organizations",
    new mongoose.Schema({}, { strict: false }),
    "organizations"
  );

// 根据环境选择API基础URL
const isDevelopment = process.env.NODE_ENV === "development";

const API_BASE_URL = isDevelopment
  ? "http://localhost:3001/api"
  : "https://causeconnect-server.onrender.com/api";

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

// 使用 Python 脚本调用外部 API 进行匹配
async function findMatchesUsingPythonScript(userProfile) {
  return new Promise((resolve, reject) => {
    try {
      console.log("Calling Python script with user profile data");

      // 调用 Python 脚本，不传递参数，使用脚本中的示例数据
      const pythonProcess = spawn("python3", ["./matching_api.py"]);

      let dataString = "";
      let errorString = "";

      // 收集标准输出
      pythonProcess.stdout.on("data", (data) => {
        dataString += data.toString();
      });

      // 收集标准错误
      pythonProcess.stderr.on("data", (data) => {
        errorString += data.toString();
        console.error(`Python stderr: ${data}`);
      });

      // 脚本执行完成
      pythonProcess.on("close", (code) => {
        if (code !== 0) {
          console.error(`Python script exited with code ${code}`);
          console.error(`Error: ${errorString}`);
          reject(
            new Error(`Python script failed with code ${code}: ${errorString}`)
          );
          return;
        }

        try {
          // 尝试从输出中提取 JSON
          const responseMatch = dataString.match(/Response:\s*(\{[\s\S]*\})/);
          if (responseMatch && responseMatch[1]) {
            const jsonStr = responseMatch[1];
            const result = JSON.parse(jsonStr);
            resolve(result);
          } else {
            console.error("Could not find JSON in Python output");
            console.error("Raw output:", dataString);
            reject(new Error("Could not parse Python script output"));
          }
        } catch (error) {
          console.error("Failed to parse Python script output:", error);
          console.error("Raw output:", dataString);
          reject(error);
        }
      });
    } catch (error) {
      console.error("Error executing Python script:", error);
      reject(error);
    }
  });
}

// 使用外部API进行匹配
async function findMatchesUsingExternalAPI(userProfile) {
  try {
    const apiUrl =
      process.env.EXTERNAL_MATCH_API_URL ||
      "https://causeconnect-api.onrender.com/test/complete-matching-process";

    console.log(`调用外部匹配API: ${apiUrl}`);

    // 将userProfile转换为普通JavaScript对象
    const userProfileObj = userProfile.toObject
      ? userProfile.toObject()
      : JSON.parse(JSON.stringify(userProfile));

    // 构建与API期望格式一致的请求参数
    const requestBody = {
      Name: userProfileObj.name || "Unknown Organization",
      Type: userProfileObj.orgType || "for-profit",
      Description: userProfileObj.mission_statement || "",
      "Target Audience": userProfileObj.target_audience || "",
      "Organization looking 1":
        userProfileObj.searchPreferences?.preferredOrgType || "nonprofit",
      "Organization looking 2": userProfileObj.partnerDescription || "",
    };

    console.log(`修改后的请求参数: ${JSON.stringify(requestBody)}`);

    const response = await axios.post(apiUrl, requestBody, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error) {
    console.error("调用外部匹配API失败:", error.message);
    console.error(
      "错误详细信息:",
      error.response ? error.response.data : error
    );

    return {
      status: "error",
      message: "API调用失败，请稍后再试",
      matching_results: {
        successful_matches: [],
        remaining_matches: [],
        final_twenty_matches: [],
      },
    };
  }
}

// Execute partner search
router.post("/find-partners", authenticateToken, async (req, res) => {
  try {
    console.log(
      "Starting partner search with Python script, parameters:",
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

    let matchResults;
    if (process.env.USE_EXTERNAL_API === "true") {
      console.log("使用外部API进行匹配");
      matchResults = await findMatchesUsingExternalAPI(userProfile);
    } else {
      console.log("使用Python脚本进行匹配");
      matchResults = await findMatchesUsingPythonScript(userProfile);
    }

    // 使用 JSON.stringify 打印完整的匹配结果，但限制深度为 2 层
    console.log(
      "External API match results summary:",
      JSON.stringify(matchResults, null, 2)
    );

    // 打印成功匹配的组织详情
    if (
      matchResults.matching_results &&
      matchResults.matching_results.successful_matches
    ) {
      console.log(
        "成功匹配的组织:",
        JSON.stringify(
          matchResults.matching_results.successful_matches,
          null,
          2
        )
      );
    }

    // 打印最终的 20 个匹配结果中的前 3 个
    if (
      matchResults.matching_results &&
      matchResults.matching_results.final_twenty_matches
    ) {
      console.log(
        "最终匹配结果前 3 个:",
        JSON.stringify(
          matchResults.matching_results.final_twenty_matches.slice(0, 3),
          null,
          2
        )
      );
    }

    // 处理匹配结果
    let formattedResults = [];
    if (
      matchResults &&
      matchResults.matching_results &&
      matchResults.matching_results.final_twenty_matches &&
      Array.isArray(matchResults.matching_results.final_twenty_matches)
    ) {
      formattedResults = matchResults.matching_results.final_twenty_matches.map(
        (match) => ({
          ...match,
          _id:
            match.organization?.id || new mongoose.Types.ObjectId().toString(), // 使用 new 关键字创建 ObjectId
          matchCategory:
            match.similarity_score >= 0.8
              ? "✅ Good Match"
              : match.similarity_score >= 0.6
              ? "🟡 Average Match"
              : "🔵 Potential Match", // 根据相似度分数设置匹配类别，不再依赖is_match
          matchScore: Math.round(match.similarity_score * 100) || 80, // 使用相似度分数
          Name: match.organization?.name || "Unknown Organization",
          Description: match.organization?.description || "",
          City: match.organization?.city || location || "",
          State: match.organization?.state || "",
          Organization_Type: match.organization?.type || organizationType,
          linkedin_url: match.organization?.linkedin_url || "",
          URL: match.organization?.url || "",
          linkedin_industries: match.organization?.industries || "",
          linkedin_specialities: match.organization?.specialities || "",
        })
      );
    }

    // 打印格式化后的结果
    console.log(`格式化后的匹配结果 (${formattedResults.length} 个):`);
    if (formattedResults.length > 0) {
      console.log(
        "第一个匹配结果示例:",
        JSON.stringify(formattedResults[0], null, 2)
      );
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
        apiResponse: {
          status: matchResults.status,
          processSteps: matchResults.process_steps
            ? Object.keys(matchResults.process_steps)
            : [],
          matchingResultsSummary: {
            successfulMatchesCount:
              matchResults.matching_results?.successful_matches?.length || 0,
            remainingMatchesCount:
              matchResults.matching_results?.remaining_matches?.length || 0,
            finalMatchesCount:
              matchResults.matching_results?.final_twenty_matches?.length || 0,
          },
        },
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

// 分析匹配理由的 API
router.post(
  "/test/analyze/match-reasons",
  authenticateToken,
  async (req, res) => {
    try {
      const { user_org, match_org } = req.body;

      if (!user_org || !match_org) {
        return res.status(400).json({
          code: 1,
          message: "缺少必要的字段",
        });
      }

      // 调用 OpenAI API
      const openai = require("openai");
      const openaiClient = new openai.OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      const prompt = `
    Based on the following information, explain why these organizations would be good partners:
    
    User Organization:
    - Description: ${user_org.Description || "N/A"}
    - Target Audience: ${user_org.Target_Audience || "N/A"}
    
    Potential Partner:
    - Name: ${match_org.name || "N/A"}
    - Description: ${match_org.description || "N/A"}
    - Type: ${match_org.type || "N/A"}
    - Industries: ${match_org.industries || "N/A"}
    - Specialties: ${match_org.specialities || "N/A"}
    
    Please provide 2-3 key points about why this would be a good partnership.
    Focus on:
    1. Strategic alignment and shared values
    2. Complementary capabilities and resources
    3. Market and audience synergies
    
    Format your response with clear section headers followed by bullet points. For example:
    
    - Strategic Alignment and Shared Values:
    - Both organizations focus on environmental sustainability.
    - They share a commitment to community education.
    
    - Complementary Capabilities and Resources:
    - Organization A has strong digital presence while Organization B has established community networks.
    
    - Market and Audience Synergies:
    - Both target environmentally conscious consumers in urban areas.
    `;

      const response = await openaiClient.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are an expert in analyzing organizational partnerships. Format your response with clear section headers followed by bullet points.",
          },
          { role: "user", content: prompt },
        ],
      });

      return res.json({
        status: "success",
        analysis: response.choices[0].message.content.trim(),
      });
    } catch (error) {
      console.error("分析匹配理由错误:", error);
      return res.status(500).json({
        code: 1,
        message: "分析匹配理由失败",
        error: error.message,
      });
    }
  }
);

// 分析匹配风险的 API
router.post(
  "/test/analyze/match-risks",
  authenticateToken,
  async (req, res) => {
    try {
      const { user_org, match_org } = req.body;

      if (!user_org || !match_org) {
        return res.status(400).json({
          code: 1,
          message: "缺少必要的字段",
        });
      }

      // 调用 OpenAI API
      const openai = require("openai");
      const openaiClient = new openai.OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      const prompt = `
    Based on the following information, identify potential challenges or risks in this partnership:
    
    User Organization:
    - Description: ${user_org.Description || "N/A"}
    - Target Audience: ${user_org.Target_Audience || "N/A"}
    
    Potential Partner:
    - Name: ${match_org.name || "N/A"}
    - Description: ${match_org.description || "N/A"}
    - Type: ${match_org.type || "N/A"}
    - Industries: ${match_org.industries || "N/A"}
    - Specialties: ${match_org.specialities || "N/A"}
    
    Please identify 2-3 potential challenges or risks that might arise in this partnership.
    Consider:
    1. Misalignment in organizational values or goals
    2. Resource constraints or operational challenges
    3. Market positioning or audience conflicts
    
    Format your response in clear, concise bullet points.
    `;

      const response = await openaiClient.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are an expert in analyzing organizational partnerships.",
          },
          { role: "user", content: prompt },
        ],
      });

      return res.json({
        status: "success",
        analysis: response.choices[0].message.content.trim(),
      });
    } catch (error) {
      console.error("分析匹配风险错误:", error);
      return res.status(500).json({
        code: 1,
        message: "分析匹配风险失败",
        error: error.message,
      });
    }
  }
);

module.exports = router;
