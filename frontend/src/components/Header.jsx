import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, LogOut, User, BookOpen, Sparkles, Library } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const Header = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!isAuthenticated) return null;

  return (
    <header className="bg-background border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link 
              to="/" 
              className="flex items-center gap-2 text-secondary hover:text-secondary/80 transition-colors"
              data-testid="header-home-link"
            >
              <Home className="h-5 w-5" />
              <span className="font-bold text-lg hidden sm:inline">Revivedu</span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/dashboard")}
                className="rounded-full"
                data-testid="header-dashboard-link"
              >
                <User className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/generate")}
                className="rounded-full"
                data-testid="header-generate-link"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Activity
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/library")}
                className="rounded-full"
                data-testid="header-library-link"
              >
                <Library className="mr-2 h-4 w-4" />
                Library
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/guide")}
                className="rounded-full"
                data-testid="header-guide-link"
              >
                <BookOpen className="mr-2 h-4 w-4" />
                Guide
              </Button>
            </nav>
          </div>
          
          <div className="flex items-center gap-3">
            {user && (
              <span className="text-sm text-foreground/60 hidden sm:inline">
                Welcome, {user.name}
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="rounded-full border-2 border-destructive/50 text-destructive hover:bg-destructive hover:text-white"
              data-testid="header-logout-btn"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
