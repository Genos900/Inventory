import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getProjects, createProject, updateProject, deleteProject } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { InsertProject, statusOptions } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Plus, Edit, Trash2, AlertTriangle, ChevronRight } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";

export default function Projects() {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<{ id: number } & InsertProject | null>(null);
  const [newProject, setNewProject] = useState<InsertProject>({
    name: "",
    progress: 0,
    status: "On Track",
    description: "",
    startDate: "",
    endDate: ""
  });

  const { data: projects, isLoading } = useQuery({
    queryKey: ["/api/projects"],
    queryFn: getProjects
  });

  const createProjectMutation = useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({ title: "Success", description: "Project created successfully" });
      setIsCreateDialogOpen(false);
      resetNewProject();
    },
    onError: () => {
      toast({ 
        title: "Error", 
        description: "Failed to create project", 
        variant: "destructive" 
      });
    }
  });

  const updateProjectMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: InsertProject }) => 
      updateProject(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({ title: "Success", description: "Project updated successfully" });
      setIsEditDialogOpen(false);
      setEditingProject(null);
    },
    onError: () => {
      toast({ 
        title: "Error", 
        description: "Failed to update project", 
        variant: "destructive" 
      });
    }
  });

  const deleteProjectMutation = useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({ title: "Success", description: "Project deleted successfully" });
    },
    onError: () => {
      toast({ 
        title: "Error", 
        description: "Failed to delete project", 
        variant: "destructive" 
      });
    }
  });

  const resetNewProject = () => {
    setNewProject({
      name: "",
      progress: 0,
      status: "On Track",
      description: "",
      startDate: "",
      endDate: ""
    });
  };

  const handleCreateProject = () => {
    if (!newProject.name) {
      toast({ 
        title: "Validation Error", 
        description: "Project name is required", 
        variant: "destructive" 
      });
      return;
    }
    createProjectMutation.mutate(newProject);
  };

  const handleUpdateProject = () => {
    if (!editingProject || !editingProject.name) {
      toast({ 
        title: "Validation Error", 
        description: "Project name is required", 
        variant: "destructive" 
      });
      return;
    }
    updateProjectMutation.mutate({
      id: editingProject.id,
      data: {
        name: editingProject.name,
        progress: editingProject.progress,
        status: editingProject.status
      }
    });
  };

  const openEditDialog = (project: { id: number } & InsertProject) => {
    setEditingProject(project);
    setIsEditDialogOpen(true);
  };

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

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-neutral-800">Projects</h2>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-1">
                <Plus className="h-4 w-4" />
                Add Project
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Project</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <label htmlFor="name" className="text-sm font-medium">Project Name</label>
                  <Input
                    id="name"
                    value={newProject.name}
                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                    placeholder="Enter project name"
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="status" className="text-sm font-medium">Status</label>
                  <Select 
                    value={newProject.status} 
                    onValueChange={(value) => setNewProject({ ...newProject, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <div className="flex justify-between">
                    <label htmlFor="progress" className="text-sm font-medium">Progress</label>
                    <span className="text-sm">{newProject.progress || 0}%</span>
                  </div>
                  <Slider
                    value={[newProject.progress || 0]}
                    min={0}
                    max={100}
                    step={5}
                    onValueChange={(value) => setNewProject({ ...newProject, progress: value[0] })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateProject}
                  disabled={createProjectMutation.isPending}
                >
                  {createProjectMutation.isPending ? "Creating..." : "Create Project"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader className="px-6 py-5 border-b border-neutral-200">
            <CardTitle className="text-lg font-semibold text-neutral-800">Project List</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex justify-between items-center">
                    <Skeleton className="h-6 w-[200px]" />
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-[100px]" />
                      <Skeleton className="h-8 w-[100px]" />
                      <Skeleton className="h-8 w-8" />
                      <Skeleton className="h-8 w-8" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-neutral-50">
                  <TableRow>
                    <TableHead className="text-xs uppercase text-neutral-500">Project Name</TableHead>
                    <TableHead className="text-xs uppercase text-neutral-500">Progress</TableHead>
                    <TableHead className="text-xs uppercase text-neutral-500">Status</TableHead>
                    <TableHead className="text-xs uppercase text-neutral-500 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects && projects.length > 0 ? (
                    projects.map((project) => (
                      <TableRow 
                        key={project.id} 
                        className="cursor-pointer hover:bg-neutral-50"
                        onClick={(e) => {
                          // Only navigate if not clicking action buttons
                          if (!(e.target as HTMLElement).closest('button')) {
                            window.location.href = `/projects/${project.id}`;
                          }
                        }}
                      >
                        <TableCell className="font-medium text-neutral-800">
                          <div className="flex items-center">
                            {project.name}
                            <ChevronRight className="ml-2 h-4 w-4 text-neutral-400" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress 
                              value={project.progress || 0} 
                              className="h-2 w-32 bg-neutral-200" 
                              indicatorClassName="bg-emerald-500" 
                            />
                            <span className="text-sm text-neutral-500">{project.progress || 0}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn("rounded-full px-3 py-1 text-xs font-medium", getStatusColor(project.status))}>
                            {project.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditDialog(project);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                  <span className="sr-only">Delete</span>
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you sure you want to delete this project?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the
                                    project and all associated data.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    className="bg-red-500 hover:bg-red-600"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteProjectMutation.mutate(project.id);
                                    }}
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        <div className="flex flex-col items-center justify-center text-neutral-500">
                          <AlertTriangle className="h-10 w-10 mb-2 text-neutral-400" />
                          <p>No projects found</p>
                          <p className="text-sm">Create a new project to get started</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Project Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
          </DialogHeader>
          {editingProject && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="edit-name" className="text-sm font-medium">Project Name</label>
                <Input
                  id="edit-name"
                  value={editingProject.name}
                  onChange={(e) => setEditingProject({ ...editingProject, name: e.target.value })}
                  placeholder="Enter project name"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="edit-status" className="text-sm font-medium">Status</label>
                <Select 
                  value={editingProject.status} 
                  onValueChange={(value) => setEditingProject({ ...editingProject, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <div className="flex justify-between">
                  <label htmlFor="edit-progress" className="text-sm font-medium">Progress</label>
                  <span className="text-sm">{editingProject.progress || 0}%</span>
                </div>
                <Slider
                  value={[editingProject.progress || 0]}
                  min={0}
                  max={100}
                  step={5}
                  onValueChange={(value) => setEditingProject({ ...editingProject, progress: value[0] })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateProject}
              disabled={updateProjectMutation.isPending}
            >
              {updateProjectMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
