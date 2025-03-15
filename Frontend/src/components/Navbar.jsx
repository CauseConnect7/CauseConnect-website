import React from "react";
import Logo from "../assets/logo.svg";

const Navbar = () => {
  return (
    <nav className="fixed top-0 w-full bg-white/95 backdrop-blur z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <img src={Logo} alt="CauseConnect" className="h-8 w-auto" />
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-gray-700 hover:text-gray-900">
              Explore
            </a>
            <a href="#" className="text-gray-700 hover:text-gray-900">
              Partnership
            </a>
            <a href="#" className="text-gray-700 hover:text-gray-900">
              Solutions
            </a>
            <button className="text-gray-700 hover:text-gray-900">
              Sign in
            </button>
            <button className="bg-teal-500 text-white px-4 py-2 rounded-md hover:bg-teal-600">
              Register
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
