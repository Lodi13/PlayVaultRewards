import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export default function Surveys() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addXPMutation = useMutation({
    mutationFn: async ({ xpGained, description }: { xpGained: number; description: string }) => {
      await apiRequest("POST", "/api/xp/add", {
        xpGained,
        type: "survey",
        description,
        metadata: { source: "cpx_research" },
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
        title: "Survey Completed!",
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
        description: "Failed to record survey completion",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (!user) return;

    // Listen for survey completion from CPX Research iframe
    const handleMessage = (event: MessageEvent) => {
      // CPX Research will send completion messages
      if (event.data?.type === 'survey_complete') {
        const xpGained = event.data.reward || 150;
        addXPMutation.mutate({
          xpGained,
          description: `Completed survey: "${event.data.surveyName || 'Survey'}"`,
        });
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [user, addXPMutation]);

  const handleTestSurvey = () => {
    const xpGained = Math.floor(Math.random() * 400) + 100; // 100-500 XP
    addXPMutation.mutate({
      xpGained,
      description: `Completed survey: "Test Survey"`,
    });
  };

  if (!user) return null;

  return (
    <div className="lg:ml-64 min-h-screen">
      <div className="p-6 bg-card border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Survey Wall</h2>
            <p className="text-muted-foreground">Complete surveys to earn XP</p>
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
          
          {/* Survey Instructions */}
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <i className="fas fa-info text-primary text-xl"></i>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-2">How It Works</h3>
                  <ul className="text-muted-foreground space-y-1">
                    <li>• Browse available surveys below</li>
                    <li>• Complete surveys honestly and thoroughly</li>
                    <li>• Earn 50-500 XP per completed survey</li>
                    <li>• XP is automatically added to your account</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Test Survey Button (for development) */}
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="text-center">
                <h3 className="text-lg font-bold text-foreground mb-4">Test Survey Completion</h3>
                <p className="text-muted-foreground mb-4">Click below to simulate completing a survey (for testing purposes)</p>
                <Button 
                  onClick={handleTestSurvey}
                  disabled={addXPMutation.isPending}
                  data-testid="button-test-survey"
                >
                  {addXPMutation.isPending ? "Processing..." : "Complete Test Survey"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* CPX Research Survey Wall */}
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-foreground">Available Surveys</h3>
                <div className="flex items-center text-accent">
                  <i className="fas fa-sync-alt mr-2"></i>
                  <span className="text-sm">Refreshed automatically</span>
                </div>
              </div>
              
              {/* Survey Integration Frame */}
              <div className="bg-secondary rounded-lg border-2 border-dashed border-border min-h-[600px]">
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-poll text-primary text-2xl"></i>
                  </div>
                  <h4 className="text-lg font-semibold text-foreground mb-2">CPX Research Integration</h4>
                  <p className="text-muted-foreground mb-6">Survey wall will be embedded here via iframe</p>
                  
                  <div className="bg-muted rounded-lg p-6 text-left max-w-2xl mx-auto">
                    <p className="text-sm text-foreground mb-4">Integration details:</p>
                    <div className="bg-background rounded-md p-4 font-mono text-sm">
                      <div className="text-accent">&lt;iframe</div>
                      <div className="ml-4 text-muted-foreground">
                        src="https://offers.cpx-research.com/index.php?app_id=YOUR_APP_ID&amp;ext_user_id={user.id}"
                      </div>
                      <div className="ml-4 text-muted-foreground">width="100%"</div>
                      <div className="ml-4 text-muted-foreground">height="600"</div>
                      <div className="ml-4 text-muted-foreground">frameborder="0"&gt;</div>
                      <div className="text-accent">&lt;/iframe&gt;</div>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                    <p className="text-sm text-yellow-600 dark:text-yellow-400">
                      <i className="fas fa-exclamation-triangle mr-2"></i>
                      To enable surveys, you'll need to sign up with CPX Research and add your API credentials to the environment variables.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Survey Tips */}
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-foreground mb-4">Tips for Maximum Earnings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3">
                  <i className="fas fa-check-circle text-accent text-lg mt-0.5"></i>
                  <div>
                    <h4 className="font-semibold text-foreground">Be Honest</h4>
                    <p className="text-sm text-muted-foreground">Provide accurate information to qualify for more surveys</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <i className="fas fa-clock text-accent text-lg mt-0.5"></i>
                  <div>
                    <h4 className="font-semibold text-foreground">Check Regularly</h4>
                    <p className="text-sm text-muted-foreground">New surveys are added throughout the day</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <i className="fas fa-user-check text-accent text-lg mt-0.5"></i>
                  <div>
                    <h4 className="font-semibold text-foreground">Complete Profile</h4>
                    <p className="text-sm text-muted-foreground">Fill out your profile to qualify for targeted surveys</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <i className="fas fa-shield-alt text-accent text-lg mt-0.5"></i>
                  <div>
                    <h4 className="font-semibold text-foreground">Avoid Rushing</h4>
                    <p className="text-sm text-muted-foreground">Take your time to provide thoughtful answers</p>
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
