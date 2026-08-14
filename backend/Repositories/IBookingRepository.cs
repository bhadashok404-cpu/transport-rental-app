using backend.Common;
using backend.Enums;
using backend.Models;

namespace backend.Repositories;

public interface IBookingRepository : IRepository<Booking>
{
    Task<PagedResult<Booking>> GetPagedAsync(PaginationParams pagination, BookingStatus? status = null);
    Task<Booking?> GetByIdWithDetailsAsync(int id);
    Task<IEnumerable<Booking>> GetByCustomerIdAsync(int customerId);
    Task<IEnumerable<Booking>> GetByDriverIdAsync(int driverId);
    Task<IEnumerable<Booking>> GetByVehicleIdAsync(int vehicleId);
    Task<bool> IsVehicleAvailableAsync(int vehicleId, DateTime pickupDate, DateTime? returnDate, int? excludeBookingId = null);
    Task<IEnumerable<Booking>> GetActiveBookingsAsync();
    Task<IEnumerable<Booking>> GetPendingBookingsAsync();
}
