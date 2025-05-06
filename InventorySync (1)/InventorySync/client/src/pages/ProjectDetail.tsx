import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { getProject, updateProject, getTasks, getMilestones } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Project, Task, Milestone, InsertProject, InsertTask, statusOptions } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";

import {
  ArrowLeft,
  Clock,
  Paperclip,
  Users,
  Calendar,
  ChevronRight,
  BarChart3,
  FileText,
  Folder,
  Edit,
  Plus,
  Check,
  CheckCircle2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ProjectTaskProps {
  id: number;
  name: string;
  startDate: string;
  dueDate: string;
  completed: boolean;
  responsible: {
    name: string;
    initial: string;
    color: string;
  };
}

interface GanttTaskProps {
  name: string;
  startCol: number;
  span: number;
}

export default function ProjectDetail() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  
  // Extract project ID from URL
  const projectId = parseInt(window.location.pathname.split("/").pop() || "1");
  
  // Fetch project data
  const { data: project, isLoading, error } = useQuery<Project>({
    queryKey: ["/api/projects", projectId],
    queryFn: () => getProject(projectId),
    enabled: !isNaN(projectId)
  });

  // Fetch tasks for this project
  const { data: tasks } = useQuery<Task[]>({
    queryKey: ["/api/tasks", projectId],
    queryFn: () => getTasks(projectId),
    enabled: !isNaN(projectId)
  });

  // Fetch milestones for this project
  const { data: milestones } = useQuery<Milestone[]>({
    queryKey: ["/api/milestones", projectId],
    queryFn: () => getMilestones(projectId),
    enabled: !isNaN(projectId)
  });

  // Update project mutation
  const updateProjectMutation = useMutation({
    mutationFn: (project: Partial<InsertProject>) => updateProject(projectId, project),
    onSuccess: () => {
      toast({ title: "Project updated", description: "Project has been updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
    onError: () => {
      toast({ 
        title: "Error", 
        description: "Failed to update project", 
        variant: "destructive" 
      });
    }
  });

  // Handle error
  useEffect(() => {
    if (error) {
      toast({ 
        title: "Error", 
        description: "Failed to load project data", 
        variant: "destructive" 
      });
    }
  }, [error, toast]);

  // Sample data for visualization
  const projectTasks: ProjectTaskProps[] = tasks?.map(task => ({
    id: task.id,
    name: task.name,
    startDate: new Date(task.startDate || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    dueDate: new Date(task.dueDate || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    completed: task.completed || false,
    responsible: {
      name: "Alex Garcia",
      initial: "AG",
      color: "bg-blue-500"
    }
  })) || [
    {
      id: 1,
      name: "Research & Requirements",
      startDate: "Apr 12",
      dueDate: "Apr 18",
      completed: true,
      responsible: {
        name: "Alex Garcia",
        initial: "AG",
        color: "bg-blue-500"
      }
    },
    {
      id: 2,
      name: "Design UI/UX",
      startDate: "Apr 19",
      dueDate: "Apr 30",
      completed: false,
      responsible: {
        name: "Maria Chen",
        initial: "MC",
        color: "bg-purple-500"
      }
    },
    {
      id: 3,
      name: "Frontend Development",
      startDate: "May 1",
      dueDate: "May 15",
      completed: false,
      responsible: {
        name: "Jamal Williams",
        initial: "JW",
        color: "bg-amber-500"
      }
    },
    {
      id: 4,
      name: "Backend Integration",
      startDate: "May 10",
      dueDate: "May 20",
      completed: false,
      responsible: {
        name: "Sofia Rodriguez",
        initial: "SR",
        color: "bg-emerald-500"
      }
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "On Track":
        return "text-green-600 bg-green-100";
      case "At Risk":
        return "text-amber-600 bg-amber-100";
      case "Behind":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  // Gantt chart data
  const timelineDates = ["Apr 1", "Apr 8", "Apr 15", "Apr 22", "Apr 29", "May 6", "May 13", "May 20", "May 27", "Jun 3"];
  
  const ganttTasks: GanttTaskProps[] = [
    { name: "Research", startCol: 1, span: 2 },
    { name: "Design", startCol: 3, span: 2 },
    { name: "Development", startCol: 4, span: 4 },
    { name: "Testing", startCol: 7, span: 2 },
    { name: "Deployment", startCol: 9, span: 1 }
  ];

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Skeleton className="h-8 w-[300px]" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-[200px] col-span-1" />
          <Skeleton className="h-[200px] col-span-1" />
          <Skeleton className="h-[200px] col-span-1" />
        </div>
        
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center mb-8">
        <Button 
          variant="ghost" 
          size="icon" 
          className="mr-4"
          onClick={() => navigate("/projects")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">{project?.name || "Project Details"}</h1>
          <div className="flex items-center text-sm text-neutral-500 mt-1">
            <Clock className="h-4 w-4 mr-1" />
            <span className="mr-4">
              {project?.startDate && new Date(project.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} - 
              {project?.endDate && new Date(project.endDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
            <Badge variant="outline" className={cn("rounded-full px-3 py-1 text-xs font-medium", getStatusColor(project?.status || "On Track"))}>
              {project?.status || "On Track"}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500">Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">{project?.progress || 0}%</div>
            <Progress 
              value={project?.progress || 0} 
              className="h-2 bg-neutral-200" 
              indicatorClassName="bg-primary" 
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500">Team</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="flex items-center mb-4">
              <div className="flex -space-x-2 mr-3">
                <Avatar className="h-8 w-8 border-2 border-white">
                  <AvatarFallback className="bg-blue-500 text-white">AG</AvatarFallback>
                </Avatar>
                <Avatar className="h-8 w-8 border-2 border-white">
                  <AvatarFallback className="bg-purple-500 text-white">MC</AvatarFallback>
                </Avatar>
                <Avatar className="h-8 w-8 border-2 border-white">
                  <AvatarFallback className="bg-amber-500 text-white">JW</AvatarFallback>
                </Avatar>
                <div className="h-8 w-8 rounded-full bg-neutral-100 border-2 border-white flex items-center justify-center text-xs font-medium text-neutral-500">
                  +2
                </div>
              </div>
              <Button variant="ghost" size="sm" className="h-7 text-xs">
                <Plus className="h-3 w-3 mr-1" />
                Add
              </Button>
            </div>
            <div className="text-sm text-neutral-600">
              <div className="flex items-center justify-between mb-1">
                <span>Team Members</span>
                <span className="font-medium">5</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Departments</span>
                <span className="font-medium">3</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500">Time Remaining</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-3xl font-bold mb-2">14 Days</div>
            <div className="text-sm text-neutral-500">Due on {project?.endDate && new Date(project.endDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</div>
            <div className="mt-4">
              <div className="text-sm font-medium">Important Dates:</div>
              <div className="mt-2 space-y-2 text-sm">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-neutral-400" />
                  <span>Design Review: May 7</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-neutral-400" />
                  <span>Stakeholder Meeting: May 15</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full border-b bg-white p-0 h-auto">
          <div className="flex space-x-6 px-6">
            <TabsTrigger 
              value="overview" 
              className={cn(
                "py-3 px-1 font-medium text-sm rounded-none border-b-2 border-transparent",
                activeTab === "overview" ? "border-primary text-primary" : "text-neutral-500"
              )}
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="time-plan" 
              className={cn(
                "py-3 px-1 font-medium text-sm rounded-none border-b-2 border-transparent",
                activeTab === "time-plan" ? "border-primary text-primary" : "text-neutral-500"
              )}
            >
              Time Plan
            </TabsTrigger>
            <TabsTrigger 
              value="tasks" 
              className={cn(
                "py-3 px-1 font-medium text-sm rounded-none border-b-2 border-transparent",
                activeTab === "tasks" ? "border-primary text-primary" : "text-neutral-500"
              )}
            >
              Tasks
            </TabsTrigger>
            <TabsTrigger 
              value="costs" 
              className={cn(
                "py-3 px-1 font-medium text-sm rounded-none border-b-2 border-transparent",
                activeTab === "costs" ? "border-primary text-primary" : "text-neutral-500"
              )}
            >
              Costs
            </TabsTrigger>
            <TabsTrigger 
              value="documents" 
              className={cn(
                "py-3 px-1 font-medium text-sm rounded-none border-b-2 border-transparent",
                activeTab === "documents" ? "border-primary text-primary" : "text-neutral-500"
              )}
            >
              Documents
            </TabsTrigger>
          </div>
        </TabsList>
        
        <TabsContent value="overview" className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="col-span-2">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg font-semibold">Project Details</CardTitle>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-neutral-500 mb-1">Description</h3>
                      <p className="text-sm text-neutral-700">
                        {project?.description || "This project aims to create a comprehensive project management application with modern UI, real-time updates, and collaborative features. The system will include dashboards, task management, team coordination, and reporting capabilities."}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-neutral-500 mb-1">Objectives</h3>
                      <ul className="text-sm text-neutral-700 space-y-1 pl-5 list-disc">
                        <li>Develop an intuitive and responsive user interface</li>
                        <li>Implement real-time collaboration features</li>
                        <li>Create comprehensive reporting and analytics</li>
                        <li>Ensure scalability and performance</li>
                        <li>Deploy with minimal downtime</li>
                      </ul>
                    </div>
                    
                    <Separator />
                    
                    <div className="pt-2">
                      <div className="flex flex-col md:flex-row md:gap-12">
                        <div className="mb-4 md:mb-0">
                          <h3 className="text-sm font-medium text-neutral-500 mb-2">Project Manager</h3>
                          <div className="flex items-center">
                            <Avatar className="h-8 w-8 mr-2">
                              <AvatarFallback className="bg-blue-500 text-white">AG</AvatarFallback>
                            </Avatar>
                            <div className="text-sm">
                              <div className="font-medium">Alex Garcia</div>
                              <div className="text-neutral-500">alex.garcia@example.com</div>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium text-neutral-500 mb-2">Project Sponsor</h3>
                          <div className="flex items-center">
                            <Avatar className="h-8 w-8 mr-2">
                              <AvatarFallback className="bg-emerald-500 text-white">KL</AvatarFallback>
                            </Avatar>
                            <div className="text-sm">
                              <div className="font-medium">Karen Lee</div>
                              <div className="text-neutral-500">karen.lee@example.com</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="mt-6">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex">
                      <div className="mr-4 mt-1">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-purple-500 text-white">MC</AvatarFallback>
                        </Avatar>
                      </div>
                      <div>
                        <div className="flex items-center">
                          <span className="font-medium text-sm">Maria Chen</span>
                          <span className="mx-2 text-neutral-400">·</span>
                          <span className="text-xs text-neutral-500">2 hours ago</span>
                        </div>
                        <p className="text-sm mt-1">Completed the initial wireframes for the dashboard interface.</p>
                      </div>
                    </div>
                    
                    <div className="flex">
                      <div className="mr-4 mt-1">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-amber-500 text-white">JW</AvatarFallback>
                        </Avatar>
                      </div>
                      <div>
                        <div className="flex items-center">
                          <span className="font-medium text-sm">Jamal Williams</span>
                          <span className="mx-2 text-neutral-400">·</span>
                          <span className="text-xs text-neutral-500">Yesterday</span>
                        </div>
                        <p className="text-sm mt-1">Added new API endpoints for user authentication.</p>
                      </div>
                    </div>
                    
                    <div className="flex">
                      <div className="mr-4 mt-1">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-blue-500 text-white">AG</AvatarFallback>
                        </Avatar>
                      </div>
                      <div>
                        <div className="flex items-center">
                          <span className="font-medium text-sm">Alex Garcia</span>
                          <span className="mx-2 text-neutral-400">·</span>
                          <span className="text-xs text-neutral-500">2 days ago</span>
                        </div>
                        <p className="text-sm mt-1">Updated the project timeline and assigned new tasks.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold">Key Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-neutral-500">Budget Utilization</span>
                        <span className="text-sm font-medium">72%</span>
                      </div>
                      <Progress value={72} className="h-2 bg-neutral-200" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-neutral-500">Time Utilization</span>
                        <span className="text-sm font-medium">65%</span>
                      </div>
                      <Progress value={65} className="h-2 bg-neutral-200" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-neutral-500">Tasks Completed</span>
                        <span className="text-sm font-medium">48%</span>
                      </div>
                      <Progress value={48} className="h-2 bg-neutral-200" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold">Upcoming Milestones</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(milestones || []).map((milestone, index) => (
                      <div key={milestone.id || index} className="border-l-2 border-primary pl-4">
                        <h3 className="text-sm font-medium">{milestone.name}</h3>
                        <div className="text-xs text-neutral-500 mt-1">
                          Due on {new Date(milestone.dueDate || Date.now()).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                        </div>
                      </div>
                    ))}
                    
                    {(!milestones || milestones.length === 0) && (
                      <>
                        <div className="border-l-2 border-primary pl-4">
                          <h3 className="text-sm font-medium">Design Phase Complete</h3>
                          <div className="text-xs text-neutral-500 mt-1">Due on May 7</div>
                        </div>
                        
                        <div className="border-l-2 border-amber-500 pl-4">
                          <h3 className="text-sm font-medium">MVP Development</h3>
                          <div className="text-xs text-neutral-500 mt-1">Due on May 20</div>
                        </div>
                        
                        <div className="border-l-2 border-neutral-300 pl-4">
                          <h3 className="text-sm font-medium">User Testing</h3>
                          <div className="text-xs text-neutral-500 mt-1">Due on May 27</div>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold">Files & Attachments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center p-2 border border-neutral-200 rounded-md hover:bg-neutral-50 cursor-pointer">
                      <div className="bg-blue-100 p-2 rounded mr-3">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">Project Proposal.pdf</div>
                        <div className="text-xs text-neutral-500">4.2 MB · Apr 12</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center p-2 border border-neutral-200 rounded-md hover:bg-neutral-50 cursor-pointer">
                      <div className="bg-emerald-100 p-2 rounded mr-3">
                        <FileText className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">Requirements.docx</div>
                        <div className="text-xs text-neutral-500">1.8 MB · Apr 15</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center p-2 border border-neutral-200 rounded-md hover:bg-neutral-50 cursor-pointer">
                      <div className="bg-amber-100 p-2 rounded mr-3">
                        <Folder className="h-5 w-5 text-amber-600" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">Design Assets</div>
                        <div className="text-xs text-neutral-500">12 files · Apr 22</div>
                      </div>
                    </div>
                    
                    <Button className="w-full" variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Files
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="time-plan" className="pt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Project Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mt-4 overflow-auto">
                <div className="min-w-[800px]">
                  {/* Gantt Chart Header */}
                  <div className="grid grid-cols-10 border-b pb-2 mb-4">
                    {timelineDates.map((date, index) => (
                      <div key={index} className="text-xs font-medium text-neutral-500">{date}</div>
                    ))}
                  </div>
                  
                  {/* Gantt Chart Rows */}
                  <div className="space-y-4">
                    {ganttTasks.map((task, index) => (
                      <div key={index} className="grid grid-cols-10 items-center">
                        <div 
                          className={`col-start-${task.startCol} col-span-${task.span} bg-primary/10 rounded-md px-2 py-1.5 text-sm font-medium text-primary`}
                          style={{ gridColumn: `${task.startCol} / span ${task.span}` }}
                        >
                          {task.name}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Legend */}
                  <div className="mt-8 flex items-center text-sm">
                    <div className="flex items-center mr-4">
                      <div className="h-3 w-3 bg-primary/10 border border-primary rounded-sm mr-1"></div>
                      <span className="text-neutral-500">In Progress</span>
                    </div>
                    <div className="flex items-center mr-4">
                      <div className="h-3 w-3 bg-neutral-200 rounded-sm mr-1"></div>
                      <span className="text-neutral-500">Not Started</span>
                    </div>
                    <div className="flex items-center">
                      <div className="h-3 w-3 bg-emerald-100 border border-emerald-500 rounded-sm mr-1"></div>
                      <span className="text-neutral-500">Completed</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Key Dates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-neutral-100">
                    <div>
                      <div className="font-medium">Project Start</div>
                      <div className="text-sm text-neutral-500">
                        {project?.startDate && new Date(project.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-emerald-600 bg-emerald-100">
                      Completed
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center pb-2 border-b border-neutral-100">
                    <div>
                      <div className="font-medium">Design Phase</div>
                      <div className="text-sm text-neutral-500">Apr 19 - Apr 30, 2023</div>
                    </div>
                    <Badge variant="outline" className="text-primary bg-primary/10">
                      In Progress
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center pb-2 border-b border-neutral-100">
                    <div>
                      <div className="font-medium">Development Phase</div>
                      <div className="text-sm text-neutral-500">May 1 - May 20, 2023</div>
                    </div>
                    <Badge variant="outline" className="text-neutral-600 bg-neutral-100">
                      Upcoming
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">Project Deadline</div>
                      <div className="text-sm text-neutral-500">
                        {project?.endDate && new Date(project.endDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-neutral-600 bg-neutral-100">
                      Upcoming
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Dependencies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="pb-2 border-b border-neutral-100">
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-medium">Design → Development</div>
                      <div className="text-xs text-neutral-500">Critical Path</div>
                    </div>
                    <div className="text-sm text-neutral-500">Design must be completed before development can begin</div>
                  </div>
                  
                  <div className="pb-2 border-b border-neutral-100">
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-medium">Development → Testing</div>
                      <div className="text-xs text-neutral-500">Critical Path</div>
                    </div>
                    <div className="text-sm text-neutral-500">Development must be completed before testing can begin</div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-medium">Testing → Deployment</div>
                      <div className="text-xs text-neutral-500">Critical Path</div>
                    </div>
                    <div className="text-sm text-neutral-500">Testing must be completed before deployment can begin</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="tasks" className="pt-6">
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-lg font-semibold">Project Tasks</h2>
            <Button>
              <Plus className="h-4 w-4 mr-1" />
              Add Task
            </Button>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <div className="border-b border-neutral-200 py-3 px-4 bg-neutral-50">
                <div className="grid grid-cols-12 gap-4 text-xs font-semibold text-neutral-500 uppercase">
                  <div className="col-span-4">Task Name</div>
                  <div className="col-span-2">Start Date</div>
                  <div className="col-span-2">Due Date</div>
                  <div className="col-span-2">Responsible</div>
                  <div className="col-span-2">Status</div>
                </div>
              </div>
              
              <div>
                {projectTasks.map((task, index) => (
                  <div 
                    key={task.id || index} 
                    className={`border-b border-neutral-200 py-3 px-4 ${index % 2 === 1 ? 'bg-neutral-50' : ''}`}
                  >
                    <div className="grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-4 flex items-center">
                        <div className={`w-5 h-5 rounded-full border ${task.completed ? 'bg-emerald-500 border-emerald-500' : 'border-neutral-300'} flex items-center justify-center mr-2`}>
                          {task.completed && <Check className="h-3 w-3 text-white" />}
                        </div>
                        <span className={`font-medium ${task.completed ? 'line-through text-neutral-400' : 'text-neutral-800'}`}>
                          {task.name}
                        </span>
                      </div>
                      <div className="col-span-2 text-sm text-neutral-600">{task.startDate}</div>
                      <div className="col-span-2 text-sm text-neutral-600">{task.dueDate}</div>
                      <div className="col-span-2">
                        <div className="flex items-center">
                          <Avatar className="h-6 w-6 mr-2">
                            <AvatarFallback className={`${task.responsible.color} text-white text-xs`}>
                              {task.responsible.initial}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{task.responsible.name}</span>
                        </div>
                      </div>
                      <div className="col-span-2">
                        {task.completed ? (
                          <Badge variant="outline" className="text-emerald-600 bg-emerald-100">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Complete
                          </Badge>
                        ) : (
                          <Button size="sm" variant="outline" className="h-7 text-xs">
                            Submit Evidence
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="costs" className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Budget Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-neutral-500">Total Budget</span>
                      <span className="font-bold">$75,000.00</span>
                    </div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-neutral-500">Spent to Date</span>
                      <span className="font-medium">$54,325.00</span>
                    </div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm text-neutral-500">Remaining</span>
                      <span className="text-emerald-600 font-medium">$20,675.00</span>
                    </div>
                    <Progress value={72} className="h-2 bg-neutral-200" />
                    <div className="flex justify-between items-center mt-1 text-xs text-neutral-500">
                      <span>72% of budget utilized</span>
                      <span>65% of timeline elapsed</span>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-3">Budget Allocation</h3>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm">Design</span>
                          <span className="text-sm">$15,000.00</span>
                        </div>
                        <Progress value={90} className="h-1.5 bg-neutral-200" indicatorClassName="bg-blue-500" />
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm">Development</span>
                          <span className="text-sm">$42,000.00</span>
                        </div>
                        <Progress value={65} className="h-1.5 bg-neutral-200" indicatorClassName="bg-purple-500" />
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm">Testing</span>
                          <span className="text-sm">$10,000.00</span>
                        </div>
                        <Progress value={40} className="h-1.5 bg-neutral-200" indicatorClassName="bg-amber-500" />
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm">Project Management</span>
                          <span className="text-sm">$8,000.00</span>
                        </div>
                        <Progress value={80} className="h-1.5 bg-neutral-200" indicatorClassName="bg-emerald-500" />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Recent Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between pb-3 border-b border-neutral-100">
                    <div>
                      <div className="font-medium">Design Software Licenses</div>
                      <div className="text-sm text-neutral-500">Apr 19, 2023</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">$1,200.00</div>
                      <div className="text-xs text-neutral-500">Subscriptions</div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between pb-3 border-b border-neutral-100">
                    <div>
                      <div className="font-medium">Developer Contractors</div>
                      <div className="text-sm text-neutral-500">Apr 22, 2023</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">$8,500.00</div>
                      <div className="text-xs text-neutral-500">Human Resources</div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between pb-3 border-b border-neutral-100">
                    <div>
                      <div className="font-medium">Cloud Services</div>
                      <div className="text-sm text-neutral-500">Apr 26, 2023</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">$1,875.00</div>
                      <div className="text-xs text-neutral-500">Infrastructure</div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <div>
                      <div className="font-medium">User Testing Platform</div>
                      <div className="text-sm text-neutral-500">Apr 30, 2023</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">$950.00</div>
                      <div className="text-xs text-neutral-500">Services</div>
                    </div>
                  </div>
                  
                  <Button className="w-full" variant="outline" size="sm">
                    View All Expenses
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card className="mt-6">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-semibold">Forecasted Expenses</CardTitle>
                <Button variant="outline" size="sm">
                  Add Expense
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border-b border-neutral-200 py-2 mb-2">
                <div className="grid grid-cols-12 gap-4 text-xs font-semibold text-neutral-500 uppercase">
                  <div className="col-span-4">Description</div>
                  <div className="col-span-2">Date</div>
                  <div className="col-span-2">Category</div>
                  <div className="col-span-2">Status</div>
                  <div className="col-span-2 text-right">Amount</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="grid grid-cols-12 gap-4 py-2 items-center">
                  <div className="col-span-4 font-medium">Development Team (Sprint 3)</div>
                  <div className="col-span-2 text-sm text-neutral-500">May 10, 2023</div>
                  <div className="col-span-2 text-sm text-neutral-500">Human Resources</div>
                  <div className="col-span-2">
                    <Badge variant="outline" className="text-amber-600 bg-amber-100">
                      Planned
                    </Badge>
                  </div>
                  <div className="col-span-2 font-medium text-right">$12,500.00</div>
                </div>
                
                <div className="grid grid-cols-12 gap-4 py-2 items-center">
                  <div className="col-span-4 font-medium">Additional Cloud Services</div>
                  <div className="col-span-2 text-sm text-neutral-500">May 15, 2023</div>
                  <div className="col-span-2 text-sm text-neutral-500">Infrastructure</div>
                  <div className="col-span-2">
                    <Badge variant="outline" className="text-amber-600 bg-amber-100">
                      Planned
                    </Badge>
                  </div>
                  <div className="col-span-2 font-medium text-right">$2,200.00</div>
                </div>
                
                <div className="grid grid-cols-12 gap-4 py-2 items-center">
                  <div className="col-span-4 font-medium">Quality Assurance Testing</div>
                  <div className="col-span-2 text-sm text-neutral-500">May 22, 2023</div>
                  <div className="col-span-2 text-sm text-neutral-500">Services</div>
                  <div className="col-span-2">
                    <Badge variant="outline" className="text-neutral-600 bg-neutral-100">
                      Forecasted
                    </Badge>
                  </div>
                  <div className="col-span-2 font-medium text-right">$3,500.00</div>
                </div>
                
                <div className="grid grid-cols-12 gap-4 py-2 items-center">
                  <div className="col-span-4 font-medium">Deployment Services</div>
                  <div className="col-span-2 text-sm text-neutral-500">Jun 2, 2023</div>
                  <div className="col-span-2 text-sm text-neutral-500">Infrastructure</div>
                  <div className="col-span-2">
                    <Badge variant="outline" className="text-neutral-600 bg-neutral-100">
                      Forecasted
                    </Badge>
                  </div>
                  <div className="col-span-2 font-medium text-right">$1,800.00</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="documents" className="pt-6">
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-lg font-semibold">Project Documents</h2>
            <Button>
              <Plus className="h-4 w-4 mr-1" />
              Add Document
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold">Project Documentation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center p-2 border border-neutral-200 rounded-md hover:bg-neutral-50 cursor-pointer">
                    <div className="bg-blue-100 p-2 rounded mr-3">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">Project Charter.pdf</div>
                      <div className="text-xs text-neutral-500">4.8 MB · Apr 10</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-2 border border-neutral-200 rounded-md hover:bg-neutral-50 cursor-pointer">
                    <div className="bg-blue-100 p-2 rounded mr-3">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">Requirements Document.docx</div>
                      <div className="text-xs text-neutral-500">2.4 MB · Apr 12</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-2 border border-neutral-200 rounded-md hover:bg-neutral-50 cursor-pointer">
                    <div className="bg-blue-100 p-2 rounded mr-3">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">Technical Specifications.pdf</div>
                      <div className="text-xs text-neutral-500">3.2 MB · Apr 15</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold">Design Files</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center p-2 border border-neutral-200 rounded-md hover:bg-neutral-50 cursor-pointer">
                    <div className="bg-purple-100 p-2 rounded mr-3">
                      <FileText className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">UI Wireframes.fig</div>
                      <div className="text-xs text-neutral-500">8.6 MB · Apr 20</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-2 border border-neutral-200 rounded-md hover:bg-neutral-50 cursor-pointer">
                    <div className="bg-purple-100 p-2 rounded mr-3">
                      <FileText className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">Style Guide.pdf</div>
                      <div className="text-xs text-neutral-500">1.8 MB · Apr 22</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-2 border border-neutral-200 rounded-md hover:bg-neutral-50 cursor-pointer">
                    <div className="bg-purple-100 p-2 rounded mr-3">
                      <Folder className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">UI Assets</div>
                      <div className="text-xs text-neutral-500">24 files · Apr 25</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold">Technical Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center p-2 border border-neutral-200 rounded-md hover:bg-neutral-50 cursor-pointer">
                    <div className="bg-emerald-100 p-2 rounded mr-3">
                      <FileText className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">API Specification.yaml</div>
                      <div className="text-xs text-neutral-500">645 KB · Apr 18</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-2 border border-neutral-200 rounded-md hover:bg-neutral-50 cursor-pointer">
                    <div className="bg-emerald-100 p-2 rounded mr-3">
                      <FileText className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">Database Schema.sql</div>
                      <div className="text-xs text-neutral-500">128 KB · Apr 24</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-2 border border-neutral-200 rounded-md hover:bg-neutral-50 cursor-pointer">
                    <div className="bg-emerald-100 p-2 rounded mr-3">
                      <FileText className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">Architecture Diagram.pdf</div>
                      <div className="text-xs text-neutral-500">1.2 MB · Apr 28</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-3">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold">Recent Uploads</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-b border-neutral-200 py-2 mb-2">
                  <div className="grid grid-cols-12 gap-4 text-xs font-semibold text-neutral-500 uppercase">
                    <div className="col-span-4">Document Name</div>
                    <div className="col-span-2">Uploaded By</div>
                    <div className="col-span-2">Date</div>
                    <div className="col-span-2">Type</div>
                    <div className="col-span-2">Size</div>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="grid grid-cols-12 gap-4 py-2 items-center">
                    <div className="col-span-4 font-medium">UI Assets - Latest</div>
                    <div className="col-span-2">
                      <div className="flex items-center">
                        <Avatar className="h-6 w-6 mr-2">
                          <AvatarFallback className="bg-purple-500 text-white text-xs">
                            MC
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">Maria Chen</span>
                      </div>
                    </div>
                    <div className="col-span-2 text-sm text-neutral-500">Today, 10:23 AM</div>
                    <div className="col-span-2 text-sm text-neutral-500">Folder</div>
                    <div className="col-span-2 text-sm text-neutral-500">38.4 MB</div>
                  </div>
                  
                  <div className="grid grid-cols-12 gap-4 py-2 items-center">
                    <div className="col-span-4 font-medium">API Documentation v2.1</div>
                    <div className="col-span-2">
                      <div className="flex items-center">
                        <Avatar className="h-6 w-6 mr-2">
                          <AvatarFallback className="bg-amber-500 text-white text-xs">
                            JW
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">Jamal Williams</span>
                      </div>
                    </div>
                    <div className="col-span-2 text-sm text-neutral-500">Yesterday</div>
                    <div className="col-span-2 text-sm text-neutral-500">PDF</div>
                    <div className="col-span-2 text-sm text-neutral-500">1.8 MB</div>
                  </div>
                  
                  <div className="grid grid-cols-12 gap-4 py-2 items-center">
                    <div className="col-span-4 font-medium">Progress Report - Week 3</div>
                    <div className="col-span-2">
                      <div className="flex items-center">
                        <Avatar className="h-6 w-6 mr-2">
                          <AvatarFallback className="bg-blue-500 text-white text-xs">
                            AG
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">Alex Garcia</span>
                      </div>
                    </div>
                    <div className="col-span-2 text-sm text-neutral-500">Apr 28, 2023</div>
                    <div className="col-span-2 text-sm text-neutral-500">DOCX</div>
                    <div className="col-span-2 text-sm text-neutral-500">875 KB</div>
                  </div>
                  
                  <div className="grid grid-cols-12 gap-4 py-2 items-center">
                    <div className="col-span-4 font-medium">User Testing Plan</div>
                    <div className="col-span-2">
                      <div className="flex items-center">
                        <Avatar className="h-6 w-6 mr-2">
                          <AvatarFallback className="bg-emerald-500 text-white text-xs">
                            SR
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">Sofia Rodriguez</span>
                      </div>
                    </div>
                    <div className="col-span-2 text-sm text-neutral-500">Apr 26, 2023</div>
                    <div className="col-span-2 text-sm text-neutral-500">PDF</div>
                    <div className="col-span-2 text-sm text-neutral-500">2.1 MB</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}