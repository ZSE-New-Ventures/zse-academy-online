import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faTrash,
  faFileLines,
  faQuestion,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";
import { API_BASE_URL } from "@/constants/api";

interface Course {
  id: number;
  title: string;
}

interface Question {
  question: string;
  options: string[];
  answer: string;
}

function QuizForm() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<number | "">("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<Question[]>([
    { question: "", options: ["", ""], answer: "" },
  ]);

  const { toast } = useToast();
  const token = localStorage.getItem("zse_training_token");
  const API_URL = `${API_BASE_URL}/quizzes`;

  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  useEffect(() => {
    fetch(`${API_BASE_URL}/courses`, { headers: authHeaders })
      .then((res) => res.json())
      .then((data) => setCourses(data.data || []))
      .catch(() =>
        toast({
          title: "Error",
          description: "Failed to fetch courses",
          variant: "destructive",
        })
      );
  }, []);

  const addQuestion = () => {
    setQuestions([...questions, { question: "", options: ["", ""], answer: "" }]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const addOption = (index: number) => {
    const updated = [...questions];
    if (updated[index].options.length < 6) {
      updated[index].options.push("");
      setQuestions(updated);
    } else {
      toast({
        title: "Maximum options reached",
        description: "You can only add up to 6 options per question",
        variant: "destructive",
      });
    }
  };

  const removeOption = (qIndex: number, oIndex: number) => {
    const updated = [...questions];
    if (updated[qIndex].options.length > 2) {
      updated[qIndex].options.splice(oIndex, 1);
      setQuestions(updated);
    }
  };

  const updateQuestion = (
    index: number,
    field: string,
    value: string,
    optionIndex?: number
  ) => {
    const updated = [...questions];
    if (field === "question") updated[index].question = value;
    else if (field === "answer") updated[index].answer = value;
    else if (field === "option" && optionIndex !== undefined)
      updated[index].options[optionIndex] = value;
    setQuestions(updated);
  };

  const validateForm = () => {
    if (!selectedCourse) return "Please select a course";
    if (!title.trim()) return "Quiz title is required";
    if (questions.length === 0) return "At least one question is required";

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) return `Question ${i + 1} is empty`;
      if (q.options.some((opt) => !opt.trim()))
        return `All options for question ${i + 1} must be filled`;
      if (!q.answer.trim()) return `Correct answer for question ${i + 1} is required`;
      if (!q.options.includes(q.answer))
        return `Correct answer for question ${i + 1} must match one of the options`;
    }

    return null;
  };

  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError)
      return toast({
        title: "Validation Error",
        description: validationError,
        variant: "destructive",
      });

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          course_id: selectedCourse,
          title,
          description,
          questions,
        }),
      });

      const json = await res.json();

      if (res.status === 201) {
        toast({
          title: "Success",
          description: "Quiz created successfully",
          variant: "default",
        });
        setTitle("");
        setDescription("");
        setSelectedCourse("");
        setQuestions([{ question: "", options: ["", ""], answer: "" }]);
      } else {
        toast({
          title: "Error",
          description: json.message || "Failed to create quiz",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create quiz",
        variant: "destructive",
      });
    }
  };

  const generateOptionValue = (option: string, index: number) => {
    return option.trim() || `option-${index}`;
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-6">
      {/* Quiz Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FontAwesomeIcon icon={faQuestion} />
            Quiz Information
          </CardTitle>
          <CardDescription>Provide basic information about your quiz</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Course Selection */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Select Course</label>
            <div className="bg-white rounded-lg border-2 shadow-sm p-1">
              <Select
                value={selectedCourse.toString()}
                onValueChange={(val) => setSelectedCourse(val ? Number(val) : "")}
              >
                <SelectTrigger className="w-full bg-white border-0">
                  <SelectValue placeholder="Choose a course for this quiz" />
                </SelectTrigger>
                <SelectContent className="bg-white border-2">
                  {courses.map((course) => (
                    <SelectItem
                      key={course.id}
                      value={course.id.toString()}
                      className="bg-white hover:bg-gray-50"
                    >
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Quiz Title</label>
            <Input
              placeholder="Enter quiz title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-lg"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Quiz Description</label>
            <Textarea
              placeholder="Describe what this quiz covers (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Questions Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faFileLines} />
              Questions
            </div>
            <Badge variant="secondary">{questions.length} questions</Badge>
          </CardTitle>
          <CardDescription>
            Add multiple choice questions with options and correct answers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {questions.map((q, qIndex) => (
            <Card key={qIndex} className="border-2">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm">
                      {qIndex + 1}
                    </div>
                    Question {qIndex + 1}
                  </CardTitle>
                  {questions.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeQuestion(qIndex)}
                      className="h-8 w-8 p-0 text-destructive"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Question Text</label>
                  <Input
                    placeholder="Enter your question here..."
                    value={q.question}
                    onChange={(e) => updateQuestion(qIndex, "question", e.target.value)}
                    className="font-medium"
                  />
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Options</label>
                    <Badge variant="outline">{q.options.length} options</Badge>
                  </div>

                  {q.options.map((opt, oIndex) => (
                    <div key={oIndex} className="flex items-center gap-2">
                      <div className="flex-1 flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full border border-muted-foreground/30 text-xs font-medium">
                          {String.fromCharCode(65 + oIndex)}
                        </div>
                        <Input
                          placeholder={`Option ${oIndex + 1}`}
                          value={opt}
                          onChange={(e) => updateQuestion(qIndex, "option", e.target.value, oIndex)}
                          className={q.answer === opt ? "border-green-500 bg-green-50" : ""}
                        />
                      </div>
                      {q.options.length > 2 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeOption(qIndex, oIndex)}
                          className="h-8 w-8 p-0 text-destructive"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </Button>
                      )}
                    </div>
                  ))}

                  {q.options.length < 6 && (
                    <Button variant="outline" size="sm" onClick={() => addOption(qIndex)} className="w-full">
                      <FontAwesomeIcon icon={faPlus} className="mr-2" />
                      Add Option
                    </Button>
                  )}
                </div>

                <Separator />

                <div className="space-y-2 ">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <FontAwesomeIcon icon={faCheckCircle} className="text-green-600" />
                    Correct Answer
                  </label>
                  <Select
                    value={q.answer}
                    onValueChange={(val) => updateQuestion(qIndex, "answer", val)}
                  >
                    <SelectTrigger
                      className={q.answer ? "border-green-500 bg-green-50" : ""}
                    >
                      <SelectValue placeholder="Select the correct answer" />
                    </SelectTrigger>
                    <SelectContent>
                      {q.options.map((opt, oIndex) => {
                        const optionValue = generateOptionValue(opt, oIndex);
                        return (
                          <SelectItem key={oIndex} value={optionValue} disabled={!opt.trim()}>
                            <div className="flex items-center gap-2">
                              <div className="flex h-5 w-5 items-center justify-center rounded-full border border-muted-foreground/30 text-xs">
                                {String.fromCharCode(65 + oIndex)}
                              </div>
                              {opt || `Option ${oIndex + 1} (empty)`}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  {q.answer && !q.options.includes(q.answer) && (
                    <p className="text-sm text-destructive">
                      Warning: The selected answer doesn't match any of the options above.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button onClick={addQuestion} variant="outline" className="flex-1">
              <FontAwesomeIcon icon={faPlus} className="mr-2" />
              Add Another Question
            </Button>
            <Button
              onClick={handleSubmit}
              size="lg"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
              Create Quiz
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default QuizForm;
