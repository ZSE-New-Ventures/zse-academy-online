import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { courseService, type WishlistCourse } from "@/services/course.service";
import { useCourses } from "@/hooks/useCourses";

const WISHLIST_STORAGE_KEY = "zse_wishlist";
const GUEST_WISHLIST_KEY = ["wishlist", "guest"] as const;
const wishlistKey = (userId: string) => ["wishlist", userId] as const;

const readGuestWishlist = (): number[] => {
  const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
  if (!stored) return [];

  const parsed: unknown = JSON.parse(stored);
  if (!Array.isArray(parsed)) return [];

  return [...new Set(parsed.map(Number).filter((id) => Number.isSafeInteger(id) && id > 0))];
};

const updateGuestWishlist = (update: (ids: number[]) => number[]) => {
  const ids = update(readGuestWishlist());
  localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(ids));
  window.dispatchEvent(new Event("wishlist-updated"));
};

export const useWishlist = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: availableCourses = [] } = useCourses();
  const queryKey = user ? wishlistKey(user.id) : GUEST_WISHLIST_KEY;

  const query = useQuery<WishlistCourse[]>({
    queryKey,
    queryFn: async () => {
      if (!user) {
        const savedIds = readGuestWishlist();
        return availableCourses
          .filter((course) => savedIds.includes(Number(course.id)))
          .map((course) => ({
            ...course,
            category: typeof course.category === "string"
              ? course.category
              : course.category?.name,
            instructor: typeof course.instructor === "string"
              ? course.instructor
              : course.instructor?.name,
          }));
      }

      let savedCourses = await courseService.getWishlist();
      const legacyIds = readGuestWishlist();
      if (legacyIds.length > 0) {
        const results = await Promise.allSettled(
          legacyIds.map((courseId) => courseService.addToWishlist(courseId))
        );
        const migratedIds = legacyIds.filter((_, index) => results[index].status === "fulfilled");
        if (migratedIds.length > 0) {
          const remainingIds = legacyIds.filter((id) => !migratedIds.includes(id));
          localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(remainingIds));
          window.dispatchEvent(new Event("wishlist-updated"));
          savedCourses = await courseService.getWishlist();
        }
        results.forEach((result, index) => {
          if (result.status === "rejected") {
            console.error(`Could not migrate saved course ${legacyIds[index]} to the account wishlist:`, result.reason);
          }
        });
      }
      return savedCourses;
    },
    staleTime: 0,
  });

  useEffect(() => {
    if (user) return;

    const refreshGuestWishlist = () => {
      queryClient.invalidateQueries({ queryKey: GUEST_WISHLIST_KEY });
    };
    window.addEventListener("wishlist-updated", refreshGuestWishlist);
    window.addEventListener("storage", refreshGuestWishlist);
    return () => {
      window.removeEventListener("wishlist-updated", refreshGuestWishlist);
      window.removeEventListener("storage", refreshGuestWishlist);
    };
  }, [queryClient, user]);

  const addMutation = useMutation({
    mutationFn: async (courseId: number) => {
      if (user) {
        await courseService.addToWishlist(courseId);
        return;
      }
      updateGuestWishlist((ids) => ids.includes(courseId) ? ids : [...ids, courseId]);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const removeMutation = useMutation({
    mutationFn: async (courseId: number) => {
      if (user) {
        await courseService.removeFromWishlist(courseId);
        return;
      }
      updateGuestWishlist((ids) => ids.filter((id) => id !== courseId));
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const courses = query.data ?? [];
  const courseIds = new Set(courses.map((course) => Number(course.id)));

  return {
    ...query,
    courses,
    isWishlisted: (courseId: number) => courseIds.has(Number(courseId)),
    addCourse: addMutation.mutateAsync,
    removeCourse: removeMutation.mutateAsync,
    isUpdating: addMutation.isPending || removeMutation.isPending,
  };
};
