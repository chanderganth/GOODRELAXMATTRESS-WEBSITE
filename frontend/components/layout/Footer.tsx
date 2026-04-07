import Link from 'next/link';
import { Moon, Phone, Mail, MapPin, Instagram, Facebook, Youtube } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#1a1a2e] text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-[#e8b85d] rounded-lg flex items-center justify-center">
                <Moon className="w-5 h-5 text-[#1a1a2e]" strokeWidth={2.5} />
              </div>
              <div>
                <span className="text-white font-display font-bold text-lg leading-tight block">GoodRelax</span>
                <span className="text-[#e8b85d] text-[10px] font-medium tracking-widest uppercase">Mattress</span>
              </div>
            </Link>
            <p className="text-sm leading-relaxed text-gray-400">
              Crafting premium custom mattresses since 2010. Your perfect sleep starts with the perfect mattress.
            </p>
            <div className="flex gap-3 mt-5">
              {[Instagram, Facebook, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 bg-white/10 hover:bg-[#e8b85d] hover:text-[#1a1a2e] rounded-lg flex items-center justify-center text-gray-300 transition-colors">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Products */}
          <div>
            <h4 className="text-white font-semibold mb-4">Products</h4>
            <ul className="space-y-2.5 text-sm">
              {['28D Rare Mattress', '32D Epic Mattress', '40D Legendary Mattress', 'Custom Builder', 'Mattress Recommender'].map(item => (
                <li key={item}><Link href="/products" className="hover:text-[#e8b85d] transition-colors">{item}</Link></li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                { label: 'About Us', href: '#' },
                { label: 'Track Order', href: '/orders' },
                { label: 'Warranty Policy', href: '#' },
                { label: 'Return Policy', href: '#' },
                { label: 'Admin Panel', href: '/admin' },
              ].map(item => (
                <li key={item.label}><Link href={item.href} className="hover:text-[#e8b85d] transition-colors">{item.label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-[#e8b85d] mt-0.5 shrink-0" />
                <span>+91 99999 99999</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-[#e8b85d] mt-0.5 shrink-0" />
                <span>info@goodrelaxmattress.com</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#e8b85d] mt-0.5 shrink-0" />
                <span>123 Comfort Street, Bengaluru, Karnataka 560001, India</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} GoodRelax Mattress. All rights reserved.</p>
          <p>Made with ♥ in India</p>
        </div>
      </div>
    </footer>
  );
}
