using backend.Data;
using backend.Enums;
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
            .Where(vc => vc.IsActive && vc.Vehicles.Any(v =>
                v.IsActive && (v.VehicleType == VehicleType.MiniCab || v.VehicleType == VehicleType.Sedan ||
                    v.VehicleType == VehicleType.SUV || v.VehicleType == VehicleType.Van)))
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
