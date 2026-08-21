import type { 
  LoginResponse, 
  User, 
  Course, 
  Material, 
  Assignment, 
  Submission, 
  Attendance, 
  Notification,
  StatsResponse,
  ApiResponse
} from '@/types/api';

const PRODUCTION_API_URL = 'https://deploylms-production.up.railway.app/api/v1';

const getApiBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof window !== 'undefined') {
    const host = window.location.hostname || '';
    if (host === 'localhost' || host === '127.0.0.1') {
      return `http://${host}:8000/api/v1`;
    }
    // Use relative endpoint so requests are proxied by Next.js rewrites without CORS blocks
    return '/api/v1';
  }
  return PRODUCTION_API_URL;
};

export const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('lms_token');
  }
  return null;
};

export const setAuthToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('lms_token', token);
  }
};

export const removeAuthToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('lms_token');
    localStorage.removeItem('lms_user');
  }
};

export const getCurrentUser = (): any | null => {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem('lms_user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        return null;
      }
    }
  }
  return null;
};

let realtimeChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    realtimeChannel = new BroadcastChannel('lms_realtime_sync');
    realtimeChannel.onmessage = (event) => {
      if (event.data && typeof event.data === 'string') {
        window.dispatchEvent(new CustomEvent(event.data));
      }
    };
  } catch (e) {}
}

export const notifyDataChanged = (eventName: string): void => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(eventName));
    if (realtimeChannel) {
      try {
        realtimeChannel.postMessage(eventName);
      } catch (e) {}
    }
  }
};

export const setCurrentUser = (userObj: any): void => {
  if (typeof window !== 'undefined' && userObj) {
    const user = userObj.user || userObj.data || userObj;
    try {
      const existingStr = localStorage.getItem('lms_user');
      if (existingStr) {
        const existing = JSON.parse(existingStr);
        const existingUser = existing.user || existing.data || existing;
        if (existingUser.id && user.id && Number(existingUser.id) === Number(user.id)) {
          const merged = { ...existingUser, ...user };
          localStorage.setItem('lms_user', JSON.stringify(merged));
          window.dispatchEvent(new Event('lms_user_updated'));
          return;
        }
      }
    } catch (e) {}
    localStorage.setItem('lms_user', JSON.stringify(user));
    window.dispatchEvent(new Event('lms_user_updated'));
  }
};

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Accept': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // If body is NOT FormData, set Content-Type to application/json
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || getApiBaseUrl();
  let response: Response;

  try {
    response = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers,
    });
  } catch {
    throw new Error('Tidak dapat terhubung ke server backend LMS. Silakan periksa koneksi internet atau coba beberapa saat lagi.');
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `API Error: ${response.status}`);
  }

  return data;
}

// API Service Methods
export const api = {
  // Auth
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const res = await fetchApi('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (res.access_token) {
      setAuthToken(res.access_token);
      setCurrentUser(res.user);
    }
    return res;
  },

  logout: async () => {
    try {
      await fetchApi('/auth/logout', { method: 'POST' });
    } catch (e) {
      console.warn('Logout API failed or token already invalid');
    } finally {
      removeAuthToken();
    }
  },

  me: async (): Promise<User> => {
    const res = await fetchApi('/auth/me');
    if (res.user) {
      setCurrentUser(res.user);
    }
    return res.user;
  },

  // Admin
  getUsers: (role?: string, search?: string): Promise<any> => {
    const params = new URLSearchParams();
    if (role) params.append('role', role);
    if (search) params.append('search', search);
    const queryStr = params.toString() ? `?${params.toString()}` : '';
    return fetchApi(`/admin/users${queryStr}`);
  },

  createUser: (userData: Partial<User> & { password?: string }): Promise<ApiResponse<User>> => fetchApi('/admin/users', { method: 'POST', body: JSON.stringify(userData) }),
  updateUser: (id: number, userData: Partial<User>): Promise<ApiResponse<User>> => fetchApi(`/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(userData) }),
  resetUserPassword: (id: number, password: string): Promise<ApiResponse> => fetchApi(`/admin/users/${id}/reset-password`, { method: 'PUT', body: JSON.stringify({ password }) }),
  deleteUser: (id: number): Promise<ApiResponse> => fetchApi(`/admin/users/${id}`, { method: 'DELETE' }),
  bulkImportUsers: (users: Partial<User>[]): Promise<ApiResponse> => fetchApi('/admin/users/bulk-import', { method: 'POST', body: JSON.stringify({ users }) }),

  // Courses
  getCourses: (): Promise<Course[]> => fetchApi('/courses'),
  getCourseDetail: (id: number | string): Promise<Course> => fetchApi(`/courses/${id}`),
  createCourse: (data: Partial<Course>): Promise<ApiResponse<Course>> => fetchApi('/courses', { method: 'POST', body: JSON.stringify(data) }),
  updateCourse: (id: number, data: Partial<Course>): Promise<ApiResponse<Course>> => fetchApi(`/courses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCourse: (id: number | string): Promise<ApiResponse> => fetchApi(`/courses/${id}`, { method: 'DELETE' }),
  updateAttendanceSchedule: (id: number | string, data: { attendance_open_time: string; attendance_close_time: string }): Promise<ApiResponse<Course>> =>
    fetchApi(`/courses/${id}/attendance-schedule`, { method: 'PUT', body: JSON.stringify(data) }),

  // Materials
  getMaterials: (courseId?: number | string): Promise<Material[]> => fetchApi(courseId ? `/materials?course_id=${courseId}` : '/materials'),
  createMaterial: (data: FormData | Partial<Material>): Promise<ApiResponse<Material>> => fetchApi('/materials', { method: 'POST', body: data instanceof FormData ? data : JSON.stringify(data) }),
  deleteMaterial: (id: number | string): Promise<ApiResponse> => fetchApi(`/materials/${id}`, { method: 'DELETE' }),

  // Assignments
  getAssignments: (courseId?: number | string): Promise<Assignment[]> => fetchApi(courseId ? `/assignments?course_id=${courseId}` : '/assignments'),
  getAssignmentDetail: (id: number | string): Promise<Assignment> => fetchApi(`/assignments/${id}`),
  createAssignment: (data: FormData | Partial<Assignment>): Promise<ApiResponse<Assignment>> => fetchApi('/assignments', { method: 'POST', body: data instanceof FormData ? data : JSON.stringify(data) }),
  deleteAssignment: (id: number | string): Promise<ApiResponse> => fetchApi(`/assignments/${id}`, { method: 'DELETE' }),

  // Submissions (Tugas Siswa)
  submitAssignment: (assignmentId: number | string, formData: FormData): Promise<ApiResponse<Submission>> => 
    fetchApi(`/assignments/${assignmentId}/submit`, { method: 'POST', body: formData }),

  gradeSubmission: (submissionId: number | string, score: number, teacherFeedback?: string): Promise<ApiResponse<Submission>> =>
    fetchApi(`/submissions/${submissionId}/grade`, { method: 'PUT', body: JSON.stringify({ score, teacher_feedback: teacherFeedback }) }),

  getMySubmissions: (): Promise<Submission[]> => fetchApi('/submissions/my'),
  getAssignmentSubmissions: (assignmentId: number | string): Promise<Submission[]> => fetchApi(`/assignments/${assignmentId}/submissions`),

  // Enrollment
  enrollCourse: (id: number): Promise<ApiResponse> => fetchApi(`/courses/${id}/enroll`, { method: 'POST' }),
  enrollByCode: (code: string): Promise<ApiResponse<{ course: Course }>> => fetchApi('/courses/enroll-by-code', { method: 'POST', body: JSON.stringify({ code }) }),
  leaveCourse: (id: number): Promise<ApiResponse> => fetchApi(`/courses/${id}/leave`, { method: 'POST' }),
  getCourseStudents: (id: number): Promise<User[]> => fetchApi(`/courses/${id}/students`),
  getCourseReport: (id: number): Promise<any> => fetchApi(`/courses/${id}/report`),
  getAvailableCourses: (): Promise<Course[]> => fetchApi('/available-courses'),
  kickStudent: (courseId: number, studentId: number): Promise<ApiResponse> => fetchApi(`/courses/${courseId}/students/${studentId}`, { method: 'DELETE' }),
  updateStudentGrade: (courseId: number, studentId: number, data: { uts_score: number; uas_score: number }): Promise<ApiResponse> =>
    fetchApi(`/courses/${courseId}/students/${studentId}/grades`, { method: 'PUT', body: JSON.stringify(data) }),

  // Attendance
  getCourseAttendances: (courseId: number, date?: string): Promise<Attendance[]> => fetchApi(`/courses/${courseId}/attendances${date ? `?date=${date}` : ''}`),
  getCourseAttendanceStats: (courseId: number): Promise<any> => fetchApi(`/courses/${courseId}/attendance-stats`),
  saveCourseAttendances: (courseId: number, data: { date: string; attendances: Array<{ student_id: number; status: string; note?: string }> }): Promise<ApiResponse> => 
    fetchApi(`/courses/${courseId}/attendances`, { method: 'POST', body: JSON.stringify(data) }),
  selfAttend: (courseId: number): Promise<ApiResponse> => fetchApi('/attendances/self', { method: 'POST', body: JSON.stringify({ course_id: courseId }) }),
  getMyAttendances: (): Promise<Attendance[]> => fetchApi('/attendances/my'),

  // Notifications
  getNotifications: (): Promise<Notification[]> => fetchApi('/notifications'),
  getUnreadCount: (): Promise<{ unread_count: number }> => fetchApi('/notifications/unread-count'),
  markNotificationRead: (id: number): Promise<ApiResponse> => fetchApi(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllNotificationsRead: (): Promise<ApiResponse> => fetchApi('/notifications/read-all', { method: 'PUT' }),

  // Profile
  updateProfile: (data: Partial<User>): Promise<ApiResponse<User>> => fetchApi('/auth/profile', { method: 'PUT', body: JSON.stringify(data) }),

  // Password Reset
  forgotPassword: (email: string): Promise<ApiResponse> => fetchApi('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  resetPassword: (data: { email: string; token: string; password: string; password_confirmation: string }): Promise<ApiResponse> =>
    fetchApi('/auth/reset-password', { method: 'POST', body: JSON.stringify(data) }),

  // Admin Settings
  getAdminSettings: (): Promise<ApiResponse<any>> => fetchApi('/admin/settings'),
  updateAdminSettings: (data: Record<string, any>): Promise<ApiResponse<any>> => fetchApi('/admin/settings', { method: 'PUT', body: JSON.stringify(data) }),

  // Stats
  getAdminStats: (): Promise<StatsResponse> => fetchApi('/admin/stats'),
  getGuruStats: (): Promise<StatsResponse> => fetchApi('/guru/stats'),
  getSiswaStats: (): Promise<StatsResponse> => fetchApi('/siswa/stats'),
  getAllAssignments: (): Promise<Assignment[]> => fetchApi('/assignments'),
  getAllAttendances: (): Promise<Attendance[]> => fetchApi('/attendances/my'),
};
