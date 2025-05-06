import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getProjects, updateProject } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { Project, StatusType } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export default function ProjectTable() {
  const { data: projects, isLoading } = useQuery({
    queryKey: ["/api/projects"],
    queryFn: getProjects
  });

  const updateProjectMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Project> }) => 
      updateProject(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
    }
  });

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

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Project Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-6 w-[120px]" />
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-6 w-[80px]" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="px-6 py-5 border-b border-neutral-200">
        <CardTitle className="text-lg font-semibold text-neutral-800">Project Overview</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-neutral-50">
            <TableRow>
              <TableHead className="text-xs uppercase text-neutral-500">Project</TableHead>
              <TableHead className="text-xs uppercase text-neutral-500">Progress</TableHead>
              <TableHead className="text-xs uppercase text-neutral-500">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects?.map((project) => (
              <TableRow key={project.id}>
                <TableCell className="font-medium text-neutral-800">
                  {project.name}
                </TableCell>
                <TableCell>
                  <div className="w-32">
                    <Progress value={project.progress} className="h-2 bg-neutral-200" indicatorClassName="bg-emerald-500" />
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={cn("rounded-full px-3 py-1 text-xs font-medium", getStatusColor(project.status))}>
                    {project.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
