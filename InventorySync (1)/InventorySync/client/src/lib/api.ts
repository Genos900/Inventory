import { apiRequest } from "./queryClient";
import type { 
  Project, InsertProject, 
  Task, InsertTask,
  Milestone, InsertMilestone,
  Insight, InsertInsight,
  DashboardStats
} from "@shared/schema";

// Dashboard API
export const getDashboardStats = async (): Promise<DashboardStats> => {
  const res = await apiRequest("GET", "/api/stats");
  return res.json();
};

// Projects API
export const getProjects = async (): Promise<Project[]> => {
  const res = await apiRequest("GET", "/api/projects");
  return res.json();
};

export const getProject = async (id: number): Promise<Project> => {
  const res = await apiRequest("GET", `/api/projects/${id}`);
  return res.json();
};

export const createProject = async (project: InsertProject): Promise<Project> => {
  const res = await apiRequest("POST", "/api/projects", project);
  return res.json();
};

export const updateProject = async (id: number, project: Partial<InsertProject>): Promise<Project> => {
  const res = await apiRequest("PATCH", `/api/projects/${id}`, project);
  return res.json();
};

export const deleteProject = async (id: number): Promise<void> => {
  await apiRequest("DELETE", `/api/projects/${id}`);
};

// Tasks API
export const getTasks = async (projectId?: number): Promise<Task[]> => {
  const url = projectId ? `/api/tasks?projectId=${projectId}` : "/api/tasks";
  const res = await apiRequest("GET", url);
  return res.json();
};

export const createTask = async (task: InsertTask): Promise<Task> => {
  const res = await apiRequest("POST", "/api/tasks", task);
  return res.json();
};

export const updateTask = async (id: number, task: Partial<InsertTask>): Promise<Task> => {
  const res = await apiRequest("PATCH", `/api/tasks/${id}`, task);
  return res.json();
};

export const deleteTask = async (id: number): Promise<void> => {
  await apiRequest("DELETE", `/api/tasks/${id}`);
};

// Milestones API
export const getMilestones = async (projectId?: number): Promise<Milestone[]> => {
  const url = projectId ? `/api/milestones?projectId=${projectId}` : "/api/milestones";
  const res = await apiRequest("GET", url);
  return res.json();
};

export const createMilestone = async (milestone: InsertMilestone): Promise<Milestone> => {
  const res = await apiRequest("POST", "/api/milestones", milestone);
  return res.json();
};

export const updateMilestone = async (id: number, milestone: Partial<InsertMilestone>): Promise<Milestone> => {
  const res = await apiRequest("PATCH", `/api/milestones/${id}`, milestone);
  return res.json();
};

export const deleteMilestone = async (id: number): Promise<void> => {
  await apiRequest("DELETE", `/api/milestones/${id}`);
};

// Insights API
export const getInsights = async (projectId?: number): Promise<Insight[]> => {
  const url = projectId ? `/api/insights?projectId=${projectId}` : "/api/insights";
  const res = await apiRequest("GET", url);
  return res.json();
};

export const createInsight = async (insight: InsertInsight): Promise<Insight> => {
  const res = await apiRequest("POST", "/api/insights", insight);
  return res.json();
};

export const generateAIInsights = async (): Promise<Insight[]> => {
  const res = await apiRequest("POST", "/api/generate-insights");
  return res.json();
};
