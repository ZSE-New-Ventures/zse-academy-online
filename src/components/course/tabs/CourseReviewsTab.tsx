import { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faPen } from "@fortawesome/free-solid-svg-icons";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface Props {
  courseId: string;
}

interface Review {
  id: number;
  rating: number;
  comment: string;
  created_at: string;
  user: {
    id: number;
    name: string;
    email?: string;
  };
}

const getUserAvatarInfo = (name: string) => {
  const initials = name
    .split(" ")
    .map((p) => p.charAt(0).toUpperCase())
    .join("")
    .slice(0, 2);

  const colors = [
    "bg-[#00aeef]",
    "bg-indigo-600",
    "bg-teal-600",
    "bg-amber-600",
    "bg-[#1c1d1f]",
    "bg-emerald-600",
    "bg-pink-600",
  ];
  const colorIndex = name.length % colors.length;
  return { initials, color: colors[colorIndex] };
};

const StarRating = ({
  rating,
  size = "sm",
}: {
  rating: number;
  size?: "sm" | "md" | "lg";
}) => {
  const sizeClasses = {
    sm: "h-3.5 w-3.5",
    md: "h-4.5 w-4.5",
    lg: "h-5.5 w-5.5",
  };

  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <FontAwesomeIcon
          key={i}
          icon={faStar}
          className={`${sizeClasses[size]} ${
            i < Math.round(rating) ? "text-amber-400" : "text-gray-200"
          }`}
        />
      ))}
    </div>
  );
};

const UserAvatar = ({ name, className = "" }: { name: string; className?: string }) => {
  const { initials, color } = getUserAvatarInfo(name);
  return (
    <div
      className={`flex items-center justify-center rounded-full ${color} text-white font-semibold tracking-wide ${className}`}
    >
      {initials}
    </div>
  );
};

export const CourseReviewsTab = ({ courseId }: Props) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const token = localStorage.getItem("zse_training_token");

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://127.0.0.1:8000/api/courses/${courseId}/reviews`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      setReviews(response.data.reviews || []);
      setAverageRating(Number(response.data.average_rating || 0));
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) fetchReviews();
  }, [courseId]);

  const handleSubmit = async () => {
    if (!comment.trim()) {
      toast.warning("Please write a comment before submitting.");
      return;
    }
    if (!token) {
      toast.error("You must be logged in to submit a review.");
      return;
    }

    try {
      setSubmitting(true);
      await axios.post(
        "http://127.0.0.1:8000/api/reviews",
        { course_id: Number(courseId), rating, comment },
        { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" } }
      );

      toast.success("Review submitted successfully!");
      setComment("");
      setRating(5);
      fetchReviews();
    } catch (error: any) {
      console.error(error);
      if (!error.response) {
        toast.error("Network error. Please try again.");
        return;
      }
      if (error.response.status === 422) {
        const errors = error.response.data.errors;
        let msg = "Validation Error: ";
        for (const key in errors) {
          msg += errors[key][0] + " ";
        }
        toast.error(msg.trim());
        return;
      }
      if (error.response.status === 401) {
        toast.error("Your session has expired. Please log in again.");
        return;
      }
      if (error.response.status === 403) {
        toast.error(error.response.data.message || "You are not authorized to review this course.");
      } else {
        toast.error("Something went wrong while submitting your review.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate Star breakdown
  const totalReviews = reviews.length;
  const starCounts = [0, 0, 0, 0, 0]; // 5-star to 1-star
  reviews.forEach((review) => {
    const star = Math.max(1, Math.min(5, Math.round(review.rating)));
    starCounts[5 - star]++;
  });

  return (
    <Card className="rounded-none border border-gray-200 bg-white">
      <CardContent className="p-6 md:p-8 space-y-8">
        
        {/* Dynamic Student Feedback Summary Section */}
        <div className="border-b border-gray-100 pb-8">
          <h3 className="text-xl font-extrabold text-gray-900 mb-6">Student Feedback</h3>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            
            {/* Left Big Star Block */}
            <div className="md:col-span-3 text-center space-y-2 flex flex-col items-center justify-center md:border-r border-gray-100 md:pr-8 py-2">
              <span className="text-6xl font-black text-amber-500">
                {averageRating ? averageRating.toFixed(1) : "0.0"}
              </span>
              <StarRating rating={averageRating || 0} size="md" />
              <span className="text-xs font-bold text-gray-500 tracking-wide uppercase mt-1">
                Course Rating
              </span>
            </div>

            {/* Right Progress Bars Block */}
            <div className="md:col-span-6 space-y-2.5">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = starCounts[5 - star];
                const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-4 text-xs font-medium text-gray-600">
                    <div className="w-12 text-right">
                      {star} {star === 1 ? "star" : "stars"}
                    </div>
                    <Progress value={pct} className="h-2 flex-1 bg-gray-100 [&>div]:bg-amber-400 rounded-none" />
                    <div className="w-10 text-right font-bold text-gray-900">
                      {pct.toFixed(0)}%
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CTA Review Button */}
            <div className="md:col-span-3 text-center md:pl-8 flex justify-center">
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="rounded-none bg-[#1c1d1f] hover:bg-gray-800 text-white font-bold h-11 px-6 text-sm flex items-center gap-2">
                    <FontAwesomeIcon icon={faPen} className="h-3 w-3" />
                    <span>Write a Review</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md rounded-none border border-gray-200 bg-white">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-gray-900">Write Your Review</DialogTitle>
                  </DialogHeader>

                  <div className="space-y-4 pt-3">
                    <div className="space-y-2">
                      <Label htmlFor="rating" className="text-sm font-bold text-gray-700">Rating</Label>
                      <div className="flex items-center gap-4">
                        <Input
                          id="rating"
                          type="number"
                          min={1}
                          max={5}
                          value={rating}
                          onChange={(e) =>
                            setRating(Math.max(1, Math.min(5, Number(e.target.value))))
                          }
                          className="w-20 rounded-none border-gray-300 focus:ring-black"
                        />
                        <StarRating rating={rating} size="md" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="comment" className="text-sm font-bold text-gray-700">Your Review</Label>
                      <Textarea
                        id="comment"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Tell other students what you liked or disliked about this course..."
                        rows={4}
                        className="resize-none rounded-none border-gray-300 focus:border-black"
                      />
                    </div>

                    <Button
                      className="w-full rounded-none bg-[#00aeef] hover:bg-[#009ad1] text-white font-bold h-11"
                      onClick={handleSubmit}
                      disabled={submitting}
                    >
                      {submitting ? "Submitting..." : "Submit Review"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-6">
          <h4 className="text-lg font-bold text-gray-900">Reviews ({reviews.length})</h4>
          
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-4 items-start pb-6 border-b border-gray-100">
                <Skeleton className="h-12 w-12 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-5/6" />
                </div>
              </div>
            ))
          ) : reviews.length === 0 ? (
            <div className="border border-dashed border-gray-200 p-8 text-center bg-gray-50">
              <FontAwesomeIcon icon={faStar} className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-gray-900 mb-1">No Reviews Yet</h3>
              <p className="text-sm text-gray-500 mb-4">Be the first to share your thoughts about this course!</p>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="rounded-none bg-[#00aeef] hover:bg-[#009ad1] text-white font-bold">
                    Write First Review
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="flex flex-col sm:flex-row gap-4 items-start py-6 first:pt-0 last:pb-0"
                >
                  <UserAvatar
                    name={review.user.name}
                    className="h-12 w-12 text-base shrink-0 shadow-sm"
                  />
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                      <div>
                        <span className="font-bold text-gray-900 text-base block">
                          {review.user.name}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <StarRating rating={review.rating} />
                          <span className="text-xs text-gray-400">
                            {new Date(review.created_at).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs font-bold text-gray-500 border-gray-200 rounded-none w-max">
                        Verified Student
                      </Badge>
                    </div>
                    <p className="text-[#1c1d1f] text-sm leading-relaxed">
                      {review.comment}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
