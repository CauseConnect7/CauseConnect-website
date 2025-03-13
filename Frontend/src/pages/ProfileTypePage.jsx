import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

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
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            Tell us about your organization
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Select your organization type to help us provide better partnership
            matches
          </p>
          {error && (
            <p className="mt-2 text-center text-sm text-red-600">{error}</p>
          )}
        </div>

        <div className="mt-8 space-y-4">
          <button
            onClick={() => handleTypeSelect("nonprofit")}
            disabled={isLoading}
            className={`w-full flex items-center justify-center px-8 py-6 border-2 ${
              selectedType === "nonprofit"
                ? "border-teal-500"
                : "border-gray-300"
            } rounded-xl hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <div className="text-left">
              <span className="text-2xl mb-2">🌍</span>
              <h3 className="text-lg font-medium text-gray-900">
                We're Nonprofits
              </h3>
              <p className="text-sm text-gray-500">
                NGOs, charities, and social organizations
              </p>
            </div>
            {isLoading && selectedType === "nonprofit" && (
              <div className="ml-3">
                <svg
                  className="animate-spin h-5 w-5 text-gray-500"
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
            className={`w-full flex items-center justify-center px-8 py-6 border-2 ${
              selectedType === "forprofit"
                ? "border-teal-500"
                : "border-gray-300"
            } rounded-xl hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <div className="text-left">
              <span className="text-2xl mb-2">💼</span>
              <h3 className="text-lg font-medium text-gray-900">
                We're For-Profits
              </h3>
              <p className="text-sm text-gray-500">
                Companies and businesses looking to make an impact
              </p>
            </div>
            {isLoading && selectedType === "forprofit" && (
              <div className="ml-3">
                <svg
                  className="animate-spin h-5 w-5 text-gray-500"
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
  );
}
