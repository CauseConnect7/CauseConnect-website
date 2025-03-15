const findPartners = async () => {
  try {
    // 获取表单数据
    const searchData = {
      location: location, // 例如 "Seattle"
      organizationType: organizationType, // 例如 "For-profit"
      partnershipGoal: partnershipGoal, // 用户输入的文本
    };

    console.log("发送搜索请求:", searchData);

    const response = await fetch("http://localhost:3001/api/partners/find", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(searchData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("搜索结果:", data);

    if (data.code === 0) {
      // 显示搜索结果
      setPartners(data.data);
      setError(null);
    } else {
      // 处理错误
      setError(data.message || "查找伙伴失败");
    }
  } catch (error) {
    console.error("API 请求错误:", error);
    setError("Failed to fetch: " + error.message);
  }
};

// 在表单提交时调用
const handleSubmit = (e) => {
  e.preventDefault();
  findPartners();
};
