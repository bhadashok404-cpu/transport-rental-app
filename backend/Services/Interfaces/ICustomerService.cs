using backend.Common;
using backend.DTOs.Customer;

namespace backend.Services.Interfaces;

public interface ICustomerService
{
    Task<ServiceResult<PagedResult<CustomerDto>>> GetPagedCustomersAsync(PaginationParams pagination, string? searchTerm = null);
    Task<ServiceResult<CustomerDto>> GetCustomerByIdAsync(int id);
    Task<ServiceResult<CustomerDto>> GetCustomerByEmailAsync(string email);
    Task<ServiceResult<CustomerDto>> CreateCustomerAsync(CreateCustomerRequest request);
    Task<ServiceResult<CustomerDto>> UpdateCustomerAsync(int id, UpdateCustomerRequest request);
    Task<ServiceResult> DeleteCustomerAsync(int id);
    Task<ServiceResult> VerifyCustomerAsync(int id);
}
