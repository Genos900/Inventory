import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ListTodo,
  CheckSquare,
  BarChart,
} from "lucide-react";

const mobileLinks = [
  { href: "/", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
  { href: "/projects", label: "Projects", icon: <ListTodo className="h-5 w-5" /> },
  { href: "/tasks", label: "Tasks", icon: <CheckSquare className="h-5 w-5" /> },
  { href: "/insights", label: "Insights", icon: <BarChart className="h-5 w-5" /> },
];

export default function MobileNav() {
  const [location] = useLocation();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 z-50">
      <div className="grid grid-cols-4 h-16">
        {mobileLinks.map((link) => (
          <div key={link.href} className="flex flex-col items-center justify-center">
            <Link href={link.href}
              className="flex flex-col items-center justify-center w-full h-full"
              style={{
                color: location === link.href ? "var(--primary)" : "var(--muted-foreground)",
              }}
            >
              <span>{link.icon}</span>
              <span className="text-xs mt-1">{link.label}</span>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
