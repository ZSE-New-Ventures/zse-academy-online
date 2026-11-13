import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { courseService, Course } from "@/services/course.service";
import { API_BASE_URL } from "@/constants/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  faPlus,
  faEdit,
  faTrash,
  faSearch,
  faList,
  faImage,
  faUser,
  faMoneyBill,
  faClock,
  faLayerGroup,
} from "@fortawesome/free-solid-svg-icons";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import axios from "axios";

interface Category {
  id: number;
  name: string;
}

interface Instructor {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  bio?: string;
}

const CourseSkeleton = () => (
  <Card className="bg-gradient-to-br from-card to-accent/20">
    <CardContent className="p-4">
      <div className="flex justify-between items-start">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse" />
            <div className="h-6 bg-gray-200 rounded w-16 animate-pulse" />
          </div>
          <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
          <div className="flex flex-wrap gap-4">
            <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
          </div>
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-9 bg-gray-200 rounded animate-pulse" />
          <div className="h-9 w-9 bg-gray-200 rounded animate-pulse" />
          <div className="h-9 w-9 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const InputWrapper: React.FC<{
  children: React.ReactNode;
  icon?: IconDefinition;
  label?: string;
}> = ({ children, icon, label }) => (
  <div className="space-y-1">
    {label && <Label className="text-sm font-medium">{label}</Label>}
    <div className="flex items-center gap-2 bg-muted/60 dark:bg-muted/30 rounded-lg p-2 shadow-sm focus-within:ring-2 focus-within:ring-primary transition">
      {icon && (
        <FontAwesomeIcon
          icon={icon}
          className="text-muted-foreground w-4 h-4 ml-1"
        />
      )}
      <div className="flex-1">{children}</div>
    </div>
  </div>
);

// Create axios instance with auth headers
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add request interceptor to include token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("zse_training_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const ManageCourses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<number | null>(null);
  const [isDeletingCourse, setIsDeletingCourse] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category_id: "uncategorized",
    level: "Beginner",
    thumbnail_url: "",
    duration: "",
    is_published: false,
    instructor_id: "unassigned",
  });

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchCourses(), fetchCategories(), fetchInstructors()]);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    setLoading(false);
  };

  const fetchCourses = async () => {
    try {
      const data = await courseService.getAdminCourses();
      setCourses(data.data || data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch courses",
        variant: "destructive",
      });
    }
  };

  const fetchCategories = async () => {
    try {
      // Get token from localStorage
      const token = localStorage.getItem("zse_training_token");
      if (!token) {
        toast({
          title: "Error",
          description: "Authentication required. Please log in again.",
          variant: "destructive",
        });
        return;
      }

      const res = await api.get("/categories", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      // Handle different response structures
      let categoriesData = [];
      if (res.data?.data?.data) {
        categoriesData = res.data.data.data; // Laravel pagination
      } else if (res.data?.data) {
        categoriesData = res.data.data;
      } else if (Array.isArray(res.data)) {
        categoriesData = res.data;
      }
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast({
        title: "Error",
        description: "Failed to fetch categories",
        variant: "destructive",
      });
    }
  };

  const fetchInstructors = async () => {
    try {
      // Get token from localStorage
      const token = localStorage.getItem("zse_training_token");
      if (!token) {
        toast({
          title: "Error",
          description: "Authentication required. Please log in again.",
          variant: "destructive",
        });
        return;
      }

      console.log("Fetching instructors with token:", token.substring(0, 20) + "..."); // Debug log
      
      const res = await api.get("/instructors", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      console.log("Instructors API Response:", res.data); // Debug log
      
      // Handle different response structures
      let instructorsData = [];
      if (res.data?.instructors) {
        instructorsData = res.data.instructors;
      } else if (res.data?.data?.data) {
        instructorsData = res.data.data.data; // Laravel pagination
      } else if (res.data?.data) {
        instructorsData = res.data.data;
      } else if (Array.isArray(res.data)) {
        instructorsData = res.data;
      } else if (res.data?.success && Array.isArray(res.data?.data)) {
        instructorsData = res.data.data;
      }
      
      setInstructors(Array.isArray(instructorsData) ? instructorsData : []);
      console.log("Parsed instructors:", instructorsData); // Debug log
    } catch (error: unknown) {
      const err = error as { response?: { status?: number; data?: { message?: string } } };
      console.error("Error fetching instructors:", error);
      
      // Handle 401 unauthorized
      if (err.response?.status === 401) {
        toast({
          title: "Session Expired",
          description: "Your session has expired. Please log in again.",
          variant: "destructive",
        });
        // Optionally redirect to login page
        // navigate("/login");
      } else {
        toast({
          title: "Error",
          description: err.response?.data?.message || "Failed to fetch instructors.",
          variant: "destructive",
        });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const courseData: Record<string, string | number | boolean | null> = {
        title: formData.title,
        description: formData.description,
        level: formData.level,
        price: formData.price ? parseFloat(formData.price) : 0,
        thumbnail_url: formData.thumbnail_url || null,
        duration: formData.duration,
        is_published: formData.is_published,
      };

      // Include numeric instructor_id if set and not "unassigned"
      if (formData.instructor_id && formData.instructor_id !== "unassigned") {
        courseData.instructor_id = parseInt(formData.instructor_id, 10);
      }

      // Include numeric category id if set and not "uncategorized"
      if (formData.category_id && formData.category_id !== "uncategorized") {
        courseData.category_id = parseInt(formData.category_id, 10);
      }

      console.log("Saving course data:", courseData); // Debug log

      if (editingCourse) {
        await courseService.updateCourse(editingCourse.id, courseData);
        toast({ title: "Success", description: "Course updated successfully" });
      } else {
        await courseService.createCourse(courseData);
        toast({ title: "Success", description: "Course created successfully" });
      }

      await fetchCourses();
      setIsDialogOpen(false);
      resetForm();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      console.error("Error saving course:", error);
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to save course",
        variant: "destructive",
      });
    }
  };

  const confirmDeleteCourse = async () => {
    if (!courseToDelete) return;
    try {
      setIsDeletingCourse(true);
      await courseService.deleteCourse(courseToDelete);
      toast({ title: "Deleted", description: "Course deleted successfully." });
      setCourseToDelete(null);
      fetchCourses();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to delete course",
        variant: "destructive",
      });
    } finally {
      setIsDeletingCourse(false);
    }
  };

  const handleDelete = (id: number) => {
    setCourseToDelete(id);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      price: "",
      category_id: "uncategorized",
      level: "Beginner",
      thumbnail_url: "",
      duration: "",
      is_published: false,
      instructor_id: "unassigned",
    });
    setEditingCourse(null);
  };

  const openEditDialog = (course: Course) => {
    setEditingCourse(course);

    // Extract instructor_id and category_id safely
    const instructorId = course.instructor?.id || course.instructor_id || "";
    const categoryId = course.category?.id || course.category_id || "";

    setFormData({
      title: course.title || "",
      description: course.description || "",
      price: course.price?.toString() || "",
      // If no category ID, use "uncategorized"
      category_id: categoryId ? String(categoryId) : "uncategorized",
      level: course.level || "Beginner",
      thumbnail_url: course.thumbnail_url || "",
      duration: course.duration || "",
      is_published: course.is_published || false,
      // If no instructor ID, use "unassigned"
      instructor_id: instructorId ? String(instructorId) : "unassigned",
    });

    setIsDialogOpen(true);
  };

  const handleCategoryChange = (value: string) => {
    setFormData({ ...formData, category_id: value });
  };

  const handleInstructorChange = (value: string) => {
    setFormData({ ...formData, instructor_id: value });
  };

  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="bg-gradient-to-br from-card via-card to-muted/30 border-border/50 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
            <div className="h-10 bg-gray-200 rounded w-32 animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="relative">
                <div className="h-10 bg-gray-200 rounded w-full animate-pulse" />
              </div>
            </div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <CourseSkeleton key={i} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-card via-card to-muted/30 border-border/50 shadow-soft">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Manage Courses</CardTitle>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <FontAwesomeIcon icon={faPlus} className="mr-2 h-4 w-4" />
                Add Course
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingCourse ? "Edit Course" : "Add New Course"}
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4 p-2">
                <div className="grid grid-cols-1 gap-4">
                  <InputWrapper label="Title *">
                    <Input
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      required
                      className="bg-transparent border-0 outline-none"
                      placeholder="Enter course title"
                    />
                  </InputWrapper>

                  <InputWrapper label="Description">
                    <Textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      rows={4}
                      className="bg-transparent border-0 outline-none"
                      placeholder="Enter course description"
                    />
                  </InputWrapper>

                  <div className="grid grid-cols-2 gap-4">
                    <InputWrapper label="Category" icon={faLayerGroup}>
                      <Select
                        value={formData.category_id}
                        onValueChange={handleCategoryChange}
                      >
                        <SelectTrigger className="bg-transparent border-0">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="uncategorized">Uncategorized</SelectItem>
                          {Array.isArray(categories) && categories.length ? (
                            categories.map((c) => (
                              <SelectItem key={c.id} value={String(c.id)}>
                                {c.name}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="loading-categories">
                              Loading categories...
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </InputWrapper>

                    <InputWrapper label="Level">
                      <Select
                        value={formData.level}
                        onValueChange={(v) =>
                          setFormData({ ...formData, level: v })
                        }
                      >
                        <SelectTrigger className="bg-transparent border-0">
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Beginner">Beginner</SelectItem>
                          <SelectItem value="Intermediate">
                            Intermediate
                          </SelectItem>
                          <SelectItem value="Advanced">Advanced</SelectItem>
                          <SelectItem value="Professional">
                            Professional
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </InputWrapper>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <InputWrapper label="Price ($)" icon={faMoneyBill}>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) =>
                          setFormData({ ...formData, price: e.target.value })
                        }
                        className="bg-transparent border-0 outline-none"
                        placeholder="0.00"
                      />
                    </InputWrapper>

                    <InputWrapper label="Duration" icon={faClock}>
                      <Input
                        value={formData.duration}
                        onChange={(e) =>
                          setFormData({ ...formData, duration: e.target.value })
                        }
                        className="bg-transparent border-0 outline-none"
                        placeholder="e.g., 8 weeks"
                      />
                    </InputWrapper>
                  </div>

                  <InputWrapper label="Thumbnail URL" icon={faImage}>
                    <Input
                      type="url"
                      value={formData.thumbnail_url}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          thumbnail_url: e.target.value,
                        })
                      }
                      className="bg-transparent border-0 outline-none"
                      placeholder="https://example.com/image.jpg"
                    />
                  </InputWrapper>

                  <InputWrapper label="Instructor" icon={faUser}>
                    <Select
                      value={formData.instructor_id}
                      onValueChange={handleInstructorChange}
                    >
                      <SelectTrigger className="bg-transparent border-0">
                        <SelectValue placeholder="Select Instructor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {Array.isArray(instructors) && instructors.length ? (
                          instructors.map((inst) => (
                            <SelectItem key={inst.id} value={String(inst.id)}>
                              {inst.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="loading-instructors">
                            Loading instructors...
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </InputWrapper>

                  <InputWrapper label="Access Visibility" icon={faShieldHalved}>
                    <Select
                      value={formData.visibility}
                      onValueChange={(val: "public" | "restricted" | "private") =>
                        setFormData({ ...formData, visibility: val })
                      }
                    >
                      <SelectTrigger className="bg-transparent border-0">
                        <SelectValue placeholder="Select Visibility" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">
                          🌐 Public (Open Catalog)
                        </SelectItem>
                        <SelectItem value="restricted">
                          🔒 Restricted (Sponsor Exam / Cohort Gated)
                        </SelectItem>
                        <SelectItem value="private">
                          👁️ Private (Draft / Internal Only)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </InputWrapper>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={formData.is_published}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, is_published: checked })
                      }
                    />
                    <Label>Publish course</Label>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingCourse ? "Update Course" : "Create Course"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>

        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <FontAwesomeIcon
                icon={faSearch}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
              />
              <Input
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-muted/40 rounded-lg"
              />
            </div>
          </div>

          <div className="space-y-4">
            {filteredCourses.map((course) => (
              <Card
                key={course.id}
                className="bg-gradient-to-br from-card to-accent/20 hover:shadow-medium transition-all"
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h3 className="font-semibold text-lg">
                          {course.title}
                        </h3>
                        {course.is_published ? (
                          <Badge className="bg-green-100 text-green-800">
                            Published
                          </Badge>
                        ) : (
                          <Badge className="border-gray-300 text-gray-500">
                            Draft
                          </Badge>
                        )}
                        {course.visibility === "restricted" && (
                          <Badge className="bg-amber-100 text-amber-900 border-amber-300 font-semibold flex items-center gap-1">
                            <FontAwesomeIcon icon={faShieldHalved} className="h-3 w-3 text-amber-700" />
                            Sponsor Exam / Restricted
                          </Badge>
                        )}
                        {course.visibility === "private" && (
                          <Badge className="bg-purple-100 text-purple-900 border-purple-300 font-semibold">
                            Private
                          </Badge>
                        )}
                        {typeof course.category === "object" && course.category?.access_level === "restricted" && (
                          <Badge variant="outline" className="border-amber-400 text-amber-700 text-xs">
                            Restricted Category
                          </Badge>
                        )}
                      </div>

                      <p className="text-sm text-muted-foreground mb-2">
                        {course.description}
                      </p>

                      <div className="flex flex-wrap gap-4 text-sm">
                        <span className="text-primary font-medium">
                          ${course.price || 0}
                        </span>
                        <span>Level: {course.level || "Not set"}</span>
                        <span>
                          Category:{" "}
                          {typeof course.category === "object"
                            ? course.category.name
                            : course.category || "Uncategorized"}
                        </span>
                        {course.duration && (
                          <span>Duration: {course.duration}</span>
                        )}
                        <span>
                          Instructor:{" "}
                          {course.instructor?.name ||
                            instructors.find(
                              (i) => i.id === course.id
                            )?.name ||
                            "Unassigned"}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 flex-wrap items-center">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-primary/40 hover:bg-primary/5 text-primary text-xs font-semibold"
                        onClick={() => {
                          setAssignmentCourse(course);
                          setIsAssignmentModalOpen(true);
                        }}
                      >
                        <FontAwesomeIcon icon={faUsers} className="mr-1.5 h-3.5 w-3.5" />
                        Access & Cohorts
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          navigate(`/admin/courses/${course.id}/content`)
                        }
                      >
                        Manage Content
                        <FontAwesomeIcon icon={faList} className="ml-2 h-4" />
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditDialog(course)}
                      >
                        <FontAwesomeIcon icon={faEdit} className="h-4" />
                      </Button>

                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(course.id)}
                      >
                        <FontAwesomeIcon icon={faTrash} className="h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredCourses.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm
                ? "No courses found matching your search."
                : "No courses available."}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Styled Modern Delete Confirmation Dialog */}
      <AlertDialog open={courseToDelete !== null} onOpenChange={(open) => !open && setCourseToDelete(null)}>
        <AlertDialogContent className="max-w-md bg-white border border-gray-200 shadow-2xl rounded-2xl p-6">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold text-gray-900">
              Delete Course
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-gray-600 mt-2">
              Are you sure you want to delete this course? All associated lectures, slide decks, and student enrollment records will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 flex items-center justify-end gap-3">
            <AlertDialogCancel disabled={isDeletingCourse} className="text-xs font-semibold rounded-lg">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteCourse}
              disabled={isDeletingCourse}
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-sm"
            >
              {isDeletingCourse ? "Deleting..." : "Yes, Delete Course"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Course Assignment Modal for Cohorts and Specific Learners */}
      <CourseAssignmentModal
        course={assignmentCourse}
        isOpen={isAssignmentModalOpen}
        onClose={() => {
          setIsAssignmentModalOpen(false);
          setAssignmentCourse(null);
        }}
        onAssignmentsUpdated={fetchCourses}
      />
    </div>
  );
};

export default ManageCourses;
