import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Games() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: games, isLoading } = useQuery({
    queryKey: ["/api/games"],
  });

  const addXPMutation = useMutation({
    mutationFn: async ({ xpGained, description, gameName }: { xpGained: number; description: string; gameName: string }) => {
      await apiRequest("POST", "/api/xp/add", {
        xpGained,
        type: "game",
        description,
        metadata: { gameName },
      });
    },
    onSuccess: ({ xpGained }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      
      // Show XP notification
      window.dispatchEvent(new CustomEvent('showXPNotification', { 
        detail: { xpGained } 
      }));
      
      toast({
        title: "Game Installed!",
        description: `You earned ${xpGained} XP!`,
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to record game installation",
        variant: "destructive",
      });
    },
  });

  const completeDailyTaskMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/daily-tasks/complete", {
        taskType: "game",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/daily-tasks"] });
    },
  });

  const handleGameInstall = (game: any) => {
    // Open game in new window/tab
    window.open(game.affiliateUrl, '_blank');
    
    // Award XP for installation
    addXPMutation.mutate({
      xpGained: game.xpReward,
      description: `Installed: "${game.name}"`,
      gameName: game.name,
    });

    // Complete daily task if applicable
    completeDailyTaskMutation.mutate();
  };

  if (!user) return null;

  // Mock games data if none from API
  const mockGames = [
    {
      id: "1",
      name: "Puzzle Adventures",
      description: "Match-3 puzzle game with epic adventures",
      xpReward: 500,
      imageUrl: "",
      affiliateUrl: "https://example.com/puzzle-adventures",
      category: "Puzzle",
    },
    {
      id: "2", 
      name: "Speed Racer 3D",
      description: "High-speed racing with realistic physics",
      xpReward: 750,
      imageUrl: "",
      affiliateUrl: "https://example.com/speed-racer",
      category: "Racing",
    },
    {
      id: "3",
      name: "Empire Builder",
      description: "Build your empire in this strategy MMO",
      xpReward: 1000,
      imageUrl: "",
      affiliateUrl: "https://example.com/empire-builder", 
      category: "Strategy",
    },
    {
      id: "4",
      name: "Magic Quest RPG",
      description: "Embark on magical adventures in this fantasy RPG",
      xpReward: 800,
      imageUrl: "",
      affiliateUrl: "https://example.com/magic-quest",
      category: "RPG",
    },
    {
      id: "5",
      name: "City Builder Tycoon",
      description: "Design and manage your dream city",
      xpReward: 600,
      imageUrl: "",
      affiliateUrl: "https://example.com/city-builder",
      category: "Simulation",
    },
    {
      id: "6",
      name: "Battle Arena",
      description: "Real-time strategy battles with global players",
      xpReward: 900,
      imageUrl: "",
      affiliateUrl: "https://example.com/battle-arena",
      category: "Strategy",
    },
  ];

  const gameOffers = games || mockGames;

  return (
    <div className="lg:ml-64 min-h-screen">
      <div className="p-6 bg-card border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Game Offers</h2>
            <p className="text-muted-foreground">Install games and earn XP rewards</p>
          </div>
          <div className="flex items-center bg-secondary rounded-lg p-3" data-testid="display-current-xp">
            <i className="fas fa-coins text-gold mr-2"></i>
            <span className="font-bold text-lg text-foreground">{user.xp}</span>
            <span className="text-muted-foreground ml-1">XP</span>
          </div>
        </div>
      </div>

      <main className="p-6 pb-20 lg:pb-6">
        <div className="max-w-6xl mx-auto space-y-6">
          
          {/* Instructions */}
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                  <i className="fas fa-gamepad text-accent text-xl"></i>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-2">How to Earn XP</h3>
                  <ul className="text-muted-foreground space-y-1">
                    <li>• Click "Install" to open the game store page</li>
                    <li>• Download and install the game on your device</li>
                    <li>• XP is awarded instantly upon clicking install</li>
                    <li>• Higher XP rewards for more engaging games</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Game Categories Filter */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="default" className="cursor-pointer" data-testid="filter-all">All Games</Badge>
            <Badge variant="outline" className="cursor-pointer" data-testid="filter-puzzle">Puzzle</Badge>
            <Badge variant="outline" className="cursor-pointer" data-testid="filter-racing">Racing</Badge>
            <Badge variant="outline" className="cursor-pointer" data-testid="filter-strategy">Strategy</Badge>
            <Badge variant="outline" className="cursor-pointer" data-testid="filter-rpg">RPG</Badge>
            <Badge variant="outline" className="cursor-pointer" data-testid="filter-simulation">Simulation</Badge>
          </div>

          {/* Games Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }, (_, i) => (
                <Card key={i} className="bg-card border-border animate-pulse">
                  <div className="h-48 bg-muted rounded-t-xl"></div>
                  <CardContent className="p-4">
                    <div className="h-6 bg-muted rounded mb-2"></div>
                    <div className="h-4 bg-muted rounded mb-3"></div>
                    <div className="flex items-center justify-between">
                      <div className="h-6 bg-muted rounded w-20"></div>
                      <div className="h-8 bg-muted rounded w-16"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {gameOffers.map((game: any) => (
                <Card 
                  key={game.id} 
                  className="bg-card border-border hover:border-accent/50 transition-colors group overflow-hidden"
                  data-testid={`card-game-${game.id}`}
                >
                  {/* Game Screenshot/Icon */}
                  <div className={`h-48 flex items-center justify-center ${
                    game.category === 'Puzzle' ? 'bg-gradient-to-br from-purple-600 to-blue-600' :
                    game.category === 'Racing' ? 'bg-gradient-to-br from-red-600 to-orange-600' :
                    game.category === 'Strategy' ? 'bg-gradient-to-br from-green-600 to-teal-600' :
                    game.category === 'RPG' ? 'bg-gradient-to-br from-purple-700 to-pink-600' :
                    game.category === 'Simulation' ? 'bg-gradient-to-br from-blue-600 to-cyan-600' :
                    'bg-gradient-to-br from-gray-600 to-gray-800'
                  }`}>
                    <i className={`text-white text-4xl ${
                      game.category === 'Puzzle' ? 'fas fa-puzzle-piece' :
                      game.category === 'Racing' ? 'fas fa-car' :
                      game.category === 'Strategy' ? 'fas fa-chess' :
                      game.category === 'RPG' ? 'fas fa-magic' :
                      game.category === 'Simulation' ? 'fas fa-city' :
                      'fas fa-gamepad'
                    }`}></i>
                  </div>
                  
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-bold text-foreground group-hover:text-accent transition-colors">
                        {game.name}
                      </h4>
                      <Badge variant="secondary" className="text-xs">
                        {game.category}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {game.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-accent">
                        <i className="fas fa-coins mr-1"></i>
                        <span className="font-bold" data-testid={`text-xp-${game.id}`}>
                          +{game.xpReward} XP
                        </span>
                      </div>
                      <Button 
                        size="sm"
                        onClick={() => handleGameInstall(game)}
                        disabled={addXPMutation.isPending}
                        className="group-hover:bg-primary/90 transition-colors"
                        data-testid={`button-install-${game.id}`}
                      >
                        {addXPMutation.isPending ? "Installing..." : "Install"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Pro Tips */}
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-foreground mb-4">Pro Tips for Maximum Earnings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-start space-x-3">
                  <i className="fas fa-star text-gold text-lg mt-0.5"></i>
                  <div>
                    <h4 className="font-semibold text-foreground">Try Different Genres</h4>
                    <p className="text-sm text-muted-foreground">Explore various game types for diverse XP rewards</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <i className="fas fa-calendar-check text-accent text-lg mt-0.5"></i>
                  <div>
                    <h4 className="font-semibold text-foreground">Daily Task Bonus</h4>
                    <p className="text-sm text-muted-foreground">Install games to complete daily tasks for extra XP</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <i className="fas fa-trophy text-primary text-lg mt-0.5"></i>
                  <div>
                    <h4 className="font-semibold text-foreground">High-Value Games</h4>
                    <p className="text-sm text-muted-foreground">Strategy and RPG games often offer higher XP rewards</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
