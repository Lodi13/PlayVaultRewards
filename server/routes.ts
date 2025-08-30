import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertActivitySchema, insertRedemptionSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // XP and User routes
  app.post('/api/xp/add', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { xpGained, type, description, metadata } = req.body;

      if (!xpGained || xpGained <= 0) {
        return res.status(400).json({ message: "Invalid XP amount" });
      }

      // Update user XP
      const updatedUser = await storage.updateUserXP(userId, xpGained);

      // Create activity record
      await storage.createActivity({
        userId,
        type,
        description,
        xpGained,
        metadata: metadata || {},
      });

      // Update relevant milestones
      if (type === 'survey') {
        await storage.updateMilestone(userId, 'surveys', 1);
      } else if (type === 'game') {
        await storage.updateMilestone(userId, 'games', 1);
      } else if (type === 'referral') {
        await storage.updateMilestone(userId, 'referrals', 1);
      }

      res.json({ user: updatedUser, xpGained });
    } catch (error) {
      console.error("Error adding XP:", error);
      res.status(500).json({ message: "Failed to add XP" });
    }
  });

  app.post('/api/streak/update', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const today = new Date();
      const lastLogin = user.lastLogin ? new Date(user.lastLogin) : null;
      
      // Check if user should maintain or break streak
      const shouldIncrement = !lastLogin || 
        (today.getTime() - lastLogin.getTime()) >= 24 * 60 * 60 * 1000;

      const updatedUser = await storage.updateStreak(userId, shouldIncrement);
      
      res.json({ user: updatedUser });
    } catch (error) {
      console.error("Error updating streak:", error);
      res.status(500).json({ message: "Failed to update streak" });
    }
  });

  // Activity routes
  app.get('/api/activities', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 10;
      const activities = await storage.getUserActivities(userId, limit);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching activities:", error);
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  // Leaderboard route
  app.get('/api/leaderboard', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const topUsers = await storage.getUsersByXP(limit);
      
      // Remove sensitive info for public leaderboard
      const publicUsers = topUsers.map(user => ({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        xp: user.xp,
        level: user.level,
        profileImageUrl: user.profileImageUrl,
      }));
      
      res.json(publicUsers);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  // Rewards routes
  app.get('/api/rewards', async (req, res) => {
    try {
      const rewards = await storage.getRewards();
      res.json(rewards);
    } catch (error) {
      console.error("Error fetching rewards:", error);
      res.status(500).json({ message: "Failed to fetch rewards" });
    }
  });

  app.post('/api/rewards/redeem', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { rewardId, deliveryInfo } = req.body;

      const user = await storage.getUser(userId);
      const reward = await storage.getReward(rewardId);

      if (!user || !reward) {
        return res.status(404).json({ message: "User or reward not found" });
      }

      if (user.xp < reward.xpCost) {
        return res.status(400).json({ message: "Insufficient XP" });
      }

      // Deduct XP from user
      await storage.updateUserXP(userId, -reward.xpCost);

      // Create redemption record
      const redemption = await storage.createRedemption({
        userId,
        rewardId,
        xpSpent: reward.xpCost,
        deliveryInfo: deliveryInfo || {},
      });

      res.json({ redemption, message: "Reward redeemed successfully" });
    } catch (error) {
      console.error("Error redeeming reward:", error);
      res.status(500).json({ message: "Failed to redeem reward" });
    }
  });

  app.get('/api/redemptions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const redemptions = await storage.getUserRedemptions(userId);
      res.json(redemptions);
    } catch (error) {
      console.error("Error fetching redemptions:", error);
      res.status(500).json({ message: "Failed to fetch redemptions" });
    }
  });

  // Game offers routes
  app.get('/api/games', async (req, res) => {
    try {
      const games = await storage.getGameOffers();
      res.json(games);
    } catch (error) {
      console.error("Error fetching game offers:", error);
      res.status(500).json({ message: "Failed to fetch game offers" });
    }
  });

  // Daily tasks routes
  app.get('/api/daily-tasks', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      
      let tasks = await storage.getDailyTasks(userId, date);
      
      // Create tasks if they don't exist for today
      if (tasks.length === 0) {
        tasks = await storage.createDailyTasks(userId, date);
      }
      
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching daily tasks:", error);
      res.status(500).json({ message: "Failed to fetch daily tasks" });
    }
  });

  app.post('/api/daily-tasks/complete', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { taskType } = req.body;
      const date = new Date().toISOString().split('T')[0];
      
      const task = await storage.completeDailyTask(userId, taskType, date);
      
      if (task) {
        // Award XP for completing the task
        await storage.updateUserXP(userId, task.xpReward);
        await storage.createActivity({
          userId,
          type: 'daily_task',
          description: `Completed daily task: ${taskType}`,
          xpGained: task.xpReward,
          metadata: { taskType },
        });
      }
      
      res.json({ task, message: "Task completed successfully" });
    } catch (error) {
      console.error("Error completing daily task:", error);
      res.status(500).json({ message: "Failed to complete daily task" });
    }
  });

  // Milestone routes
  app.get('/api/milestones', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const milestones = await storage.getUserMilestones(userId);
      res.json(milestones);
    } catch (error) {
      console.error("Error fetching milestones:", error);
      res.status(500).json({ message: "Failed to fetch milestones" });
    }
  });

  // Referral routes
  app.get('/api/referrals', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const referrals = await storage.getUserReferrals(userId);
      res.json(referrals);
    } catch (error) {
      console.error("Error fetching referrals:", error);
      res.status(500).json({ message: "Failed to fetch referrals" });
    }
  });

  app.get('/api/referral-code', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      let referralCode = user.referralCode;
      if (!referralCode) {
        referralCode = await storage.generateReferralCode(userId);
      }

      res.json({ referralCode });
    } catch (error) {
      console.error("Error getting referral code:", error);
      res.status(500).json({ message: "Failed to get referral code" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
