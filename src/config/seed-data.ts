import { hashSync } from "bcryptjs";

export interface SeedUser {
  id: string;
  key: string;
  name: string;
  email: string;
  phone: string | null;
  password_hash: string;
  role: "student" | "admin";
  auth_provider: "local" | "google" | "supabase" | "phone";
  is_verified: boolean;
}

export interface SeedCategory {
  id: string;
  key: string;
  name: string;
}

export interface SeedCourse {
  id: string;
  key: string;
  title: string;
  slug: string;
  categoryKey: string;
  price: string;
  rating_avg: string;
  total_enrollments: number;
}

export interface SeedModule {
  id: string;
  key: string;
  title: string;
  courseKey: string;
  order_index: number;
}

export interface SeedModuleItem {
  id: string;
  key: string;
  moduleKey: string;
  title: string;
  type: "video" | "pdf" | "article" | "quiz" | "assignment";
  content_url: string | null;
  content_body: string | null;
  order_index: number;
}

export interface SeedAssignment {
  id: string;
  key: string;
  lessonItemKey: string;
  title: string;
  max_score: number;
  allowed_attempts: number;
}

export interface SeedAssignmentSubmission {
  id: string;
  assignmentKey: string;
  userKey: string;
  file_url: string;
  status: "pending" | "graded";
}

export interface SeedTest {
  id: string;
  key: string;
  moduleItemKey: string;
  title: string;
  duration_min: number;
  total_marks: number;
  passing_marks: number;
  max_attempts: number;
}

export interface SeedTestAttempt {
  id: string;
  testKey: string;
  userKey: string;
  status: "in_progress" | "submitted" | "evaluated";
  score: string | null;
  answers: unknown;
}

export interface SeedCart {
  id: string;
  userKey: string;
}

export interface SeedCoupon {
  id: string;
  key: string;
  code: string;
  discount_type: "flat" | "percent";
  value: string;
  max_uses: number;
  used_count: number;
  valid_from: string;
  valid_to: string;
}

export interface SeedEnrollment {
  id: string;
  userKey: string;
  courseKey: string;
  expiry_at: string | null;
  progress_percent: number;
  status: "active" | "completed" | "expired";
}

export interface SeedOrder {
  id: string;
  key: string;
  userKey: string;
  razorpay_order_id: string;
  amount: string;
  currency: string;
  status: "created" | "paid" | "failed" | "refunded";
  couponKey: string | null;
}

export interface SeedOrderItem {
  id: string;
  orderKey: string;
  courseKey: string;
  price_at_purchase: string;
}

export interface SeedPayment {
  id: string;
  key: string;
  orderKey: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  method: string;
  status: "captured" | "failed" | "refunded";
}

export interface SeedCertificate {
  id: string;
  userKey: string;
  courseKey: string;
  certificate_url: string;
}

export interface SeedReview {
  id: string;
  userKey: string;
  courseKey: string;
  rating: number;
  comment: string;
}

// ─── Users ────────────────────────────────────────────────────────────────────

export const seedUsers: SeedUser[] = [
  {
    id: "usr_1",
    key: "admin",
    name: "Admin User",
    email: "admin@unisole.test",
    phone: "0000000000",
    password_hash: hashSync("Admin@Pop#2000", 10),
    role: "admin",
    auth_provider: "local",
    is_verified: true,
  },
  {
    id: "usr_2",
    key: "john",
    name: "John Doe",
    email: "john@unisole.test",
    phone: "1111111111",
    password_hash: hashSync("password123", 10),
    role: "student",
    auth_provider: "local",
    is_verified: true,
  },
  {
    id: "usr_3",
    key: "jane",
    name: "Jane Smith",
    email: "jane@unisole.test",
    phone: "2222222222",
    password_hash: hashSync("password123", 10),
    role: "student",
    auth_provider: "local",
    is_verified: true,
  },
  {
    id: "usr_4",
    key: "alex",
    name: "Alex Student",
    email: "alex@unisole.test",
    phone: "3333333333",
    password_hash: hashSync("password123", 10),
    role: "student",
    auth_provider: "local",
    is_verified: true,
  },
  {
    id: "usr_5",
    key: "priya",
    name: "Priya Patel",
    email: "priya@unisole.test",
    phone: "4444444444",
    password_hash: hashSync("password123", 10),
    role: "student",
    auth_provider: "local",
    is_verified: true,
  },
  {
    id: "usr_6",
    key: "sam",
    name: "Sam Wilson",
    email: "sam@unisole.test",
    phone: "5555555555",
    password_hash: hashSync("password123", 10),
    role: "student",
    auth_provider: "local",
    is_verified: true,
  },
];

// ─── Categories ───────────────────────────────────────────────────────────────

export const seedCategories: SeedCategory[] = [
  { id: "cat_1", key: "web", name: "Web Development" },
  { id: "cat_2", key: "design", name: "Design" },
  { id: "cat_3", key: "data-science", name: "Data Science" },
  { id: "cat_4", key: "mobile-dev", name: "Mobile Development" },
  { id: "cat_5", key: "devops", name: "DevOps" },
];

// ─── Courses ──────────────────────────────────────────────────────────────────

export const seedCourses: SeedCourse[] = [
  {
    id: "crs_1",
    key: "typescript-bootcamp",
    title: "Complete TypeScript Bootcamp",
    slug: "complete-typescript-bootcamp",
    categoryKey: "web",
    price: "49.99",
    rating_avg: "4.5",
    total_enrollments: 120,
  },
  {
    id: "crs_2",
    key: "react-hooks",
    title: "Modern React with Hooks",
    slug: "modern-react-hooks",
    categoryKey: "web",
    price: "39.99",
    rating_avg: "4.5",
    total_enrollments: 120,
  },
  {
    id: "crs_3",
    key: "ui-design",
    title: "UI Design Fundamentals",
    slug: "ui-design-fundamentals",
    categoryKey: "design",
    price: "29.99",
    rating_avg: "4.5",
    total_enrollments: 120,
  },
  {
    id: "crs_4",
    key: "python-data-science",
    title: "Python for Data Science",
    slug: "python-data-science",
    categoryKey: "data-science",
    price: "59.99",
    rating_avg: "4.7",
    total_enrollments: 250,
  },
  {
    id: "crs_5",
    key: "flutter-mobile-apps",
    title: "Flutter Mobile Apps",
    slug: "flutter-mobile-apps",
    categoryKey: "mobile-dev",
    price: "44.99",
    rating_avg: "4.6",
    total_enrollments: 180,
  },
  {
    id: "crs_6",
    key: "docker-kubernetes",
    title: "Docker & Kubernetes",
    slug: "docker-kubernetes",
    categoryKey: "devops",
    price: "54.99",
    rating_avg: "4.8",
    total_enrollments: 320,
  },
  {
    id: "crs_7",
    key: "javascript-masterclass",
    title: "JavaScript Masterclass",
    slug: "javascript-masterclass",
    categoryKey: "web",
    price: "34.99",
    rating_avg: "4.4",
    total_enrollments: 400,
  },
  {
    id: "crs_8",
    key: "nodejs-backend",
    title: "Node.js Backend Development",
    slug: "nodejs-backend",
    categoryKey: "web",
    price: "42.99",
    rating_avg: "4.5",
    total_enrollments: 280,
  },
  {
    id: "crs_9",
    key: "aws-cloud-practitioner",
    title: "AWS Cloud Practitioner",
    slug: "aws-cloud-practitioner",
    categoryKey: "devops",
    price: "69.99",
    rating_avg: "4.9",
    total_enrollments: 500,
  },
  {
    id: "crs_10",
    key: "java-spring-boot",
    title: "Java & Spring Boot Full-Stack Masterclass",
    slug: "java-spring-boot-masterclass",
    categoryKey: "web",
    price: "59.99",
    rating_avg: "4.8",
    total_enrollments: 340,
  },
  {
    id: "crs_11",
    key: "go-microservices",
    title: "Go & Microservices Distributed Systems",
    slug: "go-microservices-distributed-systems",
    categoryKey: "devops",
    price: "54.99",
    rating_avg: "4.9",
    total_enrollments: 275,
  },
];


// ─── Modules ──────────────────────────────────────────────────────────────────

export const seedModules: SeedModule[] = [
  // ── TypeScript Bootcamp (mod_1 – mod_10) ────────────────────────────────
  {
    id: "mod_1",
    key: "ts-foundations",
    title: "TypeScript Foundations",
    courseKey: "typescript-bootcamp",
    order_index: 0,
  },
  {
    id: "mod_2",
    key: "functions-objects",
    title: "Functions and Objects",
    courseKey: "typescript-bootcamp",
    order_index: 1,
  },
  {
    id: "mod_3",
    key: "union-narrowing-guards",
    title: "Union Types, Narrowing, and Guards",
    courseKey: "typescript-bootcamp",
    order_index: 2,
  },
  {
    id: "mod_4",
    key: "classes-oop",
    title: "Classes and OOP in TypeScript",
    courseKey: "typescript-bootcamp",
    order_index: 3,
  },
  {
    id: "mod_5",
    key: "generics",
    title: "Generics",
    courseKey: "typescript-bootcamp",
    order_index: 4,
  },
  {
    id: "mod_6",
    key: "advanced-types",
    title: "Advanced Types",
    courseKey: "typescript-bootcamp",
    order_index: 5,
  },
  {
    id: "mod_7",
    key: "modules-namespaces-config",
    title: "Modules, Namespaces, and Project Configuration",
    courseKey: "typescript-bootcamp",
    order_index: 6,
  },
  {
    id: "mod_8",
    key: "async-typescript",
    title: "TypeScript with Asynchronous Code",
    courseKey: "typescript-bootcamp",
    order_index: 7,
  },
  {
    id: "mod_9",
    key: "real-world-frameworks",
    title: "TypeScript in Real-World Frameworks",
    courseKey: "typescript-bootcamp",
    order_index: 8,
  },
  {
    id: "mod_10",
    key: "capstone-project",
    title: "Capstone Project",
    courseKey: "typescript-bootcamp",
    order_index: 9,
  },
  // ── Other courses (mod_11 – mod_22) ─────────────────────────────────────
  {
    id: "mod_11",
    key: "react-essentials",
    title: "React Essentials",
    courseKey: "react-hooks",
    order_index: 0,
  },
  {
    id: "mod_12",
    key: "color-theory",
    title: "Color Theory",
    courseKey: "ui-design",
    order_index: 0,
  },
  {
    id: "mod_13",
    key: "python-fundamentals",
    title: "Python Fundamentals",
    courseKey: "python-data-science",
    order_index: 0,
  },
  {
    id: "mod_14",
    key: "data-analysis",
    title: "Data Analysis with Pandas",
    courseKey: "python-data-science",
    order_index: 1,
  },
  {
    id: "mod_15",
    key: "flutter-basics",
    title: "Flutter Basics",
    courseKey: "flutter-mobile-apps",
    order_index: 0,
  },
  {
    id: "mod_16",
    key: "state-management",
    title: "State Management",
    courseKey: "flutter-mobile-apps",
    order_index: 1,
  },
  {
    id: "mod_17",
    key: "docker-intro",
    title: "Introduction to Docker",
    courseKey: "docker-kubernetes",
    order_index: 0,
  },
  {
    id: "mod_18",
    key: "kubernetes-deep-dive",
    title: "Kubernetes Deep Dive",
    courseKey: "docker-kubernetes",
    order_index: 1,
  },
  {
    id: "mod_19",
    key: "js-core",
    title: "JavaScript Core Concepts",
    courseKey: "javascript-masterclass",
    order_index: 0,
  },
  {
    id: "mod_20",
    key: "js-async",
    title: "Asynchronous JavaScript",
    courseKey: "javascript-masterclass",
    order_index: 1,
  },
  {
    id: "mod_21",
    key: "node-fundamentals",
    title: "Node.js Fundamentals",
    courseKey: "nodejs-backend",
    order_index: 0,
  },
  {
    id: "mod_22",
    key: "aws-overview",
    title: "AWS Services Overview",
    courseKey: "aws-cloud-practitioner",
    order_index: 0,
  },
  {
    id: "mod_23",
    key: "java-spring-core",
    title: "Java Core & Spring Boot 3 Architecture",
    courseKey: "java-spring-boot",
    order_index: 0,
  },
  {
    id: "mod_24",
    key: "go-concurrency-microservices",
    title: "Go Concurrency & Microservice Design",
    courseKey: "go-microservices",
    order_index: 0,
  },
];


// ─── Module Items ─────────────────────────────────────────────────────────────

export const seedModuleItems: SeedModuleItem[] = [
  // ═══ Module 1 – TypeScript Foundations (mitem_1 … mitem_6) ═══════════════
  {
    id: "mitem_1",
    key: "what-is-typescript",
    moduleKey: "ts-foundations",
    title: "What is TypeScript and Why Use It",
    type: "article",
    content_url: null,
    content_body: `## What is TypeScript?\n\nTypeScript is a strongly-typed superset of JavaScript developed by Microsoft. It adds optional static type annotations, enabling developers to catch errors at compile time rather than at runtime. Every valid JavaScript program is also a valid TypeScript program.\n\n### Why TypeScript?\n\n- **Early error detection** — The compiler catches type-related bugs before your code runs.\n- **Better IDE support** — Autocomplete, inline docs, and refactoring become far more powerful.\n- **Self-documenting code** — Types serve as living documentation.\n- **Safer refactoring** — Renaming a property across a codebase is trivial when the compiler enforces every reference.\n\n### How It Works\n\nTypeScript code is transpiled to plain JavaScript via the \`tsc\` compiler:\n\n\`\`\`typescript\n// input  (hello.ts)\nfunction greet(name: string): string {\n  return \`Hello, \${name}!\`;\n}\n\n// output (hello.js)\nfunction greet(name) {\n  return "Hello, " + name + "!";\n}\n\`\`\`\n\n### Key Principle\n\nTypeScript's type system is **structural**, not nominal. Two types are compatible if their structures match, regardless of their names. This makes TypeScript flexible while still providing strong guarantees.`,
    order_index: 0,
  },
  {
    id: "mitem_2",
    key: "setup-environment",
    moduleKey: "ts-foundations",
    title: "Setting Up Your Environment",
    type: "article",
    content_url: null,
    content_body: `## Setting Up Your TypeScript Environment\n\n### Install the Compiler\n\n\`\`\`bash\nnpm install -g typescript\ntsc --version\n\`\`\`\n\nOr add it as a dev dependency:\n\n\`\`\`bash\nnpm init -y\nnpm install -D typescript\nnpx tsc --version\n\`\`\`\n\n### Your First tsconfig.json\n\nRun \`tsc --init\` to generate a configuration file:\n\n\`\`\`json\n{\n  "compilerOptions": {\n    "target": "ES2022",\n    "module": "NodeNext",\n    "moduleResolution": "NodeNext",\n    "strict": true,\n    "outDir": "./dist",\n    "rootDir": "./src",\n    "esModuleInterop": true,\n    "skipLibCheck": true,\n    "forceConsistentCasingInFileNames": true\n  },\n  "include": ["src"],\n  "exclude": ["node_modules", "dist"]\n}\n\`\`\`\n\n### Recommended VS Code Extensions\n\n- **ESLint** — Linting with TypeScript support\n- **Prettier** — Code formatting\n- **Error Lens** — Inline error display in the editor\n\n### Compile and Watch\n\n\`\`\`bash\nnpx tsc          # One-time build\nnpx tsc --watch  # Watch mode\n\`\`\`\n\nWith this setup you have a fully typed development loop: write \`.ts\` files, get instant feedback, and compile to clean JavaScript.`,
    order_index: 1,
  },
  {
    id: "mitem_3",
    key: "basic-types",
    moduleKey: "ts-foundations",
    title: "Basic Types",
    type: "article",
    content_url: null,
    content_body: `## Basic Types in TypeScript\n\n### Primitive Types\n\n\`\`\`typescript\nlet name: string = "Alice";\nlet age: number = 28;\nlet isActive: boolean = true;\nlet nothing: null = null;\nlet notDefined: undefined = undefined;\n\`\`\`\n\n### Special Types\n\n- **any** — Opt-out of type checking (use sparingly)\n- **unknown** — Type-safe alternative to \`any\`\n- **void** — Absence of a return value\n- **never** — Values that never occur (thrown errors, infinite loops)\n\n### Key Principle\n\nAlways prefer \`unknown\` over \`any\`. The \`unknown\` type forces you to check the value before using it, while \`any\` disables all type checking.\n\n\`\`\`typescript\n// any — unsafe\nlet data: any = "hello";\ndata.foo(); // No error at compile time, but crashes at runtime\n\n// unknown — safe\nlet input: unknown = "hello";\ninput.foo(); // Error: Object is of type 'unknown'\nif (typeof input === "string") {\n  input.toUpperCase(); // OK after narrowing\n}\n\`\`\`\n\n### Type Assertions\n\nSometimes you know more about a type than TypeScript:\n\n\`\`\`typescript\nconst canvas = document.getElementById("myCanvas") as HTMLCanvasElement;\nconst ctx = canvas.getContext("2d");\n\`\`\`\n\nAssertions do **not** change the value at runtime — they only affect compile-time treatment.`,
    order_index: 2,
  },
  {
    id: "mitem_4",
    key: "type-inference",
    moduleKey: "ts-foundations",
    title: "Type Inference vs Explicit Typing",
    type: "article",
    content_url: null,
    content_body: `## Type Inference vs Explicit Typing\n\nTypeScript can automatically deduce the type of a variable from its initializer. This is called **type inference**.\n\n### When TypeScript Infers\n\n\`\`\`typescript\nlet count = 10;          // inferred as number\nlet message = "hello";   // inferred as string\nlet items = [1, 2, 3];   // inferred as number[]\n\`\`\`\n\nIn most cases, inference is accurate and explicit annotations are redundant:\n\n\`\`\`typescript\n// Unnecessarily verbose\nconst count: number = 10;\n\n// Clean — TypeScript infers number\nconst count = 10;\n\`\`\`\n\n### When to Annotate Explicitly\n\n1. **Function return types** — Catches accidental changes in implementation.\n2. **Variables declared without initialization** — The compiler cannot infer the type.\n3. **Function parameters** — TypeScript cannot infer parameter types from usage alone.\n4. **Complex object shapes** — Interfaces or type aliases make intent clear.\n\n\`\`\`typescript\n// Good: explicit return type catches regressions\nfunction calculateTotal(items: { price: number; qty: number }[]): number {\n  return items.reduce((sum, i) => sum + i.price * i.qty, 0);\n}\n\n// Good: variable declared without initializer\nlet result: string | undefined;\nresult = fetchData();\n\`\`\`\n\n### Best Practice\n\nLet TypeScript infer when the type is obvious. Annotate when the intent is unclear, when the initial value does not capture the full type, or when you want the compiler to enforce a specific contract.`,
    order_index: 3,
  },
  {
    id: "mitem_5",
    key: "arrays-tuples-enums",
    moduleKey: "ts-foundations",
    title: "Arrays, Tuples, and Enums",
    type: "article",
    content_url: null,
    content_body: `## Arrays, Tuples, and Enums\n\n### Arrays\n\nTypeScript has two syntaxes for array types:\n\n\`\`\`typescript\nlet numbers: number[] = [1, 2, 3];\nlet names: Array<string> = ["Alice", "Bob"];\n\`\`\`\n\n### Tuples\n\nA tuple is a fixed-length array where each position has a known type:\n\n\`\`\`typescript\nlet pair: [string, number] = ["age", 25];\nlet triple: [boolean, string, number] = [true, "hello", 42];\n\`\`\`\n\nTuples are useful for structured data like CSV rows or key-value pairs:\n\n\`\`\`typescript\ntype Coordinate = [number, number];\n\nfunction distance(a: Coordinate, b: Coordinate): number {\n  return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2);\n}\n\ndistance([0, 0], [3, 4]); // 5\n\`\`\`\n\n### Enums\n\nEnums define a set of named constants:\n\n\`\`\`typescript\nenum Direction {\n  Up,      // 0\n  Down,    // 1\n  Left,    // 2\n  Right,   // 3\n}\n\nenum Status {\n  Active = "ACTIVE",\n  Inactive = "INACTIVE",\n  Deleted = "DELETED",\n}\n\`\`\`\n\n### When to Use What\n\n- **Arrays** for homogeneous lists of variable length.\n- **Tuples** for fixed-length, heterogeneous collections.\n- **Enums** for a closed set of related constants — or prefer string literal unions for simpler cases.`,
    order_index: 4,
  },
  {
    id: "mitem_6",
    key: "assignment-type-playground",
    moduleKey: "ts-foundations",
    title: "Assignment 1 — Type the Playground",
    type: "assignment",
    content_url: null,
    content_body: `## Assignment 1 — Type the Playground\n\n### Objective\n\nPractice declaring variables with explicit types and using TypeScript's type inference by converting a small untyped JavaScript snippet into properly typed TypeScript.\n\n### Requirements\n\n1. Create a new file \`playground.ts\` with the following JavaScript code converted to TypeScript:\n   - A \`greet\` function that accepts a name and returns a greeting string\n   - A \`calculateArea\` function that accepts width and height (numbers) and returns the area\n   - An array of student objects with \`name\`, \`age\`, and \`grade\` fields\n   - A tuple representing a latitude/longitude coordinate pair\n\n2. Add explicit type annotations to all function parameters and return types.\n\n3. Use \`const\` assertions where appropriate.\n\n4. Ensure \`tsc --strict\` compiles without errors.\n\n### Starter Code\n\n\`\`\`javascript\nfunction greet(name) {\n  return "Hello, " + name + "!";\n}\n\nfunction calculateArea(width, height) {\n  return width * height;\n}\n\nconst students = [\n  { name: "Alice", age: 22, grade: "A" },\n  { name: "Bob", age: 25, grade: "B+" },\n];\n\nconst location = [40.7128, -74.006];\n\`\`\`\n\n### Deliverables\n\n- \`playground.ts\` that compiles cleanly with \`npx tsc --strict playground.ts\`\n- All variables and functions must have appropriate type annotations\n\n### Hints\n\n- Use \`type\` aliases for the student shape and coordinate tuple.\n- Remember that \`greet\` returns a \`string\` and \`calculateArea\` returns a \`number\`.\n- Tuples use the syntax \`[type1, type2]\`, not \`Array<type1, type2>\`.`,
    order_index: 5,
  },
  // ═══ Module 2 – Functions and Objects (mitem_7 … mitem_12) ═══════════════
  {
    id: "mitem_7",
    key: "typing-functions",
    moduleKey: "functions-objects",
    title: "Typing Functions",
    type: "article",
    content_url: null,
    content_body: `## Typing Functions\n\n### Parameter Types\n\nAlways annotate function parameters. TypeScript cannot infer them from call-site usage:\n\n\`\`\`typescript\nfunction add(a: number, b: number): number {\n  return a + b;\n}\n\`\`\`\n\n### Return Types\n\nTypeScript infers return types automatically, but explicit annotations catch accidental changes:\n\n\`\`\`typescript\n// Inferred — fine for simple functions\nconst double = (n: number) => n * 2;\n\n// Explicit — good when the body is complex\nfunction processUser(user: User): { name: string; isActive: boolean } {\n  return { name: user.firstName, isActive: user.status === "active" };\n}\n\`\`\`\n\n### Void vs Undefined\n\nUse \`void\` when a function does not return a value:\n\n\`\`\`typescript\nfunction logMessage(msg: string): void {\n  console.log(msg);\n}\n\`\`\`\n\n### Callback Typing\n\nTypeScript can infer callback parameter types from context, but explicit annotations improve readability:\n\n\`\`\`typescript\nfunction fetchData(url: string, callback: (data: unknown, error: Error | null) => void): void {\n  // implementation\n}\n\nfetchData("/api/users", (data, error) => {\n  if (error) console.error(error);\n});\n\`\`\`\n\n### Key Takeaway\n\nType your parameters explicitly. Let TypeScript infer simple return types, but annotate complex ones for documentation and safety.`,
    order_index: 0,
  },
  {
    id: "mitem_8",
    key: "rest-parameters-overloads",
    moduleKey: "functions-objects",
    title: "Rest Parameters and Function Overloads",
    type: "article",
    content_url: null,
    content_body: `## Rest Parameters and Function Overloads\n\n### Rest Parameters\n\nRest parameters let a function accept any number of arguments as an array:\n\n\`\`\`typescript\nfunction sum(...numbers: number[]): number {\n  return numbers.reduce((total, n) => total + n, 0);\n}\n\nsum(1, 2, 3);       // 6\nsum(10, 20, 30, 40); // 100\n\`\`\`\n\nYou can combine rest parameters with regular parameters:\n\n\`\`\`typescript\nfunction log(level: string, ...messages: string[]): void {\n  console.log(\`[\${level.toUpperCase()}]\`, ...messages);\n}\n\nlog("info", "Server started", "Listening on port 3000");\n\`\`\`\n\n### Function Overloads\n\nWhen a function behaves differently based on input types, use overload signatures:\n\n\`\`\`typescript\nfunction format(value: string): string;\nfunction format(value: number): string;\nfunction format(value: Date): string;\nfunction format(value: string | number | Date): string {\n  if (typeof value === "string") return value.trim();\n  if (typeof value === "number") return value.toFixed(2);\n  return value.toISOString();\n}\n\nformat("hello");      // "hello"\nformat(3.14159);      // "3.14"\nformat(new Date());   // "2026-08-19T..."\n\`\`\`\n\nThe implementation signature is hidden from callers — only the overload signatures are visible.\n\n### Key Takeaway\n\nUse rest parameters for variadic functions. Use overloads when a function's return type depends on the input type in ways a union return type cannot express.`,
    order_index: 1,
  },
  {
    id: "mitem_9",
    key: "object-types-aliases",
    moduleKey: "functions-objects",
    title: "Object Types and Type Aliases",
    type: "article",
    content_url: null,
    content_body: `## Object Types and Type Aliases\n\n### Inline Object Types\n\nYou can describe object shapes directly:\n\n\`\`\`typescript\nfunction printUser(user: { name: string; age: number; email: string }): void {\n  console.log(\`\${user.name} <\${user.email}>\`);\n}\n\`\`\`\n\nThis works but becomes unwieldy when the same shape appears in multiple places.\n\n### Type Aliases with type\n\nThe \`type\` keyword creates a named alias for any type:\n\n\`\`\`typescript\ntype User = {\n  id: string;\n  name: string;\n  email: string;\n  age: number;\n};\n\nfunction printUser(user: User): void {\n  console.log(\`\${user.name} <\${user.email}>\`);\n}\n\nfunction getDisplayName(user: User): string {\n  return \`\${user.name} (\${user.age})\`;\n}\n\`\`\`\n\n### Type Aliases for Non-Object Types\n\n\`\`\`typescript\ntype ID = string | number;\ntype Point = [number, number];\ntype Callback = (error: Error | null, data?: unknown) => void;\n\`\`\`\n\n### Nested Types\n\n\`\`\`typescript\ntype Address = {\n  street: string;\n  city: string;\n  zip: string;\n};\n\ntype Company = {\n  name: string;\n  address: Address;\n};\n\`\`\`\n\n### Key Takeaway\n\nUse \`type\` aliases to give meaningful names to complex object shapes. This reduces duplication, improves readability, and makes refactoring easier.`,
    order_index: 2,
  },
  {
    id: "mitem_10",
    key: "interfaces-vs-type-aliases",
    moduleKey: "functions-objects",
    title: "Interfaces vs Type Aliases",
    type: "article",
    content_url: null,
    content_body: `## Interfaces vs Type Aliases\n\nTypeScript offers two ways to describe object shapes: \`interface\` and \`type\`. They overlap significantly, but each has unique capabilities.\n\n### Interfaces\n\nInterfaces declare the shape of an object and can be extended or merged:\n\n\`\`\`typescript\ninterface User {\n  id: string;\n  name: string;\n  email: string;\n}\n\ninterface Admin extends User {\n  role: "admin";\n  permissions: string[];\n}\n\`\`\`\n\n**Declaration merging** is unique to interfaces — declaring the same interface twice merges them:\n\n\`\`\`typescript\ninterface Window {\n  myCustomProp: string;\n}\n// Window now includes myCustomProp alongside all built-in properties\n\`\`\`\n\n### Type Aliases\n\nType aliases can represent **any** type — primitives, unions, intersections, tuples, and more:\n\n\`\`\`typescript\ntype Result = { ok: true; data: unknown } | { ok: false; error: string };\ntype ID = string | number;\ntype Pair<T> = [T, T];\n\`\`\`\n\n### When to Use Which\n\n- Use **interfaces** for object shapes that may be extended or implemented by classes.\n- Use **type aliases** for unions, intersections, tuples, mapped types, or non-object types.\n- Either works for simple object shapes. Pick one and be consistent.\n\n### Key Takeaway\n\nInterfaces and types are interchangeable for object shapes. Use interfaces when you need extensibility or declaration merging; use type aliases for everything else.`,
    order_index: 3,
  },
  {
    id: "mitem_11",
    key: "readonly-optional-properties",
    moduleKey: "functions-objects",
    title: "Readonly and Optional Properties",
    type: "article",
    content_url: null,
    content_body: `## Readonly and Optional Properties\n\n### Optional Properties\n\nMark a property with \`?\` to indicate it may be absent:\n\n\`\`\`typescript\ntype UserProfile = {\n  name: string;\n  bio?: string;        // optional — may be undefined\n  avatarUrl?: string;\n};\n\nconst user: UserProfile = { name: "Alice" };\nuser.bio;       // string | undefined\nuser.avatarUrl; // string | undefined\n\`\`\`\n\nAlways check for \`undefined\` before using optional properties.\n\n### Readonly Properties\n\nUse \`readonly\` to prevent reassignment after creation:\n\n\`\`\`typescript\ntype Config = {\n  readonly apiUrl: string;\n  readonly timeout: number;\n};\n\nconst config: Config = { apiUrl: "https://api.example.com", timeout: 5000 };\nconfig.apiUrl = "https://other.com"; // Error: Cannot assign to 'apiUrl'\n\`\`\`\n\n### Readonly Arrays and Tuples\n\n\`\`\`typescript\nconst frozen: readonly number[] = [1, 2, 3];\nfrozen.push(4); // Error: Property 'push' does not exist\n\ntype ImmutablePair = readonly [string, number];\n\`\`\`\n\n### Combining Modifiers\n\n\`\`\`typescript\ntype ImmutableUser = {\n  readonly id: string;\n  readonly name: string;\n  readonly bio?: string;\n};\n\`\`\`\n\n### Key Takeaway\n\nUse \`?\` for properties that may be absent and \`readonly\` for properties that should not change after initialization. Together they help model immutable data structures.`,
    order_index: 4,
  },
  {
    id: "mitem_12",
    key: "assignment-library-catalog",
    moduleKey: "functions-objects",
    title: "Assignment 2 — Library Catalog API",
    type: "assignment",
    content_url: null,
    content_body: `## Assignment 2 — Library Catalog API\n\n### Objective\n\nPractice typing functions, creating type aliases, and using optional and readonly properties by building a small library catalog module.\n\n### Requirements\n\n1. Define types for \`Author\`, \`Book\`, and \`Library\`:\n   - \`Author\` has \`name\`, \`birthYear\` (optional), and \`nationality\` fields\n   - \`Book\` has \`isbn\`, \`title\`, \`author\` (Author), \`yearPublished\`, \`genre\`, and optional \`averageRating\`\n   - \`Library\` has \`name\`, \`address\`, and \`catalog\` (an array of Book)\n\n2. Write these typed functions:\n   - \`addBook(library: Library, book: Book): void\`\n   - \`findBooksByGenre(library: Library, genre: string): Book[]\`\n   - \`getAverageRating(library: Library): number\` — ignore books without a rating\n   - \`formatBookEntry(book: Book): string\` — returns \`"Title (Author, Year) — Genre"\`\n\n3. Make \`Library.catalog\` a \`ReadonlyArray<Book>\` externally.\n\n### Starter Code\n\n\`\`\`typescript\ntype Author = {\n  name: string;\n  birthYear?: number;\n  nationality: string;\n};\n\ntype Book = {\n  isbn: string;\n  title: string;\n  author: Author;\n  yearPublished: number;\n  genre: string;\n  averageRating?: number;\n};\n\n// TODO: Define Library type and functions\n\`\`\`\n\n### Deliverables\n\n- \`library-catalog.ts\` that compiles with \`npx tsc --strict\`\n- At least 3 books and 2 authors defined as test data\n\n### Hints\n\n- Use \`ReadonlyArray<Book>\` for the external catalog type.\n- Filter out \`undefined\` ratings before computing the average.`,
    order_index: 5,
  },
  // ═══ Module 3 – Union Types, Narrowing, and Guards (mitem_13 … mitem_18) ══
  {
    id: "mitem_13",
    key: "union-intersection-types",
    moduleKey: "union-narrowing-guards",
    title: "Union and Intersection Types",
    type: "article",
    content_url: null,
    content_body: `## Union and Intersection Types\n\n### Union Types\n\nA union type says "this value can be **one of** several types":\n\n\`\`\`typescript\ntype Status = "active" | "inactive" | "deleted";\ntype ID = string | number;\ntype Result = { ok: true; data: string } | { ok: false; error: string };\n\`\`\`\n\nWhen a value is a union, you can only access members common to all variants:\n\n\`\`\`typescript\nfunction process(input: string | number) {\n  input.toString();   // OK — all values have .toString()\n  input.toUpperCase(); // Error — number doesn't have this\n}\n\`\`\`\n\n### Intersection Types\n\nAn intersection type says "this value has **all** of these types simultaneously":\n\n\`\`\`typescript\ntype HasName = { name: string };\ntype HasAge = { age: number };\ntype Person = HasName & HasAge;\n\nconst person: Person = { name: "Alice", age: 30 };\n\`\`\`\n\nIntersections are most useful for combining small, reusable type fragments.\n\n### Key Takeaway\n\nUse **unions** when a value can be one of several types (most common). Use **intersections** when you want to combine multiple type fragments into one object type.`,
    order_index: 0,
  },
  {
    id: "mitem_14",
    key: "literal-discriminated-unions",
    moduleKey: "union-narrowing-guards",
    title: "Literal Types and Discriminated Unions",
    type: "article",
    content_url: null,
    content_body: `## Literal Types and Discriminated Unions\n\n### Literal Types\n\nA literal type represents exactly one value:\n\n\`\`\`typescript\ntype Direction = "up" | "down" | "left" | "right";\ntype HttpStatus = 200 | 201 | 400 | 404 | 500;\n\nlet dir: Direction = "up";   // OK\ndir = "forward";              // Error: not a valid Direction\n\`\`\`\n\n### Discriminated Unions\n\nThe most powerful pattern in TypeScript: a union of object types sharing a common **discriminant** field:\n\n\`\`\`typescript\ntype Shape =\n  | { kind: "circle"; radius: number }\n  | { kind: "rectangle"; width: number; height: number }\n  | { kind: "triangle"; base: number; height: number };\n\nfunction area(shape: Shape): number {\n  switch (shape.kind) {\n    case "circle":\n      return Math.PI * shape.radius ** 2;\n    case "rectangle":\n      return shape.width * shape.height;\n    case "triangle":\n      return 0.5 * shape.base * shape.height;\n  }\n}\n\`\`\`\n\n### Why Discriminated Unions?\n\n- They make **impossible states unrepresentable**.\n- TypeScript narrows automatically when you check the discriminant.\n- They replace verbose class hierarchies for simple data modeling.\n\n### Key Takeaway\n\nWhen building unions of objects, always include a shared literal discriminant field. This enables exhaustive pattern matching.`,
    order_index: 1,
  },
  {
    id: "mitem_15",
    key: "type-narrowing",
    moduleKey: "union-narrowing-guards",
    title: "Type Narrowing",
    type: "article",
    content_url: null,
    content_body: `## Type Narrowing\n\nNarrowing is the process of refining a broad type into a more specific one using runtime checks.\n\n### typeof Narrowing\n\n\`\`\`typescript\nfunction describe(value: string | number | boolean): string {\n  if (typeof value === "string") {\n    return value.toUpperCase();\n  }\n  if (typeof value === "number") {\n    return value.toFixed(2);\n  }\n  return value ? "yes" : "no";\n}\n\`\`\`\n\n### instanceof Narrowing\n\n\`\`\`typescript\nfunction formatDate(input: string | Date): string {\n  if (input instanceof Date) {\n    return input.toISOString();\n  }\n  return input;\n}\n\`\`\`\n\n### Truthiness Narrowing\n\n\`\`\`typescript\nfunction greet(name: string | null | undefined): string {\n  if (!name) return "Hello, stranger!";\n  return \`Hello, \${name}!\`;\n}\n\`\`\`\n\n### Equality Narrowing\n\n\`\`\`typescript\nfunction compare(a: string | number, b: string | boolean) {\n  if (a === b) {\n    a.toUpperCase(); // Both are string\n    b.toUpperCase();\n  }\n}\n\`\`\`\n\n### Key Takeaway\n\nTypeScript uses \`typeof\`, \`instanceof\`, truthiness, and equality checks to narrow types. The compiler tracks these checks through control flow.`,
    order_index: 2,
  },
  {
    id: "mitem_16",
    key: "custom-type-guards",
    moduleKey: "union-narrowing-guards",
    title: "Custom Type Guards and Assertion Functions",
    type: "article",
    content_url: null,
    content_body: `## Custom Type Guards and Assertion Functions\n\n### Type Guard Functions\n\nA type guard uses the \`is\` keyword in its return type:\n\n\`\`\`typescript\ninterface Cat { meow(): void; purr(): void; }\ninterface Dog { bark(): void; fetch(): void; }\n\nfunction isCat(animal: Cat | Dog): animal is Cat {\n  return "meow" in animal;\n}\n\nfunction interact(animal: Cat | Dog) {\n  if (isCat(animal)) {\n    animal.meow();   // Cat\n  } else {\n    animal.bark();   // Dog\n  }\n}\n\`\`\`\n\n### Assertion Functions\n\nAssertion functions throw an error if the condition is false, narrowing the type on success:\n\n\`\`\`typescript\nfunction assertString(value: unknown): asserts value is string {\n  if (typeof value !== "string") {\n    throw new Error(\`Expected string, got \${typeof value}\`);\n  }\n}\n\nfunction process(input: unknown) {\n  assertString(input);\n  console.log(input.toUpperCase()); // input is string here\n}\n\`\`\`\n\n### Practical Example: API Response Validation\n\n\`\`\`typescript\ntype ApiResponse = { status: "ok"; data: unknown } | { status: "error"; message: string };\n\nfunction isSuccess(res: ApiResponse): res is { status: "ok"; data: unknown } {\n  return res.status === "ok";\n}\n\`\`\`\n\n### Key Takeaway\n\nUse type guards (\`x is Type\`) for custom runtime checks. Use assertion functions when you want to throw on invalid input and narrow for the rest of the function.`,
    order_index: 3,
  },
  {
    id: "mitem_17",
    key: "never-exhaustiveness",
    moduleKey: "union-narrowing-guards",
    title: "never and Exhaustiveness Checking",
    type: "article",
    content_url: null,
    content_body: `## never and Exhaustiveness Checking\n\n### The never Type\n\nThe \`never\` type represents values that never occur:\n\n\`\`\`typescript\nfunction throwError(msg: string): never {\n  throw new Error(msg);\n}\n\nfunction infiniteLoop(): never {\n  while (true) {}\n}\n\`\`\`\n\n### Exhaustiveness Checking\n\nUse \`never\` with discriminated unions to ensure all cases are handled:\n\n\`\`\`typescript\ntype Shape =\n  | { kind: "circle"; radius: number }\n  | { kind: "rectangle"; width: number; height: number };\n\nfunction area(shape: Shape): number {\n  switch (shape.kind) {\n    case "circle":\n      return Math.PI * shape.radius ** 2;\n    case "rectangle":\n      return shape.width * shape.height;\n    default:\n      const _exhaustive: never = shape;\n      return _exhaustive;\n  }\n}\n\`\`\`\n\nIf you add a new variant to \`Shape\` (e.g., \`triangle\`) without updating the \`switch\`, TypeScript reports an error at the \`default\` branch — because a triangle is not assignable to \`never\`.\n\n### Why This Matters\n\nExhaustiveness checking turns the compiler into a safety net. Adding a new union variant forces you to handle it everywhere it's used.\n\n### Key Takeaway\n\nUse \`default: const _: never = value\` at the end of \`switch\` statements over discriminated unions to catch unhandled cases.`,
    order_index: 4,
  },
  {
    id: "mitem_18",
    key: "assignment-shape-calculator",
    moduleKey: "union-narrowing-guards",
    title: "Assignment 3 — Shape Calculator",
    type: "assignment",
    content_url: null,
    content_body: `## Assignment 3 — Shape Calculator\n\n### Objective\n\nPractice discriminated unions, type narrowing, and exhaustiveness checking.\n\n### Requirements\n\n1. Define a discriminated union \`Shape\` with three variants:\n   - \`circle\` — has \`radius\` (number)\n   - \`rectangle\` — has \`width\` and \`height\`\n   - \`triangle\` — has \`sideA\`, \`sideB\`, \`sideC\`, and \`height\`\n\n2. Implement:\n   - \`area(shape: Shape): number\`\n   - \`perimeter(shape: Shape): number\` (triangle uses sideA + sideB + sideC)\n   - \`describe(shape: Shape): string\` — human-readable description\n\n3. Use a \`default\` branch with \`never\` for exhaustiveness checking.\n\n4. Write \`validateTriangle(a, b, c): boolean\` checking the triangle inequality theorem.\n\n### Starter Code\n\n\`\`\`typescript\ntype Shape =\n  | { kind: "circle"; radius: number }\n  | { kind: "rectangle"; width: number; height: number }\n  | { kind: "triangle"; sideA: number; sideB: number; sideC: number; height: number };\n\n// TODO: Implement area, perimeter, describe, validateTriangle\n\`\`\`\n\n### Deliverables\n\n- \`shape-calculator.ts\` that compiles with \`npx tsc --strict\`\n- At least one test case for each shape type\n\n### Hints\n\n- Circle area: \`Math.PI * r²\`, perimeter: \`2 * Math.PI * r\`\n- Triangle area: \`0.5 * base * height\` (use \`sideA\` as base)\n- The \`never\` pattern: \`const _exhaustive: never = shape;\``,
    order_index: 5,
  },
  // ═══ Module 4 – Classes and OOP in TypeScript (mitem_19 … mitem_24) ══════
  {
    id: "mitem_19",
    key: "classes-constructors-access",
    moduleKey: "classes-oop",
    title: "Classes, Constructors, and Access Modifiers",
    type: "article",
    content_url: null,
    content_body: `## Classes, Constructors, and Access Modifiers\n\n### Basic Class Syntax\n\n\`\`\`typescript\nclass User {\n  name: string;\n  email: string;\n\n  constructor(name: string, email: string) {\n    this.name = name;\n    this.email = email;\n  }\n\n  greet(): string {\n    return \`Hello, I'm \${this.name}\`;\n  }\n}\n\nconst alice = new User("Alice", "alice@example.com");\nalice.greet(); // "Hello, I'm Alice"\n\`\`\`\n\n### Access Modifiers\n\n- **public** (default) — Accessible from anywhere\n- **private** — Accessible only within the class\n- **protected** — Accessible within the class and its subclasses\n\n\`\`\`typescript\nclass BankAccount {\n  public owner: string;\n  private balance: number;\n  protected accountType: string;\n\n  constructor(owner: string, initialBalance: number) {\n    this.owner = owner;\n    this.balance = initialBalance;\n    this.accountType = "checking";\n  }\n\n  public deposit(amount: number): void {\n    this.balance += amount;\n  }\n\n  public getBalance(): number {\n    return this.balance;\n  }\n}\n\`\`\`\n\n### Key Takeaway\n\nUse \`public\` for the API surface, \`private\` for internal state, and \`protected\` for members that subclasses need. TypeScript's access modifiers are compile-time only.`,
    order_index: 0,
  },
  {
    id: "mitem_20",
    key: "readonly-parameter-properties",
    moduleKey: "classes-oop",
    title: "readonly, Parameter Properties, Getters/Setters",
    type: "article",
    content_url: null,
    content_body: `## readonly, Parameter Properties, Getters/Setters\n\n### The readonly Modifier\n\n\`\`\`typescript\nclass Config {\n  readonly apiUrl: string;\n  readonly timeout: number;\n\n  constructor(url: string, timeout: number) {\n    this.apiUrl = url;\n    this.timeout = timeout;\n  }\n}\n\nconst c = new Config("https://api.example.com", 5000);\nc.apiUrl = "other"; // Error: Cannot assign to 'apiUrl'\n\`\`\`\n\n### Parameter Properties\n\nTypeScript's shorthand declares and initializes a property in the constructor parameter list:\n\n\`\`\`typescript\nclass User {\n  constructor(\n    public readonly id: string,\n    public name: string,\n    private _email: string,\n  ) {}\n}\n\nconst user = new User("u1", "Alice", "alice@test.com");\nuser.name;    // OK\nuser._email;  // Error: private\n\`\`\`\n\n### Getters and Setters\n\n\`\`\`typescript\nclass Temperature {\n  private _celsius: number;\n\n  constructor(celsius: number) {\n    this._celsius = celsius;\n  }\n\n  get fahrenheit(): number {\n    return this._celsius * 9 / 5 + 32;\n  }\n\n  set fahrenheit(value: number) {\n    this._celsius = (value - 32) * 5 / 9;\n  }\n}\n\nconst t = new Temperature(100);\nt.fahrenheit;     // 212\nt.fahrenheit = 32;\nt._celsius;       // 0\n\`\`\`\n\n### Key Takeaway\n\nParameter properties reduce boilerplate. \`readonly\` prevents accidental mutation. Getters/setters add validation or derived logic behind a simple property interface.`,
    order_index: 1,
  },
  {
    id: "mitem_21",
    key: "inheritance-abstract-classes",
    moduleKey: "classes-oop",
    title: "Inheritance and Abstract Classes",
    type: "article",
    content_url: null,
    content_body: `## Inheritance and Abstract Classes\n\n### Inheritance with extends\n\n\`\`\`typescript\nclass Animal {\n  constructor(public name: string) {}\n  speak(): string {\n    return \`\${this.name} makes a sound\`;\n  }\n}\n\nclass Dog extends Animal {\n  speak(): string {\n    return \`\${this.name} barks\`;\n  }\n}\n\nclass Cat extends Animal {\n  speak(): string {\n    return \`\${this.name} meows\`;\n  }\n}\n\nconst animals: Animal[] = [new Dog("Rex"), new Cat("Whiskers")];\nanimals.map(a => a.speak()); // ["Rex barks", "Whiskers meows"]\n\`\`\`\n\n### Abstract Classes\n\nAbstract classes cannot be instantiated directly. They define a contract for subclasses:\n\n\`\`\`typescript\nabstract class Shape {\n  abstract area(): number;\n  abstract perimeter(): number;\n\n  describe(): string {\n    return \`Area: \${this.area().toFixed(2)}, Perimeter: \${this.perimeter().toFixed(2)}\`;\n  }\n}\n\nclass Circle extends Shape {\n  constructor(private radius: number) { super(); }\n  area(): number { return Math.PI * this.radius ** 2; }\n  perimeter(): number { return 2 * Math.PI * this.radius; }\n}\n\nconst c = new Circle(5);\nc.describe(); // "Area: 78.54, Perimeter: 31.42"\n\`\`\`\n\n### Key Takeaway\n\nUse \`extends\` for shared implementation. Use \`abstract\` classes when subclasses must implement specific methods but can share common logic.`,
    order_index: 2,
  },
  {
    id: "mitem_22",
    key: "interfaces-with-classes",
    moduleKey: "classes-oop",
    title: "Interfaces with Classes",
    type: "article",
    content_url: null,
    content_body: `## Interfaces with Classes\n\n### Implementing Interfaces\n\nThe \`implements\` keyword forces a class to satisfy an interface's contract:\n\n\`\`\`typescript\ninterface Serializable {\n  serialize(): string;\n  deserialize(data: string): void;\n}\n\nclass User implements Serializable {\n  constructor(public name: string, public email: string) {}\n\n  serialize(): string {\n    return JSON.stringify({ name: this.name, email: this.email });\n  }\n\n  deserialize(data: string): void {\n    const obj = JSON.parse(data);\n    this.name = obj.name;\n    this.email = obj.email;\n  }\n}\n\`\`\`\n\n### Multiple Interfaces\n\n\`\`\`typescript\ninterface Loggable { log(message: string): void; }\ninterface Validatable { validate(): boolean; }\n\nclass UserService implements Loggable, Validatable {\n  log(message: string): void {\n    console.log(\`[UserService] \${message}\`);\n  }\n  validate(): boolean { return true; }\n}\n\`\`\`\n\n### Interfaces vs Abstract Classes\n\n- **Interfaces** define pure contracts — no implementation. A class can implement many.\n- **Abstract classes** can have implementation and state. A class can extend only one.\n\n### Key Takeaway\n\nUse \`implements\` to define what a class must provide. Prefer interfaces over abstract classes when you don't need shared implementation.`,
    order_index: 3,
  },
  {
    id: "mitem_23",
    key: "static-members-singletons",
    moduleKey: "classes-oop",
    title: "Static Members and Singletons",
    type: "article",
    content_url: null,
    content_body: `## Static Members and Singletons\n\n### Static Properties and Methods\n\nStatic members belong to the class itself, not to instances:\n\n\`\`\`typescript\nclass MathUtils {\n  static readonly PI = 3.14159265;\n\n  static circleArea(radius: number): number {\n    return MathUtils.PI * radius ** 2;\n  }\n\n  static clamp(value: number, min: number, max: number): number {\n    return Math.min(Math.max(value, min), max);\n  }\n}\n\nMathUtils.PI;             // 3.14159265\nMathUtils.circleArea(5);  // 78.5398...\n\`\`\`\n\n### The Singleton Pattern\n\nUse a private constructor and a static method to control instance creation:\n\n\`\`\`typescript\nclass Database {\n  private static instance: Database;\n\n  private constructor(public connectionString: string) {}\n\n  static getInstance(): Database {\n    if (!Database.instance) {\n      Database.instance = new Database("postgres://localhost:5432/mydb");\n    }\n    return Database.instance;\n  }\n\n  query(sql: string): unknown[] {\n    console.log(\`Executing: \${sql}\`);\n    return [];\n  }\n}\n\nconst db1 = Database.getInstance();\nconst db2 = Database.getInstance();\ndb1 === db2; // true — same instance\n\`\`\`\n\n### Static Initialization Blocks\n\n\`\`\`typescript\nclass Config {\n  static values: Record<string, string>;\n\n  static {\n    Config.values = {\n      NODE_ENV: process.env.NODE_ENV ?? "development",\n      PORT: process.env.PORT ?? "3000",\n    };\n  }\n}\n\`\`\`\n\n### Key Takeaway\n\nUse static members for utility functions and class-level state. Use the singleton pattern when exactly one instance should exist.`,
    order_index: 4,
  },
  {
    id: "mitem_24",
    key: "assignment-bank-account",
    moduleKey: "classes-oop",
    title: "Assignment 4 — Bank Account System",
    type: "assignment",
    content_url: null,
    content_body: `## Assignment 4 — Bank Account System\n\n### Objective\n\nPractice classes, access modifiers, inheritance, and interfaces.\n\n### Requirements\n\n1. Create an abstract \`BankAccount\` class with:\n   - \`protected\` fields: \`_balance\`, \`_owner\`\n   - \`public readonly\` field: \`id\`\n   - Abstract methods: \`deposit(amount)\`, \`withdraw(amount)\`, \`getStatement()\`\n   - \`public getBalance(): number\`\n\n2. Create \`SavingsAccount\` extending \`BankAccount\`:\n   - Has an \`interestRate\` field\n   - \`withdraw\` prevents withdrawal if balance drops below 100\n   - \`addInterest()\` applies the interest rate to the balance\n\n3. Create \`CheckingAccount\` extending \`BankAccount\`:\n   - Has an optional \`overdraftLimit\` (default 0)\n   - \`withdraw\` allows going negative up to the overdraft limit\n\n4. Create a \`Bank\` class (singleton) that:\n   - Holds an array of \`BankAccount\` instances\n   - Methods: \`createSavingsAccount\`, \`createCheckingAccount\`, \`findAccountById\`\n\n### Deliverables\n\n- \`bank-accounts.ts\` that compiles with \`npx tsc --strict\`\n- Create at least one savings and one checking account as test data\n- Demonstrate deposit, withdrawal, and statement printing\n\n### Hints\n\n- Use parameter properties to reduce boilerplate.\n- Singleton pattern: private constructor, static \`getInstance()\`, private static \`_instance\`.`,
    order_index: 5,
  },
  // ═══ Module 5 – Generics (mitem_25 … mitem_30) ════════════════════════════
  {
    id: "mitem_25",
    key: "intro-to-generics",
    moduleKey: "generics",
    title: "Introduction to Generics",
    type: "article",
    content_url: null,
    content_body: `## Introduction to Generics\n\nGenerics let you write code that works with **any** type while preserving type safety.\n\n### The Identity Function Problem\n\n\`\`\`typescript\n// Bad — return type is 'any'\nfunction identity(value: any): any {\n  return value;\n}\n\nconst result = identity("hello");\nresult.toUpperCase(); // Error: 'any' has no method\n\`\`\`\n\nWith generics:\n\n\`\`\`typescript\nfunction identity<T>(value: T): T {\n  return value;\n}\n\nconst result = identity("hello");\nresult.toUpperCase(); // OK — result is string\n\`\`\`\n\n### Generic Arrow Functions\n\n\`\`\`typescript\nconst getFirst = <T>(arr: T[]): T | undefined => arr[0];\n\ngetFirst([1, 2, 3]);     // number | undefined\ngetFirst(["a", "b"]);    // string | undefined\n\`\`\`\n\n### Type Inference for Generics\n\nTypeScript usually infers the generic parameter from the argument:\n\n\`\`\`typescript\nfunction wrap<T>(value: T): { value: T } {\n  return { value };\n}\n\nconst wrapped = wrap(42); // { value: number } — T inferred as number\nconst explicit = wrap<string>("hello"); // explicitly specified\n\`\`\`\n\n### Key Takeaway\n\nGenerics let you write reusable, type-safe code. Prefer generics over \`any\` whenever a function or class works with multiple types.`,
    order_index: 0,
  },
  {
    id: "mitem_26",
    key: "generic-constraints",
    moduleKey: "generics",
    title: "Generic Constraints",
    type: "article",
    content_url: null,
    content_body: `## Generic Constraints\n\n### The Problem\n\nWithout constraints, you cannot access any properties on a generic type:\n\n\`\`\`typescript\nfunction getLength<T>(value: T): number {\n  return value.length; // Error: 'T' has no property 'length'\n}\n\`\`\`\n\n### Using extends to Constrain\n\n\`\`\`typescript\nfunction getLength<T extends { length: number }>(value: T): number {\n  return value.length;\n}\n\ngetLength("hello");          // 5\ngetLength([1, 2, 3]);        // 3\ngetLength({ length: 10 });   // 10\ngetLength(42);                // Error: number has no .length\n\`\`\`\n\n### Constraining to Specific Types\n\n\`\`\`typescript\nfunction merge<T extends object, U extends object>(a: T, b: U): T & U {\n  return { ...a, ...b };\n}\n\nconst user = merge({ name: "Alice" }, { age: 30 });\n// { name: string; age: number }\n\`\`\`\n\n### keyof Constraints\n\n\`\`\`typescript\nfunction getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {\n  return obj[key];\n}\n\nconst user = { name: "Alice", age: 30 };\ngetProperty(user, "name");  // string — OK\ngetProperty(user, "email"); // Error: "email" is not in keyof User\n\`\`\`\n\n### Key Takeaway\n\nUse \`extends\` to constrain generics when you need to access properties. \`keyof\` constraints ensure only valid keys are passed.`,
    order_index: 1,
  },
  {
    id: "mitem_27",
    key: "generic-classes",
    moduleKey: "generics",
    title: "Generic Classes",
    type: "article",
    content_url: null,
    content_body: `## Generic Classes\n\n### Basic Generic Class\n\n\`\`\`typescript\nclass Stack<T> {\n  private items: T[] = [];\n\n  push(item: T): void {\n    this.items.push(item);\n  }\n\n  pop(): T | undefined {\n    return this.items.pop();\n  }\n\n  peek(): T | undefined {\n    return this.items[this.items.length - 1];\n  }\n\n  get size(): number {\n    return this.items.length;\n  }\n}\n\nconst numberStack = new Stack<number>();\nnumberStack.push(1);\nnumberStack.push(2);\nnumberStack.pop(); // 2\n\nconst stringStack = new Stack<string>();\nstringStack.push("hello");\n\`\`\`\n\n### Multiple Type Parameters\n\n\`\`\`typescript\nclass Pair<K, V> {\n  constructor(public key: K, public value: V) {}\n  toString(): string {\n    return \`\${this.key}: \${this.value}\`;\n  }\n}\n\nconst entry = new Pair("name", "Alice");\n\`\`\`\n\n### Generic Class with Constraints\n\n\`\`\`typescript\nclass SortedList<T extends { compareTo(other: T): number }> {\n  private items: T[] = [];\n\n  insert(item: T): void {\n    const idx = this.items.findIndex(e => item.compareTo(e) < 0);\n    this.items.splice(idx === -1 ? this.items.length : idx, 0, item);\n  }\n\n  getAll(): readonly T[] {\n    return this.items;\n  }\n}\n\`\`\`\n\n### Key Takeaway\n\nGeneric classes build reusable data structures that preserve type info. Use constraints when the class needs to call methods on the generic type.`,
    order_index: 2,
  },
  {
    id: "mitem_28",
    key: "default-generic-parameters",
    moduleKey: "generics",
    title: "Default Generic Parameters",
    type: "article",
    content_url: null,
    content_body: `## Default Generic Parameters\n\n### Basic Defaults\n\n\`\`\`typescript\nclass ApiResponse<T = unknown> {\n  constructor(public status: number, public data: T) {}\n}\n\nconst res = new ApiResponse(200, { users: [] });\nres.data; // unknown\n\nconst typed = new ApiResponse<{ users: string[] }>(200, { users: ["Alice"] });\ntyped.data.users; // string[]\n\`\`\`\n\n### Defaults with Constraints\n\n\`\`\`typescript\ntype Paginated<T = string> = {\n  items: T[];\n  page: number;\n  total: number;\n};\n\nconst names: Paginated = { items: ["Alice", "Bob"], page: 1, total: 10 };\nconst users: Paginated<{ id: string; name: string }> = {\n  items: [{ id: "1", name: "Alice" }],\n  page: 1,\n  total: 5,\n};\n\`\`\`\n\n### Utility Function with Defaults\n\n\`\`\`typescript\nfunction createContainer<T extends HTMLElement = HTMLDivElement>(\n  content: string,\n): T {\n  const el = document.createElement("div") as T;\n  el.textContent = content;\n  return el;\n}\n\`\`\`\n\n### Key Takeaway\n\nDefault generic parameters make generics more ergonomic by reducing the need to specify type arguments when the common case is obvious.`,
    order_index: 3,
  },
  {
    id: "mitem_29",
    key: "generics-multiple-type-params",
    moduleKey: "generics",
    title: "Generics with Multiple Type Parameters",
    type: "article",
    content_url: null,
    content_body: `## Generics with Multiple Type Parameters\n\n### When You Need Multiple Type Parameters\n\n\`\`\`typescript\nfunction zip<A, B>(left: A[], right: B[]): [A, B][] {\n  const len = Math.min(left.length, right.length);\n  return Array.from({ length: len }, (_, i) => [left[i], right[i]]);\n}\n\nconst pairs = zip([1, 2, 3], ["a", "b", "c"]);\n// [number, string][]\n\`\`\`\n\n### Mapped Types with Multiple Parameters\n\n\`\`\`typescript\ntype Mapped<K extends string, V> = {\n  [P in K]: V;\n};\n\ntype UserRoles = Mapped<"admin" | "editor" | "viewer", boolean>;\n// { admin: boolean; editor: boolean; viewer: boolean }\n\`\`\`\n\n### Practical Example: Event Emitter\n\n\`\`\`typescript\ntype EventMap = Record<string, unknown>;\n\nclass EventEmitter<Events extends EventMap> {\n  private listeners: { [K in keyof Events]?: Array<(data: Events[K]) => void> } = {};\n\n  on<K extends keyof Events>(event: K, fn: (data: Events[K]) => void): void {\n    const list = this.listeners[event] ?? [];\n    list.push(fn);\n    this.listeners[event] = list;\n  }\n\n  emit<K extends keyof Events>(event: K, data: Events[K]): void {\n    this.listeners[event]?.forEach(fn => fn(data));\n  }\n}\n\ntype AppEvents = {\n  login: { userId: string };\n  logout: void;\n  error: { message: string; code: number };\n};\n\nconst bus = new EventEmitter<AppEvents>();\nbus.on("login", (data) => console.log(data.userId)); // { userId: string }\nbus.emit("error", { message: "fail", code: 500 });\n\`\`\`\n\n### Key Takeaway\n\nMultiple type parameters model relationships between types. Keep the number minimal — if you need more than 3, consider a single object type instead.`,
    order_index: 4,
  },
  {
    id: "mitem_30",
    key: "assignment-generic-data-store",
    moduleKey: "generics",
    title: "Assignment 5 — Generic Data Store",
    type: "assignment",
    content_url: null,
    content_body: `## Assignment 5 — Generic Data Store\n\n### Objective\n\nPractice generics, generic constraints, and generic classes.\n\n### Requirements\n\n1. Create a generic \`DataStore<T extends { id: string | number }>\` class with:\n   - \`add(item: T): void\`\n   - \`findById(id: T["id"]): T | undefined\`\n   - \`findBy(predicate: (item: T) => boolean): T[]\`\n   - \`remove(id: T["id"]): boolean\`\n   - \`update(id: T["id"], updates: Partial<T>): T | undefined\`\n   - \`get all(): readonly T[]\`\n\n2. Create \`User\` and \`Product\` types, both with an \`id\` field.\n\n3. Demonstrate usage with both types — show that type safety is enforced.\n\n### Starter Code\n\n\`\`\`typescript\ninterface Identifiable {\n  id: string | number;\n}\n\nclass DataStore<T extends Identifiable> {\n  private items: T[] = [];\n  // TODO: implement all methods\n}\n\ntype User = { id: string; name: string; email: string };\ntype Product = { id: number; title: string; price: number };\n\`\`\`\n\n### Deliverables\n\n- \`data-store.ts\` that compiles with \`npx tsc --strict\`\n- At least one CRUD operation for User and one for Product\n\n### Hints\n\n- Use \`Partial<T>\` for the update parameter.\n- Use \`T["id"]\` to reference the id type generically.`,
    order_index: 5,
  },
  // ═══ Module 6 – Advanced Types (mitem_31 … mitem_36) ═══════════════════════
  {
    id: "mitem_31",
    key: "mapped-types",
    moduleKey: "advanced-types",
    title: "Mapped Types",
    type: "article",
    content_url: null,
    content_body: `## Mapped Types\n\nMapped types create new types by transforming every property in an existing type.\n\n### Basic Syntax\n\n\`\`\`typescript\ntype ReadOnly<T> = {\n  readonly [K in keyof T]: T[K];\n};\n\ntype User = { name: string; age: number };\ntype ReadOnlyUser = ReadOnly<User>;\n// { readonly name: string; readonly age: number }\n\`\`\`\n\n### Remapping Keys with as\n\nTypeScript 4.1+ lets you rename keys during mapping:\n\n\`\`\`typescript\ntype Getters<T> = {\n  [K in keyof T as \`get\${Capitalize<string & K>}\`]: () => T[K];\n};\n\ntype User = { name: string; age: number };\ntype UserGetters = Getters<User>;\n// { getName: () => string; getAge: () => number }\n\`\`\`\n\n### Filtering Keys with as\n\n\`\`\`typescript\ntype StringKeysOnly<T> = {\n  [K in keyof T as T[K] extends string ? K : never]: T[K];\n};\n\ntype Mixed = { name: string; age: number; email: string };\ntype Strings = StringKeysOnly<Mixed>;\n// { name: string; email: string }\n\`\`\`\n\n### Key Takeaway\n\nMapped types are the foundation of built-in utility types (\`Partial\`, \`Required\`, \`Readonly\`). They derive new types from existing ones without duplicating definitions.`,
    order_index: 0,
  },
  {
    id: "mitem_32",
    key: "conditional-types",
    moduleKey: "advanced-types",
    title: "Conditional Types",
    type: "article",
    content_url: null,
    content_body: `## Conditional Types\n\nConditional types create types that depend on a type-level condition.\n\n### Basic Conditional Type\n\n\`\`\`typescript\ntype IsString<T> = T extends string ? "yes" : "no";\n\ntype A = IsString<string>;  // "yes"\ntype B = IsString<number>;  // "no"\n\`\`\`\n\n### Distributive Conditional Types\n\nWhen checking a union, it distributes over each member:\n\n\`\`\`typescript\ntype ToArray<T> = T extends any ? T[] : never;\n\ntype Result = ToArray<string | number>;\n// string[] | number[]  (distributed)\n\`\`\`\n\n### Practical Example: Extracting Return Types\n\n\`\`\`typescript\ntype ReturnOf<F> = F extends (...args: any[]) => infer R ? R : never;\n\ntype Fn = () => string;\ntype R = ReturnOf<Fn>; // string\n\`\`\`\n\n### Conditional Types in Function Overloads\n\n\`\`\`typescript\ntype ParseResult<T> = T extends "json" ? object : T extends "text" ? string : unknown;\n\nfunction parse<T extends "json" | "text" | "unknown">(format: T, data: string): ParseResult<T> {\n  return JSON.parse(data) as ParseResult<T>;\n}\n\`\`\`\n\n### Key Takeaway\n\nConditional types express type-level logic. They are the backbone of advanced utility types and library internals.`,
    order_index: 1,
  },
  {
    id: "mitem_33",
    key: "utility-types",
    moduleKey: "advanced-types",
    title: "Utility Types",
    type: "article",
    content_url: null,
    content_body: `## Utility Types\n\nTypeScript ships with built-in utility types that transform existing types.\n\n### Partial<T> — All Properties Optional\n\n\`\`\`typescript\ntype User = { name: string; age: number; email: string };\ntype Updates = Partial<User>;\n// { name?: string; age?: number; email?: string }\n\nfunction updateUser(user: User, updates: Partial<User>): User {\n  return { ...user, ...updates };\n}\n\`\`\`\n\n### Required<T> — All Properties Required\n\n\`\`\`typescript\ntype Config = { host?: string; port?: number; debug?: boolean };\ntype StrictConfig = Required<Config>;\n// { host: string; port: number; debug: boolean }\n\`\`\`\n\n### Pick<T, K> — Subset of Properties\n\n\`\`\`typescript\ntype User = { name: string; age: number; email: string; password: string };\ntype PublicUser = Pick<User, "name" | "age" | "email">;\n// { name: string; age: number; email: string }\n\`\`\`\n\n### Omit<T, K> — Remove Properties\n\n\`\`\`typescript\ntype SafeUser = Omit<User, "password">;\n// { name: string; age: number; email: string }\n\`\`\`\n\n### Record<K, V> — Object Type\n\n\`\`\`typescript\ntype Roles = "admin" | "editor" | "viewer";\ntype RolePermissions = Record<Roles, string[]>;\n// { admin: string[]; editor: string[]; viewer: string[] }\n\`\`\`\n\n### Other Useful Utilities\n\n- \`Readonly<T>\` — Makes all properties readonly\n- \`ReturnType<F>\` — Extracts the return type of a function\n- \`Parameters<F>\` — Extracts parameter types as a tuple\n- \`NonNullable<T>\` — Removes null and undefined from T\n\n### Key Takeaway\n\nLearn the built-in utility types. Use \`Partial\` for updates, \`Pick\`/\`Omit\` for API shaping, and \`Record\` for typed dictionaries.`,
    order_index: 2,
  },
  {
    id: "mitem_34",
    key: "template-literal-types",
    moduleKey: "advanced-types",
    title: "Template Literal Types",
    type: "article",
    content_url: null,
    content_body: `## Template Literal Types\n\nTypeScript 4.1 introduced template literal types for string manipulation in the type system.\n\n### Basic Syntax\n\n\`\`\`typescript\ntype Greeting = \`hello \${string}\`;\n\nconst g1: Greeting = "hello world"; // OK\nconst g2: Greeting = "hi world";    // Error\n\`\`\`\n\n### Combining Literal Types\n\n\`\`\`typescript\ntype Vertical = "top" | "bottom";\ntype Horizontal = "left" | "right";\ntype Position = \`\${Vertical}-\${Horizontal}\`;\n// "top-left" | "top-right" | "bottom-left" | "bottom-right"\n\`\`\`\n\n### CSS Property Types\n\n\`\`\`typescript\ntype CssProperty = "margin" | "padding";\ntype CssDirection = "Top" | "Right" | "Bottom" | "Left";\ntype CssRule = \`\${CssProperty}\${CssDirection}\`;\n// "marginTop" | "marginRight" | ... | "paddingLeft"\n\`\`\`\n\n### String Manipulation Utilities\n\n\`\`\`typescript\ntype EventName<T extends string> = \`on\${Capitalize<T>}\`;\n\ntype ClickEvent = EventName<"click">; // "onClick"\ntype FocusEvent = EventName<"focus">; // "onFocus"\n\`\`\`\n\n### Key Takeaway\n\nTemplate literal types enable type-safe string patterns — event handlers, CSS properties, route parameters. They catch typos at compile time.`,
    order_index: 3,
  },
  {
    id: "mitem_35",
    key: "infer-keyword",
    moduleKey: "advanced-types",
    title: "infer Keyword and Type Inference",
    type: "article",
    content_url: null,
    content_body: `## infer Keyword and Type Inference\n\nThe \`infer\` keyword extracts types from within conditional types.\n\n### Basic Usage\n\n\`\`\`typescript\ntype ElementType<T> = T extends (infer E)[] ? E : never;\n\ntype A = ElementType<string[]>;   // string\ntype B = ElementType<number[]>;   // number\ntype C = ElementType<boolean>;    // never\n\`\`\`\n\n### Inferring Function Return Types\n\n\`\`\`typescript\ntype ReturnOf<T> = T extends (...args: any[]) => infer R ? R : never;\n\nfunction getString(): string { return "hello"; }\ntype R = ReturnOf<typeof getString>; // string\n\`\`\`\n\n### Inferring Function Parameters\n\n\`\`\`typescript\ntype FirstParam<T> = T extends (first: infer P, ...rest: any[]) => any ? P : never;\n\ntype P = FirstParam<(name: string, age: number) => void>; // string\n\`\`\`\n\n### Inferring Promise Values\n\n\`\`\`typescript\ntype UnwrapPromise<T> = T extends Promise<infer V> ? V : T;\n\ntype D = UnwrapPromise<Promise<string>>;  // string\ntype E = UnwrapPromise<number>;            // number\n\`\`\`\n\n### Nested Inference\n\n\`\`\`typescript\ntype UnwrapNested<T> = T extends Promise<infer V> ? UnwrapNested<V> : T;\n\ntype F = UnwrapNested<Promise<Promise<Promise<number>>>>; // number\n\`\`\`\n\n### Key Takeaway\n\nThe \`infer\` keyword is essential for advanced utility types. It lets you "destructure" types, extracting specific parts from complex type structures.`,
    order_index: 4,
  },
  {
    id: "mitem_36",
    key: "assignment-own-utility-types",
    moduleKey: "advanced-types",
    title: "Assignment 6 — Build Your Own Utility Types",
    type: "assignment",
    content_url: null,
    content_body: `## Assignment 6 — Build Your Own Utility Types\n\n### Objective\n\nImplement common utility types from scratch to deepen understanding of mapped types, conditional types, and \`infer\`.\n\n### Requirements\n\nImplement without using built-in equivalents:\n\n1. \`MyPartial<T>\` — All properties optional\n2. \`MyRequired<T>\` — All properties required\n3. \`MyReadonly<T>\` — All properties readonly\n4. \`MyPick<T, K>\` — Pick a subset of properties\n5. \`MyOmit<T, K>\` — Remove specified properties\n6. \`MyRecord<K, V>\` — Object type with keys K and values V\n7. \`MyReturnType<F>\` — Extract the return type of a function\n8. \`MyExclude<T, U>\` — Remove union members assignable to U\n\n### Validation\n\n\`\`\`typescript\ntype TestUser = { name: string; age: number; email: string };\n\n// These should be equivalent:\ntype A1 = Partial<TestUser>;\ntype A2 = MyPartial<TestUser>;\n\ntype B1 = Pick<TestUser, "name" | "email">;\ntype B2 = MyPick<TestUser, "name" | "email">;\n\ntype AssertEqual<X, Y> = X extends Y ? (Y extends X ? true : false) : false;\n\ntype T1 = AssertEqual<A1, A2>; // true\ntype T2 = AssertEqual<B1, B2>; // true\n\`\`\`\n\n### Deliverables\n\n- \`my-utility-types.ts\` that compiles with \`npx tsc --strict\`\n- At least 3 type-level assertions proving correctness\n\n### Hints\n\n- \`Partial\`: \`{ [K in keyof T]?: T[K] }\`\n- \`Exclude\`: \`T extends U ? never : T\`\n- \`ReturnType\`: \`F extends (...args: any[]) => infer R ? R : never\``,
    order_index: 5,
  },
  // ═══ Module 7 – Modules, Namespaces, and Project Config (mitem_37 … mitem_42) ═
  {
    id: "mitem_37",
    key: "es-modules-typescript",
    moduleKey: "modules-namespaces-config",
    title: "ES Modules in TypeScript",
    type: "article",
    content_url: null,
    content_body: `## ES Modules in TypeScript\n\n### Import and Export\n\n\`\`\`typescript\n// math.ts\nexport function add(a: number, b: number): number {\n  return a + b;\n}\n\nexport function multiply(a: number, b: number): number {\n  return a * b;\n}\n\nexport default class Calculator {\n  // ...\n}\n\`\`\`\n\n\`\`\`typescript\n// app.ts\nimport Calculator, { add, multiply } from "./math";\n\`\`\`\n\n### Module Resolution\n\nBased on the \`module\` and \`moduleResolution\` settings in tsconfig.json:\n\n- **NodeNext** — Recommended for modern Node.js. Respects package.json \`"type"\` field.\n- **Bundler** — For Vite, webpack, or esbuild.\n- **Node10** (legacy) — Older Node.js resolution.\n\n### Re-exports\n\n\`\`\`typescript\n// barrel.ts\nexport { add, multiply } from "./math";\nexport type { MathResult } from "./types";\n\`\`\`\n\n### Type-Only Imports\n\n\`\`\`typescript\nimport type { User } from "./models";\nimport { createUser } from "./services";\n\nfunction process(u: User): void { /* ... */ }\n\`\`\`\n\n### Key Takeaway\n\nUse ES module syntax. Set \`module: "NodeNext"\` for Node.js and use \`import type\` when you only need the type.`,
    order_index: 0,
  },
  {
    id: "mitem_38",
    key: "declaration-files-declare",
    moduleKey: "modules-namespaces-config",
    title: "Declaration Files and declare",
    type: "article",
    content_url: null,
    content_body: `## Declaration Files and declare\n\n### What Are Declaration Files?\n\nDeclaration files (\`.d.ts\`) provide type information for JavaScript code.\n\n### The declare Keyword\n\n\`\`\`typescript\n// globals.d.ts\ndeclare const API_URL: string;\ndeclare function gtag(command: string, ...params: unknown[]): void;\n\`\`\`\n\n### Ambient Module Declarations\n\n\`\`\`typescript\n// types/legacy-lib.d.ts\ndeclare module "legacy-lib" {\n  export function doStuff(input: string): number;\n  export const VERSION: string;\n}\n\`\`\`\n\n### The declare global Pattern\n\n\`\`\`typescript\n// env.d.ts\ndeclare global {\n  namespace NodeJS {\n    interface ProcessEnv {\n      NODE_ENV: "development" | "production" | "test";\n      DATABASE_URL: string;\n      PORT?: string;\n    }\n  }\n}\n\nexport {};\n\`\`\`\n\n### Key Takeaway\n\nUse \`.d.ts\` files for JavaScript code types. Use \`declare\` for globals and ambient modules. Use \`declare global\` to augment the global scope.`,
    order_index: 1,
  },
  {
    id: "mitem_39",
    key: "tsconfig-deep-dive",
    moduleKey: "modules-namespaces-config",
    title: "tsconfig.json Deep Dive",
    type: "article",
    content_url: null,
    content_body: `## tsconfig.json Deep Dive\n\n### Essential Compiler Options\n\n\`\`\`json\n{\n  "compilerOptions": {\n    "target": "ES2022",\n    "module": "NodeNext",\n    "moduleResolution": "NodeNext",\n    "strict": true,\n    "outDir": "./dist",\n    "rootDir": "./src",\n    "esModuleInterop": true,\n    "skipLibCheck": true,\n    "forceConsistentCasingInFileNames": true,\n    "resolveJsonModule": true,\n    "declaration": true,\n    "declarationMap": true,\n    "sourceMap": true\n  }\n}\n\`\`\`\n\n### What Each Flag Does\n\n- **target** — JS version to emit. \`ES2022\` supports top-level await.\n- **module** — Module system for output. \`NodeNext\` respects package.json.\n- **strict** — Enables all strict checks (\`strictNullChecks\`, \`noImplicitAny\`, etc.).\n- **esModuleInterop** — Compatibility helpers for CommonJS imports.\n- **declaration** — Generates \`.d.ts\` files.\n- **declarationMap** — Source maps for declarations.\n- **sourceMap** — \`.map\` files for debugging.\n\n### Strict Mode Sub-Flags\n\nWhen \`strict: true\` is on, these are all enabled:\n\n- \`strictNullChecks\` — null/undefined are separate types\n- \`noImplicitAny\` — Error on implicit \`any\`\n- \`strictFunctionTypes\` — Contravariant parameter checking\n- \`strictBindCallApply\` — Strict checking of bind/call/apply\n- \`noImplicitThis\` — Error on \`this\` with implicit \`any\`\n\n### Key Takeaway\n\nAlways use \`"strict": true\`. Set \`target\` and \`module\` to match your runtime. Enable \`declaration\` and \`sourceMap\` for library and debugging workflows.`,
    order_index: 2,
  },
  {
    id: "mitem_40",
    key: "definitely-typed",
    moduleKey: "modules-namespaces-config",
    title: "Using Type Definitions from DefinitelyTyped",
    type: "article",
    content_url: null,
    content_body: `## Using Type Definitions from DefinitelyTyped\n\n### What Is DefinitelyTyped?\n\nA repository of high-quality type definitions for thousands of JS libraries, published as \`@types/*\` packages on npm.\n\n### Installing Type Definitions\n\n\`\`\`bash\nnpm install -D @types/express\nnpm install -D @types/jest\nnpm install -D @types/node\n\`\`\`\n\n### How It Works\n\nInstall \`@types/express\` and TypeScript automatically picks up the types. The \`typeRoots\` and \`types\` options control where TypeScript looks:\n\n\`\`\`json\n{\n  "compilerOptions": {\n    "typeRoots": ["./node_modules/@types"],\n    "types": ["node", "jest"]\n  }\n}\n\`\`\`\n\n### Libraries With Built-In Types\n\nMany modern libraries ship their own types — no \`@types\` needed:\n\n- **zod** — Built-in TypeScript types\n- **axios** — Built-in TypeScript types\n- **react** — Built-in TypeScript types\n- **drizzle-orm** — Built-in TypeScript types\n\nCheck the library's docs before installing \`@types\`.\n\n### Key Takeaway\n\nInstall \`@types/*\` for libraries that lack built-in types. Modern libraries increasingly include their own types — check first.`,
    order_index: 3,
  },
  {
    id: "mitem_41",
    key: "project-references-monorepo",
    moduleKey: "modules-namespaces-config",
    title: "Project References and Monorepo Basics",
    type: "article",
    content_url: null,
    content_body: `## Project References and Monorepo Basics\n\n### Why Project References?\n\nIn large codebases, compiling everything at once is slow. Project references let TypeScript build only what changed.\n\n### Setting Up a Monorepo\n\n\`\`\`\nmonorepo/\n├── packages/\n│   ├── shared/\n│   │   ├── tsconfig.json\n│   │   └── src/\n│   ├── api/\n│   │   ├── tsconfig.json\n│   │   └── src/\n│   └── web/\n│       ├── tsconfig.json\n│       └── src/\n└── tsconfig.json\n\`\`\`\n\n### Configuring Project References\n\n**packages/shared/tsconfig.json:**\n\`\`\`json\n{\n  "compilerOptions": { "composite": true, "declaration": true, "outDir": "./dist" }\n}\n\`\`\`\n\n**packages/api/tsconfig.json:**\n\`\`\`json\n{\n  "compilerOptions": { "composite": true, "declaration": true, "outDir": "./dist" },\n  "references": [{ "path": "../shared" }]\n}\n\`\`\`\n\n### Building with References\n\n\`\`\`bash\nnpx tsc --build             # Build everything in dependency order\nnpx tsc --build --incremental  # Only changed packages\nnpx tsc --build --clean       # Clean build\n\`\`\`\n\n### Key Takeaway\n\nProject references enable incremental, dependency-aware builds in monorepos. Set \`"composite": true\` and use \`npx tsc --build\`.`,
    order_index: 4,
  },
  {
    id: "mitem_42",
    key: "assignment-modularize-codebase",
    moduleKey: "modules-namespaces-config",
    title: "Assignment 7 — Modularize the Codebase",
    type: "assignment",
    content_url: null,
    content_body: `## Assignment 7 — Modularize the Codebase\n\n### Objective\n\nPractice ES module imports/exports, declaration files, and tsconfig configuration.\n\n### Requirements\n\n1. Given a monolithic file, split it into modules:\n\n\`\`\`typescript\n// Original: everything.ts\ntype User = { id: string; name: string; email: string };\ntype Product = { id: number; title: string; price: number };\n\nfunction createUser(name: string, email: string): User { /* ... */ }\nfunction findUser(users: User[], id: string): User | undefined { /* ... */ }\nfunction formatPrice(product: Product): string { /* ... */ }\n\nconst API_URL = "https://api.example.com";\nasync function fetchProducts(): Promise<Product[]> { /* ... */ }\n\`\`\`\n\n2. Create this structure:\n   - \`src/types/user.ts\` — User type\n   - \`src/types/product.ts\` — Product type\n   - \`src/services/user-service.ts\` — createUser, findUser\n   - \`src/services/product-service.ts\` — formatPrice, fetchProducts\n   - \`src/config.ts\` — API_URL and config constants\n   - \`src/index.ts\` — Main entry re-exporting everything\n\n3. Create \`src/types/env.d.ts\` for \`API_URL\` as a global constant.\n\n4. Configure \`tsconfig.json\` with strict, rootDir, outDir, and declaration.\n\n### Deliverables\n\n- Modular file structure with proper import/export\n- \`tsc --build\` compiles without errors\n- A \`dist/\` output with \`.js\`, \`.d.ts\`, and \`.map\` files\n\n### Hints\n\n- Use \`export type\` for type-only exports\n- Use barrel files (\`index.ts\`) to simplify imports\n- Use \`declare const\` in \`.d.ts\` for environment variables`,
    order_index: 5,
  },
  // ═══ Module 8 – TypeScript with Asynchronous Code (mitem_43 … mitem_48) ═══
  {
    id: "mitem_43",
    key: "typing-promises-async-await",
    moduleKey: "async-typescript",
    title: "Typing Promises and async/await",
    type: "article",
    content_url: null,
    content_body: `## Typing Promises and async/await\n\n### Promise<T>\n\nEvery promise has an inner type. \`Promise<T>\` resolves to a value of type \`T\`:\n\n\`\`\`typescript\nfunction fetchUser(id: string): Promise<{ name: string; email: string }> {\n  return fetch(\`/api/users/\${id}\`).then(res => res.json());\n}\n\`\`\`\n\n### async Functions\n\nAn \`async\` function always returns a \`Promise\`:\n\n\`\`\`typescript\nasync function getUser(id: string): Promise<User> {\n  const res = await fetch(\`/api/users/\${id}\`);\n  return res.json() as Promise<User>;\n}\n\`\`\`\n\n### Awaiting Multiple Promises\n\n\`\`\`typescript\nasync function loadDashboard() {\n  const [users, products] = await Promise.all([\n    fetchUsers(),\n    fetchProducts(),\n  ]);\n  // users: User[], products: Product[]\n}\n\`\`\`\n\n### Handling Errors\n\n\`\`\`typescript\nasync function safeFetch(url: string): Promise<Response | null> {\n  try {\n    return await fetch(url);\n  } catch (error) {\n    console.error("Fetch failed:", error);\n    return null;\n  }\n}\n\`\`\`\n\n### Key Takeaway\n\nAlways type the resolved value of \`Promise<T>\`. Use \`async\`/\`await\` for sequential code and \`Promise.all\` for parallel.`,
    order_index: 0,
  },
  {
    id: "mitem_44",
    key: "error-handling-patterns",
    moduleKey: "async-typescript",
    title: "Error Handling Patterns",
    type: "article",
    content_url: null,
    content_body: `## Error Handling Patterns\n\n### Typed Error Responses\n\nNever throw — always return a typed result:\n\n\`\`\`typescript\ntype Result<T> =\n  | { ok: true; data: T }\n  | { ok: false; error: Error };\n\nasync function fetchUser(id: string): Promise<Result<User>> {\n  try {\n    const res = await fetch(\`/api/users/\${id}\`);\n    if (!res.ok) return { ok: false, error: new Error(\`HTTP \${res.status}\`) };\n    const data = await res.json();\n    return { ok: true, data };\n  } catch (error) {\n    return { ok: false, error: error instanceof Error ? error : new Error(String(error)) };\n  }\n}\n\`\`\`\n\n### Custom Error Classes\n\n\`\`\`typescript\nclass ValidationError extends Error {\n  constructor(public field: string, message: string) {\n    super(message);\n    this.name = "ValidationError";\n  }\n}\n\nclass NotFoundError extends Error {\n  constructor(resource: string, id: string) {\n    super(\`\${resource} with id \${id} not found\`);\n    this.name = "NotFoundError";\n  }\n}\n\`\`\`\n\n### Error Narrowing in Catch\n\n\`\`\`typescript\ntry {\n  await riskyOperation();\n} catch (error) {\n  if (error instanceof ValidationError) {\n    console.error(\`Invalid field: \${error.field}\`);\n  } else if (error instanceof Error) {\n    console.error(error.message);\n  } else {\n    console.error("Unknown error:", error);\n  }\n}\n\`\`\`\n\n### Key Takeaway\n\nPrefer returning \`Result<T>\` over throwing for expected failures. Use custom error classes for domain errors. Always narrow caught values.`,
    order_index: 1,
  },
  {
    id: "mitem_45",
    key: "typing-fetch-api-responses",
    moduleKey: "async-typescript",
    title: "Typing fetch and API Responses",
    type: "article",
    content_url: null,
    content_body: `## Typing fetch and API Responses\n\n### Typing Responses\n\n\`\`\`typescript\ninterface User {\n  id: string;\n  name: string;\n  email: string;\n}\n\nasync function getUser(id: string): Promise<User> {\n  const res = await fetch(\`/api/users/\${id}\`);\n  if (!res.ok) throw new Error(\`HTTP \${res.status}\`);\n  return res.json() as Promise<User>;\n}\n\`\`\`\n\n### A Typed fetch Wrapper\n\n\`\`\`typescript\nasync function typedFetch<T>(url: string, options?: RequestInit): Promise<T> {\n  const res = await fetch(url, options);\n  if (!res.ok) {\n    const body = await res.text();\n    throw new Error(\`HTTP \${res.status}: \${body}\`);\n  }\n  return res.json() as Promise<T>;\n}\n\nconst user = await typedFetch<User>("/api/users/1");\n\`\`\`\n\n### Typing Request Bodies\n\n\`\`\`typescript\nasync function createUser(data: { name: string; email: string }): Promise<User> {\n  return typedFetch<User>("/api/users", {\n    method: "POST",\n    headers: { "Content-Type": "application/json" },\n    body: JSON.stringify(data),\n  });\n}\n\`\`\`\n\n### Error Handling in fetch\n\n\`\`\`typescript\ntype ApiError = { status: number; message: string; details?: unknown };\n\nasync function safeFetch<T>(url: string): Promise<{ data: T } | { error: ApiError }> {\n  try {\n    const res = await fetch(url);\n    if (!res.ok) return { error: await res.json() as ApiError };\n    return { data: await res.json() as T };\n  } catch {\n    return { error: { status: 0, message: "Network error" } };\n  }\n}\n\`\`\`\n\n### Key Takeaway\n\n\`fetch\` is untyped — always parse into a known type. Create a typed wrapper to reduce boilerplate and enforce consistent error handling.`,
    order_index: 2,
  },
  {
    id: "mitem_46",
    key: "third-party-async-libraries",
    moduleKey: "async-typescript",
    title: "Working with Third-Party Async Libraries",
    type: "article",
    content_url: null,
    content_body: `## Working with Third-Party Async Libraries\n\n### Callback-to-Promise Wrapping\n\n\`\`\`typescript\nimport { readFile } from "fs";\n\nfunction readFileAsync(path: string): Promise<string> {\n  return new Promise((resolve, reject) => {\n    readFile(path, "utf-8", (err, data) => {\n      if (err) reject(err);\n      else resolve(data);\n    });\n  });\n}\n\`\`\`\n\n### Using promisify\n\n\`\`\`typescript\nimport { promisify } from "util";\nimport { readFile } from "fs";\n\nconst readFileAsync = promisify(readFile);\nconst content = await readFileAsync("file.txt", "utf-8");\n\`\`\`\n\n### Typing Event-Based Libraries\n\n\`\`\`typescript\ninterface SocketEvents {\n  connect: void;\n  message: { from: string; text: string };\n  disconnect: { reason: string };\n}\n\nfunction on<K extends keyof SocketEvents>(\n  event: K,\n  handler: (data: SocketEvents[K]) => void,\n): void {\n  // ...\n}\n\`\`\`\n\n### Libraries With Built-In Types\n\n- **axios** — \`AxiosResponse<T>\`, \`AxiosError\`\n- **socket.io** — Typed event emitters\n- **drizzle-orm** — Fully typed query builder\n- **zod** — Runtime validation with type inference\n\n### Key Takeaway\n\nWrap callbacks in promises. Use \`promisify\` for simple cases. Prefer libraries that ship their own types.`,
    order_index: 3,
  },
  {
    id: "mitem_47",
    key: "cancellation-timeout-patterns",
    moduleKey: "async-typescript",
    title: "Cancellation and Timeout Patterns",
    type: "article",
    content_url: null,
    content_body: `## Cancellation and Timeout Patterns\n\n### AbortController\n\n\`\`\`typescript\nasync function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {\n  const controller = new AbortController();\n  const timeout = setTimeout(() => controller.abort(), timeoutMs);\n\n  try {\n    const res = await fetch(url, { signal: controller.signal });\n    return res;\n  } finally {\n    clearTimeout(timeout);\n  }\n}\n\`\`\`\n\n### Promise.race for Timeouts\n\n\`\`\`typescript\nfunction withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {\n  const timeout = new Promise<never>((_, reject) =>\n    setTimeout(() => reject(new Error(\`Timed out after \${ms}ms\`)), ms)\n  );\n  return Promise.race([promise, timeout]);\n}\n\nconst user = await withTimeout(fetchUser("1"), 5000);\n\`\`\`\n\n### AbortController with async/await\n\n\`\`\`typescript\nasync function loadData(urls: string[], signal?: AbortSignal) {\n  const results = await Promise.all(\n    urls.map(url => fetch(url, { signal }))\n  );\n  return Promise.all(results.map(r => r.json()));\n}\n\n// Usage\nconst controller = new AbortController();\nconst data = loadData(["/api/a", "/api/b"], controller.signal);\ncontroller.abort(); // Cancel if component unmounts\n\`\`\`\n\n### Key Takeaway\n\nUse \`AbortController\` for cancellable fetch requests. Use \`Promise.race\` for timeout patterns. Always clean up timeouts to prevent memory leaks.`,
    order_index: 4,
  },
  {
    id: "mitem_48",
    key: "assignment-weather-dashboard",
    moduleKey: "async-typescript",
    title: "Assignment 8 — Typed Weather Dashboard",
    type: "assignment",
    content_url: null,
    content_body: `## Assignment 8 — Typed Weather Dashboard\n\n### Objective\n\nPractice async/await, fetch typing, error handling patterns, and abort controllers.\n\n### Requirements\n\n1. Define types for weather API responses:\n   - \`WeatherResponse\` with \`location\`, \`current\` (temperature, humidity, condition), and \`forecast\` (5-day array)\n   - \`ForecastDay\` with \`date\`, \`high\`, \`low\`, \`condition\`\n\n2. Create a typed API client:\n   - \`fetchWeather(city: string): Promise<WeatherResponse>\`\n   - \`fetchWeatherWithTimeout(city: string, ms: number): Promise<WeatherResponse>\`\n\n3. Implement error handling:\n   - Return \`Result<WeatherResponse>\` instead of throwing\n   - Handle network errors, timeouts, and 404s distinctly\n\n4. Create a \`WeatherDashboard\` class that:\n   - Stores cached weather data (Map<string, WeatherResponse>)\n   - Has \`getWeather(city: string)\` that checks cache first\n   - Has \`clearCache()\` and \`getCachedCities(): string[]\`\n\n5. Use \`AbortController\` in at least one method.\n\n### Starter Code\n\n\`\`\`typescript\ntype WeatherResponse = {\n  location: string;\n  current: { temperature: number; humidity: number; condition: string };\n  forecast: ForecastDay[];\n};\n\ntype ForecastDay = {\n  date: string;\n  high: number;\n  low: number;\n  condition: string;\n};\n\n// TODO: Implement API client and dashboard\n\`\`\`\n\n### Deliverables\n\n- \`weather-dashboard.ts\` that compiles with \`npx tsc --strict\`\n- Demonstrate fetching, caching, and error handling\n\n### Hints\n\n- Use \`Promise.race\` for the timeout pattern.\n- The Result type: \`type Result<T> = { ok: true; data: T } | { ok: false; error: Error }\`.\n- Cache key: normalize city names with \`.toLowerCase().trim()\`.`,
    order_index: 5,
  },
  // ═══ Module 9 – TypeScript in Real-World Frameworks (mitem_49 … mitem_54) ══
  {
    id: "mitem_49",
    key: "typescript-with-react",
    moduleKey: "real-world-frameworks",
    title: "TypeScript with React",
    type: "article",
    content_url: null,
    content_body: `## TypeScript with React\n\n### Functional Components with Props\n\n\`\`\`typescript\ntype GreetingProps = {\n  name: string;\n  age?: number;\n};\n\nfunction Greeting({ name, age }: GreetingProps): JSX.Element {\n  return (\n    <div>\n      <h1>Hello, {name}</h1>\n      {age && <p>Age: {age}</p>}\n    </div>\n  );\n}\n\`\`\`\n\n### Typing Hooks\n\n\`\`\`typescript\nconst [count, setCount] = useState<number>(0);\nconst [user, setUser] = useState<User | null>(null);\n\nconst inputRef = useRef<HTMLInputElement>(null);\n\nuseEffect(() => {\n  document.title = \`Count: \${count}\`;\n}, [count]);\n\`\`\`\n\n### Event Handlers\n\n\`\`\`typescript\nfunction handleSubmit(e: React.FormEvent<HTMLFormElement>) {\n  e.preventDefault();\n}\n\nfunction handleChange(e: React.ChangeEvent<HTMLInputElement>) {\n  console.log(e.target.value);\n}\n\`\`\`\n\n### Generic Components\n\n\`\`\`typescript\nfunction List<T extends { id: string | number }>({\n  items,\n  renderItem,\n}: {\n  items: T[];\n  renderItem: (item: T) => JSX.Element;\n}) {\n  return <ul>{items.map(renderItem)}</ul>;\n}\n\`\`\`\n\n### Key Takeaway\n\nType your props explicitly. Use \`useState<User | null>(null)\` for nullable state. Type event handlers with React's built-in event types.`,
    order_index: 0,
  },
  {
    id: "mitem_50",
    key: "typescript-node-express",
    moduleKey: "real-world-frameworks",
    title: "TypeScript with Node.js/Express",
    type: "article",
    content_url: null,
    content_body: `## TypeScript with Node.js/Express\n\n### Typing Request and Response\n\n\`\`\`typescript\nimport { Request, Response } from "express";\n\ninterface GetUserRequest extends Request {\n  params: { id: string };\n}\n\nasync function getUser(req: GetUserRequest, res: Response): Promise<void> {\n  const user = await findUser(req.params.id);\n  if (!user) {\n    res.status(404).json({ error: "User not found" });\n    return;\n  }\n  res.json(user);\n}\n\`\`\`\n\n### Typed Middleware\n\n\`\`\`typescript\nimport { Request, Response, NextFunction } from "express";\n\ntype AsyncHandler = (\n  req: Request,\n  res: Response,\n  next: NextFunction,\n) => Promise<void>;\n\nconst asyncHandler = (fn: AsyncHandler) => (req: Request, res: Response, next: NextFunction) => {\n  fn(req, res, next).catch(next);\n};\n\`\`\`\n\n### Typed Request Bodies\n\n\`\`\`typescript\ninterface CreateUserBody {\n  name: string;\n  email: string;\n  age?: number;\n}\n\napp.post("/users", async (req: Request<{}, {}, CreateUserBody>, res: Response) => {\n  const { name, email, age } = req.body;\n  // body is typed as CreateUserBody\n});\n\`\`\`\n\n### Key Takeaway\n\nExtend Express's Request interface for typed params, bodies, and query strings. Use \`AsyncHandler\` for consistent error propagation.`,
    order_index: 1,
  },
  {
    id: "mitem_51",
    key: "typing-env-variables",
    moduleKey: "real-world-frameworks",
    title: "Typing Environment Variables and Config",
    type: "article",
    content_url: null,
    content_body: `## Typing Environment Variables and Config\n\n### The Problem\n\n\`process.env\` is typed as \`Record<string, string | undefined>\` by default. Every access requires null checks.\n\n### Solution 1: declare global\n\n\`\`\`typescript\n// env.d.ts\ndeclare global {\n  namespace NodeJS {\n    interface ProcessEnv {\n      NODE_ENV: "development" | "production" | "test";\n      DATABASE_URL: string;\n      PORT?: string;\n      API_SECRET: string;\n    }\n  }\n}\nexport {};\n\`\`\`\n\nNow \`process.env.DATABASE_URL\` is typed as \`string\`.\n\n### Solution 2: Config Object\n\n\`\`\`typescript\nconst config = {\n  nodeEnv: process.env.NODE_ENV ?? "development",\n  port: parseInt(process.env.PORT ?? "3000", 10),\n  databaseUrl: process.env.DATABASE_URL,\n  apiSecret: process.env.API_SECRET,\n} as const;\n\ntype Config = typeof config;\n\`\`\`\n\n### Solution 3: Zod Validation\n\n\`\`\`typescript\nimport { z } from "zod";\n\nconst envSchema = z.object({\n  NODE_ENV: z.enum(["development", "production", "test"]),\n  DATABASE_URL: z.string().url(),\n  PORT: z.coerce.number().default(3000),\n});\n\nconst env = envSchema.parse(process.env);\n// Fully typed and validated at startup\n\`\`\`\n\n### Key Takeaway\n\nUse \`declare global\` for quick type safety. Use a config object for grouped access. Use Zod for runtime validation at startup.`,
    order_index: 2,
  },
  {
    id: "mitem_52",
    key: "validation-libraries-zod-yup",
    moduleKey: "real-world-frameworks",
    title: "Validation Libraries (Zod/Yup)",
    type: "article",
    content_url: null,
    content_body: `## Validation Libraries (Zod/Yup)\n\n### Why Validate at Runtime?\n\nTypeScript types are erased at runtime. External data (APIs, forms, files) must be validated when it enters your system.\n\n### Zod Basics\n\n\`\`\`typescript\nimport { z } from "zod";\n\nconst UserSchema = z.object({\n  id: z.string().uuid(),\n  name: z.string().min(2),\n  email: z.string().email(),\n  age: z.number().int().positive().optional(),\n  role: z.enum(["admin", "user"]),\n});\n\ntype User = z.infer<typeof UserSchema>;\n// { id: string; name: string; email: string; age?: number; role: "admin" | "user" }\n\`\`\`\n\n### Validating External Data\n\n\`\`\`typescript\nasync function fetchUser(id: string): Promise<User> {\n  const res = await fetch(\`/api/users/\${id}\`);\n  const json = await res.json();\n  return UserSchema.parse(json); // Throws if invalid\n}\n\n// Safe parsing (returns result instead of throwing)\nconst result = UserSchema.safeParse(json);\nif (result.success) {\n  console.log(result.data); // typed as User\n} else {\n  console.error(result.error.issues);\n}\n\`\`\`\n\n### Zod in Express Middleware\n\n\`\`\`typescript\nfunction validateBody<T extends z.ZodType>(schema: T) {\n  return (req: Request, res: Response, next: NextFunction) => {\n    const result = schema.safeParse(req.body);\n    if (!result.success) {\n      res.status(400).json({ errors: result.error.issues });\n      return;\n    }\n    req.body = result.data;\n    next();\n  };\n}\n\`\`\`\n\n### Key Takeaway\n\nUse Zod schemas as the single source of truth for both validation and TypeScript types. Validate external data at system boundaries.`,
    order_index: 3,
  },
  {
    id: "mitem_53",
    key: "testing-typed-code",
    moduleKey: "real-world-frameworks",
    title: "Testing Typed Code",
    type: "article",
    content_url: null,
    content_body: `## Testing Typed Code\n\n### Jest with TypeScript\n\n\`\`\`typescript\ndescribe("DataStore", () => {\n  let store: DataStore<User>;\n\n  beforeEach(() => {\n    store = new DataStore();\n  });\n\n  it("should add and find items", () => {\n    const user: User = { id: "1", name: "Alice", email: "alice@test.com" };\n    store.add(user);\n    expect(store.findById("1")).toEqual(user);\n  });\n\n  it("should return undefined for missing items", () => {\n    expect(store.findById("nonexistent")).toBeUndefined();\n  });\n});\n\`\`\`\n\n### Typing Mock Functions\n\n\`\`\`typescript\nconst mockFetch = jest.fn<Promise<Response>, [string, RequestInit?]>();\n\n// Or with vi.fn() in Vitest\nconst mockFetch = vi.fn<() => Promise<Response>>();\n\`\`\`\n\n### Typing Test Helpers\n\n\`\`\`typescript\nfunction createTestUser(overrides?: Partial<User>): User {\n  return {\n    id: crypto.randomUUID(),\n    name: "Test User",\n    email: "test@example.com",\n    ...overrides,\n  };\n}\n\`\`\`\n\n### Type-Level Testing\n\n\`\`\`typescript\ntype Expect<T extends true> = T;\ntype Equal<X, Y> = (<T>() => T extends X ? 1 : 2) extends (<T>() => T extends Y ? 1 : 2) ? true : false;\n\ntype test1 = Expect<Equal<ReturnType<typeof add>, number>>;\n\`\`\`\n\n### Key Takeaway\n\nUse TypeScript in your test files for type safety. Type mock functions explicitly. Use \`Partial<T>\` for test data factories with optional overrides.`,
    order_index: 4,
  },
  {
    id: "mitem_54",
    key: "assignment-full-stack-mini-app",
    moduleKey: "real-world-frameworks",
    title: "Assignment 9 — Full-Stack Mini App",
    type: "assignment",
    content_url: null,
    content_body: `## Assignment 9 — Full-Stack Mini App\n\n### Objective\n\nCombine everything learned so far by building a full-stack mini application with TypeScript on both frontend and backend.\n\n### Requirements\n\n**Backend (Node.js/Express):**\n1. Define a \`Todo\` type with \`id\`, \`title\`, \`completed\`, and \`createdAt\`\n2. Create typed routes:\n   - \`GET /api/todos\` — returns \`Todo[]\`\n   - \`POST /api/todos\` — creates a new todo, validates with Zod\n   - \`PATCH /api/todos/:id\` — toggles completion\n   - \`DELETE /api/todos/:id\` — removes a todo\n3. Use a typed in-memory store (Map<string, Todo>)\n4. Add typed error handling middleware\n\n**Frontend (vanilla TS or React):**\n1. Type all API responses\n2. Create a typed API client module\n3. Display todos in a list with toggle and delete buttons\n4. Add a form for creating new todos with validation\n\n### Starter Code\n\n\`\`\`typescript\n// Backend types\nimport { z } from "zod";\n\nconst TodoSchema = z.object({\n  id: z.string().uuid(),\n  title: z.string().min(1).max(200),\n  completed: z.boolean(),\n  createdAt: z.string().datetime(),\n});\n\ntype Todo = z.infer<typeof TodoSchema>;\n\nconst CreateTodoSchema = TodoSchema.omit({ id: true, createdAt: true });\n\`\`\`\n\n### Deliverables\n\n- Backend: \`server.ts\` with Express routes and Zod validation\n- Frontend: \`client.ts\` with typed API calls\n- \`tsconfig.json\` configured for both\n- At least 5 test cases covering CRUD operations\n\n### Hints\n\n- Use \`z.infer<typeof Schema>\` to derive types from Zod schemas.\n- Use \`Request<{}, {}, CreateTodoBody>\` for typed Express request bodies.\n- Store todos in a \`Map<string, Todo>\` for O(1) lookups.`,
    order_index: 5,
  },
  // ═══ Module 10 – Capstone Project (mitem_55 … mitem_60) ════════════════════
  {
    id: "mitem_55",
    key: "project-planning-type-driven",
    moduleKey: "capstone-project",
    title: "Project Planning and Type-Driven Design",
    type: "article",
    content_url: null,
    content_body: `## Project Planning and Type-Driven Design

### Design-First Approach

Before writing implementation code, define the types that model your domain. Types are your blueprint.

### Start with Types

\`\`\`typescript
type User = { id: string; name: string; email: string; role: UserRole };
type UserRole = "admin" | "editor" | "viewer";

type Article = {
  id: string;
  title: string;
  content: string;
  authorId: string;
  status: ArticleStatus;
  publishedAt?: string;
};

type ArticleStatus = "draft" | "review" | "published" | "archived";
\`\`\`

### Model Relationships

\`\`\`typescript
type UserRepository = {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(data: Omit<User, "id">): Promise<User>;
  update(id: string, data: Partial<User>): Promise<User>;
};
\`\`\`

### Benefits

- Types reveal design flaws before implementation begins.
- Interfaces allow swapping implementations (in-memory, database, mock).
- The team shares a common vocabulary.

### Key Takeaway

Define types first, implement second. Use interfaces for major boundaries to enable testing and future flexibility.`,
    order_index: 0,
  },
  {
    id: "mitem_56",
    key: "architecture-review",
    moduleKey: "capstone-project",
    title: "Architecture Review Session",
    type: "article",
    content_url: null,
    content_body: `## Architecture Review Session

### Layered Architecture

Most TypeScript applications follow a layered pattern:

\`\`\`
\u250c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510
\u2502     Presentation Layer      \u2502  (React, Express routes)
\u251c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2524
\u2502      Service Layer          \u2502  (Business logic)
\u251c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2524
\u2502    Repository Layer         \u2502  (Data access)
\u251c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2524
\u2502       Domain Layer          \u2502  (Types, interfaces)
\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518
\`\`\`

### Separation of Concerns

- **Domain** — Pure types and interfaces. No imports from other layers.
- **Repository** — Implements data access. Depends only on domain.
- **Service** — Business logic. Depends on domain and repository interfaces.
- **Presentation** — UI or API routes. Depends on services.

### Anti-Patterns to Avoid

- Circular dependencies between modules
- Business logic in route handlers or components
- Direct database access in service layer
- God objects that hold too many responsibilities

### Key Takeaway

Keep layers independent. The domain layer should have zero external imports. Services depend on interfaces, not implementations.`,
    order_index: 1,
  },
  {
    id: "mitem_57",
    key: "code-review-best-practices",
    moduleKey: "capstone-project",
    title: "Code Review Best Practices for TS Projects",
    type: "article",
    content_url: null,
    content_body: `## Code Review Best Practices for TS Projects

### TypeScript-Specific Review Items

1. **No \`any\` in production code** — Flag every \`any\` and ask for a proper type.
2. **Explicit return types on exported functions** — Catches regressions and documents intent.
3. **Discriminated unions over loose type assertions** — Prefer \`as\` assertions only as a last resort.
4. **Proper null handling** — Check that optional values are handled before use.

### Review Checklist

\`\`\`markdown
- [ ] No \`any\` types
- [ ] All exported functions have return types
- [ ] Error handling is typed (Result pattern or typed throws)
- [ ] External data is validated at boundaries (Zod schemas)
- [ ] No circular dependencies
- [ ] Types are in shared modules, not duplicated
- [ ] Tests cover the type-level contracts
- [ ] No \`@ts-ignore\` or \`@ts-expect-error\` without justification
\`\`\`

### Naming Conventions

- Interfaces: PascalCase, no \`I\` prefix (use \`User\`, not \`IUser\`)
- Type aliases: PascalCase for objects and unions
- Enums: PascalCase names, PascalCase members
- Boolean variables: \`is\`, \`has\`, \`should\` prefix

### Key Takeaway

Treat types as part of the API contract. Review them with the same rigor as implementation logic. Eliminate \`any\` and validate at boundaries.`,
    order_index: 2,
  },
  {
    id: "mitem_58",
    key: "deployment-build-optimization",
    moduleKey: "capstone-project",
    title: "Deployment and Build Optimization",
    type: "article",
    content_url: null,
    content_body: `## Deployment and Build Optimization

### tsc --build for Incremental Compilation

\`\`\`bash
npx tsc --build --incremental
\`\`\`

Only recompiles files that changed and their dependents.

### Declaration Files for Libraries

\`\`\`json
{
  "compilerOptions": {
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
\`\`\`

### Bundling Considerations

When bundling with webpack, Vite, or esbuild:

- Set \`"moduleResolution": "bundler"\` in tsconfig for bundler environments.
- Use \`import type\` to ensure type-only imports are erased.
- Tree-shaking works better when exports are named, not default.

### Production Checklist

\`\`\`bash
npx tsc --noEmit        # Type check without emitting
npx eslint src/ --ext .ts,.tsx  # Lint
npx tsc --build         # Build
npx jest --coverage     # Test
\`\`\`

### Environment-Specific Configs

\`\`\`json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "noEmit": false,
    "declaration": true,
    "sourceMap": true
  },
  "exclude": ["**/*.test.ts", "**/*.spec.ts", "**/node_modules"]
}
\`\`\`

### Key Takeaway

Use incremental builds. Generate declarations for library packages. Use \`--noEmit\` for CI type-checking.`,
    order_index: 3,
  },
  {
    id: "mitem_59",
    key: "final-presentation-guidelines",
    moduleKey: "capstone-project",
    title: "Final Presentation Guidelines",
    type: "article",
    content_url: null,
    content_body: `## Final Presentation Guidelines

### What to Present

1. **Problem Statement** — What does your capstone project solve?
2. **Type-Driven Design** — Show how types shaped your architecture.
3. **Live Demo** — Walk through the working application.
4. **Code Walkthrough** — Highlight key TypeScript patterns used.
5. **Lessons Learned** — What was challenging and how you solved it.

### Structure (15-20 minutes)

- **2 min** — Introduction and motivation
- **3 min** — Architecture overview with type diagrams
- **5 min** — Live demo of core features
- **5 min** — Code walkthrough showing key TypeScript patterns
- **3 min** — Challenges, trade-offs, and what you'd do differently
- **2 min** — Q&A

### What Reviewers Are Looking For

- Effective use of TypeScript features (generics, discriminated unions, type guards)
- Clean separation of concerns
- Proper error handling patterns
- Type validation at boundaries (Zod or similar)
- Clean, well-organized code
- Comprehensive test coverage

### Presentation Tips

- Practice your demo flow — ensure the app is in a clean state
- Have screenshots or recordings as backup if the live demo fails
- Focus on **why** you made design decisions, not just **what** the code does
- Be prepared to explain how your types prevent specific classes of bugs

### Key Takeaway

A great presentation connects the TypeScript patterns you learned to real problems you solved. Show the types, explain the decisions, and demonstrate the result.`,
    order_index: 4,
  },
  {
    id: "mitem_60",
    key: "assignment-capstone-ts-app",
    moduleKey: "capstone-project",
    title: "Assignment 10 — Capstone: Production-Style TS App",
    type: "assignment",
    content_url: null,
    content_body: `## Assignment 10 — Capstone: Production-Style TypeScript Application

### Objective

Build a production-style TypeScript application that demonstrates mastery of all course concepts. Choose one of the following project ideas (or propose your own):

1. **Task Management API** — REST API with users, projects, tasks, and comments
2. **Blog Platform** — Articles with authoring, comments, and tag filtering
3. **Quiz Application** — Backend API + frontend with typed questions and scoring

### Requirements

**Type System (mandatory):**

- Discriminated unions for all state variants (e.g., loading/success/error)
- Generics for reusable data structures (repository, event emitter, etc.)
- Type guards for runtime validation
- Zod schemas for external data validation
- No \`any\` in production code

**Architecture:**

- Layered architecture (domain, repository, service, presentation)
- Repository pattern with interfaces (swap implementations easily)
- Typed error handling (Result pattern)
- Environment variable validation at startup

**Code Quality:**

- All exported functions have explicit return types
- \`tsc --strict\` compiles without errors
- At least 10 test cases covering core functionality
- Proper \`import type\` usage where applicable

### Deliverables

- Complete source code in a well-organized directory structure
- \`tsconfig.json\` with strict mode enabled
- \`README.md\` explaining the architecture and how to run
- Test suite with coverage report
- A 5-minute recorded demo or live presentation

### Evaluation Criteria

- Effective use of advanced TypeScript features (40%)
- Clean architecture and separation of concerns (30%)
- Code quality and test coverage (20%)
- Documentation and presentation (10%)

### Hints

- Start with the domain types — they define everything else.
- Build the repository layer with in-memory storage first, then add a database.
- Use Zod to validate all external inputs (API bodies, env vars, config files).
- Create reusable generic utilities early — they'll save time throughout.`,
    order_index: 5,
  },
  {
    id: "mitem_61",
    key: "color-wheel",
    moduleKey: "react-essentials",
    title: "Color Wheel Video",
    type: "video",
    content_url: "https://cdn.unisole.test/color-wheel.mp4",
    content_body: null,
    order_index: 0,
  },
  {
    id: "mitem_62",
    key: "react-quiz",
    moduleKey: "react-essentials",
    title: "React Hooks Quiz",
    type: "quiz",
    content_url: null,
    content_body: JSON.stringify([
      {
        id: "q1",
        question: "Which hook is used to manage local state in a functional component?",
        options: ["useEffect", "useState", "useReducer", "useRef"],
        correctIndex: 1,
        explanation: "useState is the fundamental hook for declaring reactive local state in React."
      },
      {
        id: "q2",
        question: "When does the callback inside useEffect without a dependency array run?",
        options: ["Only once on mount", "On every render", "Only when state changes", "Never"],
        correctIndex: 1,
        explanation: "Without a dependency array, useEffect executes after every single render."
      },
      {
        id: "q3",
        question: "What is the purpose of useCallback in React?",
        options: ["To memoize a callback function instance", "To execute an async request", "To manage global store", "To trigger re-renders"],
        correctIndex: 0,
        explanation: "useCallback caches a function definition between renders unless dependencies change."
      }
    ]),
    order_index: 1,
  },
  {
    id: "mitem_63",
    key: "react-project",
    moduleKey: "react-essentials",
    title: "React Project: Portfolio",
    type: "assignment",
    content_url: null,
    content_body: null,
    order_index: 2,
  },
  {
    id: "mitem_64",
    key: "python-setup",
    moduleKey: "python-fundamentals",
    title: "Python Environment Setup",
    type: "video",
    content_url: "https://cdn.unisole.test/python-setup.mp4",
    content_body: null,
    order_index: 0,
  },
  {
    id: "mitem_65",
    key: "python-basics-article",
    moduleKey: "python-fundamentals",
    title: "Python Basics Overview",
    type: "article",
    content_url: "https://unisole.test/lessons/python-basics",
    content_body: null,
    order_index: 1,
  },
  {
    id: "mitem_66",
    key: "python-quiz",
    moduleKey: "python-fundamentals",
    title: "Python Basics Quiz",
    type: "quiz",
    content_url: null,
    content_body: JSON.stringify([
      {
        id: "q1",
        question: "Which of the following is a mutable sequence type in Python?",
        options: ["tuple", "str", "list", "int"],
        correctIndex: 2,
        explanation: "Lists in Python are mutable sequences that can be modified in-place."
      },
      {
        id: "q2",
        question: "What keyword is used to create a generator in Python?",
        options: ["return", "yield", "generate", "async"],
        correctIndex: 1,
        explanation: "The 'yield' keyword turns a function into a generator iterator."
      },
      {
        id: "q3",
        question: "Which pandas function is used to load a CSV file into a DataFrame?",
        options: ["pd.read_csv()", "pd.load_csv()", "pd.from_csv()", "pd.DataFrame.csv()"],
        correctIndex: 0,
        explanation: "pd.read_csv() is the standard pandas method to parse CSV files into DataFrames."
      }
    ]),
    order_index: 2,
  },
  {
    id: "mitem_67",
    key: "pandas-intro",
    moduleKey: "data-analysis",
    title: "Introduction to Pandas",
    type: "video",
    content_url: "https://cdn.unisole.test/pandas-intro.mp4",
    content_body: null,
    order_index: 0,
  },
  {
    id: "mitem_68",
    key: "pandas-guide",
    moduleKey: "data-analysis",
    title: "Pandas DataFrames Guide",
    type: "pdf",
    content_url: "https://cdn.unisole.test/pandas-guide.pdf",
    content_body: null,
    order_index: 1,
  },
  {
    id: "mitem_69",
    key: "data-analysis-assignment",
    moduleKey: "data-analysis",
    title: "Analyze a Dataset",
    type: "assignment",
    content_url: null,
    content_body: null,
    order_index: 2,
  },
  {
    id: "mitem_70",
    key: "flutter-intro-video",
    moduleKey: "flutter-basics",
    title: "What is Flutter?",
    type: "video",
    content_url: "https://cdn.unisole.test/flutter-intro.mp4",
    content_body: null,
    order_index: 0,
  },
  {
    id: "mitem_71",
    key: "dart-basics",
    moduleKey: "flutter-basics",
    title: "Dart Language Basics",
    type: "article",
    content_url: "https://unisole.test/lessons/dart-basics",
    content_body: null,
    order_index: 1,
  },
  {
    id: "mitem_72",
    key: "flutter-quiz",
    moduleKey: "flutter-basics",
    title: "Flutter Basics Quiz",
    type: "quiz",
    content_url: null,
    content_body: null,
    order_index: 2,
  },
  {
    id: "mitem_73",
    key: "state-video",
    moduleKey: "state-management",
    title: "Understanding State",
    type: "video",
    content_url: "https://cdn.unisole.test/state-management.mp4",
    content_body: null,
    order_index: 0,
  },
  {
    id: "mitem_74",
    key: "state-assignment",
    moduleKey: "state-management",
    title: "Build a Todo App with Provider",
    type: "assignment",
    content_url: null,
    content_body: null,
    order_index: 1,
  },
  {
    id: "mitem_75",
    key: "docker-intro-video",
    moduleKey: "docker-intro",
    title: "Docker Overview",
    type: "video",
    content_url: "https://cdn.unisole.test/docker-intro.mp4",
    content_body: null,
    order_index: 0,
  },
  {
    id: "mitem_76",
    key: "dockerfile-guide",
    moduleKey: "docker-intro",
    title: "Writing Dockerfiles",
    type: "pdf",
    content_url: "https://cdn.unisole.test/dockerfile-guide.pdf",
    content_body: null,
    order_index: 1,
  },
  {
    id: "mitem_77",
    key: "docker-quiz",
    moduleKey: "docker-intro",
    title: "Docker Fundamentals Quiz",
    type: "quiz",
    content_url: null,
    content_body: null,
    order_index: 2,
  },
  {
    id: "mitem_78",
    key: "k8s-video",
    moduleKey: "kubernetes-deep-dive",
    title: "Kubernetes Architecture",
    type: "video",
    content_url: "https://cdn.unisole.test/k8s-arch.mp4",
    content_body: null,
    order_index: 0,
  },
  {
    id: "mitem_79",
    key: "k8s-assignment",
    moduleKey: "kubernetes-deep-dive",
    title: "Deploy a Microservice",
    type: "assignment",
    content_url: null,
    content_body: null,
    order_index: 1,
  },
  {
    id: "mitem_80",
    key: "js-variables",
    moduleKey: "js-core",
    title: "Variables and Scope",
    type: "video",
    content_url: "https://cdn.unisole.test/js-variables.mp4",
    content_body: null,
    order_index: 0,
  },
  {
    id: "mitem_81",
    key: "js-closures",
    moduleKey: "js-core",
    title: "Closures Explained",
    type: "article",
    content_url: "https://unisole.test/lessons/closures",
    content_body: null,
    order_index: 1,
  },
  {
    id: "mitem_82",
    key: "js-core-quiz",
    moduleKey: "js-core",
    title: "JS Core Concepts Quiz",
    type: "quiz",
    content_url: null,
    content_body: null,
    order_index: 2,
  },
  {
    id: "mitem_83",
    key: "async-promises",
    moduleKey: "js-async",
    title: "Promises and Async/Await",
    type: "video",
    content_url: "https://cdn.unisole.test/async-promises.mp4",
    content_body: null,
    order_index: 0,
  },
  {
    id: "mitem_84",
    key: "async-assignment",
    moduleKey: "js-async",
    title: "Build a Promise-based API Client",
    type: "assignment",
    content_url: null,
    content_body: null,
    order_index: 1,
  },
  {
    id: "mitem_85",
    key: "node-intro-video",
    moduleKey: "node-fundamentals",
    title: "Introduction to Node.js",
    type: "video",
    content_url: "https://cdn.unisole.test/node-intro.mp4",
    content_body: null,
    order_index: 0,
  },
  {
    id: "mitem_86",
    key: "express-guide",
    moduleKey: "node-fundamentals",
    title: "Express.js Guide",
    type: "pdf",
    content_url: "https://cdn.unisole.test/express-guide.pdf",
    content_body: null,
    order_index: 1,
  },
  {
    id: "mitem_87",
    key: "node-quiz",
    moduleKey: "node-fundamentals",
    title: "Node.js Basics Quiz",
    type: "quiz",
    content_url: null,
    content_body: null,
    order_index: 2,
  },
  {
    id: "mitem_88",
    key: "aws-intro-video",
    moduleKey: "aws-overview",
    title: "AWS Cloud Overview",
    type: "video",
    content_url: "https://cdn.unisole.test/aws-intro.mp4",
    content_body: null,
    order_index: 0,
  },
  {
    id: "mitem_89",
    key: "aws-services-pdf",
    moduleKey: "aws-overview",
    title: "AWS Core Services Cheat Sheet",
    type: "pdf",
    content_url: "https://cdn.unisole.test/aws-services.pdf",
    content_body: null,
    order_index: 1,
  },
  {
    id: "mitem_90",
    key: "aws-quiz",
    moduleKey: "aws-overview",
    title: "AWS Cloud Practitioner Quiz",
    type: "quiz",
    content_url: null,
    content_body: null,
    order_index: 2,
  },
  {
    id: "mitem_91",
    key: "aws-assignment",
    moduleKey: "aws-overview",
    title: "Design a Cloud Architecture",
    type: "assignment",
    content_url: null,
    content_body: null,
    order_index: 3,
  },
  {
    id: "mitem_92",
    key: "java-spring-intro",
    moduleKey: "java-spring-core",
    title: "Spring Boot 3 Core Architecture & Dependency Injection",
    type: "article",
    content_url: null,
    content_body: "## Spring Boot 3 Core Architecture\n\nSpring Boot simplifies enterprise Java development by providing auto-configuration, starter dependencies, and embedded servers (Tomcat/Jetty).\n\n### Inversion of Control & Dependency Injection\n\n```java\n@RestController\n@RequestMapping(\"/api/v1/courses\")\npublic class CourseController {\n    private final CourseService courseService;\n\n    public CourseController(CourseService courseService) {\n        this.courseService = courseService;\n    }\n\n    @GetMapping\n    public List<CourseDto> getCourses() {\n        return courseService.findAllCourses();\n    }\n}\n```\n\n### Key Concepts\n- `@SpringBootApplication`: Combines `@Configuration`, `@EnableAutoConfiguration`, and `@ComponentScan`.\n- Spring Data JPA with Hibernate for ORM persistence.\n- Spring Security with JWT filters for stateless authentication.",
    order_index: 0,
  },
  {
    id: "mitem_93",
    key: "java-quiz",
    moduleKey: "java-spring-core",
    title: "Java Spring Boot Assessment",
    type: "quiz",
    content_url: null,
    content_body: JSON.stringify([
      {
        id: "q1",
        question: "Which annotation marks a class as a Spring REST Controller?",
        options: ["@Controller", "@RestController", "@Service", "@Component"],
        correctIndex: 1,
        explanation: "@RestController combines @Controller and @ResponseBody."
      },
      {
        id: "q2",
        question: "What is the default scope of a Spring Bean?",
        options: ["Prototype", "Singleton", "Request", "Session"],
        correctIndex: 1,
        explanation: "Spring beans are singletons by default within the ApplicationContext."
      },
      {
        id: "q3",
        question: "Which interface in Spring Data JPA provides standard CRUD methods?",
        options: ["CrudRepository", "JpaTemplate", "EntityManager", "SqlRepository"],
        correctIndex: 0,
        explanation: "CrudRepository (and its extension JpaRepository) provides standard persistence operations."
      }
    ]),
    order_index: 1,
  },
  {
    id: "mitem_94",
    key: "go-concurrency-intro",
    moduleKey: "go-concurrency-microservices",
    title: "Go Concurrency with Goroutines and Channels",
    type: "article",
    content_url: null,
    content_body: "## Go Concurrency: Goroutines and Channels\n\nGo approaches concurrency using CSP (Communicating Sequential Processes), where independent execution threads communicate by sending data through typed channels.\n\n### Spawning a Goroutine\n\n```go\npackage main\n\nimport (\n    \"fmt\"\n    \"time\"\n)\n\nfunc worker(id int, ch chan<- string) {\n    time.Sleep(100 * time.Millisecond)\n    ch <- fmt.Sprintf(\"worker %d completed\", id)\n}\n\nfunc main() {\n    ch := make(chan string, 3)\n    for i := 1; i <= 3; i++ {\n        go worker(i, ch)\n    }\n    for i := 1; i <= 3; i++ {\n        fmt.Println(<-ch)\n    }\n}\n```\n\n### Microservice Architecture with gRPC\nGo microservices excel at high-throughput RPC communication using Protocol Buffers and HTTP/2 transport.",
    order_index: 0,
  },
  {
    id: "mitem_95",
    key: "go-quiz",
    moduleKey: "go-concurrency-microservices",
    title: "Go Microservices Assessment",
    type: "quiz",
    content_url: null,
    content_body: JSON.stringify([
      {
        id: "q1",
        question: "How do you spawn a lightweight concurrency thread in Go?",
        options: ["thread.start()", "go myFunction()", "spawn myFunction()", "async myFunction()"],
        correctIndex: 1,
        explanation: "The 'go' keyword spawns a new goroutine managed by the Go runtime."
      },
      {
        id: "q2",
        question: "What is the zero value of a Go channel?",
        options: ["0", "empty", "nil", "closed"],
        correctIndex: 2,
        explanation: "Uninitialized channels in Go have a zero value of nil."
      },
      {
        id: "q3",
        question: "Which keyword is used to wait on multiple channel operations in Go?",
        options: ["switch", "select", "wait", "defer"],
        correctIndex: 1,
        explanation: "The 'select' statement lets a goroutine wait on multiple communication operations."
      }
    ]),
    order_index: 1,
  },
];


// ─── Assignments ──────────────────────────────────────────────────────────────

export const seedAssignments: SeedAssignment[] = [
  // ── TS Bootcamp (asgn_1 – asgn_10) ──────────────────────────────────────
  { id: "asgn_1", key: "type-the-playground", lessonItemKey: "assignment-type-playground", title: "Type the Playground", max_score: 100, allowed_attempts: 3 },
  { id: "asgn_2", key: "library-catalog-api", lessonItemKey: "assignment-library-catalog", title: "Library Catalog API", max_score: 100, allowed_attempts: 3 },
  { id: "asgn_3", key: "shape-calculator", lessonItemKey: "assignment-shape-calculator", title: "Shape Calculator", max_score: 100, allowed_attempts: 3 },
  { id: "asgn_4", key: "bank-account-system", lessonItemKey: "assignment-bank-account", title: "Bank Account System", max_score: 100, allowed_attempts: 2 },
  { id: "asgn_5", key: "generic-data-store", lessonItemKey: "assignment-generic-data-store", title: "Generic Data Store", max_score: 100, allowed_attempts: 3 },
  { id: "asgn_6", key: "own-utility-types", lessonItemKey: "assignment-own-utility-types", title: "Build Your Own Utility Types", max_score: 100, allowed_attempts: 2 },
  { id: "asgn_7", key: "modularize-codebase", lessonItemKey: "assignment-modularize-codebase", title: "Modularize the Codebase", max_score: 100, allowed_attempts: 2 },
  { id: "asgn_8", key: "typed-weather-dashboard", lessonItemKey: "assignment-weather-dashboard", title: "Typed Weather Dashboard", max_score: 100, allowed_attempts: 3 },
  { id: "asgn_9", key: "full-stack-mini-app", lessonItemKey: "assignment-full-stack-mini-app", title: "Full-Stack Mini App", max_score: 100, allowed_attempts: 2 },
  { id: "asgn_10", key: "capstone-ts-app", lessonItemKey: "assignment-capstone-ts-app", title: "Capstone: Production-Style TS App", max_score: 100, allowed_attempts: 1 },
  // ── Other courses (asgn_11 – asgn_16) ───────────────────────────────────
  { id: "asgn_11", key: "react-portfolio", lessonItemKey: "react-project", title: "Build a React Portfolio", max_score: 100, allowed_attempts: 2 },
  { id: "asgn_12", key: "pandas-analysis", lessonItemKey: "data-analysis-assignment", title: "Pandas Data Analysis", max_score: 100, allowed_attempts: 3 },
  { id: "asgn_13", key: "flutter-todo", lessonItemKey: "state-assignment", title: "Flutter Todo with Provider", max_score: 100, allowed_attempts: 2 },
  { id: "asgn_14", key: "k8s-deploy", lessonItemKey: "k8s-assignment", title: "Deploy Microservice on K8s", max_score: 100, allowed_attempts: 3 },
  { id: "asgn_15", key: "async-client", lessonItemKey: "async-assignment", title: "Promise-based API Client", max_score: 100, allowed_attempts: 2 },
  { id: "asgn_16", key: "aws-architecture", lessonItemKey: "aws-assignment", title: "Cloud Architecture Design", max_score: 100, allowed_attempts: 3 },
];

// ─── Assignment Submissions ───────────────────────────────────────────────────

export const seedAssignmentSubmissions: SeedAssignmentSubmission[] = [
  { id: "asub_1", assignmentKey: "type-the-playground", userKey: "john", file_url: "https://cdn.unisole.test/submissions/playground.zip", status: "pending" },
  { id: "asub_2", assignmentKey: "type-the-playground", userKey: "jane", file_url: "https://cdn.unisole.test/submissions/playground.zip", status: "pending" },
  { id: "asub_3", assignmentKey: "react-portfolio", userKey: "jane", file_url: "https://cdn.unisole.test/submissions/react-portfolio.zip", status: "pending" },
];

// ─── Tests ────────────────────────────────────────────────────────────────────

export const seedTests: SeedTest[] = [
  { id: "test_2", key: "react-hooks-test", moduleItemKey: "react-quiz", title: "React Hooks Assessment", duration_min: 20, total_marks: 50, passing_marks: 30, max_attempts: 2 },
  { id: "test_3", key: "python-quiz-test", moduleItemKey: "python-quiz", title: "Python Basics Assessment", duration_min: 15, total_marks: 50, passing_marks: 30, max_attempts: 3 },
  { id: "test_4", key: "flutter-quiz-test", moduleItemKey: "flutter-quiz", title: "Flutter Widgets Assessment", duration_min: 20, total_marks: 50, passing_marks: 30, max_attempts: 2 },
  { id: "test_5", key: "docker-quiz-test", moduleItemKey: "docker-quiz", title: "Docker & Containerization Quiz", duration_min: 25, total_marks: 50, passing_marks: 35, max_attempts: 3 },
  { id: "test_6", key: "js-quiz-test", moduleItemKey: "js-core-quiz", title: "JavaScript Core Assessment", duration_min: 20, total_marks: 50, passing_marks: 30, max_attempts: 3 },

  { id: "test_7", key: "node-quiz-test", moduleItemKey: "node-quiz", title: "Node.js & Express Architecture Quiz", duration_min: 20, total_marks: 50, passing_marks: 30, max_attempts: 2 },
  { id: "test_8", key: "aws-quiz-test", moduleItemKey: "aws-quiz", title: "AWS Cloud Practitioner Exam Prep", duration_min: 30, total_marks: 100, passing_marks: 70, max_attempts: 3 },
  { id: "test_9", key: "java-quiz-test", moduleItemKey: "java-quiz", title: "Java Spring Boot Full-Stack Assessment", duration_min: 25, total_marks: 50, passing_marks: 35, max_attempts: 2 },
  { id: "test_10", key: "go-quiz-test", moduleItemKey: "go-quiz", title: "Go Distributed Systems & Concurrency Quiz", duration_min: 25, total_marks: 50, passing_marks: 35, max_attempts: 2 },
];

// ─── Test Attempts ────────────────────────────────────────────────────────────

export const seedTestAttempts: SeedTestAttempt[] = [
  {
    id: "tatt_2",
    testKey: "react-hooks-test",
    userKey: "jane",
    status: "submitted",
    score: "42",
    answers: [{ questionId: "q1", answerIndex: 1 }, { questionId: "q2", answerIndex: 1 }, { questionId: "q3", answerIndex: 0 }],
  },
  {
    id: "tatt_3",
    testKey: "python-quiz-test",
    userKey: "john",
    status: "submitted",
    score: "48",
    answers: [{ questionId: "q1", answerIndex: 2 }, { questionId: "q2", answerIndex: 1 }, { questionId: "q3", answerIndex: 0 }],
  },
  {
    id: "tatt_4",
    testKey: "docker-quiz-test",
    userKey: "alex",
    status: "submitted",
    score: "45",
    answers: [{ questionId: "q1", answerIndex: 0 }, { questionId: "q2", answerIndex: 1 }],
  },
  {
    id: "tatt_5",
    testKey: "aws-quiz-test",
    userKey: "jane",
    status: "submitted",
    score: "88",
    answers: [{ questionId: "q1", answerIndex: 1 }, { questionId: "q2", answerIndex: 2 }],
  },
  {
    id: "tatt_6",
    testKey: "js-quiz-test",
    userKey: "priya",
    status: "submitted",
    score: "50",
    answers: [{ questionId: "q1", answerIndex: 2 }, { questionId: "q2", answerIndex: 1 }],
  },
];

// ─── Carts ────────────────────────────────────────────────────────────────────

export const seedCarts: SeedCart[] = [
  { id: "cart_1", userKey: "john" },
  { id: "cart_2", userKey: "jane" },
  { id: "cart_3", userKey: "admin" },
];

// ─── Coupons ──────────────────────────────────────────────────────────────────

export const seedCoupons: SeedCoupon[] = [
  { id: "coup_1", key: "welcome10", code: "WELCOME10", discount_type: "percent", value: "10.00", max_uses: 100, used_count: 0, valid_from: "2026-01-01T00:00:00.000Z", valid_to: "2026-12-31T23:59:59.000Z" },
  { id: "coup_2", key: "flat50", code: "FLAT50", discount_type: "flat", value: "50.00", max_uses: 50, used_count: 5, valid_from: "2026-01-01T00:00:00.000Z", valid_to: "2026-12-31T23:59:59.000Z" },
];

// ─── Enrollments ──────────────────────────────────────────────────────────────

export const seedEnrollments: SeedEnrollment[] = [
  { id: "enrl_1", userKey: "john", courseKey: "typescript-bootcamp", expiry_at: null, progress_percent: 35, status: "active" },
  { id: "enrl_2", userKey: "jane", courseKey: "react-hooks", expiry_at: null, progress_percent: 10, status: "active" },
  { id: "enrl_3", userKey: "john", courseKey: "react-hooks", expiry_at: null, progress_percent: 60, status: "active" },
  { id: "enrl_4", userKey: "jane", courseKey: "ui-design", expiry_at: null, progress_percent: 5, status: "active" },
  { id: "enrl_5", userKey: "john", courseKey: "python-data-science", expiry_at: null, progress_percent: 20, status: "active" },
  { id: "enrl_6", userKey: "john", courseKey: "flutter-mobile-apps", expiry_at: null, progress_percent: 45, status: "active" },
  { id: "enrl_7", userKey: "john", courseKey: "docker-kubernetes", expiry_at: null, progress_percent: 70, status: "active" },
  { id: "enrl_8", userKey: "john", courseKey: "javascript-masterclass", expiry_at: null, progress_percent: 90, status: "completed" },
  { id: "enrl_9", userKey: "jane", courseKey: "flutter-mobile-apps", expiry_at: null, progress_percent: 80, status: "active" },
  { id: "enrl_10", userKey: "jane", courseKey: "nodejs-backend", expiry_at: null, progress_percent: 15, status: "active" },
  { id: "enrl_11", userKey: "jane", courseKey: "aws-cloud-practitioner", expiry_at: null, progress_percent: 55, status: "active" },
  { id: "enrl_12", userKey: "alex", courseKey: "typescript-bootcamp", expiry_at: null, progress_percent: 25, status: "active" },
  { id: "enrl_13", userKey: "alex", courseKey: "python-data-science", expiry_at: null, progress_percent: 40, status: "active" },
  { id: "enrl_14", userKey: "alex", courseKey: "docker-kubernetes", expiry_at: null, progress_percent: 65, status: "active" },
  { id: "enrl_15", userKey: "alex", courseKey: "javascript-masterclass", expiry_at: null, progress_percent: 50, status: "active" },
  { id: "enrl_16", userKey: "alex", courseKey: "aws-cloud-practitioner", expiry_at: null, progress_percent: 10, status: "active" },
  { id: "enrl_17", userKey: "priya", courseKey: "flutter-mobile-apps", expiry_at: null, progress_percent: 30, status: "active" },
  { id: "enrl_18", userKey: "priya", courseKey: "nodejs-backend", expiry_at: null, progress_percent: 85, status: "active" },
  { id: "enrl_19", userKey: "john", courseKey: "java-spring-boot", expiry_at: null, progress_percent: 40, status: "active" },
  { id: "enrl_20", userKey: "alex", courseKey: "go-microservices", expiry_at: null, progress_percent: 20, status: "active" },
  { id: "enrl_21", userKey: "priya", courseKey: "java-spring-boot", expiry_at: null, progress_percent: 60, status: "active" },
];

// ─── Orders ───────────────────────────────────────────────────────────────────

export const seedOrders: SeedOrder[] = [
  { id: "ordr_1", key: "order-ts", userKey: "john", razorpay_order_id: "order_9x4k2m1p", amount: "44.99", currency: "INR", status: "paid", couponKey: "welcome10" },
  { id: "ordr_2", key: "order-react", userKey: "jane", razorpay_order_id: "order_1b3d5f7h", amount: "35.99", currency: "INR", status: "paid", couponKey: "flat50" },
];

// ─── Order Items ──────────────────────────────────────────────────────────────

export const seedOrderItems: SeedOrderItem[] = [
  { id: "oitm_1", orderKey: "order-ts", courseKey: "typescript-bootcamp", price_at_purchase: "49.99" },
  { id: "oitm_2", orderKey: "order-react", courseKey: "react-hooks", price_at_purchase: "39.99" },
];

// ─── Payments ─────────────────────────────────────────────────────────────────

export const seedPayments: SeedPayment[] = [
  { id: "pay_1", key: "pay-ts", orderKey: "order-ts", razorpay_payment_id: "pay_7y3a1n0q", razorpay_signature: "sig_abc123", method: "upi", status: "captured" },
  { id: "pay_2", key: "pay-react", orderKey: "order-react", razorpay_payment_id: "pay_2c4e6g8j", razorpay_signature: "sig_xyz789", method: "card", status: "captured" },
];

// ─── Certificates ─────────────────────────────────────────────────────────────

export const seedCertificates: SeedCertificate[] = [
  { id: "cert_1", userKey: "john", courseKey: "typescript-bootcamp", certificate_url: "https://cdn.unisole.test/certs/john-typescript.pdf" },
  { id: "cert_2", userKey: "jane", courseKey: "react-hooks", certificate_url: "https://cdn.unisole.test/certs/jane-react.pdf" },
];

// ─── Reviews ──────────────────────────────────────────────────────────────────

export const seedReviews: SeedReview[] = [
  { id: "rev_1", userKey: "john", courseKey: "typescript-bootcamp", rating: 5, comment: "Great course, highly recommended!" },
  { id: "rev_2", userKey: "jane", courseKey: "ui-design", rating: 4, comment: "Loved the color theory section." },
  { id: "rev_3", userKey: "alex", courseKey: "python-data-science", rating: 5, comment: "Excellent data science content with hands-on projects." },
  { id: "rev_4", userKey: "john", courseKey: "docker-kubernetes", rating: 5, comment: "Best Docker and K8s course I have taken." },
  { id: "rev_5", userKey: "jane", courseKey: "nodejs-backend", rating: 4, comment: "Solid backend development fundamentals." },
  { id: "rev_6", userKey: "alex", courseKey: "aws-cloud-practitioner", rating: 5, comment: "Perfect preparation for the AWS certification." },
  { id: "rev_7", userKey: "priya", courseKey: "flutter-mobile-apps", rating: 4, comment: "Good introduction to Flutter and Dart." },
  { id: "rev_8", userKey: "priya", courseKey: "nodejs-backend", rating: 5, comment: "Learned so much about building APIs with Express." },
  { id: "rev_9", userKey: "john", courseKey: "java-spring-boot", rating: 5, comment: "In-depth Spring Boot architecture and real-world microservice examples." },
  { id: "rev_10", userKey: "alex", courseKey: "go-microservices", rating: 5, comment: "Fantastic coverage of Go concurrency, channels, and gRPC." },
];

