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

const RETAIL_MARKET_FAQS: FAQCategory[] = [
  {
    category: "Getting Started & Onboarding",
    items: [
      {
        id: 1,
        question: "How do I get a ZSE Direct or VFEX Direct account activated?",
        answer:
          "To get your ZSE Direct or VFEX Direct trading account activated, submit the required KYC documentation and a completed broker mandate form. Once verified by your stockbroker and linked to the Central Securities Depository (CSD) or Electronic Depository Securities (EDS), your trading account will be fully activated for order placement.",
      },
      {
        id: 2,
        question: "What are the documents required for KYC?",
        answer:
          "KYC verification requires a certified copy of your National ID or valid Passport, proof of residence (such as a utility bill or bank statement issued within the last 3 months), a passport-sized photograph, and verified bank account details.",
      },
      {
        id: 3,
        question: "What is the age needed to trade?",
        answer:
          "Investors must be at least 18 years old to open an independent trading account. Minors may hold investments through custodial or joint accounts managed by a legal guardian in accordance with regulatory requirements.",
      },
      {
        id: 4,
        question: "What is a stockbroker?",
        answer:
          "A stockbroker is a licensed financial intermediary authorized to execute buy and sell orders on securities exchanges on behalf of clients. They facilitate trade clearing, settlement, market compliance, and research support.",
      },
      {
        id: 5,
        question:
          "What is the difference between trading for myself versus the broker trading on my behalf?",
        answer:
          "When trading independently, you maintain direct control by submitting orders yourself via the digital platform. When a broker trades on your behalf under a discretionary mandate, the broker selects and executes trades based on an agreed investment strategy, though non-discretionary execution still requires your explicit instruction for each trade.",
      },
    ],
  },
  {
    category: "Order Placement & Execution",
    items: [
      {
        id: 6,
        question: "How do I place a buy or sell order on ZSE Direct or VFEX Direct?",
        answer:
          "To place an order, log in to the web portal or mobile application, search for your desired counter under the Market Snapshot or Watchlist, select Buy or Sell, specify the quantity and order price (limit or market price), and submit the order. The transaction is then automatically routed through your designated stockbroker to the Automated Trading System (ATS).",
      },
      {
        id: 7,
        question:
          "Can I place buy and sell orders independently, or do I need to contact my stockbroker for every trade?",
        answer:
          "Once your account is fully activated and linked to a broker, you can place buy and sell orders independently directly through the digital platform without needing to contact your stockbroker for individual transactions.",
      },
      {
        id: 8,
        question: "Is daily active trading mandatory?",
        answer:
          "No, daily active trading is optional. Equities can be purchased and held long-term for capital appreciation and dividend yield.",
      },
    ],
  },
  {
    category: "Stockbroker Roles & Discretionary Control",
    items: [
      {
        id: 9,
        question:
          "What is the exact role of my selected stockbroker when I trade on VFEX or ZSE Direct?",
        answer:
          "Your stockbroker acts as a clearing agent to execute, clear, and settle transactions placed through the platform, ensuring compliance with market regulations and investor protection standards.",
      },
      {
        id: 10,
        question:
          "Does selecting a stockbroker give them discretionary authority over my investment decisions?",
        answer:
          "No, the stockbroker does not have discretionary authority over your portfolio. You retain full control over your order placement and trading decisions, though brokers are available to provide market research or advisory support if requested.",
      },
    ],
  },
  {
    category: "Trading Troubleshooting & Order Status Issues",
    items: [
      {
        id: 11,
        question:
          'What should I do if my broker confirmed a trade, but the platform lists the order as "expired" or refunds my wallet?',
        answer:
          "If a trade matches and receives a valid trading ticket number but reflects as expired on the digital portal, it indicates a technical synchronization discrepancy. Contact support with your trading ticket number, counter name, and trading account number to request a manual trade reconciliation and portfolio update.",
      },
      {
        id: 12,
        question:
          "What causes a negative wallet balance on a trading account, and how can it be cleared?",
        answer:
          "A negative balance can occur if a system error temporarily refunds capital for a matched order while the shares remain allocated to your portfolio. You can resolve the balance by depositing funds equal to the deficit or selling the affected shares to offset the negative amount.",
      },
      {
        id: 13,
        question:
          'What does the error "Your trading account is active but not fully set up with the exchange" mean?',
        answer:
          "This notification indicates that your registration is approved, but the final activation link to the Automated Trading System (ATS) is still pending. Support must complete the exchange linking before you can place live orders.",
      },
      {
        id: 14,
        question:
          'What does the error "Trading account is missing client third-party identifier" mean, and how is it resolved?',
        answer:
          "This error occurs when the broker profile code linkage is omitted or broker migration is incomplete. It is resolved by escalating to depository operations to assign the client party ID in ATS and synchronize the custodian/broker trader code.",
      },
      {
        id: 15,
        question:
          'What causes the error "Your trading account is inactive. Please contact your broker"?',
        answer:
          "This status appears when a broker mandate form is pending or an annual KYC refresh is required. You can resolve this by submitting an updated broker mandate form and verified KYC documents to your broker.",
      },
    ],
  },
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<string | null>("0-0");
  const [faqCategories, setFaqCategories] = useState<FAQCategory[]>(RETAIL_MARKET_FAQS);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/public/faqs`);
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            setFaqCategories(data);
          }
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
            Retail Trading Knowledge Base
          </Badge>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold mb-4 tracking-tight drop-shadow-md">
            ZSE & VFEX Trading FAQs
          </h1>
          <p className="text-base md:text-lg text-gray-200 max-w-2xl mx-auto leading-relaxed drop-shadow-md mb-8">
            Authoritative guidance for retail investors on trading account activation, KYC verification, placing buy & sell orders on ZSE Direct & VFEX Direct, broker mandates, and troubleshooting.
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
                placeholder="Search trading questions (e.g. KYC, stockbroker, expired, ATS, mandate)..."
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
