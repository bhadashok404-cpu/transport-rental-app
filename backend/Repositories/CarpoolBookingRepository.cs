using backend.Data;
using backend.Enums;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Repositories;

public class CarpoolBookingRepository : Repository<CarpoolBooking>, ICarpoolBookingRepository
{
    public CarpoolBookingRepository(AppDbContext context) : base(context) { }

    public async Task<CarpoolBooking?> GetByIdWithDetailsAsync(int id)
    {
        return await _dbSet
            .Include(cb => cb.RideOffer)
                .ThenInclude(o => o.Driver)
            .Include(cb => cb.RideOffer)
                .ThenInclude(o => o.Vehicle)
            .Include(cb => cb.Customer)
            .Include(cb => cb.Payment)
            .FirstOrDefaultAsync(cb => cb.Id == id);
    }

    public async Task<IEnumerable<CarpoolBooking>> GetByCustomerIdAsync(int customerId)
    {
        return await _dbSet
            .Include(cb => cb.RideOffer)
                .ThenInclude(o => o.Driver)
            .Include(cb => cb.RideOffer)
                .ThenInclude(o => o.Vehicle)
            .Include(cb => cb.Payment)
            .Where(cb => cb.CustomerId == customerId)
            .OrderByDescending(cb => cb.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<CarpoolBooking>> GetByRideOfferIdAsync(int rideOfferId)
    {
        return await _dbSet
            .Include(cb => cb.Customer)
            .Include(cb => cb.Payment)
            .Where(cb => cb.RideOfferId == rideOfferId && cb.Status != CarpoolBookingStatus.Cancelled)
            .OrderBy(cb => cb.CreatedAt)
            .ToListAsync();
    }

    public async Task<bool> HasCustomerAlreadyBookedAsync(int rideOfferId, int customerId)
    {
        return await _dbSet.AnyAsync(cb =>
            cb.RideOfferId == rideOfferId &&
            cb.CustomerId == customerId &&
            cb.Status != CarpoolBookingStatus.Cancelled);
    }
}
