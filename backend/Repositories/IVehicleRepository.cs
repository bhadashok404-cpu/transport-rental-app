using backend.Common;
using backend.Models;

namespace backend.Repositories;

public interface IVehicleRepository : IRepository<Vehicle>
{
    Task<PagedResult<Vehicle>> GetPagedAsync(PaginationParams pagination, string? searchTerm = null);
    Task<IEnumerable<Vehicle>> GetAvailableVehiclesAsync();
    Task<IEnumerable<Vehicle>> GetVehiclesByCategoryAsync(int categoryId);
    Task<Vehicle?> GetByIdWithDetailsAsync(int id);
}
