import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export default function Navigation() {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();

  if (!user) return null;

  const navItems = [
    { path: "/", icon: "fas fa-home", label: "Dashboard" },
    { path: "/surveys", icon: "fas fa-poll", label: "Surveys" },
    { path: "/games", icon: "fas fa-gamepad", label: "Game Offers" },
    { path: "/rewards", icon: "fas fa-gift", label: "Rewards" },
    { path: "/referrals", icon: "fas fa-users", label: "Referrals" },
    { path: "/leaderboard", icon: "fas fa-trophy", label: "Leaderboard" },
  ];

  return (
    <nav className="fixed left-0 top-0 w-64 h-screen bg-card border-r border-border p-6 hidden lg:block z-10">
      {/* Logo */}
      <div className="flex items-center mb-8">
        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center mr-3">
          <i className="fas fa-gamepad text-primary-foreground text-xl"></i>
        </div>
        <h1 className="text-2xl font-bold text-foreground">PlayVault</h1>
      </div>

      {/* Navigation Links */}
      <ul className="space-y-3 mb-8">
        {navItems.map((item) => {
          const isActive = location === item.path;
          return (
            <li key={item.path}>
              <button
                onClick={() => setLocation(item.path)}
                className={`w-full flex items-center p-3 rounded-lg font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
                data-testid={`nav-${item.path.replace('/', '') || 'dashboard'}`}
              >
                <i className={`${item.icon} w-5 mr-3`}></i>
                {item.label}
              </button>
            </li>
          );
        })}
      </ul>

      {/* User Profile Section */}
      <div className="mt-auto pt-6 border-t border-border">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
            <span className="text-accent-foreground font-bold">
              {user.firstName?.[0] || user.email?.[0] || 'U'}
            </span>
          </div>
          <div className="ml-3 flex-1">
            <p className="font-medium text-foreground truncate" data-testid="nav-user-name">
              {user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'User'}
            </p>
            <p className="text-sm text-muted-foreground">Level {user.level}</p>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={() => window.location.href = '/api/logout'}
          data-testid="button-logout"
        >
          <i className="fas fa-sign-out-alt mr-2"></i>
          Sign Out
        </Button>
      </div>
    </nav>
  );
}
