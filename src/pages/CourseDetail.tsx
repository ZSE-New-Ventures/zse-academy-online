// CourseDetail.tsx



import { useState, useEffect } from "react";

import { useParams, Link, useNavigate, useLocation } from "react-router-dom";

import Swal from "sweetalert2";

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

  faWandMagicSparkles,

  faShieldHalved,

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

import { CourseAiSummaryModal } from "@/components/course/CourseAiSummaryModal";

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

  content?: string;

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

  reviews_avg_rating?: number;

  reviews_count?: number;

  is_completed?: boolean;

  rating?: number;

  created_at: string;

  updated_at: string;

  is_enrolled: boolean;

  contents: Content[];

}



import { useCourse, useSimilarCourses, useEnrollMutation } from "@/hooks/useCourses";

import { useToast } from "@/hooks/use-toast";

import { useAuth } from "@/contexts/AuthContext";



const CourseDetail = () => {

  const { id } = useParams();

  const location = useLocation();

  const [activeTab, setActiveTab] = useState(() => {
    if (location.pathname.includes("quiz") || location.pathname.includes("exam")) {
      return "quizzes";
    }
    if (location.pathname.includes("learn")) {
      return "content";
    }
    return "overview";
  });

  const [isWishlisted, setIsWishlisted] = useState(false);

  const [showFullDesc, setShowFullDesc] = useState(false);

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const [isAiSummaryModalOpen, setIsAiSummaryModalOpen] = useState(false);

  // The secondary reviews fetch has been removed because the backend

  // now explicitly injects `reviews_count` and `reviews_avg_rating` into the course payload!



  const { data: course, isLoading: loading, error: fetchError } = useCourse(id);

  const { data: similarCourses = [] } = useSimilarCourses(id);

  const enrollMutation = useEnrollMutation();

  const { toast } = useToast();

  const navigate = useNavigate();

  const { user } = useAuth();



  const [currentContent, setCurrentContent] = useState<{

    title: string;

    type: string;

    url: string;

    content?: string;

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

    if (!user) {

      Swal.fire({

        title: "Authentication Required",

        text: "Please log in to enroll in this course",

        icon: "warning",

        showCancelButton: true,

        confirmButtonColor: "#00aeef",

        cancelButtonColor: "#d33",

        confirmButtonText: "Log In",

        cancelButtonText: "Cancel"

      }).then((result) => {

        if (result.isConfirmed) {

          navigate("/login");

        }

      });

      return;

    }



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

      content: slide.content,

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

          content: newSlide.content,

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

      /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/,

      /youtube\.com\/watch\?v=([^"&?/\s]{11})/,

      /youtu\.be\/([^"&?/\s]{11})/,

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

      <div className="min-h-screen bg-slate-50 font-montserrat">

        <Navbar />

        <div className="flex items-center justify-center min-h-[60vh] px-4">

          <div className="text-center max-w-md bg-white p-8 rounded-3xl border border-slate-200/80 shadow-lg space-y-4">

            <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl mx-auto flex items-center justify-center border border-amber-200/60 shadow-xs">

              <FontAwesomeIcon icon={faShieldHalved} className="h-8 w-8" />

            </div>

            <h2 className="text-2xl font-bold text-slate-900">Program Unavailable or Restricted</h2>

            <p className="text-sm text-slate-600 leading-relaxed">

              This course is either not available or is a private Sponsor Exam restricted to authorized cohorts and pre-registered candidates.

            </p>

            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">

              <Button asChild className="bg-[#00aeef] hover:bg-[#009ad1] text-white rounded-xl font-bold text-xs h-10 px-5 shadow-sm">

                <Link to="/courses">Explore Public Catalog</Link>

              </Button>

              <Button asChild variant="outline" className="rounded-xl font-bold text-xs h-10 px-5">

                <Link to="/dashboard/my-courses">My Enrolled Courses</Link>

              </Button>

            </div>

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



      {/* ZSE Training Institute Course Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#060b17] via-[#0b172e] to-[#071324] text-white py-10 md:py-14 border-b border-slate-800">
        {/* Ambient fintech glow effects */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#00aeef]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col-reverse lg:grid lg:grid-cols-3 gap-8 relative">
            {/* Left Content Column */}
            <div className="lg:col-span-2 space-y-4 md:space-y-6">
              {/* Breadcrumb & Accreditation Badges */}
              <div className="flex flex-wrap items-center gap-2.5">
                <nav className="flex items-center space-x-2 text-xs font-semibold text-slate-400">
                  <Link to="/courses" className="hover:text-white transition-colors">
                    Courses
                  </Link>
                  <FontAwesomeIcon icon={faChevronRight} className="h-2.5 w-2.5 text-slate-600" />
                  <span className="text-sky-300 font-bold">
                    {course.category?.name || "Capital Markets"}
                  </span>
                </nav>

                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-[#00aeef]/15 text-[#00aeef] border border-[#00aeef]/30 px-2.5 py-0.5 rounded-full">
                  Accredited Syllabus
                </span>

                {(course.visibility === "restricted" || (course.category as unknown as { access_level?: string })?.access_level === "restricted") && (
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-full shadow-sm">
                    <FontAwesomeIcon icon={faShieldHalved} className="h-3 w-3 text-slate-950" />
                    Sponsor Exam
                  </span>
                )}
              </div>

              {/* Course Title */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-left leading-tight tracking-tight text-white">
                {course.title}
              </h1>

              {/* Course Description */}
              <p className="text-sm sm:text-base leading-relaxed text-slate-300 transition-all duration-300">
                {course.description && (
                  <>
                    {showFullDesc
                      ? course.description
                      : `${course.description.substring(0, 225)}${course.description.length > 225 ? "..." : ""}`}
                    {course.description.length > 225 && (
                      <button
                        onClick={() => setShowFullDesc(!showFullDesc)}
                        className="ml-2 font-bold text-[#00aeef] hover:text-sky-300 underline transition-colors text-xs"
                      >
                        {showFullDesc ? "Read Less" : "Read More"}
                      </button>
                    )}
                  </>
                )}
              </p>

              {/* Ratings & Metadata Bar */}
              <div className="flex flex-wrap items-center gap-4 text-left pt-1">
                <div className="flex items-center space-x-2">
                  {(course.reviews_avg_rating && course.reviews_avg_rating > 0) ? (
                    <>
                      <span className="font-black text-[#f3ca8c] text-sm">
                        {course.reviews_avg_rating.toFixed(1)}
                      </span>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.round(course.reviews_avg_rating || 0)
                                ? "fill-[#f3ca8c] text-[#f3ca8c]"
                                : "text-slate-600"
                            }`}
                          />
                        ))}
                      </div>
                      <span
                        className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
                        onClick={() => setActiveTab("reviews")}
                      >
                        ({course.reviews_count ?? 0} {course.reviews_count === 1 ? "rating" : "ratings"})
                      </span>
                    </>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                      ★ Official Certified Syllabus • ZSE Training Institute
                    </span>
                  )}
                </div>
              </div>

              {/* Instructor & Update Meta */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 border-t border-slate-800/80 pt-3">
                <div>
                  Created by <span className="text-white font-semibold">{course.instructor?.name || "ZSE Training Institute Faculty"}</span>
                </div>
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faFileAlt} className="mr-2 h-3.5 w-3.5 text-slate-500" />
                  Last updated {new Date(course.updated_at).toLocaleDateString()}
                </div>
                <div className="flex items-center text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00aeef] mr-2"></span>
                  ZiG & USD Capital Markets
                </div>
              </div>

              {/* Explorer AI Analysis Button in Hero */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Button
                  onClick={() => setIsAiSummaryModalOpen(true)}
                  className="bg-gradient-to-r from-[#00aeef] via-sky-500 to-indigo-600 hover:from-[#0096ce] hover:to-indigo-700 text-white font-extrabold text-xs h-11 px-6 rounded-xl shadow-lg shadow-[#00aeef]/30 border border-white/20 flex items-center gap-2.5 group transition-all transform hover:-translate-y-0.5 cursor-pointer"
                >
                  <FontAwesomeIcon icon={faWandMagicSparkles} className="text-white text-xs group-hover:rotate-12 transition-transform" />
                  <span>Explorer AI Analysis</span>
                  <span className="bg-white/25 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider ml-1">
                    NEW
                  </span>
                </Button>
                <span className="text-xs text-slate-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Instant curriculum & listed counter intelligence
                </span>
              </div>
            </div>

            {/* Mobile Sidebar Card - Simplified */}
            <div className="lg:hidden w-full mt-4">
              <img
                src={course.thumbnail_url || course.thumbnail || "/placeholder.svg"}
                alt={course.title}
                className="w-full aspect-video object-cover object-top rounded-2xl border border-white/20 mb-4 shadow-xl"
              />
              <div className="flex flex-col gap-3">
                {course.progress === 100 || course.is_completed ? (
                  <Button className="w-full rounded-xl h-12 bg-green-700 hover:bg-green-700 text-white font-bold cursor-default">
                    Completed
                  </Button>
                ) : course.is_enrolled ? (
                  <Button className="w-full rounded-xl h-12 bg-green-600 hover:bg-green-600 text-white font-bold cursor-default">
                    Enrolled
                  </Button>
                ) : (
                  <Button onClick={handleEnrollNow} className="w-full rounded-xl h-12 bg-[#00aeef] hover:bg-[#009ad1] text-white font-bold shadow-lg shadow-[#00aeef]/30">
                    Enroll Now
                  </Button>
                )}

                <Button
                  variant="outline"
                  onClick={() => setIsAiSummaryModalOpen(true)}
                  className="w-full rounded-xl bg-gradient-to-r from-sky-50 via-indigo-50/60 to-purple-50/50 hover:from-sky-100 hover:to-indigo-100 border border-sky-300 text-[#00aeef] font-bold text-xs h-11 flex items-center justify-center gap-2"
                >
                  <FontAwesomeIcon icon={faWandMagicSparkles} className="text-[#00aeef] text-xs" />
                  <span>Explorer AI Analysis</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* Main Content Area */}

      <section className="py-8 bg-white">

        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">

          <div className="flex flex-col lg:grid lg:grid-cols-3 gap-8 lg:gap-12">

            <div className="lg:col-span-2 space-y-6 lg:space-y-8">

              {/* Udemy Styled Tabs - Sticky or Flat */}

              <div className="border-b border-gray-200">

                <div className="flex overflow-x-auto space-x-6 md:space-x-8 no-scrollbar pb-1">

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
                    onSwitchToQuizzes={() => setActiveTab('quizzes')}

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

              <div className="-mt-[320px] xl:-mt-[360px] sticky top-24">

                <CourseSidebarCard

                  thumbnailUrl={

                    course.thumbnail_url || course.thumbnail || "/placeholder.svg"

                  }

                  title={course.title}

                  isEnrolled={course.is_enrolled}

                  isCompleted={course.progress === 100 || course.is_completed}

                  totalLessons={totalLessons}

                  modulesCount={course.contents?.length || 0}

                  duration={course.duration}

                  onEnrollClick={handleEnrollNow}

                  onWishlistClick={handleAddToWishlist}

                  onShareClick={handleShareClick}

                  onAiSummaryClick={() => setIsAiSummaryModalOpen(true)}

                  hasSampleVideos={totalLessons > 0}

                  courseId={course.id}

                />

              </div>

            </div>

          </div>



          {/* Similar Courses Section - Rendered full width inside container */}

          <div className="pt-8 lg:pt-12 border-t border-gray-200 mt-10 lg:mt-16 w-full overflow-hidden">

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

      {/* AI Course Summary Window */}
      {course && (
        <CourseAiSummaryModal
          isOpen={isAiSummaryModalOpen}
          onClose={() => setIsAiSummaryModalOpen(false)}
          courseId={course.id}
          courseTitle={course.title}
          isEnrolled={course.is_enrolled}
        />
      )}

      <Footer />

    </div>

  );

};



export default CourseDetail;

