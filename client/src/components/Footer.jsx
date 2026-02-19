import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, MapPin, Phone, Mail } from 'lucide-react';


const Footer = () => {
    return (
        <footer className="bg-gray-900 text-gray-300 pt-16 pb-8 font-sans">
            <div className="container mx-auto px-6">
                <div className="grid md:grid-cols-4 gap-12 mb-16">

                    {/* Column 1: Brand / Address */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2">
                            <img src="/logo-light-text.png" alt="VahanPe" className="h-10 w-auto" />
                        </div>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            Bringing Order, Transparency, and Scale to India's Mobility Economy
                        </p>
                        <div className="flex gap-4">
                            {[
                                { Icon: Facebook, link: "https://www.facebook.com" },
                                { Icon: Twitter, link: "https://x.com" },
                                { Icon: Instagram, link: "https://www.instagram.com" },
                                { Icon: Linkedin, link: "https://www.linkedin.com" }
                            ].map((item, i) => (
                                <a key={i} href={item.link} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                                    <item.Icon className="w-5 h-5" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Column 2: Services */}
                    <div>
                        <h3 className="font-bold text-white text-lg mb-6">Services</h3>
                        <ul className="space-y-3 text-sm">
                            {/* Internal Links for what we have, external/dummy for others */}
                            <li><a href="#" className="hover:text-primary transition-colors">OEMs & Dealerships</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Fleets & Rentals</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Pre-Owned Dealers</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Private Owners</a></li>
                            <li><Link to="/vehicle-services" className="hover:text-primary transition-colors">All Services</Link></li>
                        </ul>
                    </div>

                    {/* Column 3: Company */}
                    <div>
                        <h3 className="font-bold text-white text-lg mb-6">Company</h3>
                        <ul className="space-y-3 text-sm">
                            <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Why VahanPe</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Pricing</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
                        </ul>
                    </div>

                    {/* Column 4: Legal */}
                    <div>
                        <h3 className="font-bold text-white text-lg mb-6">Legal</h3>
                        <ul className="space-y-3 text-sm">
                            <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Cookie Policy</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Refund Policy</a></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
                    <p>© {new Date().getFullYear()} VahanPe. All rights reserved.</p>
                    <p className="mt-2 md:mt-0 flex items-center gap-1">Made with <span className="text-red-500">❤️</span> in India</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
