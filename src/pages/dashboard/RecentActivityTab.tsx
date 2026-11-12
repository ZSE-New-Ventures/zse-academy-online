import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faChartColumn, 
  faBook, 
  faGraduationCap,
  faSpinner,
  faHistory,
  faStar,
  faClock,
  faArrowRight
} from "@fortawesome/free-solid-svg-icons";
import { API_BASE_URL } from "@/constants/api";
import { Button } from "@/components/ui/button";

interface ActivityItem {
  id: string | number;
  type: "quiz" | "course" | "review" | string;
  title: string;
  subtitle: string;
  created_at: string;
}

const RecentActivityTab = () => {
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("zse_training_token");
        
        const response = await fetch(`${API_BASE_URL}/user/activity`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json",
          },
        });

        if (!response.ok) throw new Error("Failed to load activity");
        
        const data = await response.json();
        setActivity(data);
      } catch (err: unknown) {
        console.error("Error fetching activity:", err);
        setError(err instanceof Error ? err.message : "Failed to load recent activity");
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FontAwesomeIcon icon={faSpinner} className="animate-spin h-8 w-8 text-[#00aeef]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center max-w-xl mx-auto mt-8">
        <h3 className="font-bold text-rose-900 mb-1">Failed to load activity</h3>
        <p className="text-rose-700 text-xs mb-4">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="bg-white rounded-2xl p-6 lg:p-8 border border-slate-200/80 shadow-sm">
        <div className="flex items-center mb-6 border-b border-slate-100 pb-5">
          <div className="w-12 h-12 bg-sky-50 text-[#00aeef] rounded-2xl flex items-center justify-center mr-4 shrink-0">
            <FontAwesomeIcon icon={faHistory} className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Learning Timeline & Activity</h2>
            <p className="text-xs text-slate-500 mt-0.5">Your chronological history of completed modules, quizzes, and course milestones</p>
          </div>
        </div>

        <div className="space-y-3">
          {activity.length > 0 ? (
            <>
              {activity.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((item) => (
                <div 
                  key={item.id} 
                  className="flex items-start p-4 bg-slate-50/70 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-white transition-all"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-4 shrink-0 mt-0.5 ${
                    item.type === 'quiz' ? 'bg-amber-100/70 text-amber-700' : 
                    item.type === 'course' ? 'bg-sky-100/70 text-[#00aeef]' : 
                    'bg-emerald-100/70 text-emerald-700'
                  }`}>
                    <FontAwesomeIcon icon={
                      item.type === 'quiz' ? faChartColumn : 
                      item.type === 'course' ? faBook : 
                      faStar
                    } className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-1 gap-1">
                      <p className="font-bold text-slate-900 text-sm truncate">{item.title}</p>
                      <span className="text-[11px] text-slate-400 font-medium sm:ml-4 whitespace-nowrap bg-white px-2 py-0.5 rounded-full border border-slate-200/80 inline-flex items-center gap-1">
                        <FontAwesomeIcon icon={faClock} className="text-[9px]" />
                        {new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">{item.subtitle}</p>
                  </div>
                </div>
              ))}
              
              {/* Pagination Controls */}
              {activity.length > itemsPerPage && (
                <div className="flex justify-between items-center pt-5 border-t border-slate-100 mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="rounded-xl text-xs font-semibold h-9 px-4 border-slate-200"
                  >
                    Previous
                  </Button>
                  <span className="text-xs text-slate-500 font-medium">
                    Page {currentPage} of {Math.ceil(activity.length / itemsPerPage)}
                  </span>
                  <Button
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(activity.length / itemsPerPage)))}
                    disabled={currentPage === Math.ceil(activity.length / itemsPerPage)}
                    className="rounded-xl text-xs font-semibold h-9 px-4 bg-[#00aeef] hover:bg-[#0098d4] text-white"
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-slate-400 space-y-3">
              <FontAwesomeIcon icon={faHistory} className="h-10 w-10 text-slate-300" />
              <p className="font-bold text-slate-700 text-base">No learning activity yet</p>
              <p className="text-xs max-w-sm mx-auto">Complete modules and test your knowledge in quizzes to build your career timeline.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecentActivityTab;
