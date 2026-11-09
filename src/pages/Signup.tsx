import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
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
  faUser,
  faCheck,
  faTimes,
  faBuildingColumns,
  faShieldHalved,
} from "@fortawesome/free-solid-svg-icons";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL, API_ENDPOINTS } from "@/constants/api";
import { sanitizeInput, validateName, validateEmail } from "@/utils/sanitization";

interface PasswordPolicy {
  min_length: number;
  require_uppercase: boolean;
  require_lowercase: boolean;
  require_numbers: boolean;
  require_special_characters: boolean;
}

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    passwordConfirmation: "",
    agreeToTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [policy, setPolicy] = useState<PasswordPolicy | null>(null);
  const [errorDetails, setErrorDetails] = useState<{
    title: string;
    message: string;
    isExistingAccount?: boolean;
    suggestedEmail?: string;
  } | null>(null);
  const { toast } = useToast();
  const { signup, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPolicy = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.PASSWORD_POLICY}`, {
          headers: { Accept: "application/json" },
        });
        if (response.ok) {
          const data = await response.json();
          setPolicy(data);
        }
      } catch (err) {
        console.error("Failed to fetch password policy", err);
      }
    };
    fetchPolicy();
  }, []);

  useEffect(() => {
    if (isAuthenticated) navigate("/dashboard");
  }, [isAuthenticated, navigate]);

  const validatePassword = (password: string) => {
    if (!policy) return true;

    return [
      password.length >= policy.min_length,
      !policy.require_uppercase || /[A-Z]/.test(password),
      !policy.require_lowercase || /[a-z]/.test(password),
      !policy.require_numbers || /[0-9]/.test(password),
      !policy.require_special_characters || /[^A-Za-z0-9]/.test(password),
    ].every(Boolean);
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errorDetails) setErrorDetails(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const sanitizedName = sanitizeInput(formData.name);
    const sanitizedEmail = sanitizeInput(formData.email);

    if (!validateName(sanitizedName)) {
      toast({
        title: "Invalid Name",
        description: "Name contains invalid characters. Please use only letters.",
        variant: "destructive",
      });
      return;
    }

    if (!validateEmail(sanitizedEmail)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    if (policy && !validatePassword(formData.password)) {
      toast({
        title: "Weak Password",
        description: "Your password does not meet the required security policy.",
        variant: "destructive",
      });
      return;
    }

    if (formData.password !== formData.passwordConfirmation) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.agreeToTerms) {
      toast({
        title: "Terms Required",
        description: "Please agree to the Terms of Service and Privacy Policy.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      await signup(sanitizedName, sanitizedEmail, formData.password, formData.passwordConfirmation);
      toast({
        title: "Account Created!",
        description: "A verification code has been sent to your email.",
      });
      navigate(`/verify-otp?email=${encodeURIComponent(sanitizedEmail)}`);
    } catch (error: any) {
      const errorData = error.response?.data;
      let errorMessage = "Registration failed. Please try again.";

      if (errorData?.errors?.email) {
        errorMessage = errorData.errors.email[0];
        const isExisting =
          errorMessage.toLowerCase().includes("taken") ||
          errorMessage.toLowerCase().includes("already registered");

        setErrorDetails({
          title: isExisting ? "Account Already Exists" : "Registration Failed",
          message: errorMessage,
          isExistingAccount: isExisting,
          suggestedEmail: sanitizedEmail,
        });
      } else {
        if (errorData?.message) errorMessage = errorData.message;
        setErrorDetails({
          title: "Registration Failed",
          message: errorMessage,
        });
      }

      toast({
        title: "Registration Issue",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-montserrat flex flex-col justify-between">
      <Navbar />

      <section className="py-16 md:py-20 px-4 relative overflow-hidden flex items-center justify-center flex-1">
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
                Start Your Investment Journey
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed max-w-xs">
                Join over 10,000 learners mastering Zimbabwe's capital markets with premier professional training.
              </p>
            </div>

            {/* Right Side: Form (Full width on mobile, Col-7 on desktop) */}
            <div className="w-full max-w-md mx-auto lg:col-span-7">
              <div className="text-center mb-6">
                <div className="lg:hidden inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00aeef]/10 text-[#00aeef] text-xs font-bold uppercase tracking-wider mb-2 border border-[#00aeef]/20">
                  <FontAwesomeIcon icon={faBuildingColumns} />
                  <span>ZSE Training Institute</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Create Your Free Account
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Join over 10,000 learners mastering Zimbabwe's capital markets
                </p>
              </div>

              <Card className="bg-white rounded-3xl shadow-xl border border-slate-200">
            <CardContent className="p-6 sm:p-8 space-y-6">
              {errorDetails && (
                <div
                  className={`p-4 rounded-2xl border text-xs sm:text-sm flex flex-col gap-2 ${
                    errorDetails.isExistingAccount
                      ? "bg-amber-50 border-amber-300 text-amber-900"
                      : "bg-rose-50 border-rose-300 text-rose-900"
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold">
                    <FontAwesomeIcon icon={faExclamationCircle} />
                    <span>{errorDetails.title}</span>
                  </div>
                  <p className="leading-relaxed">{errorDetails.message}</p>
                  {errorDetails.isExistingAccount && (
                    <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-amber-200">
                      <Button
                        type="button"
                        size="sm"
                        className="bg-[#00aeef] hover:bg-[#008cc0] text-white text-xs font-bold uppercase rounded-lg"
                        onClick={() =>
                          navigate(
                            `/login?email=${encodeURIComponent(
                              errorDetails.suggestedEmail || ""
                            )}`
                          )
                        }
                      >
                        Sign In Now
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-xs font-bold rounded-lg"
                        onClick={() =>
                          navigate(
                            `/forgot-password?email=${encodeURIComponent(
                              errorDetails.suggestedEmail || ""
                            )}`
                          )
                        }
                      >
                        Reset Password
                      </Button>
                    </div>
                  )}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Full Name *
                  </Label>
                  <div className="relative mt-1.5">
                    <FontAwesomeIcon icon={faUser} className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                    <Input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="e.g. Tendai Moyo"
                      className="pl-10 h-11 bg-slate-50 border-slate-200 rounded-xl focus:border-[#00aeef]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Email Address *
                  </Label>
                  <div className="relative mt-1.5">
                    <FontAwesomeIcon icon={faEnvelope} className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="tendai@example.com"
                      className="pl-10 h-11 bg-slate-50 border-slate-200 rounded-xl focus:border-[#00aeef]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Password *
                  </Label>
                  <div className="relative mt-1.5">
                    <FontAwesomeIcon icon={faLock} className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      placeholder="Create a strong password"
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

                <div>
                  <Label htmlFor="passwordConfirmation" className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Confirm Password *
                  </Label>
                  <div className="relative mt-1.5">
                    <FontAwesomeIcon icon={faLock} className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                    <Input
                      id="passwordConfirmation"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.passwordConfirmation}
                      onChange={(e) => handleInputChange("passwordConfirmation", e.target.value)}
                      placeholder="Re-enter your password"
                      className="pl-10 pr-10 h-11 bg-slate-50 border-slate-200 rounded-xl focus:border-[#00aeef]"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-start space-x-2 pt-1">
                  <Checkbox
                    id="terms"
                    checked={formData.agreeToTerms}
                    onCheckedChange={(checked) => handleInputChange("agreeToTerms", checked as boolean)}
                    className="mt-0.5 border-slate-300 data-[state=checked]:bg-[#00aeef] data-[state=checked]:border-[#00aeef]"
                  />
                  <Label htmlFor="terms" className="text-xs text-slate-600 leading-relaxed cursor-pointer">
                    I agree to the{" "}
                    <Link to="/terms" className="text-[#00aeef] font-semibold hover:underline">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link to="/privacy" className="text-[#00aeef] font-semibold hover:underline">
                      Privacy Policy
                    </Link>
                  </Label>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-[#00aeef] hover:bg-[#008cc0] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-[#00aeef]/20"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating Account..." : "Register Free Account"}
                </Button>
              </form>

              <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
                Already registered with ZSE Training Institute?{" "}
                <Link to="/login" className="text-[#00aeef] hover:underline font-bold">
                  Sign In
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

export default Signup;
