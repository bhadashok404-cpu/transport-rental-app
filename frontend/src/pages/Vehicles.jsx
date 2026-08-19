import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X, Car, Fuel, Users } from 'lucide-react';
import { vehicleService, vehicleCategoryService } from '../services';
import { Loader, Pagination, EmptyState, Badge } from '../components';

const VEHICLE_TYPES = ['MiniCab', 'Sedan', 'SUV', 'Van'];

export default function Vehicles() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [vehicles, setVehicles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    categoryId: searchParams.get('categoryId') || '',
    vehicleType: '',
    minPrice: '',
    maxPrice: '',
    isAvailable: true,
    page: 1,
    pageSize: 12,
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
        pageNumber: filters.page,   // maps to PaginationParams.PageNumber → Page
        pageSize: filters.pageSize,
        ...(filters.search     && { searchTerm:  filters.search }),
        ...(filters.categoryId && { categoryId:  filters.categoryId }),
        ...(filters.vehicleType && { vehicleType: filters.vehicleType }),
        ...(filters.minPrice   && { minPrice:     filters.minPrice }),
        ...(filters.maxPrice   && { maxPrice:     filters.maxPrice }),
        isAvailable: filters.isAvailable,
      };
      const res = await vehicleService.getAll(params);
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
  useEffect(() => { loadVehicles(); }, [loadVehicles]);

  const updateFilter = (key, value) => {
    setFilters(f => ({ ...f, [key]: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({ search: '', categoryId: '', vehicleType: '', minPrice: '', maxPrice: '', isAvailable: true, page: 1, pageSize: 12 });
    setSearchParams({});
  };

  const activeFilterCount = [filters.categoryId, filters.vehicleType, filters.minPrice, filters.maxPrice].filter(Boolean).length;

  const FilterPanel = () => (
    <div className="space-y-7">
      <div>
        <h4 className="font-bold text-gray-900 mb-3">Category</h4>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="cat" checked={!filters.categoryId} onChange={() => updateFilter('categoryId', '')} className="text-primary-600" />
            <span className="text-sm text-gray-700">All Categories</span>
          </label>
          {categories.map(cat => (
            <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="cat" checked={filters.categoryId === String(cat.id)} onChange={() => updateFilter('categoryId', String(cat.id))} className="text-primary-600" />
              <span className="text-sm text-gray-700">{cat.name}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-bold text-gray-900 mb-3">Vehicle Type</h4>
        <select value={filters.vehicleType} onChange={e => updateFilter('vehicleType', e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none">
          <option value="">All Types</option>
          {VEHICLE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div>
        <h4 className="font-bold text-gray-900 mb-3">Price Range (₹/day)</h4>
        <div className="flex gap-2 items-center">
          <input type="number" placeholder="Min" value={filters.minPrice} onChange={e => updateFilter('minPrice', e.target.value)} className="w-1/2 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
          <span className="text-gray-400 text-sm">—</span>
          <input type="number" placeholder="Max" value={filters.maxPrice} onChange={e => updateFilter('maxPrice', e.target.value)} className="w-1/2 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
        </div>
      </div>

      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={filters.isAvailable} onChange={e => updateFilter('isAvailable', e.target.checked)} className="w-4 h-4 text-primary-600 rounded" />
          <span className="text-sm text-gray-700 font-medium">Available only</span>
        </label>
      </div>

      {activeFilterCount > 0 && (
        <button onClick={clearFilters} className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 font-medium">
          <X className="w-4 h-4" /> Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Browse Vehicles</h1>
        <p className="text-gray-500">
          {totalCount > 0 ? `${totalCount} vehicles found` : 'Find your perfect ride'}
        </p>
      </div>

      {/* Search + filter bar */}
      <div className="flex gap-3 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by make, model or location..."
            value={filters.search}
            onChange={e => updateFilter('search', e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none shadow-sm"
          />
        </div>
        <button
          onClick={() => setSidebarOpen(v => !v)}
          className={`lg:hidden flex items-center gap-2 px-5 py-3.5 rounded-xl border-2 font-semibold text-sm transition ${sidebarOpen ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-700 hover:border-gray-300'}`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters {activeFilterCount > 0 && <span className="w-5 h-5 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs">{activeFilterCount}</span>}
        </button>
      </div>

      <div className="flex gap-8">
        {/* Sidebar — desktop */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-24 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4" /> Filters
              </h3>
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs font-bold">{activeFilterCount}</span>
              )}
            </div>
            <FilterPanel />
          </div>
        </aside>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-40 flex">
            <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
            <div className="relative ml-auto w-72 h-full bg-white overflow-y-auto p-6 shadow-xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-gray-900">Filters</h3>
                <button onClick={() => setSidebarOpen(false)}><X className="w-5 h-5" /></button>
              </div>
              <FilterPanel />
            </div>
          </div>
        )}

        {/* Vehicle grid */}
        <div className="flex-1 min-w-0">
          {loading ? <Loader /> : vehicles.length === 0 ? (
            <EmptyState icon={Car} title="No vehicles found" description="Try adjusting your filters or search query" actionLabel="Clear Filters" onAction={clearFilters} />
          ) : (
            <>
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {vehicles.map(v => (
                  <VehicleCard key={v.id} vehicle={v} onClick={() => navigate(`/vehicles/${v.id}`)} />
                ))}
              </div>
              <Pagination currentPage={filters.page} totalPages={totalPages} onPageChange={p => setFilters(f => ({ ...f, page: p }))} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function VehicleCard({ vehicle, onClick }) {
  return (
    <div onClick={onClick} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className="relative h-48 bg-gray-100 flex flex-col items-center justify-center text-gray-400">
        <Car className="w-16 h-16 mb-2" />
        <span className="text-xs font-medium">Vehicle photos coming soon</span>
        <div className="absolute top-3 left-3">
          <Badge status={vehicle.isAvailable ? 'Available' : 'Busy'} />
        </div>
        {vehicle.vehicleCategory && (
          <div className="absolute top-3 right-3 bg-black/60 text-white text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm">
            {vehicle.vehicleCategory.name}
          </div>
        )}
      </div>
      <div className="p-5">
        <h3 className="font-bold text-gray-900 text-lg group-hover:text-primary-700 transition leading-tight">
          {vehicle.make} {vehicle.model}
        </h3>
        <p className="text-gray-400 text-sm mb-3">{vehicle.year} · Registration shared after confirmation</p>
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
          <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{vehicle.seatingCapacity} seats</span>
          <span className="flex items-center gap-1"><Fuel className="w-3.5 h-3.5" />{vehicle.fuelType}</span>
          <span className="flex items-center gap-1"><Car className="w-3.5 h-3.5" />{vehicle.vehicleType}</span>
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div>
            <span className="text-2xl font-extrabold text-primary-700">₹{vehicle.pricePerDay}</span>
            <span className="text-gray-400 text-sm">/day</span>
          </div>
          <button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-lg transition shadow">
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
}
