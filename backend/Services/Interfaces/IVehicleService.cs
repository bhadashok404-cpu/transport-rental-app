using backend.Common;
using backend.DTOs.Vehicle;

namespace backend.Services.Interfaces;

public interface IVehicleService
{
    Task<ServiceResult<PagedResult<VehicleDto>>> GetPagedVehiclesAsync(PaginationParams pagination,
        string? searchTerm = null, int? categoryId = null, string? vehicleType = null,
        decimal? minPrice = null, decimal? maxPrice = null, bool? isAvailable = null);
    Task<ServiceResult<VehicleDto>> GetVehicleByIdAsync(int id);
    Task<ServiceResult<IEnumerable<VehicleDto>>> GetAvailableVehiclesAsync();
    Task<ServiceResult<IEnumerable<VehicleDto>>> GetVehiclesByCategoryAsync(int categoryId);
    Task<ServiceResult<VehicleDto>> CreateVehicleAsync(CreateVehicleRequest request);
    Task<ServiceResult<VehicleDto>> UpdateVehicleAsync(int id, UpdateVehicleRequest request);
    Task<ServiceResult> DeleteVehicleAsync(int id);
    Task<ServiceResult> ToggleAvailabilityAsync(int id);
}
