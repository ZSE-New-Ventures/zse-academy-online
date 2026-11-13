import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRoute,
  faGraduationCap,
  faArrowRight,
  faCheckCircle,
  faPlay,
  faBuildingColumns,
  faCoins,
  faShieldHalved,
  faFileContract,
  faChartLine,
  faLightbulb,
  faCertificate,
  faCircleCheck,
  faChevronDown,
  faChevronUp,
} from "@fortawesome/free-solid-svg-icons";

import courseInvesting101 from "@/assets/course-investing-101.png";
import courseVfexDirect from "@/assets/course-vfex-direct.png";
import courseDirect from "@/assets/course-direct.jpg";
import courseEtf from "@/assets/course-etf.jpg";
import courseReits from "@/assets/course-reits.png";
import courseStatements from "@/assets/course-statements.jpg";
import investmentImg from "@/assets/investment.jpg";

interface JourneyMilestone {
  id: string;
  stepNumber: string;
  phase: "foundation" | "execution";
  timeEstimate: string;
  badge: string;
  title: string;
  summary: string;
  image: string;
  takeaways: string[];
  beginnerTip: string;
  primaryCtaText: string;
  primaryCtaLink: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
}

const MILESTONES: JourneyMilestone[] = [
  {
    id: "milestone-1",
    stepNumber: "01",
    phase: "foundation",
    timeEstimate: "20 Mins",
    badge: "Core Basics • Start Here",
    title: "Understanding What Shares & Capital Markets Really Are",
    summary:
      "Before spending a single cent, understand what owning a share means. When you buy a listed company's shares on the ZSE, you are becoming a fractional business owner entitled to dividends and capital growth.",
    image: courseInvesting101,
    takeaways: [
      "The difference between saving money in a bank vs investing in capital markets",
      "How share prices fluctuate based on company performance and supply & demand",
      "What dividends are and how profits are distributed to everyday shareholders",
      "Why long-term consistency beats trying to time or gamble on the market",
    ],
    beginnerTip:
      "Myth buster: You do NOT need thousands of dollars to start. Many listed securities on the ZSE trade under 100 ZiG per share.",
    primaryCtaText: "Start Investment 101 Course",
    primaryCtaLink: "/courses/11485",
    secondaryCtaText: "Watch Market Basics Video",
    secondaryCtaLink: "/tutorials",
  },
  {
    id: "milestone-2",
    stepNumber: "02",
    phase: "foundation",
    timeEstimate: "15 Mins",
    badge: "Market Landscape",
    title: "Choosing Your Market: ZSE (ZiG) vs VFEX (USD)",
    summary:
      "Zimbabwe operates two premier stock exchange markets under one ecosystem. Knowing which market aligns with your financial goals and currency preference is essential.",
    image: courseVfexDirect,
    takeaways: [
      "ZSE (Zimbabwe Stock Exchange): Trades in local currency (ZiG), hosts Zimbabwe's historic blue chips, REITs, and local ETFs",
      "VFEX (Victoria Falls Stock Exchange): Trades 100% in US Dollars (USD), offers 0% capital gains tax for non-residents, and features hard-currency exporters",
      "How to hold both currencies in a balanced, diversified local portfolio",
    ],
    beginnerTip:
      "Both markets can be accessed from the same mobile or web dashboard via ZSE Direct and registered stockbrokers.",
    primaryCtaText: "Explore VFEX & ZSE Courses",
    primaryCtaLink: "/courses",
    secondaryCtaText: "View Exchange FAQs",
    secondaryCtaLink: "/faq",
  },
  {
    id: "milestone-3",
    stepNumber: "03",
    phase: "foundation",
    timeEstimate: "25 Mins",
    badge: "Digital Account Setup",
    title: "Getting Your CSD Account & Choosing a Stockbroker",
    summary:
      "Every Zimbabwean investor has a unique Central Securities Depository (CSD) number. Think of your CSD account as a digital bank safe that holds your official share certificates electronically.",
    image: courseDirect,
    takeaways: [
      "What the CSD (Central Securities Depository) is and how it safeguards your shares",
      "How to register online in under 5 minutes using ZSE Direct or VFEX Direct",
      "Required KYC documents: National ID, Proof of Residence, and active bank or mobile wallet details",
      "The role of registered stockbrokers in executing and advising on trades",
    ],
    beginnerTip:
      "Never buy shares from unverified third parties or social media channels. All legitimate share trades happen through licensed SECZim stockbrokers and official exchange portals.",
    primaryCtaText: "Step-by-Step Account Tutorial",
    primaryCtaLink: "/tutorials",
    secondaryCtaText: "Find Licensed Brokers",
    secondaryCtaLink: "/contact",
  },
  {
    id: "milestone-4",
    stepNumber: "04",
    phase: "execution",
    timeEstimate: "30 Mins",
    badge: "First Trade Walkthrough",
    title: "Funding Your Account & Placing Your Very First Order",
    summary:
      "Once registered, you can deposit funds using EcoCash, InnBucks, ZimSwitch, or bank transfer and place your order on the live exchange order book.",
    image: courseEtf,
    takeaways: [
      "Understanding the Order Book: Bids (what buyers will pay) vs Asks (what sellers want)",
      "Market Orders (buy at the best available current price) vs Limit Orders (buy only at your specified target price)",
      "Why starting with diversified ETFs (like the Morgan & Co or Cass Saddle ETFs) is the safest first trade for beginners",
      "Transaction fees and taxes: Breakdown of SECZim levies, investor protection fund, and broker commission",
    ],
    beginnerTip:
      "For your first trade, consider buying an ETF (Exchange Traded Fund). With one purchase, you instantly own a tiny piece of the top 10 companies on the exchange, spreading your risk automatically.",
    primaryCtaText: "Learn About ETFs",
    primaryCtaLink: "/courses",
    secondaryCtaText: "Test Order Knowledge",
    secondaryCtaLink: "/courses/11485",
  },
  {
    id: "milestone-5",
    stepNumber: "05",
    phase: "execution",
    timeEstimate: "25 Mins",
    badge: "Post-Investment Money Strategy",
    title: "Managing Your Returns: How to Use Your Money & Grow Wealth",
    summary:
      "Now that your money is invested, what should you do next? Learn how investment returns work in real life, when to reinvest for compound growth versus when to cash out profits to your mobile wallet or bank.",
    image: investmentImg,
    takeaways: [
      "Dividends vs Capital Appreciation: Dividends are cash payouts deposited into your wallet/bank; capital appreciation is the growth in the market value of the shares you hold.",
      "The Compounding Strategy (Reinvesting): Using your dividend earnings and regular monthly savings to purchase more shares, allowing your portfolio to grow exponentially over time.",
      "Withdrawing Your Profits (Cashing Out): How to sell shares on ZSE Direct, understand the T+2 settlement cycle, and withdraw liquid cash straight into your EcoCash, InnBucks, or bank account.",
      "The Golden Emergency Rule: Never invest money needed for everyday necessities like rent or food. Keep an emergency fund in cash so you never have to panic-sell during temporary market dips.",
      "Diversifying into Income Assets: Allocating portions of your earnings into high-yielding Real Estate Investment Trusts (REITs) and fixed-income assets to establish consistent, passive cash flow.",
    ],
    beginnerTip:
      "Financial rule of thumb: Reinvesting your early dividends to buy even a few extra shares every quarter creates a snowball effect that turns small initial savings into life-changing long-term wealth.",
    primaryCtaText: "Explore Wealth Building Courses",
    primaryCtaLink: "/courses",
    secondaryCtaText: "Watch Cashing Out & Dividends Guide",
    secondaryCtaLink: "/tutorials",
  },
  {
    id: "milestone-6",
    stepNumber: "06",
    phase: "execution",
    timeEstimate: "Ongoing",
    badge: "Long-term Wealth & Certification",
    title: "Tracking Dividends, Annual Reports & Earning Accreditation",
    summary:
      "Investing is a lifelong skill. Learn how to track your growing portfolio, attend company AGMs as a shareholder, and earn official ZSE verified training certificates.",
    image: courseStatements,
    takeaways: [
      "How to read an annual financial statement: Revenue, Profit After Tax, and Earnings Per Share (EPS)",
      "Receiving dividend notifications directly into your mobile wallet or bank account",
      "Taking official assessments on this portal to earn verifiable exchange certification credentials",
    ],
    beginnerTip:
      "Once you finish the modules on this portal, take the free examination to download your ZSE digital certificate. You can link it to your LinkedIn profile or CV.",
    primaryCtaText: "Verify Certificate Credentials",
    primaryCtaLink: "/verify",
    secondaryCtaText: "View All Exchange Courses",
    secondaryCtaLink: "/courses",
  },
];

export default function LearningJourney() {
  const [activeStep, setActiveStep] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [expandedTip, setExpandedTip] = useState<string | null>("milestone-1");
  const milestoneRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        const current = (window.scrollY / totalScroll) * 100;
        setScrollProgress(Math.min(100, Math.max(0, current)));
      }

      // Check which milestone is in viewport
      milestoneRefs.current.forEach((el, idx) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        if (rect.top <= window.innerHeight * 0.4 && rect.bottom >= window.innerHeight * 0.2) {
          setActiveStep(idx);
        }
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToMilestone = (idx: number) => {
    setActiveStep(idx);
    const target = milestoneRefs.current[idx];
    if (target) {
      const topOffset = 140;
      const elementPosition = target.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - topOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-slate-100 font-montserrat">
      <Navbar />

      {/* Sticky Progress Bar & Quick Jump Ribbon */}
      <div className="sticky top-0 z-40 bg-[#0c1427]/95 backdrop-blur-md border-b border-slate-800 shadow-lg">
        {/* Progress Bar Line */}
        <div className="w-full h-1 bg-slate-800">
          <div
            className="h-full bg-gradient-to-r from-[#00aeef] via-sky-400 to-emerald-400 transition-all duration-150"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>

        {/* Milestone Quick Jump Buttons */}
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-bold text-[#00aeef] uppercase tracking-wider hidden sm:inline">
              Roadmap:
            </span>
            <span className="text-xs text-slate-300 font-semibold">
              Step {activeStep + 1} of {MILESTONES.length}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {MILESTONES.map((m, idx) => (
              <button
                key={m.id}
                onClick={() => scrollToMilestone(idx)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeStep === idx
                    ? "bg-[#00aeef] text-white shadow-md shadow-[#00aeef]/20 scale-105"
                    : "bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700"
                }`}
              >
                <span>{m.stepNumber}</span>
                <span className="hidden md:inline truncate max-w-[120px]">
                  {m.title.split(":")[0].split(" ")[0]} {m.title.split(":")[0].split(" ")[1] || ""}
                </span>
              </button>
            ))}
          </div>

          <Link
            to="/courses/11485"
            className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold hover:bg-emerald-500/30 transition-colors"
          >
            <span>Start Free</span>
            <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
          </Link>
        </div>
      </div>

      {/* Hero Introduction */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-b from-[#0b1324] via-[#0d1830] to-[#0a0f1d]">
        {/* Glow Effects */}
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-[#00aeef]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00aeef]/15 border border-[#00aeef]/30 text-[#00aeef] text-xs font-bold uppercase tracking-wider mb-6">
            <FontAwesomeIcon icon={faRoute} />
            <span>Official Investor Roadmap</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
            The Beginner’s <span className="text-[#00aeef]">Learning Journey</span>
          </h1>

          <p className="mt-4 text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Follow our interactive, step-by-step roadmap to go from absolute financial novice to a
            confident, accredited investor on the Zimbabwe Stock Exchange & Victoria Falls Stock Exchange.
          </p>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-10 max-w-3xl mx-auto">
            <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 text-center">
              <div className="text-xl sm:text-2xl font-black text-white">6 Steps</div>
              <div className="text-xs text-slate-400 mt-0.5">Structured Milestones</div>
            </div>
            <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 text-center">
              <div className="text-xl sm:text-2xl font-black text-[#00aeef]">100% Free</div>
              <div className="text-xs text-slate-400 mt-0.5">Open Access Courses</div>
            </div>
            <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 text-center">
              <div className="text-xl sm:text-2xl font-black text-emerald-400">Zero Jargon</div>
              <div className="text-xs text-slate-400 mt-0.5">Plain-English Guides</div>
            </div>
            <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 text-center">
              <div className="text-xl sm:text-2xl font-black text-amber-400">Accredited</div>
              <div className="text-xs text-slate-400 mt-0.5">ZSE Certificate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Roadmap Container with Visual Connecting Track */}
      <section className="relative py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        {/* Center/Left Connecting Pipeline Track Line */}
        <div className="hidden lg:block absolute left-1/2 top-16 bottom-20 w-1 bg-gradient-to-b from-[#00aeef] via-sky-500 via-emerald-500 to-amber-500 transform -translate-x-1/2 rounded-full opacity-60" />

        <div className="space-y-16 lg:space-y-24 relative">
          {MILESTONES.map((m, idx) => {
            const isEven = idx % 2 === 0;
            const isActive = activeStep === idx;

            return (
              <div
                key={m.id}
                ref={(el) => (milestoneRefs.current[idx] = el)}
                id={m.id}
                className="relative scroll-mt-28"
              >
                {/* Visual Step Marker on Center Track (Desktop) */}
                <div className="hidden lg:flex absolute left-1/2 top-8 transform -translate-x-1/2 z-20 items-center justify-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-sm transition-all duration-300 border-4 ${
                      isActive
                        ? "bg-[#00aeef] border-white text-slate-950 scale-125 shadow-xl shadow-[#00aeef]/50"
                        : "bg-slate-900 border-[#00aeef]/40 text-[#00aeef]"
                    }`}
                  >
                    {m.stepNumber}
                  </div>
                </div>

                {/* Milestone Row */}
                <div
                  className={`grid grid-cols-1 lg:grid-cols-12 gap-8 items-center ${
                    isEven ? "" : "lg:flex-row-reverse"
                  }`}
                >
                  {/* Left Column (Content if Even, Media if Odd) */}
                  <div
                    className={`lg:col-span-6 ${
                      isEven ? "lg:pr-14" : "lg:order-2 lg:pl-14"
                    }`}
                  >
                    <div
                      className={`p-6 sm:p-8 rounded-3xl transition-all duration-300 border ${
                        isActive
                          ? "bg-slate-900/90 border-[#00aeef] shadow-2xl shadow-[#00aeef]/10"
                          : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      {/* Badge and Time Estimate Header */}
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#00aeef]/15 text-[#00aeef] border border-[#00aeef]/30">
                          {m.badge}
                        </span>
                        <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                          <FontAwesomeIcon icon={faRoute} className="text-[#00aeef]" />
                          Est. {m.timeEstimate}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug mb-3">
                        {m.title}
                      </h3>

                      {/* Summary */}
                      <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-5">
                        {m.summary}
                      </p>

                      {/* Core Takeaways */}
                      <div className="space-y-2.5 mb-6">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          Key Milestones in This Step:
                        </h4>
                        {m.takeaways.map((takeaway, tIdx) => (
                          <div key={tIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300">
                            <FontAwesomeIcon
                              icon={faCircleCheck}
                              className="text-[#00aeef] text-sm mt-0.5 shrink-0"
                            />
                            <span>{takeaway}</span>
                          </div>
                        ))}
                      </div>

                      {/* Beginner Tip Callout (Expandable) */}
                      <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-200">
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedTip(expandedTip === m.id ? null : m.id)
                          }
                          className="w-full flex items-center justify-between gap-2 text-xs font-bold uppercase tracking-wider text-amber-300"
                        >
                          <div className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faLightbulb} />
                            <span>Beginner Insight</span>
                          </div>
                          <FontAwesomeIcon
                            icon={expandedTip === m.id ? faChevronUp : faChevronDown}
                            className="text-xs"
                          />
                        </button>
                        {expandedTip === m.id && (
                          <p className="text-xs sm:text-sm text-amber-100/90 mt-2 leading-relaxed">
                            {m.beginnerTip}
                          </p>
                        )}
                      </div>

                      {/* Action CTAs */}
                      <div className="flex flex-wrap items-center gap-3 pt-2">
                        <Link
                          to={m.primaryCtaLink}
                          className="px-5 py-2.5 rounded-xl bg-[#00aeef] hover:bg-[#008cc0] text-white font-bold text-xs uppercase tracking-wider transition-colors inline-flex items-center gap-2 shadow-md shadow-[#00aeef]/20"
                        >
                          <FontAwesomeIcon icon={faGraduationCap} />
                          <span>{m.primaryCtaText}</span>
                        </Link>
                        {m.secondaryCtaText && m.secondaryCtaLink && (
                          <Link
                            to={m.secondaryCtaLink}
                            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider transition-colors inline-flex items-center gap-1.5"
                          >
                            <span>{m.secondaryCtaText}</span>
                            <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column (Visual Card matching the timeline) */}
                  <div
                    className={`lg:col-span-6 ${
                      isEven ? "lg:pl-14" : "lg:order-1 lg:pr-14"
                    }`}
                  >
                    <div className="relative group">
                      {/* Glowing Frame */}
                      <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-[#00aeef]/30 via-sky-500/20 to-emerald-500/20 blur-lg opacity-70 group-hover:opacity-100 transition-opacity" />

                      <div className="relative overflow-hidden rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl">
                        {/* Circular Milestone Watermark Node */}
                        <div className="absolute top-4 right-4 z-10 w-12 h-12 rounded-full bg-slate-950/80 backdrop-blur-md border border-[#00aeef]/40 flex items-center justify-center font-black text-white text-sm">
                          {m.stepNumber}
                        </div>

                        <img
                          src={m.image}
                          alt={m.title}
                          className="w-full h-64 sm:h-80 object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        />

                        {/* Bottom Overlay Label */}
                        <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-[#00aeef]">
                            Practical Learning Asset
                          </span>
                          <h4 className="text-white font-bold text-sm sm:text-base leading-tight mt-0.5">
                            {m.title}
                          </h4>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Final Action Launchpad Banner */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-t from-[#060a14] to-[#0a0f1d] border-t border-slate-800">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-2xl mx-auto mb-6">
            <FontAwesomeIcon icon={faCertificate} />
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Ready to Take Your First Real Step?
          </h2>

          <p className="mt-3 text-slate-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Join thousands of everyday Zimbabwean citizens, diaspora investors, and students
            who started with Milestone 1 and now invest confidently.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/courses/11485"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#00aeef] hover:bg-[#008cc0] text-white font-bold text-sm uppercase tracking-wider transition-all shadow-lg shadow-[#00aeef]/30 inline-flex items-center justify-center gap-2"
            >
              <FontAwesomeIcon icon={faGraduationCap} />
              <span>Begin Milestone 1: Investment 101</span>
            </Link>
            <Link
              to="/courses"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-sm uppercase tracking-wider transition-colors inline-flex items-center justify-center gap-2"
            >
              <span>Browse All Exchange Courses</span>
              <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

