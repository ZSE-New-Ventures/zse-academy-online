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
  faCog,
  faUser,
  faBars,
  faXmark,
  faSpinner,
  faHistory,
  faHeart
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
          handleLogout(); // Automatically clear session and navigate
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

  // No derived stats needed anymore, using real API data.

  return (
    <div className="min-h-screen bg-background font-montserrat">
      {/* Mobile Header */}
      <header className="lg:hidden bg-white border-b border-border px-4 py-3 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobileSidebar}
              className="p-2"
            >
              <FontAwesomeIcon 
                icon={mobileSidebarOpen ? faXmark : faBars} 
                className="h-5 w-5 text-foreground" 
              />
            </Button>
            <img
              src={logo}
              alt="ZSE Academy"
              className="h-12 w-auto object-contain"
            />
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHomeModal(true)}
                className="text-xs"
              >
                <FontAwesomeIcon icon={faHome} className="mr-1 h-3 w-3" />
                Home
              </Button>
              <div className="h-8 w-8 bg-[#1c1d1f] text-white rounded-full flex items-center justify-center font-bold text-xs uppercase shrink-0">
                {user?.name?.charAt(0) || 'U'}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed left-0 top-0 h-full bg-white border-r border-border z-40 transition-all duration-300
        ${sidebarCollapsed ? "w-16" : "w-64"}
        ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        <div className="p-4 h-full flex flex-col">
          {/* Desktop Logo & Toggle */}
          <div className="hidden lg:flex items-center justify-between mb-8">
            <img
              src={logo}
              alt="ZSE Academy"
              className={sidebarCollapsed ? "h-8 w-auto mx-auto object-contain" : "h-14 w-auto object-contain"}
            />
          </div>

          {/* Mobile Header in Sidebar */}
          <div className="lg:hidden flex items-center justify-between mb-6 pb-4 border-b border-border">
            <div className="flex items-center space-x-3">
              <img
                src={logo}
                alt="ZSE Academy"
                className="h-12 w-auto object-contain"
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobileSidebar}
              className="p-2"
            >
              <FontAwesomeIcon icon={faXmark} className="h-5 w-5 text-foreground" />
            </Button>
          </div>

          <nav className="space-y-2 flex-1">
            {sidebarItems.map((item, index) => (
              <button
                key={index}
                onClick={() => handleSectionChange(item.key)}
                className={`w-full flex items-center space-x-3 px-2 py-3 rounded-lg transition-colors ${
                  activeSection === item.key
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <FontAwesomeIcon icon={item.icon} className="h-5 w-5 flex-shrink-0" />
                {(!sidebarCollapsed || mobileSidebarOpen) && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
              </button>
            ))}
          </nav>

          <div className="mt-auto pt-4 border-t border-border">
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <FontAwesomeIcon icon={faRightFromBracket} className="h-5 w-5 flex-shrink-0" />
              {(!sidebarCollapsed || mobileSidebarOpen) && (
                <span className="text-sm font-medium">Logout</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`
        transition-all duration-300 
        ${sidebarCollapsed ? "lg:ml-16" : "lg:ml-64"}
        ${mobileSidebarOpen ? "lg:ml-64" : ""}
      `}>
        {/* Desktop Header */}
        <header className="hidden lg:block bg-white border-b border-border px-6 py-4 sticky top-0 z-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="hidden lg:flex"
              >
                <FontAwesomeIcon 
                  icon={faChevronRight} 
                  className={`h-4 w-4 transition-transform ${sidebarCollapsed ? "" : "rotate-180"}`} 
                />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-secondary">
                  {sidebarItems.find(item => item.key === activeSection)?.label}
                </h1>
                <p className="text-muted-foreground">
                  Manage your {sidebarItems.find(item => item.key === activeSection)?.label.toLowerCase()}
                </p>
              </div>
            </div>

            {/* Right Side Header Items */}
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => setShowHomeModal(true)}
                className="border-primary text-primary hover:bg-primary/10 transition-colors"
              >
                <FontAwesomeIcon icon={faHome} className="mr-2" />
                Go Back Home
              </Button>
              
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <FontAwesomeIcon icon={faRightFromBracket} className="mr-2" />
                Logout
              </Button>

              <div className="h-10 w-10 bg-[#1c1d1f] text-white rounded-full flex items-center justify-center font-bold text-sm uppercase shrink-0 shadow-sm">
                {user?.name?.charAt(0) || 'U'}
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Page Title */}
        <div className="lg:hidden bg-white border-b border-border px-4 py-3">
          <div>
            <h1 className="text-xl font-bold text-secondary">
              {sidebarItems.find(item => item.key === activeSection)?.label}
            </h1>
            <p className="text-muted-foreground text-sm">
              Manage your {sidebarItems.find(item => item.key === activeSection)?.label.toLowerCase()}
            </p>
          </div>
        </div>

        {/* Dashboard Content */}
        <main className="p-4 lg:p-6 bg-gradient-to-br from-muted/30 via-background to-accent/20 min-h-screen">
          {activeSection === "dashboard" && (
            <div className="space-y-6 lg:space-y-8">
              {/* Welcome Section / Continue Learning */}
              {continueLearningData ? (
                <div className="relative overflow-hidden bg-gradient-to-r from-primary via-primary/90 to-secondary rounded-md lg:rounded-lg p-6 lg:p-8 text-white flex flex-col md:flex-row items-center gap-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 backdrop-blur-sm"></div>
                  <div className="relative z-10 flex-1">
                    <h2 className="text-xl lg:text-3xl font-bold mb-2">Jump Back In! 🚀</h2>
                    <p className="text-primary-foreground/80 text-sm lg:text-lg mb-4">
                      You were learning <strong>{continueLearningData.title}</strong>
                    </p>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <Button onClick={() => navigate(continueLearningData.next_lesson_url)} className="bg-white text-primary hover:bg-gray-100 font-bold px-8">
                        Continue to {continueLearningData.last_accessed_module}
                      </Button>
                      <div className="text-sm font-semibold opacity-90">
                        {continueLearningData.progress_percentage}% Complete
                      </div>
                    </div>
                  </div>
                  {continueLearningData.thumbnail_url && (
                    <div className="relative z-10 hidden md:block w-48 aspect-video rounded-lg overflow-hidden border-2 border-white/20 shadow-xl">
                      <img src={continueLearningData.thumbnail_url} alt="Course" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full pointer-events-none"></div>
                  <div className="absolute -left-5 -bottom-5 w-32 h-32 bg-white/5 rounded-full pointer-events-none"></div>
                </div>
              ) : (
                <div className="relative overflow-hidden bg-gradient-to-r from-primary via-primary/90 to-secondary rounded-md lg:rounded-lg p-6 lg:p-8 text-white">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 backdrop-blur-sm"></div>
                  <div className="relative z-10">
                    <h2 className="text-xl lg:text-3xl font-bold mb-2">Welcome back, {user?.name}! 🎯</h2>
                    <p className="text-primary-foreground/80 text-sm lg:text-lg mb-4">
                      Ready to continue your financial education journey?
                    </p>
                  </div>
                  <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full pointer-events-none"></div>
                  <div className="absolute -left-5 -bottom-5 w-32 h-32 bg-white/5 rounded-full pointer-events-none"></div>
                </div>
              )}

              {/* Stats Grid */}
              {loading ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
                  {[...Array(4)].map((_, index) => (
                    <div key={index} className="bg-card rounded-md lg:rounded-md p-4 lg:p-6 border border-border/50 animate-pulse">
                      <div className="flex items-start justify-between mb-3">
                        <div className="p-2 lg:p-3 bg-muted rounded-lg lg:rounded-md">
                          <div className="h-4 w-4 lg:h-6 lg:w-6 bg-muted-foreground/20 rounded"></div>
                        </div>
                        <div className="h-6 lg:h-8 w-12 bg-muted-foreground/20 rounded"></div>
                      </div>
                      <div className="h-4 w-24 bg-muted-foreground/20 rounded mb-2"></div>
                      <div className="h-3 w-20 bg-muted-foreground/20 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="bg-destructive/10 border-destructive/20 rounded-md p-6 text-center">
                  <FontAwesomeIcon icon={faSpinner} className="h-8 w-8 text-destructive mb-2" />
                  <h3 className="font-semibold text-destructive mb-2">Failed to load statistics</h3>
                  <p className="text-destructive/80 text-sm mb-4">{error}</p>
                  <Button onClick={retryFetchStats} variant="outline" className="border-destructive text-destructive">
                    <FontAwesomeIcon icon={faSpinner} className="h-4 w-4 mr-2" />
                    Retry
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
                  {/* Total Courses Card */}
                  <div className="group relative bg-gradient-to-br from-card via-card to-accent/30 rounded-md lg:rounded-md p-4 lg:p-6 border border-border/50 shadow-sm hover:shadow-sm transition-all duration-300  overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-3 lg:mb-4">
                        <div className="p-2 lg:p-3 bg-primary/10 rounded-lg lg:rounded-md group-hover:bg-primary/20 transition-colors duration-300">
                          <FontAwesomeIcon icon={faBook} className="h-4 w-4 lg:h-6 lg:w-6 text-primary" />
                        </div>
                        <div className="text-right">
                          <p className="text-xl lg:text-3xl font-bold text-primary mb-1">
                            {stats?.total_enrolled_courses || 0}
                          </p>
                          <p className="text-xs text-muted-foreground">Enrolled courses</p>
                        </div>
                      </div>
                      <h3 className="font-semibold text-foreground text-sm lg:text-base mb-1">Total Courses</h3>
                      <p className="text-xs lg:text-sm text-muted-foreground">Your learning journey</p>
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-12 h-12 lg:w-20 lg:h-20 bg-primary/5 rounded-full group-hover:scale-110 transition-transform duration-300"></div>
                  </div>

                  {/* Completed Courses Card */}
                  <div className="group relative bg-gradient-to-br from-card via-card to-success/10 rounded-md lg:rounded-md p-4 lg:p-6 border border-border/50 shadow-sm hover:shadow-sm transition-all duration-300  overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-success/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-3 lg:mb-4">
                        <div className="p-2 lg:p-3 bg-success/10 rounded-lg lg:rounded-md group-hover:bg-success/20 transition-colors duration-300">
                          <FontAwesomeIcon icon={faGraduationCap} className="h-4 w-4 lg:h-6 lg:w-6 text-success" />
                        </div>
                        <div className="text-right">
                          <p className="text-xl lg:text-3xl font-bold text-success mb-1">
                            {stats?.total_completed_courses || 0}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {stats?.total_enrolled_courses ? `${Math.round(((stats?.total_completed_courses || 0) / stats.total_enrolled_courses) * 100)}% completion` : "0% completion"}
                          </p>
                        </div>
                      </div>
                      <h3 className="font-semibold text-foreground text-sm lg:text-base mb-1">Completed</h3>
                      <p className="text-xs lg:text-sm text-muted-foreground">Finished courses</p>
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-12 h-12 lg:w-20 lg:h-20 bg-success/5 rounded-full group-hover:scale-110 transition-transform duration-300"></div>
                  </div>

                  {/* Average Quiz Score Card */}
                  <div className="group relative bg-gradient-to-br from-card via-card to-orange-500/10 rounded-md lg:rounded-md p-4 lg:p-6 border border-border/50 shadow-sm hover:shadow-sm transition-all duration-300  overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-3 lg:mb-4">
                        <div className="p-2 lg:p-3 bg-orange-500/10 rounded-lg lg:rounded-md group-hover:bg-orange-500/20 transition-colors duration-300">
                          <FontAwesomeIcon icon={faChartColumn} className="h-4 w-4 lg:h-6 lg:w-6 text-orange-500" />
                        </div>
                        <div className="text-right">
                          <p className="text-xl lg:text-3xl font-bold text-orange-500 mb-1">
                            {stats?.average_quiz_score ? `${stats.average_quiz_score}%` : "0%"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {stats?.total_quiz_attempts || 0} quizzes taken
                          </p>
                        </div>
                      </div>
                      <h3 className="font-semibold text-foreground text-sm lg:text-base mb-1">Avg. Quiz Score</h3>
                      <p className="text-xs lg:text-sm text-muted-foreground">Across all attempts</p>
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-12 h-12 lg:w-20 lg:h-20 bg-orange-500/5 rounded-full group-hover:scale-110 transition-transform duration-300"></div>
                  </div>

                  {/* Completed Modules Card */}
                  <div className="group relative bg-gradient-to-br from-card via-card to-purple-500/10 rounded-md lg:rounded-md p-4 lg:p-6 border border-border/50 shadow-sm hover:shadow-sm transition-all duration-300  overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-3 lg:mb-4">
                        <div className="p-2 lg:p-3 bg-purple-500/10 rounded-lg lg:rounded-md group-hover:bg-purple-500/20 transition-colors duration-300">
                          <FontAwesomeIcon icon={faArrowTrendUp} className="h-4 w-4 lg:h-6 lg:w-6 text-purple-500" />
                        </div>
                        <div className="text-right">
                          <p className="text-xl lg:text-3xl font-bold text-purple-500 mb-1">
                            {stats?.total_completed_modules || 0}
                          </p>
                          <p className="text-xs text-muted-foreground">modules done</p>
                        </div>
                      </div>
                      <h3 className="font-semibold text-foreground text-sm lg:text-base mb-1">Completed Modules</h3>
                      <p className="text-xs lg:text-sm text-muted-foreground">Overall progress</p>
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-12 h-12 lg:w-20 lg:h-20 bg-purple-500/5 rounded-full group-hover:scale-110 transition-transform duration-300"></div>
                  </div>
                </div>
              )}



              {/* Learning Goals Section */}
              <div className="bg-gradient-to-br from-card via-card to-accent/20 rounded-md lg:rounded-lg p-4 lg:p-6 border border-border/50 shadow-sm">
                <h3 className="text-lg lg:text-xl font-bold text-foreground mb-4 flex items-center">
                  <div className="w-6 h-6 lg:w-8 lg:h-8 bg-orange-500/10 rounded-lg flex items-center justify-center mr-3">
                    <FontAwesomeIcon icon={faChartColumn} className="h-3 w-3 lg:h-4 lg:w-4 text-orange-500" />
                  </div>
                  Learning Goals
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                  {/* Dynamic Course Goal */}
                    <div className="p-3 lg:p-4 bg-gradient-to-r from-orange-500/5 to-transparent rounded-md border border-orange-500/10">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-foreground text-sm lg:text-base">Course Completion Goal</span>
                        <span className="text-xs lg:text-sm text-orange-500 font-bold">
                          {stats?.total_completed_courses || 0}/{stats?.goal_target_courses || 5}
                        </span>
                      </div>
                      <div className="w-full bg-orange-500/10 rounded-full h-2 mb-1">
                        <div 
                          className="bg-orange-500 h-2 rounded-full" 
                          style={{width: stats?.goal_target_courses ? `${Math.min(((stats?.total_completed_courses || 0) / stats.goal_target_courses) * 100, 100)}%` : '0%'}}
                        ></div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {Math.max(0, (stats?.goal_target_courses || 5) - (stats?.total_completed_courses || 0))} courses remaining to hit your target!
                      </p>
                    </div>

                    {/* Dynamic Quiz Goal */}
                    <div className="p-3 lg:p-4 bg-gradient-to-r from-purple-500/5 to-transparent rounded-md border border-purple-500/10">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-foreground text-sm lg:text-base">Quiz Mastery Goal</span>
                        <span className="text-xs lg:text-sm text-purple-500 font-bold">
                          {stats?.total_quiz_attempts || 0}/{stats?.goal_target_quizzes || 15}
                        </span>
                      </div>
                      <div className="w-full bg-purple-500/10 rounded-full h-2 mb-1">
                        <div 
                          className="bg-purple-500 h-2 rounded-full" 
                          style={{width: stats?.goal_target_quizzes ? `${Math.min(((stats?.total_quiz_attempts || 0) / stats.goal_target_quizzes) * 100, 100)}%` : '0%'}}
                        ></div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {Math.max(0, (stats?.goal_target_quizzes || 15) - (stats?.total_quiz_attempts || 0))} more quizzes to reach your goal
                      </p>
                    </div>
                </div>
              </div>
            </div>
          )}
          
          {activeSection === "courses" && <MyCourses />}

          {activeSection === "activity" && <RecentActivityTab />}
          
          {activeSection === "wishlist" && <WishlistTab />}

          {activeSection === "profile" && <Profile />}
        </main>
      </div>

      {/* Home Navigation Modal */}
      <Dialog open={showHomeModal} onOpenChange={setShowHomeModal}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle>Return to Home</DialogTitle>
            <DialogDescription>
              Would you like to log out before returning to the home page, or stay logged in?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4 sm:justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setShowHomeModal(false);
                navigate("/");
              }}
            >
              Go back without logout
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setShowHomeModal(false);
                handleLogout();
              }}
            >
              Logout and go back
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
