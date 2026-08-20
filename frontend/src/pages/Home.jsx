import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, MapPin, Car, Shield, Clock, Star, ArrowRight,
  CheckCircle, Truck, Users, Award, Zap, Sparkles,
  ChevronRight, Play, TrendingUp, Heart
} from 'lucide-react';
import { vehicleCategoryService } from '../services';

const STATS = [
  { value: '50K+', label: 'Happy Customers', icon: Users, color: 'from-blue-500 to-blue-600' },
  { value: '1,200+', label: 'Vehicles', icon: Car, color: 'from-violet-500 to-violet-600' },
  { value: '99.2%', label: 'On-Time Rate', icon: TrendingUp, color: 'from-emerald-500 to-emerald-600' },
  { value: '4.9★', label: 'App Rating', icon: Award, color: 'from-amber-500 to-orange-500' },
];

const FEATURES = [
  { icon: Shield, title: 'Fully Insured', desc: 'Every vehicle is insured & inspected before each trip for your complete peace of mind.', color: 'bg-blue-50 text-blue-600', border: 'border-blue-100' },
  { icon: Zap, title: 'Book in 60s', desc: 'Our streamlined booking flow gets you confirmed in under a minute — anytime, anywhere.', color: 'bg-violet-50 text-violet-600', border: 'border-violet-100' },
  { icon: Clock, title: '24/7 Support', desc: 'Round-the-clock customer support via chat, call, or email — we never sleep.', color: 'bg-emerald-50 text-emerald-600', border: 'border-emerald-100' },
  { icon: Star, title: 'Verified Drivers', desc: 'Background-checked professionals with avg 4.7+ rating and 100+ trips.', color: 'bg-amber-50 text-amber-600', border: 'border-amber-100' },
];

const HOW = [
  { n: '01', title: 'Choose Vehicle', desc: 'Browse by category, price, or type to find your perfect ride.' },
  { n: '02', title: 'Set Your Dates', desc: 'Pick pickup/drop location and select travel dates for instant pricing.' },
  { n: '03', title: 'Pay Securely', desc: 'UPI, cards, net banking — checkout takes 10 seconds.' },
  { n: '04', title: 'Enjoy the Ride', desc: 'Driver arrives on time. Rate your experience after.' },
];

const TESTIMONIALS = [
  { name: 'Rahul Sharma', city: 'Bangalore', rating: 5, text: 'Booked a premium sedan for a corporate event. The driver was 10 minutes early and the car was spotless. Absolutely premium experience!', avatar: 'RS' },
  { name: 'Priya Patel', city: 'Mumbai', rating: 5, text: 'Used the SUV for a family road trip to Goa. Smooth booking, real-time updates, and zero surprises in the bill. Loved it!', avatar: 'PP' },
  { name: 'Amit Kumar', city: 'Delhi', rating: 5, text: 'As a frequent traveler, RideRental is my go-to. Corporate account with monthly invoices makes expense reporting a breeze.', avatar: 'AK' },
];

const CAT_ICONS = { Economy: '🚗', Premium: '🏎️', Luxury: '💎', SUV: '🚙', Commercial: '🚚' };

function AnimatedCounter({ target, duration = 1500 }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const num = parseInt(target.replace(/\D/g, ''));
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const steps = 40;
        const step = num / steps;
        let cur = 0;
        const t = setInterval(() => {
          cur = Math.min(cur + step, num);
          setVal(Math.round(cur));
          if (cur >= num) clearInterval(t);
        }, duration / steps);
      }
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target, duration]);

  return <span ref={ref}>{val.toLocaleString()}{target.replace(/[\d,]/g, '')}</span>;
}

export default function Home() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState([]);
  const [activeCat, setActiveCat] = useState(null);

  useEffect(() => {
    vehicleCategoryService.getActive()
      .then(r => setCategories(r?.data || r?.items || r || []))
      .catch(() => {});
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const q = search.trim();
    navigate(q ? `/vehicles?search=${encodeURIComponent(q)}` : '/vehicles');
  };

  return (
    <div className="min-h-screen">

      {/* ════════════════════════════════════════════ HERO */}
      <section className="relative min-h-screen flex items-center overflow-hidden gradient-hero noise">
        {/* Animated blobs */}
        <div className="blob blob-blue blob-animate w-96 h-96 top-0 right-0 translate-x-1/2 -translate-y-1/4" />
        <div className="blob blob-violet w-80 h-80 bottom-0 left-0 -translate-x-1/4 translate-y-1/4" style={{ animationDelay: '2s' }} />
        <div className="blob blob-rose w-64 h-64 top-1/2 left-1/3" style={{ animationDelay: '4s', opacity: 0.25 }} />

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 lg:py-0 lg:min-h-screen lg:flex lg:items-center">
          <div className="w-full max-w-3xl">
            {/* Kicker */}
            <div className="inline-flex items-center gap-2 glass-dark rounded-full px-4 py-2 mb-8 animate-fade-in">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-white/80 text-sm font-medium">1,200+ vehicles available right now</span>
              <span className="text-white/40">·</span>
              <span className="text-emerald-400 text-sm font-semibold">Instant booking</span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.05] mb-6">
              Your Ride,
              <br />
              <span className="shimmer-text">Your Rules.</span>
            </h1>

            <p className="text-white/65 text-xl leading-relaxed mb-10 max-w-xl">
              Economy cabs to luxury SUVs, bikes to trucks — book verified vehicles with professional drivers in seconds. Zero hidden charges.
            </p>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex gap-3 max-w-2xl mb-8">
              <div className="flex-1 relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-500" />
                <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Where are you going?"
                  className="w-full pl-12 pr-4 py-4 bg-white/95 backdrop-blur rounded-2xl text-gray-900 font-medium placeholder-gray-400 outline-none focus:ring-4 focus:ring-primary-400/30 shadow-2xl text-base" />
              </div>
              <button type="submit" className="btn-primary px-7 py-4 rounded-2xl text-base font-black shadow-2xl whitespace-nowrap">
                <Search className="w-5 h-5" />
                <span className="hidden sm:inline">Search</span>
              </button>
            </form>

            {/* City chips */}
            <div className="flex flex-wrap gap-2">
              {['Bangalore', 'Mumbai', 'Delhi', 'Pune', 'Hyderabad', 'Chennai'].map(city => (
                <button key={city} onClick={() => navigate(`/vehicles?search=${city}`)}
                  className="px-4 py-1.5 glass-dark hover:bg-white/15 rounded-full text-white/70 hover:text-white text-sm font-medium transition-all duration-200">
                  {city}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-slate-50 to-transparent" />
      </section>

      {/* ════════════════════════════════════════════ STATS */}
      <section className="py-16 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {STATS.map(({ value, label, icon: Icon, color }) => (
              <div key={label} className="card-premium p-6 text-center group">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-3xl font-black text-gray-900 mb-1">
                  <AnimatedCounter target={value} />
                </p>
                <p className="text-sm text-gray-500 font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════ CATEGORIES */}
      <section className="py-24 gradient-brand-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="section-tag"><Sparkles className="w-3.5 h-3.5" />Our Fleet</span>
            <h2 className="section-title mt-3">Browse by Category</h2>
            <p className="section-sub">From ₹140/day hatchbacks to ₹600/day luxury SUVs — every occasion covered.</p>
          </div>

          {categories.length === 0 ? (
            <div className="grid sm:grid-cols-3 lg:grid-cols-5 gap-5">
              {Array(5).fill(0).map((_, i) => (
                <div key={i} className="h-36 rounded-2xl bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-3 lg:grid-cols-5 gap-5">
              {categories.map(cat => (
                <button key={cat.id}
                  onClick={() => { setActiveCat(cat.id); navigate(`/vehicles?categoryId=${cat.id}`); }}
                  className={`group relative flex flex-col items-center gap-3 p-7 rounded-2xl border-2 transition-all duration-300 ${activeCat === cat.id ? 'border-primary-500 bg-primary-50 shadow-lg shadow-primary-100' : 'border-gray-100 bg-white hover:border-primary-200 hover:bg-primary-50/50 hover:shadow-lg hover:-translate-y-1'}`}>
                  <span className="text-4xl group-hover:scale-110 transition-transform duration-300">{CAT_ICONS[cat.name] || '🚗'}</span>
                  <div className="text-center">
                    <p className="font-bold text-gray-900 text-sm group-hover:text-primary-700 transition-colors">{cat.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">from ₹{cat.basePrice}/day</p>
                  </div>
                  {activeCat === cat.id && <span className="absolute top-3 right-3 w-5 h-5 rounded-full gradient-brand flex items-center justify-center"><CheckCircle className="w-3 h-3 text-white" /></span>}
                </button>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <button onClick={() => navigate('/vehicles')}
              className="btn-ghost inline-flex items-center gap-2 px-8 py-3.5 text-base font-bold rounded-2xl hover:border-primary-300 hover:text-primary-700">
              View All Vehicles <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════ HOW IT WORKS */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="section-tag"><Play className="w-3.5 h-3.5" />Simple Process</span>
            <h2 className="section-title mt-3">Book in 4 Easy Steps</h2>
            <p className="section-sub">From search to confirmation in under 2 minutes.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {/* connector line */}
            <div className="hidden lg:block absolute top-10 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-primary-200 via-violet-200 to-primary-200" />

            {HOW.map(({ n, title, desc }, i) => (
              <div key={n} className="relative flex flex-col items-center text-center group" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="relative mb-6">
                  <div className="w-20 h-20 rounded-2xl gradient-brand flex items-center justify-center text-white font-black text-2xl shadow-xl group-hover:scale-110 transition-transform duration-300 relative z-10">
                    {n}
                  </div>
                  <div className="absolute inset-0 rounded-2xl gradient-brand opacity-20 blur-xl scale-150" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════ WHY US */}
      <section className="py-24 gradient-brand-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="section-tag"><Heart className="w-3.5 h-3.5" />Why Choose Us</span>
              <h2 className="section-title mt-3 mb-4">The Smartest Way<br/>to Travel</h2>
              <p className="text-gray-500 text-lg leading-relaxed mb-8">
                We combine cutting-edge tech with human care to deliver rental experiences that are fast, transparent, and genuinely reliable.
              </p>
              <ul className="space-y-3 mb-10">
                {['No hidden charges — price you see is price you pay', 'Cancel up to 2 hours before with 100% refund', 'GPS-tracked rides for complete peace of mind', 'Corporate accounts with monthly invoicing'].map(item => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full gradient-green flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle className="w-3 h-3 text-white" />
                    </span>
                    <span className="text-gray-700 text-sm font-medium">{item}</span>
                  </li>
                ))}
              </ul>
              <button onClick={() => navigate('/vehicles')} className="btn-primary px-8 py-4 text-base rounded-2xl">
                Book Your Ride <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {FEATURES.map(({ icon: Icon, title, desc, color, border }) => (
                <div key={title} className={`card-premium p-6 border ${border}`}>
                  <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-4`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-1.5 text-sm">{title}</h4>
                  <p className="text-gray-500 text-xs leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════ TESTIMONIALS */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="section-tag"><Star className="w-3.5 h-3.5" />Reviews</span>
            <h2 className="section-title mt-3">What Customers Say</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-7">
            {TESTIMONIALS.map(({ name, city, rating, text, avatar }) => (
              <div key={name} className="card-premium p-7 group">
                <div className="flex items-center gap-1 mb-4">
                  {Array(rating).fill(0).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-6 italic">"{text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center text-white font-black text-xs shadow">
                    {avatar}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{name}</p>
                    <p className="text-gray-400 text-xs">{city}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════ CTA */}
      <section className="relative py-28 overflow-hidden gradient-hero noise">
        <div className="blob blob-violet w-96 h-96 top-0 right-0 translate-x-1/3 -translate-y-1/3 opacity-40" />
        <div className="blob blob-blue w-72 h-72 bottom-0 left-0 -translate-x-1/4 translate-y-1/4 opacity-40" />
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <div className="w-20 h-20 gradient-brand rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
            <Truck className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">Ready to Hit the Road?</h2>
          <p className="text-white/60 text-xl mb-10">Join 50,000+ customers who trust RideRental for every journey.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => navigate('/register')} className="btn-primary px-10 py-4 text-base rounded-2xl font-black bg-white text-primary-700 hover:bg-gray-50 shadow-2xl" style={{ background: 'white', color: '#1d4ed8' }}>
              Create Free Account
            </button>
            <button onClick={() => navigate('/vehicles')} className="glass-dark hover:bg-white/15 text-white font-semibold px-10 py-4 rounded-2xl transition-all duration-200 border border-white/20">
              Browse Vehicles
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
