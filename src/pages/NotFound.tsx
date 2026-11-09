import { useLocation, Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);

    // Auto-redirect common legacy patterns
    const path = location.pathname.toLowerCase();
    if (path.startsWith("/take-quiz/") || path.startsWith("/quiz/") || path.startsWith("/quizzes/")) {
      const parts = path.split("/").filter(Boolean);
      const id = parts[parts.length - 1];
      if (id) {
        navigate(`/courses/${id}`, { replace: true });
      }
    } else if (path.startsWith("/course-category") || path.startsWith("/courses/category")) {
      navigate("/courses", { replace: true });
    } else if (path.startsWith("/dashboard/") || path === "/my-courses" || path === "/enrolled-courses") {
      navigate("/dashboard", { replace: true });
    }
  }, [location.pathname, navigate]);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gray-50 font-montserrat">
      <Navbar />
      <div className="flex-1 flex items-center justify-center py-16 px-4">
        <div className="text-center max-w-lg bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-gray-100">
          <div className="w-16 h-16 bg-blue-50 text-[#00aeef] rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-black">
            404
          </div>
          <h1 className="mb-2 text-3xl font-extrabold text-[#1c1d1f]">Oops! Page not found</h1>
          <p className="mb-4 text-sm text-gray-500">
            The page you are looking for at <code className="bg-gray-100 px-2 py-0.5 rounded text-xs text-red-600 font-mono">{location.pathname}</code> does not exist or has been relocated.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
            <Link
              to="/courses"
              className="w-full sm:w-auto inline-flex items-center justify-center bg-[#00aeef] hover:bg-cyan-600 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-colors shadow-sm"
            >
              Browse All Courses
            </Link>
            <Link
              to="/"
              className="w-full sm:w-auto inline-flex items-center justify-center border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold text-sm px-6 py-3 rounded-xl transition-colors"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default NotFound;
