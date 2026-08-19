import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import blogBg from "@/assets/blogroom.jpg";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faNewspaper,
} from "@fortawesome/free-solid-svg-icons";
import { blogService, BlogPost } from "@/services/blog.service";
import {
  transformBlogPost,
  formatDate,
  getFallbackImage,
} from "@/utils/blogHelpers";



const Blog = () => {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<{id: number, name: string, slug: string}[]>([{id: 0, name: "All", slug: "all"}]);
  const [trendingPosts, setTrendingPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activeFilter, setActiveFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 4;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeFilter]);

  useEffect(() => {
    const fetchBlogData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [postsData, catsData, trendingData] = await Promise.all([
          blogService.getPublicPosts(),
          blogService.getCategories(),
          blogService.getTrendingPosts(),
        ]);

        const transformedPosts = postsData.map((post: any, index: number) => ({
          ...transformBlogPost(post),
          featured: index === 0,
        }));
        
        setBlogPosts(transformedPosts);
        if (catsData && catsData.length > 0) {
          setCategories([{id: 0, name: "All", slug: "all"}, ...catsData]);
        }
        if (trendingData && trendingData.length > 0) {
          setTrendingPosts(trendingData.map((p: any) => transformBlogPost(p)));
        }
      } catch (err) {
        console.error("Error fetching blog data:", err);
        setError("Failed to load blog data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchBlogData();
  }, []);

  const filteredPosts = blogPosts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.tags?.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      );
    const matchesCategory =
      activeFilter === "All" || post.category === activeFilter;
    return matchesSearch && matchesCategory;
  });

  const featuredPost = filteredPosts.find((post) => post.featured);
  const regularPosts = filteredPosts.filter((post) => !post.featured);

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = regularPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(regularPosts.length / postsPerPage);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Skeleton loading omitted for brevity, would be here */}
          <div className="h-64 bg-gray-100 animate-pulse mb-8" />
        </div>
        <Footer />
      </div>
    );
  }

  if (error && blogPosts.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh] pt-24">
          <div className="text-center">
            <FontAwesomeIcon
              icon={faNewspaper}
              className="h-16 w-16 text-gray-300 mb-4"
            />
            <h3 className="text-xl font-semibold mb-2">Unable to Load Blog</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-[#00aeef] rounded-none hover:bg-[#008bc0]"
            >
              Try Again
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      {/* Flat Corporate Header */}
      <div 
        className="relative border-b border-gray-200 py-12 md:py-20 bg-cover bg-center"
        style={{ backgroundImage: `url(${blogBg})` }}
      >
        <div className="absolute inset-0 bg-black/70"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="max-w-2xl text-white">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Blog
            </h1>
            <p className="text-lg leading-relaxed text-gray-200">
              The latest financial insights, market analysis, and platform updates straight from the experts.
            </p>
          </div>

          {/* Simple Search */}
          <div className="w-full md:w-auto flex items-center md:max-w-sm">
            <div className="relative w-full">
              <FontAwesomeIcon
                icon={faSearch}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4"
              />
              <Input
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11 w-full border-transparent bg-white text-gray-900 rounded-md focus:ring-2 focus:ring-[#00aeef] focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <div className="flex flex-col lg:flex-row gap-12">

          {/* Main Feed Column */}
          <div className="lg:w-3/4">

            {/* Navigational Tabs (Categories) Joined Segmented Control */}
            <div className="mb-8 pb-2">
              <nav className="inline-flex flex-wrap border border-[#00aeef] rounded-sm overflow-hidden">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveFilter(category.name)}
                    className={`px-5 py-2 font-semibold text-sm transition-all whitespace-nowrap border-r border-[#00aeef] last:border-r-0
                      ${activeFilter === category.name
                        ? "bg-[#00aeef] text-white"
                        : "bg-transparent text-[#00aeef] hover:bg-[#00aeef]/10"
                      }`}
                  >
                    {category.name}
                  </button>
                ))}
              </nav>
            </div>

            {/* Featured Article */}
            {featuredPost && activeFilter === "All" && searchTerm === "" && (
              <div className="mb-12 group block">
                <Link to={`/blog/${featuredPost.id}`}>
                  <div className="relative h-80 md:h-[450px] w-full mb-6 bg-gray-100 overflow-hidden">
                    <img
                      src={featuredPost.image || getFallbackImage(featuredPost.id)}
                      alt={featuredPost.title}
                      className="w-full h-full object-cover transition duration-300 group-hover:opacity-90 grayscale-0 hover:grayscale-0"
                      onError={(e) => {
                        e.currentTarget.src = getFallbackImage(featuredPost.id);
                      }}
                    />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[#00aeef] uppercase tracking-widest mb-3">
                      {featuredPost.category}
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 group-hover:text-[#00aeef] transition-colors">
                      {featuredPost.title}
                    </h2>
                    <p className="text-gray-600 text-base md:text-lg mb-4 line-clamp-3">
                      {featuredPost.excerpt}
                    </p>
                    <div className="flex items-center text-sm text-gray-500 uppercase tracking-wider font-semibold">
                      <span>{featuredPost.author?.name}</span>
                      <span className="mx-2">·</span>
                      <span>{formatDate(featuredPost.created_at)}</span>
                    </div>
                  </div>
                </Link>
              </div>
            )}

            {/* Top Toolbar for regular posts (Filters & Sort if active) */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900">Latest Updates</h3>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-[180px] rounded-none border-gray-300 bg-transparent shadow-none text-sm font-semibold h-10">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent className="rounded-none shadow-sm border-gray-300">
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Article List / Feed */}
            {regularPosts.length === 0 ? (
              <div className="py-12 border-t border-b border-gray-100 text-center">
                <p className="text-gray-500 text-lg">There are no articles matching your criteria.</p>
                <button
                  onClick={() => { setSearchTerm(""); setActiveFilter("All"); }}
                  className="mt-4 text-[#00aeef] hover:underline font-medium"
                >
                  Clear Search
                </button>
              </div>
            ) : (
              <div className="space-y-12">
                {currentPosts.map((post) => (
                  <article key={post.id} className="flex flex-col md:flex-row gap-8 group">
                    {/* Image on left for list view */}
                    <div className="w-full md:w-2/5 flex-shrink-0">
                      <Link to={`/blog/${post.id}`}>
                        <div className="h-48 md:h-full min-h-[160px] bg-gray-100 overflow-hidden relative border border-gray-100">
                          <img
                            src={post.image || getFallbackImage(post.id)}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                            onError={(e) => {
                              e.currentTarget.src = getFallbackImage(post.id);
                            }}
                          />
                        </div>
                      </Link>
                    </div>

                    {/* Content on right */}
                    <div className="w-full md:w-3/5 flex flex-col justify-center py-2">
                      <div className="text-xs font-bold text-[#00aeef] uppercase tracking-widest mb-2">
                        {post.category}
                      </div>
                      <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 group-hover:text-[#00aeef] transition-colors line-clamp-2">
                        <Link to={`/blog/${post.id}`}>{post.title}</Link>
                      </h3>
                      <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-4 line-clamp-2">
                        {post.excerpt}
                      </p>
                      <div className="mt-auto flex items-center text-xs text-gray-500 uppercase tracking-wider font-semibold">
                        <span>{post.author?.name}</span>
                        <span className="mx-2">|</span>
                        <time>{formatDate(post.created_at)}</time>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {/* Empty space mimicking pagination bar */}
            {regularPosts.length > 0 && totalPages > 1 && (
              <div className="mt-16 border-t border-gray-200 pt-8 flex justify-between items-center">
                <Button 
                  variant="outline" 
                  className="rounded-none border-gray-300 text-gray-700 bg-white shadow-none hover:bg-gray-50 transition-none" 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                >
                  Previous Page
                </Button>
                <span className="text-sm text-gray-500">Page {currentPage} of {totalPages}</span>
                <Button 
                  variant="outline" 
                  className="rounded-none border-gray-300 text-gray-700 bg-white shadow-none hover:bg-gray-50 transition-none" 
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                >
                  Next Page
                </Button>
              </div>
            )}
          </div>

          {/* Right Sidebar - Trending/Corporate Info */}
          <div className="lg:w-1/4 pt-12 lg:pt-0">
            <aside className="sticky top-28">
              <div className="border-t-4 border-black pt-4 mb-10">
                <h4 className="text-sm font-bold uppercase tracking-widest mb-6 text-gray-900">Trending Now</h4>
                <ul className="space-y-6">
                  {trendingPosts.map((post, index) => (
                    <li key={post.id} className="group">
                      <Link to={`/blog/${post.id}`} className="flex items-start gap-4">
                        <span className="text-3xl font-bold text-gray-200 mt-[-4px]">
                          0{index + 1}
                        </span>
                        <div>
                          <h5 className="text-sm font-bold text-gray-900 group-hover:text-[#00aeef] line-clamp-3 leading-snug">
                            {post.title}
                          </h5>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              {/* Newsletter Removed */}
            </aside>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Blog;




