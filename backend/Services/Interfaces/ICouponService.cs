using backend.Common;
using backend.DTOs.Coupon;

namespace backend.Services.Interfaces;

public interface ICouponService
{
    Task<ServiceResult<IEnumerable<CouponDto>>> GetAllCouponsAsync();
    Task<ServiceResult<IEnumerable<CouponDto>>> GetActiveCouponsAsync();
    Task<ServiceResult<CouponDto>> GetCouponByIdAsync(int id);
    Task<ServiceResult<CouponDto>> GetCouponByCodeAsync(string code);
    Task<ServiceResult<CouponDto>> CreateCouponAsync(CreateCouponRequest request);
    Task<ServiceResult> DeleteCouponAsync(int id);
    Task<ServiceResult<CouponDto>> ValidateCouponAsync(ValidateCouponRequest request);
}
