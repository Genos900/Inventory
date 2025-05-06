import { useQuery } from "@tanstack/react-query";
import { getDashboardStats } from "@/lib/api";
import StatCard from "@/components/dashboard/StatCard";
import ProjectTable from "@/components/dashboard/ProjectTable";
import TaskList from "@/components/dashboard/TaskList";
import AIInsights from "@/components/dashboard/AIInsights";

export default function Dashboard() {
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["/api/stats"],
    queryFn: getDashboardStats
  });

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard 
            title="Active Projects" 
            value={stats?.activeProjects ?? null} 
            isLoading={isLoadingStats} 
          />
          <StatCard 
            title="Tasks" 
            value={stats?.tasks ?? null} 
            isLoading={isLoadingStats} 
          />
          <StatCard 
            title="Milestones" 
            value={stats?.milestones ?? null} 
            isLoading={isLoadingStats} 
          />
          <StatCard 
            title="Completed" 
            value={stats?.completed ?? null} 
            isLoading={isLoadingStats} 
          />
        </div>
        
        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Projects Table and AI Insights - Left Column */}
          <div className="md:col-span-2 space-y-6">
            <ProjectTable />
            <AIInsights />
          </div>
          
          {/* Tasks List and AI Insights - Right Column */}
          <div className="space-y-6">
            <TaskList />
            <AIInsights variant="small" />
          </div>
        </div>
      </div>
    </div>
  );
}
