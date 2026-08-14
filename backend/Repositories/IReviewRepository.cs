using backend.Common;
using backend.Models;

namespace backend.Repositories;

public interface IReviewRepository : IRepository<Review>
{
    Task<PagedResult<Review>> GetPagedAsync(PaginationParams pagination);
    Task<IEnumerable<Review>> GetByBookingIdAsync(int bookingId);
    Task<IEnumerable<Review>> GetByCustomerIdAsync(int customerId);
    Task<IEnumerable<Review>> GetByDriverIdAsync(int driverId);
    Task<IEnumerable<Review>> GetByVehicleIdAsync(int vehicleId);
    Task<Review?> GetByIdWithDetailsAsync(int id);
    Task<double> GetAverageDriverRatingAsync(int driverId);
    Task<double> GetAverageVehicleRatingAsync(int vehicleId);
}
