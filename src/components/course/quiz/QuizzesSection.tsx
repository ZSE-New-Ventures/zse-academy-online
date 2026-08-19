import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Quiz, quizService } from "@/services/quiz.service";
import { QuizCard } from "./QuizCard";
import { QuizModal } from "./QuizModal";
import { Skeleton } from "@/components/ui/skeleton";

interface QuizzesSectionProps {
  courseId: string;
}

export const QuizzesSection = ({ courseId }: QuizzesSectionProps) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);

  useEffect(() => {
    loadQuizzes();
  }, [courseId]);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      const response = await quizService.getQuizzes();
      const courseQuizzes = response.quizzes.filter(
        (quiz) => quiz.course_id === parseInt(courseId)
      );
      setQuizzes(courseQuizzes);
    } catch (error) {
      console.error("Error loading quizzes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
  };

  const handleCloseQuiz = () => {
    setSelectedQuiz(null);
  };

  const handleQuizComplete = (score: number, total: number) => {
    console.log(`Quiz completed: ${score}/${total}`);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-8 w-48 mb-4" />
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (quizzes.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          No quizzes available for this course yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardContent className="p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Course Quizzes</h2>
          <div className="space-y-3 sm:space-y-4">
            {quizzes.map((quiz) => (
              <QuizCard key={quiz.id} quiz={quiz} onStartQuiz={handleStartQuiz} />
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedQuiz && (
        <QuizModal
          quiz={selectedQuiz}
          onClose={handleCloseQuiz}
          onQuizComplete={handleQuizComplete}
        />
      )}
    </>
  );
};
