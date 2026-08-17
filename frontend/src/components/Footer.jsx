import { Link } from 'react-router-dom';
import { Car, Phone, Mail, MapPin, Globe } from 'lucide-react';

const SOCIAL_LABELS = ['FB', 'X', 'IG', 'IN'];

const Footer = () => (
  <footer className="bg-gray-900 text-gray-300">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
              <Car className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-lg">RideRental</span>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed mb-5">
            Your trusted transport rental partner. Economy to luxury, bikes to trucks — book in seconds and ride with confidence.
          </p>
          <div className="flex gap-3">
            {SOCIAL_LABELS.map((label) => (
              <a key={label} href="#" className="w-9 h-9 bg-gray-800 hover:bg-primary-600 rounded-lg flex items-center justify-center transition-colors text-xs font-bold text-gray-300">
                {label}
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-white font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-2.5 text-sm">
            {[['Home', '/'], ['Browse Vehicles', '/vehicles'], ['My Bookings', '/dashboard/bookings'], ['Dashboard', '/dashboard']].map(([label, to]) => (
              <li key={to}>
                <Link to={to} className="hover:text-primary-400 transition-colors">{label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Vehicle Types */}
        <div>
          <h4 className="text-white font-semibold mb-4">Vehicle Types</h4>
          <ul className="space-y-2.5 text-sm">
            {['Economy Cars', 'Premium Sedans', 'Luxury Vehicles', 'SUVs & MUVs', 'Commercial Trucks', 'Mini Buses'].map(v => (
              <li key={v}>
                <Link to="/vehicles" className="hover:text-primary-400 transition-colors">{v}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-white font-semibold mb-4">Contact Us</h4>
          <ul className="space-y-3 text-sm">
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
          <div className="mt-5 p-3 bg-gray-800 rounded-lg text-sm">
            <p className="text-white font-medium">24/7 Support</p>
            <p className="text-gray-400 text-xs mt-0.5">We're always here to help</p>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
        <p>© {new Date().getFullYear()} RideRental. All rights reserved.</p>
        <div className="flex gap-4">
          <a href="#" className="hover:text-gray-300 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-gray-300 transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-gray-300 transition-colors">Cookie Policy</a>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
