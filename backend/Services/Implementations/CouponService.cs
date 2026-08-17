using backend.Common;
using backend.DTOs.Coupon;
using backend.Models;
using backend.Repositories;
using backend.Services.Interfaces;
using backend.Services.Mappers;

namespace backend.Services.Implementations;

public class CouponService : ICouponService
{
    private readonly IUnitOfWork _unitOfWork;

    public CouponService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ServiceResult<IEnumerable<CouponDto>>> GetAllCouponsAsync()
    {
        var coupons = await _unitOfWork.Coupons.GetAllAsync();
        var dtos = coupons.Select(c => c.ToDto());
        return ServiceResult<IEnumerable<CouponDto>>.Success(dtos);
    }

    public async Task<ServiceResult<IEnumerable<CouponDto>>> GetActiveCouponsAsync()
    {
        var coupons = await _unitOfWork.Coupons.GetActiveCouponsAsync();
        var dtos = coupons.Select(c => c.ToDto());
        return ServiceResult<IEnumerable<CouponDto>>.Success(dtos);
    }

    public async Task<ServiceResult<CouponDto>> GetCouponByIdAsync(int id)
    {
        var coupon = await _unitOfWork.Coupons.GetByIdAsync(id);
        if (coupon == null)
            return ServiceResult<CouponDto>.Failure("Coupon not found");

        return ServiceResult<CouponDto>.Success(coupon.ToDto());
    }

    public async Task<ServiceResult<CouponDto>> GetCouponByCodeAsync(string code)
    {
        var coupon = await _unitOfWork.Coupons.GetByCodeAsync(code);
        if (coupon == null)
            return ServiceResult<CouponDto>.Failure("Coupon not found");

        return ServiceResult<CouponDto>.Success(coupon.ToDto());
    }

    public async Task<ServiceResult<CouponDto>> CreateCouponAsync(CreateCouponRequest request)
    {
        var isUnique = await _unitOfWork.Coupons.IsCodeUniqueAsync(request.Code);
        if (!isUnique)
            return ServiceResult<CouponDto>.Failure("Coupon code already exists");

        var coupon = new Coupon
        {
            Code = request.Code.ToUpper(),
            Description = request.Description,
            DiscountPercentage = request.DiscountPercentage,
            MaxDiscountAmount = request.MaxDiscountAmount,
            MinOrderAmount = request.MinOrderAmount,
            ValidFrom = request.ValidFrom,
            ValidUntil = request.ValidUntil,
            MaxUsageCount = request.MaxUsageCount,
            CurrentUsageCount = 0,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        await _unitOfWork.Coupons.AddAsync(coupon);
        await _unitOfWork.SaveChangesAsync();

        return ServiceResult<CouponDto>.Success(coupon.ToDto(), "Coupon created successfully");
    }

    public async Task<ServiceResult> DeleteCouponAsync(int id)
    {
        var coupon = await _unitOfWork.Coupons.GetByIdAsync(id);
        if (coupon == null)
            return ServiceResult.Failure("Coupon not found");

        _unitOfWork.Coupons.Remove(coupon);
        await _unitOfWork.SaveChangesAsync();

        return ServiceResult.Success("Coupon deleted successfully");
    }

    public async Task<ServiceResult<CouponDto>> ValidateCouponAsync(ValidateCouponRequest request)
    {
        var coupon = await _unitOfWork.Coupons.GetByCodeAsync(request.Code.ToUpper());
        if (coupon == null)
            return ServiceResult<CouponDto>.Failure("Invalid coupon code");

        if (!coupon.IsActive)
            return ServiceResult<CouponDto>.Failure("Coupon is not active");

        if (coupon.ValidFrom > DateTime.UtcNow)
            return ServiceResult<CouponDto>.Failure("Coupon is not yet valid");

        if (coupon.ValidUntil < DateTime.UtcNow)
            return ServiceResult<CouponDto>.Failure("Coupon has expired");

        if (coupon.CurrentUsageCount >= coupon.MaxUsageCount)
            return ServiceResult<CouponDto>.Failure("Coupon usage limit reached");

        if (coupon.MinOrderAmount.HasValue && request.OrderAmount < coupon.MinOrderAmount.Value)
            return ServiceResult<CouponDto>.Failure($"Minimum order amount of ₹{coupon.MinOrderAmount.Value} required");

        return ServiceResult<CouponDto>.Success(coupon.ToDto(), "Coupon is valid");
    }
}
