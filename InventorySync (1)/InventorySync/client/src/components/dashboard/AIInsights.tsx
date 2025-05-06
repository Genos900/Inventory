import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getInsights, generateAIInsights } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { LightbulbIcon, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface AIInsightsProps {
  variant?: "default" | "small";
}

export default function AIInsights({ variant = "default" }: AIInsightsProps) {
  const { toast } = useToast();
  
  const { data: insights, isLoading } = useQuery({
    queryKey: ["/api/insights"],
    queryFn: getInsights
  });

  const generateInsightsMutation = useMutation({
    mutationFn: generateAIInsights,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/insights"] });
      toast({
        title: "Insights Generated",
        description: "New AI insights have been generated successfully"
      });
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

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AI-generated Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (variant === "small") {
    return (
      <Card>
        <CardHeader className="px-6 py-5 border-b border-neutral-200">
          <CardTitle className="text-lg font-semibold text-neutral-800">AI-generated Insights</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-3">
            {insights && insights.length > 0 ? (
              insights.map((insight) => (
                <div key={insight.id} className="p-3 bg-neutral-50 rounded-md">
                  <div className="flex items-start">
                    <ArrowRight className="h-5 w-5 text-primary mt-0.5" />
                    <p className="ml-2 text-sm text-neutral-700">
                      {insight.message}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-3 text-center">
                <p className="text-sm text-neutral-500">No insights available</p>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="mt-2"
                  onClick={handleGenerateInsights}
                  disabled={generateInsightsMutation.isPending}
                >
                  {generateInsightsMutation.isPending ? "Generating..." : "Generate Insights"}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="px-6 py-5 border-b border-neutral-200">
        <CardTitle className="text-lg font-semibold text-neutral-800">AI-generated Insights</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {insights && insights.length > 0 ? (
          insights.map((insight) => (
            <div key={insight.id} className="flex">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <LightbulbIcon className="h-6 w-6 text-primary" />
              </div>
              <div className="ml-4">
                <p className="text-neutral-700">
                  {insight.message}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-4">
            <LightbulbIcon className="h-12 w-12 text-primary/20 mx-auto mb-2" />
            <p className="text-neutral-500">No insights available yet</p>
            <Button 
              className="mt-4"
              onClick={handleGenerateInsights}
              disabled={generateInsightsMutation.isPending}
            >
              {generateInsightsMutation.isPending ? "Generating..." : "Generate Insights"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
