import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
// import { courseService } from "@/services/course.service"; // REMOVED: Using direct axios calls for authentication
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faEdit,
  faTrash,
  faArrowLeft,
  faVideo,
  faFileAlt,
  faBook,
  faClock,
  faLink,
  faUpload,
  faFilePdf,
  faFileImage,
  faFileWord,
  faFileExcel,
  faFilePowerpoint,
  faBars,
  faXmark,
  faChevronRight,
  faList,
  faLayerGroup,
} from "@fortawesome/free-solid-svg-icons";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Badge } from "@/components/ui/badge";
import logo from "@/assets/logo.png";

// --- Configuration Constants ---
const BASE_API_URL = "http://127.0.0.1:8000/api";
const LOCAL_STORAGE_TOKEN_KEY = "zse_training_token";
// -------------------------------

// --- Interfaces ---
interface CourseResource {
  id: number;
  name: string; // Used for filename/title
  file_type: string; // e.g., 'ppt', 'video'
  file_size: number;
  url: string; // The download/view URL
  uploaded_at: string;
}

interface CourseContent {
  id: number;
  title: string;
  description: string;
  type: "video" | "document" | "lesson";
  url?: string;
  duration?: string;
  position: number;
  // NOTE: Assuming the backend returns 'slides' but our interface is 'resources'
  resources?: CourseResource[];
  created_at?: string;
  updated_at?: string;
}
// --------------------

const ManageCourseContent = () => {
  const { courseId } = useParams<{ courseId: string }>(); // Explicitly type useParams result
  const navigate = useNavigate();
  const [contents, setContents] = useState<CourseContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingContent, setEditingContent] = useState<CourseContent | null>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isResourceDialogOpen, setIsResourceDialogOpen] = useState(false);
  const [uploadingResource, setUploadingResource] = useState(false);
  const { toast } = useToast();

  const [resourceType, setResourceType] = useState<"ppt" | "video">("ppt");
  const [resourceUrl, setResourceUrl] = useState("");
  const [resourceYoutubeUrl, setResourceYoutubeUrl] = useState("");
  const [selectedContentForResource, setSelectedContentForResource] =
    useState<CourseContent | null>(null);

  // Styled alert dialog states
  const [deleteContentId, setDeleteContentId] = useState<number | null>(null);
  const [deleteResourceData, setDeleteResourceData] = useState<{ contentId: number; resourceId: number } | null>(null);
  const [isDeletingItem, setIsDeletingItem] = useState(false);

  // State to hold the token value retrieved from local storage
  const [tokenValue, setTokenValue] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "lesson" as "video" | "document" | "lesson",
    url: "",
    duration: "",
    position: 0,
  });

  // --- TOKEN RETRIEVAL EFFECT ---
  useEffect(() => {
    const token = localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY);
    if (token) {
      setTokenValue(token);
    } else {
      console.warn(
        `Token missing from localStorage using key: ${LOCAL_STORAGE_TOKEN_KEY}`
      );
      // Consider redirecting to login here if unauthenticated access is not allowed
      setLoading(false);
    }
  }, []);

  // --- AXIOS CONFIG HELPER ---
  const getAuthHeaderConfig = (isMultipart: boolean = false) => {
    const headers: Record<string, string> = {
      Accept: "application/json",
    };

    if (tokenValue) {
      headers["Authorization"] = `Bearer ${tokenValue}`;
    } else {
      // If token is missing, reject/warn loudly
      console.error(
        "Authentication token is missing. API calls will likely fail."
      );
    }

    // Only set Content-Type for FormData, otherwise axios handles JSON
    if (isMultipart) {
      headers["Content-Type"] = "multipart/form-data";
    }

    return { headers };
  };
  // -----------------------------

  // --- FETCH CONTENTS ---
  const fetchContents = async () => {
    if (!courseId || !tokenValue) {
      setLoading(false);
      return; // Guard clause for missing ID or token
    }
    setLoading(true);
    try {
      // AUTHENTICATED CALL: Fetch all content for the course
      const response = await axios.get(
        `${BASE_API_URL}/courses/${courseId}/contents`,
        getAuthHeaderConfig()
      );

      // Assume backend returns an array of content, where each content item
      // has an array of 'slides' which we map to 'resources'.
      const contentArray = (response.data.data || response.data) as any[];

      // Map the backend structure to our frontend interface (Crucial step)
      const mappedContents: CourseContent[] = contentArray.map((content) => ({
        id: content.id,
        title: content.title,
        description: content.description,
        type: content.type as "video" | "document" | "lesson",
        url: content.url,
        duration: content.duration,
        position: content.position,
        resources: content.slides
          ? content.slides.map((slide: any) => ({
            id: slide.id,
            name:
              slide.title ||
              (slide.file_path
                ? slide.file_path.split("/").pop()
                : "Resource"), // Use title or infer name from path
            file_type: slide.type, // 'video' or file extension
            file_size: slide.file_size || 0, // Default to 0 if not provided (e.g., for YouTube)
            url: slide.url || slide.file_path, // The actual download/view link
            uploaded_at: slide.created_at,
          }))
          : [],
        created_at: content.created_at,
        updated_at: content.updated_at,
      }));

      const sortedContents = mappedContents.sort(
        (a, b) => a.position - b.position
      );
      setContents(sortedContents);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch course content. (Check token/CORS/Auth)",
        variant: "destructive",
      });
      console.error("Fetch content error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch content if the courseId is present AND we have the token
    if (courseId && tokenValue) fetchContents();
  }, [courseId, tokenValue]); // Depend on tokenValue now!
  // ----------------------

  const resetForm = () => {
    const maxPosition =
      contents.length > 0 ? Math.max(...contents.map((c) => c.position)) : -1;
    setFormData({
      title: "",
      description: "",
      type: "lesson",
      url: "",
      duration: "",
      position: maxPosition + 1,
    });
    setEditingContent(null);
  };

  // --- CREATE / UPDATE CONTENT ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId || !tokenValue) {
      toast({
        title: "Error",
        description: "Operation failed: Missing course ID or token.",
        variant: "destructive",
      });
      return;
    }

    const finalPosition = Math.max(0, formData.position);
    const contentData = {
      title: formData.title,
      description: formData.description || null,
      type: formData.type,
      url: formData.url || null,
      duration: formData.duration || null,
      position: finalPosition,
    };

    try {
      if (editingContent) {
        // AUTHENTICATED CALL: Update content
        await axios.put(
          `${BASE_API_URL}/courses/${courseId}/contents/${editingContent.id}`,
          contentData,
          getAuthHeaderConfig()
        );
        toast({
          title: "Success",
          description: "Content updated successfully.",
          className: "bg-green-50 text-green-900 border-green-200",
        });
      } else {
        // AUTHENTICATED CALL: Create content
        await axios.post(
          `${BASE_API_URL}/courses/${courseId}/contents`,
          contentData,
          getAuthHeaderConfig()
        );
        toast({
          title: "Success",
          description: "Content created successfully.",
          className: "bg-green-50 text-green-900 border-green-200",
        });
      }
      fetchContents();
      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      console.error("Error saving content:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message ||
          "Failed to save content. Is the API endpoint correct?",
        variant: "destructive",
      });
    }
  };

  // --- DELETE CONTENT ---
  const confirmDeleteContent = async () => {
    if (!courseId || !tokenValue || !deleteContentId) return;
    try {
      setIsDeletingItem(true);
      await axios.delete(
        `${BASE_API_URL}/courses/${courseId}/contents/${deleteContentId}`,
        getAuthHeaderConfig()
      );

      toast({
        title: "Success",
        description: "Content deleted successfully.",
        className: "bg-green-50 text-green-900 border-green-200",
      });
      setDeleteContentId(null);
      fetchContents();
    } catch (error: any) {
      console.error("Error deleting content:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to delete content.",
        variant: "destructive",
      });
    } finally {
      setIsDeletingItem(false);
    }
  };

  const handleDelete = (contentId: number) => {
    setDeleteContentId(contentId);
  };

  // --- DELETE RESOURCE (SLIDE) ---
  const confirmDeleteResource = async () => {
    if (!courseId || !tokenValue || !deleteResourceData) return;
    const { contentId, resourceId } = deleteResourceData;

    try {
      setIsDeletingItem(true);
      await axios.delete(
        `${BASE_API_URL}/contents/${contentId}/slides/${resourceId}`,
        getAuthHeaderConfig()
      );

      toast({
        title: "Success",
        description: "Resource removed successfully.",
        className: "bg-green-50 text-green-900 border-green-200",
      });

      setContents((prevContents) =>
        prevContents.map((c) => {
          if (c.id === contentId) {
            return {
              ...c,
              resources: c.resources.filter((r) => r.id !== resourceId),
            };
          }
          return c;
        })
      );
      setDeleteResourceData(null);
    } catch (error: any) {
      console.error("Error deleting resource:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to remove resource.",
        variant: "destructive",
      });
    } finally {
      setIsDeletingItem(false);
    }
  };

  const handleDeleteResource = (
    contentId: number,
    resourceId: number
  ) => {
    setDeleteResourceData({ contentId, resourceId });
  };

  // --- RESOURCE ATTACHMENT LOGIC (URL ONLY) ---
  const openEditDialog = (content: CourseContent) => {
    setEditingContent(content);
    setFormData({
      title: content.title,
      description: content.description || "",
      type: content.type,
      url: content.url || "",
      duration: content.duration || "",
      position: content.position,
    });
    setIsDialogOpen(true);
  };

  const openResourceDialog = (content: CourseContent) => {
    setSelectedContentForResource(content);
    setResourceUrl("");
    setResourceYoutubeUrl("");
    setResourceType("ppt");
    setIsResourceDialogOpen(true);
  };

  const handleResourceFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContentForResource || !tokenValue) return;

    // Validation for PowerPoint URL
    if (resourceType === "ppt" && !resourceUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid PowerPoint URL.",
        variant: "destructive",
      });
      return;
    }

    // Validation for YouTube URL
    if (resourceType === "video" && !resourceYoutubeUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid YouTube URL.",
        variant: "destructive",
      });
      return;
    }

    setUploadingResource(true);
    try {
      // Since we're only submitting URLs, use JSON instead of FormData
      const requestData: any = {
        type: resourceType,
        position: 1,
      };

      if (resourceType === "ppt") {
        requestData.title = "PowerPoint Presentation";
        requestData.url = resourceUrl;
        // Try different field names that backend might expect
        requestData.file_url = resourceUrl;
        requestData.file_path = resourceUrl;
      } else if (resourceType === "video") {
        requestData.title = "YouTube Video";
        requestData.url = resourceYoutubeUrl;
        requestData.video_url = resourceYoutubeUrl;
      }

      console.log("Submitting resource URL:", requestData);

      // AUTHENTICATED CALL: Upload resource/slide - use JSON
      const response = await axios.post(
        `${BASE_API_URL}/contents/${selectedContentForResource.id}/slides`,
        requestData,
        getAuthHeaderConfig(false) // false for JSON, not multipart
      );

      console.log("Resource attachment successful:", response.data);

      toast({
        title: "Success",
        description: "Resource attached successfully!",
        className: "bg-green-50 text-green-900 border-green-200",
      });

      // Close and clean up
      setIsResourceDialogOpen(false);
      setResourceUrl("");
      setResourceYoutubeUrl("");
      setSelectedContentForResource(null);

      // Re-fetch all content to update the resource lists correctly
      fetchContents();
    } catch (error: any) {
      console.error("Error attaching resource:", error);
      console.error("Error response data:", error.response?.data);
      console.error("Error response status:", error.response?.status);

      // Display more specific error message from backend if available
      const backendError = error.response?.data;
      let errorMessage = "Failed to attach resource.";

      if (backendError?.errors) {
        // Laravel validation errors
        const firstError = Object.values(backendError.errors)[0];
        errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
      } else if (backendError?.message) {

      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setUploadingResource(false);
    }
  };

  // --- UTILITY FUNCTIONS (Unchanged) ---
  const getContentIcon = (type: string) => {
    switch (type) {
      case "video":
        return faVideo;
      case "document":
        return faFileAlt;
      default:
        return faBook;
    }
  };

  const getFileIcon = (fileName?: string) => {
    if (!fileName) return faFileAlt;
    const ext = fileName.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "pdf":
        return faFilePdf;
      case "png":
      case "jpg":
      case "jpeg":
      case "gif":
      case "webp":
        return faFileImage;
      case "doc":
      case "docx":
        return faFileWord;
      case "xls":
      case "xlsx":
        return faFileExcel;
      case "ppt":
      case "pptx":
        return faFilePowerpoint;
      case "video":
        return faVideo; // Handle video type explicitly
      default:
        return faFileAlt;
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (bytes === undefined || bytes === null || bytes === 0) return "";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "video":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "document":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      default:
        return "bg-purple-50 text-purple-700 border-purple-200";
    }
  };

  const getTypeGradient = (type: string) => {
    switch (type) {
      case "video":
        return "from-blue-50 to-blue-100";
      case "document":
        return "from-emerald-50 to-emerald-100";
      default:
        return "from-purple-50 to-purple-100";
    }
  };
  // ----------------------------------------------

  const sidebarItems = [
    { icon: faList, label: "Content List", key: "list" },
    { icon: faLayerGroup, label: "Resources", key: "resources" },
  ];

  if (loading) {
    return (
      <div className="bg-background animate-pulse p-6">
        <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-6 bg-gray-50 rounded-lg border">
              <div className="flex justify-between items-start">
                <div className="flex-1 space-y-3">
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --- Render Logic ---
  return (
    <div className="bg-background">
      <main className="p-2 lg:p-6 bg-gradient-to-br from-muted/30 via-background to-accent/20">
        <div className="flex items-center space-x-4 mb-6">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2 h-4 w-4" />
            Back to Courses
          </Button>
          <h1 className="text-2xl font-bold text-secondary">
            Course Content Management
          </h1>
        </div>

        <div className="space-y-6">
          {/* Main Content Card */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="text-2xl font-bold">
                  Course Content
                </CardTitle>
                <p className="text-muted-foreground mt-1">
                  Manage lessons, videos, and documents for your course
                </p>
              </div>
              <div className="flex gap-2">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      onClick={resetForm}
                      className="bg-primary hover:bg-primary/90"
                    >
                      <FontAwesomeIcon
                        icon={faPlus}
                        className="mr-2 h-4 w-4"
                      />
                      Add Content
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-xl">
                        {editingContent ? "Edit Content" : "Add New Content"}
                      </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <Label
                            htmlFor="title"
                            className="text-sm font-medium"
                          >
                            Title *
                          </Label>
                          <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                title: e.target.value,
                              })
                            }
                            required
                            placeholder="Enter content title"
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label
                            htmlFor="description"
                            className="text-sm font-medium"
                          >
                            Description
                          </Label>
                          <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                description: e.target.value,
                              })
                            }
                            placeholder="Enter content description"
                            rows={3}
                            className="mt-1 resize-none"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label
                              htmlFor="type"
                              className="text-sm font-medium"
                            >
                              Content Type
                            </Label>
                            <Select
                              value={formData.type}
                              onValueChange={(
                                value: "video" | "document" | "lesson"
                              ) => setFormData({ ...formData, type: value })}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="lesson">Lesson</SelectItem>
                                <SelectItem value="video">Video</SelectItem>
                                <SelectItem value="document">
                                  Document
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label
                              htmlFor="position"
                              className="text-sm font-medium"
                            >
                              Display Order
                            </Label>
                            <Input
                              id="position"
                              type="number"
                              min="0"
                              value={formData.position}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  position: parseInt(e.target.value) || 0,
                                })
                              }
                              required
                              className="mt-1"
                            />
                          </div>
                        </div>

                        <div>
                          <Label
                            htmlFor="url"
                            className="text-sm font-medium"
                          >
                            <FontAwesomeIcon
                              icon={faLink}
                              className="mr-2 h-3 w-3"
                            />
                            Resource URL (e.g. for external content)
                          </Label>
                          <Input
                            id="url"
                            type="url"
                            value={formData.url}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                url: e.target.value,
                              })
                            }
                            placeholder="https://example.com/resource"
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label
                            htmlFor="duration"
                            className="text-sm font-medium"
                          >
                            <FontAwesomeIcon
                              icon={faClock}
                              className="mr-2 h-3 w-3"
                            />
                            Duration
                          </Label>
                          <Input
                            id="duration"
                            value={formData.duration}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                duration: e.target.value,
                              })
                            }
                            placeholder="e.g., 30 minutes, 1 hour"
                            className="mt-1"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsDialogOpen(false)}
                          className="min-w-24"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          className="min-w-24 bg-primary hover:bg-primary/90"
                          disabled={!tokenValue}
                        >
                          {editingContent ? "Update" : "Create"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                {contents.length === 0 ? (
                  <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-lg">
                    <FontAwesomeIcon
                      icon={faBook}
                      className="h-16 w-16 mx-auto mb-4 opacity-30"
                    />
                    <h3 className="text-xl font-semibold mb-2">
                      No content yet
                    </h3>
                    <p className="mb-6">
                      Start building your course by adding the first piece of
                      content
                    </p>
                    <Button
                      onClick={() => {
                        resetForm();
                        setIsDialogOpen(true);
                      }}
                      className="bg-primary hover:bg-primary/90"
                    >
                      <FontAwesomeIcon
                        icon={faPlus}
                        className="mr-2 h-4 w-4"
                      />
                      Add Your First Content
                    </Button>
                  </div>
                ) : (
                  contents.map((content) => (
                    <Card
                      key={content.id}
                      className={`border-l-4 border-l-primary bg-gradient-to-r ${getTypeGradient(
                        content.type
                      )} hover:shadow-md transition-all duration-200`}
                    >
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1 flex items-start gap-4">
                            <div
                              className={`p-3 rounded-lg border ${getTypeColor(
                                content.type
                              )}`}
                            >
                              <FontAwesomeIcon
                                icon={getContentIcon(content.type)}
                                className="h-5 w-5"
                              />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <h3 className="font-semibold text-lg text-foreground mb-1">
                                    {content.title}
                                  </h3>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <Badge
                                      variant="secondary"
                                      className={getTypeColor(content.type)}
                                    >
                                      {content.type}
                                    </Badge>
                                    <Badge
                                      variant="outline"
                                      className="text-xs font-normal"
                                    >
                                      Order: {content.position}
                                    </Badge>
                                    {content.resources &&
                                      content.resources.length > 0 && (
                                        <Badge
                                          variant="outline"
                                          className="text-xs font-normal bg-amber-50 text-amber-700 border-amber-200"
                                        >
                                          {content.resources.length}{" "}
                                          {content.resources.length === 1
                                            ? "Resource"
                                            : "Resources"}
                                        </Badge>
                                      )}
                                  </div>
                                </div>
                              </div>

                              {content.description && (
                                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                                  {content.description}
                                </p>
                              )}

                              <div className="flex items-center gap-6 text-sm text-muted-foreground mb-4">
                                {content.duration && (
                                  <div className="flex items-center gap-1">
                                    <FontAwesomeIcon
                                      icon={faClock}
                                      className="h-3 w-3"
                                    />
                                    <span>{content.duration}</span>
                                  </div>
                                )}
                                {content.url && (
                                  <a
                                    href={content.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-primary hover:text-primary/80 hover:underline transition-colors"
                                  >
                                    <FontAwesomeIcon
                                      icon={faLink}
                                      className="h-3 w-3"
                                    />
                                    <span>View Resource URL</span>
                                  </a>
                                )}
                              </div>

                              {/* Attached Resources */}
                              {content.resources &&
                                content.resources.length > 0 && (
                                  <div className="mt-4 pt-4 border-t border-border/50">
                                    <p className="text-xs font-medium text-muted-foreground mb-2">
                                      Attached Resources
                                    </p>
                                    <div className="space-y-2">
                                      {content.resources.map((resource) => (
                                        <div
                                          key={resource.id}
                                          className="flex items-center justify-between p-2 bg-amber-50/50 rounded border border-amber-200/50"
                                        >
                                          <div className="flex items-center gap-2 flex-1 min-w-0">
                                            <FontAwesomeIcon
                                              icon={getFileIcon(
                                                resource.file_type === "video"
                                                  ? "video"
                                                  : resource.name
                                              )}
                                              className="h-4 w-4 text-amber-600 flex-shrink-0"
                                            />
                                            <div className="flex-1 min-w-0">
                                              <p className="text-sm font-medium text-foreground truncate">
                                                {resource.name}
                                              </p>
                                              <p className="text-xs text-muted-foreground">
                                                {formatFileSize(
                                                  resource.file_size
                                                )}
                                              </p>
                                            </div>
                                          </div>
                                          <div className="flex gap-1 ml-2">
                                            <a
                                              href={resource.url}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="p-1.5 hover:bg-amber-100 rounded text-amber-700"
                                              title="Download/View"
                                            >
                                              <FontAwesomeIcon
                                                icon={faLink}
                                                className="h-3.5 w-3.5"
                                              />
                                            </a>
                                            <button
                                              onClick={() =>
                                                handleDeleteResource(
                                                  content.id,
                                                  resource.id
                                                )
                                              }
                                              className="p-1.5 hover:bg-red-100 rounded text-red-600"
                                              title="Delete Resource"
                                            >
                                              <FontAwesomeIcon
                                                icon={faTrash}
                                                className="h-3.5 w-3.5"
                                              />
                                            </button>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                              {/* Add Resource Button (Resource Dialog Trigger) */}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openResourceDialog(content)}
                                className="mt-3 border-amber-200 text-amber-700 hover:bg-amber-50"
                              >
                                <FontAwesomeIcon
                                  icon={faUpload}
                                  className="mr-2 h-3 w-3"
                                />
                                Add Resource
                              </Button>
                            </div>
                          </div>

                          <div className="flex gap-2 ml-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditDialog(content)}
                              className="h-9 w-9 p-0"
                              title="Edit"
                            >
                              <FontAwesomeIcon
                                icon={faEdit}
                                className="h-4 w-4"
                              />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(content.id)}
                              className="h-9 w-9 p-0"
                              title="Delete"
                            >
                              <FontAwesomeIcon
                                icon={faTrash}
                                className="h-4 w-4"
                              />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Resource Attachment Dialog */}
      <Dialog
        open={isResourceDialogOpen}
        onOpenChange={setIsResourceDialogOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Attach Resource</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Add a PowerPoint URL or YouTube link to{" "}
              <span className="font-semibold">
                "{selectedContentForResource?.title}"
              </span>
            </p>
          </DialogHeader>

          <form onSubmit={handleResourceFormSubmit} className="space-y-4">
            {/* Resource Type Selector */}
            <div>
              <Label className="text-sm font-medium">Resource Type *</Label>
              <div className="mt-2 flex gap-3">
                <Button
                  type="button"
                  variant={resourceType === "ppt" ? "default" : "outline"}
                  onClick={() => {
                    setResourceType("ppt");
                    setResourceYoutubeUrl("");
                  }}
                >
                  PowerPoint URL
                </Button>
                <Button
                  type="button"
                  variant={resourceType === "video" ? "default" : "outline"}
                  onClick={() => {
                    setResourceType("video");
                    setResourceUrl("");
                  }}
                >
                  YouTube Link
                </Button>
              </div>
            </div>

            {resourceType === "ppt" && (
              <div>
                <Label htmlFor="powerpoint-url" className="text-sm font-medium">
                  PowerPoint URL *
                </Label>
                <Input
                  id="powerpoint-url"
                  type="url"
                  placeholder="https://ik.imagekit.io/f1r0cqpaq/Mexican%20Food%20Ppt%20-%20Playfull.pptx"
                  className="w-full mt-2"
                  value={resourceUrl}
                  onChange={(e) => setResourceUrl(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter the direct URL to your PowerPoint file
                </p>
              </div>
            )}

            {/* YouTube URL Input (Video only) */}
            {resourceType === "video" && (
              <div>
                <Label
                  htmlFor="youtube-url-input"
                  className="text-sm font-medium"
                >
                  YouTube URL *
                </Label>
                <Input
                  id="youtube-url-input"
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=aqz-KE-bpKQ"
                  className="w-full mt-2"
                  value={resourceYoutubeUrl}
                  onChange={(e) => setResourceYoutubeUrl(e.target.value)}
                  required
                />
              </div>
            )}

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsResourceDialogOpen(false);
                  setResourceUrl("");
                  setResourceYoutubeUrl("");
                  setSelectedContentForResource(null);
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90"
                disabled={
                  uploadingResource ||
                  !tokenValue ||
                  (resourceType === "ppt" && !resourceUrl.trim()) ||
                  (resourceType === "video" && !resourceYoutubeUrl.trim())
                }
              >
                {uploadingResource ? "Adding..." : "Add Resource"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Styled Modern Delete Content Confirmation Dialog */}
      <AlertDialog open={deleteContentId !== null} onOpenChange={(open) => !open && setDeleteContentId(null)}>
        <AlertDialogContent className="max-w-md bg-white border border-gray-200 shadow-2xl rounded-2xl p-6">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold text-gray-900">
              Delete Course Module
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-gray-600 mt-2">
              Are you sure you want to delete this module? All attached lectures, interactive slides, and student progress for this module will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 flex items-center justify-end gap-3">
            <AlertDialogCancel disabled={isDeletingItem} className="text-xs font-semibold rounded-lg">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteContent}
              disabled={isDeletingItem}
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-sm"
            >
              {isDeletingItem ? "Deleting..." : "Yes, Delete Module"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Styled Modern Remove Resource Confirmation Dialog */}
      <AlertDialog open={deleteResourceData !== null} onOpenChange={(open) => !open && setDeleteResourceData(null)}>
        <AlertDialogContent className="max-w-md bg-white border border-gray-200 shadow-2xl rounded-2xl p-6">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold text-gray-900">
              Remove Learning Resource
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-gray-600 mt-2">
              Are you sure you want to remove this slide/resource from the curriculum?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 flex items-center justify-end gap-3">
            <AlertDialogCancel disabled={isDeletingItem} className="text-xs font-semibold rounded-lg">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteResource}
              disabled={isDeletingItem}
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-sm"
            >
              {isDeletingItem ? "Removing..." : "Yes, Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ManageCourseContent;
