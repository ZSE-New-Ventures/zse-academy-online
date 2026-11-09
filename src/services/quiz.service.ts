import { API_BASE_URL } from "@/constants/api";

export interface QuizQuestion {
  id: number;
  quiz_id: number;
  question: string;
  options: string | string[];
  answer: string;
  created_at: string;
  updated_at: string;
}

export interface Quiz {
  id: number;
  course_id: number;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
  can_take_quiz: boolean;
  questions: QuizQuestion[];
  course?: {
    id: number;
    title: string;
    description: string;
  };
}

export interface QuizSubmissionResponse {
  status: string;
  score: number;
  total_questions: number;
  correct_answers: number;
  passed: boolean;
}

export interface QuizzesResponse {
  status: string;
  quizzes: Quiz[];
}

// Helper function to parse options strings to arrays
const parseOptions = (quiz: Quiz) => {
  quiz.questions.forEach((question: QuizQuestion) => {
    if (typeof question.options === "string") {
      try {
        question.options = JSON.parse(question.options);
      } catch (error) {
        console.error("Error parsing options:", error);
        question.options = [];
      }
    }
  });
};

export const quizService = {
  // Fetch all quizzes
  async getQuizzes(): Promise<QuizzesResponse> {
    const token = localStorage.getItem("zse_training_token");
    const response = await fetch(`${API_BASE_URL}/quizzes`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch quizzes");
    }

    const data: QuizzesResponse = await response.json();

    // Log raw API response
    console.log("Raw API response:", data);

    if (data.quizzes) {
      data.quizzes.forEach((quiz) => {
        parseOptions(quiz);
        // Only set false if missing, do not overwrite true
        if (quiz.can_take_quiz === undefined || quiz.can_take_quiz === null) {
          quiz.can_take_quiz = true;
        }
      });
    }

    // Log after parsing options and ensuring can_take_quiz
    console.log("Parsed quizzes:", data.quizzes);

    return data;
  },
  // Fetch quizzes for a specific course
  async getCourseQuizzes(courseId: number): Promise<QuizzesResponse> {
    const token = localStorage.getItem("zse_training_token");
    const response = await fetch(
      `${API_BASE_URL}/courses/${courseId}/quizzes`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch course quizzes");
    }

    const data: QuizzesResponse = await response.json();

    console.log(`getCourseQuizzes API response for course ${courseId}:`, data);

    if (data.quizzes) {
      data.quizzes.forEach(parseOptions);
      data.quizzes.forEach((quiz) => {
        if (quiz.can_take_quiz === undefined) quiz.can_take_quiz = true;
      });
    }

    return data;
  },

  // Fetch a single quiz
  async getQuiz(quizId: number): Promise<{ status: string; quiz: Quiz }> {
    const token = localStorage.getItem("zse_training_token");
    const response = await fetch(`${API_BASE_URL}/quizzes/${quizId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch quiz");
    }

    const data = await response.json();

    console.log(`getQuiz API response for quiz ${quizId}:`, data);

    if (data.quiz) {
      parseOptions(data.quiz);
      if (data.quiz.can_take_quiz === undefined)
        data.quiz.can_take_quiz = true;
    }

    return data;
  },

  // Submit quiz answers
  async submitQuiz(
    quizId: number,
    userAnswers: { [questionId: number]: string }
  ): Promise<QuizSubmissionResponse> {
    const token = localStorage.getItem("zse_training_token");

    const answers = Object.entries(userAnswers).map(([questionId, answer]) => ({
      question_id: parseInt(questionId),
      answer,
    }));

    const response = await fetch(`${API_BASE_URL}/quizzes/${quizId}/submit`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ answers }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error("Submission error details:", errorData);
      throw new Error("Failed to submit quiz");
    }

    const result = await response.json();
    console.log(`submitQuiz API response for quiz ${quizId}:`, result);
    return result;
  },

  // Check if a quiz is available to take
  async checkQuizAvailability(
    quizId: number
  ): Promise<{ can_take_quiz: boolean }> {
    const token = localStorage.getItem("zse_training_token");
    const response = await fetch(
      `${API_BASE_URL}/quizzes/${quizId}/check-availability`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to check quiz availability");
    }

    const data = await response.json();
    if (data.can_take_quiz === undefined) data.can_take_quiz = false;
    console.log(`checkQuizAvailability API response for quiz ${quizId}:`, data);
    return data;
  },
};
