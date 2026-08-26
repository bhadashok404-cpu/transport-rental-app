import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search, SlidersHorizontal, X, Car, Fuel, Users, Zap,
  Star, Shield, ChevronRight, ArrowRight, Sparkles, Filter
} from 'lucide-react';
import { vehicleService, vehicleCategoryService } from '../services';
import { Loader, Pagination, EmptyState } from '../components';
import { getVehiclePrimaryImage } from '../utils/carImages';

// ── Vehicle type config ───────────────────────────────────────────────────────
const VEHICLE_TYPES = ['Bike', 'Auto', 'MiniCab', 'Sedan', 'SUV', 'Tempo', 'Truck', 'Bus', 'Van'];

// ── Category gradient map ─────────────────────────────────────────────────────
const CAT_GRADIENTS = {
  Economy:    { from: 'from-emerald-500', to: 'to-teal-600',    icon: '🚗', text: 'text-emerald-600',  bg: 'bg-emerald-50',  border: 'border-emerald-200' },
  Premium:    { from: 'from-blue-500',    to: 'to-blue-600',    icon: '🏎️', text: 'text-blue-600',     bg: 'bg-blue-50',     border: 'border-blue-200' },
  Luxury:     { from: 'from-violet-600',  to: 'to-purple-700',  icon: '💎', text: 'text-violet-600',   bg: 'bg-violet-50',   border: 'border-violet-200' },
  SUV:        { from: 'from-orange-500',  to: 'to-amber-600',   icon: '🚙', text: 'text-orange-600',   bg: 'bg-orange-50',   border: 'border-orange-200' },
  Commercial: { from: 'from-rose-500',    to: 'to-pink-600',    icon: '🚚', text: 'text-rose-600',     bg: 'bg-rose-50',     border: 'border-rose-200' },
};

// ── Card gradient by index (cycles) ──────────────────────────────────────────
const CARD_GRADIENTS = [
  'from-blue-600 to-blue-800',
  'from-violet-600 to-purple-800',
  'from-emerald-500 to-teal-700',
  'from-orange-500 to-amber-700',
  'from-rose-500 to-pink-700',
  'from-cyan-500 to-blue-700',
  'from-indigo-500 to-violet-700',
  'from-teal-500 to-emerald-700',
  'from-fuchsia-500 to-violet-700',
  'from-amber-500 to-orange-700',
  'from-sky-500 to-cyan-700',
  'from-green-500 to-emerald-700',
];

const getCatConfig = (catName) => CAT_GRADIENTS[catName] || CAT_GRADIENTS.Economy;

// ── Filter Panel ──────────────────────────────────────────────────────────────
function FilterPanel({ filters, updateFilter, categories, activeFilterCount, clearFilters }) {
  return (
    <div className="space-y-6">
      {/* Category */}
      <div>
        <h4 className="font-black text-gray-800 text-sm mb-3 flex items-center gap-2">
          <span className="w-1.5 h-4 rounded-full gradient-brand inline-block" />
          Category
        </h4>
        <div className="space-y-1.5">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${!filters.categoryId ? 'border-primary-500 bg-primary-500' : 'border-gray-300 group-hover:border-primary-400'}`}>
              {!filters.categoryId && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
            </div>
            <input type="radio" name="cat" checked={!filters.categoryId} onChange={() => updateFilter('categoryId', '')} className="sr-only" />
            <span className="text-sm font-semibold text-gray-700 group-hover:text-primary-700 transition">All Categories</span>
          </label>
          {categories.map(cat => {
            const cfg = getCatConfig(cat.name);
            const isActive = filters.categoryId === String(cat.id);
            return (
              <label key={cat.id} className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${isActive ? `border-primary-500 bg-primary-500` : 'border-gray-300 group-hover:border-primary-400'}`}>
                  {isActive && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                </div>
                <input type="radio" name="cat" checked={isActive} onChange={() => updateFilter('categoryId', String(cat.id))} className="sr-only" />
                <span className={`text-sm font-semibold transition ${isActive ? cfg.text : 'text-gray-600 group-hover:text-gray-900'}`}>
                  {cfg.icon} {cat.name}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Vehicle Type */}
      <div>
        <h4 className="font-black text-gray-800 text-sm mb-3 flex items-center gap-2">
          <span className="w-1.5 h-4 rounded-full bg-violet-500 inline-block" />
          Vehicle Type
        </h4>
        <select
          value={filters.vehicleType}
          onChange={e => updateFilter('vehicleType', e.target.value)}
          className="w-full px-3.5 py-2.5 bg-white border-2 border-gray-100 rounded-xl text-sm font-semibold text-gray-700 focus:ring-2 focus:ring-primary-500 focus:border-primary-300 outline-none cursor-pointer hover:border-gray-300 transition"
        >
          <option value="">All Types</option>
          {VEHICLE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* Price Range */}
      <div>
        <h4 className="font-black text-gray-800 text-sm mb-3 flex items-center gap-2">
          <span className="w-1.5 h-4 rounded-full bg-emerald-500 inline-block" />
          Price Range (₹/day)
        </h4>
        <div className="flex gap-2 items-center">
          <input
            type="number" placeholder="Min" value={filters.minPrice}
            onChange={e => updateFilter('minPrice', e.target.value)}
            className="w-1/2 px-3 py-2.5 bg-white border-2 border-gray-100 rounded-xl text-sm font-semibold text-gray-700 focus:ring-2 focus:ring-primary-500 outline-none"
          />
          <div className="w-4 h-0.5 bg-gray-300 shrink-0" />
          <input
            type="number" placeholder="Max" value={filters.maxPrice}
            onChange={e => updateFilter('maxPrice', e.target.value)}
            className="w-1/2 px-3 py-2.5 bg-white border-2 border-gray-100 rounded-xl text-sm font-semibold text-gray-700 focus:ring-2 focus:ring-primary-500 outline-none"
          />
        </div>
      </div>

      {/* Availability toggle */}
      <div>
        <label className="flex items-center gap-3 cursor-pointer group">
          <div
            onClick={() => updateFilter('isAvailable', !filters.isAvailable)}
            className={`relative w-10 h-5.5 rounded-full transition-all duration-300 cursor-pointer ${filters.isAvailable ? 'bg-primary-600' : 'bg-gray-300'}`}
            style={{ height: '22px' }}
          >
            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${filters.isAvailable ? 'left-5' : 'left-0.5'}`} />
          </div>
          <span className="text-sm font-semibold text-gray-700">Available only</span>
        </label>
      </div>

      {/* Clear */}
      {activeFilterCount > 0 && (
        <button
          onClick={clearFilters}
          className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-bold text-rose-600 bg-rose-50 border border-rose-200 rounded-xl hover:bg-rose-100 transition"
        >
          <X className="w-4 h-4" /> Clear All Filters
        </button>
      )}
    </div>
  );
}

// ── Vehicle Card ──────────────────────────────────────────────────────────────
function VehicleCard({ vehicle, index, onClick }) {
  const gradient = CARD_GRADIENTS[index % CARD_GRADIENTS.length];
  const catCfg = getCatConfig(vehicle.vehicleCategory?.name);
  const imgSrc = getVehiclePrimaryImage(vehicle);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  return (
    <div
      onClick={onClick}
      className="group relative bg-white rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
      style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}
    >
      {/* ── Image area with gradient overlay ── */}
      <div className={`relative h-52 bg-linear-to-br ${gradient} overflow-hidden`}>
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '20px 20px' }} />

        {/* Decorative circles */}
        <div className="absolute -top-6 -right-6 w-28 h-28 bg-white/10 rounded-full" />
        <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-white/10 rounded-full" />

        {/* Car image */}
        {!imgError ? (
          <img
            src={imgSrc}
            alt={`${vehicle.make} ${vehicle.model}`}
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
            className={`absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
          />
        ) : null}

        {/* Gradient overlay on image */}
        {imgLoaded && !imgError && (
          <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent" />
        )}

        {/* Fallback car icon */}
        {(!imgLoaded || imgError) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Car className="w-20 h-20 text-white/50" />
          </div>
        )}

        {/* Availability badge */}
        <div className="absolute top-3 left-3">
          <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-black backdrop-blur-sm border ${vehicle.isAvailable ? 'bg-emerald-500/90 border-emerald-400/50 text-white' : 'bg-gray-800/80 border-gray-600/50 text-gray-200'}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${vehicle.isAvailable ? 'bg-white animate-pulse' : 'bg-gray-400'}`} />
            {vehicle.isAvailable ? 'Available' : 'Unavailable'}
          </div>
        </div>

        {/* Category badge */}
        {vehicle.vehicleCategory && (
          <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm text-white text-[11px] font-black px-2.5 py-1.5 rounded-full border border-white/20">
            {vehicle.vehicleCategory.name}
          </div>
        )}

        {/* Bottom price on image */}
        <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-sm rounded-xl px-3 py-1.5 border border-white/20">
          <span className="text-white font-black text-sm">₹{vehicle.pricePerDay}</span>
          <span className="text-white/70 text-xs">/day</span>
        </div>
      </div>

      {/* ── Card body ── */}
      <div className="p-5">
        {/* Title row */}
        <div className="flex items-start justify-between mb-1">
          <div>
            <h3 className="font-black text-gray-900 text-base leading-tight group-hover:text-primary-700 transition">
              {vehicle.make} {vehicle.model}
            </h3>
            <p className="text-gray-400 text-xs font-medium mt-0.5">{vehicle.year} · {vehicle.fuelType}</p>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-primary-500 group-hover:translate-x-1 transition-all duration-200 shrink-0 mt-0.5" />
        </div>

        {/* Specs row */}
        <div className="flex items-center gap-3 my-3">
          {[
            { icon: Users, label: `${vehicle.seatingCapacity} seats` },
            { icon: Fuel,  label: vehicle.fuelType },
            { icon: Car,   label: vehicle.vehicleType },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-1 text-[11px] font-semibold text-gray-500 bg-gray-50 px-2 py-1 rounded-lg">
              <Icon className="w-3 h-3 text-gray-400 shrink-0" />
              {label}
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-100 mb-4" />

        {/* CTA row */}
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-primary-700">₹{vehicle.pricePerDay}</span>
            <span className="text-gray-400 text-xs font-medium">/day</span>
          </div>
          <button
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-black text-white transition-all duration-200 hover:-translate-y-0.5 shadow-md hover:shadow-lg"
            style={{ background: 'linear-gradient(135deg,#2563eb,#7c3aed)' }}
            onClick={e => { e.stopPropagation(); onClick(); }}
          >
            Book Now <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Bottom color accent line */}
      <div className={`h-1 w-full bg-linear-to-r ${gradient}`} />
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function Vehicles() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [vehicles,    setVehicles]    = useState([]);
  const [categories,  setCategories]  = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [totalPages,  setTotalPages]  = useState(1);
  const [totalCount,  setTotalCount]  = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [filters, setFilters] = useState({
    search:      searchParams.get('search')     || '',
    categoryId:  searchParams.get('categoryId') || '',
    vehicleType: '',
    minPrice:    '',
    maxPrice:    '',
    isAvailable: true,
    page:        1,
    pageSize:    12,
  });

  const loadCategories = useCallback(() => {
    vehicleCategoryService.getActive()
      .then(res => setCategories(res?.data || res?.items || res || []))
      .catch(() => {});
  }, []);

  const loadVehicles = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        pageNumber: filters.page,
        pageSize:   filters.pageSize,
        ...(filters.search      && { searchTerm:  filters.search }),
        ...(filters.categoryId  && { categoryId:  filters.categoryId }),
        ...(filters.vehicleType && { vehicleType: filters.vehicleType }),
        ...(filters.minPrice    && { minPrice:     filters.minPrice }),
        ...(filters.maxPrice    && { maxPrice:     filters.maxPrice }),
        isAvailable: filters.isAvailable,
      };
      const res  = await vehicleService.getAll(params);
      const data = res?.data || res;
      setVehicles(data?.items || data || []);
      setTotalPages(data?.totalPages || 1);
      setTotalCount(data?.totalCount || 0);
    } catch {
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { loadCategories(); }, [loadCategories]);
  useEffect(() => { loadVehicles();   }, [loadVehicles]);

  const updateFilter = (key, value) => setFilters(f => ({ ...f, [key]: value, page: 1 }));
  const clearFilters = () => {
    setFilters({ search:'', categoryId:'', vehicleType:'', minPrice:'', maxPrice:'', isAvailable:true, page:1, pageSize:12 });
    setSearchParams({});
  };

  const activeFilterCount = [filters.categoryId, filters.vehicleType, filters.minPrice, filters.maxPrice].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Hero banner ── */}
      <div className="relative overflow-hidden gradient-hero py-14 sm:py-16">
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div className="blob blob-blue w-72 h-72 top-0 right-0 translate-x-1/3 -translate-y-1/3 opacity-30" />
        <div className="blob blob-violet w-56 h-56 bottom-0 left-0 -translate-x-1/4 translate-y-1/3 opacity-25" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="px-3 py-1 bg-white/10 border border-white/20 text-white/80 text-xs font-bold rounded-full uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" /> Premium Fleet
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-3">
            Browse <span className="shimmer-text">All Vehicles</span>
          </h1>
          <p className="text-white/60 text-base sm:text-lg max-w-xl">
            {totalCount > 0
              ? <><span className="text-white font-bold">{totalCount} vehicles</span> available — from ₹140/day</>
              : 'Find your perfect ride across all categories and budgets.'}
          </p>

          {/* Inline search */}
          <div className="mt-7 flex gap-3 max-w-2xl">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by make, model or type..."
                value={filters.search}
                onChange={e => updateFilter('search', e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white/95 backdrop-blur rounded-2xl text-gray-900 font-medium placeholder-gray-400 outline-none focus:ring-4 focus:ring-primary-400/30 shadow-xl text-sm"
              />
            </div>
            <button
              onClick={() => setSidebarOpen(v => !v)}
              className={`lg:hidden flex items-center gap-2 px-5 py-4 rounded-2xl font-bold text-sm transition-all ${sidebarOpen ? 'bg-white text-primary-700' : 'bg-white/15 text-white border border-white/25 hover:bg-white/20'}`}
            >
              <Filter className="w-4 h-4" />
              Filters {activeFilterCount > 0 && <span className="w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center text-xs font-black">{activeFilterCount}</span>}
            </button>
          </div>

          {/* Category quick chips */}
          {categories.length > 0 && (
            <div className="flex gap-2 mt-4 flex-wrap">
              <button
                onClick={() => updateFilter('categoryId', '')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${!filters.categoryId ? 'bg-white text-primary-700 shadow-lg' : 'bg-white/10 text-white/70 border border-white/20 hover:bg-white/20'}`}
              >
                All
              </button>
              {categories.map(cat => {
                const cfg = getCatConfig(cat.name);
                const isActive = filters.categoryId === String(cat.id);
                return (
                  <button key={cat.id}
                    onClick={() => updateFilter('categoryId', isActive ? '' : String(cat.id))}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${isActive ? 'bg-white text-gray-900 shadow-lg' : 'bg-white/10 text-white/70 border border-white/20 hover:bg-white/20'}`}>
                    {cfg.icon} {cat.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">

          {/* ── Filter sidebar — desktop ── */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-black text-gray-900 flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-primary-500" /> Filters
                </h3>
                {activeFilterCount > 0 && (
                  <span className="w-6 h-6 gradient-brand text-white rounded-full flex items-center justify-center text-xs font-black shadow">
                    {activeFilterCount}
                  </span>
                )}
              </div>
              <FilterPanel filters={filters} updateFilter={updateFilter} categories={categories} activeFilterCount={activeFilterCount} clearFilters={clearFilters} />
            </div>
          </aside>

          {/* ── Mobile filter drawer ── */}
          {sidebarOpen && (
            <div className="lg:hidden fixed inset-0 z-50 flex">
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
              <div className="relative ml-auto w-80 h-full bg-white overflow-y-auto shadow-2xl">
                <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white z-10">
                  <h3 className="font-black text-gray-900 flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-primary-500" /> Filters
                  </h3>
                  <button onClick={() => setSidebarOpen(false)} className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-5">
                  <FilterPanel filters={filters} updateFilter={updateFilter} categories={categories} activeFilterCount={activeFilterCount} clearFilters={clearFilters} />
                </div>
              </div>
            </div>
          )}

          {/* ── Vehicle grid ── */}
          <div className="flex-1 min-w-0">
            {/* Result count bar */}
            {!loading && vehicles.length > 0 && (
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm font-semibold text-gray-500">
                  Showing <span className="text-gray-900 font-black">{vehicles.length}</span> of <span className="text-gray-900 font-black">{totalCount}</span> vehicles
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Shield className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="font-medium">All verified & insured</span>
                </div>
              </div>
            )}

            {loading ? (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array(6).fill(0).map((_, i) => (
                  <div key={i} className="bg-white rounded-3xl overflow-hidden animate-pulse" style={{ height: 380 }}>
                    <div className="h-52 bg-gray-200" />
                    <div className="p-5 space-y-3">
                      <div className="h-4 bg-gray-200 rounded-full w-3/4" />
                      <div className="h-3 bg-gray-100 rounded-full w-1/2" />
                      <div className="flex gap-2">
                        {[1,2,3].map(j => <div key={j} className="h-6 bg-gray-100 rounded-lg flex-1" />)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : vehicles.length === 0 ? (
              <EmptyState
                icon={Car}
                title="No vehicles found"
                description="Try adjusting your filters or search query"
                actionLabel="Clear Filters"
                onAction={clearFilters}
              />
            ) : (
              <>
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {vehicles.map((v, i) => (
                    <VehicleCard
                      key={v.id}
                      vehicle={v}
                      index={i}
                      onClick={() => navigate(`/vehicles/${v.id}`)}
                    />
                  ))}
                </div>
                <Pagination
                  currentPage={filters.page}
                  totalPages={totalPages}
                  onPageChange={p => setFilters(f => ({ ...f, page: p }))}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
