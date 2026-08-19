// Types for LMS Models
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'guru' | 'siswa';
  nisn_or_nip: string;
  specialization?: string;
  subject?: string;
  phone?: string;
  bio?: string;
}

export interface Course {
  id: number;
  title: string;
  description?: string;
  code: string;
  teacher_id: number;
  teacher?: User;
  materials_count?: number;
  assignments_count?: number;
  students_count?: number;
  students?: StudentEnrollment[];
}

export interface StudentEnrollment {
  id: number;
  name: string;
  nisn_or_nip: string;
  pivot?: {
    status: 'active' | 'dropped';
    enrolled_at?: string;
  };
}

export interface Assignment {
  id: number;
  course_id: number;
  title: string;
  instruction: string;
  due_date?: string;
  course?: Course;
  submissions?: Submission[];
}

export interface Submission {
  id: number;
  assignment_id: number;
  student_id: number;
  file_path?: string;
  original_filename?: string;
  note?: string;
  score?: number;
  teacher_feedback?: string;
  status: 'submitted' | 'graded' | 'late';
  submitted_at?: string;
  graded_at?: string;
  student?: User;
  assignment?: Assignment;
}

export interface Material {
  id: number;
  course_id: number;
  title: string;
  content?: string;
  file_path?: string;
  course?: Course;
}

export interface Attendance {
  id: number;
  course_id: number;
  student_id: number;
  date: string;
  status: 'hadir' | 'izin' | 'sakit' | 'alpha';
  note?: string;
  course?: Course;
  student?: User;
}

export interface Notification {
  id: number;
  user_id: number;
  type: string;
  title: string;
  message: string;
  data?: Record<string, any>;
  read_at?: string;
  created_at?: string;
}

export interface ActivityLog {
  id: number;
  user_id: number;
  action: string;
  entity_type: string;
  entity_id: number;
  changes?: Record<string, any>;
  ip_address?: string;
  created_at?: string;
}

// API Input Types
export interface CreateCourseInput {
  title: string;
  description?: string;
  code?: string;
}

export interface CreateAssignmentInput {
  course_id: number;
  title: string;
  instruction: string;
  due_date?: string;
}

export interface CreateMaterialInput {
  course_id: number;
  title: string;
  content?: string;
  file?: File;
}

export interface CreateSubmissionInput {
  assignment_id: number;
  note?: string;
  file?: File;
}

export interface GradeSubmissionInput {
  score: number;
  teacher_feedback?: string;
}
