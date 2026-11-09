import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faGraduationCap,
  faShieldHalved,
  faLaptopCode,
} from "@fortawesome/free-solid-svg-icons";

export const CtaBanner: React.FC = () => {
  return (
    <section className="relative py-16 bg-gradient-to-r from-[#00aeef] via-[#0092c8] to-[#0f1729] text-white font-montserrat overflow-hidden">
      {/* Decorative background shapes */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Left Text */}
          <div className="max-w-2xl text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider mb-3">
              <FontAwesomeIcon icon={faShieldHalved} />
              <span>Official Investor Education Initiative</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              Ready to Master Zimbabwe's Capital Markets?
            </h2>
            <p className="mt-3 text-white/90 text-sm sm:text-base leading-relaxed">
              Join thousands of investors already learning, trading, and growing their wealth. Instant enrollment, self-paced modules, and verifiable certifications.
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mt-6 text-xs text-white/80 font-medium">
              <span className="flex items-center gap-1.5">
                <FontAwesomeIcon icon={faGraduationCap} /> 100% Free Learning
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <FontAwesomeIcon icon={faLaptopCode} /> Interactive Simulator Included
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <FontAwesomeIcon icon={faShieldHalved} /> Digital Certificate of Completion
              </span>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
            <Link
              to="/signup"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white text-slate-900 font-extrabold text-sm uppercase tracking-wider hover:bg-slate-100 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5 text-center flex items-center justify-center gap-2"
            >
              <span>Get Started Free</span>
              <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
            </Link>
            <Link
              to="/tutorials"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900/40 hover:bg-slate-900/60 backdrop-blur-md text-white font-bold text-sm uppercase tracking-wider border border-white/30 transition-all text-center"
            >
              Interactive Tutorials
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

