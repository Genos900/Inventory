import { useQuery, useMutation } from "@tanstack/react-query";
import { getInsights, generateAIInsights } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, LightbulbIcon, RefreshCw } from "lucide-react";

export default function Insights() {
  const { toast } = useToast();
  
  const { data: insights, isLoading } = useQuery({
    queryKey: ["/api/insights"],
    queryFn: getInsights
  });

  const generateInsightsMutation = useMutation({
    mutationFn: generateAIInsights,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/insights"] });
      toast({ title: "Success", description: "New insights generated successfully" });
    },
    onError: () => {
      toast({ 
        title: "Error", 
        description: "Failed to generate insights", 
        variant: "destructive" 
      });
    }
  });

  const handleGenerateInsights = () => {
    generateInsightsMutation.mutate();
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-neutral-800">AI-generated Insights</h2>
          <Button 
            onClick={handleGenerateInsights}
            disabled={generateInsightsMutation.isPending}
            className="flex items-center gap-1"
          >
            <RefreshCw className={`h-4 w-4 ${generateInsightsMutation.isPending ? "animate-spin" : ""}`} />
            {generateInsightsMutation.isPending ? "Generating..." : "Generate New Insights"}
          </Button>
        </div>

        <Card>
          <CardHeader className="px-6 py-5 border-b border-neutral-200">
            <CardTitle className="text-lg font-semibold text-neutral-800">Project Insights</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {isLoading ? (
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : insights && insights.length > 0 ? (
              <div className="space-y-8">
                {insights.map((insight) => (
                  <div key={insight.id} className="flex">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <LightbulbIcon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="ml-4">
                      <p className="text-neutral-700 mb-1">
                        {insight.message}
                      </p>
                      <p className="text-sm text-neutral-500">
                        {new Date(insight.createdAt).toLocaleDateString()} at {new Date(insight.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <AlertTriangle className="h-16 w-16 text-amber-500/20 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-neutral-800 mb-2">No insights available</h3>
                <p className="text-neutral-500 mb-6">
                  Generate new insights to get AI-powered recommendations about your projects.
                </p>
                <Button onClick={handleGenerateInsights}>
                  Generate Insights
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader className="px-6 py-5 border-b border-neutral-200">
            <CardTitle className="text-lg font-semibold text-neutral-800">About AI Insights</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="prose">
              <p>
                AI-generated insights analyze your project data to identify:
              </p>
              <ul>
                <li>Projects at risk that need attention</li>
                <li>Tasks that are overdue or approaching deadlines</li>
                <li>Resource allocation issues and bottlenecks</li>
                <li>Trends in project performance and completion rates</li>
              </ul>
              <p>
                These insights can help you proactively address issues before they become problems
                and ensure your projects stay on track to meet their goals.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
