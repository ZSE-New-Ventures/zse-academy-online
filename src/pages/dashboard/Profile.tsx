import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faUser, 
  faEnvelope, 
  faShieldHalved,
  faCircleCheck,
  faKey,
  faGraduationCap,
  faAward
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 200);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm animate-pulse space-y-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-slate-200 rounded-full"></div>
            <div className="space-y-2 flex-1">
              <div className="h-5 w-40 bg-slate-200 rounded"></div>
              <div className="h-4 w-60 bg-slate-200 rounded"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-10 bg-slate-100 rounded-xl"></div>
            <div className="h-10 bg-slate-100 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Profile Info Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-6 lg:p-8 bg-gradient-to-r from-slate-900 to-[#0b1324] text-white flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <div className="w-20 h-20 bg-[#00aeef] text-white rounded-2xl flex items-center justify-center font-extrabold text-2xl uppercase shadow-xl shrink-0">
            {user?.name?.charAt(0) || "U"}
          </div>
          <div className="text-center sm:text-left flex-1 min-w-0">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-sky-200 mb-2 border border-white/10">
              <FontAwesomeIcon icon={faGraduationCap} className="text-[#00aeef]" />
              ZSE Training Institute Learner
            </div>
            <h2 className="text-2xl font-bold truncate">{user?.name || "Learner"}</h2>
            <p className="text-sm text-slate-300 truncate mt-0.5">{user?.email}</p>
          </div>
          <div className="shrink-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-semibold">
              <FontAwesomeIcon icon={faCircleCheck} className="text-emerald-400" />
              Active Account
            </span>
          </div>
        </div>

        <div className="p-6 lg:p-8 space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Account Credentials</h3>
            <p className="text-xs text-slate-500">Your registered learner details with Zimbabwe Stock Exchange</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 block">
                Full Name
              </Label>
              <div className="relative">
                <FontAwesomeIcon icon={faUser} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                <Input
                  value={user?.name || ""}
                  disabled
                  className="pl-9 bg-slate-50 border-slate-200 rounded-xl text-xs font-medium text-slate-700 h-10"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 block">
                Email Address
              </Label>
              <div className="relative">
                <FontAwesomeIcon icon={faEnvelope} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                <Input
                  value={user?.email || ""}
                  disabled
                  className="pl-9 bg-slate-50 border-slate-200 rounded-xl text-xs font-medium text-slate-700 h-10"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security & Password Card */}
      <div className="bg-white rounded-2xl p-6 lg:p-8 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-sky-50 text-[#00aeef] rounded-2xl flex items-center justify-center shrink-0">
            <FontAwesomeIcon icon={faKey} className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Security & Password</h3>
            <p className="text-xs text-slate-500 mt-0.5">Need to update your access credentials or set a new password?</p>
          </div>
        </div>

        <Button
          onClick={() => navigate(`/forgot-password?email=${encodeURIComponent(user?.email || "")}`)}
          variant="outline"
          className="rounded-xl border-slate-200 text-slate-800 hover:bg-slate-50 text-xs font-semibold h-10 px-5 shrink-0"
        >
          Request Password Reset
        </Button>
      </div>
    </div>
  );
};

export default Profile;
