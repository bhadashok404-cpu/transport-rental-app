using backend.Common;
using backend.DTOs.Review;
using backend.Models;
using backend.Repositories;
using backend.Services.Interfaces;
using backend.Services.Mappers;

namespace backend.Services.Implementations;

public class ReviewService : IReviewService
{
    private readonly IUnitOfWork _unitOfWork;

    public ReviewService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ServiceResult<PagedResult<ReviewDto>>> GetPagedReviewsAsync(PaginationParams pagination)
    {
        var pagedReviews = await _unitOfWork.Reviews.GetPagedAsync(pagination);
        var dtos = pagedReviews.Items.Select(r => r.ToDto()).ToList();

        var result = PagedResult<ReviewDto>.Create(dtos, pagedReviews.TotalCount, pagedReviews.Page, pagedReviews.PageSize);
        return ServiceResult<PagedResult<ReviewDto>>.Success(result);
    }

    public async Task<ServiceResult<ReviewDto>> GetReviewByIdAsync(int id)
    {
        var review = await _unitOfWork.Reviews.GetByIdWithDetailsAsync(id);
        if (review == null)
            return ServiceResult<ReviewDto>.Failure("Review not found");

        return ServiceResult<ReviewDto>.Success(review.ToDto());
    }

    public async Task<ServiceResult<IEnumerable<ReviewDto>>> GetReviewsByBookingIdAsync(int bookingId)
    {
        var reviews = await _unitOfWork.Reviews.GetByBookingIdAsync(bookingId);
        var dtos = reviews.Select(r => r.ToDto());
        return ServiceResult<IEnumerable<ReviewDto>>.Success(dtos);
    }

    public async Task<ServiceResult<IEnumerable<ReviewDto>>> GetReviewsByCustomerIdAsync(int customerId)
    {
        var reviews = await _unitOfWork.Reviews.GetByCustomerIdAsync(customerId);
        var dtos = reviews.Select(r => r.ToDto());
        return ServiceResult<IEnumerable<ReviewDto>>.Success(dtos);
    }

    public async Task<ServiceResult<IEnumerable<ReviewDto>>> GetReviewsByDriverIdAsync(int driverId)
    {
        var reviews = await _unitOfWork.Reviews.GetByDriverIdAsync(driverId);
        var dtos = reviews.Select(r => r.ToDto());
        return ServiceResult<IEnumerable<ReviewDto>>.Success(dtos);
    }

    public async Task<ServiceResult<IEnumerable<ReviewDto>>> GetReviewsByVehicleIdAsync(int vehicleId)
    {
        var reviews = await _unitOfWork.Reviews.GetByVehicleIdAsync(vehicleId);
        var dtos = reviews.Select(r => r.ToDto());
        return ServiceResult<IEnumerable<ReviewDto>>.Success(dtos);
    }

    public async Task<ServiceResult<ReviewDto>> CreateReviewAsync(CreateReviewRequest request)
    {
        if (request.Rating < 1 || request.Rating > 5)
            return ServiceResult<ReviewDto>.Failure("Rating must be between 1 and 5");

        var booking = await _unitOfWork.Bookings.GetByIdWithDetailsAsync(request.BookingId);
        if (booking == null)
            return ServiceResult<ReviewDto>.Failure("Booking not found");

        var review = new Review
        {
            BookingId = request.BookingId,
            CustomerId = booking.CustomerId,
            DriverId = request.DriverId,
            VehicleId = request.VehicleId,
            Rating = request.Rating,
            Comment = request.Comment,
            IsDriverReview = request.IsDriverReview,
            IsVehicleReview = request.IsVehicleReview,
            CreatedAt = DateTime.UtcNow
        };

        await _unitOfWork.Reviews.AddAsync(review);
        await _unitOfWork.SaveChangesAsync();

        // Update driver rating if it's a driver review
        if (request.IsDriverReview && request.DriverId.HasValue)
        {
            var avgRating = await _unitOfWork.Reviews.GetAverageDriverRatingAsync(request.DriverId.Value);
            var driver = await _unitOfWork.Drivers.GetByIdAsync(request.DriverId.Value);
            if (driver != null)
            {
                driver.Rating = (decimal)avgRating;
                _unitOfWork.Drivers.Update(driver);
                await _unitOfWork.SaveChangesAsync();
            }
        }

        var createdReview = await _unitOfWork.Reviews.GetByIdWithDetailsAsync(review.Id);
        return ServiceResult<ReviewDto>.Success(createdReview!.ToDto(), "Review created successfully");
    }

    public async Task<ServiceResult> DeleteReviewAsync(int id)
    {
        var review = await _unitOfWork.Reviews.GetByIdAsync(id);
        if (review == null)
            return ServiceResult.Failure("Review not found");

        _unitOfWork.Reviews.Remove(review);
        await _unitOfWork.SaveChangesAsync();

        return ServiceResult.Success("Review deleted successfully");
    }
}
