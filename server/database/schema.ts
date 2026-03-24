import { mysqlTable, serial, varchar, text, timestamp, bigint, json } from 'drizzle-orm/mysql-core';

export const users = mysqlTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: varchar('role', { length: 20 }).notNull().default('user'), // 'admin' | 'user'
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const qrcodes = mysqlTable('qrcodes', {
  id: serial('id').primaryKey(),
  userId: bigint('user_id', { mode: 'number', unsigned: true }).notNull().references(() => users.id),
  type: varchar('type', { length: 20 }).notNull().default('static'), // static | dynamic
  originalUrl: text('original_url').notNull(),
  shortCode: varchar('short_code', { length: 10 }).unique(),
  styleOptions: json('style_options'), // Storing colors, patterns etc.
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const scans = mysqlTable('scans', {
  id: serial('id').primaryKey(),
  qrcodeId: bigint('qrcode_id', { mode: 'number', unsigned: true }).notNull().references(() => qrcodes.id),
  userAgent: text('user_agent'),
  ipAddress: varchar('ip_address', { length: 45 }),
  timestamp: timestamp('timestamp').defaultNow().notNull()
});
