import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./HeroSection.css";

import train1 from "@/assets/train1.jpg";
import train2 from "@/assets/train2.jpg";
import train3 from "@/assets/train3.jpg";

const backgroundImages = [train1, train2, train3];
const words = ["SECURITIES", "ETFs", "REITs", "BONDS"];

export const HeroSection = () => {
  const [currentBg, setCurrentBg] = useState(0);
  const [wordIdx, setWordIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % backgroundImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIdx((prev) => (prev + 1) % words.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

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
        <div className="max-w-xl md:max-w-lg mx-auto md:mx-0 hero-text-wrapper">
          <h1 className="hero-title">
            <span className="block mb-1 hero-first-line !text-[#00aeef]" style={{ color: '#00aeef', WebkitTextFillColor: '#00aeef', textShadow: 'none' }}>Build Skills On</span>
            <span className="rotating-word-container block">
              <span key={wordIdx} className="rotating-word">
                {words[wordIdx]}
              </span>
            </span>
          </h1>
          <p className="mt-1 text-white md:text-[#00aeef] font-normal text-lg uppercase tracking-normal relative z-20">
            Learn the Zimbabwe Stock Exchange
          </p>
          <p className="hero-subtitle">
            Professional training courses, expert insights, and tools designed to elevate your trading journey.
          </p>
          <div className="hero-buttons flex flex-col sm:flex-row gap-4 mt-6">
            <Link
              to="/courses"
              className="inline-block px-8 py-4 text-sm font-bold text-white bg-[#00aeef] rounded-none hover:bg-[#008cc0] transition-colors text-center"
            >
              Explore Courses
            </Link>
            <Link
              to="/login"
              className="inline-block px-8 py-4 text-sm font-bold text-white bg-transparent border border-white rounded-none hover:bg-white hover:text-[#0f1729] transition-colors text-center"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
      {/* Slider Dots */}
      <div className="hero-dots absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-50">
        {backgroundImages.map((_, idx) => (
          <span key={idx} className={`dot w-2 h-2 rounded-full ${idx === currentBg ? 'bg-white' : 'bg-gray-500'}`}></span>
        ))}
      </div>
    </div>
  );
};