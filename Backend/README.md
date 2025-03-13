# 组织匹配系统

这个系统包含两个部分：

1. Node.js 后端 - 处理用户认证、组织资料管理等基本功能
2. Python 匹配服务 - 使用 SBERT 和 GPT-4 进行高级匹配

## 设置 Node.js 后端

1. 安装依赖

```bash
npm install
```

2. 创建 `.env` 文件并设置环境变量

```
PORT=3001
JWT_SECRET=your-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback
FRONTEND_URL=http://localhost:3000
MONGO_URI=mongodb+srv://Cluster13662:PawanGupta666@cluster13662.s1t3w.mongodb.net/?retryWrites=true&w=majority&appName=Cluster13662
MONGODB_DB_NAME=User
MONGODB_COLLECTION_AUTH=auth
MONGODB_COLLECTION_PROFILE=profile
PYTHON_SERVICE_URL=http://localhost:5000
```

3. 启动 Node.js 服务器

```bash
npm start
```

## 设置 Python 匹配服务

1. 创建 Python 虚拟环境

```bash
python -m venv venv
source venv/bin/activate  # 在 Windows 上使用 venv\Scripts\activate
```

2. 安装依赖

```bash
pip install -r requirements.txt
```

3. 设置环境变量

```bash
# Linux/Mac
export OPENAI_API_KEY=your-openai-api-key
export MONGO_URI=mongodb+srv://Cluster13662:PawanGupta666@cluster13662.s1t3w.mongodb.net/?retryWrites=true&w=majority&appName=Cluster13662

# Windows
set OPENAI_API_KEY=your-openai-api-key
set MONGO_URI=mongodb+srv://Cluster13662:PawanGupta666@cluster13662.s1t3w.mongodb.net/?retryWrites=true&w=majority&appName=Cluster13662
```

4. 启动 Python 匹配服务

```bash
python matching_service.py
```

## 系统架构

1. **用户提交匹配请求**：

   - 用户在前端填写匹配信息（位置、组织类型、合作描述）
   - 前端发送请求到 Node.js 后端的 `/api/profile/matching-preference` 端点

2. **Node.js 后端处理请求**：

   - 更新用户的匹配信息
   - 调用 Python 匹配服务

3. **Python 匹配服务执行匹配**：

   - 从 MongoDB 读取用户匹配需求
   - 从 Organization4 数据库读取组织信息
   - 使用 SBERT 计算相似度
   - 可选：使用 GPT-4 计算匹配等级
   - 返回匹配结果

4. **Node.js 后端返回结果**：
   - 将匹配结果返回给前端
   - 如果 Python 服务不可用，回退到模拟数据

## API 端点

### Node.js 后端

- `POST /api/profile/matching-preference`：提交匹配请求并获取结果

### Python 匹配服务

- `GET /api/match_partners?user_id=<user_id>`：基本匹配（使用 SBERT）
- `GET /api/match_partners_gpt?user_id=<user_id>`：高级匹配（使用 SBERT + GPT-4）

## 数据库结构

### User.profile 集合

存储用户的组织信息和匹配需求：

- `partnerDescription`：用户的合作伙伴描述
- `searchPreferences.location`：期望的位置
- `searchPreferences.preferredOrgType`：期望的组织类型

### Organization4 数据库

包含两个集合：

- `For-Profit`：营利性组织
- `Non-Profit`：非营利组织

每个组织文档包含：

- `name`：组织名称
- `mission_statement`：使命宣言
- `core_values`：核心价值观
- `location`：位置信息
- `website`：网站
- `bert_vector`：预计算的 BERT 向量（用于加速匹配）
