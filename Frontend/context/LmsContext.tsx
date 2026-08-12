'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/lib/api';
import type { Course as ApiCourse, User } from '@/types/api';

export interface Course {
  id: string;
  code: string;
  joinCode: string;
  title: string;
  teacher: string;
  studentsCount: number;
  materi: number;
  tugas: number;
  path: string;
  studentsList: Array<{
    id: string;
    name: string;
    email: string;
    status: string;
  }>;
}

interface LmsContextType {
  enrolledCourses: Course[];
  availableCourses: Course[];
  myCourseIds: string[];
  loading: boolean;
  addCourse: (newCourseData: { title: string; code?: string; students?: string; teacher?: string }) => Promise<Course>;
  updateCourse: (id: string, updatedData: Partial<Course>) => Promise<void>;
  deleteCourse: (id: string) => Promise<void>;
  joinCourseByCode: (code: string) => Promise<{ success: boolean; course?: Course; message: string }>;
  joinCourseById: (id: string) => Promise<void>;
  leaveCourseById: (id: string) => Promise<void>;
  kickStudent: (courseId: string, studentId: string) => Promise<void>;
  refreshCourses: () => Promise<void>;
}

const LmsContext = createContext<LmsContextType | undefined>(undefined);

function getCourseList(data: unknown): ApiCourse[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') {
    const response = data as { data?: unknown; courses?: unknown };
    if (Array.isArray(response.data)) return response.data;
    if (Array.isArray(response.courses)) return response.courses;
  }
  return [];
}

function mapApiCourseToLocal(apiCourse: ApiCourse): Course {
  const students = Array.isArray(apiCourse.students) ? apiCourse.students : [];

  return {
    id: String(apiCourse.id),
    code: apiCourse.code,
    joinCode: apiCourse.code,
    title: apiCourse.title,
    teacher: apiCourse.teacher?.name || 'Unknown',
    studentsCount: apiCourse.students_count || students.length,
    materi: apiCourse.materials_count || 0,
    tugas: apiCourse.assignments_count || 0,
    path: '/guru/materi',
    studentsList: students.map(s => ({
      id: String(s.id),
      name: s.name,
      email: s.nisn_or_nip || s.email || '',
      status: 'Active'
    }))
  };
}

export function LmsProvider({ children }: { children: React.ReactNode }) {
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [myCourseIds, setMyCourseIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [mutatingCourseId, setMutatingCourseId] = useState<string | null>(null);

  const refreshCourses = async (): Promise<void> => {
    try {
      const [myCoursesData, availableCoursesData] = await Promise.all([
        api.getCourses().catch(() => []),
        api.getAvailableCourses().catch(() => [])
      ]);

      const myMapped = getCourseList(myCoursesData).map(mapApiCourseToLocal);
      const availableMapped = getCourseList(availableCoursesData).map(mapApiCourseToLocal);
      setEnrolledCourses(myMapped);
      setAvailableCourses(availableMapped);
      setMyCourseIds(myMapped.map(c => c.id));
    } catch (error) {
      console.error('Failed to load courses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshCourses();

    const handleUserUpdated = () => {
      refreshCourses();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('lms_user_updated', handleUserUpdated);
      return () => {
        window.removeEventListener('lms_user_updated', handleUserUpdated);
      };
    }
  }, []);

  const addCourse = async (data: { title: string; code?: string; students?: string; teacher?: string }): Promise<Course> => {
    const generatedCode = data.code ? data.code.toUpperCase() : `MAPEL-${Math.floor(100 + Math.random() * 900)}`;
    
    try {
      const response = await api.createCourse({
        title: data.title,
        code: generatedCode,
        description: 'Kelas baru buatan Guru'
      });
      
      const apiCourse = (response as any).data || response;
      const newCourse = mapApiCourseToLocal(apiCourse as ApiCourse);
      setEnrolledCourses(prev => [newCourse, ...prev]);
      return newCourse;
    } catch (error) {
      console.error('Failed to create course:', error);
      throw error;
    }
  };

  const updateCourse = async (id: string, updatedData: Partial<Course>): Promise<void> => {
    try {
      await api.updateCourse(Number(id), updatedData as any);
      await refreshCourses();
    } catch (error) {
      console.error('Failed to update course:', error);
      throw error;
    }
  };

  const deleteCourse = async (id: string): Promise<void> => {
    try {
      await api.deleteCourse(id);
      setEnrolledCourses(prev => prev.filter(c => c.id !== id));
      setMyCourseIds(prev => prev.filter(cId => cId !== id));
    } catch (error) {
      console.error('Failed to delete course:', error);
      throw error;
    }
  };

  const joinCourseById = async (id: string) => {
    try {
      setMutatingCourseId(id);
      await api.enrollCourse(Number(id));
      await refreshCourses();
    } catch (error) {
      console.error('Failed to join course:', error);
      throw error;
    } finally {
      setMutatingCourseId(null);
    }
  };

  const leaveCourseById = async (id: string) => {
    try {
      setMutatingCourseId(id);
      await api.leaveCourse(Number(id));
      await refreshCourses();
    } catch (error) {
      console.error('Failed to leave course:', error);
      throw error;
    } finally {
      setMutatingCourseId(null);
    }
  };

  const joinCourseByCode = async (codeInput: string) => {
    const cleanCode = codeInput.trim().toUpperCase().replace(/-JOIN$/i, '');
    
    try {
      const result = await api.enrollByCode(cleanCode);
      await refreshCourses();
      
      return { 
        success: true, 
        course: (result as any).course ? mapApiCourseToLocal((result as any).course) : undefined, 
        message: `Berhasil bergabung ke kelas dengan kode ${cleanCode}!` 
      };
    } catch (error: any) {
      return { 
        success: false, 
        message: error.message || `Kode Akses "${cleanCode}" tidak ditemukan atau gagal bergabung!` 
      };
    }
  };

  const kickStudent = async (courseId: string, studentId: string) => {
    try {
      await api.kickStudent(Number(courseId), Number(studentId));
      await refreshCourses();
    } catch (error) {
      console.error('Failed to kick student:', error);
      throw error;
    }
  };

  return (
    <LmsContext.Provider value={{
      enrolledCourses,
      availableCourses,
      myCourseIds,
      loading,
      addCourse,
      updateCourse,
      deleteCourse,
      joinCourseByCode,
      joinCourseById,
      leaveCourseById,
      kickStudent,
      refreshCourses
    }}>
      {children}
    </LmsContext.Provider>
  );
}

export function useLms() {
  const context = useContext(LmsContext);
  if (!context) {
    throw new Error('useLms must be used within an LmsProvider');
  }
  return context;
}
