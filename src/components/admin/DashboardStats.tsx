import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { faArrowUp, faArrowDown } from "@fortawesome/free-solid-svg-icons";

interface StatCardProps {
  title: string;
  value: number;
  growth: number;
  icon: IconDefinition;
  color?: "blue" | "green" | "purple" | "orange";
}

export const StatCard = ({
  title,
  value,
  growth,
  icon,
  color = "blue",
}: StatCardProps) => {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    purple: "from-purple-500 to-purple-600",
    orange: "from-orange-500 to-orange-600",
  };

  const displayValue = value.toLocaleString();

  return (
    <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-0">
      <div
        className={`absolute inset-0 bg-gradient-to-br ${colorClasses[color]} opacity-5 group-hover:opacity-10 transition-opacity`}
      />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-sm font-semibold text-gray-600">
          {title}
        </CardTitle>
        <div
          className={`p-2 rounded-lg bg-gradient-to-br ${colorClasses[color]}`}
        >
          <FontAwesomeIcon icon={icon} className="h-4 w-4 text-white" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-3xl font-bold text-gray-900">{displayValue}</div>
          <div
            className={`flex items-center text-sm font-medium ${
              growth >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            <FontAwesomeIcon
              icon={growth >= 0 ? faArrowUp : faArrowDown}
              className="h-3 w-3 mr-1"
            />
            {Math.abs(growth)}% {growth >= 0 ? "growth" : "decline"} this month
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface ProgressCircleProps {
  value: number;
  max: number;
  color?: string;
  label: string;
}

export const ProgressCircle = ({
  value,
  max,
  color = "text-blue-500",
  label,
}: ProgressCircleProps) => {
  const percentage = (value / max) * 100;
  const circumference = 2 * Math.PI * 45;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center space-y-3">
      <div className="relative w-24 h-24">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-gray-200"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className={`${color} transition-all duration-1000`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold">{Math.round(percentage)}%</span>
        </div>
      </div>
      <span className="text-sm font-medium text-gray-600 text-center">
        {label}
      </span>
    </div>
  );
};
