# 🚀 RepoPilot AI

**Repository-Grounded AI Assistant for Understanding Codebases**

RepoPilot AI is an AI-powered engineering assistant that helps developers understand large GitHub repositories by chatting directly with the code. It treats a single repository as the sole source of truth, enabling accurate, grounded answers without hallucinations.


---

## 📌 Problem Statement

Large real-world repositories contain many files, hidden assumptions, and complex dependencies. Existing AI coding assistants often:

- ❌ **Hallucinate answers** (make up code that doesn't exist)
- ❌ **Ignore repository structure** and patterns
- ❌ **Suggest changes without explaining** impact or risk
- ❌ Lack **explainability** and confidence signals

This makes them hard to trust in real engineering workflows.

---

## 💡 Our Solution

RepoPilot AI answers questions **only with code retrieved from the repository**. Every answer is:

✅ **Grounded** — Backed by actual repository code  
✅ **Explainable** — Shows file names, function locations, line numbers  
✅ **Safe** — Refuses to answer if information is missing  
✅ **Confident** — Includes confidence signals and reasoning  
✅ **Fast** — Uses semantic search via FAISS embeddings  

---

## 🧠 Key Features

### 📂 Repository Ingestion & Indexing
- Download repositories from GitHub using the GitHub API
- Automatic structure detection for 6+ programming languages
- Function-level boundary extraction (exact line numbers)
- Smart chunking that preserves code context

### 🔍 Repository-Grounded Q&A (RAG)
- **Semantic search** of code based on embeddings
- **Intent-aware retrieval** (location, explanation, impact, overview)
- **Function-level precision** for "Where is X?" queries
- **Full code blocks** in responses

### 🧩 Automatic Query Decomposition
- Classify user intent (5 types: location, explanation, impact, overview, unknown)
- Adjust retrieval strategy based on question type
- Confidence scoring for each classification

### 🛡️ Hallucination Control & Safe Refusal
- Minimum chunk count validation before answering
- Distance-based relevance thresholds
- Safe refusal with clear explanation when unable to answer
- Strict vs. relaxed retrieval modes

### 🧠 Explainable Answers
- **Function name** when applicable
- **File path** with line numbers
- **Code snippets** from the source
- **Confidence levels** for all responses

---

## ⚙️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                       User Query                                 │
└──────────────┬──────────────────────────────────────────────────┘
               │
               ├─→ [Query Decomposer] – Detect intent & scope
               │
               ├─→ [Retriever]
               │   ├─→ Embed query using sentence-transformers
               │   ├─→ Search FAISS index for top-k similar chunks
               │   └─→ Rerank by intent (e.g., prioritize functions)
               │
               ├─→ [Safety Check] – Validate chunk quality & count
               │
               ├─→ [Prompt Builder] – Format question + context
               │
               └─→ [Answer Generator] – Call Gemini LLM
                   │
                   └─→ Return structured JSON response
                       {
                          "answer": "...",
                          "code": "...",
                          "file": "...",
                         "function": {...},
                         "confidence": "high"
                       }
```

### Pipeline Components

| Module | Purpose | Technologies |
|--------|---------|--------------|
| **github_loader** | Download repos from GitHub API | Python requests, GitHub API v3 |
| **chunker** | Extract functions, split code into chunks | Python AST, regex, language detection |
| **embedder** | Convert chunks to semantic vectors | sentence-transformers (all-MiniLM-L6-v2) |
| **faiss_index** | Index and search embeddings | FAISS (IndexFlatL2), pickle |
| **retriever** | Bridge embeddings & responses | FAISS, query decomposer |
| **query_decomposer** | Classify user intent | Regex patterns, confidence scoring |
| **safety_check** | Gate unsafe answers | Heuristic validation |
| **prompt_builder** | Format LLM instructions | String templating |
| **answer_generator** | Call Gemini LLM | google-generativeai |
| **app** | Flask HTTP API | Flask, CORS |

---

## 🧪 Example Queries & Responses

### Query 1: Function Location (Precise)
```
User: "Where is bubble sort implemented?"

Response:
{
  "answer": "The function `bubbleSort` is implemented in sorting/algorithms.py (lines 45-67).",
  "function": {
    "name": "bubbleSort",
    "file": "sorting/algorithms.py",
    "lines": "45–67",
    "code": "def bubbleSort(arr):\n    n = len(arr)\n    for i in range(n):\n        ..."
  },
  "confidence": "high"
}
```

### Query 2: Explanation (Overview + Code)
```
User: "How does bubble sort visualization work step by step?"

Response:
{
  "answer": "The bubble sort visualization works by...",
  "chunks": [
    {
      "file": "ui/visualizer.py",
      "code": "class SortVisualizer:\n    def animate_step(self, ...)",
      "distance": 0.15
    },
    ...
  ],
  "confidence": "high"
}
```

### Query 3: Architecture (Overview)
```
User: "Which sorting algorithms are implemented?"

Response:
{
  "answer": "This repository implements: bubble sort, merge sort, quicksort, heap sort.",
  "overview_signals": {
    "languages": ["Python", "JavaScript"],
    "frameworks": ["React"],
    "entry_points": ["main.py", "index.js"]
  },
  "confidence": "medium"
}
```

---

## 🛠️ Tech Stack

### Backend
- **Language**: Python 3.8+
- **Framework**: Flask (HTTP API)
- **Vector DB**: FAISS (fast similarity search)
- **Embeddings**: sentence-transformers (all-MiniLM-L6-v2)
- **LLM**: Google Generative AI (Gemini 1.5 Pro)
- **Repository Source**: GitHub API v3

### Frontend (Coming Soon)
- **Framework**: React 18+
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

### Key Dependencies
```
Flask==2.3.0
faiss-cpu==1.7.4
sentence-transformers==2.2.0
google-generativeai==0.3.0
python-dotenv==1.0.0
requests==2.31.0
cors==2.0.0
numpy==1.24.0
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- GitHub Personal Access Token (for API rate limits)
- Google AI API Key (for Gemini)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/RepoPilotAI.git
   cd RepoPilotAI
   ```

2. **Create and activate virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   cd Backend
   pip install -r requirements.txt
   ```

4. **Configure environment variables**
   ```bash
   # Create Backend/.env
   echo "GITHUB_TOKEN=your_github_token" > .env
   echo "GEMINI_API_KEY=your_gemini_api_key" >> .env
   ```

5. **Start the Flask server**
   ```bash
   python app.py
   ```
   Server runs on `http://localhost:5001`

---

## 📡 API Endpoints

### Health Check
```bash
GET /health
```
**Response**: `{"status": "healthy"}`

### Index a Repository
```bash
POST /index_repo
Content-Type: application/json

{
  "repo_url": "https://github.com/user/repo"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Repository indexed successfully",
  "indexed_chunks": 1042,
  "files_count": 127
}
```

### Ask a Question
```bash
POST /ask
Content-Type: application/json

{
  "question": "Where is bubble sort implemented?",
  "top_k": 5
}
```

**Response**:
```json
{
  "success": true,
  "answer": "The function `bubbleSort` is implemented in sorting/algorithms.py.",
  "function": {
    "name": "bubbleSort",
    "file": "sorting/algorithms.py",
    "lines": "45–67",
    "code": "def bubbleSort(arr):\n    ..."
  },
  "confidence": "high",
  "question_type": {
    "intent": "location",
    "confidence": 0.95
  }
}
```

---

## 📂 Project Structure

```
RepoPilotAI/
├── Backend/
│   ├── app.py                          # Flask HTTP server
│   ├── requirements.txt                # Python dependencies
│   ├── config/
│   │   └── settings.py                 # Configuration
│   ├── chunking/
│   │   └── chunker.py                  # Code chunking with function extraction
│   ├── embeddings/
│   │   └── embedder.py                 # Text to embeddings
│   ├── vector_db/
│   │   └── faiss_index.py              # FAISS indexing & search
│   ├── rag/
│   │   ├── retriever.py                # Semantic retrieval
│   │   ├── prompt_builder.py           # LLM prompt formatting
│   │   └── repo_loader/ (symlink)
│   ├── reasoning/
│   │   ├── query_decomposer.py         # Intent classification
│   │   ├── safety_check.py             # Hallucination prevention
│   │   └── overview_signals.py         # Architecture extraction
│   ├── generator/
│   │   └── answer_generator.py         # LLM generation
│   ├── repo_loader/
│   │   ├── github_loader.py            # GitHub API integration
│   │   └── file_filter.py              # Path filtering
│   ├── data/
│   │   ├── repo_temp/                  # Temporary repo downloads
│   │   ├── repo_cache/                 # Cached indexes
│   │   └── vector_store/               # FAISS index storage
│   └── docs/
│       └── design.md                   # Detailed design doc
│
├── Frontend/                           # React app (coming soon)
│   ├── src/
│   ├── public/
│   └── package.json
│
└── README.md                           # This file
```

---

## 🎯 Alignment with PS-7 (Round 1)

RepoPilot AI satisfies the core requirements of GDGC PCCOE Problem Statement 7:

✅ **Repository-aware Q&A** — All answers backed by actual code  
✅ **Grounded RAG** — No hallucination; refuses unsafe answers  
✅ **Query Decomposition** — Intelligent intent detection  
✅ **Explainability** — File names, line numbers, functions  
✅ **Uncertainty handling** — Confidence scores and safe refusal  
✅ **Careful engineering judgment** — Validation gates and heuristics  

---

## 🔬 How It Works (Technical Deep Dive)

### 1. **Repository Indexing**
```python
# User calls: POST /index_repo with GitHub URL
# 1. Download repo via GitHub API (not git clone)
# 2. Detect file types and languages
# 3. Extract functions with line numbers
# 4. Split into semantic chunks
# 5. Generate embeddings (384-dim vectors)
# 6. Index in FAISS
```

### 2. **Query Processing**
```python
# User asks: "Where is bubbleSort?"
# 1. Detect intent: "location" (0.95 confidence)
# 2. Embed query: [0.12, -0.45, 0.78, ...]
# 3. Search FAISS for top-5 similar chunks
# 4. Rerank to prioritize function chunks
# 5. Validate quality (>5 chunks, relevance > 0.7)
# 6. Format prompt with code context
# 7. Call Gemini LLM
# 8. Return structured response with code
```

### 3. **Safety Mechanisms**
- **Chunk validation**: Must have sufficient text length
- **Distance thresholds**: L2 distance must be below 1.5 for strict mode
- **Count validation**: Overview queries need 5+ chunks
- **Refusal gate**: If unsafe/unhelpful, respond clearly
- **Confidence scoring**: All responses include confidence levels

---

## 🚀 Future Scope

- 📊 **Architecture diagrams** — Auto-generate from code structure
- 🔗 **Multi-repository support** — Ask across multiple repos
- 🎨 **IDE integration** — VS Code extension
- 🧪 **Code generation** — Repository-aligned suggestions
- 📈 **Analytics dashboard** — Query patterns and insights

---

## 🧪 Testing

### Manual Testing
```bash
# 1. Start server
python app.py

# 2. Index a repository
curl -X POST http://localhost:5001/index_repo \
  -H "Content-Type: application/json" \
  -d '{"repo_url": "https://github.com/example/repo"}'

# 3. Ask a question
curl -X POST http://localhost:5001/ask \
  -H "Content-Type: application/json" \
  -d '{"question": "Where is authentication implemented?", "top_k": 5}'
```

### Running Tests
```bash
pytest tests/  # Coming soon
```

---

## 📋 Configuration

Edit `Backend/config/settings.py` to customize:

```python
# Embedding model
EMBEDDING_MODEL = "all-MiniLM-L6-v2"
EMBEDDING_DIM = 384

# FAISS search
TOP_K_RETRIEVAL = 5
DISTANCE_THRESHOLD = 1.5

# Safety checks
CHUNK_COUNT_THRESHOLD = 5
CHUNK_TEXT_MIN_LENGTH = 50

# LLM
LLM_MODEL = "gemini-1.5-pro"
LLM_TEMPERATURE = 0.3
```


## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---


## 👥 Team

**Team Name**: CODEX  
**Hackathon**: GDGC PCCOE – Problem Statement 7  
**Project**: RepoPilot AI — Repository-Grounded Q&A for Code Understanding

---


## 🌟 Acknowledgments

- **sentence-transformers** — For powerful semantic embeddings
- **FAISS** — For lightning-fast similarity search
- **Google Generative AI** — For Gemini LLM API
- **GitHub API** — For repository access
- **Flask** — For the lightweight web framework

---


