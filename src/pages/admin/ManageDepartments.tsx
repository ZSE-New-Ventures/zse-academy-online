import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBuilding,
  faPlus,
  faSearch,
  faEdit,
  faUsers,
  faUserTie,
  faShieldHalved,
  faCode,
  faCheckCircle,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";
import { useToast } from "@/hooks/use-toast";
import { securityService, Department } from "@/services/security.service";

export const ManageDepartments: React.FC = () => {
  const { toast } = useToast();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [saving, setSaving] = useState(false);

  // Form fields
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await securityService.getDepartments(true);
      if (res?.departments) {
        setDepartments(res.departments);
      }
    } catch (err) {
      console.error("Failed to load departments:", err);
      toast({
        title: "Error",
        description: "Failed to load departmental directory.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingDept(null);
    setName("");
    setCode("");
    setDescription("");
    setIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (dept: Department) => {
    setEditingDept(dept);
    setName(dept.name);
    setCode(dept.code);
    setDescription(dept.description || "");
    setIsActive(dept.is_active);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      return toast({
        title: "Validation Error",
        description: "Department Name and Code are required.",
        variant: "destructive",
      });
    }

    try {
      setSaving(true);
      if (editingDept) {
        await securityService.updateDepartment(editingDept.id, {
          name: name.trim(),
          code: code.trim().toUpperCase(),
          description: description.trim(),
          is_active: isActive,
        });
        toast({
          title: "Department Updated",
          description: `Department "${name}" was updated successfully.`,
        });
      } else {
        await securityService.createDepartment({
          name: name.trim(),
          code: code.trim().toUpperCase(),
          description: description.trim(),
        });
        toast({
          title: "Department Created",
          description: `Department "${name}" was created successfully.`,
        });
      }

      setIsModalOpen(false);
      fetchDepartments();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast({
        title: "Action Failed",
        description: error.response?.data?.message || "Failed to save department details.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const filtered = departments.filter((d) => {
    const q = search.toLowerCase();
    return (
      d.name.toLowerCase().includes(q) ||
      d.code.toLowerCase().includes(q) ||
      (d.description && d.description.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <Card className="border border-slate-200 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#00aeef]/10 text-[#00aeef] flex items-center justify-center">
                  <FontAwesomeIcon icon={faBuilding} className="text-sm" />
                </div>
                Institutional Departments & Business Units
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 mt-1">
                Configure corporate departments, functional divisions, and faculty affiliations for instructors and staff.
              </CardDescription>
            </div>

            <Button
              onClick={handleOpenAdd}
              className="bg-[#00aeef] hover:bg-[#008cc0] text-white text-xs font-bold rounded-xl h-10 px-4 shadow-sm"
            >
              <FontAwesomeIcon icon={faPlus} className="mr-2" />
              Add Department
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {/* Search bar */}
          <div className="relative mb-6">
            <FontAwesomeIcon
              icon={faSearch}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"
            />
            <Input
              placeholder="Search departments by name, code, or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs bg-slate-50 border-slate-200 rounded-xl h-10"
            />
          </div>

          {/* Department Cards Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-32 bg-slate-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3">
                <FontAwesomeIcon icon={faBuilding} className="text-lg" />
              </div>
              <h3 className="text-sm font-bold text-slate-700">No departments found</h3>
              <p className="text-xs text-slate-400 mt-1">
                Click "Add Department" above to configure institutional divisions.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((dept) => (
                <div
                  key={dept.id}
                  className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-5 shadow-sm transition-all hover:shadow flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <Badge className="bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-mono font-bold tracking-wider">
                        <FontAwesomeIcon icon={faCode} className="mr-1 text-[9px]" />
                        {dept.code}
                      </Badge>
                      {dept.is_active ? (
                        <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold">
                          <FontAwesomeIcon icon={faCheckCircle} className="mr-1 text-[9px]" />
                          Active
                        </Badge>
                      ) : (
                        <Badge className="bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-semibold">
                          <FontAwesomeIcon icon={faTimesCircle} className="mr-1 text-[9px]" />
                          Inactive
                        </Badge>
                      )}
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 mt-1">{dept.name}</h4>
                    <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                      {dept.description || "Institutional organizational unit."}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
                      <span className="flex items-center gap-1" title="Assigned Instructors">
                        <FontAwesomeIcon icon={faUserTie} className="text-slate-400 text-[10px]" />
                        {(dept as { instructors_count?: number }).instructors_count ?? 0} Faculty
                      </span>
                      <span className="flex items-center gap-1" title="Assigned Users">
                        <FontAwesomeIcon icon={faUsers} className="text-slate-400 text-[10px]" />
                        {(dept as { users_count?: number }).users_count ?? 0} Staff
                      </span>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenEdit(dept)}
                      className="text-[#00aeef] hover:bg-blue-50 text-xs h-8 px-2.5 rounded-lg"
                    >
                      <FontAwesomeIcon icon={faEdit} className="mr-1 text-xs" />
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add / Edit Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[480px] p-0 border border-slate-200 shadow-2xl rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-slate-900 via-[#0a3161] to-[#00aeef] p-6 text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                <FontAwesomeIcon icon={faBuilding} className="h-5 w-5 text-[#00aeef]" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-white">
                  {editingDept ? "Edit Department" : "Create New Department"}
                </DialogTitle>
                <DialogDescription className="text-slate-200 text-xs mt-0.5">
                  {editingDept
                    ? "Update organizational parameters for this business unit."
                    : "Add an institutional department or faculty division."}
                </DialogDescription>
              </div>
            </div>
          </div>

          <form onSubmit={handleSave} className="p-6 space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Department Name *</label>
              <Input
                placeholder="e.g. Risk & Compliance"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="text-xs bg-slate-50 border-slate-200 rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Department Code / Identifier *</label>
              <Input
                placeholder="e.g. RISK"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                required
                className="text-xs bg-slate-50 border-slate-200 rounded-xl font-mono"
              />
              <p className="text-[10px] text-slate-400">Unique short code used in IAM role matrix and audits.</p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Description</label>
              <Textarea
                placeholder="Operational purpose, mandate, or key responsibilities..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="text-xs bg-slate-50 border-slate-200 rounded-xl resize-none"
              />
            </div>

            {editingDept && (
              <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div>
                  <div className="text-xs font-semibold text-slate-800">Department Status</div>
                  <div className="text-[11px] text-slate-500">
                    Active departments appear in instructor onboarding dropdowns.
                  </div>
                </div>
                <Switch checked={isActive} onCheckedChange={setIsActive} />
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="text-xs rounded-xl h-10 px-4"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-[#00aeef] hover:bg-[#008cc0] text-white text-xs font-bold rounded-xl h-10 px-5 shadow-sm"
              >
                {saving ? "Saving..." : editingDept ? "Update Department" : "Create Department"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageDepartments;

