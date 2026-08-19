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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCourses } from "@/hooks/useCourses";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [isWishlistModalOpen, setIsWishlistModalOpen] = useState(false);
  const [wishlistIds, setWishlistIds] = useState<number[]>([]);
  const { data: courses = [] } = useCourses();
  const [wishlistCount, setWishlistCount] = useState(0);

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

  return (
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 h-[72px] flex items-center font-montserrat">
      <div className="w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center gap-4 lg:gap-8">

          {/* Mobile Menu Trigger & Logo */}
          {/* Mobile Menu Trigger & Logo */}
          <div className="flex items-center gap-2 lg:gap-8 shrink-0">
            <Link to="/" className="flex items-center">
              <img
                src={logo}
                alt="ZSE Academy"
                className="h-8 md:h-10 w-auto object-contain"
              />
            </Link>
          </div>

          {/* Spacer to push Nav & Auth/Profile to the right */}
          <div className="flex-1" />

          {/* Right Nav Links - Desktop */}
          <div className="hidden lg:flex items-center gap-8 shrink-0 mr-8">
            <Link 
              to="/courses" 
              className={`text-xs font-medium uppercase tracking-wider transition-colors whitespace-nowrap ${location.pathname.startsWith('/courses') ? 'text-[#00aeef]' : 'text-[#1c1d1f] hover:text-[#00aeef]'}`}
            >
              Courses
            </Link>
            <Link 
              to="/about" 
              className={`text-xs font-medium uppercase tracking-wider transition-colors whitespace-nowrap ${location.pathname === '/about' ? 'text-[#00aeef]' : 'text-[#1c1d1f] hover:text-[#00aeef]'}`}
            >
              About Us
            </Link>
            <Link 
              to="/tutorials" 
              className={`text-xs font-medium uppercase tracking-wider transition-colors whitespace-nowrap ${location.pathname.startsWith('/tutorials') ? 'text-[#00aeef]' : 'text-[#1c1d1f] hover:text-[#00aeef]'}`}
            >
              Tutorials
            </Link>
            <Link 
              to="/events" 
              className={`text-xs font-medium uppercase tracking-wider transition-colors whitespace-nowrap ${location.pathname.startsWith('/events') ? 'text-[#00aeef]' : 'text-[#1c1d1f] hover:text-[#00aeef]'}`}
            >
              Live Events
            </Link>
            <Link 
              to="/faq" 
              className={`text-xs font-medium uppercase tracking-wider transition-colors whitespace-nowrap ${location.pathname.startsWith('/faq') ? 'text-[#00aeef]' : 'text-[#1c1d1f] hover:text-[#00aeef]'}`}
            >
              FAQ
            </Link>
          </div>

          {/* Auth & Profile Section */}
          <div className="flex items-center gap-2 lg:gap-4 shrink-0">
            {isAuthenticated ? (
              <div className="hidden lg:flex items-center gap-1 sm:gap-2">
                <Link to="/dashboard" className="hidden sm:flex items-center px-3 h-10 text-xs font-medium uppercase tracking-wider text-[#1c1d1f] hover:text-[#00aeef] transition-colors">
                  My Learning
                </Link>

                <button onClick={() => setIsWishlistModalOpen(true)} className="p-2.5 text-[#1c1d1f] hover:text-[#00aeef] transition-colors relative">
                  <FontAwesomeIcon icon={faHeart} className="h-5 w-5" />
                  {wishlistCount > 0 && (
                    <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                      {wishlistCount}
                    </span>
                  )}
                </button>



                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="ml-1 h-9 w-9 bg-[#1c1d1f] text-white rounded-full flex items-center justify-center font-bold text-sm uppercase outline-none focus:ring-2 focus:ring-[#00aeef] focus:ring-offset-2">
                      {user?.name?.charAt(0) || 'U'}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[280px] p-0 bg-white rounded-none border-[#d1d7dc] shadow-xl mt-1">
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
                        <button onClick={() => setIsWishlistModalOpen(true)} className="flex items-center w-full text-sm text-left">
                          Wishlist
                        </button>
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
                    className="h-10 px-5 rounded-none bg-[#00aeef] text-white hover:bg-[#008cc0] font-bold text-sm shadow-none transition-all"
                  >
                    Sign up
                  </Button>
                </Link>
                <button className="h-10 w-10 border border-[#1c1d1f] flex items-center justify-center hover:bg-gray-100 transition-colors hidden lg:flex">
                  <FontAwesomeIcon icon={faGlobe} className="h-5 w-5 text-[#1c1d1f]" />
                </button>
              </div>
            )}
            
            {/* Mobile Menu Trigger - Far Right */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 ml-2 text-[#1c1d1f] hover:bg-gray-100 transition-colors"
            >
              <FontAwesomeIcon icon={isOpen ? faTimes : faBars} className="h-6 w-6" />
            </button>
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
          <div className="fixed top-0 left-0 bottom-0 w-full bg-white z-50 lg:hidden overflow-y-auto animate-slide-in-left shadow-2xl flex flex-col">
            {/* Drawer Header */}
            <div className="p-6 bg-[#f7f9fa] border-b border-gray-200 relative">
              <button 
                onClick={() => setIsOpen(false)} 
                className="absolute top-4 right-4 p-2 text-gray-500 hover:bg-gray-200 rounded-full transition-colors flex items-center justify-center h-10 w-10"
              >
                <FontAwesomeIcon icon={faTimes} className="h-6 w-6" />
              </button>
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

              {isAuthenticated && (
                <div>
                  <h3 className="px-3 text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Account</h3>
                  <div className="flex flex-col gap-1">
                    <Link to="/dashboard" className="flex items-center gap-3 px-3 py-3 rounded-xl text-lg font-medium text-[#1c1d1f] hover:bg-gray-50 hover:text-[#00aeef] transition-all" onClick={() => setIsOpen(false)}>
                      <FontAwesomeIcon icon={faGauge} className="w-5 text-gray-400" />
                      <span>My Learning</span>
                    </Link>
                    <button onClick={() => { setIsWishlistModalOpen(true); setIsOpen(false); }} className="flex items-center gap-3 px-3 py-3 rounded-xl text-lg font-medium text-[#1c1d1f] hover:bg-gray-50 hover:text-[#00aeef] transition-all text-left">
                      <FontAwesomeIcon icon={faHeart} className="w-5 text-gray-400" />
                      <span>Wishlist</span>
                    </button>
                    {user?.role === "admin" && (
                      <Link to="/admin" className="flex items-center gap-3 px-3 py-3 rounded-xl text-lg font-medium text-[#00aeef] hover:bg-blue-50 transition-all" onClick={() => setIsOpen(false)}>
                        <FontAwesomeIcon icon={faUserShield} className="w-5" />
                        <span>Admin Panel</span>
                      </Link>
                    )}
                  </div>
                </div>
              )}

              <div>
                <h3 className="px-3 text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Explore</h3>
                <div className="flex flex-col gap-1">
                  <Link to="/courses" className="flex items-center gap-3 px-3 py-3 rounded-xl text-lg font-medium text-[#1c1d1f] hover:bg-gray-50 hover:text-[#00aeef] transition-all" onClick={() => setIsOpen(false)}>
                    <FontAwesomeIcon icon={faSearch} className="w-5 text-gray-400" />
                    <span>Courses</span>
                  </Link>
                  <Link to="/tutorials" className="flex items-center gap-3 px-3 py-3 rounded-xl text-lg font-medium text-[#1c1d1f] hover:bg-gray-50 hover:text-[#00aeef] transition-all" onClick={() => setIsOpen(false)}>
                    <FontAwesomeIcon icon={faGlobe} className="w-5 text-gray-400" />
                    <span>Tutorials</span>
                  </Link>
                </div>
              </div>

              <div className="mt-auto pt-6 border-t border-gray-100">
                <Link to="/about" className="block px-3 py-2.5 text-base font-medium text-gray-600 hover:text-[#00aeef] transition-colors" onClick={() => setIsOpen(false)}>About Us</Link>
                <Link to="/contact" className="block px-3 py-2.5 text-base font-medium text-gray-600 hover:text-[#00aeef] transition-colors" onClick={() => setIsOpen(false)}>Contact</Link>
                
                {isAuthenticated && (
                  <button
                    onClick={() => { handleLogout(); setIsOpen(false); }}
                    className="flex items-center gap-3 mt-2 px-3 py-3 w-full rounded-xl text-lg font-bold text-red-600 hover:bg-red-50 transition-all text-left"
                  >
                    <FontAwesomeIcon icon={faRightFromBracket} className="w-5" />
                    <span>Log out</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}
      {/* Wishlist Modal */}
      <Dialog open={isWishlistModalOpen} onOpenChange={setIsWishlistModalOpen}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle>Your Wishlist</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            {wishlistCourses.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Your wishlist is empty.</p>
            ) : (
              wishlistCourses.map((course: any) => (
                <div key={course.id} className="flex gap-4 items-center border-b pb-4 last:border-0">
                  <img
                    src={course.thumbnail_url || "https://placehold.co/600x400/1e3a8a/FFFFFF/png?text=Course"}
                    alt={course.title}
                    className="w-20 h-14 object-cover rounded-md"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm line-clamp-2">{course.title}</h4>
                    <p className="text-xs text-gray-500 mt-1">{course.instructor}</p>
                  </div>
                  <Link to={`/courses/${course.id}`} onClick={() => setIsWishlistModalOpen(false)}>
                    <Button size="sm" variant="outline">View</Button>
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
