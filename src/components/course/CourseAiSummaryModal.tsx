import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faWandMagicSparkles,
  faCheck,
  faCopy,
  faRotateRight,
  faGraduationCap,
  faClock,
  faLayerGroup,
  faBullseye,
  faPaperPlane,
  faComments,
  faBookOpen,
  faCircleCheck,
  faSparkles,
  faArrowRight,
  faUserGraduate,
  faShieldHalved,
  faLightbulb,
  faArrowUpRightFromSquare,
  faChartLine,
  faBuildingColumns,
  faCoins,
  faExternalLinkAlt,
} from "@fortawesome/free-solid-svg-icons";
import { courseService } from "@/services/course.service";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { TypewriterText } from "@/components/ai/TypewriterText";

const SHOWCASE_COUNTERS = [
  {
    ticker: "DLTA",
    name: "Delta Corporation Limited",
    exchange: "ZSE",
    currency: "ZiG",
    sector: "Beverages & Consumer Staples",
    marketRole: "Zimbabwe's largest listed corporate by market capitalization and institutional liquidity.",
    dividendProfile: "Reliable semi-annual dividend distributions in both ZiG and foreign currency components.",
    syllabusConnection: "Used to demonstrate blue-chip equities valuation, price-to-earnings (P/E) benchmarking, and dividend discount modeling in capital markets.",
    portalUrl: "https://www.zsedirect.co.zw",
    highlights: ["Largest market cap on ZSE", "High trading liquidity", "Consumer staple defensive moat"]
  },
  {
    ticker: "ECO",
    name: "Econet Wireless Zimbabwe",
    exchange: "ZSE",
    currency: "ZiG",
    sector: "Telecommunications & Technology",
    marketRole: "Pioneer in mobile telecoms, digital broadband infrastructure, and mobile network operations.",
    dividendProfile: "Periodic capital reinvestment and cash distributions aligned with infrastructure modernization.",
    syllabusConnection: "Illustrates technology growth stock dynamics, volume-weighted average price (VWAP) trading, and retail investor participation.",
    portalUrl: "https://www.zsedirect.co.zw",
    highlights: ["Dominant telecom provider", "Retail investor favorite", "High digital ecosystem integration"]
  },
  {
    ticker: "SIM",
    name: "Simbisa Brands Limited",
    exchange: "VFEX",
    currency: "USD",
    sector: "Quick Service Restaurants (QSR)",
    marketRole: "Regional hospitality and food retailer operating across Zimbabwe, Kenya, Ghana, Mauritius, and DRC.",
    dividendProfile: "Pure US Dollar dividends paid semi-annually directly into foreign currency accounts (FCA).",
    syllabusConnection: "Exemplifies Victoria Falls Stock Exchange US Dollar counter investing, regional export expansion, and zero percent capital gains tax advantages.",
    portalUrl: "https://www.vfexdirect.co.zw",
    highlights: ["100% USD-denominated trading", "0% capital gains tax on VFEX", "Multi-country African revenue"]
  },
  {
    ticker: "PHL",
    name: "Padenga Holdings Limited",
    exchange: "VFEX",
    currency: "USD",
    sector: "Export Agriculture & Gold Mining",
    marketRole: "Global producer of premium crocodile skins and export gold mining via Dallaglio Investments.",
    dividendProfile: "Hard-currency foreign exchange dividend distributions funded by global commodity export proceeds.",
    syllabusConnection: "Demonstrates commodity export hedging, dual-listing migration from ZSE to VFEX, and hard currency portfolio balancing.",
    portalUrl: "https://www.vfexdirect.co.zw",
    highlights: ["Direct foreign currency earner", "Gold mining growth division", "International luxury brand supplier"]
  },
  {
    ticker: "SCIL",
    name: "Seed Co International Limited",
    exchange: "VFEX",
    currency: "USD",
    sector: "Pan-African Agribusiness & Seed Genetics",
    marketRole: "Leading agricultural research and seed certified producer with operations across 15+ African nations.",
    dividendProfile: "USD dividends reflecting regional agricultural harvest cycles and cross-border licensing.",
    syllabusConnection: "Highlights agricultural risk management, regional expansion on the VFEX offshore exchange, and food security equity investments.",
    portalUrl: "https://www.vfexdirect.co.zw",
    highlights: ["Pan-African agricultural footprint", "Proprietary hybrid seed IP", "VFEX dollar trading liquidity"]
  }
];

interface CourseAiSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: number | string | null;
  courseTitle?: string;
  isEnrolled?: boolean;
}

interface AiSummaryData {
  executive_summary?: string;
  key_takeaways?: string[];
  target_audience?: string[];
  prerequisites?: string;
  investment_relevance?: string;
  modules_breakdown?: Array<{
    module_number: number;
    title: string;
    ai_insight: string;
  }>;
  meta?: {
    provider?: string;
    level?: string;
    duration?: string;
    modules_count?: number;
  };
}

export const CourseAiSummaryModal = ({
  isOpen,
  onClose,
  courseId,
  courseTitle,
  isEnrolled,
}: CourseAiSummaryModalProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [data, setData] = useState<AiSummaryData | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "modules" | "market_lab" | "audience" | "ask">("overview");
  const [selectedCounterIndex, setSelectedCounterIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  // Ask AI state
  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{ q: string; a: string }>>([]);

  useEffect(() => {
    if (isOpen && courseId) {
      fetchSummary();
    } else {
      setData(null);
      setFetchError(null);
      setChatHistory([]);
      setQuestion("");
    }
  }, [isOpen, courseId]);

  const fetchSummary = async (refresh: boolean = false) => {
    if (!courseId) return;
    try {
      setLoading(true);
      setFetchError(null);
      const res = await courseService.getCourseAiSummary(courseId, refresh);
      const summaryPayload = (res && typeof res === 'object' && 'data' in res && res.data) ? res.data : res;
      setData(summaryPayload);
    } catch (err: unknown) {
      console.error("AI summary fetch error:", err);
      const axiosErr = err as { response?: { data?: { message?: string } }; message?: string };
      const msg = axiosErr.response?.data?.message || axiosErr.message || "Unable to retrieve AI summary at this moment.";
      setFetchError(msg);
      toast({
        title: "AI Analysis",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopySummary = () => {
    if (!data) return;
    const text = `
=== ZSE TRAINING INSTITUTE: AI COURSE SUMMARY ===
Course: ${courseTitle || "ZSE Professional Course"}

EXECUTIVE SUMMARY:
${data.executive_summary || ""}

KEY TAKEAWAYS:
${(data.key_takeaways || []).map((t, i) => `${i + 1}. ${t}`).join("\n")}

MARKET & INVESTMENT RELEVANCE:
${data.investment_relevance || ""}

PREREQUISITES:
${data.prerequisites || ""}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({
      title: "Copied to Clipboard",
      description: "AI course summary copied successfully.",
    });
    setTimeout(() => setCopied(false), 2500);
  };

  const handleAskQuestion = async (customQ?: string) => {
    const q = customQ || question;
    if (!q.trim() || !courseId || asking) return;

    try {
      setAsking(true);
      const res = await courseService.askCourseAi(courseId, q);
      setChatHistory((prev) => [...prev, { q, a: res.answer || "Answer could not be generated." }]);
      setQuestion("");
    } catch (err) {
      toast({
        title: "AI Copilot Error",
        description: "Failed to query AI copilot. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAsking(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl w-[95vw] max-h-[90vh] p-0 overflow-hidden bg-white rounded-3xl border border-slate-200 shadow-2xl flex flex-col">
        {/* Header with AI Gradient */}
        <div className="relative bg-gradient-to-r from-[#070e1e] via-[#0b1c3d] to-[#00aeef] p-6 text-white shrink-0">
          <div className="relative z-10">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-[11px] font-bold uppercase tracking-wider text-sky-200 border border-white/20">
                <FontAwesomeIcon icon={faWandMagicSparkles} className="text-[#00aeef]" />
                ZSE Training Institute Explorer
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => fetchSummary(true)}
                  disabled={loading}
                  className="text-white/80 hover:text-white hover:bg-white/10 h-7 text-xs px-2.5 rounded-lg"
                  title="Regenerate summary"
                >
                  <FontAwesomeIcon icon={faRotateRight} className={`mr-1.5 ${loading ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCopySummary}
                  disabled={!data || loading}
                  className="text-white/80 hover:text-white hover:bg-white/10 h-7 text-xs px-2.5 rounded-lg"
                  title="Copy summary"
                >
                  <FontAwesomeIcon icon={copied ? faCheck : faCopy} className="mr-1.5" />
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>
            </div>

            <DialogTitle className="text-xl sm:text-2xl font-black text-white leading-tight">
              Explorer AI • {courseTitle || "Curriculum & Market Intelligence"}
            </DialogTitle>
            <p className="text-xs text-sky-100/90 mt-1">
              AI-assisted syllabus analysis, practical trading application, and listed counter intelligence
            </p>
          </div>

          <div className="absolute -right-10 -top-10 w-44 h-44 bg-[#00aeef]/20 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute left-1/3 -bottom-10 w-40 h-40 bg-purple-500/20 rounded-full blur-2xl pointer-events-none"></div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2 overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab("overview")}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "overview"
                ? "border-[#00aeef] text-[#00aeef]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <FontAwesomeIcon icon={faLightbulb} className="text-[11px]" />
            Executive Overview
          </button>
          <button
            onClick={() => setActiveTab("modules")}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "modules"
                ? "border-[#00aeef] text-[#00aeef]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <FontAwesomeIcon icon={faLayerGroup} className="text-[11px]" />
            Syllabus Breakdown
          </button>
          <button
            onClick={() => setActiveTab("market_lab")}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "market_lab"
                ? "border-[#00aeef] text-[#00aeef]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <FontAwesomeIcon icon={faChartLine} className="text-[11px]" />
            Market Lab
            <span className="text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.2 rounded-full font-extrabold ml-1">Counters</span>
          </button>
          <button
            onClick={() => setActiveTab("audience")}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "audience"
                ? "border-[#00aeef] text-[#00aeef]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <FontAwesomeIcon icon={faUserGraduate} className="text-[11px]" />
            Learner Fit & Prerequisites
          </button>
          <button
            onClick={() => setActiveTab("ask")}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "ask"
                ? "border-[#00aeef] text-[#00aeef]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <FontAwesomeIcon icon={faComments} className="text-[11px]" />
            Ask Explorer
            <span className="text-[9px] bg-sky-100 text-[#00aeef] px-1.5 py-0.2 rounded-full font-extrabold ml-1">Live</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 font-montserrat">
          {loading ? (
            <div className="py-12 space-y-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-sky-50 text-[#00aeef] flex items-center justify-center mx-auto shadow-inner animate-pulse">
                <FontAwesomeIcon icon={faWandMagicSparkles} className="h-8 w-8 animate-bounce" />
              </div>
              <div className="space-y-2 max-w-md mx-auto">
                <h4 className="font-bold text-slate-900 text-base">Synthesizing Course with AI...</h4>
                <p className="text-xs text-slate-500">
                  Analyzing syllabus, slides, learning objectives, and practical investment competencies.
                </p>
              </div>
              <div className="space-y-3 max-w-lg mx-auto pt-2">
                <div className="h-3 bg-slate-100 rounded-full w-full animate-pulse"></div>
                <div className="h-3 bg-slate-100 rounded-full w-4/5 mx-auto animate-pulse"></div>
                <div className="h-3 bg-slate-100 rounded-full w-2/3 mx-auto animate-pulse"></div>
              </div>
            </div>
          ) : !data ? (
            <div className="text-center py-12 text-slate-400 space-y-3">
              <FontAwesomeIcon icon={faLightbulb} className="h-10 w-10 text-slate-300" />
              <p className="font-bold text-slate-700 text-sm">
                {fetchError ? "Could not generate AI summary" : "No analysis available"}
              </p>
              {fetchError && (
                <p className="text-xs text-rose-500 max-w-sm mx-auto">{fetchError}</p>
              )}
              <Button size="sm" onClick={() => fetchSummary(true)} className="mt-2 rounded-xl text-xs bg-[#00aeef] text-white hover:bg-[#0098d4]">
                <FontAwesomeIcon icon={faRotateRight} className="mr-1.5" />
                Try Again
              </Button>
            </div>
          ) : (
            <>
              {/* TAB 1: EXECUTIVE OVERVIEW */}
              {activeTab === "overview" && (
                <div className="space-y-6">
                  {/* Summary Box */}
                  <div className="bg-sky-50/70 border border-sky-100 rounded-2xl p-5 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-2.5">
                      <h4 className="text-xs font-bold text-[#00aeef] uppercase tracking-wider flex items-center gap-1.5">
                        <FontAwesomeIcon icon={faBullseye} />
                        Executive Summary
                      </h4>
                    </div>
                    {data.executive_summary && (
                      <TypewriterText
                        text={data.executive_summary}
                        speed={32}
                        chunkSize={1}
                        className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line font-medium"
                      />
                    )}
                  </div>

                  {/* Key Takeaways */}
                  {data.key_takeaways && data.key_takeaways.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                        <FontAwesomeIcon icon={faCircleCheck} className="text-emerald-500" />
                        Key Competencies & Practical Takeaways
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {data.key_takeaways.map((takeaway, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all hover:bg-white animate-in fade-in slide-in-from-bottom-2 duration-300"
                            style={{ animationDelay: `${idx * 80}ms` }}
                          >
                            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <span className="text-xs text-slate-700 leading-snug font-medium">
                              {takeaway}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Investment Relevance */}
                  {data.investment_relevance && (
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                        <FontAwesomeIcon icon={faShieldHalved} className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="text-xs font-bold text-emerald-900 uppercase tracking-wider mb-1">
                          Market & Practical Trading Relevance
                        </h5>
                        <TypewriterText
                          text={data.investment_relevance}
                          speed={32}
                          chunkSize={1}
                          className="text-xs text-emerald-800 leading-relaxed font-medium"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: SYLLABUS BREAKDOWN */}
              {activeTab === "modules" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Module-by-Module AI Breakdown</h4>
                      <p className="text-xs text-slate-500">What specific capability is developed at each stage</p>
                    </div>
                    <Badge variant="outline" className="text-xs border-slate-200">
                      {data.modules_breakdown?.length || 0} Modules
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    {data.modules_breakdown && data.modules_breakdown.length > 0 ? (
                      data.modules_breakdown.map((mod) => (
                        <div
                          key={mod.module_number}
                          className="p-4 rounded-2xl border border-slate-200/80 bg-white hover:border-[#00aeef]/50 transition-all flex items-start gap-3.5"
                        >
                          <div className="w-8 h-8 rounded-xl bg-sky-50 text-[#00aeef] font-bold text-xs flex items-center justify-center shrink-0">
                            {mod.module_number}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-bold text-xs sm:text-sm text-slate-900 mb-1">
                              {mod.title}
                            </h5>
                            <p className="text-xs text-slate-600 leading-relaxed">
                              {mod.ai_insight}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500 py-6 text-center">
                        Detailed module breakdown is currently compiling.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: MARKET LAB - LISTED COUNTERS */}
              {activeTab === "market_lab" && (
                <div className="space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <span>ZSE & VFEX Market Lab</span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full">
                          Real-World Case Studies
                        </span>
                      </h4>
                      <p className="text-xs text-slate-500">
                        See how this course's valuation and trading principles apply to live listed counters on ZSE & VFEX Direct.
                      </p>
                    </div>
                  </div>

                  {/* Counter Pills */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {SHOWCASE_COUNTERS.map((counter, idx) => {
                      const isSelected = selectedCounterIndex === idx;
                      return (
                        <button
                          key={counter.ticker}
                          onClick={() => setSelectedCounterIndex(idx)}
                          className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 border ${
                            isSelected
                              ? "bg-[#070e1e] text-white border-[#070e1e] shadow-md shadow-slate-900/10"
                              : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                          }`}
                        >
                          <span>{counter.ticker}</span>
                          <span
                            className={`text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase ${
                              counter.exchange === "VFEX"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-sky-100 text-sky-700"
                            }`}
                          >
                            {counter.exchange} • {counter.currency}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Selected Counter Card */}
                  {(() => {
                    const c = SHOWCASE_COUNTERS[selectedCounterIndex];
                    return (
                      <div className="bg-slate-50/70 border border-slate-200/90 rounded-2xl p-5 space-y-4">
                        <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-slate-200/80">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-black text-slate-900">{c.name}</span>
                              <Badge className="bg-[#00aeef] text-white text-[10px] font-bold">
                                {c.ticker}
                              </Badge>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5 font-medium">
                              Sector: <span className="text-slate-800 font-semibold">{c.sector}</span> • Primary Exchange: <span className="text-slate-800 font-semibold">{c.exchange} ({c.currency})</span>
                            </p>
                          </div>

                          <a
                            href={c.portalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-[#00aeef] text-[#00aeef] text-xs font-bold shadow-xs hover:bg-sky-50/50 transition-all"
                          >
                            <span>Open on {c.exchange} Direct</span>
                            <FontAwesomeIcon icon={faExternalLinkAlt} className="text-[10px]" />
                          </a>
                        </div>

                        {/* Syllabus Connection Insight */}
                        <div className="p-4 rounded-xl bg-sky-50/90 border border-sky-100">
                          <h5 className="text-xs font-bold text-[#00aeef] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                            <FontAwesomeIcon icon={faLightbulb} />
                            How this Counter Applies to this Course Syllabus
                          </h5>
                          <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                            {c.syllabusConnection}
                          </p>
                        </div>

                        {/* Market Role & Highlights */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="p-3.5 rounded-xl bg-white border border-slate-200/80">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                              Institutional Role
                            </span>
                            <p className="text-xs text-slate-700 leading-relaxed font-medium">
                              {c.marketRole}
                            </p>
                          </div>
                          <div className="p-3.5 rounded-xl bg-white border border-slate-200/80">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                              Dividend & Capital Return
                            </span>
                            <p className="text-xs text-slate-700 leading-relaxed font-medium">
                              {c.dividendProfile}
                            </p>
                          </div>
                        </div>

                        {/* Bullet Highlights */}
                        <div className="flex flex-wrap gap-2 pt-1">
                          {c.highlights.map((h, i) => (
                            <span
                              key={i}
                              className="text-[11px] font-semibold text-slate-700 bg-white border border-slate-200 px-2.5 py-1 rounded-lg flex items-center gap-1.5"
                            >
                              <FontAwesomeIcon icon={faCircleCheck} className="text-emerald-500 text-[10px]" />
                              {h}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* TAB 4: AUDIENCE & FIT */}
              {activeTab === "audience" && (
                <div className="space-y-5">
                  {/* Target Audience */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <FontAwesomeIcon icon={faUserGraduate} className="text-[#00aeef]" />
                      Who Should Take This Course
                    </h4>
                    <div className="space-y-2">
                      {data.target_audience && data.target_audience.length > 0 ? (
                        data.target_audience.map((aud, i) => (
                          <div key={i} className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 font-medium">
                            <FontAwesomeIcon icon={faCircleCheck} className="text-[#00aeef] text-xs shrink-0" />
                            <span>{aud}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-500">Retail investors, students, and financial analysts.</p>
                      )}
                    </div>
                  </div>

                  {/* Prerequisites */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <FontAwesomeIcon icon={faGraduationCap} className="text-slate-500" />
                      Prerequisites & Preparation
                    </h5>
                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      {data.prerequisites || "No prior formal finance qualification required. Open to all interested learners."}
                    </p>
                  </div>

                  {/* Estimated Commitment */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-xl border border-slate-200/80 bg-white">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Time Commitment</span>
                      <span className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1">
                        <FontAwesomeIcon icon={faClock} className="text-[#00aeef]" />
                        {data.meta?.duration || "Self-Paced (4-8 hours)"}
                      </span>
                    </div>
                    <div className="p-3.5 rounded-xl border border-slate-200/80 bg-white">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Accreditation</span>
                      <span className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1">
                        <FontAwesomeIcon icon={faShieldHalved} className="text-emerald-500" />
                        Verifiable Certificate
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: ASK EXPLORER COPILOT */}
              {activeTab === "ask" && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <FontAwesomeIcon icon={faComments} className="text-[#00aeef]" />
                      Ask Explorer (Capital Markets Copilot)
                    </h4>
                    <p className="text-xs text-slate-500">
                      Ask any question about this syllabus, SECZim regulations, trading workflows on ZSE/VFEX Direct, or investor readiness.
                    </p>
                  </div>

                  {/* Sample Quick Questions */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {[
                      "Will I earn an accredited certificate?",
                      "How do I buy shares on ZSE Direct?",
                      "What is the difference between ZSE (ZiG) and VFEX (USD)?",
                      "How does this course apply to practical trading?",
                    ].map((sampleQ, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleAskQuestion(sampleQ)}
                        disabled={asking}
                        className="text-[11px] font-semibold text-slate-600 bg-slate-100 hover:bg-sky-50 hover:text-[#00aeef] px-3 py-1.5 rounded-full border border-slate-200/60 transition-colors text-left"
                      >
                        + {sampleQ}
                      </button>
                    ))}
                  </div>

                  {/* Chat messages */}
                  <div className="space-y-3 max-h-64 overflow-y-auto pr-1 pt-2">
                    {chatHistory.map((msg, i) => {
                      const isLatest = i === chatHistory.length - 1;
                      return (
                        <div key={i} className="space-y-2">
                          <div className="flex justify-end">
                            <div className="bg-[#0b1324] text-white text-xs px-3.5 py-2 rounded-2xl rounded-tr-none max-w-[85%] font-medium shadow-xs">
                              {msg.q}
                            </div>
                          </div>
                          <div className="flex justify-start">
                            <div className="bg-sky-50 border border-sky-100 text-slate-800 text-xs px-3.5 py-2.5 rounded-2xl rounded-tl-none max-w-[90%] font-medium leading-relaxed flex items-start gap-2.5 shadow-xs">
                              <FontAwesomeIcon icon={faWandMagicSparkles} className="text-[#00aeef] text-xs mt-0.5 shrink-0" />
                              <div className="flex-1">
                                {isLatest ? (
                                  <TypewriterText text={msg.a} speed={32} chunkSize={1} />
                                ) : (
                                  <span>{msg.a}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Input Form */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleAskQuestion();
                    }}
                    className="flex items-center gap-2 pt-2"
                  >
                    <input
                      type="text"
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="Ask anything about this course..."
                      disabled={asking}
                      className="flex-1 text-xs h-10 px-3.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#00aeef] bg-slate-50"
                    />
                    <Button
                      type="submit"
                      disabled={asking || !question.trim()}
                      className="bg-[#00aeef] hover:bg-[#0098d4] text-white h-10 px-4 rounded-xl text-xs font-bold shrink-0"
                    >
                      {asking ? (
                        <FontAwesomeIcon icon={faRotateRight} className="animate-spin text-xs" />
                      ) : (
                        <FontAwesomeIcon icon={faPaperPlane} className="text-xs" />
                      )}
                    </Button>
                  </form>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="rounded-xl border-slate-200 text-xs font-semibold h-9"
          >
            Close Window
          </Button>

          <Button
            size="sm"
            onClick={() => {
              onClose();
              if (courseId) {
                navigate(isEnrolled ? `/learn/${courseId}` : `/courses/${courseId}`);
              }
            }}
            className="bg-[#0b1324] hover:bg-[#121f3a] text-white font-bold text-xs h-9 px-5 rounded-xl shadow-sm flex items-center gap-2"
          >
            <span>{isEnrolled ? "Go to Course" : "View Full Course Details"}</span>
            <FontAwesomeIcon icon={faArrowRight} className="text-xs text-[#00aeef]" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

