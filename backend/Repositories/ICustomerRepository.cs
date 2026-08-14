using backend.Common;
using backend.Models;

namespace backend.Repositories;

public interface ICustomerRepository : IRepository<Customer>
{
    Task<PagedResult<Customer>> GetPagedAsync(PaginationParams pagination, string? searchTerm = null);
    Task<Customer?> GetByEmailAsync(string email);
    Task<Customer?> GetByIdWithBookingsAsync(int id);
}
