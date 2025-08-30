import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Rewards() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: rewards, isLoading: rewardsLoading } = useQuery({
    queryKey: ["/api/rewards"],
  });

  const { data: redemptions, isLoading: redemptionsLoading } = useQuery({
    queryKey: ["/api/redemptions"],
    enabled: !!user,
  });

  const redeemMutation = useMutation({
    mutationFn: async ({ rewardId, deliveryInfo }: { rewardId: string; deliveryInfo?: any }) => {
      await apiRequest("POST", "/api/rewards/redeem", {
        rewardId,
        deliveryInfo,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/redemptions"] });
      toast({
        title: "Reward Redeemed!",
        description: "Your reward is being processed and will be delivered soon.",
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
      
      const errorMsg = error.message.includes("Insufficient XP") 
        ? "You don't have enough XP for this reward" 
        : "Failed to redeem reward";
      
      toast({
        title: "Redemption Failed",
        description: errorMsg,
        variant: "destructive",
      });
    },
  });

  const handleRedeem = (reward: any) => {
    if (user && user.xp >= reward.xpCost) {
      redeemMutation.mutate({
        rewardId: reward.id,
        deliveryInfo: {
          email: user.email,
          userId: user.id,
        },
      });
    }
  };

  if (!user) return null;

  // Mock rewards data if none from API
  const mockRewards = [
    {
      id: "1",
      name: "$5 PayPal",
      description: "Instant transfer to your PayPal account",
      xpCost: 1000,
      type: "paypal",
      imageUrl: "",
      isActive: true,
    },
    {
      id: "2",
      name: "$10 Amazon",
      description: "Amazon gift card code delivered via email",
      xpCost: 2000,
      type: "amazon",
      imageUrl: "",
      isActive: true,
    },
    {
      id: "3",
      name: "$25 Google Play",
      description: "Google Play store credit",
      xpCost: 5000,
      type: "google_play",
      imageUrl: "",
      isActive: true,
    },
    {
      id: "4",
      name: "Spotify Premium",
      description: "3 months of Spotify Premium subscription",
      xpCost: 3500,
      type: "spotify",
      imageUrl: "",
      isActive: true,
    },
    {
      id: "5",
      name: "$50 Steam",
      description: "Steam wallet code for gaming",
      xpCost: 10000,
      type: "steam",
      imageUrl: "",
      isActive: true,
    },
    {
      id: "6",
      name: "$100 PayPal",
      description: "Large PayPal cash reward",
      xpCost: 20000,
      type: "paypal",
      imageUrl: "",
      isActive: true,
    },
  ];

  const rewardsList = rewards || mockRewards;

  const getRewardIcon = (type: string) => {
    switch (type) {
      case 'paypal': return 'fab fa-paypal';
      case 'amazon': return 'fab fa-amazon';
      case 'google_play': return 'fab fa-google-play';
      case 'spotify': return 'fab fa-spotify';
      case 'steam': return 'fab fa-steam';
      default: return 'fas fa-gift';
    }
  };

  const getRewardColor = (type: string) => {
    switch (type) {
      case 'paypal': return 'from-blue-500 to-purple-600';
      case 'amazon': return 'from-yellow-500 to-orange-600';
      case 'google_play': return 'from-green-500 to-blue-500';
      case 'spotify': return 'from-green-600 to-black';
      case 'steam': return 'from-blue-700 to-gray-800';
      default: return 'from-purple-500 to-pink-500';
    }
  };

  return (
    <div className="lg:ml-64 min-h-screen">
      <div className="p-6 bg-card border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Reward Center</h2>
            <p className="text-muted-foreground">Redeem your XP for real rewards</p>
          </div>
          <div className="flex items-center bg-secondary rounded-lg p-3" data-testid="display-current-xp">
            <i className="fas fa-coins text-gold mr-2"></i>
            <span className="font-bold text-lg text-foreground">{user.xp}</span>
            <span className="text-muted-foreground ml-1">XP Available</span>
          </div>
        </div>
      </div>

      <main className="p-6 pb-20 lg:pb-6">
        <div className="max-w-6xl mx-auto">
          <Tabs defaultValue="rewards" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="rewards" data-testid="tab-rewards">Available Rewards</TabsTrigger>
              <TabsTrigger value="history" data-testid="tab-history">Redemption History</TabsTrigger>
            </TabsList>

            <TabsContent value="rewards" className="space-y-6">
              {/* Instructions */}
              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gold/10 rounded-lg flex items-center justify-center">
                      <i className="fas fa-gift text-gold text-xl"></i>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground mb-2">How to Redeem</h3>
                      <ul className="text-muted-foreground space-y-1">
                        <li>• Choose a reward you want to redeem</li>
                        <li>• Make sure you have enough XP</li>
                        <li>• Click "Redeem" and confirm your choice</li>
                        <li>• Your reward will be processed within 24-48 hours</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Rewards Grid */}
              {rewardsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {Array.from({ length: 8 }, (_, i) => (
                    <Card key={i} className="bg-card border-border animate-pulse">
                      <CardContent className="p-6">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-muted rounded-xl mx-auto mb-3"></div>
                          <div className="h-5 bg-muted rounded mb-1"></div>
                          <div className="h-4 bg-muted rounded mb-3"></div>
                          <div className="h-6 bg-muted rounded mb-3"></div>
                          <div className="h-8 bg-muted rounded"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {rewardsList.map((reward: any) => (
                    <Card 
                      key={reward.id} 
                      className="bg-card border-border hover:border-gold/50 transition-colors group"
                      data-testid={`card-reward-${reward.id}`}
                    >
                      <CardContent className="p-6">
                        <div className="text-center">
                          <div className={`w-16 h-16 bg-gradient-to-br ${getRewardColor(reward.type)} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                            <i className={`${getRewardIcon(reward.type)} text-white text-2xl`}></i>
                          </div>
                          
                          <h4 className="font-bold text-foreground mb-1">{reward.name}</h4>
                          <p className="text-sm text-muted-foreground mb-3">{reward.description}</p>
                          
                          <div className="flex items-center justify-center text-gold mb-3">
                            <i className="fas fa-coins mr-1"></i>
                            <span className="font-bold" data-testid={`text-cost-${reward.id}`}>
                              {reward.xpCost} XP
                            </span>
                          </div>
                          
                          {user.xp >= reward.xpCost ? (
                            <Button 
                              className="w-full group-hover:bg-primary/90 transition-colors"
                              onClick={() => handleRedeem(reward)}
                              disabled={redeemMutation.isPending}
                              data-testid={`button-redeem-${reward.id}`}
                            >
                              {redeemMutation.isPending ? "Processing..." : "Redeem"}
                            </Button>
                          ) : (
                            <Button 
                              variant="secondary" 
                              className="w-full cursor-not-allowed" 
                              disabled
                              data-testid={`button-insufficient-${reward.id}`}
                            >
                              Need {reward.xpCost - user.xp} more XP
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="history" className="space-y-6">
              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-foreground mb-6">Your Redemptions</h3>
                  
                  {redemptionsLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 3 }, (_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                            <div className="flex items-center">
                              <div className="w-12 h-12 bg-muted rounded-lg mr-4"></div>
                              <div>
                                <div className="h-4 bg-muted rounded w-32 mb-2"></div>
                                <div className="h-3 bg-muted rounded w-24"></div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="h-4 bg-muted rounded w-16 mb-2"></div>
                              <div className="h-6 bg-muted rounded w-20"></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : redemptions && redemptions.length > 0 ? (
                    <div className="space-y-4">
                      {redemptions.map((redemption: any) => (
                        <div key={redemption.id} className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                          <div className="flex items-center">
                            <div className={`w-12 h-12 bg-gradient-to-br ${getRewardColor(redemption.reward?.type || 'default')} rounded-lg flex items-center justify-center mr-4`}>
                              <i className={`${getRewardIcon(redemption.reward?.type || 'default')} text-white`}></i>
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{redemption.reward?.name || 'Unknown Reward'}</p>
                              <p className="text-sm text-muted-foreground">
                                Redeemed {new Date(redemption.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">-{redemption.xpSpent} XP</p>
                            <Badge 
                              variant={redemption.status === 'delivered' ? 'default' : 
                                      redemption.status === 'processing' ? 'secondary' : 'destructive'}
                              data-testid={`status-${redemption.id}`}
                            >
                              {redemption.status === 'delivered' ? 'Delivered' :
                               redemption.status === 'processing' ? 'Processing' : 'Failed'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="fas fa-history text-muted-foreground text-2xl"></i>
                      </div>
                      <h4 className="text-lg font-semibold text-foreground mb-2">No Redemptions Yet</h4>
                      <p className="text-muted-foreground">Start earning XP and redeem your first reward!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
