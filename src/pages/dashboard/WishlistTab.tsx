import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faHeart, 
  faTrash, 
  faStar,
  faPlayCircle
} from "@fortawesome/free-solid-svg-icons";
import { useCourses } from "@/hooks/useCourses";
import { Button } from "@/components/ui/button";
import { getFallbackImage } from "@/utils/blogHelpers"; // Useful for missing images

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

  const wishlistedCourses = courses.filter((c: any) => wishlistIds.includes(c.id));

  return (
    <div className="space-y-6 lg:space-y-8 max-w-7xl mx-auto">
      <div className="bg-gradient-to-br from-card via-card to-muted/20 rounded-md lg:rounded-lg p-6 lg:p-8 border border-border/50 shadow-sm">
        <div className="flex items-center mb-6 border-b border-border pb-4">
          <div className="w-10 h-10 bg-rose-500/10 rounded-lg flex items-center justify-center mr-4">
            <FontAwesomeIcon icon={faHeart} className="h-5 w-5 text-rose-500" />
          </div>
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-foreground">Your Wishlist</h2>
            <p className="text-sm text-muted-foreground">Courses you have saved for later</p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 bg-muted animate-pulse rounded-md"></div>
            ))}
          </div>
        ) : wishlistedCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistedCourses.map((course: any) => (
              <div key={course.id} className="group flex flex-col bg-card rounded-xl border border-border/50 shadow-sm hover:shadow-md transition-all overflow-hidden relative">
                {/* Remove Button */}
                <button 
                  onClick={() => handleRemove(course.id)}
                  className="absolute top-3 right-3 z-10 w-8 h-8 bg-black/50 hover:bg-rose-500 text-white rounded-full flex items-center justify-center transition-colors"
                  title="Remove from wishlist"
                >
                  <FontAwesomeIcon icon={faTrash} className="h-3 w-3" />
                </button>

                {/* Thumbnail */}
                <div 
                  className="relative aspect-video overflow-hidden cursor-pointer"
                  onClick={() => navigate(`/courses/${course.id}`)}
                >
                  <img
                    src={course.thumbnail_url || course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.src = getFallbackImage(course.id);
                    }}
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-1">
                  <div className="mb-2">
                    <span className="text-xs font-semibold px-2 py-1 bg-primary/10 text-primary rounded-md uppercase tracking-wider">
                      {course.category}
                    </span>
                  </div>
                  
                  <h3 
                    className="font-bold text-lg mb-2 line-clamp-2 cursor-pointer hover:text-primary transition-colors"
                    onClick={() => navigate(`/courses/${course.id}`)}
                  >
                    {course.title}
                  </h3>
                  
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {course.description || course.excerpt}
                  </p>

                  <div className="mt-auto">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center text-sm font-medium text-amber-500">
                        <span className="mr-1">{course.rating?.toFixed(1) || "4.5"}</span>
                        <FontAwesomeIcon icon={faStar} className="h-3 w-3" />
                        <span className="text-muted-foreground ml-1">
                          ({course.reviews_count || Math.floor(Math.random() * 500)})
                        </span>
                      </div>
                      <div className="font-bold text-lg text-primary">
                        {course.price && course.price > 0 ? `$${course.price}` : "Free"}
                      </div>
                    </div>

                    <Button 
                      onClick={() => navigate(`/courses/${course.id}`)}
                      className="w-full bg-primary hover:bg-primary/90 text-white group-hover:shadow-md transition-all"
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
          <div className="text-center p-12 border border-dashed border-border rounded-xl bg-muted/5">
            <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <FontAwesomeIcon icon={faHeart} className="h-8 w-8 text-rose-500/50" />
            </div>
            <h3 className="text-xl font-bold mb-2">Your wishlist is empty</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Explore our library of financial courses and save the ones you're interested in taking later.
            </p>
            <Button onClick={() => navigate("/courses")} className="bg-primary hover:bg-primary/90 px-8">
              Explore Courses
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistTab;
