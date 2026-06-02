import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendar,
  faUser,
  faClock,
  faCheck,
  faChevronRight,
  faGlobe
} from "@fortawesome/free-solid-svg-icons";
import { blogService, type BlogPost } from "@/services/blog.service";
import { transformBlogPost, formatDate, getFallbackImage } from "@/utils/blogHelpers";

const BlogPostPage = () => {
  const { id } = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch blog post
  useEffect(() => {
    const fetchBlogPost = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        const data = await blogService.getPostById(id);
        const transformedPost = transformBlogPost(data);
        setPost(transformedPost);
        fetchRelatedPosts(transformedPost);
      } catch (err) {
        console.error('Error fetching blog post:', err);
        setError('Failed to load blog post. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchBlogPost();
    window.scrollTo(0, 0);
  }, [id]);

  const fetchRelatedPosts = async (currentPost: BlogPost) => {
    try {
      const data = await blogService.getPublicPosts();
      const related = data
        .filter((p: any) => p.id !== currentPost.id)
        .slice(0, 4) // Show 4 related articles in a row on desktop
        .map(transformBlogPost);
      setRelatedPosts(related);
    } catch (error) {
      console.error('Error fetching related posts:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white font-sans">
        <Navbar />
        {/* Skeleton Hero - Dark Background */}
        <div className="bg-[#1c1d1f] py-12 px-4 h-[350px]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-8 relative">
            <div className="w-full space-y-4 pt-8 max-w-4xl">
              <div className="h-4 bg-gray-700 rounded w-32 animate-pulse" />
              <div className="h-12 bg-gray-700 rounded w-3/4 animate-pulse" />
              <div className="h-6 bg-gray-700 rounded w-1/2 animate-pulse" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-white font-sans">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <div className="max-w-md mx-auto">
            <h3 className="text-3xl font-bold mb-4 text-gray-900">Article Not Found</h3>
            <p className="text-gray-600 mb-8">
              {error || "The article you're looking for doesn't exist or has been removed."}
            </p>
            <Button asChild className="bg-[#1c1d1f] text-white hover:bg-gray-800 rounded-none h-12 px-8 font-bold">
              <Link to="/blog">
                Back to Blog
              </Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <Navbar />

      {/* Udemy-style Dark Hero Section - Margins Aligning with Navbar */}
      <div className="bg-[#1c1d1f] text-white pt-10 pb-14 relative w-full border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl w-full space-y-6">
            
            {/* Breadcrumbs */}
            <nav className="flex items-center space-x-2 text-sm text-[#cec8c2] font-semibold mb-6">
              <Link to="/blog" className="hover:text-white transition">
                Blog
              </Link>
              <FontAwesomeIcon icon={faChevronRight} className="h-2.5 w-2.5" />
              <span className="hover:text-white transition cursor-pointer">
                {post.category}
              </span>
              <FontAwesomeIcon icon={faChevronRight} className="h-2.5 w-2.5" />
              <span className="text-white truncate max-w-[200px] md:max-w-xs">{post.title}</span>
            </nav>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight text-white tracking-tight">
              {post.title}
            </h1>

            <p className="text-lg md:text-xl text-[#cec8c2] leading-relaxed">
              {post.excerpt}
            </p>

            {/* Meta info block */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-[#cec8c2] font-semibold pt-2">
              <div className="flex items-center">
                Created by <span className="text-[#00aeef] hover:underline ml-1 cursor-pointer font-bold">{post.author?.name}</span>
              </div>

              <div className="flex items-center">
                <FontAwesomeIcon icon={faGlobe} className="h-3.5 w-3.5 mr-2" />
                English
              </div>

              <div className="flex items-center text-[#cec8c2]">
                <FontAwesomeIcon icon={faCalendar} className="h-3.5 w-3.5 mr-2" />
                Last updated {formatDate(post.created_at)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Body - Margins Aligning with Navbar */}
      <div className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="w-full">
          
          {/* Featured Image */}
          {post.image && (
            <div className="aspect-video w-full overflow-hidden bg-gray-100 mb-10 border border-gray-200">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = getFallbackImage(post.id);
                }}
              />
            </div>
          )}

          {/* Article Content Container */}
          <div className="mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-6 tracking-tight">Article Overview</h2>
            <style>{`
              .blog-content-view p {
                margin-bottom: 1.5rem !important;
                line-height: 1.8 !important;
                display: block !important;
              }
              .blog-content-view h2 {
                font-size: 1.75rem !important;
                font-weight: 800 !important;
                margin-top: 2.25rem !important;
                margin-bottom: 1rem !important;
                color: #1a202c !important;
              }
              .blog-content-view h3 {
                font-size: 1.4rem !important;
                font-weight: 700 !important;
                margin-top: 1.75rem !important;
                margin-bottom: 0.75rem !important;
                color: #2d3748 !important;
              }
              .blog-content-view ul {
                list-style-type: disc !important;
                padding-left: 1.5rem !important;
                margin-bottom: 1.5rem !important;
              }
              .blog-content-view ol {
                list-style-type: decimal !important;
                padding-left: 1.5rem !important;
                margin-bottom: 1.5rem !important;
              }
              .blog-content-view li {
                margin-bottom: 0.5rem !important;
              }
              .blog-content-view blockquote {
                border-left: 4px solid #cbd5e1 !important;
                padding-left: 1rem !important;
                font-style: italic !important;
                margin: 1.5rem 0 !important;
                color: #475569 !important;
              }
              .blog-content-view a {
                color: #00aeef !important;
                text-decoration: underline !important;
              }
              .blog-content-view a:hover {
                color: #008cc0 !important;
              }
              .blog-content-view img {
                width: 100% !important;
                max-height: 400px !important;
                object-fit: cover !important;
                border-radius: 0.375rem !important;
                margin-top: 1rem !important;
                margin-bottom: 1rem !important;
                border: 1px solid #f3f4f6 !important;
                display: block !important;
              }
            `}</style>
            <div
              className="blog-content-view whitespace-pre-wrap font-sans text-base md:text-lg text-gray-800 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>

          {/* Tags section removed per user request */}

          {/* Author section removed per user request */}

        </div>
      </div>

      {/* Flat Related Articles Section */}
      {relatedPosts.length > 0 && (
        <section className="bg-gray-50 border-t border-gray-200 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-black text-gray-900 mb-8 tracking-tight text-center sm:text-left">
              More articles by {post.author?.name}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedPosts.map((relatedPost) => (
                <div key={relatedPost.id} className="group cursor-pointer bg-white border border-gray-200 hover:border-gray-400 transition-all duration-300 flex flex-col h-full">
                  <div className="aspect-video relative overflow-hidden bg-gray-100 shrink-0">
                    <img
                      src={relatedPost.image || getFallbackImage(relatedPost.id)}
                      alt={relatedPost.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.src = getFallbackImage(relatedPost.id);
                      }}
                    />
                  </div>

                  <div className="p-4 flex flex-col justify-between flex-grow">
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-[#00aeef] uppercase tracking-wider block">
                        {relatedPost.category}
                      </span>
                      <h3 className="font-extrabold text-base text-gray-900 leading-snug line-clamp-2 hover:text-black">
                        <Link to={`/blog/${relatedPost.id}`}>
                          {relatedPost.title}
                        </Link>
                      </h3>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-400 font-semibold pt-4 mt-4 border-t border-gray-100">
                      <span>{relatedPost.author?.name}</span>
                      <span className="flex items-center gap-1">
                        <FontAwesomeIcon icon={faClock} className="h-3 w-3" />
                        {relatedPost.read_time || "3 min read"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default BlogPostPage;
