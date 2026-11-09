import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faAward, 
  faDownload, 
  faShareNodes, 
  faCalendar, 
  faExternalLinkAlt,
  faCircleCheck,
  faShieldHalved,
  faArrowRight
} from "@fortawesome/free-solid-svg-icons";
import { apiClient } from "@/services/api";
import { API_ENDPOINTS } from "@/constants/api";
import { useAuth } from "@/contexts/AuthContext";
import { CertificateModal } from "@/components/certificate/CertificateModal";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface CertificateItem {
  id: number;
  certificate_number: string;
  issued_at: string;
  file_path?: string | null;
  course?: {
    id: number;
    title: string;
    category?: string;
    thumbnail_url?: string;
    instructor?: {
      name: string;
    };
  };
}

const Certificates = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [certificates, setCertificates] = useState<CertificateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState<CertificateItem | null>(null);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(API_ENDPOINTS.MY_CERTIFICATES);
      const data = response.data?.data || response.data || [];
      setCertificates(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load certificates:", err);
      setCertificates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = (certificateNumber: string) => {
    const verifyUrl = `${window.location.origin}/verify/${certificateNumber}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(verifyUrl);
      toast.success("Certificate verification link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm animate-pulse space-y-4">
              <div className="w-16 h-16 bg-slate-100 rounded-full mx-auto"></div>
              <div className="h-5 w-3/4 bg-slate-100 rounded mx-auto"></div>
              <div className="h-4 w-1/2 bg-slate-100 rounded mx-auto"></div>
              <div className="space-y-2 pt-2">
                <div className="h-4 bg-slate-100 rounded"></div>
                <div className="h-4 bg-slate-100 rounded"></div>
              </div>
              <div className="flex gap-2 pt-2">
                <div className="h-9 flex-1 bg-slate-100 rounded-xl"></div>
                <div className="h-9 flex-1 bg-slate-100 rounded-xl"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (certificates.length === 0) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl p-10 lg:p-14 border border-slate-200/80 shadow-sm text-center space-y-4 max-w-2xl mx-auto">
          <div className="mx-auto w-20 h-20 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
            <FontAwesomeIcon icon={faAward} className="h-10 w-10" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">No Certificates Earned Yet</h3>
          <p className="text-slate-500 max-w-md mx-auto text-xs leading-relaxed">
            Finish all lessons and pass the final course assessments to earn verified, industry-recognized certificates from the Zimbabwe Stock Exchange Training Institute.
          </p>
          <div className="pt-2">
            <Button
              onClick={() => navigate("/courses")}
              className="bg-[#00aeef] text-white hover:bg-[#0098d4] rounded-xl text-xs font-bold px-6 h-10 shadow-md"
            >
              Browse Course Catalog
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Info */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FontAwesomeIcon icon={faAward} className="text-amber-500" />
            My Verified Certifications ({certificates.length})
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Official ZSE Training Institute certificates with cryptographically verifiable credentials
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-xl text-xs font-semibold text-emerald-700">
          <FontAwesomeIcon icon={faShieldHalved} className="text-emerald-500" />
          Verifiable on public portal
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {certificates.map((cert) => (
          <div 
            key={cert.id} 
            className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-amber-400/50 transition-all duration-200 flex flex-col justify-between overflow-hidden"
          >
            <div className="p-6">
              <div className="text-center pb-4 border-b border-slate-100 mb-4">
                <div className="mx-auto mb-3 w-14 h-14 bg-amber-50 text-amber-500 border border-amber-100 rounded-2xl flex items-center justify-center shadow-inner">
                  <FontAwesomeIcon icon={faAward} className="h-7 w-7" />
                </div>
                <h3 className="font-bold text-base text-slate-900 line-clamp-1">
                  {cert.course?.title || "ZSE Professional Certificate"}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {cert.course?.instructor?.name ? `Instructor: ${cert.course.instructor.name}` : "ZSE Training Institute"}
                </p>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Credential Status</span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                    <FontAwesomeIcon icon={faCircleCheck} className="text-emerald-500 text-[10px]" />
                    Verified & Active
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Date of Issue</span>
                  <span className="font-semibold text-slate-800 flex items-center gap-1">
                    <FontAwesomeIcon icon={faCalendar} className="text-slate-400 text-[10px]" />
                    {cert.issued_at ? new Date(cert.issued_at).toLocaleDateString() : "Official Record"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Certificate ID</span>
                  <span className="font-mono text-[11px] font-bold text-[#00aeef] bg-sky-50 px-2 py-0.5 rounded border border-sky-100">
                    {cert.certificate_number}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
              <Button 
                size="sm" 
                className="flex-1 bg-[#0b1324] hover:bg-[#121f3a] text-white rounded-xl font-bold text-xs h-9 shadow-sm"
                onClick={() => setSelectedCert(cert)}
              >
                <FontAwesomeIcon icon={faAward} className="h-3.5 w-3.5 mr-1.5 text-amber-400" />
                View & Print
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 border-slate-200 text-slate-700 hover:bg-white rounded-xl font-semibold text-xs h-9"
                onClick={() => handleShare(cert.certificate_number)}
              >
                <FontAwesomeIcon icon={faShareNodes} className="h-3 w-3 mr-1.5 text-slate-500" />
                Share Link
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Official Certificate Modal */}
      <CertificateModal
        isOpen={!!selectedCert}
        certificate={selectedCert}
        onClose={() => setSelectedCert(null)}
        currentUserName={user?.name}
      />
    </div>
  );
};

export default Certificates;
