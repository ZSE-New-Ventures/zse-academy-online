import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmark,
  faChevronRight,
  faForward,
  faBackward,
  faCheck,
  faExpand,
  faCompress,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { YouTubePlayer } from "./YouTubePlayer";

interface Slide {
  id: number;
  title: string;
  type: string;
  url: string;
  file_path: string | null;
  position: number;
  is_locked?: boolean;
}

interface CourseContentModalProps {
  content: {
    title: string;
    type: string;
    url: string;
    youtubeId?: string;
    currentSlideIndex: number;
    totalSlides: number;
    contentId: number;
    slides: Slide[];
    courseId: number; // course.course_id
    moduleId: number; // module.id
  };
  onClose: () => void;
  onNavigateSlide: (index: number) => void;
  onFinish: () => void;
}

interface CourseProgressResponse {
  course_progress: {
    id: number;
    user_id: number;
    course_id: number;
    completed_modules: number; // count of completed modules
    total_modules: number;
    progress: number;
    created_at: string;
    updated_at: string;
    completed_module_ids: number[]; // array of completed module IDs
  };
}

export const CourseContentModal = ({
  content,
  onClose,
  onNavigateSlide,
  onFinish,
}: CourseContentModalProps) => {
  const [slideDirection, setSlideDirection] = useState<"left" | "right">("right");
  const [loadingFinish, setLoadingFinish] = useState(false);
  const [isModuleCompleted, setIsModuleCompleted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const token = localStorage.getItem("zse_training_token");

  const isFirstSlide = content.currentSlideIndex === 0;
  const isLastSlide = content.currentSlideIndex === content.totalSlides - 1;

  useEffect(() => {
    if (token) {
      loadModuleProgress();
    }
  }, [content.moduleId, content.courseId]);

  // Fetch user progress and check if module is already completed
  const loadModuleProgress = async () => {
    try {
      const res = await axios.get<CourseProgressResponse>(
        `http://127.0.0.1:8000/api/courses/${content.courseId}/progress`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const completedModuleIds: number[] = res.data.course_progress.completed_module_ids || [];
      setIsModuleCompleted(completedModuleIds.includes(content.moduleId));
    } catch (error) {
      console.error("Failed to load module progress:", error);
    }
  };

  const handleNavigate = (newIndex: number) => {
    const targetSlide = content.slides[newIndex];
    if (targetSlide?.is_locked) {
      alert("This slide is locked. Please log in or enroll to unlock premium lessons.");
      return;
    }
    setSlideDirection(newIndex > content.currentSlideIndex ? "right" : "left");
    setTimeout(() => onNavigateSlide(newIndex), 50);
  };

  // Finish Module
  const handleFinishModule = async () => {
    try {
      if (!token) return alert("No auth token found.");
      setLoadingFinish(true);

      await axios.post(
        `http://127.0.0.1:8000/api/courses/${content.courseId}/modules/${content.moduleId}/finish`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      setIsModuleCompleted(true); // update state
      setLoadingFinish(false);
      onFinish();
    } catch (error) {
      console.error("Finish module error:", error);
      setLoadingFinish(false);
      alert("Failed to complete module");
    }
  };

  const getPowerPointEmbedUrl = (url: string): string => {
    if (url.includes("drive.google.com")) {
      const fileId = url.match(/\/d\/([^\/]+)/)?.[1];
      if (fileId) return `https://drive.google.com/file/d/${fileId}/preview`;
    }
    return `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`;
  };

  const slideAnimationClass =
    slideDirection === "right" ? "animate-slide-in-right" : "animate-slide-in-left";

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 ${isFullscreen ? 'p-0' : 'p-4'}`}>
      <div className={`bg-background relative flex flex-col overflow-hidden transition-all duration-300 ${isFullscreen ? 'w-full h-full rounded-none' : 'w-full max-w-6xl aspect-video rounded-lg'}`}>
        {/* HEADER */}
        <div className="flex justify-between items-center p-4 border-b bg-background">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-muted"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              <FontAwesomeIcon icon={isFullscreen ? faCompress : faExpand} className="h-5 w-5" />
            </button>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-muted"
              title="Close"
            >
              <FontAwesomeIcon icon={faXmark} className="h-5 w-5" />
            </button>

            <div>
              <h3 className="font-semibold text-lg">{content.title}</h3>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Badge variant="outline" className="text-xs capitalize">
                  {content.type}
                </Badge>
                <span>Module Content</span>
              </div>
            </div>
          </div>

          <select
            value={content.currentSlideIndex}
            onChange={(e) => handleNavigate(parseInt(e.target.value))}
            className="text-sm border rounded px-2 py-1 bg-background"
          >
            {content.slides.map((slide, index) => (
              <option key={index} value={index} disabled={slide.is_locked}>
                Slide {index + 1}: {slide.title} {slide.is_locked ? "🔒" : ""}
              </option>
            ))}
          </select>
        </div>

        {/* MAIN CONTENT */}
        <div className="flex-1 relative bg-muted min-h-0">
          <div className={`w-full h-full ${slideAnimationClass} flex items-center justify-center`}>
            {content.type === "video" ? (
              <video
                className="w-full h-full bg-black object-contain"
                controls
                controlsList="nodownload"
                autoPlay
                muted
                key={content.url}
              >
                <source src={content.url} type="video/mp4" />
                Your browser does not support videos.
              </video>
            ) : content.type === "ppt" || content.type === "powerpoint" || content.type === "pdf" ? (
              <iframe
                src={getPowerPointEmbedUrl(content.url)}
                className="w-full h-full"
                title={content.title}
              />
            ) : null}
          </div>
        </div>

        {/* FOOTER */}
        <div className="bg-background border-t p-4 space-y-4">
          <div className="flex items-center justify-between space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleNavigate(content.currentSlideIndex - 1)}
              disabled={isFirstSlide}
              className="h-8"
            >
              <FontAwesomeIcon icon={faBackward} className="h-3 w-3 mr-1" />
              Previous
            </Button>

            <span className="text-sm text-muted-foreground">
              {content.currentSlideIndex + 1} / {content.totalSlides}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleNavigate(content.currentSlideIndex + 1)}
              disabled={isLastSlide}
              className="h-8 w-8 p-0"
            >
              <FontAwesomeIcon icon={faChevronRight} className="h-3 w-3" />
            </Button>

            {isModuleCompleted ? (
              <Button
                size="sm"
                className="h-8 bg-gray-500 cursor-not-allowed"
                disabled
              >
                <FontAwesomeIcon icon={faCheck} className="h-3 w-3 mr-1" />
                Completed
              </Button>
            ) : isLastSlide ? (
              <Button
                onClick={handleFinishModule}
                size="sm"
                disabled={loadingFinish}
                className="h-8 bg-green-600 hover:bg-green-700"
              >
                <FontAwesomeIcon icon={faCheck} className="h-3 w-3 mr-1" />
                {loadingFinish ? "Finishing..." : "Finish"}
              </Button>
            ) : (
              <Button
                onClick={() => handleNavigate(content.currentSlideIndex + 1)}
                size="sm"
                className="h-8"
              >
                <FontAwesomeIcon icon={faForward} className="h-3 w-3 mr-1" />
                Next
              </Button>
            )}
          </div>

          {/* Slide Indicators */}
          <div className="flex justify-center space-x-2">
            {content.slides.map((slide, index) => (
              <button
                key={index}
                onClick={() => handleNavigate(index)}
                disabled={slide.is_locked}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === content.currentSlideIndex
                    ? "bg-primary scale-125"
                    : slide.is_locked
                    ? "bg-amber-500 cursor-not-allowed opacity-50"
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
