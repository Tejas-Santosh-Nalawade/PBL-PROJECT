import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";

interface HeaderProps {
  toggleSidebar: () => void;
  title: string;
  user?: {
    name: string;
    username: string;
    image?: string;
  };
}

export function Header({ toggleSidebar, title, user: propUser }: HeaderProps) {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const { user: authUser, logoutMutation } = useAuth();
  
  // Use authenticated user if available, otherwise use the prop user
  const user = authUser ? {
    name: authUser.firstName || authUser.username,
    username: authUser.username,
    image: authUser.profileImage || undefined
  } : propUser;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality
    console.log("Searching for:", searchQuery);
  };
  
  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        setLocation("/auth");
      }
    });
  };

  return (
    <header className="bg-white shadow-[0_2px_4px_rgba(0,0,0,0.1)] z-10">
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-muted-foreground hover:bg-muted"
            onClick={toggleSidebar}
          >
            <span className="material-icons">menu</span>
            <span className="sr-only">Toggle menu</span>
          </Button>
          <h2 className="ml-2 md:ml-0 text-lg font-medium font-poppins">{title}</h2>
        </div>

        <div className="flex items-center">
          <form onSubmit={handleSearch} className="relative mr-4">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <span className="material-icons text-muted-foreground text-sm">search</span>
            </span>
            <Input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 w-40 md:w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>

          <Button
            variant="ghost"
            size="icon"
            className="p-2 mr-2 text-muted-foreground hover:bg-muted rounded-full"
          >
            <span className="material-icons">notifications</span>
            <span className="sr-only">Notifications</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center focus:outline-none">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.image} alt={user?.name || "User"} />
                  <AvatarFallback>{user?.name?.[0] || "U"}</AvatarFallback>
                </Avatar>
                <span className="hidden sm:flex ml-2 text-sm font-medium">
                  {user?.name || "Guest"}
                </span>
                <span className="material-icons ml-1 text-sm">keyboard_arrow_down</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setLocation("/profile")}>
                <span className="material-icons mr-2 text-sm">person</span>
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLocation("/settings")}>
                <span className="material-icons mr-2 text-sm">settings</span>
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} disabled={logoutMutation.isPending}>
                <span className="material-icons mr-2 text-sm">logout</span>
                {logoutMutation.isPending ? "Signing out..." : "Sign out"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

export default Header;
