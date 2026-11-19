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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import {
  securityService,
  ScopeSecuritySetting,
  RoleWithPermissions,
  PermissionItem,
  Department,
  LockedUser,
} from "@/services/security.service";

interface ComplexityCardProps {
  title: string;
  description: string;
  icon: any;
  iconColor: string;
  badgeLabel: string;
  badgeClass: string;
  buttonClass: string;
  settings: ScopeSecuritySetting;
  onChange: (updated: ScopeSecuritySetting) => void;
  onSave: () => void;
  saving: boolean;
}

const ComplexityPolicyCard: React.FC<ComplexityCardProps> = ({
  title,
  description,
  icon,
  iconColor,
  badgeLabel,
  badgeClass,
  buttonClass,
  settings,
  onChange,
  onSave,
  saving,
}) => (
  <Card className="border border-slate-200 shadow-sm flex flex-col justify-between">
    <div>
      <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={icon} className={iconColor} />
            <CardTitle className="text-sm font-bold text-slate-900">{title}</CardTitle>
          </div>
          <Badge className={badgeClass}>{badgeLabel}</Badge>
        </div>
        <CardDescription className="text-xs text-slate-500">{description}</CardDescription>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-semibold text-slate-700">
            <span>Minimum Password Length</span>
            <span className={`font-bold ${iconColor}`}>{settings.min_password_length} chars</span>
          </div>
          <Input
            type="number"
            min={6}
            max={32}
            value={settings.min_password_length}
            onChange={(e) =>
              onChange({ ...settings, min_password_length: parseInt(e.target.value) || 8 })
            }
            className="text-xs bg-slate-50"
          />
        </div>

        <div className="divide-y divide-slate-100">
          <div className="py-2.5 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-800">Require Uppercase Letters [A-Z]</div>
              <div className="text-[11px] text-slate-400">Must include capital letters</div>
            </div>
            <Switch
              checked={settings.require_uppercase}
              onCheckedChange={(val) => onChange({ ...settings, require_uppercase: val })}
            />
          </div>

          <div className="py-2.5 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-800">Require Lowercase Letters [a-z]</div>
              <div className="text-[11px] text-slate-400">Must include lowercase letters</div>
            </div>
            <Switch
              checked={settings.require_lowercase}
              onCheckedChange={(val) => onChange({ ...settings, require_lowercase: val })}
            />
          </div>

          <div className="py-2.5 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-800">Require Numeric Digits [0-9]</div>
              <div className="text-[11px] text-slate-400">Must include numbers</div>
            </div>
            <Switch
              checked={settings.require_numbers}
              onCheckedChange={(val) => onChange({ ...settings, require_numbers: val })}
            />
          </div>

          <div className="py-2.5 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-800">Require Special Characters (!@#$%...)</div>
              <div className="text-[11px] text-slate-400">Mandatory symbol character inclusion</div>
            </div>
            <Switch
              checked={settings.require_special_characters}
              onCheckedChange={(val) => onChange({ ...settings, require_special_characters: val })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Password Rotation (Days)</label>
            <Input
              type="number"
              min={0}
              max={365}
              value={settings.password_expiry_days}
              onChange={(e) =>
                onChange({ ...settings, password_expiry_days: parseInt(e.target.value) || 0 })
              }
              className="text-xs bg-slate-50"
            />
            <span className="text-[10px] text-slate-400">0 = Never expires</span>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">History Reuse Limit</label>
            <Input
              type="number"
              min={0}
              max={24}
              value={settings.password_history_limit}
              onChange={(e) =>
                onChange({ ...settings, password_history_limit: parseInt(e.target.value) || 0 })
              }
              className="text-xs bg-slate-50"
            />
            <span className="text-[10px] text-slate-400">Prevents previous passwords</span>
          </div>
        </div>
      </CardContent>
    </div>

    <div className="p-6 pt-0">
      <Button
        onClick={onSave}
        disabled={saving}
        className={`w-full text-white text-xs font-bold rounded-xl h-10 ${buttonClass}`}
      >
        <FontAwesomeIcon icon={faFloppyDisk} className="mr-2" />
        Save {title}
      </Button>
    </div>
  </Card>
);

interface MfaCardProps {
  title: string;
  scopeLabel: string;
  icon: any;
  iconColor: string;
  iconBg: string;
  buttonClass: string;
  settings: ScopeSecuritySetting;
  onChange: (updated: ScopeSecuritySetting) => void;
  onSave: () => void;
  saving: boolean;
}

const MfaPolicyCard: React.FC<MfaCardProps> = ({
  title,
  scopeLabel,
  icon,
  iconColor,
  iconBg,
  buttonClass,
  settings,
  onChange,
  onSave,
  saving,
}) => (
  <Card className="border border-slate-200 shadow-sm flex flex-col justify-between">
    <div>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg ${iconBg} ${iconColor} flex items-center justify-center`}>
              <FontAwesomeIcon icon={icon} className="text-xs" />
            </div>
            <CardTitle className="text-sm font-bold text-slate-900">{title}</CardTitle>
          </div>
          <Badge className={settings.mfa_enabled ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}>
            {settings.mfa_enabled ? "MFA Enforced" : "MFA Disabled"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-slate-50 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-800">Require MFA for {scopeLabel}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Enforce 6-digit email OTP for {scopeLabel.toLowerCase()} authentication.
            </div>
          </div>
          <Switch
            checked={settings.mfa_enabled}
            onCheckedChange={(val) => onChange({ ...settings, mfa_enabled: val })}
          />
        </div>
      </CardContent>
    </div>
    <div className="p-6 pt-0">
      <Button
        onClick={onSave}
        disabled={saving}
        className={`w-full text-white text-xs font-bold rounded-xl h-10 ${buttonClass}`}
      >
        <FontAwesomeIcon icon={faFloppyDisk} className="mr-2" />
        Save {title}
      </Button>
    </div>
  </Card>
);

interface SessionCardProps {
  title: string;
  description: string;
  icon: any;
  iconColor: string;
  badgeClass: string;
  buttonClass: string;
  hint: string;
  min: number;
  max: number;
  settings: ScopeSecuritySetting;
  onChange: (updated: ScopeSecuritySetting) => void;
  onSave: () => void;
  saving: boolean;
}

const SessionTimeoutCard: React.FC<SessionCardProps> = ({
  title,
  description,
  icon,
  iconColor,
  badgeClass,
  buttonClass,
  hint,
  min,
  max,
  settings,
  onChange,
  onSave,
  saving,
}) => (
  <Card className="border border-slate-200 shadow-sm flex flex-col justify-between">
    <div>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <FontAwesomeIcon icon={icon} className={iconColor} />
            {title}
          </CardTitle>
          <Badge className={badgeClass}>{settings.session_idle_timeout_minutes} Minutes</Badge>
        </div>
        <CardDescription className="text-xs text-slate-500">{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700">Inactivity Threshold (Minutes)</label>
          <Input
            type="number"
            min={min}
            max={max}
            value={settings.session_idle_timeout_minutes}
            onChange={(e) =>
              onChange({
                ...settings,
                session_idle_timeout_minutes: parseInt(e.target.value) || min,
              })
            }
            className="text-xs bg-slate-50"
          />
          <p className="text-[11px] text-slate-400">{hint}</p>
        </div>
      </CardContent>
    </div>
    <div className="p-6 pt-0">
      <Button
        onClick={onSave}
        disabled={saving}
        className={`w-full text-white text-xs font-bold rounded-xl h-10 ${buttonClass}`}
      >
        <FontAwesomeIcon icon={faFloppyDisk} className="mr-2" />
        Save {title}
      </Button>
    </div>
  </Card>
);

export const AdminSecurity: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Distinct Three-Tier Security Settings for Admin, Instructor, and Student
  const [adminSettings, setAdminSettings] = useState<ScopeSecuritySetting>({
    scope: "admin",
    min_password_length: 14,
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
    strict_admin_unlock: true,
  });

  const [instructorSettings, setInstructorSettings] = useState<ScopeSecuritySetting>({
    scope: "instructor",
    min_password_length: 12,
    require_uppercase: true,
    require_lowercase: true,
    require_numbers: true,
    require_special_characters: true,
    password_expiry_days: 90,
    password_history_limit: 5,
    mfa_enabled: false,
    session_idle_timeout_minutes: 30,
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
  const [isAddRoleOpen, setIsAddRoleOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [creatingRole, setCreatingRole] = useState(false);

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
        if (settingsRes.settings.admin) setAdminSettings(settingsRes.settings.admin);
        else if (settingsRes.settings.staff) setAdminSettings(settingsRes.settings.staff);

        if (settingsRes.settings.instructor) setInstructorSettings(settingsRes.settings.instructor);
        if (settingsRes.settings.student) setStudentSettings(settingsRes.settings.student);
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

  const handleSavePolicy = async (scope: "admin" | "instructor" | "student" | "staff") => {
    try {
      setSaving(true);
      const target =
        scope === "admin"
          ? adminSettings
          : scope === "instructor"
          ? instructorSettings
          : scope === "student"
          ? studentSettings
          : adminSettings;

      await securityService.updateSettings(target);
      const label =
        scope === "admin"
          ? "Administrator"
          : scope === "instructor"
          ? "Instructor & Faculty"
          : scope === "student"
          ? "Student"
          : "Staff";

      toast({
        title: "Security Policy Saved",
        description: `${label} configuration updated successfully.`,
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

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) {
      return toast({
        title: "Validation Error",
        description: "Role Name is required.",
        variant: "destructive",
      });
    }

    try {
      setCreatingRole(true);
      await securityService.createRole({ name: newRoleName.trim() });
      toast({
        title: "Role Created",
        description: `Role '${newRoleName.trim()}' has been added to the IAM matrix.`,
      });
      setNewRoleName("");
      setIsAddRoleOpen(false);
      loadAllData();
    } catch (err: any) {
      toast({
        title: "Role Creation Failed",
        description: err?.response?.data?.message || "Failed to create new role.",
        variant: "destructive",
      });
    } finally {
      setCreatingRole(false);
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

        {/* TAB 1: PASSWORD COMPLEXITY (THREE-TIER SCOPES) */}
        <TabsContent value="complexity" className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Tier 1: Administrator Policy */}
            <ComplexityPolicyCard
              title="Administrator Policy"
              description="Applies to Super Admins and Administrative security operators."
              icon={faShieldHalved}
              iconColor="text-red-500"
              badgeLabel="High Privileged"
              badgeClass="bg-red-50 text-red-700 border-red-200 text-[10px]"
              buttonClass="bg-slate-900 hover:bg-slate-800"
              settings={adminSettings}
              onChange={setAdminSettings}
              onSave={() => handleSavePolicy("admin")}
              saving={saving}
            />

            {/* Tier 2: Faculty & Instructor Policy */}
            <ComplexityPolicyCard
              title="Instructor & Faculty Policy"
              description="Applies to Course Instructors and Senior Academic Faculty."
              icon={faUserTie}
              iconColor="text-[#00aeef]"
              badgeLabel="Academic Staff"
              badgeClass="bg-blue-50 text-blue-700 border-blue-200 text-[10px]"
              buttonClass="bg-[#00aeef] hover:bg-[#008cc0]"
              settings={instructorSettings}
              onChange={setInstructorSettings}
              onSave={() => handleSavePolicy("instructor")}
              saving={saving}
            />

            {/* Tier 3: Student & Public Learner Policy */}
            <ComplexityPolicyCard
              title="Student & Learner Policy"
              description="Applies to self-enrolled students and public capital market learners."
              icon={faGraduationCap}
              iconColor="text-emerald-600"
              badgeLabel="Learner Access"
              badgeClass="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]"
              buttonClass="bg-emerald-600 hover:bg-emerald-700"
              settings={studentSettings}
              onChange={setStudentSettings}
              onSave={() => handleSavePolicy("student")}
              saving={saving}
            />
          </div>
        </TabsContent>

        {/* TAB 2: MULTI-FACTOR AUTHENTICATION (MFA) */}
        <TabsContent value="mfa" className="space-y-6">
          <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl text-xs text-blue-900 flex items-start gap-3">
            <FontAwesomeIcon icon={faInfoCircle} className="text-blue-500 text-base mt-0.5 shrink-0" />
            <div>
              <strong>Multi-Factor Authentication (MFA) Architecture:</strong> When MFA is toggled
              ON for a user scope, logging in with an email and password triggers a 6-digit
              cryptographic verification code delivered via registered email. The user must
              confirm this code within 5 minutes before full session authorization is granted.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MfaPolicyCard
              title="Administrator MFA"
              scopeLabel="Administrators"
              icon={faShieldHalved}
              iconColor="text-red-500"
              iconBg="bg-red-50"
              buttonClass="bg-slate-900 hover:bg-slate-800"
              settings={adminSettings}
              onChange={setAdminSettings}
              onSave={() => handleSavePolicy("admin")}
              saving={saving}
            />

            <MfaPolicyCard
              title="Instructor MFA"
              scopeLabel="Faculty & Instructors"
              icon={faUserTie}
              iconColor="text-blue-600"
              iconBg="bg-blue-50"
              buttonClass="bg-[#00aeef] hover:bg-[#008cc0]"
              settings={instructorSettings}
              onChange={setInstructorSettings}
              onSave={() => handleSavePolicy("instructor")}
              saving={saving}
            />

            <MfaPolicyCard
              title="Student MFA"
              scopeLabel="Students & Learners"
              icon={faGraduationCap}
              iconColor="text-emerald-600"
              iconBg="bg-emerald-50"
              buttonClass="bg-emerald-600 hover:bg-emerald-700"
              settings={studentSettings}
              onChange={setStudentSettings}
              onSave={() => handleSavePolicy("student")}
              saving={saving}
            />
          </div>
        </TabsContent>

        {/* TAB 3: SESSION IDLE TIMEOUTS */}
        <TabsContent value="session" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SessionTimeoutCard
              title="Administrator Session Timeout"
              description="Automatic termination of unattended administrative operator sessions."
              icon={faShieldHalved}
              iconColor="text-red-500"
              badgeClass="bg-red-50 text-red-700 border-red-200 text-xs"
              buttonClass="bg-slate-900 hover:bg-slate-800"
              hint="Recommended: 15 minutes for privileged infrastructure compliance."
              min={5}
              max={60}
              settings={adminSettings}
              onChange={setAdminSettings}
              onSave={() => handleSavePolicy("admin")}
              saving={saving}
            />

            <SessionTimeoutCard
              title="Instructor Session Timeout"
              description="Termination of unattended faculty and course instruction sessions."
              icon={faUserTie}
              iconColor="text-[#00aeef]"
              badgeClass="bg-blue-50 text-blue-700 border-blue-200 text-xs"
              buttonClass="bg-[#00aeef] hover:bg-[#008cc0]"
              hint="Recommended: 30 to 45 minutes for active grading and lecture preparation."
              min={10}
              max={120}
              settings={instructorSettings}
              onChange={setInstructorSettings}
              onSave={() => handleSavePolicy("instructor")}
              saving={saving}
            />

            <SessionTimeoutCard
              title="Student Session Timeout"
              description="Inactivity threshold before public student sessions are safely logged out."
              icon={faGraduationCap}
              iconColor="text-emerald-600"
              badgeClass="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs"
              buttonClass="bg-emerald-600 hover:bg-emerald-700"
              hint="Recommended: 120 minutes to prevent interruption during video lessons & quizzes."
              min={15}
              max={480}
              settings={studentSettings}
              onChange={setStudentSettings}
              onSave={() => handleSavePolicy("student")}
              saving={saving}
            />
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
                  Brute-force protection thresholds across user tiers.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Admin Max Failed Attempts
                  </label>
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    value={adminSettings.max_login_attempts}
                    onChange={(e) =>
                      setAdminSettings({
                        ...adminSettings,
                        max_login_attempts: parseInt(e.target.value) || 3,
                      })
                    }
                    className="text-xs bg-slate-50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Instructor Max Failed Attempts
                  </label>
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    value={instructorSettings.max_login_attempts}
                    onChange={(e) =>
                      setInstructorSettings({
                        ...instructorSettings,
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
                    value={adminSettings.lockout_duration_minutes}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 30;
                      setAdminSettings({ ...adminSettings, lockout_duration_minutes: val });
                      setInstructorSettings({ ...instructorSettings, lockout_duration_minutes: val });
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
                    checked={adminSettings.strict_admin_unlock}
                    onCheckedChange={(val) => {
                      setAdminSettings({ ...adminSettings, strict_admin_unlock: val });
                      setInstructorSettings({ ...instructorSettings, strict_admin_unlock: val });
                      setStudentSettings({ ...studentSettings, strict_admin_unlock: val });
                    }}
                  />
                </div>

                <Button
                  onClick={async () => {
                    await handleSavePolicy("admin");
                    await handleSavePolicy("instructor");
                    await handleSavePolicy("student");
                  }}
                  disabled={saving}
                  className="w-full bg-[#00aeef] hover:bg-[#008cc0] text-white text-xs font-bold rounded-xl h-10 mt-2"
                >
                  <FontAwesomeIcon icon={faFloppyDisk} className="mr-2" />
                  Save All Lockout Rules
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

              <Button
                onClick={() => setIsAddRoleOpen(true)}
                className="bg-[#00aeef] hover:bg-[#008cc0] text-white text-xs font-bold rounded-xl h-9 px-3.5 shadow-sm"
              >
                <FontAwesomeIcon icon={faPlus} className="mr-1.5" />
                Add Custom Role
              </Button>
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

          {/* Add Custom Role Dialog */}
          <Dialog open={isAddRoleOpen} onOpenChange={setIsAddRoleOpen}>
            <DialogContent className="sm:max-w-[420px] p-0 border border-slate-200 shadow-2xl rounded-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-slate-900 via-[#0a3161] to-[#00aeef] p-6 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                    <FontAwesomeIcon icon={faUsersGear} className="h-5 w-5 text-[#00aeef]" />
                  </div>
                  <div>
                    <DialogTitle className="text-lg font-bold text-white">
                      Create Custom System Role
                    </DialogTitle>
                    <DialogDescription className="text-slate-200 text-xs mt-0.5">
                      Define a new staff role and map functional privileges.
                    </DialogDescription>
                  </div>
                </div>
              </div>

              <form onSubmit={handleCreateRole} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Role Identifier / Name *</label>
                  <Input
                    placeholder="e.g. Compliance Officer or Faculty Head"
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                    required
                    className="text-xs bg-slate-50 border-slate-200 rounded-xl"
                  />
                  <p className="text-[10px] text-slate-400">
                    Will be registered in the IAM matrix and available when onboarding instructors.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddRoleOpen(false)}
                    className="text-xs rounded-xl h-10 px-4"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={creatingRole}
                    className="bg-[#00aeef] hover:bg-[#008cc0] text-white text-xs font-bold rounded-xl h-10 px-5 shadow-sm"
                  >
                    {creatingRole ? "Creating..." : "Create Role"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSecurity;

