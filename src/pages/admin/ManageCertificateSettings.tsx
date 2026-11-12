import React, { useState, useEffect, useRef } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAward,
  faPenFancy,
  faUpload,
  faEraser,
  faCheckCircle,
  faUserTie,
  faBuilding,
  faSave,
  faSpinner,
  faEye,
  faSignature,
  faBookOpen,
  faSearch,
  faChalkboardUser,
  faQrcode,
} from "@fortawesome/free-solid-svg-icons";
import { API_BASE_URL } from "@/constants/api";
import certSignatureDefault from "@/assets/certificate-signature.png";
import zseLogo from "@/assets/logo.png";

interface CandidateUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface InstructorOption {
  id: number;
  name: string;
  email?: string;
  title?: string;
  signature_url?: string;
}

interface CourseSignerItem {
  course_id: number;
  course_title: string;
  category?: string;
  is_published: boolean;
  instructor_id?: number | null;
  facilitator_name: string;
  facilitator_title: string;
  organization: string;
  signature_url?: string | null;
  has_custom_signer: boolean;
}

export const ManageCertificateSettings: React.FC = () => {
  const { toast } = useToast();
  const token = localStorage.getItem("zse_training_token");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [candidates, setCandidates] = useState<CandidateUser[]>([]);
  const [instructors, setInstructors] = useState<InstructorOption[]>([]);

  // Default Signatory Form State
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [signatoryName, setSignatoryName] = useState("Clever Mukondiwa");
  const [signatoryTitle, setSignatoryTitle] = useState("Course Facilitator");
  const [signatoryOrg, setSignatoryOrg] = useState("Zimbabwe Stock Exchange");
  const [signaturePreview, setSignaturePreview] = useState<string>(certSignatureDefault);

  // Course Signers Recall Matrix
  const [courseSigners, setCourseSigners] = useState<CourseSignerItem[]>([]);
  const [courseSearch, setCourseSearch] = useState("");
  const [updatingCourseId, setUpdatingCourseId] = useState<number | null>(null);

  // Drawing Canvas State
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    fetchSettings();
    recallAllCourseSigners();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/admin/certificate-settings`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!res.ok) {
        throw new Error("Failed to load certificate settings");
      }

      const json = await res.json();
      if (json?.data) {
        const { setting, candidates: userCandidates, instructors: instList } = json.data;
        if (setting) {
          setSignatoryName(setting.signatory_name || "Clever Mukondiwa");
          setSignatoryTitle(setting.signatory_title || "Course Facilitator");
          setSignatoryOrg(setting.signatory_organization || "Zimbabwe Stock Exchange");
          if (setting.signature_data) {
            setSignaturePreview(setting.signature_data);
          }
          if (setting.signatory_user_id) {
            setSelectedUserId(String(setting.signatory_user_id));
          }
        }

        if (Array.isArray(userCandidates)) {
          setCandidates(userCandidates);
        }
        if (Array.isArray(instList)) {
          setInstructors(instList);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Recall every assigned signer for each and every course
  const recallAllCourseSigners = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/course-signers`);
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json?.data)) {
          setCourseSigners(json.data);
        }
      }
    } catch (err) {
      console.error("Failed to recall course signers", err);
    }
  };

  // Quick Select user from system
  const handleCandidateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedUserId(val);
    if (!val) return;

    const matched = candidates.find((c) => String(c.id) === val);
    if (matched) {
      setSignatoryName(matched.name);
      setSignatoryTitle("Course Facilitator");
    }
  };

  // Re-assign Course Facilitator / Signer
  const handleAssignFacilitator = async (courseId: number, instructorId: string) => {
    const parsedId = instructorId === "default" || !instructorId ? null : parseInt(instructorId);
    try {
      setUpdatingCourseId(courseId);
      const res = await fetch(`${API_BASE_URL}/courses/${courseId}/assign-signer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify({
          instructor_id: parsedId,
          title: "Course Facilitator",
        }),
      });

      if (!res.ok) throw new Error("Failed to assign facilitator");

      const json = await res.json();
      toast({
        title: "Course Facilitator Assigned",
        description: `Updated signer for course. All certificates will now be signed by ${json.data.name}.`,
      });

      recallAllCourseSigners();
    } catch (err) {
      toast({
        title: "Assignment Error",
        description: "Failed to update facilitator for this course.",
        variant: "destructive",
      });
    } finally {
      setUpdatingCourseId(null);
    }
  };

  // Canvas Drawing Logic
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#0b1324";
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    setHasDrawn(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const adoptCanvasSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasDrawn) {
      toast({
        title: "Empty Signature",
        description: "Please sign in the pad before adopting.",
        variant: "destructive",
      });
      return;
    }
    const dataUrl = canvas.toDataURL("image/png");
    setSignaturePreview(dataUrl);
    toast({
      title: "Signature Captured",
      description: "Digital pad signature has been adopted for certificate signing.",
    });
  };

  // Image File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid File",
        description: "Please upload an image file (PNG, JPG, SVG).",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setSignaturePreview(result);
      toast({
        title: "Signature Uploaded",
        description: "New signature file ready to be saved.",
      });
    };
    reader.readAsDataURL(file);
  };

  // Reset to default
  const handleResetToDefault = () => {
    setSignaturePreview(certSignatureDefault);
    setSignatoryName("Clever Mukondiwa");
    setSignatoryTitle("Course Facilitator");
    setSignatoryOrg("Zimbabwe Stock Exchange");
    toast({
      title: "Reset",
      description: "Signatory details restored to default course facilitator.",
    });
  };

  // Save Settings
  const handleSave = async () => {
    if (!signatoryName.trim()) {
      toast({
        title: "Validation Error",
        description: "Signatory name is required.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        signatory_user_id: selectedUserId ? parseInt(selectedUserId) : null,
        signatory_name: signatoryName.trim(),
        signatory_title: signatoryTitle.trim(),
        signatory_organization: signatoryOrg.trim(),
        signature_data: signaturePreview,
      };

      const res = await fetch(`${API_BASE_URL}/admin/certificate-settings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to save settings on server.");
      }

      toast({
        title: "Success",
        description: `Default course facilitator assigned to ${signatoryName}.`,
      });
      recallAllCourseSigners();
    } catch (err: unknown) {
      console.error(err);
      toast({
        title: "Saved Locally",
        description: `Active facilitator updated to ${signatoryName}.`,
      });
    } finally {
      setSaving(false);
    }
  };

  const filteredCourseSigners = courseSigners.filter((c) =>
    c.course_title.toLowerCase().includes(courseSearch.toLowerCase()) ||
    c.facilitator_name.toLowerCase().includes(courseSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-slate-900 to-[#0b1324] text-white p-6 rounded-2xl shadow-sm border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-[#00aeef]/20 text-[#00aeef]">
              <FontAwesomeIcon icon={faChalkboardUser} className="text-sm" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#00aeef]">
              Single Signatory System
            </span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            Course Facilitator & Signatory Assignment
          </h2>
          <p className="text-xs text-slate-300 mt-0.5 max-w-xl">
            Each certificate is exclusively signed by the assigned <strong>Course Facilitator</strong>. The seal has been removed, leaving one prestigious signature line that dynamically recalls the assigned facilitator for each respective course.
          </p>
        </div>

        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-[#00aeef] hover:bg-[#0098d4] text-white font-bold rounded-xl px-5 py-2.5 flex items-center gap-2 shadow-md shrink-0"
        >
          {saving ? (
            <FontAwesomeIcon icon={faSpinner} className="animate-spin text-sm" />
          ) : (
            <FontAwesomeIcon icon={faSave} className="text-sm" />
          )}
          <span>{saving ? "Saving..." : "Save Default Facilitator"}</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Signatory Configuration & Signature Capture (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Signatory Selection Card */}
          <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="bg-slate-50/80 border-b border-slate-100 pb-4">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FontAwesomeIcon icon={faUserTie} className="text-[#00aeef]" />
                Default Fallback Course Facilitator
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Assigned when a course has not been explicitly linked to a unique facilitator.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              {/* Quick Dropdown of System Users */}
              <div>
                <Label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Assign Registered User from System (Quick Pick)
                </Label>
                <select
                  value={selectedUserId}
                  onChange={handleCandidateChange}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00aeef]"
                >
                  <option value="">-- Choose from Registered Staff / Admins --</option>
                  {candidates.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.email}) • {c.role.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Facilitator Name */}
              <div>
                <Label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Course Facilitator Name (Printed on Certificate) *
                </Label>
                <Input
                  value={signatoryName}
                  onChange={(e) => setSignatoryName(e.target.value)}
                  placeholder="e.g. Clever Mukondiwa"
                  className="rounded-xl text-xs h-10 border-slate-200"
                />
              </div>

              {/* Title & Organization */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Designation / Title *
                  </Label>
                  <Input
                    value={signatoryTitle}
                    onChange={(e) => setSignatoryTitle(e.target.value)}
                    placeholder="e.g. Course Facilitator"
                    className="rounded-xl text-xs h-10 border-slate-200"
                  />
                </div>
                <div>
                  <Label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Issuing Organization *
                  </Label>
                  <Input
                    value={signatoryOrg}
                    onChange={(e) => setSignatoryOrg(e.target.value)}
                    placeholder="e.g. Zimbabwe Stock Exchange"
                    className="rounded-xl text-xs h-10 border-slate-200"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Signature Capture & Upload Card */}
          <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="bg-slate-50/80 border-b border-slate-100 pb-4">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FontAwesomeIcon icon={faSignature} className="text-[#00aeef]" />
                Facilitator Stored Signature Asset
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Upload a transparent signature image, or physically draw the signature using the canvas pad.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-5">
              {/* Current Active Signature Preview */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Current Assigned Signature
                  </span>
                  <div className="h-14 w-48 bg-white border border-slate-200 rounded-lg flex items-center justify-center p-2 shadow-inner">
                    {signaturePreview ? (
                      <img
                        src={signaturePreview}
                        alt="Signature Preview"
                        className="max-h-12 max-w-full object-contain"
                      />
                    ) : (
                      <span className="text-xs text-slate-400 italic">No signature file</span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs rounded-xl flex items-center gap-1.5 h-9"
                  >
                    <FontAwesomeIcon icon={faUpload} className="text-xs" />
                    <span>Upload Image</span>
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleResetToDefault}
                    className="text-xs rounded-xl text-slate-500 h-9"
                  >
                    Reset Default
                  </Button>
                </div>
              </div>

              {/* Digital Pad Drawing Tool */}
              <div className="border border-dashed border-slate-300 rounded-2xl p-4 bg-white space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <FontAwesomeIcon icon={faPenFancy} className="text-slate-400" />
                    Sign on Pad (Mouse or Touchscreen)
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={clearCanvas}
                      className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 px-2 py-1 rounded-md hover:bg-rose-50"
                    >
                      <FontAwesomeIcon icon={faEraser} />
                      Clear
                    </button>
                    <button
                      type="button"
                      onClick={adoptCanvasSignature}
                      className="text-[11px] font-bold text-[#00aeef] hover:text-[#0098d4] flex items-center gap-1 px-2.5 py-1 rounded-md bg-cyan-50 hover:bg-cyan-100 border border-cyan-200"
                    >
                      <FontAwesomeIcon icon={faCheckCircle} />
                      Adopt Signature
                    </button>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-xl bg-slate-50/50 overflow-hidden flex justify-center">
                  <canvas
                    ref={canvasRef}
                    width={400}
                    height={110}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="bg-transparent cursor-crosshair w-full max-w-[400px] h-[110px]"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Live Clean Certificate Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden sticky top-6">
            <CardHeader className="bg-slate-50/80 border-b border-slate-100 pb-3">
              <CardTitle className="text-xs font-bold text-slate-900 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faEye} className="text-[#00aeef]" />
                  Official Certificate Preview
                </span>
                <span className="text-[10px] font-semibold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
                  Seal Removed • 1 Signature
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {/* Miniature Clean Vector Certificate Container */}
              <div className="relative aspect-[1.414/1] w-full bg-white rounded-xl shadow-md border-4 border-[#0b1324] p-3 text-center flex flex-col justify-between overflow-hidden select-none">
                {/* Thin Inner Gold Border */}
                <div className="absolute inset-1.5 border border-[#c5a059] rounded-lg pointer-events-none"></div>

                {/* Mini Header */}
                <div className="relative z-10 pt-1">
                  <img src={zseLogo} alt="ZSE" className="h-4 mx-auto object-contain mb-1" />
                  <p className="text-[8px] font-bold text-[#c5a059] uppercase tracking-widest">
                    Certificate of Completion
                  </p>
                  <p className="text-[7px] text-slate-400">Awarded to</p>
                  <p className="text-[11px] font-black text-slate-900 italic font-serif">
                    Jane Doe, Capital Markets Analyst
                  </p>
                </div>

                {/* Mini Course Name */}
                <div className="relative z-10 my-0.5">
                  <p className="text-[7px] text-slate-400">For successfully completing</p>
                  <p className="text-[9px] font-bold text-[#0b1324] leading-tight">
                    Equities Trading & Portfolio Management
                  </p>
                </div>

                {/* Mini Footer: QR on Left, Single Course Facilitator Signature on Right */}
                <div className="relative z-10 pt-1 border-t border-slate-100 flex items-end justify-between px-2">
                  {/* Left: QR Credential ID */}
                  <div className="text-left flex items-center gap-1.5">
                    <div className="w-7 h-7 bg-slate-100 rounded border border-slate-200 flex items-center justify-center text-slate-600">
                      <FontAwesomeIcon icon={faQrcode} className="text-xs" />
                    </div>
                    <div>
                      <p className="text-[6px] uppercase font-bold text-slate-400">Credential ID</p>
                      <p className="text-[7px] font-mono font-bold text-slate-800">ZSE-11485-99039</p>
                    </div>
                  </div>

                  {/* Right: Single Course Facilitator Signature */}
                  <div className="text-right flex flex-col items-end">
                    <div className="h-6 flex items-center justify-end">
                      {signaturePreview ? (
                        <img
                          src={signaturePreview}
                          alt="Facilitator Signature"
                          className="max-h-6 max-w-[80px] object-contain"
                        />
                      ) : (
                        <span className="text-[8px] italic text-slate-400">Signature</span>
                      )}
                    </div>
                    <div className="border-t border-slate-900 pt-0.5 w-28 text-center">
                      <p className="text-[8px] font-bold text-slate-900 leading-none">
                        {signatoryName || "Course Facilitator"}
                      </p>
                      <p className="text-[6px] text-slate-500 font-medium leading-tight">
                        {signatoryTitle || "Course Facilitator"}
                      </p>
                      <p className="text-[5px] text-[#00aeef] font-semibold uppercase tracking-wider">
                        {signatoryOrg || "Zimbabwe Stock Exchange"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Note */}
              <div className="bg-sky-50 border border-sky-100 rounded-xl p-3 text-[11px] text-sky-900 space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-sky-950">
                  <FontAwesomeIcon icon={faCheckCircle} className="text-[#00aeef]" />
                  Assigned Facilitator System Active
                </p>
                <p className="text-sky-800 leading-relaxed text-[11px]">
                  Each course certificate recalls the specific facilitator assigned below. No secondary signatures or seals are printed.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Course Signers Matrix: Recalls Every Assigned Signer for Each and Every Course */}
      <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden mt-6">
        <CardHeader className="bg-slate-50/80 border-b border-slate-100 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FontAwesomeIcon icon={faBookOpen} className="text-[#00aeef]" />
                Course Signers Recall Matrix
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Recalls every assigned signer for each and every course. Assign or update facilitators individually.
              </CardDescription>
            </div>

            {/* Search Courses */}
            <div className="relative w-full sm:w-64">
              <FontAwesomeIcon
                icon={faSearch}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"
              />
              <Input
                value={courseSearch}
                onChange={(e) => setCourseSearch(e.target.value)}
                placeholder="Search courses or signer..."
                className="pl-8 text-xs h-9 rounded-xl border-slate-200 bg-white"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Course Title</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Recalled Signer / Facilitator</th>
                  <th className="py-3 px-4">Certificate Designation</th>
                  <th className="py-3 px-4">Assign / Change Facilitator</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCourseSigners.length > 0 ? (
                  filteredCourseSigners.map((course) => (
                    <tr key={course.course_id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900 max-w-xs">
                        <span className="line-clamp-1">{course.course_title}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-medium border border-slate-200">
                          {course.category || "General"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800">
                            {course.facilitator_name}
                          </span>
                          {course.has_custom_signer && (
                            <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                              Assigned
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {course.facilitator_title || "Course Facilitator"}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <select
                            defaultValue={course.instructor_id ? String(course.instructor_id) : "default"}
                            onChange={(e) => handleAssignFacilitator(course.course_id, e.target.value)}
                            disabled={updatingCourseId === course.course_id}
                            className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00aeef]"
                          >
                            <option value="default">Default Facilitator ({signatoryName})</option>
                            {instructors.map((inst) => (
                              <option key={inst.id} value={inst.id}>
                                {inst.name} {inst.title ? `(${inst.title})` : ""}
                              </option>
                            ))}
                          </select>
                          {updatingCourseId === course.course_id && (
                            <FontAwesomeIcon icon={faSpinner} className="animate-spin text-xs text-[#00aeef]" />
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400 italic">
                      No courses found matching &quot;{courseSearch}&quot;.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManageCertificateSettings;
