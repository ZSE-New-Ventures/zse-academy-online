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
  faDownload,
  faUpload,
  faCoins,
} from "@fortawesome/free-solid-svg-icons";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import tutorialsBg from "../assets/tutorials.jpg";
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
}

const bgGradients = [
  "from-blue-500 to-cyan-500",
  "from-green-500 to-emerald-500",
  "from-purple-500 to-pink-500",
  "from-orange-500 to-red-500",
  "from-indigo-500 to-purple-500",
  "from-teal-500 to-green-500",
];

const iconsList = [
  faUserPlus, faWallet, faMoneyBillTransfer, faChartLine, faMobileAlt, faDownload, faUpload, faCoins
];

// -------------------------
// Tutorial Card Component (Udemy-inspired)
// -------------------------
const TutorialCard = ({
  tutorial,
  onSelect,
}: {
  tutorial: Tutorial;
  onSelect: () => void;
}) => {
  return (
    <div className="group cursor-pointer" onClick={onSelect}>
      <div className="bg-card rounded-lg overflow-hidden border border-border hover:shadow-lg transition-all duration-300">
        {/* Custom Designed Thumbnail */}
        <div className="relative aspect-video w-full overflow-hidden">
          <div className={`absolute inset-0 bg-gradient-to-br ${tutorial.gradient}`}>
            {/* Grid Pattern */}
            <div 
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                                linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                backgroundSize: "20px 20px",
              }}
            />
            
            {/* Main Icon */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
                <FontAwesomeIcon
                  icon={tutorial.icon}
                  className="h-8 w-8 text-white"
                />
              </div>
              <span className="text-white font-semibold text-sm px-3 py-1 bg-black/20 rounded-full backdrop-blur-sm">
                {tutorial.title}
              </span>
            </div>

            {/* Decorative Elements */}
            <div className="absolute top-3 left-3 w-8 h-8 border-2 border-white/20 rounded-full" />
            <div className="absolute bottom-3 right-3 w-6 h-6 border-2 border-white/20 rounded" />
            <div className="absolute top-1/2 right-4 w-1 h-8 bg-white/10 rounded-full" />
          </div>

          {/* Play Button Overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="h-14 w-14 rounded-full bg-white flex items-center justify-center shadow-lg">
              <FontAwesomeIcon
                icon={faPlay}
                className="h-5 w-5 text-foreground ml-1"
              />
            </div>
          </div>

          {/* Duration Badge */}
          <div className="absolute bottom-2 right-2">
            <span className="bg-black/80 text-white px-2 py-1 rounded text-xs font-medium">
              {tutorial.duration}
            </span>
          </div>

          {/* Completed Badge */}
          {tutorial.completed && (
            <div className="absolute top-2 left-2">
              <span className="bg-green-600 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                <FontAwesomeIcon icon={faCheckCircle} className="h-3 w-3" />
                Completed
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-bold text-foreground text-base mb-1 group-hover:text-primary transition-colors line-clamp-2">
            {tutorial.title}
          </h3>
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {tutorial.description}
          </p>

          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">
              Step {tutorial.order} of 4
            </span>
            <span className="text-xs bg-muted px-2 py-1 rounded font-medium text-muted-foreground">
              {tutorial.category === "zse" ? "ZSE" : "VFEX"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// -------------------------
// Tutorial Viewer
// -------------------------
const TutorialViewer = ({ url, iframecode }: { url?: string; iframecode?: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframecodeContainerRef = useRef<HTMLDivElement>(null);

  // Manually execute scripts found in the injected HTML
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
  
  useEffect(() => {
    if (!url || !containerRef.current) return;
    const idMatch = url.match(/(?:embed|player)\/([a-zA-Z0-9]+)/);
    const id = idMatch ? idMatch[1] : null;
    
    if (id && !document.querySelector(`script[data-iframe-id="${id}"]`)) {
      const script = document.createElement("script");
      script.src = "https://app.guideflow.com/assets/opt.js";
      script.setAttribute("data-iframe-id", id);
      script.async = true;
      containerRef.current.appendChild(script);
    }
  }, [url]);

  if (iframecode) {
    return (
      <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden w-full">
        <div 
          ref={iframecodeContainerRef}
          dangerouslySetInnerHTML={{ __html: iframecode }}
          className="w-full flex justify-center bg-black/5"
        />
      </div>
    );
  }

  const idMatch = url?.match(/(?:embed|player)\/([a-zA-Z0-9]+)/);
  const id = idMatch ? idMatch[1] : "zkj6z3diwp";

  return (
    <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden w-full">
      <div 
        ref={containerRef}
        style={{ position: "relative", paddingBottom: "calc(47.4609375% + 47px)", height: 0 }}
      >
        <iframe
          id={id}
          src={`https://app.guideflow.com/embed/${id}`}
          width="100%"
          height="100%"
          style={{ overflow: "hidden", position: "absolute", border: "none" }}
          scrolling="no"
          allow="clipboard-read; clipboard-write"
          allowFullScreen
        ></iframe>
      </div>
    </div>
  );
};

// -------------------------
// Main Dashboard
// -------------------------
export default function TutorialsDashboard() {
  const [selectedTutorial, setSelectedTutorial] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<"all" | "zse" | "vfex">("all");
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTutorials = async () => {
      try {
        const token = localStorage.getItem("zse_training_token");
        const response = await fetch(`${API_BASE_URL}/tutorials`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        
        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            throw new Error("You do not have permission to view tutorials. Please ensure you are logged in as an admin.");
          }
          throw new Error("Failed to fetch tutorials");
        }

        const data = await response.json();
        console.log("Tutorials API Response:", data);

        // Safely map the data, falling back to safe defaults if fields are missing
        const mappedData: Tutorial[] = data.map((t: any, index: number) => ({
          id: t.id?.toString() || String(index),
          title: t.name || "Untitled Tutorial",
          description: `Interactive tutorial on ${t.name || "this topic"}`,
          category: t.exchange?.toLowerCase() === "vfex" ? "vfex" : "zse",
          duration: "3 min",
          completed: false,
          order: index + 1,
          icon: iconsList[index % iconsList.length],
          gradient: bgGradients[index % bgGradients.length],
          iframecode: t.iframecode
        }));
        
        setTutorials(mappedData);
      } catch (err: any) {
        console.error("Tutorials fetch error:", err);
        setError(err.message || "An unknown error occurred while fetching tutorials.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchTutorials();
  }, []);

  const filteredTutorials = tutorials
    .filter((t) =>
      activeCategory === "all" ? true : t.category === activeCategory
    )
    .sort((a, b) => a.order - b.order);

  // -------------------------
  // Tutorial Details Page
  // -------------------------
  if (selectedTutorial) {
    const tutorial = tutorials.find((t) => t.id === selectedTutorial);

    if (!tutorial) return null;

    return (
      <div className="min-h-screen bg-background">
        <Navbar />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button
            variant="ghost"
            onClick={() => setSelectedTutorial(null)}
            className="mb-6 hover:bg-muted"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2 h-4 w-4" />
            Back to Tutorials
          </Button>

          <div className="rounded-lg border border-border bg-card p-6 shadow-sm mb-6">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  {tutorial.title}
                </h1>
                <p className="text-muted-foreground">{tutorial.description}</p>
              </div>

              <div className="flex gap-3 text-sm">
                <div className="flex items-center gap-2 bg-muted px-3 py-2 rounded-lg">
                  <FontAwesomeIcon
                    icon={faClock}
                    className="h-4 w-4 text-muted-foreground"
                  />
                  <span className="font-medium">{tutorial.duration}</span>
                </div>
                <div className="flex items-center gap-2 bg-muted px-3 py-2 rounded-lg">
                  <span className="font-medium">
                    Step {tutorial.order} of 4
                  </span>
                </div>
                {tutorial.completed && (
                  <div className="flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-2 rounded-lg">
                    <FontAwesomeIcon icon={faCheckCircle} className="h-4 w-4" />
                    <span className="font-medium">Completed</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <TutorialViewer url={tutorial.embedUrl} iframecode={tutorial.iframecode} />
        </div>

        <Footer />
      </div>
    );
  }

  // -------------------------
  // Tutorial List Page
  // -------------------------
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section - Trading Themed */}
      <div 
        className="relative bg-cover bg-center border-b border-border overflow-hidden"
        style={{ backgroundImage: `url(${tutorialsBg})` }}
      >
        <div className="absolute inset-0 bg-black/60 z-0" />
        {/* Animated Grid Background */}
        <div className="absolute inset-0 opacity-20">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(rgba(59, 130, 246, 0.3) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(59, 130, 246, 0.3) 1px, transparent 1px)`,
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        {/* Floating Chart Elements */}
        <div className="absolute top-8 right-8 opacity-20 hidden lg:block">
          <svg
            width="200"
            height="100"
            viewBox="0 0 200 100"
            className="text-green-400"
          >
            <polyline
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              points="0,80 30,70 60,75 90,40 120,50 150,20 180,30 200,10"
            />
            <circle cx="90" cy="40" r="4" fill="currentColor" />
            <circle cx="150" cy="20" r="4" fill="currentColor" />
          </svg>
        </div>

        <div className="absolute bottom-8 left-8 opacity-20 hidden lg:block">
          <svg
            width="150"
            height="80"
            viewBox="0 0 150 80"
            className="text-blue-400"
          >
            <polyline
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              points="0,60 25,50 50,55 75,30 100,40 125,15 150,25"
            />
          </svg>
        </div>

        {/* Candlestick Pattern */}
        <div className="absolute top-1/2 right-20 -translate-y-1/2 opacity-10 hidden xl:flex gap-2">
          {[60, 40, 70, 30, 55, 45, 65].map((height, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div
                className={`w-1 ${i % 2 === 0 ? "bg-green-400" : "bg-red-400"}`}
                style={{ height: `${height}px` }}
              />
              <div
                className={`w-3 ${
                  i % 2 === 0 ? "bg-green-400" : "bg-red-400"
                } rounded-sm`}
                style={{ height: `${height * 0.6}px` }}
              />
              <div
                className={`w-1 ${i % 2 === 0 ? "bg-green-400" : "bg-red-400"}`}
                style={{ height: `${height * 0.4}px` }}
              />
            </div>
          ))}
        </div>

        {/* Glowing Orbs */}
        <div className="absolute top-20 left-1/4 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-1/3 w-40 h-40 bg-green-500/10 rounded-full blur-3xl" />

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 text-center">
          <Badge className="bg-[#00aeef] hover:bg-[#00aeef] text-white border-0 mb-6 px-4 py-1 uppercase tracking-widest text-xs drop-shadow-md">
            Interactive Demos
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight drop-shadow-md text-white">
            Interactive Trading Tutorials
          </h1>
          <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto leading-relaxed drop-shadow-md">
            Step-by-step guided demos to help you navigate deposits,
            withdrawals, and trading like a pro. Learn at your own pace.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Categories */}
        <div className="flex gap-2 mb-8 border-b border-border pb-4">
          <Button
            variant={activeCategory === "all" ? "default" : "outline"}
            onClick={() => setActiveCategory("all")}
            size="sm"
          >
            All Tutorials
          </Button>

          <Button
            variant={activeCategory === "zse" ? "default" : "outline"}
            onClick={() => setActiveCategory("zse")}
            size="sm"
          >
            <FontAwesomeIcon icon={faDesktop} className="mr-2 h-4 w-4" />
            ZSE
          </Button>

          <Button
            variant={activeCategory === "vfex" ? "default" : "outline"}
            onClick={() => setActiveCategory("vfex")}
            size="sm"
          >
            <FontAwesomeIcon icon={faMobileScreen} className="mr-2 h-4 w-4" />
            VFEX
          </Button>
        </div>

        {/* Results count */}
        {loading ? (
          <p className="text-sm text-muted-foreground mb-6">Loading tutorials...</p>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6 border border-red-200">
            {error}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground mb-6">
            {filteredTutorials.length} tutorial
            {filteredTutorials.length !== 1 ? "s" : ""} available
          </p>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
