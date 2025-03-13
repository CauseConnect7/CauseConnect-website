const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authenticateToken");
const Organization = require("../models/Organization");

// 获取组织信息
// GET /api/profile
router.get("/", authenticateToken, async (req, res) => {
  try {
    const organization = await Organization.findOne({
      userId: req.user.userId,
    });

    if (!organization) {
      return res.status(404).json({
        code: 1,
        message: "未找到组织信息",
      });
    }

    res.json({
      code: 0,
      data: organization,
    });
  } catch (error) {
    console.error("获取组织信息错误:", error);
    res.status(500).json({
      code: 1,
      message: "服务器错误",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// 创建或更新组织信息
// POST /api/profile
router.post("/", authenticateToken, async (req, res) => {
  try {
    console.log("接收到的请求数据:", req.body);

    // 获取现有的组织信息
    const existingOrg = await Organization.findOne({ userId: req.user.userId });

    // 如果没有找到现有组织且请求中没有orgType，返回错误
    if (!existingOrg?.orgType && !req.body.orgType) {
      return res.status(400).json({
        code: 1,
        message: "请先设置组织类型",
        redirect: "/profile-setup/type",
      });
    }

    const {
      name,
      industryCategory,
      industry,
      location,
      mission_statement,
      core_values,
      target_audience,
      website,
      orgType: requestOrgType,
      partnerDescription,
    } = req.body;

    // 保持现有的orgType，除非请求中明确指定了新的orgType
    const orgType = requestOrgType || existingOrg?.orgType;

    // 推断industryCategory
    let finalIndustryCategory = industryCategory;
    if (!finalIndustryCategory && industry) {
      finalIndustryCategory = inferIndustryCategoryFromIndustry(
        industry,
        orgType
      );
    }

    // 验证必需字段
    if (!name || !industry || !location || !location.state || !location.city) {
      return res.status(400).json({
        code: 1,
        message: "缺少必需字段",
        requiredFields: ["name", "industry", "location.state", "location.city"],
      });
    }

    // 处理website字段 - 不进行格式验证，直接使用提供的值或保持为空
    const websiteValue = website || "";

    // 查找并更新，如果不存在则创建
    const organization = await Organization.findOneAndUpdate(
      { userId: req.user.userId },
      {
        userId: req.user.userId,
        orgType, // 确保保存orgType
        name,
        industryCategory: finalIndustryCategory,
        industry,
        location: {
          state: location.state,
          city: location.city,
        },
        mission_statement,
        core_values: Array.isArray(core_values)
          ? core_values
          : core_values?.split(",").map((v) => v.trim()),
        target_audience,
        website: websiteValue, // 使用处理后的website值
        partnerDescription:
          partnerDescription || existingOrg?.partnerDescription,
      },
      { new: true, upsert: true }
    );

    res.json({
      code: 0,
      message: "组织信息已更新",
      data: organization,
    });
  } catch (error) {
    console.error("更新组织信息错误:", error);
    console.error("错误详情:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });

    res.status(500).json({
      code: 1,
      message: "服务器错误",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// 更新组织信息 - PUT方法
// PUT /api/profile
router.put("/", authenticateToken, async (req, res) => {
  try {
    console.log("接收到PUT请求数据:", req.body);

    // 获取现有的组织信息
    const existingOrg = await Organization.findOne({ userId: req.user.userId });

    if (!existingOrg) {
      return res.status(404).json({
        code: 1,
        message: "未找到组织信息，请先完成组织资料设置",
        redirect: "/profile-setup/type",
      });
    }

    // 如果只更新partnerDescription字段和匹配相关信息
    if (req.body.partnerDescription) {
      console.log("更新匹配相关信息:", {
        partnerDescription: req.body.partnerDescription,
        location: req.body.location,
        orgType: req.body.orgType,
      });

      // 准备更新数据
      const updateData = {
        partnerDescription: req.body.partnerDescription,
      };

      // 如果提供了location，也保存它
      if (req.body.location) {
        // 如果location是字符串，保存到searchPreferences
        if (typeof req.body.location === "string") {
          updateData.searchPreferences = {
            ...existingOrg.searchPreferences,
            location: req.body.location,
          };
        }
        // 如果location是对象，直接保存到location字段
        else if (
          typeof req.body.location === "object" &&
          req.body.location.state &&
          req.body.location.city
        ) {
          updateData.location = req.body.location;
        }
      }

      // 如果提供了orgType，也保存它
      if (req.body.orgType) {
        // 标准化orgType
        let standardOrgType = req.body.orgType.toLowerCase().trim();
        if (standardOrgType === "forprofit") standardOrgType = "for-profit";
        if (standardOrgType === "non-profit") standardOrgType = "nonprofit";

        updateData.orgType = standardOrgType;

        // 同时保存到searchPreferences
        updateData.searchPreferences = {
          ...(updateData.searchPreferences ||
            existingOrg.searchPreferences ||
            {}),
          preferredOrgType: standardOrgType,
        };
      }

      console.log("最终更新数据:", updateData);

      const organization = await Organization.findOneAndUpdate(
        { userId: req.user.userId },
        { $set: updateData },
        { new: true }
      );

      console.log("匹配信息更新成功:", {
        partnerDescription: organization.partnerDescription,
        location: organization.location,
        orgType: organization.orgType,
        searchPreferences: organization.searchPreferences,
      });

      return res.json({
        code: 0,
        message: "匹配信息已更新",
        data: organization,
      });
    }

    // 如果是完整更新
    const updateData = { ...req.body };

    // 删除不应该直接更新的字段
    delete updateData._id;
    delete updateData.__v;
    delete updateData.createdAt;
    delete updateData.updatedAt;
    delete updateData.userId; // 防止更改用户ID

    console.log("更新组织信息:", updateData);

    const organization = await Organization.findOneAndUpdate(
      { userId: req.user.userId },
      { $set: updateData },
      { new: true }
    );

    console.log("组织信息更新成功");

    res.json({
      code: 0,
      message: "组织信息已更新",
      data: organization,
    });
  } catch (error) {
    console.error("更新组织信息错误:", error);
    console.error("错误详情:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });

    res.status(500).json({
      code: 1,
      message: "服务器错误",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// 设置或更新组织类型
// POST /api/profile/type
router.post("/type", authenticateToken, async (req, res) => {
  try {
    console.log("接收到的组织类型数据:", req.body);

    const { orgType } = req.body;

    // 标准化组织类型（转换为小写并移除多余空格）
    const normalizedOrgType = orgType?.toLowerCase().trim();

    // 允许的组织类型列表（包括可能的变体）
    const allowedTypes = ["nonprofit", "non-profit", "for-profit", "forprofit"];

    if (!normalizedOrgType || !allowedTypes.includes(normalizedOrgType)) {
      return res.status(400).json({
        code: 1,
        message: "无效的组织类型",
        allowedTypes: ["nonprofit", "for-profit"],
        receivedType: normalizedOrgType,
      });
    }

    // 标准化为数据库中使用的格式
    let standardOrgType = normalizedOrgType;
    if (normalizedOrgType === "non-profit") standardOrgType = "nonprofit";
    if (normalizedOrgType === "forprofit") standardOrgType = "for-profit";

    // 获取现有的组织信息
    const existingOrg = await Organization.findOne({ userId: req.user.userId });

    // 更新或创建组织信息，保留现有的其他字段
    const organization = await Organization.findOneAndUpdate(
      { userId: req.user.userId },
      {
        $set: {
          userId: req.user.userId,
          orgType: standardOrgType,
        },
        $setOnInsert: {
          name: existingOrg?.name || "",
          industryCategory: existingOrg?.industryCategory || "",
          industry: existingOrg?.industry || "",
          location: existingOrg?.location || { state: "", city: "" },
          mission_statement: existingOrg?.mission_statement || "",
          core_values: existingOrg?.core_values || [],
          target_audience: existingOrg?.target_audience || "",
          website: existingOrg?.website || "",
          partnerDescription: existingOrg?.partnerDescription || "",
        },
      },
      { new: true, upsert: true }
    );

    console.log("组织类型已更新:", {
      userId: req.user.userId,
      orgType: standardOrgType,
      organization,
    });

    res.json({
      code: 0,
      message: "组织类型已更新",
      data: organization,
    });
  } catch (error) {
    console.error("更新组织类型错误:", error);
    res.status(500).json({
      code: 1,
      message: "服务器错误",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// 更新匹配信息
// POST /api/profile/partner-search
router.post("/partner-search", authenticateToken, async (req, res) => {
  try {
    console.log("接收到的匹配信息数据:", req.body);

    const { location, orgType, partnerDescription } = req.body;

    // 获取现有的组织信息
    const existingOrg = await Organization.findOne({ userId: req.user.userId });

    if (!existingOrg) {
      return res.status(404).json({
        code: 1,
        message: "未找到组织信息，请先完成组织资料设置",
        redirect: "/profile-setup/type",
      });
    }

    // 准备更新数据
    const updateData = {
      partnerDescription: partnerDescription,
      searchPreferences: {
        location: location || existingOrg.searchPreferences?.location,
        preferredOrgType:
          orgType || existingOrg.searchPreferences?.preferredOrgType,
      },
    };

    // 如果提供了orgType，也直接更新主文档中的orgType
    if (orgType) {
      // 标准化orgType
      let standardOrgType = orgType.toLowerCase().trim();
      if (standardOrgType === "forprofit") standardOrgType = "for-profit";
      if (standardOrgType === "non-profit") standardOrgType = "nonprofit";

      updateData.orgType = standardOrgType;
    }

    // 如果location是对象，直接更新主文档中的location
    if (
      location &&
      typeof location === "object" &&
      location.state &&
      location.city
    ) {
      updateData.location = location;
    }

    console.log("保存匹配信息:", updateData);

    // 更新组织信息
    const organization = await Organization.findOneAndUpdate(
      { userId: req.user.userId },
      { $set: updateData },
      { new: true }
    );

    console.log("匹配信息已更新:", {
      userId: req.user.userId,
      partnerDescription: organization.partnerDescription,
      location: organization.location,
      orgType: organization.orgType,
      searchPreferences: organization.searchPreferences,
    });

    res.json({
      code: 0,
      message: "匹配信息已更新",
      data: organization,
    });
  } catch (error) {
    console.error("更新匹配信息错误:", error);
    res.status(500).json({
      code: 1,
      message: "服务器错误",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// 匹配偏好 - 用于获取匹配结果
// POST /api/profile/matching-preference
router.post("/matching-preference", authenticateToken, async (req, res) => {
  try {
    console.log("接收到的匹配偏好数据:", req.body);

    const { location, targetOrgType, partnershipGoal } = req.body;

    // 同时更新用户的匹配信息
    if (location || targetOrgType || partnershipGoal) {
      // 获取现有的组织信息
      const existingOrg = await Organization.findOne({
        userId: req.user.userId,
      });

      if (existingOrg) {
        // 准备更新数据
        const updateData = {};

        // 如果提供了partnershipGoal，更新partnerDescription
        if (partnershipGoal) {
          updateData.partnerDescription = partnershipGoal;
        }

        // 如果提供了location，更新searchPreferences.location
        if (location) {
          updateData.searchPreferences = {
            ...(existingOrg.searchPreferences || {}),
            location: location,
          };
        }

        // 如果提供了targetOrgType，更新searchPreferences.preferredOrgType
        if (targetOrgType) {
          // 标准化orgType
          let standardOrgType = targetOrgType.toLowerCase().trim();
          if (standardOrgType === "forprofit") standardOrgType = "for-profit";
          if (standardOrgType === "non-profit") standardOrgType = "nonprofit";

          updateData.searchPreferences = {
            ...(updateData.searchPreferences ||
              existingOrg.searchPreferences ||
              {}),
            preferredOrgType: standardOrgType,
          };
        }

        if (Object.keys(updateData).length > 0) {
          console.log("自动更新匹配信息:", updateData);

          await Organization.findOneAndUpdate(
            { userId: req.user.userId },
            { $set: updateData },
            { new: true }
          );

          console.log("匹配信息自动更新成功");
        }
      }
    }

    try {
      // 尝试调用 Python 匹配服务
      const pythonServiceUrl =
        process.env.PYTHON_SERVICE_URL || "http://localhost:5000";
      console.log(
        `尝试调用 Python 匹配服务: ${pythonServiceUrl}/api/match_partners?user_id=${req.user.userId}`
      );

      const fetch = (await import("node-fetch")).default;
      const response = await fetch(
        `${pythonServiceUrl}/api/match_partners?user_id=${req.user.userId}`
      );

      if (response.ok) {
        const matchingData = await response.json();
        console.log("Python 匹配服务返回结果:", matchingData);
        return res.json(matchingData);
      } else {
        console.error("Python 匹配服务返回错误:", await response.text());
        // 如果 Python 服务调用失败，回退到模拟数据
        fallbackToMockData();
      }
    } catch (error) {
      console.error("调用 Python 匹配服务失败:", error);
      // 如果 Python 服务调用失败，回退到模拟数据
      fallbackToMockData();
    }

    // 回退到模拟数据的函数
    function fallbackToMockData() {
      console.log("使用模拟数据作为回退");
      res.json({
        code: 0,
        message: "匹配结果获取成功 (模拟数据)",
        results: [
          {
            id: "org1",
            name: "环保先锋组织",
            orgType: "nonprofit",
            industry: "Environmental Services",
            location: "New York City",
            description:
              "致力于减少塑料污染和推广可持续包装解决方案的非营利组织。",
            matchScore: 95,
            matchCategory: "🌟 极佳匹配 (Perfect Match)",
          },
          {
            id: "org2",
            name: "绿色包装创新",
            orgType: "forprofit",
            industry: "Packaging & Containers",
            location: "New York City",
            description: "专注于开发生物可降解食品包装的创新企业。",
            matchScore: 88,
            matchCategory: "✅ 良好匹配 (Good Match)",
          },
          {
            id: "org3",
            name: "可持续发展联盟",
            orgType: "nonprofit",
            industry: "Environmental Services",
            location: "Boston",
            description: "推动可持续发展实践和减少废弃物的非营利组织网络。",
            matchScore: 82,
            matchCategory: "✅ 良好匹配 (Good Match)",
          },
        ],
      });
    }
  } catch (error) {
    console.error("获取匹配结果错误:", error);
    res.status(500).json({
      code: 1,
      message: "服务器错误",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// 检查用户个人资料状态
// GET /api/profile/status
router.get("/status", authenticateToken, async (req, res) => {
  try {
    const organization = await Organization.findOne({
      userId: req.user.userId,
    });

    // 检查必需字段是否已填写
    const isProfileComplete = organization && organization.name && organization.industry && 
      organization.location && organization.location.state && organization.location.city;

    res.json({
      code: 0,
      data: {
        isProfileComplete: !!isProfileComplete
      }
    });
  } catch (error) {
    console.error("检查个人资料状态错误:", error);
    res.status(500).json({
      code: 1,
      message: "服务器错误",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// 辅助函数：根据industry和组织类型推断industryCategory
function inferIndustryCategoryFromIndustry(industry, orgType) {
  // 非营利组织的行业映射
  const NONPROFIT_INDUSTRY_MAP = {
    // Education & Youth Development
    "Higher Education": "Education & Youth Development",
    "Primary/Secondary Education": "Education & Youth Development",
    "E-Learning": "Education & Youth Development",
    "Youth Development": "Education & Youth Development",
    "Education Management": "Education & Youth Development",

    // Healthcare & Human Services
    "Hospital & Health Care": "Healthcare & Human Services",
    "Medical Devices": "Healthcare & Human Services",
    "Mental Health Care": "Healthcare & Human Services",
    "Social Services": "Healthcare & Human Services",
    "Public Health": "Healthcare & Human Services",

    // Environmental & Animal Welfare
    "Environmental Services": "Environmental & Animal Welfare",
    "Renewables & Environment": "Environmental & Animal Welfare",
    "Wildlife Conservation": "Environmental & Animal Welfare",
    "Animal Welfare": "Environmental & Animal Welfare",

    // Arts, Culture & Humanities
    "Museums & Institutions": "Arts, Culture & Humanities",
    "Performing Arts": "Arts, Culture & Humanities",
    "Civic & Social Organization": "Arts, Culture & Humanities",
    Libraries: "Arts, Culture & Humanities",

    // Community & Social Development
    "Non-profit Organizations": "Community & Social Development",
    Philanthropy: "Community & Social Development",
    "Human Rights": "Community & Social Development",
    "Public Policy": "Community & Social Development",
    "Disaster Relief": "Community & Social Development",
    "Social Justice": "Community & Social Development",
    "Government Administration": "Community & Social Development",
    "International Affairs": "Community & Social Development",

    // International Affairs & Development
    "International Trade & Development": "International Affairs & Development",
    "Foreign Policy": "International Affairs & Development",
    "Refugee Support": "International Affairs & Development",

    // Science & Technology Advancement
    Research: "Science & Technology Advancement",
    "Think Tanks": "Science & Technology Advancement",
    "Science & Technology Policy": "Science & Technology Advancement",
    "STEM Education": "Science & Technology Advancement",

    // Economic & Workforce Development
    "Economic Empowerment": "Economic & Workforce Development",
    "Job Training": "Economic & Workforce Development",
    "Workforce Development": "Economic & Workforce Development",
    "Small Business Support": "Economic & Workforce Development",

    // Government Administration
    "Public Policy & Governance": "Government Administration",
    "Public Services & Infrastructure": "Government Administration",
    "Public Safety & International Affairs": "Government Administration",
  };

  // 营利组织的行业映射
  const FORPROFIT_INDUSTRY_MAP = {
    // Technology & Software
    "Software Development": "Technology & Software",
    "Information Technology & Services": "Technology & Software",
    "Computer & Network Security": "Technology & Software",
    "Computer Games": "Technology & Software",
    Internet: "Technology & Software",
    Semiconductors: "Technology & Software",
    Telecommunications: "Technology & Software",

    // Finance & Banking
    Banking: "Finance & Banking",
    "Investment Banking": "Finance & Banking",
    "Investment Management": "Finance & Banking",
    "Financial Services": "Finance & Banking",
    Insurance: "Finance & Banking",

    // Healthcare & Pharmaceuticals
    "Hospital & Health Care": "Healthcare & Pharmaceuticals",
    "Medical Devices": "Healthcare & Pharmaceuticals",
    Pharmaceuticals: "Healthcare & Pharmaceuticals",
    "Alternative Medicine": "Healthcare & Pharmaceuticals",
    Biotechnology: "Healthcare & Pharmaceuticals",

    // Education & Research
    "Higher Education": "Education & Research",
    "E-Learning": "Education & Research",
    Research: "Education & Research",
    "Primary/Secondary Education": "Education & Research",
    "Think Tanks": "Education & Research",

    // Manufacturing & Engineering
    Manufacturing: "Manufacturing & Engineering",
    "Mechanical or Industrial Engineering": "Manufacturing & Engineering",
    Automotive: "Manufacturing & Engineering",
    "Aviation & Aerospace": "Manufacturing & Engineering",

    // Retail & Consumer Goods
    Retail: "Retail & Consumer Goods",
    "Consumer Goods": "Retail & Consumer Goods",
    "Food & Beverages": "Retail & Consumer Goods",
    "Luxury Goods & Jewelry": "Retail & Consumer Goods",
    "Apparel & Fashion": "Retail & Consumer Goods",

    // Media & Entertainment
    "Media Production": "Media & Entertainment",
    "Broadcast Media": "Media & Entertainment",
    Publishing: "Media & Entertainment",
    Entertainment: "Media & Entertainment",
    Music: "Media & Entertainment",
    "Motion Pictures & Film": "Media & Entertainment",

    // Energy & Environment
    "Renewables & Environment": "Energy & Environment",
    "Oil & Energy": "Energy & Environment",
    "Environmental Services": "Energy & Environment",
    Utilities: "Energy & Environment",
    "Mining & Metals": "Energy & Environment",

    // Construction & Real Estate
    Construction: "Construction & Real Estate",
    "Real Estate": "Construction & Real Estate",
    "Architecture & Planning": "Construction & Real Estate",
    "Civil Engineering": "Construction & Real Estate",

    // Transportation & Logistics
    "Transportation/Trucking/Railroad": "Transportation & Logistics",
    Maritime: "Transportation & Logistics",
    "Airlines & Aviation": "Transportation & Logistics",
    "Logistics & Supply Chain": "Transportation & Logistics",

    // Legal & Consulting
    "Legal Services": "Legal & Consulting",
    "Management Consulting": "Legal & Consulting",
    "Alternative Dispute Resolution": "Legal & Consulting",
    Accounting: "Legal & Consulting",
  };

  // 根据组织类型选择相应的映射
  // 处理不同格式的orgType
  const isNonprofit = orgType === "nonprofit" || orgType === "non-profit";
  const industryMap = isNonprofit
    ? NONPROFIT_INDUSTRY_MAP
    : FORPROFIT_INDUSTRY_MAP;

  // 返回映射的类别，如果没有找到匹配项则返回 "Other"
  return industryMap[industry] || "Other";
}

module.exports = router;
