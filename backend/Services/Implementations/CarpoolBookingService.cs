using backend.Common;
using backend.DTOs.CarpoolBooking;
using backend.DTOs.Notification;
using backend.Enums;
using backend.Models;
using backend.Repositories;
using backend.Services.Interfaces;
using backend.Services.Mappers;

namespace backend.Services.Implementations;

public class CarpoolBookingService : ICarpoolBookingService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly INotificationService _notificationService;

    public CarpoolBookingService(IUnitOfWork unitOfWork, INotificationService notificationService)
    {
        _unitOfWork = unitOfWork;
        _notificationService = notificationService;
    }

    public async Task<ServiceResult<CarpoolBookingDto>> BookSeatAsync(CreateCarpoolBookingRequest request)
    {
        // Validate customer
        var customer = await _unitOfWork.Customers.GetByIdAsync(request.CustomerId);
        if (customer == null)
            return ServiceResult<CarpoolBookingDto>.Failure("Customer not found");
        if (!customer.IsActive)
            return ServiceResult<CarpoolBookingDto>.Failure("Customer account is not active");

        // Validate ride offer
        var offer = await _unitOfWork.RideOffers.GetByIdWithDetailsAsync(request.RideOfferId);
        if (offer == null)
            return ServiceResult<CarpoolBookingDto>.Failure("Ride offer not found");
        if (offer.Status != RideOfferStatus.Active)
            return ServiceResult<CarpoolBookingDto>.Failure("This ride offer is no longer available");
        if (offer.DepartureTime <= DateTime.UtcNow)
            return ServiceResult<CarpoolBookingDto>.Failure("This ride has already departed");

        // Prevent driver booking their own ride
        var driver = await _unitOfWork.Drivers.GetByIdAsync(offer.DriverId);
        if (driver != null && driver.Email == customer.Email)
            return ServiceResult<CarpoolBookingDto>.Failure("You cannot book your own ride offer");

        // Check for duplicate booking
        bool alreadyBooked = await _unitOfWork.CarpoolBookings.HasCustomerAlreadyBookedAsync(request.RideOfferId, request.CustomerId);
        if (alreadyBooked)
            return ServiceResult<CarpoolBookingDto>.Failure("You have already booked a seat on this ride");

        // Check seat availability
        if (request.SeatsBooked < 1)
            return ServiceResult<CarpoolBookingDto>.Failure("Must book at least 1 seat");
        if (request.SeatsBooked > offer.AvailableSeats)
            return ServiceResult<CarpoolBookingDto>.Failure($"Only {offer.AvailableSeats} seat(s) available on this ride");

        decimal totalPrice = request.SeatsBooked * offer.PricePerSeat;

        // Create payment record (Pending — to be completed via PaymentsController)
        var payment = new Payment
        {
            // BookingId is nullable; carpool payments are not linked to a classic Booking
            CustomerId = request.CustomerId,
            Amount = totalPrice,
            PaymentMethod = request.PaymentMethod,
            Status = PaymentStatus.Pending,
            CreatedAt = DateTime.UtcNow
        };

        // Determine initial booking status based on InstantBooking flag
        var bookingStatus = offer.InstantBooking
            ? CarpoolBookingStatus.Confirmed
            : CarpoolBookingStatus.Pending;

        var carpoolBooking = new CarpoolBooking
        {
            RideOfferId = request.RideOfferId,
            CustomerId = request.CustomerId,
            SeatsBooked = request.SeatsBooked,
            TotalPrice = totalPrice,
            Status = bookingStatus,
            Payment = payment,
            CreatedAt = DateTime.UtcNow
        };

        // Decrement available seats
        offer.AvailableSeats -= request.SeatsBooked;
        if (offer.AvailableSeats == 0)
            offer.Status = RideOfferStatus.Full;
        offer.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.CarpoolBookings.AddAsync(carpoolBooking);
        _unitOfWork.RideOffers.Update(offer);
        await _unitOfWork.SaveChangesAsync();

        // Notify customer
        await _notificationService.CreateNotificationAsync(new CreateNotificationRequest
        {
            CustomerId = request.CustomerId,
            Type = NotificationType.BookingConfirmed,
            Title = offer.InstantBooking ? "Seat Booked!" : "Booking Requested",
            Message = offer.InstantBooking
                ? $"Your seat from {offer.OriginCity} to {offer.DestinationCity} on {offer.DepartureTime:d MMM yyyy HH:mm} is confirmed."
                : $"Your seat request from {offer.OriginCity} to {offer.DestinationCity} on {offer.DepartureTime:d MMM yyyy HH:mm} is pending driver approval."
        });

        var created = await _unitOfWork.CarpoolBookings.GetByIdWithDetailsAsync(carpoolBooking.Id);
        return ServiceResult<CarpoolBookingDto>.Success(created!.ToDto(), "Seat booked successfully");
    }

    public async Task<ServiceResult<CarpoolBookingDto>> ConfirmBookingAsync(int carpoolBookingId)
    {
        var cb = await _unitOfWork.CarpoolBookings.GetByIdWithDetailsAsync(carpoolBookingId);
        if (cb == null)
            return ServiceResult<CarpoolBookingDto>.Failure("Carpool booking not found");

        if (cb.Status != CarpoolBookingStatus.Pending)
            return ServiceResult<CarpoolBookingDto>.Failure("Booking is not in a pending state");

        cb.Status = CarpoolBookingStatus.Confirmed;
        cb.UpdatedAt = DateTime.UtcNow;

        _unitOfWork.CarpoolBookings.Update(cb);
        await _unitOfWork.SaveChangesAsync();

        await _notificationService.CreateNotificationAsync(new CreateNotificationRequest
        {
            CustomerId = cb.CustomerId,
            Type = NotificationType.BookingConfirmed,
            Title = "Booking Confirmed",
            Message = $"Your carpool seat from {cb.RideOffer.OriginCity} to {cb.RideOffer.DestinationCity} on {cb.RideOffer.DepartureTime:d MMM yyyy HH:mm} has been confirmed."
        });

        var updated = await _unitOfWork.CarpoolBookings.GetByIdWithDetailsAsync(carpoolBookingId);
        return ServiceResult<CarpoolBookingDto>.Success(updated!.ToDto(), "Booking confirmed");
    }

    public async Task<ServiceResult> CancelBookingAsync(int carpoolBookingId, int requestingCustomerId, bool isAdmin = false)
    {
        var cb = await _unitOfWork.CarpoolBookings.GetByIdWithDetailsAsync(carpoolBookingId);
        if (cb == null)
            return ServiceResult.Failure("Carpool booking not found");

        if (!isAdmin && cb.CustomerId != requestingCustomerId)
            return ServiceResult.Failure("You are not authorised to cancel this booking");

        if (cb.Status == CarpoolBookingStatus.Cancelled)
            return ServiceResult.Failure("Booking is already cancelled");

        // Restore seats on the ride offer
        var offer = await _unitOfWork.RideOffers.GetByIdWithDetailsAsync(cb.RideOfferId);
        if (offer != null && offer.Status != RideOfferStatus.Cancelled && offer.Status != RideOfferStatus.Completed)
        {
            offer.AvailableSeats += cb.SeatsBooked;
            if (offer.Status == RideOfferStatus.Full)
                offer.Status = RideOfferStatus.Active;
            offer.UpdatedAt = DateTime.UtcNow;
            _unitOfWork.RideOffers.Update(offer);
        }

        cb.Status = CarpoolBookingStatus.Cancelled;
        cb.CancellationReason = isAdmin ? "Cancelled by admin" : "Cancelled by passenger";
        cb.CancelledAt = DateTime.UtcNow;
        cb.UpdatedAt = DateTime.UtcNow;

        _unitOfWork.CarpoolBookings.Update(cb);
        await _unitOfWork.SaveChangesAsync();

        await _notificationService.CreateNotificationAsync(new CreateNotificationRequest
        {
            CustomerId = cb.CustomerId,
            Type = NotificationType.BookingCancelled,
            Title = "Booking Cancelled",
            Message = $"Your carpool booking from {cb.RideOffer?.OriginCity} to {cb.RideOffer?.DestinationCity} has been cancelled."
        });

        return ServiceResult.Success("Carpool booking cancelled successfully");
    }

    public async Task<ServiceResult<IEnumerable<CarpoolBookingDto>>> GetPassengerBookingsAsync(int customerId)
    {
        var customer = await _unitOfWork.Customers.GetByIdAsync(customerId);
        if (customer == null)
            return ServiceResult<IEnumerable<CarpoolBookingDto>>.Failure("Customer not found");

        var bookings = await _unitOfWork.CarpoolBookings.GetByCustomerIdAsync(customerId);
        var dtos = bookings.Select(cb => cb.ToDto());
        return ServiceResult<IEnumerable<CarpoolBookingDto>>.Success(dtos);
    }

    public async Task<ServiceResult<CarpoolBookingDto>> GetByIdAsync(int carpoolBookingId, int requestingCustomerId, bool isAdmin = false)
    {
        var cb = await _unitOfWork.CarpoolBookings.GetByIdWithDetailsAsync(carpoolBookingId);
        if (cb == null)
            return ServiceResult<CarpoolBookingDto>.Failure("Carpool booking not found");

        if (!isAdmin && cb.CustomerId != requestingCustomerId)
            return ServiceResult<CarpoolBookingDto>.Failure("You are not authorised to view this booking");

        return ServiceResult<CarpoolBookingDto>.Success(cb.ToDto());
    }
}
