import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faPlus,
  faSearch,
  faEdit,
  faTrash,
  faUserPlus,
  faXmark,
  faBuilding,
  faShieldHalved,
  faSpinner,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import { courseService, UserGroup } from "@/services/course.service";
import { apiClient } from "@/services/api";

interface MemberItem {
  id: number;
  name: string;
  email: string;
}

export const ManageGroups = () => {
  const [groups, setGroups] = useState<UserGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  // Create/Edit Group Modal State
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<UserGroup | null>(null);
  const [groupForm, setGroupForm] = useState({
    name: "",
    code: "",
    organization: "",
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // Members Management Modal State
  const [selectedGroup, setSelectedGroup] = useState<UserGroup | null>(null);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [groupMembers, setGroupMembers] = useState<MemberItem[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [allUsers, setAllUsers] = useState<MemberItem[]>([]);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [addingMembers, setAddingMembers] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const data = await courseService.getGroups();
      setGroups(Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching groups:", error);
      toast({
        title: "Error",
        description: "Failed to load cohort groups.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingGroup(null);
    setGroupForm({
      name: "",
      code: "",
      organization: "",
      description: "",
    });
    setIsGroupModalOpen(true);
  };

  const handleOpenEditModal = (group: UserGroup) => {
    setEditingGroup(group);
    setGroupForm({
      name: group.name,
      code: group.code,
      organization: group.organization || "",
      description: group.description || "",
    });
    setIsGroupModalOpen(true);
  };

  const handleSaveGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupForm.name.trim()) {
      toast({ title: "Validation Error", description: "Group name is required.", variant: "destructive" });
      return;
    }

    try {
      setSubmitting(true);
      if (editingGroup) {
        await courseService.updateGroup(editingGroup.id, groupForm);
        toast({ title: "Updated", description: "Cohort group updated successfully." });
      } else {
        await courseService.createGroup(groupForm);
        toast({ title: "Created", description: "New cohort group created successfully." });
      }
      setIsGroupModalOpen(false);
      fetchGroups();
    } catch (error) {
      console.error("Error saving group:", error);
      toast({ title: "Error", description: "Failed to save group.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteGroup = async (group: UserGroup) => {
    if (!window.confirm(`Are you sure you want to delete the group "${group.name}"?`)) {
      return;
    }

    try {
      await courseService.deleteGroup(group.id);
      toast({ title: "Deleted", description: "Cohort group removed successfully." });
      fetchGroups();
    } catch (error) {
      console.error("Error deleting group:", error);
      toast({ title: "Error", description: "Failed to delete cohort group.", variant: "destructive" });
    }
  };

  // Open member manager for a group
  const handleOpenMembersModal = async (group: UserGroup) => {
    setSelectedGroup(group);
    setIsMembersModalOpen(true);
    setSelectedUserIds([]);
    setUserSearchQuery("");
    fetchGroupMembers(group.id);
    fetchAllStudents();
  };

  const fetchGroupMembers = async (groupId: number) => {
    try {
      setLoadingMembers(true);
      const res = await courseService.getGroupMembers(groupId);
      setGroupMembers(Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []);
    } catch (error) {
      console.error("Error loading group members:", error);
    } finally {
      setLoadingMembers(false);
    }
  };

  const fetchAllStudents = async () => {
    try {
      const res = await apiClient.get("/users?per_page=100");
      const list = res.data?.data?.data || res.data?.data || res.data;
      if (Array.isArray(list)) {
        setAllUsers(list.map((u: any) => ({ id: u.id, name: u.name, email: u.email })));
      }
    } catch (error) {
      console.error("Error fetching students list:", error);
    }
  };

  const handleAddSelectedMembers = async () => {
    if (!selectedGroup || selectedUserIds.length === 0) return;

    try {
      setAddingMembers(true);
      await courseService.addGroupMembers(selectedGroup.id, selectedUserIds);
      toast({ title: "Members Added", description: `Added ${selectedUserIds.length} student(s) to group.` });
      setSelectedUserIds([]);
      fetchGroupMembers(selectedGroup.id);
      fetchGroups();
    } catch (error) {
      console.error("Error adding members:", error);
      toast({ title: "Error", description: "Failed to add selected students.", variant: "destructive" });
    } finally {
      setAddingMembers(false);
    }
  };

  const handleRemoveMember = async (userId: number) => {
    if (!selectedGroup) return;

    try {
      await courseService.removeGroupMember(selectedGroup.id, userId);
      toast({ title: "Removed", description: "Member removed from cohort." });
      setGroupMembers(prev => prev.filter(m => m.id !== userId));
      fetchGroups();
    } catch (error) {
      console.error("Error removing member:", error);
      toast({ title: "Error", description: "Failed to remove member.", variant: "destructive" });
    }
  };

  const toggleSelectUser = (id: number) => {
    setSelectedUserIds(prev =>
      prev.includes(id) ? prev.filter(uId => uId !== id) : [...prev, id]
    );
  };

  const filteredGroups = groups.filter(g =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (g.organization && g.organization.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const existingMemberIds = new Set(groupMembers.map(m => m.id));
  const candidateUsers = allUsers.filter(u =>
    !existingMemberIds.has(u.id) &&
    (u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
     u.email.toLowerCase().includes(userSearchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Cohort Groups & Institutional Access
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage corporate cohorts, broker groups, and student cohorts with automated course access.
          </p>
        </div>
        <Button
          onClick={handleOpenCreateModal}
          className="bg-[#00aeef] hover:bg-[#008cc0] text-white gap-2 shadow-sm font-semibold text-xs uppercase tracking-wider"
        >
          <FontAwesomeIcon icon={faPlus} />
          Create Cohort Group
        </Button>
      </div>

      {/* Filter / Search Bar */}
      <Card className="border border-slate-200 shadow-sm">
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <FontAwesomeIcon
              icon={faSearch}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm"
            />
            <Input
              type="text"
              placeholder="Search by cohort name, code, or organization..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 text-sm rounded-lg"
            />
          </div>
        </CardContent>
      </Card>

      {/* Group List */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <FontAwesomeIcon icon={faSpinner} className="animate-spin text-3xl text-[#00aeef]" />
        </div>
      ) : filteredGroups.length === 0 ? (
        <Card className="text-center py-12 border-dashed border-2">
          <CardContent className="space-y-3">
            <FontAwesomeIcon icon={faUsers} className="text-4xl text-slate-300" />
            <h3 className="text-lg font-semibold text-slate-800">No Cohort Groups Found</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Create your first cohort group (e.g. "Registered Stockbrokers" or "Q4 2026 Applicants") to assign restricted courses.
            </p>
            <Button onClick={handleOpenCreateModal} className="bg-[#00aeef] text-white text-xs uppercase tracking-wider mt-2">
              Create Group Now
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredGroups.map((group) => (
            <Card
              key={group.id}
              className="border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <Badge variant="outline" className="font-mono text-[11px] bg-slate-50 text-slate-700">
                    {group.code}
                  </Badge>
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                    Active
                  </Badge>
                </div>
                <CardTitle className="text-base font-bold text-slate-900 mt-2">
                  {group.name}
                </CardTitle>
                {group.organization && (
                  <CardDescription className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mt-1">
                    <FontAwesomeIcon icon={faBuilding} className="text-[11px]" />
                    {group.organization}
                  </CardDescription>
                )}
              </CardHeader>

              <CardContent className="pt-0 space-y-4">
                {group.description && (
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {group.description}
                  </p>
                )}

                <div className="flex items-center gap-4 text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <span className="font-semibold text-slate-700">
                    👥 {group.members_count || 0} Members
                  </span>
                  <span>
                    📚 {group.course_assignments_count || 0} Courses
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenMembersModal(group)}
                    className="flex-1 text-xs font-semibold text-[#00aeef] hover:bg-[#00aeef]/10 border-[#00aeef]/30"
                  >
                    <FontAwesomeIcon icon={faUsers} className="mr-1.5" />
                    Manage Members
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleOpenEditModal(group)}
                    className="h-8 w-8 text-slate-600 hover:text-slate-900"
                  >
                    <FontAwesomeIcon icon={faEdit} className="text-xs" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDeleteGroup(group)}
                    className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <FontAwesomeIcon icon={faTrash} className="text-xs" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit Group Dialog */}
      <Dialog open={isGroupModalOpen} onOpenChange={setIsGroupModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingGroup ? "Edit Cohort Group" : "Create New Cohort Group"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveGroup} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label htmlFor="group-name">Group Name *</Label>
              <Input
                id="group-name"
                placeholder="e.g. Registered Stockbrokers"
                value={groupForm.name}
                onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="group-code">Group Code (Optional)</Label>
              <Input
                id="group-code"
                placeholder="e.g. BROKERS-2026"
                value={groupForm.code}
                onChange={(e) => setGroupForm({ ...groupForm, code: e.target.value.toUpperCase() })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="group-org">Sponsoring Organization</Label>
              <Input
                id="group-org"
                placeholder="e.g. Stockbrokers Association / Imara"
                value={groupForm.organization}
                onChange={(e) => setGroupForm({ ...groupForm, organization: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="group-desc">Description</Label>
              <Textarea
                id="group-desc"
                rows={3}
                placeholder="Brief description of this cohort's purpose..."
                value={groupForm.description}
                onChange={(e) => setGroupForm({ ...groupForm, description: e.target.value })}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsGroupModalOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-[#00aeef] hover:bg-[#008cc0] text-white"
              >
                {submitting ? "Saving..." : editingGroup ? "Update Group" : "Create Group"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Manage Members Dialog */}
      <Dialog open={isMembersModalOpen} onOpenChange={setIsMembersModalOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FontAwesomeIcon icon={faUsers} className="text-[#00aeef]" />
              Manage Members • {selectedGroup?.name}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 overflow-hidden pt-2">
            {/* Current Members Column */}
            <div className="border border-slate-200 rounded-xl p-3 flex flex-col h-[380px]">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Enrolled Members ({groupMembers.length})
                </span>
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-slate-100 mt-2">
                {loadingMembers ? (
                  <div className="flex justify-center items-center h-full">
                    <FontAwesomeIcon icon={faSpinner} className="animate-spin text-slate-400" />
                  </div>
                ) : groupMembers.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-10">
                    No members enrolled yet. Add students from the right panel.
                  </p>
                ) : (
                  groupMembers.map((member) => (
                    <div key={member.id} className="py-2 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-800 truncate">{member.name}</p>
                        <p className="text-[11px] text-slate-400 truncate">{member.email}</p>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleRemoveMember(member.id)}
                        className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50 shrink-0"
                        title="Remove member"
                      >
                        <FontAwesomeIcon icon={faXmark} className="text-xs" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Add New Members Column */}
            <div className="border border-slate-200 rounded-xl p-3 flex flex-col h-[380px]">
              <div className="pb-2 border-b border-slate-100 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Add Students to Cohort
                </span>
                <Input
                  placeholder="Search students by name or email..."
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-slate-100 mt-2">
                {candidateUsers.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-10">
                    {userSearchQuery ? "No matching students found." : "All registered students are already in this cohort."}
                  </p>
                ) : (
                  candidateUsers.slice(0, 50).map((u) => {
                    const isSelected = selectedUserIds.includes(u.id);
                    return (
                      <div
                        key={u.id}
                        onClick={() => toggleSelectUser(u.id)}
                        className={`py-2 px-2 flex items-center justify-between gap-2 rounded-lg cursor-pointer transition-colors ${
                          isSelected ? "bg-blue-50/80 border border-blue-200" : "hover:bg-slate-50"
                        }`}
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-800 truncate">{u.name}</p>
                          <p className="text-[11px] text-slate-400 truncate">{u.email}</p>
                        </div>
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
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

              {selectedUserIds.length > 0 && (
                <div className="pt-2 border-t border-slate-100">
                  <Button
                    size="sm"
                    onClick={handleAddSelectedMembers}
                    disabled={addingMembers}
                    className="w-full bg-[#00aeef] hover:bg-[#008cc0] text-white text-xs font-semibold"
                  >
                    {addingMembers ? (
                      <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-1.5" />
                    ) : (
                      <FontAwesomeIcon icon={faUserPlus} className="mr-1.5" />
                    )}
                    Add {selectedUserIds.length} Selected Student(s)
                  </Button>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
