import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import ForceGraph2D from "react-force-graph-2d";
import { useAuth } from "../context/AuthContext";
import logo from "../images/logo.svg";

// API 基础 URL
const API_BASE_URL = "http://localhost:3001/api";

export default function ResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("match");
  const [results, setResults] = useState([]);
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchParams, setSearchParams] = useState(
    location.state?.searchParams || {}
  );
  const [activeFilters, setActiveFilters] = useState([
    { type: "industry", value: "Clean Energy" },
    { type: "orgType", value: "Non-Profit" },
    { type: "location", value: "Seattle" },
  ]);

  // 添加点击外部关闭菜单的处理函数
  useEffect(() => {
    const closeMenu = (e) => {
      if (isProfileMenuOpen && !e.target.closest(".profile-menu-container")) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener("click", closeMenu);
    return () => document.removeEventListener("click", closeMenu);
  }, [isProfileMenuOpen]);

  // 页面加载时获取数据
  useEffect(() => {
    if (location.state?.searchParams) {
      fetchMatchingResults();
    }
  }, [location.state]);

  const fetchMatchingResults = async () => {
    try {
      setIsLoading(true);
      setError("");

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("请先登录");
      }

      const response = await fetch(
        `${API_BASE_URL}/partner-search/find-partners`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(searchParams),
        }
      );

      if (!response.ok) {
        throw new Error("获取匹配结果失败");
      }

      const data = await response.json();
      if (data.code === 0 && data.data) {
        setResults(data.data);
        generateGraphData(data.data);
      } else {
        setError(data.message || "未找到匹配结果");
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const generateGraphData = (matchResults) => {
    if (!matchResults || matchResults.length === 0) {
      setGraphData({ nodes: [], links: [] });
      return;
    }

    const nodes = matchResults.map((result) => ({
      id: result._id,
      name: result.name || result.orgName || result.Name,
      matchCategory: result.matchCategory,
      score: result.matchScore,
      color: getColorByCategory(result.matchCategory),
    }));

    nodes.push({
      id: "current-user",
      name: user?.orgName || "Your Organization",
      color: "#4CAF50",
    });

    const links = nodes
      .filter((node) => node.id !== "current-user")
      .map((node) => ({
        source: "current-user",
        target: node.id,
        value: (node.score || 50) / 100,
      }));

    setGraphData({ nodes, links });
  };

  const getColorByCategory = (category) => {
    const colorMap = {
      "🌟 极佳匹配": "#4CAF50",
      "⭐ Excellent Match": "#4CAF50",
      "Perfect Match": "#4CAF50",
      "✅ 良好匹配": "#2196F3",
      "✅ Good Match": "#2196F3",
      "Good Match": "#2196F3",
      "🟡 一般匹配": "#FFC107",
      "🟡 Average Match": "#FFC107",
      "🔴 低匹配": "#FF5722",
      "🔴 Low Match": "#FF5722",
      "⚫️ 不匹配": "#9E9E9E",
    };
    return colorMap[category] || "#9E9E9E";
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const filteredResults = results.filter(
      (result) =>
        (
          result.name?.toLowerCase() ||
          result.Name?.toLowerCase() ||
          ""
        ).includes(searchQuery.toLowerCase()) ||
        (
          result.location?.toLowerCase() ||
          result.City?.toLowerCase() ||
          ""
        ).includes(searchQuery.toLowerCase())
    );
    setResults(filteredResults);
  };

  const handleReset = () => {
    setSearchQuery("");
    fetchMatchingResults();
  };

  const removeFilter = (filter) => {
    setActiveFilters(activeFilters.filter((f) => f.value !== filter.value));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <div
        className="App-header"
        style={{ height: "auto", minHeight: "auto", padding: "0" }}
      >
        <nav>
          <div className="logo">
            <img src={logo} alt="logo" />
            <span>CauseConnect</span>
          </div>
          <div className="nav-links">
            <a href="#">Explore</a>
            <Link to="/partnership-search">Partnership</Link>
            <a href="#">Solutions</a>
            <div className="profile-menu-container relative">
              <div
                className="flex items-center gap-1 ml-4 cursor-pointer"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              >
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <span className="text-sm text-gray-700 font-medium">
                  {user?.orgName}
                </span>
                <svg
                  className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                    isProfileMenuOpen ? "transform rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>

              {/* 下拉菜单 */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                  <div className="py-1">
                    <a
                      href="#"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Profile Settings
                    </a>
                    <button
                      onClick={() => {
                        localStorage.removeItem("token");
                        window.location.href = "/";
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </nav>
      </div>

      {/* 主要内容区域 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            Partnerships for you
          </h1>
        </div>

        {/* 搜索和过滤区域 - 全宽度设计 */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex flex-col sm:flex-row gap-4 w-full items-center mb-4">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Clean energy"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <button
                  className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-1"
                  onClick={() => {}}
                >
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
                      d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
                    />
                  </svg>
                  <span>Sort by</span>
                </button>

                <button
                  className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-1"
                  onClick={() => {}}
                >
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
                      d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                    />
                  </svg>
                  <span>Filter</span>
                </button>

                <button
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  onClick={handleSearch}
                >
                  AI Suggestions
                </button>
              </div>
            </div>

            {/* 活跃的过滤器标签 */}
            <div className="flex flex-wrap gap-2">
              {activeFilters.map((filter, index) => (
                <div
                  key={index}
                  className="flex items-center bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm"
                >
                  <span>{filter.value}</span>
                  <button
                    className="ml-2 text-gray-500 hover:text-gray-700"
                    onClick={() => removeFilter(filter)}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* 左侧结果列表 */}
          <div className="w-full lg:w-1/2">
            {/* 错误提示 */}
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            {/* 加载状态 */}
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <svg
                  className="animate-spin h-10 w-10 text-teal-500"
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
            ) : (
              <>
                {/* 结果列表 */}
                {results.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-gray-500">
                      未找到匹配的合作伙伴。请尝试调整搜索条件。
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {results.map((result) => (
                      <div
                        key={result._id}
                        className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                      >
                        <div className="p-5">
                          {/* 卡片头部 */}
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-grow">
                              <h3 className="text-xl font-semibold text-gray-900">
                                {result.Name || result.name || "未知组织"}
                              </h3>
                              <p className="text-gray-500 text-sm">
                                {result.City ? `${result.City}, ` : ""}
                                {result.State || ""}
                              </p>
                            </div>
                            {result.matchCategory && (
                              <span
                                className="px-3 py-1 text-sm rounded-full font-medium"
                                style={{
                                  backgroundColor: `${getColorByCategory(
                                    result.matchCategory
                                  )}20`,
                                  color: getColorByCategory(
                                    result.matchCategory
                                  ),
                                }}
                              >
                                {result.matchCategory}
                              </span>
                            )}
                          </div>

                          {/* 标签 */}
                          <div className="flex flex-wrap gap-2 my-3">
                            {result.Organization_Type && (
                              <span className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-full">
                                {result.Organization_Type}
                              </span>
                            )}
                            {(result.linkedin_industries ||
                              result.industries) &&
                              (result.linkedin_industries || result.industries)
                                .split(",")
                                .slice(0, 2)
                                .map((industry, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-1 bg-green-50 text-green-600 text-xs rounded-full"
                                  >
                                    {industry.trim()}
                                  </span>
                                ))}
                            {(result.linkedin_specialities ||
                              result.specialties) &&
                              (
                                result.linkedin_specialities ||
                                result.specialties
                              )
                                .split(",")
                                .slice(0, 1)
                                .map((specialty, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-1 bg-amber-50 text-amber-600 text-xs rounded-full"
                                  >
                                    {specialty.trim()}
                                  </span>
                                ))}
                          </div>

                          {/* 组织描述 */}
                          {(result.Description ||
                            result.linkedin_description ||
                            result.description) && (
                            <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                              {result.Description ||
                                result.description ||
                                result.linkedin_description}
                            </p>
                          )}

                          {/* 链接 */}
                          <div className="flex gap-4 mt-4 pt-2 border-t border-gray-100">
                            {result.URL && (
                              <a
                                href={result.URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center text-teal-500 hover:text-teal-600 text-sm"
                              >
                                <svg
                                  className="w-4 h-4 mr-1"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                  />
                                </svg>
                                Visit Website
                              </a>
                            )}
                            {result.linkedin_url && (
                              <a
                                href={result.linkedin_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center text-blue-600 hover:text-blue-700 text-sm"
                              >
                                <svg
                                  className="w-4 h-4 mr-1"
                                  fill="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                                </svg>
                                LinkedIn
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* 右侧网络图 */}
          <div className="w-full lg:w-1/2 bg-white rounded-xl shadow-sm p-4 mt-6 lg:mt-0">
            <h2 className="text-lg font-semibold mb-4">Network Map</h2>
            <div className="h-[600px]">
              {graphData.nodes.length > 0 ? (
                <ForceGraph2D
                  graphData={graphData}
                  nodeColor={(node) => node.color}
                  nodeLabel={(node) =>
                    `${node.name}${
                      node.matchCategory ? ` (${node.matchCategory})` : ""
                    }`
                  }
                  linkWidth={(link) => link.value * 3}
                  linkColor={() => "#ddd"}
                  nodeRelSize={6}
                  nodeSize={(node) => (node.id === "current-user" ? 10 : 6)}
                  backgroundColor="#ffffff"
                />
              ) : (
                <div className="flex justify-center items-center h-full">
                  <p className="text-gray-500">暂无数据可供可视化展示</p>
                </div>
              )}
            </div>
            {results.length > 0 && (
              <div className="mt-4 flex flex-wrap justify-end gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#4CAF50]"></span>
                  <span className="text-sm text-gray-600">🌟 极佳匹配</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#2196F3]"></span>
                  <span className="text-sm text-gray-600">✅ 良好匹配</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#FFC107]"></span>
                  <span className="text-sm text-gray-600">🟡 一般匹配</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#FF5722]"></span>
                  <span className="text-sm text-gray-600">🔴 低匹配</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#9E9E9E]"></span>
                  <span className="text-sm text-gray-600">⚫️ 不匹配</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
