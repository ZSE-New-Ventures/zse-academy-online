import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmark,
  faClock,
  faArrowLeft,
  faArrowRight,
  faTrophy,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Quiz, quizService } from "@/services/quiz.service";

interface QuizState {
  currentQuiz: Quiz | null;
  currentQuestionIndex: number;
  selectedOption: string | null;
  userAnswers: { [questionId: number]: string };
  showResults: boolean;
  score: number;
  totalQuestions: number;
  timeRemaining: number;
  isSubmitting: boolean;
  isDisqualified: boolean; // NEW
}

interface QuizModalProps {
  quiz: Quiz;
  onClose: () => void;
  onQuizComplete: (score: number, total: number) => void;
}

export const QuizModal = ({ quiz, onClose, onQuizComplete }: QuizModalProps) => {
  const [quizState, setQuizState] = useState<QuizState>({
    currentQuiz: quiz,
    currentQuestionIndex: 0,
    selectedOption: null,
    userAnswers: {},
    showResults: false,
    score: 0,
    totalQuestions: quiz.questions.length,
    timeRemaining: quiz.questions.length * 90,
    isSubmitting: false,
    isDisqualified: false, // NEW
  });

  // TIMER — Auto Disqualify When Time Hits 0
  useEffect(() => {
    if (quizState.showResults || quizState.isDisqualified) return;

    const timer = setInterval(() => {
      setQuizState((prev) => {
        if (prev.timeRemaining <= 1) {
          return {
            ...prev,
            timeRemaining: 0,
            isDisqualified: true, // AUTO DISQUALIFY
          };
        }
        return { ...prev, timeRemaining: prev.timeRemaining - 1 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quizState.showResults, quizState.isDisqualified]);

  useEffect(() => {
    // Preload dotlottie script
    if (!document.querySelector('script[src="https://unpkg.com/@lottiefiles/dotlottie-wc@0.9.14/dist/dotlottie-wc.js"]')) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/@lottiefiles/dotlottie-wc@0.9.14/dist/dotlottie-wc.js';
      script.type = 'module';
      document.head.appendChild(script);
    }
    
    // Preload Perfect Score Lottie
    if (!document.querySelector('link[href="https://lottie.host/d8921b0b-a3eb-4607-a37e-087c73f6ea09/0dyt8eosVo.lottie"]')) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = 'https://lottie.host/d8921b0b-a3eb-4607-a37e-087c73f6ea09/0dyt8eosVo.lottie';
      link.as = 'fetch';
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    }

    // Preload Fail Confetti Lottie
    if (!document.querySelector('link[href="https://lottie.host/ad3b48d5-a5a4-4296-ba36-c5383ccf7340/mbQYnkJRDF.lottie"]')) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = 'https://lottie.host/ad3b48d5-a5a4-4296-ba36-c5383ccf7340/mbQYnkJRDF.lottie';
      link.as = 'fetch';
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    }
  }, []);

  const currentQuestion = quiz.questions[quizState.currentQuestionIndex];
  const currentOptions = Array.isArray(currentQuestion.options)
    ? currentQuestion.options
    : [];

  const handleOptionSelect = (option: string) => {
    setQuizState((prev) => ({
      ...prev,
      selectedOption: option,
      userAnswers: {
        ...prev.userAnswers,
        [currentQuestion.id]: option,
      },
    }));
  };

  const handleNextQuestion = () => {
    if (quizState.currentQuestionIndex < quiz.questions.length - 1) {
      const nextIndex = quizState.currentQuestionIndex + 1;
      const nextQuestion = quiz.questions[nextIndex];

      setQuizState((prev) => ({
        ...prev,
        currentQuestionIndex: nextIndex,
        selectedOption: prev.userAnswers[nextQuestion.id] || null,
      }));
    }
  };

  const handlePreviousQuestion = () => {
    if (quizState.currentQuestionIndex > 0) {
      const prevIndex = quizState.currentQuestionIndex - 1;
      const prevQuestion = quiz.questions[prevIndex];

      setQuizState((prev) => ({
        ...prev,
        currentQuestionIndex: prevIndex,
        selectedOption: prev.userAnswers[prevQuestion.id] || null,
      }));
    }
  };

  const handleSubmitQuiz = async () => {
    setQuizState((prev) => ({ ...prev, isSubmitting: true }));

    try {
      const result = await quizService.submitQuiz(quiz.id, quizState.userAnswers);

      const score = result.score || 0;
      const totalQuestions = result.total_questions || quiz.questions.length;

      setQuizState((prev) => ({
        ...prev,
        showResults: true,
        score: score,
        totalQuestions: totalQuestions,
        isSubmitting: false,
      }));

      onQuizComplete(score, totalQuestions);
    } catch (error) {
      console.error("Error submitting quiz:", error);
      setQuizState((prev) => ({ ...prev, isSubmitting: false }));
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // -----------------------
  //  DISQUALIFIED SCREEN
  // -----------------------
  if (quizState.isDisqualified) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-background rounded-lg max-w-md w-full p-6 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
            <FontAwesomeIcon icon={faTimesCircle} className="text-red-600 h-8 w-8" />
          </div>

          <h2 className="text-2xl font-bold mt-4 text-red-600">Time is Up!</h2>

          <p className="text-muted-foreground mt-3 mb-6">
            You have been <strong>disqualified</strong> because the quiz time expired.
          </p>

          <Button className="w-full" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    );
  }

  // -----------------------
  //  RESULTS SCREEN
  // -----------------------
  if (quizState.showResults) {
    const totalQuestions = quizState.totalQuestions;
    const correctAnswers = quizState.score;
    const percentage =
      totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
    const passed = percentage >= 70;
    const perfectScore = percentage >= 99.9;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-background rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
          <div className="text-center">
            {perfectScore ? (
               <div className="mb-6 bg-gradient-to-br from-[#00aeef]/10 to-blue-50 rounded-2xl p-4 border border-[#00aeef]/20 shadow-sm">
                 <div dangerouslySetInnerHTML={{ __html: '<dotlottie-wc src="https://lottie.host/d8921b0b-a3eb-4607-a37e-087c73f6ea09/0dyt8eosVo.lottie" style="width: 250px; height: 250px; margin: 0 auto;" autoplay loop></dotlottie-wc>' }} />
                 <h2 className="text-3xl font-bold mt-2 text-[#0f1729]">Perfect Score!</h2>
                 <p className="text-[#00aeef] mt-1 font-bold">Outstanding! You mastered this topic!</p>
               </div>
            ) : !passed ? (
               <div className="mb-6 bg-gradient-to-br from-red-50 to-red-100/50 rounded-2xl p-4 border border-red-100 shadow-sm">
                 <div dangerouslySetInnerHTML={{ __html: '<dotlottie-wc src="https://lottie.host/ad3b48d5-a5a4-4296-ba36-c5383ccf7340/mbQYnkJRDF.lottie" style="width: 200px; height: 200px; margin: 0 auto;" autoplay loop></dotlottie-wc>' }} />
                 <h2 className="text-2xl font-bold mt-2 text-red-600">Quiz Failed</h2>
                 <p className="text-red-500 mt-1 font-medium">Don't give up! Try again.</p>
               </div>
            ) : (
               <>
                <div
                  className="mx-auto w-16 h-16 rounded-full flex items-center justify-center bg-green-100"
                >
                  <FontAwesomeIcon
                    icon={faTrophy}
                    className="h-8 w-8 text-green-600"
                  />
                </div>

                <h2 className="text-2xl font-bold mt-4">
                  Quiz Passed!
                </h2>
               </>
            )}

            <div className="my-6">
              <div className="text-4xl font-bold mb-2">
                {correctAnswers}/{totalQuestions}
              </div>
              <div className="text-lg text-muted-foreground">
                {percentage.toFixed(1)}%
              </div>
              <Progress value={percentage} className="mt-2" />
            </div>

            <p className="text-muted-foreground mb-6">
              {perfectScore 
                ? "Flawless victory! You got every question right."
                : passed
                  ? "Congratulations! You have successfully completed the quiz."
                  : `You need at least 70% to pass. You got ${percentage.toFixed(
                      1
                    )}%. Try again!`}
            </p>

            <div className="space-y-3">
              <Button onClick={onClose} className="w-full">
                {passed ? "Continue Learning" : "Retry Quiz"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -----------------------
  //  QUIZ QUESTIONS SCREEN
  // -----------------------
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-background rounded-lg max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto overflow-x-hidden flex flex-col">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 sm:p-6 border-b gap-3 sm:gap-0 shrink-0">
          <div>
            <h2 className="text-xl font-bold">{quiz.title}</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Question {quizState.currentQuestionIndex + 1} of{" "}
              {quiz.questions.length}
            </p>
          </div>
          <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto space-x-2 sm:space-x-4">
            <div className="flex items-center bg-red-100 text-red-800 px-3 py-1 rounded-full">
              <FontAwesomeIcon icon={faClock} className="h-4 w-4 mr-2" />
              <span className="font-semibold">{formatTime(quizState.timeRemaining)}</span>
            </div>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <FontAwesomeIcon icon={faXmark} className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="px-4 sm:px-6 pt-4 shrink-0">
          <Progress
            value={((quizState.currentQuestionIndex + 1) / quiz.questions.length) * 100}
            className="h-1.5 sm:h-2"
          />
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          <h3 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6">{currentQuestion.question}</h3>

          <div className="space-y-2 sm:space-y-3">
            {currentOptions.map((option, index) => (
              <button
                key={index}
                onClick={() => handleOptionSelect(option)}
                className={`w-full text-left p-3 sm:p-4 rounded-lg border transition-all text-sm sm:text-base ${
                  quizState.selectedOption === option
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                    : "border-border hover:border-muted-foreground hover:bg-muted/50"
                }`}
              >
                <div className="flex items-center">
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 ${
                      quizState.selectedOption === option
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border"
                    }`}
                  >
                    {quizState.selectedOption === option && (
                      <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                    )}
                  </div>
                  <span>{option}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between p-4 sm:p-6 border-t shrink-0 gap-2 sm:gap-4">
          <Button
            variant="outline"
            onClick={handlePreviousQuestion}
            disabled={quizState.currentQuestionIndex === 0}
            className="px-2 sm:px-4 flex-1 sm:flex-none"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="text-xs sm:text-sm">Prev</span>
          </Button>

          {quizState.currentQuestionIndex === quiz.questions.length - 1 ? (
            <Button
              onClick={handleSubmitQuiz}
              disabled={!quizState.selectedOption || quizState.isSubmitting}
              className="px-2 sm:px-4 flex-1 sm:flex-none"
            >
              <span className="text-xs sm:text-sm">{quizState.isSubmitting ? "Submitting..." : "Submit"}</span>
            </Button>
          ) : (
            <Button 
              onClick={handleNextQuestion} 
              disabled={!quizState.selectedOption}
              className="px-2 sm:px-4 flex-1 sm:flex-none"
            >
              <span className="text-xs sm:text-sm">Next</span>
              <FontAwesomeIcon icon={faArrowRight} className="h-3 w-3 sm:h-4 sm:w-4 ml-1 sm:ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
