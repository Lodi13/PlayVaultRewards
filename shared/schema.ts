import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  integer,
  text,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  xp: integer("xp").default(0),
  level: integer("level").default(1),
  streak: integer("streak").default(0),
  lastLogin: timestamp("last_login"),
  referralCode: varchar("referral_code").unique(),
  referredBy: varchar("referred_by"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const activities = pgTable("activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: varchar("type").notNull(), // 'survey', 'game', 'referral', 'daily_login'
  description: text("description").notNull(),
  xpGained: integer("xp_gained").notNull(),
  metadata: jsonb("metadata"), // Additional data like survey ID, game name, etc.
  createdAt: timestamp("created_at").defaultNow(),
});

export const rewards = pgTable("rewards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  xpCost: integer("xp_cost").notNull(),
  type: varchar("type").notNull(), // 'paypal', 'amazon', 'google_play', etc.
  imageUrl: varchar("image_url"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const redemptions = pgTable("redemptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  rewardId: varchar("reward_id").notNull().references(() => rewards.id),
  status: varchar("status").default("processing"), // 'processing', 'delivered', 'failed'
  xpSpent: integer("xp_spent").notNull(),
  deliveryInfo: jsonb("delivery_info"), // Email, code, etc.
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const gameOffers = pgTable("game_offers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  xpReward: integer("xp_reward").notNull(),
  imageUrl: varchar("image_url"),
  affiliateUrl: text("affiliate_url").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const dailyTasks = pgTable("daily_tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  taskType: varchar("task_type").notNull(), // 'survey', 'game', 'referral_share'
  completed: boolean("completed").default(false),
  date: varchar("date").notNull(), // YYYY-MM-DD format
  xpReward: integer("xp_reward").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const milestones = pgTable("milestones", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: varchar("type").notNull(), // 'surveys', 'games', 'referrals'
  current: integer("current").default(0),
  target: integer("target").notNull(),
  xpReward: integer("xp_reward").notNull(),
  completed: boolean("completed").default(false),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
});

export const insertActivitySchema = createInsertSchema(activities).pick({
  userId: true,
  type: true,
  description: true,
  xpGained: true,
  metadata: true,
});

export const insertRedemptionSchema = createInsertSchema(redemptions).pick({
  userId: true,
  rewardId: true,
  xpSpent: true,
  deliveryInfo: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Reward = typeof rewards.$inferSelect;
export type Redemption = typeof redemptions.$inferSelect;
export type InsertRedemption = z.infer<typeof insertRedemptionSchema>;
export type GameOffer = typeof gameOffers.$inferSelect;
export type DailyTask = typeof dailyTasks.$inferSelect;
export type Milestone = typeof milestones.$inferSelect;
