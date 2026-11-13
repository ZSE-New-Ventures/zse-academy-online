import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Home from "./pages/Home";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import VerifyOtp from "./pages/VerifyOtp";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminLogin from "./pages/admin/AdminLogin";
import ManageCourseContent from "./pages/admin/ManageCourseContent";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import NotFound from "./pages/NotFound";
import ResetPassword from "./ResetPassword";
import ForgotPassword from "./ForgotPassword";
import Tutorials from "./pages/Tutorials";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Events from "./pages/Events";
import EventDetail from "./pages/EventDetail";
import FAQ from "./pages/FAQ";
import VerifyCertificate from "./pages/VerifyCertificate";
import LearningJourney from "./pages/LearningJourney";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/courses/:id" element={<CourseDetail />} />
            <Route path="/courses/:id/learn" element={<CourseDetail />} />
            <Route path="/courses/:id/learn/module/:moduleId" element={<CourseDetail />} />
            <Route path="/courses/:id/learn/:moduleId" element={<CourseDetail />} />
            <Route path="/courses/:id/modules/:moduleId" element={<CourseDetail />} />
            <Route path="/course/:id" element={<CourseDetail />} />
            <Route path="/course/:id/learn" element={<CourseDetail />} />
            <Route path="/course/:id/learn/module/:moduleId" element={<CourseDetail />} />
            <Route path="/course/:id/modules/:moduleId" element={<CourseDetail />} />
            <Route path="/learn/:id" element={<CourseDetail />} />
            
            {/* Quiz & Examination Direct Routes */}
            <Route path="/quiz/:id" element={<CourseDetail />} />
            <Route path="/quizzes/:id" element={<CourseDetail />} />
            <Route path="/exam/:id" element={<CourseDetail />} />
            <Route path="/exams/:id" element={<CourseDetail />} />
            <Route path="/take-quiz/:id" element={<CourseDetail />} />

            <Route path="/learning-journey" element={<LearningJourney />} />
            <Route path="/journey" element={<LearningJourney />} />
            <Route path="/getting-started" element={<LearningJourney />} />

            <Route path="/about" element={<Navigate to="/" replace />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blogs" element={<Blog />} />
            <Route path="/blog/:id" element={<BlogPost />} />
            
            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signin" element={<Login />} />
            <Route path="/sign-in" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/sign-up" element={<Signup />} />
            <Route path="/register" element={<Signup />} />
            <Route path="/student-registration" element={<Signup />} />
            <Route path="/instructor-registration" element={<Signup />} />
            <Route path="/verify-otp" element={<VerifyOtp />} />
            <Route path="/verify/:certificateNumber" element={<VerifyCertificate />} />
            <Route path="/verify" element={<VerifyCertificate />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Dashboard & Profile Routes */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/*" element={<Dashboard />} />
            <Route path="/my-courses" element={<Dashboard />} />
            <Route path="/my-learning" element={<Dashboard />} />
            <Route path="/profile" element={<Dashboard />} />
            <Route path="/my-profile" element={<Dashboard />} />
            <Route path="/my-account" element={<Dashboard />} />

            <Route path="/tutorials" element={<Tutorials />} />
            <Route path="/events" element={<Events />} />
            <Route path="/events/:id" element={<EventDetail />} />
            <Route path="/event/:id" element={<EventDetail />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/faqs" element={<FAQ />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />

            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/*" element={<AdminDashboard />} />
            <Route path="/admin/courses/:courseId/content" element={<ManageCourseContent />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
