import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faTimes,
  faUser,
  faGauge,
  faRightFromBracket,
  faUserShield,
  faHeart,
  faBell,
  faArrowRight,
  faGraduationCap,
  faChevronDown,
  faChartLine,
  faCoins,
  faBuilding,
  faBookOpen,
  faLaptopCode,
  faVideo,
  faCircleQuestion,
  faBuildingColumns,
  faExternalLinkAlt,
  faFire,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "@/contexts/AuthContext";
import logo from "../assets/logo.png";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCourses } from "@/hooks/useCourses";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCoursesMenuOpen, setIsCoursesMenuOpen] = useState(false);
  const [isDirectMenuOpen, setIsDirectMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [isWishlistModalOpen, setIsWishlistModalOpen] = useState(false);
  const [wishlistIds, setWishlistIds] = useState<number[]>([]);
  const { data: courses = [] } = useCourses();
  const [wishlistCount, setWishlistCount] = useState(0);
  const coursesMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const directMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const updateWishlist = () => {
      try {
        const wishlist = JSON.parse(localStorage.getItem("zse_wishlist") || "[]");
        setWishlistCount(wishlist.length);
        setWishlistIds(wishlist);
      } catch {
        setWishlistCount(0);
        setWishlistIds([]);
      }
    };
    updateWishlist();
    window.addEventListener("wishlist-updated", updateWishlist);
    return () => window.removeEventListener("wishlist-updated", updateWishlist);
  }, []);

  const wishlistCourses = courses.filter((c: any) => wishlistIds.includes(c.id));

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const isLinkActive = (href: string) => {
    if (href === "/") return location.pathname === "/";
    return location.pathname.startsWith(href);
  };

  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-slate-200/90 sticky top-0 z-50 h-[76px] flex items-center font-montserrat shadow-sm">
      <div className="w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center gap-3 lg:gap-6">

          {/* Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <Link to="/" className="flex items-center group">
              <img
                src={logo}
                alt="Zimbabwe Stock Exchange Academy"
                className="h-9 md:h-11 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
              />
            </Link>
          </div>

          {/* Interactive Navigation Menu */}
          <div className="hidden lg:flex items-center gap-1 xl:gap-2">
            
            {/* Courses Mega-Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => {
                if (coursesMenuTimeoutRef.current) clearTimeout(coursesMenuTimeoutRef.current);
                setIsCoursesMenuOpen(true);
              }}
              onMouseLeave={() => {
                coursesMenuTimeoutRef.current = setTimeout(() => setIsCoursesMenuOpen(false), 200);
              }}
            >
              <Link
                to="/courses"
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  isLinkActive("/courses")
                    ? "text-[#00aeef] bg-[#00aeef]/10"
                    : "text-slate-700 hover:text-[#00aeef] hover:bg-slate-50"
                }`}
              >
                <FontAwesomeIcon icon={faGraduationCap} className="text-xs" />
                <span>Courses</span>
                <FontAwesomeIcon
                  icon={faChevronDown}
                  className={`text-[9px] transition-transform duration-200 ${
                    isCoursesMenuOpen ? "rotate-180 text-[#00aeef]" : "text-slate-400"
                  }`}
                />
              </Link>

              {/* Interactive Mega-Menu Panel */}
              {isCoursesMenuOpen && (
                <div className="absolute top-10 left-0 w-[480px] bg-white rounded-3xl shadow-2xl border border-slate-200 p-5 z-50 animate-in fade-in-50 slide-in-from-top-2 duration-200 grid grid-cols-12 gap-4">
                  {/* Left Column: Topics */}
                  <div className="col-span-7 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 block mb-1">
                      Curriculum Tracks
                    </span>

                    <Link
                      to="/courses"
                      onClick={() => setIsCoursesMenuOpen(false)}
                      className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#00aeef] flex items-center justify-center text-xs shrink-0 mt-0.5">
                        <FontAwesomeIcon icon={faChartLine} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800 group-hover:text-[#00aeef]">
                          Equities & ZSE Direct
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Share trading, CSD accounts & ATS
                        </p>
                      </div>
                    </Link>

                    <Link
                      to="/courses"
                      onClick={() => setIsCoursesMenuOpen(false)}
                      className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-sky-50 text-[#00aeef] flex items-center justify-center text-xs shrink-0 mt-0.5">
                        <FontAwesomeIcon icon={faCoins} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800 group-hover:text-[#00aeef]">
                          VFEX US Dollar Markets
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Hard currency & 0% CGT incentives
                        </p>
                      </div>
                    </Link>

                    <Link
                      to="/courses"
                      onClick={() => setIsCoursesMenuOpen(false)}
                      className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center text-xs shrink-0 mt-0.5">
                        <FontAwesomeIcon icon={faBuilding} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800 group-hover:text-amber-600">
                          REITs & Fixed Income
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Real estate trusts & debt bonds
                        </p>
                      </div>
                    </Link>
                  </div>

                  {/* Right Column: Featured Course Highlight Card */}
                  <div className="col-span-5 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-4 flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-[#00aeef] bg-[#00aeef]/20 px-2 py-0.5 rounded-full inline-block mb-2">
                        Featured Course
                      </span>
                      <h4 className="font-black text-sm text-white leading-tight">
                        Investment 101
                      </h4>
                      <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                        The definitive introduction to the Zimbabwe Stock Exchange.
                      </p>
                    </div>

                    <Link
                      to="/courses/11485"
                      onClick={() => setIsCoursesMenuOpen(false)}
                      className="mt-3 w-full py-1.5 px-3 rounded-lg bg-[#00aeef] hover:bg-[#008cc0] text-white text-[11px] font-bold uppercase tracking-wider text-center transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>Start Learning</span>
                      <FontAwesomeIcon icon={faArrowRight} className="text-[9px]" />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* About Us */}
            <Link
              to="/about"
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                isLinkActive("/about")
                  ? "text-[#00aeef] bg-[#00aeef]/10"
                  : "text-slate-700 hover:text-[#00aeef] hover:bg-slate-50"
              }`}
            >
              <FontAwesomeIcon icon={faBuildingColumns} className="text-xs" />
              <span>About Us</span>
            </Link>

            {/* Tutorials with Live Badge */}
            <Link
              to="/tutorials"
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                isLinkActive("/tutorials")
                  ? "text-[#00aeef] bg-[#00aeef]/10"
                  : "text-slate-700 hover:text-[#00aeef] hover:bg-slate-50"
              }`}
            >
              <FontAwesomeIcon icon={faLaptopCode} className="text-xs" />
              <span>Tutorials</span>
              <span className="bg-sky-100 text-[#00aeef] text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                11
              </span>
            </Link>

            {/* Webinars */}
            <Link
              to="/events"
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                isLinkActive("/events")
                  ? "text-[#00aeef] bg-[#00aeef]/10"
                  : "text-slate-700 hover:text-[#00aeef] hover:bg-slate-50"
              }`}
            >
              <FontAwesomeIcon icon={faVideo} className="text-xs" />
              <span>Webinars</span>
            </Link>

            {/* FAQ */}
            <Link
              to="/faq"
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                isLinkActive("/faq")
                  ? "text-[#00aeef] bg-[#00aeef]/10"
                  : "text-slate-700 hover:text-[#00aeef] hover:bg-slate-50"
              }`}
            >
              <FontAwesomeIcon icon={faCircleQuestion} className="text-xs" />
              <span>FAQ</span>
            </Link>

            {/* ZSE / VFEX Direct Dropdown on Hover */}
            <div
              className="relative ml-1"
              onMouseEnter={() => {
                if (directMenuTimeoutRef.current) clearTimeout(directMenuTimeoutRef.current);
                setIsDirectMenuOpen(true);
              }}
              onMouseLeave={() => {
                directMenuTimeoutRef.current = setTimeout(() => setIsDirectMenuOpen(false), 200);
              }}
            >
              <button
                type="button"
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  isDirectMenuOpen
                    ? "bg-slate-100 text-slate-900 border-slate-300 shadow-sm"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-[#00aeef] hover:border-slate-300"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-[#00aeef] shrink-0" />
                <span>ZSE / VFEX Direct</span>
                <FontAwesomeIcon
                  icon={faChevronDown}
                  className={`text-[9px] transition-transform duration-200 ${
                    isDirectMenuOpen ? "rotate-180 text-slate-800" : "text-slate-400"
                  }`}
                />
              </button>

              {/* Hover Dropdown Panel */}
              {isDirectMenuOpen && (
                <div className="absolute top-full right-0 pt-2 z-50 animate-in fade-in-50 slide-in-from-top-2 duration-200">
                  <div className="w-[360px] bg-white rounded-2xl shadow-2xl border border-slate-200/90 p-4 space-y-2.5">
                    <div className="px-1 pb-2 border-b border-slate-100">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Official Live Trading Portals
                      </p>
                      <p className="text-xs text-slate-600 font-medium mt-0.5">
                        Select a portal to access your live order book & trading terminal:
                      </p>
                    </div>

                    {/* ZSE Direct */}
                    <a
                      href="https://zsedirect.co.zw/"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setIsDirectMenuOpen(false)}
                      className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 hover:border-[#00aeef]/50 hover:bg-sky-50/50 transition-all group"
                    >
                      <div className="w-9 h-9 rounded-xl bg-sky-100 text-[#00aeef] flex items-center justify-center text-sm shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                        <FontAwesomeIcon icon={faChartLine} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 group-hover:text-[#00aeef] transition-colors flex items-center gap-1.5">
                            ZSE Direct
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-sky-100 text-sky-700 font-semibold uppercase">
                              ZiG
                            </span>
                          </span>
                          <FontAwesomeIcon
                            icon={faExternalLinkAlt}
                            className="text-[10px] text-slate-400 group-hover:text-[#00aeef]"
                          />
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                          Trade local Zimbabwe Stock Exchange equities, ETFs & REITs with live automated matching.
                        </p>
                      </div>
                    </a>

                    {/* VFEX Direct */}
                    <a
                      href="https://www.vfexdirect.co.zw"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setIsDirectMenuOpen(false)}
                      className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 hover:border-[#00aeef]/50 hover:bg-sky-50/50 transition-all group"
                    >
                      <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center text-sm shrink-0 mt-0.5 group-hover:scale-110 transition-transform group-hover:text-[#00aeef]">
                        <FontAwesomeIcon icon={faCoins} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 group-hover:text-[#00aeef] transition-colors flex items-center gap-1.5">
                            VFEX Direct
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold uppercase">
                              USD
                            </span>
                          </span>
                          <FontAwesomeIcon
                            icon={faExternalLinkAlt}
                            className="text-[10px] text-slate-400 group-hover:text-[#00aeef]"
                          />
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                          Trade Victoria Falls Stock Exchange US Dollar securities with 0% capital gains tax.
                        </p>
                      </div>
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Auth & Profile Section */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/dashboard"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-[#00aeef] hover:bg-slate-50 transition-all"
                >
                  <FontAwesomeIcon icon={faGauge} className="text-[#00aeef]" />
                  <span>My Learning</span>
                </Link>

                <button
                  onClick={() => setIsWishlistModalOpen(true)}
                  className="p-2.5 text-slate-600 hover:text-[#00aeef] hover:bg-slate-50 rounded-xl transition-all relative"
                  title="Saved Courses"
                >
                  <FontAwesomeIcon icon={faHeart} className="h-4 w-4" />
                  {wishlistCount > 0 && (
                    <span className="absolute top-1 right-1 bg-[#00aeef] text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                      {wishlistCount}
                    </span>
                  )}
                </button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="h-10 w-10 rounded-full bg-slate-900 hover:bg-[#00aeef] text-white flex items-center justify-center font-black text-sm uppercase outline-none ring-2 ring-transparent hover:ring-[#00aeef]/40 transition-all shadow-md">
                      {user?.name?.charAt(0) || "U"}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-72 p-0 bg-white rounded-2xl border border-slate-200 shadow-2xl mt-2 overflow-hidden animate-in fade-in-50 duration-200"
                  >
                    <div
                      className="p-4 bg-slate-50 hover:bg-slate-100/80 cursor-pointer border-b border-slate-100 flex items-center gap-3 transition-colors"
                      onClick={() => navigate("/dashboard")}
                    >
                      <div className="h-12 w-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-lg uppercase shrink-0">
                        {user?.name?.charAt(0) || "U"}
                      </div>
                      <div className="flex flex-col overflow-hidden">
                        <span className="font-bold text-slate-900 text-sm leading-tight truncate">
                          {user?.name}
                        </span>
                        <span className="text-xs text-slate-500 truncate">{user?.email}</span>
                      </div>
                    </div>

                    <div className="p-2 space-y-1">
                      <DropdownMenuItem asChild className="rounded-xl px-3 py-2 cursor-pointer text-xs font-semibold text-slate-700 hover:bg-slate-100">
                        <Link to="/dashboard" className="flex items-center gap-2">
                          <FontAwesomeIcon icon={faGauge} className="text-slate-400" />
                          <span>My Learning Dashboard</span>
                        </Link>
                      </DropdownMenuItem>

                      {user?.role === "admin" && (
                        <DropdownMenuItem asChild className="rounded-xl px-3 py-2 cursor-pointer text-xs font-bold text-[#00aeef] hover:bg-blue-50">
                          <Link to="/admin" className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faUserShield} />
                            <span>Administrator Panel</span>
                          </Link>
                        </DropdownMenuItem>
                      )}

                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="rounded-xl px-3 py-2 cursor-pointer text-xs font-bold text-rose-600 hover:bg-rose-50"
                      >
                        <FontAwesomeIcon icon={faRightFromBracket} className="mr-2" />
                        <span>Sign Out</span>
                      </DropdownMenuItem>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center gap-2 sm:gap-2.5">
                <Link to="/login" className="hidden sm:block">
                  <Button
                    variant="ghost"
                    className="h-10 px-4 rounded-xl text-slate-700 hover:text-[#00aeef] hover:bg-slate-100 font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5"
                  >
                    <FontAwesomeIcon icon={faUser} className="text-xs text-slate-400" />
                    <span>Log In</span>
                  </Button>
                </Link>

                <Link to="/signup" className="hidden sm:block">
                  <Button
                    className="group h-10 px-5 rounded-xl bg-gradient-to-r from-[#00aeef] to-[#0092c8] text-white hover:from-[#008cc0] hover:to-[#007ba8] font-bold text-xs uppercase tracking-wider shadow-md shadow-[#00aeef]/25 hover:shadow-lg transition-all hover:-translate-y-0.5 flex items-center gap-2"
                  >
                    <span>Sign Up</span>
                    <FontAwesomeIcon
                      icon={faArrowRight}
                      className="text-[10px] group-hover:translate-x-1 transition-transform"
                    />
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 text-slate-700 hover:text-[#00aeef] hover:bg-slate-100 rounded-xl transition-colors"
              aria-label="Toggle Menu"
            >
              <FontAwesomeIcon icon={isOpen ? faTimes : faBars} className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-white z-50 lg:hidden overflow-y-auto shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
            {/* Drawer Header */}
            <div className="p-6 bg-slate-50 border-b border-slate-100 relative">
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full"
              >
                <FontAwesomeIcon icon={faTimes} className="h-5 w-5" />
              </button>

              <img src={logo} alt="ZSE Academy" className="h-8 w-auto mb-4" />

              {isAuthenticated ? (
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-base uppercase shrink-0">
                    {user?.name?.charAt(0) || "U"}
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="font-bold text-slate-900 text-sm leading-tight truncate">
                      {user?.name}
                    </span>
                    <span className="text-xs text-slate-500 truncate">{user?.email}</span>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2 pt-2">
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 py-2 rounded-xl text-center text-xs font-bold uppercase tracking-wider text-slate-700 border border-slate-200 hover:bg-slate-100"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 py-2 rounded-xl text-center text-xs font-bold uppercase tracking-wider text-white bg-[#00aeef] hover:bg-[#008cc0] shadow-sm"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>

            {/* Drawer Navigation Links */}
            <div className="flex-1 p-6 space-y-6">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2 px-3">
                  Menu
                </span>
                <div className="space-y-1">
                  <Link
                    to="/courses"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50"
                  >
                    <FontAwesomeIcon icon={faGraduationCap} className="text-[#00aeef]" />
                    <span>Courses</span>
                  </Link>
                  <Link
                    to="/about"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50"
                  >
                    <FontAwesomeIcon icon={faBuildingColumns} className="text-[#00aeef]" />
                    <span>About Us</span>
                  </Link>
                  <Link
                    to="/tutorials"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50"
                  >
                    <div className="flex items-center gap-2.5">
                      <FontAwesomeIcon icon={faLaptopCode} className="text-[#00aeef]" />
                      <span>Tutorials</span>
                    </div>
                    <span className="bg-sky-100 text-[#00aeef] text-xs font-bold px-2 py-0.5 rounded-full">
                      11
                    </span>
                  </Link>
                  <Link
                    to="/events"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50"
                  >
                    <FontAwesomeIcon icon={faVideo} className="text-[#00aeef]" />
                    <span>Webinars</span>
                  </Link>
                  <Link
                    to="/faq"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50"
                  >
                    <FontAwesomeIcon icon={faCircleQuestion} className="text-[#00aeef]" />
                    <span>FAQ & Help</span>
                  </Link>
                  <Link
                    to="/contact"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50"
                  >
                    <FontAwesomeIcon icon={faExternalLinkAlt} className="text-[#00aeef]" />
                    <span>Contact Us</span>
                  </Link>
                </div>
              </div>

              {/* Live Trading Portals */}
              <div className="pt-2 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block px-1">
                  Live Trading Portals
                </span>
                <a
                  href="https://zsedirect.co.zw/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-50 text-slate-800 border border-slate-200 text-xs font-bold flex items-center justify-between hover:bg-slate-100 hover:text-[#00aeef] transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#00aeef]" />
                    ZSE Direct (ZiG Local)
                  </span>
                  <FontAwesomeIcon icon={faExternalLinkAlt} />
                </a>
                <a
                  href="https://www.vfexdirect.co.zw"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-50 text-slate-800 border border-slate-200 text-xs font-bold flex items-center justify-between hover:bg-slate-100 hover:text-[#00aeef] transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#00aeef]" />
                    VFEX Direct (USD)
                  </span>
                  <FontAwesomeIcon icon={faExternalLinkAlt} />
                </a>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Wishlist Modal */}
      <Dialog open={isWishlistModalOpen} onOpenChange={setIsWishlistModalOpen}>
        <DialogContent className="max-w-md bg-white rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-slate-900">Your Saved Courses</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1 mt-4">
            {wishlistCourses.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-8">Your wishlist is currently empty.</p>
            ) : (
              wishlistCourses.map((course: any) => (
                <div key={course.id} className="flex gap-3 items-center p-3 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors">
                  <img
                    src={course.thumbnail_url || "https://placehold.co/600x400/0b1324/FFFFFF/png?text=Course"}
                    alt={course.title}
                    className="w-16 h-12 object-cover object-top rounded-xl shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-xs text-slate-900 line-clamp-1">{course.title}</h4>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">{course.instructor || "ZSE Academy"}</p>
                  </div>
                  <Link to={`/courses/${course.id}`} onClick={() => setIsWishlistModalOpen(false)}>
                    <Button size="sm" className="bg-[#00aeef] hover:bg-[#008cc0] text-white text-xs font-bold rounded-lg h-8 px-3">
                      View
                    </Button>
                  </Link>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </nav>
  );
};
