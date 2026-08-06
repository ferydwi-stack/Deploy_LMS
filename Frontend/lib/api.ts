const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname || 'localhost';
    return `http://${host}:8000/api/v1`;
  }
  return 'http://127.0.0.1:8000/api/v1';
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

export const getStorageUrl = (filePath?: string | null): string => {
  if (!filePath) return '';
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return filePath;
  }
  const host = typeof window !== 'undefined' ? (window.location.hostname || 'localhost') : '127.0.0.1';
  const cleanPath = filePath.replace(/^\/+/, '').replace(/^storage\//, '');
  return `http://${host}:8000/storage/${cleanPath}`;
};

export const ensureArray = (res: any, preferredKey?: string): any[] => {
  if (Array.isArray(res)) return res;
  if (!res || typeof res !== 'object') return [];

  if (preferredKey && Array.isArray(res[preferredKey])) return res[preferredKey];
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res.users)) return res.users;
  if (Array.isArray(res.courses)) return res.courses;
  if (Array.isArray(res.assignments)) return res.assignments;
  if (Array.isArray(res.materials)) return res.materials;
  if (Array.isArray(res.students)) return res.students;
  if (Array.isArray(res.attendances)) return res.attendances;
  if (Array.isArray(res.notifications)) return res.notifications;
  if (Array.isArray(res.submissions)) return res.submissions;

  return [];
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
    throw new Error('Tidak dapat terhubung ke server backend. Jalankan Laravel di http://127.0.0.1:8000.');
  }

  const data = await response.json().catch(() => ({}));

  if (response.status === 401) {
    removeAuthToken();
  }

  if (!response.ok) {
    throw new Error(data.message || `API Error: ${response.status}`);
  }

  return data;
}

// API Service Methods
export const api = {
  // Auth
  login: async (email: string, password: string) => {
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

  me: async () => {
    const res = await fetchApi('/auth/me');
    if (res.user) {
      setCurrentUser(res.user);
    }
    return res.user;
  },

  // Admin
  getUsers: (role?: string, search?: string) => {
    const params = new URLSearchParams();
    if (role) params.append('role', role);
    if (search) params.append('search', search);
    const queryStr = params.toString() ? `?${params.toString()}` : '';
    return fetchApi(`/admin/users${queryStr}`);
  },

  createUser: (userData: any) => fetchApi('/admin/users', { method: 'POST', body: JSON.stringify(userData) }),
  updateUser: (id: number, userData: any) => fetchApi(`/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(userData) }),
  resetUserPassword: (id: number, password: string) => fetchApi(`/admin/users/${id}/reset-password`, { method: 'PUT', body: JSON.stringify({ password }) }),
  deleteUser: (id: number) => fetchApi(`/admin/users/${id}`, { method: 'DELETE' }),
  bulkImportUsers: (users: any[]) => fetchApi('/admin/users/bulk-import', { method: 'POST', body: JSON.stringify({ users }) }),

  // Courses
  getCourses: () => fetchApi('/courses'),
  getCourseDetail: (id: number | string) => fetchApi(`/courses/${id}`),
  createCourse: (data: any) => fetchApi('/courses', { method: 'POST', body: JSON.stringify(data) }),
  deleteCourse: (id: number | string) => fetchApi(`/courses/${id}`, { method: 'DELETE' }),

  // Materials
  getMaterials: (courseId?: number | string) => fetchApi(courseId ? `/materials?course_id=${courseId}` : '/materials'),
  createMaterial: (data: any) => fetchApi('/materials', { method: 'POST', body: data instanceof FormData ? data : JSON.stringify(data) }),
  deleteMaterial: (id: number | string) => fetchApi(`/materials/${id}`, { method: 'DELETE' }),

  // Assignments
  getAssignments: (courseId?: number | string) => fetchApi(courseId ? `/assignments?course_id=${courseId}` : '/assignments'),
  getAssignmentDetail: (id: number | string) => fetchApi(`/assignments/${id}`),
  createAssignment: (data: any) => fetchApi('/assignments', { method: 'POST', body: JSON.stringify(data) }),
  deleteAssignment: (id: number | string) => fetchApi(`/assignments/${id}`, { method: 'DELETE' }),

  // Submissions (Tugas Siswa)
  submitAssignment: (assignmentId: number | string, formData: FormData) => 
    fetchApi(`/assignments/${assignmentId}/submit`, { method: 'POST', body: formData }),

  gradeSubmission: (submissionId: number | string, score: number, teacherFeedback?: string) =>
    fetchApi(`/submissions/${submissionId}/grade`, { method: 'PUT', body: JSON.stringify({ score, teacher_feedback: teacherFeedback }) }),

  getMySubmissions: () => fetchApi('/submissions/my'),
  getAssignmentSubmissions: (assignmentId: number | string) => fetchApi(`/assignments/${assignmentId}/submissions`),

  // Enrollment
  enrollCourse: (id: number) => fetchApi(`/courses/${id}/enroll`, { method: 'POST' }),
  enrollByCode: (code: string) => fetchApi('/courses/enroll-by-code', { method: 'POST', body: JSON.stringify({ code }) }),
  leaveCourse: (id: number) => fetchApi(`/courses/${id}/leave`, { method: 'POST' }),
  getCourseStudents: (id: number) => fetchApi(`/courses/${id}/students`),
  getAvailableCourses: () => fetchApi('/courses/available'),
  kickStudent: (courseId: number, studentId: number) => fetchApi(`/courses/${courseId}/students/${studentId}`, { method: 'DELETE' }),
  updateStudentGrade: (courseId: number, studentId: number, data: { uts_score: number; uas_score: number }) =>
    fetchApi(`/courses/${courseId}/students/${studentId}/grades`, { method: 'PUT', body: JSON.stringify(data) }),

  // Attendance
  getCourseAttendances: (courseId: number, date?: string) => fetchApi(`/courses/${courseId}/attendances${date ? `?date=${date}` : ''}`),
  saveCourseAttendances: (courseId: number, data: any) => fetchApi(`/courses/${courseId}/attendances`, { method: 'POST', body: JSON.stringify(data) }),
  selfAttend: (courseId: number) => fetchApi('/attendances/self', { method: 'POST', body: JSON.stringify({ course_id: courseId }) }),
  getMyAttendances: () => fetchApi('/attendances/my'),

  // Notifications
  getNotifications: () => fetchApi('/notifications'),
  getUnreadCount: () => fetchApi('/notifications/unread-count'),
  markNotificationRead: (id: number) => fetchApi(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllNotificationsRead: () => fetchApi('/notifications/read-all', { method: 'PUT' }),

  // Profile
  updateProfile: (data: any) => fetchApi('/auth/profile', { method: 'PUT', body: JSON.stringify(data) }),

  // Admin
  getAdminStats: () => fetchApi('/admin/stats'),
};
