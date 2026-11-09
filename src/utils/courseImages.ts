import directTutorialImage from "@/assets/course-direct.jpg";
import financialStatementsImage from "@/assets/course-statements.jpg";
import marketAnalysisImage from "@/assets/course-market-analysis.jpg";
import stockExchangeImage from "@/assets/courses.jpg";
import marketEducationImage from "@/assets/courses_background_1780923447772.png";

export interface CourseImageSource {
  id?: number | string;
  title?: string;
  category?: string | { name?: string };
  thumbnail_url?: string | null;
  thumbnail?: string | null;
  presigned_url?: string | null;
}

const fallbackImages = [
  stockExchangeImage,
  directTutorialImage,
  financialStatementsImage,
  marketEducationImage,
  marketAnalysisImage,
];

const getFallbackImage = (course: CourseImageSource): string => {
  const title = course.title?.toLowerCase() || "";
  const category =
    typeof course.category === "string"
      ? course.category.toLowerCase()
      : course.category?.name?.toLowerCase() || "";
  const topic = `${title} ${category}`;

  if (/zse direct|platform|tutorial/.test(topic)) {
    return directTutorialImage;
  }
  if (/financial statement|fundamental|company financial|accounting/.test(topic)) {
    return financialStatementsImage;
  }
  if (/exchange traded fund|\betf\b/.test(topic)) {
    return marketEducationImage;
  }
  if (/dividend|portfolio|technical|chart|trading|reit|bond|risk|analysis/.test(topic)) {
    return marketAnalysisImage;
  }
  if (/introduction|basics|stock exchange|market/.test(topic)) {
    return stockExchangeImage;
  }
  const stableKey = String(course.id ?? course.title ?? "course");
  const index = [...stableKey].reduce((value, character) => value + character.charCodeAt(0), 0);
  return fallbackImages[index % fallbackImages.length];
};

export const getCourseFallbackImage = (course: CourseImageSource): string =>
  getFallbackImage(course);

export const getCourseImage = (course: CourseImageSource): string => {
  const existingImage = [
    course.presigned_url,
    course.thumbnail_url,
    course.thumbnail,
  ].find(
    (image) =>
      image &&
      !/zse-logo|placeholder\.svg|placehold\.co/i.test(image),
  );

  return existingImage || getFallbackImage(course);
};

export const getUniqueCourseImages = (
  courses: CourseImageSource[],
): string[] => {
  const usedImages = new Set<string>();

  return courses.map((course) => {
    const preferredImage = getCourseImage(course);
    if (!usedImages.has(preferredImage)) {
      usedImages.add(preferredImage);
      return preferredImage;
    }

    const fallbackImage = fallbackImages.find((image) => !usedImages.has(image));
    const uniqueImage = fallbackImage || getFallbackImage(course);
    usedImages.add(uniqueImage);
    return uniqueImage;
  });
};
