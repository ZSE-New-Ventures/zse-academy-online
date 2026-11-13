import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebook, faTwitter, faLinkedin, faInstagram } from "@fortawesome/free-brands-svg-icons";
import ZSELogo from "@/assets/logo.png";

const footerSections = [
  {
    title: "Quick Links",
    span: "lg:col-span-3",
    links: [
      { name: "All Courses", href: "/courses" },
      { name: "Video Tutorials", href: "/tutorials" },
      { name: "Live Events & Webinars", href: "/events" },
      { name: "Market Insights & Blog", href: "/blog" },
      { name: "Verify Certificate", href: "/verify" },
      { name: "Frequently Asked Questions", href: "/faq" },
    ],
  },
  {
    title: "Company & Legal",
    span: "lg:col-span-2",
    links: [
      { name: "Contact Us", href: "/contact" },
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
    ],
  },
  {
    title: "Ecosystem Platforms",
    span: "lg:col-span-2",
    links: [
      { name: "ZSE Direct", href: "https://zsedirect.co.zw/" },
      { name: "VFEX Direct", href: "https://www.vfexdirect.co.zw" },
      { name: "Data Direct", href: "https://datadirect.zse.co.zw" },
      { name: "InvoiceX", href: "https://invoicex.zeex.co.zw/" },
      { name: "ZEEX", href: "https://zeex.co.zw" },
    ],
  },
];

const socialLinks = [
  { name: "Facebook", icon: faFacebook, href: "https://www.facebook.com/Zimstockexchange", colorClass: "text-[#1877F2]" },
  { name: "LinkedIn", icon: faLinkedin, href: "https://www.linkedin.com/company/zimbabwestockexchange/", colorClass: "text-[#0A66C2]" },
  { name: "Instagram", icon: faInstagram, href: "https://www.instagram.com/zimstockexchange/", colorClass: "text-[#E1306C]" },
];

export const Footer = () => {
  return (
    <footer className="bg-[#0a0f1a] text-slate-300 font-montserrat border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8">
          <div className="lg:col-span-3 pr-4">
            <Link to="/" className="inline-flex items-center bg-white px-3 py-2 rounded-lg shadow-sm mb-6 hover:bg-slate-100 transition-colors">
              <img
                src={ZSELogo}
                alt="Zimbabwe Stock Exchange Training Institute"
                className="h-8 w-auto"
              />
            </Link>
            <p className="text-sm leading-relaxed max-w-sm text-slate-300">
              Professional development courses tailored for Zimbabwe's financial markets. Learn from experts and earn recognized certifications.
            </p>
          </div>

          {/* Links Sections */}
          {footerSections.map((section) => (
            <div key={section.title} className={section.span}>
              <h3 className="text-xs font-bold mb-5 text-white uppercase tracking-wider">
                {section.title}
              </h3>
              <ul className="space-y-3 text-sm">
                {section.links.map((link) => (
                  <li key={link.name}>
                    {link.href.startsWith("http") ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-300 hover:text-[#00aeef] transition-colors"
                      >
                        {link.name}
                      </a>
                    ) : (
                      <Link
                        to={link.href}
                        className="text-slate-300 hover:text-[#00aeef] transition-colors"
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
            <h3 className="text-xs font-bold mb-5 text-white uppercase tracking-wider">
              Contact
            </h3>
            <div className="space-y-4 text-sm text-slate-300">
              <p className="break-words leading-relaxed max-w-[250px]">
                44 Ridgeway North, Highlands<br />
                Harare, Zimbabwe
              </p>
              <p className="leading-relaxed">
                +263 242 886830-5<br />
                +263 8677009115
              </p>
              <p>
                <a href="mailto:info@zse.co.zw" className="text-slate-300 hover:text-[#00aeef] transition-colors">
                  info@zse.co.zw
                </a>
              </p>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-800 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-xs text-slate-400">
            © {new Date().getFullYear()} ZSE Training Institute. All rights reserved.
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex space-x-5">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-[#00aeef] hover:scale-110 transition-all duration-300"
                  aria-label={social.name}
                >
                  <FontAwesomeIcon icon={social.icon} className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
