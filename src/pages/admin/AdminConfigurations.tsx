import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faPlus, faTrash, faUsers, faCheck, faShieldHalved } from "@fortawesome/free-solid-svg-icons";
import { API_BASE_URL } from "@/constants/api";
import { courseService, UserGroup } from "@/services/course.service";

interface Category {
  id: number;
  name: string;
  slug?: string;
  description?: string;
  is_active?: boolean;
  access_level?: "public" | "restricted";
  groups?: UserGroup[];
}

function AdminConfigurations() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [accessLevel, setAccessLevel] = useState<"public" | "restricted">("public");
  const [selectedGroupIds, setSelectedGroupIds] = useState<number[]>([]);
  const [isActive, setIsActive] = useState(true);

  // Group binding dialog state for existing categories
  const [bindingCategory, setBindingCategory] = useState<Category | null>(null);
  const [isBindingModalOpen, setIsBindingModalOpen] = useState(false);
  const [dialogGroupIds, setDialogGroupIds] = useState<number[]>([]);
  const [savingBindings, setSavingBindings] = useState(false);

  const [availableGroups, setAvailableGroups] = useState<UserGroup[]>([]);

  const { toast } = useToast();
  const API_URL = `${API_BASE_URL}/categories`;

  const token = localStorage.getItem("zse_training_token");
  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  useEffect(() => {
    fetchCategories();
    fetchCohortGroups();
  }, []);

  const fetchCohortGroups = async () => {
    try {
      const res = await courseService.getGroups();
      setAvailableGroups(Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []);
    } catch (e) {
      console.error("Error loading cohort groups:", e);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(API_URL, { headers: authHeaders });
      const json = await response.json();
      const result = Array.isArray(json.data?.data)
        ? json.data.data
        : Array.isArray(json.data)
        ? json.data
        : [];
      setCategories(result);
    } catch (error) {
      console.error("❌ Fetch Error:", error);
      toast({
        title: "Error",
        description: "Failed to fetch categories",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!name.trim()) {
      return toast({
        title: "Validation Error",
        description: "Category name is required",
        variant: "destructive",
      });
    }

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          name,
          slug: slug || undefined,
          description,
          access_level: accessLevel,
          group_ids: accessLevel === "restricted" ? selectedGroupIds : [],
          is_active: isActive,
        }),
      });

      const json = await response.json();
      if (!json.data) throw new Error("Invalid response");

      setCategories((prev) => [json.data, ...prev]);

      setName("");
      setSlug("");
      setDescription("");
      setAccessLevel("public");
      setSelectedGroupIds([]);
      setIsActive(true);

      toast({
        title: "Success",
        description: `Category created with ${accessLevel} scope.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create category",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCategory = async (categoryId: number) => {
    if (!window.confirm("Delete this category?")) return;

    try {
      await fetch(`${API_URL}/${categoryId}`, {
        method: "DELETE",
        headers: authHeaders,
      });

      setCategories((prev) => prev.filter((cat) => cat.id !== categoryId));
      toast({
        title: "Deleted",
        description: "Category removed successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive",
      });
    }
  };

  const handleOpenBindingModal = (cat: Category) => {
    setBindingCategory(cat);
    const existingIds = cat.groups?.map((g) => g.id) || [];
    setDialogGroupIds(existingIds);
    setIsBindingModalOpen(true);
  };

  const handleSaveBindings = async () => {
    if (!bindingCategory) return;

    try {
      setSavingBindings(true);
      await courseService.syncCategoryGroups(bindingCategory.id, dialogGroupIds);
      toast({
        title: "Groups Updated",
        description: `Authorized cohort groups updated for ${bindingCategory.name}.`,
      });
      setIsBindingModalOpen(false);
      fetchCategories();
    } catch (error) {
      console.error("Binding error:", error);
      toast({
        title: "Error",
        description: "Failed to update category groups.",
        variant: "destructive",
      });
    } finally {
      setSavingBindings(false);
    }
  };

  const toggleDialogGroup = (id: number) => {
    setDialogGroupIds((prev) =>
      prev.includes(id) ? prev.filter((gId) => gId !== id) : [...prev, id]
    );
  };

  const toggleCreateGroup = (id: number) => {
    setSelectedGroupIds((prev) =>
      prev.includes(id) ? prev.filter((gId) => gId !== id) : [...prev, id]
    );
  };

  const filteredCategories = categories.filter((cat) =>
    cat.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Card>
        <CardContent className="space-y-4 pt-6">
          <Skeleton className="h-10 w-full" />
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-slate-900">
          Course Categories & Access Scopes
        </CardTitle>
        <p className="text-xs text-slate-500">
          Create public categories (e.g. "REITs") or restricted categories bound to specific cohort groups (e.g. "REITs - for Brokers").
        </p>
      </CardHeader>

      <CardContent className="space-y-8">
        {/* Add Category Form */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
            {/* Name */}
            <div className="md:col-span-3 space-y-1">
              <label className="text-xs font-semibold text-slate-700">Category Name *</label>
              <Input
                placeholder="e.g. REITs or REITs - for Brokers"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="text-sm bg-white"
              />
            </div>

            {/* Access Scope (Public vs Restricted) */}
            <div className="md:col-span-3 space-y-1">
              <label className="text-xs font-semibold text-slate-700">Access Scope *</label>
              <Select value={accessLevel} onValueChange={(val: any) => setAccessLevel(val)}>
                <SelectTrigger className="text-sm bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">🌐 Public (Open Catalog)</SelectItem>
                  <SelectItem value="restricted">🔒 Restricted (Cohort Gated)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="md:col-span-4 space-y-1">
              <label className="text-xs font-semibold text-slate-700">Description (Optional)</label>
              <Input
                placeholder="Brief category summary"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="text-sm bg-white"
              />
            </div>

            {/* Active Switch and Button */}
            <div className="md:col-span-2 flex items-center justify-end gap-3">
              <div className="flex items-center gap-1.5">
                <Switch checked={isActive} onCheckedChange={setIsActive} />
                <span className="text-xs font-medium text-slate-600">Active</span>
              </div>
              <Button
                onClick={handleAddCategory}
                className="bg-[#00aeef] hover:bg-[#008cc0] text-white text-xs font-semibold"
              >
                <FontAwesomeIcon icon={faPlus} className="mr-1.5" />
                Create
              </Button>
            </div>
          </div>

          {/* Group Picker if Restricted */}
          {accessLevel === "restricted" && (
            <div className="pt-2 border-t border-slate-200">
              <label className="text-xs font-bold text-amber-800 flex items-center gap-1 mb-2">
                <FontAwesomeIcon icon={faShieldHalved} />
                Bind Cohort Groups to this Category (e.g. Brokers Group):
              </label>
              <div className="flex flex-wrap gap-2">
                {availableGroups.length === 0 ? (
                  <p className="text-xs text-slate-400">No cohort groups created yet.</p>
                ) : (
                  availableGroups.map((g) => {
                    const isSelected = selectedGroupIds.includes(g.id);
                    return (
                      <Badge
                        key={g.id}
                        onClick={() => toggleCreateGroup(g.id)}
                        variant={isSelected ? "default" : "outline"}
                        className={`cursor-pointer px-3 py-1 text-xs select-none ${
                          isSelected
                            ? "bg-[#00aeef] text-white"
                            : "bg-white text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        {isSelected && <FontAwesomeIcon icon={faCheck} className="mr-1 text-[10px]" />}
                        {g.name}
                      </Badge>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <FontAwesomeIcon
            icon={faSearch}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm"
          />
          <Input
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 text-sm"
          />
        </div>

        {/* Category List */}
        <div className="space-y-3">
          {filteredCategories.map((category) => {
            const isRestricted = category.access_level === "restricted";
            return (
              <Card key={category.id} className="border border-slate-200/90 shadow-sm hover:border-slate-300">
                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <Badge variant="outline" className="font-mono text-xs">
                      #{category.id}
                    </Badge>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm sm:text-base">
                          {category.name}
                        </span>
                        {isRestricted ? (
                          <Badge className="bg-amber-50 text-amber-700 border-amber-300 text-[10px] font-semibold">
                            🔒 Restricted
                          </Badge>
                        ) : (
                          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-300 text-[10px] font-semibold">
                            🌐 Public
                          </Badge>
                        )}
                      </div>

                      {category.description && (
                        <p className="text-xs text-slate-500 mt-1">{category.description}</p>
                      )}

                      {/* Display bound groups */}
                      {isRestricted && category.groups && category.groups.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                          <span className="text-[11px] font-medium text-slate-400">Authorized Cohorts:</span>
                          {category.groups.map((g) => (
                            <Badge
                              key={g.id}
                              variant="outline"
                              className="text-[10px] bg-blue-50 text-blue-700 border-blue-200 font-medium"
                            >
                              👥 {g.name}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isRestricted && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenBindingModal(category)}
                        className="text-xs font-semibold text-[#00aeef] hover:bg-[#00aeef]/10 border-[#00aeef]/30"
                      >
                        <FontAwesomeIcon icon={faUsers} className="mr-1.5" />
                        Cohort Access ({category.groups?.length || 0})
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteCategory(category.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 text-xs"
                    >
                      <FontAwesomeIcon icon={faTrash} className="mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredCategories.length === 0 && (
          <div className="text-center py-10 text-muted-foreground text-sm">
            No categories match your search.
          </div>
        )}
      </CardContent>

      {/* Group Binding Dialog for existing Category */}
      <Dialog open={isBindingModalOpen} onOpenChange={setIsBindingModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FontAwesomeIcon icon={faShieldHalved} className="text-amber-600" />
              Cohort Access • {bindingCategory?.name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 pt-2">
            <p className="text-xs text-slate-500 leading-relaxed">
              Select which cohort groups have permission to view and enroll in courses categorized under{" "}
              <span className="font-bold text-slate-700">{bindingCategory?.name}</span>.
            </p>

            <div className="border border-slate-200 rounded-xl p-3 max-h-60 overflow-y-auto space-y-2">
              {availableGroups.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No cohort groups created yet.</p>
              ) : (
                availableGroups.map((g) => {
                  const isSelected = dialogGroupIds.includes(g.id);
                  return (
                    <div
                      key={g.id}
                      onClick={() => toggleDialogGroup(g.id)}
                      className={`p-2.5 rounded-lg border flex items-center justify-between cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-blue-50/80 border-[#00aeef]/50 text-blue-900"
                          : "border-slate-200 hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <div>
                        <p className="text-xs font-semibold">{g.name}</p>
                        <p className="text-[11px] text-slate-400 font-mono">{g.code}</p>
                      </div>
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center ${
                          isSelected ? "bg-[#00aeef] border-[#00aeef] text-white" : "border-slate-300"
                        }`}
                      >
                        {isSelected && <FontAwesomeIcon icon={faCheck} className="text-[10px]" />}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <DialogFooter className="pt-3">
            <Button variant="outline" onClick={() => setIsBindingModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveBindings}
              disabled={savingBindings}
              className="bg-[#00aeef] hover:bg-[#008cc0] text-white text-xs font-semibold"
            >
              {savingBindings ? "Saving..." : "Save Cohort Bindings"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

export default AdminConfigurations;
