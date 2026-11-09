import { apiClient } from "./api";
import { API_ENDPOINTS } from "@/constants/api";

export interface Course {
  id: number;
  title: string;
  description: string;
  duration: string;
  level: string;
  category?: {
    id: number;
    name: string;
  };
  category_id?: number;
  instructor?: {
    id: number;
    name: string;
  };
  instructor_id?: number;
  contents?: any[];
  thumbnail?: string;
  is_enrolled?: boolean;
  progress?: number;
  thumbnail_url?: string;
  is_published?: boolean;
}

export const courseService = {
  getAllCourses: async (): Promise<Course[]> => {
    const response = await apiClient.get(API_ENDPOINTS.COURSES);
    return response.data.data || response.data;
  },

  getCourseById: async (id: string | number): Promise<Course> => {
    const response = await apiClient.get(API_ENDPOINTS.COURSE_DETAIL(id));
    return response.data;
  },

  getMyCourses: async () => {
    const response = await apiClient.get(API_ENDPOINTS.MY_COURSES);
    return response.data;
  },

  enrollCourse: async (id: string | number) => {
    const response = await apiClient.post(API_ENDPOINTS.ENROLL_COURSE(id));
    return response.data;
  },

  enrollInCourse: async (courseId: string | number): Promise<any> => {
    const response = await apiClient.post(API_ENDPOINTS.ENROLL_COURSE(courseId));
    return response.data;
  },

  getSimilarCourses: async (id: string | number): Promise<Course[]> => {
    const response = await apiClient.get(API_ENDPOINTS.SIMILAR_COURSES(id));
    return response.data.data || response.data;
  },

  getCourseAiSummary: async (courseId: string | number, refresh: boolean = false) => {
    const response = await apiClient.get(`/courses/${courseId}/ai-summary${refresh ? '?refresh=1' : ''}`);
    return response.data?.data || response.data;
  },

  askCourseAi: async (courseId: string | number, question: string) => {
    const response = await apiClient.post(`/courses/${courseId}/ai-ask`, { question });
    return response.data;
  },

  // Admin functions
  createCourse: async (courseData: Partial<Course>) => {
    const response = await apiClient.post(API_ENDPOINTS.ADMIN_CREATE_COURSE, courseData);
    return response.data;
  },

  updateCourse: async (id: string | number, courseData: Partial<Course>) => {
    const response = await apiClient.put(API_ENDPOINTS.ADMIN_UPDATE_COURSE(id), courseData);
    return response.data;
  },

  deleteCourse: async (id: string | number) => {
    const response = await apiClient.delete(API_ENDPOINTS.ADMIN_DELETE_COURSE(id));
    return response.data;
  },

  getAdminCourses: async () => {
    const response = await apiClient.get(API_ENDPOINTS.ADMIN_COURSES);
    return response.data;
  },

  // Course Content Management
  getCourseContent: async (courseId: string | number) => {
    const response = await apiClient.get(API_ENDPOINTS.ADMIN_COURSE_CONTENT(courseId));
    return response.data;
  },

  createCourseContent: async (courseId: string | number, contentData: any) => {
    const response = await apiClient.post(API_ENDPOINTS.ADMIN_CREATE_CONTENT(courseId), contentData);
    return response.data;
  },

  updateCourseContent: async (courseId: string | number, contentId: string | number, contentData: any) => {
    const response = await apiClient.put(API_ENDPOINTS.ADMIN_UPDATE_CONTENT(courseId, contentId), contentData);
    return response.data;
  },

  deleteCourseContent: async (courseId: string | number, contentId: string | number) => {
    const response = await apiClient.delete(API_ENDPOINTS.ADMIN_DELETE_CONTENT(courseId, contentId));
    return response.data;
  },

  // Finish module/content
  finishModule: async (courseId: string | number, moduleId: string | number) => {
    const response = await apiClient.post(`/courses/${courseId}/contents/${moduleId}/finish`);
    return response.data;
  },
};