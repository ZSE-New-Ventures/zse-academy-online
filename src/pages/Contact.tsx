import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faArrowRight,
  faPhone,
  faClock,
  faMapMarkerAlt,
  faEnvelope,
  faBuildingColumns,
  faHeadset,
  faCircleQuestion,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    inquiry: "course-info",
    message: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setSubmitted(true);
      toast({
        title: "Inquiry Submitted Successfully",
        description: "Our investor relations and support team will respond within 24 business hours.",
        variant: "default",
      });
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-white font-montserrat text-slate-900">
      <Navbar />

      {/* Hero Header */}
      <section className="py-20 bg-[#0b1324] text-white relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#00aeef]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00aeef]/10 text-[#00aeef] text-xs font-bold uppercase tracking-wider mb-4 border border-[#00aeef]/30">
            <FontAwesomeIcon icon={faHeadset} />
            <span>Support & Investor Relations</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
            We’re Here to Guide Your Trading Journey
          </h1>
          <p className="mt-4 text-base text-slate-300 leading-relaxed">
            Have questions about course registration, certificate verification, or connecting with registered stockbrokers? Contact the official ZSE Training Institute support team.
          </p>

          <div className="mt-6 flex items-center justify-center gap-4">
            <Link
              to="/faq"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#00aeef] bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full border border-white/20 transition-colors"
            >
              <FontAwesomeIcon icon={faCircleQuestion} />
              <span>Browse Help Center FAQs First</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Form & Location Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Left Column: Official Contact Channels */}
            <div className="lg:col-span-5 space-y-8">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#00aeef] block mb-2">
                  Exchange Secretariat
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Zimbabwe Stock Exchange Limited
                </h2>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Our investor education officers are ready to assist you on business days between 8:00 AM and 4:30 PM CAT.
                </p>
              </div>

              {/* Cards Grid */}
              <div className="space-y-4">
                <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4 hover:border-[#00aeef]/40 transition-colors">
                  <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#00aeef] flex items-center justify-center text-lg shrink-0">
                    <FontAwesomeIcon icon={faMapMarkerAlt} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Physical Address</h3>
                    <p className="text-sm font-bold text-slate-900 mt-1">
                      44 Ridgeway North, Highlands
                    </p>
                    <p className="text-xs text-slate-500">Harare, Zimbabwe</p>
                  </div>
                </div>

                <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4 hover:border-[#00aeef]/40 transition-colors">
                  <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg shrink-0">
                    <FontAwesomeIcon icon={faPhone} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Telephone Lines</h3>
                    <p className="text-sm font-bold text-slate-900 mt-1">
                      +263 242 886830-5 / +263 8677000450
                    </p>
                    <p className="text-xs text-slate-500">Mon - Fri, 08:00 - 16:30 CAT</p>
                  </div>
                </div>

                <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4 hover:border-[#00aeef]/40 transition-colors">
                  <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-lg shrink-0">
                    <FontAwesomeIcon icon={faEnvelope} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Electronic Mail</h3>
                    <p className="text-sm font-bold text-slate-900 mt-1">
                      info@zse.co.zw
                    </p>
                    <p className="text-xs text-slate-500">support@zsedirect.co.zw</p>
                  </div>
                </div>

                <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4 hover:border-[#00aeef]/40 transition-colors">
                  <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-lg shrink-0">
                    <FontAwesomeIcon icon={faBuildingColumns} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Victoria Falls Office</h3>
                    <p className="text-sm font-bold text-slate-900 mt-1">
                      Victoria Falls Stock Exchange Limited
                    </p>
                    <p className="text-xs text-slate-500">Shop 1, Stand 661, Victoria Falls, Zimbabwe</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Contact Form */}
            <div className="lg:col-span-7">
              <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-slate-200">
                {submitted ? (
                  <div className="text-center py-12 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center text-3xl mx-auto">
                      <FontAwesomeIcon icon={faCheckCircle} />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900">Message Delivered</h3>
                    <p className="text-sm text-slate-600 max-w-md mx-auto">
                      Thank you for contacting ZSE Training Institute. A customer representative has received your ticket and will follow up shortly.
                    </p>
                    <Button
                      onClick={() => setSubmitted(false)}
                      className="mt-4 bg-[#00aeef] hover:bg-[#008cc0] text-white font-bold text-xs uppercase tracking-wider px-6 py-2.5 rounded-xl"
                    >
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <h3 className="text-2xl font-black text-slate-900">Send an Official Inquiry</h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Please fill in your details and our team will get back to you promptly.
                      </p>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-slate-700">
                          Full Name *
                        </Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                          placeholder="e.g. Tendai Moyo"
                          className="h-11 bg-slate-50 border-slate-200 rounded-xl focus:border-[#00aeef]"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-slate-700">
                          Email Address *
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          placeholder="e.g. tendai@example.com"
                          className="h-11 bg-slate-50 border-slate-200 rounded-xl focus:border-[#00aeef]"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-wider text-slate-700">
                          Phone Number
                        </Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                          placeholder="+263 77 000 0000"
                          className="h-11 bg-slate-50 border-slate-200 rounded-xl focus:border-[#00aeef]"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="inquiry" className="text-xs font-bold uppercase tracking-wider text-slate-700">
                          Inquiry Department *
                        </Label>
                        <Select 
                          value={formData.inquiry} 
                          onValueChange={(value) => handleInputChange("inquiry", value)}
                        >
                          <SelectTrigger className="h-11 bg-slate-50 border-slate-200 rounded-xl focus:border-[#00aeef]">
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                          <SelectContent className="bg-white border-slate-200">
                            <SelectItem value="course-info">Course Registration & Curriculum</SelectItem>
                            <SelectItem value="zse-direct">ZSE Direct / VFEX Direct Support</SelectItem>
                            <SelectItem value="certificates">Certificate Verification</SelectItem>
                            <SelectItem value="corporate">Corporate & Institutional Training</SelectItem>
                            <SelectItem value="schools">National Investment Challenge (Schools)</SelectItem>
                            <SelectItem value="general">Other General Inquiries</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject" className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        Subject Line *
                      </Label>
                      <Input
                        id="subject"
                        value={formData.subject}
                        onChange={(e) => handleInputChange("subject", e.target.value)}
                        placeholder="Summary of your inquiry"
                        className="h-11 bg-slate-50 border-slate-200 rounded-xl focus:border-[#00aeef]"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message" className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        Your Detailed Message *
                      </Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => handleInputChange("message", e.target.value)}
                        placeholder="Please include any relevant course names, transaction IDs, or questions..."
                        rows={5}
                        className="bg-slate-50 border-slate-200 rounded-xl focus:border-[#00aeef] resize-none"
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-12 bg-[#00aeef] hover:bg-[#008cc0] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-[#00aeef]/20"
                      disabled={isLoading}
                    >
                      {isLoading ? "Submitting Inquiry..." : "Transmit Message to Secretariat"}
                    </Button>
                  </form>
                )}
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
