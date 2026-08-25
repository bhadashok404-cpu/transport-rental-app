import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, MapPin, Calendar, Users, ArrowRight, Car, Shield,
  Star, CheckCircle, Zap, ChevronRight, Leaf, Clock,
  Sparkles, Heart, TrendingUp, Award, Play, Truck
} from 'lucide-react';
import { vehicleCategoryService } from '../services';
import LocationAutocomplete from '../components/LocationAutocomplete';

// ── Top popular routes shown in the hero ──────────────────────────────────────
const POPULAR_ROUTES = [
  { from: 'Delhi', to: 'Agra' },
  { from: 'Mumbai', to: 'Pune' },
  { from: 'Bangalore', to: 'Mysore' },
  { from: 'Hyderabad', to: 'Vijayawada' },
  { from: 'Chennai', to: 'Pondicherry' },
  { from: 'Jaipur', to: 'Jodhpur' },
];

const FEATURES = [
  { icon: Car,    title: 'Travel everywhere',   desc: 'Explore all over India with countless shared rides.', color: 'text-blue-600 bg-blue-50' },
  { icon: Zap,    title: 'Prices like nowhere', desc: 'Benefit from great-value shared costs on carpool rides.', color: 'text-violet-600 bg-violet-50' },
  { icon: Shield, title: 'Ride with confidence', desc: 'Ride secure knowing your co-travellers have Verified Profiles.', color: 'text-emerald-600 bg-emerald-50' },
];

const CARPOOLING_STEPS = [
  { n: '01', title: 'Search a ride', desc: 'Enter your origin, destination, date and how many seats you need.' },
  { n: '02', title: 'Pick your driver', desc: 'See ratings, reviews, vehicle info and departure time at a glance.' },
  { n: '03', title: 'Book a seat', desc: 'Reserve instantly or send a request — your choice.' },
  { n: '04', title: 'Share the journey', desc: 'Split costs, meet new people and reduce your carbon footprint.' },
];

const STATS = [
  { value: '50K+',  label: 'Happy travellers', icon: Users,     color: 'from-blue-500 to-blue-600' },
  { value: '8K+',   label: 'Daily rides',       icon: Car,       color: 'from-violet-500 to-violet-600' },
  { value: '98%',   label: 'On-time rate',       icon: TrendingUp,color: 'from-emerald-500 to-emerald-600' },
  { value: '4.8★',  label: 'Driver rating',      icon: Award,     color: 'from-amber-500 to-orange-500' },
];

const TESTIMONIALS = [
  { name: 'Rahul S.', city: 'Delhi', rating: 5, text: 'Found a great ride to Jaipur for just ₹350. Met super friendly co-passengers. Way better than the bus!', avatar: 'RS' },
  { name: 'Priya P.',  city: 'Mumbai', rating: 5, text: 'The booking was instant, driver was on time, and the Pune trip cost me half of what I used to pay.', avatar: 'PP' },
  { name: 'Amit K.',  city: 'Bangalore', rating: 5, text: 'I now post a ride every time I drive to Mysore. Covers my fuel entirely. Love the idea.', avatar: 'AK' },
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

// ── Today's date in YYYY-MM-DD for the date picker ───────────────────────────
const todayStr = () => new Date().toISOString().split('T')[0];

export default function Home() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const fromRef = useRef(null);   // LocationAutocomplete refs
  const toRef   = useRef(null);

  // Carpool search form state
  const [form, setForm] = useState({
    from: '',
    to: '',
    date: todayStr(),
    passengers: 1,
  });

  useEffect(() => {
    vehicleCategoryService.getActive()
      .then(r => setCategories(r?.data || r?.items || r || []))
      .catch(() => {});
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!form.from.trim() || !form.to.trim()) return;
    // Close both autocomplete dropdowns
    fromRef.current?.close();
    toRef.current?.close();
    const q = new URLSearchParams({
      from: form.from.trim(),
      to:   form.to.trim(),
      date: form.date,
      passengers: form.passengers,
    });
    navigate(`/rides?${q.toString()}`);
  };

  const quickRoute = (route) => {
    setForm(f => ({ ...f, from: route.from, to: route.to }));
    const q = new URLSearchParams({
      from: route.from, to: route.to, date: form.date, passengers: 1,
    });
    navigate(`/rides?${q.toString()}`);
  };

  const field = (key, val) => setForm(f => ({ ...f, [key]: val }));

  return (
    <div className="min-h-screen">

      {/* ══════════════ HERO ═══════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden gradient-hero noise">
        {/* Blobs — pushed to edges only, away from content */}
        <div className="blob blob-blue blob-animate w-96 h-96 top-0 right-0 translate-x-1/2 -translate-y-1/2 opacity-30" />
        <div className="blob blob-violet w-72 h-72 bottom-0 right-1/4 translate-y-2/3 opacity-20" style={{ animationDelay: '2s' }} />

        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.3) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.3) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">

          {/* ── 1. SEARCH BAR ─────────────────────────────────────────────── */}
          <form onSubmit={handleSearch}
            className="bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col sm:flex-row items-stretch overflow-hidden mb-4">

            {/* FROM */}
            <div className="flex-1 flex flex-col justify-center px-3 py-3 border-b sm:border-b-0 sm:border-r border-gray-100">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 pl-1">From</span>
              <LocationAutocomplete
                ref={fromRef}
                value={form.from}
                onChange={v => field('from', v)}
                placeholder="City or place"
                pinColor="#10b981"
                inputClass="border-0 bg-transparent focus:ring-0 py-1.5 pl-8 pr-8"
              />
            </div>

            {/* SWAP */}
            <button type="button"
              onClick={() => setForm(f => ({ ...f, from: f.to, to: f.from }))}
              className="hidden sm:flex items-center justify-center w-10 self-stretch bg-white hover:bg-primary-50 border-r border-gray-100 transition-colors shrink-0">
              <svg className="w-4 h-4 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </button>

            {/* TO */}
            <div className="flex-1 flex flex-col justify-center px-3 py-3 border-b sm:border-b-0 sm:border-r border-gray-100">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 pl-1">To</span>
              <LocationAutocomplete
                ref={toRef}
                value={form.to}
                onChange={v => field('to', v)}
                placeholder="City or place"
                pinColor="#ef4444"
                inputClass="border-0 bg-transparent focus:ring-0 py-1.5 pl-8 pr-8"
              />
            </div>

            {/* DEPARTURE */}
            <div className="sm:w-44 flex flex-col justify-center px-5 py-4 border-b sm:border-b-0 sm:border-r border-gray-100 shrink-0">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Departure</span>
              <input type="date"
                min={todayStr()}
                value={form.date}
                onChange={e => field('date', e.target.value)}
                className="text-sm font-semibold text-gray-900 bg-transparent outline-none w-full cursor-pointer"
              />
            </div>

            {/* PASSENGERS */}
            <div className="sm:w-36 flex flex-col justify-center px-5 py-4 border-b sm:border-b-0 sm:border-r border-gray-100 shrink-0">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Passengers</span>
              <select
                value={form.passengers}
                onChange={e => field('passengers', Number(e.target.value))}
                className="text-sm font-semibold text-gray-900 bg-transparent outline-none w-full cursor-pointer appearance-none">
                {[1,2,3,4,5,6,7,8].map(n => (
                  <option key={n} value={n}>{n} passenger{n > 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>

            {/* SEARCH BUTTON */}
            <button type="submit"
              className="px-8 py-4 font-black text-white text-sm gradient-brand hover:opacity-90 transition-opacity shrink-0 flex items-center justify-center gap-2 sm:rounded-none rounded-b-2xl sm:rounded-r-2xl">
              <Search className="w-4 h-4" /> Search
            </button>
          </form>

          {/* ── 2. TOP CARPOOL RIDES ───────────────────────────────────────── */}
          <div className="mb-10">
            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-3 flex items-center gap-2">
              <span className="w-3 h-px bg-white/30" /> Top carpool rides <span className="w-3 h-px bg-white/30" />
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {POPULAR_ROUTES.map((route, i) => {
                const colors = [
                  { dot: 'bg-emerald-400', hover: 'hover:border-emerald-400/40 hover:bg-emerald-500/10' },
                  { dot: 'bg-blue-400',    hover: 'hover:border-blue-400/40 hover:bg-blue-500/10' },
                  { dot: 'bg-violet-400',  hover: 'hover:border-violet-400/40 hover:bg-violet-500/10' },
                  { dot: 'bg-amber-400',   hover: 'hover:border-amber-400/40 hover:bg-amber-500/10' },
                  { dot: 'bg-rose-400',    hover: 'hover:border-rose-400/40 hover:bg-rose-500/10' },
                  { dot: 'bg-cyan-400',    hover: 'hover:border-cyan-400/40 hover:bg-cyan-500/10' },
                ][i % 6];
                return (
                  <button key={`${route.from}-${route.to}`}
                    onClick={() => quickRoute(route)}
                    className={`group flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-3 transition-all duration-200 ${colors.hover} hover:scale-[1.02] active:scale-100`}>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-2 h-2 rounded-full ${colors.dot} shrink-0 group-hover:scale-125 transition-transform`} />
                      <span className="font-bold text-white/75 group-hover:text-white text-sm transition-colors truncate">
                        {route.from}
                      </span>
                      <svg className="w-3.5 h-3.5 text-white/30 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                      <span className="font-bold text-white/75 group-hover:text-white text-sm transition-colors truncate">
                        {route.to}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/60 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── 3. HEADLINE + IMAGE ────────────────────────────────────────── */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* LEFT */}
            <div className="animate-slide-up">
              <div className="inline-flex items-center gap-2 glass-dark rounded-full px-4 py-2 mb-5">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-white/80 text-sm font-medium">8,000+ daily rides available</span>
                <span className="text-white/40">·</span>
                <span className="text-emerald-400 text-sm font-semibold">Instant booking</span>
              </div>

              <h1 className="text-5xl sm:text-6xl font-black text-white leading-[1.05] mb-4">
                Travel anywhere
                <br /><span className="shimmer-text">together.</span>
                <br /><span className="text-white/70 text-4xl sm:text-5xl">Spend smarter.</span>
              </h1>

              <p className="text-white/60 text-lg leading-relaxed mb-5 max-w-lg">
                Share a ride with verified drivers heading your way. Split fuel costs, make friends, and help the planet.
              </p>

              <div className="flex flex-wrap gap-3 mb-6">
                {[
                  { icon: Car,    label: 'Verified drivers' },
                  { icon: Leaf,   label: 'Eco-friendly' },
                  { icon: Shield, label: 'Safe & insured' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2 glass-dark rounded-full px-4 py-2">
                    <Icon className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-white/75 text-sm font-medium">{label}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-4">
                <button onClick={() => navigate('/register')}
                  className="btn-primary px-7 py-3.5 rounded-2xl font-bold">
                  Start for free <ArrowRight className="w-4 h-4" />
                </button>
                <button onClick={() => navigate('/login')}
                  className="text-white/60 hover:text-white text-sm font-semibold underline underline-offset-2 transition-colors">
                  Already a member?
                </button>
              </div>
            </div>

            {/* RIGHT */}
            <div className="hidden lg:block relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl" style={{ height: 300 }}>
                <img
                  src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=900&q=80&fit=crop"
                  alt="Friends carpooling"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent" />
                <div className="absolute bottom-5 left-5 glass rounded-2xl px-5 py-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl gradient-green flex items-center justify-center">
                    <Leaf className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-gray-900">Reduce CO₂ emissions</p>
                    <p className="text-xs text-gray-500">~17 kg saved per shared trip</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 inset-x-0 h-16 bg-linear-to-t from-slate-50 to-transparent pointer-events-none" />
      </section>

      {/* ══════════════ 3 FEATURE PILLS ════════════════════════════════════════ */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-3 gap-8">
            {FEATURES.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="flex flex-col items-start gap-4">
                <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center shadow-sm`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-gray-900 text-lg mb-1">{title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ STATS ══════════════════════════════════════════════════ */}
      <section className="py-16 gradient-brand-soft border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {STATS.map(({ value, label, icon: Icon, color }) => (
              <div key={label} className="card-premium p-6 text-center group">
                <div className={`w-12 h-12 rounded-2xl bg-linear-to-br ${color} flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-3xl font-black text-gray-900 mb-1"><AnimatedCounter target={value} /></p>
                <p className="text-sm text-gray-500 font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ HOW IT WORKS ════════════════════════════════════════════ */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="section-tag"><Play className="w-3.5 h-3.5" />How it works</span>
            <h2 className="section-title mt-3">Book a shared ride in 4 steps</h2>
            <p className="section-sub">From search to confirmed seat in under a minute.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            <div className="hidden lg:block absolute top-10 left-[12.5%] right-[12.5%] h-0.5 bg-linear-to-r from-primary-200 via-violet-200 to-primary-200" />
            {CARPOOLING_STEPS.map(({ n, title, desc }, i) => (
              <div key={n} className="flex flex-col items-center text-center group" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="relative mb-6">
                  <div className="w-20 h-20 rounded-2xl gradient-brand flex items-center justify-center text-white font-black text-2xl shadow-xl group-hover:scale-110 transition-transform duration-300 relative z-10">{n}</div>
                  <div className="absolute inset-0 rounded-2xl gradient-brand opacity-20 blur-xl scale-150" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ VEHICLE CATEGORIES (rental) ════════════════════════════ */}
      {categories.length > 0 && (
        <section className="py-20 gradient-brand-soft">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="section-tag"><Sparkles className="w-3.5 h-3.5" />Also rent a full vehicle</span>
              <h2 className="section-title mt-3">Browse our rental fleet</h2>
              <p className="section-sub">Need a vehicle all to yourself? Rent by day or by km.</p>
            </div>
            <div className="grid sm:grid-cols-3 lg:grid-cols-5 gap-5">
              {categories.map(cat => (
                <button key={cat.id}
                  onClick={() => navigate(`/vehicles?categoryId=${cat.id}`)}
                  className="group flex flex-col items-center gap-3 p-7 rounded-2xl border-2 border-gray-100 bg-white hover:border-primary-200 hover:bg-primary-50/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <span className="text-4xl group-hover:scale-110 transition-transform duration-300">{CAT_ICONS[cat.name] || '🚗'}</span>
                  <div className="text-center">
                    <p className="font-bold text-gray-900 text-sm group-hover:text-primary-700 transition-colors">{cat.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">from ₹{cat.basePrice}/day</p>
                  </div>
                </button>
              ))}
            </div>
            <div className="text-center mt-10">
              <button onClick={() => navigate('/vehicles')}
                className="btn-ghost inline-flex items-center gap-2 px-8 py-3.5 text-base font-bold rounded-2xl">
                View all vehicles <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ══════════════ TESTIMONIALS ════════════════════════════════════════════ */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="section-tag"><Star className="w-3.5 h-3.5" />Reviews</span>
            <h2 className="section-title mt-3">What travellers say</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-7">
            {TESTIMONIALS.map(({ name, city, rating, text, avatar }) => (
              <div key={name} className="card-premium p-7 group">
                <div className="flex gap-0.5 mb-4">
                  {Array(rating).fill(0).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-6 italic">"{text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center text-white font-black text-xs shadow">{avatar}</div>
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

      {/* ══════════════ DRIVER CTA ══════════════════════════════════════════════ */}
      <section className="relative py-28 overflow-hidden gradient-hero noise">
        <div className="blob blob-violet w-96 h-96 top-0 right-0 translate-x-1/3 -translate-y-1/3 opacity-40" />
        <div className="blob blob-blue w-72 h-72 bottom-0 left-0 -translate-x-1/4 translate-y-1/4 opacity-40" />
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <div className="w-20 h-20 gradient-brand rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
            <Truck className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">Offer a ride, earn back your fuel</h2>
          <p className="text-white/60 text-xl mb-10">
            Already heading somewhere? Post your ride, pick up passengers, and split the cost of the trip.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => navigate('/register')}
              className="px-10 py-4 text-base rounded-2xl font-black bg-white text-primary-700 hover:bg-gray-50 shadow-2xl transition-all">
              Become a driver
            </button>
            <button onClick={() => navigate('/rides')}
              className="glass-dark hover:bg-white/15 text-white font-semibold px-10 py-4 rounded-2xl transition-all border border-white/20">
              Find a ride
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
