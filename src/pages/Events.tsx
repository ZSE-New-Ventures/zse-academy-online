import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendar, faClock, faVideo, faSpinner } from "@fortawesome/free-solid-svg-icons";
import webinarBg from "@/assets/webinar.jpg";
import { Link } from "react-router-dom";

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
  status: string;
}

const Events = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/public/events");
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
    fetchEvents();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 font-montserrat flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section 
        className="relative py-20 md:py-32 text-white bg-gray-900 overflow-hidden"
      >
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: `url(${webinarBg})`,
          }}
        />
        {/* Dark overlay with brand color tint */}
        <div className="absolute inset-0 bg-black/60 bg-gradient-to-r from-black/80 to-[#00aeef]/30 mix-blend-multiply" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="bg-[#00aeef] hover:bg-[#00aeef] text-white border-0 mb-6 px-4 py-1 uppercase tracking-widest text-xs drop-shadow-md">
            Live Learning
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight drop-shadow-md">
            Live Events & Webinars
          </h1>
          <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto leading-relaxed drop-shadow-md">
            Accelerate your learning by joining our expert instructors in real-time. Participate in live Q&A, market analysis, and interactive workshops.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 flex-grow w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
            <h2 className="text-2xl font-bold text-gray-900">Upcoming Schedule</h2>
            <div className="flex items-center gap-4">
              <Button variant="outline" className="border-gray-300 text-gray-700 bg-white shadow-none">
                Past Events
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <FontAwesomeIcon icon={faSpinner} className="animate-spin h-8 w-8 text-[#00aeef]" />
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-20 bg-white border border-gray-100 rounded-lg shadow-sm">
              <p className="text-gray-500 text-lg">No events scheduled at the moment. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {events.map((event) => (
                <Card key={event.id} className="overflow-hidden border border-gray-200 shadow-sm group hover:shadow-lg transition-shadow bg-white flex flex-col h-full rounded-none">
                  <Link to={`/events/${event.id}`} className="flex flex-col h-full">
                    <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 rounded-none">
                      <img
                        src={event.image_url || "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=400&fit=crop"}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 rounded-none"
                      />
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-white text-gray-900 border-0 shadow-sm font-bold uppercase tracking-wider text-[10px] rounded-sm">
                          {event.type}
                        </Badge>
                      </div>
                    </div>
                    
                    <CardContent className="p-4 md:p-5 flex flex-col flex-grow">
                      <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#00aeef] transition-colors line-clamp-2">
                        {event.title}
                      </h3>
                      <p className="text-xs text-gray-600 mb-4 line-clamp-3 flex-grow">
                        {event.description}
                      </p>
                      
                      <div className="space-y-2 mb-5 pt-3 border-t border-gray-100 mt-auto">
                        <div className="flex items-center text-xs text-gray-700 font-medium">
                          <FontAwesomeIcon icon={faCalendar} className="text-[#00aeef] w-3.5 mr-2" />
                          {event.date}
                        </div>
                        <div className="flex items-center text-xs text-gray-700 font-medium">
                          <FontAwesomeIcon icon={faClock} className="text-[#00aeef] w-3.5 mr-2" />
                          {event.time}
                        </div>
                        <div className="flex items-center text-xs text-gray-700 font-medium">
                          <FontAwesomeIcon icon={faVideo} className="text-[#00aeef] w-3.5 mr-2" />
                          <span className="truncate">Instructor: {event.instructor}</span>
                        </div>
                      </div>

                      <div className="w-full">
                        <Button className="w-full bg-[#00aeef] hover:bg-[#008cc0] text-white font-bold h-10 text-xs uppercase tracking-wider rounded-none shadow-none">
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>
          )}

        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Events;
