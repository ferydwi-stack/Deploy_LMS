'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/lib/api';
import type { Course as ApiCourse, User } from '@/types/models';

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
  courses: Course[];
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

function mapApiCourseToLocal(apiCourse: ApiCourse): Course {
  return {
    id: String(apiCourse.id),
    code: apiCourse.code,
    joinCode: apiCourse.code,
    title: apiCourse.title,
    teacher: apiCourse.teacher?.name || 'Unknown',
    studentsCount: apiCourse.students_count || apiCourse.students?.length || 0,
    materi: apiCourse.materials_count || 0,
    tugas: apiCourse.assignments_count || 0,
    path: '/guru/materi',
    studentsList: (apiCourse.students || []).map(s => ({
      id: String(s.id),
      name: s.name,
      email: s.nisn_or_nip || '',
      status: s.pivot?.status === 'active' ? 'Active' : 'Dropped'
    }))
  };
}

export function LmsProvider({ children }: { children: React.ReactNode }) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [myCourseIds, setMyCourseIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshCourses = async () => {
    try {
      const apiCourses = await api.getCourses();
      const mapped = Array.isArray(apiCourses) ? apiCourses.map(mapApiCourseToLocal) : [];
      setCourses(mapped);
    } catch (error) {
      console.error('Failed to load courses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshCourses();
  }, []);

  const addCourse = async (data: { title: string; code?: string; students?: string; teacher?: string }) => {
    const generatedCode = data.code ? data.code.toUpperCase() : `MAPEL-${Math.floor(100 + Math.random() * 900)}`;
    
    try {
      const apiCourse = await api.createCourse({
        title: data.title,
        code: generatedCode,
        description: 'Kelas baru buatan Guru'
      });
      
      const newCourse = mapApiCourseToLocal(apiCourse);
      setCourses(prev => [newCourse, ...prev]);
      return newCourse;
    } catch (error) {
      console.error('Failed to create course:', error);
      throw error;
    }
  };

  const updateCourse = async (id: string, updatedData: Partial<Course>) => {
    setCourses(prev => prev.map(c => c.id === id ? { ...c, ...updatedData } : c));
    await refreshCourses();
  };

  const deleteCourse = async (id: string) => {
    try {
      await api.deleteCourse(id);
      setCourses(prev => prev.filter(c => c.id !== id));
      setMyCourseIds(prev => prev.filter(cId => cId !== id));
    } catch (error) {
      console.error('Failed to delete course:', error);
      throw error;
    }
  };

  const joinCourseById = async (id: string) => {
    try {
      await api.enrollCourse(Number(id));
      setMyCourseIds(prev => prev.includes(id) ? prev : [...prev, id]);
      await refreshCourses();
    } catch (error) {
      console.error('Failed to join course:', error);
      throw error;
    }
  };

  const leaveCourseById = async (id: string) => {
    try {
      await api.leaveCourse(Number(id));
      setMyCourseIds(prev => prev.filter(cId => cId !== id));
      await refreshCourses();
    } catch (error) {
      console.error('Failed to leave course:', error);
      throw error;
    }
  };

  const joinCourseByCode = async (codeInput: string) => {
    const cleanCode = codeInput.trim().toUpperCase();
    
    try {
      const result = await api.enrollByCode(cleanCode);
      await refreshCourses();
      
      const enrolledCourse = courses.find(c => c.code === cleanCode);
      if (enrolledCourse) {
        setMyCourseIds(prev => prev.includes(enrolledCourse.id) ? prev : [...prev, enrolledCourse.id]);
      }
      
      return { 
        success: true, 
        course: enrolledCourse, 
        message: `Berhasil bergabung ke kelas dengan kode ${cleanCode}!` 
      };
    } catch (error) {
      return { 
        success: false, 
        message: `Kode Akses "${cleanCode}" tidak ditemukan!` 
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
      courses,
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
