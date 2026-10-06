export interface QuizQuestionData {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

export const GENAI_QUIZZES: Record<string, QuizQuestionData[]> = {
  "01": [
    {
      id: "q-g1-1",
      question: "Which Linux command displays real-time memory and CPU resource utilization per process?",
      options: ["top / htop", "grep -r", "chmod +x", "netstat -tuln"],
      correctOptionIndex: 0,
      explanation: "top and htop provide interactive real-time monitoring of CPU, RAM, and running processes on Linux systems.",
    },
    {
      id: "q-g1-2",
      question: "In exploratory data analysis (EDA), what is the recommended practice when encountering high cardinality categorical features?",
      options: [
        "Always one-hot encode every unique value",
        "Target encoding, frequency encoding, or grouping rare categories into an 'Other' bucket",
        "Delete the entire dataset row immediately",
        "Convert to boolean values arbitrarily",
      ],
      correctOptionIndex: 1,
      explanation: "One-hot encoding high-cardinality features causes sparse matrix explosion. Target encoding, embedding layers, or binning rare levels is standard practice.",
    },
    {
      id: "q-g1-3",
      question: "Which Git command creates and checks out a new branch in a single command?",
      options: ["git checkout -b <branch_name>", "git branch -d <branch_name>", "git merge --abort", "git status -v"],
      correctOptionIndex: 0,
      explanation: "git checkout -b (or git switch -c in newer Git versions) creates the branch and switches working directory to it.",
    },
  ],
  "02": [
    {
      id: "q-g2-1",
      question: "Why is FastAPI preferred over synchronous frameworks like Flask for production LLM serving?",
      options: [
        "Native asynchronous ASGI support (async/await) allows high-concurrency non-blocking streaming",
        "FastAPI is strictly compiled to C++ binaries",
        "Flask cannot handle JSON requests",
        "FastAPI eliminates the need for any web server like Uvicorn",
      ],
      correctOptionIndex: 0,
      explanation: "FastAPI is built on Starlette and Pydantic, supporting native async/await for I/O-bound operations like LLM API calls and streaming responses.",
    },
    {
      id: "q-g2-2",
      question: "Which HTTP status code is automatically returned by FastAPI when request payload fails Pydantic schema validation?",
      options: ["200 OK", "404 Not Found", "422 Unprocessable Entity", "500 Internal Server Error"],
      correctOptionIndex: 2,
      explanation: "FastAPI uses 422 Unprocessable Entity to signal that the request syntax is valid JSON, but fails schema validation rules.",
    },
  ],
  "03": [
    {
      id: "q-g3-1",
      question: "What is the primary benefit of Redis in a production AI inference backend?",
      options: [
        "Sub-millisecond semantic or exact-match response caching to reduce LLM costs and latency",
        "Replacing relational database storage for user accounts",
        "Training deep neural networks on disk",
        "Executing GPU matrix multiplications",
      ],
      correctOptionIndex: 0,
      explanation: "Redis is an in-memory key-value cache used for response caching, rate limiting, and session state in AI serving architectures.",
    },
    {
      id: "q-g3-2",
      question: "In Docker containerization for AI services, what is the key advantage of multi-stage builds?",
      options: [
        "Significantly smaller final image size by discarding build tools and compilers",
        "Doubles the GPU VRAM automatically",
        "Allows running Docker without the Docker daemon",
        "Bypasses Linux kernel security checks",
      ],
      correctOptionIndex: 0,
      explanation: "Multi-stage builds leave behind heavyweight compilers (build-essential, pip caches) in intermediate stages, keeping the final production image lean and secure.",
    },
  ],
  "04": [
    {
      id: "q-g4-1",
      question: "What does the Inverse Document Frequency (IDF) term penalize in TF-IDF representation?",
      options: [
        "Rare words that only appear in one document",
        "Common words that appear across almost all documents in the corpus",
        "Words that are capitalized",
        "Punctuation marks and whitespace",
      ],
      correctOptionIndex: 1,
      explanation: "IDF decreases the weight of words that occur frequently across the entire corpus (e.g. 'the', 'is', 'data') because they carry less discriminative information.",
    },
    {
      id: "q-g4-2",
      question: "How does lemmatization differ fundamentally from stemming?",
      options: [
        "Lemmatization uses morphological dictionary analysis to return valid root words (lemma); stemming uses heuristic rule-based suffix truncation",
        "Stemming produces valid dictionary words while lemmatization truncates arbitrarily",
        "Lemmatization is only applicable to numerical data",
        "There is no difference; they are exact synonyms",
      ],
      correctOptionIndex: 0,
      explanation: "Stemming chops off suffixes heuristically (e.g., 'studies' -> 'studi'), whereas lemmatization considers vocabulary and part of speech (e.g., 'studies' -> 'study').",
    },
  ],
  "05": [
    {
      id: "q-g5-1",
      question: "In Word2Vec, what is the architectural difference between Continuous Bag-of-Words (CBOW) and Skip-gram?",
      options: [
        "CBOW predicts target word from context words; Skip-gram predicts context words given target word",
        "CBOW only works with images; Skip-gram works with text",
        "Skip-gram is an unsupervised clustering algorithm, not neural",
        "CBOW requires pre-trained Transformers",
      ],
      correctOptionIndex: 0,
      explanation: "CBOW averages surrounding context vectors to predict the center target word, while Skip-gram uses the center word to predict surrounding context tokens.",
    },
    {
      id: "q-g5-2",
      question: "Which internal gate of an LSTM cell is responsible for deciding what percentage of the previous cell state should be discarded?",
      options: ["Input Gate", "Forget Gate", "Output Gate", "Modulation Gate"],
      correctOptionIndex: 1,
      explanation: "The Forget Gate applies a sigmoid activation to previous hidden state and current input to produce values between 0 and 1, gating past cell memory.",
    },
  ],
  "06": [
    {
      id: "q-g6-1",
      question: "What core limitation of classic Seq2Seq architectures motivated the introduction of the Attention mechanism?",
      options: [
        "The fixed-length context vector bottleneck, which struggled to retain long-range sentence details",
        "Inability to run on GPU hardware",
        "Attention made training 100x slower",
        "Inability to handle vocabulary sizes greater than 100 words",
      ],
      correctOptionIndex: 0,
      explanation: "Compressing an entire arbitrary-length input sequence into a single static hidden vector caused severe information loss on long sequences.",
    },
    {
      id: "q-g6-2",
      question: "What does the Attention mechanism calculate between decoder state and encoder states?",
      options: [
        "Alignment scores that produce a dynamic weighted sum (context vector) of all encoder hidden states",
        "A random permutation of word embeddings",
        "A binary 0 or 1 mask for every sentence",
        "A static average of all vocabulary tokens",
      ],
      correctOptionIndex: 0,
      explanation: "Attention dynamic alignment weights focus the decoder on specific parts of the source sentence at each generation step.",
    },
  ],
  "07": [
    {
      id: "q-g7-1",
      question: "Why do Transformers require Positional Encodings added to input embeddings?",
      options: [
        "Self-attention is permutation-invariant and has no inherent mechanism to capture word order",
        "To increase embedding dimensionality",
        "To compress the vocabulary size",
        "To perform backpropagation without gradients",
      ],
      correctOptionIndex: 0,
      explanation: "Because self-attention operates on all pairs of tokens simultaneously without recurrence or convolution, positional encodings inject sequence order.",
    },
    {
      id: "q-g7-2",
      question: "What is the computational complexity of the standard full self-attention matrix calculation with sequence length N?",
      options: ["O(N^2)", "O(N)", "O(log N)", "O(1)"],
      correctOptionIndex: 0,
      explanation: "Standard self-attention computes an N x N dot product matrix between queries and keys, resulting in quadratic O(N^2) complexity with respect to sequence length.",
    },
  ],
  "08": [
    {
      id: "q-g8-1",
      question: "What is the primary advantage of Hybrid Search combining BM25 with Dense Vector embeddings?",
      options: [
        "Combines exact keyword/acronym precision (sparse) with semantic conceptual matching (dense)",
        "Eliminates the need for any embedding models",
        "Requires 90% less disk storage",
        "Works without any tokenization",
      ],
      correctOptionIndex: 0,
      explanation: "Dense search excels at semantic concepts, while BM25 catches specific part numbers, legal codes, and exact names that embeddings might smooth over.",
    },
    {
      id: "q-g8-2",
      question: "In vector databases like FAISS and Chroma, what is Product Quantization (PQ) used for?",
      options: [
        "Lossy vector compression that dramatically reduces memory footprint while maintaining fast approximate nearest neighbor search",
        "Encrypting vectors with SSL certificates",
        "Generating synthetic text queries",
        "Normalizing text strings to lowercase",
      ],
      correctOptionIndex: 0,
      explanation: "PQ breaks high-dimensional vectors into smaller sub-vectors and quantizes them into centroids, allowing billions of vectors to fit into RAM.",
    },
  ],
  "09": [
    {
      id: "q-g9-1",
      question: "In RAG pipeline evaluation (RAGAS framework), what does 'Faithfulness' measure?",
      options: [
        "Whether all assertions made in the generated answer are grounded in the retrieved context",
        "Whether the answer rhymes with the question",
        "The speed of the network connection",
        "The number of tokens in the prompt",
      ],
      correctOptionIndex: 0,
      explanation: "Faithfulness evaluates whether the LLM did not hallucinate facts outside the provided retrieved context chunks.",
    },
    {
      id: "q-g9-2",
      question: "What is the risk of selecting a chunk size that is too small (e.g. 50 tokens) during document ingestion?",
      options: [
        "Loss of surrounding semantic context necessary for the LLM to synthesize a coherent answer",
        "Vector search becoming impossible",
        "Exceeding maximum context limits of the LLM",
        "Corrupting the database index",
      ],
      correctOptionIndex: 0,
      explanation: "Extremely small chunks fragment coherent sentences and paragraphs, stripping away the broader context needed to accurately answer questions.",
    },
  ],
  "10": [
    {
      id: "q-g10-1",
      question: "What distinguishes LangGraph from standard sequential LangChain execution chains?",
      options: [
        "Support for cyclical multi-step graph workflows, branch-based agent loops, and persistent state machines",
        "LangGraph only runs on Android devices",
        "LangGraph eliminates Python and uses raw SQL only",
        "LangGraph cannot connect to LLMs",
      ],
      correctOptionIndex: 0,
      explanation: "LangGraph enables stateful cycles where an agent can reason, call tools, inspect results, and loop back until a completion criteria is met.",
    },
    {
      id: "q-g10-2",
      question: "In LLMOps, what is the role of an automated eval-regression check in a CI/CD pipeline?",
      options: [
        "Ensures new prompt versions or model updates do not degrade benchmark accuracy on standard golden test sets",
        "Reinstalls Linux operating systems",
        "Deletes inactive user accounts",
        "Compresses Docker layers",
      ],
      correctOptionIndex: 0,
      explanation: "Eval-regression checks run automated evaluation benchmarks before deploying code or prompt changes, catching quality regressions before users see them.",
    },
  ],
  "11": [
    {
      id: "q-g11-1",
      question: "What is the core execution pattern of an autonomous AI Agent?",
      options: [
        "Think / Plan -> Tool Call -> Observe Environment -> Re-evaluate -> Final Action",
        "Single-turn prompt without any external tools",
        "Static regex pattern matching",
        "Manual SQL database querying by humans",
      ],
      correctOptionIndex: 0,
      explanation: "Agents operate in an iterative loop: reasoning about the current state, deciding which tool to call, observing the output, and planning the next step.",
    },
    {
      id: "q-g11-2",
      question: "When deploying an LLM API to Kubernetes with horizontal autoscaling, why is request queue concurrency preferred over CPU utilization as an autoscaling metric?",
      options: [
        "LLM inference is I/O and GPU bound; CPU usage remains flat while inflight requests pile up causing timeouts",
        "Kubernetes cannot measure CPU usage on Linux",
        "Queue metrics are not supported on cloud",
        "CPU utilization is always 100% in Docker",
      ],
      correctOptionIndex: 0,
      explanation: "LLM serving latency spikes under concurrent requests even when CPU appears low. Tracking active request depth triggers scaling before latency degrades.",
    },
  ],
  "12": [
    {
      id: "q-g12-1",
      question: "In the Capstone defense, what is the primary technical objective when defending Version 1 vs Version 2 of your Agentic RAG system?",
      options: [
        "Demonstrating quantifiable metric improvements (accuracy, cost per query, latency, guardrail safety) with versioned telemetry logs",
        "Showing the highest number of lines of code",
        "Proving that no external libraries were imported",
        "Showing that the system runs without internet connection",
      ],
      correctOptionIndex: 0,
      explanation: "Engineering defense panels require concrete benchmark comparisons demonstrating measurable performance, cost, and safety gains.",
    },
  ],
};

export const INCUBATOR_QUIZZES: Record<string, QuizQuestionData[]> = {
  "01": [
    {
      id: "q-i1-1",
      question: "In design thinking empathy mapping, what is the most critical source of authentic customer pain points?",
      options: [
        "Observing and interviewing real target users experiencing the problem daily",
        "Guessing based on personal assumptions without external validation",
        "Relying entirely on generic AI search summaries",
        "Copying features directly from competitor websites",
      ],
      correctOptionIndex: 0,
      explanation: "Direct empathy and immersion with actual users uncovers non-obvious workarounds and authentic emotional friction points.",
    },
  ],
  "02": [
    {
      id: "q-i2-1",
      question: "When conducting customer discovery interviews, why must founders avoid leading questions (e.g., 'Would you pay for an app that does X?')?",
      options: [
        "Leading questions elicit polite false-positive affirmations rather than honest past behavior evidence",
        "Interviewees will immediately terminate the call",
        "It is prohibited by telecommunication laws",
        "Customers always refuse to answer questions about their past",
      ],
      correctOptionIndex: 0,
      explanation: "As taught in 'The Mom Test', asking hypothetical questions produces false validation. Focus on specific past experiences and real money/time spent.",
    },
  ],
  "03": [
    {
      id: "q-i3-1",
      question: "What does SOM represent in the TAM / SAM / SOM market sizing model?",
      options: [
        "Serviceable Obtainable Market: The realistic share of the market your startup can capture in 1-3 years",
        "Total Addressable Market globally",
        "Software Optimization Metric",
        "Standard Operational Margin",
      ],
      correctOptionIndex: 0,
      explanation: "SOM is your near-term realistic target given your current distribution channels, sales resources, and product capabilities.",
    },
  ],
  "04": [
    {
      id: "q-i4-1",
      question: "What constitutes a fully validated Problem Statement before entering build stage?",
      options: [
        "Documented target persona, quantifiable cost/time wasted, verified current failed workarounds, and clear willingness to pay",
        "A vague idea that sounded exciting to friends",
        "A high-level PowerPoint slide without customer interview quotes",
        "A finished 100-page business plan",
      ],
      correctOptionIndex: 0,
      explanation: "Validation requires evidence of real urgency, recurring friction, and explicit budget or time currently allocated to solving it.",
    },
  ],
  "05": [
    {
      id: "q-i5-1",
      question: "In the 10x AI Value Framework, what differentiates transformative AI value from basic automation?",
      options: [
        "Enabling previously impossible real-time capabilities or 10x reduction in friction/cost, rather than mere cosmetic form-filling",
        "Adding a chatbot widget to a website footer",
        "Increasing the subscription price by 10x",
        "Using 10 different API keys simultaneously",
      ],
      correctOptionIndex: 0,
      explanation: "10x value transforms user workflows by orders of magnitude (e.g. automating a 40-hour legal review in 3 minutes with verified citations).",
    },
  ],
  "06": [
    {
      id: "q-i6-1",
      question: "What is the single goal of a clickable functional prototype in Weekend 6?",
      options: [
        "Test user flow and core value proposition with zero unnecessary infrastructure overhead",
        "Building a multi-region distributed Kubernetes cluster",
        "Filing patent applications",
        "Optimizing sub-millisecond database queries",
      ],
      correctOptionIndex: 0,
      explanation: "Early prototyping validates that users can understand and execute the core value loop before committing weeks to backend engineering.",
    },
  ],
  "07": [
    {
      id: "q-i7-1",
      question: "During an MVP build sprint, how should founders prioritize feature requests from test users?",
      options: [
        "Focus strictly on the single core feature delivering the primary value proposition; defer ancillary requests",
        "Build every requested feature immediately",
        "Scrap the entire project if one user asks for a feature",
        "Add features in alphabetical order",
      ],
      correctOptionIndex: 0,
      explanation: "Early MVPs succeed through extreme focus on the wedge feature that solves the validated hair-on-fire problem.",
    },
  ],
  "08": [
    {
      id: "q-i8-1",
      question: "When running early user testing sessions on an MVP, what is the best indicator of product-market pull?",
      options: [
        "Users asking to keep using the prototype immediately, sharing it with colleagues, or offering payment upfront",
        "Polite compliments without repeated usage",
        "High website impressions from social media",
        "Aesthetically pleasing color palette feedback",
      ],
      correctOptionIndex: 0,
      explanation: "Organic retention, unsolicited recommendations, and eagerness to integrate the tool into daily work signal authentic pull.",
    },
  ],
  "09": [
    {
      id: "q-i9-1",
      question: "In the Business Model Canvas for an AI product, why is API token cost factored into Unit Economics (COGS)?",
      options: [
        "LLM inference has non-trivial marginal cost per query; unit economics must ensure Lifetime Value (LTV) exceeds Customer Acquisition Cost (CAC) plus inference COGS",
        "Token costs are legally classified as marketing expenses",
        "AI products have zero marginal cost",
        "Investors do not examine gross margins in AI companies",
      ],
      correctOptionIndex: 0,
      explanation: "Unlike classical SaaS with near-zero marginal compute, AI products incur token and GPU costs per transaction that directly impact gross margins.",
    },
  ],
  "10": [
    {
      id: "q-i10-1",
      question: "What is a 'wedge' strategy in early-stage Go-To-Market (GTM) for an AI startup?",
      options: [
        "Dominating a specific, underserved niche with an indispensable workflow before expanding to adjacent markets",
        "Buying expensive billboard advertisements",
        "Selling to every enterprise industry simultaneously on day one",
        "Lowering prices to zero indefinitely",
      ],
      correctOptionIndex: 0,
      explanation: "A narrow wedge builds high density, word-of-mouth advocacy, and high conversion within a tightly defined ICP (Ideal Customer Profile).",
    },
  ],
  "11": [
    {
      id: "q-i11-1",
      question: "In a standard 10-slide investor pitch deck, what should the 'Traction' slide clearly demonstrate?",
      options: [
        "Measurable forward momentum: user growth, pilot agreements, waitlist velocity, or validated retention metrics",
        "A list of software libraries used in the build",
        "Biographies of extended family members",
        "Stock photos of skyscrapers",
      ],
      correctOptionIndex: 0,
      explanation: "Traction proves that the team can execute and that the market is actively responding to the product.",
    },
  ],
  "12": [
    {
      id: "q-i12-1",
      question: "In the Capstone Final Pitch defense before an investor panel, what creates the strongest competitive defensibility (moat)?",
      options: [
        "Proprietary customer workflow integration, unique domain feedback loops, and high switching costs",
        "Claiming no competitors exist anywhere in the world",
        "Relying solely on standard off-the-shelf public LLM APIs without fine-tuning or proprietary context",
        "A large slide deck with over 100 slides",
      ],
      correctOptionIndex: 0,
      explanation: "Defensibility in AI comes from deep workflow integration, network effects, proprietary domain data, and compounding customer feedback loops.",
    },
  ],
};

export function getQuestionsForModule(courseId: string, moduleNum: string): QuizQuestionData[] {
  const normNum = moduleNum.padStart(2, "0");
  if (courseId === "cs-common" || courseId === "mgmt-common") {
    return INCUBATOR_QUIZZES[normNum] || INCUBATOR_QUIZZES["01"];
  }
  return GENAI_QUIZZES[normNum] || GENAI_QUIZZES["01"];
}
