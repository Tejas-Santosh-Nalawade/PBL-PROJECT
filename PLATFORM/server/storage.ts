import { 
  users, type User, type InsertUser,
  questionPapers, type QuestionPaper, type InsertQuestionPaper,
  studyResources, type StudyResource, type InsertStudyResource,
  videoResources, type VideoResource, type InsertVideoResource,
  examSchedule, type ExamSchedule, type InsertExamSchedule,
  studyAnalytics, type StudyAnalyticsType,
  communityPosts, type CommunityPost, type InsertCommunityPost,
  aiChatHistory, type AiChatHistory, type InsertAiChatHistory
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, like, sql, inArray } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  
  // Question paper operations
  getQuestionPaper(id: number): Promise<QuestionPaper | undefined>;
  getQuestionPapersByUserId(userId: number): Promise<QuestionPaper[]>;
  createQuestionPaper(paper: InsertQuestionPaper): Promise<QuestionPaper>;
  updateQuestionPaper(id: number, paperData: Partial<QuestionPaper>): Promise<QuestionPaper | undefined>;
  updateQuestionPaperAnalysis(id: number, analysisResults: any): Promise<QuestionPaper | undefined>;
  deleteQuestionPaper(id: number): Promise<boolean>;
  
  // Study resources operations
  getStudyResource(id: number): Promise<StudyResource | undefined>;
  getStudyResourcesByUserId(userId: number): Promise<StudyResource[]>;
  getRecommendedStudyResources(tags: string[]): Promise<StudyResource[]>;
  createStudyResource(resource: InsertStudyResource): Promise<StudyResource>;
  updateStudyResource(id: number, resourceData: Partial<StudyResource>): Promise<StudyResource | undefined>;
  deleteStudyResource(id: number): Promise<boolean>;
  
  // Video resources operations
  getVideoResource(id: number): Promise<VideoResource | undefined>;
  getVideoResources(): Promise<VideoResource[]>;
  createVideoResource(resource: InsertVideoResource): Promise<VideoResource>;
  updateVideoResource(id: number, resourceData: Partial<VideoResource>): Promise<VideoResource | undefined>;
  deleteVideoResource(id: number): Promise<boolean>;
  
  // Exam schedule operations
  getExamSchedule(id: number): Promise<ExamSchedule | undefined>;
  getExamSchedulesByUserId(userId: number): Promise<ExamSchedule[]>;
  createExamSchedule(exam: InsertExamSchedule): Promise<ExamSchedule>;
  updateExamSchedule(id: number, examData: Partial<ExamSchedule>): Promise<ExamSchedule | undefined>;
  deleteExamSchedule(id: number): Promise<boolean>;
  
  // Analytics operations
  getStudyAnalyticsForUser(userId: number): Promise<StudyAnalyticsType | undefined>;
  updateStudyAnalytics(userId: number, field: keyof StudyAnalytics, increment: number): Promise<void>;
  
  // Community posts operations
  getCommunityPost(id: number): Promise<CommunityPost | undefined>;
  getCommunityPosts(): Promise<CommunityPost[]>;
  createCommunityPost(post: InsertCommunityPost): Promise<CommunityPost>;
  updateCommunityPost(id: number, postData: Partial<CommunityPost>): Promise<CommunityPost | undefined>;
  deleteCommunityPost(id: number): Promise<boolean>;
  
  // AI chat history operations
  getAiChatHistory(userId: number): Promise<AiChatHistory | undefined>;
  createOrUpdateAiChatHistory(chatHistory: InsertAiChatHistory): Promise<AiChatHistory>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  // Question paper operations
  async getQuestionPaper(id: number): Promise<QuestionPaper | undefined> {
    const [paper] = await db.select().from(questionPapers).where(eq(questionPapers.id, id));
    return paper;
  }

  async getQuestionPapersByUserId(userId: number): Promise<QuestionPaper[]> {
    return await db
      .select()
      .from(questionPapers)
      .where(eq(questionPapers.userId, userId))
      .orderBy(desc(questionPapers.uploadDate));
  }

  async createQuestionPaper(paper: InsertQuestionPaper): Promise<QuestionPaper> {
    const [newPaper] = await db
      .insert(questionPapers)
      .values(paper)
      .returning();
    return newPaper;
  }

  async updateQuestionPaper(id: number, paperData: Partial<QuestionPaper>): Promise<QuestionPaper | undefined> {
    const [updatedPaper] = await db
      .update(questionPapers)
      .set(paperData)
      .where(eq(questionPapers.id, id))
      .returning();
    return updatedPaper;
  }

  async updateQuestionPaperAnalysis(id: number, analysisResults: any): Promise<QuestionPaper | undefined> {
    const [updatedPaper] = await db
      .update(questionPapers)
      .set({ 
        analyzed: true,
        analysisResults
      })
      .where(eq(questionPapers.id, id))
      .returning();
    return updatedPaper;
  }

  async deleteQuestionPaper(id: number): Promise<boolean> {
    const result = await db
      .delete(questionPapers)
      .where(eq(questionPapers.id, id))
      .returning({ id: questionPapers.id });
    return result.length > 0;
  }

  // Study resources operations
  async getStudyResource(id: number): Promise<StudyResource | undefined> {
    const [resource] = await db.select().from(studyResources).where(eq(studyResources.id, id));
    return resource;
  }

  async getStudyResourcesByUserId(userId: number): Promise<StudyResource[]> {
    return await db
      .select()
      .from(studyResources)
      .where(eq(studyResources.userId, userId))
      .orderBy(desc(studyResources.addedDate));
  }

  async getRecommendedStudyResources(tags: string[]): Promise<StudyResource[]> {
    if (!tags.length) {
      return await db
        .select()
        .from(studyResources)
        .orderBy(desc(studyResources.rating))
        .limit(10);
    }
    
    // This is a simplified approach to find resources with matching tags
    // A more sophisticated approach would involve a proper array overlap query
    const resources = await db
      .select()
      .from(studyResources)
      .where(sql`${studyResources.tags} && ${sql.array(tags, 'text')}`)
      .limit(10);
      
    return resources;
  }

  async createStudyResource(resource: InsertStudyResource): Promise<StudyResource> {
    const [newResource] = await db
      .insert(studyResources)
      .values(resource)
      .returning();
    return newResource;
  }

  async updateStudyResource(id: number, resourceData: Partial<StudyResource>): Promise<StudyResource | undefined> {
    const [updatedResource] = await db
      .update(studyResources)
      .set(resourceData)
      .where(eq(studyResources.id, id))
      .returning();
    return updatedResource;
  }

  async deleteStudyResource(id: number): Promise<boolean> {
    const result = await db
      .delete(studyResources)
      .where(eq(studyResources.id, id))
      .returning({ id: studyResources.id });
    return result.length > 0;
  }

  // Video resources operations
  async getVideoResource(id: number): Promise<VideoResource | undefined> {
    const [resource] = await db.select().from(videoResources).where(eq(videoResources.id, id));
    return resource;
  }

  async getVideoResources(): Promise<VideoResource[]> {
    return await db
      .select()
      .from(videoResources)
      .orderBy(desc(videoResources.addedDate));
  }

  async createVideoResource(resource: InsertVideoResource): Promise<VideoResource> {
    const [newResource] = await db
      .insert(videoResources)
      .values(resource)
      .returning();
    return newResource;
  }

  async updateVideoResource(id: number, resourceData: Partial<VideoResource>): Promise<VideoResource | undefined> {
    const [updatedResource] = await db
      .update(videoResources)
      .set(resourceData)
      .where(eq(videoResources.id, id))
      .returning();
    return updatedResource;
  }

  async deleteVideoResource(id: number): Promise<boolean> {
    const result = await db
      .delete(videoResources)
      .where(eq(videoResources.id, id))
      .returning({ id: videoResources.id });
    return result.length > 0;
  }

  // Exam schedule operations
  async getExamSchedule(id: number): Promise<ExamSchedule | undefined> {
    const [exam] = await db.select().from(examSchedule).where(eq(examSchedule.id, id));
    return exam;
  }

  async getExamSchedulesByUserId(userId: number): Promise<ExamSchedule[]> {
    return await db
      .select()
      .from(examSchedule)
      .where(eq(examSchedule.userId, userId))
      .orderBy(examSchedule.date);
  }

  async createExamSchedule(exam: InsertExamSchedule): Promise<ExamSchedule> {
    const [newExam] = await db
      .insert(examSchedule)
      .values(exam)
      .returning();
    return newExam;
  }

  async updateExamSchedule(id: number, examData: Partial<ExamSchedule>): Promise<ExamSchedule | undefined> {
    const [updatedExam] = await db
      .update(examSchedule)
      .set(examData)
      .where(eq(examSchedule.id, id))
      .returning();
    return updatedExam;
  }

  async deleteExamSchedule(id: number): Promise<boolean> {
    const result = await db
      .delete(examSchedule)
      .where(eq(examSchedule.id, id))
      .returning({ id: examSchedule.id });
    return result.length > 0;
  }

  // Analytics operations
  async getStudyAnalyticsForUser(userId: number): Promise<StudyAnalyticsType | undefined> {
    const [analytics] = await db
      .select()
      .from(studyAnalytics)
      .where(eq(studyAnalytics.userId, userId))
      .orderBy(desc(studyAnalytics.date))
      .limit(1);
    return analytics;
  }

  async updateStudyAnalytics(
    userId: number, 
    field: 'papersAnalyzed' | 'studyHours' | 'resourcesUsed' | 'aiInteractions', 
    increment: number
  ): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const [existingAnalytics] = await db
      .select()
      .from(studyAnalytics)
      .where(
        and(
          eq(studyAnalytics.userId, userId),
          sql`DATE(${studyAnalytics.date}) = DATE(${today})`
        )
      );
    
    if (existingAnalytics) {
      await db
        .update(studyAnalytics)
        .set({ [field]: (existingAnalytics[field] as number) + increment })
        .where(eq(studyAnalytics.id, existingAnalytics.id));
    } else {
      await db
        .insert(studyAnalytics)
        .values({
          userId,
          date: today,
          [field]: increment,
          papersAnalyzed: field === 'papersAnalyzed' ? increment : 0,
          studyHours: field === 'studyHours' ? increment : 0,
          resourcesUsed: field === 'resourcesUsed' ? increment : 0,
          aiInteractions: field === 'aiInteractions' ? increment : 0,
        });
    }
  }

  // Community posts operations
  async getCommunityPost(id: number): Promise<CommunityPost | undefined> {
    const [post] = await db.select().from(communityPosts).where(eq(communityPosts.id, id));
    return post;
  }

  async getCommunityPosts(): Promise<CommunityPost[]> {
    return await db
      .select()
      .from(communityPosts)
      .orderBy(desc(communityPosts.postDate));
  }

  async createCommunityPost(post: InsertCommunityPost): Promise<CommunityPost> {
    const [newPost] = await db
      .insert(communityPosts)
      .values(post)
      .returning();
    return newPost;
  }

  async updateCommunityPost(id: number, postData: Partial<CommunityPost>): Promise<CommunityPost | undefined> {
    const [updatedPost] = await db
      .update(communityPosts)
      .set(postData)
      .where(eq(communityPosts.id, id))
      .returning();
    return updatedPost;
  }

  async deleteCommunityPost(id: number): Promise<boolean> {
    const result = await db
      .delete(communityPosts)
      .where(eq(communityPosts.id, id))
      .returning({ id: communityPosts.id });
    return result.length > 0;
  }

  // AI chat history operations
  async getAiChatHistory(userId: number): Promise<AiChatHistory | undefined> {
    const [chatHistory] = await db
      .select()
      .from(aiChatHistory)
      .where(eq(aiChatHistory.userId, userId))
      .orderBy(desc(aiChatHistory.updatedAt))
      .limit(1);
    return chatHistory;
  }

  async createOrUpdateAiChatHistory(chatHistory: InsertAiChatHistory): Promise<AiChatHistory> {
    const [existingHistory] = await db
      .select()
      .from(aiChatHistory)
      .where(eq(aiChatHistory.userId, chatHistory.userId))
      .orderBy(desc(aiChatHistory.updatedAt))
      .limit(1);
    
    if (existingHistory) {
      const [updatedHistory] = await db
        .update(aiChatHistory)
        .set({
          messages: chatHistory.messages,
          updatedAt: new Date()
        })
        .where(eq(aiChatHistory.id, existingHistory.id))
        .returning();
      return updatedHistory;
    } else {
      const [newHistory] = await db
        .insert(aiChatHistory)
        .values(chatHistory)
        .returning();
      return newHistory;
    }
  }
}

export const storage = new DatabaseStorage();

export type StudyAnalyticsType = {
  id: number;
  userId: number;
  date: Date;
  papersAnalyzed: number;
  studyHours: number;
  resourcesUsed: number;
  aiInteractions: number;
}
