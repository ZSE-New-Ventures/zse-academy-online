import { apiClient } from "./api";
import { API_ENDPOINTS } from "@/constants/api";

export interface Course {
  id: number;
  title: string;
  description: string;
  duration: string;
  level: string;
  category?: string | {
    id: number;
    name: string;
    access_level?: 'public' | 'restricted';
  };
  category_id?: number;
  instructor?: string | {
    id: number;
    name: string;
    username?: string;
  };
  instructor_id?: number;
  contents?: Array<{
    id: number;
    title: string;
    slides?: unknown[];
    [key: string]: unknown;
  }>;
  thumbnail?: string;
  presigned_url?: string;
  enrollments_count?: number;
  students_count?: number;
  reviews_avg_rating?: number | string | null;
  reviews_count?: number;
  is_enrolled?: boolean;
  progress?: number;
  thumbnail_url?: string;
  is_published?: boolean;
  visibility?: 'public' | 'restricted' | 'private';
}

export interface UserGroup {
  id: number;
  name: string;
  code: string;
  organization?: string;
  description?: string;
  created_by?: number;
  is_active: boolean;
  members_count?: number;
  categories_count?: number;
  course_assignments_count?: number;
  creator?: { id: number; name: string; email: string };
  members?: Array<{ id: number; name: string; email: string }>;
  created_at?: string;
}

export interface CourseAssignment {
  id: number;
  course_id: number;
  user_id?: number | null;
  group_id?: number | null;
  status: 'active' | 'revoked' | 'expired';
  expires_at?: string | null;
  assigned_by: number;
  course?: Course;
  user?: { id: number; name: string; email: string };
  group?: UserGroup;
  assigner?: { id: number; name: string };
  created_at: string;
}

export interface CategoryItem {
  id: number;
  name: string;
  slug?: string;
  description?: string;
  access_level?: 'public' | 'restricted';
  is_active?: boolean;
  groups?: UserGroup[];
  courses_count?: number;
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

  enrollInCourse: async (courseId: string | number): Promise<Record<string, unknown>> => {
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

  createCourseContent: async (courseId: string | number, contentData: Record<string, unknown>) => {
    const response = await apiClient.post(API_ENDPOINTS.ADMIN_CREATE_CONTENT(courseId), contentData);
    return response.data;
  },

  updateCourseContent: async (courseId: string | number, contentId: string | number, contentData: Record<string, unknown>) => {
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

  // Cohort Groups Management
  getGroups: async (params?: { search?: string }) => {
    const response = await apiClient.get('/groups', { params });
    return response.data?.data || response.data;
  },

  getGroupById: async (id: number) => {
    const response = await apiClient.get(`/groups/${id}`);
    return response.data?.data || response.data;
  },

  createGroup: async (data: Partial<UserGroup>) => {
    const response = await apiClient.post('/groups', data);
    return response.data?.data || response.data;
  },

  updateGroup: async (id: number, data: Partial<UserGroup>) => {
    const response = await apiClient.put(`/groups/${id}`, data);
    return response.data?.data || response.data;
  },

  deleteGroup: async (id: number) => {
    const response = await apiClient.delete(`/groups/${id}`);
    return response.data;
  },

  getGroupMembers: async (groupId: number, params?: { search?: string }) => {
    const response = await apiClient.get(`/groups/${groupId}/members`, { params });
    return response.data?.data || response.data;
  },

  addGroupMembers: async (groupId: number, userIds: number[]) => {
    const response = await apiClient.post(`/groups/${groupId}/members`, { user_ids: userIds });
    return response.data;
  },

  removeGroupMember: async (groupId: number, userId: number) => {
    const response = await apiClient.delete(`/groups/${groupId}/members/${userId}`);
    return response.data;
  },

  // Course Assignments
  getCourseAssignments: async (courseId: number) => {
    const response = await apiClient.get(`/courses/${courseId}/assignments`);
    return response.data?.data || response.data;
  },

  assignCourse: async (
    courseId: number,
    data: {
      assignment_type: 'individual' | 'group';
      user_ids?: number[];
      group_id?: number;
      expires_at?: string | null;
    }
  ) => {
    const response = await apiClient.post(`/courses/${courseId}/assignments`, data);
    return response.data;
  },

  revokeAssignment: async (assignmentId: number) => {
    const response = await apiClient.delete(`/assignments/${assignmentId}`);
    return response.data;
  },

  syncCategoryGroups: async (categoryId: number, groupIds: number[]) => {
    const response = await apiClient.post(`/categories/${categoryId}/groups`, { group_ids: groupIds });
    return response.data;
  },
};