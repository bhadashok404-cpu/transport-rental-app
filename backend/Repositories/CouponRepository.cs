using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Repositories;

public class CouponRepository : Repository<Coupon>, ICouponRepository
{
    public CouponRepository(AppDbContext context) : base(context)
    {
    }

    public async Task<Coupon?> GetByCodeAsync(string code)
    {
        return await _dbSet
            .FirstOrDefaultAsync(c => c.Code == code);
    }

    public async Task<IEnumerable<Coupon>> GetActiveCouponsAsync()
    {
        var now = DateTime.UtcNow;
        return await _dbSet
            .Where(c => c.IsActive &&
                       c.ValidFrom <= now &&
                       c.ValidUntil >= now &&
                       c.CurrentUsageCount < c.MaxUsageCount)
            .ToListAsync();
    }

    public async Task<bool> IsCodeUniqueAsync(string code, int? excludeId = null)
    {
        var query = _dbSet.Where(c => c.Code == code);

        if (excludeId.HasValue)
        {
            query = query.Where(c => c.Id != excludeId.Value);
        }

        return !await query.AnyAsync();
    }
}
