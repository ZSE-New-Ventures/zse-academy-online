import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendar, faUser, faArrowRight, faSpinner, faNewspaper, faClock } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import { blogService, BlogPost } from "@/services/blog.service";
import { transformBlogPost, formatDate, getFallbackImage } from "@/utils/blogHelpers";

export const BlogPreview = () => {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch latest blog posts
  useEffect(() => {
    const fetchLatestBlogs = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await blogService.getLatestPosts();
        const transformedPosts = data.slice(0, 4).map(transformBlogPost);
        setBlogPosts(transformedPosts);
      } catch (err) {
        console.error('Error fetching latest blogs:', err);
        setError('Failed to load latest market insights. Please try again later.');
        setBlogPosts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchLatestBlogs();
  }, []);

  if (loading) {
    return (
      <section className="py-20 bg-slate-50 font-montserrat">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-left">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-2">
              Capital Market Insights & Analysis
            </h2>
            <p className="text-base text-slate-600 max-w-2xl">
              Stay ahead with authoritative commentary, listing updates, and investor education directly from the Zimbabwe Stock Exchange.
            </p>
          </div>

          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <FontAwesomeIcon
                icon={faSpinner}
                className="h-8 w-8 text-[#00aeef] animate-spin mb-4"
              />
              <p className="text-slate-500 font-medium">Loading latest market insights...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-slate-50 font-montserrat border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div className="text-left max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00aeef]/10 text-[#00aeef] text-xs font-bold uppercase tracking-wider mb-3 border border-[#00aeef]/20">
              <FontAwesomeIcon icon={faNewspaper} />
              <span>ZSE Market Intelligence</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Capital Market Insights & Analysis
            </h2>
            <p className="text-base text-slate-600 mt-2">
              Authoritative commentary, regulatory updates, and investor education directly from the Zimbabwe Stock Exchange.
            </p>
          </div>

          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#00aeef] hover:text-[#008cc0] transition-colors shrink-0"
          >
            <span>View All Articles</span>
            <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-amber-800 text-sm">
              <strong>Notice:</strong> {error}
            </p>
          </div>
        )}

        {blogPosts.length === 0 && !loading ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
            <p className="text-slate-500">No blog posts available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {blogPosts.map((post) => (
              <div
                key={post.id}
                className="group bg-white rounded-2xl overflow-hidden flex flex-col border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300"
              >
                <Link to={`/blog/${post.id}`} className="block relative overflow-hidden aspect-video bg-slate-100">
                  <img
                    src={post.image || getFallbackImage(post.id)}
                    alt={post.title}
                    className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.src = getFallbackImage(post.id);
                    }}
                  />
                  <div className="absolute top-3 left-3">
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider bg-white/95 backdrop-blur-md text-[#008cc0] shadow-sm">
                      {post.category || "Markets"}
                    </span>
                  </div>
                </Link>

                <div className="p-5 flex flex-col flex-grow text-left">
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mb-2">
                    <FontAwesomeIcon icon={faClock} className="text-slate-400 text-[10px]" />
                    <span>{post.read_time || "4 min read"}</span>
                    <span>•</span>
                    <span>{formatDate(post.created_at)}</span>
                  </div>

                  <Link to={`/blog/${post.id}`}>
                    <h3 className="font-bold text-base text-slate-900 leading-snug mb-2 line-clamp-2 group-hover:text-[#00aeef] transition-colors">
                      {post.title}
                    </h3>
                  </Link>

                  <p className="text-xs text-slate-600 mb-4 line-clamp-2 leading-relaxed">
                    {post.excerpt}
                  </p>

                  <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500 truncate max-w-[140px]">
                      {post.author?.name || "ZSE Research"}
                    </span>
                    <Link
                      to={`/blog/${post.id}`}
                      className="text-xs font-bold text-[#00aeef] group-hover:translate-x-1 transition-transform inline-flex items-center gap-1"
                    >
                      <span>Read</span>
                      <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
