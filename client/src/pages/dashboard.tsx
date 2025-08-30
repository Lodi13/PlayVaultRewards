import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const { data: activities, isLoading: activitiesLoading } = useQuery({
    queryKey: ["/api/activities"],
    enabled: !!user,
  });

  const { data: dailyTasks, isLoading: tasksLoading } = useQuery({
    queryKey: ["/api/daily-tasks"],
    enabled: !!user,
  });

  const { data: milestones, isLoading: milestonesLoading } = useQuery({
    queryKey: ["/api/milestones"],
    enabled: !!user,
  });

  const { data: leaderboard } = useQuery({
    queryKey: ["/api/leaderboard"],
  });

  const updateStreakMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/streak/update");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
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
    },
  });

  useEffect(() => {
    if (user) {
      updateStreakMutation.mutate();
    }
  }, [user]);

  if (!user) return null;

  const currentRank = leaderboard?.findIndex((u: any) => u.id === user.id) + 1 || 0;
  const xpToNextLevel = (user.level * 2000) - user.xp;
  const levelProgress = ((user.xp % 2000) / 2000) * 100;

  return (
    <div className="lg:ml-64 min-h-screen">
      {/* Top Bar */}
      <div className="hidden lg:flex items-center justify-between p-6 bg-card border-b border-border">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Welcome back, {user.firstName || 'Player'}!
          </h2>
          <p className="text-muted-foreground">Ready to earn some XP today?</p>
        </div>
        <div className="flex items-center space-x-6">
          <div className="flex items-center bg-secondary rounded-lg p-3" data-testid="display-xp">
            <i className="fas fa-coins text-gold mr-2"></i>
            <span className="font-bold text-lg text-foreground">{user.xp}</span>
            <span className="text-muted-foreground ml-1">XP</span>
          </div>
          <div className="flex items-center bg-primary rounded-lg p-3" data-testid="display-level">
            <i className="fas fa-star text-primary-foreground mr-2"></i>
            <span className="font-bold text-primary-foreground">Level {user.level}</span>
          </div>
        </div>
      </div>

      <main className="flex-1 p-6 overflow-auto bg-background pb-20 lg:pb-6">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Total XP</p>
                    <p className="text-3xl font-bold text-foreground" data-testid="text-total-xp">{user.xp}</p>
                  </div>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <i className="fas fa-coins text-primary text-xl"></i>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Current Streak</p>
                    <p className="text-3xl font-bold text-accent" data-testid="text-streak">{user.streak}</p>
                  </div>
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                    <i className="fas fa-fire text-accent text-xl"></i>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Rank</p>
                    <p className="text-3xl font-bold text-foreground" data-testid="text-rank">
                      {currentRank > 0 ? `#${currentRank}` : '--'}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                    <i className="fas fa-trophy text-purple-400 text-xl"></i>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Level</p>
                    <p className="text-3xl font-bold text-foreground" data-testid="text-level">{user.level}</p>
                  </div>
                  <div className="w-12 h-12 bg-gold/10 rounded-lg flex items-center justify-center">
                    <i className="fas fa-star text-gold text-xl"></i>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* XP Progress and Daily Streak */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-foreground mb-4">Level Progress</h3>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Level {user.level}</span>
                    <span className="text-muted-foreground">Level {user.level + 1}</span>
                  </div>
                  <Progress value={levelProgress} className="h-4" data-testid="progress-level" />
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground font-medium">{user.xp} XP</span>
                    <span className="text-muted-foreground">
                      Need <span className="text-accent font-medium">{xpToNextLevel} XP</span> more
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-foreground mb-4">Daily Streak</h3>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-3xl font-bold text-accent" data-testid="text-streak-days">{user.streak}</p>
                    <p className="text-muted-foreground">Days in a row</p>
                  </div>
                  <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center">
                    <i className="fas fa-fire text-accent text-2xl"></i>
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: 7 }, (_, i) => (
                    <div 
                      key={i}
                      className={`w-8 h-8 rounded-md flex items-center justify-center ${
                        i < user.streak ? 'bg-accent' : 'bg-muted'
                      }`}
                      data-testid={`streak-day-${i}`}
                    >
                      <i className={`fas fa-check text-xs ${
                        i < user.streak ? 'text-accent-foreground' : 'text-muted-foreground'
                      }`}></i>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card 
              className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer group"
              onClick={() => setLocation('/surveys')}
              data-testid="card-surveys"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-foreground">Complete Surveys</h3>
                  <div className="w-10 h-10 bg-primary/10 group-hover:bg-primary/20 rounded-lg flex items-center justify-center transition-colors">
                    <i className="fas fa-poll text-primary"></i>
                  </div>
                </div>
                <p className="text-muted-foreground mb-4">Earn 50-500 XP per survey</p>
                <div className="flex items-center text-accent">
                  <span className="font-medium">Start earning</span>
                  <i className="fas fa-arrow-right ml-2 group-hover:translate-x-1 transition-transform"></i>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="bg-card border-border hover:border-accent/50 transition-colors cursor-pointer group"
              onClick={() => setLocation('/games')}
              data-testid="card-games"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-foreground">Play & Earn</h3>
                  <div className="w-10 h-10 bg-accent/10 group-hover:bg-accent/20 rounded-lg flex items-center justify-center transition-colors">
                    <i className="fas fa-gamepad text-accent"></i>
                  </div>
                </div>
                <p className="text-muted-foreground mb-4">Install games for XP rewards</p>
                <div className="flex items-center text-accent">
                  <span className="font-medium">Browse games</span>
                  <i className="fas fa-arrow-right ml-2 group-hover:translate-x-1 transition-transform"></i>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="bg-card border-border hover:border-gold/50 transition-colors cursor-pointer group"
              onClick={() => setLocation('/referrals')}
              data-testid="card-referrals"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-foreground">Invite Friends</h3>
                  <div className="w-10 h-10 bg-gold/10 group-hover:bg-gold/20 rounded-lg flex items-center justify-center transition-colors">
                    <i className="fas fa-user-plus text-gold"></i>
                  </div>
                </div>
                <p className="text-muted-foreground mb-4">Earn 250 XP per referral</p>
                <div className="flex items-center text-gold">
                  <span className="font-medium">Get your link</span>
                  <i className="fas fa-arrow-right ml-2 group-hover:translate-x-1 transition-transform"></i>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity & Daily Tasks */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-foreground mb-6">Recent Activity</h3>
                {activitiesLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }, (_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="flex items-center p-4 bg-secondary rounded-lg">
                          <div className="w-10 h-10 bg-muted rounded-lg mr-4"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-muted rounded w-1/2"></div>
                          </div>
                          <div className="w-16 h-6 bg-muted rounded"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : activities && activities.length > 0 ? (
                  <div className="space-y-4">
                    {activities.slice(0, 5).map((activity: any) => (
                      <div key={activity.id} className="flex items-center p-4 bg-secondary rounded-lg">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-4 ${
                          activity.type === 'survey' ? 'bg-primary' :
                          activity.type === 'game' ? 'bg-accent' :
                          activity.type === 'referral' ? 'bg-gold' : 'bg-purple-500'
                        }`}>
                          <i className={`text-white ${
                            activity.type === 'survey' ? 'fas fa-poll' :
                            activity.type === 'game' ? 'fas fa-gamepad' :
                            activity.type === 'referral' ? 'fas fa-user-plus' : 'fas fa-star'
                          }`}></i>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{activity.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(activity.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-accent font-bold">+{activity.xpGained} XP</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No activity yet. Start earning XP!
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-foreground mb-6">Daily Tasks</h3>
                {tasksLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }, (_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                          <div className="flex items-center">
                            <div className="w-6 h-6 bg-muted rounded-full mr-3"></div>
                            <div>
                              <div className="h-4 bg-muted rounded w-32 mb-2"></div>
                              <div className="h-3 bg-muted rounded w-24"></div>
                            </div>
                          </div>
                          <div className="w-16 h-6 bg-muted rounded"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : dailyTasks && dailyTasks.length > 0 ? (
                  <div className="space-y-4">
                    {dailyTasks.map((task: any) => (
                      <div key={task.id} className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                        <div className="flex items-center">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                            task.completed ? 'bg-accent' : 'border-2 border-muted'
                          }`}>
                            {task.completed && <i className="fas fa-check text-accent-foreground text-xs"></i>}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {task.taskType === 'survey' ? 'Complete 1 survey' :
                               task.taskType === 'game' ? 'Install a new game' :
                               'Share referral link'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {task.taskType === 'survey' ? 'Daily survey bonus' :
                               task.taskType === 'game' ? 'Discover something new' :
                               'Spread the word'}
                            </p>
                          </div>
                        </div>
                        <div className="text-accent font-bold">+{task.xpReward} XP</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No tasks available today.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Leaderboard Preview */}
          {leaderboard && leaderboard.length > 0 && (
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-foreground">Top Earners</h3>
                  <Button 
                    variant="outline" 
                    onClick={() => setLocation('/leaderboard')}
                    data-testid="button-view-leaderboard"
                  >
                    View Full Leaderboard
                  </Button>
                </div>
                <div className="space-y-3">
                  {leaderboard.slice(0, 5).map((player: any, index: number) => (
                    <div 
                      key={player.id} 
                      className={`flex items-center p-4 rounded-lg ${
                        player.id === user.id ? 'bg-primary/10 border-2 border-primary' : 'bg-secondary'
                      }`}
                    >
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold mr-4 ${
                        index === 0 ? 'bg-gold text-white' :
                        index === 1 ? 'bg-gray-400 text-white' :
                        index === 2 ? 'bg-orange-500 text-white' : 'bg-muted text-foreground'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center mr-4">
                        <span className="text-accent-foreground font-bold">
                          {player.firstName?.[0] || 'U'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">
                          {player.firstName || 'Anonymous'} {player.id === user.id && '(You)'}
                        </p>
                        <p className="text-sm text-muted-foreground">Level {player.level}</p>
                      </div>
                      <div className="text-accent font-bold">{player.xp} XP</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
