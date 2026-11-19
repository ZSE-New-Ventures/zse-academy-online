import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faEyeSlash,
  faEnvelope,
  faLock,
  faShieldHalved,
  faArrowLeft,
  faSpinner,
  faExclamationTriangle,
  faBuildingColumns,
  faKey,
  faRotateRight,
} from "@fortawesome/free-solid-svg-icons";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/logo.png";
import { sanitizeInput, validateEmail } from "@/utils/sanitization";
import { securityService } from "@/services/security.service";

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // MFA State
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaOtp, setMfaOtp] = useState("");
  const [mfaEmail, setMfaEmail] = useState("");
  const [mfaLoading, setMfaLoading] = useState(false);

  const { toast } = useToast();
  const { login, setUser, user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  // If already logged in as admin, redirect to /admin
  useEffect(() => {
    if (!authLoading && user) {
      if (user.role === "admin" || user.role === "super_admin" || user.role === "instructor") {
        navigate("/admin", { replace: true });
      }
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const sanitizedEmail = sanitizeInput(formData.email);

    if (!validateEmail(sanitizedEmail)) {
      const err = "Please enter a valid administrator email address.";
      setErrorMessage(err);
      toast({
        title: "Invalid Email",
        description: err,
        variant: "destructive",
      });
      return;
    }

    if (!formData.password) {
      const err = "Please enter your administrative password.";
      setErrorMessage(err);
      return;
    }

    setIsLoading(true);

    try {
      const res = await login(sanitizedEmail, formData.password);

      // Check if MFA challenge was issued
      if (res && res.mfa_required) {
        setMfaRequired(true);
        setMfaEmail(sanitizedEmail);
        toast({
          title: "MFA Verification Required",
          description: "Enter the 6-digit administrative verification code sent to your email.",
        });
        setIsLoading(false);
        return;
      }

      const loggedUser = res;
      if (
        loggedUser &&
        !["admin", "super_admin", "instructor", "senior_instructor"].includes(loggedUser.role)
      ) {
        setErrorMessage("Access Restricted: This account does not have administrative privileges.");
        toast({
          title: "Access Restricted",
          description: "This portal is reserved for ZSE Training Institute administrators only.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Administrative Access Granted",
        description: "Welcome to the ZSE Training Institute Control Center.",
      });
      if (loggedUser && (loggedUser.role === "instructor" || loggedUser.role === "senior_instructor")) {
        navigate("/instructor");
      } else {
        navigate("/admin");
      }
    } catch (error: any) {
      const errorData = error.response?.data;
      let err = "Administrative sign-in failed. Please verify credentials.";

      if (errorData?.error) {
        err = errorData.error;
      } else if (errorData?.message) {
        err = errorData.message;
      }

      setErrorMessage(err);
      toast({
        title: "Authentication Failed",
        description: err,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mfaOtp || mfaOtp.trim().length !== 6) {
      return toast({
        title: "Invalid Code",
        description: "Please enter the 6-digit code received in your email.",
        variant: "destructive",
      });
    }

    try {
      setMfaLoading(true);
      const res = await securityService.verifyMfa(mfaEmail, mfaOtp.trim());

      if (res.token) {
        localStorage.setItem("zse_training_token", res.token);
      }
      if (res.user) {
        setUser(res.user);
      }

      toast({
        title: "Access Granted",
        description: "Multi-Factor Authentication verified successfully.",
      });
      if (loggedUser && (loggedUser.role === "instructor" || loggedUser.role === "senior_instructor")) {
        navigate("/instructor");
      } else {
        navigate("/admin");
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error || "Invalid or expired verification code.";
      toast({
        title: "MFA Verification Failed",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setMfaLoading(false);
    }
  };

  const handleResendMfa = async () => {
    try {
      await securityService.resendMfa(mfaEmail);
      toast({
        title: "New Code Sent",
        description: `A fresh 6-digit verification code has been dispatched to ${mfaEmail}.`,
      });
    } catch (err: any) {
      toast({
        title: "Resend Failed",
        description: "Could not resend verification code. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b1324] via-[#0f172a] to-[#1e293b] flex flex-col justify-between p-4 sm:p-6 font-sans selection:bg-[#00aeef] selection:text-white">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between shrink-0">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-3.5 py-2 rounded-lg border border-white/10"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="text-xs" />
          <span>Back to Public Website</span>
        </Link>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold">
          <FontAwesomeIcon icon={faShieldHalved} className="h-3.5 w-3.5" />
          <span>Restricted Admin Portal</span>
        </div>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-md mx-auto my-auto py-3">
        <div className="text-center mb-4">
          <Link to="/" className="inline-block mb-2.5">
            <div className="bg-white px-5 py-2 rounded-2xl shadow-xl border border-white/20 inline-flex items-center justify-center hover:opacity-95 transition-opacity">
              <img src={logo} alt="ZSE Training Institute" className="h-8 w-auto" />
            </div>
          </Link>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Administrator Portal
          </h1>
          <p className="text-slate-400 text-xs mt-1 max-w-xs mx-auto">
            Authorized management console for institutional curriculum, assessments, and operations.
          </p>
        </div>

        <Card className="bg-slate-900/90 border-slate-800 shadow-2xl backdrop-blur-xl rounded-2xl overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-[#00aeef] via-blue-500 to-indigo-600 w-full" />
          <CardHeader className="pt-5 pb-3 px-6 sm:px-8">
            <CardTitle className="text-base font-bold text-white flex items-center gap-2">
              <FontAwesomeIcon icon={mfaRequired ? faKey : faLock} className="text-[#00aeef] text-sm" />
              <span>{mfaRequired ? "Two-Factor Verification (MFA)" : "Administrative Sign In"}</span>
            </CardTitle>
            <CardDescription className="text-slate-400 text-xs">
              {mfaRequired
                ? `Enter the 6-digit administrative code sent to ${mfaEmail}.`
                : "Enter your authorized staff credentials to continue to the control panel."}
            </CardDescription>
          </CardHeader>

          <CardContent className="px-6 sm:px-8 pb-8 pt-2">
            {errorMessage && (
              <div className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-3">
                <FontAwesomeIcon icon={faExclamationTriangle} className="text-rose-400 h-4 w-4 mt-0.5 shrink-0" />
                <p className="text-rose-200 text-xs leading-relaxed font-medium">
                  {errorMessage}
                </p>
              </div>
            )}

            {mfaRequired ? (
              <form onSubmit={handleVerifyMfa} className="space-y-5">
                <div className="space-y-2 text-center">
                  <Label htmlFor="mfa-otp" className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    6-Digit Verification Code
                  </Label>
                  <Input
                    id="mfa-otp"
                    type="text"
                    maxLength={6}
                    value={mfaOtp}
                    onChange={(e) => setMfaOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="123456"
                    required
                    disabled={mfaLoading}
                    className="text-center font-mono tracking-[0.5em] text-xl font-bold h-12 bg-slate-950/70 border-slate-700 text-white placeholder:text-slate-600 focus:border-[#00aeef] focus:ring-[#00aeef]/20 rounded-xl"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Code is valid for 5 minutes. Check your inbox or spam folder.
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={mfaLoading || mfaOtp.length !== 6}
                  className="w-full h-11 bg-[#00aeef] hover:bg-[#008cc0] text-white font-bold text-sm tracking-wide rounded-xl shadow-lg shadow-cyan-500/20 transition-all duration-200 mt-2"
                >
                  {mfaLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <FontAwesomeIcon icon={faSpinner} className="animate-spin text-sm" />
                      <span>Verifying Code...</span>
                    </span>
                  ) : (
                    <span>Verify Code & Login</span>
                  )}
                </Button>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMfaRequired(false);
                      setMfaOtp("");
                    }}
                    className="hover:text-white transition-colors"
                  >
                    ← Back to Sign In
                  </button>

                  <button
                    type="button"
                    onClick={handleResendMfa}
                    className="text-[#00aeef] hover:underline font-semibold"
                  >
                    Resend Code
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="admin-email" className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Admin Email Address
                  </Label>
                  <div className="relative">
                    <FontAwesomeIcon
                      icon={faEnvelope}
                      className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-500 text-xs"
                    />
                    <Input
                      id="admin-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="admin@zse.co.zw"
                      required
                      disabled={isLoading}
                      className="pl-10 h-11 bg-slate-950/70 border-slate-700 text-white placeholder:text-slate-500 focus:border-[#00aeef] focus:ring-[#00aeef]/20 rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="admin-password" className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Password
                    </Label>
                  </div>
                  <div className="relative">
                    <FontAwesomeIcon
                      icon={faLock}
                      className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-500 text-xs"
                    />
                    <Input
                      id="admin-password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="••••••••••••"
                      required
                      disabled={isLoading}
                      className="pl-10 pr-10 h-11 bg-slate-950/70 border-slate-700 text-white placeholder:text-slate-500 focus:border-[#00aeef] focus:ring-[#00aeef]/20 rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                      className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} className="text-xs" />
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 bg-[#00aeef] hover:bg-[#008cc0] text-white font-bold text-sm tracking-wide rounded-xl shadow-lg shadow-cyan-500/20 transition-all duration-200 mt-2"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <FontAwesomeIcon icon={faSpinner} className="animate-spin text-sm" />
                      <span>Verifying Credentials...</span>
                    </span>
                  ) : (
                    <span>Access Control Panel</span>
                  )}
                </Button>
              </form>
            )}

            <div className="mt-5 pt-4 border-t border-slate-800 text-center">
              <p className="text-slate-400 text-xs">
                Are you a learner or investor?{" "}
                <Link to="/login" className="text-[#00aeef] hover:underline font-semibold">
                  Go to Training Institute Login
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer Disclaimer */}
      <div className="text-center text-xs text-slate-500 max-w-md mx-auto shrink-0 pt-2">
        <p>© {new Date().getFullYear()} Zimbabwe Stock Exchange Limited. All administrative actions are audited.</p>
      </div>
    </div>
  );
};

export default AdminLogin;

