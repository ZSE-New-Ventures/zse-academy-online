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

export const transformBlogPost = (post: any): any => {
  let cleanContent = post.content || '';
  // Fix escaped forward slashes which might break HTML rendering or URLs
  if (typeof cleanContent === 'string') {
    cleanContent = cleanContent.replace(/\\\//g, '/');
  }

  let cleanImage = post.image || '';
  if (typeof cleanImage === 'string') {
    cleanImage = cleanImage.replace(/\\\//g, '/');
  }

  return {
    ...post,
    content: cleanContent,
    author: post.user ? { name: post.user.name, email: post.user.email } : { name: "Anonymous Author", email: "" },
    image: cleanImage || getFallbackImage(post.id),
    excerpt: generateExcerpt(cleanContent),
    category: post.category || getRandomCategory(),
    read_time: calculateReadTime(cleanContent),
    tags: generateTags(post.title),
  };
};
