import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import heroImage from "../images/hero4.jpg"; // 导入相同的背景图片

export default function ProfileTypePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedType, setSelectedType] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    console.log("ProfileTypePage: 页面加载");
    console.log("当前用户状态:", user);

    if (!user) {
      console.log("未检测到用户，准备重定向到登录页面");
      navigate("/signin");
    } else {
      console.log("检测到用户，允许访问页面");
      // 清除可能存在的错误信息
      setError("");
    }
  }, [user, navigate]);

  const handleTypeSelect = async (type) => {
    try {
      setIsLoading(true);
      setError("");
      setSelectedType(type);

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("未登录，请先登录");
      }

      // 调用API保存组织类型
      const response = await fetch("http://localhost:3001/api/profile/type", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ orgType: type }),
      });

      const data = await response.json();

      if (!response.ok) {
        // 处理特定的错误消息
        if (data.message === "Invalid organization type") {
          throw new Error("无效的组织类型，请选择有效的组织类型");
        } else {
          throw new Error(data.message || "保存组织类型失败");
        }
      }

      if (data.code === 0) {
        // 保存成功后，将类型存储在localStorage中供其他页面使用
        localStorage.setItem("orgType", type);
        // 导航到详细信息页面
        navigate("/profile-setup/details");
      } else {
        throw new Error(data.message || "未知错误");
      }
    } catch (error) {
      console.error("保存组织类型错误:", error);
      setError(error.message || "保存组织类型时出错");
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

      {/* 主内容 */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-20">
        <div className="w-full max-w-3xl text-center mb-12">
          <h1 className="text-5xl font-bold text-white tracking-tight whitespace-nowrap">
            Tell us about your organization
          </h1>
          <p className="mt-4 text-lg text-white/80">
            Select your organization type to help us provide better partnership
            matches
          </p>
        </div>

        <div className="w-full max-w-3xl bg-white/10 backdrop-blur-md rounded-3xl p-10 shadow-2xl border border-white/20">
          {error && (
            <div className="mb-6 text-red-300 bg-red-900/30 p-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="mt-8 space-y-6">
            <button
              onClick={() => handleTypeSelect("nonprofit")}
              disabled={isLoading}
              className={`w-full flex items-center justify-center px-8 py-6 ${
                selectedType === "nonprofit"
                  ? "bg-teal-500/30 border-teal-400"
                  : "bg-white/10 border-white/30 hover:bg-white/20"
              } border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300`}
            >
              <div className="text-left">
                <span className="text-3xl mb-2 inline-block">🌍</span>
                <h3 className="text-xl font-medium text-white">
                  We're Nonprofits
                </h3>
                <p className="text-sm text-white/70 mt-1">
                  NGOs, charities, and social organizations
                </p>
              </div>
              {isLoading && selectedType === "nonprofit" && (
                <div className="ml-3">
                  <svg
                    className="animate-spin h-6 w-6 text-white"
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
                </div>
              )}
            </button>

            <button
              onClick={() => handleTypeSelect("forprofit")}
              disabled={isLoading}
              className={`w-full flex items-center justify-center px-8 py-6 ${
                selectedType === "forprofit"
                  ? "bg-teal-500/30 border-teal-400"
                  : "bg-white/10 border-white/30 hover:bg-white/20"
              } border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300`}
            >
              <div className="text-left">
                <span className="text-3xl mb-2 inline-block">💼</span>
                <h3 className="text-xl font-medium text-white">
                  We're For-Profits
                </h3>
                <p className="text-sm text-white/70 mt-1">
                  Companies and businesses looking to make an impact
                </p>
              </div>
              {isLoading && selectedType === "forprofit" && (
                <div className="ml-3">
                  <svg
                    className="animate-spin h-6 w-6 text-white"
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
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
