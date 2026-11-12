import React, { useRef, useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPrint,
  faTimes,
  faShareNodes,
  faCheckCircle,
  faAward,
  faDownload,
  faSpinner,
  faQrcode,
  faShieldHalved,
  faPalette,
  faCheck,
  faLock,
} from "@fortawesome/free-solid-svg-icons";
import { faLinkedin } from "@fortawesome/free-brands-svg-icons";
import { Button } from "@/components/ui/button";
import html2canvas from "html2canvas";
import certSignature from "@/assets/certificate-signature.png";
import zseLogo from "@/assets/logo.png";
import { API_BASE_URL } from "@/constants/api";

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  certificate: {
    id: number;
    certificate_number: string;
    issued_at: string;
    course?: {
      id: number;
      title: string;
      category?: string;
      duration?: string;
      instructor?: {
        name: string;
      };
    };
    user?: {
      name: string;
    };
    course_id?: number;
    metadata?: {
      signatory?: {
        name?: string;
        title?: string;
        organization?: string;
        signature?: string;
      };
      [key: string]: unknown;
    };
    signatory?: {
      name?: string;
      title?: string;
      organization?: string;
      signature?: string;
      second_name?: string;
      second_title?: string;
    };
  } | null;
  currentUserName?: string;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  isOpen,
  onClose,
  certificate,
  currentUserName,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [theme, setTheme] = useState<"executive" | "modern">("executive");
  const certFrameRef = useRef<HTMLDivElement>(null);

  const [activeSignatory, setActiveSignatory] = useState<{
    name: string;
    title: string;
    organization: string;
    signature?: string;
  }>({
    name: "Clever Mukondiwa",
    title: "Course Facilitator",
    organization: "Zimbabwe Stock Exchange",
    signature: undefined,
  });

  useEffect(() => {
    if (!certificate) return;

    const certSignatory = certificate.signatory || certificate.metadata?.signatory;
    if (certSignatory?.name) {
      setActiveSignatory({
        name: certSignatory.name,
        title: certSignatory.title || "Course Facilitator",
        organization: certSignatory.organization || "Zimbabwe Stock Exchange",
        signature: certSignatory.signature || undefined,
      });
      return;
    }

    // Recall course-specific facilitator signer if course id is available
    const courseId = certificate.course?.id || certificate.course_id;
    if (courseId) {
      fetch(`${API_BASE_URL}/courses/${courseId}/signer`)
        .then((res) => res.json())
        .then((json) => {
          if (json?.data?.name) {
            setActiveSignatory({
              name: json.data.name,
              title: json.data.title || "Course Facilitator",
              organization: json.data.organization || "Zimbabwe Stock Exchange",
              signature: json.data.signature || undefined,
            });
            return;
          }
          fallbackSettings();
        })
        .catch(() => fallbackSettings());
    } else {
      fallbackSettings();
    }

    function fallbackSettings() {
      fetch(`${API_BASE_URL}/certificate/settings`)
        .then((res) => res.json())
        .then((json) => {
          if (json?.data?.signatory_name) {
            setActiveSignatory({
              name: json.data.signatory_name,
              title: json.data.signatory_title || "Course Facilitator",
              organization: json.data.signatory_organization || "Zimbabwe Stock Exchange",
              signature: json.data.signature_data || undefined,
            });
          }
        })
        .catch((err) => {
          console.warn("Using default assigned facilitator", err);
        });
    }
  }, [certificate]);

  if (!isOpen || !certificate) return null;

  const studentName = certificate.user?.name || currentUserName || "Valued Learner";
  const courseTitle = certificate.course?.title || "ZSE Capital Markets Program";
  const rawDate = certificate.issued_at ? new Date(certificate.issued_at) : new Date();
  const formattedDate = certificate.issued_at
    ? rawDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Verified Credential";

  // Resolve verification URL (automatically points to live domain in production)
  const appOrigin = import.meta.env.VITE_APP_URL || (typeof window !== "undefined" ? window.location.origin : "https://zsetraining.co.zw");
  const verifyUrl = `${appOrigin}/verify/${certificate.certificate_number}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
    verifyUrl
  )}&color=0b1324&bgcolor=ffffff&qzone=1`;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(verifyUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2500);
    }
  };

  const handleAddToLinkedIn = () => {
    const issueYear = rawDate.getFullYear();
    const issueMonth = rawDate.getMonth() + 1;
    const linkedInUrl =
      `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME` +
      `&name=${encodeURIComponent(courseTitle)}` +
      `&organizationName=${encodeURIComponent("Zimbabwe Stock Exchange")}` +
      `&issueYear=${issueYear}` +
      `&issueMonth=${issueMonth}` +
      `&certUrl=${encodeURIComponent(verifyUrl)}` +
      `&certId=${encodeURIComponent(certificate.certificate_number)}`;

    window.open(linkedInUrl, "_blank", "noopener,noreferrer");
  };

  const handleDownloadImage = async () => {
    const certElement = certFrameRef.current || document.getElementById("printable-certificate-root");
    if (!certElement) return;

    try {
      setIsDownloading(true);
      const canvas = await html2canvas(certElement as HTMLElement, {
        scale: 3, // High-res 300 DPI fidelity
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
      });

      const image = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.href = image;
      downloadLink.download = `ZSE_Certificate_${certificate.certificate_number}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } catch (err) {
      console.error("Error generating certificate download:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      {/* Global Print-only Stylesheet */}
      <style>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 0;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body * {
            visibility: hidden !important;
          }
          #printable-certificate-root,
          #printable-certificate-root * {
            visibility: visible !important;
          }
          #printable-certificate-root {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            margin: 0 !important;
            padding: 0 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            background: #ffffff !important;
            z-index: 9999999 !important;
          }
          .cert-container-print {
            width: 297mm !important;
            height: 210mm !important;
            max-width: 297mm !important;
            max-height: 210mm !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Modal Backdrop */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4 overflow-y-auto no-print font-montserrat">
        <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[96vh] border border-slate-200">
          {/* Modal Toolbar Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 gap-4">
            <div className="flex items-center justify-between w-full sm:w-auto">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200/60 flex items-center justify-center shadow-xs">
                  <FontAwesomeIcon icon={faAward} className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-tight">
                    Official ZSE Credential
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    ID: <span className="font-bold text-slate-800">{certificate.certificate_number}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="sm:hidden w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
                aria-label="Close"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            {/* Actions: Theme Toggle + Print + Download + Share */}
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              {/* Theme Switcher */}
              <div className="inline-flex p-1 bg-slate-200/80 rounded-xl mr-1">
                <button
                  onClick={() => setTheme("executive")}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                    theme === "executive"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Executive Gold
                </button>
                <button
                  onClick={() => setTheme("modern")}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                    theme === "modern"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Modern Cyan
                </button>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyLink}
                className="text-xs flex items-center gap-1.5 h-9 px-3 rounded-xl border-slate-200 text-slate-700"
              >
                <FontAwesomeIcon icon={copySuccess ? faCheck : faShareNodes} className="h-3.5 w-3.5 text-slate-500" />
                <span>{copySuccess ? "Copied" : "Share"}</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleAddToLinkedIn}
                className="text-xs flex items-center gap-1.5 h-9 px-3 rounded-xl text-[#0A66C2] hover:bg-blue-50 border-blue-200"
              >
                <FontAwesomeIcon icon={faLinkedin} className="text-[#0A66C2] h-3.5 w-3.5" />
                <span>LinkedIn</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadImage}
                disabled={isDownloading}
                className="text-xs flex items-center gap-1.5 h-9 px-3 rounded-xl border-slate-200 text-slate-700"
              >
                <FontAwesomeIcon
                  icon={isDownloading ? faSpinner : faDownload}
                  spin={isDownloading}
                  className="h-3.5 w-3.5 text-[#00aeef]"
                />
                <span>{isDownloading ? "Generating..." : "Download PNG"}</span>
              </Button>

              <Button
                size="sm"
                onClick={handlePrint}
                className="bg-[#0b1324] hover:bg-[#121f3a] text-white text-xs font-bold flex items-center gap-1.5 h-9 px-4 rounded-xl shadow-sm"
              >
                <FontAwesomeIcon icon={faPrint} className="h-3.5 w-3.5 text-[#00aeef]" />
                <span>Print PDF</span>
              </Button>

              <button
                onClick={onClose}
                className="hidden sm:flex w-8 h-8 rounded-full items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors ml-1"
                aria-label="Close"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
          </div>

          {/* Certificate Scroll Canvas */}
          <div className="p-4 sm:p-8 bg-slate-200/70 overflow-x-auto flex justify-start sm:justify-center items-center touch-pan-x">
            {/* THE REDESIGNED MODERN VECTOR CERTIFICATE */}
            <div
              id="printable-certificate-root"
              ref={certFrameRef}
              className={`relative w-[880px] h-[620px] shrink-0 bg-white shadow-2xl overflow-hidden select-none font-sans cert-container-print p-9 flex flex-col justify-between ${
                theme === "executive" ? "text-slate-900" : "text-slate-900"
              }`}
              style={{
                boxSizing: "border-box",
              }}
            >
              {/* Outer Luxury Frame */}
              <div
                className={`absolute inset-4 pointer-events-none rounded-xl border-4 ${
                  theme === "executive" ? "border-[#0b1324]" : "border-[#0b1324]"
                }`}
              />

              {/* Inner Metallic Hairline Frame */}
              <div
                className={`absolute inset-6 pointer-events-none rounded-lg border-2 ${
                  theme === "executive" ? "border-[#c5a059]" : "border-[#00aeef]"
                }`}
              />

              {/* Corner Ornaments (SVG) */}
              {/* Top-Left */}
              <svg
                className={`absolute top-7 left-7 w-12 h-12 pointer-events-none ${
                  theme === "executive" ? "text-[#c5a059]" : "text-[#00aeef]"
                }`}
                viewBox="0 0 50 50"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M 0 16 L 0 0 L 16 0" />
                <path d="M 5 5 L 22 5 M 5 5 L 5 22" strokeWidth="1" />
                <circle cx="8" cy="8" r="2.5" fill="currentColor" />
              </svg>

              {/* Top-Right */}
              <svg
                className={`absolute top-7 right-7 w-12 h-12 pointer-events-none ${
                  theme === "executive" ? "text-[#c5a059]" : "text-[#00aeef]"
                }`}
                viewBox="0 0 50 50"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M 50 16 L 50 0 L 34 0" />
                <path d="M 45 5 L 28 5 M 45 5 L 45 22" strokeWidth="1" />
                <circle cx="42" cy="8" r="2.5" fill="currentColor" />
              </svg>

              {/* Bottom-Left */}
              <svg
                className={`absolute bottom-7 left-7 w-12 h-12 pointer-events-none ${
                  theme === "executive" ? "text-[#c5a059]" : "text-[#00aeef]"
                }`}
                viewBox="0 0 50 50"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M 0 34 L 0 50 L 16 50" />
                <path d="M 5 45 L 22 45 M 5 45 L 5 28" strokeWidth="1" />
                <circle cx="8" cy="42" r="2.5" fill="currentColor" />
              </svg>

              {/* Bottom-Right */}
              <svg
                className={`absolute bottom-7 right-7 w-12 h-12 pointer-events-none ${
                  theme === "executive" ? "text-[#c5a059]" : "text-[#00aeef]"
                }`}
                viewBox="0 0 50 50"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M 50 34 L 50 50 L 34 50" />
                <path d="M 45 45 L 28 45 M 45 45 L 45 28" strokeWidth="1" />
                <circle cx="42" cy="42" r="2.5" fill="currentColor" />
              </svg>

              {/* Subtle Central Security Guilloché Watermark */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.035]">
                <svg className="w-[450px] h-[450px]" viewBox="0 0 200 200" fill="none" stroke="currentColor">
                  {[...Array(12)].map((_, i) => (
                    <circle
                      key={i}
                      cx="100"
                      cy="100"
                      r={18 + i * 7}
                      strokeWidth="1.2"
                      strokeDasharray={i % 2 === 0 ? "3 3" : "none"}
                    />
                  ))}
                  {[...Array(8)].map((_, i) => (
                    <ellipse
                      key={`e-${i}`}
                      cx="100"
                      cy="100"
                      rx="85"
                      ry="35"
                      strokeWidth="1"
                      transform={`rotate(${i * 22.5} 100 100)`}
                    />
                  ))}
                </svg>
              </div>

              {/* 1. Header Section */}
              <div className="relative z-10 flex items-center justify-between px-6 pt-3">
                <div className="flex items-center gap-3">
                  <img src={zseLogo} alt="ZSE Logo" className="h-12 w-auto object-contain" />
                </div>

                <div className="text-center flex-1 mx-4">
                  <p className="text-[11px] font-black uppercase tracking-[0.35em] text-[#0b1324] leading-tight">
                    Zimbabwe Stock Exchange
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#00aeef] mt-0.5">
                    Training Institute
                  </p>
                </div>

                <div className="w-12 text-right">
                </div>
              </div>

              {/* 2. Certificate Body Section */}
              <div className="relative z-10 text-center my-auto px-10 py-1">
                {/* Title */}
                <div className="mb-2">
                  <h2 className="text-2xl font-black uppercase tracking-[0.25em] text-[#0b1324] font-serif">
                    Certificate of Achievement
                  </h2>
                  <div className="flex items-center justify-center gap-3 my-1">
                    <div className="h-px w-20 bg-gradient-to-r from-transparent to-[#c5a059]" />
                    <span className="text-[#c5a059] text-xs">◆</span>
                    <div className="h-px w-20 bg-gradient-to-l from-transparent to-[#c5a059]" />
                  </div>
                  <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-slate-500">
                    This credential is proudly conferred upon
                  </p>
                </div>

                {/* Recipient Full Name */}
                <div className="my-3">
                  <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#0b1324] tracking-tight border-b-2 border-[#0b1324]/10 pb-2 inline-block px-10 max-w-xl truncate">
                    {studentName}
                  </h1>
                </div>

                {/* Academic Conferment Statement */}
                <p className="text-xs text-slate-600 max-w-2xl mx-auto leading-relaxed mt-2 font-medium">
                  for successfully completing all prescribed coursework, practical financial market modules, and examinations for:
                </p>

                {/* Course Title */}
                <div className="my-2.5">
                  <h3 className="text-xl sm:text-2xl font-black text-[#003366] leading-snug tracking-tight">
                    {courseTitle}
                  </h3>
                  {certificate.course?.category && (
                    <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider text-[#00aeef] bg-sky-50 px-3 py-0.5 rounded-full border border-sky-100">
                      {certificate.course.category}
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-slate-500 font-medium">
                  Issued on <strong>{formattedDate}</strong> in Harare, Zimbabwe
                </p>
              </div>

              {/* 3. Footer Section: Scannable QR Code (Left) + Course Facilitator Signature (Right) */}
              <div className="relative z-10 flex items-end justify-between px-8 pb-3">
                {/* Left: Scannable QR Code & Credential ID */}
                <div className="flex items-center gap-3.5 text-left">
                  <div className="p-1 bg-white border border-slate-200 rounded-xl shadow-xs shrink-0">
                    <img
                      src={qrCodeUrl}
                      alt="Scan to Verify"
                      className="w-14 h-14 object-contain"
                      crossOrigin="anonymous"
                    />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                      Credential ID
                    </p>
                    <p className="text-xs font-mono font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200 inline-block">
                      {certificate.certificate_number}
                    </p>
                    <p className="text-[9px] text-slate-500 font-medium pt-0.5">
                      Scan QR code to verify authenticity
                    </p>
                  </div>
                </div>

                {/* Right: Single Course Facilitator Authorized Signature */}
                <div className="flex flex-col items-end text-right">
                  <div className="w-56 text-center">
                    <div className="h-11 flex items-center justify-center mb-0.5">
                      <img
                        src={activeSignatory.signature || certSignature}
                        alt="Course Facilitator Signature"
                        className="max-h-11 max-w-[140px] object-contain"
                      />
                    </div>
                    <div className="border-t border-slate-900 pt-1">
                      <p className="text-xs font-bold text-slate-900 leading-tight">
                        {activeSignatory.name}
                      </p>
                      <p className="text-[10px] text-slate-500 font-medium">
                        {activeSignatory.title || "Course Facilitator"}
                      </p>
                      <p className="text-[9px] text-[#00aeef] font-semibold uppercase tracking-wider">
                        {activeSignatory.organization || "Zimbabwe Stock Exchange"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer (Screen only) */}
          <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 gap-2">
            <span className="flex items-center gap-1.5 text-emerald-700 font-semibold text-xs">
              <FontAwesomeIcon icon={faCheckCircle} />
              Cryptographically verified against official ZSE Registry database
            </span>
            <div className="flex gap-2 w-full sm:w-auto justify-end">
              <Button variant="ghost" size="sm" onClick={onClose} className="text-xs rounded-xl">
                Close
              </Button>
              <Button
                size="sm"
                onClick={handlePrint}
                className="text-xs font-bold bg-[#00aeef] hover:bg-[#0098d4] text-white rounded-xl px-4"
              >
                <FontAwesomeIcon icon={faPrint} className="mr-1.5" />
                Print Certificate
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
