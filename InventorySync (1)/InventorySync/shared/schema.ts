import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Status Types
export const statusOptions = ["On Track", "At Risk", "Behind"] as const;
export type StatusType = typeof statusOptions[number];

// Dashboard Stats Type
export type DashboardStats = {
  activeProjects: number;
  tasks: number;
  milestones: number;
  completed: number;
};

// User Schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name"),
  email: text("email"),
  initial: text("initial"),
  avatarColor: text("avatar_color"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  email: true,
  initial: true,
  avatarColor: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Project Schema
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  progress: integer("progress").notNull().default(0),
  status: text("status").notNull().default("On Track"),
  description: text("description"),
  startDate: text("start_date"),
  endDate: text("end_date"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  managerId: integer("manager_id").references(() => users.id),
  budget: integer("budget"),
});

export const insertProjectSchema = createInsertSchema(projects).pick({
  name: true,
  progress: true,
  status: true,
  description: true,
  startDate: true,
  endDate: true,
  managerId: true,
  budget: true,
});

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

// Task Schema
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  startDate: text("start_date"),
  dueDate: text("due_date").notNull(),
  completed: boolean("completed").notNull().default(false),
  projectId: integer("project_id").references(() => projects.id),
  assigneeId: integer("assignee_id").references(() => users.id),
  evidence: text("evidence"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertTaskSchema = createInsertSchema(tasks).pick({
  name: true,
  description: true,
  startDate: true,
  dueDate: true,
  completed: true,
  projectId: true,
  assigneeId: true,
  evidence: true,
});

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;

// Milestone Schema
export const milestones = pgTable("milestones", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  dueDate: text("due_date").notNull(),
  completed: boolean("completed").notNull().default(false),
  projectId: integer("project_id").references(() => projects.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertMilestoneSchema = createInsertSchema(milestones).pick({
  name: true,
  description: true,
  dueDate: true,
  completed: true,
  projectId: true,
});

export type InsertMilestone = z.infer<typeof insertMilestoneSchema>;
export type Milestone = typeof milestones.$inferSelect;

// Insight Schema
export const insights = pgTable("insights", {
  id: serial("id").primaryKey(),
  message: text("message").notNull(),
  projectId: integer("project_id").references(() => projects.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  type: text("type").default("info"), // info, warning, alert
});

export const insertInsightSchema = createInsertSchema(insights).pick({
  message: true,
  projectId: true,
  type: true,
});

export type InsertInsight = z.infer<typeof insertInsightSchema>;
export type Insight = typeof insights.$inferSelect;

// Team Members Schema (many-to-many relationship)
export const teamMembers = pgTable("team_members", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id),
  userId: integer("user_id").notNull().references(() => users.id),
  role: text("role").notNull().default("Member"), // Role in the project: Manager, Developer, Designer, etc.
  addedAt: timestamp("added_at").notNull().defaultNow(),
});

export const insertTeamMemberSchema = createInsertSchema(teamMembers).pick({
  projectId: true,
  userId: true,
  role: true,
});

export type InsertTeamMember = z.infer<typeof insertTeamMemberSchema>;
export type TeamMember = typeof teamMembers.$inferSelect;
