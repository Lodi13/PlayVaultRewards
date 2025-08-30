import {
  users,
  activities,
  rewards,
  redemptions,
  gameOffers,
  dailyTasks,
  milestones,
  type User,
  type UpsertUser,
  type Activity,
  type InsertActivity,
  type Reward,
  type Redemption,
  type InsertRedemption,
  type GameOffer,
  type DailyTask,
  type Milestone,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, and, sql } from "drizzle-orm";
import { randomUUID } from "crypto";

// Interface for storage operations
export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // XP and Level operations
  updateUserXP(userId: string, xpGained: number): Promise<User>;
  updateStreak(userId: string, increment: boolean): Promise<User>;
  getUsersByXP(limit: number): Promise<User[]>;
  
  // Activity operations
  createActivity(activity: InsertActivity): Promise<Activity>;
  getUserActivities(userId: string, limit: number): Promise<Activity[]>;
  
  // Reward operations
  getRewards(): Promise<Reward[]>;
  getReward(id: string): Promise<Reward | undefined>;
  createRedemption(redemption: InsertRedemption): Promise<Redemption>;
  getUserRedemptions(userId: string): Promise<Redemption[]>;
  
  // Game operations
  getGameOffers(): Promise<GameOffer[]>;
  
  // Daily tasks operations
  getDailyTasks(userId: string, date: string): Promise<DailyTask[]>;
  createDailyTasks(userId: string, date: string): Promise<DailyTask[]>;
  completeDailyTask(userId: string, taskType: string, date: string): Promise<DailyTask | undefined>;
  
  // Milestone operations
  getUserMilestones(userId: string): Promise<Milestone[]>;
  updateMilestone(userId: string, type: string, increment: number): Promise<void>;
  
  // Referral operations
  getUserReferrals(userId: string): Promise<User[]>;
  generateReferralCode(userId: string): Promise<string>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        referralCode: userData.id ? `${userData.id?.slice(0, 8)}${Math.random().toString(36).substr(2, 4)}` : undefined,
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserXP(userId: string, xpGained: number): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        xp: sql`${users.xp} + ${xpGained}`,
        level: sql`CASE WHEN ${users.xp} + ${xpGained} >= (${users.level} * 2000) THEN ${users.level} + 1 ELSE ${users.level} END`,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateStreak(userId: string, increment: boolean): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        streak: increment ? sql`${users.streak} + 1` : sql`0`,
        lastLogin: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async getUsersByXP(limit: number): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .orderBy(desc(users.xp))
      .limit(limit);
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    const [newActivity] = await db
      .insert(activities)
      .values({
        ...activity,
        id: randomUUID(),
      })
      .returning();
    return newActivity;
  }

  async getUserActivities(userId: string, limit: number): Promise<Activity[]> {
    return await db
      .select()
      .from(activities)
      .where(eq(activities.userId, userId))
      .orderBy(desc(activities.createdAt))
      .limit(limit);
  }

  async getRewards(): Promise<Reward[]> {
    return await db
      .select()
      .from(rewards)
      .where(eq(rewards.isActive, true))
      .orderBy(asc(rewards.xpCost));
  }

  async getReward(id: string): Promise<Reward | undefined> {
    const [reward] = await db
      .select()
      .from(rewards)
      .where(and(eq(rewards.id, id), eq(rewards.isActive, true)));
    return reward;
  }

  async createRedemption(redemption: InsertRedemption): Promise<Redemption> {
    const [newRedemption] = await db
      .insert(redemptions)
      .values({
        ...redemption,
        id: randomUUID(),
      })
      .returning();
    return newRedemption;
  }

  async getUserRedemptions(userId: string): Promise<Redemption[]> {
    return await db
      .select({
        id: redemptions.id,
        userId: redemptions.userId,
        rewardId: redemptions.rewardId,
        status: redemptions.status,
        xpSpent: redemptions.xpSpent,
        deliveryInfo: redemptions.deliveryInfo,
        createdAt: redemptions.createdAt,
        updatedAt: redemptions.updatedAt,
        reward: {
          name: rewards.name,
          type: rewards.type,
          imageUrl: rewards.imageUrl,
        },
      })
      .from(redemptions)
      .leftJoin(rewards, eq(redemptions.rewardId, rewards.id))
      .where(eq(redemptions.userId, userId))
      .orderBy(desc(redemptions.createdAt));
  }

  async getGameOffers(): Promise<GameOffer[]> {
    return await db
      .select()
      .from(gameOffers)
      .where(eq(gameOffers.isActive, true))
      .orderBy(desc(gameOffers.xpReward));
  }

  async getDailyTasks(userId: string, date: string): Promise<DailyTask[]> {
    return await db
      .select()
      .from(dailyTasks)
      .where(and(eq(dailyTasks.userId, userId), eq(dailyTasks.date, date)));
  }

  async createDailyTasks(userId: string, date: string): Promise<DailyTask[]> {
    const taskTypes = [
      { type: 'survey', reward: 50 },
      { type: 'game', reward: 100 },
      { type: 'referral_share', reward: 25 },
    ];

    const tasks = await Promise.all(
      taskTypes.map(async (task) => {
        const [newTask] = await db
          .insert(dailyTasks)
          .values({
            id: randomUUID(),
            userId,
            taskType: task.type,
            date,
            xpReward: task.reward,
          })
          .returning();
        return newTask;
      })
    );

    return tasks;
  }

  async completeDailyTask(userId: string, taskType: string, date: string): Promise<DailyTask | undefined> {
    const [task] = await db
      .update(dailyTasks)
      .set({ completed: true })
      .where(
        and(
          eq(dailyTasks.userId, userId),
          eq(dailyTasks.taskType, taskType),
          eq(dailyTasks.date, date),
          eq(dailyTasks.completed, false)
        )
      )
      .returning();
    return task;
  }

  async getUserMilestones(userId: string): Promise<Milestone[]> {
    return await db
      .select()
      .from(milestones)
      .where(eq(milestones.userId, userId));
  }

  async updateMilestone(userId: string, type: string, increment: number): Promise<void> {
    await db
      .update(milestones)
      .set({
        current: sql`${milestones.current} + ${increment}`,
        completed: sql`CASE WHEN ${milestones.current} + ${increment} >= ${milestones.target} THEN true ELSE false END`,
        completedAt: sql`CASE WHEN ${milestones.current} + ${increment} >= ${milestones.target} THEN NOW() ELSE ${milestones.completedAt} END`,
      })
      .where(and(eq(milestones.userId, userId), eq(milestones.type, type)));
  }

  async getUserReferrals(userId: string): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(eq(users.referredBy, userId))
      .orderBy(desc(users.createdAt));
  }

  async generateReferralCode(userId: string): Promise<string> {
    const code = `${userId.slice(0, 8)}${Math.random().toString(36).substr(2, 4)}`;
    await db
      .update(users)
      .set({ referralCode: code })
      .where(eq(users.id, userId));
    return code;
  }
}

export const storage = new DatabaseStorage();
