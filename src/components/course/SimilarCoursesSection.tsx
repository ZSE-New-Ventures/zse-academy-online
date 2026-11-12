import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Course } from "@/services/course.service";

interface SimilarCoursesSectionProps {
  courses: Course[];
}

export const SimilarCoursesSection = ({ courses }: SimilarCoursesSectionProps) => {
  if (!courses || courses.length === 0) {
    return null;
  }

  // Limit/slice the similar courses to exactly 4 items
  const displayedCourses = courses.slice(0, 4);

  return (
    <section className="mt-12 pb-12">
      <h2 className="text-2xl font-bold mb-6 text-left text-gray-900">Similar Courses</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {displayedCourses.map((course) => (
          <Link key={course.id} to={`/courses/${course.id}`} className="group flex">
            <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-150 rounded-none bg-white hover:-translate-y-1 flex flex-col w-full">
              <div className="aspect-video relative overflow-hidden">
                <img
                  src={course.presigned_url || course.thumbnail_url || course.thumbnail || "/placeholder.svg"}
                  alt={course.title}
                  className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-4 flex flex-col flex-1 justify-between">
                <div className="mb-4">
                  <h3 className="font-bold text-base mb-2 line-clamp-2 text-gray-900 group-hover:text-[#00aeef] transition-colors" title={course.title}>
                    {course.title}
                  </h3>
                  <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                    {course.description}
                  </p>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-auto">
                  <span className="text-xs font-bold text-[#00aeef]">
                    Free Course
                  </span>
                  <span className="text-[10px] font-bold text-gray-400 bg-gray-50 border border-gray-200 px-2 py-0.5 uppercase tracking-wider">
                    {course.level}
                  </span>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
};
