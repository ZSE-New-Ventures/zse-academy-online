import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebook, faTwitter, faLinkedin, faInstagram } from "@fortawesome/free-brands-svg-icons";
import ZSELogo from "@/assets/logo.png";

const footerLinks = {
  company: [
    { name: "About Us", href: "/about" },
    { name: "Contact", href: "/contact" },
  ],
  platforms: [
    { name: "ZSE Direct", href: "https://www.zsedirect.co.zw" },
    { name: "VFEX Direct", href: "https://www.vfexdirect.co.zw" },
    { name: "Data Direct", href: "https://datadirect.zse.co.zw" },
  ],
};

const socialLinks = [
  { name: "Facebook", icon: faFacebook, href: "https://www.facebook.com/Zimstockexchange", colorClass: "text-[#1877F2]" },
  { name: "LinkedIn", icon: faLinkedin, href: "https://www.linkedin.com/company/zimbabwestockexchange/", colorClass: "text-[#0A66C2]" },
  { name: "Instagram", icon: faInstagram, href: "https://www.instagram.com/zimstockexchange/", colorClass: "text-[#E1306C]" },
];

export const Footer = () => {
  return (
    <footer className="bg-[#08101f] text-gray-300 font-montserrat">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10">
          {/* Brand / About */}
          <div className="lg:col-span-2">
            <Link to="/" className="inline-flex items-center space-x-2 mb-5">
              <img
                src={ZSELogo}
                alt="Zimbabwe Stock Exchange"
                className="h-10 w-auto brightness-110"
              />
            </Link>
            <p className="text-gray-400 mb-6 leading-relaxed max-w-md">
              ZSE Training offers professional development courses tailored for
              Zimbabwe’s financial markets. Learn from experts and earn
              certifications recognized locally and regionally.
            </p>
          </div>

          {/* Links Sections */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-lg font-semibold mb-4 text-white capitalize">
                {title}
              </h3>
              <ul className="space-y-2 text-sm">
                {links.map((link) => (
                  <li key={link.name}>
                    {link.href.startsWith("http") ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-white transition-colors"
                      >
                        {link.name}
                      </a>
                    ) : (
                      <Link
                        to={link.href}
                        className="hover:text-white transition-colors"
                      >
                        {link.name}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact / Address */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-semibold mb-4 text-white capitalize">
              Contact
            </h3>
            <div className="text-gray-400 space-y-3 text-sm">
              <p>
                <strong className="text-white font-medium block mb-1">Address:</strong> 
                44 Ridgeway North, Highlands, Harare, Zimbabwe
              </p>
              <p>
                <strong className="text-white font-medium block mb-1">Phone:</strong> 
                +263 242 886830-5<br />
                +263 8677009115
              </p>
              <p>
                <strong className="text-white font-medium block mb-1">Trading Hours:</strong> 
                Mon - Fri: 09:00 AM - 1:00 PM CAT
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0 text-center md:text-left">
              © {new Date().getFullYear()} Zimbabwe Stock Exchange Training. All
              rights reserved.
            </div>
            <div className="flex space-x-6">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${social.colorClass} hover:scale-110 hover:brightness-125 transition-all duration-200`}
                  aria-label={social.name}
                >
                  <FontAwesomeIcon icon={social.icon} className="h-6 w-6" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
