import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faArrowRight,
  faPhone,
  faClock,
  faMapMarkerAlt,
  faEnvelope,
  faExternalLinkAlt,
  faBuilding,
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

const Contact = () => {
  return (
    <div className="min-h-screen bg-white font-montserrat text-slate-900">
      <Navbar />

      {/* Hero Header */}
      <section className="py-20 bg-[#0b1324] text-white relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#00aeef]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00aeef]/10 text-[#00aeef] text-xs font-bold uppercase tracking-wider mb-4 border border-[#00aeef]/30">
            <FontAwesomeIcon icon={faBuilding} />
            <span>ZSE Holdings Limited</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
            Contact Us
          </h1>
          <p className="mt-4 text-base text-slate-300 leading-relaxed">
            Leading Zimbabwe's financial future through innovative capital market solutions and professional excellence. Connect with our corporate headquarters.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <a
              href="tel:+263242886830"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white bg-[#00aeef] hover:bg-[#008cc0] px-5 py-2.5 rounded-full shadow-lg shadow-[#00aeef]/20 transition-all"
            >
              <FontAwesomeIcon icon={faPhone} />
              <span>Call Us</span>
            </a>
            <a
              href="mailto:info@zse.co.zw"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white bg-white/10 hover:bg-white/20 px-5 py-2.5 rounded-full border border-white/20 transition-all"
            >
              <FontAwesomeIcon icon={faEnvelope} />
              <span>Email Us</span>
            </a>
            <a
              href="https://maps.google.com/?q=44+Ridgeway+North+Highlands+Harare+Zimbabwe"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#00aeef] bg-white/10 hover:bg-white/20 px-5 py-2.5 rounded-full border border-white/20 transition-all"
            >
              <FontAwesomeIcon icon={faMapMarkerAlt} />
              <span>Visit Us</span>
            </a>
          </div>
        </div>
      </section>

      {/* Primary Contact Channels Grid */}
      <section className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#00aeef] block mb-2">
              Official Contact Information
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              ZSE Holdings Limited
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Reach our corporate headquarters directly via official telephone, email, or in person.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Physical Location */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-[#00aeef]/40 hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#00aeef] flex items-center justify-center text-xl mb-4">
                  <FontAwesomeIcon icon={faMapMarkerAlt} />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Location</h3>
                <h4 className="text-base font-bold text-slate-900 mt-1">Visit Us</h4>
                <div className="text-xs text-slate-600 mt-3 space-y-1">
                  <p className="font-semibold text-slate-800">ZSE Holdings Limited</p>
                  <p>44 Ridgeway North, Highlands</p>
                  <p>Harare, Zimbabwe</p>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100">
                <a
                  href="https://maps.google.com/?q=44+Ridgeway+North+Highlands+Harare+Zimbabwe"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00aeef] hover:underline"
                >
                  <span>Get Directions</span>
                  <FontAwesomeIcon icon={faExternalLinkAlt} className="text-[10px]" />
                </a>
              </div>
            </div>

            {/* Telephone Lines */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-[#00aeef]/40 hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl mb-4">
                  <FontAwesomeIcon icon={faPhone} />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Phone</h3>
                <h4 className="text-base font-bold text-slate-900 mt-1">Call Us</h4>
                <div className="text-xs text-slate-600 mt-3 space-y-2">
                  <div>
                    <span className="block text-[11px] text-slate-400 font-medium">Switchboard:</span>
                    <a href="tel:+263242886830" className="font-bold text-slate-900 hover:text-[#00aeef] transition-colors">
                      +263 242 886830-5
                    </a>
                  </div>
                  <div>
                    <span className="block text-[11px] text-slate-400 font-medium">VoIP / Direct:</span>
                    <a href="tel:+2638677009115" className="font-bold text-slate-900 hover:text-[#00aeef] transition-colors">
                      +263 8677009115
                    </a>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100">
                <span className="text-[11px] text-slate-500 font-medium">
                  Mon – Fri: 8:00 AM – 4:30 PM CAT
                </span>
              </div>
            </div>

            {/* Electronic Mail */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-[#00aeef]/40 hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-xl mb-4">
                  <FontAwesomeIcon icon={faEnvelope} />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Email</h3>
                <h4 className="text-base font-bold text-slate-900 mt-1">Email Us</h4>
                <div className="text-xs text-slate-600 mt-3 space-y-2">
                  <div>
                    <span className="block text-[11px] text-slate-400 font-medium">General:</span>
                    <a href="mailto:info@zse.co.zw" className="font-bold text-slate-900 hover:text-[#00aeef] transition-colors">
                      info@zse.co.zw
                    </a>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100">
                <a
                  href="mailto:info@zse.co.zw"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00aeef] hover:underline"
                >
                  <span>Compose Email</span>
                  <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
                </a>
              </div>
            </div>

            {/* Business Hours */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-[#00aeef]/40 hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl mb-4">
                  <FontAwesomeIcon icon={faClock} />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Schedule</h3>
                <h4 className="text-base font-bold text-slate-900 mt-1">Business Hours</h4>
                <div className="text-xs text-slate-600 mt-3 space-y-1.5">
                  <div className="flex justify-between items-center py-0.5">
                    <span className="font-medium text-slate-700">Monday - Friday:</span>
                    <span className="font-bold text-slate-900">8:00 AM - 4:30 PM</span>
                  </div>
                  <div className="flex justify-between items-center py-0.5 text-slate-500">
                    <span>Saturday:</span>
                    <span className="font-semibold text-rose-600">Closed</span>
                  </div>
                  <div className="flex justify-between items-center py-0.5 text-slate-500">
                    <span>Sunday:</span>
                    <span className="font-semibold text-rose-600">Closed</span>
                  </div>
                  <div className="flex justify-between items-center py-0.5 text-slate-500">
                    <span>Public Holidays:</span>
                    <span className="font-semibold text-rose-600">Closed</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100">
                <p className="text-[10px] text-slate-400 italic">
                  Trading hours may differ. Please contact our trading desk for specific trading hours.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map & Location Directions Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-50 rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#00aeef] block">
                Visit Our Office
              </span>
              <h3 className="text-2xl font-black text-slate-900">
                ZSE Holdings Limited
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                44 Ridgeway North, Highlands, Harare, Zimbabwe. Open Monday through Friday from 8:00 AM to 4:30 PM CAT.
              </p>
              
              <div className="pt-2 space-y-2 text-xs text-slate-700">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#00aeef] flex items-center justify-center shrink-0">
                    <FontAwesomeIcon icon={faPhone} />
                  </div>
                  <span>Phone: <strong>+263 242 886830-5 / +263 8677009115</strong></span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                    <FontAwesomeIcon icon={faEnvelope} />
                  </div>
                  <span>Email: <strong>info@zse.co.zw</strong></span>
                </div>
              </div>

              <div className="pt-4">
                <a
                  href="https://maps.google.com/?q=44+Ridgeway+North+Highlands+Harare+Zimbabwe"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#00aeef] hover:bg-[#008cc0] text-white text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-xl shadow-md transition-all"
                >
                  <FontAwesomeIcon icon={faMapMarkerAlt} />
                  <span>Open in Google Maps</span>
                </a>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="w-full h-80 sm:h-96 rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
                <iframe
                  title="ZSE Holdings Limited Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3798.544837330554!2d31.0963509!3d-17.7941551!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1931a525f0535e61%3A0xb363e792bfe1d02c!2s44%20Ridgeway%20N%2C%20Harare%2C%20Zimbabwe!5e0!3m2!1sen!2szw!4v1716300000000!5m2!1sen!2szw"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={false}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-full grayscale-[20%] contrast-[1.05]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
