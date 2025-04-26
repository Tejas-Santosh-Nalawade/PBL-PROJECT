import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  email: text("email").unique(),
  profileImage: text("profile_image"),
  studyHours: integer("study_hours").default(0),
  aiInteractions: integer("ai_interactions").default(0),
});

export const questionPapers = pgTable("question_papers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  subject: text("subject").notNull(),
  description: text("description"),
  difficulty: text("difficulty").notNull(),
  numQuestions: integer("num_questions"),
  estimatedTime: integer("estimated_time"), // in minutes
  paperContent: text("paper_content").notNull(),
  tags: text("tags").array(),
  uploadDate: timestamp("upload_date").defaultNow(),
  analyzed: boolean("analyzed").default(false),
  analysisResults: jsonb("analysis_results"),
});

export const studyResources = pgTable("study_resources", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  resourceType: text("resource_type").notNull(), // book, article, video, practice_set
  url: text("url"),
  content: text("content"),
  tags: text("tags").array(),
  rating: integer("rating"),
  addedDate: timestamp("added_date").defaultNow(),
  reviews: integer("reviews").default(0),
});

export const videoResources = pgTable("video_resources", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  youtubeUrl: text("youtube_url").notNull(),
  thumbnail: text("thumbnail"),
  duration: integer("duration"), // in seconds
  tags: text("tags").array(),
  addedDate: timestamp("added_date").defaultNow(),
  views: integer("views").default(0),
});

export const examSchedule = pgTable("exam_schedule", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  examName: text("exam_name").notNull(),
  examType: text("exam_type").notNull(), // final, midterm, quiz, etc.
  date: timestamp("date").notNull(),
  location: text("location"),
  readinessLevel: integer("readiness_level").default(0), // percentage
  relatedPapers: integer("related_papers").array(), // array of question_paper ids
});

export const studyAnalytics = pgTable("study_analytics", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  date: timestamp("date").defaultNow(),
  papersAnalyzed: integer("papers_analyzed").default(0),
  studyHours: integer("study_hours").default(0),
  resourcesUsed: integer("resources_used").default(0),
  aiInteractions: integer("ai_interactions").default(0),
});

export const communityPosts = pgTable("community_posts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  likes: integer("likes").default(0),
  comments: integer("comments").default(0),
  tags: text("tags").array(),
  solved: boolean("solved").default(false),
  postDate: timestamp("post_date").defaultNow(),
});

export const aiChatHistory = pgTable("ai_chat_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  messages: jsonb("messages").notNull(), // array of {role, content} objects
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert Schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  firstName: true,
  lastName: true,
  email: true,
  profileImage: true,
});

export const insertQuestionPaperSchema = createInsertSchema(questionPapers).omit({
  id: true,
  uploadDate: true,
  analyzed: true,
  analysisResults: true,
});

export const insertStudyResourceSchema = createInsertSchema(studyResources).omit({
  id: true,
  addedDate: true,
  reviews: true,
});

export const insertVideoResourceSchema = createInsertSchema(videoResources).omit({
  id: true,
  addedDate: true,
  views: true,
});

export const insertExamScheduleSchema = createInsertSchema(examSchedule).omit({
  id: true,
});

export const insertCommunityPostSchema = createInsertSchema(communityPosts).omit({
  id: true,
  likes: true,
  comments: true,
  solved: true,
  postDate: true,
});

export const insertAiChatHistorySchema = createInsertSchema(aiChatHistory).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertQuestionPaper = z.infer<typeof insertQuestionPaperSchema>;
export type QuestionPaper = typeof questionPapers.$inferSelect;

export type InsertStudyResource = z.infer<typeof insertStudyResourceSchema>;
export type StudyResource = typeof studyResources.$inferSelect;

export type InsertVideoResource = z.infer<typeof insertVideoResourceSchema>;
export type VideoResource = typeof videoResources.$inferSelect;

export type InsertExamSchedule = z.infer<typeof insertExamScheduleSchema>;
export type ExamSchedule = typeof examSchedule.$inferSelect;

export type InsertCommunityPost = z.infer<typeof insertCommunityPostSchema>;
export type CommunityPost = typeof communityPosts.$inferSelect;

export type InsertAiChatHistory = z.infer<typeof insertAiChatHistorySchema>;
export type AiChatHistory = typeof aiChatHistory.$inferSelect;
