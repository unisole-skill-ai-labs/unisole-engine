import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import { pool } from "../db";

// Official 12-week Generative AI Engineering curriculum modules and lessons
export const GENAI_MODULES = [
  {
    "id": "mod-1",
    "title": "Week 1 — Data Engineering for AI",
    "meta": "3 Videos · 2 Assessments · 4 Resources",
    "items": [
      {
        "id": "les-g1-1",
        "title": "1.1 Handling Large & Messy Datasets",
        "duration": "14 Mins",
        "type": "video",
        "videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "description": "Techniques for ingesting dirty real-world datasets, handling missing values, and high-cardinality encodings."
      },
      {
        "id": "les-g1-2",
        "title": "1.2 EDA Strategy & Data Quality Diagnostics",
        "duration": "18 Mins",
        "type": "video",
        "videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "description": "Systematic exploratory data analysis, skewness correction, and distribution profiling."
      },
      {
        "id": "les-g1-3",
        "title": "1.3 Git Branching & Team AI Workflows",
        "duration": "12 Mins",
        "type": "video",
        "videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "description": "Trunk-based development, PR review etiquette, and reproducible Linux CLI environments."
      },
      {
        "id": "les-g1-quiz",
        "title": "Week 1 Graded Quiz: Data & Linux Drills",
        "duration": "15 Mins",
        "type": "quiz",
        "questions": [
          {
            "id": "q-1-1",
            "question": "Which Linux command displays interactive real-time CPU, RAM, and process load?",
            "options": [
              "top / htop",
              "grep -r",
              "chmod +x",
              "netstat -tuln"
            ],
            "correctOptionIndex": 0,
            "explanation": "top and htop provide interactive real-time process and resource monitoring on Linux servers."
          },
          {
            "id": "q-1-2",
            "question": "What is the primary risk of using simple One-Hot Encoding on high-cardinality categorical features?",
            "options": [
              "Sparse matrix explosion and excessive dimensionality",
              "Total loss of floating point precision",
              "Instant kernel panics in pandas",
              "Inability to save files to disk"
            ],
            "correctOptionIndex": 0,
            "explanation": "One-hot encoding creates a column for every unique value, causing massive memory usage and computational slowdowns."
          },
          {
            "id": "q-1-3",
            "question": "Which Git command creates and switches to a new branch in a single command?",
            "options": [
              "git checkout -b <name>",
              "git merge --abort",
              "git status -v",
              "git branch -d"
            ],
            "correctOptionIndex": 0,
            "explanation": "git checkout -b (or git switch -c) creates the new branch and immediately checks it out."
          }
        ]
      },
      {
        "id": "les-g1-lab",
        "title": "Week 1 Hands-on Lab: Real Dataset Profiling",
        "duration": "60 Mins",
        "type": "assignment",
        "instructions": "Clean and profile a messy 100k+ row dataset with Pandas/NumPy. Establish a reproducible Git branching + PR workflow and execute Linux CLI drills."
      }
    ]
  },
  {
    "id": "mod-2",
    "title": "Week 2 — AI Backend Engineering I",
    "meta": "3 Videos · 2 Assessments · 4 Resources",
    "items": [
      {
        "id": "les-g2-1",
        "title": "2.1 REST API Design for ML/LLM Serving",
        "duration": "16 Mins",
        "type": "video",
        "videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "description": "Designing synchronous vs asynchronous prediction contracts, SSE streaming, and payload validations."
      },
      {
        "id": "les-g2-2",
        "title": "2.2 FastAPI vs Flask Architecture & Concurrency",
        "duration": "15 Mins",
        "type": "video",
        "videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "description": "ASGI event loops, Uvicorn worker clustering, and async/await throughput benchmarks."
      },
      {
        "id": "les-g2-3",
        "title": "2.3 Pydantic Request Validation & Error Handling",
        "duration": "13 Mins",
        "type": "video",
        "videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "description": "Strict typing, schema serialization, custom validators, and standard HTTP error codes."
      },
      {
        "id": "les-g2-quiz",
        "title": "Week 2 Graded Quiz: FastAPI & Model Serving",
        "duration": "15 Mins",
        "type": "quiz",
        "questions": [
          {
            "id": "q-2-1",
            "question": "Why is FastAPI natively better suited than standard synchronous Flask for LLM serving?",
            "options": [
              "Native ASGI async/await allows high-concurrency non-blocking streaming I/O during LLM token generation",
              "FastAPI does not run on Python",
              "Flask cannot accept POST requests",
              "FastAPI trains neural networks 10x faster"
            ],
            "correctOptionIndex": 0,
            "explanation": "FastAPI is built on Starlette and supports async event loops, preventing slow LLM generation calls from blocking server worker threads."
          },
          {
            "id": "q-2-2",
            "question": "What HTTP status code is automatically returned when a request payload fails Pydantic schema validation?",
            "options": [
              "422 Unprocessable Entity",
              "200 OK",
              "404 Not Found",
              "500 Internal Server Error"
            ],
            "correctOptionIndex": 0,
            "explanation": "FastAPI uses 422 Unprocessable Entity when the incoming JSON fails field types or constraints."
          }
        ]
      },
      {
        "id": "les-g2-lab",
        "title": "Week 2 Hands-on Lab: FastAPI Inference Endpoint",
        "duration": "60 Mins",
        "type": "assignment",
        "instructions": "Build and deploy a FastAPI service serving an NLP sentiment analysis endpoint with strict Pydantic request/response validation and robust error handling."
      }
    ]
  },
  {
    "id": "mod-3",
    "title": "Week 3 — AI Backend Engineering II",
    "meta": "3 Videos · 2 Assessments · 4 Resources",
    "items": [
      {
        "id": "les-g3-1",
        "title": "3.1 PostgreSQL Fundamentals for AI Data",
        "duration": "17 Mins",
        "type": "video",
        "videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "description": "Designing relational schemas, JSONB columns, foreign keys, and migration strategies."
      },
      {
        "id": "les-g3-2",
        "title": "3.2 Redis In-Memory Caching for LLM Responses",
        "duration": "14 Mins",
        "type": "video",
        "videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "description": "Sub-millisecond prompt caching, TTL policies, and token cost reduction patterns."
      },
      {
        "id": "les-g3-3",
        "title": "3.3 Docker Containerization & System Rate Limiting",
        "duration": "20 Mins",
        "type": "video",
        "videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "description": "Multi-stage Docker builds, docker-compose orchestration, and sliding-window rate limiters."
      },
      {
        "id": "les-g3-quiz",
        "title": "Week 3 Graded Quiz: Docker & Redis Caching",
        "duration": "15 Mins",
        "type": "quiz",
        "questions": [
          {
            "id": "q-3-1",
            "question": "What is the primary role of Redis semantic and exact response caching in production LLM systems?",
            "options": [
              "Drastically reduce token costs and API latency for frequent identical or semantically similar queries",
              "Compile Python code into machine language",
              "Encrypt user passwords with bcrypt",
              "Replace GPU accelerators"
            ],
            "correctOptionIndex": 0,
            "explanation": "Caching prompt responses eliminates redundant calls to commercial LLM APIs, cutting costs and dropping latency to sub-10ms."
          },
          {
            "id": "q-3-2",
            "question": "What is the key benefit of multi-stage Docker builds for Python AI services?",
            "options": [
              "Dramatically smaller final production images by discarding build compilers and pip caches",
              "Doubles GPU memory bandwidth",
              "Bypasses Linux permissions automatically",
              "Runs without Docker desktop"
            ],
            "correctOptionIndex": 0,
            "explanation": "Multi-stage builds leave compiler tools in builder stages, producing lean runtime images."
          }
        ]
      },
      {
        "id": "les-g3-lab",
        "title": "Week 3 Hands-on Lab: Containerized AI Backend Gate",
        "duration": "60 Mins",
        "type": "assignment",
        "instructions": "Dockerize your FastAPI service with Postgres persistence, Redis caching, and a sliding-window rate limiter. This is the industry-readiness gate before NLP & LLMs."
      }
    ]
  },
  {
    "id": "mod-4",
    "title": "Week 4 — NLP Foundations: Text Representation",
    "meta": "3 Videos · 2 Assessments · 4 Resources",
    "items": [
      {
        "id": "les-g4-1",
        "title": "4.1 Tokenization, Stemming & Lemmatization",
        "duration": "15 Mins",
        "type": "video",
        "videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "description": "Linguistic challenges, subword tokenizers (BPE, WordPiece), and morphology normalization."
      },
      {
        "id": "les-g4-2",
        "title": "4.2 Bag of Words (BoW) & TF-IDF Vectorization",
        "duration": "18 Mins",
        "type": "video",
        "videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "description": "Sparse lexical vector spaces, term frequency mechanics, and document frequency weighting."
      },
      {
        "id": "les-g4-3",
        "title": "4.3 Limitations of Lexical Matching",
        "duration": "12 Mins",
        "type": "video",
        "videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "description": "Polysemy, synonymy, out-of-vocabulary tokens, and the need for dense semantic embeddings."
      },
      {
        "id": "les-g4-quiz",
        "title": "Week 4 Graded Quiz: NLP Text Representation",
        "duration": "15 Mins",
        "type": "quiz",
        "questions": [
          {
            "id": "q-4-1",
            "question": "What does the Inverse Document Frequency (IDF) component penalize in TF-IDF?",
            "options": [
              "Common words that appear across nearly every document in the corpus",
              "Words with fewer than 3 characters",
              "Proper nouns and foreign words",
              "Punctuation symbols"
            ],
            "correctOptionIndex": 0,
            "explanation": "Words that appear everywhere (like 'the', 'system', 'data') have low discriminative value, so IDF downweights them."
          },
          {
            "id": "q-4-2",
            "question": "Why is lemmatization fundamentally superior to rule-based stemming?",
            "options": [
              "Lemmatization uses vocabulary and morphological rules to return valid root words (lemma)",
              "Stemming requires an active GPU",
              "Lemmatization runs 100x faster than stemming",
              "Stemming only works on English numbers"
            ],
            "correctOptionIndex": 0,
            "explanation": "Lemmatization uses linguistic dictionaries to produce real words (e.g. 'caring' -> 'care'), whereas stemming simply truncates suffixes."
          }
        ]
      },
      {
        "id": "les-g4-lab",
        "title": "Week 4 Hands-on Lab: Text Cleaning & TF-IDF from Scratch",
        "duration": "60 Mins",
        "type": "assignment",
        "instructions": "Build an end-to-end text-cleaning pipeline with NLTK. Implement Bag-of-Words and TF-IDF from scratch in NumPy, then compare against scikit-learn."
      }
    ]
  },
  {
    "id": "mod-5",
    "title": "Week 5 — Word Embeddings & Sequence Models",
    "meta": "3 Videos · 2 Assessments · 4 Resources",
    "items": [
      {
        "id": "les-g5-1",
        "title": "5.1 Word2Vec (CBOW vs Skip-Gram) & Vector Math",
        "duration": "19 Mins",
        "type": "video",
        "videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "description": "Distributional hypothesis, dense continuous vectors, negative sampling, and analogy math."
      },
      {
        "id": "les-g5-2",
        "title": "5.2 Vanilla RNNs & Vanishing Gradients",
        "duration": "16 Mins",
        "type": "video",
        "videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "description": "Recurrence relations, backpropagation through time (BPTT), and memory bottleneck."
      },
      {
        "id": "les-g5-3",
        "title": "5.3 LSTM & GRU Gated Architectures",
        "duration": "21 Mins",
        "type": "video",
        "videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "description": "Cell state highway, forget/input/output gates, bidirectional RNNs (BiRNN)."
      },
      {
        "id": "les-g5-quiz",
        "title": "Week 5 Graded Quiz: Embeddings & LSTMs",
        "duration": "15 Mins",
        "type": "quiz",
        "questions": [
          {
            "id": "q-5-1",
            "question": "In Word2Vec, what is the core difference between CBOW and Skip-gram?",
            "options": [
              "CBOW predicts target word from context; Skip-gram predicts context words given target",
              "CBOW is supervised, while Skip-gram is purely random",
              "Skip-gram only handles emojis",
              "CBOW requires pre-trained BERT"
            ],
            "correctOptionIndex": 0,
            "explanation": "Continuous Bag-of-Words uses surrounding context words to predict the center token; Skip-gram reverses this objective."
          },
          {
            "id": "q-5-2",
            "question": "Which component of an LSTM cell solves the vanishing gradient problem over long sequences?",
            "options": [
              "The constant error carousel / additive cell state highway gated by the forget gate",
              "Using pure ReLU activations everywhere",
              "Dropping 99% of training samples",
              "Training without backpropagation"
            ],
            "correctOptionIndex": 0,
            "explanation": "The linear cell state highway allows gradients to flow backwards through time without undergoing repeated multiplicative decay."
          }
        ]
      },
      {
        "id": "les-g5-lab",
        "title": "Week 5 Hands-on Lab: Word2Vec & LSTM Benchmark",
        "duration": "60 Mins",
        "type": "assignment",
        "instructions": "Train a Word2Vec embedding model on a custom technical corpus. Build RNN, LSTM, and GRU text classifiers in PyTorch and benchmark their accuracy and convergence."
      }
    ]
  },
  {
    "id": "mod-6",
    "title": "Week 6 — Seq2Seq & Attention",
    "meta": "3 Videos · 2 Assessments · 4 Resources",
    "items": [
      {
        "id": "les-g6-1",
        "title": "6.1 Encoder-Decoder Seq2Seq Mechanics",
        "duration": "17 Mins",
        "type": "video",
        "videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "description": "Sequence transduction, teacher forcing, beam search vs greedy decoding."
      },
      {
        "id": "les-g6-2",
        "title": "6.2 The Fixed-Context-Vector Bottleneck",
        "duration": "14 Mins",
        "type": "video",
        "videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "description": "Diagnosing degradation on sentences longer than 20 tokens."
      },
      {
        "id": "les-g6-3",
        "title": "6.3 Bahdanau Additive vs Luong Multiplicative Attention",
        "duration": "22 Mins",
        "type": "video",
        "videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "description": "Dynamic alignment scoring, softmax normalization, and context vector synthesis."
      },
      {
        "id": "les-g6-quiz",
        "title": "Week 6 Graded Quiz: Attention Mechanisms",
        "duration": "15 Mins",
        "type": "quiz",
        "questions": [
          {
            "id": "q-6-1",
            "question": "What was the fundamental bottleneck of vanilla Seq2Seq that Attention resolved?",
            "options": [
              "Forcing an entire arbitrary-length sentence into a single fixed-size bottleneck vector",
              "High GPU power consumption",
              "Inability to handle English grammar",
              "Requiring too many training epochs"
            ],
            "correctOptionIndex": 0,
            "explanation": "Compressing entire sentences into a single vector caused severe loss of fine-grained details."
          },
          {
            "id": "q-6-2",
            "question": "What does the Attention mechanism calculate at each decoder step?",
            "options": [
              "A dynamic weighted sum over all encoder hidden states based on alignment scores",
              "A static average of all vocabulary tokens",
              "A random sample from normal distribution",
              "A binary 0 or 1 mask"
            ],
            "correctOptionIndex": 0,
            "explanation": "Attention calculates alignment weights so the decoder dynamically focuses on the most relevant source tokens."
          }
        ]
      },
      {
        "id": "les-g6-lab",
        "title": "Week 6 Hands-on Lab: Seq2Seq with Attention",
        "duration": "60 Mins",
        "type": "assignment",
        "instructions": "Build an Encoder-Decoder Seq2Seq model for text summarization. Implement an Attention layer on top and quantify the BLEU score improvement."
      }
    ]
  },
  {
    "id": "mod-7",
    "title": "Week 7 — Transformers",
    "meta": "3 Videos · 2 Assessments · 4 Resources",
    "items": [
      {
        "id": "les-g7-1",
        "title": "7.1 Scaled Dot-Product & Multi-Head Self-Attention",
        "duration": "22 Mins",
        "type": "video",
        "videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "description": "Q, K, V projections, scaling factor sqrt(d_k), and multi-head representation subspaces."
      },
      {
        "id": "les-g7-2",
        "title": "7.2 Positional Encodings & LayerNorm Architecture",
        "duration": "18 Mins",
        "type": "video",
        "videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "description": "Sinusoidal vs learned encodings, residual connections, Pre-LN vs Post-LN."
      },
      {
        "id": "les-g7-3",
        "title": "7.3 Pretrained Transformers & BERT Fine-Tuning",
        "duration": "20 Mins",
        "type": "video",
        "videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "description": "Masked language modeling (MLM), [CLS] token classification, and transfer learning."
      },
      {
        "id": "les-g7-quiz",
        "title": "Week 7 Graded Quiz: Transformer Architecture",
        "duration": "15 Mins",
        "type": "quiz",
        "questions": [
          {
            "id": "q-7-1",
            "question": "Why do Transformers require Positional Encodings injected into token embeddings?",
            "options": [
              "Self-attention operations are permutation-invariant and cannot distinguish word order without positional signals",
              "To compress vocabulary memory",
              "To prevent gradient underflow",
              "To convert text to audio"
            ],
            "correctOptionIndex": 0,
            "explanation": "Because self-attention computes dot products across all token pairs simultaneously, word order is lost unless explicitly injected."
          },
          {
            "id": "q-7-2",
            "question": "What is the computational complexity of full standard self-attention relative to sequence length N?",
            "options": [
              "O(N^2) quadratic",
              "O(N) linear",
              "O(log N)",
              "O(1) constant"
            ],
            "correctOptionIndex": 0,
            "explanation": "Computing the N x N attention matrix between all queries and keys scales quadratically with sequence length."
          }
        ]
      },
      {
        "id": "les-g7-lab",
        "title": "Week 7 Hands-on Lab: BERT Fine-Tuning Benchmark",
        "duration": "60 Mins",
        "type": "assignment",
        "instructions": "Fine-tune a pretrained BERT model for classification. Complete the evolution benchmark comparing: BoW → Word2Vec → LSTM → Attention → Transformer."
      }
    ]
  },
  {
    "id": "mod-8",
    "title": "Week 8 — Embeddings, Vector Databases & Retrieval",
    "meta": "3 Videos · 2 Assessments · 4 Resources",
    "items": [
      {
        "id": "les-g8-1",
        "title": "8.1 Dense Embedding Spaces & Similarity Metrics",
        "duration": "16 Mins",
        "type": "video",
        "videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "description": "Cosine similarity, inner product, L2 distance, and bi-encoder embeddings."
      },
      {
        "id": "les-g8-2",
        "title": "8.2 Vector Database Internals: FAISS & Chroma",
        "duration": "19 Mins",
        "type": "video",
        "videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "description": "Inverted file indexing (IVF), HNSW graphs, and Product Quantization (PQ)."
      },
      {
        "id": "les-g8-3",
        "title": "8.3 Hybrid Retrieval: BM25 + Dense Reranking",
        "duration": "17 Mins",
        "type": "video",
        "videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "description": "Reciprocal Rank Fusion (RRF), cross-encoder rerankers, and recall optimization."
      },
      {
        "id": "les-g8-quiz",
        "title": "Week 8 Graded Quiz: Vector DBs & Hybrid Search",
        "duration": "15 Mins",
        "type": "quiz",
        "questions": [
          {
            "id": "q-8-1",
            "question": "What is the primary strength of combining BM25 keyword search with Dense vector retrieval?",
            "options": [
              "Captures both exact keyword/part-number precision and broad semantic conceptual context",
              "Eliminates the need for indexing",
              "Allows vector databases to run on diskettes",
              "Avoids using any embedding models"
            ],
            "correctOptionIndex": 0,
            "explanation": "Hybrid search avoids failures where embeddings miss exact jargon or part codes, and where BM25 misses synonyms."
          },
          {
            "id": "q-8-2",
            "question": "What algorithm does HNSW use to achieve logarithmic-time approximate nearest neighbor search?",
            "options": [
              "Hierarchical multi-layer proximity graphs with skip-list navigation",
              "Brute-force linear scan of every vector",
              "Bubble sort on dot products",
              "Random hash table truncation"
            ],
            "correctOptionIndex": 0,
            "explanation": "Hierarchical Navigable Small World (HNSW) organizes vectors into hierarchical proximity graphs for ultra-fast traversal."
          }
        ]
      },
      {
        "id": "les-g8-lab",
        "title": "Week 8 Hands-on Lab: Hybrid FAISS + Chroma Retrieval",
        "duration": "60 Mins",
        "type": "assignment",
        "instructions": "Build embedding pipelines with FAISS and Chroma. Implement a hybrid BM25 + dense retrieval engine with RRF reranking and measure recall gains."
      }
    ]
  },
  {
    "id": "mod-9",
    "title": "Week 9 — RAG, Prompt Engineering & LLM APIs",
    "meta": "3 Videos · 2 Assessments · 4 Resources",
    "items": [
      {
        "id": "les-g9-1",
        "title": "9.1 RAG Architecture & Chunking Strategies",
        "duration": "20 Mins",
        "type": "video",
        "videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "description": "Recursive character chunking, semantic chunking, metadata enrichment, and parent-child retrieval."
      },
      {
        "id": "les-g9-2",
        "title": "9.2 Eval-Driven & Chain-of-Thought Prompting",
        "duration": "18 Mins",
        "type": "video",
        "videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "description": "Few-shot templates, structured JSON outputs, system prompt guardrails, and CoT reasoning."
      },
      {
        "id": "les-g9-3",
        "title": "9.3 RAG Evaluation: Faithfulness, Relevance & Cost",
        "duration": "19 Mins",
        "type": "video",
        "videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "description": "RAGAS framework, hallucination benchmarking, token cost tracking, and latency telemetry."
      },
      {
        "id": "les-g9-quiz",
        "title": "Week 9 Graded Quiz: RAG Evaluation & Prompting",
        "duration": "15 Mins",
        "type": "quiz",
        "questions": [
          {
            "id": "q-9-1",
            "question": "What does the 'Faithfulness' metric evaluate in a RAG system?",
            "options": [
              "Whether all claims in the generated answer are strictly grounded in the retrieved context",
              "Whether the user clicked like on the answer",
              "The ping latency to the LLM API",
              "Whether the model used polite language"
            ],
            "correctOptionIndex": 0,
            "explanation": "Faithfulness measures the absence of hallucinations by verifying statements against context chunks."
          },
          {
            "id": "q-9-2",
            "question": "Why is semantic chunking preferred over naive fixed-character splitting?",
            "options": [
              "It splits text at natural conceptual and syntactic boundaries, preserving cohesive meaning",
              "It guarantees all chunks are exactly 100 bytes",
              "It deletes all vowels to save storage",
              "It requires zero compute"
            ],
            "correctOptionIndex": 0,
            "explanation": "Semantic chunking prevents sentences or ideas from being cut in half, maximizing retrieval relevancy."
          }
        ]
      },
      {
        "id": "les-g9-lab",
        "title": "Week 9 Hands-on Lab: End-to-End Evaluated RAG Pipeline",
        "duration": "60 Mins",
        "type": "assignment",
        "instructions": "Build an end-to-end RAG pipeline over domain PDF documentation. Implement a telemetry dashboard logging faithfulness, answer relevance, latency, and token cost per query."
      }
    ]
  },
  {
    "id": "mod-10",
    "title": "Week 10 — LangChain/LangGraph & LLMOps",
    "meta": "3 Videos · 2 Assessments · 4 Resources",
    "items": [
      {
        "id": "les-g10-1",
        "title": "10.1 LangGraph Stateful Graph Orchestration",
        "duration": "21 Mins",
        "type": "video",
        "videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "description": "State machines, conditional edges, human-in-the-loop checkpoints, and cycle handling."
      },
      {
        "id": "les-g10-2",
        "title": "10.2 LLM Observability, Tracing & Cost Tracking",
        "duration": "16 Mins",
        "type": "video",
        "videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "description": "OpenTelemetry, Langfuse/Arize instrumentation, span tagging, and latency breakdown."
      },
      {
        "id": "les-g10-3",
        "title": "10.3 Guardrails & CI/CD Eval-Regression Checks",
        "duration": "17 Mins",
        "type": "video",
        "videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "description": "Input/output guardrails (NeMo / Guardrails AI), prompt injection filters, and CI/CD quality gates."
      },
      {
        "id": "les-g10-quiz",
        "title": "Week 10 Graded Quiz: LangGraph & LLMOps",
        "duration": "15 Mins",
        "type": "quiz",
        "questions": [
          {
            "id": "q-10-1",
            "question": "What is the key capability LangGraph provides over linear chain orchestrators?",
            "options": [
              "Cyclical execution loops with persistent state machines and branch-based conditional routing",
              "Compiling Python into Android apps",
              "Direct connection to blockchain networks",
              "Removing the need for LLMs"
            ],
            "correctOptionIndex": 0,
            "explanation": "LangGraph allows agents to iterate in loops, retry tool executions, and maintain conversational state across turns."
          },
          {
            "id": "q-10-2",
            "question": "Why are automated eval-regression gates mandatory in modern LLM CI/CD pipelines?",
            "options": [
              "To guarantee prompt updates or model changes do not cause silent degradation on established benchmark test sets",
              "To restart the Linux server every 5 minutes",
              "To encrypt all Python files",
              "To compress git commits"
            ],
            "correctOptionIndex": 0,
            "explanation": "Prompts are fragile; eval-regression testing catches accuracy drop-offs on golden evaluation datasets before shipping."
          }
        ]
      },
      {
        "id": "les-g10-lab",
        "title": "Week 10 Hands-on Lab: LangGraph RAG with CI/CD Eval Gates",
        "duration": "60 Mins",
        "type": "assignment",
        "instructions": "Rebuild your RAG pipeline in LangGraph with stateful memory, security guardrails, and a GitHub Actions CI/CD regression check benchmarking accuracy on push."
      }
    ]
  },
  {
    "id": "mod-11",
    "title": "Week 11 — Agentic AI & Cloud Deployment",
    "meta": "3 Videos · 2 Assessments · 4 Resources",
    "items": [
      {
        "id": "les-g11-1",
        "title": "11.1 Autonomous Reasoning Loops & Tool-Calling",
        "duration": "23 Mins",
        "type": "video",
        "videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "description": "ReAct loop (Reason, Act, Observe), JSON tool binding, and dynamic error recovery."
      },
      {
        "id": "les-g11-2",
        "title": "11.2 Stateful Agent Memory & Planning Agents",
        "duration": "19 Mins",
        "type": "video",
        "videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "description": "Short-term buffer memory, long-term vector memory, plan-and-solve multi-step decomposition."
      },
      {
        "id": "les-g11-3",
        "title": "11.3 Cloud Deployment & Autoscaling on AWS/Azure",
        "duration": "20 Mins",
        "type": "video",
        "videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "description": "Reverse proxies, SSL termination, horizontal pod autoscaling on queue depth, and streaming APIs."
      },
      {
        "id": "les-g11-quiz",
        "title": "Week 11 Graded Quiz: Agentic Systems & Cloud",
        "duration": "15 Mins",
        "type": "quiz",
        "questions": [
          {
            "id": "q-11-1",
            "question": "What execution loop defines an autonomous ReAct AI Agent?",
            "options": [
              "Reason -> Select Tool -> Execute Tool -> Observe Output -> Decide Next Action or Finish",
              "Single static regex text replacement",
              "Hardcoded if-else statements without LLMs",
              "Manual human approval on every token"
            ],
            "correctOptionIndex": 0,
            "explanation": "ReAct iteratively interleaves thought generation with tool actions and environment observations."
          },
          {
            "id": "q-11-2",
            "question": "Why should LLM API autoscaling rely on concurrent queue depth rather than raw CPU utilization?",
            "options": [
              "LLM inference is I/O- and token-bound; CPU stays moderate while request queues back up, causing user timeouts",
              "Kubernetes cannot track CPU",
              "CPUs do not exist in cloud instances",
              "Autoscaling is prohibited on AWS"
            ],
            "correctOptionIndex": 0,
            "explanation": "Tracking inflight concurrency ensures new replicas spin up before request backlogs degrade user latency."
          }
        ]
      },
      {
        "id": "les-g11-lab",
        "title": "Week 11 Hands-on Lab: Deployed Tool-Calling Agent",
        "duration": "60 Mins",
        "type": "assignment",
        "instructions": "Build an autonomous tool-calling agent with memory in LangGraph. Containerize and deploy the service to cloud infrastructure with autoscaling and streaming responses."
      }
    ]
  },
  {
    "id": "mod-12",
    "title": "Week 12 — Capstone Defense: Production Agentic RAG",
    "meta": "3 Videos · 2 Assessments · 4 Resources",
    "items": [
      {
        "id": "les-g12-1",
        "title": "12.1 Capstone Architecture & Problem Framing",
        "duration": "18 Mins",
        "type": "video",
        "videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "description": "Domain selection (Legal, Medical, Enterprise Bot), data ingestion contracts, and architectural defense."
      },
      {
        "id": "les-g12-2",
        "title": "12.2 Telemetry Logging & V1 to V2 Improvement Cycles",
        "duration": "20 Mins",
        "type": "video",
        "videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "description": "Documenting quantifiable benchmarks: accuracy, cost per query, latency, and guardrail safety gains."
      },
      {
        "id": "les-g12-3",
        "title": "12.3 Research Defense Methodology & Panel Presentation",
        "duration": "15 Mins",
        "type": "video",
        "videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "description": "Preparing technical reports, answering adversarial evaluation questions, and production handoff."
      },
      {
        "id": "les-g12-quiz",
        "title": "Week 12 Graded Quiz: Capstone Defense Methodology",
        "duration": "15 Mins",
        "type": "quiz",
        "questions": [
          {
            "id": "q-12-1",
            "question": "What is the primary requirement when presenting your Capstone V1 vs V2 improvements?",
            "options": [
              "Defensible, logged metrics demonstrating measurable gains in accuracy, latency, token costs, and safety",
              "Having the longest source code file",
              "Using only 1 line of Python",
              "Claiming 100% accuracy without any benchmark data"
            ],
            "correctOptionIndex": 0,
            "explanation": "Evaluation panels look for engineering rigor: concrete telemetry data proving that architectural changes improved real metrics."
          }
        ]
      },
      {
        "id": "les-g12-lab",
        "title": "Capstone Project: Production Agentic RAG System",
        "duration": "120 Mins",
        "type": "assignment",
        "instructions": "Deliverables: 1. Integrated Agent/RAG system with hybrid retrieval and dynamic tools. 2. Telemetry evaluation logging accuracy, cost, latency, safety. 3. Containerized cloud deployment. 4. Documented V1 to V2 improvement report. Defend before the panel."
      }
    ]
  }
];

export async function seedGenaiCurriculum(force = false) {
  const isForce = force || process.argv.includes("--force");
  const allowProdSeed = process.env.ENABLE_PRODUCTION_SEEDS === "true";
  if (process.env.NODE_ENV === "production" && !isForce && !allowProdSeed) {
    const errMsg = "[Seed:GenAI] ❌ Seeding course content is blocked in production unless ENABLE_PRODUCTION_SEEDS=true or --force is passed.";
    console.error(errMsg);
    throw new Error(errMsg);
  }

  console.log("[Seed:GenAI] Starting official 12-week Generative AI Engineering curriculum database sync...");
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Ensure Pathway 'cs-genai' exists
    await client.query(
      `INSERT INTO pathways (id, title, slug, short_description, description, price_paise, status, is_active, updated_at)
       VALUES ('cs-genai', 'Generative AI Engineering', 'cs-genai', 'Foundations to Agentic AI: Data Engineering, AI Backend Systems, Modern NLP, Transformer Architectures, RAG Systems, and Production Multi-Agent Swarms.', 'From fundamentals of machine learning and large language models to building, evaluating, and deploying production-grade Generative AI and Agentic systems.', 299900, 'PUBLISHED', TRUE, NOW())
       ON CONFLICT (id) DO UPDATE
       SET title = EXCLUDED.title,
           slug = EXCLUDED.slug,
           short_description = EXCLUDED.short_description,
           description = EXCLUDED.description,
           price_paise = EXCLUDED.price_paise,
           status = 'PUBLISHED',
           is_active = TRUE,
           updated_at = NOW()`
    );
    console.log("[Seed:GenAI] Upserted pathway 'cs-genai'.");

    // 2. Ensure Course 'cs-genai' exists
    await client.query(
      `INSERT INTO courses (id, title, slug, short_description, description, status, is_active, price_paise, mrp_paise, metadata, created_at, updated_at)
       VALUES ('cs-genai', 'Generative AI Engineering', 'cs-genai', 'Foundations to Agentic AI: Data Engineering, AI Backend Systems, Modern NLP, Transformer Architectures, RAG Systems, and Production Multi-Agent Swarms.', 'From fundamentals of machine learning and large language models to building, evaluating, and deploying production-grade Generative AI and Agentic systems.', 'PUBLISHED', TRUE, 299900, 999900, '{"duration": "12 Weeks (132 Contact Hours)", "level": "Foundations to Agentic AI", "group": "group-1"}'::jsonb, NOW(), NOW())
       ON CONFLICT (id) DO UPDATE
       SET title = EXCLUDED.title,
           slug = EXCLUDED.slug,
           status = 'PUBLISHED',
           is_active = TRUE,
           updated_at = NOW()`
    );
    console.log("[Seed:GenAI] Upserted course 'cs-genai'.");

    // 3. Link pathway_courses
    await client.query(
      `DELETE FROM pathway_courses WHERE pathway_id = 'cs-genai'`
    );
    await client.query(
      `INSERT INTO pathway_courses (pathway_id, course_id, position, created_at)
       VALUES ('cs-genai', 'cs-genai', 1, NOW())
       ON CONFLICT DO NOTHING`
    );

    // 4. Clear course_modules for cs-genai before reseeding
    await client.query(
      `DELETE FROM course_modules WHERE course_id = 'cs-genai'`
    );

    // 5. Seed each module and lessons deterministically
    for (let w = 0; w < GENAI_MODULES.length; w++) {
      const weekNum = w + 1;
      const mod = GENAI_MODULES[w];
      const moduleId = `mod_genai_w${weekNum}`;
      const modSlug = `cs-genai-week-${weekNum}`;

      // Free slug if an old module holds it
      await client.query(
        `UPDATE modules SET slug = slug || '-old-' || id WHERE slug = $1 AND id != $2`,
        [modSlug, moduleId]
      );

      await client.query(
        `INSERT INTO modules (id, title, slug, description, status, is_active, created_at, updated_at)
         VALUES ($1, $2, $3, $4, 'PUBLISHED', TRUE, NOW(), NOW())
         ON CONFLICT (id) DO UPDATE
         SET title = EXCLUDED.title, slug = EXCLUDED.slug, description = EXCLUDED.description, status = 'PUBLISHED', is_active = TRUE, updated_at = NOW()`,
        [moduleId, mod.title, modSlug, mod.meta || "Curriculum Module"]
      );

      // Attach to course
      await client.query(
        `INSERT INTO course_modules (course_id, module_id, position, created_at)
         VALUES ('cs-genai', $1, $2, NOW())
         ON CONFLICT (course_id, module_id) DO UPDATE SET position = EXCLUDED.position`,
        [moduleId, weekNum]
      );

      // Seed items (lessons, quizzes, labs)
      for (let i = 0; i < (mod.items || []).length; i++) {
        const item = mod.items[i];
        const pos = i + 1;
        const lessonId = item.id;
        const lessonSlug = `genai-w${weekNum}-${i + 1}`;

        let durationMins = 30;
        if (item.duration) {
          const match = item.duration.match(/\d+/);
          if (match) durationMins = parseInt(match[0], 10);
        }

        const lessonContent = JSON.stringify({
          category: item.type === "video" ? "LECTURE" : "PRACTICE",
          type: item.type,
          contentType: item.type.toUpperCase(),
          curriculumMode: item.type === "video" ? "LECTURE" : "PRACTICE",
          duration: item.duration,
          videoUrl: item.videoUrl,
          description: item.description,
          instructions: item.instructions,
          questions: item.questions,
          quiz: item.questions ? { questions: item.questions, passingScorePercent: 70 } : undefined,
          assignment: item.instructions ? { instructions: item.instructions, allowedTypes: ["URL", "GITHUB", "ZIP"] } : undefined
        });

        await client.query(
          `UPDATE lessons SET slug = slug || '-old-' || id WHERE slug = $1 AND id != $2`,
          [lessonSlug, lessonId]
        );

        await client.query(
          `INSERT INTO lessons (id, title, slug, description, content, video_url, duration_minutes, status, is_active, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, 'PUBLISHED', TRUE, NOW(), NOW())
           ON CONFLICT (id) DO UPDATE
           SET title = EXCLUDED.title, slug = EXCLUDED.slug, description = EXCLUDED.description, content = EXCLUDED.content, video_url = EXCLUDED.video_url, duration_minutes = EXCLUDED.duration_minutes, status = 'PUBLISHED', is_active = TRUE, updated_at = NOW()`,
          [lessonId, item.title, lessonSlug, item.description || item.instructions || item.title, lessonContent, item.videoUrl || null, durationMins]
        );

        // Link in module_lessons
        await client.query(
          `INSERT INTO module_lessons (module_id, lesson_id, position, created_at)
           VALUES ($1, $2, $3, NOW())
           ON CONFLICT (module_id, lesson_id) DO UPDATE SET position = EXCLUDED.position`,
          [moduleId, lessonId, pos]
        );
      }
    }

    await client.query("COMMIT");
    console.log(`[Seed:GenAI] ✅ Successfully seeded all 12 weeks with ${GENAI_MODULES.reduce((acc, m) => acc + (m.items?.length || 0), 0)} items into PostgreSQL!`);

    return {
      courseId: "cs-genai",
      weeksSeeded: GENAI_MODULES.length,
      totalItems: GENAI_MODULES.reduce((acc, m) => acc + (m.items?.length || 0), 0)
    };
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("[Seed:GenAI] ❌ Error seeding GenAI curriculum:", err);
    throw err;
  } finally {
    client.release();
  }
}

if (require.main === module || process.argv[1]?.endsWith("seed-genai-curriculum.ts") || process.argv[1]?.endsWith("seed-genai-curriculum.js")) {
  seedGenaiCurriculum()
    .then(async () => {
      console.log("[Seed:GenAI] Finished successfully.");
      await pool.end();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error("[Seed:GenAI] Execution failed:", err);
      await pool.end();
      process.exit(1);
    });
}
