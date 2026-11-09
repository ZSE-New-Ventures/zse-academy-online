export interface LastViewedLesson {
  moduleId: number;
  slideId: number;
}

export interface LocalCourseLearningData {
  lastViewed: LastViewedLesson | null;
  bookmarkedSlideIds: number[];
  completedSlideIds: number[];
  notes: Record<number, string>;
}

const emptyLearningData = (): LocalCourseLearningData => ({
  lastViewed: null,
  bookmarkedSlideIds: [],
  completedSlideIds: [],
  notes: {},
});

const storageKey = (userId: string, courseId: number) =>
  `zse_learning_${encodeURIComponent(userId)}_${courseId}`;

export const getLocalCourseLearningData = (
  userId: string,
  courseId: number,
): LocalCourseLearningData => {
  const stored = localStorage.getItem(storageKey(userId, courseId));
  if (!stored) return emptyLearningData();

  try {
    const parsed = JSON.parse(stored) as Partial<LocalCourseLearningData>;
    return {
      lastViewed:
        parsed.lastViewed &&
        Number.isFinite(parsed.lastViewed.moduleId) &&
        Number.isFinite(parsed.lastViewed.slideId)
          ? parsed.lastViewed
          : null,
      bookmarkedSlideIds: Array.isArray(parsed.bookmarkedSlideIds)
        ? parsed.bookmarkedSlideIds.filter(Number.isFinite)
        : [],
      completedSlideIds: Array.isArray(parsed.completedSlideIds)
        ? parsed.completedSlideIds.filter(Number.isFinite)
        : [],
      notes:
        parsed.notes && typeof parsed.notes === "object" ? parsed.notes : {},
    };
  } catch (error) {
    console.error("Failed to read saved learning data:", error);
    return emptyLearningData();
  }
};

export const saveLocalCourseLearningData = (
  userId: string,
  courseId: number,
  data: LocalCourseLearningData,
) => {
  localStorage.setItem(storageKey(userId, courseId), JSON.stringify(data));
};
