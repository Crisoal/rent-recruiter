export type UserRole = 'client' | 'recruiter' | 'admin';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface ClientProfile {
  id: string;
  user_id: string;
  company_name: string;
  industry: string;
  location: string;
  created_at: string;
}

export interface RecruiterProfile {
  id: string;
  user_id: string;
  full_name: string;
  bio: string;
  specialties: string[];
  experience_years: number;
  industries: string[];
  availability_status: 'available' | 'busy' | 'open_to_offers';
  photo_url: string;
  created_at: string;
}

export type EngagementType = 'hire' | 'rent';
export type RequisitionStatus = 'pending' | 'approved' | 'rejected' | 'closed';
export type ApplicationStatus = 'submitted' | 'reviewed' | 'selected' | 'not_selected';
export type RequestStatus = 'pending' | 'accepted' | 'declined';

export interface PersonSpec {
  skills: string[];
  experience_level: string;
  industry_background: string;
}

export interface Requisition {
  id: string;
  client_id: string;
  job_title: string;
  department: string;
  employment_type: string;
  engagement_type: EngagementType;
  duration: string;
  description: string;
  person_specification: PersonSpec;
  status: RequisitionStatus;
  rejection_reason: string;
  created_at: string;
  client_profiles?: ClientProfile;
}

export interface Application {
  id: string;
  requisition_id: string;
  recruiter_id: string;
  cover_note: string;
  status: ApplicationStatus;
  created_at: string;
  requisitions?: Requisition;
  recruiter_profiles?: RecruiterProfile;
}

export interface DirectRequest {
  id: string;
  client_id: string;
  recruiter_id: string;
  engagement_type: EngagementType;
  duration: string;
  message: string;
  status: RequestStatus;
  created_at: string;
  client_profiles?: ClientProfile;
  users?: User;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'pending';
  message: string;
}
