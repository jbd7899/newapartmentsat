import { Link } from "wouter";
import { useBranding } from "@/hooks/useBranding";

export default function Footer() {
  const { data: branding } = useBranding();
  const contactItems = branding?.contactInfo
    ? branding.contactInfo.split("\n").filter(Boolean)
    : [
        "Atlanta Office (404) 555-0123",
        "Dallas Office (214) 555-0123",
        "hello@urbanliving.com",
      ];
  return (
    <footer className="bg-neutral text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="text-2xl font-bold mb-4">{branding?.companyName || "UrbanLiving"}</div>
            <p className="text-gray-300 mb-6 max-w-md">
              {branding?.footerText || "Locally owned and managed rental properties."}
            </p>
            
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/"><span className="text-gray-300 hover:text-white transition-colors cursor-pointer">Properties</span></Link></li>
              <li><a href="#contact" className="text-gray-300 hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
            <ul className="space-y-2 text-gray-300">
              {contactItems.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-600 mt-8 pt-8 text-center text-gray-300">
          <p>
            &copy; 2024 {branding?.companyName || "UrbanLiving"}. All rights reserved. |
            <a href="#privacy" className="hover:text-white transition-colors">Privacy Policy</a> |
            <a href="#terms" className="hover:text-white transition-colors">Terms of Service</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
