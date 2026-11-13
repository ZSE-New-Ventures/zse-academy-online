import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faBook,
  faChartLine,
  faRightFromBracket,
  faHome,
  faQuestionCircle,
  faXmark,
  faCog,
  faBookAtlas,
  faChevronDown,
  faTags,
  faCertificate,
  faUserTie,
} from "@fortawesome/free-solid-svg-icons";
import logo from "@/assets/logo.png";

interface AdminSidebarProps {
  sidebarCollapsed: boolean;
  mobileSidebarOpen: boolean;
  activeSection: string;
  activeConfigSubSection: string;
  activeQuizSubSection: string;
  onSectionChange: (section: string) => void;
  onConfigSubSectionChange: (subSection: string) => void;
  onQuizSubSectionChange: (subSection: string) => void;
  onLogout: () => void;
  onCloseMobile: () => void;
}

const sidebarItems = [
  { icon: faHome, label: "Dashboard", key: "dashboard" },
  { icon: faBook, label: "Courses", key: "courses" },
  { icon: faUsers, label: "Students", key: "users" },
  { icon: faUsers, label: "Cohorts & Groups", key: "groups" },
  { icon: faBookAtlas, label: "Blog", key: "Blog" },
  { icon: faQuestionCircle, label: "Quizzes", key: "quizzes" },
  { icon: faChartLine, label: "Analytics", key: "analytics" },
];

const configSubItems = [
  { icon: faTags, label: "Categories", key: "categories" },
  { icon: faCertificate, label: "Certifications", key: "certifications" },
  { icon: faUserTie, label: "Instructors", key: "instructors" },
];

const quizSubItems = [
  { icon: faBook, label: "Add Quiz", key: "addQuiz" },
  { icon: faChartLine, label: "View Quizzes", key: "viewQuizzes" },
];

export const AdminSidebar = ({
  sidebarCollapsed,
  mobileSidebarOpen,
  activeSection,
  activeConfigSubSection,
  activeQuizSubSection,
  onSectionChange,
  onConfigSubSectionChange,
  onQuizSubSectionChange,
  onLogout,
  onCloseMobile,
}: AdminSidebarProps) => {
  return (
    <div
      className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 z-40 transition-all duration-300 ${
        sidebarCollapsed ? "w-16" : "w-64"
      } ${
        mobileSidebarOpen
          ? "translate-x-0"
          : "-translate-x-full lg:translate-x-0"
      }`}
    >
      <div className="p-4 h-full flex flex-col">
        {/* Desktop Logo */}
        <div className="hidden lg:flex items-center space-x-3 mb-8">
          <img
            src={logo}
            alt="ZSE Logo"
            className={`object-contain transition-all duration-300 ${
              sidebarCollapsed ? "h-12 w-12" : "h-14 w-14"
            }`}
          />
          {!sidebarCollapsed && (
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 leading-tight">
                Admin Panel
              </span>
            </div>
          )}
        </div>

        {/* Mobile Header in Sidebar */}
        <div className="lg:hidden flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <img
              src={logo}
              alt="ZSE Logo"
              className="h-12 w-12 object-contain"
            />
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 leading-tight">
                Admin Panel
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCloseMobile}
            className="p-2"
          >
            <FontAwesomeIcon
              icon={faXmark}
              className="h-5 w-5 text-gray-700"
            />
          </Button>
        </div>

        <nav className="space-y-2 flex-1">
          {sidebarItems.map((item) =>
            item.key !== "quizzes" ? (
              <button
                key={item.key}
                onClick={() => onSectionChange(item.key)}
                className={`w-full flex items-center space-x-3 px-2 py-3 rounded-lg transition-all duration-200 ${
                  activeSection === item.key
                    ? "bg-blue-500 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <FontAwesomeIcon
                  icon={item.icon}
                  className="h-5 w-5 flex-shrink-0"
                />
                {(!sidebarCollapsed || mobileSidebarOpen) && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
              </button>
            ) : (
              <DropdownMenu key="quizzes">
                <DropdownMenuTrigger asChild>
                  <button
                    className={`w-full flex items-center justify-between space-x-3 px-2 py-3 rounded-lg transition-all duration-200 ${
                      activeSection === "quizzes"
                        ? "bg-blue-500 text-white shadow-md"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <FontAwesomeIcon
                        icon={faQuestionCircle}
                        className="h-5 w-5 flex-shrink-0"
                      />
                      {(!sidebarCollapsed || mobileSidebarOpen) && (
                        <span className="text-sm font-medium">Quizzes</span>
                      )}
                    </div>
                    {(!sidebarCollapsed || mobileSidebarOpen) && (
                      <FontAwesomeIcon
                        icon={faChevronDown}
                        className="h-3 w-3 flex-shrink-0"
                      />
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 ml-2 shadow-xl border border-gray-200">
                  {quizSubItems.map((sub) => (
                    <DropdownMenuItem
                      key={sub.key}
                      onClick={() => onQuizSubSectionChange(sub.key)}
                      className={`flex items-center space-x-3 cursor-pointer ${
                        activeQuizSubSection === sub.key ? "bg-gray-100" : ""
                      }`}
                    >
                      <FontAwesomeIcon
                        icon={sub.icon}
                        className="h-4 w-4 text-gray-500"
                      />
                      <span className="text-gray-700">{sub.label}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )
          )}

          {/* Configuration Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={`w-full flex items-center justify-between space-x-3 px-2 py-3 rounded-lg transition-all duration-200 ${
                  activeSection === "config"
                    ? "bg-blue-500 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <FontAwesomeIcon
                    icon={faCog}
                    className="h-5 w-5 flex-shrink-0"
                  />
                  {(!sidebarCollapsed || mobileSidebarOpen) && (
                    <span className="text-sm font-medium">Configurations</span>
                  )}
                </div>
                {(!sidebarCollapsed || mobileSidebarOpen) && (
                  <FontAwesomeIcon
                    icon={faChevronDown}
                    className="h-3 w-3 flex-shrink-0"
                  />
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 ml-2 shadow-xl border border-gray-200">
              {configSubItems.map((item) => (
                <DropdownMenuItem
                  key={item.key}
                  onClick={() => onConfigSubSectionChange(item.key)}
                  className={`flex items-center space-x-3 cursor-pointer ${
                    activeConfigSubSection === item.key ? "bg-gray-100" : ""
                  }`}
                >
                  <FontAwesomeIcon
                    icon={item.icon}
                    className="h-4 w-4 text-gray-500"
                  />
                  <span className="text-gray-700">{item.label}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        <div className="mt-auto pt-4 border-t border-gray-200">
          <button
            onClick={onLogout}
            className="w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
          >
            <FontAwesomeIcon
              icon={faRightFromBracket}
              className="h-5 w-5 flex-shrink-0"
            />
            {(!sidebarCollapsed || mobileSidebarOpen) && (
              <span className="text-sm font-medium">Logout</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export { sidebarItems, configSubItems, quizSubItems };
