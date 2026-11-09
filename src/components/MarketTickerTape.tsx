import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowTrendUp,
  faArrowTrendDown,
  faBuildingColumns,
} from "@fortawesome/free-solid-svg-icons";

interface MarketIndex {
  symbol: string;
  name: string;
  value: string;
  change: string;
  changePercent: string;
  isPositive: boolean;
  currency: string;
}

const INITIAL_INDICES: MarketIndex[] = [
  {
    symbol: "ZSE-ASI",
    name: "ZSE All Share",
    value: "218.42",
    change: "+3.15",
    changePercent: "+1.46%",
    isPositive: true,
    currency: "ZiG",
  },
  {
    symbol: "ZSE-TOP10",
    name: "Top 10 Index",
    value: "204.80",
    change: "+2.10",
    changePercent: "+1.04%",
    isPositive: true,
    currency: "ZiG",
  },
  {
    symbol: "VFEX-ASI",
    name: "VFEX All Share",
    value: "104.75",
    change: "+0.85",
    changePercent: "+0.82%",
    isPositive: true,
    currency: "USD",
  },
  {
    symbol: "ZSE-MINING",
    name: "Mining Index",
    value: "162.30",
    change: "-0.40",
    changePercent: "-0.25%",
    isPositive: false,
    currency: "ZiG",
  },
  {
    symbol: "ZSE-MEDCAP",
    name: "Medium Cap",
    value: "192.15",
    change: "+1.20",
    changePercent: "+0.63%",
    isPositive: true,
    currency: "ZiG",
  },
  {
    symbol: "ZSED-VOL",
    name: "ZSE Direct Volume",
    value: "1.42M",
    change: "+18.4%",
    changePercent: "+18.4%",
    isPositive: true,
    currency: "Shares",
  },
  {
    symbol: "VFEX-USD",
    name: "VFEX Direct Trades",
    value: "$384.2K",
    change: "+4.12%",
    changePercent: "+4.12%",
    isPositive: true,
    currency: "USD",
  },
];

export const MarketTickerTape: React.FC = () => {
  const [indices] = useState<MarketIndex[]>(INITIAL_INDICES);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setLastUpdated(
        now.toLocaleTimeString("en-ZW", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Double the list for seamless infinite loop
  const duplicatedIndices = [...indices, ...indices];

  return (
    <div className="bg-[#070d19] border-y border-slate-800/80 text-slate-200 select-none overflow-hidden relative font-sans shadow-inner">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 flex items-center justify-between h-12 gap-3 sm:gap-6">
        
        {/* Left Badge: Exchange Status & Time */}
        <div className="flex items-center gap-2.5 shrink-0 z-20 bg-[#070d19] pr-3 border-r border-slate-800">
          <div className="flex items-center gap-2 bg-[#00aeef]/10 border border-[#00aeef]/30 px-2.5 py-1 rounded-full text-xs font-semibold text-[#00aeef]">
            <span className="inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            <span className="tracking-wider uppercase text-[10px] font-bold whitespace-nowrap">Market Live</span>
          </div>

          <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-400 whitespace-nowrap">
            <FontAwesomeIcon icon={faBuildingColumns} className="text-[#00aeef] text-xs" />
            <span className="font-semibold text-slate-300">Harare & Victoria Falls</span>
            <span className="text-slate-600">•</span>
            <span className="text-[11px] text-slate-400 font-mono">CAT {lastUpdated}</span>
          </div>
        </div>

        {/* Center: Infinite Seamless Ticker Marquee */}
        <div className="relative flex-1 overflow-hidden h-full flex items-center">
          {/* Left subtle fade mask */}
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#070d19] to-transparent z-10 pointer-events-none" />

          {/* Marquee Track */}
          <div className="animate-ticker-marquee flex items-center gap-3">
            {duplicatedIndices.map((idx, index) => (
              <div
                key={`${idx.symbol}-${index}`}
                className="flex items-center gap-2.5 px-3 py-1 bg-slate-900/90 rounded-lg border border-slate-800 hover:border-[#00aeef]/40 transition-colors shrink-0"
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white tracking-tight">{idx.symbol}</span>
                  <span className="text-[10px] text-slate-400 font-mono">({idx.currency})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-mono font-bold text-slate-100">{idx.value}</span>
                  <span
                    className={`flex items-center gap-0.5 text-[11px] font-mono font-semibold ${
                      idx.isPositive ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    <FontAwesomeIcon
                      icon={idx.isPositive ? faArrowTrendUp : faArrowTrendDown}
                      className="text-[9px]"
                    />
                    {idx.changePercent}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Right subtle fade mask */}
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#070d19] to-transparent z-10 pointer-events-none" />
        </div>

        {/* Right Action: Live Order Book Button */}
        <div className="shrink-0 z-20 bg-[#070d19] pl-3 border-l border-slate-800 hidden sm:flex items-center">
          <a
            href="https://zsedirect.co.zw/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-bold uppercase tracking-wider text-[#00aeef] hover:text-white transition-colors bg-[#00aeef]/10 hover:bg-[#00aeef] px-3 py-1.5 rounded-lg border border-[#00aeef]/40 whitespace-nowrap"
          >
            Live Order Book &rarr;
          </a>
        </div>
      </div>
    </div>
  );
};
