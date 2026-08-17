using backend.Common;
using backend.Models;
using backend.Enums;

namespace backend.Repositories;

public interface IVehicleRepository : IRepository<Vehicle>
{
    Task<PagedResult<Vehicle>> GetPagedAsync(PaginationParams pagination, string? searchTerm = null,
        int? categoryId = null, string? vehicleType = null, decimal? minPrice = null,
        decimal? maxPrice = null, bool? isAvailable = null);
    Task<IEnumerable<Vehicle>> GetAvailableVehiclesAsync();
    Task<IEnumerable<Vehicle>> GetVehiclesByCategoryAsync(int categoryId);
    Task<Vehicle?> GetByIdWithDetailsAsync(int id);
}
