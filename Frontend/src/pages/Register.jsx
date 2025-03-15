import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import heroImage from "../images/hero-bg.jpg";
import API_BASE_URL from "../config";

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setIsLoading(true);

      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fullName, email, password }),
      });

      const text = await response.text();

      try {
        const data = JSON.parse(text);
        if (response.ok && data.code === 0) {
          console.log("✅ 注册成功:", data);
          navigate("/signin"); // 注册成功后跳转到登录页
        } else {
          console.error("❌ 注册失败:", data);
          setError(data.message || "Registration failed");
        }
      } catch (parseError) {
        console.error("❌ 服务器返回非 JSON:", text);
        setError("Server response error. Please check console.");
      }
    } catch (networkError) {
      console.error("❌ 网络错误:", networkError);
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Create Your Account
          </h2>

          {error && <div className="mt-4 text-red-600">{error}</div>}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-gray-700"
              >
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <p className="mt-1 text-xs text-gray-500">
                Must contain 1 uppercase letter, 1 number, and at least 8
                characters
              </p>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-800 hover:bg-gray-700"
              >
                Register
              </button>
            </div>
          </form>

          <p className="mt-4 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link to="/signin" className="text-blue-600 hover:text-blue-500">
              Log in
            </Link>
          </p>
        </div>
      </div>
      <div className="hidden lg:block relative flex-1">
        <img
          className="absolute inset-0 h-full w-full object-cover"
          src={heroImage}
          alt="背景图片"
        />
      </div>
    </div>
  );
}
