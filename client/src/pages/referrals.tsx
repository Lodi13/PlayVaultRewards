import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function Referrals() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);

  const { data: referralCode } = useQuery({
    queryKey: ["/api/referral-code"],
    enabled: !!user,
  });

  const { data: referrals, isLoading: referralsLoading } = useQuery({
    queryKey: ["/api/referrals"],
    enabled: !!user,
  });

  const completeDailyTaskMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/daily-tasks/complete", {
        taskType: "referral_share",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/daily-tasks"] });
      toast({
        title: "Daily Task Completed!",
        description: "You earned bonus XP for sharing your referral link!",
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
    },
  });

  const referralLink = referralCode ? 
    `${window.location.origin}?ref=${referralCode}` : 
    `${window.location.origin}?ref=loading...`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      completeDailyTaskMutation.mutate();
      toast({
        title: "Link Copied!",
        description: "Your referral link has been copied to clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Please manually copy the link.",
        variant: "destructive",
      });
    }
  };

  const shareOnSocial = (platform: string) => {
    const text = "Join me on PlayVault and earn XP by completing surveys and playing games! Get real rewards like PayPal cash and gift cards.";
    const url = referralLink;
    
    let shareUrl = "";
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank');
      completeDailyTaskMutation.mutate();
    }
  };

  if (!user) return null;

  return (
    <div className="lg:ml-64 min-h-screen">
      <div className="p-6 bg-card border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Referral Program</h2>
            <p className="text-muted-foreground">Invite friends and earn 250 XP per referral</p>
          </div>
          <div className="flex items-center bg-secondary rounded-lg p-3" data-testid="display-current-xp">
            <i className="fas fa-coins text-gold mr-2"></i>
            <span className="font-bold text-lg text-foreground">{user.xp}</span>
            <span className="text-muted-foreground ml-1">XP</span>
          </div>
        </div>
      </div>

      <main className="p-6 pb-20 lg:pb-6">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* How It Works */}
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-foreground mb-4">How Referrals Work</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <i className="fas fa-share text-primary text-xl"></i>
                  </div>
                  <h4 className="font-semibold text-foreground mb-2">1. Share Your Link</h4>
                  <p className="text-sm text-muted-foreground">Copy your unique referral link and share it with friends</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <i className="fas fa-user-plus text-accent text-xl"></i>
                  </div>
                  <h4 className="font-semibold text-foreground mb-2">2. Friend Joins</h4>
                  <p className="text-sm text-muted-foreground">Your friend signs up using your referral link</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-gold/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <i className="fas fa-coins text-gold text-xl"></i>
                  </div>
                  <h4 className="font-semibold text-foreground mb-2">3. Earn XP</h4>
                  <p className="text-sm text-muted-foreground">Get 250 XP when they complete their first survey</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Referral Link Section */}
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-foreground mb-4">Your Referral Link</h3>
              <div className="space-y-4">
                <div className="flex bg-secondary rounded-lg border border-border">
                  <Input 
                    type="text" 
                    className="flex-1 bg-transparent border-0 text-foreground" 
                    value={referralLink}
                    readOnly
                    data-testid="input-referral-link"
                  />
                  <Button 
                    onClick={copyToClipboard}
                    className={`rounded-l-none ${copied ? 'bg-accent text-accent-foreground' : ''}`}
                    data-testid="button-copy-link"
                  >
                    <i className={`fas ${copied ? 'fa-check' : 'fa-copy'} mr-2`}></i>
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  Share this link with friends to earn 250 XP for each person who joins and completes their first survey!
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Social Sharing */}
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-foreground mb-4">Share on Social Media</h3>
              <div className="flex flex-wrap gap-4">
                <Button 
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                  onClick={() => shareOnSocial('twitter')}
                  data-testid="button-share-twitter"
                >
                  <i className="fab fa-twitter mr-2"></i>
                  Twitter
                </Button>
                <Button 
                  className="bg-blue-700 hover:bg-blue-800 text-white"
                  onClick={() => shareOnSocial('facebook')}
                  data-testid="button-share-facebook"
                >
                  <i className="fab fa-facebook mr-2"></i>
                  Facebook
                </Button>
                <Button 
                  className="bg-green-500 hover:bg-green-600 text-white"
                  onClick={() => shareOnSocial('whatsapp')}
                  data-testid="button-share-whatsapp"
                >
                  <i className="fab fa-whatsapp mr-2"></i>
                  WhatsApp
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Referral Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-card border-border">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <i className="fas fa-users text-accent text-xl"></i>
                </div>
                <p className="text-2xl font-bold text-foreground" data-testid="text-total-referrals">
                  {referrals?.length || 0}
                </p>
                <p className="text-sm text-muted-foreground">Total Referrals</p>
              </CardContent>
            </Card>
            
            <Card className="bg-card border-border">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gold/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <i className="fas fa-coins text-gold text-xl"></i>
                </div>
                <p className="text-2xl font-bold text-foreground" data-testid="text-referral-xp">
                  {(referrals?.length || 0) * 250}
                </p>
                <p className="text-sm text-muted-foreground">XP from Referrals</p>
              </CardContent>
            </Card>
            
            <Card className="bg-card border-border">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <i className="fas fa-trophy text-primary text-xl"></i>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {referrals?.length >= 50 ? 'Master' :
                   referrals?.length >= 20 ? 'Expert' :
                   referrals?.length >= 10 ? 'Pro' :
                   referrals?.length >= 5 ? 'Active' : 'Beginner'}
                </p>
                <p className="text-sm text-muted-foreground">Referrer Rank</p>
              </CardContent>
            </Card>
          </div>

          {/* Your Referrals */}
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-foreground mb-6">Your Referrals</h3>
              
              {referralsLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }, (_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-muted rounded-full mr-3"></div>
                          <div>
                            <div className="h-4 bg-muted rounded w-32 mb-1"></div>
                            <div className="h-3 bg-muted rounded w-24"></div>
                          </div>
                        </div>
                        <div className="w-16 h-6 bg-muted rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : referrals && referrals.length > 0 ? (
                <div className="space-y-3">
                  {referrals.map((referral: any, index: number) => (
                    <div key={referral.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center mr-3">
                          <span className="text-accent-foreground text-sm font-bold">
                            {referral.firstName?.[0] || referral.email?.[0] || 'U'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {referral.firstName ? `${referral.firstName} ${referral.lastName || ''}` : 'Anonymous User'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Joined {new Date(referral.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-accent font-bold text-sm">+250 XP</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-user-friends text-muted-foreground text-2xl"></i>
                  </div>
                  <h4 className="text-lg font-semibold text-foreground mb-2">No Referrals Yet</h4>
                  <p className="text-muted-foreground mb-4">Start sharing your link to earn XP!</p>
                  <Button 
                    onClick={copyToClipboard}
                    data-testid="button-copy-first-link"
                  >
                    Copy Your Link
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Referral Tips */}
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-foreground mb-4">Tips for Success</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3">
                  <i className="fas fa-lightbulb text-gold text-lg mt-0.5"></i>
                  <div>
                    <h4 className="font-semibold text-foreground">Personal Message</h4>
                    <p className="text-sm text-muted-foreground">Add a personal note when sharing your link</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <i className="fas fa-users text-accent text-lg mt-0.5"></i>
                  <div>
                    <h4 className="font-semibold text-foreground">Target Interested Friends</h4>
                    <p className="text-sm text-muted-foreground">Share with friends who like surveys and games</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <i className="fas fa-calendar text-primary text-lg mt-0.5"></i>
                  <div>
                    <h4 className="font-semibold text-foreground">Share Regularly</h4>
                    <p className="text-sm text-muted-foreground">Post on social media regularly for more exposure</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <i className="fas fa-star text-gold text-lg mt-0.5"></i>
                  <div>
                    <h4 className="font-semibold text-foreground">Show Your Success</h4>
                    <p className="text-sm text-muted-foreground">Share screenshots of your rewards and XP</p>
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
