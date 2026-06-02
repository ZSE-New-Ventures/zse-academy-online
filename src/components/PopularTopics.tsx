import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStar,
  faUsers,
  faClock,
  faSpinner,
  faArrowRight,
  faFire,
  faSignal
} from "@fortawesome/free-solid-svg-icons";

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Course {
  id: number;
  title: string;
  description: string;
  category: string | Category;
  level: string;
  price: number;
  thumbnail_url: string;
  presigned_url?: string;
  is_published: boolean;
  instructor?: any;
  duration?: string;
  students?: number;
  rating?: number;
  review_count?: number;
  is_enrolled?: boolean;
  progress?: number;
  creation_date?: string;
  sales?: number;
  is_bestseller?: boolean;
  original_price?: number;
}

export const PopularTopics = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLatestCourses = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://127.0.0.1:8000/api/courses/latest');

        if (!response.ok) {
          throw new Error(`Failed to fetch courses: ${response.status}`);
        }

        const data = await response.json();
        setCourses(data.data || []);
      } catch (err) {
        console.error('Error fetching latest courses:', err);
        setError(err instanceof Error ? err.message : 'Failed to load courses');
      } finally {
        setLoading(false);
      }
    };

    fetchLatestCourses();
  }, []);

  // Helper function to get category name safely
  const getCategoryName = (category: string | Category): string => {
    if (typeof category === 'string') {
      return category;
    }
    if (category && typeof category === 'object' && 'name' in category) {
      return category.name;
    }
    return 'General';
  };

  const getLevelColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case "beginner": return "text-green-600";
      case "intermediate": return "text-blue-600";
      case "advanced": return "text-purple-600";
      default: return "text-gray-600";
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'beginner': return 'text-green-500';
      case 'intermediate': return 'text-yellow-500';
      case 'advanced': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  // Get default thumbnail if none provided
  const getThumbnail = (course: Course) => {
    if (course.presigned_url) return course.presigned_url;
    if (course.thumbnail_url) return course.thumbnail_url;

    const defaultThumbnails: Record<string, string> = {
      'Trading': 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=240&fit=crop',
      'Technical Analysis': 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=240&fit=crop',
      'Fundamental Analysis': 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400&h=240&fit=crop',
      'Risk Management': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=240&fit=crop',
      'Portfolio Management': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=240&fit=crop',
    };

    const categoryName = getCategoryName(course.category);
    return defaultThumbnails[categoryName] ||
      'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=240&fit=crop';
  };

  // Render Udemy-style star rating
  const renderRating = (rating: number, reviewCount?: number) => {
    const fullStars = Math.floor(rating);

    return (
      <div className="flex items-center gap-1 mb-2">
        <span className="font-bold text-sm text-gray-900">{rating?.toFixed(1)}</span>
        <div className="flex items-center">
          {[...Array(5)].map((_, i) => (
            <FontAwesomeIcon
              key={i}
              icon={faStar}
              className={`h-3 w-3 ${i < fullStars ? 'text-yellow-400' : 'text-gray-300'}`}
            />
          ))}
        </div>
        <span className="text-xs text-gray-500">
          ({reviewCount ? reviewCount.toLocaleString() : '0'})
        </span>
      </div>
    );
  };

  // Transform course data
  const transformCourseData = (course: Course) => {
    let instructorName = 'Expert Instructor';
    if (course.instructor) {
      if (typeof course.instructor === 'string') {
        instructorName = course.instructor;
      } else if (typeof course.instructor === 'object') {
        instructorName = course.instructor.name || course.instructor.username || 'Expert Instructor';
      }
    }

    return {
      ...course,
      category: getCategoryName(course.category),
      instructor: instructorName,
      duration: course.duration,
      students: course.students,
      rating: course.rating,
      review_count: course.review_count,
      is_bestseller: course.is_bestseller,
    };
  };

  // Truncate title to fit in two lines
  const truncateTitle = (title: string, maxLength: number = 60) => {
    return title.length > maxLength ? title.substring(0, maxLength) + '...' : title;
  };

  // Loading skeleton
  if (loading) {
    return (
      <section className="py-16 bg-white font-montserrat">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Skeleton */}
          <div className="mb-12">
            <Skeleton className="h-6 w-48 mb-3" />
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96 max-w-full" />
          </div>

          {/* Courses Grid Skeleton - Udemy Style */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <Card key={index} className="bg-white border border-gray-200 hover:shadow-lg transition-shadow">
                <Skeleton className="w-full h-40" />
                <div className="p-4">
                  <Skeleton className="h-5 w-20 mb-2" />
                  <Skeleton className="h-6 w-full mb-2" />
                  <Skeleton className="h-4 w-24 mb-3" />
                  <Skeleton className="h-4 w-16 mb-2" />
                  <Skeleton className="h-4 w-full mb-3" />
                  <Skeleton className="h-10 w-full rounded-none" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="py-16 bg-white font-montserrat">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md mx-auto">
            <FontAwesomeIcon icon={faSpinner} className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-xl font-semibold text-red-800 mb-2">Failed to load courses</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-[#0095cc] hover:bg-[#0077a3] text-white px-6 py-2"
            >
              Try Again
            </Button>
          </div>
        </div>
      </section>
    );
  }

  // No courses state
  if (courses.length === 0) {
    return (
      <section className="py-16 bg-white font-montserrat">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 max-w-md mx-auto">
            <FontAwesomeIcon icon={faStar} className="h-12 w-12 text-yellow-500 mb-4" />
            <h3 className="text-xl font-semibold text-yellow-800 mb-2">No courses available</h3>
            <p className="text-yellow-600">Check back later for new courses</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section-padding bg-white font-montserrat">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header - Udemy Style */}
        <div className="mb-12 text-left w-full">
          <h2 className="text-3xl font-bold text-[#1c1d1f] mb-2 tracking-tight">
            Top Courses
          </h2>
          <p className="text-lg text-[#1c1d1f] max-w-3xl">
            Choose from online video courses with new additions published every month
          </p>
        </div>

        {/* Courses Grid - Udemy Style */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {courses.map((course) => {
            const transformedCourse = transformCourseData(course);

            return (
              <Link key={transformedCourse.id} to={`/courses/${transformedCourse.id}`} className="group flex">
                <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-150 rounded-none bg-white hover:-translate-y-1 flex flex-col w-full">
                  <div className="aspect-video relative overflow-hidden bg-gray-100">
                    <img
                      src={getThumbnail(transformedCourse)}
                      alt={transformedCourse.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4 flex flex-col flex-1 justify-between text-left">
                    <div className="mb-4">
                      <h3 className="font-bold text-base mb-2 line-clamp-2 text-gray-900 group-hover:text-[#00aeef] transition-colors" title={transformedCourse.title}>
                        {truncateTitle(transformedCourse.title, 70)}
                      </h3>
                      <p className="text-xs text-gray-500 mb-2 line-clamp-1 font-normal break-words">
                        {transformedCourse.instructor}
                      </p>
                      
                      {transformedCourse.rating != null && transformedCourse.rating > 0 && renderRating(transformedCourse.rating, transformedCourse.review_count)}
                    </div>
                    
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-auto">
                      <span className="text-xs font-bold text-[#00aeef]">
                        Free Course
                      </span>
                      <span className="text-[10px] font-bold text-gray-400 bg-gray-50 border border-gray-200 px-2 py-0.5 uppercase tracking-wider">
                        {transformedCourse.level || "General"}
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* View All Courses Link - Left Aligned with Reduced Margin */}
        <div className="text-left mt-8">
          <Link
            to="/courses"
            className="inline-flex items-center text-[#0095cc] rounded-sm hover:text-[#0077a3] transition-all group font-semibold text-lg border border-[#0095cc] hover:border-[#0077a3] px-6 py-2"
          >
            View All Courses
            <FontAwesomeIcon
              icon={faArrowRight}
              className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
            />
          </Link>
        </div>
      </div>
    </section>
  );
};
