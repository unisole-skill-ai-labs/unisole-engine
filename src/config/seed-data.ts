export interface SeedUser {
  key: string;
  name: string;
  email: string;
  phone: string | null;
  password_hash: string;
  role: "student" | "admin";
  auth_provider: "local" | "google" | "supabase";
  is_verified: boolean;
}

export interface SeedCategory {
  key: string;
  name: string;
}

export interface SeedCourse {
  key: string;
  title: string;
  slug: string;
  categoryKey: string;
  price: string;
  rating_avg: string;
  total_enrollments: number;
}

export interface SeedModule {
  key: string;
  title: string;
  courseKey: string;
  order_index: number;
}

export interface SeedModuleItem {
  key: string;
  title: string;
  type: "video" | "pdf" | "article" | "quiz" | "assignment";
  content_url: string | null;
  order_index: number;
}

export interface SeedModuleLesson {
  moduleKey: string;
  itemKey: string;
  order_index: number;
}

export interface SeedAssignment {
  key: string;
  lessonItemKey: string;
  title: string;
  max_score: number;
  allowed_attempts: number;
}

export interface SeedAssignmentSubmission {
  assignmentKey: string;
  userKey: string;
  file_url: string;
  status: "pending" | "graded";
}

export interface SeedQuiz {
  key: string;
  moduleItemKey: string;
  title: string;
  duration_min: number;
  total_marks: number;
  passing_marks: number;
  max_attempts: number;
}

export interface SeedTest {
  key: string;
  moduleItemKey: string;
  title: string;
  duration_min: number;
  total_marks: number;
  passing_marks: number;
  max_attempts: number;
}

export interface SeedQuestion {
  key: string;
  quizKey: string;
  question_text: string;
  type: "mcq_single" | "mcq_multi" | "true_false" | "subjective";
  options: unknown;
  correct_answer: unknown;
  marks: number;
}

export interface SeedTestAttempt {
  testKey: string;
  userKey: string;
  status: "in_progress" | "submitted" | "evaluated";
  score: string | null;
  answers: unknown;
}

export interface SeedCart {
  userKey: string;
}

export interface SeedCoupon {
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
  userKey: string;
  courseKey: string;
  expiry_at: string | null;
  progress_percent: number;
  status: "active" | "completed" | "expired";
}

export interface SeedOrder {
  key: string;
  userKey: string;
  razorpay_order_id: string;
  amount: string;
  currency: string;
  status: "created" | "paid" | "failed" | "refunded";
  couponKey: string | null;
}

export interface SeedOrderItem {
  orderKey: string;
  courseKey: string;
  price_at_purchase: string;
}

export interface SeedPayment {
  key: string;
  orderKey: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  method: string;
  status: "captured" | "failed" | "refunded";
}

export interface SeedCertificate {
  userKey: string;
  courseKey: string;
  certificate_url: string;
}

export interface SeedReview {
  userKey: string;
  courseKey: string;
  rating: number;
  comment: string;
}

export const seedUsers: SeedUser[] = [
  {
    key: "admin",
    name: "Admin User",
    email: "admin@unisole.test",
    phone: "0000000000",
    password_hash: "placeholder-hash-1",
    role: "admin",
    auth_provider: "local",
    is_verified: true,
  },
  {
    key: "john",
    name: "John Doe",
    email: "john@unisole.test",
    phone: "1111111111",
    password_hash: "placeholder-hash-2",
    role: "student",
    auth_provider: "local",
    is_verified: true,
  },
  {
    key: "jane",
    name: "Jane Smith",
    email: "jane@unisole.test",
    phone: "2222222222",
    password_hash: "placeholder-hash-3",
    role: "student",
    auth_provider: "local",
    is_verified: true,
  },
];

export const seedCategories: SeedCategory[] = [
  { key: "web", name: "Web Development" },
  { key: "design", name: "Design" },
];

export const seedCourses: SeedCourse[] = [
  {
    key: "typescript-bootcamp",
    title: "Complete TypeScript Bootcamp",
    slug: "complete-typescript-bootcamp",
    categoryKey: "web",
    price: "49.99",
    rating_avg: "4.5",
    total_enrollments: 120,
  },
  {
    key: "react-hooks",
    title: "Modern React with Hooks",
    slug: "modern-react-hooks",
    categoryKey: "web",
    price: "39.99",
    rating_avg: "4.5",
    total_enrollments: 120,
  },
  {
    key: "ui-design",
    title: "UI Design Fundamentals",
    slug: "ui-design-fundamentals",
    categoryKey: "design",
    price: "29.99",
    rating_avg: "4.5",
    total_enrollments: 120,
  },
];

export const seedModules: SeedModule[] = [
  {
    key: "getting-started",
    title: "Getting Started",
    courseKey: "typescript-bootcamp",
    order_index: 0,
  },
  {
    key: "ts-basics",
    title: "TypeScript Basics",
    courseKey: "typescript-bootcamp",
    order_index: 1,
  },
  {
    key: "advanced-types",
    title: "Advanced Types",
    courseKey: "typescript-bootcamp",
    order_index: 2,
  },
  {
    key: "react-essentials",
    title: "React Essentials",
    courseKey: "react-hooks",
    order_index: 0,
  },
  {
    key: "color-theory",
    title: "Color Theory",
    courseKey: "ui-design",
    order_index: 0,
  },
];

export const seedModuleItems: SeedModuleItem[] = [
  {
    key: "welcome-video",
    title: "Welcome Video",
    type: "video",
    content_url: "https://cdn.unisole.test/welcome.mp4",
    order_index: 0,
  },
  {
    key: "course-syllabus",
    title: "Course Syllabus",
    type: "pdf",
    content_url: "https://cdn.unisole.test/syllabus.pdf",
    order_index: 1,
  },
  {
    key: "intro-to-types",
    title: "Intro to Types",
    type: "article",
    content_url: "https://unisole.test/lessons/types-intro",
    order_index: 0,
  },
  {
    key: "types-quiz",
    title: "Types Quiz",
    type: "quiz",
    content_url: null,
    order_index: 1,
  },
  {
    key: "todo-app",
    title: "Build a To-Do App",
    type: "assignment",
    content_url: null,
    order_index: 2,
  },
  {
    key: "color-wheel",
    title: "Color Wheel Video",
    type: "video",
    content_url: "https://cdn.unisole.test/color-wheel.mp4",
    order_index: 0,
  },
  {
    key: "react-quiz",
    title: "React Hooks Quiz",
    type: "quiz",
    content_url: null,
    order_index: 1,
  },
  {
    key: "react-project",
    title: "React Project: Portfolio",
    type: "assignment",
    content_url: null,
    order_index: 2,
  },
];

export const seedModuleLessons: SeedModuleLesson[] = [
  { moduleKey: "getting-started", itemKey: "welcome-video", order_index: 0 },
  { moduleKey: "getting-started", itemKey: "course-syllabus", order_index: 1 },
  { moduleKey: "ts-basics", itemKey: "intro-to-types", order_index: 0 },
  { moduleKey: "ts-basics", itemKey: "types-quiz", order_index: 1 },
  { moduleKey: "ts-basics", itemKey: "todo-app", order_index: 2 },
  { moduleKey: "react-essentials", itemKey: "welcome-video", order_index: 0 },
  { moduleKey: "react-essentials", itemKey: "react-quiz", order_index: 1 },
  { moduleKey: "react-essentials", itemKey: "react-project", order_index: 2 },
  { moduleKey: "color-theory", itemKey: "color-wheel", order_index: 0 },
];

export const seedAssignments: SeedAssignment[] = [
  {
    key: "todo-app",
    lessonItemKey: "todo-app",
    title: "To-Do App Assignment",
    max_score: 100,
    allowed_attempts: 3,
  },
  {
    key: "react-portfolio",
    lessonItemKey: "react-project",
    title: "Build a React Portfolio",
    max_score: 100,
    allowed_attempts: 2,
  },
];

export const seedAssignmentSubmissions: SeedAssignmentSubmission[] = [
  {
    assignmentKey: "todo-app",
    userKey: "john",
    file_url: "https://cdn.unisole.test/submissions/todo-app.zip",
    status: "pending",
  },
  {
    assignmentKey: "todo-app",
    userKey: "jane",
    file_url: "https://cdn.unisole.test/submissions/todo-app.zip",
    status: "pending",
  },
  {
    assignmentKey: "react-portfolio",
    userKey: "jane",
    file_url: "https://cdn.unisole.test/submissions/react-portfolio.zip",
    status: "pending",
  },
];

export const seedQuizzes: SeedQuiz[] = [
  {
    key: "intro-to-types",
    moduleItemKey: "types-quiz",
    title: "Intro to Types Quiz",
    duration_min: 10,
    total_marks: 20,
    passing_marks: 12,
    max_attempts: 2,
  },
  {
    key: "react-hooks-quiz",
    moduleItemKey: "react-quiz",
    title: "React Hooks Quiz",
    duration_min: 15,
    total_marks: 25,
    passing_marks: 15,
    max_attempts: 2,
  },
];

export const seedTests: SeedTest[] = [
  {
    key: "intro-to-types-test",
    moduleItemKey: "types-quiz",
    title: "Intro to Types Test",
    duration_min: 10,
    total_marks: 20,
    passing_marks: 12,
    max_attempts: 2,
  },
  {
    key: "react-hooks-test",
    moduleItemKey: "react-quiz",
    title: "React Hooks Assessment",
    duration_min: 20,
    total_marks: 50,
    passing_marks: 30,
    max_attempts: 2,
  },
];

export const seedQuestions: SeedQuestion[] = [
  {
    key: "what-is-ts",
    quizKey: "intro-to-types",
    question_text: "What is TypeScript?",
    type: "mcq_single",
    options: ["A superset of JavaScript", "A database", "A CSS framework", "A bundler"],
    correct_answer: ["A superset of JavaScript"],
    marks: 5,
  },
  {
    key: "ts-statically-typed",
    quizKey: "intro-to-types",
    question_text: "TypeScript is a statically typed language.",
    type: "true_false",
    options: [true, false],
    correct_answer: [true],
    marks: 5,
  },
  {
    key: "ts-types-multi",
    quizKey: "intro-to-types",
    question_text: "Which of the following are built-in TypeScript types?",
    type: "mcq_multi",
    options: ["string", "number", "boolean", "html"],
    correct_answer: ["string", "number", "boolean"],
    marks: 5,
  },
  {
    key: "explain-generics",
    quizKey: "intro-to-types",
    question_text: "Briefly explain what a generic is in TypeScript.",
    type: "subjective",
    options: null,
    correct_answer: null,
    marks: 5,
  },
  {
    key: "what-is-usestate",
    quizKey: "react-hooks-quiz",
    question_text: "What does useState return?",
    type: "mcq_single",
    options: ["An array with the state and a setter", "An object", "A string", "A callback"],
    correct_answer: ["An array with the state and a setter"],
    marks: 5,
  },
  {
    key: "hooks-top-level",
    quizKey: "react-hooks-quiz",
    question_text: "Hooks can only be called at the top level of a component.",
    type: "true_false",
    options: [true, false],
    correct_answer: [true],
    marks: 5,
  },
];

export const seedTestAttempts: SeedTestAttempt[] = [
  {
    testKey: "intro-to-types-test",
    userKey: "john",
    status: "in_progress",
    score: null,
    answers: [{ question: "what-is-ts", answer: "A superset of JavaScript" }],
  },
  {
    testKey: "react-hooks-test",
    userKey: "jane",
    status: "submitted",
    score: "42",
    answers: [{ question: "what-is-usestate", answer: "An array with the state and a setter" }],
  },
];

export const seedCarts: SeedCart[] = [{ userKey: "john" }, { userKey: "jane" }, { userKey: "admin" }];

export const seedCoupons: SeedCoupon[] = [
  {
    key: "welcome10",
    code: "WELCOME10",
    discount_type: "percent",
    value: "10.00",
    max_uses: 100,
    used_count: 0,
    valid_from: "2026-01-01T00:00:00.000Z",
    valid_to: "2026-12-31T23:59:59.000Z",
  },
  {
    key: "flat50",
    code: "FLAT50",
    discount_type: "flat",
    value: "50.00",
    max_uses: 50,
    used_count: 5,
    valid_from: "2026-01-01T00:00:00.000Z",
    valid_to: "2026-12-31T23:59:59.000Z",
  },
];

export const seedEnrollments: SeedEnrollment[] = [
  {
    userKey: "john",
    courseKey: "typescript-bootcamp",
    expiry_at: null,
    progress_percent: 35,
    status: "active",
  },
  {
    userKey: "jane",
    courseKey: "react-hooks",
    expiry_at: null,
    progress_percent: 10,
    status: "active",
  },
  {
    userKey: "john",
    courseKey: "react-hooks",
    expiry_at: null,
    progress_percent: 60,
    status: "active",
  },
  {
    userKey: "jane",
    courseKey: "ui-design",
    expiry_at: null,
    progress_percent: 5,
    status: "active",
  },
];

export const seedOrders: SeedOrder[] = [
  {
    key: "order-ts",
    userKey: "john",
    razorpay_order_id: "order_9x4k2m1p",
    amount: "44.99",
    currency: "INR",
    status: "paid",
    couponKey: "welcome10",
  },
  {
    key: "order-react",
    userKey: "jane",
    razorpay_order_id: "order_1b3d5f7h",
    amount: "35.99",
    currency: "INR",
    status: "paid",
    couponKey: "flat50",
  },
];

export const seedOrderItems: SeedOrderItem[] = [
  {
    orderKey: "order-ts",
    courseKey: "typescript-bootcamp",
    price_at_purchase: "49.99",
  },
  {
    orderKey: "order-react",
    courseKey: "react-hooks",
    price_at_purchase: "39.99",
  },
];

export const seedPayments: SeedPayment[] = [
  {
    key: "pay-ts",
    orderKey: "order-ts",
    razorpay_payment_id: "pay_7y3a1n0q",
    razorpay_signature: "sig_abc123",
    method: "upi",
    status: "captured",
  },
  {
    key: "pay-react",
    orderKey: "order-react",
    razorpay_payment_id: "pay_2c4e6g8j",
    razorpay_signature: "sig_xyz789",
    method: "card",
    status: "captured",
  },
];

export const seedCertificates: SeedCertificate[] = [
  {
    userKey: "john",
    courseKey: "typescript-bootcamp",
    certificate_url: "https://cdn.unisole.test/certs/john-typescript.pdf",
  },
  {
    userKey: "jane",
    courseKey: "react-hooks",
    certificate_url: "https://cdn.unisole.test/certs/jane-react.pdf",
  },
];

export const seedReviews: SeedReview[] = [
  {
    userKey: "john",
    courseKey: "typescript-bootcamp",
    rating: 5,
    comment: "Great course, highly recommended!",
  },
  {
    userKey: "jane",
    courseKey: "ui-design",
    rating: 4,
    comment: "Loved the color theory section.",
  },
];
