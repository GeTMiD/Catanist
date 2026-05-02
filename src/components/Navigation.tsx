import Link from "next/link";
import { Hexagon } from "lucide-react";
import { createSupabaseServerClient } from "@/integrations/supabase/server";
import NavActions from "./NavActions";

const links = [
  { href: "/puzzles", label: "Puzzles" },
  { href: "/create", label: "Create" },
  { href: "/progress", label: "Progress" },
];

export default async function Navigation() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <nav className="border-b border-border bg-card shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 group">
            <Hexagon className="w-8 h-8 text-primary group-hover:rotate-45 transition-transform duration-300" />
            <span className="text-xl font-bold text-primary">Catanist</span>
          </Link>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
          <div className="ml-auto">
            <NavActions user={user} />
          </div>
        </div>
      </div>
    </nav>
  );
}
