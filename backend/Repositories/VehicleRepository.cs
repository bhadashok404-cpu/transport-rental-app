using backend.Common;
using backend.Data;
using backend.Enums;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Repositories;

public class VehicleRepository : Repository<Vehicle>, IVehicleRepository
{
    private static readonly VehicleType[] CarTypes =
        [VehicleType.MiniCab, VehicleType.Sedan, VehicleType.SUV, VehicleType.Van];

    public VehicleRepository(AppDbContext context) : base(context)
    {
    }

    public async Task<PagedResult<Vehicle>> GetPagedAsync(PaginationParams pagination, string? searchTerm = null,
        int? categoryId = null, string? vehicleType = null, decimal? minPrice = null,
        decimal? maxPrice = null, bool? isAvailable = null)
    {
        var query = _dbSet
            .Include(v => v.VehicleCategory)
            .Include(v => v.CurrentDriver)
            .Where(v => v.IsActive && CarTypes.Contains(v.VehicleType))
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            query = query.Where(v =>
                v.RegistrationNumber.Contains(searchTerm) ||
                v.Make.Contains(searchTerm) ||
                v.Model.Contains(searchTerm) ||
                v.FuelType.Contains(searchTerm));
        }

        if (categoryId.HasValue)
            query = query.Where(v => v.VehicleCategoryId == categoryId.Value);

        if (!string.IsNullOrWhiteSpace(vehicleType) &&
            Enum.TryParse<VehicleType>(vehicleType, true, out var parsedType))
            query = query.Where(v => v.VehicleType == parsedType);

        if (minPrice.HasValue)
            query = query.Where(v => v.PricePerDay >= minPrice.Value);

        if (maxPrice.HasValue)
            query = query.Where(v => v.PricePerDay <= maxPrice.Value);

        if (isAvailable.HasValue)
            query = query.Where(v => v.IsAvailable == isAvailable.Value);

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderBy(v => v.PricePerDay)
            .Skip(pagination.Skip)
            .Take(pagination.PageSize)
            .ToListAsync();

        return PagedResult<Vehicle>.Create(items, totalCount, pagination.Page, pagination.PageSize);
    }

    public async Task<IEnumerable<Vehicle>> GetAvailableVehiclesAsync()
    {
        return await _dbSet
            .Include(v => v.VehicleCategory)
            .Where(v => v.IsAvailable && v.IsActive && CarTypes.Contains(v.VehicleType))
            .ToListAsync();
    }

    public async Task<IEnumerable<Vehicle>> GetVehiclesByCategoryAsync(int categoryId)
    {
        return await _dbSet
            .Include(v => v.VehicleCategory)
            .Where(v => v.VehicleCategoryId == categoryId && v.IsActive && CarTypes.Contains(v.VehicleType))
            .ToListAsync();
    }

    public async Task<Vehicle?> GetByIdWithDetailsAsync(int id)
    {
        return await _dbSet
            .Include(v => v.VehicleCategory)
            .Include(v => v.CurrentDriver)
            .FirstOrDefaultAsync(v => v.Id == id && CarTypes.Contains(v.VehicleType));
    }

    private static bool IsCar(VehicleType vehicleType) =>
        vehicleType is VehicleType.MiniCab or VehicleType.Sedan or VehicleType.SUV or VehicleType.Van;
}
