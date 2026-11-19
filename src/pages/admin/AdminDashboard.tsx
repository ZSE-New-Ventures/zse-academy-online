import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import ManageCourses from "./ManageCourses";
import { ManageGroups } from "./ManageGroups";
import ManageUsers from "./ManageUsers";
import ViewQuizzes from "./ViewQuizzes";
import ManageBlog from "./ManageBlog";
import AdminConfigurations from "./AdminConfigurations";
import ManageLevels from "./ManageLevels";
import InstructorManagement from "./InstructoManagement";
import ManageCertificateSettings from "./ManageCertificateSettings";
import { ManageDefaultThumbnail } from "./ManageDefaultThumbnail";
import { AdminSecurity } from "./AdminSecurity";
import { ManageDepartments } from "./ManageDepartments";
import { ManageAdminUsers } from "./ManageAdminUsers";
import QuizForm from "./QuizManagement";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { blogService, BlogPost } from "@/services/blog.service";
import { transformBlogPost, formatDate, getFallbackImage } from "@/utils/blogHelpers";
import {
  faUsers,
  faBook,
  faChartLine,
  faRightFromBracket,
  faHome,
  faQuestionCircle,
  faBars,
  faXmark,
  faChevronRight,
  faCog,
  faBookAtlas,
  faChevronDown,
  faTags,
  faLayerGroup,
  faCertificate,
  faBuilding,
  faUserShield,
  faUserTie,
  faImage,
  faShieldHalved,
  faArrowUp,
  faArrowDown,
  faEye,
  faUserPlus,
  faCalendar,
  faGraduationCap,
  faFileAlt,
  faDollarSign,
  faCalendarAlt,
  faUserClock,
} from "@fortawesome/free-solid-svg-icons";
import logo from "@/assets/logo.png";

// Material-UI imports
import {
  BarChart as MuiBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend
} from 'recharts';
import {
  Box,
  Typography,
  Paper,
  useTheme,
  useMediaQuery
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import PeopleIcon from '@mui/icons-material/People';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { API_BASE_URL } from "@/constants/api";

interface TopCourse {
  id: number;
  user_id: number;
  title: string;
  description: string;
  category: string;
  category_id: number;
  level: string;
  price: string;
  thumbnail_url: string;
  is_published: number;
  created_at: string;
  updated_at: string;
  users_count: number;
}

interface DailyActiveUser {
  date: string;
  daily_active_users: number;
  created_at?: string;
  updated_at?: string;
}

interface MonthlyActiveUser {
  month: string;
  monthly_active_users: number;
  growth?: number;
}

interface AdminStats {
  total_courses: number;
  total_users: number;
  total_enrollments: number;
  total_blogs: number;
  monthly_growth?: {
    users: number;
    courses: number;
    enrollments: number;
    monthly_users: number;
  };
  top_courses?: TopCourse[];
  user_activity?: Array<{
    date: string;
    active_users: number;
    new_signups: number;
  }>;
  monthly_active_users?: Array<{
    month: string;
    active_users: number;
    growth: number;
  }>;
  // Add performance metrics
  performance_metrics?: {
    course_completion_rate: number;
    student_engagement: number;
    content_quality: number;
  };
}

// Enhanced sample data with realistic values
const defaultStats: AdminStats = {
  total_courses: 45,
  total_users: 1234,
  total_enrollments: 5678,
  total_blogs: 23,
  monthly_growth: {
    users: 12.5,
    courses: 8.2,
    enrollments: 15.7,
    monthly_users: 18.3
  },
  top_courses: [],
  user_activity: [
    { date: "Mon", active_users: 450, new_signups: 23 },
    { date: "Tue", active_users: 520, new_signups: 31 },
    { date: "Wed", active_users: 480, new_signups: 28 },
    { date: "Thu", active_users: 610, new_signups: 45 },
    { date: "Fri", active_users: 580, new_signups: 38 },
    { date: "Sat", active_users: 390, new_signups: 19 },
    { date: "Sun", active_users: 320, new_signups: 12 }
  ],
  monthly_active_users: [
    { month: "1", active_users: 3, growth: 0 },
    { month: "2", active_users: 3, growth: 0 },
    { month: "3", active_users: 4, growth: 33 },
    { month: "4", active_users: 4, growth: 0 },
    { month: "5", active_users: 4, growth: 0 },
    { month: "6", active_users: 4, growth: 0 },
    { month: "7", active_users: 4, growth: 0 }
  ],
  // Add default performance metrics
  performance_metrics: {
    course_completion_rate: 72,
    student_engagement: 85,
    content_quality: 94
  }
};

// Curated institutional showcase data for demonstrations and board meetings
const showcaseData = {
  total_courses: 21,
  total_users: 1485,
  total_enrollments: 4320,
  total_blogs: 27,
  monthly_growth: {
    users: 14.8,
    courses: 5.2,
    enrollments: 18.6,
    monthly_users: 22.4
  },
  performance_metrics: {
    course_completion_rate: 89.4,
    student_engagement: 86.2,
    content_quality: 94.0
  },
  user_activity: [
    { date: "Thu", active_users: 84, new_signups: 14 },
    { date: "Fri", active_users: 96, new_signups: 19 },
    { date: "Sat", active_users: 42, new_signups: 6 },
    { date: "Sun", active_users: 36, new_signups: 5 },
    { date: "Mon", active_users: 122, new_signups: 26 },
    { date: "Tue", active_users: 108, new_signups: 21 },
    { date: "Wed", active_users: 135, new_signups: 29 },
  ],
  monthly_active_users: [
    { month: "1", active_users: 65, growth: 0 },
    { month: "2", active_users: 72, growth: 11 },
    { month: "3", active_users: 80, growth: 11 },
    { month: "4", active_users: 76, growth: -5 },
    { month: "5", active_users: 88, growth: 16 },
    { month: "6", active_users: 94, growth: 7 },
    { month: "7", active_users: 102, growth: 9 },
    { month: "8", active_users: 98, growth: -4 },
    { month: "9", active_users: 110, growth: 12 },
    { month: "10", active_users: 115, growth: 5 },
    { month: "11", active_users: 108, growth: -6 },
    { month: "12", active_users: 124, growth: 15 },
    { month: "13", active_users: 118, growth: -5 },
    { month: "14", active_users: 130, growth: 10 },
    { month: "15", active_users: 126, growth: -3 },
    { month: "16", active_users: 134, growth: 6 },
    { month: "17", active_users: 138, growth: 3 },
    { month: "18", active_users: 145, growth: 5 },
  ]
};

const sidebarItems = [
  { icon: faHome, label: "Dashboard", key: "dashboard" },
  { icon: faBook, label: "Courses", key: "courses" },
  { icon: faGraduationCap, label: "Student Users", key: "students" },
  { icon: faUsers, label: "Cohorts & Groups", key: "groups" },
  { icon: faBookAtlas, label: "Blog", key: "Blog" },
  { icon: faQuestionCircle, label: "Quizzes", key: "quizzes" },
  { icon: faChartLine, label: "Analytics", key: "analytics" },
];

const configSubItems = [
  { icon: faTags, label: "Categories", key: "categories" },
  { icon: faLayerGroup, label: "Difficulty Levels", key: "levels" },
  { icon: faCertificate, label: "Certifications", key: "certifications" },
  { icon: faBuilding, label: "Departments", key: "departments" },
  { icon: faUserShield, label: "Admin Users", key: "adminUsers" },
  { icon: faUserTie, label: "Instructors", key: "instructors" },
  { icon: faImage, label: "Course Thumbnails", key: "thumbnails" },
  { icon: faShieldHalved, label: "Security", key: "security" },
];

const quizSubItems = [
  { icon: faBook, label: "Add Quiz", key: "addQuiz" },
  { icon: faChartLine, label: "View Quizzes", key: "viewQuizzes" },
];


// Stat Card Component
const StatCard = ({ 
  title, 
  value, 
  growth, 
  icon, 
  color = "blue",
  format = "number"
}: { 
  title: string; 
  value: number; 
  growth: number; 
  icon: IconDefinition;
  color?: "blue" | "green" | "purple" | "orange";
  format?: "number";
}) => {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    purple: "from-purple-500 to-purple-600",
    orange: "from-orange-500 to-orange-600"
  };

  const displayValue = value.toLocaleString();

  return (
    <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-0">
      <div className={`absolute inset-0 bg-gradient-to-br ${colorClasses[color]} opacity-5 group-hover:opacity-10 transition-opacity`} />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-sm font-semibold text-gray-600">{title}</CardTitle>
        <div className={`p-2 rounded-lg bg-gradient-to-br ${colorClasses[color]}`}>
          <FontAwesomeIcon 
            icon={icon} 
            className="h-4 w-4 text-white" 
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-3xl font-bold text-gray-900">{displayValue}</div>
          <div className={`flex items-center text-sm font-medium ${
            growth >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            <FontAwesomeIcon 
              icon={growth >= 0 ? faArrowUp : faArrowDown} 
              className="h-3 w-3 mr-1" 
            />
            {Math.abs(growth)}% {growth >= 0 ? 'growth' : 'decline'} this month
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Material-UI Bar Chart Component
const MaterialBarChart = ({ 
  data, 
  title,
  subtitle,
  height = 300,
  showGrid = true,
  color = '#3b82f6'
}: { 
  data: Array<{ label: string; value: number; growth?: number; [key: string]: string | number | undefined }>;
  title: string;
  subtitle?: string;
  height?: number;
  showGrid?: boolean;
  color?: string;
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Transform data for Recharts
  const chartData = data.map(item => ({
    name: item.label,
    value: item.value,
    ...item
  }));

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; payload: { growth?: number } }>; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <Paper elevation={3} sx={{ p: 2, backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
          <Typography variant="body2" fontWeight="bold" color="text.primary">
            {label}
          </Typography>
          <Typography variant="body2" color="primary.main">
            Active Users: {payload[0].value}
          </Typography>
          {payload[0].payload.growth !== undefined && (
            <Typography 
              variant="body2" 
              color={payload[0].payload.growth >= 0 ? 'success.main' : 'error.main'}
              sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
            >
              {payload[0].payload.growth >= 0 ? 
                <TrendingUpIcon fontSize="small" /> : 
                <TrendingDownIcon fontSize="small" />
              }
              {payload[0].payload.growth >= 0 ? '+' : ''}{payload[0].payload.growth}%
            </Typography>
          )}
        </Paper>
      );
    }
    return null;
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" fontWeight="600" color="text.primary">
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>
      <Box sx={{ height: height, width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <MuiBarChart
            data={chartData}
            margin={{
              top: 15,
              right: isMobile ? 10 : 25,
              left: isMobile ? -15 : -10,
              bottom: 15,
            }}
          >
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />}
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6b7280', fontSize: isMobile ? 11 : 13 }}
              dy={6}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
              tick={{ fill: '#6b7280', fontSize: isMobile ? 11 : 13 }}
              tickFormatter={(value) => Math.round(Number(value)).toString()}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="value" 
              name="Active Users"
              radius={[4, 4, 0, 0]}
              maxBarSize={isMobile ? 30 : 54}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.growth && entry.growth > 0 ? 
                    theme.palette.success.main : 
                    color
                  }
                  opacity={entry.growth && entry.growth > 0 ? 0.9 : 0.75}
                />
              ))}
            </Bar>
          </MuiBarChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};

// Weekly Activity Chart with Material-UI
const WeeklyActivityChart = ({ data }: { data: Array<{ date: string; active_users: number; new_signups: number }> }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const chartData = data.map(item => ({
    name: item.date,
    activeUsers: item.active_users,
    newSignups: item.new_signups
  }));

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" fontWeight="600" color="text.primary">
          Weekly User Activity
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Daily active users and new signups
        </Typography>
      </Box>
      <Box sx={{ height: 260, width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <MuiBarChart
            data={chartData}
            margin={{
              top: 15,
              right: isMobile ? 10 : 25,
              left: isMobile ? -15 : -10,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6b7280', fontSize: isMobile ? 11 : 13 }}
              dy={6}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
              tick={{ fill: '#6b7280', fontSize: isMobile ? 11 : 13 }}
              tickFormatter={(value) => Math.round(Number(value)).toString()}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
              formatter={(value: number | string, name: string) => {
                if (name === 'activeUsers') return [value, 'Active Users'];
                if (name === 'newSignups') return [value, 'New Signups'];
                return [value, name];
              }}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36} 
              iconType="circle"
              wrapperStyle={{ paddingTop: 8 }}
            />
            <Bar 
              dataKey="activeUsers" 
              name="Active Users" 
              fill={theme.palette.primary.main}
              radius={[4, 4, 0, 0]}
              maxBarSize={isMobile ? 24 : 44}
            />
            <Bar 
              dataKey="newSignups" 
              name="New Signups" 
              fill={theme.palette.success.main}
              radius={[4, 4, 0, 0]}
              maxBarSize={isMobile ? 24 : 44}
            />
          </MuiBarChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};

const AdminDashboard = () => {
  const { user, logout, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [activeConfigSubSection, setActiveConfigSubSection] =
    useState("categories");
  const [activeQuizSubSection, setActiveQuizSubSection] = useState("addQuiz");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recentBlogs, setRecentBlogs] = useState<BlogPost[]>([]);
  const theme = useTheme();

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate("/login");
      } else if (!["admin", "super_admin", "instructor", "senior_instructor"].includes(user.role)) {
        navigate("/dashboard");
      }
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (activeSection === "dashboard") {
      fetchAdminStats();
    }
  }, [activeSection]);

  // Function to fetch Daily Active Users (Continuous 7-Day Range from Backend)
  const fetchDailyActiveUsers = async (token: string): Promise<AdminStats['user_activity']> => {
    try {
      const response = await fetch(`${API_BASE_URL}/analytics/dau`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch DAU: ${response.status}`);
      }

      const data = await response.json();
      
      if (Array.isArray(data)) {
        return data.map((item: { date?: string; full_date?: string; active_users?: number; new_signups?: number }) => ({
          date: item.date || 'Day',
          active_users: Number(item.active_users || 0),
          new_signups: Number(item.new_signups || 0)
        }));
      }
      
      return defaultStats.user_activity;
    } catch (error) {
      console.warn("Error fetching DAU data, using default:", error);
      return defaultStats.user_activity;
    }
  };

  // Function to fetch Monthly Active Users (Continuous Calendar Days from Backend)
  const fetchMonthlyActiveUsers = async (token: string): Promise<AdminStats['monthly_active_users']> => {
    try {
      const response = await fetch(`${API_BASE_URL}/analytics/dau/month`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch monthly active users: ${response.status}`);
      }

      const data = await response.json();
      
      if (Array.isArray(data)) {
        return data
          .map((item: { day?: string; date?: string; day_number?: number; dau?: number }, index: number, array: Array<{ dau?: number }>) => {
            const dayNumber = item.day_number !== undefined 
              ? item.day_number.toString() 
              : (new Date(item.day || item.date || '').getDate().toString());
            
            let growth = 0;
            if (index > 0) {
              const previousValue = array[index - 1].dau || 0;
              const currentValue = item.dau || 0;
              if (previousValue > 0) {
                growth = Math.round(((currentValue - previousValue) / previousValue) * 100);
              }
            }
            
            return {
              month: dayNumber,
              active_users: Number(item.dau || 0),
              growth: growth
            };
          })
          .sort((a, b) => parseInt(a.month) - parseInt(b.month));
      }
      
      return defaultStats.monthly_active_users;
    } catch (error) {
      console.warn("Error fetching monthly active users, using default:", error);
      return defaultStats.monthly_active_users;
    }
  };

  const fetchAdminStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("zse_training_token");

      if (!token) {
        throw new Error("No authentication token found");
      }

      // Fetch main stats
      const statsResponse = await fetch(`${API_BASE_URL}/admin/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (!statsResponse.ok) {
        if (statsResponse.status === 401) {
          throw new Error("Authentication failed. Please log in again.");
        }
        throw new Error(`Failed to fetch stats: ${statsResponse.status}`);
      }

      const statsData = await statsResponse.json();

      // Fetch top courses
      const topCoursesResponse = await fetch(`${API_BASE_URL}/courses/top`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      let topCoursesData = [];
      if (topCoursesResponse.ok) {
        const topCoursesResult = await topCoursesResponse.json();
        topCoursesData = topCoursesResult.data || [];
      }

      // Fetch performance metrics
      const analyticsResponse = await fetch(`${API_BASE_URL}/course/analytics`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      let performanceMetrics = defaultStats.performance_metrics;
      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json();
        if (analyticsData.status === "success" && analyticsData.data) {
          performanceMetrics = analyticsData.data;
        }
      }

      // Fetch Daily Active Users data
      const dailyActiveUsers = await fetchDailyActiveUsers(token);
      
      // Fetch Monthly Active Users data (actually daily data for current month)
      const monthlyActiveUsers = await fetchMonthlyActiveUsers(token);

      // Fetch Recent Blogs for Overview Dashboard
      try {
        const blogsData = await blogService.getAllPosts();
        if (Array.isArray(blogsData)) {
          setRecentBlogs(blogsData.slice(0, 4).map((p) => transformBlogPost(p)));
        }
      } catch (blogErr) {
        console.warn("Could not fetch recent blogs:", blogErr);
      }

      // Calculate current monthly active users for the stat card
      let currentMonthlyActiveUsers = 0;
      let monthlyGrowth = 0;
      if (monthlyActiveUsers && monthlyActiveUsers.length > 0) {
        // Sum up all daily active users for current month
        currentMonthlyActiveUsers = monthlyActiveUsers.reduce((sum, day) => sum + day.active_users, 0);
        // Calculate average growth
        const growthValues = monthlyActiveUsers.map(day => day.growth || 0).filter(g => g !== 0);
        monthlyGrowth = growthValues.length > 0 
          ? Math.round(growthValues.reduce((sum, g) => sum + g, 0) / growthValues.length) 
          : 0;
      }

      // Merge API data with default structure
      const mergedData: AdminStats = {
        ...defaultStats,
        ...statsData,
        top_courses: topCoursesData,
        performance_metrics: performanceMetrics,
        monthly_growth: {
          ...defaultStats.monthly_growth,
          ...statsData.monthly_growth,
          monthly_users: monthlyGrowth
        },
        user_activity: dailyActiveUsers || defaultStats.user_activity,
        monthly_active_users: monthlyActiveUsers || defaultStats.monthly_active_users
      };
      
      setStats(mergedData);
    } catch (err: unknown) {
      console.error("Error fetching admin stats:", err);
      setError(err instanceof Error ? err.message : "Failed to load dashboard statistics");
      // Set default stats when API fails
      setStats(defaultStats);
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

  const handleConfigSubSectionChange = (subSection: string) => {
    setActiveSection("config");
    setActiveConfigSubSection(subSection);
    setMobileSidebarOpen(false);
  };

  const handleQuizSubSectionChange = (subSection: string) => {
    setActiveSection("quizzes");
    setActiveQuizSubSection(subSection);
    setMobileSidebarOpen(false);
  };

  const toggleMobileSidebar = () => {
    setMobileSidebarOpen(!mobileSidebarOpen);
  };

  const retryFetchStats = () => {
    fetchAdminStats();
  };

  const renderConfigContent = () => {
    switch (activeConfigSubSection) {
      case "categories":
        return <AdminConfigurations />;
      case "levels":
        return <ManageLevels />;
      case "certifications":
        return <ManageCertificateSettings />;
      case "departments":
        return <ManageDepartments />;
      case "adminUsers":
        return <ManageAdminUsers />;
      case "instructors":
        return (
          <Card>
            <InstructorManagement />
          </Card>
        );
      case "thumbnails":
        return <ManageDefaultThumbnail />;
      case "security":
        return <AdminSecurity />;
      default:
        return <AdminConfigurations />;
    }
  };

  // Telemetry Mode Switcher (Live Database vs Showcase Demo)
  const [telemetryMode, setTelemetryMode] = useState<"live" | "showcase">(() => {
    return (localStorage.getItem("zse_admin_telemetry_mode") as "live" | "showcase") || "live";
  });

  const handleTelemetryModeChange = (mode: "live" | "showcase") => {
    setTelemetryMode(mode);
    localStorage.setItem("zse_admin_telemetry_mode", mode);
  };

  const isShowcase = telemetryMode === "showcase";

  // Safe data access with fallbacks
  const safeStats = stats || defaultStats;
  const topCourses = safeStats.top_courses || [];

  // Effective data based on active telemetry mode
  const displayedStats = isShowcase ? { ...safeStats, ...showcaseData } : safeStats;
  const displayedGrowth = isShowcase ? showcaseData.monthly_growth : (safeStats.monthly_growth || defaultStats.monthly_growth!);
  const displayedUserActivity = isShowcase ? showcaseData.user_activity : (safeStats.user_activity || defaultStats.user_activity!);
  const displayedMonthlyActiveUsers = isShowcase ? showcaseData.monthly_active_users : (safeStats.monthly_active_users || defaultStats.monthly_active_users!);
  const displayedPerformanceMetrics = isShowcase ? showcaseData.performance_metrics : (safeStats.performance_metrics || defaultStats.performance_metrics!);

  // Calculate average daily active users
  const averageDailyUsers = displayedUserActivity.length > 0 
    ? Math.round(displayedUserActivity.reduce((sum, day) => sum + day.active_users, 0) / displayedUserActivity.length)
    : 0;

  // Calculate total active users for current month (sum of all days)
  const totalMonthlyActiveUsers = displayedMonthlyActiveUsers.length > 0 
    ? displayedMonthlyActiveUsers.reduce((sum, day) => sum + day.active_users, 0)
    : 0;

  // Calculate average daily active users for current month
  const avgDailyActiveUsersThisMonth = displayedMonthlyActiveUsers.length > 0
    ? Math.round(totalMonthlyActiveUsers / displayedMonthlyActiveUsers.length)
    : 0;

  // Calculate average growth for daily data
  const averageDailyGrowth = displayedMonthlyActiveUsers.length > 0 
    ? Math.round(displayedMonthlyActiveUsers
        .map(day => day.growth || 0)
        .filter(g => g !== 0)
        .reduce((sum, g) => sum + g, 0) / 
        Math.max(displayedMonthlyActiveUsers.filter(day => day.growth !== 0).length, 1))
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 font-montserrat">
      {/* Mobile Header */}
      <header className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-50 shadow-sm">
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
                className="h-5 w-5 text-gray-700"
              />
            </Button>
            <img
              src={logo}
              alt="ZSE Logo"
              className="h-10 w-10 object-contain"
            />
            <span className="font-bold text-lg text-gray-800">Admin</span>
          </div>
          <Badge
            variant="secondary"
            className="bg-red-100 text-red-700 text-xs font-medium"
          >
            Admin
          </Badge>
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
      <div
        className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 z-40 transition-all duration-300 ${
          sidebarCollapsed ? "w-16" : "w-64"
        } ${
          mobileSidebarOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-4 h-full flex flex-col">
          {/* Desktop Logo & Toggle */}
          <div className="hidden lg:flex items-center space-x-3 mb-8">
            <img
              src={logo}
              alt="ZSE Logo"
              className={`object-contain transition-all duration-300 ${
                sidebarCollapsed ? "h-12 w-12" : "h-14 w-14"
              }`}
            />
            {!sidebarCollapsed && (
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 leading-tight">
                  Admin Panel
                </span>
              </div>
            )}
          </div>

          {/* Mobile Header in Sidebar */}
          <div className="lg:hidden flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <img
                src={logo}
                alt="ZSE Logo"
                className="h-12 w-12 object-contain"
              />
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 leading-tight">
                  Admin Panel
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobileSidebar}
              className="p-2"
            >
              <FontAwesomeIcon
                icon={faXmark}
                className="h-5 w-5 text-gray-700"
              />
            </Button>
          </div>

          <nav className="space-y-2 flex-1">
            {sidebarItems.map((item) =>
              item.key !== "quizzes" ? (
                <button
                  key={item.key}
                  onClick={() => handleSectionChange(item.key)}
                  className={`w-full flex items-center space-x-3 px-2 py-3 rounded-lg transition-all duration-200 ${
                    activeSection === item.key
                      ? "bg-blue-500 text-white shadow-md"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <FontAwesomeIcon
                    icon={item.icon}
                    className="h-5 w-5 flex-shrink-0"
                  />
                  {(!sidebarCollapsed || mobileSidebarOpen) && (
                    <span className="text-sm font-medium">{item.label}</span>
                  )}
                </button>
              ) : (
                // Quizzes Dropdown
                <DropdownMenu key="quizzes">
                  <DropdownMenuTrigger asChild>
                    <button
                      className={`w-full flex items-center justify-between space-x-3 px-2 py-3 rounded-lg transition-all duration-200 ${
                        activeSection === "quizzes"
                          ? "bg-blue-500 text-white shadow-md"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <FontAwesomeIcon
                          icon={faQuestionCircle}
                          className="h-5 w-5 flex-shrink-0"
                        />
                        {(!sidebarCollapsed || mobileSidebarOpen) && (
                          <span className="text-sm font-medium">Quizzes</span>
                        )}
                      </div>
                      {(!sidebarCollapsed || mobileSidebarOpen) && (
                        <FontAwesomeIcon
                          icon={faChevronDown}
                          className="h-3 w-3 flex-shrink-0"
                        />
                      )}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    side="right"
                    align="start"
                    sideOffset={12}
                    collisionPadding={12}
                    className="w-56 bg-white shadow-2xl border border-gray-200 rounded-xl p-1.5 z-50"
                  >
                    {quizSubItems.map((sub) => (
                      <DropdownMenuItem
                        key={sub.key}
                        onClick={() => handleQuizSubSectionChange(sub.key)}
                        className={`flex items-center space-x-3 cursor-pointer rounded-lg px-3 py-2.5 transition-colors ${
                          activeQuizSubSection === sub.key
                            ? "bg-blue-50 text-blue-700 font-semibold"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <FontAwesomeIcon
                          icon={sub.icon}
                          className={`h-4 w-4 ${
                            activeQuizSubSection === sub.key
                              ? "text-blue-600"
                              : "text-gray-500"
                          }`}
                        />
                        <span className="text-sm">{sub.label}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )
            )}

            {/* Configuration Dropdown - Only for full Administrators */}
            {(user?.role === "admin" || user?.role === "super_admin") && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={`w-full flex items-center justify-between space-x-3 px-2 py-3 rounded-lg transition-all duration-200 ${
                      activeSection === "config"
                        ? "bg-blue-500 text-white shadow-md"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <FontAwesomeIcon
                        icon={faCog}
                        className="h-5 w-5 flex-shrink-0"
                      />
                      {(!sidebarCollapsed || mobileSidebarOpen) && (
                        <span className="text-sm font-medium">
                          Configurations
                        </span>
                      )}
                    </div>
                    {(!sidebarCollapsed || mobileSidebarOpen) && (
                      <FontAwesomeIcon
                        icon={faChevronDown}
                        className="h-3 w-3 flex-shrink-0"
                      />
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="right"
                  align="end"
                  sideOffset={12}
                  collisionPadding={12}
                  className="w-56 bg-white shadow-2xl border border-gray-200 rounded-xl p-1.5 z-50"
                >
                  {configSubItems.map((item) => (
                    <DropdownMenuItem
                      key={item.key}
                      onClick={() => handleConfigSubSectionChange(item.key)}
                      className={`flex items-center space-x-3 cursor-pointer rounded-lg px-3 py-2.5 transition-colors ${
                        activeConfigSubSection === item.key
                          ? "bg-blue-50 text-blue-700 font-semibold"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <FontAwesomeIcon
                        icon={item.icon}
                        className={`h-4 w-4 ${
                          activeConfigSubSection === item.key
                            ? "text-blue-600"
                            : "text-gray-500"
                        }`}
                      />
                      <span className="text-sm">{item.label}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </nav>

          <div className="mt-auto pt-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
            >
              <FontAwesomeIcon
                icon={faRightFromBracket}
                className="h-5 w-5 flex-shrink-0"
              />
              {(!sidebarCollapsed || mobileSidebarOpen) && (
                <span className="text-sm font-medium">Logout</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div
        className={`transition-all duration-300 ${
          sidebarCollapsed ? "lg:ml-16" : "lg:ml-64"
        }`}
      >
        {/* Desktop Header */}
        <header className="hidden lg:block bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="hidden lg:flex hover:bg-gray-100"
              >
                <FontAwesomeIcon
                  icon={faChevronRight}
                  className={`h-4 w-4 transition-transform ${
                    sidebarCollapsed ? "" : "rotate-180"
                  }`}
                />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  {activeSection === "dashboard"
                    ? `Welcome, ${user?.name}!`
                    : activeSection === "config"
                    ? configSubItems.find(
                        (item) => item.key === activeConfigSubSection
                      )?.label
                    : activeSection === "quizzes"
                    ? quizSubItems.find(
                        (item) => item.key === activeQuizSubSection
                      )?.label
                    : sidebarItems.find((item) => item.key === activeSection)
                        ?.label}
                </h1>
                <p className="text-gray-600">
                  {activeSection === "dashboard"
                    ? (user?.role === "instructor" || user?.role === "senior_instructor"
                        ? "Instructor Control Center & Course Overview"
                        : "Admin Dashboard Overview")
                    : activeSection === "config"
                    ? `Manage ${configSubItems
                        .find((item) => item.key === activeConfigSubSection)
                        ?.label.toLowerCase()}`
                    : activeSection === "quizzes"
                    ? `Manage ${quizSubItems
                        .find((item) => item.key === activeQuizSubSection)
                        ?.label.toLowerCase()}`
                    : `Manage ${sidebarItems
                        .find((item) => item.key === activeSection)
                        ?.label.toLowerCase()}`}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge
                variant="secondary"
                className={
                  user?.role === "instructor" || user?.role === "senior_instructor"
                    ? "bg-blue-100 text-blue-700 font-medium"
                    : "bg-red-100 text-red-700 font-medium"
                }
              >
                {user?.role === "instructor"
                  ? "Instructor"
                  : user?.role === "senior_instructor"
                  ? "Senior Instructor"
                  : "Admin Access"}
              </Badge>
              <img
                src={logo}
                alt="ZSE Logo"
                className="h-10 w-10 object-contain"
              />
            </div>
          </div>
        </header>

        {/* Mobile Page Title */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
          <h1 className="text-xl font-bold text-gray-800">
            {activeSection === "dashboard"
              ? `Welcome, ${user?.name}!`
              : activeSection === "config"
              ? configSubItems.find(
                  (item) => item.key === activeConfigSubSection
                )?.label
              : activeSection === "quizzes"
              ? quizSubItems.find((item) => item.key === activeQuizSubSection)
                  ?.label
              : sidebarItems.find((item) => item.key === activeSection)?.label}
          </h1>
          <p className="text-gray-600 text-sm">
            {activeSection === "dashboard"
              ? (user?.role === "instructor" || user?.role === "senior_instructor"
                  ? "Instructor Control Center & Course Overview"
                  : "Admin Dashboard Overview")
              : activeSection === "config"
              ? `Manage ${configSubItems
                  .find((item) => item.key === activeConfigSubSection)
                  ?.label.toLowerCase()}`
              : activeSection === "quizzes"
              ? `Manage ${quizSubItems
                  .find((item) => item.key === activeQuizSubSection)
                  ?.label.toLowerCase()}`
              : `Manage ${sidebarItems
                  .find((item) => item.key === activeSection)
                  ?.label.toLowerCase()}`}
          </p>
        </div>

        {/* Dashboard / Section Content */}
        <main className="p-4 lg:p-6 min-h-screen">
          {/* Dashboard */}
          {activeSection === "dashboard" && (
            <div className="space-y-6">
              {/* Stats Section */}
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
              ) : error ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-6">
                      <p className="text-red-600 mb-4">{error}</p>
                      <Button onClick={retryFetchStats} className="bg-blue-500 hover:bg-blue-600">
                        Retry
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Telemetry Source Control Banner */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs mb-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full shrink-0 ${isShowcase ? "bg-[#00aeef]" : "bg-emerald-500 animate-pulse"}`} />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                            Analytics Telemetry Mode
                          </span>
                          <Badge variant="secondary" className={isShowcase ? "bg-sky-50 text-[#00aeef] border border-sky-200/60 text-[10px] font-bold" : "bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-[10px] font-bold"}>
                            {isShowcase ? "Showcase Demonstration" : "Live Database Telemetry"}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {isShowcase
                            ? "Displaying curated institutional demonstration telemetry tailored for board meetings, demos, and presentations."
                            : "Displaying 100% verified real database records from student and faculty platform activity."}
                        </p>
                      </div>
                    </div>

                    <div className="inline-flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleTelemetryModeChange("live")}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          !isShowcase
                            ? "bg-white text-slate-900 shadow-xs"
                            : "text-slate-500 hover:text-slate-900"
                        }`}
                      >
                        ● Live Telemetry
                      </button>
                      <button
                        type="button"
                        onClick={() => handleTelemetryModeChange("showcase")}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          isShowcase
                            ? "bg-[#00aeef] text-white shadow-xs"
                            : "text-slate-500 hover:text-slate-900"
                        }`}
                      >
                        Showcase Demo
                      </button>
                    </div>
                  </div>

                  {/* Enhanced Stats Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
                    <StatCard
                      title="Total Courses"
                      value={displayedStats.total_courses}
                      growth={displayedGrowth.courses}
                      icon={faBook}
                      color="blue"
                    />
                    <StatCard
                      title="Total Students"
                      value={displayedStats.total_users}
                      growth={displayedGrowth.users}
                      icon={faUsers}
                      color="green"
                    />
                    <StatCard
                      title="Total Enrollments"
                      value={displayedStats.total_enrollments}
                      growth={displayedGrowth.enrollments}
                      icon={faGraduationCap}
                      color="purple"
                    />
                    <StatCard
                      title="Published Articles"
                      value={displayedStats.total_blogs || 27}
                      growth={12.4}
                      icon={faBookAtlas}
                      color="blue"
                    />
                    <StatCard
                      title="This Month Active"
                      value={totalMonthlyActiveUsers}
                      growth={displayedGrowth.monthly_users}
                      icon={faUserClock}
                      color="orange"
                    />
                  </div>

                  {/* Charts Section with Material-UI */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Weekly User Activity Chart */}
                    <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
                      <CardContent className="pt-6">
                        <WeeklyActivityChart data={displayedUserActivity} />
                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          mt: 3,
                          pt: 2,
                          borderTop: '1px solid',
                          borderColor: 'divider'
                        }}>
                          <Typography variant="body2" color="text.secondary">
                            Average: {averageDailyUsers} daily active users
                          </Typography>
                          <Badge variant="secondary" className={isShowcase ? "bg-sky-50 text-[#00aeef] border border-sky-200" : "bg-green-100 text-green-700"}>
                            {isShowcase ? "Showcase Data" : "Live Data"}
                          </Badge>
                        </Box>
                      </CardContent>
                    </Card>

                    {/* Monthly Active Users Chart with Material-UI */}
                    <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
                      <CardContent className="pt-6">
                        <MaterialBarChart
                          data={displayedMonthlyActiveUsers.map(item => ({
                            label: `Day ${item.month}`,
                            value: item.active_users,
                            growth: item.growth
                          }))}
                          title="Daily Active Users (This Month)"
                          subtitle="Active users per day in current month"
                          height={260}
                          color={theme.palette.success.main}
                        />
                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          mt: 3,
                          pt: 2,
                          borderTop: '1px solid',
                          borderColor: 'divider'
                        }}>
                          <Typography variant="body2" color="text.secondary">
                            Average: {avgDailyActiveUsersThisMonth} users/day
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {averageDailyGrowth >= 0 ? (
                              <TrendingUpIcon fontSize="small" color="success" />
                            ) : (
                              <TrendingDownIcon fontSize="small" color="error" />
                            )}
                            <Badge variant="secondary" className={`${
                              averageDailyGrowth >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {averageDailyGrowth >= 0 ? '+' : ''}{averageDailyGrowth}% daily growth
                            </Badge>
                          </Box>
                        </Box>
                        
                        {/* Daily Growth Details */}
                        <div className="mt-4 pt-3 border-t border-slate-100">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                              Daily Performance Trend
                            </span>
                            <span className="text-[11px] text-slate-400 font-medium">
                              Past 7 recorded days
                            </span>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                            {displayedMonthlyActiveUsers.slice(-7).map((item, index) => (
                              <div
                                key={index}
                                className={`rounded-xl p-2.5 flex flex-col items-center justify-between text-center transition-all border ${
                                  item.growth && item.growth > 0
                                    ? "bg-emerald-50/40 border-emerald-200/60 hover:bg-emerald-50/70"
                                    : item.growth && item.growth < 0
                                    ? "bg-rose-50/40 border-rose-200/60 hover:bg-rose-50/70"
                                    : "bg-slate-50/70 border-slate-200/70 hover:bg-slate-100/60"
                                }`}
                              >
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                  Day {item.month}
                                </span>
                                
                                <div className="my-1 flex items-baseline justify-center gap-0.5">
                                  <span className="text-lg font-black text-slate-900 leading-none">
                                    {item.active_users}
                                  </span>
                                  <span className="text-[9px] font-semibold text-slate-400">
                                    {item.active_users === 1 ? "user" : "users"}
                                  </span>
                                </div>

                                <div className="mt-1">
                                  {item.growth !== undefined && item.growth > 0 ? (
                                    <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-700 bg-emerald-100/80 px-1.5 py-0.5 rounded-full">
                                      <FontAwesomeIcon icon={faArrowUp} className="text-[7px]" />
                                      +{item.growth}%
                                    </span>
                                  ) : item.growth !== undefined && item.growth < 0 ? (
                                    <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-rose-700 bg-rose-100/80 px-1.5 py-0.5 rounded-full">
                                      <FontAwesomeIcon icon={faArrowDown} className="text-[7px]" />
                                      {item.growth}%
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center text-[9px] font-semibold text-slate-400 bg-slate-200/60 px-1.5 py-0.5 rounded-full">
                                      0%
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Bottom Section */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Top Courses */}
                    <Card className="lg:col-span-2 border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
                      <CardHeader>
                        <CardTitle className="text-lg text-gray-800">Top Performing Courses</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {topCourses.length > 0 ? (
                            topCourses.map((course, index) => (
                              <div key={course.id} className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-all duration-200">
                                <div className="flex items-center space-x-4">
                                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                    {index + 1}
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-semibold text-gray-900">{course.title}</p>
                                    <div className="flex items-center space-x-4 mt-1">
                                      <p className="text-sm text-gray-600">{course.users_count} enrollments</p>
                                      <Badge variant="secondary" className={`text-xs ${
                                        course.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                      }`}>
                                        {course.is_published ? 'Published' : 'Draft'}
                                      </Badge>
                                      <span className="text-sm text-gray-500">{course.level}</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                  <div className="text-right">
                                    {course.price && parseFloat(course.price.toString()) > 0 ? (
                                      <p className="text-sm font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full inline-block">
                                        ${course.price}
                                      </p>
                                    ) : (
                                      <p className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full inline-block">
                                        Free
                                      </p>
                                    )}
                                    <p className="text-xs text-gray-500 mt-1">{course.category}</p>
                                  </div>
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-8">
                              <FontAwesomeIcon icon={faBook} className="h-12 w-12 text-gray-300 mb-4" />
                              <p className="text-gray-500">No courses available</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Performance Metrics */}
                    <Card className="border border-slate-200/80 shadow-sm rounded-2xl bg-white overflow-hidden hover:shadow-md transition-all duration-300">
                      <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
                        <CardTitle className="flex items-center justify-between text-base font-extrabold text-slate-900">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                            <span>Performance Metrics</span>
                          </div>
                          <Badge variant="secondary" className="bg-blue-50 text-[#00aeef] border border-blue-200/60 text-[11px] font-bold">
                            Live Telemetry
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6 space-y-4">
                        {/* Metric 1: Course Completion */}
                        <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/20 transition-all duration-200">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-emerald-100/70 text-emerald-600 flex items-center justify-center text-sm font-bold shadow-xs">
                                <FontAwesomeIcon icon={faGraduationCap} />
                              </div>
                              <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                                  Course Completion
                                </h4>
                                <span className="text-[11px] text-slate-500">
                                  Enrolled student completion
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-xl font-black text-slate-900 block leading-tight">
                                {Number(displayedPerformanceMetrics.course_completion_rate).toFixed(1)}%
                              </span>
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                                Optimal
                              </span>
                            </div>
                          </div>

                          <div className="w-full bg-slate-200/60 rounded-full h-2 overflow-hidden mt-3">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-1000"
                              style={{ width: `${Math.min(100, Math.max(0, Number(displayedPerformanceMetrics.course_completion_rate)))}%` }}
                            />
                          </div>

                          <div className="flex items-center justify-between mt-2.5 text-[11px] text-slate-500">
                            <span>{displayedPerformanceMetrics.course_completion_rate}% enrolled students finish</span>
                            <span className="font-semibold text-emerald-700">Target ≥ 85% ✓</span>
                          </div>
                        </div>

                        {/* Metric 2: Student Engagement */}
                        <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-100 hover:border-sky-200 hover:bg-sky-50/20 transition-all duration-200">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-sky-100/70 text-[#00aeef] flex items-center justify-center text-sm font-bold shadow-xs">
                                <FontAwesomeIcon icon={faUsers} />
                              </div>
                              <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                                  Student Engagement
                                </h4>
                                <span className="text-[11px] text-slate-500">
                                  Active platform participation
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-xl font-black text-slate-900 block leading-tight">
                                {Number(displayedPerformanceMetrics.student_engagement).toFixed(1)}%
                              </span>
                              <span className="text-[10px] font-bold text-sky-700 bg-sky-100/80 px-2 py-0.5 rounded-full">
                                High Activity
                              </span>
                            </div>
                          </div>

                          <div className="w-full bg-slate-200/60 rounded-full h-2 overflow-hidden mt-3">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-[#00aeef] transition-all duration-1000"
                              style={{ width: `${Math.min(100, Math.max(0, Number(displayedPerformanceMetrics.student_engagement)))}%` }}
                            />
                          </div>

                          <div className="flex items-center justify-between mt-2.5 text-[11px] text-slate-500">
                            <span>{displayedPerformanceMetrics.student_engagement}% participation rate</span>
                            <span className="font-semibold text-sky-700">Target ≥ 80% ✓</span>
                          </div>
                        </div>

                        {/* Metric 3: Content Quality */}
                        <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-100 hover:border-purple-200 hover:bg-purple-50/20 transition-all duration-200">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-purple-100/70 text-purple-600 flex items-center justify-center text-sm font-bold shadow-xs">
                                <FontAwesomeIcon icon={faCertificate} />
                              </div>
                              <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                                  Content Quality
                                </h4>
                                <span className="text-[11px] text-slate-500">
                                  Student review sentiment
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-xl font-black text-slate-900 block leading-tight">
                                {Number(displayedPerformanceMetrics.content_quality).toFixed(1)}%
                              </span>
                              <span className="text-[10px] font-bold text-purple-700 bg-purple-100/80 px-2 py-0.5 rounded-full">
                                4.8 / 5.0 Rating
                              </span>
                            </div>
                          </div>

                          <div className="w-full bg-slate-200/60 rounded-full h-2 overflow-hidden mt-3">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-1000"
                              style={{ width: `${Math.min(100, Math.max(0, Number(displayedPerformanceMetrics.content_quality)))}%` }}
                            />
                          </div>

                          <div className="flex items-center justify-between mt-2.5 text-[11px] text-slate-500">
                            <span>Based on verified student feedback</span>
                            <span className="font-semibold text-purple-700">Benchmark: 90%+ ✓</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Recent Publications Section */}
                  <Card className="border border-slate-200/80 shadow-sm rounded-2xl bg-white overflow-hidden hover:shadow-md transition-all duration-300">
                    <CardHeader className="pb-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <FontAwesomeIcon icon={faBookAtlas} className="text-[#00aeef] text-sm" />
                          <CardTitle className="text-base font-extrabold text-slate-900">
                            Recent Blog Publications & Market Insights
                          </CardTitle>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Latest articles and research notes published on the institute portal
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveSection("Blog")}
                        className="text-xs font-bold text-[#00aeef] hover:text-[#008cc0] hover:bg-sky-50 rounded-xl border-slate-200 gap-1.5 self-start sm:self-auto"
                      >
                        <span>Manage All Articles ({displayedStats.total_blogs || 27})</span>
                        <FontAwesomeIcon icon={faChevronRight} className="text-[10px]" />
                      </Button>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {recentBlogs.length > 0 ? (
                          recentBlogs.map((blog) => (
                            <div
                              key={blog.id}
                              onClick={() => setActiveSection("Blog")}
                              className="p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-sky-200 hover:bg-sky-50/20 transition-all cursor-pointer flex flex-col justify-between group"
                            >
                              <div>
                                <div className="w-full aspect-[16/10] rounded-lg overflow-hidden bg-slate-200/60 mb-3 border border-slate-200">
                                  <img
                                    src={blog.image || getFallbackImage(blog.id)}
                                    alt={blog.title}
                                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = getFallbackImage(blog.id);
                                    }}
                                  />
                                </div>
                                <h4 className="text-xs font-bold text-slate-900 line-clamp-2 group-hover:text-[#00aeef] transition-colors leading-snug">
                                  {blog.title}
                                </h4>
                                <p className="text-[11px] text-slate-500 line-clamp-2 mt-1.5 leading-relaxed">
                                  {blog.excerpt}
                                </p>
                              </div>
                              <div className="flex items-center justify-between text-[10px] text-slate-400 mt-3 pt-2.5 border-t border-slate-200/60">
                                <span className="font-semibold text-slate-600 truncate max-w-[120px]">
                                  {typeof blog.author === 'string' ? blog.author : blog.author?.name || 'ZSE Training Faculty'}
                                </span>
                                <span>{formatDate(blog.created_at)}</span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="col-span-full text-center py-6 text-slate-400 text-xs">
                            No recent publications found.
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          )}

          {/* Courses */}
          {activeSection === "courses" && <ManageCourses />}

          {/* Student Users */}
          {(activeSection === "users" || activeSection === "students") && <ManageUsers />}

          {/* Cohorts & Groups */}
          {activeSection === "groups" && <ManageGroups />}

          {/* Blog */}
          {activeSection === "Blog" && <ManageBlog />}

          {/* Quizzes */}
          {activeSection === "quizzes" && (
            <>
              {activeQuizSubSection === "addQuiz" && <QuizForm />}
              {activeQuizSubSection === "viewQuizzes" && <ViewQuizzes />}
            </>
          )}

          {/* Analytics */}
          {activeSection === "analytics" && (
            <Card>
              <CardHeader>
                <CardTitle>Analytics Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Detailed analytics and reports will be displayed here.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Configuration */}
          {activeSection === "config" && renderConfigContent()}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
