export interface TopicCourse {
  title: string;
  description?: string;
  category?: string;
}

export const learningTopics = [
  {
    slug: "zse-products",
    title: "ZSE products and platforms",
    description: "Explore ZSE Direct, exchange-traded funds, and the products available to investors.",
    keywords: /\b(zse direct|platforms?|exchange.traded funds?|etfs?|bonds?|equities|shares|products?)\b/i,
  },
  {
    slug: "company-analysis",
    title: "Company and financial analysis",
    description: "Learn to read company information and assess financial performance.",
    keywords: /\b(financial statements?|company analysis|fundamental analysis|valuation|annual reports?|financial analysis)\b/i,
  },
  {
    slug: "trading-analysis",
    title: "Trading and market analysis",
    description: "Build skills in market research, charts, and trading techniques.",
    keywords: /\b(trading|technical analysis|charting|market analysis|price action|charts?|market data|order book)\b/i,
  },
  {
    slug: "strategy-risk",
    title: "Investment strategy and risk",
    description: "Explore portfolio decisions, investment planning, and managing risk.",
    keywords: /\b(risk|portfolio|strateg(?:y|ies)|wealth|diversification|asset allocation|investment planning)\b/i,
  },
  {
    slug: "market-foundations",
    title: "Stock market foundations",
    description: "Understand how the Zimbabwe Stock Exchange works and build confidence with the basics.",
    keywords: /\b(basics?|fundamentals?|introduction|getting started|stock market|capital market|zse)\b/i,
  },
  {
    slug: "more-topics",
    title: "More investing topics",
    description: "Explore other courses for your financial markets learning journey.",
    keywords: /.*/,
  },
] as const;

export const getLearningTopic = (course: TopicCourse) => {
  const searchableText = `${course.title} ${course.description ?? ""} ${course.category ?? ""}`;
  return learningTopics.find((topic) => topic.keywords.test(searchableText)) ?? learningTopics[learningTopics.length - 1];
};
