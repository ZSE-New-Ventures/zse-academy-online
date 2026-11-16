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
  faXmark,
  faRightFromBracket,
  faLock,
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

  // Password complexity checks
  const hasMinLength = newPassword.length >= 8;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasLower = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[!@#$%^&*()_\-+=<>?{}[\]~]/.test(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;
  const isDifferentFromCurrent = newPassword.length > 0 && newPassword !== currentPassword;

  const allRulesSatisfied =
    hasMinLength &&
    hasUpper &&
    hasLower &&
    hasNumber &&
    hasSpecial &&
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
        description: "Your new password has been set. Welcome to the ZSE Academy!",
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

  const RuleIndicator = ({ label, passed }: { label: string; passed: boolean }) => (
    <div className="flex items-center gap-2 text-xs">
      <FontAwesomeIcon
        icon={passed ? faCheck : faXmark}
        className={`h-3 w-3 ${passed ? "text-emerald-600" : "text-slate-400"}`}
      />
      <span className={passed ? "text-emerald-700 font-medium" : "text-slate-500"}>
        {label}
      </span>
    </div>
  );

  return (
    <Dialog open={true} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-[520px] p-0 overflow-hidden border border-slate-200 shadow-2xl rounded-2xl"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-[#0a3161] to-[#00aeef] p-6 text-white text-center relative">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-3 shadow-inner border border-white/20">
            <FontAwesomeIcon icon={faShieldHalved} className="h-7 w-7 text-[#00aeef]" />
          </div>
          <DialogTitle className="text-xl font-bold tracking-tight text-white">
            Welcome to ZSE Training Academy!
          </DialogTitle>
          <DialogDescription className="text-slate-200 text-xs mt-1.5 max-w-sm mx-auto">
            Action Required: Initial Password Change for Institutional Security.
          </DialogDescription>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 leading-relaxed flex items-start gap-2.5">
            <FontAwesomeIcon icon={faLock} className="text-amber-600 shrink-0 mt-0.5 text-sm" />
            <div>
              <strong>Security Policy:</strong> You are currently signed in with a temporary
              auto-generated password. You must set a personalized, permanent password before you
              can access the academy dashboard.
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
              {errorMessage}
            </div>
          )}

          {/* Current Temporary Password */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">
              Temporary / Current Password *
            </label>
            <div className="relative">
              <Input
                type={showCurrent ? "text" : "password"}
                placeholder="Enter password received in your email"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="pr-10 text-xs bg-slate-50 border-slate-200"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                <FontAwesomeIcon icon={showCurrent ? faEyeSlash : faEye} />
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">New Password *</label>
            <div className="relative">
              <Input
                type={showNew ? "text" : "password"}
                placeholder="Enter strong new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="pr-10 text-xs bg-slate-50 border-slate-200"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                <FontAwesomeIcon icon={showNew ? faEyeSlash : faEye} />
              </button>
            </div>
          </div>

          {/* Confirm New Password */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">
              Confirm New Password *
            </label>
            <div className="relative">
              <Input
                type={showConfirm ? "text" : "password"}
                placeholder="Re-type new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="pr-10 text-xs bg-slate-50 border-slate-200"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                <FontAwesomeIcon icon={showConfirm ? faEyeSlash : faEye} />
              </button>
            </div>
          </div>

          {/* Live Complexity Checklist */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
            <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              Password Requirements
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              <RuleIndicator label="Min. 8 characters" passed={hasMinLength} />
              <RuleIndicator label="Uppercase (A-Z)" passed={hasUpper} />
              <RuleIndicator label="Lowercase (a-z)" passed={hasLower} />
              <RuleIndicator label="Number (0-9)" passed={hasNumber} />
              <RuleIndicator label="Special character" passed={hasSpecial} />
              <RuleIndicator label="Passwords match" passed={passwordsMatch} />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => logout()}
              className="text-xs text-slate-600 hover:text-red-600 border-slate-200 rounded-xl h-10 px-4"
            >
              <FontAwesomeIcon icon={faRightFromBracket} className="mr-2 text-xs" />
              Sign Out
            </Button>

            <Button
              type="submit"
              disabled={submitting || !allRulesSatisfied}
              className="flex-1 bg-[#00aeef] hover:bg-[#008cc0] text-white text-xs font-bold rounded-xl h-10 shadow-sm"
            >
              <FontAwesomeIcon icon={faKey} className="mr-2 text-xs" />
              {submitting ? "Updating..." : "Set New Password & Proceed"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
