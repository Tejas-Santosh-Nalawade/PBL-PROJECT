import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

interface SidebarLink {
  href: string;
  icon: string;
  label: string;
}

interface SidebarProps {
  isOpen: boolean;
  closeSidebar: () => void;
  recentPapers?: Array<{ id: number; title: string }>;
}

const links: SidebarLink[] = [
  { href: "/", icon: "dashboard", label: "Dashboard" },
  { href: "/question-papers", icon: "description", label: "Question Papers" },
  { href: "/study-resources", icon: "school", label: "Study Resources" },
  { href: "/ai-assistant", icon: "smart_toy", label: "AI Assistant" },
  { href: "/community", icon: "forum", label: "Community" },
  { href: "/video-resources", icon: "video_library", label: "Video Resources" },
  { href: "/analytics", icon: "insights", label: "Analytics" },
];

export function Sidebar({ isOpen, closeSidebar, recentPapers = [] }: SidebarProps) {
  const [location] = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={closeSidebar}
        ></div>
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-64 bg-white shadow-[0_2px_4px_rgba(0,0,0,0.1)] md:static md:z-0 transition-transform duration-300 transform",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex items-center justify-center h-16 border-b">
          <h1 className="text-xl font-semibold font-poppins text-primary">
            <span className="text-secondary">Edu</span>Analytica
          </h1>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul>
            {links.map((link) => (
              <li key={link.href}>
                <Link href={link.href}>
                  <div
                    className={cn(
                      "flex items-center px-6 py-3 transition-colors cursor-pointer",
                      location === link.href
                        ? "text-primary bg-primary/10 border-r-4 border-primary"
                        : "text-muted-foreground hover:bg-primary/5"
                    )}
                  >
                    <span className="material-icons mr-3">{link.icon}</span>
                    <span className="font-medium">{link.label}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          {recentPapers.length > 0 && (
            <div className="mt-6 px-6">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Recent Papers
              </h3>
              <ul>
                {recentPapers.map((paper) => (
                  <li key={paper.id} className="mb-1">
                    <Link href={`/question-papers/${paper.id}`}>
                      <div className="block text-sm py-1 text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                        {paper.title}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </nav>

        <div className="p-4 border-t">
          <Link href="/settings">
            <div className="flex items-center text-muted-foreground hover:text-primary transition-colors cursor-pointer">
              <span className="material-icons mr-2">settings</span>
              <span className="text-sm">Settings</span>
            </div>
          </Link>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
