# Smart FIR Backend

Complete MERN backend with LawGPT integration for FIR (First Information Report) management.

## Features

- ✅ Draft FIR creation with automatic IPC section prediction
- ✅ LawGPT API integration for IPC predictions
- ✅ Separate collections for draft and final FIRs
- ✅ Approval workflow (draft → pending_approval → approved)
- ✅ Search and filtering capabilities
- ✅ PDF generation for approved FIRs
- ✅ Notification system

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

Required environment variables:
- `MONGODB_URI`: MongoDB connection string
- `PORT`: Express server port (default: 5000)
- `FRONTEND_ORIGIN`: Frontend URL (default: http://localhost:5173)
- `LAWGPT_API_URL`: LawGPT Python backend URL (default: http://127.0.0.1:5000)

### 3. Start MongoDB

Ensure MongoDB is running on your system.

### 4. Start LawGPT Backend

Make sure your LawGPT Python backend is running and accessible at the configured URL.

### 5. Start Express Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

## API Routes

### FIR Management

- `POST /api/fir/create` - Create new draft FIR with IPC predictions
- `GET /api/fir/drafts` - Get all draft FIRs (with optional search)
- `GET /api/fir/:id` - Get single FIR details
- `PUT /api/fir/update/:id` - Update draft FIR
- `POST /api/fir/send-for-approval/:id` - Submit FIR for approval
- `POST /api/fir/approve/:id` - Approve and finalize FIR
- `GET /api/fir/pending` - Get pending approval FIRs
- `GET /api/fir/final` - Get approved/final FIRs

### Utilities

- `GET /api/health` - Health check
- `GET /api/firs/counts` - Get FIR counts by status
- `GET /api/fir/pdf/:id` - Download FIR as PDF
- `GET /api/notifications` - Get notifications

## Database Schema

### Draft FIRs (draft_firs collection)

```json
{
  "firNumber": "FIR/2024/123456",
  "caseDescription": "String",
  "ipcPredictions": [
    {
      "section": "IPC 379",
      "offense": "Theft",
      "punishment": "Up to 3 years",
      "confidence": 0.95
    }
  ],
  "status": "draft" | "pending_approval",
  "victim": "String",
  "accused": "String",
  "incident": "String",
  "date": "String",
  "time": "String",
  "location": "String",
  "description": "String",
  "createdBy": "String",
  "createdAt": Date,
  "updatedAt": Date
}
```

### Final FIRs (final_firs collection)

Same structure as draft FIRs, but with:
- `status`: "approved"
- `approvedBy`: "String"
- `approvedAt`: Date

## LawGPT Integration

The backend automatically calls the LawGPT API when:
1. Creating a new FIR (`POST /api/fir/create`)
2. Updating case description (`PUT /api/fir/update/:id`)

Expected LawGPT API format:
```json
POST /predict
{
  "case": "Case description text"
}

Response:
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

## Project Structure

```
backend/
├── models/
│   └── FIR.js          # Mongoose models for DraftFIR and FinalFIR
├── services/
│   └── lawGPTService.js # LawGPT API integration service
├── server.js           # Main Express server
├── package.json
└── .env.example
```

## Error Handling

- All routes include proper error handling
- LawGPT failures are gracefully handled (draft creation continues without predictions)
- Detailed console logging for debugging

## Production Notes

- Ensure MongoDB connection pooling is configured
- Set up proper CORS origins for production
- Configure rate limiting if needed
- Use environment variables for all sensitive data













