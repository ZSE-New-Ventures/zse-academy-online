import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { LearningPathways } from "@/components/LearningPathways";
import { PopularTopics } from "@/components/PopularTopics";
import { TrainingDepartments } from "@/components/TrainingDepartments";
import { BlogPreview } from "@/components/BlogPreview";
import { StudentTestimonials } from "@/components/StudentTestimonials";
import { CtaBanner } from "@/components/CtaBanner";
import { Footer } from "@/components/Footer";

const Home = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <HeroSection />
      <LearningPathways />
      <PopularTopics />
      <TrainingDepartments />
      <BlogPreview />
      <StudentTestimonials />
      <CtaBanner />
      <Footer />
    </div>
  );
};

export default Home;
