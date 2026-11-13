import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { API_BASE_URL } from "@/constants/api";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShieldHalved,
  faLock,
  faUserShield,
  faDatabase,
  faBuildingColumns,
} from "@fortawesome/free-solid-svg-icons";

interface PrivacyPolicy {
  id: number;
  title: string;
  content: string;
  date: string;
}

const PRIVACY_PILLARS = [
  {
    title: "1. Data We Collect",
    summary: "Basic contact information (name, email, phone) to maintain your learning record, course completion badges, and certificate verification records.",
  },
  {
    title: "2. How We Protect You",
    summary: "Industry-standard cryptographic encryption, secure hashing, and role-based access control protecting all student profiles.",
  },
  {
    title: "3. Zero Commercial Selling",
    summary: "We never monetize, rent, or sell your personal information or contact details to third-party telemarketers.",
  },
  {
    title: "4. Your Data Rights",
    summary: "You may request full export or deletion of your student account and associated learning telemetry at any time.",
  },
];

const Privacy = () => {
  const [policy, setPolicy] = useState<PrivacyPolicy | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPolicy = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/privacy-policy`, {
          headers: {
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch privacy policy.");
        }

        const data: PrivacyPolicy[] = await response.json();
        if (data && data.length > 0) {
          setPolicy(data[0]);
        }
      } catch (err: unknown) {
        console.error("Privacy fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPolicy();
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
            <FontAwesomeIcon icon={faLock} />
            <span>Privacy & Data Protection</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
            Privacy Policy
          </h1>
          <p className="mt-3 text-slate-300 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            How the Zimbabwe Stock Exchange protects, encrypts, and handles your personal information.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Summary Sidebar */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <FontAwesomeIcon icon={faUserShield} className="text-[#00aeef]" />
                <span>Our Privacy Commitments</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Clear principles governing how student records are protected:
              </p>

              <div className="space-y-3 pt-2">
                {PRIVACY_PILLARS.map((item, idx) => (
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
                  Contact Data Protection Officer &rarr;
                </Link>
              </div>
            </div>
          </div>

          {/* Right: Policy Document */}
          <div className="lg:col-span-8 bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Data Protection Protocol
              </span>
              <span className="text-xs font-semibold text-slate-500">
                Effective: {policy?.date ? new Date(policy.date).toLocaleDateString() : "Current Regulatory Version"}
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
            ) : policy?.content ? (
              <div
                dangerouslySetInnerHTML={{ __html: policy.content }}
                className="prose prose-slate max-w-none text-slate-700 text-sm leading-relaxed [&>p]:mb-4 [&>h1]:text-2xl [&>h1]:font-black [&>h1]:mb-4 [&>h1]:text-slate-900 [&>h2]:text-xl [&>h2]:font-bold [&>h2]:mb-3 [&>h2]:mt-6 [&>h2]:text-slate-900 [&>ul]:list-disc [&>ul]:ml-6 [&>ul]:mb-4 [&>ol]:list-decimal [&>ol]:ml-6 [&>ol]:mb-4"
              />
            ) : (
              <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">1. Scope of Policy</h3>
                  <p>
                    This Privacy Policy applies to personal information collected by Zimbabwe Stock Exchange Limited through the ZSE Training Institute portal. We adhere strictly to national data protection regulations and international best practices.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">2. Processing of Personal Information</h3>
                  <p>
                    Information collected during registration is used exclusively for course enrollment, progress tracking, issuance of verifiable certificates, and communicating educational webinar schedules.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">3. Storage & Cryptography</h3>
                  <p>
                    Passwords and authentication secrets are salted and hashed using bcrypt. Sensitive data transmissions are encrypted using Transport Layer Security (TLS 1.3).
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">4. Contact & Inquiries</h3>
                  <p>
                    For inquiries regarding data retention or to request account deletion, contact the Zimbabwe Stock Exchange Data Secretariat at info@zse.co.zw.
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

export default Privacy;
