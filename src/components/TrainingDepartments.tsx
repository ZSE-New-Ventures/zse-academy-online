import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";
import bentoImage from "@/assets/bento.jpg";
import image2 from "@/assets/hero-image.jpg";
import image3 from "@/assets/business-analyst-looking-into-statistics-reports-detect-any-obstacles.jpg";

const centerCardContent = [
  {
    image: bentoImage,
    title: "ZEEX",
    description: "A secure deal room for investment opportunities. Discover, evaluate, and participate in exclusive private market deals.",
    buttonText: "Explore ZEEX",
    link: "https://zeex.co.zw",
    isExternal: true,
  },
  {
    image: image2,
    title: "ZEEX",
    description: "A secure deal room for investment opportunities. Discover, evaluate, and participate in exclusive private market deals.",
    buttonText: "Explore ZEEX",
    link: "https://zeex.co.zw",
    isExternal: true,
  },
  {
    image: image3,
    title: "ZEEX",
    description: "A secure deal room for investment opportunities. Discover, evaluate, and participate in exclusive private market deals.",
    buttonText: "Explore ZEEX",
    link: "https://zeex.co.zw",
    isExternal: true,
  }
];

export const TrainingDepartments = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % centerCardContent.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-20 bg-[#f8fafc] font-sans border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="mb-12 text-center sm:text-left">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900">
            Our Direct Ecosystem & Platforms
          </h2>
          <p className="text-gray-650 mt-2 max-w-2xl text-sm leading-relaxed">
            Connecting retail and institutional investors to Zimbabwe's leading trading hubs.
          </p>
        </div>

        {/* Bento Grid Container */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">

          {/* COLUMN 1: LEFT STACK */}
          <div className="flex flex-col gap-6">

            {/* Box 1: ZSE Direct (Dark Background) */}
            <div className="bg-[#1c1d1f] text-white p-8 flex flex-col justify-between min-h-[250px] shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="space-y-6">
                {/* Stopwatch Icon - Accented with ZSE Blue */}
                <div className="w-12 h-12">
                  <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" strokeWidth="2">
                    <circle cx="12" cy="13" r="8" stroke="#00aeef" fill="none" />
                    <path d="M5 6L2 7M6 4L4 2" stroke="white" strokeLinecap="round" />
                    <path d="M12 5V3M15 4l1-1.5" stroke="white" strokeLinecap="round" />
                    <path d="M12 13L15 10" stroke="#00aeef" strokeLinecap="round" />
                  </svg>
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-black tracking-tight">Faster Execution</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Trade equities, debt, and ETFs online on ZSE Direct. Lightning-quick order processing and live portfolio tracking.
                  </p>
                </div>
              </div>

              <div className="pt-6">
                <a
                  href="https://www.zsedirect.co.zw"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-[#00aeef] hover:underline"
                >
                  <span>Go to ZSE Direct</span>
                  <FontAwesomeIcon icon={faExternalLinkAlt} className="ml-2 h-3 w-3" />
                </a>
              </div>
            </div>

            {/* Box 2: Data Direct (Light Background) */}
            <div className="bg-white text-gray-900 p-8 border border-gray-200 flex flex-col justify-between min-h-[250px] flex-1 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="space-y-6">
                {/* Chart Line / Index Icon - Accented with ZSE Blue */}
                <div className="w-12 h-12">
                  <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" strokeWidth="2">
                    <path d="M4 20L18 6M18 6H12M18 6V12" stroke="#00aeef" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    <rect x="3" y="14" width="2" height="6" fill="#1c1d1f" />
                    <rect x="8" y="10" width="2" height="10" fill="#1c1d1f" />
                    <rect x="13" y="12" width="2" height="8" fill="#1c1d1f" />
                  </svg>
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-black tracking-tight text-gray-900">Advanced Charting</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Access institutional-grade real-time market tickers, historical statistics, order books, and price API feeds.
                  </p>
                </div>
              </div>

              <div className="pt-6">
                <a
                  href="https://datadirect.zse.co.zw"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-gray-900 hover:text-[#00aeef] transition-colors"
                >
                  <span>Explore Data Direct</span>
                  <FontAwesomeIcon icon={faExternalLinkAlt} className="ml-2 h-3 w-3" />
                </a>
              </div>
            </div>

          </div>

          {/* COLUMN 2: CENTER TALL CARD */}
          <div className="relative overflow-hidden group min-h-[500px] lg:min-h-full flex flex-col justify-end shadow-sm hover:shadow-md transition-shadow duration-300">
            {/* Background portrait images with slideshow */}
            {centerCardContent.map((content, index) => (
              <img
                key={index}
                src={content.image}
                alt={content.title}
                className={`absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-all duration-1000 ${
                  index === currentImageIndex ? "opacity-100 z-0" : "opacity-0 -z-10"
                }`}
              />
            ))}
            {/* Dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/20" />

            {/* Slideshow Indicators */}
            <div className="absolute top-4 right-4 z-20 flex gap-2">
              {centerCardContent.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentImageIndex ? "bg-[#00aeef] w-6" : "bg-white/50 w-2 hover:bg-white/75"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            {/* Content overlay - Static ZEEX Content */}
            <div className="relative z-10 p-8 space-y-6">
              <div className="space-y-2">
                <h3 className="text-3xl font-black text-white tracking-tight leading-tight pt-2">
                  ZEEX
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  A secure deal room for investment opportunities. Discover, evaluate, and participate in exclusive private market deals.
                </p>
              </div>

              <div className="pt-2">
                <a
                  href="https://zeex.co.zw"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center bg-[#00aeef] hover:bg-[#008cc0] text-white font-bold text-sm h-12 px-6 transition-colors w-full sm:w-auto"
                >
                  <span>Explore ZEEX</span>
                  <FontAwesomeIcon icon={faExternalLinkAlt} className="ml-2 h-3 w-3" />
                </a>
              </div>
            </div>
          </div>

          {/* COLUMN 3: RIGHT STACK */}
          <div className="flex flex-col gap-6">

            {/* Box 4: VFEX Direct (Light Background) */}
            <div className="bg-white text-gray-900 p-8 border border-gray-200 flex flex-col justify-between min-h-[250px] shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="space-y-6">
                {/* Candlesticks Icon - Accented with ZSE Blue */}
                <div className="w-12 h-12">
                  <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" strokeWidth="2">
                    <path d="M6 3v18M12 5v14M18 7v10" stroke="#a1a1aa" strokeWidth="1.5" strokeLinecap="round" />
                    <rect x="4" y="8" width="4" height="7" fill="#1c1d1f" stroke="none" />
                    <rect x="10" y="6" width="4" height="9" fill="#00aeef" stroke="none" />
                    <rect x="16" y="10" width="4" height="4" fill="#1c1d1f" stroke="none" />
                  </svg>
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-black tracking-tight text-gray-900">Multi-Asset Trading</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Access USD trading on the Victoria Falls Stock Exchange securely. Invest in global and offshore listings seamlessly.
                  </p>
                </div>
              </div>

              <div className="pt-6">
                <a
                  href="https://www.vfexdirect.co.zw"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-gray-900 hover:text-[#00aeef] transition-colors"
                >
                  <span>Go to VFEX Direct</span>
                  <FontAwesomeIcon icon={faExternalLinkAlt} className="ml-2 h-3 w-3" />
                </a>
              </div>
            </div>

            {/* Box 5: InvoiceX (Vibrant ZSE Blue Background - rgb(0, 174, 239)) */}
            <div className="bg-[#00aeef] text-white p-8 flex flex-col justify-between min-h-[250px] flex-1 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="space-y-6">
                {/* Document/Invoice Icon - Styled in White for high contrast */}
                <div className="w-12 h-12">
                  <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" strokeWidth="2">
                    <rect x="5" y="3" width="14" height="18" rx="2" stroke="white" fill="none" />
                    <path d="M9 7h6M9 11h6M9 15h4" stroke="white" strokeLinecap="round" />
                  </svg>
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-black tracking-tight text-white">InvoiceX</h3>
                  <p className="text-xs text-blue-50 leading-relaxed">
                    A premier invoice financing platform. Unlock working capital or invest in high-yield corporate invoices seamlessly.
                  </p>
                </div>
              </div>

              <div className="pt-6">
                <a
                  href="https://invoicex.zeex.co.zw/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-white hover:underline"
                >
                  <span>Go to InvoiceX</span>
                  <FontAwesomeIcon icon={faExternalLinkAlt} className="ml-2 h-3 w-3 text-blue-100" />
                </a>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
