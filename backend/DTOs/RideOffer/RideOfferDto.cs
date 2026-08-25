using backend.Enums;

namespace backend.DTOs.RideOffer;

public class RideOfferDto
{
    public int Id { get; set; }

    // Driver info
    public int DriverId { get; set; }
    public string DriverName { get; set; } = string.Empty;
    public string? DriverProfileImageUrl { get; set; }
    public decimal DriverRating { get; set; }
    public int DriverTotalTrips { get; set; }
    public bool DriverIsVerified { get; set; }

    // Vehicle info
    public int VehicleId { get; set; }
    public string VehicleInfo { get; set; } = string.Empty;   // "Toyota Innova"
    public VehicleType VehicleType { get; set; }
    public string? VehicleImageUrl { get; set; }

    // Route
    public string OriginCity { get; set; } = string.Empty;
    public string DestinationCity { get; set; } = string.Empty;
    public string? OriginAddress { get; set; }
    public string? DestinationAddress { get; set; }
    public decimal? OriginLat { get; set; }
    public decimal? OriginLng { get; set; }
    public decimal? DestinationLat { get; set; }
    public decimal? DestinationLng { get; set; }

    // Timing
    public DateTime DepartureTime { get; set; }
    public int? EstimatedDurationMinutes { get; set; }
    public decimal? EstimatedDistanceKm { get; set; }

    // Seats & pricing
    public int TotalSeats { get; set; }
    public int AvailableSeats { get; set; }
    public decimal PricePerSeat { get; set; }

    // Status & preferences
    public RideOfferStatus Status { get; set; }
    public string? Description { get; set; }
    public bool InstantBooking { get; set; }
    public bool SmokingAllowed { get; set; }
    public bool PetsAllowed { get; set; }
    public int? MaxPassengersInBack { get; set; }

    // Passenger list (only included in detail view)
    public IEnumerable<CarpoolPassengerSummaryDto> Passengers { get; set; } = Enumerable.Empty<CarpoolPassengerSummaryDto>();

    public DateTime CreatedAt { get; set; }
}

/// <summary>Compact passenger info shown on a ride's detail page.</summary>
public class CarpoolPassengerSummaryDto
{
    public int CarpoolBookingId { get; set; }
    public int CustomerId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string? CustomerProfileImageUrl { get; set; }
    public int SeatsBooked { get; set; }
    public string PickupNote { get; set; } = string.Empty;   // OriginCity → DestinationCity summary
    public CarpoolBookingStatus Status { get; set; }
}
