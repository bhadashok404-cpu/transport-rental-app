using backend.Common;
using backend.DTOs.Review;

namespace backend.Services.Interfaces;

public interface IReviewService
{
    Task<ServiceResult<PagedResult<ReviewDto>>> GetPagedReviewsAsync(PaginationParams pagination);
    Task<ServiceResult<ReviewDto>> GetReviewByIdAsync(int id);
    Task<ServiceResult<IEnumerable<ReviewDto>>> GetReviewsByBookingIdAsync(int bookingId);
    Task<ServiceResult<IEnumerable<ReviewDto>>> GetReviewsByCustomerIdAsync(int customerId);
    Task<ServiceResult<IEnumerable<ReviewDto>>> GetReviewsByDriverIdAsync(int driverId);
    Task<ServiceResult<IEnumerable<ReviewDto>>> GetReviewsByVehicleIdAsync(int vehicleId);
    Task<ServiceResult<ReviewDto>> CreateReviewAsync(CreateReviewRequest request);
    Task<ServiceResult> DeleteReviewAsync(int id);
}
