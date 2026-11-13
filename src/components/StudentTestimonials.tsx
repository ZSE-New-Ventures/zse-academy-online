import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStar,
  faQuoteLeft,
  faCircleCheck,
  faUsers,
  faGraduationCap,
  faCertificate,
} from "@fortawesome/free-solid-svg-icons";
import { API_BASE_URL } from "@/constants/api";

interface Testimonial {
  id: number;
  student_name: string;
  course_title: string;
  rating: number;
  comment: string;
  created_at: string;
}

const FALLBACK_TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    student_name: "Clever Chiutsi",
    course_title: "Investment 101",
    rating: 5,
    comment: "I have completed my Investment 101 course and am excited to have deep knowledge about what happens, how and why we invest at ZSE. Truly empowering for local investors.",
    created_at: "2024-03-15",
  },
  {
    id: 2,
    student_name: "Khanyiso T. Muleya",
    course_title: "Investment 101",
    rating: 5,
    comment: "Personally I did not understand how the stock exchange operated. Well done ZSE! The lessons are so brief, clear, and quite understandable for anyone.",
    created_at: "2024-04-21",
  },
  {
    id: 3,
    student_name: "Angeline Karonga",
    course_title: "Investment 101",
    rating: 5,
    comment: "Exceptional course for non-financial people who want to understand financial markets and take control of their wealth building.",
    created_at: "2023-11-12",
  },
  {
    id: 4,
    student_name: "Tinashe Nyakurerwa",
    course_title: "Investment 101",
    rating: 5,
    comment: "This lesson is amazing. Thank you ZSE for the opportunity to study the stock market online with high quality digital content. I really appreciate it.",
    created_at: "2023-09-08",
  },
  {
    id: 5,
    student_name: "Enough Gotore",
    course_title: "Financial Literacy Quiz & Investment",
    rating: 5,
    comment: "What an eye opener! This is commendable work from the national exchange. The interactive word scrambles and quizzes made learning addictive.",
    created_at: "2024-12-20",
  },
  {
    id: 6,
    student_name: "Lawrence Nyabadza",
    course_title: "Investment 101",
    rating: 5,
    comment: "Great course, very insightful. The step-by-step breakdown of share trading and market participants gave me complete clarity.",
    created_at: "2024-05-24",
  },
];

export const StudentTestimonials: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(FALLBACK_TESTIMONIALS);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/public/reviews/featured`);
        if (res.ok) {
          const json = await res.json();
          if (json.data && json.data.length > 0) {
            const mapped = json.data.map((item: { id: number; user?: { name?: string }; course?: { title?: string }; rating?: number; comment: string; created_at: string }) => ({
              id: item.id,
              student_name: item.user?.name || "ZSE Training Institute Student",
              course_title: item.course?.title || "Investment Course",
              rating: item.rating || 5,
              comment: item.comment,
              created_at: item.created_at,
            }));
            setTestimonials(mapped);
          }
        }
      } catch (e) {
        // Fallback to static authentic testimonials
      }
    };
    fetchReviews();
  }, []);

  return (
    <section className="py-20 bg-slate-900 text-white font-montserrat relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#00aeef]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00aeef]/10 text-[#00aeef] text-xs font-bold uppercase tracking-wider mb-4 border border-[#00aeef]/20">
            <FontAwesomeIcon icon={faUsers} />
            <span>Student Success & Social Proof</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Trusted by Thousands of Zimbabwean Investors
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300">
            Read authentic reviews from students who learned the capital markets and started trading through ZSE Training Institute.
          </p>

          {/* Aggregate Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-slate-800">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-black text-white">4.8 / 5.0</div>
              <div className="flex justify-center gap-1 text-amber-400 text-xs my-1">
                {[...Array(5)].map((_, i) => (
                  <FontAwesomeIcon key={i} icon={faStar} />
                ))}
              </div>
              <p className="text-xs text-slate-400">Average Student Rating</p>
            </div>

            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-black text-[#00aeef]">10,000+</div>
              <p className="text-xs text-slate-400 mt-2">Enrolled Learners</p>
            </div>

            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-black text-emerald-400">98%</div>
              <p className="text-xs text-slate-400 mt-2">Course Completion Rate</p>
            </div>

            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-black text-sky-400">100% Free</div>
              <p className="text-xs text-slate-400 mt-2">Public Investor Access</p>
            </div>
          </div>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.slice(0, 6).map((item) => (
            <div
              key={item.id}
              className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-6 border border-slate-700/80 flex flex-col justify-between hover:border-[#00aeef]/60 hover:shadow-xl hover:shadow-[#00aeef]/5 transition-all duration-300"
            >
              <div>
                {/* Rating & Quote Icon */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex gap-1 text-amber-400 text-xs">
                    {[...Array(item.rating || 5)].map((_, i) => (
                      <FontAwesomeIcon key={i} icon={faStar} />
                    ))}
                  </div>
                  <FontAwesomeIcon icon={faQuoteLeft} className="text-slate-600 text-lg" />
                </div>

                {/* Comment */}
                <p className="text-slate-200 text-sm leading-relaxed mb-6 italic">
                  "{item.comment}"
                </p>
              </div>

              {/* Student Footer */}
              <div className="pt-4 border-t border-slate-700/60 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-white">{item.student_name}</span>
                    <FontAwesomeIcon icon={faCircleCheck} className="text-[#00aeef] text-xs" />
                  </div>
                  <p className="text-xs text-[#00aeef] mt-0.5 font-medium line-clamp-1">
                    {item.course_title}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-[#00aeef]/20 border border-[#00aeef]/40 flex items-center justify-center text-[#00aeef] text-xs font-bold shrink-0">
                  {item.student_name.charAt(0)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

