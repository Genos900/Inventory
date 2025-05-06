import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getTasks, getProjects, createTask, updateTask, deleteTask } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { InsertTask } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, AlertTriangle, CalendarIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

export default function Tasks() {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<{ id: number } & InsertTask | null>(null);
  const [newTask, setNewTask] = useState<InsertTask>({
    name: "",
    dueDate: format(new Date(), "MMM d"),
    completed: false,
    projectId: 1
  });
  const [date, setDate] = useState<Date | undefined>(new Date());

  const { data: tasks, isLoading: isLoadingTasks } = useQuery({
    queryKey: ["/api/tasks"],
    queryFn: getTasks
  });

  const { data: projects, isLoading: isLoadingProjects } = useQuery({
    queryKey: ["/api/projects"],
    queryFn: getProjects
  });

  const createTaskMutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({ title: "Success", description: "Task created successfully" });
      setIsCreateDialogOpen(false);
      resetNewTask();
    },
    onError: () => {
      toast({ 
        title: "Error", 
        description: "Failed to create task", 
        variant: "destructive" 
      });
    }
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<InsertTask> }) => 
      updateTask(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({ title: "Success", description: "Task updated successfully" });
      setIsEditDialogOpen(false);
      setEditingTask(null);
    },
    onError: () => {
      toast({ 
        title: "Error", 
        description: "Failed to update task", 
        variant: "destructive" 
      });
    }
  });

  const deleteTaskMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({ title: "Success", description: "Task deleted successfully" });
    },
    onError: () => {
      toast({ 
        title: "Error", 
        description: "Failed to delete task", 
        variant: "destructive" 
      });
    }
  });

  const toggleTaskCompletionMutation = useMutation({
    mutationFn: ({ id, completed }: { id: number; completed: boolean }) => 
      updateTask(id, { completed }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
    onError: () => {
      toast({ 
        title: "Error", 
        description: "Failed to update task status", 
        variant: "destructive" 
      });
    }
  });

  const resetNewTask = () => {
    setNewTask({
      name: "",
      dueDate: format(new Date(), "MMM d"),
      completed: false,
      projectId: projects && projects.length > 0 ? projects[0].id : 1
    });
    setDate(new Date());
  };

  const handleCreateTask = () => {
    if (!newTask.name) {
      toast({ 
        title: "Validation Error", 
        description: "Task name is required", 
        variant: "destructive" 
      });
      return;
    }
    createTaskMutation.mutate(newTask);
  };

  const handleUpdateTask = () => {
    if (!editingTask || !editingTask.name) {
      toast({ 
        title: "Validation Error", 
        description: "Task name is required", 
        variant: "destructive" 
      });
      return;
    }
    updateTaskMutation.mutate({
      id: editingTask.id,
      data: {
        name: editingTask.name,
        dueDate: editingTask.dueDate,
        completed: editingTask.completed,
        projectId: editingTask.projectId
      }
    });
  };

  const openEditDialog = (task: { id: number } & InsertTask) => {
    setEditingTask(task);
    setIsEditDialogOpen(true);
  };

  const handleTaskCheck = (id: number, checked: boolean) => {
    toggleTaskCompletionMutation.mutate({
      id,
      completed: checked
    });
  };

  const getProjectName = (projectId: number) => {
    if (!projects) return "Unknown Project";
    const project = projects.find(p => p.id === projectId);
    return project ? project.name : "Unknown Project";
  };

  const formatDate = (selectedDate: Date | undefined) => {
    if (!selectedDate) return "";
    return format(selectedDate, "MMM d");
  };

  const handleDateSelect = (selectedDate: Date | undefined, forNewTask: boolean) => {
    if (!selectedDate) return;
    
    if (forNewTask) {
      setDate(selectedDate);
      setNewTask({
        ...newTask,
        dueDate: formatDate(selectedDate)
      });
    } else if (editingTask) {
      setEditingTask({
        ...editingTask,
        dueDate: formatDate(selectedDate)
      });
    }
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-neutral-800">Tasks</h2>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-1">
                <Plus className="h-4 w-4" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Task</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <label htmlFor="name" className="text-sm font-medium">Task Name</label>
                  <Input
                    id="name"
                    value={newTask.name}
                    onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
                    placeholder="Enter task name"
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="project" className="text-sm font-medium">Project</label>
                  <Select 
                    value={newTask.projectId.toString()} 
                    onValueChange={(value) => setNewTask({ ...newTask, projectId: parseInt(value) })}
                    disabled={isLoadingProjects || !projects || projects.length === 0}
                  >
                    <SelectTrigger>
                      {isLoadingProjects ? (
                        <Skeleton className="h-4 w-full" />
                      ) : (
                        <SelectValue placeholder="Select project" />
                      )}
                    </SelectTrigger>
                    <SelectContent>
                      {projects && projects.map((project) => (
                        <SelectItem key={project.id} value={project.id.toString()}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <label htmlFor="dueDate" className="text-sm font-medium">Due Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newTask.dueDate || "Select a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={(date) => handleDateSelect(date, true)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
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
                  onClick={handleCreateTask}
                  disabled={createTaskMutation.isPending}
                >
                  {createTaskMutation.isPending ? "Creating..." : "Create Task"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader className="px-6 py-5 border-b border-neutral-200">
            <CardTitle className="text-lg font-semibold text-neutral-800">Task List</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoadingTasks || isLoadingProjects ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-4 w-4" />
                    <div className="flex-1">
                      <Skeleton className="h-6 w-[200px]" />
                    </div>
                    <Skeleton className="h-6 w-[120px]" />
                    <Skeleton className="h-6 w-[100px]" />
                    <div className="flex gap-2">
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
                    <TableHead className="w-10"></TableHead>
                    <TableHead className="text-xs uppercase text-neutral-500">Task Name</TableHead>
                    <TableHead className="text-xs uppercase text-neutral-500">Project</TableHead>
                    <TableHead className="text-xs uppercase text-neutral-500">Due Date</TableHead>
                    <TableHead className="text-xs uppercase text-neutral-500 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasks && tasks.length > 0 ? (
                    tasks.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell className="w-10">
                          <Checkbox 
                            checked={task.completed}
                            onCheckedChange={(checked) => handleTaskCheck(task.id, !!checked)}
                          />
                        </TableCell>
                        <TableCell className={`font-medium ${task.completed ? "text-neutral-400 line-through" : "text-neutral-800"}`}>
                          {task.name}
                        </TableCell>
                        <TableCell>{getProjectName(task.projectId)}</TableCell>
                        <TableCell>{task.dueDate}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(task)}
                            >
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                  <span className="sr-only">Delete</span>
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you sure you want to delete this task?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the task.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    className="bg-red-500 hover:bg-red-600"
                                    onClick={() => deleteTaskMutation.mutate(task.id)}
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
                      <TableCell colSpan={5} className="text-center py-8">
                        <div className="flex flex-col items-center justify-center text-neutral-500">
                          <AlertTriangle className="h-10 w-10 mb-2 text-neutral-400" />
                          <p>No tasks found</p>
                          <p className="text-sm">Create a new task to get started</p>
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

      {/* Edit Task Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          {editingTask && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="edit-name" className="text-sm font-medium">Task Name</label>
                <Input
                  id="edit-name"
                  value={editingTask.name}
                  onChange={(e) => setEditingTask({ ...editingTask, name: e.target.value })}
                  placeholder="Enter task name"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="edit-project" className="text-sm font-medium">Project</label>
                <Select 
                  value={editingTask.projectId.toString()} 
                  onValueChange={(value) => setEditingTask({ ...editingTask, projectId: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects && projects.map((project) => (
                      <SelectItem key={project.id} value={project.id.toString()}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <label htmlFor="edit-dueDate" className="text-sm font-medium">Due Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {editingTask.dueDate || "Select a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={new Date()}
                      onSelect={(date) => handleDateSelect(date, false)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="edit-completed"
                  checked={editingTask.completed}
                  onCheckedChange={(checked) => setEditingTask({ ...editingTask, completed: !!checked })}
                />
                <label htmlFor="edit-completed" className="text-sm font-medium">
                  Mark as completed
                </label>
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
              onClick={handleUpdateTask}
              disabled={updateTaskMutation.isPending}
            >
              {updateTaskMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
