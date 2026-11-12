import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { API_BASE_URL } from "@/constants/api";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShieldHalved,
  faFileContract,
  faScaleBalanced,
  faCheckCircle,
  faCircleExclamation,
  faBuildingColumns,
} from "@fortawesome/free-solid-svg-icons";

interface Term {
  id: number;
  title: string;
  content: string;
  date: string;
}

const DEFAULT_TERMS_SUMMARY = [
  {
    title: "1. Educational Scope",
    summary: "Course content, webinars, and tutorials provided on ZSE Academy are strictly for educational and informational purposes. They do not constitute formal investment advice or solicitations.",
  },
  {
    title: "2. Account & Security",
    summary: "Users are responsible for safeguarding their login credentials. Any trades executed on third-party broker platforms or ZSE Direct are subject to registered broker terms.",
  },
  {
    title: "3. Intellectual Property",
    summary: "All curriculum modules, assessment questions, slide decks, video recordings, and trademarks belong exclusively to Zimbabwe Stock Exchange Limited.",
  },
  {
    title: "4. Certification Authenticity",
    summary: "ZSE Academy digital certificates are issued only upon legitimate completion of course assessments. Unauthorized fabrication or forgery is legally actionable under Zimbabwean law.",
  },
];

const Terms = () => {
  const [terms, setTerms] = useState<Term | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTerms = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/terms`, {
          headers: {
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch terms and conditions.");
        }

        const data: Term[] = await response.json();
        if (data && data.length > 0) {
          setTerms(data[0]);
        }
      } catch (err: unknown) {
        console.error("Terms fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTerms();
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-montserrat flex flex-col text-slate-900">
      <Navbar />

      {/* Header Banner */}
      <section className="bg-[#0b1324] py-16 px-4 text-white relative overflow-hidden text-center">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#00aeef]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00aeef]/10 text-[#00aeef] text-xs font-bold uppercase tracking-wider mb-4 border border-[#00aeef]/30">
            <FontAwesomeIcon icon={faScaleBalanced} />
            <span>Governance & Legal Framework</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
            Terms & Conditions of Service
          </h1>
          <p className="mt-3 text-slate-300 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            Please read these terms carefully before accessing courses, tutorials, or certification examinations on ZSE Academy.
          </p>
        </div>
      </section>

      {/* Main Body */}
      <div className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Executive Summary & Highlights */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <FontAwesomeIcon icon={faShieldHalved} className="text-[#00aeef]" />
                <span>Executive Summary</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Key governance points governing your use of this educational exchange portal:
              </p>

              <div className="space-y-3 pt-2">
                {DEFAULT_TERMS_SUMMARY.map((item, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                    <p className="text-[11px] text-slate-600 mt-1 leading-snug">{item.summary}</p>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-100 text-center">
                <Link
                  to="/contact"
                  className="text-xs font-bold text-[#00aeef] hover:underline"
                >
                  Questions about legal terms? Contact us &rarr;
                </Link>
              </div>
            </div>
          </div>

          {/* Right: Full Legal Text */}
          <div className="lg:col-span-8 bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Official Regulatory Document
              </span>
              <span className="text-xs font-semibold text-slate-500">
                Effective: {terms?.date ? new Date(terms.date).toLocaleDateString() : "Current Regulatory Version"}
              </span>
            </div>

            {loading ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-6 bg-slate-200 rounded w-1/3 mb-6" />
                <div className="h-4 bg-slate-200 rounded w-full" />
                <div className="h-4 bg-slate-200 rounded w-5/6" />
                <div className="h-4 bg-slate-200 rounded w-4/6" />
                <div className="h-4 bg-slate-200 rounded w-full" />
              </div>
            ) : terms?.content ? (
              <div
                dangerouslySetInnerHTML={{ __html: terms.content }}
                className="prose prose-slate max-w-none text-slate-700 text-sm leading-relaxed [&>p]:mb-4 [&>h1]:text-2xl [&>h1]:font-black [&>h1]:mb-4 [&>h1]:text-slate-900 [&>h2]:text-xl [&>h2]:font-bold [&>h2]:mb-3 [&>h2]:mt-6 [&>h2]:text-slate-900 [&>ul]:list-disc [&>ul]:ml-6 [&>ul]:mb-4 [&>ol]:list-decimal [&>ol]:ml-6 [&>ol]:mb-4"
              />
            ) : (
              <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">1. Acceptance of Terms</h3>
                  <p>
                    By creating an account or accessing learning materials on the Zimbabwe Stock Exchange Academy portal, you agree to be bound by these terms, as well as the rules and directives established by the Securities and Exchange Commission of Zimbabwe (SECZim).
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">2. Non-Advisory Nature of Educational Content</h3>
                  <p>
                    The courses, simulations, valuation demonstrations, and webinar replays provided on this platform are designed solely to enhance financial literacy and market understanding. None of the materials should be construed as an individualized recommendation to buy, hold, or sell any security listed on the ZSE or VFEX.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">3. User Conduct & Exam Integrity</h3>
                  <p>
                    Learners must complete end-of-module quizzes and final certificate examinations independently. Plagiarism, automated script completion, or unauthorized distribution of proprietary course slides is strictly prohibited.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">4. Amendments</h3>
                  <p>
                    The Zimbabwe Stock Exchange reserves the right to amend these Terms and Conditions periodically to reflect regulatory updates and platform enhancements.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Terms;
