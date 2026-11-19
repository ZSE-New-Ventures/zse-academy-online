import { apiClient } from "./api";

export interface ScopeSecuritySetting {
  id?: number;
  scope: "admin" | "instructor" | "student" | "staff";
  min_password_length: number;
  require_uppercase: boolean;
  require_lowercase: boolean;
  require_numbers: boolean;
  require_special_characters: boolean;
  password_expiry_days: number;
  password_history_limit: number;
  mfa_enabled: boolean;
  session_idle_timeout_minutes: number;
  max_login_attempts: number;
  lockout_duration_minutes: number;
  strict_admin_unlock: boolean;
}

export interface SecuritySettingsResponse {
  status: string;
  settings: {
    admin?: ScopeSecuritySetting;
    instructor?: ScopeSecuritySetting;
    staff: ScopeSecuritySetting;
    student: ScopeSecuritySetting;
  };
}

export interface Department {
  id: number;
  name: string;
  code: string;
  description?: string;
  is_active: boolean;
  users_count?: number;
  instructors_count?: number;
}

export interface PermissionItem {
  id: number;
  name: string;
  label: string;
}

export interface RoleWithPermissions {
  id: number;
  name: string;
  guard_name: string;
  permissions: { id: number; name: string }[];
}

export interface IamMatrixResponse {
  status: string;
  roles: RoleWithPermissions[];
  permissions_by_domain: Record<string, PermissionItem[]>;
  departments: Department[];
}

export interface LockedUser {
  id: number;
  name: string;
  email: string;
  role: string;
  locked: boolean;
  locked_at: string | null;
  login_attempts: number;
  department?: Department | null;
}

export interface AuditLog {
  id: number;
  user_id: number | null;
  event_type: string;
  severity: "info" | "warning" | "critical";
  ip_address: string | null;
  user_agent: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
  user?: { id: number; name: string; email: string; role: string } | null;
}

export const securityService = {
  getSettings: async (): Promise<SecuritySettingsResponse> => {
    const res = await apiClient.get("/admin/security/settings");
    return res.data;
  },

  updateSettings: async (settings: ScopeSecuritySetting) => {
    const res = await apiClient.put("/admin/security/settings", settings);
    return res.data;
  },

  getPublicPolicy: async () => {
    const res = await apiClient.get("/public/security/policy");
    return res.data;
  },

  getIamMatrix: async (): Promise<IamMatrixResponse> => {
    const res = await apiClient.get("/admin/security/iam");
    return res.data;
  },

  updateRolePermissions: async (roleId: number, permissions: string[]) => {
    const res = await apiClient.post("/admin/security/iam/role-permissions", {
      role_id: roleId,
      permissions,
    });
    return res.data;
  },

  createRole: async (data: { name: string; permissions?: string[] }) => {
    const res = await apiClient.post("/admin/security/roles", data);
    return res.data;
  },

  getLockedUsers: async (): Promise<{ locked_users: LockedUser[] }> => {
    const res = await apiClient.get("/admin/security/locked-users");
    return res.data;
  },

  unlockUser: async (userId: number) => {
    const res = await apiClient.post(`/admin/security/users/${userId}/unlock`);
    return res.data;
  },

  getAuditLogs: async (page = 1) => {
    const res = await apiClient.get(`/admin/security/audit-logs?page=${page}`);
    return res.data;
  },

  getDepartments: async (all = false): Promise<{ departments: Department[] }> => {
    const res = await apiClient.get(`/departments${all ? "?all=1" : ""}`);
    return res.data;
  },

  createDepartment: async (data: { name: string; code: string; description?: string }) => {
    const res = await apiClient.post("/departments", data);
    return res.data;
  },

  updateDepartment: async (id: number, data: Partial<Department>) => {
    const res = await apiClient.put(`/departments/${id}`, data);
    return res.data;
  },

  forceChangePassword: async (data: {
    current_password: string;
    new_password: string;
    new_password_confirmation: string;
  }) => {
    const res = await apiClient.post("/auth/force-change-password", data);
    return res.data;
  },

  verifyMfa: async (email: string, otp: string) => {
    const res = await apiClient.post("/verify-mfa", { email, otp });
    return res.data;
  },

  resendMfa: async (email: string) => {
    const res = await apiClient.post("/resend-mfa", { email });
    return res.data;
  },
};

