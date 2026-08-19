import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { courseService, Course } from "@/services/course.service";

export const COURSE_KEYS = {
  all: ["courses"] as const,
  lists: () => [...COURSE_KEYS.all, "list"] as const,
  detail: (id: string | number) => [...COURSE_KEYS.all, "detail", id] as const,
  similar: (id: string | number) => [...COURSE_KEYS.all, "similar", id] as const,
  myCourses: () => [...COURSE_KEYS.all, "myCourses"] as const,
};

export const useMyCourses = (enabled: boolean = true) => {
  return useQuery({
    queryKey: COURSE_KEYS.myCourses(),
    queryFn: () => courseService.getMyCourses(),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCourses = () => {
  return useQuery({
    queryKey: COURSE_KEYS.lists(),
    queryFn: async () => {
      const coursesData = await courseService.getAllCourses();
      return coursesData.map((course: any) => ({
        ...course,
        instructor: course.instructor?.name || course.instructor?.username || "ZSE Instructor",
        duration: course.duration || "Self-paced",
        students: course.enrollments_count || course.students_count || 0,
        rating: course.reviews_avg_rating !== null && course.reviews_avg_rating !== undefined
          ? parseFloat(course.reviews_avg_rating.toString())
          : null,
        reviews_count: course.reviews_count || 0,
        category: course.category?.name || course.category || "General",
        level: course.level || "Beginner",
        thumbnail_url: course.thumbnail_url || course.thumbnail || "",
        is_published: course.is_published !== undefined ? Boolean(course.is_published) : true,
        is_enrolled: course.is_enrolled !== undefined ? Boolean(course.is_enrolled) : false,
        progress: course.progress || 0,
      }));
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCourse = (id: string | number | undefined) => {
  return useQuery({
    queryKey: COURSE_KEYS.detail(id!),
    queryFn: () => courseService.getCourseById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useSimilarCourses = (id: string | number | undefined) => {
  return useQuery({
    queryKey: COURSE_KEYS.similar(id!),
    queryFn: () => courseService.getSimilarCourses(id!),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useEnrollMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (courseId: string | number) => courseService.enrollInCourse(courseId),
    onSuccess: (_, courseId) => {
      // Invalidate the course list and detail to reflect enrollment
      queryClient.invalidateQueries({ queryKey: COURSE_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: COURSE_KEYS.detail(courseId) });
    },
  });
};
