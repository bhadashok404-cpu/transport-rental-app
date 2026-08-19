using backend.Common;
using backend.DTOs.Booking;
using backend.Enums;
using backend.Models;
using backend.Repositories;
using backend.Services.Interfaces;
using backend.Services.Mappers;
using Microsoft.EntityFrameworkCore;

namespace backend.Services.Implementations;

public class BookingService : IBookingService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly INotificationService _notificationService;
    private readonly Data.AppDbContext _db;

    public BookingService(IUnitOfWork unitOfWork, INotificationService notificationService, Data.AppDbContext db)
    {
        _unitOfWork = unitOfWork;
        _notificationService = notificationService;
        _db = db;
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

        var driverIds = await _db.Drivers
            .Where(d => d.IsActive)
            .Select(d => d.Id)
            .ToListAsync();
        _db.RideRequests.AddRange(driverIds.Select(driverId => new RideRequest
        {
            BookingId = booking.Id,
            DriverId = driverId
        }));
        await _db.SaveChangesAsync();

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

        if (!driver.IsActive)
            return ServiceResult<BookingDto>.Failure("Driver is not active");

        if (booking.DriverId.HasValue && booking.DriverId.Value != request.DriverId)
        {
            var previousDriver = await _unitOfWork.Drivers.GetByIdAsync(booking.DriverId.Value);
            if (previousDriver != null)
            {
                previousDriver.Status = DriverStatus.Available;
                previousDriver.LastActiveAt = DateTime.UtcNow;
                _unitOfWork.Drivers.Update(previousDriver);
            }
        }

        booking.DriverId = request.DriverId;
        booking.Status = BookingStatus.DriverAssigned;
        booking.UpdatedAt = DateTime.UtcNow;

        var bookingRequests = await _db.RideRequests
            .Where(requestRow => requestRow.BookingId == bookingId)
            .ToListAsync();
        foreach (var bookingRequest in bookingRequests)
        {
            bookingRequest.Status = bookingRequest.DriverId == request.DriverId
                ? RideRequestStatus.Accepted
                : RideRequestStatus.Rejected;
            bookingRequest.RespondedAt = DateTime.UtcNow;
        }

        driver.IsVerified = true;
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

    public async Task<ServiceResult<IEnumerable<RideRequestDto>>> GetDriverRideRequestsAsync(int driverId)
    {
        var driverEligible = await _db.Drivers.AnyAsync(driver => driver.Id == driverId && driver.IsActive);
        if (driverEligible)
        {
            var existingBookingIds = await _db.RideRequests
                .Where(request => request.DriverId == driverId)
                .Select(request => request.BookingId)
                .ToListAsync();
            var missingBookingIds = await _db.Bookings
                .Where(booking => booking.Status == BookingStatus.Confirmed && !booking.DriverId.HasValue && !existingBookingIds.Contains(booking.Id) && booking.Payments.Any(payment => payment.Status == PaymentStatus.Completed))
                .Select(booking => booking.Id)
                .ToListAsync();
            _db.RideRequests.AddRange(missingBookingIds.Select(bookingId => new RideRequest
            {
                BookingId = bookingId,
                DriverId = driverId
            }));
            if (missingBookingIds.Count > 0) await _db.SaveChangesAsync();
        }

        var requests = await _db.RideRequests
            .Include(r => r.Booking).ThenInclude(b => b.Vehicle)
            .Include(r => r.Booking).ThenInclude(b => b.Payments)
            .Include(r => r.Booking).ThenInclude(b => b.Customer)
            .Where(r => r.DriverId == driverId && r.Status == RideRequestStatus.Pending && r.Booking.Status == BookingStatus.Confirmed)
            .OrderBy(r => r.Booking.PickupDate)
            .ToListAsync();
        return ServiceResult<IEnumerable<RideRequestDto>>.Success(requests.Select(ToRideRequestDto));
    }

    public async Task<ServiceResult<IEnumerable<RideRequestDto>>> GetAllRideRequestsAsync()
    {
        var requests = await _db.RideRequests
            .Include(r => r.Booking).ThenInclude(b => b.Vehicle)
            .Include(r => r.Booking).ThenInclude(b => b.Payments)
            .Include(r => r.Booking).ThenInclude(b => b.Customer)
            .Include(r => r.Driver)
            .Where(r => r.Booking.Status == BookingStatus.Confirmed || r.Booking.Status == BookingStatus.DriverAssigned)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();
        return ServiceResult<IEnumerable<RideRequestDto>>.Success(requests.Select(ToRideRequestDto));
    }

    public async Task<ServiceResult<RideRequestDto>> RespondToRideRequestAsync(int requestId, int driverId, bool accept)
    {
        var request = await _db.RideRequests
            .Include(r => r.Booking).ThenInclude(b => b.Payments)
            .Include(r => r.Booking).ThenInclude(b => b.Vehicle)
            .Include(r => r.Booking).ThenInclude(b => b.Customer)
            .Include(r => r.Driver)
            .FirstOrDefaultAsync(r => r.Id == requestId && r.DriverId == driverId);
        if (request == null) return ServiceResult<RideRequestDto>.Failure("Ride request not found");
        if (request.Status != RideRequestStatus.Pending) return ServiceResult<RideRequestDto>.Failure("Ride request already handled");

        if (accept)
        {
            if (request.Booking.Payments.All(p => p.Status != PaymentStatus.Completed))
                return ServiceResult<RideRequestDto>.Failure("Payment is not completed");
            if (request.Booking.DriverId.HasValue)
                return ServiceResult<RideRequestDto>.Failure("Ride already accepted by another driver");
            request.Status = RideRequestStatus.Accepted;
            request.Booking.DriverId = driverId;
            request.Booking.Status = BookingStatus.DriverAssigned;
            request.Booking.UpdatedAt = DateTime.UtcNow;
            request.Driver.Status = DriverStatus.OnTrip;
            request.Driver.LastActiveAt = DateTime.UtcNow;
            var otherRequests = await _db.RideRequests
                .Where(requestRow => requestRow.BookingId == request.BookingId && requestRow.Id != request.Id && requestRow.Status == RideRequestStatus.Pending)
                .ToListAsync();
            foreach (var otherRequest in otherRequests)
            {
                otherRequest.Status = RideRequestStatus.Rejected;
                otherRequest.RespondedAt = DateTime.UtcNow;
            }
        }
        else
        {
            request.Status = RideRequestStatus.Rejected;
        }

        request.RespondedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return ServiceResult<RideRequestDto>.Success(ToRideRequestDto(request), accept ? "Ride accepted" : "Ride rejected");
    }

    private static RideRequestDto ToRideRequestDto(RideRequest request)
    {
        var booking = request.Booking;
        return new RideRequestDto
        {
            Id = request.Id,
            BookingId = booking.Id,
            VehicleInfo = $"{booking.Vehicle.Make} {booking.Vehicle.Model}",
            PickupLocation = booking.PickupLocation,
            DropLocation = booking.DropLocation,
            PickupDate = booking.PickupDate,
            ReturnDate = booking.ReturnDate,
            EstimatedPrice = booking.EstimatedPrice,
            PaymentStatus = booking.Payments.FirstOrDefault()?.Status ?? PaymentStatus.Pending,
            Status = request.Status,
            DriverName = request.Driver != null ? $"{request.Driver.FirstName} {request.Driver.LastName}" : null,
            CustomerName = booking.Customer != null
                ? $"{booking.Customer.FirstName} {booking.Customer.LastName}{(string.IsNullOrWhiteSpace(booking.Customer.PhoneNumber) ? string.Empty : $" · {booking.Customer.PhoneNumber}")}"
                : null,
            CustomerPhone = booking.Customer?.PhoneNumber,
            CustomerEmail = booking.Customer?.Email
        };
    }
}
