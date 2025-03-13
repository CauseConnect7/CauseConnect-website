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
  // 添加展开状态的状态
  const [expandedCards, setExpandedCards] = useState({});
  // 添加选中的组织状态
  const [selectedOrganization, setSelectedOrganization] = useState(null);
  // 添加是否显示网络图的状态
  const [showGraph, setShowGraph] = useState(true);
  // 添加匹配建议状态
  const [matchSuggestions, setMatchSuggestions] = useState(null);
  // 添加匹配建议加载状态
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

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

  // 切换卡片展开状态的函数
  const toggleCardExpand = (id) => {
    setExpandedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // 处理卡片点击，显示组织详情
  const handleCardClick = (organization) => {
    setSelectedOrganization(organization);
    setShowGraph(false);
    // 获取匹配建议
    fetchMatchSuggestions(organization);
  };

  // 获取匹配建议
  const fetchMatchSuggestions = async (organization) => {
    try {
      setLoadingSuggestions(true);
      setMatchSuggestions(null);

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("请先登录");
      }

      // 准备请求数据
      const requestData = {
        user_org: {
          Description:
            user?.description || "致力于环保和可持续发展的非营利组织",
          Target_Audience: user?.targetAudience || "环保意识强的社区和企业",
        },
        match_org: {
          name: organization.Name || organization.name,
          description: organization.Description || organization.description,
          type: organization.Organization_Type || organization.type,
          industries:
            organization.linkedin_industries || organization.industries,
          specialities:
            organization.linkedin_specialities || organization.specialties,
        },
      };

      const response = await fetch(
        `${API_BASE_URL}/partner-search/test/analyze/match-reasons`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestData),
        }
      );

      if (!response.ok) {
        throw new Error("获取匹配建议失败");
      }

      const data = await response.json();
      if (data.status === "success") {
        setMatchSuggestions(data.analysis);
      } else {
        throw new Error(data.message || "获取匹配建议失败");
      }
    } catch (error) {
      console.error("获取匹配建议错误:", error);
      // 不显示错误给用户，只是不显示建议
    } finally {
      setLoadingSuggestions(false);
    }
  };

  // 返回网络图视图
  const handleBackToGraph = () => {
    setSelectedOrganization(null);
    setShowGraph(true);
    setMatchSuggestions(null);
  };

  // 格式化匹配建议，使其更加用户友好
  const formatMatchSuggestions = (suggestions) => {
    if (!suggestions) return "";

    // 处理整个文本
    let formatted = suggestions;

    // 替换标题格式（例如 "- Strategic Alignment and Shared Values:"）
    formatted = formatted.replace(/- ([^:]+):/g, (match, title) => {
      return `<div class="font-bold text-gray-800 mt-4 mb-2">${title}</div>`;
    });

    // 将文本分割成行
    const lines = formatted.split("\n");
    let result = "";
    let inList = false;
    let listItems = [];

    // 逐行处理
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // 跳过空行
      if (!line) continue;

      // 处理标题行（已经被替换为 <div> 标签）
      if (line.startsWith('<div class="font-bold')) {
        // 如果之前在处理列表，先关闭列表
        if (inList) {
          result +=
            '<ul class="list-disc ml-5 mb-3">' + listItems.join("") + "</ul>";
          inList = false;
          listItems = [];
        }

        result += line;
      }
      // 处理列表项
      else if (line.startsWith("- ")) {
        inList = true;
        listItems.push(`<li class="mb-1">${line.substring(2)}</li>`);
      }
      // 处理普通段落
      else {
        // 如果之前在处理列表，先关闭列表
        if (inList) {
          result +=
            '<ul class="list-disc ml-5 mb-3">' + listItems.join("") + "</ul>";
          inList = false;
          listItems = [];
        }

        result += `<p class="mb-2">${line}</p>`;
      }
    }

    // 处理最后可能剩余的列表项
    if (inList) {
      result +=
        '<ul class="list-disc ml-5 mb-3">' + listItems.join("") + "</ul>";
    }

    return result;
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
                  placeholder="keyword search"
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
                  className="px-4 py-2 bg-[#212F40] text-white rounded-lg hover:bg-[#2c3e50]"
                  onClick={handleSearch}
                >
                  Search
                </button>
              </div>
            </div>

            {/* 活跃的过滤器标签 */}
            {/* <div className="flex flex-wrap gap-2">
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
            </div> */}
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
                        className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden cursor-pointer ${
                          selectedOrganization &&
                          selectedOrganization._id === result._id
                            ? "border-2 border-teal-500 ring-2 ring-teal-200"
                            : ""
                        }`}
                        onClick={() => handleCardClick(result)}
                      >
                        <div className="p-5">
                          {/* 卡片头部 */}
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-grow pr-3">
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
                                className="px-3 py-1 text-sm rounded-full font-medium whitespace-nowrap min-w-[110px] text-center flex-shrink-0"
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
                            <p
                              className={`text-gray-600 text-sm mb-4 ${
                                expandedCards[result._id] ? "" : "line-clamp-3"
                              }`}
                            >
                              {result.Description ||
                                result.description ||
                                result.linkedin_description}
                            </p>
                          )}

                          {/* 展开/收起按钮 */}
                          {(result.Description ||
                            result.linkedin_description ||
                            result.description) && (
                            <button
                              onClick={() => toggleCardExpand(result._id)}
                              className="text-sm text-gray-500 hover:text-gray-700 flex items-center mb-2"
                            >
                              {expandedCards[result._id]
                                ? "Show less"
                                : "Show more"}
                              <svg
                                className={`w-4 h-4 ml-1 transition-transform ${
                                  expandedCards[result._id] ? "rotate-180" : ""
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
                            </button>
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
            {showGraph ? (
              <>
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
              </>
            ) : (
              <>
                {/* 组织详情视图 */}
                <div className="flex justify-between items-center mb-6 pb-3 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-800">
                    Organization Details
                  </h2>
                  <button
                    onClick={handleBackToGraph}
                    className="text-sm text-gray-600 hover:text-gray-900 flex items-center bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors"
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
                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                      />
                    </svg>
                    Back to Network
                  </button>
                </div>

                {selectedOrganization && (
                  <div className="space-y-6">
                    {/* 组织名称和匹配分数 */}
                    <div className="flex justify-between items-start bg-gray-50 p-4 rounded-lg shadow-sm">
                      <h3 className="text-xl font-semibold text-gray-900 pr-4 flex-1">
                        {selectedOrganization.Name ||
                          selectedOrganization.name ||
                          "未知组织"}
                      </h3>
                      {selectedOrganization.matchCategory && (
                        <span
                          className="px-4 py-1.5 text-sm rounded-full font-medium shadow-sm whitespace-nowrap min-w-[120px] text-center flex-shrink-0"
                          style={{
                            backgroundColor: `${getColorByCategory(
                              selectedOrganization.matchCategory
                            )}20`,
                            color: getColorByCategory(
                              selectedOrganization.matchCategory
                            ),
                          }}
                        >
                          {selectedOrganization.matchCategory}
                        </span>
                      )}
                    </div>

                    {/* 匹配分数 */}
                    <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                      <div className="flex justify-between mb-3">
                        <span className="text-base font-semibold text-gray-800">
                          Match Score
                        </span>
                        <span className="text-lg font-bold text-gray-900">
                          {selectedOrganization.matchScore}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="h-3 rounded-full"
                          style={{
                            width: `${selectedOrganization.matchScore}%`,
                            backgroundColor: getColorByCategory(
                              selectedOrganization.matchCategory
                            ),
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* 基本信息 */}
                    <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                      <h4 className="text-base font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">
                        Basic Information
                      </h4>
                      <div className="grid grid-cols-2 gap-5">
                        <div className="bg-gray-50 p-3 rounded-md">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                            Location
                          </p>
                          <p className="text-sm font-medium text-gray-900">
                            {selectedOrganization.City
                              ? `${selectedOrganization.City}, `
                              : ""}
                            {selectedOrganization.State || "未知"}
                          </p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-md">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                            Organization Type
                          </p>
                          <p className="text-sm font-medium text-gray-900">
                            {selectedOrganization.Organization_Type ||
                              selectedOrganization.type ||
                              "未知"}
                          </p>
                        </div>
                        {selectedOrganization.staff_count && (
                          <div className="bg-gray-50 p-3 rounded-md">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                              Staff Count
                            </p>
                            <p className="text-sm font-medium text-gray-900">
                              {selectedOrganization.staff_count}
                            </p>
                          </div>
                        )}
                        {selectedOrganization.linkedin_industries && (
                          <div className="bg-gray-50 p-3 rounded-md">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                              Industry
                            </p>
                            <p className="text-sm font-medium text-gray-900">
                              {selectedOrganization.linkedin_industries}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 描述 */}
                    {(selectedOrganization.Description ||
                      selectedOrganization.description) && (
                      <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                        <h4 className="text-base font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">
                          Organization Description
                        </h4>
                        <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                          {selectedOrganization.Description ||
                            selectedOrganization.description}
                        </p>
                      </div>
                    )}

                    {/* LinkedIn 描述 */}
                    {selectedOrganization.linkedin_description && (
                      <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                        <h4 className="text-base font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">
                          LinkedIn Description
                        </h4>
                        <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                          {selectedOrganization.linkedin_description}
                        </p>
                      </div>
                    )}

                    {/* 标签 */}
                    {selectedOrganization.tags && (
                      <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                        <h4 className="text-base font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">
                          Tags
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedOrganization.tags
                            .split(",")
                            .map((tag, index) => (
                              <span
                                key={index}
                                className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs rounded-full font-medium"
                              >
                                {tag.trim()}
                              </span>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* 专业领域 */}
                    {selectedOrganization.linkedin_specialities && (
                      <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                        <h4 className="text-base font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">
                          Specialties
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedOrganization.linkedin_specialities
                            .split(",")
                            .map((specialty, index) => (
                              <span
                                key={index}
                                className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs rounded-full font-medium"
                              >
                                {specialty.trim()}
                              </span>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* 匹配建议 */}
                    <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                      <h4 className="text-base font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">
                        Partnership Suggestions
                      </h4>
                      {loadingSuggestions ? (
                        <div className="flex items-center justify-center py-6">
                          <svg
                            className="animate-spin h-6 w-6 text-teal-500"
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
                      ) : matchSuggestions ? (
                        <div className="bg-teal-50 p-4 rounded-lg border border-teal-100">
                          <div className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                            {matchSuggestions}
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500 italic py-4 text-center">
                          Analyzing potential partnership opportunities...
                        </div>
                      )}
                    </div>

                    {/* 链接 */}
                    <div className="flex gap-4 pt-4 mt-2">
                      {selectedOrganization.URL && (
                        <a
                          href={selectedOrganization.URL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex-1"
                        >
                          <svg
                            className="w-4 h-4 mr-2"
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
                      {selectedOrganization.linkedin_url && (
                        <a
                          href={selectedOrganization.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex-1"
                        >
                          <svg
                            className="w-4 h-4 mr-2"
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
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
