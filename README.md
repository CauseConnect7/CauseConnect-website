
# Organization Matching System

This system includes two main components:

1. **Node.js Backend** – Handles user authentication, organization profile management, and basic functions.  
2. **Python Matching Service** – Uses SBERT and GPT-4 for advanced organization matching.

---

## Setting Up the Node.js Backend

1. **Install Dependencies**

```bash
npm install
```

2. **Create a `.env` File and Set Environment Variables**

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

3. **Start the Node.js Server**

```bash
npm start
```

---

## Setting Up the Python Matching Service

1. **Create a Python Virtual Environment**

```bash
python -m venv venv  
source venv/bin/activate  # On Windows use venv\Scripts\activate  
```

2. **Install Dependencies**

```bash
pip install -r requirements.txt  
```

3. **Set Environment Variables**

```bash
# Linux/Mac  
export OPENAI_API_KEY=your-openai-api-key  
export MONGO_URI=your-mongo-uri  

# Windows  
set OPENAI_API_KEY=your-openai-api-key  
set MONGO_URI=your-mongo-uri  
```

4. **Start the Python Matching Service**

```bash
python matching_service.py  
```

---

## System Architecture

1. **User Submits a Matching Request**  
   - Users fill out preferences (location, organization type, description) on the frontend.  
   - The frontend sends the data to the Node.js backend at `/api/profile/matching-preference`.

2. **Node.js Backend Handles the Request**  
   - Updates the user's matching preferences.  
   - Sends the request to the Python Matching Service.

3. **Python Matching Service Processes the Match**  
   - Reads user preferences from MongoDB.  
   - Loads organization data from the `Organization4` database.  
   - Calculates similarity using SBERT.  
   - Optionally, uses GPT-4 to rank the matches.  
   - Returns the match results.

4. **Node.js Backend Returns Results**  
   - Sends the final match results to the frontend.  
   - If the Python service is down, returns fallback data.

---

## API Endpoints

### Node.js Backend

- `POST /api/profile/matching-preference`: Submit a match request and receive results.

### Python Matching Service

- `GET /api/match_partners?user_id=<user_id>`: Basic matching (SBERT only).  
- `GET /api/match_partners_gpt?user_id=<user_id>`: Advanced matching (SBERT + GPT-4).

---

## Database Structure

### `User.profile` Collection  
Stores user organization information and matching preferences:  
- `partnerDescription`: Description of desired partner.  
- `searchPreferences.location`: Preferred location.  
- `searchPreferences.preferredOrgType`: Preferred organization type.

### `Organization4` Database  
Contains two collections:  
- `For-Profit`: For-profit organizations.  
- `Non-Profit`: Nonprofit organizations.

Each organization document includes:  
- `name`: Organization name  
- `mission_statement`: Mission statement  
- `core_values`: Core values  
- `location`: Location  
- `website`: Website  
- `bert_vector`: Pre-computed BERT vector for fast matching
