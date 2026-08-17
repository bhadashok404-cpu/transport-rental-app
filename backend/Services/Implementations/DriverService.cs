using backend.Common;
using backend.DTOs.Driver;
using backend.Enums;
using backend.Models;
using backend.Repositories;
using backend.Services.Interfaces;
using backend.Services.Mappers;

namespace backend.Services.Implementations;

public class DriverService : IDriverService
{
    private readonly IUnitOfWork _unitOfWork;

    public DriverService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ServiceResult<PagedResult<DriverDto>>> GetPagedDriversAsync(PaginationParams pagination, string? searchTerm = null)
    {
        var pagedDrivers = await _unitOfWork.Drivers.GetPagedAsync(pagination, searchTerm);
        var dtos = pagedDrivers.Items.Select(d => d.ToDto()).ToList();

        var result = PagedResult<DriverDto>.Create(dtos, pagedDrivers.TotalCount, pagedDrivers.Page, pagedDrivers.PageSize);
        return ServiceResult<PagedResult<DriverDto>>.Success(result);
    }

    public async Task<ServiceResult<DriverDto>> GetDriverByIdAsync(int id)
    {
        var driver = await _unitOfWork.Drivers.GetByIdWithDetailsAsync(id);
        if (driver == null)
            return ServiceResult<DriverDto>.Failure("Driver not found");

        return ServiceResult<DriverDto>.Success(driver.ToDto());
    }

    public async Task<ServiceResult<IEnumerable<DriverDto>>> GetAvailableDriversAsync()
    {
        var drivers = await _unitOfWork.Drivers.GetAvailableDriversAsync();
        var dtos = drivers.Select(d => d.ToDto());
        return ServiceResult<IEnumerable<DriverDto>>.Success(dtos);
    }

    public async Task<ServiceResult<DriverDto>> CreateDriverAsync(CreateDriverRequest request)
    {
        var existingDriver = await _unitOfWork.Drivers.GetByEmailAsync(request.Email);
        if (existingDriver != null)
            return ServiceResult<DriverDto>.Failure("Email already exists");

        var driver = new Driver
        {
            FirstName = request.FirstName,
            LastName = request.LastName,
            Email = request.Email,
            PhoneNumber = request.PhoneNumber,
            LicenseNumber = request.LicenseNumber,
            LicenseExpiryDate = request.LicenseExpiryDate,
            Address = request.Address,
            ProfileImageUrl = request.ProfileImageUrl,
            Rating = 0,
            TotalTrips = 0,
            Status = DriverStatus.Available,
            IsVerified = false,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        await _unitOfWork.Drivers.AddAsync(driver);
        await _unitOfWork.SaveChangesAsync();

        return ServiceResult<DriverDto>.Success(driver.ToDto(), "Driver created successfully");
    }

    public async Task<ServiceResult<DriverDto>> UpdateDriverAsync(int id, UpdateDriverRequest request)
    {
        var driver = await _unitOfWork.Drivers.GetByIdAsync(id);
        if (driver == null)
            return ServiceResult<DriverDto>.Failure("Driver not found");

        var emailExists = await _unitOfWork.Drivers.ExistsAsync(d => d.Email == request.Email && d.Id != id);
        if (emailExists)
            return ServiceResult<DriverDto>.Failure("Email already exists");

        driver.FirstName = request.FirstName;
        driver.LastName = request.LastName;
        driver.Email = request.Email;
        driver.PhoneNumber = request.PhoneNumber;
        driver.LicenseNumber = request.LicenseNumber;
        driver.LicenseExpiryDate = request.LicenseExpiryDate;
        driver.Address = request.Address;
        driver.ProfileImageUrl = request.ProfileImageUrl;
        driver.Status = request.Status;
        driver.IsActive = request.IsActive;
        driver.UpdatedAt = DateTime.UtcNow;

        _unitOfWork.Drivers.Update(driver);
        await _unitOfWork.SaveChangesAsync();

        return ServiceResult<DriverDto>.Success(driver.ToDto(), "Driver updated successfully");
    }

    public async Task<ServiceResult> DeleteDriverAsync(int id)
    {
        var driver = await _unitOfWork.Drivers.GetByIdAsync(id);
        if (driver == null)
            return ServiceResult.Failure("Driver not found");

        _unitOfWork.Drivers.Remove(driver);
        await _unitOfWork.SaveChangesAsync();

        return ServiceResult.Success("Driver deleted successfully");
    }

    public async Task<ServiceResult> UpdateDriverStatusAsync(int id, DriverStatus status)
    {
        var driver = await _unitOfWork.Drivers.GetByIdAsync(id);
        if (driver == null)
            return ServiceResult.Failure("Driver not found");

        driver.Status = status;
        driver.LastActiveAt = DateTime.UtcNow;
        driver.UpdatedAt = DateTime.UtcNow;

        _unitOfWork.Drivers.Update(driver);
        await _unitOfWork.SaveChangesAsync();

        return ServiceResult.Success($"Driver status updated to {status}");
    }

    public async Task<ServiceResult> VerifyDriverAsync(int id)
    {
        var driver = await _unitOfWork.Drivers.GetByIdAsync(id);
        if (driver == null)
            return ServiceResult.Failure("Driver not found");

        driver.IsVerified = true;
        driver.UpdatedAt = DateTime.UtcNow;

        _unitOfWork.Drivers.Update(driver);
        await _unitOfWork.SaveChangesAsync();

        return ServiceResult.Success("Driver verified successfully");
    }
}
