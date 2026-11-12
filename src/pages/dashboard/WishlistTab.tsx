import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faHeart, 
  faTrash, 
  faStar,
  faPlayCircle,
  faCompass,
  faBookOpen
} from "@fortawesome/free-solid-svg-icons";
import { useCourses } from "@/hooks/useCourses";
import { Button } from "@/components/ui/button";
import { getFallbackImage } from "@/utils/blogHelpers";

const WishlistTab = () => {
  const [wishlistIds, setWishlistIds] = useState<number[]>([]);
  const { data: courses = [], isLoading } = useCourses();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWishlist = () => {
      try {
        const stored = JSON.parse(localStorage.getItem("zse_wishlist") || "[]");
        setWishlistIds(stored);
      } catch {
        setWishlistIds([]);
      }
    };
    
    fetchWishlist();
    window.addEventListener("wishlist-updated", fetchWishlist);
    return () => window.removeEventListener("wishlist-updated", fetchWishlist);
  }, []);

  const handleRemove = (courseId: number) => {
    const updated = wishlistIds.filter(id => id !== courseId);
    localStorage.setItem("zse_wishlist", JSON.stringify(updated));
    setWishlistIds(updated);
    window.dispatchEvent(new Event("wishlist-updated"));
  };

  const wishlistedCourses = courses.filter((c) => wishlistIds.includes(c.id));

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="bg-white rounded-2xl p-6 lg:p-8 border border-slate-200/80 shadow-sm">
        <div className="flex items-center mb-6 border-b border-slate-100 pb-5">
          <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mr-4 shrink-0">
            <FontAwesomeIcon icon={faHeart} className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Your Saved Wishlist ({wishlistedCourses.length})</h2>
            <p className="text-xs text-slate-500 mt-0.5">Courses and certifications you've bookmarked to enroll in later</p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 bg-slate-100 animate-pulse rounded-2xl"></div>
            ))}
          </div>
        ) : wishlistedCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistedCourses.map((course) => (
              <div 
                key={course.id} 
                className="group flex flex-col bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all overflow-hidden relative"
              >
                {/* Remove Button */}
                <button 
                  onClick={() => handleRemove(course.id)}
                  className="absolute top-3 right-3 z-10 w-8 h-8 bg-black/60 hover:bg-rose-600 text-white rounded-full flex items-center justify-center transition-colors shadow-md"
                  title="Remove from wishlist"
                >
                  <FontAwesomeIcon icon={faTrash} className="h-3 w-3" />
                </button>

                {/* Thumbnail */}
                <div 
                  className="relative aspect-video overflow-hidden cursor-pointer bg-slate-100"
                  onClick={() => navigate(`/courses/${course.id}`)}
                >
                  <img
                    src={course.thumbnail_url || course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.src = getFallbackImage(course.id);
                    }}
                  />
                  <div className="absolute inset-0 bg-slate-900/15 group-hover:bg-slate-900/25 transition-colors"></div>
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-1">
                  <div className="mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#00aeef] bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-100">
                      {course.category}
                    </span>
                  </div>
                  
                  <h3 
                    className="font-bold text-base text-slate-900 mb-2 line-clamp-2 cursor-pointer hover:text-[#00aeef] transition-colors"
                    onClick={() => navigate(`/courses/${course.id}`)}
                  >
                    {course.title}
                  </h3>
                  
                  <p className="text-xs text-slate-500 mb-4 line-clamp-2">
                    {course.description || course.excerpt}
                  </p>

                  <div className="mt-auto pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center text-xs font-semibold text-amber-500">
                        <FontAwesomeIcon icon={faStar} className="h-3 w-3 mr-1" />
                        <span>{course.rating ? Number(course.rating).toFixed(1) : "5.0"}</span>
                        <span className="text-slate-400 font-normal ml-1">
                          ({course.reviews_count || 12})
                        </span>
                      </div>
                      <div className="font-extrabold text-base text-[#00aeef]">
                        {course.price && course.price > 0 ? `$${course.price}` : "Free"}
                      </div>
                    </div>

                    <Button 
                      onClick={() => navigate(`/courses/${course.id}`)}
                      className="w-full bg-[#00aeef] hover:bg-[#0098d4] text-white rounded-xl font-bold text-xs h-10 shadow-sm"
                    >
                      <FontAwesomeIcon icon={faPlayCircle} className="mr-2 h-4 w-4" />
                      View Course Details
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-14 px-4 border border-dashed border-slate-200 rounded-2xl bg-slate-50/60 max-w-xl mx-auto space-y-4">
            <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto text-rose-400">
              <FontAwesomeIcon icon={faHeart} className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Your wishlist is empty</h3>
            <p className="text-slate-500 text-xs max-w-md mx-auto">
              Save courses to your wishlist while browsing our catalog so you can revisit and enroll in them at your own pace.
            </p>
            <Button 
              onClick={() => navigate("/courses")} 
              className="bg-[#00aeef] hover:bg-[#0098d4] text-white font-bold text-xs px-6 h-10 rounded-xl shadow-md"
            >
              <FontAwesomeIcon icon={faCompass} className="mr-2" />
              Explore All Courses
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistTab;
