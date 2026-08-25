using backend.Common;
using backend.DTOs.CarpoolBooking;

namespace backend.Services.Interfaces;

public interface ICarpoolBookingService
{
    /// <summary>Passenger books one or more seats on a ride offer. Creates a pending Payment record.</summary>
    Task<ServiceResult<CarpoolBookingDto>> BookSeatAsync(CreateCarpoolBookingRequest request);

    /// <summary>Confirm a carpool booking after payment succeeds (called by PaymentsController or payment webhook).</summary>
    Task<ServiceResult<CarpoolBookingDto>> ConfirmBookingAsync(int carpoolBookingId);

    /// <summary>Customer or admin cancels a carpool booking. Restores AvailableSeats on the offer.</summary>
    Task<ServiceResult> CancelBookingAsync(int carpoolBookingId, int requestingCustomerId, bool isAdmin = false);

    /// <summary>All carpool bookings made by a customer.</summary>
    Task<ServiceResult<IEnumerable<CarpoolBookingDto>>> GetPassengerBookingsAsync(int customerId);

    /// <summary>Single carpool booking detail.</summary>
    Task<ServiceResult<CarpoolBookingDto>> GetByIdAsync(int carpoolBookingId, int requestingCustomerId, bool isAdmin = false);
}
