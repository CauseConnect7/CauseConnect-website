import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import heroImage from "../images/hero-bg.jpg";

const Hero = () => {
  const { user } = useAuth();

  return (
    <div className="relative">
      <div className="absolute inset-0">
        <img
          className="w-full h-full object-cover"
          src={heroImage}
          alt="Hero background"
        />
        <div className="absolute inset-0 bg-gray-500 mix-blend-multiply"></div>
      </div>
      <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
          Connect for Impact
        </h1>
        <p className="mt-6 text-xl text-white max-w-3xl">
          Join our platform to collaborate with like-minded organizations and
          create meaningful partnerships.
        </p>
        {!user && ( // 只在用户未登录时显示这些按钮
          <div className="mt-10 flex space-x-4">
            <Link
              to="/register"
              className="inline-block bg-white py-3 px-8 border border-transparent rounded-md text-base font-medium text-gray-900 hover:bg-gray-50"
            >
              Get Started
            </Link>
            <Link
              to="/signin"
              className="inline-block bg-transparent py-3 px-8 border border-white rounded-md text-base font-medium text-white hover:bg-white hover:text-gray-900"
            >
              Sign In
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Hero;
