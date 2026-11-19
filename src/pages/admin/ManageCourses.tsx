import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { courseService, Course, CourseLevelItem } from "@/services/course.service";
import { API_BASE_URL } from "@/constants/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { CourseAssignmentModal } from "@/components/admin/CourseAssignmentModal";
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
  faUsers,
  faShieldHalved,
  faGlobe,
  faLock,
  faCheckCircle,
  faTag,
  faUpload,
  faTimes,
  faInfoCircle,
  faCertificate,
  faAward,
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
  const [levels, setLevels] = useState<CourseLevelItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [pricingFilter, setPricingFilter] = useState<"all" | "free" | "payable">("all");
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<number | null>(null);
  const [isDeletingCourse, setIsDeletingCourse] = useState(false);
  const [assignmentCourse, setAssignmentCourse] = useState<Course | null>(null);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [isUrlInputOpen, setIsUrlInputOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    pricing_type: "free" as "free" | "payable",
    price: "",
    category_id: "uncategorized",
    level: "Beginner",
    thumbnail_url: "",
    duration: "",
    is_published: false,
    visibility: "public" as "public" | "restricted" | "private",
    instructor_id: "unassigned",
    certification_type: "standard" as "standard" | "high_stakes" | "none",
    passing_grade_percent: 70,
    requires_manual_approval: false,
    signatory_type: "instructor" as "instructor" | "executive" | "dual",
  });

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchCourses(), fetchCategories(), fetchInstructors(), fetchLevels()]);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    setLoading(false);
  };

  const fetchLevels = async () => {
    try {
      const data = await courseService.getLevels();
      setLevels(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching levels:", error);
    }
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
        price: formData.pricing_type === "payable" && formData.price ? parseFloat(formData.price) : 0,
        thumbnail_url: formData.thumbnail_url || null,
        duration: formData.duration,
        is_published: formData.is_published,
        visibility: formData.visibility,
        certification_type: formData.certification_type,
        passing_grade_percent: formData.passing_grade_percent,
        requires_manual_approval: formData.requires_manual_approval,
        signatory_type: formData.signatory_type,
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

      if (thumbnailFile) {
        const fd = new FormData();
        Object.entries(courseData).forEach(([k, v]) => {
          if (v !== null && v !== undefined) {
            fd.append(k, String(v));
          }
        });
        fd.append("thumbnail", thumbnailFile);

        if (editingCourse) {
          await courseService.updateCourse(editingCourse.id, fd);
          toast({ title: "Success", description: "Course updated successfully" });
        } else {
          await courseService.createCourse(fd);
          toast({ title: "Success", description: "Course created successfully" });
        }
      } else {
        if (editingCourse) {
          await courseService.updateCourse(editingCourse.id, courseData);
          toast({ title: "Success", description: "Course updated successfully" });
        } else {
          await courseService.createCourse(courseData);
          toast({ title: "Success", description: "Course created successfully" });
        }
      }

      await fetchCourses();
      setIsDialogOpen(false);
      resetForm();
    } catch (error: unknown) {
      const err = error as {
        response?: {
          data?: {
            message?: string;
            error?: string;
            errors?: Record<string, string[]>;
            [key: string]: unknown;
          };
        };
      };
      console.error("Error saving course:", error);
      let errMsg = "Failed to save course";
      if (err.response?.data) {
        if (typeof err.response.data.message === "string") {
          errMsg = err.response.data.message;
        } else if (typeof err.response.data.error === "string") {
          errMsg = err.response.data.error;
        } else if (typeof err.response.data.errors === "object" && err.response.data.errors !== null) {
          const firstErrList = Object.values(err.response.data.errors)[0];
          if (Array.isArray(firstErrList) && firstErrList.length > 0) {
            errMsg = firstErrList[0];
          }
        } else {
          const values = Object.values(err.response.data);
          if (values.length > 0 && Array.isArray(values[0]) && values[0].length > 0) {
            errMsg = String(values[0][0]);
          }
        }
      }
      toast({
        title: "Error",
        description: errMsg,
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

  const handleQuickChangeVisibility = async (courseId: number, newVisibility: "public" | "restricted" | "private") => {
    // Optimistic update
    setCourses((prev) =>
      prev.map((c) => (c.id === courseId ? { ...c, visibility: newVisibility } : c))
    );

    try {
      await courseService.updateCourseVisibility(courseId, newVisibility);
      toast({
        title: "Visibility Updated",
        description: `Course visibility set to ${
          newVisibility === "public"
            ? "Public (Catalog)"
            : newVisibility === "restricted"
            ? "Restricted (Sponsor Exam)"
            : "Private (Internal Only)"
        }`,
      });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast({
        title: "Error Updating Visibility",
        description: err.response?.data?.message || "Failed to update course visibility.",
        variant: "destructive",
      });
      fetchCourses();
    }
  };

  const handleTogglePublish = async (course: Course) => {
    const updatedStatus = !course.is_published;
    // Optimistic update
    setCourses((prev) =>
      prev.map((c) => (c.id === course.id ? { ...c, is_published: updatedStatus } : c))
    );

    try {
      await courseService.toggleCoursePublish(course.id, updatedStatus);
      toast({
        title: updatedStatus ? "Course Published" : "Course Moved to Draft",
        description: `"${course.title}" is now ${updatedStatus ? "published in catalog" : "hidden as draft"}.`,
      });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast({
        title: "Error Updating Status",
        description: err.response?.data?.message || "Failed to update publication status.",
        variant: "destructive",
      });
      fetchCourses();
    }
  };

  const handleThumbnailFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Thumbnail image must be smaller than 2MB.",
          variant: "destructive",
        });
        return;
      }
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
      setFormData((prev) => ({ ...prev, thumbnail_url: "" }));
    }
  };

  const handleClearThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview(null);
    setFormData((prev) => ({ ...prev, thumbnail_url: "" }));
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      pricing_type: "free",
      price: "",
      category_id: "uncategorized",
      level: "Beginner",
      thumbnail_url: "",
      duration: "",
      is_published: false,
      visibility: "public",
      instructor_id: "unassigned",
      certification_type: "standard",
      passing_grade_percent: 70,
      requires_manual_approval: false,
      signatory_type: "instructor",
    });
    setThumbnailFile(null);
    setThumbnailPreview(null);
    setIsUrlInputOpen(false);
    setEditingCourse(null);
  };

  const openEditDialog = (course: Course) => {
    setEditingCourse(course);

    // Extract instructor_id and category_id safely
    const instructorId = course.instructor?.id || course.instructor_id || "";
    const categoryId = course.category?.id || course.category_id || "";
    const isPayable = course.price !== undefined && course.price !== null && parseFloat(course.price.toString()) > 0;
    const existingThumbnail = course.thumbnail_url || course.thumbnail || "";

    setThumbnailFile(null);
    setThumbnailPreview(existingThumbnail || null);
    setIsUrlInputOpen(Boolean(existingThumbnail && !existingThumbnail.includes('/storage/')));

    setFormData({
      title: course.title || "",
      description: course.description || "",
      pricing_type: isPayable ? "payable" : "free",
      price: isPayable ? course.price!.toString() : "",
      // If no category ID, use "uncategorized"
      category_id: categoryId ? String(categoryId) : "uncategorized",
      level: course.level || "Beginner",
      thumbnail_url: existingThumbnail,
      duration: course.duration || "",
      is_published: course.is_published || false,
      visibility: course.visibility || "public",
      // If no instructor ID, use "unassigned"
      instructor_id: instructorId ? String(instructorId) : "unassigned",
      certification_type: course.certification_type === "high_stakes_licensure" ? "high_stakes" : (course.certification_type || "standard"),
      passing_grade_percent: course.passing_grade_percent || 70,
      requires_manual_approval: Boolean(course.requires_manual_approval),
      signatory_type: course.signatory_type || "instructor",
    });

    setIsDialogOpen(true);
  };

  const handleCategoryChange = (value: string) => {
    setFormData({ ...formData, category_id: value });
  };

  const handleInstructorChange = (value: string) => {
    setFormData({ ...formData, instructor_id: value });
  };

  const freeCoursesCount = (Array.isArray(courses) ? courses : []).filter(
    (c) => !c.price || parseFloat(c.price.toString()) === 0
  ).length;

  const payableCoursesCount = (Array.isArray(courses) ? courses : []).filter(
    (c) => c.price && parseFloat(c.price.toString()) > 0
  ).length;

  const filteredCourses = (Array.isArray(courses) ? courses : []).filter((course) => {
    const matchesSearch =
      (course?.title || "").toLowerCase().includes((searchTerm || "").toLowerCase()) ||
      (course?.description || "").toLowerCase().includes((searchTerm || "").toLowerCase());

    const priceVal = parseFloat(course.price?.toString() || "0");
    const matchesPricing =
      pricingFilter === "all" ||
      (pricingFilter === "free" && priceVal === 0) ||
      (pricingFilter === "payable" && priceVal > 0);

    return matchesSearch && matchesPricing;
  });

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
                        <SelectContent className="bg-white dark:bg-slate-900 border border-gray-200 shadow-2xl rounded-xl z-[9999]">
                          {Array.isArray(levels) && levels.length > 0 ? (
                            levels.map((lvl) => (
                              <SelectItem key={lvl.id} value={lvl.name}>
                                <div className="flex items-center gap-2">
                                  <span
                                    className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                                    style={{ backgroundColor: lvl.color || "#00aeef" }}
                                  />
                                  <span>{lvl.name}</span>
                                </div>
                              </SelectItem>
                            ))
                          ) : (
                            <>
                              <SelectItem value="Beginner">Beginner</SelectItem>
                              <SelectItem value="Intermediate">Intermediate</SelectItem>
                              <SelectItem value="Advanced">Advanced</SelectItem>
                              <SelectItem value="Professional">Professional</SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>
                    </InputWrapper>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <InputWrapper label="Pricing Model" icon={faTag}>
                      <Select
                        value={formData.pricing_type}
                        onValueChange={(val: "free" | "payable") =>
                          setFormData({
                            ...formData,
                            pricing_type: val,
                            price: val === "free" ? "" : formData.price,
                          })
                        }
                      >
                        <SelectTrigger className="bg-transparent border-0 outline-none">
                          <SelectValue placeholder="Select Pricing" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-slate-900 border border-gray-200 z-[9999]">
                          <SelectItem value="free">
                            Free Course
                          </SelectItem>
                          <SelectItem value="payable">
                            Payable
                          </SelectItem>
                        </SelectContent>
                      </Select>
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

                  {formData.pricing_type === "payable" && (
                    <InputWrapper label="Price ($ USD)" icon={faMoneyBill}>
                      <Input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) =>
                          setFormData({ ...formData, price: e.target.value })
                        }
                        className="bg-transparent border-0 outline-none"
                        placeholder="e.g., 49.99"
                      />
                    </InputWrapper>
                  )}

                  {/* Course Thumbnail Upload with Highlighted Specs */}
                  <div className="space-y-2.5 p-3.5 bg-slate-50/90 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <FontAwesomeIcon icon={faImage} className="text-[#00aeef]" />
                        <span>Course Thumbnail (Optional)</span>
                      </Label>
                      <span className="text-[11px] text-muted-foreground font-medium">
                        Default fallback used if empty
                      </span>
                    </div>

                    {/* Highlighted Specs */}
                    <div className="flex items-center gap-2 p-2 bg-blue-50/80 border border-blue-200 rounded-lg text-xs text-blue-900">
                      <FontAwesomeIcon icon={faInfoCircle} className="text-blue-500 shrink-0 text-xs" />
                      <span>
                        <strong>Recommended Specs:</strong> 1280 × 720 px (16:9 ratio, max 2MB, JPG or PNG).
                      </span>
                    </div>

                    {/* Preview or Upload Zone */}
                    {thumbnailPreview ? (
                      <div className="relative aspect-video max-h-44 rounded-lg overflow-hidden border border-slate-300 bg-slate-100 group">
                        <img
                          src={thumbnailPreview}
                          alt="Thumbnail preview"
                          className="w-full h-full object-cover object-center"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <label className="cursor-pointer bg-white text-slate-900 text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-slate-100 shadow-sm flex items-center gap-1.5">
                            <FontAwesomeIcon icon={faUpload} />
                            Change Image
                            <input
                              type="file"
                              accept="image/png,image/jpeg,image/webp"
                              className="hidden"
                              onChange={handleThumbnailFileChange}
                            />
                          </label>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="h-8 text-xs font-bold"
                            onClick={handleClearThumbnail}
                          >
                            <FontAwesomeIcon icon={faTimes} className="mr-1" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <label className="border-2 border-dashed border-slate-300 hover:border-[#00aeef] rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-white hover:bg-slate-50/50">
                        <div className="w-9 h-9 rounded-full bg-[#00aeef]/10 text-[#00aeef] flex items-center justify-center mb-1.5">
                          <FontAwesomeIcon icon={faUpload} className="h-4 w-4" />
                        </div>
                        <span className="text-xs font-bold text-slate-800">
                          Click to upload course thumbnail
                        </span>
                        <span className="text-[11px] text-muted-foreground mt-0.5">
                          1280 × 720 px (16:9 ratio) • Max 2MB
                        </span>
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          className="hidden"
                          onChange={handleThumbnailFileChange}
                        />
                      </label>
                    )}

                    {/* Optional URL Toggle */}
                    <div className="pt-0.5">
                      <button
                        type="button"
                        onClick={() => setIsUrlInputOpen(!isUrlInputOpen)}
                        className="text-[11px] font-semibold text-[#00aeef] hover:underline flex items-center gap-1"
                      >
                        {isUrlInputOpen ? "− Hide Image URL input" : "+ Or specify an external Image URL"}
                      </button>

                      {isUrlInputOpen && (
                        <div className="mt-2">
                          <Input
                            type="url"
                            value={formData.thumbnail_url}
                            onChange={(e) => {
                              setFormData({ ...formData, thumbnail_url: e.target.value });
                              if (e.target.value) {
                                setThumbnailPreview(e.target.value);
                                setThumbnailFile(null);
                              }
                            }}
                            placeholder="https://example.com/course-thumbnail.jpg"
                            className="text-xs bg-white"
                          />
                        </div>
                      )}
                    </div>
                  </div>

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
                              {inst.department?.name ? ` — ${inst.department.name}` : ""}
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

                {/* Certification & Accreditation Parameters */}
                <div className="p-4 bg-slate-50/80 border border-slate-200 rounded-xl space-y-3.5 mt-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FontAwesomeIcon icon={faCertificate} className="text-[#00aeef] text-sm" />
                      <span className="text-xs font-bold text-slate-800">Certification & Assessment Parameters</span>
                    </div>
                    <Badge className={
                      formData.certification_type === "high_stakes"
                        ? "bg-amber-100 text-amber-800 border-amber-300 text-[10px]"
                        : "bg-blue-100 text-blue-700 border-blue-200 text-[10px]"
                    }>
                      {formData.certification_type === "high_stakes" ? "High-Stakes Licensure" : "Standard Cert"}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-[11px] font-semibold text-slate-700">Certification Type</Label>
                      <Select
                        value={formData.certification_type}
                        onValueChange={(val: "standard" | "high_stakes" | "none") =>
                          setFormData({
                            ...formData,
                            certification_type: val,
                            requires_manual_approval: val === "high_stakes" ? true : formData.requires_manual_approval,
                          })
                        }
                      >
                        <SelectTrigger className="bg-white border-slate-200 text-xs h-9 mt-1">
                          <SelectValue placeholder="Select Cert Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="standard" className="text-xs">
                            🎓 Standard Certificate of Completion
                          </SelectItem>
                          <SelectItem value="high_stakes" className="text-xs">
                            🏆 High-Stakes Licensure / Professional Exam
                          </SelectItem>
                          <SelectItem value="none" className="text-xs">
                            🚫 No Certificate
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-[11px] font-semibold text-slate-700">Minimum Passing Score (%)</Label>
                      <Input
                        type="number"
                        min={50}
                        max={100}
                        value={formData.passing_grade_percent}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            passing_grade_percent: parseInt(e.target.value, 10) || 70,
                          })
                        }
                        className="bg-white border-slate-200 text-xs h-9 mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    <div>
                      <Label className="text-[11px] font-semibold text-slate-700">Signatory Authority</Label>
                      <Select
                        value={formData.signatory_type}
                        onValueChange={(val: "instructor" | "executive" | "dual") =>
                          setFormData({ ...formData, signatory_type: val })
                        }
                      >
                        <SelectTrigger className="bg-white border-slate-200 text-xs h-9 mt-1">
                          <SelectValue placeholder="Select Signatory" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="instructor" className="text-xs">
                            ✍️ Course Instructor Signature
                          </SelectItem>
                          <SelectItem value="executive" className="text-xs">
                            🏛️ Executive Director / CEO
                          </SelectItem>
                          <SelectItem value="dual" className="text-xs">
                            📜 Dual Signatories (Instructor + Director)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-lg self-end h-9">
                      <Label className="text-[11px] font-medium text-slate-700 cursor-pointer" htmlFor="manual-signoff-toggle">
                        Require Instructor Sign-Off
                      </Label>
                      <Switch
                        id="manual-signoff-toggle"
                        checked={formData.requires_manual_approval}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, requires_manual_approval: checked })
                        }
                      />
                    </div>
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
          <div className="mb-4 space-y-3">
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

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-muted-foreground mr-1">Pricing Model:</span>
              <button
                type="button"
                onClick={() => setPricingFilter("all")}
                className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                  pricingFilter === "all"
                    ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
              >
                All Courses ({(Array.isArray(courses) ? courses : []).length})
              </button>
              <button
                type="button"
                onClick={() => setPricingFilter("free")}
                className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                  pricingFilter === "free"
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                    : "bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                }`}
              >
                Free Courses ({freeCoursesCount})
              </button>
              <button
                type="button"
                onClick={() => setPricingFilter("payable")}
                className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                  pricingFilter === "payable"
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                    : "bg-white text-blue-700 border-blue-200 hover:bg-blue-50"
                }`}
              >
                Payable Courses ({payableCoursesCount})
              </button>
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

                        {/* Quick 1-click Publish / Draft Switch */}
                        <button
                          type="button"
                          onClick={() => handleTogglePublish(course)}
                          title="Click to toggle between Published and Draft"
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                            course.is_published
                              ? "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100"
                              : "bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200"
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              course.is_published ? "bg-emerald-600 animate-pulse" : "bg-slate-400"
                            }`}
                          />
                          {course.is_published ? "Published" : "Draft"}
                        </button>

                        {/* Quick Visibility Selector */}
                        <div className="inline-flex items-center">
                          <Select
                            value={course.visibility || "public"}
                            onValueChange={(val: "public" | "restricted" | "private") =>
                              handleQuickChangeVisibility(course.id, val)
                            }
                          >
                            <SelectTrigger
                              className={`h-7 px-2.5 text-xs font-semibold rounded-full border shadow-none focus:ring-0 ${
                                course.visibility === "restricted"
                                  ? "bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100"
                                  : course.visibility === "private"
                                  ? "bg-purple-50 text-purple-900 border-purple-300 hover:bg-purple-100"
                                  : "bg-blue-50 text-blue-900 border-blue-300 hover:bg-blue-100"
                              }`}
                            >
                              <div className="flex items-center gap-1.5">
                                <FontAwesomeIcon
                                  icon={
                                    course.visibility === "restricted"
                                      ? faShieldHalved
                                      : course.visibility === "private"
                                      ? faLock
                                      : faGlobe
                                  }
                                  className="h-3 w-3"
                                />
                                <SelectValue />
                              </div>
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-slate-900 border border-gray-200 z-[9999]">
                              <SelectItem value="public">
                                <div className="flex items-center gap-2">
                                  <FontAwesomeIcon icon={faGlobe} className="text-blue-600 h-3.5 w-3.5" />
                                  <span>🌐 Public (Open Catalog)</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="restricted">
                                <div className="flex items-center gap-2">
                                  <FontAwesomeIcon icon={faShieldHalved} className="text-amber-600 h-3.5 w-3.5" />
                                  <span>🔒 Restricted (Sponsor Exam / Cohorts)</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="private">
                                <div className="flex items-center gap-2">
                                  <FontAwesomeIcon icon={faLock} className="text-purple-600 h-3.5 w-3.5" />
                                  <span>👁️ Private (Draft / Internal Only)</span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {course.category && typeof course.category === "object" && course.category?.access_level === "restricted" && (
                          <Badge variant="outline" className="border-amber-400 text-amber-700 text-xs bg-amber-50/80">
                            Restricted Category
                          </Badge>
                        )}
                      </div>

                      <p className="text-sm text-muted-foreground mb-2">
                        {course.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        {course.price && parseFloat(course.price.toString()) > 0 ? (
                          <Badge className="bg-blue-50 text-blue-700 border-blue-200 font-semibold text-xs">
                            Payable: ${course.price}
                          </Badge>
                        ) : (
                          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold text-xs">
                            Free Course
                          </Badge>
                        )}
                        <span>Level: {course.level || "Not set"}</span>
                        <span>
                          Category:{" "}
                          {course.category && typeof course.category === "object"
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
