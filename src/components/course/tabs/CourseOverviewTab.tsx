import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
} from "@fortawesome/free-solid-svg-icons";

interface CourseOverviewTabProps {
  totalLessons: number;
  modulesCount: number;
  description?: string;
}

export const CourseOverviewTab = ({
  description,
}: CourseOverviewTabProps) => {
  const learningObjectives = [
    "Master key concepts and practical skills in trading",
    "Learn from industry experts with years of ZSE experience",
    "Hands-on projects and real-world market applications",
    "Build a strong foundation in Zimbabwean financial markets",
    "Access to exclusive ZSE Academy community resources"
  ];

  return (
    <div className="space-y-12">
      {/* What you'll learn section */}
      <div className="border border-gray-200 p-6 md:p-8 rounded-none">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">What you'll learn</h2>
        <div className="grid md:grid-cols-2 gap-x-8 gap-y-4">
          {learningObjectives.map((objective, index) => (
            <div key={index} className="flex gap-4">
              <FontAwesomeIcon icon={faCheck} className="h-3.5 w-3.5 mt-1 text-gray-600 shrink-0" />
              <span className="text-sm text-gray-700">{objective}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Requirements Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Requirements</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li className="text-sm text-gray-700">Basic understanding of the stock market (helpful but not required)</li>
          <li className="text-sm text-gray-700">Access to a computer or smartphone with internet connection</li>
          <li className="text-sm text-gray-700">A willingness to learn and apply technical analysis concepts</li>
        </ul>
      </div>

      {/* Description Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Description</h2>
        <div className="text-sm text-gray-700 leading-relaxed space-y-4">
          {description ? (
            <p className="whitespace-pre-wrap">{description}</p>
          ) : (
            <>
              <p>
                This comprehensive course is designed for anyone looking to master the Zimbabwe Stock Exchange.
                Whether you are a complete beginner or an experienced trader, our structured curriculum will guide you
                through the complexities of market analysis, risk management, and strategic trading.
              </p>
              <p>
                You'll gain access to over {10} hours of high-quality video content, downloadable resources,
                and a community of like-minded investors. By the end of this course, you'll have the confidence
                to make informed investment decisions and build a profitable portfolio.
              </p>
            </>
          )}
        </div>
      </div>


    </div>
  );
};
