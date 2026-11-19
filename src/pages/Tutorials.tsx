import { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faPlay,
  faMobileScreen,
  faDesktop,
  faCheckCircle,
  faClock,
  faUserPlus,
  faWallet,
  faMoneyBillTransfer,
  faChartLine,
  faMobileAlt,
  faCoins,
  faGlobe,
  faArrowRight,
  faGraduationCap,
  faArrowTrendUp,
} from "@fortawesome/free-solid-svg-icons";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import tutorialsBg from "../assets/tutorials.jpg";
import courseDirect from "@/assets/course-direct.jpg";
import courseMarket from "@/assets/course-market-analysis.jpg";
import fundingAccountOrder from "@/assets/funding-account-order.jpg";
import investmentImg from "@/assets/investment.jpg";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { API_BASE_URL } from "@/constants/api";

// -------------------------
// Tutorial Type
// -------------------------
interface Tutorial {
  id: string;
  title: string;
  description: string;
  category: "zse" | "vfex";
  duration: string;
  completed: boolean;
  order: number;
  icon: IconDefinition;
  gradient: string;
  iframecode?: string;
  embedUrl?: string;
}

const defaultTutorials: Tutorial[] = [
  {
    id: "1",
    title: "Mastering ZSE Direct: Retail Investor Masterclass (2026)",
    description: "Comprehensive 2026 video masterclass introducing the ZSE Direct trading platform, retail features, ATS sessions (09:30-13:00 CAT), and market access.",
    category: "zse",
    duration: "6 min",
    completed: true,
    order: 1,
    icon: faDesktop,
    gradient: "from-blue-600 to-cyan-500",
    iframecode: '<video controls controlsList="nodownload" src="/videos/mastering-zse-direct-retail-investor-masterclass.mp4" class="w-full h-full object-contain" playsinline preload="metadata"></video>',
  },
  {
    id: "2",
    title: "How to Register an Account on ZSE Direct",
    description: "Interactive step-by-step hands-on simulation guiding you through account registration, entering personal details, uploading the 3 KYC items (National ID, Proof of Residence, Profile Photo), and selecting your stockbroker.",
    category: "zse",
    duration: "3 min",
    completed: true,
    order: 2,
    icon: faUserPlus,
    gradient: "from-emerald-600 to-teal-500",
    iframecode: '<iframe src="https://app.guideflow.com/embed/qp7o047ijr" width="100%" height="600" style="border:none;border-radius:8px;" allow="clipboard-read; clipboard-write" allowfullscreen></iframe>',
  },
  {
    id: "3",
    title: "Interactive Platform & Trading Walkthrough",
    description: "Interactive hands-on click-through walkthrough demonstrating platform navigation, searching listed counters, checking live prices, and placing orders.",
    category: "zse",
    duration: "4 min",
    completed: false,
    order: 3,
    icon: faMobileScreen,
    gradient: "from-indigo-600 to-cyan-500",
    iframecode: '<iframe src="https://app.supademo.com/embed/cmir6flhu0pj6l821l4stwbjg" width="100%" height="600" style="border:none;border-radius:8px;" allow="clipboard-read; clipboard-write" allowfullscreen></iframe>',
  },
  {
    id: "4",
    title: "Demystifying the Order Book: Bids, Asks & Trading Mechanics",
    description: "Visual deep-dive into the ATS order book, bids, asks, market depth queues, price-time priority matching, and executing orders without slippage.",
    category: "zse",
    duration: "8 min",
    completed: false,
    order: 4,
    icon: faCoins,
    gradient: "from-sky-600 to-indigo-500",
    iframecode: '<video controls controlsList="nodownload" src="/videos/demystifying-the-digital-farmers-market.mp4" class="w-full h-full object-contain" playsinline preload="metadata"></video>',
  },
  {
    id: "5",
    title: "The Ultimate ZSE Direct Readiness Test & Market Rules",
    description: "Interactive walkthrough evaluating investor readiness, covering T+3 settlement, statutory fees, CSD accounts, and SECZim compliance.",
    category: "zse",
    duration: "5 min",
    completed: false,
    order: 5,
    icon: faGraduationCap,
    gradient: "from-rose-600 to-pink-500",
    iframecode: '<video controls controlsList="nodownload" src="/videos/the-ultimate-zse-direct-readiness-test.mp4" class="w-full h-full object-contain" playsinline preload="metadata"></video>',
  },
];

const iconsMap: Record<string, IconDefinition> = {
  "1": faDesktop,
  "2": faUserPlus,
  "3": faMobileScreen,
  "4": faCoins,
  "5": faGraduationCap,
};

const gradientsList = [
  "from-blue-600 to-cyan-500",
  "from-emerald-600 to-teal-500",
  "from-indigo-600 to-cyan-500",
  "from-sky-600 to-indigo-500",
  "from-rose-600 to-pink-500",
];

// Helper to extract YouTube video ID from URL or embed code
const getYouTubeId = (urlOrIframe?: string) => {
  if (!urlOrIframe) return null;
  const match = urlOrIframe.match(/(?:embed\/|v=|vi\/|youtu\.be\/|\/v\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
};

// Helper to extract native mp4 video source from video tag
const extractVideoSrc = (iframecode?: string) => {
  if (!iframecode) return null;
  const match = iframecode.match(/src=["']([^"']+\.mp4[^"']*)["']/i);
  return match ? match[1] : null;
};

const getTutorialPreview = (tutorial: Tutorial): string => {
  const ytId = getYouTubeId(tutorial.iframecode || tutorial.embedUrl);
  if (ytId) {
    return `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
  }

  // Dedicated thematic previews
  if (tutorial.id === "1") return courseDirect;
  if (tutorial.id === "2") return fundingAccountOrder;
  if (tutorial.id === "3") return tutorialsBg;
  if (tutorial.id === "4") return courseMarket;
  if (tutorial.id === "5") return investmentImg;

  return courseDirect;
};

// -------------------------
// Tutorial Card Component
// -------------------------
const TutorialCard = ({
  tutorial,
  onSelect,
}: {
  tutorial: Tutorial;
  onSelect: () => void;
}) => {
  const isSimulation = tutorial.iframecode?.includes("guideflow") || tutorial.iframecode?.includes("supademo");
  const videoSrc = extractVideoSrc(tutorial.iframecode);
  const previewImg = getTutorialPreview(tutorial);

  return (
    <div
      onClick={onSelect}
      className="group relative rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-2xl hover:border-[#00aeef]/60 hover:-translate-y-1.5 transition-all duration-300 cursor-pointer flex flex-col justify-between"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
        {videoSrc ? (
          <video
            src={`${videoSrc}#t=0.5`}
            preload="metadata"
            muted
            playsInline
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 pointer-events-none"
          />
        ) : (
          <img
            src={previewImg}
            alt={tutorial.title}
            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.currentTarget.src = courseDirect;
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-black/30 group-hover:opacity-85 transition-opacity" />

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-13 h-13 rounded-full bg-black/50 backdrop-blur-md border border-white/30 flex items-center justify-center group-hover:scale-110 group-hover:bg-[#00aeef] group-hover:border-transparent transition-all duration-300 shadow-xl">
            <FontAwesomeIcon
              icon={faPlay}
              className="h-5 w-5 text-white ml-0.5 drop-shadow"
            />
          </div>
        </div>

        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <Badge className="bg-[#00aeef] text-white border-0 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 shadow-md">
            Step {tutorial.order}
          </Badge>
          <div className="w-7 h-7 rounded-lg bg-black/50 backdrop-blur-md border border-white/20 flex items-center justify-center">
            <FontAwesomeIcon
              icon={tutorial.icon || faDesktop}
              className="h-3 w-3 text-white"
            />
          </div>
        </div>

        <div className="absolute top-3 right-3">
          <Badge
            variant="secondary"
            className="bg-black/60 text-white border border-white/20 backdrop-blur-md text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5"
          >
            {tutorial.category === "zse" ? "ZSE Direct" : "VFEX Direct"}
          </Badge>
        </div>

        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-xs">
          <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-full text-[11px] font-medium">
            <FontAwesomeIcon icon={faClock} className="h-3 w-3 text-[#00aeef]" />
            <span>{tutorial.duration}</span>
          </div>

          <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-full text-[11px] font-semibold">
            {isSimulation ? (
              <span className="text-cyan-300">Interactive</span>
            ) : (
              <span className="text-sky-300">Video Guide</span>
            )}
          </div>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-foreground text-base mb-2 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
            {tutorial.title}
          </h3>
          <p className="text-muted-foreground text-xs line-clamp-3 leading-relaxed">
            {tutorial.description}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-semibold text-primary">
            {isSimulation ? "Interactive Simulation" : "Video Walkthrough"}
          </span>
          <span className="font-medium bg-muted px-2 py-0.5 rounded text-[11px]">
            {tutorial.category === "zse" ? "ZSE" : "VFEX"}
          </span>
        </div>
      </div>
    </div>
  );
};

// -------------------------
// Tutorial Viewer
// -------------------------
const TutorialViewer = ({ iframecode }: { iframecode?: string }) => {
  const iframecodeContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!iframecode || !iframecodeContainerRef.current) return;

    const scripts = iframecodeContainerRef.current.querySelectorAll("script");
    scripts.forEach((oldScript) => {
      const newScript = document.createElement("script");
      Array.from(oldScript.attributes).forEach((attr) => {
        newScript.setAttribute(attr.name, attr.value);
      });
      if (oldScript.innerHTML) {
        newScript.innerHTML = oldScript.innerHTML;
      }
      oldScript.parentNode?.replaceChild(newScript, oldScript);
    });
  }, [iframecode]);

  const isInteractive = iframecode?.includes("guideflow") || iframecode?.includes("supademo");

  if (iframecode) {
    return (
      <div className="rounded-xl border border-border bg-card shadow-lg overflow-hidden w-full">
        {isInteractive ? (
          <div
            ref={iframecodeContainerRef}
            dangerouslySetInnerHTML={{ __html: iframecode }}
            className="w-full min-h-[580px] md:min-h-[640px] flex justify-center bg-black/5 [&>iframe]:w-full [&>iframe]:min-h-[600px] [&>iframe]:border-0"
          />
        ) : (
          <div className="relative aspect-video w-full bg-black">
            <div
              ref={iframecodeContainerRef}
              dangerouslySetInnerHTML={{ __html: iframecode.replace(/height="\d+"/, 'height="100%"').replace(/width="\d+"/, 'width="100%"') }}
              className="absolute inset-0 [&>iframe]:w-full [&>iframe]:h-full [&>iframe]:border-0 [&>video]:w-full [&>video]:h-full [&>video]:object-contain bg-black"
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card shadow-lg overflow-hidden w-full aspect-video bg-black flex items-center justify-center text-white">
      <p>No preview available for this tutorial.</p>
    </div>
  );
};

// -------------------------
// Main Dashboard
// -------------------------
export default function TutorialsDashboard() {
  const [selectedTutorial, setSelectedTutorial] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<"all" | "zse" | "vfex">("all");
  const [tutorials, setTutorials] = useState<Tutorial[]>(defaultTutorials);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTutorials = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("zse_training_token");
        const headers: Record<string, string> = {
          Accept: "application/json",
        };
        if (token && token !== "null" && token !== "undefined") {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}/tutorials`, { headers });
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            const mappedData: Tutorial[] = data.map((t: { id?: number | string; name?: string; description?: string; exchange?: string; duration?: string; iframecode?: string }, index: number) => {
              const numId = Number(t.id) || (index + 1);
              const strId = String(numId);
              const fallback = defaultTutorials.find((d) => d.id === strId) || defaultTutorials[index % defaultTutorials.length];

              return {
                id: strId,
                title: t.name || fallback.title,
                description: t.description || fallback.description,
                category: t.exchange?.toLowerCase() === "vfex" ? "vfex" : "zse",
                duration: t.duration || fallback.duration,
                completed: index < 2,
                order: numId,
                icon: iconsMap[strId] || fallback.icon || faDesktop,
                gradient: gradientsList[(numId - 1) % gradientsList.length] || gradientsList[0],
                iframecode: t.iframecode || fallback.iframecode,
              };
            });
            const sorted = mappedData.sort((a, b) => a.order - b.order);
            setTutorials(sorted);
          }
        }
      } catch (err) {
        console.warn("Could not fetch remote tutorials, using authentic defaults:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTutorials();
  }, []);

  const filteredTutorials = tutorials
    .filter((t) => (activeCategory === "all" ? true : t.category === activeCategory))
    .sort((a, b) => a.order - b.order);

  const zseCount = tutorials.filter((t) => t.category === "zse").length;
  const vfexCount = tutorials.filter((t) => t.category === "vfex").length;

  // -------------------------
  // Tutorial Details View
  // -------------------------
  if (selectedTutorial) {
    const sortedTutorials = [...tutorials].sort((a, b) => a.order - b.order);
    const currentIndex = sortedTutorials.findIndex((t) => t.id === selectedTutorial);
    const tutorial = sortedTutorials[currentIndex] || sortedTutorials[0];
    const prevTutorial = currentIndex > 0 ? sortedTutorials[currentIndex - 1] : null;
    const nextTutorial = currentIndex < sortedTutorials.length - 1 ? sortedTutorials[currentIndex + 1] : null;

    return (
      <div className="min-h-screen bg-background font-montserrat">
        <Navbar />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <Button
              variant="ghost"
              onClick={() => setSelectedTutorial(null)}
              className="hover:bg-muted"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="mr-2 h-4 w-4" />
              Back to All Tutorials
            </Button>

            <div className="flex items-center gap-2">
              {prevTutorial && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedTutorial(prevTutorial.id)}
                  className="text-xs"
                >
                  <FontAwesomeIcon icon={faArrowLeft} className="mr-1.5 h-3 w-3" />
                  Previous
                </Button>
              )}
              {nextTutorial && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedTutorial(nextTutorial.id)}
                  className="text-xs bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Next
                  <FontAwesomeIcon icon={faArrowRight} className="ml-1.5 h-3 w-3" />
                </Button>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 shadow-sm mb-6">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-[#00aeef] text-white uppercase text-[10px] tracking-wider font-semibold">
                    {tutorial.category === "zse" ? "ZSE Direct" : "VFEX Direct"}
                  </Badge>
                  <span className="text-xs text-muted-foreground font-medium">
                    {tutorial.iframecode?.includes("guideflow") || tutorial.iframecode?.includes("supademo")
                      ? "Interactive Simulation"
                      : "Official Walkthrough"}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                  {tutorial.title}
                </h1>
                <p className="text-muted-foreground max-w-3xl text-sm leading-relaxed">
                  {tutorial.description}
                </p>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <div className="flex items-center gap-2 bg-muted px-3.5 py-2 rounded-lg text-xs font-semibold">
                  <FontAwesomeIcon icon={faClock} className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{tutorial.duration}</span>
                </div>
                <div className="flex items-center gap-2 bg-muted px-3.5 py-2 rounded-lg text-xs font-semibold">
                  <span>Step {tutorial.order} of {tutorials.length}</span>
                </div>
              </div>
            </div>
          </div>

          <TutorialViewer iframecode={tutorial.iframecode} />
        </div>

        <Footer />
      </div>
    );
  }

  // -------------------------
  // Tutorial Catalog List
  // -------------------------
  return (
    <div className="min-h-screen bg-background font-montserrat">
      <Navbar />

      {/* Hero Section */}
      <div
        className="relative bg-cover bg-center border-b border-border overflow-hidden"
        style={{ backgroundImage: `url(${tutorialsBg})` }}
      >
        <div className="absolute inset-0 bg-black/70 z-0" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center">
          <Badge className="bg-[#00aeef] text-white border-0 mb-4 px-4 py-1 uppercase tracking-widest text-xs drop-shadow-md font-semibold">
            Official Video Masterclasses (2026)
          </Badge>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4 leading-tight drop-shadow-md">
            Master Trading on ZSE Direct
          </h1>
          <p className="text-gray-200 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed drop-shadow-md">
            Authentic, high-definition video walkthroughs guiding you through retail onboarding, order book mechanics, and capital market rules on ZSE Direct.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Category Tabs (only shown when multiple categories exist) */}
        {vfexCount > 0 && (
          <div className="flex gap-2 mb-8 border-b border-border pb-4 flex-wrap">
            <Button
              variant={activeCategory === "all" ? "default" : "outline"}
              onClick={() => setActiveCategory("all")}
              size="sm"
              className={activeCategory === "all" ? "bg-[#00aeef] text-white hover:bg-[#00aeef]/90" : ""}
            >
              All Tutorials ({tutorials.length})
            </Button>

            <Button
              variant={activeCategory === "zse" ? "default" : "outline"}
              onClick={() => setActiveCategory("zse")}
              size="sm"
              className={activeCategory === "zse" ? "bg-[#00aeef] text-white hover:bg-[#00aeef]/90" : ""}
            >
              <FontAwesomeIcon icon={faDesktop} className="mr-2 h-3.5 w-3.5" />
              ZSE Direct ({zseCount})
            </Button>

            <Button
              variant={activeCategory === "vfex" ? "default" : "outline"}
              onClick={() => setActiveCategory("vfex")}
              size="sm"
              className={activeCategory === "vfex" ? "bg-[#00aeef] text-white hover:bg-[#00aeef]/90" : ""}
            >
              <FontAwesomeIcon icon={faMobileScreen} className="mr-2 h-3.5 w-3.5" />
              VFEX Direct ({vfexCount})
            </Button>
          </div>
        )}

        {/* Tutorial Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTutorials.map((tutorial) => (
            <TutorialCard
              key={tutorial.id}
              tutorial={tutorial}
              onSelect={() => setSelectedTutorial(tutorial.id)}
            />
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}
