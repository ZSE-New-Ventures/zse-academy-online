import { useState, useEffect, useMemo } from "react";
import { courseService } from "@/services/course.service";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faPlay, 
  faCertificate, 
  faBookOpen, 
  faSearch, 
  faCompass,
  faCircleCheck,
  faClock,
  faRotateRight,
  faGraduationCap,
  faLayerGroup,
  faWandMagicSparkles
} from "@fortawesome/free-solid-svg-icons";
import { useToast } from "@/hooks/use-toast";
import { getFallbackImage } from "@/utils/blogHelpers";
import { CourseAiSummaryModal } from "@/components/course/CourseAiSummaryModal";

interface CourseItem {
  id: number;
  title: string;
  description?: string;
  thumbnail_url?: string;
  progress: number;
  completedLessons: number;
  totalLessons: number;
  category: string;
  level: string;
  status: "completed" | "in-progress" | "not-started";
  certificateReceived: boolean;
}

const CourseSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm animate-pulse flex flex-col md:flex-row gap-5">
      <div className="w-full md:w-52 aspect-video bg-slate-200 rounded-xl shrink-0"></div>
      <div className="flex-1 space-y-3">
        <div className="flex gap-2">
          <div className="h-5 w-20 bg-slate-200 rounded-full"></div>
          <div className="h-5 w-16 bg-slate-200 rounded-full"></div>
        </div>
        <div className="h-6 w-3/4 bg-slate-200 rounded"></div>
        <div className="h-4 w-1/2 bg-slate-200 rounded"></div>
        <div className="h-2.5 w-full bg-slate-200 rounded-full mt-4"></div>
      </div>
      <div className="w-full md:w-32 flex items-center justify-end">
        <div className="h-10 w-28 bg-slate-200 rounded-xl"></div>
      </div>
    </div>
  );
};

const MyCourses = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<"all" | "in-progress" | "completed">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAiCourse, setSelectedAiCourse] = useState<{ id: number; title: string; isEnrolled?: boolean } | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      if (!user) return;

      try {
        const data = await courseService.getMyCourses();

        const formatted: CourseItem[] = data.map((course: { id: number; title: string; description?: string; progress?: number; level?: string; category?: string | { name?: string }; duration?: string; thumbnail_url?: string; thumbnail?: string; instructor?: string | { name?: string }; updated_at?: string; pivot?: { updated_at?: string } }) => {
          const rawProgress = Number(course.progress ?? 0);
          const progress = Math.min(100, Math.max(0, Math.round(rawProgress)));

          let status: "completed" | "in-progress" | "not-started" = "not-started";
          let certificateReceived = false;

          if (progress >= 100) {
            status = "completed";
            certificateReceived = true;
          } else if (progress > 0) {
            status = "in-progress";
          }

          return {
            id: course.id,
            title: course.title,
            description: course.description,
            thumbnail_url: course.thumbnail_url,
            progress,
            completedLessons: course.completed_modules ?? 0,
            totalLessons: course.total_modules ?? 0,
            category: course.category_name || "Capital Markets",
            level: course.level || "Beginner",
            status,
            certificateReceived,
          };
        });

        setCourses(formatted);
      } catch (error) {
        toast({
          title: "Error",
          description: "Unable to load your enrolled courses.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [user]);

  const counts = useMemo(() => {
    return {
      all: courses.length,
      inProgress: courses.filter((c) => c.status === "in-progress" || c.status === "not-started").length,
      completed: courses.filter((c) => c.status === "completed").length,
    };
  }, [courses]);

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      // Filter status
      if (activeFilter === "in-progress" && course.status === "completed") return false;
      if (activeFilter === "completed" && course.status !== "completed") return false;

      // Filter search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = course.title.toLowerCase().includes(q);
        const matchesCategory = course.category.toLowerCase().includes(q);
        return matchesTitle || matchesCategory;
      }

      return true;
    });
  }, [courses, activeFilter, searchQuery]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Controls & Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FontAwesomeIcon icon={faGraduationCap} className="text-[#00aeef]" />
            My Enrolled Courses
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Track your course progress, continue lessons, and review completed subjects
          </p>
        </div>

        {/* Filter Pills & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative">
            <FontAwesomeIcon icon={faSearch} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search courses..."
              className="pl-9 pr-3 h-9 w-full sm:w-56 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#00aeef] transition-colors"
            />
          </div>

          <div className="inline-flex p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeFilter === "all"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All ({counts.all})
            </button>
            <button
              onClick={() => setActiveFilter("in-progress")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeFilter === "in-progress"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              In Progress ({counts.inProgress})
            </button>
            <button
              onClick={() => setActiveFilter("completed")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeFilter === "completed"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Completed ({counts.completed})
            </button>
          </div>
        </div>
      </div>

      {/* Courses List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <CourseSkeleton key={i} />
          ))}
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 shadow-sm space-y-4 max-w-2xl mx-auto">
          <div className="w-16 h-16 bg-sky-50 text-[#00aeef] rounded-2xl mx-auto flex items-center justify-center">
            <FontAwesomeIcon icon={faBookOpen} className="h-8 w-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {searchQuery ? "No matching courses found" : "No enrolled courses in this category"}
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              {searchQuery
                ? `No courses matched "${searchQuery}". Try a different keyword or reset your filters.`
                : "Explore our comprehensive catalog to find courses in stock trading, securities regulation, financial modeling, and more."}
            </p>
          </div>
          <div className="pt-2">
            {searchQuery ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearchQuery("")}
                className="rounded-xl text-xs font-semibold"
              >
                Clear Search Filter
              </Button>
            ) : (
              <Button
                onClick={() => navigate("/courses")}
                className="bg-[#00aeef] text-white hover:bg-[#0098d4] rounded-xl text-xs font-bold px-6 h-10 shadow-md"
              >
                <FontAwesomeIcon icon={faCompass} className="mr-2" />
                Browse Course Catalog
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCourses.map((course) => {
            const isCompleted = course.status === "completed";

            return (
              <div
                key={course.id}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col md:flex-row items-start md:items-center gap-5"
              >
                {/* Course Thumbnail */}
                <div 
                  onClick={() => navigate(`/courses/${course.id}`)}
                  className="w-full md:w-52 aspect-video rounded-xl overflow-hidden bg-slate-100 shrink-0 cursor-pointer relative group border border-slate-200/60"
                >
                  <img
                    src={course.thumbnail_url || getFallbackImage(course.id)}
                    alt={course.title}
                    className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.src = getFallbackImage(course.id);
                    }}
                  />
                  <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-slate-900/30 transition-colors flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-white/90 text-[#00aeef] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <FontAwesomeIcon icon={isCompleted ? faRotateRight : faPlay} className="h-4 w-4 ml-0.5" />
                    </div>
                  </div>
                </div>

                {/* Course Metadata */}
                <div className="flex-1 min-w-0 space-y-3 w-full">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#00aeef] bg-sky-50 border border-sky-100 px-2.5 py-0.5 rounded-full">
                      {course.category}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full capitalize">
                      {course.level}
                    </span>
                    {isCompleted ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                        <FontAwesomeIcon icon={faCircleCheck} className="text-emerald-500" />
                        Completed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">
                        <FontAwesomeIcon icon={faClock} className="text-amber-500" />
                        In Progress
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 
                      onClick={() => navigate(`/courses/${course.id}`)}
                      className="font-bold text-base text-slate-900 hover:text-[#00aeef] cursor-pointer transition-colors line-clamp-1"
                    >
                      {course.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                      <span className="flex items-center gap-1.5">
                        <FontAwesomeIcon icon={faBookOpen} className="text-slate-400 text-xs" />
                        {course.completedLessons} of {course.totalLessons} modules finished
                      </span>
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-medium">Course Progress</span>
                      <span className="font-bold text-slate-800">{course.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          isCompleted ? "bg-emerald-500" : "bg-[#00aeef]"
                        }`}
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Right Action Button */}
                <div className="shrink-0 w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 flex md:flex-col gap-2 justify-end">
                  {isCompleted ? (
                    <Button
                      onClick={() => navigate(`/courses/${course.id}`)}
                      className="w-full md:w-36 bg-slate-900 text-white hover:bg-slate-800 rounded-xl font-bold text-xs h-9 shadow-sm flex items-center justify-center gap-2"
                    >
                      <FontAwesomeIcon icon={faRotateRight} className="text-xs text-[#00aeef]" />
                      Review Course
                    </Button>
                  ) : (
                    <Button
                      onClick={() => navigate(`/courses/${course.id}`)}
                      className="w-full md:w-36 bg-[#00aeef] text-white hover:bg-[#0098d4] rounded-xl font-bold text-xs h-9 shadow-md flex items-center justify-center gap-2"
                    >
                      <FontAwesomeIcon icon={faPlay} className="text-xs" />
                      Continue
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedAiCourse({ id: course.id, title: course.title, isEnrolled: true })}
                    className="w-full md:w-36 rounded-xl border-sky-200 bg-sky-50/70 hover:bg-sky-100/90 text-[#00aeef] hover:text-[#008cc0] font-bold text-xs h-9 flex items-center justify-center gap-1.5 transition-all shadow-xs"
                  >
                    <FontAwesomeIcon icon={faWandMagicSparkles} className="text-xs text-[#00aeef]" />
                    AI Summary
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* AI Summary Window */}
      <CourseAiSummaryModal
        isOpen={!!selectedAiCourse}
        onClose={() => setSelectedAiCourse(null)}
        courseId={selectedAiCourse?.id ?? null}
        courseTitle={selectedAiCourse?.title}
        isEnrolled={selectedAiCourse?.isEnrolled}
      />
    </div>
  );
};

export default MyCourses;
