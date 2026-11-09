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
  faBuildingColumns
} from "@fortawesome/free-solid-svg-icons";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/logo.png";
import { sanitizeInput, validateEmail } from "@/utils/sanitization";

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { toast } = useToast();
  const { login, user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  // If already logged in as admin, redirect to /admin
  useEffect(() => {
    if (!authLoading && user) {
      if (user.role === "admin") {
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
      const loggedUser = await login(sanitizedEmail, formData.password);
      
      if (loggedUser && loggedUser.role !== "admin") {
        setErrorMessage("Access Restricted: This account does not have administrative privileges.");
        toast({
          title: "Access Restricted",
          description: "This portal is reserved for ZSE Academy administrators only.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Authenticated",
        description: "Welcome to the ZSE Academy Management Portal.",
      });
      navigate("/admin");
    } catch (error: any) {
      const errorData = error.response?.data;
      let msg = "Invalid administrative credentials. Please verify your email and password.";
      if (errorData?.error) msg = errorData.error;
      else if (errorData?.message) msg = errorData.message;
      setErrorMessage(msg);
      toast({
        title: "Authentication Failed",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b1324] via-[#0f172a] to-[#1e293b] flex flex-col justify-between py-10 px-4 sm:px-6 lg:px-8 font-sans selection:bg-[#00aeef] selection:text-white">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-3.5 py-2 rounded-lg border border-white/10"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="text-xs" />
          <span>Back to Academy Public Site</span>
        </Link>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold">
          <FontAwesomeIcon icon={faShieldHalved} className="h-3.5 w-3.5" />
          <span>Restricted Admin Portal</span>
        </div>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-md mx-auto my-8">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-4">
            <img src={logo} alt="Zimbabwe Stock Exchange" className="h-14 w-auto mx-auto filter drop-shadow-md" />
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Administrator Portal
          </h1>
          <p className="text-slate-400 text-sm mt-2">
            Secure management console for ZSE Academy courses, content, quizzes, and learner analytics.
          </p>
        </div>

        <Card className="bg-slate-900/90 border-slate-800 shadow-2xl backdrop-blur-xl rounded-2xl overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-[#00aeef] via-blue-500 to-indigo-600 w-full" />
          <CardHeader className="pt-6 pb-4 px-6 sm:px-8">
            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
              <FontAwesomeIcon icon={faLock} className="text-[#00aeef] text-sm" />
              <span>Administrative Sign In</span>
            </CardTitle>
            <CardDescription className="text-slate-400 text-xs">
              Enter your authorized staff credentials to continue to the control panel.
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

            <div className="mt-6 pt-5 border-t border-slate-800 text-center">
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
      <div className="text-center text-xs text-slate-500 max-w-md mx-auto">
        <p>© {new Date().getFullYear()} Zimbabwe Stock Exchange Limited. All administrative actions are audited.</p>
      </div>
    </div>
  );
};

export default AdminLogin;

