const express = require("express");
const router = express.Router();
const Profile = require("../models/Profile");
const authenticateToken = require("../middleware/authenticateToken");
// const OpenAI = require("openai");
const mongoose = require("mongoose");
const { spawn } = require("child_process"); // 用于调用 Python 脚本
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

// 使用 Python 脚本调用外部 API 进行匹配
async function findMatchesUsingPythonScript(userProfile) {
  return new Promise((resolve, reject) => {
    try {
      console.log(
        "Calling Python script with user profile data:",
        JSON.stringify(userProfile, null, 2)
      );

      // 准备传递给Python脚本的参数，兼容不同的字段名称
      const name = userProfile.name || userProfile.orgName || "";
      const orgType = userProfile.orgType || "";
      const description = userProfile.mission_statement || "";

      // 确保正确获取target_audience字段
      let targetAudience = "";
      if (userProfile.target_audience) {
        targetAudience = userProfile.target_audience;
      } else if (userProfile.targetAudience) {
        targetAudience = userProfile.targetAudience;
      }

      // 如果target_audience的值是"1"，设置一个更有意义的值
      if (targetAudience === "1") {
        console.log("检测到target_audience值为'1'，设置为更有意义的值");
        targetAudience =
          "Healthcare professionals, patients, and medical facilities";
      }

      const preferredOrgType =
        userProfile.searchPreferences?.preferredOrgType || "";
      const partnershipDescription = userProfile.partnerDescription || "";

      // 添加行业信息
      const industry = userProfile.industry || "";
      const industryCategory = userProfile.industryCategory || "";

      console.log("准备传递给Python脚本的参数:", {
        name,
        orgType,
        description,
        targetAudience,
        preferredOrgType,
        partnershipDescription,
        industry,
        industryCategory,
      });

      // 检查partnershipDescription是否为"Pet"，如果是，设置为更有意义的值
      let finalPartnershipDescription = partnershipDescription;
      if (finalPartnershipDescription === "Pet") {
        console.log("检测到partnerDescription值为'Pet'，设置为更有意义的值");
        finalPartnershipDescription =
          "Looking for a nonprofit organization that supports animal welfare, pet adoption, and veterinary services for underserved communities";
      }

      // 调用 Python 脚本，传递用户的实际数据
      const pythonProcess = spawn("python3", [
        "./matching_api.py",
        name,
        orgType,
        description,
        targetAudience,
        preferredOrgType,
        finalPartnershipDescription,
        industry,
        industryCategory,
      ]);

      let dataString = "";
      let errorString = "";

      // 收集标准输出
      pythonProcess.stdout.on("data", (data) => {
        dataString += data.toString();
        console.log(`Python stdout: ${data}`); // 添加标准输出日志
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

          // 返回错误信息而不是抛出异常，以便前端能看到具体错误
          resolve({
            error: true,
            message: `Python script failed with code ${code}: ${errorString}`,
            status: "error",
            matching_results: {
              final_twenty_matches: [],
            },
          });
          return;
        }

        try {
          // 尝试从输出中提取 JSON
          const responseMatch = dataString.match(/Response:\s*(\{[\s\S]*\})/);
          if (responseMatch && responseMatch[1]) {
            const jsonStr = responseMatch[1];
            console.log("找到JSON响应:", jsonStr.substring(0, 200) + "..."); // 打印截断的JSON响应
            const result = JSON.parse(jsonStr);
            resolve(result);
          } else {
            console.error("Could not find JSON in Python output");
            console.error("Raw output:", dataString);

            // 返回错误信息
            resolve({
              error: true,
              message: "Could not parse Python script output",
              rawOutput: dataString,
              status: "error",
              matching_results: {
                final_twenty_matches: [],
              },
            });
          }
        } catch (error) {
          console.error("Failed to parse Python script output:", error);
          console.error("Raw output:", dataString);

          // 返回错误信息
          resolve({
            error: true,
            message: error.message,
            rawOutput: dataString,
            status: "error",
            matching_results: {
              final_twenty_matches: [],
            },
          });
        }
      });
    } catch (error) {
      console.error("Error executing Python script:", error);

      // 返回错误信息
      resolve({
        error: true,
        message: error.message,
        status: "error",
        matching_results: {
          final_twenty_matches: [],
        },
      });
    }
  });
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

    // 确保我们有最新的匹配信息
    console.log(
      "User profile before search:",
      JSON.stringify(userProfile, null, 2)
    );

    // 如果请求中包含新的匹配信息，则更新用户资料
    if (location || organizationType || partnershipGoal) {
      if (!userProfile.searchPreferences) {
        userProfile.searchPreferences = {};
      }

      // 处理location字段，确保它是字符串类型
      if (location) {
        if (typeof location === "object") {
          // A. 如果是对象，转换为字符串
          userProfile.searchPreferences.location =
            location.city || location.state || location;
        } else {
          userProfile.searchPreferences.location = location;
        }
      }

      if (organizationType)
        userProfile.searchPreferences.preferredOrgType = organizationType;
      if (partnershipGoal) userProfile.partnerDescription = partnershipGoal;

      // 保存更新后的资料
      try {
        await userProfile.save();
        console.log("Updated user profile with new search preferences");
      } catch (saveError) {
        console.error("保存用户资料时出错:", saveError);
        // 即使保存失败，也继续进行匹配
      }
    }

    // 检查是否有足够的匹配信息
    // 注意：数据库中字段名称可能是 name 而不是 orgName，mission_statement 而不是 missionStatement
    const hasName = userProfile.name || userProfile.orgName;
    const hasMissionStatement = userProfile.mission_statement;
    const hasPartnerDescription = userProfile.partnerDescription;

    console.log("检查必要字段:", {
      name: hasName,
      mission_statement: hasMissionStatement,
      partnerDescription: hasPartnerDescription,
      allFields: Object.keys(userProfile._doc || userProfile),
    });

    // 如果mission_statement的值是"1"，我们需要设置一个更有意义的值
    if (userProfile.mission_statement === "1") {
      console.log("检测到mission_statement值为'1'，设置为更有意义的值");
      userProfile.mission_statement =
        "To provide valuable services and products to our customers";
    }

    // 如果name的值是"1"，我们需要设置一个更有意义的值
    if (userProfile.name === "1") {
      console.log("检测到name值为'1'，使用orgName或设置为默认值");
      userProfile.name = userProfile.orgName || "Organization";
    }

    // 临时解决方案：如果缺少必要字段，但有partnerDescription，我们可以继续匹配
    if (!hasName || !hasMissionStatement) {
      console.warn(
        "缺少name或mission_statement字段，但有partnerDescription，继续匹配"
      );

      // 设置默认值
      if (!hasName) userProfile.name = "Organization";
      if (!hasMissionStatement)
        userProfile.mission_statement =
          "To provide valuable services and products to our customers";
    } else if (!hasPartnerDescription) {
      console.warn(
        "Missing essential profile information for matching: partnerDescription"
      );
      return res.status(400).json({
        code: 1,
        message: "缺少匹配所需的必要信息（合作伙伴描述）",
        missingFields: {
          partnerDescription: true,
        },
      });
    }

    // 使用 Python 脚本调用外部 API 进行匹配
    const matchResults = await findMatchesUsingPythonScript(userProfile);

    // 处理匹配结果中的错误
    if (matchResults.error) {
      console.error("匹配过程中出现错误:", matchResults.message);

      // 返回错误信息，但使用200状态码以便前端能解析
      return res.status(200).json({
        code: 1,
        message: "匹配过程中出现错误: " + matchResults.message,
        error: matchResults.message,
        debug: matchResults,
        results: [], // 返回空结果数组
      });
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
            match.evaluation?.is_match === true
              ? "✅ Good Match"
              : "🟡 Average Match", // 根据评估结果设置匹配类别
          matchScore: Math.round(match.similarity_score * 100) || 80, // 使用相似度分数
          Name: match.organization?.name || "Unknown Organization",
          Description: match.organization?.description || "",
          City:
            match.organization?.city ||
            userProfile.searchPreferences?.location ||
            "",
          State: match.organization?.state || "",
          Organization_Type:
            match.organization?.type ||
            userProfile.searchPreferences?.preferredOrgType,
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

    // 如果没有匹配结果，返回明确的消息
    if (formattedResults.length === 0) {
      // 检查是否有错误信息
      if (matchResults.error) {
        return res.status(200).json({
          code: 1,
          message:
            "匹配过程中出现错误: " + (matchResults.message || "未知错误"),
          error: matchResults.message || "未知错误",
          results: [],
        });
      }

      // 没有错误但也没有结果
      return res.status(200).json({
        code: 0,
        message: "未找到符合条件的匹配结果",
        results: [],
      });
    }

    // 返回成功匹配结果
    res.status(200).json({
      code: 0,
      message: "匹配结果获取成功",
      results: formattedResults,
      debug: {
        searchCriteria: {
          name: userProfile.name,
          orgType: userProfile.orgType,
          mission_statement: userProfile.mission_statement,
          target_audience: userProfile.target_audience,
          location: userProfile.searchPreferences?.location,
          preferredOrgType: userProfile.searchPreferences?.preferredOrgType,
          partnerDescription: userProfile.partnerDescription,
          industry: userProfile.industry,
          industryCategory: userProfile.industryCategory,
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
      message: "匹配过程中发生错误",
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
