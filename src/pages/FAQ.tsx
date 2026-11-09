import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faSpinner,
  faSearch,
  faQuestionCircle,
  faEnvelope,
  faBookOpen,
} from "@fortawesome/free-solid-svg-icons";
import faqsBg from "@/assets/faqs.jpg";
import { API_BASE_URL } from "@/constants/api";
import { Link } from "react-router-dom";

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

interface FAQCategory {
  category: string;
  items: FAQItem[];
}

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<string | null>("0-0");
  const [faqCategories, setFaqCategories] = useState<FAQCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/public/faqs`);
        if (response.ok) {
          const data = await response.json();
          setFaqCategories(data);
        }
      } catch (error) {
        console.error("Error fetching FAQs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFaqs();
  }, []);

  const toggleAccordion = (index: string) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // Filter categories and items based on search and selected category tab
  const filteredCategories = faqCategories
    .filter((cat) => selectedCategory === "All" || cat.category === selectedCategory)
    .map((cat) => ({
      ...cat,
      items: cat.items.filter(
        (item) =>
          item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.answer.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((cat) => cat.items.length > 0);

  const totalFaqs = faqCategories.reduce((acc, cat) => acc + cat.items.length, 0);

  return (
    <div className="min-h-screen bg-gray-50 font-montserrat flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-16 md:py-24 text-white bg-gray-900 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${faqsBg})` }}
        />
        <div className="absolute inset-0 bg-black/75 bg-gradient-to-r from-black/90 to-[#00aeef]/30 mix-blend-multiply" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="bg-[#00aeef] hover:bg-[#00aeef] text-white border-0 mb-4 px-4 py-1 uppercase tracking-widest text-xs font-semibold drop-shadow-md">
            Help & Knowledge Center
          </Badge>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold mb-4 tracking-tight drop-shadow-md">
            Frequently Asked Questions
          </h1>
          <p className="text-base md:text-lg text-gray-200 max-w-2xl mx-auto leading-relaxed drop-shadow-md mb-8">
            Find answers to commonly asked questions about ZSE Academy courses, trading on ZSE Direct, VFEX USD equities, examinations, and certificates.
          </p>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto relative">
            <div className="relative">
              <FontAwesomeIcon
                icon={faSearch}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4"
              />
              <Input
                type="text"
                placeholder="Search questions by keyword (e.g. withdraw, VFEX, certificate, deposit)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 pr-4 h-12 rounded-xl bg-white/95 text-gray-900 placeholder:text-gray-500 border-0 shadow-lg text-sm focus-visible:ring-2 focus-visible:ring-[#00aeef]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 md:py-16 flex-grow w-full bg-white border-t border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2 mb-10 pb-4 border-b border-gray-200">
            <Button
              variant={selectedCategory === "All" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("All")}
              className={selectedCategory === "All" ? "bg-[#00aeef] text-white hover:bg-[#00aeef]/90" : "bg-white"}
            >
              All Topics ({totalFaqs})
            </Button>

            {faqCategories.map((cat, idx) => (
              <Button
                key={idx}
                variant={selectedCategory === cat.category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat.category)}
                className={
                  selectedCategory === cat.category
                    ? "bg-[#00aeef] text-white hover:bg-[#00aeef]/90"
                    : "bg-white"
                }
              >
                {cat.category} ({cat.items.length})
              </Button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <FontAwesomeIcon icon={faSpinner} className="animate-spin h-8 w-8 text-[#00aeef]" />
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 border border-gray-200 rounded-xl shadow-sm p-8">
              <FontAwesomeIcon icon={faQuestionCircle} className="h-10 w-10 text-gray-400 mb-3" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">No Matching Answers Found</h3>
              <p className="text-sm text-gray-600 mb-6">
                We couldn't find an answer matching "{searchQuery}". Try using different keywords or contact our support team.
              </p>
              <Button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                }}
                className="bg-[#00aeef] text-white text-xs uppercase tracking-wider"
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="space-y-10">
              {filteredCategories.map((categoryObj, catIndex) => (
                <div key={catIndex} className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b-2 border-gray-100">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00aeef]" />
                    <h2 className="text-xl font-bold text-gray-900">{categoryObj.category}</h2>
                  </div>

                  <div className="space-y-3">
                    {categoryObj.items.map((faq, faqIndex) => {
                      const id = `${catIndex}-${faqIndex}`;
                      const isOpen = openIndex === id;

                      return (
                        <div
                          key={faq.id || id}
                          className={`border rounded-xl transition-all duration-200 overflow-hidden ${
                            isOpen
                              ? "border-[#00aeef] bg-blue-50/20 shadow-sm"
                              : "border-gray-200 bg-white hover:border-gray-300"
                          }`}
                        >
                          <button
                            className="w-full text-left px-5 py-4 flex items-center justify-between focus:outline-none"
                            onClick={() => toggleAccordion(id)}
                          >
                            <span className="font-semibold text-gray-900 pr-6 text-sm sm:text-base leading-snug">
                              {faq.question}
                            </span>
                            <span
                              className={`flex-shrink-0 transition-transform duration-300 ${
                                isOpen ? "rotate-180 text-[#00aeef]" : "text-gray-400"
                              }`}
                            >
                              <FontAwesomeIcon icon={faChevronDown} className="h-3.5 w-3.5" />
                            </span>
                          </button>

                          <div
                            className={`px-5 overflow-hidden transition-all duration-300 ease-in-out ${
                              isOpen ? "max-h-[500px] pb-5 opacity-100" : "max-h-0 opacity-0"
                            }`}
                          >
                            <p className="text-gray-600 text-xs sm:text-sm leading-relaxed border-t border-gray-100 pt-3">
                              {faq.answer}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Still Have Questions Banner */}
          <div className="mt-16 p-8 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-2xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold mb-2">Still have questions?</h3>
              <p className="text-gray-300 text-xs sm:text-sm max-w-xl leading-relaxed">
                Can't find the answer you're looking for? Reach out to our training faculty or explore our interactive trading simulations.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/contact">
                <Button className="bg-[#00aeef] hover:bg-[#008cc0] text-white text-xs font-semibold tracking-wider uppercase h-10 px-5 shadow">
                  <FontAwesomeIcon icon={faEnvelope} className="mr-2" /> Contact Support
                </Button>
              </Link>
              <Link to="/tutorials">
                <Button variant="outline" className="border-white/20 text-white bg-white/10 hover:bg-white/20 text-xs font-semibold tracking-wider uppercase h-10 px-5">
                  <FontAwesomeIcon icon={faBookOpen} className="mr-2" /> View Tutorials
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default FAQ;
