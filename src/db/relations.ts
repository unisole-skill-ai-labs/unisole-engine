import { relations } from "drizzle-orm/relations";
import {
  users,
  enrollments,
  pathways,
  payments,
  pathwayCategories,
  categories,
  pathwayColleges,
  colleges,
  pathwayCourses,
  courses,
  courseModules,
  modules,
  moduleLessons,
  lessons,
  presentations,
  presentationSessions,
  presentationLeads,
  teamDepartments,
  projects,
  subProjects,
  tasks,
  taskSubtasks,
  taskTemplates,
  taskComments,
  dailyEodLogs,
  leads,
  leadCallLogs,
} from "./schema";

export const usersRelations = relations(users, ({ many }) => ({
  enrollments: many(enrollments),
  payments: many(payments),
  assignedTasks: many(tasks, { relationName: "taskAssignee" }),
  reportedTasks: many(tasks, { relationName: "taskReporter" }),
  ledProjects: many(projects, { relationName: "projectLead" }),
  createdProjects: many(projects, { relationName: "projectCreator" }),
  ledSubProjects: many(subProjects, { relationName: "subProjectLead" }),
  taskComments: many(taskComments),
  dailyEodLogs: many(dailyEodLogs),
  assignedLeads: many(leads, { relationName: "assignedLeadUser" }),
}));

export const enrollmentsRelations = relations(enrollments, ({ one, many }) => ({
  user: one(users, {
    fields: [enrollments.userId],
    references: [users.id],
  }),
  pathway: one(pathways, {
    fields: [enrollments.pathwayId],
    references: [pathways.id],
  }),
  payments: many(payments),
}));

export const pathwaysRelations = relations(pathways, ({ many }) => ({
  enrollments: many(enrollments),
  payments: many(payments),
  pathwayCategories: many(pathwayCategories),
  pathwayColleges: many(pathwayColleges),
  pathwayCourses: many(pathwayCourses),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  user: one(users, {
    fields: [payments.userId],
    references: [users.id],
  }),
  enrollment: one(enrollments, {
    fields: [payments.enrollmentId],
    references: [enrollments.id],
  }),
  pathway: one(pathways, {
    fields: [payments.pathwayId],
    references: [pathways.id],
  }),
}));

export const pathwayCategoriesRelations = relations(pathwayCategories, ({ one }) => ({
  pathway: one(pathways, {
    fields: [pathwayCategories.pathwayId],
    references: [pathways.id],
  }),
  category: one(categories, {
    fields: [pathwayCategories.categoryId],
    references: [categories.id],
  }),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  pathwayCategories: many(pathwayCategories),
}));

export const pathwayCollegesRelations = relations(pathwayColleges, ({ one }) => ({
  pathway: one(pathways, {
    fields: [pathwayColleges.pathwayId],
    references: [pathways.id],
  }),
  college: one(colleges, {
    fields: [pathwayColleges.collegeId],
    references: [colleges.id],
  }),
}));

export const collegesRelations = relations(colleges, ({ many }) => ({
  pathwayColleges: many(pathwayColleges),
}));

export const pathwayCoursesRelations = relations(pathwayCourses, ({ one }) => ({
  pathway: one(pathways, {
    fields: [pathwayCourses.pathwayId],
    references: [pathways.id],
  }),
  course: one(courses, {
    fields: [pathwayCourses.courseId],
    references: [courses.id],
  }),
}));

export const coursesRelations = relations(courses, ({ many }) => ({
  pathwayCourses: many(pathwayCourses),
  courseModules: many(courseModules),
}));

export const courseModulesRelations = relations(courseModules, ({ one }) => ({
  course: one(courses, {
    fields: [courseModules.courseId],
    references: [courses.id],
  }),
  module: one(modules, {
    fields: [courseModules.moduleId],
    references: [modules.id],
  }),
}));

export const modulesRelations = relations(modules, ({ many }) => ({
  courseModules: many(courseModules),
  moduleLessons: many(moduleLessons),
}));

export const moduleLessonsRelations = relations(moduleLessons, ({ one }) => ({
  module: one(modules, {
    fields: [moduleLessons.moduleId],
    references: [modules.id],
  }),
  lesson: one(lessons, {
    fields: [moduleLessons.lessonId],
    references: [lessons.id],
  }),
}));

export const lessonsRelations = relations(lessons, ({ many }) => ({
  moduleLessons: many(moduleLessons),
}));

export const presentationsRelations = relations(presentations, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [presentations.createdById],
    references: [users.id],
  }),
  sessions: many(presentationSessions),
}));

export const presentationSessionsRelations = relations(presentationSessions, ({ one, many }) => ({
  presentation: one(presentations, {
    fields: [presentationSessions.presentationId],
    references: [presentations.id],
  }),
  college: one(colleges, {
    fields: [presentationSessions.collegeId],
    references: [colleges.id],
  }),
  leads: many(presentationLeads),
}));

export const presentationLeadsRelations = relations(presentationLeads, ({ one }) => ({
  session: one(presentationSessions, {
    fields: [presentationLeads.sessionId],
    references: [presentationSessions.id],
  }),
  college: one(colleges, {
    fields: [presentationLeads.collegeId],
    references: [colleges.id],
  }),
  user: one(users, {
    fields: [presentationLeads.userId],
    references: [users.id],
  }),
}));

export const teamDepartmentsRelations = relations(teamDepartments, ({ one, many }) => ({
  lead: one(users, {
    fields: [teamDepartments.leadId],
    references: [users.id],
  }),
  projects: many(projects),
  tasks: many(tasks),
  templates: many(taskTemplates),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  department: one(teamDepartments, {
    fields: [projects.departmentId],
    references: [teamDepartments.id],
  }),
  lead: one(users, {
    fields: [projects.leadId],
    references: [users.id],
    relationName: "projectLead",
  }),
  createdBy: one(users, {
    fields: [projects.createdById],
    references: [users.id],
    relationName: "projectCreator",
  }),
  subProjects: many(subProjects),
  tasks: many(tasks),
}));

export const subProjectsRelations = relations(subProjects, ({ one, many }) => ({
  project: one(projects, {
    fields: [subProjects.projectId],
    references: [projects.id],
  }),
  lead: one(users, {
    fields: [subProjects.leadId],
    references: [users.id],
    relationName: "subProjectLead",
  }),
  tasks: many(tasks),
}));

export const taskTemplatesRelations = relations(taskTemplates, ({ one, many }) => ({
  department: one(teamDepartments, {
    fields: [taskTemplates.departmentId],
    references: [teamDepartments.id],
  }),
  createdBy: one(users, {
    fields: [taskTemplates.createdById],
    references: [users.id],
  }),
  tasks: many(tasks),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  project: one(projects, {
    fields: [tasks.projectId],
    references: [projects.id],
  }),
  subProject: one(subProjects, {
    fields: [tasks.subProjectId],
    references: [subProjects.id],
  }),
  assignee: one(users, {
    fields: [tasks.assigneeId],
    references: [users.id],
    relationName: "taskAssignee",
  }),
  reporter: one(users, {
    fields: [tasks.reporterId],
    references: [users.id],
    relationName: "taskReporter",
  }),
  department: one(teamDepartments, {
    fields: [tasks.departmentId],
    references: [teamDepartments.id],
  }),
  template: one(taskTemplates, {
    fields: [tasks.templateId],
    references: [taskTemplates.id],
  }),
  subtasks: many(taskSubtasks),
  comments: many(taskComments),
}));

export const taskSubtasksRelations = relations(taskSubtasks, ({ one }) => ({
  task: one(tasks, {
    fields: [taskSubtasks.taskId],
    references: [tasks.id],
  }),
}));

export const taskCommentsRelations = relations(taskComments, ({ one }) => ({
  task: one(tasks, {
    fields: [taskComments.taskId],
    references: [tasks.id],
  }),
  user: one(users, {
    fields: [taskComments.userId],
    references: [users.id],
  }),
}));

export const dailyEodLogsRelations = relations(dailyEodLogs, ({ one }) => ({
  user: one(users, {
    fields: [dailyEodLogs.userId],
    references: [users.id],
  }),
}));

export const leadsRelations = relations(leads, ({ one, many }) => ({
  college: one(colleges, {
    fields: [leads.collegeId],
    references: [colleges.id],
  }),
  assignedToUser: one(users, {
    fields: [leads.assignedToUserId],
    references: [users.id],
    relationName: "assignedLeadUser",
  }),
  creator: one(users, {
    fields: [leads.createdById],
    references: [users.id],
    relationName: "createdLeadUser",
  }),
  callLogs: many(leadCallLogs),
}));

export const leadCallLogsRelations = relations(leadCallLogs, ({ one }) => ({
  lead: one(leads, {
    fields: [leadCallLogs.leadId],
    references: [leads.id],
  }),
  callerUser: one(users, {
    fields: [leadCallLogs.callerUserId],
    references: [users.id],
  }),
}));

