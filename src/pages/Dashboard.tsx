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
  faSpinner
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import MyCourses from "./dashboard/MyCourses";

import Profile from "./dashboard/Profile";
import logo from "../assets/logo.png";

const API_BASE_URL = "http://127.0.0.1:8000/api";

interface UserStats {
  total_enrolled_courses: number;
  total_reviews_written: number;
  total_quiz_attempts: number;
}

const sidebarItems = [
  { icon: faHome, label: "Dashboard", key: "dashboard" },
  { icon: faBook, label: "My Courses", key: "courses" },
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
          throw new Error("Authentication failed. Please log in again.");
        }
        throw new Error(`Failed to fetch stats: ${response.status}`);
      }

      const data = await response.json();
      setStats(data);
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

  // Calculate derived stats
  const completedCourses = Math.floor((stats?.total_enrolled_courses || 0) * 0.2); // 20% completion rate
  const studyHours = (stats?.total_quiz_attempts || 0) * 2.8; // Assuming ~2.8 hours per quiz attempt
  const learningStreak = 7; // This could come from API if available

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
          </div>
          
          <div className="flex items-center space-x-3">
            {activeSection === "dashboard" && (
              <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
                Intermediate
              </Badge>
            )}
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
        <header className="hidden lg:block bg-white border-b border-border px-6 py-4">
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
                  {activeSection === "dashboard" 
                    ? `Welcome back, ${user?.name}!` 
                    : sidebarItems.find(item => item.key === activeSection)?.label
                  }
                </h1>
                <p className="text-muted-foreground">
                  {activeSection === "dashboard" 
                    ? "Continue your financial education journey"
                    : `Manage your ${sidebarItems.find(item => item.key === activeSection)?.label.toLowerCase()}`
                  }
                </p>
              </div>
            </div>
            {activeSection === "dashboard" && (
              <div className="flex items-center space-x-4">
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  Intermediate Trader
                </Badge>
              </div>
            )}
          </div>
        </header>

        {/* Mobile Page Title */}
        <div className="lg:hidden bg-white border-b border-border px-4 py-3">
          <div>
            <h1 className="text-xl font-bold text-secondary">
              {activeSection === "dashboard" 
                ? `Welcome, ${user?.name}!` 
                : sidebarItems.find(item => item.key === activeSection)?.label
              }
            </h1>
            <p className="text-muted-foreground text-sm">
              {activeSection === "dashboard" 
                ? "Continue your learning journey"
                : `Manage your ${sidebarItems.find(item => item.key === activeSection)?.label.toLowerCase()}`
              }
            </p>
          </div>
        </div>

        {/* Dashboard Content */}
        <main className="p-4 lg:p-6 bg-gradient-to-br from-muted/30 via-background to-accent/20 min-h-screen">
          {activeSection === "dashboard" && (
            <div className="space-y-6 lg:space-y-8">
              {/* Welcome Section */}
              <div className="relative overflow-hidden bg-gradient-to-r from-primary via-primary/90 to-secondary rounded-md lg:rounded-lg p-6 lg:p-8 text-white">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 backdrop-blur-sm"></div>
                <div className="relative z-10">
                  <h2 className="text-xl lg:text-3xl font-bold mb-2">Welcome back, {user?.name}! 🎯</h2>
                  <p className="text-primary-foreground/80 text-sm lg:text-lg mb-4">
                    Ready to continue your financial education journey?
                  </p>
                  
                </div>
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full"></div>
                <div className="absolute -left-5 -bottom-5 w-32 h-32 bg-white/5 rounded-full"></div>
              </div>

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
                            {completedCourses}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {stats?.total_enrolled_courses ? `${Math.round((completedCourses / stats.total_enrolled_courses) * 100)}% completion` : "0% completion"}
                          </p>
                        </div>
                      </div>
                      <h3 className="font-semibold text-foreground text-sm lg:text-base mb-1">Completed</h3>
                      <p className="text-xs lg:text-sm text-muted-foreground">Finished courses</p>
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-12 h-12 lg:w-20 lg:h-20 bg-success/5 rounded-full group-hover:scale-110 transition-transform duration-300"></div>
                  </div>

                  {/* Study Hours Card */}
                  <div className="group relative bg-gradient-to-br from-card via-card to-orange-500/10 rounded-md lg:rounded-md p-4 lg:p-6 border border-border/50 shadow-sm hover:shadow-sm transition-all duration-300  overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-3 lg:mb-4">
                        <div className="p-2 lg:p-3 bg-orange-500/10 rounded-lg lg:rounded-md group-hover:bg-orange-500/20 transition-colors duration-300">
                          <FontAwesomeIcon icon={faChartColumn} className="h-4 w-4 lg:h-6 lg:w-6 text-orange-500" />
                        </div>
                        <div className="text-right">
                          <p className="text-xl lg:text-3xl font-bold text-orange-500 mb-1">
                            {stats?.total_quiz_attempts || 0}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {stats?.total_quiz_attempts || 0} quizzes
                          </p>
                        </div>
                      </div>
                      <h3 className="font-semibold text-foreground text-sm lg:text-base mb-1">Quiz Attempts</h3>
                      <p className="text-xs lg:text-sm text-muted-foreground">Total quiz attempts</p>
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-12 h-12 lg:w-20 lg:h-20 bg-orange-500/5 rounded-full group-hover:scale-110 transition-transform duration-300"></div>
                  </div>

                  {/* Learning Streak Card */}
                  <div className="group relative bg-gradient-to-br from-card via-card to-purple-500/10 rounded-md lg:rounded-md p-4 lg:p-6 border border-border/50 shadow-sm hover:shadow-sm transition-all duration-300  overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-3 lg:mb-4">
                        <div className="p-2 lg:p-3 bg-purple-500/10 rounded-lg lg:rounded-md group-hover:bg-purple-500/20 transition-colors duration-300">
                          <FontAwesomeIcon icon={faArrowTrendUp} className="h-4 w-4 lg:h-6 lg:w-6 text-purple-500" />
                        </div>
                        <div className="text-right">
                          <p className="text-xl lg:text-3xl font-bold text-purple-500 mb-1">
                            {learningStreak}
                          </p>
                          <p className="text-xs text-muted-foreground">days in a row</p>
                        </div>
                      </div>
                      <h3 className="font-semibold text-foreground text-sm lg:text-base mb-1">Learning Streak</h3>
                      <p className="text-xs lg:text-sm text-muted-foreground">Current streak</p>
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-12 h-12 lg:w-20 lg:h-20 bg-purple-500/5 rounded-full group-hover:scale-110 transition-transform duration-300"></div>
                  </div>
                </div>
              )}



              {/* Recent Activity Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                <div className="bg-gradient-to-br from-card via-card to-muted/20 rounded-md lg:rounded-lg p-4 lg:p-6 border border-border/50 shadow-sm">
                  <h3 className="text-lg lg:text-xl font-bold text-foreground mb-4 flex items-center">
                    <div className="w-6 h-6 lg:w-8 lg:h-8 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                      <FontAwesomeIcon icon={faArrowTrendUp} className="h-3 w-3 lg:h-4 lg:w-4 text-primary" />
                    </div>
                    Recent Activity
                  </h3>
                  <div className="space-y-3 lg:space-y-4">
                    <div className="flex items-center p-3 bg-gradient-to-r from-primary/5 to-transparent rounded-md border border-primary/10">
                      <div className="w-8 h-8 lg:w-10 lg:h-10 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                        <FontAwesomeIcon icon={faGraduationCap} className="h-4 w-4 lg:h-5 lg:w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground text-sm lg:text-base truncate">Quiz Completed</p>
                        <p className="text-xs lg:text-sm text-muted-foreground truncate">{stats?.total_quiz_attempts || 0} total attempts</p>
                      </div>
                    </div>
                    <div className="flex items-center p-3 bg-gradient-to-r from-success/5 to-transparent rounded-md border border-success/10">
                      <div className="w-8 h-8 lg:w-10 lg:h-10 bg-success/10 rounded-lg flex items-center justify-center mr-3">
                        <FontAwesomeIcon icon={faBook} className="h-4 w-4 lg:h-5 lg:w-5 text-success" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground text-sm lg:text-base truncate">Course Progress</p>
                        <p className="text-xs lg:text-sm text-muted-foreground truncate">{stats?.total_enrolled_courses || 0} enrolled courses</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-card via-card to-accent/20 rounded-md lg:rounded-lg p-4 lg:p-6 border border-border/50 shadow-sm">
                  <h3 className="text-lg lg:text-xl font-bold text-foreground mb-4 flex items-center">
                    <div className="w-6 h-6 lg:w-8 lg:h-8 bg-orange-500/10 rounded-lg flex items-center justify-center mr-3">
                      <FontAwesomeIcon icon={faChartColumn} className="h-3 w-3 lg:h-4 lg:w-4 text-orange-500" />
                    </div>
                    Learning Goals
                  </h3>
                  <div className="space-y-3 lg:space-y-4">
                    <div className="p-3 lg:p-4 bg-gradient-to-r from-orange-500/5 to-transparent rounded-md border border-orange-500/10">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-foreground text-sm lg:text-base">Course Completion</span>
                        <span className="text-xs lg:text-sm text-orange-500 font-bold">
                          {completedCourses}/{stats?.total_enrolled_courses || 0}
                        </span>
                      </div>
                      <div className="w-full bg-orange-500/10 rounded-full h-2 mb-1">
                        <div 
                          className="bg-orange-500 h-2 rounded-full" 
                          style={{width: stats?.total_enrolled_courses ? `${(completedCourses / stats.total_enrolled_courses) * 100}%` : '0%'}}
                        ></div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {stats?.total_enrolled_courses ? stats.total_enrolled_courses - completedCourses : 0} courses remaining
                      </p>
                    </div>
                    <div className="p-3 lg:p-4 bg-gradient-to-r from-purple-500/5 to-transparent rounded-md border border-purple-500/10">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-foreground text-sm lg:text-base">Quiz Mastery</span>
                        <span className="text-xs lg:text-sm text-purple-500 font-bold">
                          {stats?.total_quiz_attempts || 0} attempts
                        </span>
                      </div>
                      <div className="w-full bg-purple-500/10 rounded-full h-2 mb-1">
                        <div 
                          className="bg-purple-500 h-2 rounded-full" 
                          style={{width: stats?.total_quiz_attempts ? `${Math.min((stats.total_quiz_attempts / 20) * 100, 100)}%` : '0%'}}
                        ></div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {Math.max(0, 20 - (stats?.total_quiz_attempts || 0))} more for expert level
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeSection === "courses" && <MyCourses />}

          {activeSection === "profile" && <Profile />}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
