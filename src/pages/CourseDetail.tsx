// ✨ FULL FIXED CourseDetail.tsx

import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import courseBg from "../assets/courseid.jpg";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronRight,
  faBookOpen,
  faList,
  faChalkboardTeacher,
  faStar,
  faFileAlt,
  faTimes,
  faCopy,
} from "@fortawesome/free-solid-svg-icons";
import {
  faFacebook,
  faTwitter,
  faLinkedin,
  faWhatsapp
} from "@fortawesome/free-brands-svg-icons";
import { Star } from "lucide-react";
import { courseService, Course as CourseType } from "@/services/course.service";
import { SimilarCoursesSection } from "@/components/course/SimilarCoursesSection";
import { CourseSidebarCard } from "@/components/course/CourseSidebarCard";
import { CourseContentModal } from "@/components/course/CourseContentModal";
import { QuizzesSection } from "@/components/course/quiz/QuizzesSection";
import { CourseOverviewTab } from "@/components/course/tabs/CourseOverviewTab";
import { CourseContentTab } from "@/components/course/tabs/CourseContentTab";
import { CourseInstructorTab } from "@/components/course/tabs/CourseInstructorTab";
import { CourseReviewsTab } from "@/components/course/tabs/CourseReviewsTab";

interface Slide {
  id: number;
  course_content_id: number;
  title: string;
  type: string;
  file_path: string | null;
  url: string;
  position: number;
  created_at: string;
  updated_at: string;
  is_locked?: boolean;
  download_url?: string;
}

interface Content {
  id: number;
  course_id: number;
  title: string;
  description: string;
  position: number;
  created_at: string;
  updated_at: string;
  slides: Slide[];
}

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  is_active: number;
  created_at: string;
  updated_at: string;
}

interface CourseDetail extends CourseType {
  user_id: number;
  category: Category;
  category_id: number;
  created_at: string;
  updated_at: string;
  is_enrolled: boolean;
  contents: Content[];
}

import { useCourse, useSimilarCourses, useEnrollMutation } from "@/hooks/useCourses";
import { useToast } from "@/hooks/use-toast";

const CourseDetail = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("overview");
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [reviewsData, setReviewsData] = useState<{
    average_rating: number;
    reviews: any[];
  } | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/courses/${id}/reviews`);
        if (response.ok) {
          const data = await response.json();
          setReviewsData({
            average_rating: Number(data.average_rating || 0),
            reviews: data.reviews || [],
          });
        }
      } catch (err) {
        console.error("Error loading reviews info:", err);
      }
    };
    if (id) {
      fetchReviews();
    }
  }, [id]);

  const { data: course, isLoading: loading, error: fetchError } = useCourse(id);
  const { data: similarCourses = [] } = useSimilarCourses(id);
  const enrollMutation = useEnrollMutation();
  const { toast } = useToast();

  const [currentContent, setCurrentContent] = useState<{
    title: string;
    type: string;
    url: string;
    youtubeId?: string;
    currentSlideIndex: number;
    totalSlides: number;
    contentId: number;
    slides: Slide[];
    moduleId: number;
    courseId: number;
  } | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const handleEnrollNow = async () => {
    if (!course) return;

    try {
      await enrollMutation.mutateAsync(course.id);
      toast({
        title: "Success!",
        description: "Successfully enrolled in the course!",
      });
    } catch (error) {
      console.error("Error enrolling in course:", error);
      toast({
        title: "Error",
        description: "Failed to enroll in course",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (course) {
      const wishlist = JSON.parse(localStorage.getItem("zse_wishlist") || "[]");
      setIsWishlisted(wishlist.includes(course.id));
    }
  }, [course]);

  const handleAddToWishlist = () => {
    if (!course) return;
    const wishlist = JSON.parse(localStorage.getItem("zse_wishlist") || "[]");
    if (!wishlist.includes(course.id)) {
      wishlist.push(course.id);
      localStorage.setItem("zse_wishlist", JSON.stringify(wishlist));
      window.dispatchEvent(new Event("wishlist-updated"));
      setIsWishlisted(true);
      toast({
        title: "Added to Wishlist",
        description: `"${course.title}" has been added to your wishlist.`,
        className: "bg-green-50 text-green-900 border-green-200",
      });
    } else {
      const updatedWishlist = wishlist.filter((id: number) => id !== course.id);
      localStorage.setItem("zse_wishlist", JSON.stringify(updatedWishlist));
      window.dispatchEvent(new Event("wishlist-updated"));
      setIsWishlisted(false);
      toast({
        title: "Removed from Wishlist",
        description: `"${course.title}" has been removed from your wishlist.`,
      });
    }
  };

  const handleShareClick = () => {
    setIsShareModalOpen(true);
  };

  const handleContentClick = (
    content: Content,
    slide: Slide,
    slideIndex: number
  ) => {
    if (slide.is_locked && !course?.is_enrolled) {
      toast({
        title: "Access Restricted",
        description: "Please log in or enroll to unlock this premium lesson slide.",
        variant: "destructive",
      });
      return;
    }

    const youtubeId =
      slide.type === "video" ? getYouTubeId(slide.url) : undefined;

    setCurrentContent({
      title: slide.title,
      type: slide.type,
      url: slide.download_url || slide.url,
      youtubeId: youtubeId || undefined,
      currentSlideIndex: slideIndex,
      totalSlides: content.slides.length,
      contentId: content.id,
      slides: content.slides,
      moduleId: content.id,
      courseId: content.course_id,
    });
  };

  const closeContentModal = () => {
    setCurrentContent(null);
  };

  const navigateToSlide = (newIndex: number) => {
    if (!currentContent) return;

    const newSlide = currentContent.slides[newIndex];
    const youtubeId =
      newSlide.type === "video" ? getYouTubeId(newSlide.url) : undefined;

    setCurrentContent((prev) =>
      prev
        ? {
          ...prev,
          title: newSlide.title,
          type: newSlide.type,
          url: newSlide.download_url || newSlide.url,
          youtubeId: youtubeId || undefined,
          currentSlideIndex: newIndex,
        }
        : null
    );
  };

  const handleFinishContent = async () => {
    if (!currentContent) return;

    try {
      await courseService.finishModule(
        currentContent.courseId,
        currentContent.moduleId
      );
      closeContentModal();
    } catch (err) {
      console.log("Finish error:", err);
    }
  };

  const getYouTubeId = (url: string): string | null => {
    if (!url) return null;

    const cleanUrl = url
      .replace(/\?si=.*$/, "")
      .replace(/&t=.*$/, "")
      .split("&")[0];

    const patterns = [
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/,
      /youtube\.com\/watch\?v=([^"&?\/\s]{11})/,
      /youtu\.be\/([^"&?\/\s]{11})/,
    ];

    for (const pattern of patterns) {
      const match = cleanUrl.match(pattern);
      if (match) {
        return match[1];
      }
    }

    return null;
  };

  const getTotalLessons = (): number => {
    if (!course || !course.contents) return 0;
    return course.contents.reduce(
      (total, content) => total + (content.slides?.length || 0),
      0
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white font-montserrat">
        <Navbar />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00aeef] mx-auto mb-4"></div>
            <p className="mt-4 text-gray-500">Loading course...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (fetchError || !course) {
    return (
      <div className="min-h-screen bg-white font-montserrat">
        <Navbar />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600">Error</h2>
            <p className="mt-2 text-gray-600">
              {fetchError ? "Failed to load course details" : "Course not found"}
            </p>
            <Button asChild className="mt-4 bg-[#00aeef] hover:bg-[#009ad1]">
              <Link to="/courses">Back to Courses</Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const totalLessons = getTotalLessons();

  return (
    <div className="min-h-screen bg-white font-montserrat">
      <Navbar />

      {/* Content Modal */}
      {currentContent && (
        <CourseContentModal
          content={currentContent}
          onClose={closeContentModal}
          onNavigateSlide={navigateToSlide}
          onFinish={handleFinishContent}
        />
      )}

      {/* Udemy Header Section */}
      <section className="relative bg-cover bg-center text-white py-8 md:py-12" style={{ backgroundImage: `url(${courseBg})` }}>
        <div className="absolute inset-0 bg-black opacity-50" />
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8 relative">
            {/* Left Content Column */}
            <div className="lg:col-span-2 space-y-4">
              {/* Breadcrumb - White on Dark */}
              <nav className="flex items-center space-x-2 text-sm text-[#cec0fc] font-bold">
                <Link to="/courses" className="hover:underline">
                  Courses
                </Link>
                <FontAwesomeIcon icon={faChevronRight} className="h-3 w-3" />
                <span className="text-[#cec0fc]">
                  {course.category?.name || "Topic"}
                </span>
              </nav>

              <h1 className="text-3xl lg:text-4xl font-bold text-left leading-tight">
                {course.title}
              </h1>

              <p className="text-lg leading-relaxed text-gray-200 transition-all duration-300">
                {course.description && (
                  <>
                    {showFullDesc
                      ? course.description
                      : `${course.description.substring(0, 225)}${course.description.length > 25 ? "..." : ""}`}
                    {course.description.length > 25 && (
                      <button
                        onClick={() => setShowFullDesc(!showFullDesc)}
                        className="ml-2 underline font-bold hover:text-white text-[#cec0fc] transition-colors text-sm"
                      >
                        {showFullDesc ? "Read Less" : "Read More"}
                      </button>
                    )}
                  </>
                )}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-left">
                <div className="flex items-center space-x-1">
                  <span className="font-bold text-[#f3ca8c]">
                    {reviewsData?.average_rating 
                      ? reviewsData.average_rating.toFixed(1) 
                      : (course.rating || 4.7).toFixed(1)}
                  </span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => {
                      const ratingVal = reviewsData?.average_rating || course.rating || 4.7;
                      return (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < Math.round(ratingVal)
                              ? "fill-[#f3ca8c] text-[#f3ca8c]"
                              : "text-gray-600"
                            }`}
                        />
                      );
                    })}
                  </div>
                  <span className="text-[#cec0fc] hover:underline cursor-pointer" onClick={() => setActiveTab("reviews")}>
                    ({reviewsData?.reviews?.length ?? 0} {reviewsData?.reviews?.length === 1 ? "rating" : "ratings"})
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
                <div>
                  Created by <span className="text-[#cec0fc] hover:underline cursor-pointer">{course.instructor?.name || "ZSE Academy"}</span>
                </div>
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faFileAlt} className="mr-2 h-3.5 w-3.5" />
                  Last updated {new Date(course.updated_at).toLocaleDateString()}
                </div>
              </div>
            </div>



            {/* Mobile Sidebar Card - Simplified */}
            <div className="lg:hidden">
              <img
                src={course.thumbnail_url || course.thumbnail || "/placeholder.svg"}
                alt={course.title}
                className="w-full aspect-video object-cover border border-white/20 mb-4"
              />
              <div className="flex flex-col gap-3">
                {course.progress === 100 || (course as any).is_completed ? (
                  <Button className="w-full rounded-none h-12 bg-green-700 hover:bg-green-700 text-white font-bold cursor-default">
                    Completed
                  </Button>
                ) : course.is_enrolled ? (
                  <Button className="w-full rounded-none h-12 bg-green-600 hover:bg-green-600 text-white font-bold cursor-default">
                    Enrolled
                  </Button>
                ) : (
                  <Button onClick={handleEnrollNow} className="w-full rounded-none h-12 bg-[#00aeef] hover:bg-[#009ad1] text-white font-bold">
                    Enroll Now
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="py-8 bg-white">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-8">
              {/* Udemy Styled Tabs - Sticky or Flat */}
              <div className="border-b border-gray-200">
                <div className="flex overflow-x-auto space-x-8 no-scrollbar">
                  {["overview", "content", "instructor", "reviews", "quizzes"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`py-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap capitalize ${activeTab === tab
                          ? "border-black text-black"
                          : "border-transparent text-gray-500 hover:text-black"
                        }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-8 transition-all duration-300">
                {activeTab === "overview" && (
                  <CourseOverviewTab
                    totalLessons={totalLessons}
                    modulesCount={course.contents?.length || 0}
                    description={course.description}
                  />
                )}
                {activeTab === "content" && (
                  <CourseContentTab
                    contents={course.contents}
                    totalLessons={totalLessons}
                    onContentClick={handleContentClick}
                    isEnrolled={course.is_enrolled}
                  />
                )}
                {activeTab === "instructor" && (
                  <CourseInstructorTab instructor={course.instructor} />
                )}
                {activeTab === "reviews" && id && (
                  <CourseReviewsTab courseId={id} />
                )}
                {activeTab === "quizzes" && id && (
                  <QuizzesSection courseId={id} />
                )}
              </div>

            </div>

            {/* Empty space for the sticky card overflow */}
            <div className="hidden lg:block lg:col-span-1 relative z-30">
              <div className="-mt-[360px]">
                <CourseSidebarCard
                  thumbnailUrl={
                    course.thumbnail_url || course.thumbnail || "/placeholder.svg"
                  }
                  title={course.title}
                  isEnrolled={course.is_enrolled}
                  isCompleted={course.progress === 100 || (course as any).is_completed}
                  totalLessons={totalLessons}
                  modulesCount={course.contents?.length || 0}
                  onEnrollClick={handleEnrollNow}
                  onWishlistClick={handleAddToWishlist}
                  onShareClick={handleShareClick}
                  hasSampleVideos={totalLessons > 0}
                  courseId={course.id}
                />
              </div>
            </div>
          </div>

          {/* Similar Courses Section - Rendered full width inside container */}
          <div className="pt-12 border-t border-gray-200 mt-16">
            <SimilarCoursesSection courses={similarCourses} />
          </div>
        </div>
      </section>

      {isShareModalOpen && course && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-sm p-4">
          <div className="bg-white p-6 rounded-2xl w-[440px] max-w-full shadow-2xl relative border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Share this course</h3>
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <FontAwesomeIcon icon={faTimes} className="h-5 w-5" />
              </button>
            </div>

            {/* Social Grid */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent("Check out this course: " + course.title + " - " + window.location.href)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 group text-center"
              >
                <div className="w-12 h-12 bg-[#25D366]/10 text-[#25D366] rounded-full flex items-center justify-center group-hover:bg-[#25D366] group-hover:text-white transition-all">
                  <FontAwesomeIcon icon={faWhatsapp} className="h-5 w-5" />
                </div>
                <span className="text-xs font-semibold text-gray-600">WhatsApp</span>
              </a>

              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 group text-center"
              >
                <div className="w-12 h-12 bg-[#1877F2]/10 text-[#1877F2] rounded-full flex items-center justify-center group-hover:bg-[#1877F2] group-hover:text-white transition-all">
                  <FontAwesomeIcon icon={faFacebook} className="h-5 w-5" />
                </div>
                <span className="text-xs font-semibold text-gray-600">Facebook</span>
              </a>

              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent("Check out this course: " + course.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 group text-center"
              >
                <div className="w-12 h-12 bg-black/10 text-black rounded-full flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all">
                  <FontAwesomeIcon icon={faTwitter} className="h-5 w-5" />
                </div>
                <span className="text-xs font-semibold text-gray-600">X (Twitter)</span>
              </a>

              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 group text-center"
              >
                <div className="w-12 h-12 bg-[#0A66C2]/10 text-[#0A66C2] rounded-full flex items-center justify-center group-hover:bg-[#0A66C2] group-hover:text-white transition-all">
                  <FontAwesomeIcon icon={faLinkedin} className="h-5 w-5" />
                </div>
                <span className="text-xs font-semibold text-gray-600">LinkedIn</span>
              </a>
            </div>

            {/* Copy Link Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block text-left">Copy course link</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={window.location.href}
                  className="flex-1 bg-gray-50 border border-gray-200 px-3 py-2 text-sm rounded-lg text-gray-600 focus:outline-none"
                />
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast({
                      title: "Copied!",
                      description: "Course link copied to clipboard.",
                      className: "bg-green-50 text-green-900 border-green-200",
                    });
                  }}
                  className="bg-black hover:bg-gray-800 text-white rounded-lg px-4"
                >
                  <FontAwesomeIcon icon={faCopy} className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default CourseDetail;
