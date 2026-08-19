using backend.Common;
using backend.DTOs.Vehicle;
using backend.Enums;
using backend.Models;
using backend.Repositories;
using backend.Services.Interfaces;
using backend.Services.Mappers;

namespace backend.Services.Implementations;

public class VehicleService : IVehicleService
{
    private readonly IUnitOfWork _unitOfWork;

    public VehicleService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ServiceResult<PagedResult<VehicleDto>>> GetPagedVehiclesAsync(PaginationParams pagination,
        string? searchTerm = null, int? categoryId = null, string? vehicleType = null,
        decimal? minPrice = null, decimal? maxPrice = null, bool? isAvailable = null)
    {
        var pagedVehicles = await _unitOfWork.Vehicles.GetPagedAsync(pagination, searchTerm,
            categoryId, vehicleType, minPrice, maxPrice, isAvailable);
        var dtos = pagedVehicles.Items.Select(v => v.ToDto()).ToList();
        var result = PagedResult<VehicleDto>.Create(dtos, pagedVehicles.TotalCount, pagedVehicles.Page, pagedVehicles.PageSize);
        return ServiceResult<PagedResult<VehicleDto>>.Success(result);
    }

    public async Task<ServiceResult<VehicleDto>> GetVehicleByIdAsync(int id)
    {
        var vehicle = await _unitOfWork.Vehicles.GetByIdWithDetailsAsync(id);
        if (vehicle == null)
            return ServiceResult<VehicleDto>.Failure("Vehicle not found");

        return ServiceResult<VehicleDto>.Success(vehicle.ToDto());
    }

    public async Task<ServiceResult<IEnumerable<VehicleDto>>> GetAvailableVehiclesAsync()
    {
        var vehicles = await _unitOfWork.Vehicles.GetAvailableVehiclesAsync();
        var dtos = vehicles.Select(v => v.ToDto());
        return ServiceResult<IEnumerable<VehicleDto>>.Success(dtos);
    }

    public async Task<ServiceResult<IEnumerable<VehicleDto>>> GetVehiclesByCategoryAsync(int categoryId)
    {
        var vehicles = await _unitOfWork.Vehicles.GetVehiclesByCategoryAsync(categoryId);
        var dtos = vehicles.Select(v => v.ToDto());
        return ServiceResult<IEnumerable<VehicleDto>>.Success(dtos);
    }

    public async Task<ServiceResult<VehicleDto>> CreateVehicleAsync(CreateVehicleRequest request)
    {
        if (!IsCar(request.VehicleType))
            return ServiceResult<VehicleDto>.Failure("Only four-wheeler cars are supported");

        var category = await _unitOfWork.VehicleCategories.GetByIdAsync(request.VehicleCategoryId);
        if (category == null)
            return ServiceResult<VehicleDto>.Failure("Vehicle category not found");

        var vehicle = new Vehicle
        {
            RegistrationNumber = request.RegistrationNumber,
            Make = request.Make,
            Model = request.Model,
            Year = request.Year,
            VehicleType = request.VehicleType,
            VehicleCategoryId = request.VehicleCategoryId,
            PricePerDay = request.PricePerDay,
            PricePerKm = request.PricePerKm,
            SeatingCapacity = request.SeatingCapacity,
            FuelType = request.FuelType,
            ImageUrl = request.ImageUrl,
            IsAvailable = true,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        await _unitOfWork.Vehicles.AddAsync(vehicle);
        await _unitOfWork.SaveChangesAsync();

        var createdVehicle = await _unitOfWork.Vehicles.GetByIdWithDetailsAsync(vehicle.Id);
        return ServiceResult<VehicleDto>.Success(createdVehicle!.ToDto(), "Vehicle created successfully");
    }

    public async Task<ServiceResult<VehicleDto>> UpdateVehicleAsync(int id, UpdateVehicleRequest request)
    {
        if (!IsCar(request.VehicleType))
            return ServiceResult<VehicleDto>.Failure("Only four-wheeler cars are supported");

        var vehicle = await _unitOfWork.Vehicles.GetByIdAsync(id);
        if (vehicle == null)
            return ServiceResult<VehicleDto>.Failure("Vehicle not found");

        var category = await _unitOfWork.VehicleCategories.GetByIdAsync(request.VehicleCategoryId);
        if (category == null)
            return ServiceResult<VehicleDto>.Failure("Vehicle category not found");

        vehicle.RegistrationNumber = request.RegistrationNumber;
        vehicle.Make = request.Make;
        vehicle.Model = request.Model;
        vehicle.Year = request.Year;
        vehicle.VehicleType = request.VehicleType;
        vehicle.VehicleCategoryId = request.VehicleCategoryId;
        vehicle.PricePerDay = request.PricePerDay;
        vehicle.PricePerKm = request.PricePerKm;
        vehicle.SeatingCapacity = request.SeatingCapacity;
        vehicle.FuelType = request.FuelType;
        vehicle.ImageUrl = request.ImageUrl;
        vehicle.IsAvailable = request.IsAvailable;
        vehicle.IsActive = request.IsActive;
        vehicle.UpdatedAt = DateTime.UtcNow;

        _unitOfWork.Vehicles.Update(vehicle);
        await _unitOfWork.SaveChangesAsync();

        var updatedVehicle = await _unitOfWork.Vehicles.GetByIdWithDetailsAsync(id);
        return ServiceResult<VehicleDto>.Success(updatedVehicle!.ToDto(), "Vehicle updated successfully");
    }

    public async Task<ServiceResult> DeleteVehicleAsync(int id)
    {
        var vehicle = await _unitOfWork.Vehicles.GetByIdAsync(id);
        if (vehicle == null)
            return ServiceResult.Failure("Vehicle not found");

        _unitOfWork.Vehicles.Remove(vehicle);
        await _unitOfWork.SaveChangesAsync();

        return ServiceResult.Success("Vehicle deleted successfully");
    }

    public async Task<ServiceResult> ToggleAvailabilityAsync(int id)
    {
        var vehicle = await _unitOfWork.Vehicles.GetByIdAsync(id);
        if (vehicle == null)
            return ServiceResult.Failure("Vehicle not found");

        vehicle.IsAvailable = !vehicle.IsAvailable;
        vehicle.UpdatedAt = DateTime.UtcNow;

        _unitOfWork.Vehicles.Update(vehicle);
        await _unitOfWork.SaveChangesAsync();

        return ServiceResult.Success($"Vehicle availability toggled to {vehicle.IsAvailable}");
    }

    private static bool IsCar(VehicleType vehicleType) =>
        vehicleType is VehicleType.MiniCab or VehicleType.Sedan or VehicleType.SUV or VehicleType.Van;
}
