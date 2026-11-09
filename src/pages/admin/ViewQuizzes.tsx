import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTrash,
  faMagnifyingGlass,
  faBookOpen,
} from "@fortawesome/free-solid-svg-icons";

const API_BASE_URL = "http://127.0.0.1:8000/api";

interface ViewQuizzesProps {
  onEdit?: (id: number) => void; // <-- enable edit navigation
}

const ViewQuizzes = ({ onEdit }: ViewQuizzesProps) => {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quizToDelete, setQuizToDelete] = useState<number | null>(null);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  useEffect(() => {
    if (search.trim() === "") {
      setFilteredQuizzes(quizzes);
    } else {
      setFilteredQuizzes(
        quizzes.filter((q) =>
          q.title.toLowerCase().includes(search.toLowerCase())
        )
      );
    }
  }, [search, quizzes]);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("zse_training_token");

      const res = await fetch(`${API_BASE_URL}/quizzes`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch quizzes");

      const data = await res.json();
      setQuizzes(data.quizzes);
      setFilteredQuizzes(data.quizzes);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const token = localStorage.getItem("zse_training_token");

      const res = await fetch(`${API_BASE_URL}/quizzes/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to delete quiz");

      setQuizzes((q) => q.filter((item) => item.id !== id));
      setFilteredQuizzes((q) => q.filter((item) => item.id !== id));
      toast.success("Quiz deleted successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete quiz");
    } finally {
      setQuizToDelete(null);
    }
  };

  const handleEditClick = (id: number) => {
    if (onEdit) {
      onEdit(id); // <-- triggers parent navigation
    } else {
      console.warn("onEdit not provided");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <FontAwesomeIcon icon={faBookOpen} className="text-orange-500" />
          All Quizzes
        </CardTitle>
      </CardHeader>

      <CardContent>
        {/* Search */}
        <div className="flex items-center space-x-2 mb-4">
          <FontAwesomeIcon icon={faMagnifyingGlass} className="text-muted-foreground" />
          <Input
            placeholder="Search quizzes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1"
          />
        </div>

        {loading && <p className="text-muted-foreground">Loading quizzes...</p>}
        {error && <p className="text-destructive">{error}</p>}

        {!loading && !error && filteredQuizzes.length === 0 && (
          <p className="text-muted-foreground">No quizzes found.</p>
        )}

        {!loading && filteredQuizzes.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border border-border rounded-lg">
              <thead className="bg-muted text-sm">
                <tr>
                  <th className="px-4 py-2 border-b">Quiz</th>
                  <th className="px-4 py-2 border-b">Course</th>
                  <th className="px-4 py-2 border-b">Questions</th>
                  <th className="px-4 py-2 border-b">Status</th>
                  <th className="px-4 py-2 border-b">Created</th>
                  <th className="px-4 py-2 border-b text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredQuizzes.map((quiz) => (
                  <tr key={quiz.id} className="hover:bg-muted/30 transition">
                    {/* Quiz Thumbnail + Info */}
                    <td className="px-4 py-3 flex items-center gap-3">
                      <img
                        src={quiz.course?.thumbnail_url}
                        className="w-12 h-12 rounded-md object-cover object-top border"
                      />
                      <div>
                        <p className="font-medium">{quiz.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {quiz.description?.substring(0, 50)}...
                        </p>
                      </div>
                    </td>

                    {/* Course */}
                    <td className="px-4 py-2">{quiz.course?.title}</td>

                    {/* Question Count */}
                    <td className="px-4 py-2 font-semibold">
                      {quiz.questions?.length}
                    </td>

                    {/* Can Take */}
                    <td className="px-4 py-2">
                      {quiz.can_take_quiz ? (
                        <Badge className="bg-green-600 text-white">Active</Badge>
                      ) : (
                        <Badge variant="outline" className="text-red-500 border-red-500">
                          Disabled
                        </Badge>
                      )}
                    </td>

                    {/* Created */}
                    <td className="px-4 py-2">
                      {new Date(quiz.created_at).toLocaleDateString()}
                    </td>

                    {/* ACTION BUTTONS */}
                    <td className="px-4 py-2">
                      <div className="flex flex-row items-center justify-center gap-2">

                        {/* EDIT */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditClick(quiz.id)}
                          className="flex items-center gap-1"
                        >
                          <FontAwesomeIcon icon={faEdit} />
                          Edit
                        </Button>

                        {/* DELETE */}
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setQuizToDelete(quiz.id)}
                          className="flex items-center gap-1"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                          Delete
                        </Button>

                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={quizToDelete !== null} onOpenChange={(open) => !open && setQuizToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the quiz and all associated questions and student submissions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => {
                if (quizToDelete !== null) {
                  handleDelete(quizToDelete);
                }
              }}
            >
              Delete Quiz
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default ViewQuizzes;
