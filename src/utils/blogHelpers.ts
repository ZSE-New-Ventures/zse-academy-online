// Helper functions for blog data transformation
export const generateExcerpt = (content: string, maxLength: number = 150): string => {
  const plainText = content.replace(/<[^>]*>/g, '');
  if (plainText.length <= maxLength) return plainText;
  return plainText.substring(0, maxLength) + '...';
};

export const calculateReadTime = (content: string): string => {
  const plainText = content.replace(/<[^>]*>/g, '');
  const wordsPerMinute = 200;
  const words = plainText.split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} min read`;
};

export const getRandomCategory = (): string => {
  const categories = ["Market Analysis", "Investment Tips", "Risk Management", "Fintech", "Currency Analysis"];
  return categories[Math.floor(Math.random() * categories.length)];
};

export const generateTags = (title: string): string[] => {
  const words = title.split(/\s+/).slice(0, 3);
  return words.map(word => word.replace(/[^\w]/g, ''));
};

export const getFallbackImage = (id: number): string => {
  const fallbackImages = [
    "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop"
  ];
  return fallbackImages[id % fallbackImages.length];
};

export const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    return 'Invalid date';
  }
};

const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000').replace(/\/api\/?$/, '');

export const transformBlogPost = (post: any): any => {
  let cleanContent = post.content || '';
  // Fix escaped forward slashes which might break HTML rendering or URLs
  if (typeof cleanContent === 'string') {
    cleanContent = cleanContent.replace(/\\\//g, '/');

    // Rewrite any WordPress legacy upload paths or localhost paths to relative /storage/uploads
    cleanContent = cleanContent
      .replace(/https?:\/\/zsetraining\.co\.zw\/(?:demo404\/)?wp-content\/uploads\//gi, '/storage/uploads/')
      .replace(/https?:\/\/localhost\/inst\/wp-content\/uploads\//gi, '/storage/uploads/')
      .replace(/https?:\/\/(?:127\.0\.0\.1|localhost):8000\/storage\//gi, '/storage/')
      // Ensure missing/re-indexed 2020 assets resolve to their valid uploads location
      .replace(/\/storage\/uploads\/2020\/02\/trade3-300x245\.jpg/gi, '/storage/uploads/2020/08/zse-1-300x169.jpg')
      .replace(/\/storage\/uploads\/2020\/02\/trade4-300x245\.jpg/gi, '/storage/uploads/2020/08/ats.jpg')
      .replace(/\/storage\/uploads\/2020\/02\/trade1-300x245\.jpg/gi, '/storage/uploads/2020/08/trade1-300x245.jpg');
  }

  let cleanImage = post.image || '';
  if (typeof cleanImage === 'string') {
    cleanImage = cleanImage.replace(/\\\//g, '/');

    cleanImage = cleanImage
      .replace(/https?:\/\/zsetraining\.co\.zw\/(?:demo404\/)?wp-content\/uploads\//gi, '/storage/uploads/')
      .replace(/https?:\/\/localhost\/inst\/wp-content\/uploads\//gi, '/storage/uploads/')
      .replace(/https?:\/\/(?:127\.0\.0\.1|localhost):8000\/storage\//gi, '/storage/');
  }

  return {
    ...post,
    content: cleanContent,
    author: post.user ? { name: post.user.name, email: post.user.email } : { name: "Anonymous Author", email: "" },
    image: cleanImage || getFallbackImage(post.id),
    excerpt: generateExcerpt(cleanContent),
    category: post.category_data?.name || post.category?.name || post.category || getRandomCategory(),
    read_time: post.estimated_reading_time_minutes ? `${post.estimated_reading_time_minutes} min read` : calculateReadTime(cleanContent),
    tags: generateTags(post.title),
    views: post.views || 0,
    language: post.language || "English"
  };
};
