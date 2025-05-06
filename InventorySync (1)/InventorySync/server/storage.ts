import { eq, and, sql } from "drizzle-orm";
import { 
  InsertProject, Project, projects,
  InsertTask, Task, tasks,
  InsertMilestone, Milestone, milestones,
  InsertInsight, Insight, insights,
  DashboardStats,
  InsertUser, User, users,
  statusOptions
} from "@shared/schema";

// Use dynamic import to get database - if it fails, we'll use MemStorage instead
let db: any;
let useMemStorage = false;

// We need to use a function since top-level await isn't allowed
async function setupDatabase() {
  try {
    // Use dynamic import which works in ESM
    const { db: dbInstance } = await import('./db');
    db = dbInstance;
    return true;
  } catch (error) {
    console.error("Database connection error, using in-memory storage", error);
    useMemStorage = true;
    return false;
  }
}

// Create a promise for database initialization
const dbInitPromise = setupDatabase().catch((error) => {
  console.error("Failed to initialize database:", error);
  useMemStorage = true;
  return false;
});

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Project methods
  getProjects(): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;
  
  // Task methods
  getTasks(): Promise<Task[]>;
  getTasksByProject(projectId: number): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;
  
  // Milestone methods
  getMilestones(): Promise<Milestone[]>;
  getMilestonesByProject(projectId: number): Promise<Milestone[]>;
  createMilestone(milestone: InsertMilestone): Promise<Milestone>;
  updateMilestone(id: number, milestone: Partial<InsertMilestone>): Promise<Milestone | undefined>;
  deleteMilestone(id: number): Promise<boolean>;
  
  // Insight methods
  getInsights(): Promise<Insight[]>;
  getInsightsByProject(projectId: number): Promise<Insight[]>;
  createInsight(insight: InsertInsight): Promise<Insight>;
  
  // Stats methods
  getDashboardStats(): Promise<DashboardStats>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [insertedUser] = await db.insert(users).values(user).returning();
    return insertedUser;
  }

  async getProjects(): Promise<Project[]> {
    return await db.select().from(projects);
  }

  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }

  async createProject(project: InsertProject): Promise<Project> {
    const [insertedProject] = await db.insert(projects).values(project).returning();
    return insertedProject;
  }

  async updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined> {
    const [updatedProject] = await db
      .update(projects)
      .set({ ...project, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return updatedProject;
  }

  async deleteProject(id: number): Promise<boolean> {
    const result = await db.delete(projects).where(eq(projects.id, id));
    return result.rowCount != null && result.rowCount > 0;
  }

  async getTasks(): Promise<Task[]> {
    return await db.select().from(tasks);
  }

  async getTasksByProject(projectId: number): Promise<Task[]> {
    return await db.select().from(tasks).where(eq(tasks.projectId, projectId));
  }

  async createTask(task: InsertTask): Promise<Task> {
    const [insertedTask] = await db.insert(tasks).values(task).returning();
    return insertedTask;
  }

  async updateTask(id: number, task: Partial<InsertTask>): Promise<Task | undefined> {
    const [updatedTask] = await db
      .update(tasks)
      .set({ ...task, updatedAt: new Date() })
      .where(eq(tasks.id, id))
      .returning();
    return updatedTask;
  }

  async deleteTask(id: number): Promise<boolean> {
    const result = await db.delete(tasks).where(eq(tasks.id, id));
    return result.rowCount != null && result.rowCount > 0;
  }

  async getMilestones(): Promise<Milestone[]> {
    return await db.select().from(milestones);
  }

  async getMilestonesByProject(projectId: number): Promise<Milestone[]> {
    return await db.select().from(milestones).where(eq(milestones.projectId, projectId));
  }

  async createMilestone(milestone: InsertMilestone): Promise<Milestone> {
    const [insertedMilestone] = await db.insert(milestones).values(milestone).returning();
    return insertedMilestone;
  }

  async updateMilestone(id: number, milestone: Partial<InsertMilestone>): Promise<Milestone | undefined> {
    const [updatedMilestone] = await db
      .update(milestones)
      .set(milestone)
      .where(eq(milestones.id, id))
      .returning();
    return updatedMilestone;
  }

  async deleteMilestone(id: number): Promise<boolean> {
    const result = await db.delete(milestones).where(eq(milestones.id, id));
    return result.rowCount != null && result.rowCount > 0;
  }

  async getInsights(): Promise<Insight[]> {
    return await db.select().from(insights);
  }

  async getInsightsByProject(projectId: number): Promise<Insight[]> {
    return await db.select().from(insights).where(eq(insights.projectId, projectId));
  }

  async createInsight(insight: InsertInsight): Promise<Insight> {
    const [insertedInsight] = await db.insert(insights).values(insight).returning();
    return insertedInsight;
  }

  async getDashboardStats(): Promise<DashboardStats> {
    const projectsCount = await db.select({ count: sql<number>`count(*)` }).from(projects);
    const tasksCount = await db.select({ count: sql<number>`count(*)` }).from(tasks);
    const milestonesCount = await db.select({ count: sql<number>`count(*)` }).from(milestones);
    const completedTasksCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(tasks)
      .where(eq(tasks.completed, true));

    return {
      activeProjects: projectsCount[0]?.count || 0,
      tasks: tasksCount[0]?.count || 0,
      milestones: milestonesCount[0]?.count || 0,
      completed: completedTasksCount[0]?.count || 0
    };
  }
}

// Initialize the database with sample data if needed
async function initializeSampleData() {
  // Check if we have any users
  const userCount = await db.select({ count: sql<number>`count(*)` }).from(users);
  
  if (userCount[0]?.count === 0) {
    // Add sample admin user
    await db.insert(users).values({
      username: "admin",
      password: "password",
      name: "Admin User",
      initial: "A",
      avatarColor: "bg-blue-500"
    });
    
    // Add sample projects
    const projectValues = [
      {
        name: "Project Alpha",
        progress: 65,
        status: "On Track",
        description: "Enterprise software implementation for client A",
        startDate: "2023-04-01",
        endDate: "2023-07-15"
      },
      {
        name: "Project Beta",
        progress: 30,
        status: "At Risk",
        description: "Mobile application development for client B",
        startDate: "2023-03-15",
        endDate: "2023-06-30"
      },
      {
        name: "Project Gamma",
        progress: 10,
        status: "On Track",
        description: "Cloud migration project for client C",
        startDate: "2023-05-01",
        endDate: "2023-09-30"
      },
      {
        name: "Project Delta",
        progress: 90,
        status: "Behind",
        description: "Website redesign for client D",
        startDate: "2023-02-15",
        endDate: "2023-05-30"
      },
      {
        name: "Project Epsilon",
        progress: 45,
        status: "On Track",
        description: "Data analytics solution for client E",
        startDate: "2023-04-15",
        endDate: "2023-08-30"
      }
    ];
    
    for (const project of projectValues) {
      await db.insert(projects).values(project);
    }
    
    // Add sample tasks
    const taskValues = [
      {
        name: "Design Interface",
        dueDate: "Apr 25",
        startDate: "Apr 15",
        completed: false,
        projectId: 1
      },
      {
        name: "Set up Database",
        dueDate: "Apr 27",
        startDate: "Apr 20",
        completed: true,
        projectId: 1
      },
      {
        name: "Implement Authentication",
        dueDate: "May 5",
        startDate: "Apr 28",
        completed: false,
        projectId: 1
      },
      {
        name: "API Development",
        dueDate: "May 10",
        startDate: "Apr 25",
        completed: false,
        projectId: 2
      },
      {
        name: "Testing",
        dueDate: "May 15",
        startDate: "May 5",
        completed: false,
        projectId: 2
      }
    ];
    
    for (const task of taskValues) {
      await db.insert(tasks).values(task);
    }
    
    // Add additional tasks to reach 23 total
    for (let i = 1; i <= 18; i++) {
      await db.insert(tasks).values({
        name: `Task ${i + 5}`,
        dueDate: "May 15",
        startDate: "May 1",
        completed: false,
        projectId: i % 5 + 1
      });
    }
    
    // Add sample milestones
    const milestoneValues = [
      {
        name: "MVP Release",
        dueDate: "2023-05-30",
        completed: false,
        projectId: 1
      },
      {
        name: "Beta Launch",
        dueDate: "2023-06-15",
        completed: false,
        projectId: 1
      },
      {
        name: "Client Presentation",
        dueDate: "2023-05-10",
        completed: false,
        projectId: 2
      }
    ];
    
    for (const milestone of milestoneValues) {
      await db.insert(milestones).values(milestone);
    }
    
    // Add additional milestones to reach 6 total
    for (let i = 1; i <= 3; i++) {
      await db.insert(milestones).values({
        name: `Milestone ${i + 3}`,
        dueDate: "2023-06-30",
        completed: false,
        projectId: i % 5 + 1
      });
    }
    
    // Add sample insights
    const insightValues = [
      {
        message: "Project Beta is at risk due to delayed API development.",
        projectId: 2,
        type: "warning"
      },
      {
        message: "Project Alpha has completed 65% of tasks ahead of schedule.",
        projectId: 1,
        type: "info"
      },
      {
        message: "Project Delta is behind schedule and requires attention.",
        projectId: 4,
        type: "alert"
      }
    ];
    
    for (const insight of insightValues) {
      await db.insert(insights).values(insight);
    }
  }
}

// Create an in-memory storage class as a fallback
export class MemStorage implements IStorage {
  private users: User[] = [];
  private projects: Project[] = [];
  private tasks: Task[] = [];
  private milestones: Milestone[] = [];
  private insights: Insight[] = [];
  private lastIds = {
    users: 0,
    projects: 0,
    tasks: 0,
    milestones: 0,
    insights: 0
  };

  constructor() {
    // Add sample data - initialize the data in the background
    // Don't block or wait for it to complete, as this is just sample data
    this.initializeSampleData().catch(error => {
      console.error("Error initializing sample data in MemStorage", error);
    });
  }

  private async initializeSampleData() {
    // Add sample user - we need to await these since they return promises
    const admin = await this.createUser({
      username: "admin",
      password: "password",
      name: "Admin User",
      email: "admin@example.com",
      initial: "A",
      avatarColor: "bg-blue-500"
    });

    // Add sample projects - we need to await these since they return promises
    const projectAlpha = await this.createProject({
      name: "Website Redesign",
      progress: 65,
      status: "On Track",
      description: "Complete overhaul of the company website with new branding and improved user experience.",
      startDate: "2023-04-01",
      endDate: "2023-07-15",
      managerId: admin.id,
      budget: 75000
    });

    const projectBeta = await this.createProject({
      name: "Mobile App Development",
      progress: 30,
      status: "At Risk",
      description: "Creating a native mobile application for both iOS and Android platforms.",
      startDate: "2023-03-15",
      endDate: "2023-06-30",
      managerId: admin.id,
      budget: 120000
    });

    const projectGamma = await this.createProject({
      name: "Cloud Migration",
      progress: 10,
      status: "On Track",
      description: "Migrating on-premise infrastructure to cloud-based solutions for improved scalability.",
      startDate: "2023-05-01",
      endDate: "2023-09-30",
      managerId: admin.id,
      budget: 200000
    });

    const projectDelta = await this.createProject({
      name: "CRM Implementation",
      progress: 90,
      status: "Behind",
      description: "Implementing a new Customer Relationship Management system across the organization.",
      startDate: "2023-02-15",
      endDate: "2023-05-30",
      managerId: admin.id,
      budget: 85000
    });

    const projectEpsilon = await this.createProject({
      name: "Marketing Campaign",
      progress: 45,
      status: "On Track",
      description: "Planning and executing a comprehensive digital marketing campaign for Q2.",
      startDate: "2023-04-15",
      endDate: "2023-08-30",
      managerId: admin.id,
      budget: 50000
    });
    
    // Add sample tasks
    await this.createTask({
      name: "Market Research & Requirements",
      description: "Conduct market research and gather requirements from stakeholders.",
      startDate: "2023-04-01",
      dueDate: "2023-04-10",
      completed: true,
      projectId: projectAlpha.id,
      assigneeId: admin.id
    });

    this.createTask({
      name: "Design UI/UX",
      description: "Create wireframes and design mockups for the new website.",
      startDate: "2023-04-11",
      dueDate: "2023-04-25",
      completed: true,
      projectId: projectAlpha.id,
      assigneeId: admin.id
    });

    this.createTask({
      name: "Frontend Development",
      description: "Implement the new design using React and Tailwind CSS.",
      startDate: "2023-04-26",
      dueDate: "2023-05-15",
      completed: false,
      projectId: projectAlpha.id,
      assigneeId: admin.id
    });

    this.createTask({
      name: "Backend Integration",
      description: "Connect frontend to backend services and APIs.",
      startDate: "2023-05-10",
      dueDate: "2023-05-30",
      completed: false,
      projectId: projectAlpha.id,
      assigneeId: admin.id
    });

    // Add a few more tasks
    for (let i = 0; i < 16; i++) {
      this.createTask({
        name: `Task ${i + 5}`,
        description: `Description for task ${i + 5}`,
        startDate: "2023-05-01",
        dueDate: "2023-05-15",
        completed: i % 3 === 0,
        projectId: (i % 5) + 1,
        assigneeId: admin.id
      });
    }

    // Add sample milestones
    this.createMilestone({
      name: "Design Phase Complete",
      description: "Completion of all design work including UI/UX and prototypes.",
      dueDate: "2023-04-30",
      completed: true,
      projectId: projectAlpha.id
    });

    this.createMilestone({
      name: "MVP Launch",
      description: "Launch of minimum viable product to selected users.",
      dueDate: "2023-06-15",
      completed: false,
      projectId: projectAlpha.id
    });

    this.createMilestone({
      name: "Design Approval",
      description: "Approval of final app designs by stakeholders.",
      dueDate: "2023-04-20",
      completed: true,
      projectId: projectBeta.id
    });

    this.createMilestone({
      name: "Beta Testing",
      description: "Start of beta testing phase with selected users.",
      dueDate: "2023-05-30",
      completed: false,
      projectId: projectBeta.id
    });

    this.createMilestone({
      name: "Migration Plan Approval",
      description: "Approval of detailed migration plan by leadership.",
      dueDate: "2023-06-15",
      completed: false,
      projectId: projectGamma.id
    });

    this.createMilestone({
      name: "Go-Live",
      description: "Full deployment of CRM to all departments.",
      dueDate: "2023-05-30",
      completed: false,
      projectId: projectDelta.id
    });

    // Add sample insights
    this.createInsight({
      message: "Mobile App Development is at risk due to delayed API development. Recommend allocating additional resources.",
      projectId: projectBeta.id,
      type: "warning"
    });

    this.createInsight({
      message: "Website Redesign has completed 65% of tasks ahead of schedule. Project is on track for early completion.",
      projectId: projectAlpha.id,
      type: "info"
    });

    this.createInsight({
      message: "CRM Implementation is behind schedule and requires immediate attention to meet the deadline.",
      projectId: projectDelta.id,
      type: "alert"
    });

    this.createInsight({
      message: "Cloud Migration project has only completed 10% of tasks. Consider revising the timeline or adding resources.",
      projectId: projectGamma.id,
      type: "warning"
    });

    this.createInsight({
      message: "Marketing Campaign is progressing as expected with 45% of tasks completed.",
      projectId: projectEpsilon.id,
      type: "info"
    });
  }

  // Implement IStorage methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.find(user => user.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.users.find(user => user.username === username);
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = ++this.lastIds.users;
    const now = new Date();
    const newUser: User = {
      ...user,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.users.push(newUser);
    return newUser;
  }

  async getProjects(): Promise<Project[]> {
    return this.projects;
  }

  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.find(project => project.id === id);
  }

  async createProject(project: InsertProject): Promise<Project> {
    const id = ++this.lastIds.projects;
    const now = new Date();
    const newProject: Project = {
      ...project,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.projects.push(newProject);
    return newProject;
  }

  async updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined> {
    const index = this.projects.findIndex(p => p.id === id);
    if (index === -1) return undefined;
    
    this.projects[index] = {
      ...this.projects[index],
      ...project,
      updatedAt: new Date()
    };
    return this.projects[index];
  }

  async deleteProject(id: number): Promise<boolean> {
    const index = this.projects.findIndex(p => p.id === id);
    if (index === -1) return false;
    
    this.projects.splice(index, 1);
    return true;
  }

  async getTasks(): Promise<Task[]> {
    return this.tasks;
  }

  async getTasksByProject(projectId: number): Promise<Task[]> {
    return this.tasks.filter(task => task.projectId === projectId);
  }

  async createTask(task: InsertTask): Promise<Task> {
    const id = ++this.lastIds.tasks;
    const now = new Date();
    const newTask: Task = {
      ...task,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.tasks.push(newTask);
    return newTask;
  }

  async updateTask(id: number, task: Partial<InsertTask>): Promise<Task | undefined> {
    const index = this.tasks.findIndex(t => t.id === id);
    if (index === -1) return undefined;
    
    this.tasks[index] = {
      ...this.tasks[index],
      ...task,
      updatedAt: new Date()
    };
    return this.tasks[index];
  }

  async deleteTask(id: number): Promise<boolean> {
    const index = this.tasks.findIndex(t => t.id === id);
    if (index === -1) return false;
    
    this.tasks.splice(index, 1);
    return true;
  }

  async getMilestones(): Promise<Milestone[]> {
    return this.milestones;
  }

  async getMilestonesByProject(projectId: number): Promise<Milestone[]> {
    return this.milestones.filter(milestone => milestone.projectId === projectId);
  }

  async createMilestone(milestone: InsertMilestone): Promise<Milestone> {
    const id = ++this.lastIds.milestones;
    const now = new Date();
    const newMilestone: Milestone = {
      ...milestone,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.milestones.push(newMilestone);
    return newMilestone;
  }

  async updateMilestone(id: number, milestone: Partial<InsertMilestone>): Promise<Milestone | undefined> {
    const index = this.milestones.findIndex(m => m.id === id);
    if (index === -1) return undefined;
    
    this.milestones[index] = {
      ...this.milestones[index],
      ...milestone,
      updatedAt: new Date()
    };
    return this.milestones[index];
  }

  async deleteMilestone(id: number): Promise<boolean> {
    const index = this.milestones.findIndex(m => m.id === id);
    if (index === -1) return false;
    
    this.milestones.splice(index, 1);
    return true;
  }

  async getInsights(): Promise<Insight[]> {
    return this.insights;
  }

  async getInsightsByProject(projectId: number): Promise<Insight[]> {
    return this.insights.filter(insight => insight.projectId === projectId);
  }

  async createInsight(insight: InsertInsight): Promise<Insight> {
    const id = ++this.lastIds.insights;
    const now = new Date();
    const newInsight: Insight = {
      ...insight,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.insights.push(newInsight);
    return newInsight;
  }

  async getDashboardStats(): Promise<DashboardStats> {
    return {
      activeProjects: this.projects.length,
      tasks: this.tasks.length,
      milestones: this.milestones.length,
      completed: this.tasks.filter(task => task.completed).length
    };
  }
}

// Create storage instances - we choose which to export later
let databaseStorage: DatabaseStorage;
let memStorage: MemStorage;

// Initialize and export the storage instance
async function initializeStorage(): Promise<IStorage> {
  try {
    // First, make sure the database is initialized
    await dbInitPromise;
    
    if (useMemStorage) {
      console.log("Using in-memory storage");
      memStorage = new MemStorage();
      return memStorage;
    } else {
      console.log("Using database storage");
      databaseStorage = new DatabaseStorage();
      
      // Initialize sample data when the application starts and using database storage
      await initializeSampleData();
      return databaseStorage;
    }
  } catch (error) {
    console.error("Error initializing storage:", error);
    console.log("Falling back to in-memory storage due to error");
    memStorage = new MemStorage();
    return memStorage;
  }
}

// Initialize immediately - use a promise that resolves to our storage instance
const storagePromise = initializeStorage();

// Export a storage proxy that delegates to the actual implementation
// This way we don't need to await the storage initialization in every import
export const storage: IStorage = new Proxy({} as IStorage, {
  get(target, prop) {
    // Return a function that awaits the actual storage and then calls the requested method
    return async (...args: any[]) => {
      const actualStorage = await storagePromise;
      // @ts-ignore - we know the property exists on the actual storage
      return actualStorage[prop](...args);
    };
  }
});
