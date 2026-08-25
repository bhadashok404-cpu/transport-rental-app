using backend.Enums;
using backend.Models;

namespace backend.Repositories;

public interface ICarpoolBookingRepository : IRepository<CarpoolBooking>
{
    Task<CarpoolBooking?> GetByIdWithDetailsAsync(int id);
    Task<IEnumerable<CarpoolBooking>> GetByCustomerIdAsync(int customerId);
    Task<IEnumerable<CarpoolBooking>> GetByRideOfferIdAsync(int rideOfferId);
    Task<bool> HasCustomerAlreadyBookedAsync(int rideOfferId, int customerId);
}
