import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserGraduate,
  faChartLine,
  faCoins,
  faBuilding,
  faArrowRight,
  faCheckCircle,
  faCompass,
  faGraduationCap,
  faPlay,
  faLaptopCode,
  faBolt,
  faFire,
  faCircle,
  faArrowTrendUp,
  faShieldHalved,
} from "@fortawesome/free-solid-svg-icons";

import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import courseInvesting101 from "@/assets/course-investing-101.png";
import courseDirect from "@/assets/course-direct.jpg";
import courseEtf from "@/assets/course-etf.jpg";
import courseReits from "@/assets/course-reits.png";
import courseVfexDirect from "@/assets/course-vfex-direct.png";
import courseStatements from "@/assets/course-statements.jpg";

interface Pathway {
  id: string;
  badge: string;
  statusBadge: string;
  title: string;
  targetAudience: string;
  description: string;
  courseSnippet: string;
  courseDuration: string;
  liveMetric: string;
  image: string;
  icon: IconDefinition;
  bulletPoints: string[];
  ctaText: string;
  ctaLink: string;
  themeColor: string;
  tagColor: string;
}

const PATHWAYS: Pathway[] = [
  {
    id: "investment-101",
    badge: "Flagship Beginner",
    statusBadge: "1,420 Enrolled • ZSE Certified",
    title: "Investment 101",
    targetAudience: "First-time retail investors & financial beginners",
    description: "The official beginner programme designed to educate participants on the basic principles of investing in shares and securities on the Zimbabwe Stock Exchange.",
    courseSnippet: "Course ID: 11485 • 4 Modules",
    courseDuration: "Self-Paced • 100% Free",
    liveMetric: "98% Learner Satisfaction",
    image: courseInvesting101,
    icon: faUserGraduate,
    bulletPoints: [
      "Master core concepts: Shares, Portfolios, Risk & Return",
      "Learn how company ownership and dividend payments work",
      "Understand fee structures, terminology, and settlement cycles",
    ],
    ctaText: "Enroll in Investment 101",
    ctaLink: "/courses/11485",
    themeColor: "#00aeef",
    tagColor: "bg-sky-50 text-sky-700 border-sky-200",
  },
  {
    id: "zse-direct-course",
    badge: "Practical Trading",
    statusBadge: "Step-by-Step • Retail Platform",
    title: "Getting Started with ZSE Direct",
    targetAudience: "Beginners opening their first digital trading account",
    description: "A complete practical walkthrough of the ZSE Direct platform. Learn how to register, upload your KYC, fund your wallet via EcoCash or bank, and place your first trade.",
    courseSnippet: "Course ID: 28111 • 3 Modules",
    courseDuration: "Self-Paced • 100% Free",
    liveMetric: "Instant Mobile & Web Access",
    image: courseDirect,
    icon: faLaptopCode,
    bulletPoints: [
      "Creating your CSD account and selecting your stockbroker",
      "Funding your wallet with EcoCash, InnBucks, or ZimSwitch",
      "Placing your first buy and sell orders with zero hassle",
    ],
    ctaText: "Enroll in ZSE Direct Guide",
    ctaLink: "/courses/28111",
    themeColor: "#008cc0",
    tagColor: "bg-blue-50 text-[#008cc0] border-blue-200",
  },
  {
    id: "etfs-course",
    badge: "Low-Risk Starter Basket",
    statusBadge: "Active Retail Trading • ZSE Top-10",
    title: "Understanding ETFs",
    targetAudience: "Beginners seeking simple, diversified market exposure",
    description: "Discover why Exchange Traded Funds are the safest first purchase for a new investor. Buy one single asset and own a diversified slice of Zimbabwe's top 10 companies.",
    courseSnippet: "Course ID: 37088 • 3 Modules",
    courseDuration: "Self-Paced • 100% Free",
    liveMetric: "Top-10 & Commodity Exposure",
    image: courseEtf,
    icon: faChartLine,
    bulletPoints: [
      "How index-tracking ETF baskets minimize individual company risk",
      "Buying and selling ETF units directly on your mobile device",
      "Low management fees and automated dividend distribution",
    ],
    ctaText: "Enroll in ETFs Course",
    ctaLink: "/courses/37088",
    themeColor: "#00aeef",
    tagColor: "bg-sky-50 text-sky-700 border-sky-200",
  },
  {
    id: "vfex-course",
    badge: "USD Beginner Trading",
    statusBadge: "Hard Currency • 0% Capital Gains",
    title: "Introduction to VFEX (USD Trading)",
    targetAudience: "Beginners & diaspora investors wanting to trade in US Dollars",
    description: "The complete beginner's guide to trading US Dollar equities on the Victoria Falls Stock Exchange, using VFEX Direct, and enjoying 0% capital gains tax incentives.",
    courseSnippet: "Course ID: 88725 • 4 Modules",
    courseDuration: "Self-Paced • 100% Free",
    liveMetric: "0% Capital Gains Withholding Tax",
    image: courseVfexDirect,
    icon: faCoins,
    bulletPoints: [
      "How the VFEX operates as Zimbabwe's offshore USD exchange",
      "Opening your USD trading account and funding via FCA Nostro",
      "Tax incentives: 0% capital gains tax and USD dividend receipts",
    ],
    ctaText: "Enroll in VFEX Course",
    ctaLink: "/courses/88725",
    themeColor: "#0284c7",
    tagColor: "bg-sky-50 text-sky-700 border-sky-200",
  },
];

export const LearningPathways: React.FC = () => {
  const [activeIdx, setActiveIdx] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-cycle through pathways every 8 seconds to give users ample reading time
  useEffect(() => {
    if (isPaused) return;

    timerRef.current = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % PATHWAYS.length);
    }, 8000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused]);

  return (
    <section className="py-20 bg-gradient-to-b from-slate-50 via-white to-slate-50 font-montserrat border-b border-slate-200/80 relative overflow-hidden">
      {/* Decorative moving background gradients */}
      <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-[#00aeef]/5 rounded-full blur-3xl pointer-events-none animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00aeef]/10 text-[#00aeef] text-xs font-bold uppercase tracking-wider mb-4 border border-[#00aeef]/20 shadow-sm">
            <span className="inline-flex rounded-full h-2 w-2 bg-[#00aeef]"></span>
            <FontAwesomeIcon icon={faCompass} />
            <span>Exchange Courses & Modules</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Introductory Courses for Beginners
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-600">
            The ideal starting point for anyone learning to invest. Master foundational concepts, set up your digital trading account, and start investing on the ZSE & VFEX step by step.
          </p>

          {/* Interactive Live Pathway Tabs (Navigation Pills) */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
            {PATHWAYS.map((p, idx) => {
              const isActive = activeIdx === idx;
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    setActiveIdx(idx);
                    setIsPaused(true);
                  }}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${
                    isActive
                      ? "bg-[#00aeef] text-white shadow-lg shadow-[#00aeef]/25 scale-105"
                      : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  <FontAwesomeIcon icon={p.icon} className={isActive ? "text-white" : "text-slate-400"} />
                  <span>{p.title}</span>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white ml-1" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4 Pathway Cards Grid (Alive & Moving on Hover / Auto-cycle) */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {PATHWAYS.map((pathway, index) => {
            const isActive = activeIdx === index;

            return (
              <div
                key={pathway.id}
                onClick={() => setActiveIdx(index)}
                className={`group relative flex flex-col justify-between rounded-3xl overflow-hidden transition-all duration-500 cursor-pointer ${
                  isActive
                    ? "bg-white ring-2 ring-[#00aeef] shadow-2xl -translate-y-3 z-20 scale-[1.02]"
                    : "bg-white/90 border border-slate-200/90 shadow-sm hover:shadow-xl hover:-translate-y-1.5 opacity-90 hover:opacity-100 z-10"
                }`}
              >
                {/* Active Indicator Top Bar */}
                {isActive && (
                  <div className="h-1.5 w-full bg-[#00aeef]" />
                )}

                <div>
                  {/* Course Image Snippet Banner */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
                    <img
                      src={pathway.image}
                      alt={pathway.title}
                      className={`w-full h-full object-cover object-top transition-transform duration-700 ${
                        isActive ? "scale-110" : "group-hover:scale-105 opacity-90"
                      }`}
                      onError={(e) => {
                        e.currentTarget.src = courseStatements;
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                    {/* Top Status Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider bg-white/95 text-slate-800 shadow-md backdrop-blur-md">
                        {pathway.badge}
                      </span>

                      <div className="w-7 h-7 rounded-lg bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-white text-xs">
                        <FontAwesomeIcon icon={pathway.icon} />
                      </div>
                    </div>

                    {/* Live Activity Pill */}
                    <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white">
                      <div className="inline-flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-bold text-white border border-white/10">
                        <span className="inline-flex rounded-full h-2 w-2 bg-[#00aeef]"></span>
                        <span className="truncate max-w-[150px]">{pathway.statusBadge}</span>
                      </div>

                      <span className="text-[10px] text-slate-300 font-mono">
                        {pathway.courseDuration.split("•")[0]}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5">
                    {/* Course Title Snippet */}
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#00aeef] mb-2 uppercase tracking-wide">
                      <FontAwesomeIcon icon={faPlay} className="text-[9px]" />
                      <span>{pathway.courseSnippet}</span>
                    </div>

                    <h3 className="text-xl font-black text-slate-900 mb-1 leading-snug group-hover:text-[#00aeef] transition-colors">
                      {pathway.title}
                    </h3>
                    <p className="text-xs font-semibold text-slate-500 mb-3">
                      {pathway.targetAudience}
                    </p>
                    <p className="text-xs text-slate-600 leading-relaxed mb-4">
                      {pathway.description}
                    </p>

                    {/* Live Metric Banner */}
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2 text-xs text-slate-700 font-medium mb-4">
                      <FontAwesomeIcon icon={faBolt} className="text-[#00aeef] text-xs" />
                      <span className="text-[11px] font-bold text-slate-800">{pathway.liveMetric}</span>
                    </div>

                    {/* Bullet list */}
                    <div className="space-y-2 pt-3 border-t border-slate-100">
                      {pathway.bulletPoints.map((point, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-slate-700">
                          <FontAwesomeIcon
                            icon={faCheckCircle}
                            className={`mt-0.5 shrink-0 text-xs ${
                              isActive ? "text-[#00aeef]" : "text-slate-400"
                            }`}
                          />
                          <span className="leading-tight">{point}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom CTA Button */}
                <div className="p-5 pt-0">
                  <Link
                    to={pathway.ctaLink}
                    className={`w-full py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      isActive
                        ? "bg-[#00aeef] text-white shadow-lg shadow-[#00aeef]/25 hover:bg-[#008cc0]"
                        : "bg-slate-100 text-slate-800 hover:bg-[#00aeef] hover:text-white"
                    }`}
                  >
                    <span>{pathway.ctaText}</span>
                    <FontAwesomeIcon icon={faArrowRight} className="text-xs group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Exchange Accreditation Banner */}
        <div className="mt-14 bg-gradient-to-r from-[#0b1324] via-[#0d1b2a] to-[#0b1324] rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl border border-slate-800 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-[#00aeef]/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center gap-4 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-[#00aeef]/20 border border-[#00aeef]/40 flex items-center justify-center text-[#00aeef] shrink-0 text-2xl shadow-inner">
              <FontAwesomeIcon icon={faGraduationCap} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-[#00aeef]/20 text-[#00aeef] border border-[#00aeef]/30 text-[10px] font-bold uppercase tracking-wider">
                  Verified Certificates
                </span>
              </div>
              <h4 className="text-lg sm:text-xl font-black text-white">
                Earn Recognized Securities Market Qualifications
              </h4>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                Every course includes end-of-module quizzes, live simulation tests, and an official cryptographically verifiable certificate of completion.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 relative z-10">
            <Link
              to="/courses"
              className="px-6 py-3 bg-[#00aeef] hover:bg-[#008cc0] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-[#00aeef]/25 whitespace-nowrap"
            >
              Browse All Courses
            </Link>
            <Link
              to="/verify-certificate"
              className="px-5 py-3 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs uppercase tracking-wider rounded-xl border border-slate-700 transition-colors whitespace-nowrap"
            >
              Verify Certificate
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
