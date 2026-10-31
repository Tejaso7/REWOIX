export type Role = 'LEARNER' | 'TEACHER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  bio?: string;
  is_active: boolean;
  is_verified: boolean;
  roles: Role[];
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
}

export interface Lesson {
  id: string;
  section_id: string;
  title: string;
  description?: string;
  order_index: number;
  video_url?: string;
  video_duration_seconds: number;
  is_preview: boolean;
  content_text?: string;
  progress_seconds?: number;
  completed?: boolean;
}

export interface Section {
  id: string;
  course_id: string;
  title: string;
  order_index: number;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  teacher_id: string;
  teacher_name?: string;
  category_id?: string;
  category_name?: string;
  title: string;
  slug: string;
  subtitle?: string;
  description?: string;
  thumbnail_url?: string;
  price: number;
  discount_price?: number;
  currency: string;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'ALL_LEVELS';
  status: 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'PUBLISHED' | 'REJECTED';
  rejection_reason?: string;
  is_featured: boolean;
  average_rating: number;
  review_count: number;
  total_learners: number;
  sections?: Section[];
  created_at: string;
}

export interface Enrollment {
  id: string;
  course_id: string;
  course_title: string;
  course_thumbnail_url?: string;
  teacher_name: string;
  progress_percentage: number;
  is_completed: boolean;
  certificate_number?: string;
  enrolled_at: string;
}

export interface RevenueTransaction {
  id: string;
  order_id: string;
  course_id: string;
  course_title?: string;
  teacher_id: string;
  teacher_name?: string;
  gross_amount: number;
  platform_commission_percent: number;
  platform_commission_amount: number;
  teacher_share_percent: number;
  teacher_amount: number;
  status: string;
  created_at: string;
}

export interface AdminMetrics {
  total_learners: number;
  total_teachers: number;
  total_courses: number;
  published_courses: number;
  total_sales_count: number;
  total_platform_revenue: number;
  total_teacher_earnings: number;
  pending_course_approvals: number;
  pending_payouts_count: number;
}

export interface SimulationTrack {
  id: string;
  title: string;
  domain: "Fintech" | "E-Commerce" | "Healthcare" | "SaaS";
  brief: string;
  tools: string[];
  difficulty: "Foundational" | "Advanced" | "Executive";
  isLocked: boolean;
  thumbnail?: string;
}

export interface WaitlistPayload {
  name: string;
  email: string;
  roleStage: "student" | "graduate" | "career_switcher" | "working_pro";
  targetDomain?: string;
  timestamp: string;
}
