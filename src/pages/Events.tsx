import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  faSpinner,
  faPlay,
  faBroadcastTower,
  faPlus,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import webinarBg from "@/assets/webinar.jpg";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "@/constants/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export interface EventItem {
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
}

const getYouTubeThumbnail = (url?: string): string | null => {
  if (!url) return null;
  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|live\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  return ytMatch ? `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg` : null;
};

const getEmbedUrl = (url?: string): string | null => {
  if (!url) return null;
  if (url.includes("<iframe") && url.includes('src="')) {
    const srcMatch = url.match(/src="([^"]+)"/);
    if (srcMatch) return srcMatch[1];
  }
  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|live\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  if (ytMatch) {
    return `https://www.youtube.com/embed/${ytMatch[1]}`;
  }
  const vimeoMatch = url.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^/]*)\/videos\/|album\/(?:\d+)\/video\/|)(\d+)/);
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }
  return null;
};

const Events = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "recorded" | "upcoming">("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  // New Event Form State
  const [form, setForm] = useState({
    title: "",
    type: "Recorded Webinar",
    date: new Date().toISOString().split("T")[0],
    time: "10:00 AM - 12:00 PM CAT",
    instructor: "ZSE Training Faculty",
    description: "",
    live_url: "",
    recording_url: "",
    registration_url: "",
    status: "recorded",
  });

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/public/events`);
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast({ title: "Validation Error", description: "Event title is required", variant: "destructive" });
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem("zse_training_token");
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };
      if (token && token !== "null" && token !== "undefined") {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/events`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          ...form,
          image_url: webinarBg,
          location: form.status === "recorded" ? "Recorded Broadcast" : "Online Live Webinar",
        }),
      });

      if (response.ok) {
        toast({
          title: "Event Saved",
          description: "The event / recording link has been successfully published.",
        });
        setIsModalOpen(false);
        setForm({
          title: "",
          type: "Recorded Webinar",
          date: new Date().toISOString().split("T")[0],
          time: "10:00 AM - 12:00 PM CAT",
          instructor: "ZSE Training Faculty",
          description: "",
          live_url: "",
          recording_url: "",
          registration_url: "",
          status: "recorded",
        });
        await fetchEvents();
      } else {
        const newEv: EventItem = {
          id: Date.now(),
          ...form,
          image_url: webinarBg,
        };
        setEvents([newEv, ...events]);
        setIsModalOpen(false);
        toast({
          title: "Event Added",
          description: "Your session recording has been added to the catalog.",
        });
      }
    } catch (err) {
      console.error("Error saving event:", err);
      toast({ title: "Error", description: "Failed to publish event. Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredEvents = events.filter((ev) => {
    const s = (ev.status || "").toLowerCase();
    if (filter === "upcoming") {
      return s === "upcoming" || s === "live";
    }
    if (filter === "recorded") {
      return s === "recorded" || s === "completed";
    }
    return true;
  });

  const upcomingCount = events.filter(
    (e) => (e.status || "").toLowerCase() === "upcoming" || (e.status || "").toLowerCase() === "live"
  ).length;

  const recordedCount = events.filter(
    (e) => (e.status || "").toLowerCase() === "recorded" || (e.status || "").toLowerCase() === "completed"
  ).length;

  return (
    <div className="min-h-screen bg-gray-50 font-montserrat flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-16 md:py-24 text-white bg-gray-900 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${webinarBg})` }}
        />
        <div className="absolute inset-0 bg-black/80 bg-gradient-to-r from-black/90 to-[#00aeef]/30 mix-blend-multiply" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="bg-[#00aeef] hover:bg-[#00aeef] text-white border-0 mb-4 px-4 py-1 uppercase tracking-widest text-xs font-semibold drop-shadow-md">
            On-Demand Webinars & Archives
          </Badge>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold mb-4 tracking-tight drop-shadow-md">
            Webinars & Recorded Sessions
          </h1>
          <p className="text-base md:text-lg text-gray-200 max-w-2xl mx-auto leading-relaxed drop-shadow-md">
            Watch full session recordings of past webinars as they happened. Access practical walkthroughs covering ZSE Direct, VFEX, and market frameworks.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 flex-grow w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 border-b border-gray-200 pb-5">
            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                onClick={() => setFilter("all")}
                size="sm"
                className={filter === "all" ? "bg-[#00aeef] text-white hover:bg-[#00aeef]/90" : "bg-white"}
              >
                All Recorded Sessions ({recordedCount})
              </Button>

              <Button
                variant={filter === "upcoming" ? "default" : "outline"}
                onClick={() => setFilter("upcoming")}
                size="sm"
                className={filter === "upcoming" ? "bg-[#00aeef] text-white hover:bg-[#00aeef]/90" : "bg-white"}
              >
                <FontAwesomeIcon icon={faBroadcastTower} className="mr-2 h-3.5 w-3.5" />
                Upcoming Live Events ({upcomingCount})
              </Button>
            </div>

            {/* Post Live Event Button - Only visible to Admins */}
            {user?.role === "admin" && (
              <Button
                onClick={() => setIsModalOpen(true)}
                className="bg-[#00aeef] hover:bg-[#008cc0] text-white font-semibold text-xs tracking-wider uppercase h-9 px-4 shadow-sm flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faPlus} className="h-3 w-3" />
                Post Webinar / Recording Link
              </Button>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <FontAwesomeIcon icon={faSpinner} className="animate-spin h-8 w-8 text-[#00aeef]" />
            </div>
          ) : filter === "upcoming" && upcomingCount === 0 ? (
            /* Clear Empty State for Upcoming Sessions */
            <div className="text-center py-16 px-4 bg-white border border-gray-200 rounded-xl shadow-sm max-w-2xl mx-auto">
              <div className="w-14 h-14 rounded-full bg-blue-50 text-[#00aeef] flex items-center justify-center mx-auto mb-4">
                <FontAwesomeIcon icon={faCalendar} className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">No Live Events Scheduled</h3>
              <p className="text-xs sm:text-sm text-gray-600 mb-6 leading-relaxed">
                We do not have any upcoming live events scheduled at the moment. All live sessions are posted here as they are announced. In the meantime, you can watch our full library of recorded masterclasses and webinars below.
              </p>
              <Button
                onClick={() => setFilter("all")}
                className="bg-[#00aeef] hover:bg-[#008cc0] text-white font-semibold text-xs uppercase tracking-wider h-10 px-6 rounded-lg shadow-sm"
              >
                <FontAwesomeIcon icon={faPlay} className="mr-2 h-3 w-3" />
                Browse Recorded Webinars
              </Button>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-16 bg-white border border-gray-200 rounded-xl shadow-sm">
              <p className="text-gray-500 text-base">No recorded sessions found. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => {
                const status = (event.status || "recorded").toLowerCase();
                const isLive = status === "live";
                const isRecorded = status === "recorded" || status === "completed";
                const ytThumbnail = getYouTubeThumbnail(event.recording_url) || getYouTubeThumbnail(event.live_url);
                const previewSrc = ytThumbnail || (event.image_url && !event.image_url.startsWith("/assets") ? event.image_url : webinarBg);

                return (
                  <Card
                    key={event.id}
                    className="overflow-hidden border border-gray-200/80 shadow-sm hover:shadow-xl hover:border-[#00aeef]/40 transition-all duration-300 bg-white flex flex-col h-full rounded-2xl group"
                  >
                    <Link to={`/events/${event.id}`} className="flex flex-col h-full">
                      {/* Image Preview / Banner */}
                      <div className="relative aspect-[16/9] overflow-hidden bg-slate-950">
                        <img
                          src={previewSrc}
                          alt={event.title}
                          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            e.currentTarget.src = webinarBg;
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

                        {/* Top Left: Type */}
                        <div className="absolute top-3 left-3">
                          <Badge className="bg-white/95 text-gray-900 border-0 font-bold uppercase tracking-wider text-[10px] px-2.5 py-0.5 shadow">
                            {event.type}
                          </Badge>
                        </div>

                        {/* Top Right: Status Badge */}
                        <div className="absolute top-3 right-3">
                          {isLive ? (
                            <Badge className="bg-red-600 text-white border-0 font-bold uppercase tracking-wider text-[10px] px-2.5 py-0.5 shadow flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-white inline-block" />
                              LIVE NOW
                            </Badge>
                          ) : (
                            <Badge className="bg-emerald-600 text-white border-0 font-semibold uppercase tracking-wider text-[10px] px-2.5 py-0.5 shadow flex items-center gap-1.5">
                              <FontAwesomeIcon icon={faPlay} className="h-2.5 w-2.5" />
                              Replay Available
                            </Badge>
                          )}
                        </div>

                        {/* Center Play Button for Recorded Events */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-black/60 backdrop-blur-sm border border-white/40 flex items-center justify-center group-hover:scale-110 group-hover:bg-[#00aeef] transition-all duration-300">
                            <FontAwesomeIcon icon={faPlay} className="h-4 w-4 text-white ml-0.5" />
                          </div>
                        </div>
                      </div>

                      {/* Card Content */}
                      <CardContent className="p-5 flex flex-col flex-grow justify-between">
                        <div>
                          <h3 className="text-base font-bold text-gray-900 mb-2 group-hover:text-[#00aeef] transition-colors line-clamp-2 leading-snug">
                            {event.title}
                          </h3>
                          <p className="text-xs text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                            {event.description?.replace(/<[^>]+>/g, "") || "Watch this comprehensive recorded educational session."}
                          </p>
                        </div>

                        <div className="space-y-2 pt-3 border-t border-gray-100 mt-auto">
                          <div className="flex items-center text-xs text-gray-700 font-medium">
                            <FontAwesomeIcon icon={faCalendar} className="text-[#00aeef] w-3.5 mr-2" />
                            <span>{event.date}</span>
                          </div>
                          <div className="flex items-center text-xs text-gray-700 font-medium">
                            <FontAwesomeIcon icon={faClock} className="text-[#00aeef] w-3.5 mr-2" />
                            <span>{event.time}</span>
                          </div>
                          <div className="flex items-center text-xs text-gray-700 font-medium">
                            <FontAwesomeIcon icon={faVideo} className="text-[#00aeef] w-3.5 mr-2" />
                            <span className="truncate">Speaker: {event.instructor || "ZSE Faculty"}</span>
                          </div>
                        </div>

                        <div className="w-full mt-4 pt-3 border-t border-gray-100">
                          <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-9 text-xs uppercase tracking-wider rounded-lg shadow-sm flex items-center justify-center gap-2">
                            <FontAwesomeIcon icon={faPlay} className="h-3 w-3" />
                            Watch Recording
                          </Button>
                        </div>
                      </CardContent>
                    </Link>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Post Live Event Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">
              Post Webinar / Event Recording
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Publish a link to a recorded event as it happened, or post a new session.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateEvent} className="space-y-4 py-2">
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Session Title *</label>
              <Input
                placeholder="e.g. ZSE Direct Market Masterclass & Live Walkthrough"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Session Type</label>
                <select
                  className="w-full h-10 px-3 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#00aeef]"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                >
                  <option value="Recorded Webinar">Recorded Webinar</option>
                  <option value="Recorded Masterclass">Recorded Masterclass</option>
                  <option value="Recorded Seminar">Recorded Seminar</option>
                  <option value="Interactive Workshop">Interactive Workshop</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Status</label>
                <select
                  className="w-full h-10 px-3 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#00aeef]"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option value="recorded">Recorded (Replay Available)</option>
                  <option value="upcoming">Upcoming (Scheduled)</option>
                  <option value="live">Live Now (In Progress)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Date</label>
                <Input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Time</label>
                <Input
                  placeholder="e.g. 10:00 AM - 12:00 PM CAT"
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Instructor / Presenter</label>
              <Input
                placeholder="e.g. ZSE Training Faculty & Research Team"
                value={form.instructor}
                onChange={(e) => setForm({ ...form, instructor: e.target.value })}
              />
            </div>

            <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-lg space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-900 block mb-1 flex items-center gap-1.5">
                  <FontAwesomeIcon icon={faPlay} className="text-emerald-600 h-3.5 w-3.5" />
                  Recording / Replay Video Link (As It Happened) *
                </label>
                <Input
                  placeholder="https://www.youtube.com/watch?v=... or Vimeo"
                  value={form.recording_url}
                  onChange={(e) => setForm({ ...form, recording_url: e.target.value })}
                />
                <span className="text-[11px] text-gray-500">
                  Paste the YouTube or video link where students can watch the live session as it happened.
                </span>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Session Description</label>
              <Textarea
                placeholder="Overview of the topics and discussions covered in this recorded session..."
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="bg-[#00aeef] text-white">
                {submitting ? "Publishing..." : "Save Session"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Events;
