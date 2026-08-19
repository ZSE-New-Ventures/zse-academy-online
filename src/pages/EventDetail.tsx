import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { API_BASE_URL } from "@/constants/api";
import webinarImage from "@/assets/webinar.jpg";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendar, faClock, faVideo, faArrowLeft, faSpinner } from "@fortawesome/free-solid-svg-icons";

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

const EventDetail = () => {
  const { id } = useParams();
  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/public/events/${id}`);
        if (response.ok) {
          const data = await response.json();
          setEvent(data);
        }
      } catch (error) {
        console.error("Error fetching event details:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) fetchEvent();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <FontAwesomeIcon icon={faSpinner} className="animate-spin h-12 w-12 text-[#00aeef]" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center text-center p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Event Not Found</h2>
          <p className="text-gray-600 mb-8">The live session or webinar you are looking for does not exist.</p>
          <Link to="/events">
            <Button className="bg-[#00aeef] text-white font-bold h-12 px-8 uppercase tracking-widest rounded-none">
              <FontAwesomeIcon icon={faArrowLeft} className="mr-3" /> Back to Events
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-montserrat flex flex-col">
      <Navbar />

      {/* Hero Header with Image */}
      <section className="relative py-12 md:py-16 w-full overflow-hidden bg-gray-900 flex flex-col justify-center min-h-[300px]">
        <div className="absolute inset-0">
          <img 
            src={event.image_url || webinarImage} 
            alt={event.title}
            className="w-full h-full object-cover"
          />
          {/* Dark overlay with brand color tint matching other pages */}
          <div className="absolute inset-0 bg-black/60 bg-gradient-to-r from-black/80 to-[#00aeef]/30 mix-blend-multiply" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center mt-8">
          
          <div className="mb-6 flex flex-wrap justify-center gap-3">
            <Badge className="bg-[#00aeef] hover:bg-[#00aeef] text-white border-0 px-4 py-1 uppercase tracking-widest text-xs font-bold drop-shadow-md">
              {event.type}
            </Badge>
            {event.status.toLowerCase() === 'recorded' && (
              <Badge className="bg-emerald-500 hover:bg-emerald-500 text-white border-0 px-4 py-1 uppercase tracking-widest text-xs font-bold drop-shadow-md">
                Recording Available
              </Badge>
            )}
          </div>

          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-8 tracking-tight max-w-5xl mx-auto leading-tight drop-shadow-md truncate px-4">
            {event.title}
          </h1>

          <div className="flex justify-center mt-8">
            <Link to="/events" className="inline-flex items-center text-gray-300 hover:text-white font-semibold transition-colors uppercase tracking-wider text-xs">
              <FontAwesomeIcon icon={faArrowLeft} className="mr-2" /> Back to Schedule
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="py-16 flex-grow w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-12">
            
            {/* Left Content */}
            <div className="lg:w-2/3">
              <div className="bg-white border border-gray-200 p-8 md:p-10 shadow-sm rounded-none">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">About this session</h2>
                <div className="text-gray-700 leading-relaxed space-y-6 text-lg">
                  {event.description.split('\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="lg:w-1/3">
              <div className="bg-white border border-gray-200 shadow-sm p-8 sticky top-28 rounded-none">
                <h3 className="text-lg font-bold text-gray-900 mb-6 pb-3 border-b border-gray-100">Session Details</h3>
                
                <div className="space-y-5 mb-8">
                  <div className="flex items-start">
                    <FontAwesomeIcon icon={faCalendar} className="text-[#00aeef] w-5 h-5 mt-0.5 mr-4" />
                    <div>
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Date</p>
                      <p className="font-semibold text-gray-900">{event.date}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <FontAwesomeIcon icon={faClock} className="text-[#00aeef] w-5 h-5 mt-0.5 mr-4" />
                    <div>
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Time</p>
                      <p className="font-semibold text-gray-900">{event.time}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <FontAwesomeIcon icon={faVideo} className="text-[#00aeef] w-5 h-5 mt-0.5 mr-4" />
                    <div>
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Instructor</p>
                      <p className="font-semibold text-gray-900">{event.instructor}</p>
                    </div>
                  </div>
                </div>

                <a href={event.registration_url} target="_blank" rel="noopener noreferrer" className="block w-full">
                  <Button className="w-full bg-[#00aeef] hover:bg-[#008cc0] text-white font-bold h-14 text-sm uppercase tracking-widest rounded-none shadow-none">
                    {event.status.toLowerCase() === 'recorded' ? 'Watch Recording' : 'Register Now'}
                  </Button>
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default EventDetail;
