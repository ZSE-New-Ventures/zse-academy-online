import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faCheckCircle, faExclamationCircle, faArrowLeft, faKey } from "@fortawesome/free-solid-svg-icons";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/constants/api";

const ForgotPassword = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const queryEmail = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get("email") || "" : "";
  const [email, setEmail] = useState(queryEmail);
  const [loading, setLoading] = useState(false);
  const [successInfo, setSuccessInfo] = useState<{ message: string; reset_url?: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessInfo(null);

    try {
      const response = await fetch(`${API_BASE_URL}/forgot-password`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (response.ok && data.status !== "error") {
        setSuccessInfo({
          message: data.message || "Password reset instructions have been generated.",
          reset_url: data.reset_url,
        });
        toast({
          title: "Reset Link Ready",
          description: "Follow the instructions below to reset your password.",
        });
      } else {
        const message = data.message || data.error || "Unable to send password reset instructions.";
        setErrorMsg(message);
        toast({
          title: "Request Failed",
          description: message,
          variant: "destructive",
        });
      }
    } catch (error) {
      const msg = "Cannot connect to the backend server. Please verify the API is running.";
      setErrorMsg(msg);
      toast({
        title: "Network Error",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 font-montserrat">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <Card className="border border-gray-100 shadow-md bg-white rounded-2xl overflow-hidden">
            <CardHeader className="text-center pb-4">
              <div className="w-14 h-14 bg-blue-50 text-[#00aeef] rounded-2xl flex items-center justify-center mx-auto mb-3 text-2xl shadow-sm">
                <FontAwesomeIcon icon={faKey} />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Forgot Password
              </CardTitle>
              <CardDescription className="text-sm text-gray-500">
                Enter your account email to receive your password reset link
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6 pt-2">
              {/* Success Notification Box */}
              {successInfo && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl space-y-3">
                  <div className="flex items-start gap-3">
                    <FontAwesomeIcon icon={faCheckCircle} className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-bold text-green-900 text-sm">Reset Link Generated</p>
                      <p className="text-xs text-green-800 mt-0.5 leading-relaxed">{successInfo.message}</p>
                    </div>
                  </div>

                  {successInfo.reset_url && (
                    <div className="pt-2">
                      <a
                        href={successInfo.reset_url}
                        className="w-full inline-flex items-center justify-center gap-2 bg-[#00aeef] hover:bg-cyan-600 text-white font-semibold text-xs py-2.5 px-4 rounded-lg shadow-sm transition-colors text-center"
                      >
                        Proceed to Reset Password Form →
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Error Notification Box */}
              {errorMsg && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-800 text-xs sm:text-sm">
                  <FontAwesomeIcon icon={faExclamationCircle} className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p className="font-bold text-red-900">Unable to Proceed</p>
                    <p className="mt-0.5 text-xs text-red-700 leading-relaxed">{errorMsg}</p>
                    <div className="mt-2">
                      <Link to="/signup" className="text-xs font-bold text-red-900 underline hover:text-black">
                        Don't have an account? Sign up here →
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {!successInfo && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="email" className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Email Address
                    </Label>
                    <div className="relative mt-1.5">
                      <FontAwesomeIcon 
                        icon={faEnvelope} 
                        className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" 
                      />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. cmukondiwa@zse.co.zw"
                        className="pl-10 h-11 text-sm rounded-xl"
                        required
                        autoFocus
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-11 bg-[#00aeef] hover:bg-cyan-600 text-white font-semibold rounded-xl text-sm shadow-sm transition-colors"
                    disabled={loading || !email.trim()}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                        Generating Link...
                      </span>
                    ) : (
                      "Send Reset Instructions"
                    )}
                  </Button>
                </form>
              )}

              <div className="pt-2 text-center border-t border-gray-100">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-gray-600 hover:text-[#00aeef] transition-colors"
                >
                  <FontAwesomeIcon icon={faArrowLeft} className="text-[10px]" />
                  Back to Log In
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ForgotPassword;
