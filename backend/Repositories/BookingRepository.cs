using backend.Common;
using backend.Data;
using backend.Enums;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Repositories;

public class BookingRepository : Repository<Booking>, IBookingRepository
{
    public BookingRepository(AppDbContext context) : base(context)
    {
    }

    public async Task<PagedResult<Booking>> GetPagedAsync(PaginationParams pagination, BookingStatus? status = null)
    {
        var query = _dbSet
            .Include(b => b.Customer)
            .Include(b => b.Vehicle)
            .Include(b => b.Driver)
            .Include(b => b.Coupon)
            .AsQueryable();

        if (status.HasValue)
        {
            query = query.Where(b => b.Status == status.Value);
        }

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(b => b.CreatedAt)
            .Skip(pagination.Skip)
            .Take(pagination.PageSize)
            .ToListAsync();

        return PagedResult<Booking>.Create(items, totalCount, pagination.Page, pagination.PageSize);
    }

    public async Task<Booking?> GetByIdWithDetailsAsync(int id)
    {
        return await _dbSet
            .Include(b => b.Customer)
            .Include(b => b.Vehicle)
                .ThenInclude(v => v.VehicleCategory)
            .Include(b => b.Driver)
            .Include(b => b.Coupon)
            .Include(b => b.Route)
            .Include(b => b.Payments)
            .Include(b => b.Reviews)
            .FirstOrDefaultAsync(b => b.Id == id);
    }

    public async Task<IEnumerable<Booking>> GetByCustomerIdAsync(int customerId)
    {
        return await _dbSet
            .Include(b => b.Vehicle)
            .Include(b => b.Driver)
            .Where(b => b.CustomerId == customerId)
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Booking>> GetByDriverIdAsync(int driverId)
    {
        return await _dbSet
            .Include(b => b.Vehicle)
            .Include(b => b.Customer)
            .Where(b => b.DriverId == driverId)
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Booking>> GetByVehicleIdAsync(int vehicleId)
    {
        return await _dbSet
            .Include(b => b.Customer)
            .Include(b => b.Driver)
            .Where(b => b.VehicleId == vehicleId)
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync();
    }

    public async Task<bool> IsVehicleAvailableAsync(int vehicleId, DateTime pickupDate, DateTime? returnDate, int? excludeBookingId = null)
    {
        var query = _dbSet.Where(b =>
            b.VehicleId == vehicleId &&
            b.Status != BookingStatus.Cancelled &&
            b.Status != BookingStatus.Completed);

        if (excludeBookingId.HasValue)
        {
            query = query.Where(b => b.Id != excludeBookingId.Value);
        }

        if (returnDate.HasValue)
        {
            return !await query.AnyAsync(b =>
                pickupDate < b.ReturnDate &&
                returnDate > b.PickupDate);
        }

        return !await query.AnyAsync(b =>
            pickupDate >= b.PickupDate &&
            pickupDate < (b.ReturnDate ?? b.PickupDate.AddDays(1)));
    }

    public async Task<IEnumerable<Booking>> GetActiveBookingsAsync()
    {
        return await _dbSet
            .Include(b => b.Customer)
            .Include(b => b.Vehicle)
            .Include(b => b.Driver)
            .Where(b => b.Status == BookingStatus.InProgress || b.Status == BookingStatus.DriverAssigned)
            .ToListAsync();
    }

    public async Task<IEnumerable<Booking>> GetPendingBookingsAsync()
    {
        return await _dbSet
            .Include(b => b.Customer)
            .Include(b => b.Vehicle)
            .Where(b => b.Status == BookingStatus.Pending || b.Status == BookingStatus.Confirmed)
            .OrderBy(b => b.PickupDate)
            .ToListAsync();
    }
}
