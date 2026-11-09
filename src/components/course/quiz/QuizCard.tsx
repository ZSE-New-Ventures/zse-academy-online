import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faQuestionCircle, faList, faClock, faPlay } from "@fortawesome/free-solid-svg-icons";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Quiz } from "@/services/quiz.service";

interface QuizCardProps {
  quiz: Quiz;
  onStartQuiz: (quiz: Quiz) => void;
}

export const QuizCard = ({ quiz, onStartQuiz }: QuizCardProps) => {
  const isExam = (quiz.questions?.length || 0) >= 25;
  const buttonText = isExam ? "Start Examination" : "Start Quiz";
  const durationMins = Math.max(5, Math.ceil((quiz.questions?.length || 5) * 1.5));

  return (
    <Card className="hover:shadow-lg transition-all duration-300 border border-gray-100 bg-white">
      <CardContent className="p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start justify-between mb-4 gap-3 sm:gap-4">
          <div className="flex items-start space-x-3 w-full">
            <div className="p-3 rounded-xl shrink-0 bg-blue-50 text-[#00aeef]">
              <FontAwesomeIcon icon={faQuestionCircle} className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className="font-bold text-base sm:text-lg text-gray-900 leading-snug">
                  {quiz.title}
                </h3>
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-0 text-xs">
                  Available
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 line-clamp-2">
                {quiz.description || "Test your knowledge and understanding of this course section."}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500 mb-5 pb-3 border-b border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <FontAwesomeIcon icon={faList} className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
              <span>{quiz.questions?.length || 0} Questions</span>
            </div>
            <div className="flex items-center">
              <FontAwesomeIcon icon={faClock} className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
              <span>{durationMins} mins</span>
            </div>
          </div>
          <span className="text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded">
            70% to Pass
          </span>
        </div>

        <Button 
          onClick={() => onStartQuiz(quiz)} 
          className="w-full bg-[#00aeef] hover:bg-cyan-600 text-white font-semibold h-11 text-sm shadow-sm transition-all"
        >
          <FontAwesomeIcon icon={faPlay} className="h-3.5 w-3.5 mr-2" />
          {buttonText}
        </Button>
      </CardContent>
    </Card>
  );
};
