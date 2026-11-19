import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { securityService } from "@/services/security.service";
import { useToast } from "@/hooks/use-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShieldHalved,
  faKey,
  faEye,
  faEyeSlash,
  faCheck,
  faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";

export const ForcedPasswordResetModal: React.FC = () => {
  const { user, setUser, logout } = useAuth();
  const { toast } = useToast();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // If user is not logged in or doesn't need to change password, do not show modal
  if (!user || !user.must_change_password) {
    return null;
  }

  // Password complexity checks tailored to user role policy (Admin: 14+, Instructor: 12+, Student: 8+)
  const isInstructor = user?.role === "instructor" || user?.role === "senior_instructor";
  const isAdmin = user?.role === "admin" || user?.role === "super_admin";
  const minRequiredLength = isAdmin ? 14 : isInstructor ? 12 : 8;
  const requiresSpecial = isAdmin || isInstructor;

  const hasMinLength = newPassword.length >= minRequiredLength;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasLower = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[!@#$%^&*()_\-+=<>?{}[\]~]/.test(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;
  const isDifferentFromCurrent = newPassword.length > 0 && newPassword !== currentPassword;

  const passedRulesCount = [
    hasMinLength,
    hasUpper,
    hasLower,
    hasNumber,
    hasSpecial,
  ].filter(Boolean).length;

  const allRulesSatisfied =
    hasMinLength &&
    hasUpper &&
    hasLower &&
    hasNumber &&
    (!requiresSpecial || hasSpecial) &&
    passwordsMatch &&
    isDifferentFromCurrent &&
    currentPassword.trim().length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allRulesSatisfied) return;

    try {
      setSubmitting(true);
      setErrorMessage(null);

      const res = await securityService.forceChangePassword({
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: confirmPassword,
      });

      toast({
        title: "Password Updated Successfully",
        description: "Your new password has been set. Welcome to ZSE Training Institute!",
      });

      // Update user state so modal closes seamlessly
      if (res.user) {
        setUser({ ...user, ...res.user, must_change_password: false });
      } else {
        setUser({ ...user, must_change_password: false });
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Failed to update password. Please check your credentials.";
      setErrorMessage(msg);
      toast({
        title: "Password Update Failed",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getStrengthMeta = () => {
    if (passedRulesCount <= 1) return { label: "Very Weak", color: "bg-red-500", width: "w-1/4" };
    if (passedRulesCount <= 3) return { label: "Fair", color: "bg-amber-500", width: "w-2/4" };
    if (passedRulesCount === 4) return { label: "Good", color: "bg-blue-500", width: "w-3/4" };
    return { label: "Strong", color: "bg-emerald-500", width: "w-full" };
  };

  const strength = getStrengthMeta();

  return (
    <Dialog open={true} onOpenChange={() => {}}>
      <DialogContent
        className="max-w-[430px] p-0 border border-slate-200/80 shadow-2xl rounded-2xl bg-white overflow-hidden max-h-[92vh] overflow-y-auto"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {/* Sleek, Modern Brand Header */}
        <div className="pt-6 pb-4 px-6 text-center border-b border-slate-100 bg-slate-50/50">
          <div className="mx-auto w-11 h-11 rounded-2xl bg-[#00aeef]/10 border border-[#00aeef]/20 flex items-center justify-center mb-2.5 text-[#00aeef] shadow-sm">
            <FontAwesomeIcon icon={faShieldHalved} className="h-5 w-5" />
          </div>
          <DialogTitle className="text-base font-bold tracking-tight text-slate-900">
            Set Your Permanent Password
          </DialogTitle>
          <div className="mt-1">
            <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              {isAdmin ? "Admin Policy (14+ chars & symbols)" : isInstructor ? "Faculty Policy (12+ chars & symbols)" : "Learner Policy (8+ chars)"}
            </span>
          </div>
          <DialogDescription className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
            Please replace your temporary auto-generated credentials to secure your account.
          </DialogDescription>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          {errorMessage && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
              {errorMessage}
            </div>
          )}

          {/* Current Temporary Password */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-700 block">
              Temporary / Current Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Input
                type={showCurrent ? "text" : "password"}
                placeholder="Password received in email"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="pr-9 text-xs h-9 bg-slate-50 border-slate-200 rounded-lg focus:bg-white"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs p-1"
                tabIndex={-1}
              >
                <FontAwesomeIcon icon={showCurrent ? faEyeSlash : faEye} />
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-700 block">
              New Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Input
                type={showNew ? "text" : "password"}
                placeholder="Create strong new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="pr-9 text-xs h-9 bg-slate-50 border-slate-200 rounded-lg focus:bg-white"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs p-1"
                tabIndex={-1}
              >
                <FontAwesomeIcon icon={showNew ? faEyeSlash : faEye} />
              </button>
            </div>
          </div>

          {/* Confirm New Password */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-700 block">
              Confirm New Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Input
                type={showConfirm ? "text" : "password"}
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="pr-9 text-xs h-9 bg-slate-50 border-slate-200 rounded-lg focus:bg-white"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs p-1"
                tabIndex={-1}
              >
                <FontAwesomeIcon icon={showConfirm ? faEyeSlash : faEye} />
              </button>
            </div>
          </div>

          {/* Sleek Password Strength & Checklist Chips */}
          <div className="p-3 bg-slate-50/80 border border-slate-200/70 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500 font-medium">Strength:</span>
              <span className="font-semibold text-slate-700">
                {newPassword ? strength.label : "Enter password"}
              </span>
            </div>
            <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full ${newPassword ? strength.color : "bg-transparent"} ${newPassword ? strength.width : "w-0"} transition-all duration-300 rounded-full`}
              />
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {[
                { label: `${minRequiredLength}+ chars`, passed: hasMinLength },
                { label: "Uppercase (A-Z)", passed: hasUpper },
                { label: "Lowercase (a-z)", passed: hasLower },
                { label: "Number (0-9)", passed: hasNumber },
                { label: requiresSpecial ? "Symbol (!@#...)" : "Symbol (Optional)", passed: hasSpecial },
                { label: "Match", passed: passwordsMatch },
              ].map((item) => (
                <span
                  key={item.label}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium transition-colors ${
                    item.passed
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-white text-slate-400 border border-slate-200"
                  }`}
                >
                  <FontAwesomeIcon
                    icon={faCheck}
                    className={`text-[8px] ${item.passed ? "text-emerald-600" : "text-transparent"}`}
                  />
                  {item.label}
                </span>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-between gap-2.5">
            <Button
              type="button"
              variant="ghost"
              onClick={() => logout()}
              className="text-xs text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg h-9 px-3"
            >
              <FontAwesomeIcon icon={faRightFromBracket} className="mr-1.5 text-xs" />
              Sign Out
            </Button>

            <Button
              type="submit"
              disabled={submitting || !allRulesSatisfied}
              className="flex-1 bg-[#00aeef] hover:bg-[#008cc0] text-white text-xs font-semibold rounded-lg h-9 shadow-sm transition-all"
            >
              <FontAwesomeIcon icon={faKey} className="mr-1.5 text-xs" />
              {submitting ? "Updating..." : "Update Password & Continue"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
