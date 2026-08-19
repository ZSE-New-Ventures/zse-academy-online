import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebook, faTwitter, faLinkedin, faInstagram } from "@fortawesome/free-brands-svg-icons";
import ZSELogo from "@/assets/logo.png";

const footerLinks = {
  company: [
    { name: "About Us", href: "/about" },
    { name: "Contact", href: "/contact" },
    { name: "Live Events", href: "/events" },
    { name: "FAQs", href: "/faq" },
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
  ],
  platforms: [
    { name: "ZSE Direct", href: "https://www.zsedirect.co.zw" },
    { name: "VFEX Direct", href: "https://www.vfexdirect.co.zw" },
    { name: "Data Direct", href: "https://datadirect.zse.co.zw" },
    { name: "InvoiceX", href: "https://invoicex.zeex.co.zw/" },
    { name: "ZEEX", href: "https://zeex.co.zw" },
  ],
};

const socialLinks = [
  { name: "Facebook", icon: faFacebook, href: "https://www.facebook.com/Zimstockexchange", colorClass: "text-[#1877F2]" },
  { name: "LinkedIn", icon: faLinkedin, href: "https://www.linkedin.com/company/zimbabwestockexchange/", colorClass: "text-[#0A66C2]" },
  { name: "Instagram", icon: faInstagram, href: "https://www.instagram.com/zimstockexchange/", colorClass: "text-[#E1306C]" },
];

export const Footer = () => {
  return (
    <footer className="bg-[#0a0f1a] text-slate-400 font-montserrat border-t border-slate-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8">
          <div className="lg:col-span-4 pr-4">
            <Link to="/" className="inline-block mb-6 opacity-90 hover:opacity-100 transition-opacity">
              <img
                src={ZSELogo}
                alt="Zimbabwe Stock Exchange"
                className="h-9 w-auto"
              />
            </Link>
            <p className="text-sm leading-relaxed max-w-sm text-slate-400">
              Professional development courses tailored for Zimbabwe’s financial markets. Learn from experts and earn recognized certifications.
            </p>
          </div>

          {/* Links Sections */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title} className="lg:col-span-3">
              <h3 className="text-xs font-semibold mb-5 text-slate-200 uppercase tracking-wider">
                {title}
              </h3>
              <ul className="space-y-3 text-sm">
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
            <h3 className="text-xs font-semibold mb-5 text-slate-200 uppercase tracking-wider">
              Contact
            </h3>
            <div className="space-y-4 text-sm text-slate-400">
              <p className="break-words leading-relaxed max-w-[250px]">
                44 Ridgeway North, Highlands<br />
                Harare, Zimbabwe
              </p>
              <p className="leading-relaxed">
                +263 242 886830-5<br />
                +263 8677009115
              </p>
              <p>
                <a href="mailto:info@zse.co.zw" className="hover:text-white transition-colors">info@zse.co.zw</a>
              </p>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-800/50 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-xs text-slate-500">
            © {new Date().getFullYear()} ZSE Training. All rights reserved.
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex space-x-5">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-500 hover:text-white hover:scale-110 transition-all duration-300"
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
