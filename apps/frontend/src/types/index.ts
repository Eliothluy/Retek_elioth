export type UserRole = "ADMIN" | "MANAGER" | "DEVELOPER";
export type TaskStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "LATE";
export type TaskPriority = "HIGH" | "MEDIUM" | "LOW";
export type ActivityType =
  | "TASK_CREATED"
  | "TASK_UPDATED"
  | "TASK_COMPLETED"
  | "TASK_LATE"
  | "COMMENT_POSTED"
  | "RANK_UP"
  | "BADGE_EARNED";
export type NotificationType =
  | "TASK_ASSIGNED"
  | "DEADLINE_APPROACHING"
  | "TASK_LATE"
  | "FEED_INTERACTION"
  | "RANK_UPDATE"
  | "SYSTEM";
export type RankingCategory = "PERFORMANCE" | "COMPLETED" | "LATE" | "ACTIVITY";

export interface User {
  id: string;
  email: string;
  name: string;
  title?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  role: UserRole;
  points: number;
  badges?: string[];
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  module?: string | null;
  projectId?: string | null;
  assigneeId?: string | null;
  createdById: string;
  startDate: string;
  endDate: string;
  completedAt?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  alert: boolean;
  isLate: boolean;
  timeSpentMinutes: number;
  pomodoroSessions: number;
  createdAt: string;
  updatedAt: string;
  assignee?: { id: string; name: string; avatarUrl?: string | null; title?: string | null } | null;
  createdBy?: { id: string; name: string; avatarUrl?: string | null };
  project?: { id: string; name: string; color: string } | null;
}

export interface Project {
  id: string;
  name: string;
  description?: string | null;
  color: string;
  ownerId: string;
  createdAt: string;
}

export interface ActivityFeed {
  id: string;
  type: ActivityType;
  actorId: string;
  taskId?: string | null;
  projectId?: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  actor: { id: string; name: string; avatarUrl?: string | null; title?: string | null };
  task?: { id: string; title: string; status: TaskStatus; priority: TaskPriority } | null;
  project?: { id: string; name: string; color: string } | null;
  comments?: Comment[];
  likes?: { userId: string }[];
  _count?: { likes: number; comments: number };
}

export interface Comment {
  id: string;
  activityId: string;
  userId: string;
  content: string;
  createdAt: string;
  user: { id: string; name: string; avatarUrl?: string | null };
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  link?: string | null;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface RankingEntry {
  userId: string;
  name: string;
  avatarUrl?: string | null;
  title?: string | null;
  score: number;
  rank: number;
  category: RankingCategory;
  stats: {
    completed: number;
    late: number;
    activityCount: number;
    onTimeCompleted: number;
    points: number;
  };
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: { id: string; email: string; role: UserRole };
}
