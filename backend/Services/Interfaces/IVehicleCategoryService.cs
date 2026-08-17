using backend.Common;
using backend.DTOs.VehicleCategory;

namespace backend.Services.Interfaces;

public interface IVehicleCategoryService
{
    Task<ServiceResult<IEnumerable<VehicleCategoryDto>>> GetAllCategoriesAsync();
    Task<ServiceResult<IEnumerable<VehicleCategoryDto>>> GetActiveCategoriesAsync();
    Task<ServiceResult<VehicleCategoryDto>> GetCategoryByIdAsync(int id);
    Task<ServiceResult<VehicleCategoryDto>> CreateCategoryAsync(CreateVehicleCategoryRequest request);
    Task<ServiceResult<VehicleCategoryDto>> UpdateCategoryAsync(int id, UpdateVehicleCategoryRequest request);
    Task<ServiceResult> DeleteCategoryAsync(int id);
}
