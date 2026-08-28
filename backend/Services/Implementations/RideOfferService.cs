using backend.Common;
using backend.DTOs.Notification;
using backend.DTOs.RideOffer;
using backend.Enums;
using backend.Models;
using backend.Repositories;
using backend.Services.Interfaces;
using backend.Services.Mappers;

namespace backend.Services.Implementations;

public class RideOfferService : IRideOfferService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly INotificationService _notificationService;

    public RideOfferService(IUnitOfWork unitOfWork, INotificationService notificationService)
    {
        _unitOfWork = unitOfWork;
        _notificationService = notificationService;
    }

    public async Task<ServiceResult<RideOfferDto>> CreateRideOfferAsync(CreateRideOfferRequest request)
    {
        // Validate driver
        var driver = await _unitOfWork.Drivers.GetByIdAsync(request.DriverId);
        if (driver == null)
            return ServiceResult<RideOfferDto>.Failure("Driver not found");
        if (!driver.IsActive)
            return ServiceResult<RideOfferDto>.Failure("Driver account is not active");

        // Validate vehicle
        var vehicle = await _unitOfWork.Vehicles.GetByIdWithDetailsAsync(request.VehicleId);
        if (vehicle == null)
            return ServiceResult<RideOfferDto>.Failure("Vehicle not found");
        if (!vehicle.IsActive)
            return ServiceResult<RideOfferDto>.Failure("Vehicle is not active");

        // Seats sanity check — leave at least 1 seat for the driver
        int maxSeats = vehicle.SeatingCapacity - 1;
        if (request.TotalSeats < 1 || request.TotalSeats > maxSeats)
            return ServiceResult<RideOfferDto>.Failure($"TotalSeats must be between 1 and {maxSeats} for this vehicle");

        if (request.PricePerSeat <= 0)
            return ServiceResult<RideOfferDto>.Failure("Price per seat must be greater than zero");

        if (request.DepartureTime <= DateTime.UtcNow)
            return ServiceResult<RideOfferDto>.Failure("Departure time must be in the future");

        // Check driver does not already have an active offer on the same route/time
        var existingOffers = await _unitOfWork.RideOffers.GetByDriverIdAsync(request.DriverId);
        bool duplicate = existingOffers.Any(o =>
            o.Status == RideOfferStatus.Active &&
            o.DepartureTime.Date == request.DepartureTime.Date &&
            string.Equals(o.OriginCity, request.OriginCity, StringComparison.OrdinalIgnoreCase) &&
            string.Equals(o.DestinationCity, request.DestinationCity, StringComparison.OrdinalIgnoreCase));

        if (duplicate)
            return ServiceResult<RideOfferDto>.Failure("You already have an active offer for this route on that date");

        var offer = new RideOffer
        {
            DriverId = request.DriverId,
            VehicleId = request.VehicleId,
            OriginCity = request.OriginCity.Trim(),
            DestinationCity = request.DestinationCity.Trim(),
            OriginAddress = request.OriginAddress?.Trim(),
            DestinationAddress = request.DestinationAddress?.Trim(),
            OriginLat = request.OriginLat,
            OriginLng = request.OriginLng,
            DestinationLat = request.DestinationLat,
            DestinationLng = request.DestinationLng,
            DepartureTime = request.DepartureTime,
            EstimatedDurationMinutes = request.EstimatedDurationMinutes,
            EstimatedDistanceKm = request.EstimatedDistanceKm,
            TotalSeats = request.TotalSeats,
            AvailableSeats = request.TotalSeats,
            PricePerSeat = request.PricePerSeat,
            Description = request.Description?.Trim(),
            InstantBooking = request.InstantBooking,
            SmokingAllowed = request.SmokingAllowed,
            PetsAllowed = request.PetsAllowed,
            MaxPassengersInBack = request.MaxPassengersInBack,
            Status = RideOfferStatus.Active,
            CreatedAt = DateTime.UtcNow
        };

        await _unitOfWork.RideOffers.AddAsync(offer);
        await _unitOfWork.SaveChangesAsync();

        var created = await _unitOfWork.RideOffers.GetByIdWithDetailsAsync(offer.Id);
        return ServiceResult<RideOfferDto>.Success(created!.ToDto(), "Ride offer created successfully");
    }

    public async Task<ServiceResult<IEnumerable<RideOfferDto>>> SearchRideOffersAsync(SearchRideOffersRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.OriginCity) || string.IsNullOrWhiteSpace(request.DestinationCity))
            return ServiceResult<IEnumerable<RideOfferDto>>.Failure("Origin and destination are required");

        if (request.Passengers < 1)
            return ServiceResult<IEnumerable<RideOfferDto>>.Failure("Passengers must be at least 1");

        var offers = await _unitOfWork.RideOffers.SearchAsync(request);
        var dtos = offers.Select(o => o.ToDto());
        return ServiceResult<IEnumerable<RideOfferDto>>.Success(dtos);
    }

    public async Task<ServiceResult<RideOfferDto>> GetRideOfferByIdAsync(int id)
    {
        var offer = await _unitOfWork.RideOffers.GetByIdWithDetailsAsync(id);
        if (offer == null)
            return ServiceResult<RideOfferDto>.Failure("Ride offer not found");

        return ServiceResult<RideOfferDto>.Success(offer.ToDtoWithPassengers());
    }

    public async Task<ServiceResult<IEnumerable<RideOfferDto>>> GetDriverRideOffersAsync(int driverId)
    {
        var driver = await _unitOfWork.Drivers.GetByIdAsync(driverId);
        if (driver == null)
            return ServiceResult<IEnumerable<RideOfferDto>>.Failure("Driver not found");

        var offers = await _unitOfWork.RideOffers.GetByDriverIdAsync(driverId);
        var dtos = offers.Select(o => o.ToDtoWithPassengers());
        return ServiceResult<IEnumerable<RideOfferDto>>.Success(dtos);
    }

    public async Task<ServiceResult> CancelRideOfferAsync(int offerId, int requestingDriverId, bool isAdmin = false)
    {
        var offer = await _unitOfWork.RideOffers.GetByIdWithDetailsAsync(offerId);
        if (offer == null)
            return ServiceResult.Failure("Ride offer not found");

        if (!isAdmin && offer.DriverId != requestingDriverId)
            return ServiceResult.Failure("You are not authorised to cancel this ride offer");

        if (offer.Status == RideOfferStatus.Cancelled)
            return ServiceResult.Failure("Ride offer is already cancelled");

        if (offer.Status == RideOfferStatus.Completed)
            return ServiceResult.Failure("Cannot cancel a completed ride offer");

        offer.Status = RideOfferStatus.Cancelled;
        offer.UpdatedAt = DateTime.UtcNow;

        // Cancel all non-cancelled carpool bookings on this offer
        foreach (var cb in offer.CarpoolBookings.Where(cb => cb.Status != CarpoolBookingStatus.Cancelled))
        {
            cb.Status = CarpoolBookingStatus.Cancelled;
            cb.CancellationReason = "Driver cancelled the ride";
            cb.CancelledAt = DateTime.UtcNow;
            cb.UpdatedAt = DateTime.UtcNow;
            _unitOfWork.CarpoolBookings.Update(cb);

            // Notify each passenger
            await _notificationService.CreateNotificationAsync(new CreateNotificationRequest
            {
                CustomerId = cb.CustomerId,
                Type = NotificationType.BookingCancelled,
                Title = "Ride Cancelled",
                Message = $"Your carpool booking from {offer.OriginCity} to {offer.DestinationCity} on {offer.DepartureTime:d MMM yyyy} has been cancelled by the driver."
            });
        }

        _unitOfWork.RideOffers.Update(offer);
        await _unitOfWork.SaveChangesAsync();

        return ServiceResult.Success("Ride offer cancelled successfully");
    }

    public async Task<ServiceResult> CompleteRideOfferAsync(int offerId, int requestingDriverId, bool isAdmin = false)
    {
        var offer = await _unitOfWork.RideOffers.GetByIdWithDetailsAsync(offerId);
        if (offer == null)
            return ServiceResult.Failure("Ride offer not found");

        if (!isAdmin && offer.DriverId != requestingDriverId)
            return ServiceResult.Failure("You are not authorised to complete this ride offer");

        if (offer.Status != RideOfferStatus.Active && offer.Status != RideOfferStatus.Full)
            return ServiceResult.Failure("Only active or full offers can be marked as completed");

        offer.Status = RideOfferStatus.Completed;
        offer.UpdatedAt = DateTime.UtcNow;

        _unitOfWork.RideOffers.Update(offer);
        await _unitOfWork.SaveChangesAsync();

        return ServiceResult.Success("Ride offer marked as completed");
    }

    public async Task<ServiceResult<IEnumerable<RideOfferDto>>> GetAllRideOffersAsync()
    {
        var offers = await _unitOfWork.RideOffers.GetAllAsync();
        var detailedOffers = new List<RideOfferDto>();
        foreach (var o in offers.OrderByDescending(x => x.CreatedAt))
        {
            var detailed = await _unitOfWork.RideOffers.GetByIdWithDetailsAsync(o.Id);
            if (detailed != null)
                detailedOffers.Add(detailed.ToDtoWithPassengers());
        }
        return ServiceResult<IEnumerable<RideOfferDto>>.Success(detailedOffers, "Ride offers retrieved");
    }
}
