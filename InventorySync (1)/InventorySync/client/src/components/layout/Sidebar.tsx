import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ListTodo,
  CheckSquare,
  BarChart,
  Settings,
  FileText,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const sidebarLinks = [
  { href: "/", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
  { href: "/projects", label: "Projects", icon: <ListTodo className="h-5 w-5" /> },
  { href: "/tasks", label: "Tasks", icon: <CheckSquare className="h-5 w-5" /> },
  { href: "/teams", label: "Teams", icon: <Users className="h-5 w-5" /> },
  { href: "/reports", label: "Reports", icon: <FileText className="h-5 w-5" /> },
  { href: "/insights", label: "Insights", icon: <BarChart className="h-5 w-5" /> },
  { href: "/settings", label: "Settings", icon: <Settings className="h-5 w-5" /> },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="hidden md:flex md:w-64 flex-col bg-white border-r border-neutral-200">
      <div className="p-4 flex items-center">
        <div className="w-10 h-10 rounded bg-primary flex items-center justify-center text-white font-bold">
          AI
        </div>
        <div className="ml-2 text-xl font-bold text-neutral-800">PROGRAM MANAGEMENT</div>
      </div>
      
      <div className="px-4 py-6">
        <Button className="w-full" size="sm">
          New Project
        </Button>
      </div>
      
      <div className="p-4 uppercase text-xs font-semibold text-neutral-500 tracking-wider">
        PROJECTS
      </div>
      
      <nav className="flex-1">
        <div className="space-y-1 px-3">
          {["Website Redesign", "Mobile App", "CRM Implementation", "Marketing Campaign"].map((project, index) => (
            <Link 
              key={index}
              href={`/projects/${index + 1}`}
              className={cn(
                "flex items-center px-2 py-2 text-sm font-medium rounded-md cursor-pointer",
                location === `/projects/${index + 1}` 
                  ? "bg-primary/10 text-primary" 
                  : "text-neutral-600 hover:bg-neutral-50"
              )}
            >
              {project}
            </Link>
          ))}
        </div>

        <div className="p-4 uppercase text-xs font-semibold text-neutral-500 tracking-wider mt-6">
          NAVIGATION
        </div>
        
        {sidebarLinks.map((link) => (
          <Link 
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center px-4 py-3 text-neutral-600 hover:bg-neutral-50 cursor-pointer",
              location === link.href && "bg-primary/5 text-primary border-r-2 border-primary"
            )}
          >
            <span className="mr-3">{link.icon}</span>
            <span className="font-medium">{link.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
