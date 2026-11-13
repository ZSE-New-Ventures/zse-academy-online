import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useCourses, useEnrollMutation, useMyCourses } from "@/hooks/useCourses";
import { useToast } from "@/hooks/use-toast";
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
  faGraduationCap,
  faBookOpen,
  faAward,
  faBuildingColumns,
  faFilter,
  faTimes,
  faArrowRight,
  faWandMagicSparkles,
} from "@fortawesome/free-solid-svg-icons";
import { CourseAiSummaryModal } from "@/components/course/CourseAiSummaryModal";

import courseDirect from "@/assets/course-direct.jpg";
import courseMarket from "@/assets/course-market-analysis.jpg";
import courseStatements from "@/assets/course-statements.jpg";
import investmentBg from "@/assets/investment.jpg";
import train2 from "@/assets/train2.jpg";

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

const Courses = () => {
  const { data: courses = [], isLoading: loading } = useCourses();
  const enrollMutation = useEnrollMutation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("all-levels");
  const [selectedCategory, setSelectedCategory] = useState("all-categories");
  const { user } = useAuth();
  const { data: myCourses = [] } = useMyCourses(!!user);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [enrolling, setEnrolling] = useState<number | null>(null);
  const [selectedAiCourse, setSelectedAiCourse] = useState<{ id: number; title: string; isEnrolled?: boolean } | null>(null);

  const handleEnroll = async (courseId: number) => {
    if (!user) {
      Swal.fire({
        title: "Account Required",
        text: "Please sign in or create a free account to enroll in courses.",
        icon: "info",
        showCancelButton: true,
        confirmButtonColor: "#00aeef",
        cancelButtonColor: "#64748b",
        confirmButtonText: "Sign In / Register",
        cancelButtonText: "Browse As Guest",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/login");
        }
      });
      return;
    }

    try {
      setEnrolling(courseId);
      await enrollMutation.mutateAsync(courseId);
      toast({
        title: "Successfully Enrolled!",
        description: "Course added to your learning dashboard.",
      });
    } catch (err: unknown) {
      toast({
        title: "Enrollment Issue",
        description: err instanceof Error ? err.message : "Could not enroll at this time. Please try again.",
        variant: "destructive",
      });
    } finally {
      setEnrolling(null);
    }
  };

  const enrolledCourseIds = useMemo(() => new Set(myCourses.map((mc: { id: number }) => mc.id)), [myCourses]);

  const categories = useMemo(() => {
    return Array.from(new Set(courses.map((c: Course) => c.category).filter(Boolean)));
  }, [courses]);

  const levels = useMemo(() => {
    return Array.from(new Set(courses.map((c: Course) => c.level).filter(Boolean)));
  }, [courses]);

  const filteredCourses = useMemo(() => {
    return courses
      .filter((course: Course) => {
        const matchesSearch =
          course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (course.description && course.description.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesLevel = selectedLevel === "all-levels" || !selectedLevel || course.level === selectedLevel;
        const matchesCategory =
          selectedCategory === "all-categories" || !selectedCategory || course.category === selectedCategory;

        return matchesSearch && matchesLevel && matchesCategory && course.is_published;
      })
      .map((course: Course) => ({
        ...course,
        is_enrolled: course.is_enrolled || enrolledCourseIds.has(course.id),
      }));
  }, [courses, searchTerm, selectedLevel, selectedCategory, enrolledCourseIds]);

  const getThumbnail = (course: Course) => {
    if (course.presigned_url) return course.presigned_url;
    if (course.thumbnail_url) return course.thumbnail_url;
    const cat = (course.category || "").toLowerCase();
    if (cat.includes("market") || cat.includes("technical") || cat.includes("analysis")) return courseMarket;
    if (cat.includes("statement") || cat.includes("portfolio")) return courseStatements;
    if (cat.includes("direct") || cat.includes("trading") || cat.includes("equity")) return courseDirect;
    return investmentBg;
  };

  const renderRating = (course: Course) => {
    const rating = course.rating || 4.9;
    const count = course.reviews_count || course.students || 48;
    const fullStars = Math.floor(rating);

    return (
      <div className="flex items-center gap-1.5 mb-2.5">
        <span className="font-bold text-xs text-slate-900">{rating.toFixed(1)}</span>
        <div className="flex items-center text-amber-400 text-xs">
          {[...Array(5)].map((_, i) => (
            <FontAwesomeIcon
              key={i}
              icon={faStar}
              className={`h-3 w-3 ${i < fullStars ? "text-amber-400" : "text-slate-200"}`}
            />
          ))}
        </div>
        <span className="text-[11px] text-slate-500 font-medium">({count})</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 font-montserrat flex flex-col justify-between text-slate-900">
      <Navbar />

      {/* Prestige Hero Banner */}
      <section className="relative py-20 md:py-28 bg-[#0b1324] text-white overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20 mix-blend-luminosity pointer-events-none"
          style={{ backgroundImage: `url(${train2})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b1324] via-[#0b1324]/95 to-slate-900/80" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#00aeef]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00aeef]/10 text-[#00aeef] text-xs font-bold uppercase tracking-wider mb-6 border border-[#00aeef]/30 backdrop-blur-md">
            <FontAwesomeIcon icon={faBuildingColumns} />
            <span>Official Zimbabwe Stock Exchange Curriculum</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight mb-4">
            Master Zimbabwe's Capital Markets
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto mb-8">
            From foundational share trading on ZSE Direct to US Dollar investments on VFEX, explore our structured, self-paced courses with verifiable certifications.
          </p>

          {/* Quick Search in Hero */}
          <div className="relative max-w-xl mx-auto">
            <FontAwesomeIcon
              icon={faSearch}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm"
            />
            <Input
              placeholder="Search courses by topic, market, or keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 pr-10 h-13 bg-white text-slate-900 rounded-2xl shadow-2xl border-0 focus:ring-2 focus:ring-[#00aeef] text-sm"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Filter and Category Pills Toolbar */}
      <section className="bg-white border-b border-slate-200 sticky top-16 z-30 shadow-sm py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            
            {/* Category Pills (Horizontal Scroll on Mobile) */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full lg:w-auto py-1">
              <button
                onClick={() => setSelectedCategory("all-categories")}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === "all-categories"
                    ? "bg-[#00aeef] text-white shadow-md shadow-[#00aeef]/20"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                All Courses ({courses.length})
              </button>

              {categories.map((cat) => {
                const count = courses.filter((c: Course) => c.category === cat).length;
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                      isSelected
                        ? "bg-[#00aeef] text-white shadow-md shadow-[#00aeef]/20"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {cat} ({count})
                  </button>
                );
              })}
            </div>

            {/* Level Select & Reset */}
            <div className="flex items-center gap-3 w-full lg:w-auto shrink-0 justify-between lg:justify-end">
              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger className="h-10 w-44 rounded-xl border-slate-200 bg-slate-50 text-xs font-bold">
                  <SelectValue placeholder="All Difficulty Levels" />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200">
                  <SelectItem value="all-levels">All Difficulty Levels</SelectItem>
                  {levels.map((lvl) => (
                    <SelectItem key={lvl} value={lvl}>{lvl}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {(selectedCategory !== "all-categories" || selectedLevel !== "all-levels" || searchTerm) && (
                <button
                  onClick={() => {
                    setSelectedCategory("all-categories");
                    setSelectedLevel("all-levels");
                    setSearchTerm("");
                  }}
                  className="text-xs font-bold text-rose-600 hover:underline shrink-0"
                >
                  Reset Filters
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Courses Grid */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="rounded-2xl border border-slate-200 p-4 space-y-4 bg-white animate-pulse">
                <div className="aspect-[16/10] bg-slate-200 rounded-xl w-full" />
                <div className="h-4 bg-slate-200 rounded w-1/3" />
                <div className="h-6 bg-slate-200 rounded w-full" />
                <div className="h-4 bg-slate-200 rounded w-1/2" />
                <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                  <div className="h-6 bg-slate-200 rounded w-20" />
                  <div className="h-8 bg-slate-200 rounded w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8 max-w-lg mx-auto shadow-sm">
            <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-2xl mx-auto mb-4">
              <FontAwesomeIcon icon={faSearch} />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">No Matching Courses Found</h3>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              We couldn't find any courses matching your filter criteria. Try clearing search keywords or choosing "All Categories".
            </p>
            <Button
              onClick={() => {
                setSelectedCategory("all-categories");
                setSelectedLevel("all-levels");
                setSearchTerm("");
              }}
              className="bg-[#00aeef] hover:bg-[#008cc0] text-white font-bold text-xs uppercase tracking-wider rounded-xl px-6"
            >
              Show All Courses
            </Button>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-6">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Showing <span className="text-slate-900 font-black">{filteredCourses.length}</span> {filteredCourses.length === 1 ? "Course" : "Courses"}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCourses.map((course: Course) => (
                <div
                  key={course.id}
                  className="group rounded-2xl border border-slate-200 bg-white hover:border-[#00aeef]/60 hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between overflow-hidden"
                >
                  <div>
                    {/* Course Thumbnail */}
                    <Link to={`/courses/${course.id}`} className="block relative aspect-[16/10] overflow-hidden bg-slate-100">
                      <img
                        src={getThumbnail(course)}
                        alt={course.title}
                        className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.src = investmentBg;
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-80" />

                      {/* Category Chip Top-Left */}
                      <div className="absolute top-3 left-3">
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider bg-white/95 text-slate-800 shadow-md backdrop-blur-md">
                          {course.category || "Securities"}
                        </span>
                      </div>

                      {/* Enrollment Badge Top-Right */}
                      {course.is_enrolled && (
                        <div className="absolute top-3 right-3">
                          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider bg-emerald-500 text-white shadow-md flex items-center gap-1">
                            <FontAwesomeIcon icon={faCheckCircle} className="text-[9px]" />
                            <span>Enrolled</span>
                          </span>
                        </div>
                      )}

                      {/* Duration at Bottom */}
                      <div className="absolute bottom-2.5 left-3 text-white text-[11px] font-medium flex items-center gap-1.5 drop-shadow-sm">
                        <FontAwesomeIcon icon={faClock} className="text-slate-300 text-[10px]" />
                        <span>{course.duration || "Self-Paced"}</span>
                      </div>
                    </Link>

                    {/* Content Body */}
                    <div className="p-5">
                      <Link to={`/courses/${course.id}`}>
                        <h3
                          className="font-black text-base text-slate-900 group-hover:text-[#00aeef] transition-colors leading-snug line-clamp-2 mb-1.5"
                          title={course.title}
                        >
                          {course.title}
                        </h3>
                      </Link>

                      <p className="text-xs text-slate-500 line-clamp-1 mb-2 font-medium">
                        {course.instructor || "ZSE Training Institute"}
                      </p>

                      {renderRating(course)}
                    </div>
                  </div>

                  {/* Card Bottom CTA */}
                  <div className="p-5 pt-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedAiCourse({ id: course.id, title: course.title, isEnrolled: course.is_enrolled });
                      }}
                      className="w-full mb-3 py-1.5 px-3 rounded-xl bg-gradient-to-r from-sky-50 via-indigo-50/60 to-purple-50/50 hover:from-sky-100 hover:to-indigo-100 border border-sky-100/80 text-[#00aeef] hover:text-[#008cc0] font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all shadow-xs group/ai"
                    >
                      <FontAwesomeIcon icon={faWandMagicSparkles} className="text-[#00aeef] text-xs transition-transform group-hover/ai:rotate-12" />
                      <span>Summarise with AI</span>
                    </button>

                    <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-3">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Access
                        </span>
                        <span className="text-xs font-black text-emerald-600">
                          100% Free
                        </span>
                      </div>

                      {course.is_enrolled ? (
                        <Link to={`/learn/${course.id}`}>
                          <Button
                            size="sm"
                            className="bg-slate-900 hover:bg-[#00aeef] text-white font-bold text-xs uppercase tracking-wider rounded-xl h-9 px-4 transition-colors flex items-center gap-1.5"
                          >
                            <FontAwesomeIcon icon={faPlayCircle} />
                            <span>Continue</span>
                          </Button>
                        </Link>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleEnroll(course.id)}
                          disabled={enrolling === course.id}
                          className="bg-[#00aeef] hover:bg-[#008cc0] text-white font-bold text-xs uppercase tracking-wider rounded-xl h-9 px-4 transition-all shadow-md shadow-[#00aeef]/20"
                        >
                          {enrolling === course.id ? (
                            <FontAwesomeIcon icon={faSpinner} className="animate-spin text-xs" />
                          ) : (
                            "Enroll Free"
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* AI Summary Window */}
      <CourseAiSummaryModal
        isOpen={!!selectedAiCourse}
        onClose={() => setSelectedAiCourse(null)}
        courseId={selectedAiCourse?.id ?? null}
        courseTitle={selectedAiCourse?.title}
        isEnrolled={selectedAiCourse?.isEnrolled}
      />

      <Footer />
    </div>
  );
};

export default Courses;
