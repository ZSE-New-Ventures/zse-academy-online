import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { API_BASE_URL } from "@/constants/api";
import webinarImage from "@/assets/webinar.jpg";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendar,
  faClock,
  faVideo,
  faArrowLeft,
  faSpinner,
  faPlay,
  faBroadcastTower,
  faEdit,
  faShareAlt,
  faCheck,
  faExternalLinkAlt,
} from "@fortawesome/free-solid-svg-icons";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface EventItem {
  id: number;
  title: string;
  type: string;
  date: string;
  time: string;
  instructor: string;
  description: string;
  image_url: string;
  registration_url: string;
  live_url?: string;
  recording_url?: string;
  status: string;
  location?: string;
  booking_information?: string;
}

const getYouTubeThumbnail = (url?: string): string | null => {
  if (!url) return null;
  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|live\/)|youtu\.be\/)([a-zA-Z0-9_\-]+)/);
  return ytMatch ? `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg` : null;
};

const getEmbedUrl = (url?: string): string | null => {
  if (!url) return null;
  if (url.includes("<iframe") && url.includes('src="')) {
    const srcMatch = url.match(/src="([^"]+)"/);
    if (srcMatch) return srcMatch[1];
  }
  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|live\/)|youtu\.be\/)([a-zA-Z0-9_\-]+)/);
  if (ytMatch) {
    return `https://www.youtube.com/embed/${ytMatch[1]}`;
  }
  const vimeoMatch = url.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|)(\d+)/);
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }
  return null;
};

const EventDetail = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  // Edit Link Form State
  const [editForm, setEditForm] = useState({
    live_url: "",
    recording_url: "",
    status: "upcoming",
  });

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/public/events/${id}`);
      if (response.ok) {
        const data = await response.json();
        setEvent(data);
        setEditForm({
          live_url: data.live_url || "",
          recording_url: data.recording_url || "",
          status: (data.status || "upcoming").toLowerCase(),
        });
      }
    } catch (error) {
      console.error("Error fetching event details:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchEvent();
  }, [id]);

  const handleUpdateLinks = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;

    try {
      setSaving(true);
      const token = localStorage.getItem("zse_training_token");
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };
      if (token && token !== "null" && token !== "undefined") {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/events/${event.id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        toast({
          title: "Links Updated",
          description: "The live stream and recording links have been saved.",
        });
        setIsEditOpen(false);
        await fetchEvent();
      } else {
        // Optimistic update
        setEvent({
          ...event,
          live_url: editForm.live_url,
          recording_url: editForm.recording_url,
          status: editForm.status,
        });
        setIsEditOpen(false);
        toast({
          title: "Template Updated",
          description: "The live stream / replay link has been updated on the page.",
        });
      }
    } catch (err) {
      console.error("Error updating event links:", err);
      toast({ title: "Update Failed", description: "Could not save link changes.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast({ title: "Link Copied", description: "Event URL copied to your clipboard." });
    setTimeout(() => setCopied(false), 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col font-montserrat">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <FontAwesomeIcon icon={faSpinner} className="animate-spin h-10 w-10 text-[#00aeef]" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col font-montserrat">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center text-center p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Event Not Found</h2>
          <p className="text-gray-600 mb-6 text-sm">The live session or webinar you are looking for does not exist.</p>
          <Link to="/events">
            <Button className="bg-[#00aeef] text-white font-semibold h-11 px-6 uppercase tracking-wider text-xs rounded-lg">
              <FontAwesomeIcon icon={faArrowLeft} className="mr-2" /> Back to Events
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const status = (event.status || "upcoming").toLowerCase();
  const isLive = status === "live";
  const isRecorded = status === "recorded" || status === "completed";

  // Check if we have an embeddable video URL (recording or live stream)
  const embedUrl = getEmbedUrl(event.recording_url) || getEmbedUrl(event.live_url);
  const primaryActionUrl = isLive
    ? event.live_url || event.registration_url
    : isRecorded
    ? event.recording_url || event.live_url
    : event.registration_url || event.live_url;

  const ytHeroThumb = getYouTubeThumbnail(event.recording_url) || getYouTubeThumbnail(event.live_url);
  const heroImage = ytHeroThumb || (event.image_url && !event.image_url.startsWith("/assets") ? event.image_url : webinarImage);

  return (
    <div className="min-h-screen bg-gray-50 font-montserrat flex flex-col">
      <Navbar />

      {/* Hero Header */}
      <section className="relative py-14 md:py-20 w-full overflow-hidden bg-gray-900 flex flex-col justify-center">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt={event.title}
            className="w-full h-full object-cover object-top opacity-25"
            onError={(e) => {
              e.currentTarget.src = webinarImage;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-900/90 to-gray-900/80" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <Link
              to="/events"
              className="inline-flex items-center text-gray-300 hover:text-white font-medium transition-colors text-xs uppercase tracking-wider"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="mr-2 h-3 w-3" /> Back to Webinars
            </Link>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs h-8"
              >
                <FontAwesomeIcon icon={copied ? faCheck : faShareAlt} className="mr-1.5 h-3 w-3" />
                {copied ? "Copied" : "Share Event"}
              </Button>

              {user?.role === "admin" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditOpen(true)}
                  className="bg-[#00aeef]/20 hover:bg-[#00aeef]/40 text-[#00aeef] border-[#00aeef]/40 text-xs h-8"
                >
                  <FontAwesomeIcon icon={faEdit} className="mr-1.5 h-3 w-3" />
                  Update Links / Post Recording
                </Button>
              )}
            </div>
          </div>

          <div className="mb-4 flex flex-wrap gap-2.5">
            <Badge className="bg-[#00aeef] text-white border-0 px-3 py-1 uppercase tracking-wider text-[11px] font-semibold">
              {event.type}
            </Badge>

            {isLive ? (
              <Badge className="bg-red-600 text-white border-0 px-3 py-1 uppercase tracking-wider text-[11px] font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-white inline-block" />
                Live Now In Progress
              </Badge>
            ) : isRecorded ? (
              <Badge className="bg-emerald-600 text-white border-0 px-3 py-1 uppercase tracking-wider text-[11px] font-semibold flex items-center gap-1.5">
                <FontAwesomeIcon icon={faPlay} className="h-2.5 w-2.5" />
                Recorded Session — Replay Available
              </Badge>
            ) : (
              <Badge className="bg-blue-600/80 text-white border-0 px-3 py-1 uppercase tracking-wider text-[11px] font-semibold">
                Upcoming Webinar
              </Badge>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mb-4 tracking-tight max-w-4xl leading-tight">
            {event.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-gray-300 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faCalendar} className="text-[#00aeef]" />
              <span>{event.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faClock} className="text-[#00aeef]" />
              <span>{event.time}</span>
            </div>
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faVideo} className="text-[#00aeef]" />
              <span>Speaker: {event.instructor || "ZSE Training Faculty"}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="py-10 flex-grow w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column: Video Broadcast & Details */}
            <div className="lg:w-2/3 space-y-6">
              {/* LIVE BANNER IF IN PROGRESS */}
              {isLive && (
                <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded-r-lg flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex rounded-full h-3 w-3 bg-red-600" />
                    <div>
                      <p className="text-sm font-bold text-red-900">This live session is currently happening!</p>
                      <p className="text-xs text-red-700">Join the live broadcast room or watch the stream below.</p>
                    </div>
                  </div>
                  {event.live_url && (
                    <a href={event.live_url} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider">
                        Join Meeting Room <FontAwesomeIcon icon={faExternalLinkAlt} className="ml-1.5 h-3 w-3" />
                      </Button>
                    </a>
                  )}
                </div>
              )}

              {/* EMBEDDED VIDEO PLAYER (FOR RECORDED OR EMBEDDED LIVE STREAMS) */}
              {embedUrl ? (
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="bg-gray-900 px-4 py-2.5 flex items-center justify-between text-white text-xs">
                    <span className="font-semibold flex items-center gap-2">
                      <FontAwesomeIcon icon={faPlay} className="text-[#00aeef]" />
                      {isRecorded ? "Live Event Recording (As It Happened)" : "Live Video Broadcast"}
                    </span>
                    <span className="text-gray-400 text-[11px]">1080p Full HD</span>
                  </div>
                  <div className="relative aspect-video w-full bg-black">
                    <iframe
                      src={embedUrl}
                      title={event.title}
                      className="absolute inset-0 w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  </div>
                </div>
              ) : isRecorded ? (
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm text-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                    <FontAwesomeIcon icon={faPlay} className="h-5 w-5 ml-0.5" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-1">Recording Available</h3>
                  <p className="text-xs text-gray-600 max-w-md mx-auto mb-4">
                    The recording for this session was captured as it happened. Click below to view the external recording.
                  </p>
                  {event.recording_url && (
                    <a href={event.recording_url} target="_blank" rel="noopener noreferrer">
                      <Button className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider">
                        Watch Recorded Stream <FontAwesomeIcon icon={faExternalLinkAlt} className="ml-2 h-3 w-3" />
                      </Button>
                    </a>
                  )}
                </div>
              ) : null}

              {/* Session Overview Card */}
              <div className="bg-white border border-gray-200 p-6 md:p-8 rounded-xl shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100">
                  About this Event
                </h2>
                <div
                  className="text-gray-700 leading-relaxed text-sm space-y-4 prose max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: event.description?.includes("<")
                      ? event.description
                      : event.description?.split("\n").map((p) => `<p>${p}</p>`).join("") || "",
                  }}
                />
              </div>
            </div>

            {/* Right Sidebar: Details & Action */}
            <div className="lg:w-1/3 space-y-6">
              <div className="bg-white border border-gray-200 shadow-sm p-6 rounded-xl sticky top-24">
                <h3 className="text-base font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100">
                  Session Information
                </h3>

                <div className="space-y-4 mb-6">
                  <div className="flex items-start">
                    <FontAwesomeIcon icon={faCalendar} className="text-[#00aeef] w-4 h-4 mt-1 mr-3" />
                    <div>
                      <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">Date</p>
                      <p className="font-semibold text-gray-900 text-sm">{event.date}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <FontAwesomeIcon icon={faClock} className="text-[#00aeef] w-4 h-4 mt-1 mr-3" />
                    <div>
                      <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">Time</p>
                      <p className="font-semibold text-gray-900 text-sm">{event.time}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <FontAwesomeIcon icon={faVideo} className="text-[#00aeef] w-4 h-4 mt-1 mr-3" />
                    <div>
                      <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">Presenter</p>
                      <p className="font-semibold text-gray-900 text-sm">{event.instructor || "ZSE Faculty"}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <FontAwesomeIcon icon={faBroadcastTower} className="text-[#00aeef] w-4 h-4 mt-1 mr-3" />
                    <div>
                      <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">Format</p>
                      <p className="font-semibold text-gray-900 text-sm">{event.location || "Online Broadcast"}</p>
                    </div>
                  </div>
                </div>

                {/* Primary Action Button */}
                {primaryActionUrl ? (
                  <a
                    href={primaryActionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full"
                  >
                    {isLive ? (
                      <Button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold h-12 text-xs uppercase tracking-wider rounded-lg shadow-sm flex items-center justify-center gap-2">
                        <FontAwesomeIcon icon={faBroadcastTower} className="h-3.5 w-3.5" />
                        Join Live Broadcast Now
                      </Button>
                    ) : isRecorded ? (
                      <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 text-xs uppercase tracking-wider rounded-lg shadow-sm flex items-center justify-center gap-2">
                        <FontAwesomeIcon icon={faPlay} className="h-3.5 w-3.5" />
                        Watch Full Recording
                      </Button>
                    ) : (
                      <Button className="w-full bg-[#00aeef] hover:bg-[#008cc0] text-white font-bold h-12 text-xs uppercase tracking-wider rounded-lg shadow-sm">
                        Register for Webinar
                      </Button>
                    )}
                  </a>
                ) : (
                  <Button
                    disabled
                    className="w-full bg-gray-200 text-gray-500 font-bold h-12 text-xs uppercase tracking-wider rounded-lg"
                  >
                    Registration Closed
                  </Button>
                )}

                <p className="text-[11px] text-gray-500 text-center mt-3">
                  {isRecorded
                    ? "Recorded broadcast is on-demand and accessible anytime."
                    : "Live webinars include real-time Q&A with the presenters."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Update Links / Post Recording Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900">
              Update Live & Recording Links
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Post the link to the live session or paste the replay video link for students to watch as it happened.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdateLinks} className="space-y-4 py-2">
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Session Status</label>
              <select
                className="w-full h-10 px-3 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#00aeef]"
                value={editForm.status}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
              >
                <option value="upcoming">Upcoming (Scheduled)</option>
                <option value="live">Live Now (In Progress)</option>
                <option value="recorded">Recorded (Replay Available)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Live Stream Link (Zoom, Teams, YouTube Live)
              </label>
              <Input
                placeholder="https://zoom.us/... or https://youtube.com/live/..."
                value={editForm.live_url}
                onChange={(e) => setEditForm({ ...editForm, live_url: e.target.value })}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Recording / Replay Video Link (As It Happened)
              </label>
              <Input
                placeholder="https://www.youtube.com/watch?v=... or Vimeo"
                value={editForm.recording_url}
                onChange={(e) => setEditForm({ ...editForm, recording_url: e.target.value })}
              />
              <span className="text-[11px] text-gray-500 mt-1 block">
                Paste YouTube watch/embed or video URL to embed playback directly into the page.
              </span>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving} className="bg-[#00aeef] text-white">
                {saving ? "Saving..." : "Save Links"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default EventDetail;
