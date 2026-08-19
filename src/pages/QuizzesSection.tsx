import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faQuestionCircle,
  faClock,
  faListOl,
  faCheckCircle,
  faTimesCircle,
  faTrophy,
  faArrowRight,
  faArrowLeft,
  faXmark
} from "@fortawesome/free-solid-svg-icons";

// Types
interface QuizQuestion {
  id: number;
  quiz_id: number;
  question: string;
  options: string[];
  answer: string;
  created_at: string;
  updated_at: string;
}

interface Quiz {
  id: number;
  course_id: number;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
  questions: QuizQuestion[];
  course: {
    id: number;
    title: string;
    description: string;
  };
}

interface QuizSubmissionResponse {
  status: string;
  score: number;
  total_questions: number;
  correct_answers: number;
  passed: boolean;
}

interface QuizState {
  currentQuiz: Quiz | null;
  currentQuestionIndex: number;
  selectedOption: string | null;
  userAnswers: { [questionId: number]: string };
  showResults: boolean;
  score: number;
  timeRemaining: number;
  isSubmitting: boolean;
}

// Quiz Service
const quizService = {
  async getQuizzes(): Promise<{ status: string; quizzes: Quiz[] }> {
    const token = localStorage.getItem("zse_training_token");
    const response = await fetch('/api/quizzes', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch quizzes');
    }
    
    return response.json();
  },

  async submitQuiz(quizId: number, answers: { [questionId: number]: string }): Promise<QuizSubmissionResponse> {
    const token = localStorage.getItem("zse_training_token");
    const response = await fetch(`/api/quizzes/${quizId}/submit`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ answers }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to submit quiz');
    }
    
    return response.json();
  }
};

// Quiz Card Component
const QuizCard = ({ 
  quiz, 
  onStartQuiz 
}: { 
  quiz: Quiz; 
  onStartQuiz: (quiz: Quiz) => void; 
}) => {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FontAwesomeIcon icon={faQuestionCircle} className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{quiz.title}</h3>
              <p className="text-sm text-muted-foreground">{quiz.description}</p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            {quiz.questions.length} questions
          </Badge>
        </div>
        
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <FontAwesomeIcon icon={faListOl} className="h-4 w-4 mr-1" />
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
          className="w-full"
        >
          Start Quiz
        </Button>
      </CardContent>
    </Card>
  );
};

// Quiz Modal Component
const QuizModal = ({
  quiz,
  onClose,
  onQuizComplete
}: {
  quiz: Quiz;
  onClose: () => void;
  onQuizComplete: (score: number, total: number) => void;
}) => {
  const [quizState, setQuizState] = useState<QuizState>({
    currentQuiz: quiz,
    currentQuestionIndex: 0,
    selectedOption: null,
    userAnswers: {},
    showResults: false,
    score: 0,
    timeRemaining: quiz.questions.length * 90, // 1.5 minutes per question
    isSubmitting: false
  });

  const currentQuestion = quiz.questions[quizState.currentQuestionIndex];

  useEffect(() => {
    if (quizState.showResults || quizState.timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setQuizState(prev => ({
        ...prev,
        timeRemaining: prev.timeRemaining - 1
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, [quizState.showResults, quizState.timeRemaining]);

  useEffect(() => {
    if (quizState.timeRemaining <= 0 && !quizState.showResults) {
      handleSubmitQuiz();
    }
  }, [quizState.timeRemaining]);

  useEffect(() => {
    if (quizState.showResults) {
      const percentage = (quizState.score / quiz.questions.length) * 100;
      if (percentage >= 99.9 && !document.querySelector('script[src="https://unpkg.com/@lottiefiles/dotlottie-wc@0.9.14/dist/dotlottie-wc.js"]')) {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/@lottiefiles/dotlottie-wc@0.9.14/dist/dotlottie-wc.js';
        script.type = 'module';
        document.head.appendChild(script);
      }
    }
  }, [quizState.showResults, quizState.score, quiz.questions.length]);

  const handleOptionSelect = (option: string) => {
    setQuizState(prev => ({
      ...prev,
      selectedOption: option,
      userAnswers: {
        ...prev.userAnswers,
        [currentQuestion.id]: option
      }
    }));
  };

  const handleNextQuestion = () => {
    if (quizState.currentQuestionIndex < quiz.questions.length - 1) {
      setQuizState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1,
        selectedOption: prev.userAnswers[quiz.questions[prev.currentQuestionIndex + 1].id] || null
      }));
    }
  };

  const handlePreviousQuestion = () => {
    if (quizState.currentQuestionIndex > 0) {
      setQuizState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex - 1,
        selectedOption: prev.userAnswers[quiz.questions[prev.currentQuestionIndex - 1].id] || null
      }));
    }
  };

  const handleSubmitQuiz = async () => {
    setQuizState(prev => ({ ...prev, isSubmitting: true }));
    
    try {
      const result = await quizService.submitQuiz(quiz.id, quizState.userAnswers);
      
      setQuizState(prev => ({
        ...prev,
        showResults: true,
        score: result.score,
        isSubmitting: false
      }));
      
      onQuizComplete(result.correct_answers, result.total_questions);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      setQuizState(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (quizState.showResults) {
    const percentage = (quizState.score / quiz.questions.length) * 100;
    const passed = percentage >= 70;
    const perfectScore = percentage >= 99.9;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
          <div className="text-center">
            {perfectScore ? (
               <div className="mb-6 bg-gradient-to-br from-[#00aeef]/10 to-blue-50 rounded-2xl p-4 border border-[#00aeef]/20 shadow-sm">
                 <div dangerouslySetInnerHTML={{ __html: '<dotlottie-wc src="https://lottie.host/d8921b0b-a3eb-4607-a37e-087c73f6ea09/0dyt8eosVo.lottie" style="width: 250px; height: 250px; margin: 0 auto;" autoplay loop></dotlottie-wc>' }} />
                 <h2 className="text-3xl font-bold mt-2 text-[#0f1729]">Perfect Score!</h2>
                 <p className="text-[#00aeef] mt-1 font-bold">Outstanding! You mastered this topic!</p>
               </div>
            ) : (
               <>
                <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${
                  passed ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  <FontAwesomeIcon 
                    icon={passed ? faTrophy : faTimesCircle} 
                    className={`h-8 w-8 ${passed ? 'text-green-600' : 'text-red-600'}`} 
                  />
                </div>
                
                <h2 className="text-2xl font-bold mt-4">
                  {passed ? 'Quiz Passed!' : 'Quiz Failed'}
                </h2>
               </>
            )}
            
            <div className="my-6">
              <div className="text-4xl font-bold mb-2">{quizState.score}/{quiz.questions.length}</div>
              <div className="text-lg text-muted-foreground">{percentage.toFixed(1)}%</div>
              <Progress value={percentage} className="mt-2" />
            </div>
            
            <p className="text-muted-foreground mb-6">
              {perfectScore 
                ? 'Flawless victory! You got every question right.'
                : passed 
                  ? 'Congratulations! You have successfully completed the quiz.'
                  : 'You need at least 70% to pass. Try again!'
              }
            </p>
            
            <div className="space-y-3">
              <Button onClick={onClose} className="w-full">
                {passed ? 'Continue Learning' : 'Retry Quiz'}
              </Button>
              {!passed && (
                <Button variant="outline" onClick={() => setQuizState(prev => ({
                  ...prev,
                  showResults: false,
                  currentQuestionIndex: 0,
                  selectedOption: null,
                  userAnswers: {},
                  timeRemaining: quiz.questions.length * 90
                }))}>
                  Review Questions
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-bold">{quiz.title}</h2>
            <p className="text-sm text-muted-foreground">
              Question {quizState.currentQuestionIndex + 1} of {quiz.questions.length}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center bg-red-100 text-red-800 px-3 py-1 rounded-full">
              <FontAwesomeIcon icon={faClock} className="h-4 w-4 mr-2" />
              <span className="font-semibold">{formatTime(quizState.timeRemaining)}</span>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <FontAwesomeIcon icon={faXmark} className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-6 pt-4">
          <Progress 
            value={((quizState.currentQuestionIndex + 1) / quiz.questions.length) * 100} 
            className="h-2"
          />
        </div>

        {/* Question */}
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-6">
            {currentQuestion.question}
          </h3>

          {/* Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleOptionSelect(option)}
                className={`w-full text-left p-4 rounded-lg border transition-all ${
                  quizState.selectedOption === option
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 ${
                    quizState.selectedOption === option
                      ? 'border-primary bg-primary text-white'
                      : 'border-gray-300'
                  }`}>
                    {quizState.selectedOption === option && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                  <span>{option}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between p-6 border-t">
          <Button
            variant="outline"
            onClick={handlePreviousQuestion}
            disabled={quizState.currentQuestionIndex === 0}
          >
            <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4 mr-2" />
            Previous
          </Button>

          {quizState.currentQuestionIndex === quiz.questions.length - 1 ? (
            <Button
              onClick={handleSubmitQuiz}
              disabled={!quizState.selectedOption || quizState.isSubmitting}
            >
              {quizState.isSubmitting ? 'Submitting...' : 'Submit Quiz'}
            </Button>
          ) : (
            <Button
              onClick={handleNextQuestion}
              disabled={!quizState.selectedOption}
            >
              Next
              <FontAwesomeIcon icon={faArrowRight} className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

// Main Quizzes Section Component
export const QuizzesSection = ({ courseId }: { courseId: string }) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setLoading(true);
        const response = await quizService.getQuizzes();
        if (response.status === 'success') {
          // Filter quizzes for the current course
          const courseQuizzes = response.quizzes.filter(
            quiz => quiz.course_id === parseInt(courseId)
          );
          setQuizzes(courseQuizzes);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch quizzes');
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, [courseId]);

  const handleQuizComplete = (score: number, total: number) => {
    console.log(`Quiz completed! Score: ${score}/${total}`);
    // You can add additional logic here like updating progress, etc.
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading quizzes...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-destructive">
            <p>Error loading quizzes: {error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (quizzes.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <FontAwesomeIcon icon={faQuestionCircle} className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No quizzes available for this course yet.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Course Quizzes</h2>
          <p className="text-muted-foreground">
            Test your knowledge with these interactive quizzes
          </p>
        </div>

        <div className="grid gap-6">
          {quizzes.map((quiz) => (
            <QuizCard
              key={quiz.id}
              quiz={quiz}
              onStartQuiz={setSelectedQuiz}
            />
          ))}
        </div>
      </div>

      {selectedQuiz && (
        <QuizModal
          quiz={selectedQuiz}
          onClose={() => setSelectedQuiz(null)}
          onQuizComplete={handleQuizComplete}
        />
      )}
    </>
  );
};
