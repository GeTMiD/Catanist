import Link from "next/link";
import { Hexagon } from "lucide-react";

const links = [
  { href: "/", label: "Home" },
  { href: "/puzzles", label: "Puzzles" },
  { href: "/create", label: "Create" },
  { href: "/progress", label: "Progress" },
];

export default function Navigation() {
  return (
    <nav className="border-b border-border bg-card shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 group">
            <Hexagon className="w-8 h-8 text-primary group-hover:rotate-45 transition-transform duration-300" />
            <span className="text-xl font-bold text-primary">Catanist</span>
          </Link>
          {links.slice(1).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
