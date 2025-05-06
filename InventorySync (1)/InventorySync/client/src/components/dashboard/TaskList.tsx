import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getTasks, updateTask } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function TaskList() {
  const { toast } = useToast();
  
  const { data: tasks, isLoading } = useQuery({
    queryKey: ["/api/tasks"],
    queryFn: getTasks
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { completed: boolean } }) => 
      updateTask(id, data),
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

  const handleTaskCheck = (id: number, checked: boolean) => {
    updateTaskMutation.mutate({
      id,
      data: { completed: checked }
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Task List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center">
                <Skeleton className="h-4 w-4 mr-3" />
                <div className="space-y-1 flex-1">
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Display first 4 tasks only for dashboard
  const displayTasks = tasks?.slice(0, 4) || [];

  return (
    <Card>
      <CardHeader className="px-6 py-5 border-b border-neutral-200">
        <CardTitle className="text-lg font-semibold text-neutral-800">Task List</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3">
          {displayTasks.map((task) => (
            <div key={task.id} className="flex items-start p-3 hover:bg-neutral-50 rounded-md">
              <Checkbox
                id={`task-${task.id}`}
                checked={task.completed}
                onCheckedChange={(checked) => handleTaskCheck(task.id, !!checked)}
                className="mt-0.5"
              />
              <div className="ml-3 min-w-0 flex-1">
                <div className="flex justify-between">
                  <label
                    htmlFor={`task-${task.id}`}
                    className={`text-sm font-medium ${
                      task.completed ? "text-neutral-400 line-through" : "text-neutral-700"
                    }`}
                  >
                    {task.name}
                  </label>
                  <p className="text-sm text-neutral-500">{task.dueDate}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
