using backend.Common;
using backend.DTOs.Driver;
using backend.Enums;

namespace backend.Services.Interfaces;

public interface IDriverService
{
    Task<ServiceResult<PagedResult<DriverDto>>> GetPagedDriversAsync(PaginationParams pagination, string? searchTerm = null);
    Task<ServiceResult<DriverDto>> GetDriverByIdAsync(int id);
    Task<ServiceResult<IEnumerable<DriverDto>>> GetAvailableDriversAsync();
    Task<ServiceResult<DriverDto>> CreateDriverAsync(CreateDriverRequest request);
    Task<ServiceResult<DriverDto>> UpdateDriverAsync(int id, UpdateDriverRequest request);
    Task<ServiceResult> DeleteDriverAsync(int id);
    Task<ServiceResult> UpdateDriverStatusAsync(int id, DriverStatus status);
    Task<ServiceResult> VerifyDriverAsync(int id);
}
