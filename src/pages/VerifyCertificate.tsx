import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAward,
  faCheckCircle,
  faTimesCircle,
  faSearch,
  faCalendar,
  faUser,
  faGraduationCap,
  faShieldHalved,
  faPrint,
  faBuildingColumns,
  faQrcode,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { API_BASE_URL } from "@/constants/api";
import { CertificateModal } from "@/components/certificate/CertificateModal";

interface VerificationData {
  certificate_number: string;
  student_name: string;
  course_title: string;
  issued_at: string;
  signatory?: {
    name: string;
    title: string;
    organization: string;
    signature?: string;
  };
}

const SAMPLE_CODES = ["ZSE-12163-11485", "ZSE-94238-11485", "ZSE-21781-37088"];

const VerifyCertificate = () => {
  const { certificateNumber } = useParams<{ certificateNumber?: string }>();
  const [searchCode, setSearchCode] = useState(certificateNumber || "");
  const [loading, setLoading] = useState(false);
  const [verifiedData, setVerifiedData] = useState<VerificationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showCertModal, setShowCertModal] = useState(false);

  useEffect(() => {
    if (certificateNumber) {
      verifyCode(certificateNumber);
    }
  }, [certificateNumber]);

  const verifyCode = async (code: string) => {
    const cleanCode = code.trim();
    if (!cleanCode) return;

    try {
      setLoading(true);
      setError(null);
      setVerifiedData(null);

      const res = await axios.get(`${API_BASE_URL}/certificates/verify/${encodeURIComponent(cleanCode)}`);
      if (res.data?.status === "success" && res.data?.data) {
        setVerifiedData(res.data.data);
      } else {
        setError("Certificate identifier not found in the official registry. Please check the spelling or contact support.");
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || "Certificate record could not be located. Please verify the code on your physical or digital certificate.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    verifyCode(searchCode);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 font-montserrat text-slate-900">
      <Navbar />

      {/* Header Banner */}
      <section className="py-16 bg-[#0b1324] text-white relative overflow-hidden text-center">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#00aeef]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00aeef]/10 text-[#00aeef] text-xs font-bold uppercase tracking-wider mb-4 border border-[#00aeef]/30">
            <FontAwesomeIcon icon={faShieldHalved} />
            <span>Official Registry Validation</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            Verify Academy Credentials
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
            Validate the authentic issuance of certificates and qualifications awarded by the Zimbabwe Stock Exchange.
          </p>
        </div>
      </section>

      <main className="flex-1 py-12 px-4 max-w-3xl mx-auto w-full -mt-8 relative z-20">
        {/* Search Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 mb-8">
          <form onSubmit={handleSearchSubmit} className="space-y-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Enter Certificate Identifier Number
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                type="text"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                placeholder="e.g. ZSE-12163-11485"
                className="flex-1 h-12 text-sm font-mono tracking-wider bg-slate-50 border-slate-200 rounded-xl focus:border-[#00aeef]"
              />
              <Button
                type="submit"
                disabled={loading || !searchCode.trim()}
                className="h-12 bg-[#00aeef] hover:bg-[#008cc0] text-white font-bold text-xs uppercase tracking-wider px-8 rounded-xl transition-all shadow-md shadow-[#00aeef]/20"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    Checking Registry...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faSearch} />
                    Verify Now
                  </span>
                )}
              </Button>
            </div>

            {/* Quick Sample Code Chips */}
            <div className="flex flex-wrap items-center gap-2 pt-2 text-xs text-slate-500">
              <span className="font-medium">Try sample certificate:</span>
              {SAMPLE_CODES.map((code) => (
                <button
                  type="button"
                  key={code}
                  onClick={() => {
                    setSearchCode(code);
                    verifyCode(code);
                  }}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-[#00aeef]/10 hover:text-[#00aeef] text-slate-700 font-mono text-[11px] rounded-lg transition-colors border border-slate-200"
                >
                  {code}
                </button>
              ))}
            </div>
          </form>
        </div>

        {/* Verification Success Box */}
        {verifiedData && (
          <div className="bg-white rounded-3xl overflow-hidden shadow-2xl border-2 border-emerald-500 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white px-6 sm:px-8 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl shrink-0">
                  <FontAwesomeIcon icon={faCheckCircle} />
                </div>
                <div>
                  <h3 className="font-black text-lg">Authentic & Verified Credential</h3>
                  <p className="text-xs text-emerald-100">
                    Validated directly against the Zimbabwe Stock Exchange central ledger.
                  </p>
                </div>
              </div>
              <div className="hidden sm:block">
                <FontAwesomeIcon icon={faBuildingColumns} className="text-3xl text-emerald-300 opacity-60" />
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6 border-b border-slate-100">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Certified Candidate
                  </span>
                  <p className="text-xl font-black text-slate-900">{verifiedData.student_name}</p>
                </div>

                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Certificate Number
                  </span>
                  <p className="text-base font-mono font-bold text-[#00aeef]">{verifiedData.certificate_number}</p>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Course / Examination Program
                </span>
                <p className="text-lg font-bold text-slate-900">{verifiedData.course_title}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Date of Issue
                  </span>
                  <p className="text-sm font-semibold text-slate-700">
                    {verifiedData.issued_at
                      ? new Date(verifiedData.issued_at).toLocaleDateString("en-ZW", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "Official Record Validated"}
                  </p>
                </div>

                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Issuing Authority
                  </span>
                  <p className="text-sm font-semibold text-slate-700">
                    Zimbabwe Stock Exchange Limited (ZSE)
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <FontAwesomeIcon icon={faShieldHalved} className="text-emerald-500" />
                  <span>Tamper-proof electronic verification seal</span>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    onClick={() => setShowCertModal(true)}
                    className="bg-[#00aeef] hover:bg-[#0098d4] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm"
                  >
                    <FontAwesomeIcon icon={faAward} />
                    <span>View Official Certificate</span>
                  </Button>
                  <Button
                    onClick={() => window.print()}
                    variant="outline"
                    className="rounded-xl text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2"
                  >
                    <FontAwesomeIcon icon={faPrint} />
                    <span>Print Formal Record</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Official Certificate Modal */}
        {verifiedData && (
          <CertificateModal
            isOpen={showCertModal}
            onClose={() => setShowCertModal(false)}
            certificate={{
              id: 1,
              certificate_number: verifiedData.certificate_number,
              issued_at: verifiedData.issued_at,
              course: { id: 1, title: verifiedData.course_title },
              user: { name: verifiedData.student_name },
              signatory: verifiedData.signatory,
            }}
            currentUserName={verifiedData.student_name}
          />
        )}

        {/* Error State */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-3xl p-6 sm:p-8 text-rose-900 shadow-sm flex items-start gap-4 animate-in fade-in duration-200">
            <FontAwesomeIcon icon={faTimesCircle} className="h-6 w-6 text-rose-600 mt-1 shrink-0" />
            <div>
              <h3 className="font-bold text-base text-rose-950">Record Not Found</h3>
              <p className="text-xs text-rose-800 mt-1 leading-relaxed">{error}</p>
              <div className="mt-4 flex gap-3">
                <Link
                  to="/contact"
                  className="text-xs font-bold uppercase tracking-wider text-rose-700 hover:underline"
                >
                  Contact Registry Helpdesk &rarr;
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default VerifyCertificate;
