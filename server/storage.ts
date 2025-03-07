import 'dotenv/config';
import {
  tasks,
  users,
  type Task,
  type InsertTask,
  type User,
  type InsertUser,
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import * as session from "express-session";
import MySQLStore from "express-mysql-session";

const MySQLStoreSession = MySQLStore(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Task operations
  getTasks(userId: number): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask, userId: number): Promise<Task>;
  updateTask(id: number, task: Partial<Task>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;

  // Session store
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new MySQLStoreSession({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      expiration: 86400000, // 24h
      createDatabaseTable: true,
      schema: {
        tableName: 'sessions',
        columnNames: {
          session_id: 'session_id',
          expires: 'expires',
          data: 'data'
        }
      }
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser);
    const insertedId = result[0].insertId; // Assuming MySQL returns an object with an insertId property
    const [user] = await db.select().from(users).where(eq(users.id, insertedId));
    return user;
  }

  // Task operations
  async getTasks(userId: number): Promise<Task[]> {
    console.log(`Fetching tasks for user ${userId}`);
    const tasksFromDb = await db
      .select()
      .from(tasks)
      .where(eq(tasks.userId, userId))
      .orderBy(tasks.startDate);
    console.log(`Found ${tasksFromDb.length} tasks for user ${userId}`);
    return tasksFromDb;
  }

  async getTask(id: number): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task;
  }

  async createTask(insertTask: InsertTask, userId: number): Promise<Task> {
    console.log(`Creating task for user ${userId}:`, insertTask);
    const result = await db.insert(tasks).values({ ...insertTask, userId });
    const insertedId = result[0].insertId;
    const [task] = await db.select().from(tasks).where(eq(tasks.id, insertedId));
    console.log(`Created task:`, task);
    return task;
  }

  async updateTask(
    id: number,
    updates: Partial<Task>,
  ): Promise<Task | undefined> {
    console.log(`Updating task ${id} with:`, updates);
    // Convert date fields to Date objects if they exist in updates
    if (updates.startDate && !(updates.startDate instanceof Date)) {
      updates.startDate = new Date(updates.startDate);
    }
    if (updates.endDate && !(updates.endDate instanceof Date)) {
      updates.endDate = new Date(updates.endDate);
    }

    await db
      .update(tasks)
      .set(updates)
      .where(eq(tasks.id, id));
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    console.log(`Updated task:`, task);
    return task;
  }

  async deleteTask(id: number): Promise<boolean> {
    const task = await db.delete(tasks).where(eq(tasks.id, id));
    return !!task;
  }
}

export const storage = new DatabaseStorage();
