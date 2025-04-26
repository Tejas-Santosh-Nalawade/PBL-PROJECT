// Common types used throughout the application

// User
export interface User {
  id: number;
  username: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  profileImage?: string;
  studyHours: number;
  aiInteractions: number;
}

// Question Paper
export interface QuestionPaper {
  id: number;
  userId: number;
  title: string;
  subject: string;
  description?: string;
  difficulty: 'Low' | 'Medium' | 'High';
  numQuestions?: number;
  estimatedTime?: number;
  paperContent: string;
  tags?: string[];
  uploadDate: string;
  analyzed: boolean;
  analysisResults?: QuestionPaperAnalysis;
}

export interface QuestionPaperAnalysis {
  topics: string[];
  difficulty: 'Low' | 'Medium' | 'High';
  timeEstimate: number;
  keyConceptsToReview: string[];
  similarTopicsFromPastYears: string[];
  questionTypeDistribution: Record<string, number>;
  recommendedStrategies: string[];
}

// Study Resources
export interface StudyResource {
  id: number;
  userId: number;
  title: string;
  description?: string;
  resourceType: 'Book' | 'Article' | 'Video' | 'Practice Set';
  url?: string;
  content?: string;
  tags?: string[];
  rating?: number;
  addedDate: string;
  reviews: number;
}

// Video Resources
export interface VideoResource {
  id: number;
  title: string;
  description?: string;
  youtubeUrl: string;
  thumbnail?: string;
  duration?: number;
  tags?: string[];
  addedDate: string;
  views: number;
}

// Exam Schedule
export interface ExamSchedule {
  id: number;
  userId: number;
  examName: string;
  examType: string;
  date: string;
  location?: string;
  readinessLevel: number;
  relatedPapers?: number[];
}

// Study Analytics
export interface StudyAnalytics {
  id: number;
  userId: number;
  date: string;
  papersAnalyzed: number;
  studyHours: number;
  resourcesUsed: number;
  aiInteractions: number;
}

// Community Posts
export interface CommunityPost {
  id: number;
  userId: number;
  title: string;
  content: string;
  likes: number;
  comments: number;
  tags?: string[];
  solved: boolean;
  postDate: string;
  author?: {
    id: number;
    name: string;
    avatar?: string;
  };
}

// AI Chat
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AiChatHistory {
  id: number;
  userId: number;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

// Study Plan
export interface StudyPlanDay {
  day: number;
  date: string;
  topics: string[];
  duration: number;
  activities: string[];
  resources: string[];
}

export interface Milestone {
  date: string;
  milestone: string;
}

export interface StudyPlan {
  studyPlan: StudyPlanDay[];
  keyMilestones: Milestone[];
  overallStrategy: string;
}
