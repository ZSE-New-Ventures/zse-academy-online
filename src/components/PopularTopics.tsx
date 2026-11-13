import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStar,
  faArrowRight,
  faBookOpen,
  faClock,
  faUsers,
  faAward,
  faSpinner,
  faLayerGroup,
} from "@fortawesome/free-solid-svg-icons";
import { API_BASE_URL } from "@/constants/api";

interface Category {
  id: number;
  name: string;
}

interface Course {
  id: number;
  title: string;
  description: string;
  instructor?: string | { name?: string };
  category: string | Category;
  duration?: string;
  level: string;
  thumbnail_url?: string;
  presigned_url?: string;
  price?: number;
  rating?: number;
  review_count?: number;
}

export const PopularTopics = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLatestCourses = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/courses/latest`);

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

  const getCategoryName = (category: string | Category): string => {
    if (typeof category === 'string') return category;
    if (category && typeof category === 'object' && 'name' in category) return category.name;
    return 'Securities Trading';
  };

  const getThumbnail = (course: Course) => {
    if (course.presigned_url) return course.presigned_url;
    if (course.thumbnail_url) return course.thumbnail_url;
    return 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&h=360&fit=crop';
  };

  const renderRating = (rating: number, reviewCount?: number) => {
    const fullStars = Math.floor(rating);
    return (
      <div className="flex items-center gap-1.5 mb-3">
        <span className="font-black text-xs text-slate-900">{rating?.toFixed(1)}</span>
        <div className="flex items-center text-amber-400 text-xs">
          {[...Array(5)].map((_, i) => (
            <FontAwesomeIcon
              key={i}
              icon={faStar}
              className={`h-3 w-3 ${i < fullStars ? 'text-amber-400' : 'text-slate-200'}`}
            />
          ))}
        </div>
        <span className="text-[11px] text-slate-500 font-medium">
          ({reviewCount ? reviewCount.toLocaleString() : '120+'})
        </span>
      </div>
    );
  };

  const transformCourseData = (course: Course) => {
    let instructorName = 'ZSE Training Institute';
    if (course.instructor) {
      if (typeof course.instructor === 'string') {
        instructorName = course.instructor;
      } else if (typeof course.instructor === 'object') {
        instructorName = course.instructor.name || course.instructor.username || 'ZSE Training Institute';
      }
    }

    return {
      ...course,
      instructor: instructorName,
      categoryName: getCategoryName(course.category),
    };
  };

  if (loading) {
    return (
      <section className="py-20 bg-white font-montserrat">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-left">
            <Skeleton className="h-4 w-32 mb-2 rounded-full" />
            <Skeleton className="h-8 w-64 mb-3" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="rounded-2xl border border-slate-200 p-3 space-y-3">
                <Skeleton className="w-full h-44 rounded-xl" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-white font-montserrat">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div className="text-left max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00aeef]/10 text-[#00aeef] text-xs font-bold uppercase tracking-wider mb-3 border border-[#00aeef]/20">
              <FontAwesomeIcon icon={faAward} />
              <span>Official Exchange Courses</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Featured Training Institute Courses
            </h2>
            <p className="mt-2 text-base text-slate-600">
              Comprehensive stock market courses built by exchange professionals. Complete modules, test your knowledge, and earn your certification.
            </p>
          </div>

          <Link
            to="/courses"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#00aeef] hover:text-[#008cc0] transition-colors shrink-0"
          >
            <span>View All Courses</span>
            <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
          </Link>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {courses.map((course) => {
            const transformedCourse = transformCourseData(course);

            return (
              <Link
                key={transformedCourse.id}
                to={`/courses/${transformedCourse.id}`}
                className="group flex"
              >
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white hover:border-[#00aeef]/50 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col w-full">
                  {/* Thumbnail Wrapper */}
                  <div className="aspect-[16/10] relative overflow-hidden bg-slate-100">
                    <img
                      src={getThumbnail(transformedCourse)}
                      alt={transformedCourse.title}
                      className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider bg-white/95 backdrop-blur-md text-[#008cc0] shadow-sm">
                        {transformedCourse.categoryName}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex flex-col flex-1 justify-between text-left">
                    <div>
                      <h3
                        className="font-bold text-base mb-1.5 line-clamp-2 text-slate-900 group-hover:text-[#00aeef] transition-colors leading-snug"
                        title={transformedCourse.title}
                      >
                        {transformedCourse.title}
                      </h3>

                      <p className="text-xs text-slate-500 mb-3 line-clamp-1 font-medium">
                        {transformedCourse.instructor}
                      </p>

                      {renderRating(transformedCourse.rating || 4.9, transformedCourse.review_count || 38)}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-2">
                      <span className="text-xs font-black text-[#00aeef] uppercase tracking-wide">
                        Free Access
                      </span>
                      <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
                        {transformedCourse.level || "Beginner"}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};
