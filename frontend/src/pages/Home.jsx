import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, MapPin, Car, Shield, Clock, Star,
  ArrowRight, CheckCircle, Truck, Users, Award, Zap
} from 'lucide-react';
import { vehicleCategoryService } from '../services';
import { Loader } from '../components';

const STATS = [
  { value: '50,000+', label: 'Happy Customers', icon: Users },
  { value: '1,200+', label: 'Vehicles Available', icon: Car },
  { value: '99.2%', label: 'On-Time Rate', icon: Clock },
  { value: '4.8★', label: 'Average Rating', icon: Award },
];

const FEATURES = [
  { icon: Shield, title: 'Safe & Insured', desc: 'All vehicles are fully insured and regularly inspected for your safety.' },
  { icon: Zap, title: 'Instant Booking', desc: 'Book your ride in under 60 seconds. Confirmation right to your inbox.' },
  { icon: Clock, title: '24/7 Support', desc: 'Our support team is available around the clock to assist you.' },
  { icon: Star, title: 'Top-Rated Drivers', desc: 'All drivers are background-verified with an average rating of 4.7+.' },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Choose Your Vehicle', desc: 'Browse economy, premium, SUV, or commercial vehicles by category.' },
  { step: '02', title: 'Pick Dates & Location', desc: 'Select pickup/drop location and travel dates to get an instant quote.' },
  { step: '03', title: 'Confirm & Pay', desc: 'Secure checkout with multiple payment options including UPI and cards.' },
  { step: '04', title: 'Enjoy Your Ride', desc: 'Your driver arrives on time. Rate your experience after the trip.' },
];

const TESTIMONIALS = [
  { name: 'Rahul Sharma', city: 'Bangalore', rating: 5, text: 'Booked a premium sedan for a corporate trip. Driver was punctual and the car was immaculate. Will use again!' },
  { name: 'Priya Patel', city: 'Mumbai', rating: 5, text: 'Amazing service! The app is so easy to use and the SUV we rented was perfect for our family road trip.' },
  { name: 'Amit Kumar', city: 'Delhi', rating: 4, text: 'Great selection of vehicles at competitive prices. Customer support was very helpful when I had a query.' },
];

export default function Home() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);

  useEffect(() => {
    vehicleCategoryService.getActive()
      .then(res => setCategories(res?.data || res?.items || res || []))
      .catch(() => setCategories([]))
      .finally(() => setLoadingCats(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/vehicles?search=${encodeURIComponent(searchQuery)}`);
  };

  const categoryIcons = { Economy: '🚗', Premium: '🏎️', Luxury: '💎', SUV: '🚙', Commercial: '🚚' };

  return (
    <div className="min-h-screen">

      {/* ── HERO ──────────────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden bg-gradient-to-br from-gray-900 via-primary-950 to-primary-900">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />

        {/* Gradient blobs */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary-500 rounded-full blur-3xl opacity-20" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-accent-500 rounded-full blur-3xl opacity-15" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-white/90 text-sm font-medium">1,200+ vehicles available right now</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-tight mb-6 text-shadow-lg">
              Your Ride,
              <br />
              <span className="bg-gradient-to-r from-primary-300 to-accent-400 bg-clip-text text-transparent">
                Your Rules
              </span>
            </h1>

            <p className="text-xl text-white/75 mb-10 leading-relaxed max-w-xl">
              Book economy cabs, premium sedans, luxury cars, SUVs, or commercial trucks — all with professional drivers. Transparent pricing, zero hidden charges.
            </p>

            {/* Search bar */}
            <form onSubmit={handleSearch} className="flex gap-3 max-w-xl">
              <div className="flex-1 relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Where are you going?"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-900 font-medium focus:outline-none focus:ring-4 focus:ring-primary-400 shadow-xl"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-4 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl shadow-xl flex items-center gap-2 transition-colors"
              >
                <Search className="w-5 h-5" />
                <span className="hidden sm:inline">Search</span>
              </button>
            </form>

            <div className="flex flex-wrap gap-3 mt-6">
              {['Bangalore', 'Mumbai', 'Delhi', 'Pune', 'Hyderabad'].map(city => (
                <button
                  key={city}
                  onClick={() => navigate(`/vehicles?search=${city}`)}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white/80 text-sm rounded-full transition-colors"
                >
                  {city}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 60L1440 60L1440 20C1200 60 800 0 480 30C240 52 80 10 0 20V60Z" fill="#f9fafb" />
          </svg>
        </div>
      </section>

      {/* ── STATS ─────────────────────────────────────────── */}
      <section className="bg-gray-50 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {STATS.map(({ value, label, icon: Icon }) => (
              <div key={label} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center hover:shadow-md transition">
                <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-6 h-6 text-primary-600" />
                </div>
                <p className="text-3xl font-extrabold text-gray-900">{value}</p>
                <p className="text-sm text-gray-500 mt-1 font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-primary-600 font-semibold text-sm uppercase tracking-widest mb-2">Vehicle Fleet</p>
            <h2 className="text-4xl font-extrabold text-gray-900">Browse by Category</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">From budget-friendly rides to premium experiences — find the perfect vehicle for every occasion.</p>
          </div>

          {loadingCats ? <Loader /> : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => navigate(`/vehicles?categoryId=${cat.id}`)}
                  className="group flex flex-col items-center bg-white border-2 border-gray-100 hover:border-primary-400 rounded-2xl p-6 transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
                >
                  <span className="text-4xl mb-3">{categoryIcons[cat.name] || '🚗'}</span>
                  <span className="font-bold text-gray-900 group-hover:text-primary-700">{cat.name}</span>
                  <span className="text-xs text-gray-400 mt-1">From ₹{cat.basePrice}/day</span>
                </button>
              ))}
            </div>
          )}

          <div className="text-center mt-10">
            <button
              onClick={() => navigate('/vehicles')}
              className="inline-flex items-center gap-2 px-6 py-3 border-2 border-primary-600 text-primary-600 font-semibold rounded-xl hover:bg-primary-600 hover:text-white transition"
            >
              View All Vehicles <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────── */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-primary-600 font-semibold text-sm uppercase tracking-widest mb-2">Simple Process</p>
            <h2 className="text-4xl font-extrabold text-gray-900">How It Works</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">Getting your perfect ride takes just 4 steps and under 2 minutes.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {HOW_IT_WORKS.map(({ step, title, desc }, i) => (
              <div key={step} className="relative">
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-primary-200 to-transparent z-0" />
                )}
                <div className="relative bg-white rounded-2xl p-7 shadow-sm border border-gray-100 hover:shadow-md transition">
                  <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center text-white font-black text-lg mb-5 shadow-lg">
                    {step}
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg mb-2">{title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-primary-600 font-semibold text-sm uppercase tracking-widest mb-2">Why Choose Us</p>
              <h2 className="text-4xl font-extrabold text-gray-900 mb-4">The Smartest Way<br />to Travel</h2>
              <p className="text-gray-500 leading-relaxed mb-8">We combine cutting-edge technology with a human touch to deliver a rental experience that's fast, transparent, and reliable.</p>
              <ul className="space-y-3">
                {['No hidden charges — price you see is price you pay', 'Cancel up to 2 hours before with full refund', 'GPS-tracked vehicles for complete peace of mind', 'Corporate accounts with monthly invoicing'].map(item => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-gray-700 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => navigate('/vehicles')}
                className="mt-8 inline-flex items-center gap-2 px-7 py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-lg transition"
              >
                Book Now <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-5">
              {FEATURES.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:border-primary-200 hover:shadow-md transition">
                  <div className="w-11 h-11 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-primary-600" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-1.5">{title}</h4>
                  <p className="text-gray-500 text-xs leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────── */}
      <section className="py-20 bg-gradient-to-br from-primary-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-primary-600 font-semibold text-sm uppercase tracking-widest mb-2">Reviews</p>
            <h2 className="text-4xl font-extrabold text-gray-900">What Customers Say</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-7">
            {TESTIMONIALS.map(({ name, city, rating, text }) => (
              <div key={name} className="bg-white rounded-2xl p-7 shadow-sm border border-gray-100 hover:shadow-md transition">
                <div className="flex mb-3">
                  {Array.from({ length: rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-5 italic">"{text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{name}</p>
                    <p className="text-gray-400 text-xs">{city}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────── */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-800">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <Truck className="w-16 h-16 text-white/30 mx-auto mb-6" />
          <h2 className="text-4xl font-extrabold text-white mb-4">Ready to Hit the Road?</h2>
          <p className="text-primary-200 text-lg mb-8">Join over 50,000 satisfied customers who trust RideRental for every journey.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/register')}
              className="px-8 py-4 bg-white text-primary-700 font-bold rounded-xl hover:bg-gray-50 shadow-xl transition"
            >
              Create Free Account
            </button>
            <button
              onClick={() => navigate('/vehicles')}
              className="px-8 py-4 border-2 border-white/50 text-white font-semibold rounded-xl hover:bg-white/10 transition"
            >
              Browse Vehicles
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
