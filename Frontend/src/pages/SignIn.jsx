import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import heroImage from "../images/hero-bg.jpg";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    console.log("1. 开始登录流程...");

    try {
      console.log("2. 准备发送登录请求...", { email, password });
      const response = await fetch("http://localhost:3001/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const text = await response.text();
      console.log("3. 服务器原始响应:", text);

      try {
        const data = JSON.parse(text);
        console.log("4. 解析后的数据:", data);

        if (response.ok) {
          console.log("5. 登录成功，准备保存 token");
          if (data.data && data.data.token) {
            console.log("6. 准备调用 AuthContext login");
            // 调用 login 方法，它会返回个人资料是否完成的状态
            const isProfileComplete = await login(data.data.token);
            console.log(
              "7. AuthContext login 完成，个人资料状态:",
              isProfileComplete
            );

            // 根据个人资料状态决定导航路径
            if (isProfileComplete) {
              console.log("8. 个人资料已完成，导航到 UserHome");
              navigate("/home");
            } else {
              console.log("8. 个人资料未完成，导航到个人资料设置");
              navigate("/profile-setup/type");
            }
          } else {
            throw new Error("Token not found in response");
          }
        } else {
          console.error("❌ 登录失败:", data);
          setError(
            data.message || "Login failed. Please check your credentials."
          );
        }
      } catch (parseError) {
        console.error("❌ JSON 解析错误:", parseError);
        console.error("❌ 服务器返回的原始数据:", text);
        setError("Server response format error. Please try again.");
      }
    } catch (networkError) {
      console.error("❌ 网络错误:", networkError);
      setError("Network error. Please check your connection.");
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:3001/auth/google";
  };

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Login to your account
          </h2>

          {error && <div className="mt-4 text-red-600">{error}</div>}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
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
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-800 hover:bg-gray-700"
              >
                Log in
              </button>
            </div>
          </form>

          <div className="mt-6">
            <button
              onClick={handleGoogleLogin}
              className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-50"
            >
              <img
                src="https://www.google.com/favicon.ico"
                alt="Google"
                className="w-5 h-5"
              />
              Login with Google
            </button>
          </div>

          <p className="mt-4 text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <Link to="/register" className="text-blue-600 hover:text-blue-500">
              Register
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
