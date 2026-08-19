import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faQuestionCircle, faList, faClock, faLock } from "@fortawesome/free-solid-svg-icons";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Quiz } from "@/services/quiz.service";

interface QuizCardProps {
  quiz: Quiz;
  onStartQuiz: (quiz: Quiz) => void;
}

export const QuizCard = ({ quiz, onStartQuiz }: QuizCardProps) => {
  // Log can_take_quiz for debugging
  console.log("Quiz ID:", quiz.id, "can_take_quiz:", quiz.can_take_quiz);

  const getQuizStatus = () => {
    if (quiz.can_take_quiz) {
      return {
        label: "Available",
        variant: "default" as const,
        disabled: false,
        icon: faQuestionCircle,
        badgeClass: "bg-green-100 text-green-800",
        buttonText: "Start Quiz"
      };
    } else {
      return {
        label: "Locked",
        variant: "secondary" as const,
        disabled: true,
        icon: faLock,
        badgeClass: "bg-gray-100 text-gray-800",
        buttonText: "Complete Prerequisites"
      };
    }
  };

  const status = getQuizStatus();

  return (
    <Card className={`hover:shadow-lg transition-shadow duration-300 ${
      !quiz.can_take_quiz ? "opacity-75" : ""
    }`}>
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row items-start justify-between mb-4 gap-3 sm:gap-0">
          <div className="flex items-start sm:items-center space-x-3 w-full">
            <div className={`p-3 rounded-lg shrink-0 ${
              quiz.can_take_quiz ? "bg-blue-100" : "bg-gray-100"
            }`}>
              <FontAwesomeIcon
                icon={status.icon}
                className={`h-5 w-5 sm:h-6 sm:w-6 ${
                  quiz.can_take_quiz ? "text-blue-600" : "text-gray-600"
                }`}
              />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-base sm:text-lg truncate">{quiz.title}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                {quiz.description}
              </p>
            </div>
          </div>
          
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <FontAwesomeIcon icon={faList} className="h-4 w-4 mr-1" />
              <span>{quiz.questions.length} Questions</span>
            </div>
            <div className="flex items-center">
              <FontAwesomeIcon icon={faClock} className="h-4 w-4 mr-1" />
              <span>{Math.ceil(quiz.questions.length * 1.5)} mins</span>
            </div>
          </div>
        </div>

        <Button 
          onClick={() => onStartQuiz(quiz)} 
          disabled={status.disabled}
          variant={status.variant}
          className="w-full"
        >
          {status.buttonText}
        </Button>

        {!quiz.can_take_quiz && (
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Complete previous lessons to unlock this quiz
          </p>
        )}
      </CardContent>
    </Card>
  );
};
