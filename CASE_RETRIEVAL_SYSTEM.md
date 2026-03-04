# Case Retrieval System - Documentation

## 📋 Overview

The **Case Retrieval System** is a similarity-based FIR (First Information Report) search system that enables police officers to find similar past cases to assist with current investigations. The system uses semantic similarity search, vector embeddings, and AI-powered re-ranking to provide accurate case recommendations.

## ⚠️ IMPORTANT: Synthetic Data Notice

**CRITICAL DISCLAIMER:**
- **ALL case data in this system is SYNTHETIC and artificially generated**
- **NO real FIR records, crimes, or personal information are stored or accessed**
- **The dataset is created for academic, research, and demonstration purposes only**
- **Suitable for final-year projects, SIH (Smart India Hackathon), and research presentations**
- **This system does NOT claim access to real police databases or live FIR records**

### Ethical & Legal Compliance

✅ **Ethically Compliant**: No real personal data or sensitive information  
✅ **Legally Safe**: All data is synthetic and clearly marked as such  
✅ **Academic Use**: Designed for educational and research purposes  
✅ **Transparent**: Clear labeling of synthetic data throughout the system  

---

## 🏗️ Architecture

### System Components

1. **Synthetic Dataset Generator** (`backend/scripts/generateSyntheticCases.js`)
   - Generates 50-200 realistic synthetic FIR cases
   - Creates embeddings for semantic search
   - Stores data in MongoDB

2. **Embedding Service** (`backend/services/embeddingService.js`)
   - Generates vector embeddings for text similarity
   - Calculates cosine similarity between cases
   - Converts similarity scores to percentages

3. **Gemini AI Service** (`backend/services/geminiService.js`)
   - Re-ranks search results using AI reasoning
   - Generates explanations for case similarity
   - Analyzes IPC section overlap and crime patterns

4. **MongoDB Model** (`backend/models/Case.js`)
   - Stores synthetic case data
   - Includes vector embeddings
   - Indexed for efficient search

5. **Backend API** (`backend/server.js`)
   - RESTful endpoints for case search
   - Case details with AI explanations
   - Statistics and counts

6. **Frontend Components**
   - `CaseRetrieval.tsx`: Main search interface
   - `CaseDetailsModal.tsx`: Detailed case view with AI analysis
   - `caseService.ts`: API client for case operations

---

## 🚀 Setup & Installation

### Prerequisites

- Node.js 18+ and npm
- MongoDB (local or Atlas)
- Gemini API Key (optional, for AI features)

### Step 1: Install Dependencies

```bash
cd backend
npm install
```

### Step 2: Configure Environment Variables

Create a `.env` file in the `backend` directory:

```env
MONGODB_URI=mongodb://localhost:27017/smart_fir
PORT=5000
FRONTEND_ORIGIN=http://localhost:5173
GEMINI_API_KEY=your_gemini_api_key_here  # Optional
```

**Note**: Gemini API key is optional. The system will work with a fallback embedding method if not provided.

### Step 3: Generate Synthetic Dataset

Run the synthetic data generator script:

```bash
npm run generate-cases
```

This will:
- Generate 150 synthetic FIR cases (default)
- Create embeddings for semantic search
- Store data in MongoDB `synthetic_cases` collection

To generate a custom number of cases:
```bash
node scripts/generateSyntheticCases.js 200  # Generate 200 cases
```

### Step 4: Start Backend Server

```bash
npm run dev  # Development mode with auto-reload
# or
npm start    # Production mode
```

### Step 5: Start Frontend

```bash
cd ../frontend
npm install
npm run dev
```

---

## 📡 API Endpoints

### POST `/api/cases/search`

Search for similar cases using semantic similarity.

**Request Body:**
```json
{
  "query": "mobile phone theft from pedestrian",
  "status": "Closed",  // Optional: "Pending", "Investigating", "Closed"
  "location": "Delhi", // Optional: location filter
  "ipcSections": ["IPC 379"], // Optional: IPC section filter
  "limit": 10  // Optional: max results (default: 10)
}
```

**Response:**
```json
{
  "success": true,
  "cases": [
    {
      "id": "65a1b2c3d4e5f6g7h8i9j0k1",
      "firId": "SYN_CASE_1",
      "firNumber": "SYN/2024/000001",
      "title": "Mobile Phone Theft - Sector 14 Metro Station",
      "description": "Mobile phone and wallet stolen from victim...",
      "status": "Closed",
      "officerInCharge": "Inspector Rajesh Kumar",
      "date": "2024-11-15",
      "location": "Sector 14 Metro Station, Delhi",
      "ipcSections": ["IPC 379", "IPC 356"],
      "similarity": 95
    }
  ],
  "count": 10,
  "query": "mobile phone theft from pedestrian"
}
```

### GET `/api/cases/:id`

Get detailed information about a specific case.

**Query Parameters:**
- `query` (optional): Search query for AI similarity explanation

**Response:**
```json
{
  "success": true,
  "case": {
    "id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "firId": "SYN_CASE_1",
    "firNumber": "SYN/2024/000001",
    "title": "Mobile Phone Theft - Sector 14 Metro Station",
    "description": "Full case description...",
    "status": "Closed",
    "officerInCharge": "Inspector Rajesh Kumar",
    "date": "2024-11-15",
    "location": "Sector 14 Metro Station, Delhi",
    "ipcSections": ["IPC 379", "IPC 356"],
    "isSynthetic": true,
    "createdAt": "2024-01-12T10:30:00.000Z",
    "similarityExplanation": "This case is similar due to shared crime patterns..."
  }
}
```

### GET `/api/cases/stats/counts`

Get statistics about synthetic cases.

**Response:**
```json
{
  "success": true,
  "stats": {
    "total": 150,
    "byStatus": {
      "Closed": 65,
      "Investigating": 50,
      "Pending": 35
    }
  }
}
```

---

## 🔍 How It Works

### 1. Semantic Similarity Search

1. User enters a search query (e.g., "mobile phone theft")
2. Query is converted to a vector embedding
3. Cosine similarity is calculated between query embedding and all case embeddings
4. Cases are ranked by similarity score (0-100%)
5. Top results are returned

### 2. AI-Powered Re-ranking (Optional)

If Gemini API key is configured:
1. Initial results are sent to Gemini for analysis
2. Gemini re-ranks based on semantic similarity, IPC overlap, and crime patterns
3. Improved ranking is returned to user

### 3. AI Explanation Generation

When viewing case details with a query:
1. Query and case details are sent to Gemini
2. AI generates explanation of similarity
3. Highlights IPC section overlaps and crime patterns
4. Explanation is displayed in the case details modal

---

## 📊 Database Schema

### Case Collection (`synthetic_cases`)

```javascript
{
  firId: String,              // Unique case ID (SYN_CASE_1, SYN_CASE_2, ...)
  firNumber: String,          // FIR number (SYN/YYYY/XXXXXX)
  title: String,              // Case title
  description: String,        // Full case description
  ipcSections: [String],      // Array of IPC sections
  location: String,           // Location of crime
  date: String,               // Date (YYYY-MM-DD)
  officer: String,            // Officer in charge
  status: String,             // "Closed" | "Investigating" | "Pending"
  embedding: [Number],        // Vector embedding (hidden by default)
  isSynthetic: Boolean,       // Always true
  createdAt: Date
}
```

**Indexes:**
- `firId` (unique)
- `firNumber` (unique)
- `status`, `date` (compound)
- `location`, `status` (compound)
- `ipcSections`
- `title`, `description` (text search)

---

## 🎯 Features

### ✅ Implemented Features

1. **Semantic Search**
   - Vector-based similarity search
   - Cosine similarity scoring
   - Percentage match display (0-100%)

2. **Filtering**
   - Status filter (Pending, Investigating, Closed)
   - Location filter
   - IPC section filter

3. **AI Enhancement** (Optional with Gemini API)
   - Re-ranking of results
   - Similarity explanations
   - IPC overlap analysis

4. **User Interface**
   - Modern, responsive design
   - Dark/Light theme support
   - Case details modal
   - Statistics dashboard
   - Loading states and error handling

5. **Data Management**
   - Synthetic dataset generation
   - Embedding generation
   - MongoDB storage and retrieval

---

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `MONGODB_URI` | MongoDB connection string | Yes | - |
| `PORT` | Backend server port | No | 5000 |
| `FRONTEND_ORIGIN` | Frontend URL for CORS | No | http://localhost:5173 |
| `GEMINI_API_KEY` | Google Gemini API key | No | - |

### Gemini API Setup (Optional)

1. Get API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Add to `.env` file: `GEMINI_API_KEY=your_key_here`
3. Restart the server

**Note**: System works without Gemini API using fallback methods, but AI features (re-ranking, explanations) will be disabled.

---

## 📝 Usage Guide

### For Developers

1. **Generate Dataset**: Run `npm run generate-cases`
2. **Start Backend**: `npm run dev`
3. **Start Frontend**: `cd frontend && npm run dev`
4. **Test Search**: Navigate to `/dashboard/cases` and search for cases

### For Researchers/Students

1. **Academic Use**: All data is synthetic - safe for research
2. **Documentation**: Include this documentation in your report
3. **Ethical Statement**: Use the disclaimer section in presentations
4. **Viva Preparation**: See "Viva/Report Explanation" section below

---

## 💡 Viva/Report Explanation

### One-Paragraph Summary

*"The Case Retrieval System is a semantic similarity-based search engine for FIR (First Information Report) case management. The system uses a synthetic dataset of 150 FIR cases generated specifically for academic and research purposes. When a user searches with a case description, the system converts the query into a vector embedding and calculates cosine similarity with stored case embeddings to find the most similar cases. Optional AI-powered re-ranking using Google's Gemini API improves result accuracy by analyzing IPC section overlaps and crime patterns. The system includes a modern React frontend and Express.js backend, with all data clearly marked as synthetic to ensure ethical and legal compliance. This implementation demonstrates real-world AI/ML applications in legal-tech systems while maintaining academic integrity."*

### Key Points for Viva

1. **Synthetic Data**: Emphasize that ALL data is artificially generated
2. **Technology Stack**: MERN (MongoDB, Express, React, Node.js) + AI (Gemini)
3. **Algorithm**: Vector embeddings + Cosine similarity + AI re-ranking
4. **Use Case**: Assist police in finding similar past cases
5. **Ethics**: No real data, compliant with privacy laws
6. **Scalability**: Can be extended with real data in production (with proper authorization)

---

## 🛠️ Technical Details

### Embedding Generation

- **Method**: Text-based feature extraction (fallback)
- **Dimension**: 128-dimensional vectors
- **Normalization**: L2 normalization for cosine similarity
- **Storage**: Stored in MongoDB as arrays

### Similarity Calculation

- **Metric**: Cosine similarity
- **Range**: -1 to 1 (converted to 0-100%)
- **Formula**: `cos(θ) = (A · B) / (||A|| × ||B||)`

### AI Integration (Gemini)

- **Model**: gemini-1.5-flash
- **Usage**: Re-ranking and explanation generation
- **Fallback**: System works without API key
- **Cost**: Free tier available from Google

---

## 🚧 Future Enhancements

Potential improvements (not implemented):

1. **Real Embedding Models**: Integration with OpenAI/Cohere embeddings
2. **FAISS Integration**: Python microservice for faster vector search
3. **Advanced Filters**: Date range, officer, multiple IPC sections
4. **Export Features**: PDF/CSV export of search results
5. **Case Clustering**: Group similar cases automatically
6. **Analytics Dashboard**: Visualizations of case patterns

---

## 📚 References & Credits

- **MongoDB**: Database for case storage
- **Google Gemini API**: AI-powered re-ranking and explanations
- **React + TypeScript**: Frontend framework
- **Express.js**: Backend framework
- **Tailwind CSS**: Styling framework

---

## ⚖️ Legal & Ethical Statement

This system is developed for **academic and research purposes only**. 

- ✅ All data is synthetic and artificially generated
- ✅ No real FIR records or personal information are used
- ✅ Suitable for educational demonstrations and research
- ✅ Compliant with data privacy and academic ethics guidelines
- ✅ Not intended for production use with real police data
- ✅ Clear labeling of synthetic data throughout the system

**For Production Use**: If this system is to be used with real FIR data, appropriate legal authorization, data protection measures, and privacy compliance must be implemented per local regulations.

---

## 📧 Support & Questions

For questions or issues:
1. Check this documentation first
2. Review the code comments
3. Verify environment variables are set correctly
4. Ensure MongoDB is running and accessible

---

**Last Updated**: January 2025  
**Version**: 1.0.0  
**Status**: Production-Ready (with synthetic data)

