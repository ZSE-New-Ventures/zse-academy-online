import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle, faExternalLink, faRefresh } from "@fortawesome/free-solid-svg-icons";
import { Button } from "@/components/ui/button";

interface YouTubePlayerProps {
  content: {
    url: string;
    title: string;
    youtubeId?: string;
  };
}

export const YouTubePlayer = ({ content }: YouTubePlayerProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [useFallback, setUseFallback] = useState(false);

  const getYouTubeId = (url: string): string | null => {
    if (!url) return null;

    const cleanUrl = url
      .replace(/\?si=.*$/, "")
      .replace(/&t=.*$/, "")
      .split("&")[0];

    const patterns = [
      /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/,
      /youtube\.com\/watch\?v=([^"&?/\s]{11})/,
      /youtu\.be\/([^"&?/\s]{11})/,
    ];

    for (const pattern of patterns) {
      const match = cleanUrl.match(pattern);
      if (match) {
        return match[1];
      }
    }

    return null;
  };

  const getYouTubeEmbedUrl = (youtubeId: string): string => {
    const params = new URLSearchParams({
      autoplay: "1",
      rel: "0",
      modestbranding: "1",
      showinfo: "0",
      iv_load_policy: "3",
      enablejsapi: "1",
      origin: window.location.origin,
      widget_referrer: window.location.origin,
    });

    return `https://www.youtube-nocookie.com/embed/${youtubeId}?${params.toString()}`;
  };

  const youtubeId = content.youtubeId || getYouTubeId(content.url);

  useEffect(() => {
    setIsLoading(true);
    setUseFallback(false);
  }, [content.url]);

  if (useFallback || !youtubeId) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-muted p-8">
        <div className="text-center max-w-md">
          <FontAwesomeIcon
            icon={faExclamationTriangle}
            className="h-16 w-16 text-amber-500 mb-4"
          />
          <h3 className="text-lg font-semibold mb-2">Video Content</h3>
          <p className="text-muted-foreground mb-4 text-center">
            Unable to load embedded video. This may be due to YouTube restrictions. Please watch directly on YouTube.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button asChild variant="outline">
              <a
                href={content.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2"
              >
                <FontAwesomeIcon icon={faExternalLink} className="h-4 w-4" />
                <span>Watch on YouTube</span>
              </a>
            </Button>
            <Button
              onClick={() => {
                setUseFallback(false);
                setIsLoading(true);
              }}
              variant="secondary"
            >
              <FontAwesomeIcon icon={faRefresh} className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading video...</p>
          </div>
        </div>
      )}
      <iframe
        width="100%"
        height="100%"
        src={getYouTubeEmbedUrl(youtubeId)}
        title={content.title}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
        className="w-full h-full"
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setUseFallback(true);
        }}
        style={{ opacity: isLoading ? 0 : 1 }}
      />
    </div>
  );
};
