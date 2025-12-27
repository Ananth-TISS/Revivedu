import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, User, BookOpen, Sparkles, Library } from "lucide-react";
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
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 sm:py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 sm:gap-6">
            <Link 
              to="/" 
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              data-testid="header-home-link"
            >
              <img 
                src="/revivedu-logo.png" 
                alt="ReviveEdu – Reviving the Joy of Learning"
                className="h-10 sm:h-12 md:h-14 w-auto object-contain"
              />
            </Link>
            
            <nav className="hidden md:flex items-center gap-2 lg:gap-4">
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
          
          <div className="flex items-center gap-2 sm:gap-3">
            {user && (
              <span className="text-xs sm:text-sm text-foreground/60 hidden sm:inline">
                Welcome, {user.name}
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="rounded-full border-2 border-destructive/50 text-destructive hover:bg-destructive hover:text-white text-xs sm:text-sm"
              data-testid="header-logout-btn"
            >
              <LogOut className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Logout</span>
              <span className="sm:hidden">Exit</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
