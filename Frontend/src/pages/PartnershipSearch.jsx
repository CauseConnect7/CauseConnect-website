import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import heroImage from "../images/hero2.jpg";
import { useAuth } from "../context/AuthContext";

// API 基础 URL
const API_BASE_URL = "http://localhost:3001/api";

const PartnershipSearch = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    location: "",
    organizationType: "",
    partnershipGoal: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [profileData, setProfileData] = useState(null);

  // 检查用户是否已登录
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !user) {
      navigate("/signin");
    }
  }, [user, navigate]);

  // 加载用户之前保存的匹配信息
  useEffect(() => {
    const fetchOrganizationProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        console.log("正在获取组织个人资料...");
        const response = await fetch(`${API_BASE_URL}/profile`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          console.error("获取个人资料失败:", response.status);
          return;
        }

        const result = await response.json();
        console.log("获取到的组织资料:", result);

        if (result.code === 0 && result.data) {
          setProfileData(result.data);

          // 如果存在匹配信息，填充表单
          if (result.data.partnerDescription) {
            console.log(
              "找到之前保存的匹配信息 (partnerDescription):",
              result.data.partnerDescription
            );
            setFormData({
              ...formData,
              partnershipGoal: result.data.partnerDescription || "",
            });
          }

          // 检查是否有 partnerSearch 对象
          if (result.data.partnerSearch) {
            const partnerSearch = result.data.partnerSearch;
            console.log(
              "找到之前保存的匹配信息 (partnerSearch):",
              partnerSearch
            );
            setFormData({
              location: partnerSearch.location || "",
              organizationType: partnerSearch.orgType || "",
              partnershipGoal:
                partnerSearch.partnerDescription ||
                result.data.partnerDescription ||
                "",
            });
          } else {
            console.log("未找到之前保存的匹配信息");
          }
        }
      } catch (error) {
        console.error("获取组织信息时出错:", error);
      }
    };

    fetchOrganizationProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // 获取 token
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("未登录，请先登录");
      }

      // 验证表单数据
      if (!formData.location.trim()) {
        throw new Error("请输入位置信息");
      }

      if (!formData.organizationType) {
        throw new Error("请选择组织类型");
      }

      if (!formData.partnershipGoal.trim()) {
        throw new Error("请描述您寻找的组织类型");
      }

      // 准备要更新的数据
      const partnerSearchData = {
        location: formData.location.trim(),
        orgType: formData.organizationType,
        partnerDescription: formData.partnershipGoal.trim(),
      };

      console.log("准备保存匹配信息:", partnerSearchData);

      // 尝试直接更新 partnerDescription 字段
      try {
        console.log("尝试直接更新 partnerDescription 字段");
        const directUpdateResponse = await fetch(`${API_BASE_URL}/profile`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            partnerDescription: formData.partnershipGoal.trim(),
          }),
        });

        const directUpdateText = await directUpdateResponse.text();
        console.log("直接更新响应:", directUpdateText);

        if (!directUpdateResponse.ok) {
          console.error(
            "直接更新 partnerDescription 失败:",
            directUpdateResponse.status
          );
          throw new Error("直接更新失败");
        }

        console.log("直接更新 partnerDescription 成功");
      } catch (directUpdateError) {
        console.error("直接更新 partnerDescription 出错:", directUpdateError);

        // 如果直接更新失败，尝试获取当前 profile 并更新
        try {
          // 首先获取当前的 profile
          const profileResponse = await fetch(`${API_BASE_URL}/profile`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!profileResponse.ok) {
            throw new Error("获取当前资料失败");
          }

          const profileResult = await profileResponse.json();
          if (profileResult.code !== 0 || !profileResult.data) {
            throw new Error("获取当前资料失败");
          }

          const currentProfile = profileResult.data;
          console.log("当前资料:", currentProfile);

          // 更新 partnerDescription 字段和 partnerSearch 对象
          const updatedProfile = {
            ...currentProfile,
            partnerDescription: formData.partnershipGoal.trim(),
            partnerSearch: partnerSearchData,
          };

          // 删除可能导致问题的字段
          delete updatedProfile._id;
          delete updatedProfile.__v;
          delete updatedProfile.createdAt;
          delete updatedProfile.updatedAt;

          console.log("更新后的资料:", updatedProfile);

          // 发送更新请求
          const saveResponse = await fetch(`${API_BASE_URL}/profile`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(updatedProfile),
          });

          const saveResponseText = await saveResponse.text();
          console.log("保存响应原始文本:", saveResponseText);

          if (!saveResponse.ok) {
            console.error(
              "保存匹配信息失败:",
              saveResponse.status,
              saveResponseText
            );
            throw new Error("保存匹配信息失败，请稍后再试");
          }

          try {
            const saveResult = JSON.parse(saveResponseText);
            console.log("匹配信息保存成功:", saveResult);
          } catch (e) {
            console.warn("解析保存响应失败，但请求可能已成功:", e);
          }
        } catch (profileError) {
          console.error("更新整个 profile 失败:", profileError);
          throw new Error("保存匹配信息失败，请稍后再试");
        }
      }

      // 发送匹配请求获取结果
      console.log("正在获取匹配结果...");
      const matchingResponse = await fetch(
        `${API_BASE_URL}/profile/matching-preference`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            location: formData.location,
            targetOrgType: formData.organizationType,
            partnershipGoal: formData.partnershipGoal,
          }),
        }
      );

      if (!matchingResponse.ok) {
        const errorText = await matchingResponse.text();
        console.error("获取匹配结果失败:", matchingResponse.status, errorText);

        // 即使匹配失败，也导航到结果页面
        navigate("/results", {
          state: {
            searchParams: formData,
            matchingResults: [],
            error: "获取匹配结果失败，但您的匹配信息已保存",
          },
        });
        return;
      }

      const matchingData = await matchingResponse.json();
      console.log("匹配结果获取成功:", matchingData);

      // 导航到结果页面，并传递搜索参数
      navigate("/results", {
        state: {
          searchParams: formData,
          matchingResults: matchingData.results || [],
        },
      });
    } catch (error) {
      console.error("匹配过程错误:", error);
      setError(error.message || "提交表单时出错");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* 背景图片和滤镜效果 */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Background"
          className="w-full h-full object-cover"
          style={{
            filter: "brightness(0.65) saturate(0.8) hue-rotate(10deg)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom right, rgba(49, 163, 159, 0.1), rgba(72, 187, 177, 0.2))",
            mixBlendMode: "multiply",
          }}
        />
      </div>

      {/* 返回按钮 - 更强调的设计 */}
      <div
        onClick={() => {
          console.log("返回按钮被点击");
          // 使用最直接的方式导航
          window.location.href = "/home";
        }}
        className="absolute top-8 left-8 text-white hover:text-teal-100 z-20 flex items-center gap-2 transition-all duration-300 group border-none bg-teal-500/30 backdrop-blur-md px-4 py-2 rounded-full cursor-pointer hover:bg-teal-500/50 shadow-lg"
      >
        <div className="bg-white/20 p-2 rounded-full group-hover:bg-white/40 transition-all duration-300">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
        </div>
        <span className="text-sm font-medium">Back</span>
      </div>

      {/* 主要内容 */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-3xl text-center mb-12">
          <h1 className="text-6xl font-bold text-white tracking-tight whitespace-nowrap">
            Let's Find Your Perfect Partner
          </h1>
        </div>

        <div className="w-full max-w-3xl bg-white/10 backdrop-blur-md rounded-3xl p-10 shadow-2xl border border-white/20">
          {error && (
            <div className="mb-6 p-4 bg-red-900/30 border border-red-400 rounded-lg">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Location 和 Organization Type 在同一行 */}
            <div className="grid grid-cols-2 gap-6">
              {/* Location */}
              <div className="space-y-2">
                <label className="block text-white text-sm font-medium pl-1">
                  Location
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-white/60"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300"
                    placeholder="Enter location"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Organization Type */}
              <div className="space-y-2">
                <label className="block text-white text-sm font-medium pl-1">
                  Organization Type
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-white/60"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  </div>
                  <select
                    className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/30 rounded-xl text-white appearance-none focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300"
                    value={formData.organizationType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        organizationType: e.target.value,
                      })
                    }
                  >
                    <option value="" className="text-gray-900">
                      Select type
                    </option>
                    <option value="nonprofit" className="text-gray-900">
                      Nonprofit
                    </option>
                    <option value="forprofit" className="text-gray-900">
                      For-profit
                    </option>
                  </select>
                </div>
              </div>
            </div>

            {/* Partnership Goal - 减小高度 */}
            <div className="space-y-2">
              <label className="block text-white text-sm font-medium pl-1">
                What Kind of Organization Are You Looking For?
              </label>
              <div className="relative">
                <div className="absolute left-4 top-4 pointer-events-none">
                  <svg
                    className="h-5 w-5 text-white/60"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </div>
                <textarea
                  className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300 h-24 resize-none"
                  placeholder="Describe your ideal partnership..."
                  value={formData.partnershipGoal}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      partnershipGoal: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 flex flex-col items-center">
              <button
                type="submit"
                className="bg-teal-500 hover:bg-teal-400 text-white font-medium py-3 px-12 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-70 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </div>
                ) : (
                  "Find Partners"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PartnershipSearch;
