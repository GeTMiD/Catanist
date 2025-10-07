import { Link, useLocation } from "react-router-dom";
import { Hexagon } from "lucide-react";
import { cn } from "@/lib/utils";

const Navigation = () => {
  const location = useLocation();

  const links = [
    { to: "/", label: "Home" },
    { to: "/puzzles", label: "Puzzles" },
    { to: "/create", label: "Create" },
    { to: "/progress", label: "Progress" },
  ];

  return (
    <nav className="border-b border-border bg-card shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <Hexagon className="w-8 h-8 text-primary group-hover:rotate-45 transition-transform duration-300" />
            <span className="text-xl font-bold bg-[var(--gradient-hero)] bg-clip-text text-transparent">
              Catan Puzzle Trainer
            </span>
          </Link>
          
          <div className="flex items-center gap-6">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  location.pathname === link.to
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
