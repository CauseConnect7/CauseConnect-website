// API配置文件
const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://causeconnect-server.onrender.com/api"
    : "http://localhost:3001/api";

export default API_BASE_URL;
