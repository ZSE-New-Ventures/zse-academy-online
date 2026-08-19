import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faSpinner } from "@fortawesome/free-solid-svg-icons";
import faqsBg from "@/assets/faqs.jpg";

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

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/public/faqs");
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
            backgroundImage: `url(${faqsBg})`,
          }}
        />
        {/* Dark overlay with brand color tint */}
        <div className="absolute inset-0 bg-black/60 bg-gradient-to-r from-black/80 to-[#00aeef]/30 mix-blend-multiply" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="bg-[#00aeef] hover:bg-[#00aeef] text-white border-0 mb-6 px-4 py-1 uppercase tracking-widest text-xs drop-shadow-md">
            Help Center
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight drop-shadow-md">
            Frequently Asked Questions
          </h1>
          <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto leading-relaxed drop-shadow-md">
            Everything you need to know about ZSE Academy, our courses, billing, and learning experience. Can't find the answer you're looking for? Contact our support team.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 md:py-24 flex-grow w-full bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <FontAwesomeIcon icon={faSpinner} className="animate-spin h-8 w-8 text-[#00aeef]" />
            </div>
          ) : (
            <div className="space-y-12">
              {faqCategories.map((categoryObj, catIndex) => (
                <div key={catIndex}>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b-2 border-gray-100">
                    {categoryObj.category}
                  </h2>
                  
                  <div className="space-y-4">
                    {categoryObj.items.map((faq, faqIndex) => {
                      const id = `${catIndex}-${faqIndex}`;
                      const isOpen = openIndex === id;
                      
                      return (
                        <div 
                          key={faq.id || id} 
                          className={`border rounded-lg transition-all duration-200 overflow-hidden ${
                            isOpen ? "border-[#00aeef] bg-blue-50/30 shadow-md" : "border-gray-200 bg-white hover:border-gray-300"
                          }`}
                        >
                          <button
                            className="w-full text-left px-6 py-5 flex items-center justify-between focus:outline-none"
                            onClick={() => toggleAccordion(id)}
                          >
                            <span className="font-bold text-gray-900 pr-8">{faq.question}</span>
                            <span className={`flex-shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180 text-[#00aeef]" : "text-gray-400"}`}>
                              <FontAwesomeIcon icon={faChevronDown} className="h-4 w-4" />
                            </span>
                          </button>
                          
                          <div 
                            className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${
                              isOpen ? "max-h-96 pb-6 opacity-100" : "max-h-0 opacity-0"
                            }`}
                          >
                            <p className="text-gray-600 leading-relaxed">
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

        </div>
      </section>

      <Footer />
    </div>
  );
};

export default FAQ;
