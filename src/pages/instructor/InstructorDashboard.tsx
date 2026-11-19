import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { courseService, Course } from "@/services/course.service";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChalkboardTeacher,
  faBook,
  faBookOpen,
  faUsers,
  faCertificate,
  faGear,
  faSearch,
  faArrowRight,
  faCheckCircle,
  faClock,
  faSignOutAlt,
  faGraduationCap,
  faAward,
  faUpload,
  faTrash,
  faEye,
  faTimes,
  faShieldHalved,
  faSpinner,
  faLock,
  faFileSignature,
  faExclamationTriangle,
  faRotateRight,
  faBars,
  faXmark,
  faHome,
  faChartLine,
  faArrowTrendUp,
  faStar,
  faBuilding,
  faEnvelope,
  faCheck,
  faArrowUpRightFromSquare,
  faSliders,
  faUserGraduate,
  faClipboardCheck,
} from "@fortawesome/free-solid-svg-icons";
import logo from "@/assets/logo.png";

interface InstructorStats {
  courses_count: number;
  total_enrollments: number;
  active_students: number;
  completion_rate: number;
  certificates_issued: number;
  pending_sign_offs: number;
  instructor_profile: {
    id: number;
    name: string;
    email: string;
    title?: string;
    signature_url?: string;
    has_signature: boolean;
    department?: {
      id: number;
      name: string;
      code: string;
    } | null;
  };
}

interface StudentRosterItem {
  user_id: number;
  student_name: string;
  student_email: string;
  progress: number;
  enrollment_status: string;
  enrolled_at: string;
  last_activity?: string;
  certificate?: {
    id: number;
    certificate_number: string;
    issued_at: string;
  } | null;
  is_eligible_for_cert: boolean;
  passing_grade_percent: number;
}

interface EligibleGraduate {
  user_id: number;
  student_name: string;
  student_email: string;
  course_id: number;
  course_title: string;
  certification_type: string;
  passing_grade_percent: number;
  requires_manual_approval: boolean;
  progress: number;
  completed_at: string;
}

export const InstructorDashboard: React.FC = () => {
  const { user, logout, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "courses" | "gradebook" | "certificates" | "settings">("overview");

  const [stats, setStats] = useState<InstructorStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Courses Tab State
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [courseSearch, setCourseSearch] = useState("");
  const [courseTypeFilter, setCourseTypeFilter] = useState<string>("all");

  // Course Settings Modal
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editPassingScore, setEditPassingScore] = useState<number>(80);
  const [editManualApproval, setEditManualApproval] = useState<boolean>(true);
  const [savingCourseSettings, setSavingCourseSettings] = useState(false);

  // Gradebook Tab State
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [students, setStudents] = useState<StudentRosterItem[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [studentSearch, setStudentSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Certificate Tab State
  const [eligibleGraduates, setEligibleGraduates] = useState<EligibleGraduate[]>([]);
  const [loadingEligible, setLoadingEligible] = useState(false);
  const [issuingCertUser, setIssuingCertUser] = useState<EligibleGraduate | null>(null);
  const [certRemarks, setCertRemarks] = useState("");
  const [submittingCert, setSubmittingCert] = useState(false);

  // Settings Tab State
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);
  const [uploadingSignature, setUploadingSignature] = useState(false);

  // Guard: Ensure user is authenticated and is staff/instructor
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate("/login");
      } else if (!["admin", "super_admin", "instructor", "senior_instructor"].includes(user.role || "")) {
        navigate("/dashboard");
      }
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    fetchStats();
    fetchCourses();
  }, []);

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const data = await courseService.getInstructorStats();
      if (data) {
        setStats(data);
        if (data.instructor_profile?.signature_url) {
          setSignaturePreview(data.instructor_profile.signature_url);
        }
      }
    } catch (error) {
      console.error("Failed to load instructor stats:", error);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchCourses = async () => {
    try {
      setLoadingCourses(true);
      const res = await courseService.getInstructorCourses();
      const list = res?.data || (Array.isArray(res) ? res : []);
      setCourses(list);
      if (list.length > 0 && !selectedCourseId) {
        setSelectedCourseId(list[0].id);
      }
    } catch (error) {
      console.error("Failed to load courses:", error);
    } finally {
      setLoadingCourses(false);
    }
  };

  // Load students when Gradebook tab is opened or course selected
  useEffect(() => {
    if ((activeTab === "gradebook" || activeTab === "overview") && selectedCourseId) {
      fetchCourseStudents(selectedCourseId);
    }
  }, [activeTab, selectedCourseId, studentSearch, statusFilter]);

  const fetchCourseStudents = async (courseId: number) => {
    try {
      setLoadingStudents(true);
      const data = await courseService.getCourseStudents(courseId, {
        search: studentSearch || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
      });
      const list = data?.students?.data || (Array.isArray(data?.students) ? data.students : []);
      setStudents(list);
    } catch (error) {
      console.error("Failed to load students:", error);
    } finally {
      setLoadingStudents(false);
    }
  };

  // Load eligible graduates when Certificates tab is opened
  useEffect(() => {
    if (activeTab === "certificates" || activeTab === "overview") {
      fetchEligibleGraduates();
    }
  }, [activeTab]);

  const fetchEligibleGraduates = async () => {
    try {
      setLoadingEligible(true);
      const data = await courseService.getEligibleCertificates();
      const list = data?.data || (Array.isArray(data) ? data : []);
      setEligibleGraduates(list);
    } catch (error) {
      console.error("Failed to load eligible certificates:", error);
    } finally {
      setLoadingEligible(false);
    }
  };

  const handleIssueCertificate = async () => {
    if (!issuingCertUser) return;
    try {
      setSubmittingCert(true);
      await courseService.issueCertificate({
        course_id: issuingCertUser.course_id,
        user_id: issuingCertUser.user_id,
        remarks: certRemarks || "Certified upon successful syllabus completion.",
      });

      toast({
        title: "Certificate Issued Successfully",
        description: `Certificate has been minted and signed for ${issuingCertUser.student_name}.`,
      });

      setIssuingCertUser(null);
      setCertRemarks("");
      fetchEligibleGraduates();
      fetchStats();
      if (selectedCourseId) fetchCourseStudents(selectedCourseId);
    } catch (err: any) {
      toast({
        title: "Issuance Failed",
        description: err.response?.data?.message || "Failed to issue certificate.",
        variant: "destructive",
      });
    } finally {
      setSubmittingCert(false);
    }
  };

  const handleSignatureUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signatureFile) return;

    try {
      setUploadingSignature(true);
      const fd = new FormData();
      fd.append("signature", signatureFile);
      const res = await courseService.uploadInstructorSignature(fd);

      toast({
        title: "Signature Verified & Saved",
        description: "Your official institutional signature has been registered and will be applied to accredited certificates.",
      });

      if (res?.signature_url) {
        setSignaturePreview(res.signature_url);
      }
      setSignatureFile(null);
      fetchStats();
    } catch (err: any) {
      toast({
        title: "Upload Failed",
        description: err.response?.data?.message || "Failed to upload signature. Please ensure the file is a clean transparent PNG image.",
        variant: "destructive",
      });
    } finally {
      setUploadingSignature(false);
    }
  };

  const handleSaveCourseSettings = async () => {
    if (!editingCourse) return;
    try {
      setSavingCourseSettings(true);
      await courseService.updateInstructorCourseSettings(editingCourse.id, {
        passing_grade_percent: editPassingScore,
        requires_manual_approval: editManualApproval,
      });

      toast({
        title: "Course Parameters Updated",
        description: `Assessment thresholds saved for ${editingCourse.title}.`,
      });

      setCourses(prev => prev.map(c => c.id === editingCourse.id ? {
        ...c,
        passing_grade_percent: editPassingScore,
        requires_manual_approval: editManualApproval,
      } : c));

      setEditingCourse(null);
    } catch (err: any) {
      toast({
        title: "Update Failed",
        description: err.response?.data?.message || "Could not save course parameters.",
        variant: "destructive",
      });
    } finally {
      setSavingCourseSettings(false);
    }
  };

  const filteredCourses = courses.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(courseSearch.toLowerCase());
    const matchesType =
      courseTypeFilter === "all" ||
      (courseTypeFilter === "high_stakes" && c.certification_type === "high_stakes_licensure") ||
      (courseTypeFilter === "standard" && c.certification_type !== "high_stakes_licensure");
    return matchesSearch && matchesType;
  });

  const selectedCourse = courses.find((c) => c.id === selectedCourseId);

  return (
    <div className="min-h-screen bg-slate-50/70 flex font-montserrat">
      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Modern Executive LMS Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 h-screen bg-white border-r border-slate-200/80 z-50 flex flex-col justify-between transition-all duration-300 shadow-sm ${
          sidebarCollapsed ? "w-20" : "w-64"
        } ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div>
          {/* Brand Header with 100% Logo Visibility */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className={`flex items-center gap-3 ${sidebarCollapsed ? "justify-center w-full" : ""}`}>
              <img
                src={logo}
                alt="ZSE Training Institute"
                className={`object-contain transition-all ${sidebarCollapsed ? "h-9 w-9" : "h-11 w-auto"}`}
              />
              {!sidebarCollapsed && (
                <div>
                  <h1 className="text-xs font-black tracking-tight text-slate-900 leading-tight">
                    ZSE TRAINING INSTITUTE
                  </h1>
                  <span className="text-[9px] uppercase font-bold tracking-widest text-[#00aeef] bg-sky-50 px-1.5 py-0.5 rounded border border-sky-100 mt-0.5 inline-block">
                    Faculty Portal
                  </span>
                </div>
              )}
            </div>
            {!sidebarCollapsed && (
              <button
                onClick={() => setSidebarCollapsed(true)}
                className="hidden lg:flex text-slate-400 hover:text-slate-600 text-xs p-1"
                title="Collapse Sidebar"
              >
                ◀
              </button>
            )}
          </div>

          {/* Nav Items */}
          <nav className="p-3 space-y-1 mt-2">
            {[
              { id: "overview", label: "Executive Overview", icon: faChartLine },
              { id: "courses", label: "My Instructed Courses", icon: faBookOpen, count: stats?.courses_count },
              { id: "gradebook", label: "Student Gradebook", icon: faUsers, count: stats?.active_students },
              {
                id: "certificates",
                label: "Certificate Sign-Off",
                icon: faAward,
                count: stats?.pending_sign_offs,
                badgeColor: (stats?.pending_sign_offs || 0) > 0 ? "bg-amber-500 text-white animate-pulse" : undefined,
              },
              {
                id: "settings",
                label: "Digital Signature & Seal",
                icon: faFileSignature,
                hasVerified: stats?.instructor_profile?.has_signature,
              },
            ].map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as any);
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                    active
                      ? "bg-[#00aeef] text-white shadow-md shadow-[#00aeef]/20"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <div className={`flex items-center gap-3 ${sidebarCollapsed ? "justify-center w-full" : ""}`}>
                    <FontAwesomeIcon
                      icon={item.icon}
                      className={`text-sm shrink-0 ${active ? "text-white" : "text-slate-400 group-hover:text-[#00aeef]"}`}
                    />
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </div>
                  {!sidebarCollapsed && item.count !== undefined && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        item.badgeColor || (active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600")
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                  {!sidebarCollapsed && item.hasVerified && (
                    <FontAwesomeIcon icon={faCheckCircle} className="text-[11px] text-emerald-500" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer: Instructor Info & Sign Out */}
        <div className="p-3 border-t border-slate-100 space-y-2">
          {sidebarCollapsed ? (
            <button
              onClick={() => setSidebarCollapsed(false)}
              className="w-full py-2 flex items-center justify-center text-slate-400 hover:text-slate-600"
              title="Expand Sidebar"
            >
              ▶
            </button>
          ) : (
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#00aeef] text-white flex items-center justify-center font-bold text-xs uppercase shrink-0 shadow-sm">
                  {user?.name?.charAt(0) || "F"}
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
                  <p className="text-[10px] text-slate-500 truncate font-mono">{user?.email}</p>
                </div>
              </div>
            </div>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => logout()}
            className={`w-full text-xs text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl h-9 ${
              sidebarCollapsed ? "justify-center px-0" : "justify-start px-3"
            }`}
          >
            <FontAwesomeIcon icon={faSignOutAlt} className={sidebarCollapsed ? "" : "mr-2"} />
            {!sidebarCollapsed && "Sign Out"}
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Institutional Header */}
        <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm"
              >
                <FontAwesomeIcon icon={faBars} />
              </button>
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="font-semibold text-slate-800">Faculty Command Center</span>
                  <span>/</span>
                  <span className="capitalize text-[#00aeef] font-semibold">{activeTab}</span>
                </div>
                <h2 className="text-sm font-bold text-slate-900 hidden sm:block">
                  ZSE Training Institute • Faculty Portal
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <a
                href="/"
                target="_blank"
                rel="noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-[#00aeef] border border-slate-200 hover:border-[#00aeef] transition-colors"
              >
                <span>Institute Website</span>
                <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-[10px]" />
              </a>

              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#0a3161] to-[#00aeef] text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                {user?.name?.charAt(0) || "I"}
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Workspace */}
        <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* Executive Faculty Hero Banner */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0b1324] via-[#0a3161] to-[#00aeef] p-6 text-white shadow-lg">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-medium text-sky-200">
                  <FontAwesomeIcon icon={faBuilding} className="text-[#00aeef]" />
                  <span>Zimbabwe Stock Exchange Training Institute</span>
                  <span>•</span>
                  <span>Faculty Division</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  Welcome back, {stats?.instructor_profile?.name || user?.name || "Faculty Member"}!
                </h1>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  Manage your assigned academic curriculum, monitor cohort engagement, review exam submissions,
                  and authorize institutional certifications.
                </p>

                {/* Institutional Credentials Badges */}
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <Badge className="bg-white/15 hover:bg-white/20 text-white border-white/20 text-[11px] font-medium py-1 px-3">
                    <FontAwesomeIcon icon={faGraduationCap} className="mr-1.5 text-sky-300" />
                    {stats?.instructor_profile?.title || "Senior Faculty Instructor"}
                  </Badge>

                  {stats?.instructor_profile?.has_signature ? (
                    <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30 text-[11px] font-medium py-1 px-3">
                      <FontAwesomeIcon icon={faCheckCircle} className="mr-1.5 text-emerald-400" />
                      Digital Seal: Verified & Active
                    </Badge>
                  ) : (
                    <Badge
                      onClick={() => setActiveTab("settings")}
                      className="bg-amber-500/20 text-amber-200 border-amber-400/30 text-[11px] font-medium py-1 px-3 cursor-pointer hover:bg-amber-500/30"
                    >
                      <FontAwesomeIcon icon={faExclamationTriangle} className="mr-1.5 text-amber-400" />
                      Digital Seal: Signature Required
                    </Badge>
                  )}
                </div>
              </div>

              {/* Fast Action Shortcuts */}
              <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
                <Button
                  onClick={() => setActiveTab("gradebook")}
                  className="bg-white text-slate-900 hover:bg-slate-100 text-xs font-bold rounded-xl h-10 px-4 shadow-md"
                >
                  <FontAwesomeIcon icon={faUsers} className="mr-2 text-[#00aeef]" />
                  Open Student Gradebook
                </Button>
                <Button
                  onClick={() => setActiveTab("certificates")}
                  className="bg-[#00aeef] hover:bg-[#008cc0] text-white text-xs font-bold rounded-xl h-10 px-4 shadow-md"
                >
                  <FontAwesomeIcon icon={faAward} className="mr-2" />
                  Sign-Off Queue ({stats?.pending_sign_offs ?? 0})
                </Button>
              </div>
            </div>

            {/* Subtle Brand Decorative Ring */}
            <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-white/5 pointer-events-none blur-2xl" />
          </div>

          {/* Elevated KPI Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Assigned Courses */}
            <Card className="border border-slate-200/80 shadow-sm hover:shadow-md transition-all rounded-2xl bg-white overflow-hidden">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                    Instructed Courses
                  </p>
                  <p className="text-2xl font-black text-slate-900 mt-1">
                    {stats?.courses_count ?? 0}
                  </p>
                  <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded font-semibold mt-1.5 inline-block">
                    Active Syllabus
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-[#00aeef] text-white flex items-center justify-center shadow-md shadow-sky-500/20">
                  <FontAwesomeIcon icon={faBookOpen} className="text-lg" />
                </div>
              </CardContent>
            </Card>

            {/* Card 2: Total Active Students */}
            <Card className="border border-slate-200/80 shadow-sm hover:shadow-md transition-all rounded-2xl bg-white overflow-hidden">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                    Active Learners
                  </p>
                  <p className="text-2xl font-black text-slate-900 mt-1">
                    {stats?.active_students ?? 0}
                  </p>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold mt-1.5 inline-block">
                    Total Enrolled Cohort
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
                  <FontAwesomeIcon icon={faUsers} className="text-lg" />
                </div>
              </CardContent>
            </Card>

            {/* Card 3: Completion Rate */}
            <Card className="border border-slate-200/80 shadow-sm hover:shadow-md transition-all rounded-2xl bg-white overflow-hidden">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                    Cohort Avg Completion
                  </p>
                  <p className="text-2xl font-black text-slate-900 mt-1">
                    {stats?.completion_rate ?? 0}%
                  </p>
                  <div className="w-24 h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
                    <div
                      className="h-full bg-violet-500 rounded-full transition-all"
                      style={{ width: `${Math.min(stats?.completion_rate ?? 0, 100)}%` }}
                    />
                  </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-500/20">
                  <FontAwesomeIcon icon={faGraduationCap} className="text-lg" />
                </div>
              </CardContent>
            </Card>

            {/* Card 4: Certificates Issued & Pending */}
            <Card className="border border-slate-200/80 shadow-sm hover:shadow-md transition-all rounded-2xl bg-white overflow-hidden">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                    Certificates Stamped
                  </p>
                  <p className="text-2xl font-black text-slate-900 mt-1">
                    {stats?.certificates_issued ?? 0}
                  </p>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-semibold mt-1.5 inline-block ${
                      (stats?.pending_sign_offs || 0) > 0
                        ? "text-amber-800 bg-amber-100 font-bold"
                        : "text-slate-500 bg-slate-100"
                    }`}
                  >
                    {stats?.pending_sign_offs ?? 0} Awaiting Sign-Off
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
                  <FontAwesomeIcon icon={faAward} className="text-lg" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Multi-Panel Executive Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Primary Section (8 cols) */}
            <div className="lg:col-span-8 space-y-6">
              {/* TAB CONTENT 1: OVERVIEW & TEACHING HUB */}
              {activeTab === "overview" && (
                <div className="space-y-6">
                  {/* Quick Action Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Assigned Teaching Portfolio</h3>
                      <p className="text-xs text-slate-500">Live active courses and curriculum modules assigned to your faculty profile.</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveTab("courses")}
                      className="text-xs h-8 rounded-xl border-slate-200 text-slate-700 hover:text-[#00aeef]"
                    >
                      View All Courses
                      <FontAwesomeIcon icon={faArrowRight} className="ml-1.5 text-[10px]" />
                    </Button>
                  </div>

                  {/* Course Cards Grid Preview */}
                  {loadingCourses ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[1, 2].map((n) => (
                        <Skeleton key={n} className="h-48 rounded-2xl" />
                      ))}
                    </div>
                  ) : courses.length === 0 ? (
                    <Card className="p-6 sm:p-8 border border-slate-200/80 rounded-2xl bg-white shadow-sm space-y-6">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
                        <div className="w-14 h-14 rounded-2xl bg-sky-50 text-[#00aeef] flex items-center justify-center shrink-0 shadow-inner">
                          <FontAwesomeIcon icon={faChalkboardTeacher} className="text-2xl" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-base font-bold text-slate-900">
                              Awaiting Course Assignment
                            </h4>
                            <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[10px]">
                              0 Active Courses
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                            Your faculty profile is verified and active. The Super Administrator has not assigned any courses to your account yet. When courses are assigned in the Admin console, their student rosters and gradebooks will appear here automatically.
                          </p>
                        </div>
                      </div>

                      {/* 3 Step Readiness Checklist */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                            <span className="w-5 h-5 rounded-full bg-[#00aeef] text-white flex items-center justify-center text-[10px]">1</span>
                            <span>Digital Signature</span>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            Upload your transparent PNG signature for accredited certificate stamping.
                          </p>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setActiveTab("settings")}
                            className="text-[11px] text-[#00aeef] hover:underline p-0 h-auto font-bold"
                          >
                            Setup Signature →
                          </Button>
                        </div>

                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                            <span className="w-5 h-5 rounded-full bg-[#00aeef] text-white flex items-center justify-center text-[10px]">2</span>
                            <span>Institutional Criteria</span>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            ZSE Licensure requires 80%+ exam score and instructor sign-off.
                          </p>
                          <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                            <FontAwesomeIcon icon={faCheck} className="text-[9px]" /> Standards Active
                          </span>
                        </div>

                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                            <span className="w-5 h-5 rounded-full bg-[#00aeef] text-white flex items-center justify-center text-[10px]">3</span>
                            <span>Course Allocation</span>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            Admin assigns syllabus modules to your institutional account.
                          </p>
                          <span className="text-[11px] text-amber-600 font-semibold flex items-center gap-1">
                            <FontAwesomeIcon icon={faClock} className="text-[9px]" /> Awaiting Allocation
                          </span>
                        </div>
                      </div>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {courses.slice(0, 4).map((c) => (
                        <Card
                          key={c.id}
                          className="border border-slate-200/80 shadow-sm hover:shadow-md transition-all rounded-2xl overflow-hidden bg-white flex flex-col justify-between"
                        >
                          <div>
                            <div className="h-28 bg-gradient-to-br from-slate-900 to-[#0a3161] relative overflow-hidden flex items-center justify-center text-white/30">
                              {c.thumbnail_url || c.thumbnail ? (
                                <img
                                  src={c.thumbnail_url || c.thumbnail}
                                  alt={c.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <FontAwesomeIcon icon={faBookOpen} className="text-3xl" />
                              )}
                              <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                                {c.certification_type === "high_stakes_licensure" ? (
                                  <Badge className="bg-amber-500 text-white text-[10px] font-bold shadow-sm">
                                    <FontAwesomeIcon icon={faStar} className="mr-1 text-[9px]" />
                                    Licensure
                                  </Badge>
                                ) : (
                                  <Badge className="bg-blue-600 text-white text-[10px] font-semibold">
                                    Standard
                                  </Badge>
                                )}
                              </div>
                            </div>

                            <div className="p-4 space-y-1.5">
                              <h4 className="font-bold text-slate-900 text-sm line-clamp-1">{c.title}</h4>
                              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                                {c.description || "Comprehensive syllabus for capital markets professionals."}
                              </p>

                              <div className="pt-2 flex items-center justify-between text-[11px] text-slate-600 border-t border-slate-100">
                                <span>{c.enrolled_users_count ?? 0} Students</span>
                                <span className="font-semibold text-slate-900">Pass Mark: {c.passing_grade_percent || 80}%</span>
                              </div>
                            </div>
                          </div>

                          <div className="p-4 pt-0 flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(`/instructor/courses/${c.id}/content`)}
                              className="flex-1 text-xs h-8 border-slate-200 text-slate-700 hover:text-[#00aeef] rounded-xl font-semibold"
                            >
                              <FontAwesomeIcon icon={faBookOpen} className="mr-1.5" />
                              Curriculum
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedCourseId(c.id);
                                setActiveTab("gradebook");
                              }}
                              className="flex-1 bg-[#00aeef] hover:bg-[#008cc0] text-white text-xs h-8 rounded-xl font-semibold shadow-sm"
                            >
                              <FontAwesomeIcon icon={faUsers} className="mr-1.5" />
                              Gradebook
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}

                  {/* Recent Eligible Graduates Queue */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <FontAwesomeIcon icon={faAward} className="text-amber-500" />
                        <span>Graduation Approval Queue</span>
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setActiveTab("certificates")}
                        className="text-xs text-[#00aeef] hover:underline"
                      >
                        View Full Queue ({eligibleGraduates.length})
                      </Button>
                    </div>

                    <Card className="border border-slate-200/80 shadow-sm rounded-2xl overflow-hidden bg-white">
                      {eligibleGraduates.length === 0 ? (
                        <div className="p-6 text-center text-slate-500 text-xs">
                          <FontAwesomeIcon icon={faCheckCircle} className="text-emerald-500 text-xl mb-2" />
                          <p className="font-semibold">All eligible certificates are up to date!</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            When enrolled students complete 100% of high-stakes courses, they will appear here for verification.
                          </p>
                        </div>
                      ) : (
                        <div className="divide-y divide-slate-100">
                          {eligibleGraduates.slice(0, 3).map((grad) => (
                            <div key={`${grad.course_id}-${grad.user_id}`} className="p-4 flex items-center justify-between">
                              <div>
                                <p className="text-xs font-bold text-slate-900">{grad.student_name}</p>
                                <p className="text-[11px] text-slate-500">{grad.course_title}</p>
                              </div>
                              <Button
                                size="sm"
                                onClick={() => setIssuingCertUser(grad)}
                                className="bg-[#00aeef] hover:bg-[#008cc0] text-white text-xs h-8 px-3 rounded-xl font-bold shadow-sm"
                              >
                                <FontAwesomeIcon icon={faFileSignature} className="mr-1.5" />
                                Review & Sign
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </Card>
                  </div>
                </div>
              )}

              {/* TAB CONTENT 2: COURSES & SYLLABUS */}
              {activeTab === "courses" && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Teaching Curriculum</h3>
                      <p className="text-xs text-slate-500">
                        Configure syllabus requirements, passing mark percentages, and manual sign-offs.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="w-48 relative">
                        <FontAwesomeIcon
                          icon={faSearch}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"
                        />
                        <Input
                          placeholder="Search courses..."
                          value={courseSearch}
                          onChange={(e) => setCourseSearch(e.target.value)}
                          className="pl-8 text-xs h-9 bg-slate-50 border-slate-200 rounded-xl"
                        />
                      </div>

                      <Select value={courseTypeFilter} onValueChange={setCourseTypeFilter}>
                        <SelectTrigger className="w-36 text-xs h-9 bg-slate-50 border-slate-200 rounded-xl">
                          <SelectValue placeholder="All Types" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all" className="text-xs">All Types</SelectItem>
                          <SelectItem value="high_stakes" className="text-xs">High-Stakes Licensure</SelectItem>
                          <SelectItem value="standard" className="text-xs">Standard Completion</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {loadingCourses ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[1, 2, 3, 4].map((n) => (
                        <Skeleton key={n} className="h-56 rounded-2xl" />
                      ))}
                    </div>
                  ) : filteredCourses.length === 0 ? (
                    <Card className="p-8 text-center border border-slate-200/80 rounded-2xl bg-white shadow-sm space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                        <FontAwesomeIcon icon={faBookOpen} className="text-xl" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">No Courses Allocated Yet</h4>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                        The Super Administrator has not assigned any courses to this instructor profile. When courses are linked to you in the Administration console, they will appear here.
                      </p>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredCourses.map((c) => (
                        <Card
                          key={c.id}
                          className="border border-slate-200/80 shadow-sm hover:shadow-md transition-all rounded-2xl overflow-hidden bg-white flex flex-col justify-between"
                        >
                          <div>
                            <div className="h-32 bg-slate-900 relative overflow-hidden flex items-center justify-center text-white/30">
                              {c.thumbnail_url || c.thumbnail ? (
                                <img
                                  src={c.thumbnail_url || c.thumbnail}
                                  alt={c.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <FontAwesomeIcon icon={faBookOpen} className="text-4xl" />
                              )}
                              <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                                <Badge className="bg-slate-900/80 text-white backdrop-blur text-[10px] font-semibold">
                                  {c.visibility === "restricted" ? "🔒 Restricted" : "🌐 Public"}
                                </Badge>
                                {c.certification_type === "high_stakes_licensure" && (
                                  <Badge className="bg-amber-500 text-white text-[10px] font-bold shadow-sm">
                                    <FontAwesomeIcon icon={faStar} className="mr-1 text-[9px]" />
                                    Licensure
                                  </Badge>
                                )}
                              </div>
                            </div>

                            <div className="p-4 space-y-2">
                              <h4 className="font-bold text-slate-900 text-sm line-clamp-1">{c.title}</h4>
                              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                                {c.description || "Comprehensive syllabus for capital markets professionals."}
                              </p>

                              <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl space-y-1 text-xs">
                                <div className="flex justify-between text-slate-700 font-medium">
                                  <span>Curriculum Modules:</span>
                                  <span className="font-bold text-slate-900">{c.contents_count ?? 0} Lessons</span>
                                </div>
                                <div className="flex justify-between text-slate-700 font-medium">
                                  <span>Pass Mark Threshold:</span>
                                  <span className="font-bold text-[#00aeef]">{c.passing_grade_percent || 80}%</span>
                                </div>
                                <div className="flex justify-between text-slate-700 font-medium">
                                  <span>Approval Mechanism:</span>
                                  <span className="font-semibold text-slate-900">
                                    {c.requires_manual_approval ? "Manual Instructor Sign-Off" : "Automatic Release"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="p-4 pt-0 grid grid-cols-3 gap-2">
                            <Button
                              size="sm"
                              onClick={() => navigate(`/instructor/courses/${c.id}/content`)}
                              className="bg-[#00aeef] hover:bg-[#008cc0] text-white text-xs h-8 rounded-xl font-bold shadow-sm"
                            >
                              <FontAwesomeIcon icon={faBookOpen} className="mr-1.5" />
                              Curriculum
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingCourse(c);
                                setEditPassingScore(c.passing_grade_percent || 80);
                                setEditManualApproval(c.requires_manual_approval !== false);
                              }}
                              className="text-xs h-8 border-slate-200 text-slate-700 hover:text-[#00aeef] rounded-xl font-semibold"
                            >
                              <FontAwesomeIcon icon={faSliders} className="mr-1.5" />
                              Parameters
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedCourseId(c.id);
                                setActiveTab("gradebook");
                              }}
                              className="text-xs h-8 border-slate-200 text-slate-700 hover:text-[#00aeef] rounded-xl font-semibold"
                            >
                              <FontAwesomeIcon icon={faUsers} className="mr-1.5" />
                              Gradebook
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB CONTENT 3: GRADEBOOK & PERFORMANCE */}
              {activeTab === "gradebook" && (
                <div className="space-y-4">
                  {/* Filter Toolbar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <span className="text-xs font-bold text-slate-700 whitespace-nowrap">Course:</span>
                      <Select
                        value={selectedCourseId ? String(selectedCourseId) : ""}
                        onValueChange={(val) => setSelectedCourseId(parseInt(val, 10))}
                      >
                        <SelectTrigger className="w-full sm:w-72 text-xs h-9 bg-slate-50 border-slate-200 rounded-xl">
                          <SelectValue placeholder="Select Course" />
                        </SelectTrigger>
                        <SelectContent>
                          {courses.map((c) => (
                            <SelectItem key={c.id} value={String(c.id)} className="text-xs">
                              {c.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Search student..."
                        value={studentSearch}
                        onChange={(e) => setStudentSearch(e.target.value)}
                        className="w-48 text-xs h-9 bg-slate-50 border-slate-200 rounded-xl"
                      />

                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-36 text-xs h-9 bg-slate-50 border-slate-200 rounded-xl">
                          <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all" className="text-xs">All Students</SelectItem>
                          <SelectItem value="completed" className="text-xs">Completed (100%)</SelectItem>
                          <SelectItem value="in_progress" className="text-xs">In Progress</SelectItem>
                          <SelectItem value="not_started" className="text-xs">Not Started (0%)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Student Table */}
                  <Card className="border border-slate-200/80 shadow-sm rounded-2xl overflow-hidden bg-white">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50/80 text-[11px] font-bold text-slate-600 uppercase tracking-wider border-b border-slate-200">
                            <th className="py-3 px-4">Enrolled Learner</th>
                            <th className="py-3 px-4">Syllabus Progress</th>
                            <th className="py-3 px-4">Credential Status</th>
                            <th className="py-3 px-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                          {loadingStudents ? (
                            <tr>
                              <td colSpan={4} className="py-12 text-center text-slate-400">
                                <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                                Loading student performance records...
                              </td>
                            </tr>
                          ) : students.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="py-12 text-center text-slate-500">
                                No enrolled students found matching the selected criteria.
                              </td>
                            </tr>
                          ) : (
                            students.map((st) => (
                              <tr key={st.user_id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                                      {st.student_name?.charAt(0) || "S"}
                                    </div>
                                    <div>
                                      <p className="font-bold text-slate-900">{st.student_name}</p>
                                      <p className="text-[11px] text-slate-400 font-mono">{st.student_email}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  <div className="w-40 space-y-1">
                                    <div className="flex justify-between text-[11px]">
                                      <span className="font-bold text-slate-800">{st.progress}%</span>
                                      <span
                                        className={
                                          st.progress >= 100
                                            ? "text-emerald-600 font-semibold"
                                            : st.progress > 0
                                            ? "text-[#00aeef] font-semibold"
                                            : "text-slate-400 font-medium"
                                        }
                                      >
                                        {st.progress >= 100
                                          ? "Completed"
                                          : st.progress > 0
                                          ? "In Progress"
                                          : "Not Started"}
                                      </span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                                      <div
                                        className={`h-full ${st.progress >= 100 ? "bg-emerald-500" : "bg-[#00aeef]"}`}
                                        style={{ width: `${Math.min(st.progress, 100)}%` }}
                                      />
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  {st.certificate ? (
                                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-mono text-[10px] inline-flex items-center gap-1 font-semibold">
                                      <FontAwesomeIcon icon={faCheckCircle} className="text-[10px]" />
                                      {st.certificate.certificate_number}
                                    </Badge>
                                  ) : st.is_eligible_for_cert ? (
                                    <Badge className="bg-amber-100 text-amber-800 border-amber-300 text-[10px] font-semibold inline-flex items-center gap-1 animate-pulse">
                                      <FontAwesomeIcon icon={faAward} className="text-amber-600 text-[10px]" />
                                      Ready for Sign-Off
                                    </Badge>
                                  ) : (
                                    <Badge
                                      variant="outline"
                                      className="bg-slate-50 text-slate-500 border-slate-200 text-[10px] font-normal inline-flex items-center gap-1"
                                    >
                                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                                      {st.progress >= 100
                                        ? "Pending Evaluation"
                                        : st.progress === 0
                                        ? "Not Started"
                                        : `Incomplete (${st.progress}%)`}
                                    </Badge>
                                  )}
                                </td>
                                <td className="py-3 px-4 text-right">
                                  {st.is_eligible_for_cert ? (
                                    <Button
                                      size="sm"
                                      onClick={() => {
                                        setIssuingCertUser({
                                          user_id: st.user_id,
                                          student_name: st.student_name,
                                          student_email: st.student_email,
                                          course_id: selectedCourseId!,
                                          course_title: selectedCourse?.title || "",
                                          certification_type: selectedCourse?.certification_type || "standard",
                                          passing_grade_percent: st.passing_grade_percent,
                                          requires_manual_approval: true,
                                          progress: st.progress,
                                          completed_at: new Date().toISOString(),
                                        });
                                      }}
                                      className="bg-[#00aeef] hover:bg-[#008cc0] text-white text-xs h-7 px-3 rounded-lg font-bold shadow-sm"
                                    >
                                      <FontAwesomeIcon icon={faAward} className="mr-1 text-[10px]" />
                                      Sign Certificate
                                    </Button>
                                  ) : st.certificate ? (
                                    <span className="inline-flex items-center text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                                      <FontAwesomeIcon icon={faCheckCircle} className="mr-1 text-[10px]" />
                                      Certified
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center text-[11px] text-slate-400 font-medium bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
                                      Awaiting Completion
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </div>
              )}

              {/* TAB CONTENT 4: CERTIFICATE SIGN-OFF CENTER */}
              {activeTab === "certificates" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Certificate Sign-Off Queue</h3>
                      <p className="text-xs text-slate-500">
                        Review graduates who have satisfied high-stakes examination requirements and authorize credential release.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={fetchEligibleGraduates}
                      className="text-xs h-8 border-slate-200 text-slate-600 rounded-xl"
                    >
                      <FontAwesomeIcon icon={faRotateRight} className="mr-1.5" />
                      Refresh Queue
                    </Button>
                  </div>

                  <Card className="border border-slate-200/80 shadow-sm rounded-2xl overflow-hidden bg-white">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50/80 text-[11px] font-bold text-slate-600 uppercase tracking-wider border-b border-slate-200">
                            <th className="py-3 px-4">Graduate Candidate</th>
                            <th className="py-3 px-4">Course Program</th>
                            <th className="py-3 px-4">Credential Type</th>
                            <th className="py-3 px-4">Completion Date</th>
                            <th className="py-3 px-4 text-right">Sign-Off Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                          {loadingEligible ? (
                            <tr>
                              <td colSpan={5} className="py-12 text-center text-slate-400">
                                <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                                Validating graduate records...
                              </td>
                            </tr>
                          ) : eligibleGraduates.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="py-12 text-center text-slate-500">
                                <FontAwesomeIcon icon={faCheckCircle} className="text-emerald-500 text-2xl mb-2" />
                                <p className="font-semibold text-slate-800">No Pending Certificates</p>
                                <p className="text-[11px] text-slate-400 mt-0.5">
                                  All eligible students have been certified and stamped.
                                </p>
                              </td>
                            </tr>
                          ) : (
                            eligibleGraduates.map((grad) => (
                              <tr key={`${grad.course_id}-${grad.user_id}`} className="hover:bg-slate-50/50">
                                <td className="py-3 px-4">
                                  <p className="font-bold text-slate-900">{grad.student_name}</p>
                                  <p className="text-[11px] text-slate-400 font-mono">{grad.student_email}</p>
                                </td>
                                <td className="py-3 px-4 font-semibold text-slate-800">{grad.course_title}</td>
                                <td className="py-3 px-4">
                                  <Badge className="bg-amber-100 text-amber-800 border-amber-300 text-[10px] font-semibold">
                                    Licensure
                                  </Badge>
                                </td>
                                <td className="py-3 px-4 text-slate-500">
                                  {new Date(grad.completed_at).toLocaleDateString()}
                                </td>
                                <td className="py-3 px-4 text-right">
                                  <Button
                                    size="sm"
                                    onClick={() => setIssuingCertUser(grad)}
                                    className="bg-[#00aeef] hover:bg-[#008cc0] text-white text-xs h-8 px-4 rounded-xl font-bold shadow-sm"
                                  >
                                    <FontAwesomeIcon icon={faFileSignature} className="mr-1.5" />
                                    Approve & Sign
                                  </Button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </div>
              )}

              {/* TAB CONTENT 5: DIGITAL SIGNATURE & PROFILE */}
              {activeTab === "settings" && (
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Institutional Faculty Signature Studio</h3>
                      <p className="text-xs text-slate-500">
                        Upload a transparent PNG digital signature. This signature will be cryptographically bound and printed onto accredited certificates.
                      </p>
                    </div>

                    <form onSubmit={handleSignatureUpload} className="space-y-4">
                      <div className="p-6 bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center text-center">
                        {signaturePreview ? (
                          <div className="space-y-3">
                            {/* Parchment Certificate Preview Box */}
                            <div className="w-64 h-24 bg-white border border-slate-200 rounded-xl p-3 shadow-inner flex items-center justify-center relative overflow-hidden">
                              <img
                                src={signaturePreview}
                                alt="Official Signature"
                                className="h-full object-contain filter contrast-125"
                              />
                              <div className="absolute bottom-1 right-2 text-[8px] text-slate-400 font-mono uppercase">
                                ZSE Digital Seal
                              </div>
                            </div>
                            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs py-1 px-3 font-semibold">
                              <FontAwesomeIcon icon={faCheckCircle} className="mr-1.5 text-emerald-600" />
                              Official Signature Registered & Active
                            </Badge>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="w-12 h-12 rounded-full bg-blue-50 text-[#00aeef] flex items-center justify-center mx-auto">
                              <FontAwesomeIcon icon={faUpload} className="text-lg" />
                            </div>
                            <p className="text-xs font-bold text-slate-800">No Signature Configured</p>
                            <p className="text-[11px] text-slate-500 max-w-xs">
                              Please upload a high-contrast signature on transparent background (PNG format).
                            </p>
                          </div>
                        )}

                        <div className="mt-4">
                          <label className="cursor-pointer">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => document.getElementById("sig-input")?.click()}
                              className="text-xs border-slate-200 text-slate-700 rounded-xl h-9 px-4 font-semibold hover:bg-slate-100"
                            >
                              <FontAwesomeIcon icon={faUpload} className="mr-2" />
                              {signatureFile ? signatureFile.name : "Select Signature File (PNG)"}
                            </Button>
                            <input
                              id="sig-input"
                              type="file"
                              accept="image/png"
                              className="hidden"
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) {
                                  setSignatureFile(f);
                                  setSignaturePreview(URL.createObjectURL(f));
                                }
                              }}
                            />
                          </label>
                        </div>
                      </div>

                      {signatureFile && (
                        <Button
                          type="submit"
                          disabled={uploadingSignature}
                          className="bg-[#00aeef] hover:bg-[#008cc0] text-white text-xs font-bold h-10 px-6 rounded-xl shadow-md"
                        >
                          <FontAwesomeIcon icon={faCheck} className="mr-2" />
                          {uploadingSignature ? "Registering Signature..." : "Register Official Signature"}
                        </Button>
                      )}
                    </form>
                  </div>
                </div>
              )}
            </div>

            {/* Operations & Faculty Governance Sidebar (4 cols) */}
            <div className="lg:col-span-4 space-y-6">
              {/* Card 1: Official Faculty Credentials */}
              <Card className="border border-slate-200/80 shadow-sm rounded-2xl bg-white overflow-hidden">
                <CardHeader className="bg-slate-50/70 border-b border-slate-100 pb-3">
                  <CardTitle className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <FontAwesomeIcon icon={faChalkboardTeacher} className="text-[#00aeef]" />
                    Faculty Accreditation
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0a3161] to-[#00aeef] text-white flex items-center justify-center font-bold text-base shadow-md shrink-0">
                      {user?.name?.charAt(0) || "F"}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{user?.name}</h4>
                      <p className="text-[11px] text-slate-500 font-mono truncate">{user?.email}</p>
                      <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] font-semibold mt-1">
                        Academic Faculty
                      </Badge>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Department:</span>
                      <span className="font-semibold text-slate-900">Trading & Markets</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Faculty Status:</span>
                      <span className="font-semibold text-emerald-600">Active Accreditation</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Digital Seal:</span>
                      <span className={stats?.instructor_profile?.has_signature ? "font-semibold text-emerald-600" : "font-semibold text-amber-600"}>
                        {stats?.instructor_profile?.has_signature ? "Verified & Registered" : "Action Required"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Card 2: Regulatory Guidelines */}
              <Card className="border border-slate-200/80 shadow-sm rounded-2xl bg-white overflow-hidden">
                <CardHeader className="bg-slate-50/70 border-b border-slate-100 pb-3">
                  <CardTitle className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <FontAwesomeIcon icon={faClipboardCheck} className="text-emerald-600" />
                    ZSE Academic Standards
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-3 text-xs text-slate-600">
                  <div className="flex items-start gap-2">
                    <FontAwesomeIcon icon={faCheck} className="text-emerald-500 mt-0.5 shrink-0" />
                    <span>High-Stakes Licensure candidates require an 80%+ passing score.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <FontAwesomeIcon icon={faCheck} className="text-emerald-500 mt-0.5 shrink-0" />
                    <span>Certificates carry unique verification numbers (ZSE-YEAR-ID-HASH).</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <FontAwesomeIcon icon={faCheck} className="text-emerald-500 mt-0.5 shrink-0" />
                    <span>Transparent signatures are stamped onto accredited certificate files.</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>

      {/* Certificate Sign-Off Dialog */}
      <Dialog open={!!issuingCertUser} onOpenChange={(open) => !open && setIssuingCertUser(null)}>
        <DialogContent className="max-w-md p-6 bg-white border-slate-200 rounded-2xl shadow-2xl">
          <DialogHeader>
            <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-2 shadow-sm">
              <FontAwesomeIcon icon={faAward} className="text-lg" />
            </div>
            <DialogTitle className="text-base font-bold text-slate-900">
              Authorize & Sign Certificate
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Confirm official issuance for <strong>{issuingCertUser?.student_name}</strong>:
            </DialogDescription>
          </DialogHeader>

          <div className="my-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
            <p className="text-xs font-bold text-slate-800">{issuingCertUser?.course_title}</p>
            <div className="flex items-center gap-2 text-[11px] text-slate-600">
              <span>Progress: <strong>100%</strong></span>
              <span>•</span>
              <span>Min Score Required: <strong>{issuingCertUser?.passing_grade_percent}%</strong></span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-700">Official Faculty Remarks (Optional)</label>
            <Input
              placeholder="e.g. Completed with distinction in securities trading"
              value={certRemarks}
              onChange={(e) => setCertRemarks(e.target.value)}
              className="text-xs h-9 bg-slate-50 border-slate-200 rounded-xl"
            />
          </div>

          <DialogFooter className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIssuingCertUser(null)}
              className="text-xs h-9 px-4 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={submittingCert}
              onClick={handleIssueCertificate}
              className="bg-[#00aeef] hover:bg-[#008cc0] text-white text-xs font-bold h-9 px-5 rounded-xl shadow-md"
            >
              <FontAwesomeIcon icon={faFileSignature} className="mr-1.5" />
              {submittingCert ? "Signing..." : "Authorize & Stamp Signature"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Course Parameters Modal */}
      <Dialog open={!!editingCourse} onOpenChange={(open) => !open && setEditingCourse(null)}>
        <DialogContent className="max-w-md p-6 bg-white border-slate-200 rounded-2xl shadow-2xl">
          <DialogHeader>
            <div className="w-11 h-11 rounded-2xl bg-blue-50 text-[#00aeef] flex items-center justify-center mb-2 shadow-sm">
              <FontAwesomeIcon icon={faSliders} className="text-lg" />
            </div>
            <DialogTitle className="text-base font-bold text-slate-900">
              Configure Course Parameters
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Adjust assessment benchmarks for <strong>{editingCourse?.title}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-2">
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>Passing Grade Threshold</span>
                <span className="font-bold text-[#00aeef]">{editPassingScore}%</span>
              </div>
              <Input
                type="number"
                min={50}
                max={100}
                value={editPassingScore}
                onChange={(e) => setEditPassingScore(parseInt(e.target.value) || 80)}
                className="text-xs bg-slate-50 rounded-xl"
              />
              <p className="text-[10px] text-slate-400">Recommended: 80% for High-Stakes Licensure examinations.</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between border border-slate-200">
              <div>
                <p className="text-xs font-bold text-slate-800">Require Manual Instructor Sign-Off</p>
                <p className="text-[10px] text-slate-500">Hold certificate release until instructor authorizes.</p>
              </div>
              <input
                type="checkbox"
                checked={editManualApproval}
                onChange={(e) => setEditManualApproval(e.target.checked)}
                className="h-4 w-4 rounded text-[#00aeef] focus:ring-[#00aeef]"
              />
            </div>
          </div>

          <DialogFooter className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditingCourse(null)}
              className="text-xs h-9 px-4 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={savingCourseSettings}
              onClick={handleSaveCourseSettings}
              className="bg-[#00aeef] hover:bg-[#008cc0] text-white text-xs font-bold h-9 px-5 rounded-xl shadow-md"
            >
              {savingCourseSettings ? "Saving..." : "Save Parameters"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InstructorDashboard;
