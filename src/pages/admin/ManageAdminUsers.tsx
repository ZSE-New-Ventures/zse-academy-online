import React, { useState, useEffect } from "react";
import { apiClient } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserShield,
  faBuilding,
  faPlus,
  faSearch,
  faEnvelope,
  faKey,
  faShieldHalved,
  faEdit,
  faUnlock,
  faCheckCircle,
  faExclamationTriangle,
  faLock,
  faRotateRight,
} from "@fortawesome/free-solid-svg-icons";
import { useToast } from "@/hooks/use-toast";
import { securityService, Department } from "@/services/security.service";

interface AdminUserItem {
  id: number;
  name: string;
  email: string;
  role: string;
  department_id?: number | null;
  department?: Department | null;
  mfa_enabled?: boolean;
  must_change_password?: boolean;
  locked?: boolean;
  locked_at?: string | null;
  created_at: string;
}

export const ManageAdminUsers: React.FC = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [availableRoles, setAvailableRoles] = useState<string[]>([
    "admin",
    "super_admin",
    "instructor",
    "senior_instructor",
  ]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [resetTargetUser, setResetTargetUser] = useState<{ id: number; email: string } | null>(null);
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUserItem | null>(null);
  const [saving, setSaving] = useState(false);

  // Form Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [role, setRole] = useState("admin");

  useEffect(() => {
    fetchAdminUsers();
    fetchMetadata();
  }, []);

  const fetchMetadata = async () => {
    try {
      const [deptRes, iamRes] = await Promise.all([
        securityService.getDepartments(),
        securityService.getIamMatrix(),
      ]);
      if (deptRes?.departments) {
        setDepartments(deptRes.departments);
      }
      if (iamRes?.roles) {
        const staffRoles = iamRes.roles
          .map((r: { name: string }) => r.name)
          .filter((n: string) => n !== "student");
        if (staffRoles.length > 0) {
          setAvailableRoles(staffRoles);
        }
      }
    } catch (err) {
      console.error("Failed to load departments or roles:", err);
    }
  };

  const fetchAdminUsers = async () => {
    try {
      setLoading(true);
      // Fetch users with type=admin to exclude regular students
      const response = await apiClient.get("/users?type=admin&per_page=100");
      const resData = response.data;
      const list = resData?.data ? resData.data : Array.isArray(resData) ? resData : [];
      setUsers(list);
    } catch (err) {
      console.error("Failed to fetch admin users:", err);
      toast({
        title: "Error",
        description: "Failed to load administrative users.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingUser(null);
    setName("");
    setEmail("");
    setDepartmentId("");
    setRole(availableRoles[0] || "admin");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: AdminUserItem) => {
    setEditingUser(user);
    setName(user.name);
    setEmail(user.email);
    setDepartmentId(user.department_id ? user.department_id.toString() : "");
    setRole(user.role || "admin");
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      return toast({
        title: "Validation Error",
        description: "Name and Email are required.",
        variant: "destructive",
      });
    }

    try {
      setSaving(true);
      if (editingUser) {
        await apiClient.put(`/users/${editingUser.id}`, {
          name: name.trim(),
          email: email.trim(),
          role,
          department_id: departmentId ? parseInt(departmentId, 10) : null,
        });
        toast({
          title: "User Updated",
          description: `Account for ${name} updated successfully.`,
        });
      } else {
        await apiClient.post("/users", {
          name: name.trim(),
          email: email.trim(),
          role,
          department_id: departmentId ? parseInt(departmentId, 10) : null,
        });
        toast({
          title: "Admin Account Provisioned",
          description: `Welcome credentials dispatched to ${email}.`,
        });
      }

      setIsModalOpen(false);
      fetchAdminUsers();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast({
        title: "Action Failed",
        description: error.response?.data?.message || "Failed to save user account.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUnlock = async (userId: number) => {
    try {
      await securityService.unlockUser(userId);
      toast({
        title: "Account Unlocked",
        description: "User account lockout cleared.",
      });
      fetchAdminUsers();
    } catch {
      toast({
        title: "Unlock Failed",
        description: "Could not unlock user account.",
        variant: "destructive",
      });
    }
  };

  const confirmResetPassword = async () => {
    if (!resetTargetUser) return;
    const { id: userId, email: userEmail } = resetTargetUser;

    try {
      await apiClient.put(`/users/${userId}/reset-password`);
      toast({
        title: "Password Reset Dispatched",
        description: `A new temporary password has been dispatched to ${userEmail}.`,
      });
      fetchAdminUsers();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast({
        title: "Reset Failed",
        description: error.response?.data?.message || "Failed to reset password.",
        variant: "destructive",
      });
    } finally {
      setResetTargetUser(null);
    }
  };

  const filtered = users.filter((u) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q) ||
      (u.department?.name && u.department.name.toLowerCase().includes(q));

    const matchesDept =
      departmentFilter === "all" ||
      (departmentFilter === "none" && !u.department_id) ||
      u.department_id?.toString() === departmentFilter;

    const matchesRole = roleFilter === "all" || u.role === roleFilter;

    return matchesSearch && matchesDept && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <Card className="border border-slate-200 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#00aeef]/10 text-[#00aeef] flex items-center justify-center">
                  <FontAwesomeIcon icon={faUserShield} className="text-sm" />
                </div>
                Administrative & Staff Users
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 mt-1">
                Manage institutional staff, departmental affiliations, privileged access credentials, and security settings.
              </CardDescription>
            </div>

            <Button
              onClick={handleOpenAdd}
              className="bg-[#00aeef] hover:bg-[#008cc0] text-white text-xs font-bold rounded-xl h-10 px-4 shadow-sm"
            >
              <FontAwesomeIcon icon={faPlus} className="mr-2" />
              Onboard Admin User
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {/* Search & Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
            <div className="relative">
              <FontAwesomeIcon
                icon={faSearch}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"
              />
              <Input
                placeholder="Search staff by name, email, department, role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 text-xs bg-slate-50 border-slate-200 rounded-xl h-10"
              />
            </div>

            {/* Department Filter */}
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="text-xs bg-slate-50 border-slate-200 rounded-xl h-10">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="none">Unassigned Department</SelectItem>
                {departments.map((d) => (
                  <SelectItem key={d.id} value={d.id.toString()}>
                    {d.name} ({d.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Role Filter */}
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="text-xs bg-slate-50 border-slate-200 rounded-xl h-10">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {availableRoles.map((r) => (
                  <SelectItem key={r} value={r} className="capitalize">
                    {r.replace(/_/g, " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Users Directory Table */}
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3">
                <FontAwesomeIcon icon={faUserShield} className="text-lg" />
              </div>
              <h3 className="text-sm font-bold text-slate-700">No administrative users found</h3>
              <p className="text-xs text-slate-400 mt-1">
                Click "Onboard Admin User" above to provision institutional staff accounts.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
              {filtered.map((user) => (
                <div
                  key={user.id}
                  className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-bold text-sm flex items-center justify-center shrink-0">
                      {user.name.charAt(0).toUpperCase()}
                    </div>

                    {/* Details */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-slate-900 truncate">{user.name}</h4>

                        {/* Role Badge */}
                        <Badge className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-semibold capitalize">
                          {user.role.replace(/_/g, " ")}
                        </Badge>

                        {/* Department Badge */}
                        {user.department ? (
                          <Badge className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-semibold">
                            <FontAwesomeIcon icon={faBuilding} className="mr-1 text-[9px]" />
                            {user.department.name}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-slate-400 text-[10px]">
                            No Department
                          </Badge>
                        )}

                        {/* Security Badges */}
                        {user.must_change_password && (
                          <Badge className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-medium">
                            <FontAwesomeIcon icon={faKey} className="mr-1 text-[9px]" />
                            Temp Password
                          </Badge>
                        )}

                        {user.locked && (
                          <Badge className="bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold">
                            <FontAwesomeIcon icon={faLock} className="mr-1 text-[9px]" />
                            Account Locked
                          </Badge>
                        )}

                        {user.mfa_enabled && (
                          <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-medium">
                            <FontAwesomeIcon icon={faShieldHalved} className="mr-1 text-[9px]" />
                            MFA Active
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
                        <span className="flex items-center gap-1">
                          <FontAwesomeIcon icon={faEnvelope} className="text-[10px] text-slate-400" />
                          {user.email}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Joined {new Date(user.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {user.locked && (
                      <Button
                        size="sm"
                        onClick={() => handleUnlock(user.id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 px-2.5 rounded-lg"
                      >
                        <FontAwesomeIcon icon={faUnlock} className="mr-1 text-xs" />
                        Unlock
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setResetTargetUser({ id: user.id, email: user.email })}
                      className="text-slate-600 hover:text-slate-900 text-xs h-8 px-2.5 rounded-lg"
                      title="Issue new temporary password"
                    >
                      <FontAwesomeIcon icon={faRotateRight} className="mr-1 text-xs" />
                      Reset Pass
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenEdit(user)}
                      className="text-[#00aeef] hover:bg-blue-50 text-xs h-8 px-2.5 rounded-lg"
                    >
                      <FontAwesomeIcon icon={faEdit} className="mr-1 text-xs" />
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Onboard / Edit Admin Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 border border-slate-200 shadow-2xl rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-slate-900 via-[#0a3161] to-[#00aeef] p-6 text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                <FontAwesomeIcon icon={faUserShield} className="h-5 w-5 text-[#00aeef]" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-white">
                  {editingUser ? "Edit Administrative User" : "Onboard New Admin User"}
                </DialogTitle>
                <DialogDescription className="text-slate-200 text-xs mt-0.5">
                  {editingUser
                    ? "Update departmental assignment and privileged system role."
                    : "Provision institutional staff account with temporary credentials."}
                </DialogDescription>
              </div>
            </div>
          </div>

          <form onSubmit={handleSave} className="p-6 space-y-4">
            {!editingUser && (
              <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2.5 leading-relaxed">
                <FontAwesomeIcon icon={faShieldHalved} className="text-blue-500 shrink-0 mt-0.5 text-sm" />
                <div>
                  <strong>Automated Staff Provisioning:</strong> A secure temporary password and
                  activation link will be sent to the work email. The user will be required to set a permanent
                  password upon their first login.
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Full Name *</label>
              <Input
                placeholder="e.g. Farai Moyo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="text-xs bg-slate-50 border-slate-200 rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Work Email Address *</label>
              <Input
                type="email"
                placeholder="e.g. farai.moyo@zse.co.zw"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="text-xs bg-slate-50 border-slate-200 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Department */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Department</label>
                <Select value={departmentId} onValueChange={setDepartmentId}>
                  <SelectTrigger className="text-xs bg-slate-50 border-slate-200 rounded-xl">
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id.toString()} className="text-xs">
                        {dept.name} ({dept.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Staff Role */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Privileged Role</label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger className="text-xs bg-slate-50 border-slate-200 rounded-xl">
                    <SelectValue placeholder="Select Role" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRoles.map((r) => (
                      <SelectItem key={r} value={r} className="text-xs capitalize">
                        {r.replace(/_/g, " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="text-xs rounded-xl h-10 px-4"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-[#00aeef] hover:bg-[#008cc0] text-white text-xs font-bold rounded-xl h-10 px-5 shadow-sm"
              >
                {saving ? "Saving..." : editingUser ? "Update User" : "Provision Account"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modern In-App Password Reset Confirmation */}
      <AlertDialog
        open={!!resetTargetUser}
        onOpenChange={(open) => !open && setResetTargetUser(null)}
      >
        <AlertDialogContent className="max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100">
          <AlertDialogHeader>
            <div className="w-12 h-12 rounded-full bg-blue-100 text-[#00aeef] flex items-center justify-center mb-3">
              <FontAwesomeIcon icon={faRotateRight} className="text-lg" />
            </div>
            <AlertDialogTitle className="text-lg font-bold text-slate-900">
              Reset Administrator Password?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-slate-600 leading-relaxed">
              Are you sure you want to reset the password for <strong>{resetTargetUser?.email}</strong>? 
              A new high-entropy temporary password will be issued and dispatched to their email address.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-5 gap-2 sm:gap-0">
            <AlertDialogCancel className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold h-9 px-4">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmResetPassword}
              className="bg-[#00aeef] hover:bg-[#008cc0] text-white rounded-xl text-xs font-bold h-9 px-5 shadow-sm"
            >
              Reset & Dispatch
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ManageAdminUsers;

