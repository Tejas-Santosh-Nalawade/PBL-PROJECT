import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { analyzeQuestionPaper, getResourceRecommendations, getChatResponse, generateStudyPlan } from "./gemini";
import { 
  insertUserSchema, 
  insertQuestionPaperSchema,
  insertStudyResourceSchema,
  insertVideoResourceSchema,
  insertExamScheduleSchema,
  insertCommunityPostSchema,
  insertAiChatHistorySchema
} from "@shared/schema";
import { z } from "zod";
import { ZodError } from "zod-validation-error";
import { setupAuth } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);
  // User routes
  app.post("/api/users", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.get("/api/users/:id", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  app.patch("/api/users/:id", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const updatedUser = await storage.updateUser(userId, req.body);
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Question Paper routes
  app.post("/api/question-papers", async (req: Request, res: Response) => {
    try {
      const paperData = insertQuestionPaperSchema.parse(req.body);
      const paper = await storage.createQuestionPaper(paperData);
      res.status(201).json(paper);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid paper data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create question paper" });
    }
  });

  app.get("/api/question-papers", async (req: Request, res: Response) => {
    try {
      const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
      
      if (userId) {
        const papers = await storage.getQuestionPapersByUserId(userId);
        return res.json(papers);
      }
      
      return res.status(400).json({ message: "Missing userId query parameter" });
    } catch (error) {
      res.status(500).json({ message: "Failed to get question papers" });
    }
  });

  app.get("/api/question-papers/:id", async (req: Request, res: Response) => {
    try {
      const paperId = parseInt(req.params.id);
      const paper = await storage.getQuestionPaper(paperId);
      if (!paper) {
        return res.status(404).json({ message: "Question paper not found" });
      }
      res.json(paper);
    } catch (error) {
      res.status(500).json({ message: "Failed to get question paper" });
    }
  });

  app.post("/api/question-papers/:id/analyze", async (req: Request, res: Response) => {
    try {
      const paperId = parseInt(req.params.id);
      const paper = await storage.getQuestionPaper(paperId);
      if (!paper) {
        return res.status(404).json({ message: "Question paper not found" });
      }
      
      const analysisResults = await analyzeQuestionPaper(paper.paperContent, paper.subject);
      const updatedPaper = await storage.updateQuestionPaperAnalysis(paperId, analysisResults);
      
      // Update analytics
      await storage.updateStudyAnalytics(paper.userId, 'papersAnalyzed', 1);
      
      res.json(updatedPaper);
    } catch (error) {
      res.status(500).json({ message: "Failed to analyze question paper: " + (error as Error).message });
    }
  });

  app.delete("/api/question-papers/:id", async (req: Request, res: Response) => {
    try {
      const paperId = parseInt(req.params.id);
      const deleted = await storage.deleteQuestionPaper(paperId);
      if (!deleted) {
        return res.status(404).json({ message: "Question paper not found" });
      }
      res.json({ message: "Question paper deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete question paper" });
    }
  });

  // Study Resource routes
  app.post("/api/study-resources", async (req: Request, res: Response) => {
    try {
      const resourceData = insertStudyResourceSchema.parse(req.body);
      const resource = await storage.createStudyResource(resourceData);
      res.status(201).json(resource);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid resource data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create study resource" });
    }
  });

  app.get("/api/study-resources", async (req: Request, res: Response) => {
    try {
      const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
      const tags = req.query.tags ? (req.query.tags as string).split(',') : [];
      
      if (userId) {
        const resources = await storage.getStudyResourcesByUserId(userId);
        return res.json(resources);
      } else if (tags.length > 0) {
        const resources = await storage.getRecommendedStudyResources(tags);
        return res.json(resources);
      }
      
      return res.status(400).json({ message: "Missing userId or tags query parameter" });
    } catch (error) {
      res.status(500).json({ message: "Failed to get study resources" });
    }
  });

  app.get("/api/study-resources/:id", async (req: Request, res: Response) => {
    try {
      const resourceId = parseInt(req.params.id);
      const resource = await storage.getStudyResource(resourceId);
      if (!resource) {
        return res.status(404).json({ message: "Study resource not found" });
      }
      res.json(resource);
    } catch (error) {
      res.status(500).json({ message: "Failed to get study resource" });
    }
  });

  app.delete("/api/study-resources/:id", async (req: Request, res: Response) => {
    try {
      const resourceId = parseInt(req.params.id);
      const deleted = await storage.deleteStudyResource(resourceId);
      if (!deleted) {
        return res.status(404).json({ message: "Study resource not found" });
      }
      res.json({ message: "Study resource deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete study resource" });
    }
  });

  // Video Resource routes
  app.post("/api/video-resources", async (req: Request, res: Response) => {
    try {
      const resourceData = insertVideoResourceSchema.parse(req.body);
      const resource = await storage.createVideoResource(resourceData);
      res.status(201).json(resource);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid video resource data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create video resource" });
    }
  });

  app.get("/api/video-resources", async (req: Request, res: Response) => {
    try {
      const resources = await storage.getVideoResources();
      res.json(resources);
    } catch (error) {
      res.status(500).json({ message: "Failed to get video resources" });
    }
  });

  // Exam Schedule routes
  app.post("/api/exam-schedule", async (req: Request, res: Response) => {
    try {
      const examData = insertExamScheduleSchema.parse(req.body);
      const exam = await storage.createExamSchedule(examData);
      res.status(201).json(exam);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid exam data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create exam schedule" });
    }
  });

  app.get("/api/exam-schedule", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.query.userId as string);
      const exams = await storage.getExamSchedulesByUserId(userId);
      res.json(exams);
    } catch (error) {
      res.status(500).json({ message: "Failed to get exam schedules" });
    }
  });

  app.patch("/api/exam-schedule/:id", async (req: Request, res: Response) => {
    try {
      const examId = parseInt(req.params.id);
      const updatedExam = await storage.updateExamSchedule(examId, req.body);
      if (!updatedExam) {
        return res.status(404).json({ message: "Exam schedule not found" });
      }
      res.json(updatedExam);
    } catch (error) {
      res.status(500).json({ message: "Failed to update exam schedule" });
    }
  });

  app.post("/api/exam-schedule/:id/study-plan", async (req: Request, res: Response) => {
    try {
      const examId = parseInt(req.params.id);
      const exam = await storage.getExamSchedule(examId);
      if (!exam) {
        return res.status(404).json({ message: "Exam schedule not found" });
      }
      
      const topics = req.body.topics || [];
      if (!topics.length) {
        return res.status(400).json({ message: "Topics are required to generate a study plan" });
      }
      
      const studyPlan = await generateStudyPlan(exam.examName, exam.date, topics);
      
      // Update analytics
      await storage.updateStudyAnalytics(exam.userId, 'aiInteractions', 1);
      
      res.json(studyPlan);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate study plan: " + (error as Error).message });
    }
  });

  // Community Posts routes
  app.post("/api/community-posts", async (req: Request, res: Response) => {
    try {
      const postData = insertCommunityPostSchema.parse(req.body);
      const post = await storage.createCommunityPost(postData);
      res.status(201).json(post);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid post data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create community post" });
    }
  });

  app.get("/api/community-posts", async (req: Request, res: Response) => {
    try {
      const posts = await storage.getCommunityPosts();
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Failed to get community posts" });
    }
  });

  app.patch("/api/community-posts/:id", async (req: Request, res: Response) => {
    try {
      const postId = parseInt(req.params.id);
      const updatedPost = await storage.updateCommunityPost(postId, req.body);
      if (!updatedPost) {
        return res.status(404).json({ message: "Community post not found" });
      }
      res.json(updatedPost);
    } catch (error) {
      res.status(500).json({ message: "Failed to update community post" });
    }
  });

  // AI Assistant routes
  app.post("/api/ai/chat", async (req: Request, res: Response) => {
    try {
      const { userId, prompt, history } = req.body;
      
      if (!userId || !prompt) {
        return res.status(400).json({ message: "userId and prompt are required" });
      }
      
      const response = await getChatResponse(prompt, history || []);
      
      // Update the chat history
      const newMessage = { role: "user", content: prompt };
      const aiResponse = { role: "assistant", content: response };
      const messages = [...(history || []), newMessage, aiResponse];
      
      await storage.createOrUpdateAiChatHistory({
        userId,
        messages
      });
      
      // Update analytics
      await storage.updateStudyAnalytics(userId, 'aiInteractions', 1);
      
      res.json({ response, history: messages });
    } catch (error) {
      res.status(500).json({ message: "Failed to get AI response: " + (error as Error).message });
    }
  });

  app.get("/api/ai/chat/:userId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const chatHistory = await storage.getAiChatHistory(userId);
      
      if (!chatHistory) {
        return res.json({ history: [] });
      }
      
      res.json({ history: chatHistory.messages });
    } catch (error) {
      res.status(500).json({ message: "Failed to get chat history" });
    }
  });

  // Analytics routes
  app.get("/api/analytics/:userId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const analytics = await storage.getStudyAnalyticsForUser(userId);
      
      if (!analytics) {
        return res.json({
          papersAnalyzed: 0,
          studyHours: 0,
          resourcesUsed: 0,
          aiInteractions: 0
        });
      }
      
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ message: "Failed to get analytics" });
    }
  });

  // Update study hours
  app.post("/api/analytics/:userId/study-hours", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const { hours } = req.body;
      
      if (typeof hours !== 'number' || hours <= 0) {
        return res.status(400).json({ message: "Hours must be a positive number" });
      }
      
      await storage.updateStudyAnalytics(userId, 'studyHours', hours);
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      await storage.updateUser(userId, { studyHours: (user.studyHours ?? 0) + hours });
      
      res.json({ message: "Study hours updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update study hours" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
