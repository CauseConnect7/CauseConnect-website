import React, { useState } from "react";
import "./App.css";
// 导入图片
import heroImage from "./images/hero-bg.jpg";
import logo from "./images/logo.svg";
import teamImage from "./images/team.jpg";
// 导入合作伙伴 logo
import logo1 from "./images/logo1.jpg";
import logo2 from "./images/logo2.jpg";
import logo3 from "./images/logo3.jpg";
import logo4 from "./images/logo4.jpg";
import logo5 from "./images/logo5.jpg";
import logo6 from "./images/logo6.jpg";
import campaign1 from "./images/campaign1.jpg";
import campaign2 from "./images/campaign2.jpg";
import campaign3 from "./images/campaign3.jpg";
import campaign4 from "./images/campaign4.jpg";
// 导入新的活动图片
import campaign5 from "../src/images/campaign5.jpg";
import campaign6 from "../src/images/campaign6.jpg";
import campaign7 from "../src/images/campaign7.jpg";
import campaign8 from "../src/images/campaign8.jpg";
import campaign9 from "../src/images/campaign9.jpg";
import campaign10 from "../src/images/campaign10.jpg";
import newCampaignBg from "./images/new.jpg";
import heroBg from "./images/hero-bg.jpg";
import hero1 from "./images/hero1.jpg";
import hero2 from "./images/hero2.jpg";
import hero3 from "./images/hero3.jpg";
import hero4 from "./images/hero4.jpg";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Register from "./pages/Register";
import SignIn from "./pages/SignIn";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  Navigate,
} from "react-router-dom";
import ProfileTypePage from "./pages/ProfileTypePage";
import ProfileDetailsPage from "./pages/ProfileDetailsPage";
import UserHome from "./pages/UserHome";
import PartnershipSearch from "./pages/PartnershipSearch";
import ResultPage from "./pages/ResultPage";

// 创建一个新的组件来包含主页内容
function Home() {
  const navigate = useNavigate();
  // 定义一个数组存储背景图片
  const backgrounds = [heroBg, hero1, hero2, hero3, hero4];

  // 使用 useState 来管理当前背景的索引
  const [currentBg, setCurrentBg] = useState(0);

  // 定义一个函数来切换背景
  const nextBackground = () => {
    setCurrentBg((prevBg) => (prevBg + 1) % backgrounds.length);
  };

  const prevBackground = () => {
    setCurrentBg(
      (prevBg) => (prevBg - 1 + backgrounds.length) % backgrounds.length
    );
  };

  return (
    <div className="App">
      {/* Hero Section */}
      <header
        className="App-header"
        style={{
          backgroundImage: `url(${backgrounds[currentBg]})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          transition: "background-image 0.5s ease-in-out",
        }}
      >
        <nav>
          <div className="logo">
            <img src={logo} alt="logo" />
            <span>Cause-connect</span>
          </div>
          <div className="nav-links">
            <a href="#">Explore</a>
            <a href="#">Partnership</a>
            <a href="#">Solutions</a>
            <a
              onClick={() => navigate("/signin")}
              style={{ cursor: "pointer" }}
            >
              Sign in
            </a>
            <button
              className="register-btn rounded-full px-6 py-2"
              onClick={() => navigate("/register")}
            >
              Register
            </button>
          </div>
        </nav>

        <section className="hero">
          <button onClick={nextBackground} className="arrow left-arrow">
            <span className="material-icons">chevron_right</span>
          </button>
          <button onClick={prevBackground} className="arrow right-arrow">
            <span className="material-icons">chevron_left</span>
          </button>
          <div className="text-container">
            <h1>Embracing Social Causes</h1>
            <button
              className="start-button rounded-full px-8 py-3"
              onClick={() => navigate("/register")}
            >
              Start Here
            </button>
          </div>
        </section>
      </header>

      {/* Partners Section */}
      <section className="partners">
        <h2>Meet Your Perfect Cause Partner</h2>
        <p>
          Connect with nonprofits that align with your values and goals to
          create meaningful and impactful collaborations.
        </p>

        <div className="partner-logos-container">
          <div className="partner-logos">
            <div className="logo-pair">
              <img src={logo1} alt="Partner 1" />
              <img src={logo2} alt="Partner 2" />
            </div>
            <div className="logo-pair">
              <img src={logo3} alt="Partner 3" />
              <img src={logo4} alt="Partner 4" />
            </div>
            <div className="logo-pair">
              <img src={logo5} alt="Partner 5" />
              <img src={logo6} alt="Partner 6" />
            </div>
            {/* 复制一组用于无缝滚动 */}
            <div className="logo-pair">
              <img src={logo1} alt="Partner 1" />
              <img src={logo2} alt="Partner 2" />
            </div>
            <div className="logo-pair">
              <img src={logo3} alt="Partner 3" />
              <img src={logo4} alt="Partner 4" />
            </div>
            <div className="logo-pair">
              <img src={logo5} alt="Partner 5" />
              <img src={logo6} alt="Partner 6" />
            </div>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="impact">
        <div className="container">
          <div className="impact-text">
            <h2>We Connect Impactful Social Causes</h2>
            <p>
              Discover partnerships that align missions, amplify visibility, and
              drive real-world impact through CauseConnect – the co-marketing
              platform built for cause-driven collaborations.
            </p>
            <button className="find-partner-btn">Find my Partner</button>
          </div>
          <div className="impact-image">
            <img src={teamImage} alt="Team collaboration" />
          </div>
        </div>
      </section>

      {/* Campaigns Section */}
      <section className="campaigns-section">
        <div className="campaigns-header">
          <div className="header-content">
            <h1>We're Linking Causes with Special Campaigns</h1>
            <p>
              Collaborate on impactful campaigns that align with your mission,
              amplify your brand, and create meaningful social change.
            </p>
          </div>
        </div>

        {/* Most Popular Campaigns 部分 */}
        <div className="campaigns">
          <h2>Most Popular Campaigns</h2>
          <div className="campaign-grid">
            <div className="campaign-main">
              <div className="campaign-card">
                <img src={campaign1} alt="1% for the Planet" />
                <div className="campaign-card-content">
                  <h3>Join 1% of the Planet</h3>
                </div>
              </div>
            </div>

            <div className="campaign-secondary">
              <div className="campaign-card">
                <img src={campaign2} alt="Hope in Every Hand" />
                <div className="campaign-card-content">
                  <h3>Hope in Every Hand:</h3>
                  <p>Feeding the Hungry</p>
                </div>
              </div>

              <div className="campaign-card">
                <img src={campaign3} alt="Building Bridges" />
                <div className="campaign-card-content">
                  <h3>Building Bridges:</h3>
                  <p>Community Volunteerism</p>
                </div>
              </div>

              <div className="campaign-card">
                <img src={campaign4} alt="Winds of Change" />
                <div className="campaign-card-content">
                  <h3>Winds of Change:</h3>
                  <p>Promoting Renewable Energy</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="ongoing-campaigns">
        <div className="container">
          <div className="campaigns-header">
            <h2>Ongoing Campaigns</h2>
            <div className="search-box">
              <span className="material-icons">search</span>
              <input type="text" />
            </div>
          </div>

          <div className="campaigns-grid">
            <div className="campaign-card">
              <img src={campaign5} alt="Community Care" />
              <h3>Community Care</h3>
              <p>
                Empower communities by volunteering in local initiatives that
                drive social impact and create opportunities for all
              </p>
              <button className="learn-more">Learn more</button>
            </div>

            <div className="campaign-card">
              <img src={campaign6} alt="LGBTQ+ Pride and Inclusion" />
              <h3>LGBTQ+ Pride and Inclusion</h3>
              <p>Support campaigns that celebrate diversity and inclusivity</p>
              <button className="learn-more">Learn more</button>
            </div>

            <div className="campaign-card">
              <img src={campaign7} alt="Protecting Our Planet" />
              <h3>Protecting Our Planet</h3>
              <p>
                Engage in reforestation and environmental preservation efforts.
              </p>
              <button className="learn-more">Learn more</button>
            </div>

            <div className="campaign-card">
              <img src={campaign8} alt="Women in Tech" />
              <h3>Women in Tech</h3>
              <p>
                Support women-led campaigns that advocate for equal rights and
                opportunities worldwide.
              </p>
              <button className="learn-more">Learn more</button>
            </div>

            <div className="campaign-card">
              <img src={campaign9} alt="Supporting Local Farmers" />
              <h3>Supporting Local Farmers</h3>
              <p>
                Empower communities by backing sustainable agriculture and
                providing resources for local farmers to thrive.
              </p>
              <button className="learn-more">Learn more</button>
            </div>

            <div className="campaign-card">
              <img src={campaign10} alt="Coastal Cleanup" />
              <h3>Coastal Cleanup</h3>
              <p>
                Preserve marine ecosystems by participating in initiatives to
                clean up beaches and reduce ocean pollution.
              </p>
              <button className="learn-more">Learn more</button>
            </div>
          </div>
        </div>
      </section>

      {/* Build Campaign Section */}
      <section
        className="build-campaign"
        style={{ backgroundImage: `url(${newCampaignBg})` }}
      >
        <div className="container">
          <h2>
            Not Finding the Perfect fit Campaign? Build your own campaign now
          </h2>
          <button className="build-btn">
            Build my new Campaign
            <svg
              className="arrow-icon"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2>What Makes Us Different</h2>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <h3>Focused on Cause-Driven Partnerships</h3>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                  <polyline points="2 17 12 22 22 17"></polyline>
                  <polyline points="2 12 12 17 22 12"></polyline>
                </svg>
              </div>
              <h3>Advanced Matching Algorithm</h3>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
              </div>
              <h3>Affordable and Accessible Solutions</h3>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
              </div>
              <h3>Transparency and Accountability</h3>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="2" y1="12" x2="22" y2="12"></line>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                </svg>
              </div>
              <h3>Localized and Scalable Campaigns</h3>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
                  <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
                  <line x1="6" y1="1" x2="6" y2="4"></line>
                  <line x1="10" y1="1" x2="10" y2="4"></line>
                  <line x1="14" y1="1" x2="14" y2="4"></line>
                </svg>
              </div>
              <h3>Overcoming Competitive Gaps</h3>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <div className="footer-brand">
                <img src={logo} alt="logo" className="footer-logo" />
                <h3>Cause-connect</h3>
              </div>
              <p className="footer-description">
                Connecting impactful social causes with meaningful partnerships
                to create positive change in communities worldwide.
              </p>
              <div className="social-links">
                <a href="#" aria-label="Twitter">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                  </svg>
                </a>
                <a href="#" aria-label="LinkedIn">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                    <rect x="2" y="9" width="4" height="12"></rect>
                    <circle cx="4" cy="4" r="2"></circle>
                  </svg>
                </a>
                <a href="#" aria-label="Instagram">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect
                      x="2"
                      y="2"
                      width="20"
                      height="20"
                      rx="5"
                      ry="5"
                    ></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </a>
              </div>
            </div>

            <div className="footer-section">
              <h4>Quick Links</h4>
              <ul>
                <li>
                  <a href="#">About Us</a>
                </li>
                <li>
                  <a href="#">Our Mission</a>
                </li>
                <li>
                  <a href="#">Success Stories</a>
                </li>
                <li>
                  <a href="#">Blog</a>
                </li>
              </ul>
            </div>

            <div className="footer-section">
              <h4>Resources</h4>
              <ul>
                <li>
                  <a href="#">Help Center</a>
                </li>
                <li>
                  <a href="#">Partner Guide</a>
                </li>
                <li>
                  <a href="#">Campaign Tips</a>
                </li>
                <li>
                  <a href="#">Community</a>
                </li>
              </ul>
            </div>

            <div className="footer-section">
              <h4>Contact</h4>
              <ul>
                <li>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="contact-icon"
                  >
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                  <span>support@cause-connect.com</span>
                </li>
                <li>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="contact-icon"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                  <span>+1 (555) 123-4567</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <p>&copy; 2024 Cause-connect. All rights reserved.</p>
            <div className="footer-links">
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
              <a href="#">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// 创建一个受保护的路由组件
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  console.log("Protected Route - 用户状态:", user);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!user) {
    console.log("Protected Route - 未登录，重定向到登录页面");
    return <Navigate to="/signin" />;
  }

  console.log("Protected Route - 已登录，显示受保护内容");
  return children;
}

// 创建一个个人资料路由组件，检查用户是否已完成个人资料设置
function ProfileRoute({ children }) {
  const { user, profileComplete, loading } = useAuth();
  console.log(
    "Profile Route - 用户状态:",
    user,
    "个人资料状态:",
    profileComplete
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!user) {
    console.log("Profile Route - 未登录，重定向到登录页面");
    return <Navigate to="/signin" />;
  }

  if (profileComplete) {
    console.log("Profile Route - 个人资料已完成，重定向到首页");
    return <Navigate to="/home" />;
  }

  console.log("Profile Route - 个人资料未完成，显示个人资料设置页面");
  return children;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/signin" element={<SignIn />} />
          <Route
            path="/profile-setup/type"
            element={
              <ProfileRoute>
                <ProfileTypePage />
              </ProfileRoute>
            }
          />
          <Route
            path="/profile-setup/details"
            element={
              <ProfileRoute>
                <ProfileDetailsPage />
              </ProfileRoute>
            }
          />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <UserHome />
              </ProtectedRoute>
            }
          />
          <Route
            path="/partnership-search"
            element={
              <ProtectedRoute>
                <PartnershipSearch />
              </ProtectedRoute>
            }
          />
          <Route
            path="/results"
            element={
              <ProtectedRoute>
                <ResultPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
