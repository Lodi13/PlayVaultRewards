import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";

export default function MobileNav() {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();

  if (!user) return null;

  const navItems = [
    { path: "/", icon: "fas fa-home", label: "Home" },
    { path: "/surveys", icon: "fas fa-poll", label: "Surveys" },
    { path: "/games", icon: "fas fa-gamepad", label: "Games" },
    { path: "/rewards", icon: "fas fa-gift", label: "Rewards" },
    { path: "/leaderboard", icon: "fas fa-trophy", label: "Ranking" },
  ];

  return (
    <>
      {/* Mobile Header */}
      <header className="lg:hidden bg-card border-b border-border p-4 fixed top-0 left-0 right-0 z-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center mr-2">
              <i className="fas fa-gamepad text-primary-foreground"></i>
            </div>
            <h1 className="text-xl font-bold">PlayVault</h1>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-accent" data-testid="mobile-xp-display">
              {user.xp} XP
            </span>
            <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
              <span className="text-accent-foreground text-sm font-bold">
                {user.firstName?.[0] || user.email?.[0] || 'U'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-20">
        <div className="grid grid-cols-5 py-2">
          {navItems.map((item) => {
            const isActive = location === item.path;
            return (
              <button
                key={item.path}
                onClick={() => setLocation(item.path)}
                className={`flex flex-col items-center py-2 transition-colors ${
                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
                data-testid={`mobile-nav-${item.path.replace('/', '') || 'dashboard'}`}
              >
                <i className={`${item.icon} text-lg mb-1`}></i>
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Add padding to main content for mobile */}
      <div className="lg:hidden h-16"></div>
    </>
  );
}
