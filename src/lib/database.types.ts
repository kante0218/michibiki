export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          role: "worker" | "company";
          avatar_url: string | null;
          title: string | null;
          bio: string | null;
          location: string | null;
          phone: string | null;
          linkedin_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          role: "worker" | "company";
          avatar_url?: string | null;
          title?: string | null;
          bio?: string | null;
          location?: string | null;
          phone?: string | null;
          linkedin_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          role?: "worker" | "company";
          avatar_url?: string | null;
          title?: string | null;
          bio?: string | null;
          location?: string | null;
          phone?: string | null;
          linkedin_url?: string | null;
          updated_at?: string;
        };
      };
      companies: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          website: string | null;
          industry: string | null;
          size: string | null;
          logo_url: string | null;
          contact_email: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          website?: string | null;
          industry?: string | null;
          size?: string | null;
          logo_url?: string | null;
          contact_email?: string | null;
          created_at?: string;
        };
        Update: {
          name?: string;
          description?: string | null;
          website?: string | null;
          industry?: string | null;
          size?: string | null;
          logo_url?: string | null;
          contact_email?: string | null;
        };
      };
      jobs: {
        Row: {
          id: string;
          company_id: string;
          title: string;
          description: string;
          category: string;
          location: string;
          work_style: string;
          employment_type: string;
          commitment: string | null;
          min_rate: number;
          max_rate: number;
          requirements: string | null;
          preferred: string | null;
          benefits: string | null;
          status: "published" | "draft" | "closed";
          applicant_count: number;
          hired_count: number;
          referral_amount: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          title: string;
          description: string;
          category: string;
          location: string;
          work_style: string;
          employment_type: string;
          commitment?: string | null;
          min_rate: number;
          max_rate: number;
          requirements?: string | null;
          preferred?: string | null;
          benefits?: string | null;
          status?: "published" | "draft" | "closed";
          applicant_count?: number;
          hired_count?: number;
          referral_amount?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          description?: string;
          category?: string;
          location?: string;
          work_style?: string;
          employment_type?: string;
          commitment?: string | null;
          min_rate?: number;
          max_rate?: number;
          requirements?: string | null;
          preferred?: string | null;
          benefits?: string | null;
          status?: "published" | "draft" | "closed";
          applicant_count?: number;
          hired_count?: number;
          referral_amount?: number;
          updated_at?: string;
        };
      };
      applications: {
        Row: {
          id: string;
          job_id: string;
          user_id: string;
          status: "submitted" | "screening" | "interview" | "offered" | "rejected" | "accepted";
          motivation: string | null;
          desired_rate: number | null;
          start_date: string | null;
          resume_url: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          job_id: string;
          user_id: string;
          status?: "submitted" | "screening" | "interview" | "offered" | "rejected" | "accepted";
          motivation?: string | null;
          desired_rate?: number | null;
          start_date?: string | null;
          resume_url?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          status?: "submitted" | "screening" | "interview" | "offered" | "rejected" | "accepted";
          motivation?: string | null;
          desired_rate?: number | null;
          start_date?: string | null;
          resume_url?: string | null;
          notes?: string | null;
          updated_at?: string;
        };
      };
      contracts: {
        Row: {
          id: string;
          job_id: string | null;
          worker_id: string;
          company_id: string;
          title: string;
          description: string | null;
          rate: number;
          hours_per_week: number;
          commitment: string;
          work_style: string | null;
          location: string | null;
          status: "active" | "paused" | "completed" | "cancelled";
          start_date: string;
          end_date: string | null;
          contact_name: string | null;
          contact_email: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          job_id?: string | null;
          worker_id: string;
          company_id: string;
          title: string;
          description?: string | null;
          rate: number;
          hours_per_week: number;
          commitment: string;
          work_style?: string | null;
          location?: string | null;
          status?: "active" | "paused" | "completed" | "cancelled";
          start_date: string;
          end_date?: string | null;
          contact_name?: string | null;
          contact_email?: string | null;
          created_at?: string;
        };
        Update: {
          title?: string;
          description?: string | null;
          rate?: number;
          hours_per_week?: number;
          commitment?: string;
          work_style?: string | null;
          location?: string | null;
          status?: "active" | "paused" | "completed" | "cancelled";
          end_date?: string | null;
          contact_name?: string | null;
          contact_email?: string | null;
        };
      };
      offers: {
        Row: {
          id: string;
          job_id: string | null;
          worker_id: string;
          company_id: string;
          title: string;
          company_name: string;
          message: string | null;
          rate: number;
          commitment: string | null;
          work_style: string | null;
          status: "pending" | "accepted" | "declined" | "expired";
          expires_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          job_id?: string | null;
          worker_id: string;
          company_id: string;
          title: string;
          company_name: string;
          message?: string | null;
          rate: number;
          commitment?: string | null;
          work_style?: string | null;
          status?: "pending" | "accepted" | "declined" | "expired";
          expires_at?: string | null;
          created_at?: string;
        };
        Update: {
          status?: "pending" | "accepted" | "declined" | "expired";
          message?: string | null;
        };
      };
      timesheets: {
        Row: {
          id: string;
          contract_id: string;
          user_id: string;
          date: string;
          hours: number;
          description: string | null;
          status: "submitted" | "approved" | "rejected";
          created_at: string;
        };
        Insert: {
          id?: string;
          contract_id: string;
          user_id: string;
          date: string;
          hours: number;
          description?: string | null;
          status?: "submitted" | "approved" | "rejected";
          created_at?: string;
        };
        Update: {
          date?: string;
          hours?: number;
          description?: string | null;
          status?: "submitted" | "approved" | "rejected";
        };
      };
      assessments: {
        Row: {
          id: string;
          user_id: string;
          category: string;
          title: string;
          score: number | null;
          max_score: number;
          duration_minutes: number;
          status: "not_started" | "in_progress" | "completed";
          completed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category: string;
          title: string;
          score?: number | null;
          max_score?: number;
          duration_minutes?: number;
          status?: "not_started" | "in_progress" | "completed";
          completed_at?: string | null;
          created_at?: string;
        };
        Update: {
          score?: number | null;
          status?: "not_started" | "in_progress" | "completed";
          completed_at?: string | null;
        };
      };
      saved_jobs: {
        Row: {
          id: string;
          user_id: string;
          job_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          job_id: string;
          created_at?: string;
        };
        Update: Record<string, never>;
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          message: string;
          read: boolean;
          link: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          message: string;
          read?: boolean;
          link?: string | null;
          created_at?: string;
        };
        Update: {
          read?: boolean;
        };
      };
      experiences: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          company: string;
          period: string;
          description: string | null;
          skills: string[] | null;
          color: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          company: string;
          period: string;
          description?: string | null;
          skills?: string[] | null;
          color?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          title?: string;
          company?: string;
          period?: string;
          description?: string | null;
          skills?: string[] | null;
          color?: string | null;
          sort_order?: number;
        };
      };
      education: {
        Row: {
          id: string;
          user_id: string;
          school: string;
          degree: string;
          field: string | null;
          period: string;
          color: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          school: string;
          degree: string;
          field?: string | null;
          period: string;
          color?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          school?: string;
          degree?: string;
          field?: string | null;
          period?: string;
          color?: string | null;
          sort_order?: number;
        };
      };
      skills: {
        Row: {
          id: string;
          user_id: string;
          category: string;
          name: string;
          level: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category: string;
          name: string;
          level: number;
          created_at?: string;
        };
        Update: {
          category?: string;
          name?: string;
          level?: number;
        };
      };
      earnings: {
        Row: {
          id: string;
          user_id: string;
          contract_id: string | null;
          project_name: string;
          client_name: string;
          amount: number;
          hours: number;
          date: string;
          status: "paid" | "processing" | "pending";
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          contract_id?: string | null;
          project_name: string;
          client_name: string;
          amount: number;
          hours: number;
          date: string;
          status?: "paid" | "processing" | "pending";
          created_at?: string;
        };
        Update: {
          amount?: number;
          hours?: number;
          status?: "paid" | "processing" | "pending";
        };
      };
      payment_info: {
        Row: {
          id: string;
          user_id: string;
          bank_name: string | null;
          branch_name: string | null;
          account_number: string | null;
          account_holder: string | null;
          invoice_number: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          bank_name?: string | null;
          branch_name?: string | null;
          account_number?: string | null;
          account_holder?: string | null;
          invoice_number?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          bank_name?: string | null;
          branch_name?: string | null;
          account_number?: string | null;
          account_holder?: string | null;
          invoice_number?: string | null;
          updated_at?: string;
        };
      };
      chat_messages: {
        Row: {
          id: string;
          user_id: string;
          sender: "user" | "support";
          message: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          sender: "user" | "support";
          message: string;
          created_at?: string;
        };
        Update: Record<string, never>;
      };
      connections: {
        Row: {
          id: string;
          user_id: string;
          first_name: string;
          last_name: string;
          email: string | null;
          company: string | null;
          position: string | null;
          connected_on: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          first_name: string;
          last_name: string;
          email?: string | null;
          company?: string | null;
          position?: string | null;
          connected_on?: string | null;
          created_at?: string;
        };
        Update: {
          first_name?: string;
          last_name?: string;
          email?: string | null;
          company?: string | null;
          position?: string | null;
          connected_on?: string | null;
        };
      };
      interview_recordings: {
        Row: {
          id: string;
          user_id: string;
          assessment_id: string | null;
          category: string | null;
          storage_path: string;
          duration_seconds: number;
          speech_segments: Json;
          file_size_bytes: number | null;
          mime_type: string;
          status: "processing" | "ready" | "failed";
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          assessment_id?: string | null;
          category?: string | null;
          storage_path: string;
          duration_seconds: number;
          speech_segments?: Json;
          file_size_bytes?: number | null;
          mime_type?: string;
          status?: "processing" | "ready" | "failed";
          created_at?: string;
        };
        Update: {
          status?: "processing" | "ready" | "failed";
          speech_segments?: Json;
          duration_seconds?: number;
          file_size_bytes?: number | null;
        };
      };
      production_interviews: {
        Row: {
          id: string;
          candidate_id: string;
          job_posting_id: string;
          company_id: string;
          status: "pending" | "in_progress" | "completed" | "analyzed";
          questions: Json;
          answers: Json;
          conversation_log: Json;
          recording_path: string | null;
          recording_duration_seconds: number | null;
          speech_segments: Json;
          started_at: string | null;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          candidate_id: string;
          job_posting_id: string;
          company_id: string;
          status?: "pending" | "in_progress" | "completed" | "analyzed";
          questions?: Json;
          answers?: Json;
          conversation_log?: Json;
          recording_path?: string | null;
          recording_duration_seconds?: number | null;
          speech_segments?: Json;
          started_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          status?: "pending" | "in_progress" | "completed" | "analyzed";
          questions?: Json;
          answers?: Json;
          conversation_log?: Json;
          recording_path?: string | null;
          recording_duration_seconds?: number | null;
          speech_segments?: Json;
          started_at?: string | null;
          completed_at?: string | null;
          updated_at?: string;
        };
      };
      interview_results: {
        Row: {
          id: string;
          production_interview_id: string;
          job_posting_id: string;
          candidate_id: string;
          company_id: string;
          overall_score: number | null;
          technical_score: number | null;
          communication_score: number | null;
          appearance_score: number | null;
          problem_solving_score: number | null;
          correct_rate: number | null;
          matching_score: number | null;
          ai_analysis: string | null;
          strengths: string[];
          weaknesses: string[];
          recommendation: string | null;
          sent_to_company: boolean;
          sent_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          production_interview_id: string;
          job_posting_id: string;
          candidate_id: string;
          company_id: string;
          overall_score?: number | null;
          technical_score?: number | null;
          communication_score?: number | null;
          appearance_score?: number | null;
          problem_solving_score?: number | null;
          correct_rate?: number | null;
          matching_score?: number | null;
          ai_analysis?: string | null;
          strengths?: string[];
          weaknesses?: string[];
          recommendation?: string | null;
          sent_to_company?: boolean;
          sent_at?: string | null;
          created_at?: string;
        };
        Update: {
          overall_score?: number | null;
          technical_score?: number | null;
          communication_score?: number | null;
          appearance_score?: number | null;
          problem_solving_score?: number | null;
          correct_rate?: number | null;
          matching_score?: number | null;
          ai_analysis?: string | null;
          strengths?: string[];
          weaknesses?: string[];
          recommendation?: string | null;
          sent_to_company?: boolean;
          sent_at?: string | null;
        };
      };
      referrals: {
        Row: {
          id: string;
          referrer_id: string;
          referred_name: string;
          referred_email: string;
          status: "signed_up" | "application_started" | "application_completed" | "offer_extended" | "hired" | "paid";
          reward_amount: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          referrer_id: string;
          referred_name: string;
          referred_email: string;
          status?: "signed_up" | "application_started" | "application_completed" | "offer_extended" | "hired" | "paid";
          reward_amount?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          referred_name?: string;
          referred_email?: string;
          status?: "signed_up" | "application_started" | "application_completed" | "offer_extended" | "hired" | "paid";
          reward_amount?: number;
          updated_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
