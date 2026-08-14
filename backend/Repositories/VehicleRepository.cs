using backend.Common;
using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Repositories;

public class VehicleRepository : Repository<Vehicle>, IVehicleRepository
{
    public VehicleRepository(AppDbContext context) : base(context)
    {
    }

    public async Task<PagedResult<Vehicle>> GetPagedAsync(PaginationParams pagination, string? searchTerm = null)
    {
        var query = _dbSet
            .Include(v => v.VehicleCategory)
            .Include(v => v.CurrentDriver)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            query = query.Where(v =>
                v.RegistrationNumber.Contains(searchTerm) ||
                v.Make.Contains(searchTerm) ||
                v.Model.Contains(searchTerm));
        }

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderBy(v => v.Id)
            .Skip(pagination.Skip)
            .Take(pagination.PageSize)
            .ToListAsync();

        return PagedResult<Vehicle>.Create(items, totalCount, pagination.Page, pagination.PageSize);
    }

    public async Task<IEnumerable<Vehicle>> GetAvailableVehiclesAsync()
    {
        return await _dbSet
            .Include(v => v.VehicleCategory)
            .Where(v => v.IsAvailable && v.IsActive)
            .ToListAsync();
    }

    public async Task<IEnumerable<Vehicle>> GetVehiclesByCategoryAsync(int categoryId)
    {
        return await _dbSet
            .Include(v => v.VehicleCategory)
            .Where(v => v.VehicleCategoryId == categoryId && v.IsActive)
            .ToListAsync();
    }

    public async Task<Vehicle?> GetByIdWithDetailsAsync(int id)
    {
        return await _dbSet
            .Include(v => v.VehicleCategory)
            .Include(v => v.CurrentDriver)
            .FirstOrDefaultAsync(v => v.Id == id);
    }
}
