using backend.Common;
using backend.DTOs.Booking;
using backend.Enums;
using backend.Models;
using backend.Repositories;
using backend.Services.Interfaces;
using backend.Services.Mappers;

namespace backend.Services.Implementations;

public class BookingService : IBookingService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly INotificationService _notificationService;

    public BookingService(IUnitOfWork unitOfWork, INotificationService notificationService)
    {
        _unitOfWork = unitOfWork;
        _notificationService = notificationService;
    }

    public async Task<ServiceResult<PagedResult<BookingDto>>> GetPagedBookingsAsync(PaginationParams pagination, BookingStatus? status = null)
    {
        var pagedBookings = await _unitOfWork.Bookings.GetPagedAsync(pagination, status);
        var dtos = pagedBookings.Items.Select(b => b.ToDto()).ToList();

        var result = PagedResult<BookingDto>.Create(dtos, pagedBookings.TotalCount, pagedBookings.Page, pagedBookings.PageSize);
        return ServiceResult<PagedResult<BookingDto>>.Success(result);
    }

    public async Task<ServiceResult<BookingDto>> GetBookingByIdAsync(int id)
    {
        var booking = await _unitOfWork.Bookings.GetByIdWithDetailsAsync(id);
        if (booking == null)
            return ServiceResult<BookingDto>.Failure("Booking not found");

        return ServiceResult<BookingDto>.Success(booking.ToDto());
    }

    public async Task<ServiceResult<IEnumerable<BookingDto>>> GetBookingsByCustomerIdAsync(int customerId)
    {
        var bookings = await _unitOfWork.Bookings.GetByCustomerIdAsync(customerId);
        var dtos = bookings.Select(b => b.ToDto());
        return ServiceResult<IEnumerable<BookingDto>>.Success(dtos);
    }

    public async Task<ServiceResult<IEnumerable<BookingDto>>> GetBookingsByDriverIdAsync(int driverId)
    {
        var bookings = await _unitOfWork.Bookings.GetByDriverIdAsync(driverId);
        var dtos = bookings.Select(b => b.ToDto());
        return ServiceResult<IEnumerable<BookingDto>>.Success(dtos);
    }

    public async Task<ServiceResult<BookingDto>> CreateBookingAsync(CreateBookingRequest request)
    {
        // Validate customer
        var customer = await _unitOfWork.Customers.GetByIdAsync(request.CustomerId);
        if (customer == null)
            return ServiceResult<BookingDto>.Failure("Customer not found");

        if (!customer.IsActive)
            return ServiceResult<BookingDto>.Failure("Customer account is not active");

        // Validate vehicle
        var vehicle = await _unitOfWork.Vehicles.GetByIdWithDetailsAsync(request.VehicleId);
        if (vehicle == null)
            return ServiceResult<BookingDto>.Failure("Vehicle not found");

        if (!vehicle.IsAvailable || !vehicle.IsActive)
            return ServiceResult<BookingDto>.Failure("Vehicle is not available");

        // Check vehicle availability
        var isAvailable = await _unitOfWork.Bookings.IsVehicleAvailableAsync(
            request.VehicleId,
            request.PickupDate,
            request.ReturnDate);

        if (!isAvailable)
            return ServiceResult<BookingDto>.Failure("Vehicle is already booked for the selected dates");

        // Calculate estimated price
        decimal estimatedPrice = vehicle.PricePerDay;
        if (request.ReturnDate.HasValue)
        {
            var days = (request.ReturnDate.Value.Date - request.PickupDate.Date).Days;
            if (days > 0)
                estimatedPrice = days * vehicle.PricePerDay;
        }

        // Apply coupon if provided
        decimal? discountAmount = null;
        int? couponId = null;

        if (!string.IsNullOrWhiteSpace(request.CouponCode))
        {
            var coupon = await _unitOfWork.Coupons.GetByCodeAsync(request.CouponCode);
            if (coupon != null && coupon.IsActive &&
                coupon.ValidFrom <= DateTime.UtcNow &&
                coupon.ValidUntil >= DateTime.UtcNow &&
                coupon.CurrentUsageCount < coupon.MaxUsageCount)
            {
                if (coupon.MinOrderAmount == null || estimatedPrice >= coupon.MinOrderAmount)
                {
                    discountAmount = estimatedPrice * (coupon.DiscountPercentage / 100);
                    if (coupon.MaxDiscountAmount.HasValue && discountAmount > coupon.MaxDiscountAmount.Value)
                    {
                        discountAmount = coupon.MaxDiscountAmount.Value;
                    }
                    estimatedPrice -= discountAmount.Value;
                    couponId = coupon.Id;
                    coupon.CurrentUsageCount++;
                    _unitOfWork.Coupons.Update(coupon);
                }
            }
        }

        // Create booking
        var booking = new Booking
        {
            CustomerId = request.CustomerId,
            VehicleId = request.VehicleId,
            PickupLocation = request.PickupLocation,
            DropLocation = request.DropLocation,
            PickupDate = request.PickupDate,
            ReturnDate = request.ReturnDate,
            EstimatedPrice = estimatedPrice,
            DiscountAmount = discountAmount,
            CouponId = couponId,
            SpecialInstructions = request.SpecialInstructions,
            Status = BookingStatus.Pending,
            CreatedAt = DateTime.UtcNow
        };

        await _unitOfWork.Bookings.AddAsync(booking);
        await _unitOfWork.SaveChangesAsync();

        // Send notification
        await _notificationService.CreateNotificationAsync(new DTOs.Notification.CreateNotificationRequest
        {
            CustomerId = request.CustomerId,
            Type = NotificationType.BookingConfirmed,
            Title = "Booking Created",
            Message = $"Your booking for {vehicle.Make} {vehicle.Model} has been created successfully.",
            BookingId = booking.Id
        });

        var createdBooking = await _unitOfWork.Bookings.GetByIdWithDetailsAsync(booking.Id);
        return ServiceResult<BookingDto>.Success(createdBooking!.ToDto(), "Booking created successfully");
    }

    public async Task<ServiceResult<BookingDto>> UpdateBookingAsync(int id, UpdateBookingRequest request)
    {
        var booking = await _unitOfWork.Bookings.GetByIdAsync(id);
        if (booking == null)
            return ServiceResult<BookingDto>.Failure("Booking not found");

        if (booking.Status != BookingStatus.Pending && booking.Status != BookingStatus.Confirmed)
            return ServiceResult<BookingDto>.Failure("Cannot update booking in current status");

        booking.PickupLocation = request.PickupLocation;
        booking.DropLocation = request.DropLocation;
        booking.PickupDate = request.PickupDate;
        booking.ReturnDate = request.ReturnDate;
        booking.SpecialInstructions = request.SpecialInstructions;
        booking.UpdatedAt = DateTime.UtcNow;

        _unitOfWork.Bookings.Update(booking);
        await _unitOfWork.SaveChangesAsync();

        var updatedBooking = await _unitOfWork.Bookings.GetByIdWithDetailsAsync(id);
        return ServiceResult<BookingDto>.Success(updatedBooking!.ToDto(), "Booking updated successfully");
    }

    public async Task<ServiceResult> CancelBookingAsync(int id, CancelBookingRequest request)
    {
        var booking = await _unitOfWork.Bookings.GetByIdAsync(id);
        if (booking == null)
            return ServiceResult.Failure("Booking not found");

        if (booking.Status == BookingStatus.Completed)
            return ServiceResult.Failure("Cannot cancel a completed booking");

        if (booking.Status == BookingStatus.Cancelled)
            return ServiceResult.Failure("Booking is already cancelled");

        booking.Status = BookingStatus.Cancelled;
        booking.CancellationReason = request.CancellationReason;
        booking.CancelledAt = DateTime.UtcNow;
        booking.UpdatedAt = DateTime.UtcNow;

        _unitOfWork.Bookings.Update(booking);
        await _unitOfWork.SaveChangesAsync();

        // Send notification
        await _notificationService.CreateNotificationAsync(new DTOs.Notification.CreateNotificationRequest
        {
            CustomerId = booking.CustomerId,
            Type = NotificationType.BookingCancelled,
            Title = "Booking Cancelled",
            Message = $"Your booking #{booking.Id} has been cancelled.",
            BookingId = booking.Id
        });

        return ServiceResult.Success("Booking cancelled successfully");
    }

    public async Task<ServiceResult<BookingDto>> AssignDriverAsync(int bookingId, AssignDriverRequest request)
    {
        var booking = await _unitOfWork.Bookings.GetByIdAsync(bookingId);
        if (booking == null)
            return ServiceResult<BookingDto>.Failure("Booking not found");

        var driver = await _unitOfWork.Drivers.GetByIdAsync(request.DriverId);
        if (driver == null)
            return ServiceResult<BookingDto>.Failure("Driver not found");

        if (!driver.IsActive || !driver.IsVerified)
            return ServiceResult<BookingDto>.Failure("Driver is not available");

        if (driver.Status != DriverStatus.Available)
            return ServiceResult<BookingDto>.Failure("Driver is not currently available");

        booking.DriverId = request.DriverId;
        booking.Status = BookingStatus.DriverAssigned;
        booking.UpdatedAt = DateTime.UtcNow;

        driver.Status = DriverStatus.OnTrip;
        driver.LastActiveAt = DateTime.UtcNow;

        _unitOfWork.Bookings.Update(booking);
        _unitOfWork.Drivers.Update(driver);
        await _unitOfWork.SaveChangesAsync();

        // Send notification
        await _notificationService.CreateNotificationAsync(new DTOs.Notification.CreateNotificationRequest
        {
            CustomerId = booking.CustomerId,
            Type = NotificationType.DriverAssigned,
            Title = "Driver Assigned",
            Message = $"Driver {driver.FirstName} {driver.LastName} has been assigned to your booking.",
            BookingId = booking.Id
        });

        var updatedBooking = await _unitOfWork.Bookings.GetByIdWithDetailsAsync(bookingId);
        return ServiceResult<BookingDto>.Success(updatedBooking!.ToDto(), "Driver assigned successfully");
    }

    public async Task<ServiceResult<BookingDto>> UpdateBookingStatusAsync(int id, BookingStatus status)
    {
        var booking = await _unitOfWork.Bookings.GetByIdAsync(id);
        if (booking == null)
            return ServiceResult<BookingDto>.Failure("Booking not found");

        booking.Status = status;
        booking.UpdatedAt = DateTime.UtcNow;

        _unitOfWork.Bookings.Update(booking);
        await _unitOfWork.SaveChangesAsync();

        var updatedBooking = await _unitOfWork.Bookings.GetByIdWithDetailsAsync(id);
        return ServiceResult<BookingDto>.Success(updatedBooking!.ToDto(), "Booking status updated");
    }

    public async Task<ServiceResult<BookingDto>> StartTripAsync(int id)
    {
        var booking = await _unitOfWork.Bookings.GetByIdAsync(id);
        if (booking == null)
            return ServiceResult<BookingDto>.Failure("Booking not found");

        if (booking.Status != BookingStatus.DriverAssigned)
            return ServiceResult<BookingDto>.Failure("Booking must have an assigned driver to start trip");

        booking.Status = BookingStatus.InProgress;
        booking.ActualPickupTime = DateTime.UtcNow;
        booking.UpdatedAt = DateTime.UtcNow;

        _unitOfWork.Bookings.Update(booking);
        await _unitOfWork.SaveChangesAsync();

        // Send notification
        await _notificationService.CreateNotificationAsync(new DTOs.Notification.CreateNotificationRequest
        {
            CustomerId = booking.CustomerId,
            Type = NotificationType.TripStarted,
            Title = "Trip Started",
            Message = "Your trip has started.",
            BookingId = booking.Id
        });

        var updatedBooking = await _unitOfWork.Bookings.GetByIdWithDetailsAsync(id);
        return ServiceResult<BookingDto>.Success(updatedBooking!.ToDto(), "Trip started successfully");
    }

    public async Task<ServiceResult<BookingDto>> CompleteTripAsync(int id, decimal actualDistance)
    {
        var booking = await _unitOfWork.Bookings.GetByIdWithDetailsAsync(id);
        if (booking == null)
            return ServiceResult<BookingDto>.Failure("Booking not found");

        if (booking.Status != BookingStatus.InProgress)
            return ServiceResult<BookingDto>.Failure("Booking must be in progress to complete");

        booking.Status = BookingStatus.Completed;
        booking.ActualDropTime = DateTime.UtcNow;
        booking.DistanceInKm = actualDistance;

        // Calculate actual price based on distance
        if (booking.Vehicle != null)
        {
            booking.ActualPrice = (actualDistance * booking.Vehicle.PricePerKm);
            if (booking.DiscountAmount.HasValue)
            {
                booking.ActualPrice -= booking.DiscountAmount.Value;
            }
        }

        booking.UpdatedAt = DateTime.UtcNow;

        // Update driver status and stats
        if (booking.Driver != null)
        {
            booking.Driver.Status = DriverStatus.Available;
            booking.Driver.TotalTrips++;
            booking.Driver.LastActiveAt = DateTime.UtcNow;
            _unitOfWork.Drivers.Update(booking.Driver);
        }

        _unitOfWork.Bookings.Update(booking);
        await _unitOfWork.SaveChangesAsync();

        // Send notification
        await _notificationService.CreateNotificationAsync(new DTOs.Notification.CreateNotificationRequest
        {
            CustomerId = booking.CustomerId,
            Type = NotificationType.TripCompleted,
            Title = "Trip Completed",
            Message = $"Your trip has been completed. Total amount: ₹{booking.ActualPrice:F2}",
            BookingId = booking.Id
        });

        var updatedBooking = await _unitOfWork.Bookings.GetByIdWithDetailsAsync(id);
        return ServiceResult<BookingDto>.Success(updatedBooking!.ToDto(), "Trip completed successfully");
    }

    public async Task<ServiceResult<IEnumerable<BookingDto>>> GetPendingBookingsAsync()
    {
        var bookings = await _unitOfWork.Bookings.GetPendingBookingsAsync();
        var dtos = bookings.Select(b => b.ToDto());
        return ServiceResult<IEnumerable<BookingDto>>.Success(dtos);
    }

    public async Task<ServiceResult<IEnumerable<BookingDto>>> GetActiveBookingsAsync()
    {
        var bookings = await _unitOfWork.Bookings.GetActiveBookingsAsync();
        var dtos = bookings.Select(b => b.ToDto());
        return ServiceResult<IEnumerable<BookingDto>>.Success(dtos);
    }
}
