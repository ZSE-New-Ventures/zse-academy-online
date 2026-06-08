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
    <div className="relative min-h-[90vh] flex items-center overflow-hidden bg-[#0a0a0a] hero-section">
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
      <div className="hero-curved-overlay hidden md:block">
        <svg
          viewBox="0 0 1440 900"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <filter id="feather" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="60" />
            </filter>
          </defs>
          <path
            d="M-100,-100 L-100,1000 L580,1000 C650,950 720,820 740,700 C770,540 760,360 740,200 C720,50 650,-50 580,-100 Z"
            fill="rgba(0,0,0,0.95)"
            filter="url(#feather)"
          />
        </svg>
      </div>

      {/* Content */}
      <div className="relative container mx-auto px-4 max-w-7xl flex z-10 hero-content">
        <div className="max-w-xl md:max-w-lg mx-auto md:mx-0 hero-text-wrapper">
          <h1 className="hero-title">
            <span className="block mb-1 hero-first-line">Build Skills On</span>
            <span className="rotating-word-container block">
              <span key={wordIdx} className="rotating-word">
                {words[wordIdx]}
              </span>
            </span>
            <span className="hero-last-line">
              Learn the Zimbabwe Stock Exchange
            </span>
          </h1>
          <p className="hero-subtitle">
            Professional training courses, expert insights, and tools designed to elevate your trading journey.
          </p>
          <div className="hero-buttons flex flex-col sm:flex-row gap-4 mt-6">
            <Link
              to="/courses"
              className="inline-block px-8 py-4 text-sm font-bold text-white bg-[#00aeef] rounded hover:bg-[#008cc0] transition-colors text-center"
            >
              Explore Courses
            </Link>
            <Link
              to="/login"
              className="inline-block px-8 py-4 text-sm font-bold text-white bg-transparent border border-white rounded hover:bg-white hover:text-[#0a0a0a] transition-colors text-center"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};