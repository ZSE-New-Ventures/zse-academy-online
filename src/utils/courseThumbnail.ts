import { courseService } from "@/services/course.service";
import courseInvesting101 from "@/assets/course-investing-101.png";

const DEFAULT_THUMBNAIL_KEY = "zse_default_course_thumbnail";

export const getCachedDefaultThumbnail = (): string => {
  return localStorage.getItem(DEFAULT_THUMBNAIL_KEY) || courseInvesting101;
};

export const setCachedDefaultThumbnail = (url: string): void => {
  if (url) {
    localStorage.setItem(DEFAULT_THUMBNAIL_KEY, url);
  } else {
    localStorage.removeItem(DEFAULT_THUMBNAIL_KEY);
  }
};

export const fetchAndCacheDefaultThumbnail = async (): Promise<string> => {
  try {
    const url = await courseService.getDefaultThumbnail();
    if (url) {
      setCachedDefaultThumbnail(url);
      return url;
    }
  } catch (error) {
    console.error("Failed to fetch platform default thumbnail:", error);
  }
  return getCachedDefaultThumbnail();
};

export const getCourseThumbnail = (course?: {
  thumbnail_url?: string | null;
  thumbnail?: string | null;
  presigned_url?: string | null;
} | null): string => {
  if (!course) return getCachedDefaultThumbnail();
  if (course.presigned_url) return course.presigned_url;
  if (course.thumbnail_url) return course.thumbnail_url;
  if (course.thumbnail) return course.thumbnail;
  return getCachedDefaultThumbnail();
};

