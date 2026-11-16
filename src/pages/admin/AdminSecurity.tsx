import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShieldHalved,
  faKey,
  faEnvelope,
  faClock,
  faUserLock,
  faUsersGear,
  faCheck,
  faFloppyDisk,
  faUnlock,
  faInfoCircle,
  faUserTie,
  faGraduationCap,
  faLock,
} from "@fortawesome/free-solid-svg-icons";
import {
  securityService,
  ScopeSecuritySetting,
  RoleWithPermissions,
  PermissionItem,
  Department,
  LockedUser,
} from "@/services/security.service";

export const AdminSecurity: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Settings for Staff and Student
  const [staffSettings, setStaffSettings] = useState<ScopeSecuritySetting>({
    scope: "staff",
    min_password_length: 12,
    require_uppercase: true,
    require_lowercase: true,
    require_numbers: true,
    require_special_characters: true,
    password_expiry_days: 90,
    password_history_limit: 5,
    mfa_enabled: false,
    session_idle_timeout_minutes: 15,
    max_login_attempts: 3,
    lockout_duration_minutes: 30,
    strict_admin_unlock: false,
  });

  const [studentSettings, setStudentSettings] = useState<ScopeSecuritySetting>({
    scope: "student",
    min_password_length: 8,
    require_uppercase: true,
    require_lowercase: true,
    require_numbers: true,
    require_special_characters: false,
    password_expiry_days: 0,
    password_history_limit: 1,
    mfa_enabled: false,
    session_idle_timeout_minutes: 120,
    max_login_attempts: 5,
    lockout_duration_minutes: 30,
    strict_admin_unlock: false,
  });

  // IAM Matrix state
  const [roles, setRoles] = useState<RoleWithPermissions[]>([]);
  const [permissionsByDomain, setPermissionsByDomain] = useState<Record<string, PermissionItem[]>>({});
  const [rolePermissionsMap, setRolePermissionsMap] = useState<Record<number, Set<string>>>({});

  // Locked users
  const [lockedUsers, setLockedUsers] = useState<LockedUser[]>([]);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [settingsRes, iamRes, lockedRes] = await Promise.all([
        securityService.getSettings(),
        securityService.getIamMatrix(),
        securityService.getLockedUsers(),
      ]);

      if (settingsRes?.settings) {
        setStaffSettings(settingsRes.settings.staff);
        setStudentSettings(settingsRes.settings.student);
      }

      if (iamRes?.roles) {
        setRoles(iamRes.roles);
        setPermissionsByDomain(iamRes.permissions_by_domain || {});

        // Build active permissions mapping for each role
        const map: Record<number, Set<string>> = {};
        iamRes.roles.forEach((r) => {
          map[r.id] = new Set(r.permissions.map((p) => p.name));
        });
        setRolePermissionsMap(map);
      }

      if (lockedRes?.locked_users) {
        setLockedUsers(lockedRes.locked_users);
      }
    } catch (err) {
      console.error("Failed to load security settings:", err);
      toast({
        title: "Error loading security settings",
        description: "Please check your network connection and credentials.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSavePolicy = async (scope: "staff" | "student") => {
    try {
      setSaving(true);
      const target = scope === "staff" ? staffSettings : studentSettings;
      await securityService.updateSettings(target);
      toast({
        title: "Security Policy Saved",
        description: `${scope === "staff" ? "Staff & Instructor" : "Student"} configuration updated successfully.`,
      });
    } catch (err) {
      console.error("Save failed:", err);
      toast({
        title: "Save Failed",
        description: "Failed to update security configuration.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const togglePermission = (roleId: number, permName: string) => {
    setRolePermissionsMap((prev) => {
      const roleSet = new Set(prev[roleId] || []);
      if (roleSet.has(permName)) {
        roleSet.delete(permName);
      } else {
        roleSet.add(permName);
      }
      return { ...prev, [roleId]: roleSet };
    });
  };

  const handleSaveRolePermissions = async (role: RoleWithPermissions) => {
    try {
      setSaving(true);
      const permsArray = Array.from(rolePermissionsMap[role.id] || []);
      await securityService.updateRolePermissions(role.id, permsArray);
      toast({
        title: "Permissions Saved",
        description: `Permissions for role '${role.name}' updated successfully.`,
      });
    } catch (err: any) {
      toast({
        title: "Update Failed",
        description: err?.response?.data?.message || "Failed to update role permissions.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUnlockUser = async (user: LockedUser) => {
    try {
      await securityService.unlockUser(user.id);
      setLockedUsers((prev) => prev.filter((u) => u.id !== user.id));
      toast({
        title: "Account Unlocked",
        description: `Account for ${user.name} (${user.email}) has been unlocked.`,
      });
    } catch (err) {
      toast({
        title: "Unlock Failed",
        description: "Failed to unlock account.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-10 w-64 rounded-xl" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-[#0a3161] to-[#00aeef] rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <FontAwesomeIcon icon={faShieldHalved} className="h-5 w-5 text-[#00aeef]" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Institutional Security & IAM Governance</h2>
              <p className="text-xs text-slate-200 mt-0.5">
                Manage password complexity, Multi-Factor Authentication (MFA), session timeouts,
                and enterprise IAM policies.
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-white/10 text-white border-white/20 text-xs px-3 py-1">
            OWASP Top 10 Compliant
          </Badge>
          <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30 text-xs px-3 py-1">
            Zero-Trust Active
          </Badge>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="complexity" className="w-full">
        <TabsList className="bg-slate-100 p-1 rounded-xl grid grid-cols-2 md:grid-cols-5 gap-1 mb-6">
          <TabsTrigger
            value="complexity"
            className="text-xs font-bold rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
          >
            <FontAwesomeIcon icon={faKey} className="mr-2 text-xs" />
            Password Complexity
          </TabsTrigger>
          <TabsTrigger
            value="mfa"
            className="text-xs font-bold rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
          >
            <FontAwesomeIcon icon={faEnvelope} className="mr-2 text-xs" />
            MFA Policies
          </TabsTrigger>
          <TabsTrigger
            value="session"
            className="text-xs font-bold rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
          >
            <FontAwesomeIcon icon={faClock} className="mr-2 text-xs" />
            Session Timeouts
          </TabsTrigger>
          <TabsTrigger
            value="lockout"
            className="text-xs font-bold rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
          >
            <FontAwesomeIcon icon={faUserLock} className="mr-2 text-xs" />
            Account Lockouts ({lockedUsers.length})
          </TabsTrigger>
          <TabsTrigger
            value="iam"
            className="text-xs font-bold rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
          >
            <FontAwesomeIcon icon={faUsersGear} className="mr-2 text-xs" />
            IAM Matrix
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: PASSWORD COMPLEXITY */}
        <TabsContent value="complexity" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Staff / Instructor Card */}
            <Card className="border border-slate-200 shadow-sm">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faUserTie} className="text-[#00aeef]" />
                    <CardTitle className="text-sm font-bold text-slate-900">
                      Staff & Faculty Password Policy
                    </CardTitle>
                  </div>
                  <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[10px]">
                    Privileged Access
                  </Badge>
                </div>
                <CardDescription className="text-xs text-slate-500">
                  Applies to Administrators, Faculty, and Staff accounts.
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-4 space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>Minimum Password Length</span>
                    <span className="text-[#00aeef] font-bold">
                      {staffSettings.min_password_length} chars
                    </span>
                  </div>
                  <Input
                    type="number"
                    min={8}
                    max={32}
                    value={staffSettings.min_password_length}
                    onChange={(e) =>
                      setStaffSettings({
                        ...staffSettings,
                        min_password_length: parseInt(e.target.value) || 8,
                      })
                    }
                    className="text-xs bg-slate-50"
                  />
                </div>

                <div className="divide-y divide-slate-100">
                  <div className="py-2.5 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-slate-800">
                        Require Uppercase Letters [A-Z]
                      </div>
                      <div className="text-[11px] text-slate-400">Must include capital letters</div>
                    </div>
                    <Switch
                      checked={staffSettings.require_uppercase}
                      onCheckedChange={(val) =>
                        setStaffSettings({ ...staffSettings, require_uppercase: val })
                      }
                    />
                  </div>

                  <div className="py-2.5 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-slate-800">
                        Require Lowercase Letters [a-z]
                      </div>
                      <div className="text-[11px] text-slate-400">Must include lowercase letters</div>
                    </div>
                    <Switch
                      checked={staffSettings.require_lowercase}
                      onCheckedChange={(val) =>
                        setStaffSettings({ ...staffSettings, require_lowercase: val })
                      }
                    />
                  </div>

                  <div className="py-2.5 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-slate-800">
                        Require Numeric Digits [0-9]
                      </div>
                      <div className="text-[11px] text-slate-400">Must include numbers</div>
                    </div>
                    <Switch
                      checked={staffSettings.require_numbers}
                      onCheckedChange={(val) =>
                        setStaffSettings({ ...staffSettings, require_numbers: val })
                      }
                    />
                  </div>

                  <div className="py-2.5 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-slate-800">
                        Require Special Characters (!@#$%...)
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Mandatory symbol character inclusion
                      </div>
                    </div>
                    <Switch
                      checked={staffSettings.require_special_characters}
                      onCheckedChange={(val) =>
                        setStaffSettings({
                          ...staffSettings,
                          require_special_characters: val,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Password Rotation (Days)
                    </label>
                    <Input
                      type="number"
                      min={0}
                      max={365}
                      value={staffSettings.password_expiry_days}
                      onChange={(e) =>
                        setStaffSettings({
                          ...staffSettings,
                          password_expiry_days: parseInt(e.target.value) || 0,
                        })
                      }
                      className="text-xs bg-slate-50"
                    />
                    <span className="text-[10px] text-slate-400">0 = Never expires</span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">
                      History Reuse Limit
                    </label>
                    <Input
                      type="number"
                      min={0}
                      max={24}
                      value={staffSettings.password_history_limit}
                      onChange={(e) =>
                        setStaffSettings({
                          ...staffSettings,
                          password_history_limit: parseInt(e.target.value) || 0,
                        })
                      }
                      className="text-xs bg-slate-50"
                    />
                    <span className="text-[10px] text-slate-400">Prevents previous passwords</span>
                  </div>
                </div>

                <Button
                  onClick={() => handleSavePolicy("staff")}
                  disabled={saving}
                  className="w-full bg-[#00aeef] hover:bg-[#008cc0] text-white text-xs font-bold rounded-xl h-10 mt-2"
                >
                  <FontAwesomeIcon icon={faFloppyDisk} className="mr-2" />
                  Save Staff Password Policy
                </Button>
              </CardContent>
            </Card>

            {/* Student / Public Card */}
            <Card className="border border-slate-200 shadow-sm">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faGraduationCap} className="text-emerald-600" />
                    <CardTitle className="text-sm font-bold text-slate-900">
                      Student & Public Password Policy
                    </CardTitle>
                  </div>
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                    Learner Access
                  </Badge>
                </div>
                <CardDescription className="text-xs text-slate-500">
                  Applies to self-registered student and investor accounts.
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-4 space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>Minimum Password Length</span>
                    <span className="text-emerald-600 font-bold">
                      {studentSettings.min_password_length} chars
                    </span>
                  </div>
                  <Input
                    type="number"
                    min={6}
                    max={32}
                    value={studentSettings.min_password_length}
                    onChange={(e) =>
                      setStudentSettings({
                        ...studentSettings,
                        min_password_length: parseInt(e.target.value) || 6,
                      })
                    }
                    className="text-xs bg-slate-50"
                  />
                </div>

                <div className="divide-y divide-slate-100">
                  <div className="py-2.5 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-slate-800">
                        Require Uppercase Letters [A-Z]
                      </div>
                      <div className="text-[11px] text-slate-400">Must include capital letters</div>
                    </div>
                    <Switch
                      checked={studentSettings.require_uppercase}
                      onCheckedChange={(val) =>
                        setStudentSettings({ ...studentSettings, require_uppercase: val })
                      }
                    />
                  </div>

                  <div className="py-2.5 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-slate-800">
                        Require Lowercase Letters [a-z]
                      </div>
                      <div className="text-[11px] text-slate-400">Must include lowercase letters</div>
                    </div>
                    <Switch
                      checked={studentSettings.require_lowercase}
                      onCheckedChange={(val) =>
                        setStudentSettings({ ...studentSettings, require_lowercase: val })
                      }
                    />
                  </div>

                  <div className="py-2.5 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-slate-800">
                        Require Numeric Digits [0-9]
                      </div>
                      <div className="text-[11px] text-slate-400">Must include numbers</div>
                    </div>
                    <Switch
                      checked={studentSettings.require_numbers}
                      onCheckedChange={(val) =>
                        setStudentSettings({ ...studentSettings, require_numbers: val })
                      }
                    />
                  </div>

                  <div className="py-2.5 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-slate-800">
                        Require Special Characters (!@#$%...)
                      </div>
                      <div className="text-[11px] text-slate-400">Optional for public users</div>
                    </div>
                    <Switch
                      checked={studentSettings.require_special_characters}
                      onCheckedChange={(val) =>
                        setStudentSettings({
                          ...studentSettings,
                          require_special_characters: val,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Password Rotation (Days)
                    </label>
                    <Input
                      type="number"
                      min={0}
                      max={365}
                      value={studentSettings.password_expiry_days}
                      onChange={(e) =>
                        setStudentSettings({
                          ...studentSettings,
                          password_expiry_days: parseInt(e.target.value) || 0,
                        })
                      }
                      className="text-xs bg-slate-50"
                    />
                    <span className="text-[10px] text-slate-400">0 = Disabled</span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">
                      History Reuse Limit
                    </label>
                    <Input
                      type="number"
                      min={0}
                      max={24}
                      value={studentSettings.password_history_limit}
                      onChange={(e) =>
                        setStudentSettings({
                          ...studentSettings,
                          password_history_limit: parseInt(e.target.value) || 0,
                        })
                      }
                      className="text-xs bg-slate-50"
                    />
                    <span className="text-[10px] text-slate-400">Previous passwords blocked</span>
                  </div>
                </div>

                <Button
                  onClick={() => handleSavePolicy("student")}
                  disabled={saving}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl h-10 mt-2"
                >
                  <FontAwesomeIcon icon={faFloppyDisk} className="mr-2" />
                  Save Student Password Policy
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB 2: MULTI-FACTOR AUTHENTICATION (MFA) */}
        <TabsContent value="mfa" className="space-y-6">
          <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl text-xs text-blue-900 flex items-start gap-3">
            <FontAwesomeIcon icon={faInfoCircle} className="text-blue-500 text-base mt-0.5 shrink-0" />
            <div>
              <strong>Multi-Factor Authentication (MFA) Architecture:</strong> When MFA is toggled
              ON for a user group, logging in with an email and password triggers a 6-digit
              cryptographic verification code delivered via institutional email. The user must
              confirm this code within 5 minutes before full session authorization is granted.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Staff MFA Card */}
            <Card className="border border-slate-200 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                      <FontAwesomeIcon icon={faUserTie} className="text-xs" />
                    </div>
                    <CardTitle className="text-sm font-bold text-slate-900">
                      Faculty & Admin MFA
                    </CardTitle>
                  </div>
                  <Badge
                    className={
                      staffSettings.mfa_enabled
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-slate-100 text-slate-600"
                    }
                  >
                    {staffSettings.mfa_enabled ? "MFA Enforced" : "MFA Disabled"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-800">
                      Require MFA for Staff & Faculty
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Enforce 6-digit email OTP for all administrator and instructor logins.
                    </div>
                  </div>
                  <Switch
                    checked={staffSettings.mfa_enabled}
                    onCheckedChange={(val) =>
                      setStaffSettings({ ...staffSettings, mfa_enabled: val })
                    }
                  />
                </div>

                <Button
                  onClick={() => handleSavePolicy("staff")}
                  disabled={saving}
                  className="w-full bg-[#00aeef] hover:bg-[#008cc0] text-white text-xs font-bold rounded-xl h-10"
                >
                  <FontAwesomeIcon icon={faFloppyDisk} className="mr-2" />
                  Save Staff MFA Configuration
                </Button>
              </CardContent>
            </Card>

            {/* Student MFA Card */}
            <Card className="border border-slate-200 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <FontAwesomeIcon icon={faGraduationCap} className="text-xs" />
                    </div>
                    <CardTitle className="text-sm font-bold text-slate-900">
                      Student & Learner MFA
                    </CardTitle>
                  </div>
                  <Badge
                    className={
                      studentSettings.mfa_enabled
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-slate-100 text-slate-600"
                    }
                  >
                    {studentSettings.mfa_enabled ? "MFA Enforced" : "MFA Disabled"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-800">
                      Require MFA for Students
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Enforce 6-digit email OTP for public student and investor sign-ins.
                    </div>
                  </div>
                  <Switch
                    checked={studentSettings.mfa_enabled}
                    onCheckedChange={(val) =>
                      setStudentSettings({ ...studentSettings, mfa_enabled: val })
                    }
                  />
                </div>

                <Button
                  onClick={() => handleSavePolicy("student")}
                  disabled={saving}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl h-10"
                >
                  <FontAwesomeIcon icon={faFloppyDisk} className="mr-2" />
                  Save Student MFA Configuration
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB 3: SESSION IDLE TIMEOUTS */}
        <TabsContent value="session" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Staff Session Timeout */}
            <Card className="border border-slate-200 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <FontAwesomeIcon icon={faClock} className="text-[#00aeef]" />
                    Staff Session Idle Timeout
                  </CardTitle>
                  <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                    {staffSettings.session_idle_timeout_minutes} Minutes
                  </Badge>
                </div>
                <CardDescription className="text-xs text-slate-500">
                  Automatic termination of unattended administrative and instructor sessions.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Inactivity Threshold (Minutes)
                  </label>
                  <Input
                    type="number"
                    min={5}
                    max={120}
                    value={staffSettings.session_idle_timeout_minutes}
                    onChange={(e) =>
                      setStaffSettings({
                        ...staffSettings,
                        session_idle_timeout_minutes: parseInt(e.target.value) || 15,
                      })
                    }
                    className="text-xs bg-slate-50"
                  />
                  <p className="text-[11px] text-slate-400">
                    Recommended: 15 to 30 minutes for institutional PCI/OWASP compliance.
                  </p>
                </div>

                <Button
                  onClick={() => handleSavePolicy("staff")}
                  disabled={saving}
                  className="w-full bg-[#00aeef] hover:bg-[#008cc0] text-white text-xs font-bold rounded-xl h-10"
                >
                  <FontAwesomeIcon icon={faFloppyDisk} className="mr-2" />
                  Save Staff Session Timeout
                </Button>
              </CardContent>
            </Card>

            {/* Student Session Timeout */}
            <Card className="border border-slate-200 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <FontAwesomeIcon icon={faClock} className="text-emerald-600" />
                    Student Session Idle Timeout
                  </CardTitle>
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
                    {studentSettings.session_idle_timeout_minutes} Minutes
                  </Badge>
                </div>
                <CardDescription className="text-xs text-slate-500">
                  Inactivity threshold before public student sessions are safely logged out.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Inactivity Threshold (Minutes)
                  </label>
                  <Input
                    type="number"
                    min={15}
                    max={480}
                    value={studentSettings.session_idle_timeout_minutes}
                    onChange={(e) =>
                      setStudentSettings({
                        ...studentSettings,
                        session_idle_timeout_minutes: parseInt(e.target.value) || 120,
                      })
                    }
                    className="text-xs bg-slate-50"
                  />
                  <p className="text-[11px] text-slate-400">
                    Recommended: 60 to 180 minutes to avoid interrupting course examinations.
                  </p>
                </div>

                <Button
                  onClick={() => handleSavePolicy("student")}
                  disabled={saving}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl h-10"
                >
                  <FontAwesomeIcon icon={faFloppyDisk} className="mr-2" />
                  Save Student Session Timeout
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB 4: ACCOUNT LOCKOUTS & UNLOCKS */}
        <TabsContent value="lockout" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Lockout Configuration Card */}
            <Card className="border border-slate-200 shadow-sm lg:col-span-1">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FontAwesomeIcon icon={faUserLock} className="text-[#00aeef]" />
                  Lockout Policy Rules
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Brute-force protection thresholds.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Staff Max Failed Attempts
                  </label>
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    value={staffSettings.max_login_attempts}
                    onChange={(e) =>
                      setStaffSettings({
                        ...staffSettings,
                        max_login_attempts: parseInt(e.target.value) || 3,
                      })
                    }
                    className="text-xs bg-slate-50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Student Max Failed Attempts
                  </label>
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    value={studentSettings.max_login_attempts}
                    onChange={(e) =>
                      setStudentSettings({
                        ...studentSettings,
                        max_login_attempts: parseInt(e.target.value) || 5,
                      })
                    }
                    className="text-xs bg-slate-50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Lockout Cooldown (Minutes)
                  </label>
                  <Input
                    type="number"
                    min={5}
                    max={1440}
                    value={staffSettings.lockout_duration_minutes}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 30;
                      setStaffSettings({ ...staffSettings, lockout_duration_minutes: val });
                      setStudentSettings({ ...studentSettings, lockout_duration_minutes: val });
                    }}
                    className="text-xs bg-slate-50"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                  <div>
                    <div className="text-xs font-semibold text-slate-800">
                      Strict Admin Unlock Only
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Disables auto-cooldown; admin must unlock
                    </div>
                  </div>
                  <Switch
                    checked={staffSettings.strict_admin_unlock}
                    onCheckedChange={(val) => {
                      setStaffSettings({ ...staffSettings, strict_admin_unlock: val });
                      setStudentSettings({ ...studentSettings, strict_admin_unlock: val });
                    }}
                  />
                </div>

                <Button
                  onClick={async () => {
                    await handleSavePolicy("staff");
                    await handleSavePolicy("student");
                  }}
                  disabled={saving}
                  className="w-full bg-[#00aeef] hover:bg-[#008cc0] text-white text-xs font-bold rounded-xl h-10 mt-2"
                >
                  <FontAwesomeIcon icon={faFloppyDisk} className="mr-2" />
                  Save Lockout Rules
                </Button>
              </CardContent>
            </Card>

            {/* Currently Locked Accounts Table */}
            <Card className="border border-slate-200 shadow-sm lg:col-span-2">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold text-slate-900">
                    Locked User Accounts
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Accounts currently locked after exceeding failed login attempt thresholds.
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-xs">
                  {lockedUsers.length} Locked
                </Badge>
              </CardHeader>

              <CardContent>
                {lockedUsers.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                      <FontAwesomeIcon icon={faCheck} />
                    </div>
                    <div className="text-xs font-bold text-slate-700">No Locked Accounts</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      All platform accounts are currently in good standing.
                    </div>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                    {lockedUsers.map((u) => (
                      <div
                        key={u.id}
                        className="p-3 flex items-center justify-between gap-4 hover:bg-slate-50 text-xs"
                      >
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-2">
                            {u.name}
                            <Badge className="bg-red-100 text-red-800 text-[10px]">
                              {u.login_attempts} Failed Attempts
                            </Badge>
                            {u.role && (
                              <Badge className="bg-slate-100 text-slate-700 text-[10px]">
                                {u.role}
                              </Badge>
                            )}
                          </div>
                          <div className="text-slate-500 text-[11px] mt-0.5">{u.email}</div>
                        </div>

                        <Button
                          size="sm"
                          onClick={() => handleUnlockUser(u)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 px-3 rounded-lg"
                        >
                          <FontAwesomeIcon icon={faUnlock} className="mr-1.5" />
                          Unlock Account
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB 5: IAM PERMISSION MATRIX */}
        <TabsContent value="iam" className="space-y-6">
          <Card className="border border-slate-200 shadow-sm">
            <CardHeader className="pb-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FontAwesomeIcon icon={faUsersGear} className="text-[#00aeef]" />
                  Enterprise Role & Permissions Matrix
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Granular functional permission assignment across system roles. Super Admin
                  automatically retains all capabilities.
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Domain Sections */}
              {Object.entries(permissionsByDomain).map(([domain, permissions]) => (
                <div key={domain} className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-slate-50 px-4 py-2.5 font-bold text-xs text-slate-800 uppercase tracking-wider border-b border-slate-200 flex items-center justify-between">
                    <span>{domain.toUpperCase()} DOMAIN</span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      {permissions.length} capabilities
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-slate-100/50 text-slate-600 border-b border-slate-200">
                          <th className="py-2.5 px-4 font-semibold w-1/3">Capability</th>
                          {roles.map((r) => (
                            <th key={r.id} className="py-2.5 px-3 text-center font-semibold">
                              {r.name}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {permissions.map((perm) => (
                          <tr key={perm.id} className="hover:bg-slate-50/50">
                            <td className="py-2 px-4">
                              <div className="font-semibold text-slate-800">{perm.label}</div>
                              <div className="text-[10px] text-slate-400 font-mono">
                                {perm.name}
                              </div>
                            </td>
                            {roles.map((r) => {
                              const isSuperAdmin = r.name === "super_admin";
                              const isChecked = isSuperAdmin || (rolePermissionsMap[r.id]?.has(perm.name) ?? false);

                              return (
                                <td key={r.id} className="py-2 px-3 text-center">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    disabled={isSuperAdmin}
                                    onChange={() => togglePermission(r.id, perm.name)}
                                    className="h-4 w-4 rounded border-slate-300 text-[#00aeef] focus:ring-[#00aeef] cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
                                  />
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}

              {/* Role Save Buttons */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-slate-600">
                  Save permission changes for specific system roles:
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {roles
                    .filter((r) => r.name !== "super_admin")
                    .map((r) => (
                      <Button
                        key={r.id}
                        size="sm"
                        disabled={saving}
                        onClick={() => handleSaveRolePermissions(r)}
                        className="text-xs bg-[#00aeef] hover:bg-[#008cc0] text-white rounded-lg h-8 px-3"
                      >
                        <FontAwesomeIcon icon={faFloppyDisk} className="mr-1.5" />
                        Save {r.name}
                      </Button>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSecurity;
