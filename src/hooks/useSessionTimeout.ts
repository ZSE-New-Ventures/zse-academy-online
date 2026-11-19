import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { securityService } from "@/services/security.service";

export const useSessionTimeout = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();

  const [timeoutMinutes, setTimeoutMinutes] = useState<number>(() => {
    if (!user) return 120;
    const isStaff = user.role === "admin" || user.role === "super_admin" || user.role === "instructor";
    return isStaff ? 15 : 120;
  });

  const lastActivityRef = useRef<number>(Date.now());
  const warningShownRef = useRef<boolean>(false);

  // Fetch configured timeout from backend policy
  useEffect(() => {
    if (!user) return;

    const fetchPolicy = async () => {
      try {
        const isAdmin = (user.role === "admin" || user.role === "super_admin") && !user.must_change_password;
        if (isAdmin) {
          const res = await securityService.getSettings();
          if (res?.settings?.staff?.session_idle_timeout_minutes) {
            setTimeoutMinutes(res.settings.staff.session_idle_timeout_minutes);
          }
        } else {
          const res = await securityService.getPublicPolicy();
          if (res?.policy?.session_idle_timeout_minutes) {
            setTimeoutMinutes(res.policy.session_idle_timeout_minutes);
          }
        }
      } catch (e) {
        // Fallback to default
      }
    };

    fetchPolicy();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const updateActivity = () => {
      lastActivityRef.current = Date.now();
      warningShownRef.current = false;
    };

    // User interaction events
    const events = ["mousedown", "mousemove", "keydown", "scroll", "touchstart"];
    events.forEach((evt) => window.addEventListener(evt, updateActivity));

    // Check idle time every 15 seconds
    const interval = setInterval(() => {
      const now = Date.now();
      const elapsedMinutes = (now - lastActivityRef.current) / (1000 * 60);

      // 2 minutes warning
      if (timeoutMinutes > 2 && elapsedMinutes >= timeoutMinutes - 2 && !warningShownRef.current) {
        warningShownRef.current = true;
        toast({
          title: "Session Expiring Soon",
          description: "Your session will expire in 2 minutes due to inactivity. Move your mouse or press any key to stay signed in.",
        });
      }

      // Expired
      if (elapsedMinutes >= timeoutMinutes) {
        clearInterval(interval);
        toast({
          title: "Session Expired",
          description: "You have been logged out due to institutional inactivity policy.",
          variant: "destructive",
        });
        logout();
      }
    }, 15000);

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, updateActivity));
      clearInterval(interval);
    };
  }, [user, timeoutMinutes, logout, toast]);
};

