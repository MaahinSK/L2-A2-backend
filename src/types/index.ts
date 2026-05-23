export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: 'contributor' | 'maintainer';
  created_at: Date;
  updated_at: Date;
}

export interface Issue {
  id: number;
  title: string;
  description: string;
  type: 'bug' | 'feature_request';
  status: 'open' | 'in_progress' | 'resolved';
  reporter_id: number;
  created_at: Date;
  updated_at: Date;
}

export interface ReporterInfo {
  id: number;
  name: string;
  role: string;
}

export interface IssueWithReporter extends Omit<Issue, 'reporter_id'> {
  reporter: ReporterInfo;
}

export interface JWTPayload {
  id: number;
  name: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any;
}

// Request body interfaces
export interface SignupRequest {
  name: string;
  email: string;
  password: string;
  role?: 'contributor' | 'maintainer';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface CreateIssueRequest {
  title: string;
  description: string;
  type: 'bug' | 'feature_request';
}

export interface UpdateIssueRequest {
  title?: string;
  description?: string;
  type?: 'bug' | 'feature_request';
}