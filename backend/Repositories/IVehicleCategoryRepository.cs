using backend.Models;

namespace backend.Repositories;

public interface IVehicleCategoryRepository : IRepository<VehicleCategory>
{
    Task<IEnumerable<VehicleCategory>> GetActiveCategoriesAsync();
    Task<VehicleCategory?> GetByIdWithVehiclesAsync(int id);
}
