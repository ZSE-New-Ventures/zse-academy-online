import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { API_BASE_URL } from "@/constants/api";

interface Category {
  id: number;
  name: string;
  slug?: string;
  description?: string;
  is_active?: boolean;
}

function AdminConfigurations() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);

  const { toast } = useToast();

  const API_URL = `${API_BASE_URL}/categories`;

  // TOKEN
  const token = localStorage.getItem("zse_training_token");

  // HEADERS
  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  
  // FETCH CATEGORIES
  const fetchCategories = async () => {
    console.log("📡 Fetching categories...");

    try {
      const response = await fetch(API_URL, {
        headers: authHeaders,
      });

      console.log("🔵 Raw Response:", response);

      const json = await response.json();

      console.log("🟢 JSON Response:", json);

      // FIX: handle pagination structure
      const result = Array.isArray(json.data?.data) ? json.data.data : [];

      console.log("📦 Parsed Result:", result);

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

  // CREATE CATEGORY
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
          is_active: isActive,
        }),
      });

      const json = await response.json();

      if (!json.data) throw new Error("Invalid response");

      const newCategory = json.data;

      setCategories((prev) => [...prev, newCategory]);

      setName("");
      setSlug("");
      setDescription("");
      setIsActive(true);

      toast({
        title: "Success",
        description: "Category created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create category",
        variant: "destructive",
      });
    }
  };

  // DELETE CATEGORY
  const handleDeleteCategory = async (categoryId: number) => {
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

  const filteredCategories = categories.filter((cat) =>
    cat.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Card>
        <CardHeader>
          
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
        
      </CardHeader>

      <CardContent className="space-y-8">
        {/* Add Category - All in one line */}
        <div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              {/* Name - 3 columns */}
              <div className="md:col-span-3">
                <label className="text-sm font-medium mb-2 block">Name</label>
                <Input
                  placeholder="Category name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              
              {/* Slug - 2 columns */}
              <div className="md:col-span-2">
                <label className="text-sm font-medium mb-2 block">Slug</label>
                <Input
                  placeholder="Slug (optional)"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                />
              </div>

              {/* Description - 4 columns */}
              <div className="md:col-span-4">
                <label className="text-sm font-medium mb-2 block">Description</label>
                <Input
                  placeholder="Description (optional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* Active Switch and Button - 3 columns */}
              <div className="md:col-span-3">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch checked={isActive} onCheckedChange={setIsActive} />
                    <span className="text-sm font-medium">Active</span>
                  </div>
                  <Button 
                    onClick={handleAddCategory} 
                    className="flex-1"
                  >
                    <FontAwesomeIcon icon={faPlus} className="mr-2" />
                    Create
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <FontAwesomeIcon
            icon={faSearch}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Category List */}
        <div className="space-y-4">
          {filteredCategories.map((category) => (
            <Card key={category.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant="outline">{category.id}</Badge>
                  <div>
                    <div className="font-semibold">{category.name}</div>
                    {category.slug && (
                      <div className="text-xs text-muted-foreground">
                        /{category.slug}
                      </div>
                    )}
                    {category.description && (
                      <div className="text-sm text-muted-foreground mt-1">
                        {category.description}
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteCategory(category.id)}
                >
                  <FontAwesomeIcon icon={faTrash} className="mr-1" />
                  Delete
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCategories.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No categories found
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default AdminConfigurations;
