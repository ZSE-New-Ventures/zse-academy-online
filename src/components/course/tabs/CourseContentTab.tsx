import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faPlayCircle, faFileAlt, faLock } from "@fortawesome/free-solid-svg-icons";

interface Slide {
  id: number;
  title: string;
  type: string;
  url: string;
  file_path: string | null;
  position: number;
  is_locked?: boolean;
}

interface Content {
  id: number;
  title: string;
  description: string;
  slides: Slide[];
}

interface CourseContentTabProps {
  contents: Content[];
  totalLessons: number;
  onContentClick: (content: Content, slide: Slide, slideIndex: number) => void;
  isEnrolled?: boolean;
}

export const CourseContentTab = ({
  contents,
  totalLessons,
  onContentClick,
  isEnrolled,
}: CourseContentTabProps) => {
  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-2 mb-4">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900">Course content</h2>
        <div className="text-sm text-gray-600">
          {contents?.length || 0} sections • {totalLessons} lectures
        </div>
      </div>

      <div className="border border-gray-200">
        {contents?.map((content, contentIndex) => (
          <div key={content.id} className="border-b last:border-b-0 border-gray-200">
            {/* Section Header */}
            <div className="bg-[#f7f9fa] p-3 md:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 border-b border-gray-200 last:border-b-0">
              <div className="flex items-center gap-3 w-full">
                <FontAwesomeIcon icon={faChevronDown} className="h-3 w-3 text-gray-900 shrink-0" />
                <span className="font-bold text-gray-900 text-sm md:text-base text-left">
                  Section {contentIndex + 1}: {content.title}
                </span>
              </div>
              <div className="text-sm text-gray-600 sm:shrink-0 ml-6 sm:ml-0 text-left">
                {content.slides?.length || 0} lectures
              </div>
            </div>

            {/* Lecture list */}
            <div className="bg-white">
              {content.slides?.map((slide, slideIndex) => {
                const isLocked = slide.is_locked && !isEnrolled;
                return (
                  <button
                    key={slide.id}
                    onClick={() => onContentClick(content, slide, slideIndex)}
                    className="w-full flex items-start sm:items-center justify-between px-3 md:px-6 py-3 md:py-4 hover:bg-[#f7f9fa] transition-colors group border-b last:border-b-0 border-gray-100 gap-2"
                  >
                    <div className="flex items-start sm:items-center gap-3 md:gap-4 flex-1 pr-4">
                      <FontAwesomeIcon
                        icon={isLocked ? faLock : (slide.type === "video" ? faPlayCircle : faFileAlt)}
                        className={`h-3.5 w-3.5 mt-1 sm:mt-0 shrink-0 ${isLocked ? "text-amber-500" : (slide.type === "video" ? "text-gray-900" : "text-gray-500")}`}
                      />
                      <div className="flex flex-col text-left">
                        <span className="text-sm text-gray-700 group-hover:underline line-clamp-2 md:line-clamp-none">{slide.title}</span>
                        <span className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">{slide.type}</span>
                      </div>
                    </div>
                    {isLocked ? (
                      <div className="flex items-center gap-1.5 text-amber-600 font-bold text-xs bg-amber-50 px-2 py-1 rounded border border-amber-200 shrink-0 mt-0.5 sm:mt-0">
                        🔒 Locked
                      </div>
                    ) : (
                      slide.type === "video" && (
                        <div className="text-xs text-[#00aeef] font-bold group-hover:underline shrink-0 mt-0.5 sm:mt-0">Preview</div>
                      )
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
