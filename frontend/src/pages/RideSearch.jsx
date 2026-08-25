import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Search, MapPin, Calendar, Users, SlidersHorizontal, X,
  Clock, Star, Zap, ChevronRight, Car, Wind, PawPrint,
  ChevronsUpDown, ArrowUpDown, Filter, RefreshCw
} from 'lucide-react';
import { carpoolService } from '../services';
import { Loader, EmptyState } from '../components';
import LocationAutocomplete from '../components/LocationAutocomplete';

const todayStr = () => new Date().toISOString().split('T')[0];

const SORT_OPTIONS = [
  { value: 0, label: 'Earliest departure' },
  { value: 1, label: 'Lowest price' },
  { value: 2, label: 'Highest rating' },
];

function formatDuration(mins) {
  if (!mins) return null;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h${m > 0 ? ` ${m}m` : ''}` : `${m}m`;
}

function formatTime(dt) {
  return new Date(dt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
}

// ── Single ride card (BlaBlaCar style) ────────────────────────────────────────
function RideCard({ ride, onClick }) {
  const depTime = formatTime(ride.departureTime);
  const arrTime = ride.estimatedDurationMinutes
    ? formatTime(new Date(new Date(ride.departureTime).getTime() + ride.estimatedDurationMinutes * 60000))
    : null;
  const dur = formatDuration(ride.estimatedDurationMinutes);
  const isFull = ride.availableSeats === 0;

  return (
    <div
      onClick={!isFull ? onClick : undefined}
      className={`bg-white rounded-2xl border-2 transition-all duration-200 overflow-hidden
        ${isFull
          ? 'border-gray-100 opacity-60 cursor-not-allowed'
          : 'border-gray-100 hover:border-primary-200 hover:shadow-xl hover:-translate-y-0.5 cursor-pointer'
        }`}
    >
      <div className="p-5">
        {/* Time + route row */}
        <div className="flex items-center gap-4 mb-4">
          {/* Departure time */}
          <div className="text-center shrink-0 w-14">
            <p className="text-2xl font-black text-gray-900 leading-none">{depTime}</p>
            <p className="text-xs text-gray-400 font-semibold mt-0.5 truncate">{ride.originCity}</p>
          </div>

          {/* Journey line */}
          <div className="flex-1 flex flex-col items-center gap-0.5">
            <div className="flex items-center w-full gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
              <div className="flex-1 relative">
                <div className="h-0.5 bg-gray-200 w-full" />
                {dur && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-[10px] font-black text-gray-400 whitespace-nowrap bg-white px-1">
                    {dur}
                  </span>
                )}
              </div>
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
            </div>
          </div>

          {/* Arrival time */}
          <div className="text-center shrink-0 w-14">
            {arrTime && <p className="text-2xl font-black text-gray-900 leading-none">{arrTime}</p>}
            <p className="text-xs text-gray-400 font-semibold mt-0.5 truncate">{ride.destinationCity}</p>
          </div>

          {/* Price */}
          <div className="ml-4 shrink-0 text-right">
            {isFull ? (
              <span className="text-lg font-black text-gray-400">Full</span>
            ) : (
              <>
                <p className="text-2xl font-black text-gray-900">₹{Math.round(ride.pricePerSeat)}</p>
                <p className="text-xs text-gray-400">per seat</p>
              </>
            )}
          </div>
        </div>

        {/* Driver row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center text-white font-black text-sm shadow shrink-0">
              {ride.driverName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'D'}
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm">{ride.driverName}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span className="text-xs font-semibold text-gray-500">{ride.driverRating?.toFixed(1) || '—'}</span>
                {ride.driverIsVerified && (
                  <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-full">
                    ✓ Verified
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {ride.instantBooking && (
              <span className="flex items-center gap-1 text-[10px] font-black text-primary-600 bg-primary-50 border border-primary-100 px-2 py-1 rounded-full">
                <Zap className="w-2.5 h-2.5" /> Instant
              </span>
            )}
            {ride.smokingAllowed && (
              <span className="text-[10px] font-bold text-gray-500 bg-gray-50 border border-gray-200 px-2 py-1 rounded-full">
                🚬
              </span>
            )}
            {ride.petsAllowed && (
              <span className="flex items-center gap-0.5 text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-2 py-1 rounded-full">
                <PawPrint className="w-2.5 h-2.5" />
              </span>
            )}
            {ride.availableSeats > 0 && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-gray-500 bg-gray-50 border border-gray-200 px-2 py-1 rounded-full">
                <Users className="w-2.5 h-2.5" />
                {ride.availableSeats} left
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Filter panel ──────────────────────────────────────────────────────────────
function FilterPanel({ filters, setFilters, onClose }) {
  const [local, setLocal] = useState(filters);
  const apply = () => { setFilters(local); onClose?.(); };
  const reset = () => setLocal({ maxPrice: '', instantOnly: false, sortBy: 0 });

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-black text-gray-900 flex items-center gap-2">
          <Filter className="w-4 h-4 text-primary-500" /> Filters & Sort
        </h3>
        <button onClick={reset} className="text-xs font-bold text-gray-400 hover:text-rose-500 transition-colors flex items-center gap-1">
          <X className="w-3 h-3" /> Clear all
        </button>
      </div>

      {/* Sort */}
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Sort by</p>
        <div className="space-y-1.5">
          {SORT_OPTIONS.map(opt => (
            <label key={opt.value} className="flex items-center gap-3 cursor-pointer group">
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors
                ${local.sortBy === opt.value ? 'border-primary-500 bg-primary-500' : 'border-gray-300 group-hover:border-primary-300'}`}>
                {local.sortBy === opt.value && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
              </div>
              <span className={`text-sm font-semibold transition-colors ${local.sortBy === opt.value ? 'text-primary-700' : 'text-gray-600'}`}>
                {opt.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Max price */}
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Max price per seat</p>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">₹</span>
          <input
            type="number" min="0" placeholder="Any"
            value={local.maxPrice}
            onChange={e => setLocal(f => ({ ...f, maxPrice: e.target.value }))}
            className="w-full pl-7 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary-400 transition-all"
          />
        </div>
      </div>

      {/* Instant booking only */}
      <label className="flex items-center gap-3 cursor-pointer">
        <div
          onClick={() => setLocal(f => ({ ...f, instantOnly: !f.instantOnly }))}
          className={`relative w-10 h-6 rounded-full transition-colors duration-200 ${local.instantOnly ? 'bg-primary-500' : 'bg-gray-200'}`}
        >
          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${local.instantOnly ? 'left-5' : 'left-1'}`} />
        </div>
        <span className="text-sm font-semibold text-gray-700">Instant booking only</span>
      </label>

      <button onClick={apply}
        className="w-full py-3.5 rounded-xl font-black text-white gradient-brand shadow-lg transition-all hover:-translate-y-0.5 text-sm">
        Apply Filters
      </button>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function RideSearch() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    from: searchParams.get('from') || '',
    to:   searchParams.get('to')   || '',
    date: searchParams.get('date') || todayStr(),
    passengers: Number(searchParams.get('passengers')) || 1,
  });
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ maxPrice: '', instantOnly: false, sortBy: 0 });

  const fromRef = useRef(null);
  const toRef   = useRef(null);

  const doSearch = useCallback(async (f, fil) => {
    if (!f.from.trim() || !f.to.trim()) return;
    setLoading(true);
    setHasSearched(true);
    try {
      const params = {
        originCity: f.from.trim(),
        destinationCity: f.to.trim(),
        date: f.date,
        passengers: f.passengers,
        sortBy: fil.sortBy,
        ...(fil.maxPrice ? { maxPricePerSeat: fil.maxPrice } : {}),
        ...(fil.instantOnly ? { instantBookingOnly: true } : {}),
      };
      const res = await carpoolService.searchRides(params);
      const list = res?.data?.items || res?.data || res?.items || res || [];
      setRides(Array.isArray(list) ? list : []);
    } catch {
      setRides([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-search on mount if params are present
  useEffect(() => {
    if (form.from && form.to) doSearch(form, filters);
  }, []); // eslint-disable-line

  const handleSearch = (e) => {
    e.preventDefault();
    fromRef.current?.close();
    toRef.current?.close();
    setSearchParams({ from: form.from, to: form.to, date: form.date, passengers: form.passengers });
    doSearch(form, filters);
  };

  const field = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const dateLabel = new Date(form.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long' });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Top search bar ─────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100 shadow-sm sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <form onSubmit={handleSearch}
            className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-end">
            {/* From */}
            <div className="flex-1 min-w-0">
              <LocationAutocomplete
                ref={fromRef}
                value={form.from}
                onChange={v => field('from', v)}
                placeholder="From city"
                pinColor="#10b981"
              />
            </div>
            {/* swap */}
            <button type="button"
              onClick={() => setForm(f => ({ ...f, from: f.to, to: f.from }))}
              className="hidden sm:flex items-center justify-center w-8 h-9 rounded-lg bg-gray-100 hover:bg-primary-100 transition-colors shrink-0">
              <ChevronsUpDown className="w-4 h-4 text-gray-500 rotate-90" />
            </button>
            {/* To */}
            <div className="flex-1 min-w-0">
              <LocationAutocomplete
                ref={toRef}
                value={form.to}
                onChange={v => field('to', v)}
                placeholder="To city"
                pinColor="#ef4444"
              />
            </div>
            {/* Date */}
            <div className="sm:w-40 shrink-0">
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-500 pointer-events-none" />
                <input type="date" min={todayStr()} value={form.date}
                  onChange={e => field('date', e.target.value)}
                  className="w-full pl-9 pr-2 py-2.5 bg-gray-50 border-2 border-gray-100 hover:border-gray-200 focus:border-primary-400 focus:bg-white rounded-xl text-xs font-bold outline-none transition-all cursor-pointer" />
              </div>
            </div>
            {/* Passengers */}
            <div className="sm:w-32 shrink-0">
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-500 pointer-events-none" />
                <select value={form.passengers} onChange={e => field('passengers', Number(e.target.value))}
                  className="w-full pl-9 pr-2 py-2.5 bg-gray-50 border-2 border-gray-100 hover:border-gray-200 focus:border-primary-400 focus:bg-white rounded-xl text-xs font-bold outline-none transition-all appearance-none cursor-pointer">
                  {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n} pax</option>)}
                </select>
              </div>
            </div>
            {/* Button */}
            <button type="submit"
              className="btn-primary px-6 py-2.5 rounded-xl font-black text-sm shrink-0 flex items-center gap-2">
              <Search className="w-4 h-4" /> Search
            </button>
          </form>
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-7">

          {/* ── Left: filter sidebar (desktop) ─────────────────────── */}
          <div className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-36">
              <FilterPanel
                filters={filters}
                setFilters={(f) => { setFilters(f); doSearch(form, f); }}
                onClose={() => {}}
              />
            </div>
          </div>

          {/* ── Right: results ──────────────────────────────────────── */}
          <div className="flex-1 min-w-0">
            {/* Header row */}
            {hasSearched && !loading && (
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-sm font-black text-gray-500 uppercase tracking-widest">{dateLabel}</p>
                  <p className="font-black text-gray-900 text-xl mt-0.5">
                    {form.from} → {form.to}
                  </p>
                  {rides.length > 0 && (
                    <p className="text-sm text-gray-400 mt-0.5">{rides.length} ride{rides.length !== 1 ? 's' : ''} available</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {/* Mobile filter toggle */}
                  <button onClick={() => setShowFilters(v => !v)}
                    className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-100 rounded-xl text-sm font-bold hover:border-primary-300 transition-colors">
                    <SlidersHorizontal className="w-4 h-4" /> Filters
                  </button>
                  {/* Sort quick-pick (desktop) */}
                  <div className="hidden sm:flex items-center gap-1.5">
                    <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                    <select value={filters.sortBy}
                      onChange={e => { const f = { ...filters, sortBy: Number(e.target.value) }; setFilters(f); doSearch(form, f); }}
                      className="text-sm font-bold text-gray-600 bg-transparent border-0 outline-none cursor-pointer">
                      {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Mobile filter panel */}
            {showFilters && (
              <div className="lg:hidden mb-5">
                <FilterPanel
                  filters={filters}
                  setFilters={(f) => { setFilters(f); doSearch(form, f); }}
                  onClose={() => setShowFilters(false)}
                />
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="py-20 flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-primary-100 border-t-primary-500 rounded-full animate-spin" />
                <p className="text-gray-500 font-semibold">Finding rides…</p>
              </div>
            )}

            {/* Empty state */}
            {!loading && hasSearched && rides.length === 0 && (
              <EmptyState
                icon={Car}
                title="No rides found"
                description={`No rides from ${form.from} to ${form.to} on ${dateLabel}. Try a different date or remove filters.`}
                actionLabel="Adjust search"
                onAction={() => setShowFilters(true)}
              />
            )}

            {/* Pre-search hint */}
            {!loading && !hasSearched && (
              <div className="py-20 text-center">
                <div className="w-16 h-16 gradient-brand rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Search className="w-8 h-8 text-white" />
                </div>
                <p className="font-black text-gray-900 text-xl mb-2">Search for a ride</p>
                <p className="text-gray-500">Enter your origin, destination and date above to find available carpool rides.</p>
              </div>
            )}

            {/* Results */}
            {!loading && rides.length > 0 && (
              <div className="space-y-3">
                {rides.map(ride => (
                  <RideCard
                    key={ride.id}
                    ride={ride}
                    onClick={() => navigate(`/rides/${ride.id}`)}
                  />
                ))}
                {/* Load more placeholder */}
                <div className="text-center pt-4">
                  <button
                    onClick={() => doSearch(form, filters)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-100 hover:border-primary-200 rounded-2xl text-sm font-bold text-gray-600 hover:text-primary-700 transition-all">
                    <RefreshCw className="w-4 h-4" /> Refresh results
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
