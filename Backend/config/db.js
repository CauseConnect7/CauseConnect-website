const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // 构建MongoDB连接URI，确保使用指定的数据库名称
    const mongoUri = process.env.MONGO_URI;
    const dbName = process.env.MONGODB_DB_NAME || "User";

    // 连接到MongoDB
    const conn = await mongoose.connect(mongoUri, {
      dbName: dbName, // 显式指定数据库名称
    });

    console.log(`✅ MongoDB 已连接: ${conn.connection.host}`);
    console.log(`✅ 使用数据库: ${dbName}`);
  } catch (error) {
    console.error(`❌ MongoDB 连接错误: ${error.message}`);
    process.exit(1);
  }
};

// 监听连接事件
mongoose.connection.on("disconnected", () => {
  console.log("MongoDB 连接断开");
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB 连接错误:", err);
});

// 优雅关闭连接
process.on("SIGINT", async () => {
  try {
    await mongoose.connection.close();
    console.log("MongoDB 连接已关闭");
    process.exit(0);
  } catch (err) {
    console.error("关闭 MongoDB 连接时出错:", err);
    process.exit(1);
  }
});

module.exports = connectDB;
