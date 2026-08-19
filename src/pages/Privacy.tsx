import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { API_BASE_URL } from "@/constants/api";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface PrivacyPolicy {
  id: number;
  title: string;
  content: string;
  date: string;
}

const Privacy = () => {
  const [policy, setPolicy] = useState<PrivacyPolicy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPolicy = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/privacy-policy`, {
          headers: {
            'Accept': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error("Failed to fetch privacy policy.");
        }

        const data: PrivacyPolicy[] = await response.json();
        // The API returns a list ordered by date. We just take the latest (first) one.
        if (data && data.length > 0) {
          setPolicy(data[0]);
        } else {
          setError("No privacy policy found.");
        }
      } catch (err: any) {
        console.error("Privacy Policy fetch error:", err);
        setError(err.message || "An unknown error occurred while fetching the privacy policy.");
      } finally {
        setLoading(false);
      }
    };

    fetchPolicy();
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col">
      <Navbar />

      {/* Header Banner */}
      <div className="bg-[#1c1d1f] py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-black text-white mb-4">Privacy Policy</h1>
          <p className="text-[#cec8c2] text-lg">
            We are committed to protecting your personal information and your right to privacy.
          </p>
        </div>
      </div>

      <div className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 py-12 w-full">
        {loading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-8" />
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
            <div className="h-4 bg-gray-200 rounded w-4/6" />
            <div className="h-4 bg-gray-200 rounded w-full" />
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <h3 className="text-2xl font-bold mb-4 text-gray-900">Oops!</h3>
            <p className="text-gray-600 mb-8">{error}</p>
            <Button asChild className="bg-[#00aeef] text-white hover:bg-[#0096ce]">
              <Link to="/">Return Home</Link>
            </Button>
          </div>
        ) : policy ? (
          <div className="prose prose-lg max-w-none text-gray-700">
            <div className="text-sm text-gray-500 mb-8 font-semibold uppercase tracking-wide border-b pb-4">
              Last Updated: {new Date(policy.date).toLocaleDateString()}
            </div>
            {/* The API returns raw HTML content */}
            <div 
              dangerouslySetInnerHTML={{ __html: policy.content }} 
              className="[&>p]:mb-4 [&>h1]:text-2xl [&>h1]:font-bold [&>h1]:mb-4 [&>h1]:text-gray-900 [&>h2]:text-xl [&>h2]:font-bold [&>h2]:mb-3 [&>h2]:mt-8 [&>h2]:text-gray-900 [&>ul]:list-disc [&>ul]:ml-6 [&>ul]:mb-4 [&>ol]:list-decimal [&>ol]:ml-6 [&>ol]:mb-4"
            />
          </div>
        ) : null}
      </div>

      <Footer />
    </div>
  );
};

export default Privacy;
