import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faTimes,
  faSearch,
  faUser,
  faGauge,
  faRightFromBracket,
  faUserShield,
  faHeart,
  faBell,
  faGlobe
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "@/contexts/AuthContext";
import logo from "../assets/logo.png";
import { Input } from "@/components/ui/input";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [wishlistCount, setWishlistCount] = useState(() => {
    try {
      const wishlist = JSON.parse(localStorage.getItem("zse_wishlist") || "[]");
      return wishlist.length;
    } catch {
      return 0;
    }
  });

  useEffect(() => {
    const updateWishlistCount = () => {
      const wishlist = JSON.parse(localStorage.getItem("zse_wishlist") || "[]");
      setWishlistCount(wishlist.length);
    };
    updateWishlistCount();
    window.addEventListener("wishlist-updated", updateWishlistCount);
    return () => window.removeEventListener("wishlist-updated", updateWishlistCount);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/courses?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
      <nav className="bg-transparent sticky top-0 z-50 h-[72px] flex items-center font-montserrat">
      <div className="w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center gap-4 lg:gap-8">

          {/* Mobile Menu Trigger & Logo */}
          <div className="flex items-center gap-2 lg:gap-4 shrink-0">
            <Link to="/" className="flex items-center">
              <img
                src={logo}
                alt="ZSE Academy"
                className="h-8 md:h-10 w-auto object-contain"
              />
            </Link>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 ml-auto text-[#1c1d1f] hover:bg-gray-100 transition-colors"
            >
              <FontAwesomeIcon icon={isOpen ? faTimes : faBars} className="h-6 w-6" />
            </button>
          </div>

          {/* Categories Dropdown Label - Udemy Style */}
          <div className="hidden lg:flex items-center">
            <Link to="/courses" className="text-sm font-normal text-[#1c1d1f] hover:text-[#00aeef] transition-colors">
              Courses
            </Link>
          </div>

          {/* Search Bar - Desktop */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-[800px] relative items-center group"
          >
            <div className="absolute left-4 text-gray-500 group-focus-within:text-[#1c1d1f]">
              <FontAwesomeIcon icon={faSearch} className="h-4 w-4" />
            </div>
            <Input
              type="text"
              placeholder="Search for anything"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-[48px] pl-12 pr-4 rounded-full border border-[#1c1d1f] bg-[#f7f9fa] border-none focus-visible:ring-1 focus-visible:ring-[#1c1d1f] focus:bg-white transition-all text-sm placeholder:text-gray-500"
            />
          </form>

          {/* Right Section Nav Links - Desktop */}
          <div className="hidden min-[1100px]:flex items-center gap-6 shrink-0">
            <Link to="/about" className="text-sm font-normal text-[#1c1d1f] hover:text-[#00aeef] transition-colors whitespace-nowrap">
              About Us
            </Link>
            <Link to="/contact" className="text-sm font-normal text-[#1c1d1f] hover:text-[#00aeef] transition-colors whitespace-nowrap">
              Contact Us
            </Link>
          </div>

          {/* Auth & Profile Section */}
          <div className="flex items-center gap-2 lg:gap-4 shrink-0">
            {isAuthenticated ? (
              <div className="flex items-center gap-1 sm:gap-2">
                <Link to="/dashboard" className="hidden sm:flex items-center px-3 h-10 text-sm font-normal text-[#1c1d1f] hover:text-[#00aeef] transition-colors">
                  My Learning
                </Link>

                <Link to="/dashboard" className="p-2.5 text-[#1c1d1f] hover:text-[#00aeef] transition-colors relative">
                  <FontAwesomeIcon icon={faHeart} className="h-5 w-5" />
                  {wishlistCount > 0 && (
                    <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                      {wishlistCount}
                    </span>
                  )}
                </Link>

                <button className="p-2.5 text-[#1c1d1f] hover:text-[#00aeef] transition-colors hidden sm:block">
                  <FontAwesomeIcon icon={faBell} className="h-5 w-5" />
                </button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="ml-1 h-9 w-9 bg-[#1c1d1f] text-white rounded-full flex items-center justify-center font-bold text-sm uppercase outline-none focus:ring-2 focus:ring-[#00aeef] focus:ring-offset-2">
                      {user?.name?.charAt(0) || 'U'}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[280px] p-0 rounded-none border-[#d1d7dc] shadow-xl mt-1">
                    <div className="flex items-center gap-3 p-4 bg-white hover:bg-gray-50 cursor-pointer border-b border-gray-100" onClick={() => navigate('/dashboard')}>
                      <div className="h-16 w-16 bg-[#1c1d1f] text-white rounded-full flex items-center justify-center font-bold text-2xl uppercase shrink-0">
                        {user?.name?.charAt(0) || 'U'}
                      </div>
                      <div className="flex flex-col overflow-hidden">
                        <span className="font-bold text-[#1c1d1f] text-lg leading-tight line-clamp-1">{user?.name}</span>
                        <span className="text-xs text-gray-500 truncate">{user?.email}</span>
                      </div>
                    </div>
                    <div className="py-2">
                      <DropdownMenuItem asChild className="px-4 py-2.5 cursor-pointer rounded-none hover:bg-gray-50 focus:bg-gray-50 transition-colors">
                        <Link to="/dashboard" className="flex items-center w-full text-sm">
                          My Learning
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="px-4 py-2.5 cursor-pointer rounded-none hover:bg-gray-50 focus:bg-gray-50 transition-colors">
                        <Link to="/dashboard" className="flex items-center w-full text-sm">
                          My Cart
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="px-4 py-2.5 cursor-pointer rounded-none hover:bg-gray-50 focus:bg-gray-50 transition-colors">
                        <Link to="/dashboard" className="flex items-center w-full text-sm">
                          Wishlist
                        </Link>
                      </DropdownMenuItem>
                    </div>
                    <DropdownMenuSeparator className="m-0" />
                    <div className="py-2">
                      <DropdownMenuItem asChild className="px-4 py-2.5 cursor-pointer rounded-none hover:bg-gray-50 focus:bg-gray-50 transition-colors">
                        <Link to="/contact" className="flex items-center w-full text-sm">
                          Notifications
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="px-4 py-2.5 cursor-pointer rounded-none hover:bg-gray-50 focus:bg-gray-50 transition-colors">
                        <Link to="/contact" className="flex items-center w-full text-sm">
                          Messages
                        </Link>
                      </DropdownMenuItem>
                    </div>
                    <DropdownMenuSeparator className="m-0" />
                    <div className="py-2">
                      {user?.role === "admin" && (
                        <DropdownMenuItem asChild className="px-4 py-2.5 cursor-pointer rounded-none hover:bg-gray-50 focus:bg-gray-50 font-bold text-[#00aeef]">
                          <Link to="/admin" className="flex items-center w-full">
                            Admin Panel
                          </Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem asChild className="px-4 py-2.5 cursor-pointer rounded-none hover:bg-gray-50 focus:bg-gray-50">
                        <Link to="/dashboard" className="flex items-center w-full text-sm">
                          Account settings
                        </Link>
                      </DropdownMenuItem>
                    </div>
                    <DropdownMenuSeparator className="m-0" />
                    <div className="py-2">
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="px-4 py-2.5 cursor-pointer rounded-none hover:bg-gray-50 focus:bg-gray-50 text-red-600 font-medium"
                      >
                        Log out
                      </DropdownMenuItem>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="hidden lg:block">
                  <Button
                    variant="outline"
                    className="h-10 px-5 rounded-none border border-[#1c1d1f] text-[#1c1d1f] hover:bg-gray-100 font-bold text-sm transition-all"
                  >
                    Log in
                  </Button>
                </Link>
                <Link to="/signup" className="hidden lg:block">
                  <Button
                    className="h-10 px-5 rounded-none bg-[#1c1d1f] text-white hover:bg-[#1c1d1f]/90 font-bold text-sm shadow-none transition-all"
                  >
                    Sign up
                  </Button>
                </Link>
                <button className="h-10 w-10 border border-[#1c1d1f] flex items-center justify-center hover:bg-gray-100 transition-colors hidden lg:flex">
                  <FontAwesomeIcon icon={faGlobe} className="h-5 w-5 text-[#1c1d1f]" />
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Mobile Sidebar Overlay & Drawer */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-[#1c1d1f]/60 z-40 lg:hidden backdrop-blur-[1px]"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed top-0 left-0 bottom-0 w-[280px] bg-white z-50 lg:hidden overflow-y-auto animate-slide-in-left shadow-2xl flex flex-col">
            {/* Drawer Header */}
            <div className="p-6 bg-[#f7f9fa] border-b border-gray-200">
              {isAuthenticated ? (
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-[#1c1d1f] text-white rounded-full flex items-center justify-center font-bold text-xl uppercase shrink-0">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="font-bold text-[#1c1d1f] text-lg leading-tight line-clamp-1">Hi, {user?.name?.split(' ')[0]}</span>
                    <span className="text-xs text-gray-500">Welcome back</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <Link to="/login" className="text-[#00aeef] font-bold text-lg" onClick={() => setIsOpen(false)}>Log in</Link>
                  <Link to="/signup" className="text-[#00aeef] font-bold text-lg" onClick={() => setIsOpen(false)}>Sign up</Link>
                </div>
              )}
            </div>

            {/* Main Drawer Navigation */}
            <div className="flex-1 px-4 py-6 flex flex-col gap-8">

              <div>
                <h3 className="px-2 text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Most Popular</h3>
                <div className="flex flex-col">
                  <Link to="/courses" className="flex items-center justify-between px-2 py-3 text-lg text-[#1c1d1f] hover:text-[#00aeef]" onClick={() => setIsOpen(false)}>
                    <span>Categories</span>
                    <FontAwesomeIcon icon={faUser} className="h-3 w-3 text-gray-300" />
                  </Link>
                </div>
              </div>

              <div>
                <h3 className="px-2 text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Account</h3>
                <div className="flex flex-col">
                  <Link to="/dashboard" className="px-2 py-3 text-lg text-[#1c1d1f]" onClick={() => setIsOpen(false)}>My Learning</Link>
                  <Link to="/dashboard" className="px-2 py-3 text-lg text-[#1c1d1f]" onClick={() => setIsOpen(false)}>Messages</Link>
                  <Link to="/dashboard" className="px-2 py-3 text-lg text-[#1c1d1f]" onClick={() => setIsOpen(false)}>Account settings</Link>
                </div>
              </div>

              <div className="mt-auto pt-8">
                <Link to="/about" className="block px-2 py-3 text-[#1c1d1f]" onClick={() => setIsOpen(false)}>ZSE for Business</Link>
                <Link to="/contact" className="block px-2 py-3 text-[#1c1d1f]" onClick={() => setIsOpen(false)}>Teach on ZSE Academy</Link>
                {isAuthenticated && (
                  <button
                    onClick={() => { handleLogout(); setIsOpen(false); }}
                    className="px-2 py-3 text-lg font-bold text-red-600"
                  >
                    Log out
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </nav>
  );
};
