import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faPlus, 
  faEdit, 
  faTrash, 
  faSearch, 
  faExternalLinkAlt, 
  faList, 
  faGripVertical,
  faNewspaper,
  faUserPen,
  faCalendarAlt,
  faEye,
  faChevronLeft,
  faChevronRight,
  faFilter,
} from "@fortawesome/free-solid-svg-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { blogService, BlogPost } from "@/services/blog.service";
import { transformBlogPost, formatDate, getFallbackImage } from "@/utils/blogHelpers";

const ManageBlog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAuthor, setSelectedAuthor] = useState("All");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 8;

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    image: "",
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const data = await blogService.getAllPosts();
      const transformed = (Array.isArray(data) ? data : []).map((post) => transformBlogPost(post));
      setPosts(transformed);
    } catch (error) {
      toast.error("Failed to fetch blog posts");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPost) {
        await blogService.updatePost(editingPost.id, formData);
        toast.success("Blog post updated successfully");
      } else {
        await blogService.createPost(formData);
        toast.success("Blog post created successfully");
      }
      setIsDialogOpen(false);
      resetForm();
      fetchPosts();
    } catch (error) {
      toast.error(editingPost ? "Failed to update post" : "Failed to create post");
      console.error(error);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      setIsDeleting(true);
      await blogService.deletePost(deleteTargetId);
      toast.success("Blog post deleted successfully");
      setDeleteTargetId(null);
      fetchPosts();
    } catch (error) {
      toast.error("Failed to delete post");
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDelete = (id: number) => {
    setDeleteTargetId(id);
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      content: post.content,
      image: post.image || "",
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({ title: "", content: "", image: "" });
    setEditingPost(null);
  };

  // Extract author name safely
  const getAuthorName = (post: BlogPost): string => {
    if (typeof post.author === "string" && post.author.trim()) return post.author.trim();
    if (post.author && typeof post.author === "object" && post.author.name) return post.author.name;
    if (post.user?.name && post.user.name !== "zsetraining") return post.user.name;
    return "ZSE Training Faculty";
  };

  // Authors filter list
  const authorsList = ["All", ...Array.from(new Set(posts.map(getAuthorName)))];

  // Filter posts
  const filteredPosts = posts.filter((post) => {
    const q = searchTerm.toLowerCase().trim();
    const titleMatch = (post.title || "").toLowerCase().includes(q);
    const contentMatch = (post.excerpt || post.content || "").toLowerCase().includes(q);
    const authorMatch = getAuthorName(post).toLowerCase().includes(q);

    const matchesSearch = !q || titleMatch || contentMatch || authorMatch;
    const matchesAuthor = selectedAuthor === "All" || getAuthorName(post) === selectedAuthor;

    return matchesSearch && matchesAuthor;
  });

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / postsPerPage));
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);

  // Reset to page 1 on filter/search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedAuthor]);

  return (
    <div className="space-y-6">
      {/* Header & KPI Overview */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Content & Editorial Management
            </span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Manage Blog Posts & Market Insights
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Curate financial research, retail investor profiles, and educational articles for the ZSE Training Institute.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="bg-slate-100 text-slate-700 px-3 py-1 font-bold text-xs border border-slate-200">
            {posts.length} Total Articles
          </Badge>

          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}
          >
            <DialogTrigger asChild>
              <Button className="bg-[#00aeef] hover:bg-[#008cc0] text-white font-bold text-xs uppercase tracking-wider gap-2 px-5 py-2.5 rounded-xl shadow-md shadow-[#00aeef]/20 transition-all">
                <FontAwesomeIcon icon={faPlus} />
                <span>Create New Article</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-slate-900">
                  {editingPost ? "Edit Article" : "Create New Blog Article"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-5 mt-2">
                <div className="space-y-1.5">
                  <Label htmlFor="title" className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Article Title *
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. From a Retail Investor’s Perspective - Kudzai Nolan Mafuta"
                    className="h-11 rounded-xl"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="image" className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Featured Thumbnail URL
                  </Label>
                  <Input
                    id="image"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="https://... or /assets/... or /storage/uploads/..."
                    className="h-11 rounded-xl"
                  />
                  <p className="text-[11px] text-slate-400">
                    Recommended aspect ratio: 16:9 or square. If left empty, an authentic fintech asset will be used automatically.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="content" className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Article Body & Editorial Content *
                  </Label>
                  <ReactQuill
                    theme="snow"
                    value={formData.content}
                    onChange={(value) => setFormData({ ...formData, content: value })}
                    modules={{
                      toolbar: [
                        [{ header: [1, 2, 3, false] }],
                        ["bold", "italic", "underline", "strike"],
                        [{ list: "ordered" }, { list: "bullet" }],
                        ["link", "image"],
                        ["clean"],
                      ],
                    }}
                    formats={[
                      "header",
                      "bold",
                      "italic",
                      "underline",
                      "strike",
                      "list",
                      "bullet",
                      "link",
                      "image",
                    ]}
                    style={{ minHeight: "220px" }}
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-100">
                  <Button type="submit" className="flex-1 bg-[#00aeef] hover:bg-[#008cc0] text-white font-bold text-xs uppercase tracking-wider py-2.5 rounded-xl">
                    {editingPost ? "Save Changes" : "Publish Article to Blog"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false);
                      resetForm();
                    }}
                    className="rounded-xl text-xs font-bold"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search, Filter & Layout Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
        {/* Search */}
        <div className="relative flex-1">
          <FontAwesomeIcon
            icon={faSearch}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm"
          />
          <Input
            placeholder="Search articles by title, author, or keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-10 rounded-xl bg-slate-50/80 border-slate-200 text-xs"
          />
        </div>

        {/* Filters & View Toggles */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Author filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <FontAwesomeIcon icon={faFilter} className="text-slate-400 text-xs" />
            <select
              value={selectedAuthor}
              onChange={(e) => setSelectedAuthor(e.target.value)}
              className="h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:border-[#00aeef]"
            >
              {authorsList.map((author) => (
                <option key={author} value={author}>
                  {author === "All" ? "All Authors" : author}
                </option>
              ))}
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="inline-flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === "list"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
              title="Compact Table List View"
            >
              <FontAwesomeIcon icon={faList} className="mr-1.5" />
              <span>List</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === "grid"
                  ? "bg-[#00aeef] text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
              title="Visual Card Grid View"
            >
              <FontAwesomeIcon icon={faGripVertical} className="mr-1.5" />
              <span>Grid</span>
            </button>
          </div>
        </div>
      </div>

      {/* Posts Section */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="p-5 bg-white rounded-2xl border border-slate-200 flex items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <Skeleton className="h-9 w-24 rounded-lg shrink-0" />
            </div>
          ))}
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
          <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-xl mx-auto mb-3">
            <FontAwesomeIcon icon={faNewspaper} />
          </div>
          <h3 className="text-base font-bold text-slate-800">No blog articles found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchTerm || selectedAuthor !== "All"
              ? "No articles matched your active search query or author filter."
              : "No blog articles are currently published in the database."}
          </p>
          {(searchTerm || selectedAuthor !== "All") && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm("");
                setSelectedAuthor("All");
              }}
              className="mt-4 text-xs font-bold rounded-xl"
            >
              Clear All Filters
            </Button>
          )}
        </div>
      ) : viewMode === "list" ? (
        /* ========================================================================= */
        /* COMPACT EXECUTIVE TABLE / LIST VIEW (Clean, perfectly framed thumbnails)  */
        /* ========================================================================= */
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs divide-y divide-slate-100">
          {currentPosts.map((post) => {
            const author = getAuthorName(post);
            return (
              <div
                key={post.id}
                className="p-5 hover:bg-slate-50/70 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 group"
              >
                {/* Left: Thumbnail & Details */}
                <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
                  {/* Clean Framed Thumbnail (No ugly stretching or forehead cropping!) */}
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 relative shadow-2xs">
                    <img
                      src={post.image || getFallbackImage(post.id)}
                      alt={post.title}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = getFallbackImage(post.id);
                      }}
                    />
                  </div>

                  {/* Text Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <Badge variant="secondary" className="bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200/60">
                        {post.category || "Market Insights"}
                      </Badge>
                      <span className="text-[11px] text-slate-400">
                        ID #{post.id}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#00aeef] transition-colors truncate">
                      {post.title}
                    </h3>

                    {/* Excerpt as pure plain text (No HTML images inside!) */}
                    <p className="text-xs text-slate-500 line-clamp-1 mt-0.5 leading-relaxed">
                      {post.excerpt || "No excerpt provided for this article."}
                    </p>

                    <div className="flex items-center gap-4 mt-2 text-[11px] text-slate-400">
                      <span className="inline-flex items-center gap-1 font-medium text-slate-600">
                        <FontAwesomeIcon icon={faUserPen} className="text-[10px] text-slate-400" />
                        <span>{author}</span>
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <FontAwesomeIcon icon={faCalendarAlt} className="text-[10px]" />
                        <span>{formatDate(post.created_at)}</span>
                      </span>
                      {post.views !== undefined && (
                        <span className="inline-flex items-center gap-1">
                          <FontAwesomeIcon icon={faEye} className="text-[10px]" />
                          <span>{post.views} views</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  <a
                    href={`/blog/${post.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center h-9 px-3 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:text-[#00aeef] hover:border-[#00aeef]/40 hover:bg-slate-50 transition-colors"
                    title="View Published Article in New Tab"
                  >
                    <FontAwesomeIcon icon={faExternalLinkAlt} className="mr-1.5 text-[10px]" />
                    <span>View</span>
                  </a>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(post)}
                    className="h-9 px-3 text-xs font-bold rounded-lg border-slate-200 text-slate-700 hover:text-[#00aeef] hover:border-[#00aeef]/40"
                    title="Edit Article"
                  >
                    <FontAwesomeIcon icon={faEdit} className="mr-1.5" />
                    <span>Edit</span>
                  </Button>

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(post.id)}
                    className="h-9 px-3 text-xs font-bold rounded-lg bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-600 hover:text-white transition-all shadow-none"
                    title="Delete Article"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ========================================================================= */
        /* VISUAL CARD GRID VIEW (Modern responsive 3-column cards)                  */
        /* ========================================================================= */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentPosts.map((post) => {
            const author = getAuthorName(post);
            return (
              <Card
                key={post.id}
                className="overflow-hidden border border-slate-200 hover:border-[#00aeef]/40 hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Aspect-Ratio Guarded Thumbnail Container */}
                  <div className="aspect-[16/10] w-full overflow-hidden bg-slate-100 border-b border-slate-100 relative">
                    <img
                      src={post.image || getFallbackImage(post.id)}
                      alt={post.title}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = getFallbackImage(post.id);
                      }}
                    />
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold border-0">
                        {post.category || "Market Insights"}
                      </Badge>
                    </div>
                  </div>

                  <CardHeader className="p-5 pb-2">
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-[#00aeef] transition-colors line-clamp-2 leading-snug">
                      {post.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-2 leading-relaxed">
                      {post.excerpt || "No excerpt provided for this article."}
                    </p>
                  </CardHeader>
                </div>

                <CardContent className="p-5 pt-3 border-t border-slate-100/80 mt-4">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-3">
                    <span className="font-semibold text-slate-700 truncate max-w-[140px]">
                      {author}
                    </span>
                    <span>{formatDate(post.created_at)}</span>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                    <a
                      href={`/blog/${post.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-[#00aeef] hover:underline inline-flex items-center gap-1"
                    >
                      <span>Read Live</span>
                      <FontAwesomeIcon icon={faExternalLinkAlt} className="text-[10px]" />
                    </a>

                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(post)}
                        className="h-8 px-2.5 text-xs font-bold rounded-lg"
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(post.id)}
                        className="h-8 px-2.5 text-xs font-bold rounded-lg bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-600 hover:text-white shadow-none"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs mt-6">
          <p className="text-xs text-slate-500">
            Showing <strong className="text-slate-800">{indexOfFirstPost + 1}</strong> to{" "}
            <strong className="text-slate-800">
              {Math.min(indexOfLastPost, filteredPosts.length)}
            </strong>{" "}
            of <strong className="text-slate-800">{filteredPosts.length}</strong> articles
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="h-9 px-3 text-xs font-bold rounded-xl"
            >
              <FontAwesomeIcon icon={faChevronLeft} className="mr-1 text-[10px]" />
              <span>Previous</span>
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                    currentPage === pageNum
                      ? "bg-[#00aeef] text-white shadow-xs"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {pageNum}
                </button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="h-9 px-3 text-xs font-bold rounded-xl"
            >
              <span>Next</span>
              <FontAwesomeIcon icon={faChevronRight} className="ml-1 text-[10px]" />
            </Button>
          </div>
        </div>
      )}

      {/* Styled Modern Delete Confirmation Dialog */}
      <AlertDialog open={deleteTargetId !== null} onOpenChange={(open) => !open && setDeleteTargetId(null)}>
        <AlertDialogContent className="max-w-md bg-white border border-gray-200 shadow-2xl rounded-2xl p-6">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold text-gray-900">
              Delete Article
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-gray-600 mt-2">
              Are you sure you want to permanently delete this article? This action cannot be undone and will remove it from the public institute blog.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 flex items-center justify-end gap-3">
            <AlertDialogCancel disabled={isDeleting} className="text-xs font-semibold rounded-lg">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-sm"
            >
              {isDeleting ? "Deleting..." : "Yes, Delete Article"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ManageBlog;
