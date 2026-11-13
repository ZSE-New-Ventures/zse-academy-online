import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faGraduationCap,
  faArrowRight,
  faCompass,
} from "@fortawesome/free-solid-svg-icons";
import "./HeroSection.css";

import train1 from "@/assets/train1.jpg";
import train2 from "@/assets/train2.jpg";
import train3 from "@/assets/train3.jpg";

const backgroundImages = [train1, train2, train3];

interface Slide {
  topic: string;
  tagline: string;
  subtitle: string;
  badge: string;
}

const beginnerSlides: Slide[] = [
  {
    topic: "The ZSE & VFEX Markets",
    tagline: "Your Official Gateway to Capital Markets",
    subtitle:
      "New to investing? Learn how Zimbabwe's local equities and USD markets work with clear, step-by-step guidance from the exchange.",
    badge: "Beginner Friendly • Official Exchange Institute",
  },
  {
    topic: "Buying Your First Shares",
    tagline: "Practical Trading Made Simple & Accessible",
    subtitle:
      "From opening your CSD account on ZSE Direct to selecting registered stockbrokers, we guide you safely through every step.",
    badge: "Step-by-Step • 100% Free Access",
  },
  {
    topic: "Stock Market Basics",
    tagline: "Demystifying Equities, Dividends & Growth",
    subtitle:
      "Understand why share prices move, how listed companies pay dividends, and how long-term investing builds real financial security.",
    badge: "Core Fundamentals • Self-Paced",
  },
  {
    topic: "ETFs, REITs & Unit Trusts",
    tagline: "Smarter Diversification for Every Budget",
    subtitle:
      "Explore collective investments, property funds, and baskets of shares designed to reduce risk for new investors.",
    badge: "Wealth Creation • Accredited Certificates",
  },
];

export const HeroSection = () => {
  const [currentBg, setCurrentBg] = useState(0);
  const [slideIdx, setSlideIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % backgroundImages.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setSlideIdx((prev) => (prev + 1) % beginnerSlides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const currentSlide = beginnerSlides[slideIdx];

  return (
    <div className="relative min-h-[90vh] flex items-center overflow-hidden bg-[#0f1729] hero-section">
      {/* Slideshow Background */}
      {backgroundImages.map((img, idx) => (
        <div
          key={idx}
          className={`hero-bg absolute top-0 bottom-0 right-0 ${idx === currentBg ? "active" : "inactive"}`}
          style={{
            backgroundImage: `url(${img})`,
          }}
        />
      ))}

      {/* Subtle vignette on the image - Hidden on mobile */}
      <div className="hero-image-vignette hidden md:block" />

      {/* Dark curved left overlay - Hidden on mobile */}
      <div className="hero-curved-overlay hidden md:block absolute inset-0 z-0 pointer-events-none">
        <svg
          viewBox="0 0 1440 900"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <defs>
            <filter id="feather" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="60" />
            </filter>
          </defs>
          <path
            d="M-100,-100 L-100,1000 L580,1000 C650,950 720,820 740,700 C770,540 760,360 740,200 C720,50 650,-50 580,-100 Z"
            fill="#0f1729"
            filter="url(#feather)"
          />
        </svg>
      </div>

      {/* Falling Animated Lines - Hidden on mobile */}
      <div className="hidden md:block absolute inset-0 pointer-events-none z-10 hero-falling-lines">
        <div className="falling-line line-1"></div>
        <div className="falling-line line-2"></div>
        <div className="falling-line line-3"></div>
        <div className="falling-line line-4"></div>
      </div>

      {/* Content */}
      <div className="relative container mx-auto px-4 max-w-7xl flex z-10 hero-content">
        <div className="max-w-xl md:max-w-xl mx-auto md:mx-0 hero-text-wrapper">
          {/* Welcoming Beginner Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#00aeef]/15 border border-[#00aeef]/30 text-[#00aeef] text-xs font-bold uppercase tracking-wider mb-3.5 backdrop-blur-sm">
            <FontAwesomeIcon icon={faCompass} className="text-xs" />
            <span>{currentSlide.badge}</span>
          </div>

          <h1 className="hero-title">
            <span
              className="block mb-1 hero-first-line !text-[#00aeef]"
              style={{ color: "#00aeef", WebkitTextFillColor: "#00aeef", textShadow: "none" }}
            >
              Getting Started On
            </span>
            <span className="rotating-word-container block">
              <span key={slideIdx} className="rotating-word">
                {currentSlide.topic}
              </span>
            </span>
          </h1>

          <p className="mt-1 text-white md:text-[#00aeef] font-semibold text-base sm:text-lg tracking-normal relative z-20">
            {currentSlide.tagline}
          </p>

          <p className="hero-subtitle mt-2 text-slate-300 text-sm sm:text-base leading-relaxed">
            {currentSlide.subtitle}
          </p>

          {/* Reassurance pills for first-time learners */}
          <div className="flex flex-wrap items-center gap-2 mt-4 text-xs text-slate-200">
            <span className="inline-flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-full border border-white/15 backdrop-blur-sm font-medium">
              <FontAwesomeIcon icon={faCheckCircle} className="text-[#00aeef] text-[11px]" />
              100% Free Beginner Learning
            </span>
            <span className="inline-flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-full border border-white/15 backdrop-blur-sm font-medium">
              <FontAwesomeIcon icon={faCheckCircle} className="text-[#00aeef] text-[11px]" />
              No Prior Experience Needed
            </span>
            <span className="inline-flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-full border border-white/15 backdrop-blur-sm font-medium">
              <FontAwesomeIcon icon={faCheckCircle} className="text-[#00aeef] text-[11px]" />
              ZSE Verified Certificate
            </span>
          </div>

          <div className="hero-buttons flex flex-col sm:flex-row gap-3 mt-6">
            <Link
              to="/courses"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-bold text-white bg-[#00aeef] hover:bg-[#008cc0] transition-colors rounded-xl shadow-lg shadow-[#00aeef]/25 text-center"
            >
              <FontAwesomeIcon icon={faGraduationCap} />
              <span>Start with Investment 101</span>
            </Link>
            <Link
              to="/tutorials"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 transition-colors rounded-xl backdrop-blur-sm text-center"
            >
              <span>Explore Beginner Guides</span>
              <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
            </Link>
          </div>
        </div>
      </div>

      {/* Slider Navigation Dots */}
      <div className="hero-dots absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-2 z-50">
        {beginnerSlides.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              setSlideIdx(idx);
              setCurrentBg(idx % backgroundImages.length);
            }}
            aria-label={`Go to slide ${idx + 1}`}
            className={`dot h-2 rounded-full transition-all duration-300 ${
              idx === slideIdx ? "bg-[#00aeef] w-6" : "bg-white/50 w-2 hover:bg-white/80"
            }`}
          />
        ))}
      </div>
    </div>
  );
};
