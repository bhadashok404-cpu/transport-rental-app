using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Repositories;

public class VehicleCategoryRepository : Repository<VehicleCategory>, IVehicleCategoryRepository
{
    public VehicleCategoryRepository(AppDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<VehicleCategory>> GetActiveCategoriesAsync()
    {
        return await _dbSet
            .Where(vc => vc.IsActive)
            .OrderBy(vc => vc.DisplayOrder)
            .ToListAsync();
    }

    public async Task<VehicleCategory?> GetByIdWithVehiclesAsync(int id)
    {
        return await _dbSet
            .Include(vc => vc.Vehicles.Where(v => v.IsActive))
            .FirstOrDefaultAsync(vc => vc.Id == id);
    }
}
