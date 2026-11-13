import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserPlus,
  faUsers,
  faCalendarAlt,
  faSpinner,
  faCheck,
  faXmark,
  faShieldHalved,
  faBuilding,
} from "@fortawesome/free-solid-svg-icons";
import { courseService, Course, CourseAssignment, UserGroup } from "@/services/course.service";
import { apiClient } from "@/services/api";

interface CourseAssignmentModalProps {
  course: Course | null;
  isOpen: boolean;
  onClose: () => void;
  onAssignmentsUpdated?: () => void;
}

export const CourseAssignmentModal = ({
  course,
  isOpen,
  onClose,
  onAssignmentsUpdated,
}: CourseAssignmentModalProps) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"group" | "individual" | "list">("group");

  // Data states
  const [assignments, setAssignments] = useState<CourseAssignment[]>([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [groups, setGroups] = useState<UserGroup[]>([]);
  const [allUsers, setAllUsers] = useState<Array<{ id: number; name: string; email: string }>>([]);

  // Assignment form states
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [expiresAt, setExpiresAt] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && course) {
      loadData();
    }
  }, [isOpen, course]);

  const loadData = async () => {
    if (!course) return;
    try {
      setLoadingAssignments(true);
      const [assignmentsRes, groupsRes, usersRes] = await Promise.all([
        courseService.getCourseAssignments(course.id),
        courseService.getGroups(),
        apiClient.get("/users?per_page=100"),
      ]);

      setAssignments(
        Array.isArray(assignmentsRes?.data)
          ? assignmentsRes.data
          : Array.isArray(assignmentsRes)
          ? assignmentsRes
          : []
      );
      setGroups(
        Array.isArray(groupsRes?.data) ? groupsRes.data : Array.isArray(groupsRes) ? groupsRes : []
      );

      const uList = usersRes.data?.data?.data || usersRes.data?.data || usersRes.data;
      if (Array.isArray(uList)) {
        setAllUsers(uList.map((u: any) => ({ id: u.id, name: u.name, email: u.email })));
      }
    } catch (error) {
      console.error("Error loading assignment data:", error);
    } finally {
      setLoadingAssignments(false);
    }
  };

  const handleAssignGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!course || !selectedGroupId) {
      toast({ title: "Validation Error", description: "Please select a cohort group.", variant: "destructive" });
      return;
    }

    try {
      setSubmitting(true);
      await courseService.assignCourse(course.id, {
        assignment_type: "group",
        group_id: parseInt(selectedGroupId, 10),
        expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
      });

      toast({
        title: "Cohort Group Assigned",
        description: `Successfully granted group access to ${course.title}.`,
      });
      setSelectedGroupId("");
      setExpiresAt("");
      loadData();
      if (onAssignmentsUpdated) onAssignmentsUpdated();
    } catch (error: any) {
      console.error("Assignment error:", error);
      toast({
        title: "Assignment Failed",
        description: error.response?.data?.message || "Failed to assign group.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignIndividuals = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!course || selectedUserIds.length === 0) {
      toast({ title: "Validation Error", description: "Select at least one student.", variant: "destructive" });
      return;
    }

    try {
      setSubmitting(true);
      await courseService.assignCourse(course.id, {
        assignment_type: "individual",
        user_ids: selectedUserIds,
        expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
      });

      toast({
        title: "Students Assigned",
        description: `Successfully granted access to ${selectedUserIds.length} student(s).`,
      });
      setSelectedUserIds([]);
      setExpiresAt("");
      loadData();
      if (onAssignmentsUpdated) onAssignmentsUpdated();
    } catch (error: any) {
      console.error("Assignment error:", error);
      toast({
        title: "Assignment Failed",
        description: error.response?.data?.message || "Failed to assign students.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevoke = async (assignmentId: number) => {
    if (!window.confirm("Revoke this assignment? The user/group will lose access.")) return;

    try {
      await courseService.revokeAssignment(assignmentId);
      toast({ title: "Revoked", description: "Access revoked successfully." });
      setAssignments((prev) =>
        prev.map((a) => (a.id === assignmentId ? { ...a, status: "revoked" } : a))
      );
      if (onAssignmentsUpdated) onAssignmentsUpdated();
    } catch (error) {
      console.error("Revoke error:", error);
      toast({ title: "Error", description: "Failed to revoke access.", variant: "destructive" });
    }
  };

  const toggleSelectUser = (id: number) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((uId) => uId !== id) : [...prev, id]
    );
  };

  const candidateStudents = allUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearchQuery.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={
                course?.visibility === "restricted"
                  ? "bg-amber-50 text-amber-700 border-amber-300"
                  : "bg-slate-50 text-slate-700"
              }
            >
              {course?.visibility === "restricted" ? "Restricted Program" : "Course Access"}
            </Badge>
          </div>
          <DialogTitle className="text-xl font-bold mt-1 text-slate-900">
            {course?.title}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Assign this course to a Cohort Group or individual students to grant access and auto-enroll them.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as any)}
          className="flex-1 flex flex-col overflow-hidden mt-2"
        >
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="group" className="text-xs">
              <FontAwesomeIcon icon={faUsers} className="mr-1.5" />
              Assign Cohort Group
            </TabsTrigger>
            <TabsTrigger value="individual" className="text-xs">
              <FontAwesomeIcon icon={faUserPlus} className="mr-1.5" />
              Assign Students
            </TabsTrigger>
            <TabsTrigger value="list" className="text-xs">
              Active Entitlements ({assignments.filter((a) => a.status === "active").length})
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: Assign Cohort Group */}
          <TabsContent value="group" className="space-y-4 pt-3 flex-1 overflow-y-auto">
            <form onSubmit={handleAssignGroup} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="group-select" className="text-xs font-semibold">
                  Select Cohort Group *
                </Label>
                <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
                  <SelectTrigger id="group-select" className="text-sm">
                    <SelectValue placeholder="Choose a cohort group (e.g. Registered Stockbrokers)..." />
                  </SelectTrigger>
                  <SelectContent>
                    {groups.map((g) => (
                      <SelectItem key={g.id} value={g.id.toString()}>
                        {g.name} {g.organization ? `(${g.organization})` : ""} - {g.members_count || 0} Members
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="group-expiry" className="text-xs font-semibold">
                  Access Expiration Date (Optional)
                </Label>
                <Input
                  id="group-expiry"
                  type="date"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="text-sm"
                />
                <p className="text-[11px] text-slate-400">
                  Leave empty for permanent institutional access.
                </p>
              </div>

              <Button
                type="submit"
                disabled={submitting || !selectedGroupId}
                className="w-full bg-[#00aeef] hover:bg-[#008cc0] text-white text-xs font-semibold uppercase tracking-wider"
              >
                {submitting ? "Assigning..." : "Assign Group & Auto-Enroll Members"}
              </Button>
            </form>
          </TabsContent>

          {/* TAB 2: Assign Individual Students */}
          <TabsContent value="individual" className="space-y-3 pt-3 flex-1 flex flex-col overflow-hidden">
            <form onSubmit={handleAssignIndividuals} className="flex-1 flex flex-col overflow-hidden space-y-3">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Search students by name or email..."
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  className="text-xs h-8"
                />
                <Input
                  type="date"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  title="Optional expiry date"
                  className="text-xs h-8 w-44"
                />
              </div>

              <div className="border border-slate-200 rounded-xl flex-1 overflow-y-auto divide-y divide-slate-100 p-2">
                {candidateStudents.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-8">No students found.</p>
                ) : (
                  candidateStudents.slice(0, 50).map((u) => {
                    const isSelected = selectedUserIds.includes(u.id);
                    return (
                      <div
                        key={u.id}
                        onClick={() => toggleSelectUser(u.id)}
                        className={`py-2 px-2.5 flex items-center justify-between rounded-lg cursor-pointer transition-colors ${
                          isSelected ? "bg-blue-50/90 border border-blue-200" : "hover:bg-slate-50"
                        }`}
                      >
                        <div>
                          <p className="text-xs font-semibold text-slate-800">{u.name}</p>
                          <p className="text-[11px] text-slate-400">{u.email}</p>
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

              <Button
                type="submit"
                disabled={submitting || selectedUserIds.length === 0}
                className="w-full bg-[#00aeef] hover:bg-[#008cc0] text-white text-xs font-semibold uppercase tracking-wider shrink-0"
              >
                {submitting ? "Assigning..." : `Assign ${selectedUserIds.length} Selected Student(s)`}
              </Button>
            </form>
          </TabsContent>

          {/* TAB 3: Active Assignments List */}
          <TabsContent value="list" className="pt-3 flex-1 overflow-y-auto">
            {loadingAssignments ? (
              <div className="flex justify-center items-center py-10">
                <FontAwesomeIcon icon={faSpinner} className="animate-spin text-[#00aeef] text-2xl" />
              </div>
            ) : assignments.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-10">
                No active or historical assignments for this course.
              </p>
            ) : (
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                {assignments.map((a) => (
                  <div key={a.id} className="p-3 flex items-center justify-between gap-3 hover:bg-slate-50/50">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        {a.group ? (
                          <Badge className="bg-purple-50 text-purple-700 border-purple-200 text-[10px]">
                            👥 Cohort Group: {a.group.name}
                          </Badge>
                        ) : a.user ? (
                          <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[10px]">
                            👤 Individual: {a.user.name}
                          </Badge>
                        ) : null}

                        <Badge
                          variant="outline"
                          className={
                            a.status === "active"
                              ? "text-emerald-700 border-emerald-300 bg-emerald-50 text-[10px]"
                              : "text-slate-400 border-slate-200 text-[10px]"
                          }
                        >
                          {a.status}
                        </Badge>
                      </div>

                      <p className="text-[11px] text-slate-400 mt-1">
                        Assigned on {new Date(a.created_at).toLocaleDateString()}
                        {a.expires_at ? ` • Expires ${new Date(a.expires_at).toLocaleDateString()}` : " • Permanent"}
                      </p>
                    </div>

                    {a.status === "active" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRevoke(a.id)}
                        className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 h-8"
                      >
                        Revoke Access
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
