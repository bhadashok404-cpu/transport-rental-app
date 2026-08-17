using backend.Common;
using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Repositories;

public class ReviewRepository : Repository<Review>, IReviewRepository
{
    public ReviewRepository(AppDbContext context) : base(context)
    {
    }

    public async Task<PagedResult<Review>> GetPagedAsync(PaginationParams pagination)
    {
        var query = _dbSet
            .Include(r => r.Customer)
            .Include(r => r.Driver)
            .Include(r => r.Vehicle)
            .Include(r => r.Booking)
            .AsQueryable();

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(r => r.CreatedAt)
            .Skip(pagination.Skip)
            .Take(pagination.PageSize)
            .ToListAsync();

        return PagedResult<Review>.Create(items, totalCount, pagination.Page, pagination.PageSize);
    }

    public async Task<IEnumerable<Review>> GetByBookingIdAsync(int bookingId)
    {
        return await _dbSet
            .Include(r => r.Customer)
            .Include(r => r.Driver)
            .Include(r => r.Vehicle)
            .Where(r => r.BookingId == bookingId)
            .ToListAsync();
    }

    public async Task<IEnumerable<Review>> GetByCustomerIdAsync(int customerId)
    {
        return await _dbSet
            .Include(r => r.Driver)
            .Include(r => r.Vehicle)
            .Include(r => r.Booking)
            .Where(r => r.CustomerId == customerId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Review>> GetByDriverIdAsync(int driverId)
    {
        return await _dbSet
            .Include(r => r.Customer)
            .Include(r => r.Booking)
            .Where(r => r.DriverId == driverId && r.IsDriverReview)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Review>> GetByVehicleIdAsync(int vehicleId)
    {
        return await _dbSet
            .Include(r => r.Customer)
            .Include(r => r.Booking)
            .Where(r => r.VehicleId == vehicleId && r.IsVehicleReview)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();
    }

    public async Task<Review?> GetByIdWithDetailsAsync(int id)
    {
        return await _dbSet
            .Include(r => r.Customer)
            .Include(r => r.Driver)
            .Include(r => r.Vehicle)
            .Include(r => r.Booking)
            .FirstOrDefaultAsync(r => r.Id == id);
    }

    public async Task<double> GetAverageDriverRatingAsync(int driverId)
    {
        var reviews = await _dbSet
            .Where(r => r.DriverId == driverId && r.IsDriverReview)
            .ToListAsync();

        return reviews.Any() ? reviews.Average(r => r.Rating) : 0;
    }

    public async Task<double> GetAverageVehicleRatingAsync(int vehicleId)
    {
        var reviews = await _dbSet
            .Where(r => r.VehicleId == vehicleId && r.IsVehicleReview)
            .ToListAsync();

        return reviews.Any() ? reviews.Average(r => r.Rating) : 0;
    }
}
