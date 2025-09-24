# 🚀 FRA DSS Backend API Documentation

## 📋 **API Overview**

Your FastAPI backend provides comprehensive claim processing APIs with AI integration.

**Base URL:** `http://127.0.0.1:8000`

---

## 🔗 **Available Endpoints** (Simplified!)

### 1. **Server Health Check**
```http
GET /
```
**Response:**
```json
{
  "message": "FRA DSS backend is live!"
}
```

### 2. **Process and Create Claim** ⭐ **Main Route**
```http
POST /claims/
```

**Input Format 1 - Raw Text String:**
```json
{
  "extracted_text": "1. Name of the claimant (s): Karan Singh\n2. Name of the spouse: Priya Singh\n3. Name of father/mother: Baldev Singh\n4. Address: Plot 56, Hilltop\n5. Village: Devpur\n6. Gram Panchayat: Devpur GP\n7. Tehsil /Taluka: Shahdol"
}
```

**Input Format 2 - Structured JSON:**
```json
{
  "extracted_text": {
    "claimant_name": "Karan Singh",
    "spouse_name": "Priya Singh",
    "father_mother_name": "Baldev Singh",
    "address": "Plot 56, Hilltop",
    "village": "Devpur",
    "gram_panchayat": "Devpur GP",
    "tehsil_taluka": "Shahdol",
    "district": "Balaghat",
    "state": "Madhya Pradesh",
    "claim_type": "individual",
    "area": 2.5
  }
}
```

**Response:**
```json
{
  "success": true,
  "claim_id": "67423f1a2b3c4d5e6f789012",
  "processing_method": "AI text processing", // or "Direct JSON input"
  "extracted_data": {
    "claimant_name": "Karan Singh",
    "spouse_name": "Priya Singh",
    "father_mother_name": "Baldev Singh",
    "address": "Plot 56, Hilltop",
    "village": "Devpur",
    "gram_panchayat": "Devpur GP",
    "tehsil_taluka": "Shahdol"
  },
  "stored_claim": {
    "claimant_name": "Karan Singh",
    "state": "Madhya Pradesh",
    "district": "Balaghat",
    "village": "Devpur",
    "claim_type": "individual",
    "area": 2.5
  },
  "message": "Claim created successfully"
}
```

### 3. **Get All Claims**
```http
GET /claims/
```
**Response:**
```json
{
  "success": true,
  "claims": [
    {
      "_id": "claim_id_here",
      "claimant_name": "Karan Singh",
      "state": "Madhya Pradesh",
      "district": "Balaghat",
      "village": "Devpur",
      "claim_type": "individual",
      "area": 2.5,
      "submission_date": "2025-09-24T10:30:00",
      "status": "pending",
      "processing_method": "AI text processing",
      "extracted_metadata": {...}
    }
  ],
  "count": 1
}
```

---

## 🧠 **AI Integration Features**

### **OpenRouter Gemini Integration**
- **Model:** `google/gemini-2.0-flash-exp:free`
- **Purpose:** Extract structured data from unstructured claim form text
- **Intelligent Field Extraction:**
  - Claimant name, spouse name, father/mother name
  - Address, village, gram panchayat, tehsil/taluka
  - District, state (if mentioned)
  - Claim type (individual/community)
  - Land area (if mentioned)

### **Smart Text Processing**
- Handles various text formats and layouts
- Robust JSON parsing with fallback mechanisms
- Error handling for malformed responses
- Contextual field inference

---

## 🗄️ **Database Schema**

### **Claim Model**
```python
{
  "claimant_name": str,      # Required
  "state": str,              # Required
  "district": str,           # Required
  "village": str,            # Required
  "claim_type": "individual" | "community",  # Default: "individual"
  "area": float,             # Required (hectares/acres)
  "submission_date": datetime,  # Auto-generated
  "status": "approved" | "pending",  # Default: "pending"
  "extracted_metadata": dict  # AI extracted data (optional)
}
```

---

## 🔧 **Configuration**

### **Environment Variables** (`.env`)
```bash
OPENROUTER_API_KEY=your_openrouter_api_key_here
MONGO_DB_URL=mongodb://localhost:27017
MONGO_DB_NAME=FRA_DB
```

### **CORS Configuration**
- **Allowed Origins:** `http://localhost:3000` (Frontend)
- **Methods:** All (`*`)
- **Headers:** All (`*`)
- **Credentials:** Enabled

---

## 🔄 **API Workflow**

### **Typical Usage Flow:**
1. **Frontend uploads document** → OCR extracts text
2. **Send text to `/claims/from-text`** → AI processes + stores in DB
3. **View processed claims** via `/claims/`
4. **Manual claims** can be created via `/claims/`

### **Development Flow:**
1. **Test text processing** → `/claims/process-text`
2. **Verify AI extraction** → Check JSON output
3. **Create claim** → `/claims/from-text` or `/claims/`
4. **Retrieve claims** → `/claims/`

---

## 📊 **Response Formats**

### **Success Response**
```json
{
  "success": true,
  "data": {},
  "message": "Operation completed successfully"
}
```

### **Error Response**
```json
{
  "detail": "Error description here"
}
```

---

## 🚀 **How to Start**

1. **Start Backend:**
   ```bash
   cd backend
   python -m uvicorn app.main:app --reload --port 8000
   ```

2. **View Interactive Docs:**
   - Open: `http://127.0.0.1:8000/docs`
   - Test endpoints directly in browser

3. **Test APIs:**
   ```bash
   python test_all_apis.py
   ```

---

## 💡 **Key Features**

✅ **AI-Powered Text Processing** - Gemini integration for intelligent data extraction  
✅ **MongoDB Integration** - Persistent claim storage  
✅ **CORS Enabled** - Frontend integration ready  
✅ **Type Safety** - Pydantic models with validation  
✅ **Error Handling** - Comprehensive error responses  
✅ **Auto Documentation** - FastAPI interactive docs  
✅ **Async Support** - High-performance async operations  

---

## 🔍 **Testing**

Your backend APIs handle:
- ✅ Forest Rights Act claim form processing
- ✅ AI-powered text extraction and structuring
- ✅ Database operations (CRUD)
- ✅ Error handling and validation
- ✅ CORS for frontend integration

**Status:** Fully functional and ready for production use! 🎉