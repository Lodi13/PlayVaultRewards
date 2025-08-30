import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <div className="mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mr-4">
              <i className="fas fa-gamepad text-primary-foreground text-2xl"></i>
            </div>
            <h1 className="text-4xl font-bold text-foreground">PlayVault</h1>
          </div>
          
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Earn XP. Redeem Rewards. Have Fun.
          </h2>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Complete surveys, play games, and invite friends to earn XP. 
            Redeem your points for real rewards like PayPal cash and gift cards.
          </p>

          <Button 
            size="lg" 
            className="px-8 py-4 text-lg font-semibold"
            onClick={() => window.location.href = '/api/login'}
            data-testid="button-login"
          >
            Get Started - It's Free!
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <Card className="bg-card border-border">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-poll text-primary text-xl"></i>
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Complete Surveys</h3>
              <p className="text-muted-foreground">Share your opinions and earn 50-500 XP per survey</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-gamepad text-accent text-xl"></i>
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Play Games</h3>
              <p className="text-muted-foreground">Install and play games to earn massive XP rewards</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gold/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-gift text-gold text-xl"></i>
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Redeem Rewards</h3>
              <p className="text-muted-foreground">Exchange XP for PayPal cash, gift cards, and more</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 p-8 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl border border-border">
          <h3 className="text-2xl font-bold text-foreground mb-4">Why Choose PlayVault?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div className="flex items-start">
              <i className="fas fa-check-circle text-accent text-xl mr-3 mt-1"></i>
              <div>
                <h4 className="font-semibold text-foreground">Real Rewards</h4>
                <p className="text-muted-foreground">Cash out to PayPal or get gift cards from top brands</p>
              </div>
            </div>
            <div className="flex items-start">
              <i className="fas fa-check-circle text-accent text-xl mr-3 mt-1"></i>
              <div>
                <h4 className="font-semibold text-foreground">Daily Bonuses</h4>
                <p className="text-muted-foreground">Maintain your streak for extra XP and special rewards</p>
              </div>
            </div>
            <div className="flex items-start">
              <i className="fas fa-check-circle text-accent text-xl mr-3 mt-1"></i>
              <div>
                <h4 className="font-semibold text-foreground">Referral Program</h4>
                <p className="text-muted-foreground">Earn 250 XP for every friend you invite</p>
              </div>
            </div>
            <div className="flex items-start">
              <i className="fas fa-check-circle text-accent text-xl mr-3 mt-1"></i>
              <div>
                <h4 className="font-semibold text-foreground">Compete & Win</h4>
                <p className="text-muted-foreground">Climb the leaderboard and earn exclusive badges</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
