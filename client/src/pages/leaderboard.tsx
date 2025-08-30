import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Leaderboard() {
  const { user } = useAuth();

  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ["/api/leaderboard"],
  });

  if (!user) return null;

  const userRank = leaderboard?.findIndex((u: any) => u.id === user.id) + 1 || 0;

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return { icon: "fas fa-crown", color: "text-gold", bg: "bg-gold" };
      case 2: return { icon: "fas fa-medal", color: "text-gray-400", bg: "bg-gray-400" };
      case 3: return { icon: "fas fa-award", color: "text-orange-500", bg: "bg-orange-500" };
      default: return { icon: "fas fa-user", color: "text-muted-foreground", bg: "bg-muted" };
    }
  };

  return (
    <div className="lg:ml-64 min-h-screen">
      <div className="p-6 bg-card border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Leaderboard</h2>
            <p className="text-muted-foreground">See how you rank against other players</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Your Rank</p>
              <p className="text-2xl font-bold text-primary" data-testid="text-user-rank">
                {userRank > 0 ? `#${userRank}` : '--'}
              </p>
            </div>
            <div className="flex items-center bg-secondary rounded-lg p-3" data-testid="display-current-xp">
              <i className="fas fa-coins text-gold mr-2"></i>
              <span className="font-bold text-lg text-foreground">{user.xp}</span>
              <span className="text-muted-foreground ml-1">XP</span>
            </div>
          </div>
        </div>
      </div>

      <main className="p-6 pb-20 lg:pb-6">
        <div className="max-w-4xl mx-auto space-y-6">

          {/* Top 3 Podium */}
          {leaderboard && leaderboard.length >= 3 && (
            <Card className="bg-card border-border">
              <CardContent className="p-8">
                <h3 className="text-xl font-bold text-foreground mb-8 text-center">Top 3 Players</h3>
                <div className="flex items-end justify-center space-x-8">
                  
                  {/* 2nd Place */}
                  <div className="text-center">
                    <div className="relative mb-4">
                      <div className="w-20 h-20 bg-gray-400 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-white font-bold text-xl">
                          {leaderboard[1]?.firstName?.[0] || 'U'}
                        </span>
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">2</span>
                      </div>
                    </div>
                    <p className="font-bold text-foreground" data-testid="text-second-place">
                      {leaderboard[1]?.firstName || 'Anonymous'}
                    </p>
                    <p className="text-sm text-muted-foreground">Level {leaderboard[1]?.level}</p>
                    <p className="text-lg font-bold text-gray-400">{leaderboard[1]?.xp} XP</p>
                  </div>

                  {/* 1st Place */}
                  <div className="text-center">
                    <div className="relative mb-4">
                      <div className="w-24 h-24 bg-gold rounded-full flex items-center justify-center mx-auto mb-2 animate-pulse-glow">
                        <span className="text-white font-bold text-2xl">
                          {leaderboard[0]?.firstName?.[0] || 'U'}
                        </span>
                      </div>
                      <div className="absolute -top-4 -right-4 w-10 h-10 bg-gold rounded-full flex items-center justify-center">
                        <i className="fas fa-crown text-white"></i>
                      </div>
                    </div>
                    <p className="font-bold text-foreground text-lg" data-testid="text-first-place">
                      {leaderboard[0]?.firstName || 'Anonymous'}
                    </p>
                    <p className="text-sm text-muted-foreground">Level {leaderboard[0]?.level}</p>
                    <p className="text-xl font-bold text-gold">{leaderboard[0]?.xp} XP</p>
                  </div>

                  {/* 3rd Place */}
                  <div className="text-center">
                    <div className="relative mb-4">
                      <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-white font-bold text-xl">
                          {leaderboard[2]?.firstName?.[0] || 'U'}
                        </span>
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">3</span>
                      </div>
                    </div>
                    <p className="font-bold text-foreground" data-testid="text-third-place">
                      {leaderboard[2]?.firstName || 'Anonymous'}
                    </p>
                    <p className="text-sm text-muted-foreground">Level {leaderboard[2]?.level}</p>
                    <p className="text-lg font-bold text-orange-500">{leaderboard[2]?.xp} XP</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Full Leaderboard */}
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-foreground mb-6">Global Rankings</h3>
              
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 10 }, (_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="flex items-center p-4 bg-secondary rounded-lg">
                        <div className="w-8 h-8 bg-muted rounded-full mr-4"></div>
                        <div className="w-10 h-10 bg-muted rounded-full mr-4"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-muted rounded w-32 mb-2"></div>
                          <div className="h-3 bg-muted rounded w-24"></div>
                        </div>
                        <div className="w-20 h-6 bg-muted rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : leaderboard && leaderboard.length > 0 ? (
                <div className="space-y-3">
                  {leaderboard.map((player: any, index: number) => {
                    const rank = index + 1;
                    const rankInfo = getRankIcon(rank);
                    const isCurrentUser = player.id === user.id;
                    
                    return (
                      <div 
                        key={player.id}
                        className={`flex items-center p-4 rounded-lg transition-colors ${
                          isCurrentUser 
                            ? 'bg-primary/10 border-2 border-primary' 
                            : 'bg-secondary hover:bg-secondary/80'
                        }`}
                        data-testid={`leaderboard-row-${rank}`}
                      >
                        {/* Rank */}
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold mr-4 ${
                          rank <= 3 ? rankInfo.bg + ' text-white' : 'bg-muted text-foreground'
                        }`}>
                          {rank <= 3 ? (
                            <i className={rankInfo.icon + ' text-sm'}></i>
                          ) : (
                            rank
                          )}
                        </div>

                        {/* Avatar */}
                        <Avatar className="w-10 h-10 mr-4" data-testid={`avatar-${player.id}`}>
                          <AvatarImage src={player.profileImageUrl} />
                          <AvatarFallback className="bg-accent text-accent-foreground">
                            {player.firstName?.[0] || player.email?.[0] || 'U'}
                          </AvatarFallback>
                        </Avatar>

                        {/* Player Info */}
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <p className="font-semibold text-foreground">
                              {player.firstName ? `${player.firstName} ${player.lastName || ''}`.trim() : 'Anonymous'}
                              {isCurrentUser && (
                                <span className="text-primary font-normal"> (You)</span>
                              )}
                            </p>
                            {rank <= 3 && (
                              <Badge variant="outline" className={`${rankInfo.color} border-current`}>
                                {rank === 1 ? 'Champion' : rank === 2 ? 'Runner-up' : 'Bronze'}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Level {player.level} • {player.streak || 0} day streak
                          </p>
                        </div>

                        {/* XP */}
                        <div className="text-right">
                          <p className={`font-bold text-lg ${
                            rank === 1 ? 'text-gold' :
                            rank === 2 ? 'text-gray-400' :
                            rank === 3 ? 'text-orange-500' :
                            isCurrentUser ? 'text-primary' : 'text-accent'
                          }`} data-testid={`xp-${player.id}`}>
                            {player.xp.toLocaleString()} XP
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {((player.xp / (leaderboard[0]?.xp || 1)) * 100).toFixed(1)}% of #1
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-trophy text-muted-foreground text-2xl"></i>
                  </div>
                  <h4 className="text-lg font-semibold text-foreground mb-2">No Rankings Yet</h4>
                  <p className="text-muted-foreground">Be the first to earn XP and claim the top spot!</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Competition Info */}
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-foreground mb-4">How Rankings Work</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3">
                  <i className="fas fa-chart-line text-primary text-lg mt-0.5"></i>
                  <div>
                    <h4 className="font-semibold text-foreground">Total XP Ranking</h4>
                    <p className="text-sm text-muted-foreground">Rankings based on lifetime XP earned</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <i className="fas fa-sync-alt text-accent text-lg mt-0.5"></i>
                  <div>
                    <h4 className="font-semibold text-foreground">Real-Time Updates</h4>
                    <p className="text-sm text-muted-foreground">Leaderboard updates as you earn XP</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <i className="fas fa-medal text-gold text-lg mt-0.5"></i>
                  <div>
                    <h4 className="font-semibold text-foreground">Special Rewards</h4>
                    <p className="text-sm text-muted-foreground">Top players get exclusive badges and bonuses</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <i className="fas fa-users text-purple-400 text-lg mt-0.5"></i>
                  <div>
                    <h4 className="font-semibold text-foreground">Fair Competition</h4>
                    <p className="text-sm text-muted-foreground">All users compete on equal terms</p>
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
