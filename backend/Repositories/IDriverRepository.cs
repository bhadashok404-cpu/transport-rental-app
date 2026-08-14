using backend.Common;
using backend.Enums;
using backend.Models;

namespace backend.Repositories;

public interface IDriverRepository : IRepository<Driver>
{
    Task<PagedResult<Driver>> GetPagedAsync(PaginationParams pagination, string? searchTerm = null);
    Task<IEnumerable<Driver>> GetAvailableDriversAsync();
    Task<Driver?> GetByEmailAsync(string email);
    Task<Driver?> GetByIdWithDetailsAsync(int id);
    Task<IEnumerable<Driver>> GetDriversByStatusAsync(DriverStatus status);
}
