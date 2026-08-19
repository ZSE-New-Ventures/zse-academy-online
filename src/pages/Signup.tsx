import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faEnvelope, faLock, faExclamationCircle, faUser, faCheck, faTimes } from "@fortawesome/free-solid-svg-icons";
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
  const { toast } = useToast();
  const { signup, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPolicy = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.PASSWORD_POLICY}`, {
          headers: { 'Accept': 'application/json' }
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
    
    const isValid = [
      password.length >= policy.min_length,
      !policy.require_uppercase || /[A-Z]/.test(password),
      !policy.require_lowercase || /[a-z]/.test(password),
      !policy.require_numbers || /[0-9]/.test(password),
      !policy.require_special_characters || /[^A-Za-z0-9]/.test(password)
    ].every(Boolean);

    return isValid;
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.agreeToTerms) {
      toast({
        title: "Terms Required",
        description: "Please agree to the terms and conditions.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await signup(sanitizedName, sanitizedEmail, formData.password, formData.passwordConfirmation);
      toast({
        title: "Registration Successful!",
        description: "Please check your email for the verification code.",
      });
      navigate(`/verify-otp?email=${encodeURIComponent(sanitizedEmail)}`);
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: "Please try again with different details.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background font-montserrat">
      <Navbar />
      <section className="section-padding">
        <div className="max-w-lg mx-auto px-4">
          <Card className="card-gradient shadow-strong">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-secondary">Sign Up</CardTitle>
              <CardDescription>Create your account to start your financial education journey</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name */}
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative mt-1">
                    <FontAwesomeIcon icon={faUser} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="Lavet Mbewe"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative mt-1">
                    <FontAwesomeIcon icon={faEnvelope} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="lavetmbewe475@gmail.com"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <Label htmlFor="password">Password</Label>
                  <div className="relative mt-1">
                    <FontAwesomeIcon icon={faLock} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      placeholder="Create a strong password"
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <FontAwesomeIcon icon={faEyeSlash} /> : <FontAwesomeIcon icon={faEye} />}
                    </button>
                  </div>
                  {policy && formData.password && (
                    <div className="mt-3 space-y-2 p-3 bg-gray-50 rounded-md border border-gray-100">
                      <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Password Requirements</p>
                      <ul className="text-sm space-y-1">
                        <li className={`flex items-center gap-2 ${formData.password.length >= policy.min_length ? 'text-green-600' : 'text-gray-500'}`}>
                          <FontAwesomeIcon icon={formData.password.length >= policy.min_length ? faCheck : faTimes} className="w-3 h-3" />
                          At least {policy.min_length} characters
                        </li>
                        {policy.require_uppercase && (
                          <li className={`flex items-center gap-2 ${/[A-Z]/.test(formData.password) ? 'text-green-600' : 'text-gray-500'}`}>
                            <FontAwesomeIcon icon={/[A-Z]/.test(formData.password) ? faCheck : faTimes} className="w-3 h-3" />
                            At least 1 uppercase letter
                          </li>
                        )}
                        {policy.require_lowercase && (
                          <li className={`flex items-center gap-2 ${/[a-z]/.test(formData.password) ? 'text-green-600' : 'text-gray-500'}`}>
                            <FontAwesomeIcon icon={/[a-z]/.test(formData.password) ? faCheck : faTimes} className="w-3 h-3" />
                            At least 1 lowercase letter
                          </li>
                        )}
                        {policy.require_numbers && (
                          <li className={`flex items-center gap-2 ${/[0-9]/.test(formData.password) ? 'text-green-600' : 'text-gray-500'}`}>
                            <FontAwesomeIcon icon={/[0-9]/.test(formData.password) ? faCheck : faTimes} className="w-3 h-3" />
                            At least 1 number
                          </li>
                        )}
                        {policy.require_special_characters && (
                          <li className={`flex items-center gap-2 ${/[^A-Za-z0-9]/.test(formData.password) ? 'text-green-600' : 'text-gray-500'}`}>
                            <FontAwesomeIcon icon={/[^A-Za-z0-9]/.test(formData.password) ? faCheck : faTimes} className="w-3 h-3" />
                            At least 1 special character
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <Label htmlFor="passwordConfirmation">Confirm Password</Label>
                  <div className="relative mt-1">
                    <FontAwesomeIcon icon={faLock} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="passwordConfirmation"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.passwordConfirmation}
                      onChange={(e) => handleInputChange("passwordConfirmation", e.target.value)}
                      placeholder="Confirm your password"
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? <FontAwesomeIcon icon={faEyeSlash} /> : <FontAwesomeIcon icon={faEye} />}
                    </button>
                  </div>
                </div>

                {/* Terms */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="terms"
                    checked={formData.agreeToTerms}
                    onCheckedChange={(checked) => handleInputChange("agreeToTerms", checked as boolean)}
                  />
                  <Label htmlFor="terms" className="text-sm leading-relaxed">
                    I agree to the{" "}
                    <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link> and{" "}
                    <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                  </Label>
                </div>

                <Button type="submit" size="lg" variant="hero" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Signup;
