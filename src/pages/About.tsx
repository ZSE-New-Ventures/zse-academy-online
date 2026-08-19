import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Link } from "react-router-dom";

export default function About() {
  return (
    <div className="min-h-screen bg-white font-sans text-[#1c1d1f]">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-24 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-xs font-bold uppercase tracking-widest text-[#00aeef] block mb-4">
            About ZSE Academy
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight text-gray-900 mb-8 max-w-3xl">
            Empowering the next generation of Zimbabwean investors.
          </h1>
          <p className="text-lg sm:text-xl text-[#6a6f73] leading-relaxed max-w-2xl">
            ZSE Academy is the official educational portal of the Zimbabwe Stock Exchange. 
            We provide accessible, structured, and practical learning resources to demystify 
            the stock market and help everyday citizens trade with confidence.
          </p>
        </div>
      </section>

      {/* Our Mission */}
      <section className="py-24 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
            <div className="md:col-span-4">
              <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                Our Mission
              </h2>
            </div>
            <div className="md:col-span-8 space-y-6 text-[#6a6f73] text-base leading-relaxed">
              <p>
                To foster financial literacy and promote retail investor participation in the 
                local capital markets. We bridge the gap between financial theory and real-world 
                market applications.
              </p>
              <p>
                By providing free structured courses, high-quality resources, and assessments 
                created by industry experts, we ensure that every learner—regardless of their starting 
                background—has the tools necessary to navigate the ZSE, VFEX, and wider financial landscapes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Products / Bento Grid Ecosystem */}
      <section className="py-24 bg-[#f8f9fa] border-b border-gray-150">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-[#00aeef] block mb-2">
              Our Products & Ecosystem
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">
              Connecting you to Zimbabwe's markets.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* ZSE Card (Spans 2 columns on desktop) */}
            <div className="md:col-span-2 bg-white border border-gray-200 p-8 flex flex-col justify-between hover:border-gray-400 transition-colors duration-300">
              <div className="space-y-4">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Equities & Debt Board
                </span>
                <h3 className="text-2xl font-black text-gray-900">Zimbabwe Stock Exchange (ZSE)</h3>
                <p className="text-sm text-[#6a6f73] leading-relaxed max-w-xl">
                  The primary pillar of Zimbabwe’s capital markets, facilitating the listing and trading of equities, 
                  exchange-traded funds (ETFs), and fixed-income debt securities. Our premier platform, 
                  <strong>ZSE Direct</strong>, empowers retail investors to trade stocks online instantly with zero hassle.
                </p>
              </div>
              <div className="flex flex-wrap gap-6 pt-8 text-xs font-bold uppercase tracking-wider">
                <a href="https://www.zsedirect.co.zw" target="_blank" rel="noopener noreferrer" className="text-[#00aeef] hover:underline">
                  ZSE Direct →
                </a>
                <a href="https://www.zse.co.zw" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:underline">
                  ZSE Official Website →
                </a>
              </div>
            </div>

            {/* VFEX Card (Spans 1 column on desktop) */}
            <div className="md:col-span-1 bg-white border border-gray-200 p-8 flex flex-col justify-between hover:border-gray-400 transition-colors duration-300">
              <div className="space-y-4">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  USD Currency Board
                </span>
                <h3 className="text-2xl font-black text-gray-900">Victoria Falls Stock Exchange (VFEX)</h3>
                <p className="text-sm text-[#6a6f73] leading-relaxed">
                  Operating inside the Victoria Falls Special Economic Zone, the VFEX trades exclusively in USD. 
                  Retail investors can seamlessly use <strong>VFEX Direct</strong> to invest in USD-denominated local and global securities.
                </p>
              </div>
              <div className="flex flex-wrap md:flex-col gap-4 pt-8 text-xs font-bold uppercase tracking-wider">
                <a href="https://www.vfexdirect.co.zw" target="_blank" rel="noopener noreferrer" className="text-[#00aeef] hover:underline">
                  VFEX Direct →
                </a>
                <a href="https://www.vfex.exchange" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:underline">
                  VFEX Official Website →
                </a>
              </div>
            </div>

            {/* Data Direct Card (Spans all 3 columns at the bottom) */}
            <div className="md:col-span-3 bg-white border border-gray-200 p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-gray-400 transition-colors duration-300">
              <div className="space-y-3 max-w-3xl">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  API & Institutional Market Data
                </span>
                <h3 className="text-2xl font-black text-gray-900">Data Direct</h3>
                <p className="text-sm text-[#6a6f73] leading-relaxed">
                  Our professional institutional market feed portal. Access deep analytical historical records, live order book tickers, 
                  price indicators, daily market summaries, and high-frequency custom stock APIs perfect for fund managers, research departments, and algorithm traders.
                </p>
              </div>
              <div className="pt-2 md:pt-0 shrink-0 text-xs font-bold">
                <a href="https://datadirect.zse.co.zw" target="_blank" rel="noopener noreferrer" className="inline-flex h-11 items-center bg-[#1c1d1f] hover:bg-gray-800 text-white font-bold px-6 transition-all rounded-none uppercase tracking-wider">
                  Explore Data Direct →
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values / Pillars */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">
              Our Core Pillars
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Pillar 1 */}
            <div className="space-y-4 text-left">
              <div className="text-3xl font-extrabold text-gray-300 tracking-tight border-b border-gray-100 pb-3">
                01
              </div>
              <h3 className="text-lg font-bold text-gray-900">Accessibility</h3>
              <p className="text-sm text-[#6a6f73] leading-relaxed">
                High-quality financial education should be open to everyone. All ZSE Academy courses are entirely free and optimized for desktop and mobile.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="space-y-4 text-left">
              <div className="text-3xl font-extrabold text-gray-300 tracking-tight border-b border-gray-100 pb-3">
                02
              </div>
              <h3 className="text-lg font-bold text-gray-900">Practicality</h3>
              <p className="text-sm text-[#6a6f73] leading-relaxed">
                We believe in learning by doing. Our courses focus on real market operations, live charts, and practical step-by-step guides.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="space-y-4 text-left">
              <div className="text-3xl font-extrabold text-gray-300 tracking-tight border-b border-gray-100 pb-3">
                03
              </div>
              <h3 className="text-lg font-bold text-gray-900">Trust & Authority</h3>
              <p className="text-sm text-[#6a6f73] leading-relaxed">
                As the official stock exchange portal, our curriculum is vetted directly by capital market regulators, exchange experts, and certified instructors.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Elegant minimal CTA */}
      <section className="py-20 bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            Ready to start learning?
          </h2>
          <p className="text-sm text-[#6a6f73] max-w-md mx-auto leading-relaxed">
            Gain immediate access to structured lessons and modules today.
          </p>
          <div className="pt-2">
            <Link
              to="/courses"
              className="inline-flex h-11 items-center justify-center bg-[#00aeef] hover:bg-[#009ad1] text-white font-bold px-8 transition-colors text-sm rounded-none"
            >
              Browse All Courses
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
