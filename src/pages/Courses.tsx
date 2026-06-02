import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { courseService } from "@/services/course.service";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClock,
  faUsers,
  faStar,
  faSearch,
  faSpinner,
  faCheckCircle,
  faPlayCircle,
} from "@fortawesome/free-solid-svg-icons";
import { useToast } from "@/hooks/use-toast";

interface Course {
  id: number;
  title: string;
  description: string;
  category: string;
  category_id?: number;
  level: string;
  thumbnail_url: string;
  presigned_url?: string;
  is_published: boolean;
  instructor?: string;
  duration?: string;
  students?: number;
  rating?: number;
  reviews_count?: number;
  reviews_avg_rating?: number | string;
  is_enrolled?: boolean;
  progress?: number;
  user_id?: number;
  created_at?: string;
  updated_at?: string;
}

import { useCourses, useEnrollMutation, useMyCourses } from "@/hooks/useCourses";

const Courses = () => {
  const { data: courses = [], isLoading: loading, error } = useCourses();
  const enrollMutation = useEnrollMutation();
  const [searchTerm, setSearchTerm] = useState("");
  const [showFullDesc, setShowFullDesc] = useState(false);
  const heroDescription = "Explore our comprehensive catalog of courses designed to help you master trading and financial markets";
  const [selectedLevel, setSelectedLevel] = useState("all-levels");
  const [selectedCategory, setSelectedCategory] = useState("all-categories");
  const { user } = useAuth();
  const { data: myCourses = [] } = useMyCourses(!!user);
  const { toast } = useToast();
  const [enrolling, setEnrolling] = useState<number | null>(null);

  const handleEnroll = async (courseId: number) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to enroll in courses",
        variant: "destructive",
      });
      return;
    }

    try {
      setEnrolling(courseId);
      await enrollMutation.mutateAsync(courseId);
      toast({
        title: "Success!",
        description: "You have successfully enrolled in the course",
        className: "bg-green-50 text-green-900 border-green-200",
      });
    } catch (error: any) {
      toast({
        title: "Enrollment Failed",
        description: "Failed to enroll in course. Please try again.",
        variant: "destructive",
      });
    } finally {
      setEnrolling(null);
    }
  };

  const enrolledCourseIds = new Set(myCourses.map((mc: any) => mc.id));

  const filteredCourses = courses.filter(course => {
    return (
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedLevel === "all-levels" || selectedLevel === "" || course.level === selectedLevel) &&
      (selectedCategory === "all-categories" || selectedCategory === "" || course.category === selectedCategory) &&
      course.is_published
    );
  }).map(course => ({
    ...course,
    is_enrolled: course.is_enrolled || enrolledCourseIds.has(course.id)
  }));

  const categories = Array.from(new Set(courses.map(course => course.category).filter(Boolean)));
  const levels = Array.from(new Set(courses.map(course => course.level).filter(Boolean)));


  const getThumbnail = (course: Course) => {
    if (course.presigned_url) return course.presigned_url;
    if (course.thumbnail_url) return course.thumbnail_url;
    const defaultThumbnails: Record<string, string> = {
      'Fundamentals': 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=240&fit=crop',
      'Technical Analysis': 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=240&fit=crop',
      'Portfolio Management': 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400&h=240&fit=crop',
      'DevOps': 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=400&h=240&fit=crop',
      'Security': 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=240&fit=crop',
      'intro': 'https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?w=400&h=240&fit=crop',
    };
    return defaultThumbnails[course.category] ||
      'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=240&fit=crop';
  };

  // Function to render star rating
  const renderRating = (course: Course) => {
    const rating = course.rating;
    const reviewsCount = course.reviews_count || course.students || 0;

    // If no rating data exists, don't show rating section
    if (rating === undefined || rating === null) {
      return (
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs text-gray-500">No ratings yet</span>
        </div>
      );
    }

    // If rating is 0, show it as 0
    const displayRating = rating === 0 ? 0 : rating;

    return (
      <div className="flex items-center gap-2 mb-3">
        <span className="font-bold text-sm text-gray-900">{displayRating.toFixed(1)}</span>
        <div className="flex items-center">
          {[...Array(5)].map((_, i) => (
            <FontAwesomeIcon
              key={i}
              icon={faStar}
              className={`h-3 w-3 ${i < Math.floor(displayRating)
                  ? 'text-orange-400'
                  : displayRating % 1 > 0 && i === Math.floor(displayRating)
                    ? 'text-orange-200'
                    : 'text-gray-300'
                }`}
            />
          ))}
        </div>
        <span className="text-xs text-gray-500">({reviewsCount.toLocaleString()})</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 font-montserrat">
        <Navbar />

        {/* Hero Skeleton */}
        <section className="bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-600 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl space-y-4">
              <div className="h-12 bg-purple-500/30 rounded-md w-3/4 animate-pulse" />
              <div className="h-6 bg-purple-500/30 rounded-md w-full animate-pulse" />
            </div>
          </div>
        </section>

        {/* Filter Bar Skeleton */}
        <section className="border-b bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-4">
              <div className="flex-1 max-w-xl w-full h-10 bg-muted rounded-md animate-pulse" />
              <div className="flex gap-3 w-full md:w-auto">
                <div className="w-full md:w-48 h-10 bg-muted rounded-md animate-pulse" />
                <div className="w-full md:w-40 h-10 bg-muted rounded-md animate-pulse" />
              </div>
            </div>
            <div className="h-4 bg-muted rounded-md w-32 animate-pulse" />
          </div>
        </section>

        {/* Courses Grid Skeleton */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {[...Array(8)].map((_, index) => (
                <Card key={index} className="overflow-hidden">
                  <div className="aspect-video bg-muted animate-pulse" />
                  <CardContent className="p-4 space-y-3">
                    <div className="h-5 bg-muted rounded animate-pulse" />
                    <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
                    <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
                    <div className="flex items-center justify-between pt-3">
                      <div className="h-6 bg-muted rounded w-20 animate-pulse" />
                      <div className="h-8 bg-muted rounded w-16 animate-pulse" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-montserrat">
      <Navbar />

      {/* Hero Section - Udemy Style */}
      <section className="bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Learn from the best courses
            </h1>
            <p className="text-lg md:text-xl text-purple-100 transition-all duration-300">
              {heroDescription}
            </p>
          </div>
        </div>
      </section>

      {/* Filter Bar - Sticky */}
      <section className="border-b bg-white sticky top-16 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-xl w-full">
              <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search for courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-300 focus:border-primary"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-3 w-full md:w-auto">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-48 border-gray-300">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-categories">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger className="w-full md:w-40 border-gray-300">
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-levels">All Levels</SelectItem>
                  {levels.map(level => (
                    <SelectItem key={level} value={level}>{level}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4">
            <p className="text-sm text-gray-600">
              <span className="font-semibold text-gray-900">{filteredCourses.length}</span> {filteredCourses.length === 1 ? 'course' : 'courses'} found
            </p>
          </div>
        </div>
      </section>

      {/* Courses Grid - Udemy Style */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredCourses.length === 0 ? (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <FontAwesomeIcon icon={faSearch} className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No courses found</h3>
                <p className="text-gray-600">Try adjusting your search or filter criteria</p>
              </div>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredCourses.map((course) => (
                <Card key={course.id} className="group overflow-hidden border hover:shadow-xl transition-all duration-300 bg-white">
                  {/* Course Thumbnail */}
                  <Link to={`/courses/${course.id}`}>
                    <div className="relative aspect-video overflow-hidden bg-gray-100">
                      <img
                        src={getThumbnail(course)}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=240&fit=crop';
                        }}
                      />
                      {course.is_enrolled && (
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-green-500 hover:bg-green-500 text-white border-0">
                            <FontAwesomeIcon icon={faCheckCircle} className="h-3 w-3 mr-1" />
                            Enrolled
                          </Badge>
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Course Info */}
                  <CardContent className="p-4">
                    <Link to={`/courses/${course.id}`}>
                      <h3 className="font-bold text-base text-gray-900 line-clamp-2 mb-2 group-hover:text-purple-600 transition-colors">
                        {course.title}
                      </h3>
                    </Link>

                    <p className="text-xs text-gray-600 mb-2">{course.instructor}</p>

                    {/* Description Removed */}

                    {/* Rating - Only shows if rating data exists */}
                    {renderRating(course)}

                    {/* CTA */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs bg-green-50 text-green-700 hover:bg-green-50">
                          Free Course
                        </Badge>
                      </div>

                      {course.is_enrolled ? (
                        <Link to={`/learn/${course.id}`}>
                          <Button size="sm" variant="outline" className="text-xs h-8">
                            <FontAwesomeIcon icon={faPlayCircle} className="h-3 w-3 mr-1" />
                            Continue
                          </Button>
                        </Link>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleEnroll(course.id)}
                          disabled={enrolling === course.id}
                          className="text-xs h-8 bg-purple-600 hover:bg-purple-700"
                        >
                          {enrolling === course.id ? (
                            <FontAwesomeIcon icon={faSpinner} className="h-3 w-3 animate-spin" />
                          ) : (
                            "Enroll Now"
                          )}
                        </Button>
                      )}
                    </div>

                    {/* Additional Info */}
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-3">
                      <div className="flex items-center gap-1">
                        <FontAwesomeIcon icon={faClock} className="h-3 w-3" />
                        <span>{course.duration}</span>
                      </div>
                      <Badge variant="outline" className="text-xs py-0 px-2 h-5">
                        {course.level}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Courses;
