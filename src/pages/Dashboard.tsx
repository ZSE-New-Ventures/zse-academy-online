import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowTrendUp,
  faChevronRight,
  faRightFromBracket,
  faHome,
  faBook,
  faGraduationCap,
  faChartColumn,
  faUser,
  faBars,
  faXmark,
  faSpinner,
  faHistory,
  faHeart,
  faAward,
  faPlay,
  faRotateRight,
  faCircleCheck,
  faCompass,
  faArrowRight,
  faBookOpen,
  faStar,
  faArrowUpRightFromSquare,
  faRocket,
  faTrophy,
  faBullseye
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import MyCourses from "./dashboard/MyCourses";
import RecentActivityTab from "./dashboard/RecentActivityTab";
import WishlistTab from "./dashboard/WishlistTab";
import Certificates from "./dashboard/Certificates";
import Profile from "./dashboard/Profile";
import logo from "../assets/logo.png";
import { API_BASE_URL } from "@/constants/api";

interface UserStats {
  total_enrolled_courses: number;
  total_reviews_written: number;
  total_quiz_attempts: number;
  average_quiz_score: number;
  total_completed_courses: number;
  total_completed_modules: number;
  total_blog_comments: number;
  goal_target_courses: number;
  goal_target_quizzes: number;
}

interface ActivityItem {
  id: string | number;
  type: "quiz" | "course" | "review" | string;
  title: string;
  subtitle: string;
  created_at: string;
}

interface ContinueLearning {
  course_id: number;
  title: string;
  thumbnail_url: string;
  progress_percentage: number;
  last_accessed_module: string;
  next_lesson_url: string;
}

const sidebarItems = [
  { icon: faHome, label: "Dashboard", key: "dashboard" },
  { icon: faBook, label: "My Courses", key: "courses" },
  { icon: faAward, label: "Certificates", key: "certificates" },
  { icon: faHistory, label: "Recent Activity", key: "activity" },
  { icon: faHeart, label: "Wishlist", key: "wishlist" },
  { icon: faUser, label: "Profile", key: "profile" }
];

const Dashboard = () => {
  const { user, logout, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showHomeModal, setShowHomeModal] = useState(false);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [continueLearningData, setContinueLearningData] = useState<ContinueLearning | null>(null);

  // Redirect admin users to admin dashboard
  useEffect(() => {
    if (!authLoading && user?.role === "admin") {
      navigate("/admin", { replace: true });
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (activeSection === "dashboard") {
      fetchUserStats();
    }
  }, [activeSection]);

  const fetchUserStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("zse_training_token");

      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`${API_BASE_URL}/user/stats`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          handleLogout();
          return;
        }
        throw new Error(`Failed to fetch stats: ${response.status}`);
      }

      const data = await response.json();
      setStats(data);

      // Fetch Recent Activity
      try {
        const actRes = await fetch(`${API_BASE_URL}/user/activity`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json",
          },
        });
        if (actRes.ok) {
          const actData = await actRes.json();
          setActivity(actData);
        }
      } catch (e) {
        console.error("Error fetching activity:", e);
      }

      // Fetch Continue Learning
      try {
        const contRes = await fetch(`${API_BASE_URL}/user/continue-learning`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json",
          },
        });
        if (contRes.status === 200) {
          const contData = await contRes.json();
          setContinueLearningData(contData);
        } else if (contRes.status === 204) {
          setContinueLearningData(null);
        }
      } catch (e) {
        console.error("Error fetching continue learning:", e);
      }

    } catch (err: any) {
      console.error("Error fetching user stats:", err);
      setError(err.message || "Failed to load user statistics");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
    setMobileSidebarOpen(false);
  };

  const toggleMobileSidebar = () => {
    setMobileSidebarOpen(!mobileSidebarOpen);
  };

  const retryFetchStats = () => {
    fetchUserStats();
  };

  const progressPercentage = continueLearningData
    ? Math.round(Number(continueLearningData.progress_percentage || 0))
    : 0;
  const isContinueCourseCompleted = progressPercentage >= 100;

  return (
    <div className="min-h-screen bg-slate-50/60 font-montserrat">
      {/* Mobile Header */}
      <header className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-50 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobileSidebar}
              className="p-2 text-slate-700 hover:bg-slate-100"
            >
              <FontAwesomeIcon 
                icon={mobileSidebarOpen ? faXmark : faBars} 
                className="h-5 w-5" 
              />
            </Button>
            <img
              src={logo}
              alt="ZSE Training Institute"
              className="h-10 w-auto object-contain"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHomeModal(true)}
              className="text-xs h-8 border-slate-200 text-slate-700"
            >
              <FontAwesomeIcon icon={faHome} className="mr-1 h-3 w-3 text-[#00aeef]" />
              Home
            </Button>
            <div className="h-8 w-8 bg-[#0b1324] text-[#00aeef] rounded-full flex items-center justify-center font-bold text-xs uppercase shrink-0 shadow-sm">
              {user?.name?.charAt(0) || 'U'}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed left-0 top-0 h-full bg-white border-r border-slate-200/80 z-40 transition-all duration-300 shadow-sm flex flex-col
        ${sidebarCollapsed ? "w-20" : "w-64"}
        ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        <div className="p-5 h-full flex flex-col justify-between">
          <div>
            {/* Desktop Brand Logo */}
            <div className="hidden lg:flex flex-col items-center justify-center pb-6 mb-4 border-b border-slate-100">
              <img
                src={logo}
                alt="ZSE Training Institute"
                className={sidebarCollapsed ? "h-9 w-auto object-contain" : "h-14 w-auto object-contain"}
              />
              {!sidebarCollapsed && (
                <div className="mt-2 text-[10px] uppercase font-bold tracking-widest text-[#00aeef] bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-100">
                  Training Institute
                </div>
              )}
            </div>

            {/* Mobile Header in Sidebar */}
            <div className="lg:hidden flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <div className="flex flex-col">
                <img
                  src={logo}
                  alt="ZSE Training Institute"
                  className="h-10 w-auto object-contain"
                />
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#00aeef] mt-1">
                  Learner Dashboard
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMobileSidebar}
                className="p-2 text-slate-500 hover:text-slate-800"
              >
                <FontAwesomeIcon icon={faXmark} className="h-5 w-5" />
              </Button>
            </div>

            {/* Navigation links */}
            <nav className="space-y-1.5">
              {sidebarItems.map((item) => {
                const isActive = activeSection === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => handleSectionChange(item.key)}
                    className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl font-medium text-sm transition-all ${
                      isActive
                        ? "bg-[#00aeef] text-white shadow-sm font-semibold"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                    }`}
                    title={sidebarCollapsed ? item.label : undefined}
                  >
                    <FontAwesomeIcon 
                      icon={item.icon} 
                      className={`h-4 w-4 flex-shrink-0 ${isActive ? "text-white" : "text-slate-400"}`} 
                    />
                    {(!sidebarCollapsed || mobileSidebarOpen) && (
                      <span className="truncate">{item.label}</span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* User profile snippet & logout */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            {!sidebarCollapsed && (
              <div className="flex items-center space-x-3 px-2 py-2 bg-slate-50 rounded-xl border border-slate-100">
                <div className="h-9 w-9 rounded-full bg-[#0b1324] text-[#00aeef] flex items-center justify-center font-bold text-xs uppercase shrink-0 shadow-sm">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900 truncate">{user?.name || "Learner"}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user?.email || "Signed In"}</p>
                </div>
              </div>
            )}

            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors font-medium text-sm"
              title={sidebarCollapsed ? "Logout" : undefined}
            >
              <FontAwesomeIcon icon={faRightFromBracket} className="h-4 w-4 flex-shrink-0" />
              {(!sidebarCollapsed || mobileSidebarOpen) && (
                <span>Logout</span>
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`
        transition-all duration-300 flex flex-col min-h-screen
        ${sidebarCollapsed ? "lg:ml-20" : "lg:ml-64"}
        ${mobileSidebarOpen ? "lg:ml-64" : ""}
      `}>
        {/* Desktop Header */}
        <header className="hidden lg:block bg-white border-b border-slate-200/80 px-8 py-4 sticky top-0 z-30 shadow-sm backdrop-blur-md bg-white/95">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="text-slate-500 hover:text-slate-800 hover:bg-slate-100 p-2 rounded-lg"
                title="Toggle sidebar"
              >
                <FontAwesomeIcon 
                  icon={faChevronRight} 
                  className={`h-4 w-4 transition-transform duration-200 ${sidebarCollapsed ? "" : "rotate-180"}`} 
                />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  {sidebarItems.find(item => item.key === activeSection)?.label}
                </h1>
                <p className="text-xs text-slate-500">
                  Welcome to your ZSE Training Institute learner portal
                </p>
              </div>
            </div>

            {/* Right Side Header Items */}
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHomeModal(true)}
                className="border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-[#00aeef] transition-colors rounded-xl text-xs font-semibold h-9 px-4"
              >
                <FontAwesomeIcon icon={faHome} className="mr-2 text-[#00aeef]" />
                Public Website
                <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="ml-2 text-[10px] text-slate-400" />
              </Button>

              <div className="h-5 w-px bg-slate-200 mx-1"></div>

              <div className="flex items-center space-x-3 pl-1">
                <div className="h-9 w-9 bg-[#0b1324] text-[#00aeef] rounded-full flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div className="hidden xl:block text-left">
                  <p className="text-xs font-bold text-slate-800 leading-tight">{user?.name || "Learner"}</p>
                  <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">Learner</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Body */}
        <main className="p-4 lg:p-8 flex-1">
          {activeSection === "dashboard" && (
            <div className="space-y-6 lg:space-y-8 max-w-7xl mx-auto">
              {/* Hero Banner: Continue Learning / Welcome */}
              {continueLearningData ? (
                isContinueCourseCompleted ? (
                  // Course Completed Banner
                  <div className="relative overflow-hidden bg-gradient-to-br from-[#0b1324] via-[#0f2347] to-[#00aeef]/90 rounded-2xl p-6 lg:p-8 text-white shadow-xl border border-white/10 flex flex-col md:flex-row items-center gap-6">
                    <div className="relative z-10 flex-1">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-semibold mb-3">
                        <FontAwesomeIcon icon={faCircleCheck} className="text-emerald-400" />
                        Course Completed • 100% Complete
                      </div>
                      <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight mb-2 flex items-center gap-2">
                        <span>Congratulations on Finishing!</span>
                        <FontAwesomeIcon icon={faTrophy} className="text-amber-400 text-xl" />
                      </h2>
                      <p className="text-slate-200 text-sm lg:text-base leading-relaxed mb-6 max-w-xl">
                        You have successfully completed <strong>{continueLearningData.title}</strong>. Revisit course modules anytime or claim your verified certificate.
                      </p>
                      <div className="flex flex-wrap items-center gap-3">
                        <Button
                          onClick={() => navigate(continueLearningData.next_lesson_url)}
                          className="bg-white text-[#0b1324] hover:bg-slate-100 font-bold px-6 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2"
                        >
                          <FontAwesomeIcon icon={faRotateRight} className="text-[#00aeef]" />
                          Review Course Material
                        </Button>
                        <Button
                          onClick={() => handleSectionChange("certificates")}
                          className="bg-[#00aeef] text-white hover:bg-[#0098d4] font-bold px-6 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2"
                        >
                          <FontAwesomeIcon icon={faAward} />
                          View My Certificates
                        </Button>
                      </div>
                    </div>
                    {continueLearningData.thumbnail_url && (
                      <div className="relative z-10 hidden md:block w-52 aspect-video rounded-xl overflow-hidden border-2 border-white/20 shadow-2xl shrink-0">
                        <img 
                          src={continueLearningData.thumbnail_url} 
                          alt={continueLearningData.title} 
                          className="w-full h-full object-cover object-top" 
                        />
                      </div>
                    )}
                    <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/5 rounded-full pointer-events-none blur-xl"></div>
                    <div className="absolute -left-8 -bottom-8 w-40 h-40 bg-[#00aeef]/10 rounded-full pointer-events-none blur-xl"></div>
                  </div>
                ) : (
                  // Course In Progress Banner
                  <div className="relative overflow-hidden bg-gradient-to-br from-[#0b1324] via-[#0f2347] to-[#00aeef]/90 rounded-2xl p-6 lg:p-8 text-white shadow-xl border border-white/10 flex flex-col md:flex-row items-center gap-6">
                    <div className="relative z-10 flex-1">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 backdrop-blur-md text-white border border-white/20 rounded-full text-xs font-semibold mb-3">
                        <FontAwesomeIcon icon={faPlay} className="text-[#00aeef] text-[10px]" />
                        In Progress • {progressPercentage}% Complete
                      </div>
                      <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight mb-2 flex items-center gap-2">
                        <span>Jump Back In!</span>
                        <FontAwesomeIcon icon={faRocket} className="text-[#00aeef] text-xl" />
                      </h2>
                      <p className="text-slate-200 text-sm lg:text-base leading-relaxed mb-6 max-w-xl">
                        You were learning <strong>{continueLearningData.title}</strong>. Ready to pick up your next module?
                      </p>
                      <div className="flex flex-wrap items-center gap-4">
                        <Button
                          onClick={() => navigate(continueLearningData.next_lesson_url)}
                          className="bg-[#00aeef] text-white hover:bg-[#0098d4] font-bold px-6 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2"
                        >
                          <FontAwesomeIcon icon={faPlay} className="text-xs" />
                          Continue: {continueLearningData.last_accessed_module && continueLearningData.last_accessed_module !== 'Completed' ? continueLearningData.last_accessed_module : 'Next Lesson'}
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => handleSectionChange("courses")}
                          className="text-white hover:bg-white/10 font-semibold px-4 rounded-xl"
                        >
                          View All Courses →
                        </Button>
                      </div>
                    </div>
                    {continueLearningData.thumbnail_url && (
                      <div className="relative z-10 hidden md:block w-52 aspect-video rounded-xl overflow-hidden border-2 border-white/20 shadow-2xl shrink-0">
                        <img 
                          src={continueLearningData.thumbnail_url} 
                          alt={continueLearningData.title} 
                          className="w-full h-full object-cover object-top" 
                        />
                      </div>
                    )}
                    <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/5 rounded-full pointer-events-none blur-xl"></div>
                    <div className="absolute -left-8 -bottom-8 w-40 h-40 bg-[#00aeef]/10 rounded-full pointer-events-none blur-xl"></div>
                  </div>
                )
              ) : (
                // General Welcome Banner
                <div className="relative overflow-hidden bg-gradient-to-br from-[#0b1324] via-[#0f2347] to-[#00aeef]/85 rounded-2xl p-6 lg:p-8 text-white shadow-xl border border-white/10">
                  <div className="relative z-10 max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 backdrop-blur-md text-white border border-white/20 rounded-full text-xs font-semibold mb-3">
                      <FontAwesomeIcon icon={faGraduationCap} className="text-[#00aeef]" />
                      Zimbabwe Stock Exchange Training Institute
                    </div>
                    <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight mb-2 flex items-center gap-2">
                      <span>Welcome back, {user?.name || 'Learner'}!</span>
                      <FontAwesomeIcon icon={faBullseye} className="text-[#00aeef] text-xl" />
                    </h2>
                    <p className="text-slate-200 text-sm lg:text-base leading-relaxed mb-6">
                      Advance your capital markets expertise with self-paced courses, interactive quizzes, and verified professional certifications.
                    </p>
                    <div className="flex flex-wrap items-center gap-3">
                      <Button
                        onClick={() => navigate("/courses")}
                        className="bg-[#00aeef] text-white hover:bg-[#0098d4] font-bold px-6 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2"
                      >
                        <FontAwesomeIcon icon={faCompass} />
                        Explore Course Catalog
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleSectionChange("courses")}
                        className="bg-transparent border-white/30 text-white hover:bg-white/10 font-semibold px-5 rounded-xl"
                      >
                        My Enrolled Courses
                      </Button>
                    </div>
                  </div>
                  <div className="absolute -right-12 -top-12 w-52 h-52 bg-white/5 rounded-full pointer-events-none blur-xl"></div>
                  <div className="absolute -left-8 -bottom-8 w-40 h-40 bg-[#00aeef]/10 rounded-full pointer-events-none blur-xl"></div>
                </div>
              )}

              {/* Stats Grid */}
              {loading ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                  {[...Array(4)].map((_, index) => (
                    <div key={index} className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm animate-pulse space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="w-10 h-10 bg-slate-100 rounded-xl"></div>
                        <div className="h-6 w-12 bg-slate-100 rounded"></div>
                      </div>
                      <div className="h-4 w-24 bg-slate-100 rounded"></div>
                      <div className="h-3 w-16 bg-slate-100 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center">
                  <FontAwesomeIcon icon={faSpinner} className="h-8 w-8 text-rose-500 mb-2" />
                  <h3 className="font-bold text-rose-900 mb-1">Failed to load statistics</h3>
                  <p className="text-rose-700 text-sm mb-4">{error}</p>
                  <Button onClick={retryFetchStats} variant="outline" className="border-rose-300 text-rose-700 hover:bg-rose-100">
                    <FontAwesomeIcon icon={faSpinner} className="h-4 w-4 mr-2" />
                    Retry
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                  {/* Total Courses Card */}
                  <div 
                    onClick={() => handleSectionChange("courses")}
                    className="cursor-pointer bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-[#00aeef]/40 transition-all duration-200 group relative overflow-hidden"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-12 h-12 bg-sky-50 text-[#00aeef] rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                        <FontAwesomeIcon icon={faBook} className="h-5 w-5" />
                      </div>
                      <div className="text-right">
                        <p className="text-2xl lg:text-3xl font-extrabold text-slate-900">
                          {stats?.total_enrolled_courses || 0}
                        </p>
                        <span className="text-[11px] font-semibold text-[#00aeef]">Enrolled</span>
                      </div>
                    </div>
                    <h3 className="font-bold text-slate-800 text-sm mb-0.5">Total Courses</h3>
                    <p className="text-xs text-slate-500">Your active learning journey</p>
                  </div>

                  {/* Completed Courses Card */}
                  <div 
                    onClick={() => handleSectionChange("courses")}
                    className="cursor-pointer bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-emerald-500/40 transition-all duration-200 group relative overflow-hidden"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                        <FontAwesomeIcon icon={faGraduationCap} className="h-5 w-5" />
                      </div>
                      <div className="text-right">
                        <p className="text-2xl lg:text-3xl font-extrabold text-slate-900">
                          {stats?.total_completed_courses || 0}
                        </p>
                        <span className="text-[11px] font-semibold text-emerald-600">
                          {stats?.total_enrolled_courses 
                            ? `${Math.round(((stats?.total_completed_courses || 0) / stats.total_enrolled_courses) * 100)}% rate` 
                            : "0% rate"}
                        </span>
                      </div>
                    </div>
                    <h3 className="font-bold text-slate-800 text-sm mb-0.5">Completed</h3>
                    <p className="text-xs text-slate-500">Courses finished with honor</p>
                  </div>

                  {/* Average Quiz Score Card */}
                  <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-amber-500/40 transition-all duration-200 group relative overflow-hidden">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                        <FontAwesomeIcon icon={faChartColumn} className="h-5 w-5" />
                      </div>
                      <div className="text-right">
                        <p className="text-2xl lg:text-3xl font-extrabold text-slate-900">
                          {stats?.average_quiz_score ? `${Math.round(Number(stats.average_quiz_score))}%` : "0%"}
                        </p>
                        <span className="text-[11px] font-semibold text-amber-600">
                          {stats?.total_quiz_attempts || 0} attempts
                        </span>
                      </div>
                    </div>
                    <h3 className="font-bold text-slate-800 text-sm mb-0.5">Avg. Quiz Score</h3>
                    <p className="text-xs text-slate-500">Across all tests & assessments</p>
                  </div>

                  {/* Completed Modules Card */}
                  <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-indigo-500/40 transition-all duration-200 group relative overflow-hidden">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                        <FontAwesomeIcon icon={faArrowTrendUp} className="h-5 w-5" />
                      </div>
                      <div className="text-right">
                        <p className="text-2xl lg:text-3xl font-extrabold text-slate-900">
                          {stats?.total_completed_modules || 0}
                        </p>
                        <span className="text-[11px] font-semibold text-indigo-600">Lessons done</span>
                      </div>
                    </div>
                    <h3 className="font-bold text-slate-800 text-sm mb-0.5">Modules Finished</h3>
                    <p className="text-xs text-slate-500">Continuous progress milestones</p>
                  </div>
                </div>
              )}

              {/* Learning Goals Section */}
              <div className="bg-white rounded-2xl p-6 lg:p-8 border border-slate-200/80 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                      <FontAwesomeIcon icon={faChartColumn} className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Learning Goals & Mastery</h3>
                      <p className="text-xs text-slate-500">Track your personal benchmarks for career development</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Course Goal */}
                  <div className="p-5 bg-slate-50/70 rounded-xl border border-slate-100 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-slate-800 text-sm">Course Completion Benchmark</span>
                        <span className="text-xs font-bold text-[#00aeef] bg-sky-50 px-2 py-0.5 rounded-full border border-sky-100">
                          {stats?.total_completed_courses || 0} / {stats?.goal_target_courses || 5} Courses
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2.5 mb-2 overflow-hidden">
                        <div 
                          className="bg-[#00aeef] h-2.5 rounded-full transition-all duration-500" 
                          style={{width: `${Math.min(((stats?.total_completed_courses || 0) / (stats?.goal_target_courses || 5)) * 100, 100)}%`}}
                        ></div>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      {Math.max(0, (stats?.goal_target_courses || 5) - (stats?.total_completed_courses || 0))} more course(s) to hit your completion milestone!
                    </p>
                  </div>

                  {/* Quiz Goal */}
                  <div className="p-5 bg-slate-50/70 rounded-xl border border-slate-100 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-slate-800 text-sm">Quiz Mastery Goal</span>
                        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                          {stats?.total_quiz_attempts || 0} / {stats?.goal_target_quizzes || 15} Quizzes
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2.5 mb-2 overflow-hidden">
                        <div 
                          className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500" 
                          style={{width: `${Math.min(((stats?.total_quiz_attempts || 0) / (stats?.goal_target_quizzes || 15)) * 100, 100)}%`}}
                        ></div>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      {Math.max(0, (stats?.goal_target_quizzes || 15) - (stats?.total_quiz_attempts || 0))} quizzes remaining to attain full mastery certification.
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Navigation Cards & Recent Activity Preview */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Quick Shortcuts */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 mb-1">Quick Shortcuts</h3>
                    <p className="text-xs text-slate-500 mb-4">Fast paths to key areas</p>
                    <div className="space-y-2.5">
                      <button
                        onClick={() => navigate("/courses")}
                        className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-sky-50/80 hover:text-[#00aeef] transition-colors text-left text-xs font-semibold text-slate-700"
                      >
                        <span className="flex items-center gap-2.5">
                          <FontAwesomeIcon icon={faCompass} className="text-[#00aeef]" />
                          Browse Course Catalog
                        </span>
                        <FontAwesomeIcon icon={faChevronRight} className="text-[10px] text-slate-400" />
                      </button>

                      <button
                        onClick={() => handleSectionChange("certificates")}
                        className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-emerald-50/80 hover:text-emerald-700 transition-colors text-left text-xs font-semibold text-slate-700"
                      >
                        <span className="flex items-center gap-2.5">
                          <FontAwesomeIcon icon={faAward} className="text-emerald-600" />
                          View My Certificates
                        </span>
                        <FontAwesomeIcon icon={faChevronRight} className="text-[10px] text-slate-400" />
                      </button>

                      <button
                        onClick={() => handleSectionChange("wishlist")}
                        className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-rose-50/80 hover:text-rose-600 transition-colors text-left text-xs font-semibold text-slate-700"
                      >
                        <span className="flex items-center gap-2.5">
                          <FontAwesomeIcon icon={faHeart} className="text-rose-500" />
                          Saved Wishlist
                        </span>
                        <FontAwesomeIcon icon={faChevronRight} className="text-[10px] text-slate-400" />
                      </button>

                      <button
                        onClick={() => handleSectionChange("profile")}
                        className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-indigo-50/80 hover:text-indigo-600 transition-colors text-left text-xs font-semibold text-slate-700"
                      >
                        <span className="flex items-center gap-2.5">
                          <FontAwesomeIcon icon={faUser} className="text-indigo-500" />
                          Profile & Account
                        </span>
                        <FontAwesomeIcon icon={faChevronRight} className="text-[10px] text-slate-400" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Recent Activity Feed */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-slate-900 mb-0.5">Recent Activity</h3>
                        <p className="text-xs text-slate-500">Your latest actions across the academy</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSectionChange("activity")}
                        className="text-xs font-semibold text-[#00aeef] hover:text-[#0098d4] hover:bg-sky-50"
                      >
                        View Full History →
                      </Button>
                    </div>

                    {activity && activity.length > 0 ? (
                      <div className="space-y-3">
                        {activity.slice(0, 3).map((item) => (
                          <div 
                            key={item.id} 
                            className="flex items-center justify-between p-3.5 bg-slate-50/70 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors"
                          >
                            <div className="flex items-center space-x-3 min-w-0">
                              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                                item.type === 'quiz' ? 'bg-amber-100/70 text-amber-700' :
                                item.type === 'course' ? 'bg-sky-100/70 text-[#00aeef]' :
                                'bg-emerald-100/70 text-emerald-700'
                              }`}>
                                <FontAwesomeIcon 
                                  icon={item.type === 'quiz' ? faChartColumn : item.type === 'course' ? faBookOpen : faStar} 
                                  className="h-4 w-4" 
                                />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-slate-800 truncate">{item.title}</p>
                                <p className="text-[11px] text-slate-500 truncate">{item.subtitle}</p>
                              </div>
                            </div>
                            <span className="text-[11px] font-medium text-slate-400 shrink-0 ml-3">
                              {new Date(item.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-slate-400">
                        <FontAwesomeIcon icon={faHistory} className="h-8 w-8 mb-2 opacity-50" />
                        <p className="text-xs">No recent actions recorded yet. Start exploring courses!</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === "courses" && <MyCourses />}

          {activeSection === "certificates" && <Certificates />}

          {activeSection === "activity" && <RecentActivityTab />}

          {activeSection === "wishlist" && <WishlistTab />}

          {activeSection === "profile" && <Profile />}
        </main>
      </div>

      {/* Home Navigation Modal */}
      <Dialog open={showHomeModal} onOpenChange={setShowHomeModal}>
        <DialogContent className="max-w-md bg-white rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">Return to Public Website</DialogTitle>
            <DialogDescription className="text-xs text-slate-600">
              Would you like to keep your session active, or logout before returning to the main site?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4 sm:justify-end">
            <Button
              variant="outline"
              className="rounded-xl text-xs font-semibold"
              onClick={() => {
                setShowHomeModal(false);
                navigate("/");
              }}
            >
              Stay Logged In
            </Button>
            <Button
              variant="destructive"
              className="rounded-xl text-xs font-semibold"
              onClick={() => {
                setShowHomeModal(false);
                handleLogout();
              }}
            >
              Logout & Exit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
