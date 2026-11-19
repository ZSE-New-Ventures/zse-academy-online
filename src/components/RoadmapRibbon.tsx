import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";

export const ROADMAP_MILESTONES = [
  { step: "01", id: "milestone-1", title: "Understanding What Shares & Capital Markets Really Are", short: "01 Understanding ..." },
  { step: "02", id: "milestone-2", title: "Choosing Your Market: ZSE (ZiG) vs VFEX (USD)", short: "02 Choosing Your" },
  { step: "03", id: "milestone-3", title: "Getting Your CSD Account & Choosing a Stockbroker", short: "03 Getting Your" },
  { step: "04", id: "milestone-4", title: "Funding Your Account & Placing Your Very First Order", short: "04 Funding Your" },
  { step: "05", id: "milestone-5", title: "Managing Your Returns: How to Use Your Money & Grow Wealth", short: "05 Managing Your" },
  { step: "06", id: "milestone-6", title: "Tracking Dividends, Annual Reports & Earning Accreditation", short: "06 Tracking Dividen..." },
];

export const RoadmapRibbon = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(16.6);

  useEffect(() => {
    if (location.pathname !== "/learning-journey") {
      setScrollProgress(((activeStep + 1) / ROADMAP_MILESTONES.length) * 100);
      return;
    }

    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = Math.min(100, Math.max(0, (window.scrollY / totalHeight) * 100));
        setScrollProgress(progress);
      }

      ROADMAP_MILESTONES.forEach((m, idx) => {
        const el = document.getElementById(m.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 200 && rect.bottom >= 200) {
            setActiveStep(idx);
          }
        }
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location.pathname, activeStep]);

  const handleStepClick = (idx: number, id: string) => {
    setActiveStep(idx);
    if (location.pathname === "/learning-journey") {
      const el = document.getElementById(id);
      if (el) {
        const topOffset = 135;
        const elementPosition = el.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - topOffset;
        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }
    } else {
      navigate(`/learning-journey#${id}`);
    }
  };

  return (
    <div className="w-full bg-[#0c1427]/98 backdrop-blur-md border-b border-slate-800 shadow-md text-slate-100 z-40">
      {/* Progress Bar Line */}
      <div className="w-full h-1 bg-slate-800/80">
        <div
          className="h-full bg-gradient-to-r from-[#00aeef] via-sky-400 to-emerald-400 transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Milestone Quick Jump Buttons */}
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-3 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-extrabold text-[#00aeef] uppercase tracking-wider hidden sm:inline">
            ROADMAP:
          </span>
          <span className="text-[11px] text-slate-300 font-semibold whitespace-nowrap">
            Step {activeStep + 1} of {ROADMAP_MILESTONES.length}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {ROADMAP_MILESTONES.map((m, idx) => (
            <button
              key={m.id}
              onClick={() => handleStepClick(idx, m.id)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeStep === idx
                  ? "bg-[#00aeef] text-white shadow-md shadow-[#00aeef]/30 scale-105"
                  : "bg-slate-800/90 text-slate-400 hover:text-white hover:bg-slate-700"
              }`}
            >
              <span>{m.short}</span>
            </button>
          ))}
        </div>

        <Link
          to="/courses/11485"
          className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold hover:bg-emerald-500/30 transition-colors shrink-0"
        >
          <span>Start Free</span>
          <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
        </Link>
      </div>
    </div>
  );
};
