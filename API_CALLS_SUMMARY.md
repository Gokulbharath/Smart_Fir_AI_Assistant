# API Calls Summary - Smart FIR AI Assistant

**Last Updated**: January 2025  
**Base URL**: `http://127.0.0.1:4000/api` (default)

---

## 📊 Quick Statistics

- **Total Backend Endpoints**: 21
- **Frontend API Functions**: 16
- **API Categories**: 4 (FIR Management, Case Retrieval, Utilities, Legacy)

---

## 🎯 API Endpoints by Category

### 1. FIR Management (Core Features)

#### Create & Draft Management

| Method | Endpoint | Frontend Function | Description |
|--------|----------|-------------------|-------------|
| POST | `/api/fir/create` | `createFIR()` | Create draft FIR with AI IPC predictions |
| POST | `/api/fir/create-draft` | `createDraft()` | Legacy: Create draft FIR (backward compatibility) |
| GET | `/api/fir/drafts` | `getDrafts(search?)` | Get all draft FIRs (with optional search) |
| PUT | `/api/fir/update/:id` | `updateDraftFIR(id, data)` | Update draft FIR (re-fetches IPC if description changes) |
| DELETE | `/api/fir/draft/:id` | `deleteDraft(id)` | Delete draft FIR |

#### Approval Workflow

| Method | Endpoint | Frontend Function | Description |
|--------|----------|-------------------|-------------|
| POST | `/api/fir/send-for-approval/:id` | `sendForApproval(id)` | Submit FIR for approval (draft → pending_approval) |
| POST | `/api/fir/approve/:id` | `approveFIR(id, approvedBy?)` | Approve and finalize FIR (moves to final_firs) |
| PUT | `/api/fir/:id/approve` | `approveFIRNew(id, approvedBy?)` | Legacy: Approve FIR (backward compatibility) |
| PUT | `/api/fir/:id/reject` | `rejectToDraft(id)` | Reject FIR back to draft status |
| PUT | `/api/fir/submit/:id` | `submitFIR(id)` | Legacy: Submit FIR for approval |

#### Retrieval & Viewing

| Method | Endpoint | Frontend Function | Description |
|--------|----------|-------------------|-------------|
| GET | `/api/fir/:id` | (direct fetch) | Get single FIR details (checks both collections) |
| GET | `/api/fir/pending` | `getPendingFIRs()` | Get pending approval FIRs |
| GET | `/api/fir/final` | `getFinalFIRs(search?)` | Get approved/final FIRs (with optional search) |
| GET | `/api/firs/:status` | `getFIRs(status)` | Legacy: Get FIRs by status (draft/pending/approved/rejected) |

---

### 2. Case Retrieval System (NEW)

| Method | Endpoint | Frontend Function | Description |
|--------|----------|-------------------|-------------|
| POST | `/api/cases/search` | `searchCases(request)` | Semantic similarity search for cases |
| GET | `/api/cases/:id` | `getCaseDetails(id, query?)` | Get case details with AI explanation |
| GET | `/api/cases/stats/counts` | `getCaseStats()` | Get case statistics (total, by status) |

**Note**: Case retrieval uses synthetic data only (academic/research purposes)

---

### 3. Utilities & Statistics

| Method | Endpoint | Frontend Function | Description |
|--------|----------|-------------------|-------------|
| GET | `/api/health` | (direct fetch) | Health check endpoint |
| GET | `/api/firs/counts` | `getCounts()` | Get FIR counts by status |
| GET | `/api/fir/pdf/:id` | `pdfUrl(id)` | Download FIR as PDF |
| GET | `/api/notifications` | (direct fetch) | Get system notifications |

---

## 📝 Detailed API Reference

### FIR Management APIs

#### `POST /api/fir/create`
**Purpose**: Create new draft FIR with automatic IPC predictions from LawGPT

**Request Body**:
```json
{
  "caseDescription": "string",
  "description": "string",
  "victim": "string",
  "accused": "string",
  "incident": "string",
  "date": "YYYY-MM-DD",
  "time": "HH:MM",
  "location": "string",
  "createdBy": "string"
}
```

**Response**:
```json
{
  "success": true,
  "fir": { /* FIR object */ },
  "message": "Draft FIR created successfully with IPC predictions"
}
```

**Frontend**: `createFIR(data)` in `firService.ts`

---

#### `GET /api/fir/drafts`
**Purpose**: Get all draft FIRs with optional search

**Query Parameters**:
- `search` (optional): Text search query
- `status` (optional): Filter by status (draft/pending_approval)

**Response**:
```json
{
  "success": true,
  "drafts": [ /* Array of FIR objects */ ],
  "count": number
}
```

**Frontend**: `getDrafts(search?)` in `firService.ts`

---

#### `PUT /api/fir/update/:id`
**Purpose**: Update existing draft FIR

**Request Body**: Any FIR fields to update

**Response**:
```json
{
  "success": true,
  "fir": { /* Updated FIR object */ },
  "message": "Draft FIR updated successfully"
}
```

**Frontend**: `updateDraftFIR(id, data)` in `firService.ts`

---

#### `POST /api/fir/send-for-approval/:id`
**Purpose**: Submit FIR for inspector approval

**Response**:
```json
{
  "success": true,
  "fir": { /* Updated FIR object */ },
  "message": "FIR submitted for approval"
}
```

**Frontend**: `sendForApproval(id)` in `firService.ts`

---

#### `POST /api/fir/approve/:id`
**Purpose**: Approve FIR and move to final collection

**Request Body** (optional):
```json
{
  "approvedBy": "string"
}
```

**Response**:
```json
{
  "success": true,
  "fir": { /* Final FIR object */ },
  "message": "FIR approved and finalized successfully"
}
```

**Frontend**: `approveFIR(id, approvedBy?)` in `firService.ts`

---

#### `GET /api/fir/pending`
**Purpose**: Get all FIRs pending approval

**Response**:
```json
{
  "success": true,
  "firs": [ /* Array of pending FIR objects */ ],
  "count": number
}
```

**Frontend**: `getPendingFIRs()` in `firService.ts`

---

#### `GET /api/fir/final`
**Purpose**: Get all approved/final FIRs

**Query Parameters**:
- `search` (optional): Text search query

**Response**:
```json
{
  "success": true,
  "firs": [ /* Array of approved FIR objects */ ],
  "count": number
}
```

**Frontend**: `getFinalFIRs(search?)` in `firService.ts`

---

#### `GET /api/fir/:id`
**Purpose**: Get single FIR by ID (checks both draft and final collections)

**Response**:
```json
{
  "success": true,
  "fir": { /* FIR object */ }
}
```

---

#### `DELETE /api/fir/draft/:id`
**Purpose**: Delete draft FIR (only if status is draft or pending_approval)

**Response**:
```json
{
  "success": true
}
```

**Frontend**: `deleteDraft(id)` in `firService.ts`

---

### Case Retrieval APIs

#### `POST /api/cases/search`
**Purpose**: Semantic similarity search for cases (synthetic data)

**Request Body**:
```json
{
  "query": "string (required)",
  "ipcSections": ["IPC 379", ...],
  "status": "Closed | Investigating | Pending",
  "location": "string",
  "limit": number (default: 10)
}
```

**Response**:
```json
{
  "success": true,
  "cases": [
    {
      "id": "string",
      "firId": "string",
      "firNumber": "string",
      "title": "string",
      "description": "string",
      "status": "Closed | Investigating | Pending",
      "officerInCharge": "string",
      "date": "YYYY-MM-DD",
      "location": "string",
      "ipcSections": ["IPC 379", ...],
      "similarity": number (0-100)
    }
  ],
  "count": number,
  "query": "string"
}
```

**Frontend**: `searchCases(request)` in `caseService.ts`

---

#### `GET /api/cases/:id`
**Purpose**: Get detailed case information with optional AI explanation

**Query Parameters**:
- `query` (optional): Search query for AI similarity explanation

**Response**:
```json
{
  "success": true,
  "case": {
    /* Case object with additional fields */
    "isSynthetic": true,
    "createdAt": "ISO date string",
    "similarityExplanation": "string (if query provided)"
  }
}
```

**Frontend**: `getCaseDetails(id, query?)` in `caseService.ts`

---

#### `GET /api/cases/stats/counts`
**Purpose**: Get case statistics (uses FIR collections)

**Response**:
```json
{
  "success": true,
  "stats": {
    "total": number,
    "byStatus": {
      "Closed": number,
      "Investigating": number,
      "Pending": number
    }
  }
}
```

**Frontend**: `getCaseStats()` in `caseService.ts`

---

### Utility APIs

#### `GET /api/health`
**Purpose**: Health check endpoint

**Response**:
```json
{
  "ok": true,
  "port": 4000,
  "message": "Server is running"
}
```

---

#### `GET /api/firs/counts`
**Purpose**: Get FIR counts by status

**Response**:
```json
{
  "draft": number,
  "pending_approval": number,
  "pending": number,
  "approved": number,
  "rejected": number
}
```

**Frontend**: `getCounts()` in `firService.ts`

---

#### `GET /api/fir/pdf/:id`
**Purpose**: Download FIR as PDF

**Response**: PDF file stream

**Frontend**: `pdfUrl(id)` returns URL string in `firService.ts`

---

#### `GET /api/notifications`
**Purpose**: Get system notifications

**Response**: Array of notification objects

---

## 🔄 Frontend API Service Files

### `frontend/src/api/firService.ts`
Contains 14 functions for FIR management:
- `createFIR()` - Create FIR with AI predictions
- `createDraft()` - Legacy draft creation
- `getDrafts()` - Get draft FIRs
- `deleteDraft()` - Delete draft
- `getPendingFIRs()` - Get pending approvals
- `getFinalFIRs()` - Get approved FIRs
- `submitFIR()` - Legacy submit
- `sendForApproval()` - Submit for approval
- `approveFIRNew()` - Legacy approve
- `getFIRs()` - Get by status
- `updateDraftFIR()` - Update draft
- `approveFIR()` - Approve FIR
- `rejectToDraft()` - Reject to draft
- `getCounts()` - Get FIR counts
- `pdfUrl()` - Get PDF URL

### `frontend/src/api/caseService.ts`
Contains 3 functions for case retrieval:
- `searchCases()` - Semantic search
- `getCaseDetails()` - Get case details
- `getCaseStats()` - Get statistics

---

## 🔗 External API Integrations

### LawGPT API (Python Backend)
**Base URL**: Configured via `LAWGPT_API_URL` env var (default: `http://127.0.0.1:5000`)

**Endpoint**: `POST /predict`
**Called from**: `backend/services/lawGPTService.js`
**Used by**: 
- `POST /api/fir/create`
- `PUT /api/fir/update/:id`

**Request**:
```json
{
  "case": "case description text"
}
```

**Response**:
```json
{
  "ipc_suggestions": [
    {
      "section_number": "IPC 379",
      "section_label": "IPC 379",
      "offense": "Theft",
      "punishment": "Up to 3 years",
      "confidence": 0.95
    }
  ]
}
```

---

### Google Gemini API (Optional)
**Base URL**: Via `@google/generative-ai` SDK
**API Key**: Configured via `GEMINI_API_KEY` env var

**Used by**: `backend/services/geminiService.js`
**Features**:
- Case re-ranking (`rerankCases()`)
- Similarity explanations (`generateSimilarityExplanation()`)
- IPC overlap analysis (`analyzeIPCOverlap()`)

**Called from**:
- `POST /api/cases/search` (optional re-ranking)
- `GET /api/cases/:id` (optional explanation)

---

## 📋 API Call Flow Examples

### Creating a FIR
1. Frontend: `createFIR(data)` → `POST /api/fir/create`
2. Backend: Calls LawGPT API → Gets IPC predictions
3. Backend: Creates DraftFIR in MongoDB
4. Backend: Returns FIR with predictions

### Approving a FIR
1. Frontend: `sendForApproval(id)` → `POST /api/fir/send-for-approval/:id`
2. Backend: Updates status to `pending_approval`
3. Inspector: `approveFIR(id)` → `POST /api/fir/approve/:id`
4. Backend: Moves FIR from `draft_firs` to `final_firs`
5. Backend: Returns approved FIR

### Searching Cases
1. Frontend: `searchCases({query: "theft"})` → `POST /api/cases/search`
2. Backend: Generates query embedding
3. Backend: Calculates cosine similarity with all cases
4. Backend: (Optional) Calls Gemini for re-ranking
5. Backend: Returns top matching cases with similarity scores

---

## 🔒 Security & Authentication

**Current Status**: ⚠️ Mock authentication (frontend-only)
- No backend authentication middleware
- No JWT tokens
- No session management
- User data stored in localStorage

**Recommended**: Implement JWT-based authentication for production

---

## 📊 API Statistics Summary

| Category | Endpoints | Frontend Functions |
|----------|-----------|-------------------|
| FIR Creation | 2 | 2 |
| FIR Retrieval | 5 | 4 |
| FIR Updates | 4 | 4 |
| Approval Workflow | 5 | 5 |
| Case Retrieval | 3 | 3 |
| Utilities | 4 | 2 |
| **Total** | **21** | **16** |

---

## 🎯 Quick Reference

### Base URL
- **Development**: `http://127.0.0.1:4000/api`
- **Configurable via**: `VITE_API_BASE` environment variable

### Common Headers
```javascript
{
  "Content-Type": "application/json"
}
```

### Error Response Format
```json
{
  "error": "Error message string"
}
```

### Success Response Format
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Optional message"
}
```

---

## 📝 Notes

1. **Port Configuration**: Backend runs on port 4000 (configurable via `PORT` env var)
2. **Legacy Routes**: Some routes maintained for backward compatibility
3. **Case Retrieval**: Uses synthetic data only (marked with `isSynthetic: true`)
4. **LawGPT Integration**: Graceful degradation - FIR creation works even if LawGPT is unavailable
5. **Gemini Integration**: Optional - system works without Gemini API key (uses fallback methods)

---

**End of API Calls Summary**

*For detailed endpoint documentation, see backend/README.md*

