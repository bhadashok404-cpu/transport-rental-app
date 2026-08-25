namespace backend.DTOs.RideOffer;

public class CreateRideOfferRequest
{
    /// <summary>Populated from JWT claim — do not send from client.</summary>
    public int DriverId { get; set; }

    public int VehicleId { get; set; }

    public string OriginCity { get; set; } = string.Empty;
    public string DestinationCity { get; set; } = string.Empty;

    public string? OriginAddress { get; set; }
    public string? DestinationAddress { get; set; }

    public decimal? OriginLat { get; set; }
    public decimal? OriginLng { get; set; }
    public decimal? DestinationLat { get; set; }
    public decimal? DestinationLng { get; set; }

    public DateTime DepartureTime { get; set; }

    public int? EstimatedDurationMinutes { get; set; }
    public decimal? EstimatedDistanceKm { get; set; }

    /// <summary>How many passenger seats are being offered (max = vehicle SeatingCapacity - 1).</summary>
    public int TotalSeats { get; set; }

    public decimal PricePerSeat { get; set; }

    public string? Description { get; set; }

    public bool InstantBooking { get; set; } = true;
    public bool SmokingAllowed { get; set; } = false;
    public bool PetsAllowed { get; set; } = false;
    public int? MaxPassengersInBack { get; set; }
}
