using backend.Models;

namespace backend.Repositories;

public interface ICouponRepository : IRepository<Coupon>
{
    Task<Coupon?> GetByCodeAsync(string code);
    Task<IEnumerable<Coupon>> GetActiveCouponsAsync();
    Task<bool> IsCodeUniqueAsync(string code, int? excludeId = null);
}
