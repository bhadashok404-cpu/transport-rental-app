import { Link } from 'react-router-dom';
import { Car, Phone, Mail, MapPin } from 'lucide-react';

const SOCIAL = ['FB', 'X', 'IG', 'IN'];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-gray-950 text-gray-400">
      {/* Top gradient band */}
      <div className="h-1 gradient-brand w-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center shadow-lg">
                <Car className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-white font-black text-lg">RideRental</span>
                <span className="block text-[9px] font-bold uppercase tracking-widest text-primary-400">Premium Transport</span>
              </div>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">
              Your trusted transport partner. Economy to luxury, bikes to trucks — book in seconds and ride with confidence.
            </p>
            <div className="flex gap-2">
              {SOCIAL.map(s => (
                <a key={s} href="#"
                  className="w-9 h-9 rounded-xl bg-gray-800 hover:bg-primary-600 flex items-center justify-center text-[11px] font-black text-gray-400 hover:text-white transition-all duration-200">
                  {s}
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-white font-black text-sm uppercase tracking-wider mb-5">Quick Links</h4>
            <ul className="space-y-3 text-sm">
              {[['Home', '/'], ['Browse Vehicles', '/vehicles'], ['My Bookings', '/dashboard/bookings'], ['Dashboard', '/dashboard']].map(([l, to]) => (
                <li key={to}>
                  <Link to={to} className="hover:text-primary-400 transition-colors font-medium">{l}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Vehicle types */}
          <div>
            <h4 className="text-white font-black text-sm uppercase tracking-wider mb-5">Vehicle Types</h4>
            <ul className="space-y-3 text-sm">
              {['Economy Cars', 'Premium Sedans', 'Luxury SUVs', 'Commercial Trucks', 'Mini Buses', 'Tempo Vans'].map(v => (
                <li key={v}>
                  <Link to="/vehicles" className="hover:text-primary-400 transition-colors font-medium">{v}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-black text-sm uppercase tracking-wider mb-5">Contact</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-primary-400 mt-0.5 shrink-0" />
                <span>123 MG Road, Bangalore, Karnataka 560001</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-primary-400 shrink-0" />
                <a href="tel:+919876543210" className="hover:text-primary-400 transition-colors">+91 98765 43210</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-primary-400 shrink-0" />
                <a href="mailto:support@riderental.in" className="hover:text-primary-400 transition-colors">support@riderental.in</a>
              </li>
            </ul>
            <div className="mt-5 p-3 bg-gray-900 border border-gray-800 rounded-xl text-xs">
              <p className="text-white font-bold">24/7 Support</p>
              <p className="text-gray-500 mt-0.5">Always here to help you</p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600">
          <p>© {new Date().getFullYear()} RideRental. All rights reserved.</p>
          <div className="flex gap-6">
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(t => (
              <a key={t} href="#" className="hover:text-gray-300 transition-colors">{t}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
