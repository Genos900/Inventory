import { Menu, Search, User, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useLocation } from "wouter";
import {
  LayoutDashboard,
  ListTodo,
  CheckSquare,
  BarChart,
  Settings,
  FileText,
  Users,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const mainNavLinks = [
  { href: "/projects", label: "Projects" },
  { href: "/tasks", label: "Tasks" },
  { href: "/teams", label: "Teams" },
  { href: "/reports", label: "Reports" },
];

const mobileMenuLinks = [
  { href: "/", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
  { href: "/projects", label: "Projects", icon: <ListTodo className="h-5 w-5" /> },
  { href: "/tasks", label: "Tasks", icon: <CheckSquare className="h-5 w-5" /> },
  { href: "/teams", label: "Teams", icon: <Users className="h-5 w-5" /> },
  { href: "/reports", label: "Reports", icon: <FileText className="h-5 w-5" /> },
  { href: "/insights", label: "Insights", icon: <BarChart className="h-5 w-5" /> },
  { href: "/settings", label: "Settings", icon: <Settings className="h-5 w-5" /> },
];

export default function Header() {
  const [location] = useLocation();

  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-neutral-800 mr-10">AI PROGRAM MANAGEMENT</h1>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {mainNavLinks.map((link) => (
                <div 
                  key={link.href}
                  onClick={() => window.location.href = link.href}
                  className={cn(
                    "inline-flex items-center px-1 pt-1 text-sm font-medium cursor-pointer",
                    location === link.href || (link.href !== "/" && location.startsWith(link.href))
                      ? "text-primary border-b-2 border-primary"
                      : "text-neutral-500 hover:text-neutral-700 hover:border-b-2 hover:border-neutral-300"
                  )}
                >
                  {link.label}
                </div>
              ))}
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Button variant="ghost" size="icon" className="hidden md:flex">
                <Bell className="h-5 w-5" />
              </Button>
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center">3</Badge>
            </div>
            
            <Button variant="ghost" size="icon" className="hidden md:flex">
              <Search className="h-5 w-5" />
            </Button>
            
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-blue-500 text-white">AG</AvatarFallback>
            </Avatar>
            
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="py-6 space-y-1">
                  <div className="p-4 uppercase text-xs font-semibold text-neutral-500 tracking-wider">
                    NAVIGATION
                  </div>
                  {mobileMenuLinks.map((link) => (
                    <div
                      key={link.href}
                      onClick={() => window.location.href = link.href}
                      className={cn(
                        "flex items-center px-4 py-3 text-neutral-600 cursor-pointer",
                        location === link.href || (link.href !== "/" && location.startsWith(link.href))
                          ? "bg-primary/5 text-primary"
                          : ""
                      )}
                    >
                      <span className="mr-3">{link.icon}</span>
                      <span className="font-medium">{link.label}</span>
                    </div>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
