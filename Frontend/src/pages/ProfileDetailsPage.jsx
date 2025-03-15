import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import heroImage from "../images/hero4.jpg";
import API_BASE_URL from "../config";

const NONPROFIT_INDUSTRIES = {
  "Education & Youth Development": [
    "Higher Education",
    "Primary/Secondary Education",
    "E-Learning",
    "Youth Development",
    "Education Management",
  ],
  "Healthcare & Human Services": [
    "Hospital & Health Care",
    "Medical Devices",
    "Mental Health Care",
    "Social Services",
    "Public Health",
  ],
  "Environmental & Animal Welfare": [
    "Environmental Services",
    "Renewables & Environment",
    "Wildlife Conservation",
    "Animal Welfare",
  ],
  "Arts, Culture & Humanities": [
    "Museums & Institutions",
    "Performing Arts",
    "Civic & Social Organization",
    "Libraries",
  ],
  "Community & Social Development": [
    "Non-profit Organizations",
    "Philanthropy",
    "Human Rights",
    "Public Policy",
    "Disaster Relief",
    "Social Justice",
    "Government Administration",
    "International Affairs",
  ],
  "International Affairs & Development": [
    "International Trade & Development",
    "International Affairs",
    "Foreign Policy",
    "Refugee Support",
  ],
  "Science & Technology Advancement": [
    "Research",
    "Think Tanks",
    "Science & Technology Policy",
    "STEM Education",
  ],
  "Economic & Workforce Development": [
    "Economic Empowerment",
    "Job Training",
    "Workforce Development",
    "Small Business Support",
  ],
  "Government Administration": [
    "Public Policy & Governance",
    "Public Services & Infrastructure",
    "Public Safety & International Affairs",
  ],
};

const FORPROFIT_INDUSTRIES = {
  "Technology & Software": [
    "Software Development",
    "Information Technology & Services",
    "Computer & Network Security",
    "Computer Games",
    "Internet",
    "Semiconductors",
    "Telecommunications",
  ],
  "Finance & Banking": [
    "Banking",
    "Investment Banking",
    "Investment Management",
    "Financial Services",
    "Insurance",
  ],
  "Healthcare & Pharmaceuticals": [
    "Hospital & Health Care",
    "Medical Devices",
    "Pharmaceuticals",
    "Alternative Medicine",
    "Biotechnology",
  ],
  "Education & Research": [
    "Higher Education",
    "E-Learning",
    "Research",
    "Primary/Secondary Education",
    "Think Tanks",
  ],
  "Manufacturing & Engineering": [
    "Manufacturing",
    "Mechanical or Industrial Engineering",
    "Automotive",
    "Aviation & Aerospace",
  ],
  "Retail & Consumer Goods": [
    "Retail",
    "Consumer Goods",
    "Food & Beverages",
    "Luxury Goods & Jewelry",
    "Apparel & Fashion",
  ],
  "Media & Entertainment": [
    "Media Production",
    "Broadcast Media",
    "Publishing",
    "Entertainment",
    "Music",
    "Motion Pictures & Film",
  ],
  "Energy & Environment": [
    "Renewables & Environment",
    "Oil & Energy",
    "Environmental Services",
    "Utilities",
    "Mining & Metals",
  ],
  "Construction & Real Estate": [
    "Construction",
    "Real Estate",
    "Architecture & Planning",
    "Civil Engineering",
  ],
  "Transportation & Logistics": [
    "Transportation/Trucking/Railroad",
    "Maritime",
    "Airlines & Aviation",
    "Logistics & Supply Chain",
  ],
  "Legal & Consulting": [
    "Legal Services",
    "Management Consulting",
    "Alternative Dispute Resolution",
    "Accounting",
  ],
};

const FIELDS_OF_INTEREST = [
  "Agriculture, Food, Nutrition",
  "Animal Related",
  "Arts, Culture, Humanities",
  "Civil Rights, Social Action, Advocacy",
  "Community Improvement, Capacity Building",
  "Crime, Legal Related",
  "Disease, Disorders, Medical Disciplines",
  "Educational Institutions",
  "Employment, Job Related",
  "Environmental Quality Protection, Beautification",
  "Health - General & Rehabilitative",
  "Housing, Shelter",
  "Human Services",
  "International Foreign Affairs and National Security",
  "Medical Research",
  "Mental Health and Crisis Intervention",
  "Mutual/Membership Benefit Organizations",
  "Philanthropy, Voluntarism and Grantmaking",
  "Public Safety, Disaster Relief & Preparedness",
  "Public, Society Benefit",
  "Recreation, Sports, Leisure, Athletics",
  "Religion, Spiritual Development",
  "Science and Technology Research Institutes",
  "Social Science Research Institutes",
  "Youth Development",
];

const US_STATES = [
  "Alabama",
  "Alaska",
  "Arizona",
  "Arkansas",
  "California",
  "Colorado",
  "Connecticut",
  "Delaware",
  "Florida",
  "Georgia",
  "Hawaii",
  "Idaho",
  "Illinois",
  "Indiana",
  "Iowa",
  "Kansas",
  "Kentucky",
  "Louisiana",
  "Maine",
  "Maryland",
  "Massachusetts",
  "Michigan",
  "Minnesota",
  "Mississippi",
  "Missouri",
  "Montana",
  "Nebraska",
  "Nevada",
  "New Hampshire",
  "New Jersey",
  "New Mexico",
  "New York",
  "North Carolina",
  "North Dakota",
  "Ohio",
  "Oklahoma",
  "Oregon",
  "Pennsylvania",
  "Rhode Island",
  "South Carolina",
  "South Dakota",
  "Tennessee",
  "Texas",
  "Utah",
  "Vermont",
  "Virginia",
  "Washington",
  "West Virginia",
  "Wisconsin",
  "Wyoming",
];

const CITIES_BY_STATE = {
  Alabama: ["Birmingham", "Montgomery", "Huntsville", "Mobile", "Tuscaloosa"],
  Alaska: ["Anchorage", "Fairbanks", "Juneau", "Sitka", "Kenai"],
  Arizona: ["Phoenix", "Tucson", "Mesa", "Chandler", "Scottsdale"],
  Arkansas: [
    "Little Rock",
    "Fort Smith",
    "Fayetteville",
    "Springdale",
    "Jonesboro",
  ],
  California: [
    "Los Angeles",
    "San Francisco",
    "San Diego",
    "San Jose",
    "Sacramento",
    "Oakland",
    "Fresno",
  ],
  Colorado: ["Denver", "Colorado Springs", "Aurora", "Fort Collins", "Boulder"],
  Connecticut: ["Hartford", "New Haven", "Stamford", "Bridgeport", "Waterbury"],
  Delaware: ["Wilmington", "Dover", "Newark", "Middletown", "Smyrna"],
  Florida: [
    "Miami",
    "Orlando",
    "Tampa",
    "Jacksonville",
    "Tallahassee",
    "Fort Lauderdale",
  ],
  Georgia: ["Atlanta", "Savannah", "Augusta", "Athens", "Macon"],
  Hawaii: ["Honolulu", "Hilo", "Kailua", "Kapolei", "Kaneohe"],
  Idaho: ["Boise", "Meridian", "Nampa", "Idaho Falls", "Pocatello"],
  Illinois: ["Chicago", "Springfield", "Peoria", "Rockford", "Champaign"],
  Indiana: [
    "Indianapolis",
    "Fort Wayne",
    "Bloomington",
    "South Bend",
    "Evansville",
  ],
  Iowa: ["Des Moines", "Cedar Rapids", "Davenport", "Sioux City", "Iowa City"],
  Kansas: ["Wichita", "Kansas City", "Topeka", "Olathe", "Lawrence"],
  Kentucky: [
    "Louisville",
    "Lexington",
    "Bowling Green",
    "Owensboro",
    "Covington",
  ],
  Louisiana: [
    "New Orleans",
    "Baton Rouge",
    "Shreveport",
    "Lafayette",
    "Lake Charles",
  ],
  Maine: ["Portland", "Augusta", "Lewiston", "Bangor", "South Portland"],
  Maryland: [
    "Baltimore",
    "Annapolis",
    "Rockville",
    "Frederick",
    "Gaithersburg",
  ],
  Massachusetts: ["Boston", "Cambridge", "Worcester", "Springfield", "Lowell"],
  Michigan: ["Detroit", "Grand Rapids", "Ann Arbor", "Lansing", "Flint"],
  Minnesota: ["Minneapolis", "St. Paul", "Rochester", "Duluth", "Bloomington"],
  Mississippi: ["Jackson", "Gulfport", "Southaven", "Hattiesburg", "Biloxi"],
  Missouri: [
    "Kansas City",
    "St. Louis",
    "Springfield",
    "Columbia",
    "Independence",
  ],
  Montana: ["Billings", "Missoula", "Great Falls", "Bozeman", "Helena"],
  Nebraska: ["Omaha", "Lincoln", "Bellevue", "Grand Island", "Kearney"],
  Nevada: ["Las Vegas", "Reno", "Henderson", "Carson City", "Sparks"],
  "New Hampshire": ["Manchester", "Nashua", "Concord", "Dover", "Rochester"],
  "New Jersey": ["Newark", "Jersey City", "Paterson", "Elizabeth", "Trenton"],
  "New Mexico": [
    "Albuquerque",
    "Santa Fe",
    "Las Cruces",
    "Rio Rancho",
    "Roswell",
  ],
  "New York": [
    "New York City",
    "Buffalo",
    "Rochester",
    "Syracuse",
    "Albany",
    "Yonkers",
    "Brooklyn",
  ],
  "North Carolina": [
    "Charlotte",
    "Raleigh",
    "Greensboro",
    "Durham",
    "Winston-Salem",
  ],
  "North Dakota": ["Fargo", "Bismarck", "Grand Forks", "Minot", "West Fargo"],
  Ohio: ["Columbus", "Cleveland", "Cincinnati", "Toledo", "Akron"],
  Oklahoma: ["Oklahoma City", "Tulsa", "Norman", "Broken Arrow", "Edmond"],
  Oregon: ["Portland", "Salem", "Eugene", "Gresham", "Hillsboro"],
  Pennsylvania: ["Philadelphia", "Pittsburgh", "Allentown", "Erie", "Reading"],
  "Rhode Island": [
    "Providence",
    "Warwick",
    "Cranston",
    "Pawtucket",
    "East Providence",
  ],
  "South Carolina": [
    "Columbia",
    "Charleston",
    "Greenville",
    "Myrtle Beach",
    "Rock Hill",
  ],
  "South Dakota": [
    "Sioux Falls",
    "Rapid City",
    "Aberdeen",
    "Brookings",
    "Watertown",
  ],
  Tennessee: [
    "Nashville",
    "Memphis",
    "Knoxville",
    "Chattanooga",
    "Clarksville",
  ],
  Texas: [
    "Houston",
    "Austin",
    "Dallas",
    "San Antonio",
    "Fort Worth",
    "El Paso",
    "Arlington",
  ],
  Utah: ["Salt Lake City", "West Valley City", "Provo", "West Jordan", "Orem"],
  Vermont: ["Burlington", "South Burlington", "Rutland", "Barre", "Montpelier"],
  Virginia: [
    "Virginia Beach",
    "Richmond",
    "Norfolk",
    "Arlington",
    "Alexandria",
  ],
  Washington: ["Seattle", "Spokane", "Tacoma", "Vancouver", "Bellevue"],
  "West Virginia": [
    "Charleston",
    "Huntington",
    "Morgantown",
    "Parkersburg",
    "Wheeling",
  ],
  Wisconsin: ["Milwaukee", "Madison", "Green Bay", "Kenosha", "Racine"],
  Wyoming: ["Cheyenne", "Casper", "Laramie", "Gillette", "Rock Springs"],
};

export default function ProfileDetailsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [error, setError] = useState("");
  const [selectedIndustryCategory, setSelectedIndustryCategory] = useState("");
  const [orgType, setOrgType] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    industry: "",
    location: { state: "", city: "" },
    mission_statement: "",
    core_values: [""],
    target_audience: "",
    website: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedState, setSelectedState] = useState("");
  const [availableCities, setAvailableCities] = useState([]);

  useEffect(() => {
    const type = localStorage.getItem("orgType");
    if (!type) {
      navigate("/profile-setup/type");
    } else {
      setOrgType(type);
    }
  }, [navigate]);

  useEffect(() => {
    if (selectedState && CITIES_BY_STATE[selectedState]) {
      setAvailableCities(CITIES_BY_STATE[selectedState]);
    } else {
      setAvailableCities([]);
    }
    setFormData((prev) => ({
      ...prev,
      location: {
        state: selectedState,
        city: prev.location.city,
      },
    }));
  }, [selectedState]);

  // 验证 URL 格式
  const isValidUrl = (url) => {
    if (!url) return true; // 允许空值

    // 如果没有协议，添加 http://
    let urlToCheck = url;
    if (!/^https?:\/\//i.test(url)) {
      urlToCheck = "http://" + url;
    }

    try {
      new URL(urlToCheck);
      return true;
    } catch (e) {
      return false;
    }
  };

  // 验证表单
  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = "组织名称不能为空";
    }

    if (!formData.industry) {
      errors.industry = "请选择行业";
    }

    if (!selectedState) {
      errors.state = "请选择州";
    }

    if (selectedState && !formData.location.city) {
      errors.city = "请选择城市";
    }

    if (!formData.mission_statement.trim()) {
      errors.mission_statement = "使命宣言不能为空";
    }

    if (!formData.target_audience.trim()) {
      errors.target_audience = "目标受众不能为空";
    }

    if (formData.website && !isValidUrl(formData.website)) {
      errors.website = "请输入有效的网址 (例如: http://example.com)";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("开始提交表单数据...");

    // 验证表单
    if (!validateForm()) {
      console.log("表单验证失败");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      // 处理网站 URL
      let websiteUrl = formData.website.trim();
      if (websiteUrl && !/^https?:\/\//i.test(websiteUrl)) {
        websiteUrl = "http://" + websiteUrl;
      }

      // 构造位置对象
      const locationObj = {
        state: selectedState,
        city: formData.location.city,
      };

      // 准备发送的数据
      const dataToSend = {
        name: formData.name,
        industry: formData.industry,
        location: locationObj,
        mission_statement: formData.mission_statement,
        core_values: formData.core_values,
        target_audience: formData.target_audience,
        website: websiteUrl,
      };

      console.log("准备发送的数据:", dataToSend);

      const token = localStorage.getItem("token");
      console.log("使用的token:", token);

      const response = await fetch(`${API_BASE_URL}/profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dataToSend),
      });

      const data = await response.json();
      console.log("服务器响应:", data);

      if (!response.ok) {
        throw new Error(`Server error: ${JSON.stringify(data)}`);
      }

      if (data.code === 0) {
        console.log("个人资料保存成功");
        // 更新 AuthContext 中的用户信息
        if (user) {
          user.name = formData.name;
        }
        // 跳转到用户主页
        navigate("/home");
      } else {
        throw new Error(data.message || "Unknown error");
      }
    } catch (error) {
      console.error("错误详情:", error);
      setError(error.message || "保存个人资料时出错");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "state") {
      setSelectedState(value);
    } else if (name === "city") {
      setFormData((prev) => ({
        ...prev,
        location: {
          ...prev.location,
          city: value,
        },
      }));
    } else if (name === "industryCategory") {
      setSelectedIndustryCategory(value);
      setFormData((prev) => ({
        ...prev,
        industry: "",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const industries =
    orgType === "nonprofit" ? NONPROFIT_INDUSTRIES : FORPROFIT_INDUSTRIES;

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

      {/* 返回按钮 */}
      <Link
        to="/profile-setup/type"
        className="absolute top-8 left-8 text-white hover:text-teal-200 z-10 flex items-center gap-2 transition-all duration-300 group"
      >
        <div className="bg-white/10 backdrop-blur-md p-2 rounded-full group-hover:bg-white/20 transition-all duration-300">
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
      </Link>

      {/* 主要内容 */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-20">
        <div className="w-full max-w-3xl text-center mb-12">
          <h1 className="text-5xl font-bold text-white tracking-tight whitespace-nowrap">
            Tell us about your organization
          </h1>
        </div>

        <div className="w-full max-w-3xl bg-white/10 backdrop-blur-md rounded-3xl p-10 shadow-2xl border border-white/20">
          {error && (
            <div className="mb-6 text-red-300 bg-red-900/30 p-3 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <label className="block text-white text-sm font-medium pl-1">
                Organization Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full pl-4 pr-4 py-3 bg-white/10 border ${
                  formErrors.name ? "border-red-500" : "border-white/30"
                } rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300`}
                placeholder="Enter organization name"
              />
              {formErrors.name && (
                <p className="text-red-400 text-xs mt-1">{formErrors.name}</p>
              )}
            </div>

            {/* Industry */}
            <div className="space-y-2">
              <label className="block text-white text-sm font-medium pl-1">
                Industry
              </label>
              <div className="grid grid-cols-1 gap-4">
                <select
                  name="industryCategory"
                  value={selectedIndustryCategory}
                  onChange={handleChange}
                  className={`w-full pl-4 pr-4 py-3 bg-white/10 border ${
                    formErrors.industry && !selectedIndustryCategory
                      ? "border-red-500"
                      : "border-white/30"
                  } rounded-xl text-white appearance-none focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300`}
                >
                  <option value="" className="text-gray-900">
                    Select Industry Category
                  </option>
                  {Object.keys(industries).map((category) => (
                    <option
                      key={category}
                      value={category}
                      className="text-gray-900"
                    >
                      {category}
                    </option>
                  ))}
                </select>
                {selectedIndustryCategory && (
                  <select
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    className={`w-full pl-4 pr-4 py-3 bg-white/10 border ${
                      formErrors.industry && selectedIndustryCategory
                        ? "border-red-500"
                        : "border-white/30"
                    } rounded-xl text-white appearance-none focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300`}
                  >
                    <option value="" className="text-gray-900">
                      Select Specific Industry
                    </option>
                    {industries[selectedIndustryCategory]?.map((industry) => (
                      <option
                        key={industry}
                        value={industry}
                        className="text-gray-900"
                      >
                        {industry}
                      </option>
                    ))}
                  </select>
                )}
                {formErrors.industry && (
                  <p className="text-red-400 text-xs mt-1">
                    {formErrors.industry}
                  </p>
                )}
              </div>
            </div>

            {/* Location */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-white text-sm font-medium pl-1">
                  State
                </label>
                <select
                  name="state"
                  value={selectedState}
                  onChange={handleChange}
                  className={`w-full pl-4 pr-4 py-3 bg-white/10 border ${
                    formErrors.state ? "border-red-500" : "border-white/30"
                  } rounded-xl text-white appearance-none focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300`}
                >
                  <option value="" className="text-gray-900">
                    Select State
                  </option>
                  {US_STATES.map((state) => (
                    <option key={state} value={state} className="text-gray-900">
                      {state}
                    </option>
                  ))}
                </select>
                {formErrors.state && (
                  <p className="text-red-400 text-xs mt-1">
                    {formErrors.state}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="block text-white text-sm font-medium pl-1">
                  City
                </label>
                <select
                  name="city"
                  value={formData.location.city}
                  onChange={handleChange}
                  disabled={!selectedState}
                  className={`w-full pl-4 pr-4 py-3 bg-white/10 border ${
                    formErrors.city ? "border-red-500" : "border-white/30"
                  } rounded-xl text-white appearance-none focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300`}
                >
                  <option value="" className="text-gray-900">
                    Select City
                  </option>
                  {availableCities.map((city) => (
                    <option key={city} value={city} className="text-gray-900">
                      {city}
                    </option>
                  ))}
                </select>
                {formErrors.city && (
                  <p className="text-red-400 text-xs mt-1">{formErrors.city}</p>
                )}
              </div>
            </div>

            {/* Mission Statement */}
            <div className="space-y-2">
              <label className="block text-white text-sm font-medium pl-1">
                Mission Statement
              </label>
              <textarea
                name="mission_statement"
                value={formData.mission_statement}
                onChange={handleChange}
                className={`w-full pl-4 pr-4 py-3 bg-white/10 border ${
                  formErrors.mission_statement
                    ? "border-red-500"
                    : "border-white/30"
                } rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300 h-24 resize-none`}
                placeholder="Enter mission statement"
              />
              {formErrors.mission_statement && (
                <p className="text-red-400 text-xs mt-1">
                  {formErrors.mission_statement}
                </p>
              )}
            </div>

            {/* Core Values */}
            <div className="space-y-2">
              <label className="block text-white text-sm font-medium pl-1">
                Core Values
              </label>
              <input
                type="text"
                name="core_values"
                value={formData.core_values.join(", ")}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    core_values: e.target.value.split(", "),
                  })
                }
                className="w-full pl-4 pr-4 py-3 bg-white/10 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300"
                placeholder="Enter core values (comma separated)"
              />
            </div>

            {/* Target Audience */}
            <div className="space-y-2">
              <label className="block text-white text-sm font-medium pl-1">
                Target Audience
              </label>
              <textarea
                name="target_audience"
                value={formData.target_audience}
                onChange={handleChange}
                className={`w-full pl-4 pr-4 py-3 bg-white/10 border ${
                  formErrors.target_audience
                    ? "border-red-500"
                    : "border-white/30"
                } rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300 h-24 resize-none`}
                placeholder="Enter target audience"
              />
              {formErrors.target_audience && (
                <p className="text-red-400 text-xs mt-1">
                  {formErrors.target_audience}
                </p>
              )}
            </div>

            {/* Website */}
            <div className="space-y-2">
              <label className="block text-white text-sm font-medium pl-1">
                Website
              </label>
              <input
                type="text"
                name="website"
                value={formData.website}
                onChange={handleChange}
                className={`w-full pl-4 pr-4 py-3 bg-white/10 border ${
                  formErrors.website ? "border-red-500" : "border-white/30"
                } rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300`}
                placeholder="Enter website URL"
              />
              {formErrors.website && (
                <p className="text-red-400 text-xs mt-1">
                  {formErrors.website}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4 flex justify-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-teal-500 hover:bg-teal-400 text-white font-medium py-3 px-12 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
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
                    保存中...
                  </div>
                ) : (
                  "Save Profile"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
