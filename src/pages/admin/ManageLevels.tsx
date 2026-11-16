import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
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
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faEdit,
  faTrash,
  faSearch,
  faLayerGroup,
  faCheck,
  faSpinner,
  faBookOpen,
} from "@fortawesome/free-solid-svg-icons";
import { courseService, CourseLevelItem } from "@/services/course.service";

const COLOR_PRESETS = [
  { label: "Emerald (Green)", hex: "#10b981" },
  { label: "Sky (Blue)", hex: "#0284c7" },
  { label: "Amber (Orange)", hex: "#f59e0b" },
  { label: "Violet (Purple)", hex: "#8b5cf6" },
  { label: "Rose (Red)", hex: "#f43f5e" },
  { label: "Slate (Neutral)", hex: "#64748b" },
];

export const ManageLevels = () => {
  const [levels, setLevels] = useState<CourseLevelItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  // Form modal states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLevel, setEditingLevel] = useState<CourseLevelItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "#0284c7",
    position: 0,
    is_active: true,
  });

  // Delete modal state
  const [levelToDelete, setLevelToDelete] = useState<CourseLevelItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchLevels();
  }, []);

  const fetchLevels = async () => {
    try {
      setLoading(true);
      const data = await courseService.getLevels();
      setLevels(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching levels:", error);
      toast({
        title: "Error",
        description: "Failed to load difficulty levels.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const openCreateDialog = () => {
    setEditingLevel(null);
    setFormData({
      name: "",
      description: "",
      color: "#0284c7",
      position: levels.length + 1,
      is_active: true,
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (level: CourseLevelItem) => {
    setEditingLevel(level);
    setFormData({
      name: level.name,
      description: level.description || "",
      color: level.color || "#0284c7",
      position: level.position ?? 0,
      is_active: level.is_active ?? true,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Level name is required.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      if (editingLevel) {
        await courseService.updateLevel(editingLevel.id, formData);
        toast({
          title: "Level Updated",
          description: `Difficulty level "${formData.name}" has been updated.`,
        });
      } else {
        await courseService.createLevel(formData);
        toast({
          title: "Level Created",
          description: `New difficulty level "${formData.name}" created successfully.`,
        });
      }

      setIsDialogOpen(false);
      fetchLevels();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to save difficulty level.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!levelToDelete) return;
    try {
      setDeleting(true);
      await courseService.deleteLevel(levelToDelete.id);
      toast({
        title: "Deleted",
        description: `Level "${levelToDelete.name}" deleted successfully.`,
      });
      setLevelToDelete(null);
      fetchLevels();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast({
        title: "Cannot Delete",
        description:
          err.response?.data?.message ||
          "Failed to delete level. Please ensure no courses are assigned to this level.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  const filteredLevels = levels.filter(
    (lvl) =>
      lvl.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lvl.description && lvl.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <FontAwesomeIcon icon={faLayerGroup} className="text-[#00aeef] h-6 w-6" />
            Course Difficulty Levels
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Configure learning difficulty tiers and tags available when publishing courses.
          </p>
        </div>

        <Button
          onClick={openCreateDialog}
          className="bg-[#00aeef] hover:bg-[#009ad1] text-white font-bold text-xs h-9 px-4 rounded-xl shadow-sm self-start sm:self-auto"
        >
          <FontAwesomeIcon icon={faPlus} className="mr-2" />
          Add New Level
        </Button>
      </div>

      {/* Main Card */}
      <Card className="border border-gray-200 shadow-sm rounded-2xl bg-white overflow-hidden">
        <CardHeader className="bg-gray-50/60 border-b border-gray-100 py-4 px-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-base font-bold text-gray-900">Difficulty Tiers</CardTitle>
            <CardDescription className="text-xs text-gray-500">
              Active tiers appear in course creation dialogs and the public catalog filter.
            </CardDescription>
          </div>

          <div className="relative w-full md:w-64">
            <FontAwesomeIcon
              icon={faSearch}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs"
            />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search levels..."
              className="pl-9 h-9 text-xs rounded-xl bg-white border-gray-200 focus-visible:ring-[#00aeef]"
            />
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : filteredLevels.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-12 h-12 bg-sky-50 text-[#00aeef] rounded-2xl mx-auto flex items-center justify-center">
                <FontAwesomeIcon icon={faLayerGroup} className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-bold text-gray-900">No difficulty levels found</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                {searchTerm
                  ? "No levels matched your search term."
                  : "Get started by adding your first difficulty tier."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredLevels.map((lvl) => (
                <div
                  key={lvl.id}
                  className="p-4 rounded-xl border border-gray-200/80 hover:border-gray-300 hover:shadow-md transition-all bg-white flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                          style={{ backgroundColor: lvl.color || "#00aeef" }}
                        />
                        <h4 className="font-bold text-sm text-gray-900">{lvl.name}</h4>
                        <span className="text-[10px] text-gray-400 font-mono">#{lvl.position ?? 0}</span>
                      </div>

                      {lvl.is_active ? (
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-semibold">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-gray-400 text-[10px]">
                          Inactive
                        </Badge>
                      )}
                    </div>

                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                      {lvl.description || "No description provided."}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs">
                    <span className="inline-flex items-center gap-1.5 text-gray-500 font-medium">
                      <FontAwesomeIcon icon={faBookOpen} className="text-gray-400 text-[10px]" />
                      {lvl.courses_count ?? 0} course(s) assigned
                    </span>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditDialog(lvl)}
                        className="h-8 px-2.5 text-xs rounded-lg border-gray-200 hover:bg-gray-50 text-gray-700"
                      >
                        <FontAwesomeIcon icon={faEdit} className="mr-1.5 text-xs text-sky-600" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setLevelToDelete(lvl)}
                        className="h-8 px-2.5 text-xs rounded-lg hover:bg-rose-50 text-rose-600 hover:text-rose-700"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add / Edit Level Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md rounded-2xl bg-white border border-gray-200 shadow-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900">
              {editingLevel ? "Edit Difficulty Level" : "Add New Difficulty Level"}
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Define the difficulty tier name, display color, and sort position.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-1">
              <Label className="text-xs font-bold text-gray-700">Tier Name *</Label>
              <Input
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Beginner, Advanced, Executive"
                className="rounded-xl text-xs h-9"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold text-gray-700">Description</Label>
              <Textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Target learner audience and prerequisites..."
                className="rounded-xl text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold text-gray-700">Badge Color</Label>
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-8 h-8 rounded-lg cursor-pointer border border-gray-200 p-0.5"
                />
                <Input
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="rounded-xl text-xs h-8 w-28 font-mono"
                />
              </div>

              {/* Quick Palette */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {COLOR_PRESETS.map((preset) => (
                  <button
                    type="button"
                    key={preset.hex}
                    onClick={() => setFormData({ ...formData, color: preset.hex })}
                    className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border transition-all ${
                      formData.color === preset.hex
                        ? "border-gray-900 font-bold shadow-xs"
                        : "border-gray-200 text-gray-600 hover:border-gray-400"
                    }`}
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: preset.hex }}
                    />
                    {preset.label.split(" ")[0]}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-gray-700">Sort Position</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.position}
                  onChange={(e) =>
                    setFormData({ ...formData, position: parseInt(e.target.value, 10) || 0 })
                  }
                  className="rounded-xl text-xs h-9"
                />
              </div>

              <div className="space-y-1 flex flex-col justify-end">
                <div className="flex items-center justify-between p-2 rounded-xl border border-gray-200 bg-gray-50/60 h-9">
                  <Label className="text-xs font-medium text-gray-700 cursor-pointer" htmlFor="level-active-switch">
                    Active
                  </Label>
                  <Switch
                    id="level-active-switch"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="pt-4 flex gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={submitting}
                onClick={() => setIsDialogOpen(false)}
                className="rounded-xl text-xs h-9"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-[#00aeef] hover:bg-[#009ad1] text-white font-bold text-xs h-9 rounded-xl shadow-sm"
              >
                {submitting ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-1.5" />
                    Saving...
                  </>
                ) : editingLevel ? (
                  "Update Level"
                ) : (
                  "Create Level"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert */}
      <AlertDialog open={levelToDelete !== null} onOpenChange={(open) => !open && setLevelToDelete(null)}>
        <AlertDialogContent className="max-w-md bg-white border border-gray-200 shadow-2xl rounded-2xl p-6">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold text-gray-900">
              Delete Difficulty Tier
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-gray-600 mt-2">
              Are you sure you want to delete the tier <strong>"{levelToDelete?.name}"</strong>?
              {levelToDelete && (levelToDelete.courses_count ?? 0) > 0 && (
                <span className="block mt-2 text-rose-600 font-semibold">
                  Warning: There are {levelToDelete.courses_count} course(s) currently tagged with this level. You must reassign those courses before deleting this level.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 flex items-center justify-end gap-3">
            <AlertDialogCancel disabled={deleting} className="text-xs font-semibold rounded-xl">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleting || ((levelToDelete?.courses_count ?? 0) > 0)}
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-sm disabled:opacity-50"
            >
              {deleting ? "Deleting..." : "Delete Level"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
export default ManageLevels;
