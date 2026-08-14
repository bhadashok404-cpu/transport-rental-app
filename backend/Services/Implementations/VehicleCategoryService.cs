using backend.Common;
using backend.DTOs.VehicleCategory;
using backend.Models;
using backend.Repositories;
using backend.Services.Interfaces;
using backend.Services.Mappers;

namespace backend.Services.Implementations;

public class VehicleCategoryService : IVehicleCategoryService
{
    private readonly IUnitOfWork _unitOfWork;

    public VehicleCategoryService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ServiceResult<IEnumerable<VehicleCategoryDto>>> GetAllCategoriesAsync()
    {
        var categories = await _unitOfWork.VehicleCategories.GetAllAsync();
        var dtos = categories.Select(c => c.ToDto());
        return ServiceResult<IEnumerable<VehicleCategoryDto>>.Success(dtos);
    }

    public async Task<ServiceResult<IEnumerable<VehicleCategoryDto>>> GetActiveCategoriesAsync()
    {
        var categories = await _unitOfWork.VehicleCategories.GetActiveCategoriesAsync();
        var dtos = categories.Select(c => c.ToDto());
        return ServiceResult<IEnumerable<VehicleCategoryDto>>.Success(dtos);
    }

    public async Task<ServiceResult<VehicleCategoryDto>> GetCategoryByIdAsync(int id)
    {
        var category = await _unitOfWork.VehicleCategories.GetByIdWithVehiclesAsync(id);
        if (category == null)
            return ServiceResult<VehicleCategoryDto>.Failure("Category not found");

        return ServiceResult<VehicleCategoryDto>.Success(category.ToDto());
    }

    public async Task<ServiceResult<VehicleCategoryDto>> CreateCategoryAsync(CreateVehicleCategoryRequest request)
    {
        var category = new VehicleCategory
        {
            Name = request.Name,
            Description = request.Description,
            IconUrl = request.IconUrl,
            BasePrice = request.BasePrice,
            PricePerKm = request.PricePerKm,
            DisplayOrder = request.DisplayOrder,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        await _unitOfWork.VehicleCategories.AddAsync(category);
        await _unitOfWork.SaveChangesAsync();

        return ServiceResult<VehicleCategoryDto>.Success(category.ToDto(), "Category created successfully");
    }

    public async Task<ServiceResult<VehicleCategoryDto>> UpdateCategoryAsync(int id, UpdateVehicleCategoryRequest request)
    {
        var category = await _unitOfWork.VehicleCategories.GetByIdAsync(id);
        if (category == null)
            return ServiceResult<VehicleCategoryDto>.Failure("Category not found");

        category.Name = request.Name;
        category.Description = request.Description;
        category.IconUrl = request.IconUrl;
        category.BasePrice = request.BasePrice;
        category.PricePerKm = request.PricePerKm;
        category.DisplayOrder = request.DisplayOrder;
        category.IsActive = request.IsActive;
        category.UpdatedAt = DateTime.UtcNow;

        _unitOfWork.VehicleCategories.Update(category);
        await _unitOfWork.SaveChangesAsync();

        return ServiceResult<VehicleCategoryDto>.Success(category.ToDto(), "Category updated successfully");
    }

    public async Task<ServiceResult> DeleteCategoryAsync(int id)
    {
        var category = await _unitOfWork.VehicleCategories.GetByIdAsync(id);
        if (category == null)
            return ServiceResult.Failure("Category not found");

        _unitOfWork.VehicleCategories.Remove(category);
        await _unitOfWork.SaveChangesAsync();

        return ServiceResult.Success("Category deleted successfully");
    }
}
