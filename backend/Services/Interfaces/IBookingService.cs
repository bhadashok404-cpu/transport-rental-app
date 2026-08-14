using backend.Common;
using backend.DTOs.Booking;
using backend.Enums;

namespace backend.Services.Interfaces;

public interface IBookingService
{
    Task<ServiceResult<PagedResult<BookingDto>>> GetPagedBookingsAsync(PaginationParams pagination, BookingStatus? status = null);
    Task<ServiceResult<BookingDto>> GetBookingByIdAsync(int id);
    Task<ServiceResult<IEnumerable<BookingDto>>> GetBookingsByCustomerIdAsync(int customerId);
    Task<ServiceResult<IEnumerable<BookingDto>>> GetBookingsByDriverIdAsync(int driverId);
    Task<ServiceResult<BookingDto>> CreateBookingAsync(CreateBookingRequest request);
    Task<ServiceResult<BookingDto>> UpdateBookingAsync(int id, UpdateBookingRequest request);
    Task<ServiceResult> CancelBookingAsync(int id, CancelBookingRequest request);
    Task<ServiceResult<BookingDto>> AssignDriverAsync(int bookingId, AssignDriverRequest request);
    Task<ServiceResult<BookingDto>> UpdateBookingStatusAsync(int id, BookingStatus status);
    Task<ServiceResult<BookingDto>> StartTripAsync(int id);
    Task<ServiceResult<BookingDto>> CompleteTripAsync(int id, decimal actualDistance);
    Task<ServiceResult<IEnumerable<BookingDto>>> GetPendingBookingsAsync();
    Task<ServiceResult<IEnumerable<BookingDto>>> GetActiveBookingsAsync();
}
