import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmark,
  faClock,
  faArrowLeft,
  faArrowRight,
  faTrophy,
  faTimesCircle,
  faCheckCircle,
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
  isDisqualified: boolean;
}

interface QuizModalProps {
  quiz: Quiz;
  onClose: () => void;
  onQuizComplete: (score: number, total: number) => void;
}

export const QuizModal = ({ quiz, onClose, onQuizComplete }: QuizModalProps) => {
  const questionsCount = quiz.questions?.length || 0;

  const [quizState, setQuizState] = useState<QuizState>({
    currentQuiz: quiz,
    currentQuestionIndex: 0,
    selectedOption: null,
    userAnswers: {},
    showResults: false,
    score: 0,
    totalQuestions: questionsCount,
    timeRemaining: Math.max(120, questionsCount * 90),
    isSubmitting: false,
    isDisqualified: false,
  });

  const [hasRestoredDraft, setHasRestoredDraft] = useState(false);

  // Restore draft answers if available
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem(`zse_quiz_draft_${quiz.id}`);
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        if (parsed && typeof parsed === "object" && Object.keys(parsed).length > 0) {
          const firstUnansweredIndex = (quiz.questions || []).findIndex(
            (q) => !parsed[q.id]
          );
          const restoredIndex = firstUnansweredIndex >= 0 ? firstUnansweredIndex : 0;
          setQuizState((prev) => ({
            ...prev,
            userAnswers: parsed,
            currentQuestionIndex: restoredIndex,
            selectedOption:
              quiz.questions && quiz.questions[restoredIndex]
                ? parsed[quiz.questions[restoredIndex].id] || null
                : null,
          }));
          setHasRestoredDraft(true);
        }
      }
    } catch {
      // Ignore storage errors
    }
  }, [quiz.id]);

  // TIMER — Auto Disqualify When Time Hits 0
  useEffect(() => {
    if (quizState.showResults || quizState.isDisqualified) return;

    const timer = setInterval(() => {
      setQuizState((prev) => {
        if (prev.timeRemaining <= 1) {
          return {
            ...prev,
            timeRemaining: 0,
            isDisqualified: true,
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
  }, []);

  const currentQuestion = quiz.questions && quiz.questions.length > 0
    ? quiz.questions[quizState.currentQuestionIndex]
    : null;

  const getOptions = (question: { options?: string | string[]; answer?: string } | null): string[] => {
    if (!question) return [];
    let opts = question.options;
    if (typeof opts === "string") {
      try {
        opts = JSON.parse(opts);
      } catch {
        opts = [];
      }
    }
    if (Array.isArray(opts) && opts.length > 0) {
      return opts;
    }
    if (question.answer && (question.answer.toLowerCase() === "true" || question.answer.toLowerCase() === "false")) {
      return ["True", "False"];
    }
    return [];
  };

  const currentOptions = getOptions(currentQuestion);

  const handleOptionSelect = (option: string) => {
    if (!currentQuestion) return;
    const updatedAnswers = {
      ...quizState.userAnswers,
      [currentQuestion.id]: option,
    };

    try {
      localStorage.setItem(`zse_quiz_draft_${quiz.id}`, JSON.stringify(updatedAnswers));
    } catch {
      // Ignore storage errors
    }

    setQuizState((prev) => ({
      ...prev,
      selectedOption: option,
      userAnswers: updatedAnswers,
    }));
  };

  const handleNextQuestion = () => {
    if (quiz.questions && quizState.currentQuestionIndex < quiz.questions.length - 1) {
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
    if (quiz.questions && quizState.currentQuestionIndex > 0) {
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

      const score = result.score !== undefined ? result.score : 0;
      const totalQuestions = result.total_questions || quiz.questions?.length || 0;

      // Clear draft on submission
      try {
        localStorage.removeItem(`zse_quiz_draft_${quiz.id}`);
      } catch {
        // Ignore storage errors
      }

      setQuizState((prev) => ({
        ...prev,
        showResults: true,
        score: score,
        totalQuestions: totalQuestions,
        isSubmitting: false,
      }));

      onQuizComplete(score, totalQuestions);
    } catch (error) {
      console.warn("API submission error, calculating score client-side:", error);

      // Fallback: evaluate client-side so user always receives their result
      let calculatedScore = 0;
      if (quiz.questions) {
        quiz.questions.forEach((q) => {
          const userAns = quizState.userAnswers[q.id];
          if (userAns && q.answer && userAns.trim().toLowerCase() === q.answer.trim().toLowerCase()) {
            calculatedScore++;
          }
        });
      }

      const total = quiz.questions?.length || 0;

      try {
        localStorage.removeItem(`zse_quiz_draft_${quiz.id}`);
      } catch {
        // Ignore storage errors
      }

      setQuizState((prev) => ({
        ...prev,
        showResults: true,
        score: calculatedScore,
        totalQuestions: total,
        isSubmitting: false,
      }));

      onQuizComplete(calculatedScore, total);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-slate-50">
          <div>
            <h3 className="font-bold text-gray-900 text-lg leading-tight">{quiz.title}</h3>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs text-gray-500 font-medium">
                Question {quizState.currentQuestionIndex + 1} of {quizState.totalQuestions}
              </span>
              {hasRestoredDraft && !quizState.showResults && (
                <span className="text-[11px] text-green-700 font-medium flex items-center gap-1 bg-green-50 px-2 py-0.5 rounded border border-green-200">
                  <FontAwesomeIcon icon={faCheckCircle} className="h-2.5 w-2.5" />
                  Draft restored
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {!quizState.showResults && !quizState.isDisqualified && (
              <div
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                  quizState.timeRemaining < 60
                    ? "bg-red-50 text-red-600 animate-pulse border border-red-200"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                <FontAwesomeIcon icon={faClock} />
                <span>{formatTime(quizState.timeRemaining)}</span>
              </div>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors"
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        {!quizState.showResults && !quizState.isDisqualified && (
          <div className="w-full bg-gray-100 h-1.5">
            <div
              className="bg-[#00aeef] h-full transition-all duration-300"
              style={{
                width: `${((quizState.currentQuestionIndex + 1) / quizState.totalQuestions) * 100}%`,
              }}
            />
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {quizState.isDisqualified ? (
            <div className="text-center py-8">
              <FontAwesomeIcon icon={faTimesCircle} className="h-16 w-16 text-red-500 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Time Expired</h2>
              <p className="text-gray-600 mb-6">
                You ran out of time before submitting the exam. You can re-attempt when ready.
              </p>
              <Button onClick={onClose} className="bg-gray-800 hover:bg-gray-900 text-white">
                Close
              </Button>
            </div>
          ) : quizState.showResults ? (
            <div className="text-center py-8">
              <div className="w-20 h-20 mx-auto rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 mb-4">
                <FontAwesomeIcon icon={faTrophy} className="h-10 w-10" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Assessment Completed!</h2>
              <p className="text-gray-600 mb-6">Here is how you performed:</p>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 max-w-sm mx-auto mb-6">
                <div className="text-4xl font-extrabold text-[#003366] mb-1">
                  {quizState.score} / {quizState.totalQuestions}
                </div>
                <div className="text-sm font-semibold text-gray-500">
                  {Math.round((quizState.score / Math.max(1, quizState.totalQuestions)) * 100)}% Final Score
                </div>
              </div>

              <Button onClick={onClose} className="bg-[#00aeef] hover:bg-[#008cc0] text-white px-8">
                Done
              </Button>
            </div>
          ) : currentQuestion ? (
            <div>
              <div className="mb-6">
                <h4 className="text-lg font-bold text-gray-900 mb-2 leading-relaxed">
                  {currentQuestion.question_text || currentQuestion.title}
                </h4>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {currentOptions.map((opt, idx) => {
                  const isSelected = quizState.selectedOption === opt;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleOptionSelect(opt)}
                      className={`w-full text-left p-4 rounded-xl border text-sm font-medium transition-all duration-200 flex items-center gap-3 ${
                        isSelected
                          ? "border-[#00aeef] bg-cyan-50/50 text-[#003366] shadow-sm ring-1 ring-[#00aeef]"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700"
                      }`}
                    >
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          isSelected
                            ? "bg-[#00aeef] text-white"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No questions found for this quiz.
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        {!quizState.showResults && !quizState.isDisqualified && (
          <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-gray-100">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousQuestion}
              disabled={quizState.currentQuestionIndex === 0}
              className="text-xs"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="mr-1.5" />
              Previous
            </Button>

            {quizState.currentQuestionIndex < quizState.totalQuestions - 1 ? (
              <Button
                size="sm"
                onClick={handleNextQuestion}
                disabled={!quizState.selectedOption}
                className="text-xs bg-[#00aeef] hover:bg-[#008cc0] text-white"
              >
                Next
                <FontAwesomeIcon icon={faArrowRight} className="ml-1.5" />
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={handleSubmitQuiz}
                disabled={!quizState.selectedOption || quizState.isSubmitting}
                className="text-xs bg-green-600 hover:bg-green-700 text-white"
              >
                {quizState.isSubmitting ? "Submitting..." : "Submit Examination"}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
