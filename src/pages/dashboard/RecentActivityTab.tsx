import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faArrowTrendUp, 
  faChartColumn, 
  faBook, 
  faGraduationCap,
  faSpinner,
  faHistory
} from "@fortawesome/free-solid-svg-icons";
import { API_BASE_URL } from "@/constants/api";
import { formatDate } from "@/utils/blogHelpers"; // Use existing date formatter if available

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
  const itemsPerPage = 5;

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
      } catch (err: any) {
        console.error("Error fetching activity:", err);
        setError(err.message || "Failed to load recent activity");
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FontAwesomeIcon icon={faSpinner} className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-destructive/10 border-destructive/20 rounded-md p-6 text-center max-w-2xl mx-auto mt-8">
        <h3 className="font-semibold text-destructive mb-2">Error</h3>
        <p className="text-destructive/80 text-sm mb-4">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 lg:space-y-8 max-w-5xl mx-auto">
      <div className="bg-gradient-to-br from-card via-card to-muted/20 rounded-md lg:rounded-lg p-6 lg:p-8 border border-border/50 shadow-sm">
        <div className="flex items-center mb-6 border-b border-border pb-4">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mr-4">
            <FontAwesomeIcon icon={faHistory} className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-foreground">Recent Activity</h2>
            <p className="text-sm text-muted-foreground">Your complete timeline of learning actions</p>
          </div>
        </div>

        <div className="space-y-4">
          {activity.length > 0 ? (
            <>
              {activity.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((item) => (
                <div key={item.id} className="flex items-start p-4 bg-gradient-to-r from-primary/5 to-transparent rounded-md border border-primary/10 hover:border-primary/30 transition-colors">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-4 shrink-0 mt-1 ${
                  item.type === 'quiz' ? 'bg-orange-500/10 text-orange-500' : 
                  item.type === 'course' ? 'bg-primary/10 text-primary' : 
                  'bg-success/10 text-success'
                }`}>
                  <FontAwesomeIcon icon={
                    item.type === 'quiz' ? faChartColumn : 
                    item.type === 'course' ? faBook : 
                    faGraduationCap
                  } className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-1">
                    <p className="font-bold text-foreground text-base lg:text-lg truncate">{item.title}</p>
                    <span className="text-xs text-muted-foreground font-medium sm:ml-4 whitespace-nowrap bg-muted px-2 py-1 rounded">
                      {new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-sm lg:text-base text-muted-foreground">{item.subtitle}</p>
                </div>
              </div>
            ))}
              
              {/* Pagination Controls */}
              {activity.length > itemsPerPage && (
                <div className="flex justify-between items-center pt-4 border-t border-border mt-6">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 text-sm font-medium text-foreground bg-muted hover:bg-muted/80 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage} of {Math.ceil(activity.length / itemsPerPage)}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(activity.length / itemsPerPage)))}
                    disabled={currentPage === Math.ceil(activity.length / itemsPerPage)}
                    className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center p-8 text-muted-foreground border border-dashed border-border rounded-md bg-muted/5">
              <FontAwesomeIcon icon={faHistory} className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="font-medium text-lg mb-2">No activity yet</p>
              <p className="text-sm">Start taking courses and quizzes to build your timeline!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecentActivityTab;
