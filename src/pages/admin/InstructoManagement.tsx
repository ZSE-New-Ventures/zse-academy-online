import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faPlus,
  faTrash,
  faUserTie,
  faBuilding,
  faEnvelope,
  faPhone,
  faShieldHalved,
  faUpload,
  faCheckCircle,
  faInfoCircle,
  faKey,
} from "@fortawesome/free-solid-svg-icons";
import { API_BASE_URL } from "@/constants/api";
import { apiClient } from "@/services/api";
import { securityService, Department } from "@/services/security.service";

interface Instructor {
  id: number;
  name: string;
  email: string;
  phone?: string;
  title?: string;
  bio?: string;
  image_url?: string;
  signature_url?: string;
  is_active?: boolean;
  department_id?: number | null;
  department?: Department | null;
  user?: {
    id: number;
    name: string;
    email: string;
    role: string;
    must_change_password?: boolean;
    roles?: { id: number; name: string }[];
  } | null;
}

export default function InstructorManagement() {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [availableRoles, setAvailableRoles] = useState<string[]>([
    "instructor",
    "senior_instructor",
    "admin",
  ]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingInstructor, setDeletingInstructor] = useState<Instructor | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [departmentId, setDepartmentId] = useState<string>("");
  const [role, setRole] = useState<string>("instructor");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    fetchInstructors();
    fetchDepartmentsAndRoles();
  }, []);

  const fetchDepartmentsAndRoles = async () => {
    try {
      const [deptRes, iamRes] = await Promise.all([
        securityService.getDepartments(),
        securityService.getIamMatrix(),
      ]);
      if (deptRes?.departments) {
        setDepartments(deptRes.departments);
      }
      if (iamRes?.roles) {
        const staffRoles = iamRes.roles
          .map((r: { name: string }) => r.name)
          .filter((name: string) => name !== "student");
        if (staffRoles.length > 0) {
          setAvailableRoles(staffRoles);
        }
      }
    } catch (err) {
      console.error("Failed to load departments or roles:", err);
    }
  };

  const fetchInstructors = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/instructors");
      const result = Array.isArray(response.data?.instructors)
        ? response.data.instructors
        : Array.isArray(response.data)
        ? response.data
        : [];
      setInstructors(result);
    } catch (error) {
      console.error("Error fetching instructors:", error);
      toast({
        title: "Error",
        description: "Failed to load instructors",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setTitle("");
    setDepartmentId("");
    setRole("instructor");
    setPhone("");
    setBio("");
    setImageFile(null);
    setImagePreview(null);
    setSignatureFile(null);
    setSignaturePreview(null);
  };

  const handleOpenModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleCreateInstructor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      return toast({
        title: "Validation Error",
        description: "Name and Email are required.",
        variant: "destructive",
      });
    }

    const domain = email.trim().toLowerCase().split("@")[1];
    if (!domain || !["zse.co.zw", "vfex.exchange"].includes(domain)) {
      return toast({
        title: "Institutional Domain Required",
        description: "Instructor accounts must use an authorized institutional domain (@zse.co.zw or @vfex.exchange).",
        variant: "destructive",
      });
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("email", email.trim().toLowerCase());
      if (title.trim()) formData.append("title", title.trim());
      if (departmentId) formData.append("department_id", departmentId);
      if (role) formData.append("role", role);
      if (phone.trim()) formData.append("phone", phone.trim());
      if (bio.trim()) formData.append("bio", bio.trim());
      if (imageFile) formData.append("image", imageFile);
      if (signatureFile) formData.append("signature", signatureFile);

      const response = await apiClient.post("/instructors", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const instructor = response.data?.instructor;
      if (!instructor) {
        throw new Error(response.data?.message || "Failed to create instructor.");
      }

      setInstructors((prev) => [instructor, ...prev]);
      setIsModalOpen(false);
      resetForm();

      toast({
        title: "Instructor Onboarded Successfully",
        description: `Account created for ${instructor.name}. An activation link with temporary credentials was dispatched to ${instructor.email}.`,
      });
    } catch (error: any) {
      console.error("Error creating instructor:", error);
      const errorMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        (error.response?.data?.errors ? Object.values(error.response.data.errors).flat().join(" ") : null) ||
        error.message ||
        "Failed to create instructor profile.";

      toast({
        title: "Onboarding Failed",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDeleteInstructor = async () => {
    if (!deletingInstructor) return;
    const id = deletingInstructor.id;

    try {
      await apiClient.delete(`/instructors/${id}`);
      setInstructors((prev) => prev.filter((i) => i.id !== id));
      toast({
        title: "Instructor Removed",
        description: `${deletingInstructor.name} has been removed successfully.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete instructor.",
        variant: "destructive",
      });
    } finally {
      setDeletingInstructor(null);
    }
  };

  const filteredInstructors = instructors.filter((inst) => {
    const q = searchTerm.toLowerCase();
    return (
      inst.name.toLowerCase().includes(q) ||
      inst.email.toLowerCase().includes(q) ||
      (inst.title && inst.title.toLowerCase().includes(q)) ||
      (inst.department && inst.department.name.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Action Header */}
      <Card className="border border-slate-200 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#00aeef]/10 text-[#00aeef] flex items-center justify-center">
                  <FontAwesomeIcon icon={faUserTie} className="text-sm" />
                </div>
                Faculty & Instructor Directory
              </CardTitle>
              <p className="text-xs text-slate-500 mt-1">
                Manage institutional teaching staff, departmental assignments, and role credentials.
              </p>
            </div>

            <Button
              onClick={handleOpenModal}
              className="bg-[#00aeef] hover:bg-[#008cc0] text-white text-xs font-bold rounded-xl h-10 px-4 shadow-sm"
            >
              <FontAwesomeIcon icon={faPlus} className="mr-2" />
              Onboard New Instructor
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
              placeholder="Search by instructor name, email, department, or title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 text-xs bg-slate-50 border-slate-200 rounded-xl h-10"
            />
          </div>

          {/* Instructors Table / Grid */}
          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          ) : filteredInstructors.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3">
                <FontAwesomeIcon icon={faUserTie} className="text-lg" />
              </div>
              <h3 className="text-sm font-bold text-slate-700">No instructors found</h3>
              <p className="text-xs text-slate-400 mt-1">
                Click "Onboard New Instructor" to add faculty staff to the platform.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
              {filteredInstructors.map((inst) => (
                <div
                  key={inst.id}
                  className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center text-slate-400 font-bold text-base">
                      {inst.image_url ? (
                        <img
                          src={inst.image_url}
                          alt={inst.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        inst.name.charAt(0).toUpperCase()
                      )}
                    </div>

                    {/* Details */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-slate-900 truncate">{inst.name}</h4>
                        {inst.title && (
                          <span className="text-xs text-slate-500 font-medium">
                            • {inst.title}
                          </span>
                        )}
                        {inst.department && (
                          <Badge className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-semibold">
                            <FontAwesomeIcon icon={faBuilding} className="mr-1 text-[9px]" />
                            {inst.department.name}
                          </Badge>
                        )}
                        <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold">
                          Faculty
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-slate-500 mt-1 flex-wrap">
                        <span className="flex items-center gap-1">
                          <FontAwesomeIcon icon={faEnvelope} className="text-[10px] text-slate-400" />
                          {inst.email}
                        </span>
                        {inst.phone && (
                          <span className="flex items-center gap-1">
                            <FontAwesomeIcon icon={faPhone} className="text-[10px] text-slate-400" />
                            {inst.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeletingInstructor(inst)}
                      className="text-slate-400 hover:text-red-600 hover:bg-red-50 text-xs h-8 px-2.5 rounded-lg"
                      title="Remove Instructor"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* FULL-FLEDGED ONBOARDING MODAL DIALOG */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[640px] max-h-[90vh] overflow-y-auto p-0 border border-slate-200 shadow-2xl rounded-2xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 via-[#0a3161] to-[#00aeef] p-6 text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                <FontAwesomeIcon icon={faUserTie} className="h-5 w-5 text-[#00aeef]" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-white">
                  Onboard Faculty / Instructor
                </DialogTitle>
                <DialogDescription className="text-slate-200 text-xs mt-0.5">
                  Set departmental affiliation, staff role, and dispatch temporary credentials.
                </DialogDescription>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleCreateInstructor} className="p-6 space-y-4">
            {/* Security Notification Banner */}
            <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2.5 leading-relaxed">
              <FontAwesomeIcon icon={faShieldHalved} className="text-blue-500 shrink-0 mt-0.5 text-sm" />
              <div>
                <strong>Automated Onboarding Flow:</strong> Creating an instructor automatically
                issues an institutional User account. A welcome email containing an account activation
                link and an auto-generated temporary password will be dispatched. The instructor will
                be required to set a permanent password upon first login.
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Full Name *</label>
                <Input
                  placeholder="e.g. Tendai Chikore"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="text-xs bg-slate-50 border-slate-200 rounded-xl"
                />
              </div>

              {/* Email Address */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700">Work Email Address *</label>
                  <span className="text-[10px] text-[#00aeef] font-medium">@zse.co.zw / @vfex.exchange</span>
                </div>
                <Input
                  type="email"
                  placeholder="e.g. tendai.chikore@zse.co.zw"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="text-xs bg-slate-50 border-slate-200 rounded-xl"
                />
                <p className="text-[10px] text-slate-400">
                  Institutional accounts must use @zse.co.zw or @vfex.exchange domains.
                </p>
              </div>

              {/* Department */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700">Department Affiliation</label>
                  <span className="text-[10px] text-[#00aeef] font-medium">Configured by Admin</span>
                </div>
                <Select value={departmentId} onValueChange={setDepartmentId}>
                  <SelectTrigger className="text-xs bg-slate-50 border-slate-200 rounded-xl">
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id.toString()} className="text-xs">
                        {dept.name} ({dept.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Staff Role */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700">Staff System Role</label>
                  <span className="text-[10px] text-[#00aeef] font-medium">Configured in IAM</span>
                </div>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger className="text-xs bg-slate-50 border-slate-200 rounded-xl">
                    <SelectValue placeholder="Select Role" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRoles.map((r) => (
                      <SelectItem key={r} value={r} className="text-xs capitalize">
                        {r.replace(/_/g, " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Professional Title */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Designation / Title</label>
                <Input
                  placeholder="e.g. Senior Market Analyst"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-xs bg-slate-50 border-slate-200 rounded-xl"
                />
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Phone Number</label>
                <Input
                  placeholder="e.g. +263 77 123 4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="text-xs bg-slate-50 border-slate-200 rounded-xl"
                />
              </div>
            </div>

            {/* Biography */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Biography / Experience</label>
              <Textarea
                placeholder="Professional background, expertise in capital markets, education..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="text-xs bg-slate-50 border-slate-200 rounded-xl resize-none"
              />
            </div>

            {/* File Uploads (Avatar & Signature) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {/* Profile Image */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <label className="text-xs font-semibold text-slate-700 block">
                  Profile Avatar (JPG/PNG)
                </label>
                <label className="cursor-pointer flex items-center justify-center gap-2 p-3 bg-white border border-dashed border-slate-300 rounded-lg text-xs text-slate-600 hover:bg-slate-100 transition-colors">
                  <FontAwesomeIcon icon={faUpload} className="text-[#00aeef]" />
                  <span>{imageFile ? imageFile.name : "Choose Photo (Max 2MB)"}</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        setImageFile(f);
                        setImagePreview(URL.createObjectURL(f));
                      }
                    }}
                  />
                </label>
                {imagePreview && (
                  <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-200 mt-2">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Certificate Signature */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <label className="text-xs font-semibold text-slate-700 block">
                  Certificate Signature (PNG transparent)
                </label>
                <label className="cursor-pointer flex items-center justify-center gap-2 p-3 bg-white border border-dashed border-slate-300 rounded-lg text-xs text-slate-600 hover:bg-slate-100 transition-colors">
                  <FontAwesomeIcon icon={faUpload} className="text-[#00aeef]" />
                  <span>{signatureFile ? signatureFile.name : "Upload Signature"}</span>
                  <input
                    type="file"
                    accept="image/png"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        setSignatureFile(f);
                        setSignaturePreview(URL.createObjectURL(f));
                      }
                    }}
                  />
                </label>
                {signaturePreview && (
                  <div className="h-10 w-24 bg-white rounded border border-slate-200 p-1 mt-2">
                    <img
                      src={signaturePreview}
                      alt="Signature"
                      className="h-full w-full object-contain"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer Buttons */}
            <DialogFooter className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="text-xs text-slate-600 rounded-xl h-9 px-4"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-[#00aeef] hover:bg-[#008cc0] text-white text-xs font-bold rounded-xl h-9 px-5 shadow-sm"
              >
                <FontAwesomeIcon icon={faKey} className="mr-2" />
                {submitting ? "Creating & Sending Credentials..." : "Create & Send Credentials"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modern In-App Removal Confirmation Dialog */}
      <AlertDialog
        open={!!deletingInstructor}
        onOpenChange={(open) => !open && setDeletingInstructor(null)}
      >
        <AlertDialogContent className="max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100">
          <AlertDialogHeader>
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-3">
              <FontAwesomeIcon icon={faTrash} className="text-lg" />
            </div>
            <AlertDialogTitle className="text-lg font-bold text-slate-900">
              Remove Instructor?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-slate-600 leading-relaxed">
              Are you sure you want to remove <strong>{deletingInstructor?.name}</strong>? Their instructor profile and course associations will be unlinked. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-5 gap-2 sm:gap-0">
            <AlertDialogCancel className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold h-9 px-4">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteInstructor}
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold h-9 px-5 shadow-sm"
            >
              Yes, Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
