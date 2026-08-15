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
  order_index: number;
}

export interface SeedModuleItem {
  key: string;
  title: string;
  type: "video" | "pdf" | "article" | "quiz" | "assignment";
  content_url: string | null;
  order_index: number;
}

export interface SeedCourseModule {
  courseKey: string;
  moduleKey: string;
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
  { key: "getting-started", title: "Getting Started", order_index: 0 },
  { key: "ts-basics", title: "TypeScript Basics", order_index: 1 },
  { key: "advanced-types", title: "Advanced Types", order_index: 2 },
  { key: "react-essentials", title: "React Essentials", order_index: 0 },
  { key: "color-theory", title: "Color Theory", order_index: 0 },
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
];

export const seedCourseModules: SeedCourseModule[] = [
  {
    courseKey: "typescript-bootcamp",
    moduleKey: "getting-started",
    order_index: 0,
  },
  { courseKey: "typescript-bootcamp", moduleKey: "ts-basics", order_index: 1 },
  {
    courseKey: "typescript-bootcamp",
    moduleKey: "advanced-types",
    order_index: 2,
  },
  { courseKey: "react-hooks", moduleKey: "getting-started", order_index: 0 },
  { courseKey: "react-hooks", moduleKey: "react-essentials", order_index: 1 },
  { courseKey: "ui-design", moduleKey: "color-theory", order_index: 0 },
];

export const seedModuleLessons: SeedModuleLesson[] = [
  { moduleKey: "getting-started", itemKey: "welcome-video", order_index: 0 },
  { moduleKey: "getting-started", itemKey: "course-syllabus", order_index: 1 },
  { moduleKey: "ts-basics", itemKey: "intro-to-types", order_index: 0 },
  { moduleKey: "ts-basics", itemKey: "types-quiz", order_index: 1 },
  { moduleKey: "ts-basics", itemKey: "todo-app", order_index: 2 },
  { moduleKey: "react-essentials", itemKey: "welcome-video", order_index: 0 },
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
];
