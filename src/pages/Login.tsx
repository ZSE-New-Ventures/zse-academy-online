import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faEyeSlash,
  faEnvelope,
  faLock,
  faExclamationCircle,
  faBuildingColumns,
  faShieldHalved,
  faGraduationCap,
} from "@fortawesome/free-solid-svg-icons";
import { useToast } from "@/hooks/use-toast";
import { sanitizeInput, validateEmail } from "@/utils/sanitization";

const Login = () => {
  const queryEmail = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get("email") || "" : "";
  const [formData, setFormData] = useState({
    email: queryEmail,
    password: "",
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorDetails, setErrorDetails] = useState<{
    message: string;
    isUserNotFound?: boolean;
    isIncorrectPassword?: boolean;
    isLocked?: boolean;
    email?: string;
  } | null>(null);

  const { toast } = useToast();
  const { user, login, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = new URLSearchParams(location.search).get("redirect") || "";

  // If user is already authenticated, redirect them automatically
  useEffect(() => {
    if (!authLoading && user) {
      if (user.role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate(redirectPath || "/dashboard", { replace: true });
      }
    }
  }, [user, authLoading, navigate, redirectPath]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorDetails(null);

    const sanitizedEmail = sanitizeInput(formData.email);

    if (!validateEmail(sanitizedEmail)) {
      const err = "Please enter a valid email address.";
      setErrorDetails({ message: err });
      toast({
        title: "Invalid Email",
        description: err,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const loggedUser = await login(sanitizedEmail, formData.password);
      toast({
        title: "Welcome back!",
        description: "Successfully logged in.",
      });
      if (loggedUser && loggedUser.role === "admin") {
        navigate("/admin");
      } else {
        navigate(redirectPath || "/dashboard");
      }
    } catch (error: unknown) {
      const err = error as {
        response?: {
          status?: number;
          data?: {
            not_verified?: boolean;
            error?: string;
            message?: string;
            errors?: Record<string, string[]>;
            user_not_found?: boolean;
            incorrect_password?: boolean;
            account_locked?: boolean;
          };
        };
      };
      const errorData = err.response?.data;
      if (err.response?.status === 403 && errorData?.not_verified) {
        toast({
          title: "Account Not Verified",
          description: "Please verify your email to continue.",
        });
        navigate(`/verify-otp?email=${encodeURIComponent(formData.email)}`);
      } else {
        let errorMessage = "Please check your credentials and try again.";
        
        if (!err.response) {
          errorMessage = "Unable to connect to the server. Please check your internet connection or verify the API is running.";
        } else if ((err.response.status ?? 0) >= 500) {
          errorMessage = "Our servers are experiencing a temporary issue. Please try again later.";
        } else if (errorData) {
          if (errorData.error) {
            errorMessage = errorData.error;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.errors && typeof errorData.errors === 'object') {
            const firstErrorKey = Object.keys(errorData.errors)[0];
            errorMessage = errorData.errors[firstErrorKey][0];
          }
        }

        const isUserNotFound = err.response?.status === 404 || errorData?.user_not_found;
        const isIncorrectPassword = err.response?.status === 401 || errorData?.incorrect_password;
        const isLocked = err.response?.status === 403 && (errorData?.account_locked || errorMessage.toLowerCase().includes("locked"));

        setErrorDetails({
          message: errorMessage,
          isUserNotFound,
          isIncorrectPassword,
          isLocked,
          email: sanitizedEmail,
        });

        toast({
          title: isUserNotFound ? "Account Not Found" : isIncorrectPassword ? "Incorrect Password" : "Login Failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-montserrat flex flex-col justify-between">
      <Navbar />

      <section className="py-16 md:py-20 px-4 relative overflow-hidden flex items-center justify-center flex-1">
        {/* Subtle decorative glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#00aeef]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl w-full mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Side: Desktop-Only Lottie Animation & Institute Branding */}
            <div className="hidden lg:flex lg:col-span-5 flex-col items-center text-center p-8 bg-gradient-to-br from-white/90 to-slate-50/90 backdrop-blur-md rounded-3xl border border-slate-200/80 shadow-lg">
              <div className="w-64 h-64 mx-auto mb-4 flex items-center justify-center">
                <iframe
                  src="https://lottie.host/embed/25d03d4f-c422-46c2-9806-12a2f6647680/gATViFXqsQ.lottie"
                  className="w-full h-full border-0 pointer-events-none"
                  title="ZSE Training Institute Animation"
                />
              </div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#00aeef]/10 text-[#00aeef] text-xs font-bold uppercase tracking-wider mb-3 border border-[#00aeef]/20">
                <FontAwesomeIcon icon={faBuildingColumns} />
                <span>ZSE Training Institute</span>
              </div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight mb-2">
                Empowering Capital Market Leaders
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed max-w-xs">
                Professional financial education, stock market simulations, and verified investment certifications.
              </p>
            </div>

            {/* Right Side: Form (Full width on mobile, Col-7 on desktop) */}
            <div className="w-full max-w-md mx-auto lg:col-span-7">
              {/* Institutional Seal */}
              <div className="text-center mb-6">
                <div className="lg:hidden inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00aeef]/10 text-[#00aeef] text-xs font-bold uppercase tracking-wider mb-2 border border-[#00aeef]/20">
                  <FontAwesomeIcon icon={faBuildingColumns} />
                  <span>ZSE Training Institute</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Welcome Back
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Sign in to continue your courses, simulations, and exam modules
                </p>
              </div>

              <Card className="bg-white rounded-3xl shadow-xl border border-slate-200">
            <CardContent className="p-6 sm:p-8 space-y-6">
              {/* Detailed Persistent Error Alert */}
              {errorDetails && (
                <div className="p-4 bg-rose-50 border-2 border-rose-300 rounded-2xl flex items-start gap-3 text-rose-900 text-xs sm:text-sm animate-fade-in shadow-sm relative">
                  <FontAwesomeIcon icon={faExclamationCircle} className="h-5 w-5 text-rose-600 mt-0.5 shrink-0" />
                  <div className="flex-1 pr-6">
                    <p className="font-bold text-rose-900 text-sm">
                      {errorDetails.isUserNotFound 
                        ? "Account Not Found" 
                        : errorDetails.isIncorrectPassword 
                        ? "Authentication Error" 
                        : "Login Problem"}
                    </p>
                    <p className="mt-1 text-xs text-rose-800 leading-relaxed font-medium">{errorDetails.message}</p>
                    
                    {errorDetails.isUserNotFound && (
                      <div className="mt-3 pt-2 border-t border-rose-200">
                        <Link to="/signup" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00aeef] hover:underline">
                          Create a new account on ZSE Training Institute →
                        </Link>
                      </div>
                    )}
                    {(errorDetails.isIncorrectPassword || errorDetails.isLocked) && (
                      <div className="mt-3 pt-2 border-t border-rose-200">
                        <p className="text-[11px] text-rose-800 font-medium mb-1">
                          {errorDetails.isLocked
                            ? "Unlock your account and set a new password via email:"
                            : "Forgot your password or need to reset it?"}
                        </p>
                        <Link
                          to={`/forgot-password?email=${encodeURIComponent(errorDetails.email || formData.email)}`}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00aeef] hover:underline"
                        >
                          Send Password Reset Link →
                        </Link>
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setErrorDetails(null)}
                    className="absolute top-3 right-3 text-rose-400 hover:text-rose-700 w-6 h-6 flex items-center justify-center rounded-full hover:bg-rose-100 transition-colors"
                    title="Dismiss alert"
                  >
                    ×
                  </button>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Email Address
                  </Label>
                  <div className="relative mt-1.5">
                    <FontAwesomeIcon icon={faEnvelope} className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="your.email@example.com"
                      className="pl-10 h-11 bg-slate-50 border-slate-200 rounded-xl focus:border-[#00aeef]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Password
                    </Label>
                    <Link
                      to="/forgot-password"
                      className="text-xs font-semibold text-[#00aeef] hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <FontAwesomeIcon icon={faLock} className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      placeholder="••••••••"
                      className="pl-10 pr-10 h-11 bg-slate-50 border-slate-200 rounded-xl focus:border-[#00aeef]"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-1">
                  <Checkbox
                    id="remember"
                    checked={formData.rememberMe}
                    onCheckedChange={(checked) => handleInputChange("rememberMe", checked as boolean)}
                    className="border-slate-300 data-[state=checked]:bg-[#00aeef] data-[state=checked]:border-[#00aeef]"
                  />
                  <Label htmlFor="remember" className="text-xs font-medium text-slate-600 cursor-pointer">
                    Remember my session on this device
                  </Label>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-[#00aeef] hover:bg-[#008cc0] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-[#00aeef]/20"
                  disabled={isLoading}
                >
                  {isLoading ? "Authenticating..." : "Sign In to Training Institute"}
                </Button>
              </form>

              <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
                New to the ZSE Training Institute?{" "}
                <Link to="/signup" className="text-[#00aeef] hover:underline font-bold">
                  Create a Free Account
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  </section>

      <Footer />
    </div>
  );
};

export default Login;
