using backend.Enums;

namespace backend.Models;

public class RideOffer
{
    public int Id { get; set; }

    public int DriverId { get; set; }
    public Driver Driver { get; set; } = null!;

    public int VehicleId { get; set; }
    public Vehicle Vehicle { get; set; } = null!;

    /// <summary>City / place name for the departure point (e.g. "Pune").</summary>
    public string OriginCity { get; set; } = string.Empty;

    /// <summary>City / place name for the arrival point (e.g. "Mumbai").</summary>
    public string DestinationCity { get; set; } = string.Empty;

    /// <summary>Optional detailed pickup address within the origin city.</summary>
    public string? OriginAddress { get; set; }

    /// <summary>Optional detailed drop-off address within the destination city.</summary>
    public string? DestinationAddress { get; set; }

    public decimal? OriginLat { get; set; }
    public decimal? OriginLng { get; set; }
    public decimal? DestinationLat { get; set; }
    public decimal? DestinationLng { get; set; }

    public DateTime DepartureTime { get; set; }

    /// <summary>Estimated trip duration in minutes.</summary>
    public int? EstimatedDurationMinutes { get; set; }

    /// <summary>Estimated distance in kilometres.</summary>
    public decimal? EstimatedDistanceKm { get; set; }

    /// <summary>Number of passenger seats offered by the driver.</summary>
    public int TotalSeats { get; set; }

    /// <summary>Remaining seats that can still be booked. Decremented on each confirmed CarpoolBooking.</summary>
    public int AvailableSeats { get; set; }

    /// <summary>Price charged per passenger seat.</summary>
    public decimal PricePerSeat { get; set; }

    public RideOfferStatus Status { get; set; } = RideOfferStatus.Active;

    /// <summary>Free-text notes from the driver (e.g. luggage rules, stops).</summary>
    public string? Description { get; set; }

    /// <summary>When true the seat is confirmed immediately; when false the driver must approve each request.</summary>
    public bool InstantBooking { get; set; } = true;

    /// <summary>Whether the driver allows smoking in the vehicle for this trip.</summary>
    public bool SmokingAllowed { get; set; } = false;

    /// <summary>Whether pets are allowed for this trip.</summary>
    public bool PetsAllowed { get; set; } = false;

    /// <summary>Max passengers allowed in the back row (null = no restriction).</summary>
    public int? MaxPassengersInBack { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // Navigation
    public ICollection<CarpoolBooking> CarpoolBookings { get; set; } = new List<CarpoolBooking>();
}
