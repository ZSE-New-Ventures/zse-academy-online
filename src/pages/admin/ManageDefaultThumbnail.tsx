import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faImage,
  faUpload,
  faInfoCircle,
  faCheckCircle,
  faRotateRight,
} from "@fortawesome/free-solid-svg-icons";
import { courseService } from "@/services/course.service";
import {
  getCachedDefaultThumbnail,
  setCachedDefaultThumbnail,
  fetchAndCacheDefaultThumbnail,
} from "@/utils/courseThumbnail";
import defaultAsset from "@/assets/course-investing-101.png";

export const ManageDefaultThumbnail = () => {
  const [activeThumbnail, setActiveThumbnail] = useState<string>(getCachedDefaultThumbnail());
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchAndCacheDefaultThumbnail().then((url) => {
      if (url) setActiveThumbnail(url);
    });
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Image file must be smaller than 2MB.",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setUrlInput("");
    }
  };

  const handleSave = async () => {
    if (!selectedFile && !urlInput.trim()) {
      return toast({
        title: "No image selected",
        description: "Please choose an image file or enter an image URL.",
        variant: "destructive",
      });
    }

    try {
      setSaving(true);
      let res;
      if (selectedFile) {
        const fd = new FormData();
        fd.append("thumbnail", selectedFile);
        res = await courseService.updateDefaultThumbnail(fd);
      } else {
        res = await courseService.updateDefaultThumbnail({
          thumbnail_url: urlInput.trim(),
        });
      }

      const newUrl =
        res.default_thumbnail_url || res.data?.default_thumbnail_url;
      if (newUrl) {
        setActiveThumbnail(newUrl);
        setCachedDefaultThumbnail(newUrl);
      }
      setSelectedFile(null);
      setPreviewUrl(null);
      setUrlInput("");

      toast({
        title: "Default Thumbnail Saved",
        description: "Platform default course thumbnail updated successfully.",
      });
    } catch (error) {
      console.error("Failed to save default thumbnail:", error);
      toast({
        title: "Error",
        description: "Failed to update default thumbnail.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleResetToFactoryDefault = async () => {
    try {
      setSaving(true);
      await courseService.updateDefaultThumbnail({ thumbnail_url: "" });
      setActiveThumbnail(defaultAsset);
      setCachedDefaultThumbnail(defaultAsset);
      setSelectedFile(null);
      setPreviewUrl(null);
      setUrlInput("");
      toast({
        title: "Reset to Default",
        description: "Platform default thumbnail reset to the system built-in image.",
      });
    } catch (error) {
      console.error("Failed to reset:", error);
      toast({
        title: "Error",
        description: "Failed to reset thumbnail.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Default Course Thumbnail
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Configure the fallback image displayed across the platform whenever a course has no custom thumbnail uploaded or selected.
        </p>
      </div>

      {/* Main Settings Card */}
      <Card className="border border-slate-200 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#00aeef]/10 text-[#00aeef] flex items-center justify-center shrink-0">
              <FontAwesomeIcon icon={faImage} className="text-sm" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-slate-900">
                Active Default Thumbnail
              </CardTitle>
              <p className="text-xs text-slate-500">
                Displayed in the catalog, course cards, and student dashboard when a course thumbnail is empty.
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Specifications Alert */}
          <div className="flex items-center gap-2.5 p-3 bg-blue-50/80 border border-blue-200 rounded-xl text-xs text-blue-900">
            <FontAwesomeIcon icon={faInfoCircle} className="text-blue-500 shrink-0 text-sm" />
            <div>
              <strong>Recommended Image Specifications:</strong> 1280 × 720 px (16:9 ratio, max 2MB, JPG or PNG format).
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Live Preview Column */}
            <div className="lg:col-span-6 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Preview</span>
                <Badge
                  className={`text-[10px] font-semibold ${
                    previewUrl
                      ? "bg-amber-100 text-amber-800 border-amber-300"
                      : "bg-emerald-100 text-emerald-800 border-emerald-300"
                  }`}
                >
                  {previewUrl ? "New Image Selected" : "Active Default"}
                </Badge>
              </div>

              <div className="relative aspect-video rounded-2xl overflow-hidden border-2 border-slate-200 bg-slate-100 shadow-md">
                <img
                  src={previewUrl || activeThumbnail}
                  alt="Default course thumbnail preview"
                  className="w-full h-full object-cover object-center"
                />
              </div>
              <p className="text-[11px] text-slate-400 text-center">
                Aspect ratio: 16:9 standard course banner
              </p>
            </div>

            {/* Upload & Configuration Controls */}
            <div className="lg:col-span-6 space-y-4">
              {/* File Upload Box */}
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1.5">
                  Upload New Image File
                </label>
                <label className="border-2 border-dashed border-slate-300 hover:border-[#00aeef] rounded-2xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-slate-50">
                  <div className="w-10 h-10 rounded-full bg-[#00aeef]/10 text-[#00aeef] flex items-center justify-center mb-2">
                    <FontAwesomeIcon icon={faUpload} className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-800">
                    Click to choose image file
                  </span>
                  <span className="text-[11px] text-muted-foreground mt-0.5">
                    1280 × 720 px (16:9 ratio) • Max 2MB (JPG, PNG, WebP)
                  </span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
                {selectedFile && (
                  <div className="mt-2 flex items-center justify-between p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800">
                    <span className="truncate max-w-[240px] font-semibold">
                      ✓ Selected: {selectedFile.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl(null);
                      }}
                      className="text-red-500 hover:text-red-700 font-bold ml-2 text-xs"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>

              {/* Or URL Input */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Or enter an Image URL
                </label>
                <Input
                  type="url"
                  placeholder="https://example.com/default-course-thumbnail.jpg"
                  value={urlInput}
                  onChange={(e) => {
                    setUrlInput(e.target.value);
                    if (e.target.value) {
                      setPreviewUrl(e.target.value);
                      setSelectedFile(null);
                    }
                  }}
                  className="text-xs bg-white"
                />
              </div>

              {/* Actions */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Button
                  onClick={handleSave}
                  disabled={saving || (!selectedFile && !urlInput.trim())}
                  className="bg-[#00aeef] hover:bg-[#008cc0] text-white text-xs font-bold h-10 px-5 rounded-xl shadow-sm"
                >
                  <FontAwesomeIcon icon={faCheckCircle} className="mr-1.5" />
                  {saving ? "Saving..." : "Save Default Thumbnail"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleResetToFactoryDefault}
                  disabled={saving}
                  className="text-xs font-semibold h-10 px-4 rounded-xl border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  <FontAwesomeIcon icon={faRotateRight} className="mr-1.5 text-slate-500" />
                  Reset to Built-in Image
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Guide Card */}
      <Card className="border border-slate-200 bg-slate-50/50 shadow-xs">
        <CardContent className="p-5">
          <h3 className="font-bold text-sm text-slate-800 mb-2">
            💡 How Course Thumbnails Work
          </h3>
          <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-600">
            <li>
              <strong>Custom Course Image:</strong> When adding or editing a course under <em>Courses</em>, you can upload a specific thumbnail for that course.
            </li>
            <li>
              <strong>Platform Default:</strong> If a course has no image uploaded or selected, this default image is used automatically across the catalog, student dashboard, and course details.
            </li>
            <li>
              <strong>Resolution:</strong> Keep image dimensions at <strong>1280 × 720 px</strong> for the sharpest quality on mobile and desktop screens.
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManageDefaultThumbnail;
