import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faUsers, faFileAlt, faEnvelope, faPhone } from "@fortawesome/free-solid-svg-icons";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface CourseInstructorTabProps {
  instructor?: {
    id: number;
    name: string;
    email?: string;
    phone?: string;
    bio?: string;
    profile_photo_url?: string;
    profile_picture_url?: string;
    avatar?: string;
    image?: string;
  };
}

export const CourseInstructorTab = ({ instructor }: CourseInstructorTabProps) => {
  const getInstructorImage = () => {
    if (!instructor) return "/placeholder.svg";
    return instructor.profile_photo_url || instructor.profile_picture_url || instructor.avatar || instructor.image || "/placeholder.svg";
  };

  return (
    <Card className="rounded-none border border-gray-200 bg-white">
      <CardContent className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-start gap-6">
          <Avatar className="h-20 w-20 rounded-full border border-gray-100 shrink-0">
            <AvatarImage src={getInstructorImage()} alt={instructor?.name || "Instructor"} />
            <AvatarFallback className="bg-gray-100 text-gray-800 font-bold text-xl uppercase">
              {instructor?.name
                ?.split(" ")
                ?.map((n) => n[0])
                ?.join("") || "IN"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-4">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{instructor?.name || "Course Instructor"}</h3>
              <p className="text-sm font-semibold text-[#00aeef] mt-1">ZSE Course Expert</p>
            </div>



            {/* Bio Content */}
            <div className="text-sm text-gray-600 leading-relaxed pt-2 border-t border-gray-100">
              {instructor?.bio ? (
                <p className="whitespace-pre-wrap">{instructor.bio}</p>
              ) : (
                <p>
                  Experienced financial market professional with deep expertise on the Zimbabwe Stock Exchange.
                  Passionate about helping students unlock practical wealth creation, trading models, and financial literacy.
                </p>
              )}
            </div>

            {/* Professional Contacts */}
            {(instructor?.email || instructor?.phone) && (
              <div className="flex flex-wrap gap-4 text-xs font-semibold text-gray-500 pt-3">
                {instructor.email && (
                  <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-3 py-1 rounded-sm">
                    <FontAwesomeIcon icon={faEnvelope} className="h-3 w-3 text-gray-400" />
                    <span>{instructor.email}</span>
                  </div>
                )}
                {instructor.phone && (
                  <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-3 py-1 rounded-sm">
                    <FontAwesomeIcon icon={faPhone} className="h-3 w-3 text-gray-400" />
                    <span>{instructor.phone}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
