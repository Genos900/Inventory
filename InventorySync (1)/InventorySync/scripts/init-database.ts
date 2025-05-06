import { db } from "../server/db";
import { 
  users, 
  projects, 
  tasks, 
  milestones, 
  insights, 
  teamMembers 
} from "../shared/schema";
import { sql } from "drizzle-orm";

async function initDatabase() {
  console.log("Starting database initialization...");
  
  try {
    // Check if data already exists
    const userCount = await db.select({ count: sql<number>`count(*)` }).from(users);
    
    if (Number(userCount[0]?.count) > 0) {
      console.log("Database already has data. Skipping initialization.");
      return;
    }

    // Add sample users
    console.log("Adding sample users...");
    const insertedUsers = await db.insert(users).values([
      {
        username: "alex.garcia",
        password: "password123",
        name: "Alex Garcia",
        email: "alex.garcia@example.com",
        initial: "AG",
        avatarColor: "bg-blue-500"
      },
      {
        username: "maria.chen",
        password: "password123",
        name: "Maria Chen",
        email: "maria.chen@example.com",
        initial: "MC",
        avatarColor: "bg-purple-500"
      },
      {
        username: "jamal.williams",
        password: "password123",
        name: "Jamal Williams",
        email: "jamal.williams@example.com",
        initial: "JW",
        avatarColor: "bg-amber-500"
      },
      {
        username: "sofia.rodriguez",
        password: "password123",
        name: "Sofia Rodriguez",
        email: "sofia.rodriguez@example.com",
        initial: "SR",
        avatarColor: "bg-emerald-500"
      },
      {
        username: "karen.lee",
        password: "password123",
        name: "Karen Lee",
        email: "karen.lee@example.com",
        initial: "KL",
        avatarColor: "bg-emerald-500"
      }
    ]).returning();
    
    console.log(`Added ${insertedUsers.length} users.`);
    
    // Add sample projects
    console.log("Adding sample projects...");
    const insertedProjects = await db.insert(projects).values([
      {
        name: "Website Redesign",
        progress: 65,
        status: "On Track",
        description: "Complete overhaul of the company website with new branding and improved user experience.",
        startDate: "2023-04-01",
        endDate: "2023-07-15",
        managerId: insertedUsers[0].id,
        budget: 75000
      },
      {
        name: "Mobile App Development",
        progress: 30,
        status: "At Risk",
        description: "Creating a native mobile application for both iOS and Android platforms.",
        startDate: "2023-03-15",
        endDate: "2023-06-30",
        managerId: insertedUsers[1].id,
        budget: 120000
      },
      {
        name: "Cloud Migration",
        progress: 10,
        status: "On Track",
        description: "Migrating on-premise infrastructure to cloud-based solutions for improved scalability.",
        startDate: "2023-05-01",
        endDate: "2023-09-30",
        managerId: insertedUsers[2].id,
        budget: 200000
      },
      {
        name: "CRM Implementation",
        progress: 90,
        status: "Behind",
        description: "Implementing a new Customer Relationship Management system across the organization.",
        startDate: "2023-02-15",
        endDate: "2023-05-30",
        managerId: insertedUsers[3].id,
        budget: 85000
      },
      {
        name: "Marketing Campaign",
        progress: 45,
        status: "On Track",
        description: "Planning and executing a comprehensive digital marketing campaign for Q2.",
        startDate: "2023-04-15",
        endDate: "2023-08-30",
        managerId: insertedUsers[4].id,
        budget: 50000
      }
    ]).returning();
    
    console.log(`Added ${insertedProjects.length} projects.`);
    
    // Add team members to projects
    console.log("Adding team members to projects...");
    const teamMembersData = [];
    
    // Each project gets several team members
    for (let i = 0; i < insertedProjects.length; i++) {
      // Add manager as a team member
      teamMembersData.push({
        projectId: insertedProjects[i].id,
        userId: insertedProjects[i].managerId,
        role: "Project Manager"
      });
      
      // Add 2-3 other team members to each project
      for (let j = 0; j < insertedUsers.length; j++) {
        if (insertedUsers[j].id !== insertedProjects[i].managerId) {
          // Only add some users to each project
          if ((i + j) % 3 === 0) {
            teamMembersData.push({
              projectId: insertedProjects[i].id,
              userId: insertedUsers[j].id,
              role: ["Developer", "Designer", "Tester", "Business Analyst"][(i + j) % 4]
            });
          }
        }
      }
    }
    
    const insertedTeamMembers = await db.insert(teamMembers).values(teamMembersData).returning();
    console.log(`Added ${insertedTeamMembers.length} team members to projects.`);
    
    // Add sample tasks
    console.log("Adding sample tasks...");
    const taskData = [];
    
    // Project 1: Website Redesign
    taskData.push(
      {
        name: "Market Research & Requirements",
        description: "Conduct market research and gather requirements from stakeholders.",
        startDate: "2023-04-01",
        dueDate: "2023-04-10",
        completed: true,
        projectId: insertedProjects[0].id,
        assigneeId: insertedUsers[0].id
      },
      {
        name: "Design UI/UX",
        description: "Create wireframes and design mockups for the new website.",
        startDate: "2023-04-11",
        dueDate: "2023-04-25",
        completed: true,
        projectId: insertedProjects[0].id,
        assigneeId: insertedUsers[1].id
      },
      {
        name: "Frontend Development",
        description: "Implement the new design using React and Tailwind CSS.",
        startDate: "2023-04-26",
        dueDate: "2023-05-15",
        completed: false,
        projectId: insertedProjects[0].id,
        assigneeId: insertedUsers[2].id
      },
      {
        name: "Backend Integration",
        description: "Connect frontend to backend services and APIs.",
        startDate: "2023-05-10",
        dueDate: "2023-05-30",
        completed: false,
        projectId: insertedProjects[0].id,
        assigneeId: insertedUsers[3].id
      },
      {
        name: "Testing & Quality Assurance",
        description: "Perform comprehensive testing of the website.",
        startDate: "2023-06-01",
        dueDate: "2023-06-15",
        completed: false,
        projectId: insertedProjects[0].id,
        assigneeId: insertedUsers[4].id
      }
    );
    
    // Project 2: Mobile App Development
    taskData.push(
      {
        name: "Requirements Gathering",
        description: "Define app requirements and features.",
        startDate: "2023-03-15",
        dueDate: "2023-03-25",
        completed: true,
        projectId: insertedProjects[1].id,
        assigneeId: insertedUsers[1].id
      },
      {
        name: "App Design",
        description: "Create UI/UX design for mobile application.",
        startDate: "2023-03-26",
        dueDate: "2023-04-15",
        completed: true,
        projectId: insertedProjects[1].id,
        assigneeId: insertedUsers[0].id
      },
      {
        name: "iOS Development",
        description: "Develop the iOS version of the app.",
        startDate: "2023-04-16",
        dueDate: "2023-05-15",
        completed: false,
        projectId: insertedProjects[1].id,
        assigneeId: insertedUsers[2].id
      },
      {
        name: "Android Development",
        description: "Develop the Android version of the app.",
        startDate: "2023-04-16",
        dueDate: "2023-05-15",
        completed: false,
        projectId: insertedProjects[1].id,
        assigneeId: insertedUsers[3].id
      }
    );
    
    // Add a few tasks to other projects
    taskData.push(
      {
        name: "Current Infrastructure Assessment",
        description: "Analyze current infrastructure and identify migration candidates.",
        startDate: "2023-05-01",
        dueDate: "2023-05-15",
        completed: false,
        projectId: insertedProjects[2].id,
        assigneeId: insertedUsers[2].id
      },
      {
        name: "Cloud Architecture Design",
        description: "Design the target cloud architecture.",
        startDate: "2023-05-16",
        dueDate: "2023-06-15",
        completed: false,
        projectId: insertedProjects[2].id,
        assigneeId: insertedUsers[0].id
      },
      {
        name: "Requirements Gathering",
        description: "Collect requirements from all departments.",
        startDate: "2023-02-15",
        dueDate: "2023-02-28",
        completed: true,
        projectId: insertedProjects[3].id,
        assigneeId: insertedUsers[3].id
      },
      {
        name: "System Configuration",
        description: "Configure the CRM system based on requirements.",
        startDate: "2023-03-01",
        dueDate: "2023-04-15",
        completed: true,
        projectId: insertedProjects[3].id,
        assigneeId: insertedUsers[4].id
      },
      {
        name: "Data Migration",
        description: "Migrate data from old systems to new CRM.",
        startDate: "2023-04-16",
        dueDate: "2023-05-15",
        completed: false,
        projectId: insertedProjects[3].id,
        assigneeId: insertedUsers[1].id
      },
      {
        name: "Campaign Strategy",
        description: "Develop comprehensive marketing strategy.",
        startDate: "2023-04-15",
        dueDate: "2023-04-30",
        completed: true,
        projectId: insertedProjects[4].id,
        assigneeId: insertedUsers[4].id
      },
      {
        name: "Content Creation",
        description: "Create all content assets for the campaign.",
        startDate: "2023-05-01",
        dueDate: "2023-05-31",
        completed: false,
        projectId: insertedProjects[4].id,
        assigneeId: insertedUsers[1].id
      }
    );
    
    // Add additional tasks to reach 23 total
    const taskNames = [
      "Documentation", "User Testing", "Performance Optimization", 
      "Security Audit", "Stakeholder Meeting", "Training Materials"
    ];
    
    for (let i = 0; i < 4; i++) {
      taskData.push({
        name: taskNames[i % taskNames.length],
        description: `Additional task ${i+1} for project.`,
        startDate: "2023-05-15",
        dueDate: "2023-06-15",
        completed: false,
        projectId: insertedProjects[i % insertedProjects.length].id,
        assigneeId: insertedUsers[i % insertedUsers.length].id
      });
    }
    
    const insertedTasks = await db.insert(tasks).values(taskData).returning();
    console.log(`Added ${insertedTasks.length} tasks.`);
    
    // Add sample milestones
    console.log("Adding sample milestones...");
    const milestoneData = [];
    
    // Project 1: Website Redesign
    milestoneData.push(
      {
        name: "Design Phase Complete",
        description: "Completion of all design work including UI/UX and prototypes.",
        dueDate: "2023-04-30",
        completed: true,
        projectId: insertedProjects[0].id
      },
      {
        name: "MVP Launch",
        description: "Launch of minimum viable product to selected users.",
        dueDate: "2023-06-15",
        completed: false,
        projectId: insertedProjects[0].id
      }
    );
    
    // Project 2: Mobile App
    milestoneData.push(
      {
        name: "Design Approval",
        description: "Approval of final app designs by stakeholders.",
        dueDate: "2023-04-20",
        completed: true,
        projectId: insertedProjects[1].id
      },
      {
        name: "Beta Testing",
        description: "Start of beta testing phase with selected users.",
        dueDate: "2023-05-30",
        completed: false,
        projectId: insertedProjects[1].id
      }
    );
    
    // Add a milestone to the remaining projects
    milestoneData.push(
      {
        name: "Migration Plan Approval",
        description: "Approval of detailed migration plan by leadership.",
        dueDate: "2023-06-15",
        completed: false,
        projectId: insertedProjects[2].id
      },
      {
        name: "Go-Live",
        description: "Full deployment of CRM to all departments.",
        dueDate: "2023-05-30",
        completed: false,
        projectId: insertedProjects[3].id
      }
    );
    
    const insertedMilestones = await db.insert(milestones).values(milestoneData).returning();
    console.log(`Added ${insertedMilestones.length} milestones.`);
    
    // Add sample insights
    console.log("Adding sample insights...");
    const insightData = [
      {
        message: "Mobile App Development is at risk due to delayed iOS development. Recommend allocating additional resources.",
        projectId: insertedProjects[1].id,
        type: "warning"
      },
      {
        message: "Website Redesign has completed 65% of tasks ahead of schedule. Project is on track for early completion.",
        projectId: insertedProjects[0].id,
        type: "info"
      },
      {
        message: "CRM Implementation is behind schedule and requires immediate attention to meet the deadline.",
        projectId: insertedProjects[3].id,
        type: "alert"
      },
      {
        message: "Cloud Migration project has only completed 10% of tasks. Consider revising the timeline or adding resources.",
        projectId: insertedProjects[2].id,
        type: "warning"
      },
      {
        message: "Marketing Campaign is progressing as expected with 45% of tasks completed.",
        projectId: insertedProjects[4].id,
        type: "info"
      }
    ];
    
    const insertedInsights = await db.insert(insights).values(insightData).returning();
    console.log(`Added ${insertedInsights.length} insights.`);
    
    console.log("Database initialization completed successfully!");
    
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  } finally {
    // Close the connection pool if possible
    try {
      // The pool is exposed as client property in the drizzle instance
      if (db.client && typeof db.client.release === 'function') {
        await db.client.release(true);
      }
    } catch (error) {
      console.log('Note: Could not disconnect from database, but data was inserted successfully');
    }
  }
}

// Run the initialization script
initDatabase()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Database initialization failed:", error);
    process.exit(1);
  });