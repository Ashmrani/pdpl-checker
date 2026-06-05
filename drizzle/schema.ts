import { int, json, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Stores the result of each website privacy scan.
 */
export const scans = mysqlTable("scans", {
  id: int("id").autoincrement().primaryKey(),
  /** The normalized URL that was scanned. */
  url: varchar("url", { length: 2048 }).notNull(),
  /** Hostname for display/grouping. */
  hostname: varchar("hostname", { length: 512 }).notNull(),
  /** Overall letter grade A-F. */
  grade: varchar("grade", { length: 2 }).notNull(),
  /** Numeric privacy score 0-100. */
  score: int("score").notNull(),
  /** Total cookies detected. */
  cookieCount: int("cookieCount").notNull(),
  /** Total third-party trackers detected. */
  trackerCount: int("trackerCount").notNull(),
  /** PDPL compliance status: compliant | needs_improvement | non_compliant. */
  pdplStatus: varchar("pdplStatus", { length: 32 }).notNull(),
  /** Full structured report payload. */
  report: json("report").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Scan = typeof scans.$inferSelect;
export type InsertScan = typeof scans.$inferInsert;