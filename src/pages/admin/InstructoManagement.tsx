import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { API_BASE_URL } from "@/constants/api";

interface Instructor {
  id: number;
  name: string;
  email: string;
  phone?: string;
  bio?: string;
  
}

function InstructorManagement() {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
 

  const { toast } = useToast();

  const API_URL = `${API_BASE_URL}/instructors`;
  const token = localStorage.getItem("zse_training_token");

  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  useEffect(() => {
    fetchInstructors();
  }, []);

  // FETCH INSTRUCTORS
  const fetchInstructors = async () => {
    try {
      const response = await fetch(API_URL, { headers: authHeaders });
      const json = await response.json();
      const result = Array.isArray(json.instructors)
        ? json.instructors
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

  // CREATE INSTRUCTOR
  const handleAddInstructor = async () => {
    if (!name.trim() || !email.trim()) {
      return toast({
        title: "Validation Error",
        description: "Name and Email are required",
        variant: "destructive",
      });
    }

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          name,
          email,
          phone,
          bio,
         
        }),
      });

      const json = await response.json();
      if (!json.instructor) throw new Error("Invalid API response");

      setInstructors((prev) => [...prev, json.instructor]);

      // Reset form
      setName("");
      setEmail("");
      setPhone("");
      setBio("");
      

      toast({
        title: "Success",
        description: "Instructor added successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add instructor",
        variant: "destructive",
      });
    }
  };

  // DELETE INSTRUCTOR
  const handleDeleteInstructor = async (id: number) => {
    try {
      await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: authHeaders,
      });

      setInstructors((prev) => prev.filter((inst) => inst.id !== id));

      toast({
        title: "Deleted",
        description: "Instructor removed successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete instructor",
        variant: "destructive",
      });
    }
  };

  const filteredInstructors = instructors.filter((inst) =>
    inst.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Instructor Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Instructor Management</CardTitle>
      </CardHeader>

      <CardContent className="space-y-8">
        {/* Add Instructor Section */}
        <div className="flex flex-col md:flex-row md:items-end gap-4">
          <Input
            placeholder="Instructor name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1"
          />

          <Input
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1"
          />

          <Input
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="flex-1"
          />

          <Input
            placeholder="Short bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="flex-1"
          />

          

          <Button onClick={handleAddInstructor}>
            <FontAwesomeIcon icon={faPlus} className="mr-2" /> Add
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <FontAwesomeIcon
            icon={faSearch}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Search instructors…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Instructor List */}
        <div className="space-y-4">
          {filteredInstructors.map((instructor) => (
            <Card key={instructor.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant="outline">{instructor.id}</Badge>
                  <div>
                    <div className="font-semibold">{instructor.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {instructor.email} {instructor.phone && `| ${instructor.phone}`}
                    </div>
                    {instructor.bio && (
                      <div className="text-xs text-muted-foreground">{instructor.bio}</div>
                    )}
                  </div>
                </div>

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteInstructor(instructor.id)}
                >
                  <FontAwesomeIcon icon={faTrash} className="mr-1" /> Delete
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredInstructors.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No instructors found
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default InstructorManagement;
