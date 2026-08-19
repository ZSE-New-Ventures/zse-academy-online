import { useState, useEffect } from "react";
import { courseService } from "@/services/course.service";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faCertificate, faBookOpen } from "@fortawesome/free-solid-svg-icons";
import { useToast } from "@/hooks/use-toast";

// Skeleton Loader
const CourseSkeleton = () => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
          </div>
          <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </CardContent>
    </Card>
  );
};

const MyCourses = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      if (!user) return;

      try {
        const data = await courseService.getMyCourses();

        const formatted = data.map((course: any) => {
          const progress = course.progress ?? 0;

          let status: "completed" | "in-progress" | "not-started" = "not-started";
          let certificateReceived = false;

          if (progress === 100) {
            status = "completed";
            certificateReceived = true;
          } else if (progress > 0) {
            status = "in-progress";
          }

          return {
            id: course.id,
            title: course.title,
            progress,
            completedLessons: course.completed_modules,
            totalLessons: course.total_modules,
            category: course.category_name,
            level: course.level,
            status,
            certificateReceived,
          };
        });

        setCourses(formatted);
      } catch (error) {
        toast({
          title: "Error",
          description: "Unable to load your courses.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [user]);

  const getStatusBadge = (status: string, certificate: boolean) => {
    if (status === "completed")
      return (
        <div className="flex items-center gap-2">
          <Badge className="bg-green-100 text-green-800 text-xs">Completed</Badge>
          {certificate && (
            <FontAwesomeIcon icon={faCertificate} className="text-yellow-500 h-3 w-3" />
          )}
        </div>
      );

    if (status === "in-progress")
      return (
        <Badge className="bg-blue-100 text-blue-800 text-xs">In Progress</Badge>
      );

    return <Badge className="text-gray-500 text-xs" variant="outline">Not started</Badge>;
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => <CourseSkeleton key={i} />)}
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        You are not enrolled in any courses yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {courses.map((course) => (
        <Card key={course.id} className="hover:shadow-md transition-shadow border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-4">
              
              {/* Left Section - Course Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-base truncate">{course.title}</h3>
                  {getStatusBadge(course.status, course.certificateReceived)}
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <FontAwesomeIcon icon={faBookOpen} className="h-3 w-3" />
                    <span>{course.completedLessons ?? 0}/{course.totalLessons ?? 0} modules</span>
                  </div>
                  <span>•</span>
                  <span>{course.category}</span>
                  <span>•</span>
                  <span className="capitalize">{course.level}</span>
                </div>

                {/* Progress Bar */}
                <div className="flex items-center gap-3 mt-2">
                  <Progress value={course.progress} className="h-2 flex-1" />
                  <span className="text-sm font-medium min-w-12">{course.progress}%</span>
                </div>
              </div>

              {/* Right Section - Action Button */}
              <div className="flex-shrink-0">
                <Button
                  size="sm"
                  variant={course.status === "completed" ? "outline" : "default"}
                  className="min-w-24"
                  onClick={() => navigate(`/courses/${course.id}`)}
                >
                  <FontAwesomeIcon icon={faPlay} className="h-3 w-3 mr-2" />
                  {course.status === "completed" ? "Review" : "Continue"}
                </Button>
              </div>

            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MyCourses;
