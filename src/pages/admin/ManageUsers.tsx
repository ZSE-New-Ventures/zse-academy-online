import { useState, useEffect } from "react";
import { apiClient } from "@/services/api";
import { API_ENDPOINTS } from "@/constants/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ManageGroups } from "./ManageGroups";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faUser,
  faBook,
  faShieldHalved,
  faUserPlus,
  faGraduationCap,
  faUserTie,
  faCheck,
  faSpinner,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";

interface UserItem {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

interface Enrollment {
  user_id: number;
  user_name: string;
  user_email: string;
  course_id: number;
  course_title: string;
  course_description: string;
  category_id?: number | null;
  category_name?: string | null;
  progress: number;
  status: string;
  enrolled_at: string;
}

const ManageUsers = () => {
  const [activeTab, setActiveTab] = useState<"users" | "enrollments" | "groups">("users");
  
  // Users tab state
  const [users, setUsers] = useState<UserItem[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "admin",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  // Enrollments tab state
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [enrollmentsLoading, setEnrollmentsLoading] = useState(false);
  const [enrollSearchTerm, setEnrollSearchTerm] = useState("");

  const { toast } = useToast();

  useEffect(() => {
    setCurrentPage(1);
    fetchUsers(1);
  }, [roleFilter]);

  const fetchUsers = async (page = 1, search?: string) => {
    try {
      setUsersLoading(true);
      const params: Record<string, string | number> = { page, per_page: 25, type: "student" };
      const term = search !== undefined ? search : userSearchTerm;
      if (term.trim()) {
        params.search = term.trim();
      }
      const response = await apiClient.get("/users", { params });
      const resData = response.data;
      const list = resData?.data ? resData.data : (Array.isArray(resData) ? resData : []);
      setUsers(list);
      if (resData?.total !== undefined) {
        setTotalCount(resData.total);
        setTotalPages(resData.last_page || Math.ceil(resData.total / 25));
        setCurrentPage(resData.current_page || page);
      } else {
        setTotalCount(list.length);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Failed to fetch student users:", error);
      toast({
        title: "Error",
        description: "Failed to load student accounts.",
        variant: "destructive",
      });
    } finally {
      setUsersLoading(false);
    }
  };

  const handleUserSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchUsers(1, userSearchTerm);
  };

  const fetchEnrollments = async () => {
    try {
      setEnrollmentsLoading(true);
      const response = await apiClient.get(API_ENDPOINTS.ADMIN_ENROLLMENTS);
      setEnrollments(response.data?.data || response.data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch enrollments",
        variant: "destructive",
      });
    } finally {
      setEnrollmentsLoading(false);
    }
  };

  const handleTabChange = (tab: "users" | "enrollments" | "groups") => {
    setActiveTab(tab);
    if (tab === "enrollments" && enrollments.length === 0) {
      fetchEnrollments();
    }
  };

  // Promote / Demote User Role
  const handleRoleChange = async (userId: number, newRole: "admin" | "student") => {
    try {
      setActionLoadingId(userId);
      await apiClient.put(`/users/${userId}`, { role: newRole });
      
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );

      toast({
        title: "Role Updated",
        description: `User role has been successfully changed to ${newRole.toUpperCase()}.`,
      });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast({
        title: "Update Failed",
        description: err.response?.data?.message || "Could not update user role.",
        variant: "destructive",
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Create new User/Admin
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email) {
      toast({
        title: "Validation Error",
        description: "Please provide a valid name and email.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await apiClient.post("/users", newUser);
      toast({
        title: "User Created",
        description: `Successfully added ${newUser.name} as an ${newUser.role.toUpperCase()}.`,
      });
      setIsCreateModalOpen(false);
      setNewUser({ name: "", email: "", password: "", role: "admin" });
      fetchUsers();
    } catch (error: unknown) {
      const errObj = error as { response?: { data?: { message?: string; errors?: { email?: string[] } } } };
      const err = errObj.response?.data?.errors?.email?.[0] || errObj.response?.data?.message || "Failed to create user.";
      toast({
        title: "Creation Failed",
        description: err,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredEnrollments = enrollments.filter(
    (enroll) =>
      enroll.user_name.toLowerCase().includes(enrollSearchTerm.toLowerCase()) ||
      enroll.user_email.toLowerCase().includes(enrollSearchTerm.toLowerCase()) ||
      enroll.course_title.toLowerCase().includes(enrollSearchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header & Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-gray-200">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Student Users & Learners</h2>
          <p className="text-xs text-gray-500 mt-1">
            Manage registered student accounts, course enrollments, cohort participation, and academic progress.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="inline-flex rounded-lg border border-gray-200 p-1 bg-gray-50">
          <button
            onClick={() => handleTabChange("users")}
            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
              activeTab === "users"
                ? "bg-[#00aeef] text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <FontAwesomeIcon icon={faGraduationCap} className="mr-2" />
            Student Accounts
          </button>
          <button
            onClick={() => handleTabChange("enrollments")}
            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
              activeTab === "enrollments"
                ? "bg-[#00aeef] text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <FontAwesomeIcon icon={faBook} className="mr-2" />
            Course Enrollments
          </button>
          <button
            onClick={() => handleTabChange("groups")}
            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
              activeTab === "groups"
                ? "bg-[#00aeef] text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <FontAwesomeIcon icon={faUsers} className="mr-2" />
            Cohorts & Groups
          </button>
        </div>
      </div>

      {/* TAB 1: STUDENT ACCOUNTS */}
      {activeTab === "users" && (
        <Card className="border border-gray-200 shadow-sm rounded-xl overflow-hidden bg-white">
          <CardHeader className="bg-gray-50/60 border-b border-gray-100 py-4 px-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base font-bold text-gray-900">Registered Student Learners</CardTitle>
              <CardDescription className="text-xs text-gray-500">
                Directory of active student learners enrolled across training institute programs.
              </CardDescription>
            </div>
            <div className="text-xs text-slate-500 font-medium">
              Total Students: <strong className="text-slate-800">{totalCount}</strong>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {/* Search */}
            <form onSubmit={handleUserSearch} className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <FontAwesomeIcon
                  icon={faSearch}
                  className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs"
                />
                <Input
                  placeholder="Search students by name or email address..."
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  className="pl-9 h-10 text-xs"
                />
              </div>

              <Button type="submit" className="bg-[#00aeef] hover:bg-[#008cc0] text-white h-10 text-xs font-semibold px-5">
                Search Students
              </Button>
            </form>

            {/* Users List */}
            {usersLoading ? (
              <div className="space-y-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl animate-pulse">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gray-200" />
                      <div className="space-y-2">
                        <div className="h-4 w-40 bg-gray-200 rounded" />
                        <div className="h-3 w-56 bg-gray-200 rounded" />
                      </div>
                    </div>
                    <div className="h-8 w-24 bg-gray-200 rounded" />
                  </div>
                ))}
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12 text-gray-500 text-sm">
                No users found matching your search criteria.
              </div>
            ) : (
              <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
                {users.map((u) => {
                  const isAdmin = u.role === "admin";
                  const isActionLoading = actionLoadingId === u.id;

                  return (
                    <div
                      key={u.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white hover:bg-slate-50/70 transition-colors gap-3"
                    >
                      <div className="flex items-center gap-3.5">
                        <div
                          className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-xs uppercase shadow-sm shrink-0 ${
                            isAdmin
                              ? "bg-gradient-to-tr from-[#00aeef] to-blue-600 text-white"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {isAdmin ? (
                            <FontAwesomeIcon icon={faShieldHalved} className="h-4 w-4" />
                          ) : (
                            u.name.slice(0, 2)
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-gray-900">{u.name}</span>
                            <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold">
                              Student Learner
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">{u.email}</p>
                        </div>
                      </div>

                      <div className="text-xs text-slate-400 self-end sm:self-center">
                        Registered {new Date(u.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination & Count */}
            {totalCount > 0 && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6 pt-4 border-t border-gray-100 text-xs text-gray-500">
                <div>
                  Showing page <strong className="text-gray-900">{currentPage}</strong> of{" "}
                  <strong className="text-gray-900">{totalPages.toLocaleString()}</strong> ({totalCount.toLocaleString()} total registered users)
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage <= 1 || usersLoading}
                    onClick={() => {
                      const prev = Math.max(currentPage - 1, 1);
                      setCurrentPage(prev);
                      fetchUsers(prev);
                    }}
                    className="h-8 text-xs font-semibold"
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage >= totalPages || usersLoading}
                    onClick={() => {
                      const next = Math.min(currentPage + 1, totalPages);
                      setCurrentPage(next);
                      fetchUsers(next);
                    }}
                    className="h-8 text-xs font-semibold"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* TAB 2: COURSE ENROLLMENTS */}
      {activeTab === "enrollments" && (
        <Card className="border border-gray-200 shadow-sm rounded-xl overflow-hidden bg-white">
          <CardHeader className="bg-gray-50/60 border-b border-gray-100 py-4 px-6">
            <CardTitle className="text-base font-bold text-gray-900">Student Course Enrollments</CardTitle>
            <CardDescription className="text-xs text-gray-500">
              Track course participation, completion progress, and enrollment status.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="mb-4">
              <div className="relative">
                <FontAwesomeIcon
                  icon={faSearch}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs"
                />
                <Input
                  placeholder="Search enrollments by student name, email, or course title..."
                  value={enrollSearchTerm}
                  onChange={(e) => setEnrollSearchTerm(e.target.value)}
                  className="pl-9 h-10 text-xs"
                />
              </div>
            </div>

            {enrollmentsLoading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-xl" />
                ))}
              </div>
            ) : filteredEnrollments.length === 0 ? (
              <div className="text-center py-10 text-gray-500 text-sm">
                No enrollments found.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredEnrollments.map((enroll) => (
                  <div
                    key={`${enroll.user_id}-${enroll.course_id}`}
                    className="p-4 border border-gray-100 rounded-xl bg-white hover:border-gray-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="h-10 w-10 rounded-full bg-blue-50 text-[#00aeef] flex items-center justify-center font-bold text-xs shrink-0">
                        <FontAwesomeIcon icon={faUser} />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-gray-900">{enroll.user_name}</h4>
                        <p className="text-xs text-gray-500">{enroll.user_email}</p>
                        <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-600">
                          <FontAwesomeIcon icon={faBook} className="text-[#00aeef] text-[10px]" />
                          <span>{enroll.course_title}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:items-end gap-1 text-xs text-gray-500">
                      <Badge variant={enroll.status === "active" ? "default" : "secondary"} className="self-start sm:self-end">
                        {enroll.status}
                      </Badge>
                      <span>Progress: <strong className="text-gray-900">{enroll.progress}%</strong></span>
                      <span>Enrolled: {new Date(enroll.enrolled_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* TAB 3: COHORTS & GROUPS */}
      {activeTab === "groups" && <ManageGroups />}
    </div>
  );
};

export default ManageUsers;
