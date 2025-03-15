import React from "react";
import Hero from "../components/Hero";
import Partners from "../components/Partners";
import Campaigns from "../components/Campaigns";
import Features from "../components/Features";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-white">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/" className="text-xl font-bold">
                  Cause-connect
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              {user ? (
                // 用户已登录，显示机构名称
                <div className="flex items-center space-x-4">
                  <span className="text-gray-700">{user.orgName}</span>
                  <button
                    onClick={() => {
                      // 处理登出逻辑
                      localStorage.removeItem("token");
                      window.location.href = "/";
                    }}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                // 用户未登录，显示登录和注册按钮
                <div className="flex items-center space-x-4">
                  <Link
                    to="/signin"
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="ml-4 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-800 hover:bg-gray-700"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Hero />
        <Partners />
        <Campaigns />
        <Features />
      </main>
    </div>
  );
};

export default Home;
