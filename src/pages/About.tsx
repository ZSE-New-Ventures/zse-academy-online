import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBuildingColumns,
  faScaleBalanced,
  faGraduationCap,
  faChartLine,
  faShieldHalved,
  faGlobe,
  faArrowRight,
  faExternalLinkAlt,
  faUsers,
  faAward,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import train2 from "@/assets/train2.jpg";

export default function About() {
  return (
    <div className="min-h-screen bg-white font-montserrat text-slate-900">
      <Navbar />

      {/* Prestige Hero Section */}
      <section className="relative py-28 bg-[#0b1324] text-white overflow-hidden">
        {/* Background Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-luminosity"
          style={{ backgroundImage: `url(${train2})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b1324] via-[#0b1324]/90 to-transparent" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#00aeef]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00aeef]/10 text-[#00aeef] text-xs font-bold uppercase tracking-wider mb-6 border border-[#00aeef]/30 backdrop-blur-md">
              <FontAwesomeIcon icon={faBuildingColumns} />
              <span>Official Investor Education Arm of the ZSE</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-white mb-6">
              Democratizing Wealth Creation in Zimbabwe
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
              ZSE Academy is the national educational portal of the Zimbabwe Stock Exchange. We bridge the gap between financial theory and real-world capital market execution, empowering everyday citizens, diaspora investors, and institutions to invest with clarity and confidence.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/courses"
                className="px-6 py-3 rounded-xl bg-[#00aeef] hover:bg-[#008cc0] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#00aeef]/25 flex items-center gap-2"
              >
                <span>Explore Academy Curriculum</span>
                <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
              </Link>
              <Link
                to="/tutorials"
                className="px-6 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-white font-bold text-xs uppercase tracking-wider border border-slate-700 transition-all flex items-center gap-2"
              >
                <span>Interactive Simulations</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Our Mission & Mandate */}
      <section className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00aeef]/10 text-[#00aeef] text-xs font-bold uppercase tracking-wider border border-[#00aeef]/20">
                <FontAwesomeIcon icon={faScaleBalanced} />
                <span>Our National Mandate</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Building a Financially Literate Zimbabwe
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed">
                As Zimbabwe modernizes its financial infrastructure, the public deserves equal access to capital growth instruments. ZSE Academy was launched to eliminate information barriers and demystify securities trading.
              </p>
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                  <FontAwesomeIcon icon={faShieldHalved} className="text-[#00aeef]" />
                  <span>SECZim Approved Framework</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Our curriculum adheres to the Securities and Exchange Commission of Zimbabwe (SECZim) investor education guidelines, ensuring accurate, transparent, and non-misleading information.
                </p>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#00aeef] flex items-center justify-center text-lg">
                  <FontAwesomeIcon icon={faGraduationCap} />
                </div>
                <h3 className="font-bold text-slate-900 text-base">Self-Paced Excellence</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Study on desktop or mobile at your own rhythm. High-definition lessons, chapter quizzes, and bite-sized modules designed for busy individuals.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg">
                  <FontAwesomeIcon icon={faChartLine} />
                </div>
                <h3 className="font-bold text-slate-900 text-base">Live Interactive Simulators</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Practice placing buy and sell orders, reading order books, and managing digital wallets before investing real capital with our guided interactive sandbox.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-lg">
                  <FontAwesomeIcon icon={faAward} />
                </div>
                <h3 className="font-bold text-slate-900 text-base">Verifiable Certificates</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Receive a cryptographically verifiable certificate upon course completion. Verify credentials online via the official ZSE certificate validation registry.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-lg">
                  <FontAwesomeIcon icon={faGlobe} />
                </div>
                <h3 className="font-bold text-slate-900 text-base">Multi-Currency Literacy</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Gain equal mastery of domestic Zimbabwe Gold (ZiG) equities on the ZSE and hard US Dollar trading on the Victoria Falls Stock Exchange (VFEX).
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Ecosystem Bento Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-[#00aeef] block mb-2">
              National Financial Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Our Integrated Ecosystem
            </h2>
            <p className="text-slate-600 text-sm mt-3">
              Explore the premier trading platforms, settlement registries, and real-time data services operating under the Zimbabwe Stock Exchange group.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* ZSE Card */}
            <div className="md:col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-8 flex flex-col justify-between shadow-xl border border-slate-700">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#00aeef] uppercase tracking-wider bg-[#00aeef]/10 px-3 py-1 rounded-full border border-[#00aeef]/30">
                    Equities, Debt & REITs
                  </span>
                  <span className="text-xs text-slate-400">Harare, Zimbabwe</span>
                </div>
                <h3 className="text-2xl font-black text-white">Zimbabwe Stock Exchange (ZSE)</h3>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-xl">
                  The primary pillar of Zimbabwe’s financial infrastructure. Facilitates listings, rights issues, and transparent secondary trading for leading blue-chip companies, Exchange Traded Funds (ETFs), and Real Estate Investment Trusts.
                </p>
              </div>
              <div className="flex flex-wrap gap-4 pt-8 text-xs font-bold uppercase tracking-wider">
                <a
                  href="https://zsedirect.co.zw/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-[#00aeef] text-white rounded-lg hover:bg-[#008cc0] transition-colors flex items-center gap-1.5"
                >
                  <span>Trade on ZSE Direct</span>
                  <FontAwesomeIcon icon={faExternalLinkAlt} className="text-[10px]" />
                </a>
                <a
                  href="https://www.zse.co.zw"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:text-white transition-colors border border-slate-700 flex items-center gap-1.5"
                >
                  <span>Exchange Portal</span>
                  <FontAwesomeIcon icon={faExternalLinkAlt} className="text-[10px]" />
                </a>
              </div>
            </div>

            {/* VFEX Card */}
            <div className="md:col-span-1 bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-2xl p-8 flex flex-col justify-between shadow-xl border border-slate-800">
              <div className="space-y-4">
                <span className="text-[11px] font-bold text-[#00aeef] uppercase tracking-wider bg-[#00aeef]/10 px-3 py-1 rounded-full border border-[#00aeef]/30">
                  USD Hard Currency
                </span>
                <h3 className="text-2xl font-black text-white">Victoria Falls Stock Exchange</h3>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Operating in the Victoria Falls Special Economic Zone. Traded exclusively in US Dollars with 0% capital gains withholding tax and unrestricted offshore dividend repatriation.
                </p>
              </div>
              <div className="pt-8">
                <a
                  href="https://www.vfexdirect.co.zw"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#00aeef] text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-[#008cc0] transition-colors"
                >
                  <span>Explore VFEX Direct</span>
                  <FontAwesomeIcon icon={faExternalLinkAlt} className="text-[10px]" />
                </a>
              </div>
            </div>

            {/* Data Direct Institutional Card */}
            <div className="md:col-span-3 bg-slate-50 border border-slate-200 rounded-2xl p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:shadow-lg transition-shadow">
              <div className="space-y-2 max-w-3xl">
                <span className="text-[11px] font-bold text-[#00aeef] uppercase tracking-wider">
                  Real-Time Market APIs & Research
                </span>
                <h3 className="text-2xl font-black text-slate-900">ZSE Data Direct</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Institutional market feed portal providing tick-by-tick order book depth, corporate disclosures, daily share summaries, and live endpoints for algorithmic trading, researchers, and fund managers.
                </p>
              </div>
              <div className="shrink-0">
                <a
                  href="https://datadirect.zse.co.zw"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all inline-flex items-center gap-2"
                >
                  <span>Access Data Direct</span>
                  <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pre-Footer Enrollment Banner */}
      <section className="py-16 bg-gradient-to-r from-slate-900 via-[#0d1b2a] to-slate-900 text-white border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00aeef]/10 text-[#00aeef] text-xs font-bold uppercase tracking-wider border border-[#00aeef]/30">
            <FontAwesomeIcon icon={faGraduationCap} />
            <span>Start Today For Free</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Take Your First Step in Capital Markets Investing
          </h2>
          <p className="text-slate-300 text-sm max-w-xl mx-auto leading-relaxed">
            Join over 10,000 Zimbabweans who learned to trade stocks, ETFs, and REITs through our professional courses.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/courses"
              className="px-8 py-3.5 bg-[#00aeef] hover:bg-[#008cc0] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-[#00aeef]/25"
            >
              Browse All Courses
            </Link>
            <Link
              to="/signup"
              className="px-8 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl border border-slate-700 transition-all"
            >
              Create Free Account
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
